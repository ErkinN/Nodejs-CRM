const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const upload = require("../middleware/upload");

/**
 *  Customer Routes
 */
router.get("/", customerController.homepage);
router.get("/about", customerController.about);
router.get("/add", customerController.addCustomer);
router.post("/add", upload.single("resume"), customerController.postCustomer);
router.get("/view/:id", customerController.view);
router.get("/edit/:id", customerController.edit);
router.put("/edit/:id", customerController.editPost);
router.delete("/edit/:id", customerController.deleteCustomer);
// router.get("/download/:filename", customerController.download);

router.post("/search", customerController.searchCustomers);

module.exports = router;
