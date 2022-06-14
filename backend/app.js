// importation des fonctions installées
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require(`dotenv`).config({ path: `./config/.env` });

// importation des routes
const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

const app = express();

// Connection au MongoDB
mongoose
  .connect("mongodb+srv://" + process.env.DB_USER_PASS + "", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// Requêtes autorisées
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(express.json());

// Path
app.use("/api/auth", userRoutes);
app.use("/api/sauces", sauceRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
