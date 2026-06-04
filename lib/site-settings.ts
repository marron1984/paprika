import { lineUrl, phoneNumber, siteName } from "@/lib/constants";
import { supabaseFetch } from "@/lib/supabase-rest";
import type { SiteSettings, SiteSettingsRow } from "@/lib/types";

export const defaultSiteSettings: SiteSettings = {
  siteName,
  phoneNumber,
  lineUrl,
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || "",
  googleAdsConversionId: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID || "",
  googleAdsConversionLabel:
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL || "",
};

export function normalizeTelHref(value: string) {
  const normalized = value.replace(/[ー−‐―\s]/g, "-").replace(/[^0-9+]/g, "");
  return normalized ? `tel:${normalized}` : "#form";
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const rows = await supabaseFetch<SiteSettingsRow[]>(
    "site_settings?key=eq.site&select=key,value,updated_at&limit=1",
    { cache: "no-store" },
    true,
  ).catch(() => []);

  const saved = rows[0]?.value || {};
  return {
    ...defaultSiteSettings,
    ...saved,
    siteName: saved.siteName || defaultSiteSettings.siteName,
    phoneNumber: saved.phoneNumber || defaultSiteSettings.phoneNumber,
    lineUrl: saved.lineUrl || defaultSiteSettings.lineUrl,
  };
}
