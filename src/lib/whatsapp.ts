const WHATSAPP_PHONE = "34623328787";

export const whatsappMessages = {
  flexibleStay:
    "Hey! I'm interested in a flexible stay, is there something available between these dates: ",
  coworkingPass: "Hey! I have a few questions regarding the co-working pass",
  coworkingTour: "Hey! I want to book a tour for the Co-working space at Circles.",
  referral:
    "Hey I have a friend that wants to come to the house, can I get a referral code for both of us?",
  general: "Hey! I'd like to know more about Circles House.",
} as const;

export function createWhatsAppUrl(message: string, phone = WHATSAPP_PHONE): string {
  const normalizedPhone = phone.replace(/\D/g, "");
  if (!normalizedPhone) throw new Error("A WhatsApp phone number is required.");

  const url = new URL(`https://wa.me/${normalizedPhone}`);
  url.searchParams.set("text", message);
  return url.toString();
}

export function createDealWhatsAppUrl(title: string): string {
  return createWhatsAppUrl(`Hey! I'm interested in the offer: ${title}`);
}

export function isWhatsAppUrl(href: string): boolean {
  try {
    const { hostname } = new URL(href);
    return hostname === "wa.me" || hostname === "whatsapp.com" || hostname.endsWith(".whatsapp.com");
  } catch {
    return false;
  }
}

export function getWhatsAppLinkAttributes(
  href: string | undefined,
  target?: string,
  rel?: string,
): { target?: string; rel?: string } {
  if (href && isWhatsAppUrl(href)) {
    return { target: "_blank", rel: "noreferrer" };
  }

  return { target, rel };
}

export const whatsappLinks = {
  flexibleStay: createWhatsAppUrl(whatsappMessages.flexibleStay),
  coworkingPass: createWhatsAppUrl(whatsappMessages.coworkingPass),
  coworkingTour: createWhatsAppUrl(whatsappMessages.coworkingTour),
  referral: createWhatsAppUrl(whatsappMessages.referral),
  general: createWhatsAppUrl(whatsappMessages.general),
  community: "https://chat.whatsapp.com/IC3c9ZibNzz4hEcZOXHzYc?mode=ems_copy_c",
} as const;
