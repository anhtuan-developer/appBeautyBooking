const salonService = require("../services/salonService");

function parsePositiveInt(value) {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
}

async function getAll(req, res) {
    try {
        const data = await salonService.getAll();
        res.json({ success: true, data });
    } catch (error) {
        console.error("Get salons error:", error);
        res.status(500).json({ success: false, message: "Không thể lấy danh sách salon." });
    }
}

async function getById(req, res) {
    const salonId = parsePositiveInt(req.params.salonId);
    if (!salonId) return res.status(400).json({ success: false, message: "salonId không hợp lệ." });

    try {
        const data = await salonService.getById(salonId);
        if (!data) return res.status(404).json({ success: false, message: "Không tìm thấy salon." });
        res.json({ success: true, data });
    } catch (error) {
        console.error("Get salon error:", error);
        res.status(500).json({ success: false, message: "Không thể lấy thông tin salon." });
    }
}

module.exports = { getAll, getById };
