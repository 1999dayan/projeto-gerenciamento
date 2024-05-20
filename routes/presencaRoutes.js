const express = require('express');
const router = express.Router();
const presencaController = require('../controllers/presencaController'); // Importe o controlador de presença, se necessário

// Middleware para garantir autenticação
const ensureAuthenticated = (req, res, next) => {
    console.log('Middleware ensureAuthenticated chamado');
    if (req.session.isAuthenticated) {
        return next(); // Continua para a próxima função de middleware ou rota
    } else {
        res.redirect('/login'); // Redireciona para a página de login se não estiver autenticado
    }
};

// Rota para renderizar o formulário de inserção de presença
router.get('/inserir-presenca', ensureAuthenticated, (req, res) => {
    console.log('Rota GET /inserir-presenca chamada');
    presencaController.renderizarFormularioPresenca(req, res);
});

// Rota para criar uma nova presença
router.post('/', ensureAuthenticated, (req, res) => {
    console.log('Rota POST / chamada');
    presencaController.createPresenca(req, res);
});

// Rota para obter informações da presença
router.get('/:id', (req, res) => {
    console.log(`Rota GET /${req.params.id} chamada`);
    presencaController.getPresencaById(req, res);
});

// Rota para atualizar as informações da presença
router.put('/:id', (req, res) => {
    console.log(`Rota PUT /${req.params.id} chamada`);
    presencaController.updatePresencaById(req, res);
});

// Rota para excluir a presença
router.delete('/:id', (req, res) => {
    console.log(`Rota DELETE /${req.params.id} chamada`);
    presencaController.deletePresencaById(req, res);
});

// Rota GET para "/adicionar-disciplinas-campus"
router.get('/adicionar-disciplinas-campus', ensureAuthenticated, (req, res) => {
    console.log('Rota GET /adicionar-disciplinas-campus chamada');
    presencaController.renderizarPaginaDePresenca(req, res);
});

// Rota para adicionar disciplinas e campus ao professor
router.post('/adicionar-disciplinas-campus', (req, res) => {
    console.log('Rota POST /adicionar-disciplinas-campus chamada');
    presencaController.adicionarDisciplinasECampus(req, res);
});

module.exports = router;
