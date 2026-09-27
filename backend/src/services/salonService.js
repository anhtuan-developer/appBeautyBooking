const { poolPromise } = require("../config/database");

async function getAll() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT
            SalonId,
            OwnerUserId,
            SalonName,
            Address,
            Phone,
            Description,
            ImageUrl,
            Latitude,
            Longitude,
            IsActive,
            CreatedAt
        FROM Salons
        WHERE IsActive = 1
        ORDER BY SalonId DESC;
    `);
    return result.recordset;
}

async function getById(salonId) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("SalonId", require("../config/database").sql.Int, salonId)
        .query(`
            SELECT
                SalonId,
                OwnerUserId,
                SalonName,
                Address,
                Phone,
                Description,
                ImageUrl,
                Latitude,
                Longitude,
                IsActive,
                CreatedAt
            FROM Salons
            WHERE SalonId = @SalonId
              AND IsActive = 1;
        `);
    return result.recordset[0] || null;
}

module.exports = { getAll, getById };
