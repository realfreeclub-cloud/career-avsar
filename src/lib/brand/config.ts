/**
 * Career Avsar – Centralized Brand Configuration
 * Official Brand Identity, Visual Tokens, Domain and Metadata
 */

export interface BrandConfig {
  brandName: string;
  brandDescriptor: string;
  tagline: string;
  businessCategory: string;
  brandPositioning: string;
  domain: string;
  appUrl: string;
  supportEmail: string;
  supportPhone: string;
  logos: {
    primary: string;
    horizontal: string;
    icon: string;
    white: string;
    favicon: string;
    socialShare: string;
  };
  colors: {
    deepNavy: string;
    royalBlue: string;
    electricBlue: string;
    cyan: string;
    purple: string;
    magenta: string;
    orange: string;
    warmWhite: string;
    lightBg: string;
    text: string;
    textMuted: string;
    border: string;
  };
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
  };
  meta: {
    title: string;
    description: string;
    ogImage: string;
  };
}

export const CAREER_AVSAR_BRAND: BrandConfig = {
  brandName: "Career Avsar",
  brandDescriptor: "Teacher Recruitment & Career Opportunities",
  tagline: "Connecting Schools with Exceptional Educators",
  businessCategory: "Teacher Recruitment, Education Staffing and Placement Services",
  brandPositioning:
    "Career Avsar is a dedicated education recruitment platform that connects schools and educational institutions with qualified educators and helps teachers discover suitable career opportunities.",
  domain: "careeravsar.in",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://careeravsar.in",
  supportEmail: "support@careeravsar.in",
  supportPhone: "+91 98765 43210",
  logos: {
    primary: "/brand/career-avsar-logo.png",
    horizontal: "/brand/career-avsar-logo.png",
    icon: "/brand/career-avsar-logo.png",
    white: "/brand/career-avsar-logo.png",
    favicon: "/favicon.ico",
    socialShare: "/brand/career-avsar-logo.png",
  },
  colors: {
    deepNavy: "#14264D",
    royalBlue: "#1266C5",
    electricBlue: "#087FE8",
    cyan: "#08C9E8",
    purple: "#7024BD",
    magenta: "#B51C9B",
    orange: "#F28B19",
    warmWhite: "#FFFFFF",
    lightBg: "#F6F8FC",
    text: "#172334",
    textMuted: "#687487",
    border: "#E2E8F0",
  },
  socialLinks: {
    linkedin: "https://linkedin.com/company/careeravsar",
    twitter: "https://twitter.com/careeravsar",
    facebook: "https://facebook.com/careeravsar",
    instagram: "https://instagram.com/careeravsar",
  },
  meta: {
    title: "Career Avsar – Connecting Schools with Exceptional Educators",
    description:
      "Career Avsar is the premier teacher recruitment and placement platform connecting accredited schools with verified educators across Pratapgarh, Amethi, Jaunpur, Prayagraj, Raebareli, and Sultanpur in Uttar Pradesh.",
    ogImage: "/brand/career-avsar-logo.png",
  },
};

/**
 * Returns the active brand configuration.
 */
export function getBrandConfig(): BrandConfig {
  return CAREER_AVSAR_BRAND;
}
