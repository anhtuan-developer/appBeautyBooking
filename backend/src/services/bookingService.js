const { poolPromise, sql } = require("../config/database");
const notificationService = require("./notificationService");

function normalizeTime(value) {
    if (typeof value !== "string") return null;

    const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
    if (!match) return null;

    const hour = Number(match[1]);
    const minute = Number(match[2]);
    const second = Number(match[3] || "0");

    if (hour > 23 || minute > 59 || second > 59) return null;

    // Bookings in this system are minute-based.
    if (second !== 0) return null;

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

function parseDateOnly(value) {
    if (typeof value !== "string") return null;

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        return null;
    }

    return {
        value: `${match[1]}-${match[2]}-${match[3]}`,
        date
    };
}

function getDayOfWeek(date) {
    // Monday = 1 ... Sunday = 7
    return ((date.getUTCDay() + 6) % 7) + 1;
}

function timeToMinutes(time) {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
}

function minutesToTime(totalMinutes) {
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

async function createBooking({
    userId,
    employeeId,
    serviceId,
    bookingDate,
    startTime,
    note
}) {
    const parsedDate = parseDateOnly(bookingDate);
    if (!parsedDate) {
        const error = new Error("INVALID_DATE");
        error.statusCode = 400;
        throw error;
    }

    const normalizedStartTime = normalizeTime(startTime);
    if (!normalizedStartTime) {
        const error = new Error("INVALID_TIME");
        error.statusCode = 400;
        throw error;
    }

    const normalizedEmployeeId = Number(employeeId);
    const normalizedServiceId = Number(serviceId);
    const normalizedUserId = Number(userId);

    if (
        !Number.isInteger(normalizedEmployeeId) || normalizedEmployeeId <= 0 ||
        !Number.isInteger(normalizedServiceId) || normalizedServiceId <= 0 ||
        !Number.isInteger(normalizedUserId) || normalizedUserId <= 0
    ) {
        const error = new Error("INVALID_ID");
        error.statusCode = 400;
        throw error;
    }

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        // SERIALIZABLE protects the transaction's reads. sp_getapplock additionally
        // serializes all booking attempts for the same employee + date.
        await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

        const lockResource = `BeautyBooking:Employee:${normalizedEmployeeId}:Date:${parsedDate.value}`;

        const lockResult = await transaction
            .request()
            .input("Resource", sql.NVarChar(255), lockResource)
            .query(`
                DECLARE @LockResult INT;

                EXEC @LockResult = sp_getapplock
                    @Resource = @Resource,
                    @LockMode = 'Exclusive',
                    @LockOwner = 'Transaction',
                    @LockTimeout = 5000;

                SELECT @LockResult AS LockResult;
            `);

        const lockCode = Number(lockResult.recordset[0]?.LockResult);

        if (lockCode < 0) {
            const error = new Error("BOOKING_LOCK_FAILED");
            error.statusCode = 409;
            throw error;
        }

        // 1. Employee must be active.
        const employeeResult = await transaction
            .request()
            .input("EmployeeId", sql.Int, normalizedEmployeeId)
            .query(`
                SELECT TOP 1
                    EmployeeId,
                    SalonId,
                    FullName,
                    IsActive
                FROM Employees
                WHERE EmployeeId = @EmployeeId;
            `);

        if (employeeResult.recordset.length === 0) {
            const error = new Error("EMPLOYEE_NOT_FOUND");
            error.statusCode = 404;
            throw error;
        }

        const employee = employeeResult.recordset[0];

        if (!employee.IsActive) {
            const error = new Error("EMPLOYEE_INACTIVE");
            error.statusCode = 409;
            throw error;
        }

        // 2. Service must be active and belong to the employee's salon.
        const serviceResult = await transaction
            .request()
            .input("ServiceId", sql.Int, normalizedServiceId)
            .input("SalonId", sql.Int, employee.SalonId)
            .query(`
                SELECT TOP 1
                    ServiceId,
                    SalonId,
                    ServiceName,
                    Price,
                    DurationMinutes,
                    IsActive
                FROM dichvu
                WHERE ServiceId = @ServiceId
                  AND SalonId = @SalonId;
            `);

        if (serviceResult.recordset.length === 0) {
            const error = new Error("SERVICE_NOT_FOUND");
            error.statusCode = 404;
            throw error;
        }

        const service = serviceResult.recordset[0];

        if (!service.IsActive) {
            const error = new Error("SERVICE_INACTIVE");
            error.statusCode = 409;
            throw error;
        }

        // 3. Calculate EndTime on the server. The client never controls it.
        const startMinutes = timeToMinutes(normalizedStartTime);
        const endMinutes = startMinutes + Number(service.DurationMinutes);

        if (endMinutes > 24 * 60) {
            const error = new Error("BOOKING_CROSSES_MIDNIGHT");
            error.statusCode = 400;
            throw error;
        }

        const normalizedEndTime = minutesToTime(endMinutes);
        const dayOfWeek = getDayOfWeek(parsedDate.date);

        // 4. Employee must have a working schedule containing the whole booking.
        const scheduleResult = await transaction
            .request()
            .input("EmployeeId", sql.Int, normalizedEmployeeId)
            .input("DayOfWeek", sql.TinyInt, dayOfWeek)
            .input("StartTime", sql.VarChar(8), normalizedStartTime)
            .input("EndTime", sql.VarChar(8), normalizedEndTime)
            .query(`
                SELECT TOP 1
                    ScheduleId,
                    StartTime,
                    EndTime
                FROM EmployeeSchedules
                WHERE EmployeeId = @EmployeeId
                  AND DayOfWeek = @DayOfWeek
                  AND IsWorking = 1
                  AND StartTime <= @StartTime
                  AND EndTime >= @EndTime
                ORDER BY StartTime;
            `);

        if (scheduleResult.recordset.length === 0) {
            const error = new Error("OUTSIDE_WORKING_HOURS");
            error.statusCode = 409;
            throw error;
        }

        // 5. Reject an overlap with any active booking.
        // CANCELLED and REJECTED bookings do not block the slot.
        const overlapResult = await transaction
            .request()
            .input("EmployeeId", sql.Int, normalizedEmployeeId)
            .input("BookingDate", sql.VarChar(10), parsedDate.value)
            .input("StartTime", sql.VarChar(8), normalizedStartTime)
            .input("EndTime", sql.VarChar(8), normalizedEndTime)
            .query(`
                SELECT TOP 1
                    BookingId,
                    StartTime,
                    EndTime,
                    Status
                FROM Bookings
                WHERE EmployeeId = @EmployeeId
                  AND BookingDate = @BookingDate
                  AND Status IN ('PENDING', 'CONFIRMED', 'COMPLETED')
                  AND StartTime < @EndTime
                  AND EndTime > @StartTime;
            `);

        if (overlapResult.recordset.length > 0) {
            const error = new Error("SLOT_ALREADY_BOOKED");
            error.statusCode = 409;
            error.conflict = overlapResult.recordset[0];
            throw error;
        }

        // 6. Create the booking.
        const insertResult = await transaction
            .request()
            .input("UserId", sql.Int, normalizedUserId)
            .input("SalonId", sql.Int, employee.SalonId)
            .input("ServiceId", sql.Int, normalizedServiceId)
            .input("EmployeeId", sql.Int, normalizedEmployeeId)
            .input("BookingDate", sql.VarChar(10), parsedDate.value)
            .input("StartTime", sql.VarChar(8), normalizedStartTime)
            .input("EndTime", sql.VarChar(8), normalizedEndTime)
            .input("Status", sql.VarChar(20), "PENDING")
            .input("Note", sql.NVarChar(500), note ? String(note).trim() : null)
            .query(`
                INSERT INTO Bookings
                (
                    UserId,
                    SalonId,
                    ServiceId,
                    EmployeeId,
                    BookingDate,
                    StartTime,
                    EndTime,
                    Status,
                    Note
                )
                OUTPUT
                    INSERTED.BookingId,
                    INSERTED.UserId,
                    INSERTED.SalonId,
                    INSERTED.ServiceId,
                    INSERTED.EmployeeId,
                    INSERTED.BookingDate,
                    INSERTED.StartTime,
                    INSERTED.EndTime,
                    INSERTED.Status,
                    INSERTED.Note,
                    INSERTED.CreatedAt,
                    INSERTED.UpdatedAt
                VALUES
                (
                    @UserId,
                    @SalonId,
                    @ServiceId,
                    @EmployeeId,
                    @BookingDate,
                    @StartTime,
                    @EndTime,
                    @Status,
                    @Note
                );
            `);

        await transaction.commit();

        // Notification is secondary to the booking transaction. If notification
        // creation fails, the booking remains successful and the error is logged.
        try {
            await notificationService.createNotification({
                userId: normalizedUserId,
                title: "Đặt lịch thành công",
                message: `Lịch hẹn của bạn tại ${service.ServiceName} với ${employee.FullName} ngày ${parsedDate.value} lúc ${normalizedStartTime.substring(0, 5)} đã được tạo và đang chờ xác nhận.`,
                type: "BOOKING_CREATED"
            });
        } catch (notificationError) {
            console.error("Create booking notification error:", notificationError);
        }

        return {
            booking: insertResult.recordset[0],
            service: {
                serviceId: service.ServiceId,
                serviceName: service.ServiceName,
                price: service.Price,
                durationMinutes: service.DurationMinutes
            },
            employee: {
                employeeId: employee.EmployeeId,
                fullName: employee.FullName
            }
        };
    } catch (error) {
        try {
            if (transaction._aborted !== true) {
                await transaction.rollback();
            }
        } catch (rollbackError) {
            console.error("Booking rollback error:", rollbackError);
        }

        throw error;
    }
}


async function getMyBookings(userId) {
    const normalizedUserId = Number(userId);

    if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
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
                b.BookingId,
                b.UserId,
                b.SalonId,
                s.SalonName,
                b.ServiceId,
                dv.ServiceName,
                dv.Price,
                dv.DurationMinutes,
                b.EmployeeId,
                e.FullName AS EmployeeName,
                b.BookingDate,
                b.StartTime,
                b.EndTime,
                b.Status,
                b.Note,
                b.CreatedAt,
                b.UpdatedAt
            FROM Bookings b
            INNER JOIN Salons s ON s.SalonId = b.SalonId
            INNER JOIN dichvu dv ON dv.ServiceId = b.ServiceId
            INNER JOIN Employees e ON e.EmployeeId = b.EmployeeId
            WHERE b.UserId = @UserId
            ORDER BY b.BookingDate DESC, b.StartTime DESC, b.BookingId DESC;
        `);

    return {
        total: result.recordset.length,
        items: result.recordset
    };
}

async function getBookingDetail(userId, bookingId) {
    const normalizedUserId = Number(userId);
    const normalizedBookingId = Number(bookingId);

    if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0 ||
        !Number.isInteger(normalizedBookingId) || normalizedBookingId <= 0) {
        const error = new Error("INVALID_BOOKING_ID");
        error.statusCode = 400;
        throw error;
    }

    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("UserId", sql.Int, normalizedUserId)
        .input("BookingId", sql.Int, normalizedBookingId)
        .query(`
            SELECT TOP 1
                b.BookingId,
                b.UserId,
                b.SalonId,
                s.SalonName,
                s.Address AS SalonAddress,
                s.Phone AS SalonPhone,
                b.ServiceId,
                dv.ServiceName,
                dv.Description AS ServiceDescription,
                dv.Price,
                dv.DurationMinutes,
                dv.ImageUrl AS ServiceImageUrl,
                b.EmployeeId,
                e.FullName AS EmployeeName,
                e.Phone AS EmployeePhone,
                e.AvatarUrl AS EmployeeAvatarUrl,
                e.Specialization,
                b.BookingDate,
                b.StartTime,
                b.EndTime,
                b.Status,
                b.Note,
                b.CreatedAt,
                b.UpdatedAt
            FROM Bookings b
            INNER JOIN Salons s ON s.SalonId = b.SalonId
            INNER JOIN dichvu dv ON dv.ServiceId = b.ServiceId
            INNER JOIN Employees e ON e.EmployeeId = b.EmployeeId
            WHERE b.BookingId = @BookingId
              AND b.UserId = @UserId;
        `);

    if (result.recordset.length === 0) {
        const error = new Error("BOOKING_NOT_FOUND");
        error.statusCode = 404;
        throw error;
    }

    return result.recordset[0];
}

async function cancelBooking(userId, bookingId) {
    const normalizedUserId = Number(userId);
    const normalizedBookingId = Number(bookingId);

    if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0 ||
        !Number.isInteger(normalizedBookingId) || normalizedBookingId <= 0) {
        const error = new Error("INVALID_BOOKING_ID");
        error.statusCode = 400;
        throw error;
    }

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        // SERIALIZABLE prevents two concurrent cancellation/status changes
        // from both acting on the same PENDING booking.
        await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

        const currentResult = await transaction
            .request()
            .input("BookingId", sql.Int, normalizedBookingId)
            .input("UserId", sql.Int, normalizedUserId)
            .query(`
                SELECT TOP 1
                    b.BookingId,
                    b.UserId,
                    b.SalonId,
                    b.EmployeeId,
                    b.Status,
                    s.SalonName,
                    e.FullName AS EmployeeName,
                    e.UserId AS EmployeeUserId,
                    s.OwnerUserId
                FROM Bookings b WITH (UPDLOCK, HOLDLOCK)
                INNER JOIN Salons s ON s.SalonId = b.SalonId
                INNER JOIN Employees e ON e.EmployeeId = b.EmployeeId
                WHERE b.BookingId = @BookingId
                  AND b.UserId = @UserId;
            `);

        if (currentResult.recordset.length === 0) {
            const error = new Error("BOOKING_NOT_FOUND");
            error.statusCode = 404;
            throw error;
        }

        const currentBooking = currentResult.recordset[0];

        if (currentBooking.Status !== "PENDING") {
            const error = new Error("BOOKING_NOT_PENDING");
            error.statusCode = 409;
            throw error;
        }

        const updateResult = await transaction
            .request()
            .input("BookingId", sql.Int, normalizedBookingId)
            .input("UserId", sql.Int, normalizedUserId)
            .query(`
                UPDATE Bookings
                SET
                    Status = 'CANCELLED',
                    UpdatedAt = SYSDATETIME()
                OUTPUT
                    INSERTED.BookingId,
                    INSERTED.UserId,
                    INSERTED.SalonId,
                    INSERTED.ServiceId,
                    INSERTED.EmployeeId,
                    INSERTED.BookingDate,
                    INSERTED.StartTime,
                    INSERTED.EndTime,
                    INSERTED.Status,
                    INSERTED.Note,
                    INSERTED.CreatedAt,
                    INSERTED.UpdatedAt
                WHERE BookingId = @BookingId
                  AND UserId = @UserId
                  AND Status = 'PENDING';
            `);

        if (updateResult.recordset.length === 0) {
            const error = new Error("BOOKING_NOT_PENDING");
            error.statusCode = 409;
            throw error;
        }

        await transaction.commit();

        try {
            await notificationService.createNotifications([
                {
                    userId: currentBooking.OwnerUserId,
                    title: "Booking đã được hủy",
                    message: `Booking #${normalizedBookingId} tại ${currentBooking.SalonName} đã được khách hàng hủy.`,
                    type: "BOOKING_CANCELLED"
                },
                {
                    userId: currentBooking.EmployeeUserId,
                    title: "Booking đã được hủy",
                    message: `Booking #${normalizedBookingId} của khách hàng đã được hủy.`,
                    type: "BOOKING_CANCELLED"
                }
            ]);
        } catch (notificationError) {
            console.error("Cancel booking notification error:", notificationError);
        }

        return {
            booking: updateResult.recordset[0]
        };
    } catch (error) {
        try {
            if (transaction._aborted !== true) {
                await transaction.rollback();
            }
        } catch (rollbackError) {
            console.error("Cancel booking rollback error:", rollbackError);
        }

        throw error;
    }
}

async function updateBookingStatus({ userId, role, bookingId, status }) {
    const normalizedUserId = Number(userId);
    const normalizedBookingId = Number(bookingId);
    const normalizedStatus = String(status || "").trim().toUpperCase();

    if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0 ||
        !Number.isInteger(normalizedBookingId) || normalizedBookingId <= 0) {
        const error = new Error("INVALID_BOOKING_ID");
        error.statusCode = 400;
        throw error;
    }

    if (!['CONFIRMED', 'REJECTED', 'COMPLETED'].includes(normalizedStatus)) {
        const error = new Error("INVALID_BOOKING_STATUS");
        error.statusCode = 400;
        throw error;
    }

    const allowedRoles = ['SALON', 'EMPLOYEE', 'ADMIN'];
    if (!allowedRoles.includes(role)) {
        const error = new Error("FORBIDDEN");
        error.statusCode = 403;
        throw error;
    }

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

        const currentResult = await transaction
            .request()
            .input("BookingId", sql.Int, normalizedBookingId)
            .query(`
                SELECT TOP 1
                    b.BookingId,
                    b.UserId,
                    b.SalonId,
                    b.EmployeeId,
                    b.Status,
                    s.SalonName,
                    s.OwnerUserId,
                    e.FullName AS EmployeeName,
                    e.UserId AS EmployeeUserId
                FROM Bookings b WITH (UPDLOCK, HOLDLOCK)
                INNER JOIN Salons s ON s.SalonId = b.SalonId
                INNER JOIN Employees e ON e.EmployeeId = b.EmployeeId
                WHERE b.BookingId = @BookingId;
            `);

        if (currentResult.recordset.length === 0) {
            const error = new Error("BOOKING_NOT_FOUND");
            error.statusCode = 404;
            throw error;
        }

        const booking = currentResult.recordset[0];

        // Authorization: SALON can manage bookings in its own salon,
        // EMPLOYEE can manage bookings assigned to them, ADMIN can manage all.
        if (role === 'SALON' && Number(booking.OwnerUserId) !== normalizedUserId) {
            const error = new Error("FORBIDDEN");
            error.statusCode = 403;
            throw error;
        }

        if (role === 'EMPLOYEE' && Number(booking.EmployeeUserId) !== normalizedUserId) {
            const error = new Error("FORBIDDEN");
            error.statusCode = 403;
            throw error;
        }

        const validTransition =
            (booking.Status === 'PENDING' && ['CONFIRMED', 'REJECTED'].includes(normalizedStatus)) ||
            (booking.Status === 'CONFIRMED' && normalizedStatus === 'COMPLETED');

        if (!validTransition) {
            const error = new Error("INVALID_STATUS_TRANSITION");
            error.statusCode = 409;
            throw error;
        }

        const updateResult = await transaction
            .request()
            .input("BookingId", sql.Int, normalizedBookingId)
            .input("Status", sql.VarChar(20), normalizedStatus)
            .query(`
                UPDATE Bookings
                SET
                    Status = @Status,
                    UpdatedAt = SYSDATETIME()
                OUTPUT
                    INSERTED.BookingId,
                    INSERTED.UserId,
                    INSERTED.SalonId,
                    INSERTED.ServiceId,
                    INSERTED.EmployeeId,
                    INSERTED.BookingDate,
                    INSERTED.StartTime,
                    INSERTED.EndTime,
                    INSERTED.Status,
                    INSERTED.Note,
                    INSERTED.CreatedAt,
                    INSERTED.UpdatedAt
                WHERE BookingId = @BookingId;
            `);

        await transaction.commit();

        if (normalizedStatus === 'CONFIRMED' || normalizedStatus === 'REJECTED') {
            try {
                const title = normalizedStatus === 'CONFIRMED'
                    ? 'Booking đã được xác nhận'
                    : 'Booking đã bị từ chối';
                const message = normalizedStatus === 'CONFIRMED'
                    ? `Booking #${normalizedBookingId} tại ${booking.SalonName} đã được xác nhận.`
                    : `Booking #${normalizedBookingId} tại ${booking.SalonName} đã bị từ chối. Vui lòng chọn khung giờ khác nếu cần.`;

                await notificationService.createNotification({
                    userId: booking.UserId,
                    title,
                    message,
                    type: normalizedStatus === 'CONFIRMED' ? 'BOOKING_CONFIRMED' : 'BOOKING_REJECTED'
                });
            } catch (notificationError) {
                console.error("Update booking status notification error:", notificationError);
            }
        }

        return {
            booking: updateResult.recordset[0]
        };
    } catch (error) {
        try {
            if (transaction._aborted !== true) {
                await transaction.rollback();
            }
        } catch (rollbackError) {
            console.error("Update booking status rollback error:", rollbackError);
        }

        throw error;
    }
}

module.exports = {
    createBooking,
    getMyBookings,
    getBookingDetail,
    cancelBooking,
    updateBookingStatus
};
