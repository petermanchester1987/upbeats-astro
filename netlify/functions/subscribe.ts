// Server-side only — this is what keeps the Brevo API key off the client.
// A key with account-wide send/contact permissions must never reach the
// browser bundle; Netlify Functions run in Node on Netlify's servers, so
// process.env here is never shipped to visitors the way a PUBLIC_-prefixed
// Astro env var would be.
//
// Requires BREVO_API_KEY and BREVO_LIST_ID set as Netlify environment
// variables (Site settings → Environment variables) — see README →
// "Newsletter signup". Deliberately does nothing useful if they're unset,
// same pattern as Analytics.astro's PUBLIC_GA_ID gate.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async (request: Request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;

  if (!apiKey || !listId) {
    console.error('Newsletter signup: BREVO_API_KEY / BREVO_LIST_ID not set.');
    return new Response(JSON.stringify({ error: 'Newsletter signup is not set up yet — try again later.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let email: string | undefined;
  try {
    const body = await request.json();
    email = typeof body?.email === 'string' ? body.email.trim() : undefined;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!email || !EMAIL_RE.test(email)) {
    return new Response(JSON.stringify({ error: 'Enter a valid email address.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    // updateEnabled means re-subscribing (or a contact that already exists
    // from elsewhere) succeeds instead of erroring on a duplicate — Brevo
    // returns 204 for that case and 201 for a genuinely new contact.
    body: JSON.stringify({ email, listIds: [Number(listId)], updateEnabled: true }),
  });

  if (brevoRes.ok || brevoRes.status === 204) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const detail = await brevoRes.text();
  console.error('Brevo subscribe failed:', brevoRes.status, detail);
  return new Response(JSON.stringify({ error: 'Something went wrong — please try again.' }), {
    status: 502,
    headers: { 'Content-Type': 'application/json' },
  });
};
