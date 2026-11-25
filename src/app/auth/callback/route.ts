import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError =
    searchParams.get("error_description") || searchParams.get("error");
  const next = searchParams.get("next") ?? "/dashboard";
  const safeNext = next.startsWith("/") ? next : "/dashboard";

  // 1. Si Supabase renvoie une erreur explicite dans l'URL (ex: provider non activé ou redirect_uri)
  if (oauthError) {
    return NextResponse.redirect(
      `${origin}/connexion?error=oauth_google_failed&reason=${encodeURIComponent(
        oauthError
      )}`
    );
  }

  // 2. Flux PKCE standard (?code=...)
  if (code) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${safeNext}`);
        }
        if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${safeNext}`);
        }
        return NextResponse.redirect(`${origin}${safeNext}`);
      }

      return NextResponse.redirect(
        `${origin}/connexion?error=oauth_google_failed&reason=${encodeURIComponent(
          error.message
        )}`
      );
    }
  }

  // 3. Support du flux implicite (#access_token=... dans le hash URL que le serveur ne voit pas)
  const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>Connexion Google en cours...</title>
  </head>
  <body style="background:#073B35;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
    <p style="font-size:14px">Validation de votre connexion Google...</p>
    <script>
      (function () {
        var hash = window.location.hash || "";
        if (hash.indexOf("access_token=") !== -1) {
          window.location.replace(${JSON.stringify(safeNext)} + hash);
        } else if (hash.indexOf("error_description=") !== -1 || hash.indexOf("error=") !== -1) {
          var params = new URLSearchParams(hash.replace(/^#/, ""));
          var reason = params.get("error_description") || params.get("error") || "hash_error";
          window.location.replace("/connexion?error=oauth_google_failed&reason=" + encodeURIComponent(reason));
        } else {
          window.location.replace("/connexion?error=oauth_google_failed&reason=" + encodeURIComponent("Aucun code OAuth recu. Verifiez Redirect URLs dans Supabase."));
        }
      })();
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
