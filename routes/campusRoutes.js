// routes/campusRoutes.js

const express = require('express');
const router = express.Router();
const campusController = require('../controllers/campusController');

// Rota para criar um novo campus
router.post('/', campusController.createCampus);

// Rota para obter informações do campus
router.get('/:id', campusController.getCampusById);

// Rota para atualizar as informações do campus
router.put('/:id', campusController.updateCampusById);

// Rota para excluir o campus
router.delete('/:id', campusController.deleteCampusById);

module.exports = router;