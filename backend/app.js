const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Routes
const userRoutes = require('./routes/user');


// Base de donnée
mongoose.connect('mongodb+srv://ProYoxiS:26049335tr@cluster0.m5kcj.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));





app.use('/api/auth', userRoutes);



module.exports = app;