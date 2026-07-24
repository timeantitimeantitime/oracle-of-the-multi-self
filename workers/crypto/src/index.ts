interface Env {
  COINPAY_API_KEY: string;
  COINPAY_WEBHOOK_SECRET: string;
  COINPAY_API_URL: string;
}

interface PaymentRequest {
  amount: number;
  coin: string;
  chain: string;
  description: string;
  redirect_url: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-CoinPay-Signature',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create crypto payment
    if (url.pathname === '/api/crypto/create' && request.method === 'POST') {
      try {
        const body: PaymentRequest = await request.json();

        const response = await fetch(`${env.COINPAY_API_URL}/api/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.COINPAY_API_KEY}`,
          },
          body: JSON.stringify({
            amount: body.amount,
            coin: body.coin,
            chain: body.chain,
            description: body.description,
            redirect_url: body.redirect_url,
          }),
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to create payment', details: String(error) }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get payment status
    if (url.pathname.startsWith('/api/crypto/status/') && request.method === 'GET') {
      const paymentId = url.pathname.split('/').pop();

      try {
        const response = await fetch(`${env.COINPAY_API_URL}/api/payments/${paymentId}`, {
          headers: {
            Authorization: `Bearer ${env.COINPAY_API_KEY}`,
          },
        });

        const data = await response.json();

        return new Response(JSON.stringify({ status: data.status, ...data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to get status', details: String(error) }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Webhook handler
    if (url.pathname === '/api/crypto/webhook' && request.method === 'POST') {
      try {
        const signature = request.headers.get('X-CoinPay-Signature');
        const body = await request.text();

        // Verify HMAC-SHA256 signature
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          'raw',
          encoder.encode(env.COINPAY_WEBHOOK_SECRET),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );

        const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
        const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

        if (signature !== expectedSignature) {
          return new Response('Invalid signature', { status: 401 });
        }

        const event = JSON.parse(body);

        switch (event.event) {
          case 'payment.confirmed':
            console.log(`Payment confirmed: ${event.data.id}`);
            break;
          case 'payment.forwarded':
            console.log(`Payment forwarded: ${event.data.id}`);
            break;
          case 'payment.expired':
            console.log(`Payment expired: ${event.data.id}`);
            break;
        }

        return new Response('OK', { headers: corsHeaders });
      } catch (error) {
        return new Response('Webhook error', { status: 500 });
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};
