const { poolPromise, sql } = require("../config/database");

function normalizePagination(page = 1, limit = 10) {
    const safePage = Number.isInteger(Number(page)) && Number(page) > 0 ? Number(page) : 1;
    const safeLimit = Number.isInteger(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 50) : 10;
    return { page: safePage, limit: safeLimit, offset: (safePage - 1) * safeLimit };
}

async function getAll({ search = "", page = 1, limit = 10 } = {}) {
    const pool = await poolPromise;
    const pagination = normalizePagination(page, limit);
    const keyword = String(search || "").trim();

    const request = pool.request()
        .input("Search", sql.NVarChar(255), `%${keyword}%`)
        .input("Offset", sql.Int, pagination.offset)
        .input("Limit", sql.Int, pagination.limit);

    const result = await request.query(`
        SELECT
            s.SalonId,
            s.SalonName,
            s.Address,
            s.Phone,
            s.Description,
            s.ImageUrl,
            s.Latitude,
            s.Longitude,
            s.CreatedAt,
            COUNT(DISTINCT sv.ServiceId) AS ServiceCount,
            COUNT(DISTINCT e.EmployeeId) AS EmployeeCount,
            COUNT(DISTINCT r.ReviewId) AS ReviewCount,
            CAST(COALESCE(AVG(CAST(r.Rating AS DECIMAL(10,2))), 0) AS DECIMAL(10,2)) AS AverageRating
        FROM Salons s
        LEFT JOIN dichvu sv ON sv.SalonId = s.SalonId AND sv.IsActive = 1
        LEFT JOIN Employees e ON e.SalonId = s.SalonId AND e.IsActive = 1
        LEFT JOIN Reviews r ON r.SalonId = s.SalonId
        WHERE s.IsActive = 1
          AND (
                @Search = '%%'
                OR s.SalonName LIKE @Search
                OR s.Address LIKE @Search
          )
        GROUP BY
            s.SalonId, s.SalonName, s.Address, s.Phone, s.Description,
            s.ImageUrl, s.Latitude, s.Longitude, s.CreatedAt
        ORDER BY s.SalonId DESC
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;

        SELECT COUNT(*) AS Total
        FROM Salons s
        WHERE s.IsActive = 1
          AND (
                @Search = '%%'
                OR s.SalonName LIKE @Search
                OR s.Address LIKE @Search
          );
    `);

    const total = result.recordsets[1][0].Total;
    return {
        items: result.recordsets[0],
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            totalPages: Math.ceil(total / pagination.limit)
        }
    };
}

async function getById(salonId) {
    const pool = await poolPromise;
    const request = pool.request().input("SalonId", sql.Int, salonId);

    const result = await request.query(`
        SELECT
            s.SalonId,
            s.OwnerUserId,
            s.SalonName,
            s.Address,
            s.Phone,
            s.Description,
            s.ImageUrl,
            s.Latitude,
            s.Longitude,
            s.IsActive,
            s.CreatedAt,
            COUNT(r.ReviewId) AS ReviewCount,
            CAST(COALESCE(AVG(CAST(r.Rating AS DECIMAL(10,2))), 0) AS DECIMAL(10,2)) AS AverageRating
        FROM Salons s
        LEFT JOIN Reviews r ON r.SalonId = s.SalonId
        WHERE s.SalonId = @SalonId
          AND s.IsActive = 1
        GROUP BY
            s.SalonId, s.OwnerUserId, s.SalonName, s.Address, s.Phone,
            s.Description, s.ImageUrl, s.Latitude, s.Longitude,
            s.IsActive, s.CreatedAt;

        SELECT
            ServiceId, SalonId, ServiceName, Description,
            Price, DurationMinutes, ImageUrl, CreatedAt
        FROM dichvu
        WHERE SalonId = @SalonId AND IsActive = 1
        ORDER BY ServiceId;

        SELECT
            EmployeeId, SalonId, FullName, Phone,
            AvatarUrl, Specialization, CreatedAt
        FROM Employees
        WHERE SalonId = @SalonId AND IsActive = 1
        ORDER BY EmployeeId;
    `);

    if (!result.recordsets[0][0]) return null;

    return {
        ...result.recordsets[0][0],
        services: result.recordsets[1],
        employees: result.recordsets[2]
    };
}

async function getServices(salonId) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("SalonId", sql.Int, salonId)
        .query(`
            SELECT ServiceId, SalonId, ServiceName, Description,
                   Price, DurationMinutes, ImageUrl, CreatedAt
            FROM dichvu
            WHERE SalonId = @SalonId AND IsActive = 1
            ORDER BY ServiceId;
        `);
    return result.recordset;
}

async function getEmployees(salonId) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("SalonId", sql.Int, salonId)
        .query(`
            SELECT EmployeeId, SalonId, FullName, Phone,
                   AvatarUrl, Specialization, CreatedAt
            FROM Employees
            WHERE SalonId = @SalonId AND IsActive = 1
            ORDER BY EmployeeId;
        `);
    return result.recordset;
}

module.exports = { getAll, getById, getServices, getEmployees };
