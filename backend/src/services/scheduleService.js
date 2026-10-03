const { poolPromise, sql } = require("../config/database");

/**
 * Chuyển thời gian về số phút tính từ 00:00.
 *
 * Hỗ trợ:
 * - "08:00"
 * - "08:00:00"
 * - Date
 * - Một số kiểu dữ liệu time mà driver SQL Server có thể trả về
 */
function toMinutes(value) {
    if (value == null) {
        return null;
    }

    // SQL Server sau khi CONVERT(varchar(8), ..., 108)
    // sẽ trả về dạng HH:mm:ss.
    if (typeof value === "string") {
        const text = value.trim();

        const match = text.match(
            /^(\d{1,2}):(\d{2})(?::(\d{2}))?/
        );

        if (!match) {
            return null;
        }

        const hour = Number(match[1]);
        const minute = Number(match[2]);
        const second = match[3] !== undefined
            ? Number(match[3])
            : 0;

        if (
            !Number.isInteger(hour) ||
            !Number.isInteger(minute) ||
            !Number.isInteger(second) ||
            hour < 0 ||
            hour > 23 ||
            minute < 0 ||
            minute > 59 ||
            second < 0 ||
            second > 59
        ) {
            return null;
        }

        return hour * 60 + minute;
    }

    // Trường hợp driver trả về Date.
    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) {
            return null;
        }

        return (
            value.getHours() * 60 +
            value.getMinutes()
        );
    }

    // Một số driver có thể trả object có toString().
    try {
        const text = String(value).trim();

        const match = text.match(
            /^(\d{1,2}):(\d{2})(?::(\d{2}))?/
        );

        if (!match) {
            return null;
        }

        const hour = Number(match[1]);
        const minute = Number(match[2]);

        if (
            !Number.isInteger(hour) ||
            !Number.isInteger(minute) ||
            hour < 0 ||
            hour > 23 ||
            minute < 0 ||
            minute > 59
        ) {
            return null;
        }

        return hour * 60 + minute;
    } catch {
        return null;
    }
}

/**
 * Chuyển số phút thành HH:mm.
 *
 * Ví dụ:
 * 480  -> "08:00"
 * 525  -> "08:45"
 */
function timeText(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Kiểm tra và chuyển YYYY-MM-DD thành Date UTC.
 */
function dateOnly(value) {
    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return null;
    }

    const [year, month, day] = value
        .split("-")
        .map(Number);

    const date = new Date(
        Date.UTC(
            year,
            month - 1,
            day
        )
    );

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        return null;
    }

    return date;
}

/**
 * Monday = 1
 * Tuesday = 2
 * Wednesday = 3
 * Thursday = 4
 * Friday = 5
 * Saturday = 6
 * Sunday = 7
 */
function dayOfWeekMondayFirst(date) {
    return ((date.getUTCDay() + 6) % 7) + 1;
}

/**
 * YYYY-MM-DD -> YYYYMMDD
 *
 * Dùng để so sánh ngày mà không bị ảnh hưởng timezone.
 */
function dateKey(date) {
    return (
        date.getUTCFullYear() * 10000 +
        (date.getUTCMonth() + 1) * 100 +
        date.getUTCDate()
    );
}

/**
 * Xác định lý do không có slot.
 */
function getEmptyAvailabilityStatus({
    scheduleCount,
    candidateCount,
    futureCandidateCount,
    blockedCount,
    isToday,
}) {
    if (scheduleCount === 0) {
        return {
            code: "NO_WORKING_SCHEDULE",
            message:
                "Nhân viên không có lịch làm việc vào ngày này.",
        };
    }

    if (candidateCount === 0) {
        return {
            code: "SERVICE_TOO_LONG",
            message:
                "Thời lượng dịch vụ dài hơn thời gian làm việc còn lại trong lịch này.",
        };
    }

    if (
        isToday &&
        futureCandidateCount === 0
    ) {
        return {
            code: "NO_TIME_LEFT_TODAY",
            message:
                "Hôm nay không còn đủ thời gian để thực hiện dịch vụ này. Vui lòng chọn ngày khác.",
        };
    }

    if (
        futureCandidateCount > 0 &&
        blockedCount >= futureCandidateCount
    ) {
        return {
            code: "ALL_SLOTS_BOOKED",
            message:
                "Các khung giờ phù hợp trong ngày này đã được đặt. Vui lòng chọn giờ hoặc ngày khác.",
        };
    }

    return {
        code: "NO_AVAILABLE_SLOT",
        message:
            "Hiện không có khung giờ phù hợp cho ngày này.",
    };
}

/**
 * Lấy thông tin nhân viên.
 */
async function getEmployee(employeeId) {
    const pool = await poolPromise;

    const result = await pool
        .request()
        .input(
            "EmployeeId",
            sql.Int,
            employeeId
        )
        .query(`
            SELECT
                e.EmployeeId,
                e.SalonId,
                e.FullName,
                e.IsActive,
                s.IsActive AS SalonIsActive
            FROM Employees e
            INNER JOIN Salons s
                ON s.SalonId = e.SalonId
            WHERE e.EmployeeId = @EmployeeId;
        `);

    return result.recordset[0] || null;
}

/**
 * Lấy toàn bộ lịch làm việc của nhân viên.
 */
async function getByEmployeeId(employeeId) {
    const employee = await getEmployee(employeeId);

    if (
        !employee ||
        !employee.IsActive ||
        !employee.SalonIsActive
    ) {
        const error = new Error(
            "EMPLOYEE_NOT_FOUND"
        );

        error.code = "EMPLOYEE_NOT_FOUND";

        throw error;
    }

    const pool = await poolPromise;

    const result = await pool
        .request()
        .input(
            "EmployeeId",
            sql.Int,
            employeeId
        )
        .query(`
            SELECT
                ScheduleId,
                EmployeeId,
                DayOfWeek,
                CONVERT(
                    varchar(8),
                    StartTime,
                    108
                ) AS StartTime,
                CONVERT(
                    varchar(8),
                    EndTime,
                    108
                ) AS EndTime,
                IsWorking
            FROM EmployeeSchedules
            WHERE EmployeeId = @EmployeeId
            ORDER BY
                DayOfWeek,
                StartTime;
        `);

    return {
        employee: {
            employeeId:
                employee.EmployeeId,
            fullName:
                employee.FullName,
        },

        schedules:
            result.recordset,
    };
}

/**
 * Lấy các khung giờ trống của nhân viên.
 *
 * Luồng:
 *
 * 1. Validate date
 * 2. Tìm employee
 * 3. Lấy ngày hiện tại từ SQL Server
 * 4. Kiểm tra ngày quá khứ
 * 5. Kiểm tra service
 * 6. Lấy EmployeeSchedules
 * 7. Lấy Bookings
 * 8. Sinh candidate slots
 * 9. Loại slot đã qua nếu là hôm nay
 * 10. Loại slot bị booking chiếm
 * 11. Trả available slots
 */
async function getAvailableSlots({
    employeeId,
    serviceId,
    date,
}) {
    // =========================================================
    // 1. VALIDATE DATE
    // =========================================================

    const selectedDate = dateOnly(date);

    if (!selectedDate) {
        const error = new Error(
            "INVALID_DATE"
        );

        error.code = "INVALID_DATE";

        throw error;
    }

    const dayOfWeek =
        dayOfWeekMondayFirst(
            selectedDate
        );

    const requestedDateKey =
        dateKey(selectedDate);

    const pool = await poolPromise;

    // =========================================================
    // 2. GET EMPLOYEE
    // =========================================================

    const employee =
        await getEmployee(employeeId);

    if (
        !employee ||
        !employee.IsActive ||
        !employee.SalonIsActive
    ) {
        const error = new Error(
            "EMPLOYEE_NOT_FOUND"
        );

        error.code =
            "EMPLOYEE_NOT_FOUND";

        throw error;
    }

    // =========================================================
    // 3. GET CURRENT DATE/TIME FROM SQL SERVER
    // =========================================================

    const nowResult = await pool
        .request()
        .query(`
            SELECT
                CONVERT(
                    varchar(10),
                    CONVERT(date, SYSDATETIME()),
                    23
                ) AS TodayDate,

                CONVERT(
                    varchar(8),
                    CONVERT(time(0), SYSDATETIME()),
                    108
                ) AS CurrentTime;
        `);

    const now =
        nowResult.recordset[0] || {};

    const todayDate =
        dateOnly(now.TodayDate);

    const todayKey = todayDate
        ? dateKey(todayDate)
        : null;

    const currentMinutes =
        toMinutes(
            now.CurrentTime
        );

    // =========================================================
    // 4. CHECK PAST DATE
    // =========================================================

    if (
        todayKey !== null &&
        requestedDateKey < todayKey
    ) {
        const serviceResult =
            await pool
                .request()
                .input(
                    "ServiceId",
                    sql.Int,
                    serviceId
                )
                .input(
                    "SalonId",
                    sql.Int,
                    employee.SalonId
                )
                .query(`
                    SELECT
                        ServiceId,
                        SalonId,
                        ServiceName,
                        Price,
                        DurationMinutes
                    FROM dichvu
                    WHERE ServiceId = @ServiceId
                      AND SalonId = @SalonId
                      AND IsActive = 1;
                `);

        if (
            serviceResult.recordset
                .length === 0
        ) {
            const error = new Error(
                "SERVICE_NOT_FOUND"
            );

            error.code =
                "SERVICE_NOT_FOUND";

            throw error;
        }

        const service =
            serviceResult.recordset[0];

        return {
            employee: {
                employeeId:
                    employee.EmployeeId,
                fullName:
                    employee.FullName,
            },

            service: {
                serviceId:
                    service.ServiceId,
                serviceName:
                    service.ServiceName,
                price:
                    service.Price,
                durationMinutes:
                    Number(
                        service.DurationMinutes
                    ),
            },

            date,
            dayOfWeek,

            availabilityStatus:
                "PAST_DATE",

            availabilityMessage:
                "Ngày đã chọn đã qua. Vui lòng chọn ngày khác.",

            slots: [],
        };
    }

    // =========================================================
    // 5. GET SERVICE
    // =========================================================

    const serviceResult =
        await pool
            .request()
            .input(
                "ServiceId",
                sql.Int,
                serviceId
            )
            .input(
                "SalonId",
                sql.Int,
                employee.SalonId
            )
            .query(`
                SELECT
                    ServiceId,
                    SalonId,
                    ServiceName,
                    Price,
                    DurationMinutes
                FROM dichvu
                WHERE ServiceId = @ServiceId
                  AND SalonId = @SalonId
                  AND IsActive = 1;
            `);

    if (
        serviceResult.recordset.length === 0
    ) {
        const error = new Error(
            "SERVICE_NOT_FOUND"
        );

        error.code =
            "SERVICE_NOT_FOUND";

        throw error;
    }

    const service =
        serviceResult.recordset[0];

    const duration =
        Number(
            service.DurationMinutes
        );

    if (
        !Number.isInteger(duration) ||
        duration <= 0
    ) {
        const error = new Error(
            "INVALID_SERVICE_DURATION"
        );

        error.code =
            "INVALID_SERVICE_DURATION";

        throw error;
    }

    // =========================================================
    // 6. GET EMPLOYEE SCHEDULE
    //
    // QUAN TRỌNG:
    // CONVERT(time -> varchar(8))
    // để Node.js nhận chắc chắn:
    //
    // "08:00:00"
    // "17:00:00"
    // =========================================================

    const scheduleResult =
        await pool
            .request()
            .input(
                "EmployeeId",
                sql.Int,
                employeeId
            )
            .input(
                "DayOfWeek",
                sql.TinyInt,
                dayOfWeek
            )
            .query(`
                SELECT
                    CONVERT(
                        varchar(8),
                        StartTime,
                        108
                    ) AS StartTime,

                    CONVERT(
                        varchar(8),
                        EndTime,
                        108
                    ) AS EndTime

                FROM EmployeeSchedules

                WHERE EmployeeId = @EmployeeId
                  AND DayOfWeek = @DayOfWeek
                  AND IsWorking = 1
                  AND StartTime < EndTime

                ORDER BY StartTime;
            `);

    // =========================================================
    // 7. GET BOOKINGS
    //
    // Chỉ booking đang chiếm lịch mới được tính:
    //
    // PENDING
    // CONFIRMED
    // COMPLETED
    // =========================================================

    const bookingResult =
        await pool
            .request()
            .input(
                "EmployeeId",
                sql.Int,
                employeeId
            )
            .input(
                "BookingDate",
                sql.Date,
                date
            )
            .query(`
                SELECT
                    CONVERT(
                        varchar(8),
                        StartTime,
                        108
                    ) AS StartTime,

                    CONVERT(
                        varchar(8),
                        EndTime,
                        108
                    ) AS EndTime

                FROM Bookings

                WHERE EmployeeId = @EmployeeId
                  AND BookingDate = @BookingDate
                  AND Status IN (
                      'PENDING',
                      'CONFIRMED',
                      'COMPLETED'
                  );
            `);

    const bookings =
        bookingResult.recordset
            .map((booking) => ({
                start:
                    toMinutes(
                        booking.StartTime
                    ),

                end:
                    toMinutes(
                        booking.EndTime
                    ),
            }))
            .filter(
                (booking) =>
                    booking.start !== null &&
                    booking.end !== null &&
                    booking.start < booking.end
            );

    // =========================================================
    // 8. GENERATE CANDIDATE SLOTS
    //
    // Mỗi 30 phút sinh một slot.
    //
    // Ví dụ:
    //
    // Schedule: 08:00 -> 17:00
    // Service: 45 phút
    //
    // => 08:00 -> 08:45
    // => 08:30 -> 09:15
    // => 09:00 -> 09:45
    // ...
    // => 16:15 -> 17:00
    // =========================================================

    const isToday =
        todayKey !== null &&
        requestedDateKey === todayKey;

    const candidateSlots = [];
    const futureCandidateSlots = [];

    for (
        const schedule
        of scheduleResult.recordset
    ) {
        const scheduleStart =
            toMinutes(
                schedule.StartTime
            );

        const scheduleEnd =
            toMinutes(
                schedule.EndTime
            );

        // Diagnostic khi dữ liệu thời gian không hợp lệ.
        if (
            scheduleStart === null ||
            scheduleEnd === null ||
            scheduleStart >= scheduleEnd
        ) {
            if (
                process.env.NODE_ENV !==
                "production"
            ) {
                console.warn(
                    "⚠️ Invalid employee schedule:",
                    {
                        employeeId,
                        dayOfWeek,
                        startTime:
                            schedule.StartTime,
                        endTime:
                            schedule.EndTime,
                    }
                );
            }

            continue;
        }

        for (
            let start =
                scheduleStart;

            start + duration <=
                scheduleEnd;

            start += 30
        ) {
            const end =
                start + duration;

            const candidate = {
                start,
                end,
            };

            candidateSlots.push(
                candidate
            );

            /**
             * Nếu là ngày hôm nay:
             * chỉ lấy slot có thời gian bắt đầu
             * lớn hơn thời gian hiện tại.
             *
             * Nếu là ngày tương lai:
             * lấy toàn bộ candidate.
             */
            if (
                !isToday ||
                currentMinutes === null ||
                start > currentMinutes
            ) {
                futureCandidateSlots.push(
                    candidate
                );
            }
        }
    }

    // =========================================================
    // 9. REMOVE BOOKED SLOTS
    // =========================================================

    const slots = [];

    let blockedCount = 0;

    for (
        const candidate
        of futureCandidateSlots
    ) {
        const overlapsBooking =
            bookings.some(
                (booking) =>
                    candidate.start <
                        booking.end &&
                    candidate.end >
                        booking.start
            );

        if (overlapsBooking) {
            blockedCount += 1;
            continue;
        }

        slots.push({
            startTime:
                timeText(
                    candidate.start
                ),

            endTime:
                timeText(
                    candidate.end
                ),

            durationMinutes:
                duration,

            available: true,
        });
    }

    // =========================================================
    // 10. DETERMINE AVAILABILITY STATUS
    // =========================================================

    let availabilityStatus =
        "AVAILABLE";

    let availabilityMessage =
        "Có khung giờ trống.";

    if (slots.length === 0) {
        const emptyAvailabilityStatus =
            getEmptyAvailabilityStatus({
                scheduleCount:
                    scheduleResult.recordset
                        .length,

                candidateCount:
                    candidateSlots.length,

                futureCandidateCount:
                    futureCandidateSlots
                        .length,

                blockedCount,

                isToday,
            });

        availabilityStatus =
            emptyAvailabilityStatus.code;

        availabilityMessage =
            emptyAvailabilityStatus.message;
    }

    // =========================================================
    // 11. DEBUG DIAGNOSTIC
    // =========================================================

    if (
        process.env.NODE_ENV !==
        "production"
    ) {
        console.log(
            "🕐 Available slots diagnostic:",
            {
                employeeId,
                serviceId,
                date,
                dayOfWeek,

                scheduleCount:
                    scheduleResult
                        .recordset.length,

                bookingCount:
                    bookings.length,

                candidateCount:
                    candidateSlots.length,

                futureCandidateCount:
                    futureCandidateSlots.length,

                blockedCount,

                slotCount:
                    slots.length,

                availabilityStatus,

                availabilityMessage,

                currentMinutes,

                schedules:
                    scheduleResult.recordset,

                bookings,
            }
        );
    }

    // =========================================================
    // 12. RETURN RESPONSE
    // =========================================================

    return {
        employee: {
            employeeId:
                employee.EmployeeId,

            fullName:
                employee.FullName,
        },

        service: {
            serviceId:
                service.ServiceId,

            serviceName:
                service.ServiceName,

            price:
                service.Price,

            durationMinutes:
                duration,
        },

        date,

        dayOfWeek,

        availabilityStatus,

        availabilityMessage,

        slots,
    };
}

module.exports = {
    getByEmployeeId,
    getAvailableSlots,
};