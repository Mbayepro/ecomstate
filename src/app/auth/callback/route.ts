import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const safeNext = next.startsWith("/") ? next : "/dashboard";

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
    }
  }


  return NextResponse.redirect(
    `${origin}/connexion?error=oauth_google_failed`
  );
}
