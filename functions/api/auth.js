// /functions/api/auth.js
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const client_id = env.GITHUB_CLIENT_ID;
  const client_secret = env.GITHUB_CLIENT_SECRET;
  const redirect_uri = `${url.origin}/api/auth`;   // GitHub sẽ gọi lại chính endpoint này

  /* ① Người dùng click Login → chỉ có provider=github */
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

  /* ② GitHub redirect về /api/auth?code=... */
  if (url.searchParams.has("code")) {
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state") || "";

    try {
      // Đổi code ↔ access_token
      const tokenRes = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
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
        const errorText = await tokenRes.text();
        console.error("Token exchange failed:", errorText);
        return new Response(`OAuth error: ${errorText}`, { status: 500 });
      }

      const tokenData = await tokenRes.json();

      // Kiểm tra lỗi từ GitHub
      if (tokenData.error) {
        console.error("GitHub OAuth error:", tokenData);
        return new Response(`GitHub error: ${tokenData.error_description || tokenData.error}`, { status: 400 });
      }

      const { access_token, token_type, scope } = tokenData;

      if (!access_token) {
        console.error("No access token received:", tokenData);
        return new Response("No access token received", { status: 500 });
      }

      // Redirect với hash format mà Decap CMS mong đợi
      const hashParams = `access_token=${access_token}&token_type=${token_type || 'bearer'}&scope=${scope || ''}&state=${state}`;
      
      return Response.redirect(
        `${url.origin}/admin/#${hashParams}`,
        302,
      );

    } catch (error) {
      console.error("OAuth handler error:", error);
      return new Response(`Server error: ${error.message}`, { status: 500 });
    }
  }

  return new Response("Bad request - missing provider or code parameter", { status: 400 });
}