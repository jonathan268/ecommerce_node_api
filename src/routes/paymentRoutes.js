const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const paymentController = require('../controllers/paymentController');

router.use(auth);

router.get('/', paymentController.getPayments);
router.post('/', paymentController.createPayment);
router.get('/:id', paymentController.getPaymentById);
router.put('/:id/status', paymentController.updatePaymentStatus); // pourrait être réservé admin + webhook

module.exports = router;