const { poolPromise, sql } = require("../config/database");

function normalizePagination(page = 1, limit = 10) {
    const safePage = Number(page);
    const safeLimit = Number(limit);

    return {
        page: Number.isInteger(safePage) && safePage > 0 ? safePage : 1,
        limit: Number.isInteger(safeLimit) && safeLimit > 0 ? Math.min(safeLimit, 50) : 10
    };
}

async function getAll({ search = "", salonId = null, page = 1, limit = 10 } = {}) {
    const pool = await poolPromise;
    const pagination = normalizePagination(page, limit);
    const keyword = String(search || "").trim();

    const request = pool.request()
        .input("Search", sql.NVarChar(150), `%${keyword}%`)
        .input("SalonId", sql.Int, salonId)
        .input("Offset", sql.Int, (pagination.page - 1) * pagination.limit)
        .input("Limit", sql.Int, pagination.limit);

    const result = await request.query(`
        SELECT
            sv.ServiceId,
            sv.SalonId,
            s.SalonName,
            sv.ServiceName,
            sv.Description,
            sv.Price,
            sv.DurationMinutes,
            sv.ImageUrl,
            sv.CreatedAt
        FROM dichvu sv
        INNER JOIN Salons s ON s.SalonId = sv.SalonId
        WHERE sv.IsActive = 1
          AND s.IsActive = 1
          AND (@SalonId IS NULL OR sv.SalonId = @SalonId)
          AND (
                @Search = '%%'
                OR sv.ServiceName LIKE @Search
                OR sv.Description LIKE @Search
          )
        ORDER BY sv.ServiceId DESC
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;

        SELECT COUNT(*) AS Total
        FROM dichvu sv
        INNER JOIN Salons s ON s.SalonId = sv.SalonId
        WHERE sv.IsActive = 1
          AND s.IsActive = 1
          AND (@SalonId IS NULL OR sv.SalonId = @SalonId)
          AND (
                @Search = '%%'
                OR sv.ServiceName LIKE @Search
                OR sv.Description LIKE @Search
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

async function getBySalonId(salonId) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("SalonId", sql.Int, salonId)
        .query(`
            SELECT
                sv.ServiceId,
                sv.SalonId,
                s.SalonName,
                sv.ServiceName,
                sv.Description,
                sv.Price,
                sv.DurationMinutes,
                sv.ImageUrl,
                sv.CreatedAt
            FROM dichvu sv
            INNER JOIN Salons s ON s.SalonId = sv.SalonId
            WHERE sv.SalonId = @SalonId
              AND sv.IsActive = 1
              AND s.IsActive = 1
            ORDER BY sv.ServiceId DESC;
        `);

    return result.recordset;
}

async function getById(serviceId, expectedSalonId = null) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("ServiceId", sql.Int, serviceId)
        .input("ExpectedSalonId", sql.Int, expectedSalonId)
        .query(`
            SELECT
                sv.ServiceId,
                sv.SalonId,
                s.SalonName,
                sv.ServiceName,
                sv.Description,
                sv.Price,
                sv.DurationMinutes,
                sv.ImageUrl,
                sv.CreatedAt
            FROM dichvu sv
            INNER JOIN Salons s ON s.SalonId = sv.SalonId
            WHERE sv.ServiceId = @ServiceId
              AND sv.IsActive = 1
              AND s.IsActive = 1
              AND (@ExpectedSalonId IS NULL OR sv.SalonId = @ExpectedSalonId);
        `);

    return result.recordset[0] || null;
}

async function salonExists(salonId) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("SalonId", sql.Int, salonId)
        .query(`
            SELECT TOP 1 SalonId
            FROM Salons
            WHERE SalonId = @SalonId
              AND IsActive = 1;
        `);

    return result.recordset.length > 0;
}

module.exports = {
    getAll,
    getBySalonId,
    getById,
    salonExists
};
