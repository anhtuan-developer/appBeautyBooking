const { poolPromise, sql } = require("../config/database");

function normalizeRating(value) {
    const rating = Number(value);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return null;
    return rating;
}

function normalizeId(value) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) return null;
    return id;
}

async function createReview({ userId, bookingId, rating, comment }) {
    const normalizedUserId = normalizeId(userId);
    const normalizedBookingId = normalizeId(bookingId);
    const normalizedRating = normalizeRating(rating);

    if (!normalizedUserId || !normalizedBookingId) {
        const error = new Error("INVALID_ID");
        error.statusCode = 400;
        throw error;
    }

    if (!normalizedRating) {
        const error = new Error("INVALID_RATING");
        error.statusCode = 400;
        throw error;
    }

    const normalizedComment = comment == null ? null : String(comment).trim();
    if (normalizedComment && normalizedComment.length > 1000) {
        const error = new Error("COMMENT_TOO_LONG");
        error.statusCode = 400;
        throw error;
    }

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

        // Lock the booking while checking ownership/status/review existence.
        const bookingResult = await transaction
            .request()
            .input("BookingId", sql.Int, normalizedBookingId)
            .input("UserId", sql.Int, normalizedUserId)
            .query(`
                SELECT TOP 1
                    b.BookingId,
                    b.UserId,
                    b.SalonId,
                    b.ServiceId,
                    b.EmployeeId,
                    b.BookingDate,
                    b.StartTime,
                    b.EndTime,
                    b.Status,
                    s.SalonName,
                    d.ServiceName,
                    e.FullName AS EmployeeName
                FROM Bookings b WITH (UPDLOCK, HOLDLOCK)
                INNER JOIN Salons s ON s.SalonId = b.SalonId
                INNER JOIN dichvu d ON d.ServiceId = b.ServiceId
                INNER JOIN Employees e ON e.EmployeeId = b.EmployeeId
                WHERE b.BookingId = @BookingId
                  AND b.UserId = @UserId;
            `);

        if (bookingResult.recordset.length === 0) {
            const error = new Error("BOOKING_NOT_FOUND");
            error.statusCode = 404;
            throw error;
        }

        const booking = bookingResult.recordset[0];

        if (booking.Status !== "COMPLETED") {
            const error = new Error("BOOKING_NOT_COMPLETED");
            error.statusCode = 409;
            throw error;
        }

        const existingReview = await transaction
            .request()
            .input("BookingId", sql.Int, normalizedBookingId)
            .query(`
                SELECT TOP 1 ReviewId
                FROM Reviews WITH (UPDLOCK, HOLDLOCK)
                WHERE BookingId = @BookingId;
            `);

        if (existingReview.recordset.length > 0) {
            const error = new Error("REVIEW_EXISTS");
            error.statusCode = 409;
            throw error;
        }

        const insertResult = await transaction
            .request()
            .input("BookingId", sql.Int, normalizedBookingId)
            .input("UserId", sql.Int, normalizedUserId)
            .input("SalonId", sql.Int, booking.SalonId)
            .input("Rating", sql.TinyInt, normalizedRating)
            .input("Comment", sql.NVarChar(1000), normalizedComment || null)
            .query(`
                INSERT INTO Reviews
                (
                    BookingId,
                    UserId,
                    SalonId,
                    Rating,
                    Comment
                )
                OUTPUT
                    INSERTED.ReviewId,
                    INSERTED.BookingId,
                    INSERTED.UserId,
                    INSERTED.SalonId,
                    INSERTED.Rating,
                    INSERTED.Comment,
                    INSERTED.CreatedAt
                VALUES
                (
                    @BookingId,
                    @UserId,
                    @SalonId,
                    @Rating,
                    @Comment
                );
            `);

        await transaction.commit();

        return {
            review: insertResult.recordset[0],
            booking: {
                bookingId: booking.BookingId,
                bookingDate: booking.BookingDate,
                startTime: booking.StartTime,
                endTime: booking.EndTime,
                status: booking.Status
            },
            salon: {
                salonId: booking.SalonId,
                salonName: booking.SalonName
            },
            service: {
                serviceId: booking.ServiceId,
                serviceName: booking.ServiceName
            },
            employee: {
                employeeId: booking.EmployeeId,
                employeeName: booking.EmployeeName
            }
        };
    } catch (error) {
        if (transaction._aborted !== true) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error("Review transaction rollback error:", rollbackError);
            }
        }

        if (error.number === 2601 || error.number === 2627) {
            const duplicateError = new Error("REVIEW_EXISTS");
            duplicateError.statusCode = 409;
            throw duplicateError;
        }

        throw error;
    }
}

async function getReviewsBySalonId(salonId) {
    const normalizedSalonId = normalizeId(salonId);
    if (!normalizedSalonId) {
        const error = new Error("INVALID_ID");
        error.statusCode = 400;
        throw error;
    }

    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("SalonId", sql.Int, normalizedSalonId)
        .query(`
            SELECT
                r.ReviewId,
                r.BookingId,
                r.UserId,
                r.SalonId,
                r.Rating,
                r.Comment,
                r.CreatedAt,
                u.FullName AS UserName
            FROM Reviews r
            INNER JOIN Users u ON u.UserId = r.UserId
            WHERE r.SalonId = @SalonId
            ORDER BY r.CreatedAt DESC, r.ReviewId DESC;
        `);

    return result.recordset;
}

async function getMyReviews(userId) {
    const normalizedUserId = normalizeId(userId);
    if (!normalizedUserId) {
        const error = new Error("INVALID_ID");
        error.statusCode = 400;
        throw error;
    }

    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("UserId", sql.Int, normalizedUserId)
        .query(`
            SELECT
                r.ReviewId,
                r.BookingId,
                r.UserId,
                r.SalonId,
                s.SalonName,
                r.Rating,
                r.Comment,
                r.CreatedAt
            FROM Reviews r
            INNER JOIN Salons s ON s.SalonId = r.SalonId
            WHERE r.UserId = @UserId
            ORDER BY r.CreatedAt DESC, r.ReviewId DESC;
        `);

    return result.recordset;
}

module.exports = {
    createReview,
    getReviewsBySalonId,
    getMyReviews
};
