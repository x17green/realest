import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { templateRegistry } from "@/emails/preview-registry";
import { renderEmail } from "@/emails/utils/renderEmail";

export async function GET(request: NextRequest) {
  // ── Auth guard ─────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userRow?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ── Template lookup ────────────────────────────────────────────────────────
  const templateName = request.nextUrl.searchParams.get("template");

  if (!templateName) {
    return NextResponse.json(
      { error: "Missing 'template' query parameter" },
      { status: 400 }
    );
  }

  const entry = templateRegistry.find((t) => t.name === templateName);

  if (!entry) {
    return NextResponse.json(
      { error: `Template '${templateName}' not found` },
      { status: 404 }
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const theme = request.nextUrl.searchParams.get("theme") === "dark" ? "dark" : "light";
  const rawHtml = await renderEmail(entry.element);

  // Inject a canvas background style to simulate light/dark inbox environment.
  // Email inline styles are preserved — only the outer page background changes.
  const canvasStyle =
    theme === "dark"
      ? `<style>html,body{background-color:#1c1c1c!important;padding:16px!important}</style>`
      : `<style>html,body{background-color:#f4f4f4!important}</style>`;
  const html = rawHtml.includes("</head>")
    ? rawHtml.replace("</head>", `${canvasStyle}</head>`)
    : rawHtml;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Prevent the iframe from making network requests or running scripts
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
