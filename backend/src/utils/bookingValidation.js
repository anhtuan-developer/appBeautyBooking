function normalizeTime(value) {
    if (typeof value !== "string") return null;

    const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
    if (!match) return null;

    const hour = Number(match[1]);
    const minute = Number(match[2]);
    const second = Number(match[3] || "0");

    if (hour > 23 || minute > 59 || second > 59) return null;

    // Bookings in this system are minute-based.
    if (second !== 0) return null;

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

function parseDateOnly(value) {
    if (typeof value !== "string") return null;

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        return null;
    }

    return {
        value: `${match[1]}-${match[2]}-${match[3]}`,
        date
    };
}

function getDayOfWeek(date) {
    // Monday = 1 ... Sunday = 7
    return ((date.getUTCDay() + 6) % 7) + 1;
}

function timeToMinutes(time) {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
}

function minutesToTime(totalMinutes) {
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}


module.exports = { normalizeTime, parseDateOnly, getDayOfWeek, timeToMinutes, minutesToTime };
