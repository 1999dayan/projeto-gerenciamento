// controllers/alunoController.js

const Aluno = require('../models/Aluno');

// Função para criar um novo aluno
exports.createAluno = async (req, res) => {
    try {
        const { nome, matricula, presenca } = req.body;
        const novoAluno = new Aluno({ nome, matricula, presenca });
        await novoAluno.save();
        res.status(201).json(novoAluno);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar o aluno' });
    }
};

// Função para obter informações do aluno pelo ID
exports.getAlunoById = async (req, res) => {
    try {
        const aluno = await Aluno.findById(req.params.id);
        if (!aluno) {
            return res.status(404).json({ message: 'Aluno não encontrado' });
        }
        res.json(aluno);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao obter o aluno' });
    }
};

// Função para atualizar as informações do aluno pelo ID
exports.updateAlunoById = async (req, res) => {
    try {
        const { nome, matricula, presenca } = req.body;
        const alunoAtualizado = await Aluno.findByIdAndUpdate(req.params.id, { nome, matricula, presenca }, { new: true });
        if (!alunoAtualizado) {
            return res.status(404).json({ message: 'Aluno não encontrado' });
        }
        res.json(alunoAtualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar o aluno' });
    }
};

// Função para excluir o aluno pelo ID
exports.deleteAlunoById = async (req, res) => {
    try {
        const alunoDeletado = await Aluno.findByIdAndDelete(req.params.id);
        if (!alunoDeletado) {
            return res.status(404).json({ message: 'Aluno não encontrado' });
        }
        res.json({ message: 'Aluno deletado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar o aluno' });
    }
};

