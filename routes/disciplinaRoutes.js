// routes/disciplinaRoutes.js

const express = require('express');
const router = express.Router();
const disciplinaController = require('../controllers/disciplinaController');
const Disciplina = require('../models/Disciplina')


router.post('/', disciplinaController.createDisciplina);

// Rota para obter informações da disciplina
router.get('/:id', disciplinaController.getDisciplinaById);

// Rota para atualizar as informações da disciplina
router.put('/:id', disciplinaController.updateDisciplinaById);

// Rota para excluir a disciplina
router.delete('/:id', disciplinaController.deleteDisciplinaById);

router.get('/adicionar_disciplinas_campus', async (req, res) => {
    try {
        const disciplinas = await Disciplina.find(); // Recupera todas as disciplinas do banco de dados
        console.log('res render')
        res.render('form_adicionar_disciplinas_campus', { disciplinas: disciplinas }); // Passa as disciplinas para o template EJS
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao recuperar disciplinas do banco de dados');
    }
});

module.exports = router;

