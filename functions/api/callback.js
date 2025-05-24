// /functions/api/callback.js
export async function onRequest({ request }) {
  const url   = new URL(request.url);
  const code  = url.searchParams.get("code");
  const state = url.searchParams.get("state") || "";

  if (!code) return new Response("Missing code", { status: 400 });

  // chuyển tiếp tuyệt đối để auth.js xử lý
  return Response.redirect(
    `${url.origin}/api/auth?code=${code}&state=${state}`,
    302,
  );
}
