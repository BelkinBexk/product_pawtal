import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const secretKey = process.env.OMISE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Omise secret key not configured. Add OMISE_SECRET_KEY to .env.local" },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { amount, currency = "THB", description, slotId, scheduledAt, petName } = body;

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const amountSatang = Math.round(amount * 100);
  const authHeader   = "Basic " + Buffer.from(secretKey + ":").toString("base64");

  // ── Supabase server client (reads auth cookie) ───────────────────────────────
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  // Get the logged-in user's customer record
  const { data: { user } } = await supabase.auth.getUser();
  let customerId: string | null = null;
  if (user) {
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .single();
    customerId = customer?.id ?? null;
  }

  // Get provider info from the off-peak slot
  let providerId: string | null = null;
  if (slotId) {
    const { data: slot } = await supabase
      .from("off_peak_slots")
      .select("provider_id")
      .eq("id", slotId)
      .single();
    providerId = slot?.provider_id ?? null;
  }

  try {
    // ── Step 1: Create PromptPay source ──────────────────────────────────────
    const sourceRes = await fetch("https://api.omise.co/sources", {
      method: "POST",
      headers: { "Authorization": authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({ type: "promptpay", amount: amountSatang, currency: currency.toUpperCase() }),
    });
    const source = await sourceRes.json();
    if (!sourceRes.ok) {
      return NextResponse.json({ error: source.message ?? "Failed to create Omise source" }, { status: sourceRes.status });
    }

    // ── Generate booking reference: BK-YYYYMM-NNNN ───────────────────────────
    const now = new Date();
    const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const rand   = String(Math.floor(Math.random() * 9000) + 1000);
    const bookingReference = `BK-${yyyymm}-${rand}`;

    // ── Step 2: Create charge linked to source ────────────────────────────────
    const chargeRes = await fetch("https://api.omise.co/charges", {
      method: "POST",
      headers: { "Authorization": authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount:      amountSatang,
        currency:    currency.toUpperCase(),
        source:      source.id,
        description: description ?? `Pawtal booking ${bookingReference}`,
        metadata: { platform: "pawtal", booking_reference: bookingReference },
      }),
    });
    const charge = await chargeRes.json();
    if (!chargeRes.ok) {
      return NextResponse.json({ error: charge.message ?? "Failed to create Omise charge" }, { status: chargeRes.status });
    }

    // ── Step 3: Save booking to Supabase ──────────────────────────────────────
    let bookingId: string | null = null;
    if (customerId && providerId) {
      const commission       = Math.round(amount * 0.2 * 100) / 100;
      const providerPayout   = Math.round((amount - commission) * 100) / 100;

      const { data: booking } = await supabase
        .from("bookings")
        .insert({
          customer_id:           customerId,
          provider_id:           providerId,
          off_peak_slot_id:      slotId ?? null,
          status:                "pending",
          payment_status:        "unpaid",
          payment_method:        "thb_promptpay",
          scheduled_at:          scheduledAt ?? now.toISOString(),
          total_amount:          amount,
          paid_amount:           0,
          commission_amount:     commission,
          provider_payout_amount: providerPayout,
          booking_reference:     bookingReference,
          pet_name:              petName ?? null,
        })
        .select("id")
        .single();

      bookingId = booking?.id ?? null;
    }

    const qrImageUrl: string | null = charge.source?.scannable_code?.image?.download_uri ?? null;

    return NextResponse.json({
      chargeId:         charge.id,
      sourceId:         source.id,
      status:           charge.status,
      qrImageUrl,
      amount:           charge.amount / 100,
      currency:         charge.currency,
      expiresAt:        charge.expires_at,
      bookingId,
      bookingReference,
    });

  } catch (err) {
    console.error("[Omise] create-charge error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
