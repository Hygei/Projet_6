// Importation des fonctions installées
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// Importation de la route du model
const User = require("../models/User");

exports.signup = (req, res, next) => {
  // On crypt la mdp de la requête
  bcrypt
    .hash(req.body.password, 10)
    // On crée un nouvel utilisateur avec le mdp hashé
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      // On sauvegarde l'utilisateur et on renvoie
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error: "problème de serveur" }));
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    // On cherche l'utilisateur via son email
    .then((user) => {
      // Si il n'existe pas on retourne un status 401
      if (!user) {
        return res
          .status(401)
          .json({ error: "Utilisateur et/ou mot de passe incorrect !" });
      }
      // Sinon on compare le mdp
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          // Si le mdp n'est pas valide on retourne un status 401
          if (!valid) {
            return res
              .status(401)
              .json({ error: "Utilisateur et/ou mot de passe incorrect !" });
          }
          // Si il est valide on renvoie l'identifiant avec un token de connexion
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
