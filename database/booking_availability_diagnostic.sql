USE BeautyBooking;
GO

/*
  Kiểm tra dữ liệu khiến available-slots có thể trả []
  Ví dụ: EmployeeId = 1, ngày = 2026-10-05
*/

DECLARE @EmployeeId INT = 1;
DECLARE @BookingDate DATE = '2026-10-05';
DECLARE @ServiceId INT = 5;

SELECT
    @EmployeeId AS EmployeeId,
    @ServiceId AS ServiceId,
    @BookingDate AS BookingDate,
    ((DATEPART(WEEKDAY, @BookingDate) + @@DATEFIRST - 2) % 7) + 1 AS DayOfWeekMondayFirst;

SELECT
    e.EmployeeId,
    e.SalonId,
    e.FullName,
    e.IsActive AS EmployeeIsActive,
    s.IsActive AS SalonIsActive
FROM Employees e
INNER JOIN Salons s ON s.SalonId = e.SalonId
WHERE e.EmployeeId = @EmployeeId;

SELECT
    ServiceId,
    SalonId,
    ServiceName,
    Price,
    DurationMinutes,
    IsActive
FROM dichvu
WHERE ServiceId = @ServiceId;

SELECT
    ScheduleId,
    EmployeeId,
    DayOfWeek,
    StartTime,
    EndTime,
    IsWorking
FROM EmployeeSchedules
WHERE EmployeeId = @EmployeeId
ORDER BY DayOfWeek, StartTime;

SELECT
    BookingId,
    EmployeeId,
    ServiceId,
    BookingDate,
    StartTime,
    EndTime,
    Status
FROM Bookings
WHERE EmployeeId = @EmployeeId
  AND BookingDate = @BookingDate
ORDER BY StartTime;
GO
