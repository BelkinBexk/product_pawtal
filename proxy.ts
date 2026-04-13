import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// ── Protected customer routes ──────────────────────────────────────────────────
// Any path starting with these requires an authenticated Supabase session.
const CUSTOMER_PROTECTED = ["/deals", "/book", "/payment", "/bookings", "/explore"];

// ── Vendor protected routes ────────────────────────────────────────────────────
// Vendor dashboard routes (not auth pages) require a provider session.
const VENDOR_PROTECTED = ["/vendor/dashboard", "/vendor/bookings", "/vendor/profile", "/vendor/transactions", "/vendor/reviews"];

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // Build a Supabase client that reads/writes cookies in the request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // ── Customer route guard ───────────────────────────────────────────────────
  const isCustomerProtected = CUSTOMER_PROTECTED.some(p => pathname.startsWith(p));
  if (isCustomerProtected && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // ── Vendor route guard ─────────────────────────────────────────────────────
  const isVendorProtected = VENDOR_PROTECTED.some(p => pathname.startsWith(p));
  if (isVendorProtected && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/vendor/login";
    return NextResponse.redirect(url);
  }

  // ── Redirect logged-in users away from login/signup ───────────────────────
  if (session && (pathname === "/login" || pathname === "/signup")) {
    const role = session.user.user_metadata?.role;
    const url = req.nextUrl.clone();
    url.pathname = role === "provider" ? "/vendor/dashboard" : "/deals";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    // Run on all routes except static files, images, and API routes
    "/((?!_next/static|_next/image|favicon.ico|icon.png|api/).*)",
  ],
};
