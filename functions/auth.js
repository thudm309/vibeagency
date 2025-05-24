// Cloudflare Pages Function for Decap CMS GitHub OAuth
// Source: https://github.com/abhishektiwari-dev/decap-cms-cloudflare-pages-functions/blob/main/functions/auth.js

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const client_id = context.env.GITHUB_CLIENT_ID;
  const client_secret = context.env.GITHUB_CLIENT_SECRET;
  const redirect_uri = `${url.origin}/api/callback`;

  if (url.searchParams.has('code')) {
    // Exchange code for access token
    const code = url.searchParams.get('code');
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new URLSearchParams({
        client_id,
        client_secret,
        code,
        redirect_uri,
      }),
    });
    const tokenData = await tokenRes.json();
    return new Response(JSON.stringify(tokenData), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    // Redirect to GitHub OAuth
    const state = Math.random().toString(36).substring(2);
    const githubAuth = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=repo&state=${state}`;
    return Response.redirect(githubAuth, 302);
  }
}
