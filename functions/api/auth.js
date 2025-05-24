// /functions/api/auth.js
export async function onRequest(context) {
  const url          = new URL(context.request.url);
  const client_id    = context.env.GITHUB_CLIENT_ID;
  const client_secret= context.env.GITHUB_CLIENT_SECRET;
  const redirect_uri = `${url.origin}/api/callback`;

  // ❶ After GitHub redirects back with ?code=...
  if (url.searchParams.has('code')) {
    const code = url.searchParams.get('code');

    const tokenRes = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new URLSearchParams({
          client_id,
          client_secret,
          code,
          redirect_uri,
        }),
      },
    );

    const { access_token } = await tokenRes.json();
    return new Response(JSON.stringify({ token: access_token }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ❷ First hit – send the user to GitHub OAuth
  const state       = Math.random().toString(36).slice(2);
  const githubAuth  =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${client_id}` +
    `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
    `&scope=repo` +
    `&state=${state}`;

  return Response.redirect(githubAuth, 302);
}
