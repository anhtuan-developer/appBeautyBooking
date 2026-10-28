const express = require("express");
const cors = require("cors");
const { randomUUID } = require("node:crypto");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const salonRoutes = require("./routes/salonRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET === "replace-with-a-long-random-secret") {
    console.error("Configuration error: set JWT_SECRET to a unique random value of at least 32 characters in backend/.env.");
    process.exit(1);
}

const corsOrigin = String(process.env.CORS_ORIGIN || "").trim();
const allowedOrigins = corsOrigin.split(",").map((value) => value.trim()).filter(Boolean);
if (process.env.NODE_ENV === "production" && allowedOrigins.length === 0) {
    console.error("Configuration error: CORS_ORIGIN must list allowed web origins in production. Native mobile requests without Origin remain allowed.");
    process.exit(1);
}

const { poolPromise } = require("./config/database");

app.disable("x-powered-by");
app.use((req, res, next) => {
    req.requestId = randomUUID();
    res.setHeader("X-Request-Id", req.requestId);
    next();
});
app.use(cors({
    origin(origin, callback) {
        // React Native and other non-browser clients commonly do not send Origin.
        if (!origin || process.env.NODE_ENV !== "production" || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("CORS origin not allowed"));
    }
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "BeautyBooking API is running",
        version: "1.0.0"
    });
});

app.get("/api/health", async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request().query("SELECT 1 AS Ok");
        res.json({ success: true, api: "ok", database: "ok" });
    } catch (error) {
        console.error("Health check error:", error);
        res.status(503).json({ success: false, api: "ok", database: "error" });
    }
});

app.get("/api/test-db", async (req, res) => {
    if (process.env.NODE_ENV === "production") {
        return res.status(404).json({ success: false, message: "Not found" });
    }
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT DB_NAME() AS DatabaseName");
        res.json({ success: true, database: result.recordset[0].DatabaseName });
    } catch (error) {
        console.error("Database test error:", error);
        res.status(500).json({ success: false, message: "Database connection failed" });
    }
});

app.use("/api/auth", authRoutes);
app.use("/api/salons", salonRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);

console.log("📅 Schedule routes: /api/schedules/employee/:employeeId/available-slots");
console.log("📝 Booking route: POST /api/bookings");
console.log("⭐ Review routes: POST /api/reviews, GET /api/reviews/salon/:salonId, GET /api/reviews/my-reviews");
console.log("🔔 Notification routes: GET /api/notifications, GET /api/notifications/unread-count, PATCH /api/notifications/:notificationId/read");
console.log("🔄 Booking status route: PATCH /api/bookings/:bookingId/status");

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Không tìm thấy API: ${req.method} ${req.originalUrl}`
    });
});

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    // Keep sensitive request bodies and credentials out of logs.
    console.error("Unhandled request error:", {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        message: error && error.message ? error.message : "Unknown error"
    });
    if (error && error.message === "CORS origin not allowed") {
        return res.status(403).json({ success: false, message: "Origin không được phép truy cập API." });
    }
    return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ.", requestId: req.requestId });
});

app.listen(PORT, () => {
    console.log(`🚀 BeautyBooking API running at http://localhost:${PORT}`);
});
