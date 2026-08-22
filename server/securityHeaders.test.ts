import { describe, expect, it } from "vitest";
import { registerSecurityHeaders } from "./_core/securityHeaders";

describe("registerSecurityHeaders", () => {
  it("sets defensive browser headers before application routes", () => {
    let middleware: ((request: unknown, response: { setHeader: (key: string, value: string) => void }, next: () => void) => void) | undefined;
    registerSecurityHeaders({ use: handler => { middleware = handler as typeof middleware; } } as never);
    const headers: Record<string, string> = {};
    let continued = false;
    middleware?.({}, { setHeader: (key, value) => { headers[key] = value; } }, () => { continued = true; });

    expect(headers).toMatchObject({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), geolocation=(self), microphone=(self)",
    });
    expect(continued).toBe(true);
  });
});
