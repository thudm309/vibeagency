// /functions/api/auth.js
export async function onRequest({ request, env }) {
  const url          = new URL(request.url);
  const client_id    = env.GITHUB_CLIENT_ID;
  const client_secret= env.GITHUB_CLIENT_SECRET;
  const redirect_uri = `${url.origin}/api/callback`;   // GitHub sẽ gọi lại đây

  /* ① Người dùng click Login  →  chỉ có provider=github  */
  if (url.searchParams.get("provider") === "github" && !url.searchParams.has("code")) {
    const state = crypto.randomUUID().slice(0, 16);
    return Response.redirect(
      `https://github.com/login/oauth/authorize` +
      `?client_id=${client_id}` +
      `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
      `&scope=repo` +
      `&state=${state}`,
      302,
    );
  }

  /* ② GitHub redirect về /api/auth?code=...     (khi /api/callback chuyển tiếp) */
  if (url.searchParams.has("code")) {
    const code  = url.searchParams.get("code");
    const state = url.searchParams.get("state") || "";

    // Đổi code ↔ access_token
    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",                    // QUAN TRỌNG
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id,
          client_secret,
          code,
          redirect_uri,
        }),
      },
    );

    if (!tokenRes.ok) {
      console.error("Token exchange failed", await tokenRes.text());
      return new Response("OAuth error", { status: 500 });
    }

    const { access_token, token_type, scope } = await tokenRes.json();

    // Redirect tuyệt đối kèm access_token trong hash – Decap sẽ nhận
    return Response.redirect(
      `${url.origin}/admin/#access_token=${access_token}` +
      `&token_type=${token_type}&scope=${scope}&state=${state}`,
      302,
    );
  }

  return new Response("Bad request", { status: 400 });
}
