import { describe, expect, it } from "vitest";
import {
  createWhatsAppUrl,
  getWhatsAppLinkAttributes,
  isWhatsAppUrl,
  whatsappLinks,
  whatsappMessages,
} from "./whatsapp";

describe("WhatsApp links", () => {
  it("normalizes the phone number and preserves the complete message", () => {
    const url = new URL(createWhatsAppUrl("Hello & welcome", "+34 623 328 787"));

    expect(url.origin).toBe("https://wa.me");
    expect(url.pathname).toBe("/34623328787");
    expect(url.searchParams.get("text")).toBe("Hello & welcome");
  });

  it("uses the audited production phone and messages for every direct conversation", () => {
    for (const [flow, message] of Object.entries(whatsappMessages)) {
      const url = new URL(whatsappLinks[flow as keyof typeof whatsappMessages]);
      expect(url.pathname).toBe("/34623328787");
      expect(url.searchParams.get("text")).toBe(message);
    }
  });

  it("rejects an empty phone number", () => {
    expect(() => createWhatsAppUrl("Hello", "---")).toThrow("A WhatsApp phone number is required.");
  });

  it("recognizes direct chats and community invitations", () => {
    expect(isWhatsAppUrl(whatsappLinks.general)).toBe(true);
    expect(isWhatsAppUrl(whatsappLinks.community)).toBe(true);
    expect(isWhatsAppUrl("https://api.whatsapp.com/send?phone=34623328787")).toBe(true);
    expect(isWhatsAppUrl("/rooms")).toBe(false);
    expect(isWhatsAppUrl("https://notwhatsapp.com")).toBe(false);
  });

  it("always opens WhatsApp destinations in a new tab", () => {
    expect(getWhatsAppLinkAttributes(whatsappLinks.general)).toEqual({
      target: "_blank",
      rel: "noreferrer",
    });
    expect(getWhatsAppLinkAttributes(whatsappLinks.community, "_self")).toEqual({
      target: "_blank",
      rel: "noreferrer",
    });
    expect(getWhatsAppLinkAttributes("/rooms", "_self", "nofollow")).toEqual({
      target: "_self",
      rel: "nofollow",
    });
  });
});
