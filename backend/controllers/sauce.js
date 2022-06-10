// importation des functions installées
const Sauce = require("../models/sauce");
const fs = require("fs");

// CRUD
// Requête post
exports.createSauce = (req, res, next) => {
  // On récupère les données au bon format
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  // Création du produit
  const sauce = new Sauce({
    // On récupère les données de la requête
    ...sauceObject,
    // et on génère l'url de l'image, les valeurs de likes et dislikes et on créer les tableaux likes et dislikes
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [" "],
    usersdisLiked: [" "],
  });
  // Sauvegarde du produit dans la base de donnée qui renvoie un changement de status et la réponse que le produit est bien enregistré
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};
// Requête get pour 1 produit
exports.getOneSauce = (req, res, next) => {
  // on récupère la donnée du produit via son id avec findOne qui renvoie un changement de status et la réponse
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};
// requête put pour 1 produit
exports.modifySauce = async (req, res, next) => {
  try {
    // Si req.file existe (changement de l'image)
    if (req.file) {
      const sauce = await Sauce.findOne({ _id: req.params.id });
      // On supprime l'image précédente
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlinkSync(`images/${filename}`);
    }

    const sauceObject = req.file
      ? {
          // Si il y a un fichier image dans la requête ----------------------------------
          // On récupère les données de la requête et on génère un nouvel url
          ...JSON.parse(req.body.sauce),
          imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
          }`,

          // Sinon on mets à jour les données du produit --------------------------------------
        }
      : { ...req.body };
    await Sauce.updateOne(
      { _id: req.params.id },
      { ...sauceObject, _id: req.params.id }
    );
    return res.status(200).json({ message: "Objet modifié !" });
  } catch (error) {
    return res.status(500).json({ error });
  }
};
// requête delete pour 1 produit
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // On supprime l'image et l'url associe au produit
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        // On supprime le produit
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Objet supprimé !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};
// requête get
exports.getAllSauce = (req, res, next) => {
  // on récupère l'ensemble des données avec find qui renvoie un changement de status et la réponse
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

// Gestion du like et du dislike
exports.likeSauce = (req, res, next) => {
  switch (req.body.like) {
    // On a 3 cas possible pour le like de la requête
    // Like 1(like) 0(neutre) -1(dislike)
    case 1:
      // Pour la sauce selectionné on push l'utilsateur dans le tableau des likes et on incrémente le like de 1
      Sauce.updateOne(
        { _id: req.params.id },
        { $push: { usersLiked: req.body.userId }, $inc: { likes: +1 } }
      )
        .then(() => res.status(200).json({ message: `J'aime` }))
        .catch((error) => res.status(400).json({ error }));

      break;

    case 0:
      // On recherche les données du produit
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          // On veut savoir si l'utilisateur était dans le tableau like ou dislike
          // Si l'utilisateur est dans le tableau des likes
          if (sauce.usersLiked.includes(req.body.userId)) {
            // On mets a jour les données du produit en retirant l'utilisateur du tableau like et on incrémente -1 aux likes
            Sauce.updateOne(
              { _id: req.params.id },
              { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } }
            )
              .then(() => res.status(200).json({ message: `Neutre` }))
              .catch((error) => res.status(400).json({ error }));
          }
          // Si l'utilisateur est dans le tableau des dislikes
          if (sauce.usersDisliked.includes(req.body.userId)) {
            // On mets a jour les données du produit en retirant l'utilisateur du tableau dislike et on incrémente -1 aux dislikes
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $pull: { usersDisliked: req.body.userId },
                $inc: { dislikes: -1 },
              }
            )
              .then(() => res.status(200).json({ message: `Neutre` }))
              .catch((error) => res.status(400).json({ error }));
          }
        })
        .catch((error) => res.status(404).json({ error }));
      break;

    case -1:
      // Pour la sauce selectionné on push l'utilsateur dans le tableau des dislikes et on incrémente le dislike de 1
      Sauce.updateOne(
        { _id: req.params.id },
        { $push: { usersDisliked: req.body.userId }, $inc: { dislikes: +1 } }
      )
        .then(() => {
          res.status(200).json({ message: `Je n'aime pas` });
        })
        .catch((error) => res.status(400).json({ error }));
      break;

    default:
      console.log(error);
  }
};
