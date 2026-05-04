const PAYPAL_BASE = 'https://api-m.paypal.com';

export async function getPaypalAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal token request failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  return data.access_token as string;
}

export async function createPaypalOrder(
  accessToken: string,
  amount: number,
  currency: string,
  returnUrl: string,
  cancelUrl: string,
  description: string,
): Promise<{ orderId: string; approvalUrl: string }> {
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          description,
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
            return_url: returnUrl,
            cancel_url: cancelUrl,
          },
        },
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal create order failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  const orderId: string = data.id;
  const approvalLink = (data.links as { rel: string; href: string }[]).find(
    (l) => l.rel === 'payer-action',
  );
  if (!approvalLink) {
    throw new Error('PayPal: no payer-action link in response');
  }
  return { orderId, approvalUrl: approvalLink.href };
}

export async function capturePaypalOrder(
  accessToken: string,
  orderId: string,
): Promise<{ status: string; captureId: string }> {
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal capture failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  const status: string = data.status;
  // Extract capture ID from purchase_units[0].payments.captures[0].id
  const captureId: string =
    data.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? '';
  return { status, captureId };
}
