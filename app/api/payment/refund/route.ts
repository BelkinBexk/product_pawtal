import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// POST /api/payment/refund
// Body: { bookingReference, amount }
//
// PromptPay does not support automated refunds via Omise.
// This route flags the booking as "refund_requested" in Supabase so the
// Pawtal ops team can process the bank transfer manually.

function getSupabase() {
  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, service ?? anon);
}

export async function POST(req: NextRequest) {
  const { bookingReference, amount } = await req.json();

  if (!bookingReference) {
    return NextResponse.json({ error: "Missing bookingReference" }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("bookings")
      .update({
        status:         "cancelled",
        payment_status: "refund_requested",
      })
      .eq("booking_reference", bookingReference);

    if (error) {
      console.error("[refund] DB error:", error.message);
      return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
    }

    console.log(`[refund] Refund requested for booking ${bookingReference} — amount ฿${amount}`);

    return NextResponse.json({ ok: true, status: "refund_requested" });

  } catch (err) {
    console.error("[refund] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
