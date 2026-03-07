const express = require("express");
const productController = require("../controllers/productController");

const router = express.Router();

router.get("/all-products", productController.getAllProducts);
router.get("/one-product/", productController.getProductById);
router.post("/add-product", productController.addProduct);
router.put("/update-product", productController.updateProduct);
router.delete("/delete-product", productControler.deleteProduct);

module.exports = router;
