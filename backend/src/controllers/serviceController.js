const serviceService = require("../services/serviceService");

function positiveInt(value) {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : null;
}

async function getBySalonId(req, res) {
    const salonId = positiveInt(req.params.salonId);
    if (!salonId) return res.status(400).json({ success: false, message: "salonId không hợp lệ." });

    try {
        const data = await serviceService.getBySalonId(salonId);
        res.json({ success: true, data });
    } catch (error) {
        console.error("Get services error:", error);
        res.status(500).json({ success: false, message: "Không thể lấy danh sách dịch vụ." });
    }
}

async function getById(req, res) {
    const serviceId = positiveInt(req.params.serviceId);
    if (!serviceId) return res.status(400).json({ success: false, message: "serviceId không hợp lệ." });

    try {
        const data = await serviceService.getById(serviceId);
        if (!data) return res.status(404).json({ success: false, message: "Không tìm thấy dịch vụ." });
        res.json({ success: true, data });
    } catch (error) {
        console.error("Get service error:", error);
        res.status(500).json({ success: false, message: "Không thể lấy thông tin dịch vụ." });
    }
}

module.exports = { getBySalonId, getById };
