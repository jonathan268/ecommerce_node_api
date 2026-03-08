const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const paymentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    userId: {
      type: String,
      ref: "User",
      required: [true, "Un paiement doit etre rattaché à un utilisateur"],
      min: [0, "Le montant ne peut pas etre négatif"],
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
      uppercase: true,
    },
    transactionId: {
      type: String,
      ref: "Transaction",
      required: [true, "Une transaction doit etre rattachée à un paiement"],
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    montant: {
      type: Number,
      required: true,
    },
    orderId: {
      type: String,
      ref: "Order",
      required: true,
      unique: true,
      index: true,
    },
    cinetpayTransactionId: { type: String }, // l'ID CinetPay (cpm_payid)
    cinetpayPaymentToken: { type: String }, // token de paiement
    cinetpayPaymentUrl: { type: String }, // URL de redirection
  },
  {
    timestamps: true,
  },
);

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
