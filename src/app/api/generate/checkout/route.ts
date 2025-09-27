import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const { email,userId, planType } = body;

    // Map planType → variantId
  const variantMap: Record<string, string> = {
    weekly: process.env.NEXT_PUBLIC_LS_VARIANT_WEEKLY_ID!,
    monthly: process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID!,
  };

  const variantId = variantMap[planType];
 


  if (!variantId) {
    return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: email || undefined,
                custom: { user_id: userId } ,
            },
          },
          relationships: {
            store: {
              data: { type: "stores", id: process.env.LEMONSQUEEZY_STORE_ID },
            },
            variant: {
              data: {
                type: "variants",
                id: variantId,
              },
            },
          },
        },
      }),
    });

      if (!response.ok) {
      const errText = await response.text();
      console.error("LemonSqueezy API error:", errText);
      return NextResponse.json({ error: errText }, { status: 500 });
    }

    const data = await response.json();
    const checkoutUrl = data?.data?.attributes?.url;
    

return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error("Checkout route crashed:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
