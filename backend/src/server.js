const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { poolPromise } = require("./config/database");

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

app.disable("x-powered-by");
const corsOrigin = String(process.env.CORS_ORIGIN || "").trim();
app.use(cors(corsOrigin ? { origin: corsOrigin.split(",").map((value) => value.trim()).filter(Boolean) } : undefined));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

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
    console.error("Unhandled error:", error);
    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

app.listen(PORT, () => {
    console.log(`🚀 BeautyBooking API running at http://localhost:${PORT}`);
});
