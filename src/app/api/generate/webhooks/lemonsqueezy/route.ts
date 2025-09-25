import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service key is required to update profiles
);

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature") || "";

    // Verify webhook signature
    const hmac = crypto.createHmac("sha256", process.env.LEMONSQUEEZY_WEBHOOK_SECRET!);
    hmac.update(rawBody, "utf8");
    const digest = hmac.digest("hex");

    if (digest !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.meta?.event_name || "unknown";

    // 1. Save event in webhook_events
    await supabase.from("webhook_events").insert([
      {
        event_type: eventType,
        payload: event,
      },
    ]);

  switch (event.type) {
  // 1. Handle subscription status updates
  case "subscription_created":
  case "subscription_updated": {
    const customerEmail = event.data?.attributes?.user_email;
    const subscriptionStatus = event.data?.attributes?.status;
    const variantId = event.data?.attributes?.variant_id;

    if (customerEmail && subscriptionStatus) {
      if (subscriptionStatus === "active" || subscriptionStatus === "on_trial") {
          let plan = "pro";
      let credits = 1000; // default for pro

      // 👇 adjust based on variant
      if (variantId === parseInt(process.env.LS_VARIANT_WEEKLY_ID!)) {
        plan = "weekly";
        credits = 250;
      } else if (variantId === parseInt(process.env.LEMONSQUEEZY_VARIANT_ID!)) {
        plan = "pro";
        credits = 1000;
      }

      await supabase
        .from("profiles")
        .update({
          plan,
          credits,
          last_credit_reset: new Date().toISOString(),
        })
        .eq("email", customerEmail);
    } else if (
      subscriptionStatus === "cancelled" ||
      subscriptionStatus === "expired" ||
      subscriptionStatus === "unpaid"
    ) {
      await supabase
        .from("profiles")
        .update({
         plan: "expired", // ⬅️ instead of "free"
          credits: 0,
          
        })
        .eq("email", customerEmail);
    }
  }
  break;
}

  // 2. Handle payment success → reset monthly credits
  case "subscription_payment_success": {
    const customerEmail = event.data?.attributes?.user_email;
    const variantId = event.data?.attributes?.variant_id;

     if (customerEmail) {
    let plan = "pro";
    let credits = 1000;

    if (variantId === parseInt(process.env.LS_VARIANT_WEEKLY_ID!)) {
      plan = "weekly";
      credits = 250;
    }

    await supabase
      .from("profiles")
      .update({
        plan,
        credits,
        last_credit_reset: new Date().toISOString(),
      })
      .eq("email", customerEmail);
  }
  break;
}
}




    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
