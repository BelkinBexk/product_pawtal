import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ── Omise Webhook Handler ─────────────────────────────────────────────────────
// Omise fires this when a charge status changes.
// Events we care about:
//   charge.complete  → payment successful  → confirm booking
//   charge.failed    → payment failed      → mark booking as failed / notify user
//   charge.pending   → still waiting       → no action needed
//
// Setup in Omise Dashboard → Webhooks → Add endpoint:
//   URL: https://yourdomain.com/api/webhooks/omise
//   Events: charge.complete, charge.failed

// Supabase service-role client (bypasses RLS — server only)
function getSupabase() {
  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;   // add to .env.local
  const anon    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, service ?? anon);
}

export async function POST(req: NextRequest) {
  let event: Record<string, unknown>;

  try {
    event = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Basic structure check
  if (!event.key || !event.object) {
    return NextResponse.json({ error: "Unrecognised payload" }, { status: 400 });
  }

  const eventKey = event.key as string;         // e.g. "charge.complete"
  const data     = event.data as Record<string, unknown>;
  const chargeId = data?.id as string | undefined;

  console.log(`[Omise webhook] ${eventKey} — charge ${chargeId}`);

  // ── charge.complete ───────────────────────────────────────────────────────
  if (eventKey === "charge.complete") {
    if (!chargeId) return NextResponse.json({ ok: true });

    const meta = (data.metadata as Record<string, string> | null) ?? {};
    const bookingRef = meta.booking_reference;

    const supabase = getSupabase();

    if (bookingRef) {
      // Update booking: confirmed + payment paid
      const { error } = await supabase
        .from("bookings")
        .update({
          status:         "confirmed",
          payment_status: "paid",
          payment_method: "thb_promptpay",
          paid_amount:    (data.amount as number) / 100,
        })
        .eq("booking_reference", bookingRef);

      if (error) {
        console.error("[Omise webhook] Failed to update booking:", error.message);
        return NextResponse.json({ error: "DB update failed" }, { status: 500 });
      }

      // TODO: send LINE/email confirmation to customer
      // TODO: send notification to provider (insert into notifications table)

      console.log(`[Omise webhook] Booking ${bookingRef} confirmed.`);
    }
  }

  // ── charge.failed ─────────────────────────────────────────────────────────
  if (eventKey === "charge.failed") {
    const meta = (data.metadata as Record<string, string> | null) ?? {};
    const bookingRef = meta.booking_reference;

    if (bookingRef) {
      const supabase = getSupabase();
      await supabase
        .from("bookings")
        .update({ payment_status: "unpaid", status: "pending" })
        .eq("booking_reference", bookingRef);

      console.log(`[Omise webhook] Charge failed for booking ${bookingRef}.`);
    }
  }

  return NextResponse.json({ received: true });
}
