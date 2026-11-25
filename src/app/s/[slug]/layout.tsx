import type { Metadata } from "next";
import React from "react";
import { INITIAL_STORES } from "@/lib/seed-data";
import { StorefrontClientShell } from "@/components/storefront/storefront-shell";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = INITIAL_STORES.find((s) => s.slug === slug);

  if (!store) {
    return {
      title: `Boutique ${slug} | EcomSate`,
      description: "Boutique en ligne propulsée par EcomSate.",
    };
  }

  return {
    title: `${store.name} — Boutique officielle`,
    description: store.settings.description,
    openGraph: {
      title: store.name,
      description: store.settings.description,
      images: store.settings.bannerUrl ? [store.settings.bannerUrl] : undefined,
    },
  };
}

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <StorefrontClientShell slug={slug}>{children}</StorefrontClientShell>;
}
