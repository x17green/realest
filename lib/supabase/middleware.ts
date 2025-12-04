import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { getAppMode, isRouteAccessible, shouldEnableAuthentication } from "@/lib/app-mode"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const pathname = request.nextUrl.pathname
  const appMode = getAppMode()

  // Check if route is accessible in current app mode
  if (!isRouteAccessible(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // Skip authentication for coming-soon mode unless explicitly enabled
  if (!shouldEnableAuthentication() && appMode === 'coming-soon') {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes that require authentication
  const protectedRoutes = ['/admin', '/buyer', '/owner', '/profile-setup']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Redirect to login if accessing protected routes without auth
  if (
    !user &&
    isProtectedRoute &&
    !pathname.startsWith("/auth") &&
    shouldEnableAuthentication()
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
