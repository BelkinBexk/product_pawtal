import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// GET /api/payment/check-status?chargeId=chrg_test_xxx&bookingId=uuid
export async function GET(req: NextRequest) {
  const secretKey = process.env.OMISE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Omise secret key not configured" }, { status: 500 });
  }

  const chargeId  = req.nextUrl.searchParams.get("chargeId");
  const bookingId = req.nextUrl.searchParams.get("bookingId");

  if (!chargeId) {
    return NextResponse.json({ error: "Missing chargeId" }, { status: 400 });
  }

  const authHeader = "Basic " + Buffer.from(secretKey + ":").toString("base64");

  try {
    const res    = await fetch(`https://api.omise.co/charges/${chargeId}`, {
      headers: { "Authorization": authHeader },
    });
    const charge = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: charge.message ?? "Failed to fetch charge" }, { status: res.status });
    }

    // ── Confirm booking in Supabase when payment succeeds ────────────────────
    if (charge.status === "successful" && bookingId) {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
      );
      await supabase
        .from("bookings")
        .update({
          status:         "confirmed",
          payment_status: "paid",
          paid_amount:    charge.amount / 100,
        })
        .eq("id", bookingId);
    }

    return NextResponse.json({ status: charge.status });
  } catch (err) {
    console.error("[check-status] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
