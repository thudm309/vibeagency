// /functions/api/callback.js
export async function onRequest({ request }) {
  const url     = new URL(request.url);          // URL tuyệt đối – OK
  const params  = url.search.substring(1);       // "code=...&state=..."

  /* 1️⃣  Redirect tuyệt đối về /admin/#...  */
  return Response.redirect(`${url.origin}/admin/#${params}`, 302);
}
