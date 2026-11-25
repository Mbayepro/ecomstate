import { createBrowserClient } from "@supabase/ssr";

function getSupabasePublicKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isSupabaseConfigured(): boolean {
  const key = getSupabasePublicKey();
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      key &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project") &&
      !key.includes("your-")
  );
}

export function createSupabaseBrowserClient() {
  const key = getSupabasePublicKey();
  if (!isSupabaseConfigured() || !key) {
    return null;
  }
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

export async function signInWithGoogleOAuth(nextPath = "/dashboard"): Promise<{
  ok: boolean;
  error?: string;
}> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) {
    return {
      ok: false,
      error:
        "Supabase n'est pas configuré dans les variables d'environnement (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).",
    };
  }

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const callbackUrl =
    nextPath && nextPath !== "/dashboard"
      ? `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
      : `${origin}/auth/callback`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}



