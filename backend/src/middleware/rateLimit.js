// Small in-memory rate limiter for authentication endpoints. For multiple API
// instances, replace the store with Redis or another shared store.
const buckets = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function authRateLimit(req, res, next) {
    const now = Date.now();
    const key = String(req.ip || req.socket?.remoteAddress || "unknown");
    let bucket = buckets.get(key);
    if (!bucket || now >= bucket.resetAt) {
        bucket = { count: 0, resetAt: now + WINDOW_MS };
        buckets.set(key, bucket);
    }
    bucket.count += 1;
    if (bucket.count > MAX_ATTEMPTS) {
        res.set("Retry-After", String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))));
        return res.status(429).json({ success: false, message: "Bạn đã thử quá nhiều lần. Vui lòng đợi 15 phút rồi thử lại." });
    }
    // Bound memory use when many distinct IPs reach this process.
    if (buckets.size > 5000) {
        for (const [bucketKey, value] of buckets) {
            if (now >= value.resetAt) buckets.delete(bucketKey);
        }
        // Keep a hard ceiling even if all stored windows are still active.
        while (buckets.size > 5000) buckets.delete(buckets.keys().next().value);
    }
    next();
}

module.exports = { authRateLimit };
