const express = require("express");
const pdfController = require("../controllers/pdfController");

const router = express.Router();

/**
 * @route POST /api/pdf/generate
 * @desc Generate a PDF from HTML content
 */
router.post("/generate", pdfController.generatePdf);

/**
 * @route DELETE /api/pdf/delete/:filename
 * @desc Delete a PDF file by filename
 */
router.delete("/delete/:filename", pdfController.deletePdf);

module.exports = router;
