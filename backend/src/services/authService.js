const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { poolPromise, sql } = require("../config/database");

function publicUser(user) {
    return {
        userId: user.UserId,
        fullName: user.FullName,
        email: user.Email,
        phone: user.Phone,
        role: user.Role,
        isActive: Boolean(user.IsActive),
        createdAt: user.CreatedAt
    };
}

async function register({ fullName, email, phone, password }) {
    const pool = await poolPromise;
    const existingUser = await pool.request()
        .input("Email", sql.VarChar(255), email)
        .query("SELECT UserId FROM Users WHERE Email = @Email;");

    if (existingUser.recordset.length > 0) throw new Error("EMAIL_EXISTS");

    const passwordHash = await bcrypt.hash(password, 12);
    try {
        const result = await pool.request()
            .input("FullName", sql.NVarChar(100), fullName)
            .input("Email", sql.VarChar(255), email)
            .input("Phone", sql.VarChar(20), phone)
            .input("PasswordHash", sql.VarChar(255), passwordHash)
            .query(`
                INSERT INTO Users (FullName, Email, Phone, PasswordHash, Role, IsActive)
                OUTPUT INSERTED.UserId, INSERTED.FullName, INSERTED.Email, INSERTED.Phone,
                       INSERTED.Role, INSERTED.IsActive, INSERTED.CreatedAt
                VALUES (@FullName, @Email, @Phone, @PasswordHash, 'CUSTOMER', 1);
            `);
        return publicUser(result.recordset[0]);
    } catch (error) {
        if (error.number === 2601 || error.number === 2627) throw new Error("EMAIL_EXISTS");
        throw error;
    }
}

async function login({ email, password }) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("Email", sql.VarChar(255), email)
        .query(`
            SELECT UserId, FullName, Email, Phone, PasswordHash, Role, IsActive, CreatedAt
            FROM Users WHERE Email = @Email;
        `);

    if (result.recordset.length === 0) throw new Error("INVALID_LOGIN");
    const user = result.recordset[0];
    if (!user.IsActive) throw new Error("ACCOUNT_DISABLED");
    if (!String(user.PasswordHash).startsWith("$2")) throw new Error("INVALID_LOGIN");

    const passwordValid = await bcrypt.compare(password, user.PasswordHash);
    if (!passwordValid) throw new Error("INVALID_LOGIN");
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET_MISSING");

    const token = jwt.sign(
        { userId: user.UserId, email: user.Email, role: user.Role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return { accessToken: token, user: publicUser(user) };
}

async function getCurrentUser(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("UserId", sql.Int, userId)
        .query(`
            SELECT UserId, FullName, Email, Phone, Role, IsActive, CreatedAt
            FROM Users WHERE UserId = @UserId;
        `);

    if (result.recordset.length === 0) throw new Error("USER_NOT_FOUND");
    if (!result.recordset[0].IsActive) throw new Error("ACCOUNT_DISABLED");
    return publicUser(result.recordset[0]);
}

async function getActiveUserForToken(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("UserId", sql.Int, userId)
        .query("SELECT UserId, Email, Role, IsActive FROM Users WHERE UserId = @UserId;");
    if (result.recordset.length === 0) throw new Error("USER_NOT_FOUND");
    if (!result.recordset[0].IsActive) throw new Error("ACCOUNT_DISABLED");
    return result.recordset[0];
}

async function updateProfile(userId, { fullName, phone }) {
    const pool = await poolPromise;
    const request = pool.request().input("UserId", sql.Int, userId);
    const setParts = [];

    if (fullName !== undefined) {
        request.input("FullName", sql.NVarChar(100), fullName);
        setParts.push("FullName = @FullName");
    }
    if (phone !== undefined) {
        request.input("Phone", sql.VarChar(20), phone);
        setParts.push("Phone = @Phone");
    }

    const result = await request.query(`
        UPDATE Users SET ${setParts.join(", ")}
        WHERE UserId = @UserId AND IsActive = 1;

        SELECT UserId, FullName, Email, Phone, Role, IsActive, CreatedAt
        FROM Users WHERE UserId = @UserId;
    `);

    if (result.recordsets[1].length === 0) throw new Error("USER_NOT_FOUND");
    if (!result.recordsets[1][0].IsActive) throw new Error("ACCOUNT_DISABLED");
    return publicUser(result.recordsets[1][0]);
}

async function changePassword(userId, currentPassword, newPassword) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("UserId", sql.Int, userId)
        .query("SELECT UserId, PasswordHash, IsActive FROM Users WHERE UserId = @UserId;");

    if (result.recordset.length === 0) throw new Error("USER_NOT_FOUND");
    const user = result.recordset[0];
    if (!user.IsActive) throw new Error("ACCOUNT_DISABLED");
    if (!String(user.PasswordHash).startsWith("$2")) throw new Error("INVALID_PASSWORD_HASH");

    const valid = await bcrypt.compare(currentPassword, user.PasswordHash);
    if (!valid) throw new Error("INVALID_CURRENT_PASSWORD");

    const newHash = await bcrypt.hash(newPassword, 12);
    await pool.request()
        .input("UserId", sql.Int, userId)
        .input("PasswordHash", sql.VarChar(255), newHash)
        .query("UPDATE Users SET PasswordHash = @PasswordHash WHERE UserId = @UserId AND IsActive = 1;");
}

module.exports = {
    register,
    login,
    getCurrentUser,
    getActiveUserForToken,
    updateProfile,
    changePassword
};
