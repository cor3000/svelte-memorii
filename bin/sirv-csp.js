#!/usr/bin/env node

const sirv = require('sirv');
const polka = require('polka');

const securityHeaders = {
    "Content-Security-Policy": "default-src 'none'; \
        script-src 'self' 'sha256-NtpL8QCTqdBzBOQjV7F+K72h7tzzDJCDeH7QS8m/Yvc=' 'unsafe-inline'; \
        connect-src 'self'; \
        media-src 'self'; \
        manifest-src 'self'; \
        img-src 'self'; \
        style-src 'self' 'unsafe-inline'; \
        base-uri 'none'; \
        form-action 'none'; \
        frame-ancestors 'none';",
    "Permissions-Policy": "fullscreen=(self), geolocation=(), camera=()",
    "Strict-Transport-Security": "max-age=2592000",
    "X-Xss-Protection": "1; mode=block",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin"
};


const assets = sirv('public', {
    setHeaders: res => {
        for (const key in securityHeaders) {
            res.setHeader(key, securityHeaders[key]);
        }
    }
});

polka()
    .use(assets)
    .listen(5000);
