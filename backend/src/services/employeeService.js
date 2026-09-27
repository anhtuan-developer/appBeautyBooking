const { poolPromise, sql } = require("../config/database");

async function getBySalonId(salonId) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("SalonId", sql.Int, salonId)
        .query(`
            SELECT
                EmployeeId,
                SalonId,
                UserId,
                FullName,
                Phone,
                AvatarUrl,
                Specialization,
                IsActive,
                CreatedAt
            FROM Employees
            WHERE SalonId = @SalonId
              AND IsActive = 1
            ORDER BY EmployeeId;
        `);
    return result.recordset;
}

async function getById(employeeId) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("EmployeeId", sql.Int, employeeId)
        .query(`
            SELECT
                EmployeeId,
                SalonId,
                UserId,
                FullName,
                Phone,
                AvatarUrl,
                Specialization,
                IsActive,
                CreatedAt
            FROM Employees
            WHERE EmployeeId = @EmployeeId
              AND IsActive = 1;
        `);
    return result.recordset[0] || null;
}

module.exports = { getBySalonId, getById };
