import { describe, expect, it } from "vitest";
import { createFixedWindowRateLimiter } from "./smartDraftRateLimit";

describe("createFixedWindowRateLimiter", () => {
  it("limits one user without blocking a different user", () => {
    let time = 1_000;
    const limiter = createFixedWindowRateLimiter({ limit: 2, windowMs: 60_000, now: () => time });
    expect(limiter.consume("user-1")).toMatchObject({ allowed: true, remaining: 1 });
    expect(limiter.consume("user-1")).toMatchObject({ allowed: true, remaining: 0 });
    expect(limiter.consume("user-1")).toMatchObject({ allowed: false, retryAfterMs: 60_000 });
    expect(limiter.consume("user-2")).toMatchObject({ allowed: true, remaining: 1 });

    time += 60_000;
    expect(limiter.consume("user-1")).toMatchObject({ allowed: true, remaining: 1 });
  });

  it("keeps the in-memory key set bounded", () => {
    const limiter = createFixedWindowRateLimiter({ limit: 1, windowMs: 60_000, maxKeys: 2, now: () => 1_000 });
    limiter.consume("oldest");
    limiter.consume("middle");
    limiter.consume("newest");
    expect(limiter.consume("oldest")).toMatchObject({ allowed: true, remaining: 0 });
  });
});
