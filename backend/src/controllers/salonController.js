const salonService = require("../services/salonService");

function parsePositiveInt(value) {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
}

async function getAll(req, res) {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    if (!Number.isInteger(page) || page < 1) {
        return res.status(400).json({ success: false, message: "page không hợp lệ." });
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
        return res.status(400).json({ success: false, message: "limit phải từ 1 đến 50." });
    }

    try {
        const data = await salonService.getAll({
            search: req.query.search || "",
            page,
            limit
        });
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

async function getServices(req, res) {
    const salonId = parsePositiveInt(req.params.salonId);
    if (!salonId) return res.status(400).json({ success: false, message: "salonId không hợp lệ." });

    try {
        const data = await salonService.getServices(salonId);
        res.json({ success: true, data });
    } catch (error) {
        console.error("Get salon services error:", error);
        res.status(500).json({ success: false, message: "Không thể lấy dịch vụ của salon." });
    }
}

async function getEmployees(req, res) {
    const salonId = parsePositiveInt(req.params.salonId);
    if (!salonId) return res.status(400).json({ success: false, message: "salonId không hợp lệ." });

    try {
        const data = await salonService.getEmployees(salonId);
        res.json({ success: true, data });
    } catch (error) {
        console.error("Get salon employees error:", error);
        res.status(500).json({ success: false, message: "Không thể lấy nhân viên của salon." });
    }
}

module.exports = { getAll, getById, getServices, getEmployees };
