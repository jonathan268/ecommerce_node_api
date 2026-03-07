require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/db");
const cors = require("cors");
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes')
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

