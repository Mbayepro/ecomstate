import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

function getSupabasePublicKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isSupabaseServerConfigured(): boolean {
  const key = getSupabasePublicKey();
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      key &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project") &&
      !key.includes("your-")
  );
}

export async function createSupabaseServerClient() {
  const key = getSupabasePublicKey();
  if (!isSupabaseServerConfigured() || !key) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: CookieOptions;
          }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Appelé depuis un Server Component en lecture seule
          }
        },
      },
    }
  );
}

