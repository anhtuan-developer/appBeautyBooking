const { poolPromise, sql } = require("../config/database");

function normalizeId(value) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) return null;
    return id;
}

function normalizeNotification(notification) {
    if (!notification) return null;

    return {
        notificationId: notification.NotificationId,
        userId: notification.UserId,
        title: notification.Title,
        message: notification.Message,
        type: notification.Type,
        isRead: Boolean(notification.IsRead),
        createdAt: notification.CreatedAt
    };
}

async function createNotification({ userId, title, message, type }) {
    const normalizedUserId = normalizeId(userId);
    if (!normalizedUserId) {
        const error = new Error("INVALID_ID");
        error.statusCode = 400;
        throw error;
    }

    const normalizedTitle = String(title || "").trim();
    const normalizedMessage = String(message || "").trim();
    const normalizedType = String(type || "SYSTEM").trim();

    if (!normalizedTitle || !normalizedMessage) {
        const error = new Error("INVALID_NOTIFICATION");
        error.statusCode = 400;
        throw error;
    }

    if (normalizedTitle.length > 200 || normalizedMessage.length > 1000 || normalizedType.length > 50) {
        const error = new Error("NOTIFICATION_TOO_LONG");
        error.statusCode = 400;
        throw error;
    }

    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("UserId", sql.Int, normalizedUserId)
        .input("Title", sql.NVarChar(200), normalizedTitle)
        .input("Message", sql.NVarChar(1000), normalizedMessage)
        .input("Type", sql.VarChar(50), normalizedType)
        .query(`
            INSERT INTO Notifications
            (
                UserId,
                Title,
                Message,
                Type,
                IsRead
            )
            OUTPUT
                INSERTED.NotificationId,
                INSERTED.UserId,
                INSERTED.Title,
                INSERTED.Message,
                INSERTED.Type,
                INSERTED.IsRead,
                INSERTED.CreatedAt
            VALUES
            (
                @UserId,
                @Title,
                @Message,
                @Type,
                0
            );
        `);

    return normalizeNotification(result.recordset[0]);
}

async function createNotifications(notifications) {
    if (!Array.isArray(notifications) || notifications.length === 0) {
        return [];
    }

    // Dedupe by user + type + message so a user is not notified twice when,
    // for example, the employee is also the salon owner.
    const unique = [];
    const seen = new Set();

    for (const notification of notifications) {
        const userId = normalizeId(notification.userId);
        if (!userId) continue;

        const key = `${userId}|${notification.type}|${notification.message}`;
        if (seen.has(key)) continue;

        seen.add(key);
        unique.push({ ...notification, userId });
    }

    const created = [];
    for (const notification of unique) {
        created.push(await createNotification(notification));
    }

    return created;
}

async function getMyNotifications(userId, { unreadOnly = false, page = 1, limit = 20 } = {}) {
    const normalizedUserId = normalizeId(userId);
    const normalizedPage = Number(page);
    const normalizedLimit = Number(limit);
    if (!normalizedUserId) {
        const error = new Error("INVALID_ID");
        error.statusCode = 400;
        throw error;
    }
    if (!Number.isInteger(normalizedPage) || normalizedPage < 1 ||
        !Number.isInteger(normalizedLimit) || normalizedLimit < 1 || normalizedLimit > 50) {
        const error = new Error("INVALID_PAGINATION");
        error.statusCode = 400;
        throw error;
    }

    const pool = await poolPromise;
    const offset = (normalizedPage - 1) * normalizedLimit;
    const request = pool.request()
        .input("UserId", sql.Int, normalizedUserId)
        .input("Offset", sql.Int, offset)
        .input("Limit", sql.Int, normalizedLimit);

    const unreadCondition = unreadOnly ? "AND IsRead = 0" : "";

    const result = await request.query(`
        SELECT
            NotificationId, UserId, Title, Message, Type, IsRead, CreatedAt,
            COUNT(*) OVER() AS TotalCount
        FROM Notifications
        WHERE UserId = @UserId
          ${unreadCondition}
        ORDER BY CreatedAt DESC, NotificationId DESC
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;
    `);

    const total = result.recordset.length > 0 ? Number(result.recordset[0].TotalCount) : 0;
    const items = result.recordset.map(({ TotalCount, ...item }) => normalizeNotification(item));

    return {
        total,
        unread: items.filter((item) => !item.isRead).length,
        items,
        pagination: {
            page: normalizedPage,
            limit: normalizedLimit,
            total,
            totalPages: total === 0 ? 0 : Math.ceil(total / normalizedLimit)
        }
    };
}
async function markAsRead(userId, notificationId) {
    const normalizedUserId = normalizeId(userId);
    const normalizedNotificationId = normalizeId(notificationId);

    if (!normalizedUserId || !normalizedNotificationId) {
        const error = new Error("INVALID_ID");
        error.statusCode = 400;
        throw error;
    }

    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("UserId", sql.Int, normalizedUserId)
        .input("NotificationId", sql.Int, normalizedNotificationId)
        .query(`
            UPDATE Notifications
            SET IsRead = 1
            OUTPUT
                INSERTED.NotificationId,
                INSERTED.UserId,
                INSERTED.Title,
                INSERTED.Message,
                INSERTED.Type,
                INSERTED.IsRead,
                INSERTED.CreatedAt
            WHERE NotificationId = @NotificationId
              AND UserId = @UserId;
        `);

    if (result.recordset.length === 0) {
        const error = new Error("NOTIFICATION_NOT_FOUND");
        error.statusCode = 404;
        throw error;
    }

    return normalizeNotification(result.recordset[0]);
}

async function markAllAsRead(userId) {
    const normalizedUserId = normalizeId(userId);
    if (!normalizedUserId) {
        const error = new Error("INVALID_ID");
        error.statusCode = 400;
        throw error;
    }

    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("UserId", sql.Int, normalizedUserId)
        .query(`
            UPDATE Notifications
            SET IsRead = 1
            WHERE UserId = @UserId
              AND IsRead = 0;
        `);

    return {
        updatedCount: result.rowsAffected[0] || 0
    };
}

async function getUnreadCount(userId) {
    const normalizedUserId = normalizeId(userId);
    if (!normalizedUserId) {
        const error = new Error("INVALID_ID");
        error.statusCode = 400;
        throw error;
    }

    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("UserId", sql.Int, normalizedUserId)
        .query(`
            SELECT COUNT(*) AS UnreadCount
            FROM Notifications
            WHERE UserId = @UserId
              AND IsRead = 0;
        `);

    return Number(result.recordset[0]?.UnreadCount || 0);
}

module.exports = {
    createNotification,
    createNotifications,
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
};
