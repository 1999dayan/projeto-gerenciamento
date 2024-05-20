// routes/alunoRoutes.js

const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');

// Rota para criar um novo aluno
router.post('/', alunoController.createAluno);

// Rota para obter informações do aluno
router.get('/:id', alunoController.getAlunoById);

// Rota para atualizar as informações do aluno
router.put('/:id', alunoController.updateAlunoById);

// Rota para excluir o aluno
router.delete('/:id', alunoController.deleteAlunoById);

// Endpoint para lidar com a requisição AJAX e retornar os alunos associados à disciplina selecionada
app.get('/alunos/:idDisciplina', async (req, res) => {
    const idDisciplina = req.params.idDisciplina;
    const idProfessor = req.session.user._id; // ID do professor logado

    try {
        // Buscar os alunos associados à disciplina e ao professor no banco de dados
        const alunos = await Aluno.find({ disciplina: idDisciplina, professor: idProfessor });
        res.json(alunos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao buscar os alunos.' });
    }
});


module.exports = router;
