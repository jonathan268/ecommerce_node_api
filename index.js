require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/db");
const cors = require("cors");
const passport = require('./src/config/passport');
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes')
const userRoutes = require('./src/routes/userRoutes')
const roleRoutes = require('./src/routes/rolesRoutes')
const orderRoutes = require('./src/routes/orderRoutes')
const paymentRoutes = require('./src/routes/paymentRoutes')
const transactionRoutes = require('./src/routes/transactionRoutes')
const oauthRoutes = require('./src/routes/oauthRoutes')
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(passport.initialize());

// Configuration CORS
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://c-shop-black.vercel.app"
        : ["http://localhost:5173"],
    credentials: true,
  }),
);

connectDB();




// Routes de test
app.get("/", (req, res) => {
  res.json({ message: "ecommerce-api fonctionnelle !" });
});

// Endpoints pour le frontend

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes)
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/oauth', oauthRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

