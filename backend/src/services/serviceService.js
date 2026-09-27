const { poolPromise, sql } = require("../config/database");

async function getBySalonId(salonId) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("SalonId", sql.Int, salonId)
        .query(`
            SELECT
                ServiceId,
                SalonId,
                ServiceName,
                Description,
                Price,
                DurationMinutes,
                ImageUrl,
                IsActive,
                CreatedAt
            FROM dichvu
            WHERE SalonId = @SalonId
              AND IsActive = 1
            ORDER BY ServiceId;
        `);
    return result.recordset;
}

async function getById(serviceId) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("ServiceId", sql.Int, serviceId)
        .query(`
            SELECT
                ServiceId,
                SalonId,
                ServiceName,
                Description,
                Price,
                DurationMinutes,
                ImageUrl,
                IsActive,
                CreatedAt
            FROM dichvu
            WHERE ServiceId = @ServiceId
              AND IsActive = 1;
        `);
    return result.recordset[0] || null;
}

module.exports = { getBySalonId, getById };
