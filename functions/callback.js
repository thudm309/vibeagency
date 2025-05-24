// Cloudflare Pages Function for Decap CMS GitHub OAuth callback
// Source: https://github.com/abhishektiwari-dev/decap-cms-cloudflare-pages-functions/blob/main/functions/callback.js

export async function onRequest(context) {
  // This function just redirects back to the admin UI with the access_token in the hash
  const url = new URL(context.request.url);
  const params = url.search;
  return Response.redirect(`/admin/#${params.substring(1)}`, 302);
}
