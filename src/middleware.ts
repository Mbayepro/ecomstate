import { NextResponse, type NextRequest } from "next/server";

const RESERVED_SUBDOMAINS = new Set(["www", "app", "admin", "api"]);

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "ecomsate.com";

  // Ignore Next.js internals, OAuth callback & static assets
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/auth") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Détection de sous-domaine multi-tenant (ex: mode.ecomsate.com ou mode.localhost:3000)
  const cleanHost = hostname.split(":")[0].toLowerCase();

  // Ne jamais réécrire les domaines d'aperçu/production Vercel par défaut (*.vercel.app)
  if (cleanHost.endsWith(".vercel.app")) {
    return NextResponse.next();
  }


  let subdomain: string | null = null;

  if (cleanHost.endsWith(`.${rootDomain}`)) {
    subdomain = cleanHost.replace(`.${rootDomain}`, "");
  } else if (cleanHost.endsWith(".localhost") && cleanHost !== "localhost") {
    subdomain = cleanHost.replace(".localhost", "");
  }

  if (subdomain && !RESERVED_SUBDOMAINS.has(subdomain)) {
    // Réécriture transparente vers la boutique publique /s/[slug]
    if (!url.pathname.startsWith(`/s/${subdomain}`)) {
      url.pathname = `/s/${subdomain}${url.pathname === "/" ? "" : url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
