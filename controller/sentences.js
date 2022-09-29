const { listTranslations } = require("../service/sentences")

exports.listTranslations = async (req, res) => {
    let pageSize = req.query.pageSize
    let pageIndex= req.query.pageIndex

    const rows = await listTranslations(pageSize, pageIndex)
    res.json(rows);
}