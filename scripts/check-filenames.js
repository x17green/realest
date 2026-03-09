const fs = require("fs");
const path = require("path");

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (e.name === "node_modules" || e.name === ".git" || e.name === ".next")
      continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

function isTsFile(file) {
  return /\.(ts|tsx)$/.test(file);
}

function base(file) {
  return path.basename(file);
}

function check() {
  const root = process.cwd();
  const all = walk(root).filter(isTsFile);
  const violations = [];

  const legacyAllowlist = new Set([
    // Legacy base modules (kept to avoid breaking imports during migration)
    "components/heroui/realest-button.tsx",
    "components/heroui/realest-card.tsx",
    "components/heroui/realest-dialog.tsx",
    "components/heroui/realest-input.tsx",
    "components/heroui/realest-select.tsx",
    "components/heroui/realest-table.tsx",
    "components/providers/realest-theme-provider.tsx",

    // Legacy hooks kept temporarily
    "lib/hooks/use-email-validation.ts",
    "lib/hooks/use-location-search.ts",
    "lib/hooks/use-mobile.ts",
    "lib/hooks/use-toast.ts",
  ]);

  const pascalCaseRe = /^[A-Z][A-Za-z0-9]*\.(ts|tsx)$/;
  const hookCamelRe = /^use[A-Z][A-Za-z0-9]*\.ts$/;

  for (const file of all) {
    const rel = path.relative(root, file).replace(/\\/g, "/");
    const filename = base(file);

    // Disallow hooks under components/*
    if (
      rel.startsWith("components/") &&
      /^use[A-Za-z0-9-]+\.(ts|tsx)$/.test(filename)
    ) {
      violations.push({
        rel,
        reason: "Hook files are not allowed under components/*",
      });
      continue;
    }

    // Enforce PascalCase only in components/heroui and components/providers
    if (
      rel.startsWith("components/heroui/") ||
      rel.startsWith("components/providers/")
    ) {
      if (legacyAllowlist.has(rel)) {
        // Skip legacy base modules
      } else if (
        !["index.ts", "index.tsx"].includes(filename) &&
        !pascalCaseRe.test(filename)
      ) {
        violations.push({
          rel,
          reason:
            "Components must use PascalCase file names in heroui/providers",
        });
      }
    }

    // Enforce hooks naming in lib/hooks
    if (rel.startsWith("lib/hooks/")) {
      if (legacyAllowlist.has(rel) || filename === "index.ts") {
        // Skip legacy hooks and index file
      } else if (!hookCamelRe.test(filename)) {
        violations.push({
          rel,
          reason:
            "Hooks in lib/hooks must be camelCase and start with 'use' (useX.ts)",
        });
      }
    }
  }

  if (violations.length) {
    console.error("\nFilename convention violations:");
    for (const v of violations) {
      console.error(` - ${v.rel}: ${v.reason}`);
    }
    process.exit(1);
  } else {
    console.log("Filename conventions OK.");
  }
}

check();
