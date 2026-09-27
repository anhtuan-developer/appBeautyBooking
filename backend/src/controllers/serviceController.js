const serviceService = require("../services/serviceService");

function positiveInt(value) {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : null;
}

function parsePagination(req, res) {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    if (!Number.isInteger(page) || page < 1) {
        res.status(400).json({ success: false, message: "page không hợp lệ." });
        return null;
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
        res.status(400).json({ success: false, message: "limit phải từ 1 đến 50." });
        return null;
    }

    return { page, limit };
}

async function getAll(req, res) {
    const pagination = parsePagination(req, res);
    if (!pagination) return;

    const salonId = req.query.salonId === undefined || req.query.salonId === ""
        ? null
        : positiveInt(req.query.salonId);

    if (req.query.salonId !== undefined && salonId === null) {
        return res.status(400).json({ success: false, message: "salonId không hợp lệ." });
    }

    try {
        if (salonId !== null && !(await serviceService.salonExists(salonId))) {
            return res.status(404).json({ success: false, message: "Không tìm thấy salon đang hoạt động." });
        }

        const data = await serviceService.getAll({
            search: req.query.search || "",
            salonId,
            page: pagination.page,
            limit: pagination.limit
        });

        res.json({ success: true, data });
    } catch (error) {
        console.error("Get services error:", error);
        res.status(500).json({ success: false, message: "Không thể lấy danh sách dịch vụ." });
    }
}

async function getBySalonId(req, res) {
    const salonId = positiveInt(req.params.salonId);
    if (!salonId) {
        return res.status(400).json({ success: false, message: "salonId không hợp lệ." });
    }

    try {
        if (!(await serviceService.salonExists(salonId))) {
            return res.status(404).json({ success: false, message: "Không tìm thấy salon đang hoạt động." });
        }

        const data = await serviceService.getBySalonId(salonId);
        res.json({ success: true, data });
    } catch (error) {
        console.error("Get services by salon error:", error);
        res.status(500).json({ success: false, message: "Không thể lấy dịch vụ của salon." });
    }
}

async function getById(req, res) {
    const serviceId = positiveInt(req.params.serviceId);
    if (!serviceId) {
        return res.status(400).json({ success: false, message: "serviceId không hợp lệ." });
    }

    const expectedSalonId = req.query.salonId === undefined || req.query.salonId === ""
        ? null
        : positiveInt(req.query.salonId);

    if (req.query.salonId !== undefined && expectedSalonId === null) {
        return res.status(400).json({ success: false, message: "salonId không hợp lệ." });
    }

    try {
        if (expectedSalonId !== null && !(await serviceService.salonExists(expectedSalonId))) {
            return res.status(404).json({ success: false, message: "Không tìm thấy salon đang hoạt động." });
        }

        const data = await serviceService.getById(serviceId, expectedSalonId);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: expectedSalonId !== null
                    ? "Dịch vụ không tồn tại, không hoạt động hoặc không thuộc salon này."
                    : "Không tìm thấy dịch vụ."
            });
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error("Get service error:", error);
        res.status(500).json({ success: false, message: "Không thể lấy thông tin dịch vụ." });
    }
}

module.exports = { getAll, getBySalonId, getById };
