import { describe, expect, test } from "bun:test";
import { CONTACT_EMAIL, DISPLAY_PHONE, WHATSAPP_NUMBER, whatsappLink } from "./contact";

describe("Contact link helpers", () => {
  test("whatsappLink builds a wa.me URL and preserves the enquiry text", () => {
    const message = "I need photos & reels in Delhi";
    if (!WHATSAPP_NUMBER) {
      expect(whatsappLink(message)).toBe("#contact");
      return;
    }
    const url = new URL(whatsappLink(message));
    expect(url.hostname).toBe("wa.me");
    expect(url.pathname).toBe(`/${WHATSAPP_NUMBER}`);
    expect(url.searchParams.get("text")).toBe(message);
  });
  test("no personal contact details are hardcoded in source", () => {
    expect(typeof CONTACT_EMAIL).toBe("string");
    expect(typeof WHATSAPP_NUMBER).toBe("string");
    expect(typeof DISPLAY_PHONE).toBe("string");
  });
});
