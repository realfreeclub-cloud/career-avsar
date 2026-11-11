import type { Metadata } from "next";
import { CAREER_AVSAR_BRAND } from "@/lib/brand/config";

const siteName = `${CAREER_AVSAR_BRAND.brandName} – ${CAREER_AVSAR_BRAND.brandDescriptor}`;
const defaultDescription = CAREER_AVSAR_BRAND.meta.description;

type BuildOverrides = Metadata & { path?: string };

export function buildMetadata(overrides: BuildOverrides = {}): Metadata {
  const { path, openGraph: ogRest, robots: robotsRest, alternates: altRest, ...rest } = overrides;
  const title = typeof rest.title === "string" ? rest.title : undefined;
  const fullTitle = title ? `${title} | ${siteName}` : `${CAREER_AVSAR_BRAND.brandName} – ${CAREER_AVSAR_BRAND.tagline}`;
  const robots: Metadata["robots"] =
    typeof robotsRest === "object" && robotsRest !== null && !Array.isArray(robotsRest)
      ? { index: true, follow: true, ...robotsRest }
      : robotsRest ?? { index: true, follow: true };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://careeravsar.in";

  return {
    metadataBase: new URL(baseUrl),
    title: rest.title ?? fullTitle,
    description: rest.description ?? defaultDescription,
    openGraph: {
      type: "website",
      siteName: CAREER_AVSAR_BRAND.brandName,
      title: (ogRest?.title as string | undefined) ?? fullTitle,
      description: (ogRest?.description as string | undefined) ?? rest.description ?? defaultDescription,
      url: path,
      images: [
        {
          url: `${baseUrl}/brand/career-avsar-logo.png`,
          width: 1200,
          height: 1200,
          alt: `${CAREER_AVSAR_BRAND.brandName} – ${CAREER_AVSAR_BRAND.tagline}`,
        },
      ],
      ...(ogRest && typeof ogRest === "object" ? ogRest : {}),
    },
    robots,
    alternates: path ? { canonical: path, ...(altRest && typeof altRest === "object" ? altRest : {}) } : altRest,
    ...rest,
  };
}

export const defaultMetadata = buildMetadata();
