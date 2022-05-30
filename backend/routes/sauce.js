// importation des fonctions installées 
const express = require('express');
const router = express.Router();

// importation des routes
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sauceCtrl = require('../controllers/sauce');

// Mise en place des router pour chaque type de requête 
router.get('/', auth, sauceCtrl.getAllSauce);
router.post('/', auth, multer, sauceCtrl.createSauce);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
// Route like
router.post('/:id/like', auth, sauceCtrl.likeSauce)

module.exports = router;