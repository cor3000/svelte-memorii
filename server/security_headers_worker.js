const securityHeaders = {
    "Content-Security-Policy": "default-src 'none'; \
        script-src 'self' 'sha256-NtpL8QCTqdBzBOQjV7F+K72h7tzzDJCDeH7QS8m/Yvc=' 'unsafe-inline'; \
        connect-src 'self'; \
        media-src 'self'; \
        manifest-src 'self'; \
        img-src 'self'; \
        style-src 'self' 'unsafe-inline'; \
        frame-ancestors 'none';",
    // "Feature-Policy": "notifications 'self'; speaker 'self'",
    "Strict-Transport-Security": "max-age=2592000",
    "X-Xss-Protection": "1; mode=block",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin"
};

const removeHeaders = [];

addEventListener('fetch', event => {
    event.respondWith(addHeaders(event.request))
});

async function addHeaders(req) {
    const response = await fetch(req);
    const origHeaders = response.headers;
    if (origHeaders.has("content-type") && !origHeaders.get("content-type").includes("text/html")) {
        console.log("skip non html");
        return response;
    }

    console.log("changing headers for: ", req);

    let newHeaders = new Headers(origHeaders);

    Object.keys(securityHeaders).forEach(key =>
        newHeaders.set(key, securityHeaders[key])
    );

    removeHeaders.forEach(key => newHeaders.delete(key));

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
    })
}
