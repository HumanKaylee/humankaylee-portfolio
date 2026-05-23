import { defineMiddleware } from "astro:middleware";

const securityHeaders = {
	"Content-Security-Policy": [
		"default-src 'self'",
		"base-uri 'self'",
		"object-src 'none'",
		"frame-ancestors 'none'",
		"form-action 'self' mailto:",
		"img-src 'self' data:",
		"font-src 'self'",
		"style-src 'self' 'unsafe-inline'",
		"script-src 'self' 'unsafe-inline'",
		"connect-src 'self'",
	].join("; "),
	"Cross-Origin-Opener-Policy": "same-origin",
	"Cross-Origin-Resource-Policy": "same-origin",
	"Permissions-Policy":
		"camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()",
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"X-Content-Type-Options": "nosniff",
	"X-Frame-Options": "DENY",
};

export const onRequest = defineMiddleware(async (_context, next) => {
	const response = await next();

	for (const [header, value] of Object.entries(securityHeaders)) {
		response.headers.set(header, value);
	}

	return response;
});
