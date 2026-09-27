const { poolPromise, sql } = require("../config/database");

function toMinutes(value) {
    if (value == null) return null;
    const text = String(value);
    const match = text.match(/^(\d{1,2}):(\d{2})/);
    if (!match) return null;
    return Number(match[1]) * 60 + Number(match[2]);
}

function timeText(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function dateOnly(value) {
    // Không dùng new Date("YYYY-MM-DDT00:00:00") + toISOString()
    // vì timezone có thể làm ngày bị lùi 1 ngày.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return null;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    // Kiểm tra ngày thực sự tồn tại, ví dụ 2026-02-30 phải bị từ chối.
    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        return null;
    }

    return date;
}

function dayOfWeekMondayFirst(date) {
    return ((date.getUTCDay() + 6) % 7) + 1;
}

async function getByEmployeeId(employeeId) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("EmployeeId", sql.Int, employeeId)
        .query(`
            SELECT
                ScheduleId,
                EmployeeId,
                DayOfWeek,
                StartTime,
                EndTime,
                IsWorking
            FROM EmployeeSchedules
            WHERE EmployeeId = @EmployeeId
              AND IsWorking = 1
            ORDER BY DayOfWeek, StartTime;
        `);
    return result.recordset;
}

async function getAvailableSlots({ employeeId, serviceId, date }) {
    const selectedDate = dateOnly(date);
    if (!selectedDate) {
        const error = new Error("INVALID_DATE");
        error.code = "INVALID_DATE";
        throw error;
    }

    const dayOfWeek = dayOfWeekMondayFirst(selectedDate);
    const pool = await poolPromise;

    const employeeResult = await pool.request()
        .input("EmployeeId", sql.Int, employeeId)
        .query(`
            SELECT EmployeeId, SalonId, FullName
            FROM Employees
            WHERE EmployeeId = @EmployeeId
              AND IsActive = 1;
        `);

    if (employeeResult.recordset.length === 0) {
        const error = new Error("EMPLOYEE_NOT_FOUND");
        error.code = "EMPLOYEE_NOT_FOUND";
        throw error;
    }

    const employee = employeeResult.recordset[0];

    const serviceResult = await pool.request()
        .input("ServiceId", sql.Int, serviceId)
        .input("SalonId", sql.Int, employee.SalonId)
        .query(`
            SELECT ServiceId, SalonId, ServiceName, Price, DurationMinutes
            FROM dichvu
            WHERE ServiceId = @ServiceId
              AND SalonId = @SalonId
              AND IsActive = 1;
        `);

    if (serviceResult.recordset.length === 0) {
        const error = new Error("SERVICE_NOT_FOUND");
        error.code = "SERVICE_NOT_FOUND";
        throw error;
    }

    const service = serviceResult.recordset[0];
    const duration = Number(service.DurationMinutes);

    const scheduleResult = await pool.request()
        .input("EmployeeId", sql.Int, employeeId)
        .input("DayOfWeek", sql.TinyInt, dayOfWeek)
        .query(`
            SELECT StartTime, EndTime
            FROM EmployeeSchedules
            WHERE EmployeeId = @EmployeeId
              AND DayOfWeek = @DayOfWeek
              AND IsWorking = 1
            ORDER BY StartTime;
        `);

    const bookingResult = await pool.request()
        .input("EmployeeId", sql.Int, employeeId)
        .input("BookingDate", sql.Date, date)
        .query(`
            SELECT StartTime, EndTime, Status
            FROM Bookings
            WHERE EmployeeId = @EmployeeId
              AND BookingDate = @BookingDate
              AND Status NOT IN ('CANCELLED', 'REJECTED');
        `);

    const bookings = bookingResult.recordset
        .map((booking) => ({
            start: toMinutes(booking.StartTime),
            end: toMinutes(booking.EndTime)
        }))
        .filter((booking) => booking.start !== null && booking.end !== null);

    const slots = [];

    for (const schedule of scheduleResult.recordset) {
        const scheduleStart = toMinutes(schedule.StartTime);
        const scheduleEnd = toMinutes(schedule.EndTime);

        if (scheduleStart === null || scheduleEnd === null || scheduleStart >= scheduleEnd) {
            continue;
        }

        for (let start = scheduleStart; start + duration <= scheduleEnd; start += 30) {
            const end = start + duration;

            const overlapsBooking = bookings.some((booking) =>
                start < booking.end && end > booking.start
            );

            if (!overlapsBooking) {
                slots.push({
                    startTime: timeText(start),
                    endTime: timeText(end),
                    durationMinutes: duration
                });
            }
        }
    }

    return {
        employee: {
            employeeId: employee.EmployeeId,
            fullName: employee.FullName
        },
        service: {
            serviceId: service.ServiceId,
            serviceName: service.ServiceName,
            price: service.Price,
            durationMinutes: duration
        },
        date,
        dayOfWeek,
        slots
    };
}

module.exports = {
    getByEmployeeId,
    getAvailableSlots
};
