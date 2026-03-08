const Payment = require('../models/Payment');
const Order = require('../models/Order');

// GET /payments
exports.getPayments = async (req, res) => {
  try {
    const filter = {};
    if (!req.user.roles.some(r => r.name === 'admin')) {
      // Pour un user, trouver les commandes de l'utilisateur puis leurs paiements
      const userOrders = await Order.find({ userId: req.user._id }).select('_id');
      const orderIds = userOrders.map(o => o._id);
      filter.orderId = { $in: orderIds };
    }

    const payments = await Payment.find(filter).populate('orderId');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /payments/:id
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('orderId');
    if (!payment) return res.status(404).json({ error: 'Paiement non trouvé' });

    // Vérifier que l'utilisateur a accès à cette commande
    const order = await Order.findById(payment.orderId);
    if (!req.user.roles.some(r => r.name === 'admin') && order.userId.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Accès interdit' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /payments – créer une intention de paiement
exports.createPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

    // Vérifier que l'utilisateur est le propriétaire
    if (order.userId.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Accès interdit' });
    }

    // Vérifier que la commande est en attente et non déjà payée
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Cette commande ne peut pas être payée' });
    }

    // Vérifier qu'un paiement n'existe pas déjà pour cette commande
    const existingPayment = await Payment.findOne({ orderId });
    if (existingPayment) {
      return res.status(400).json({ error: 'Un paiement est déjà en cours pour cette commande' });
    }

    const payment = new Payment({
      orderId,
      amount: order.totalAmount,
      paymentMethod,
      status: 'PENDING'
    });

    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /payments/:id/status – mise à jour du statut (appelé par webhook ou admin)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status, transactionId } = req.body;
    if (!['PENDING', 'SUCCESS', 'FAILED'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Paiement non trouvé' });

    payment.status = status;
    if (transactionId) payment.transactionId = transactionId; // si vous avez un champ transactionId dans Payment
    await payment.save();

    // Si le paiement réussit, mettre à jour le statut de la commande
    if (status === 'SUCCESS') {
      await Order.findByIdAndUpdate(payment.orderId, { status: 'paid' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};