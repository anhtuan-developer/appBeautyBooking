const { poolPromise, sql } = require("../config/database");

async function ensureSalonActive(salonId) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("SalonId", sql.Int, salonId)
        .query(`
            SELECT SalonId
            FROM Salons
            WHERE SalonId = @SalonId
              AND IsActive = 1;
        `);
    return result.recordset.length > 0;
}

async function getBySalonId({ salonId, search = "", page = 1, limit = 10 }) {
    if (!(await ensureSalonActive(salonId))) {
        const error = new Error("SALON_NOT_FOUND");
        error.code = "SALON_NOT_FOUND";
        throw error;
    }

    const offset = (page - 1) * limit;
    const pool = await poolPromise;
    const result = await pool.request()
        .input("SalonId", sql.Int, salonId)
        .input("Search", sql.NVarChar(100), search)
        .input("Offset", sql.Int, offset)
        .input("Limit", sql.Int, limit)
        .query(`
            SELECT
                EmployeeId,
                SalonId,
                FullName,
                Phone,
                AvatarUrl,
                Specialization,
                IsActive,
                CreatedAt
            FROM Employees
            WHERE SalonId = @SalonId
              AND IsActive = 1
              AND (
                    @Search = N''
                    OR FullName LIKE N'%' + @Search + N'%'
                    OR ISNULL(Specialization, N'') LIKE N'%' + @Search + N'%'
                  )
            ORDER BY EmployeeId
            OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;

            SELECT COUNT(*) AS Total
            FROM Employees
            WHERE SalonId = @SalonId
              AND IsActive = 1
              AND (
                    @Search = N''
                    OR FullName LIKE N'%' + @Search + N'%'
                    OR ISNULL(Specialization, N'') LIKE N'%' + @Search + N'%'
                  );
        `);

    return {
        items: result.recordsets[0],
        pagination: {
            page,
            limit,
            total: result.recordsets[1][0].Total,
            totalPages: Math.ceil(result.recordsets[1][0].Total / limit)
        }
    };
}

async function getById(employeeId) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("EmployeeId", sql.Int, employeeId)
        .query(`
            SELECT
                e.EmployeeId,
                e.SalonId,
                e.FullName,
                e.Phone,
                e.AvatarUrl,
                e.Specialization,
                e.IsActive,
                e.CreatedAt,
                s.SalonName
            FROM Employees e
            INNER JOIN Salons s ON s.SalonId = e.SalonId
            WHERE e.EmployeeId = @EmployeeId
              AND e.IsActive = 1
              AND s.IsActive = 1;
        `);
    return result.recordset[0] || null;
}

module.exports = { getBySalonId, getById, ensureSalonActive };
