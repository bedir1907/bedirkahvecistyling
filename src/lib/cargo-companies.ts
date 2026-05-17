export type CargoCompany = {
  key: string
  name: string
  trackingUrl: (trackingNumber: string) => string
}

export const CARGO_COMPANIES: CargoCompany[] = [
  {
    key: "yurtici",
    name: "Yurtiçi Kargo",
    trackingUrl: (no) => `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${no}`,
  },
  {
    key: "mng",
    name: "MNG Kargo",
    trackingUrl: (no) => `https://www.mngkargo.com.tr/gonderi-sorgula?trackingNumber=${no}`,
  },
  {
    key: "aras",
    name: "Aras Kargo",
    trackingUrl: (no) => `https://www.araskargo.com.tr/araclar/kargo-sorgulama/?trackingNumber=${no}`,
  },
  {
    key: "ptt",
    name: "PTT Kargo",
    trackingUrl: (no) => `https://gonderitakip.ptt.gov.tr/?q=${no}`,
  },
  {
    key: "surat",
    name: "Sürat Kargo",
    trackingUrl: (no) => `https://www.suratkargo.com.tr/KargoTakip/?GoTakip=${no}`,
  },
  {
    key: "ups",
    name: "UPS",
    trackingUrl: (no) => `https://www.ups.com/track?tracknum=${no}&loc=tr_TR`,
  },
  {
    key: "dhl",
    name: "DHL",
    trackingUrl: (no) => `https://www.dhl.com/tr-tr/home/tracking.html?tracking-id=${no}`,
  },
]

export function getCargoCompany(key: string): CargoCompany | undefined {
  return CARGO_COMPANIES.find((c) => c.key === key)
}

export function getTrackingUrl(companyKey: string, trackingNumber: string): string | null {
  const company = getCargoCompany(companyKey)
  if (!company) return null
  return company.trackingUrl(trackingNumber)
}
