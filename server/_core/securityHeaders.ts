import type { Express, NextFunction, Request, Response } from "express";

export function registerSecurityHeaders(app: Pick<Express, "use">) {
  app.use((_request: Request, response: Response, next: NextFunction) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "SAMEORIGIN");
    response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    response.setHeader("Permissions-Policy", "camera=(), geolocation=(self), microphone=(self)");
    response.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    if (process.env.NODE_ENV === "production") {
      response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
  });
}
