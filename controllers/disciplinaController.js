// controllers/disciplinaController.js

const Disciplina = require('../models/Disciplina');

// Função para criar uma nova disciplina
exports.createDisciplina = async (req, res) => {
    try {
        const { nome } = req.body;
        const novaDisciplina = new Disciplina({ nome });
        await novaDisciplina.save();
        res.status(201).json(novaDisciplina);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar a disciplina' });
    }
};

// Função para obter informações da disciplina pelo ID
exports.getDisciplinaById = async (req, res) => {
    try {
        const disciplina = await Disciplina.findById(req.params.id);
        if (!disciplina) {
            return res.status(404).json({ message: 'Disciplina não encontrada' });
        }
        res.json(disciplina);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao obter a disciplina' });
    }
};

// Função para atualizar as informações da disciplina pelo ID
exports.updateDisciplinaById = async (req, res) => {
    try {
        const { nome } = req.body;
        const disciplinaAtualizada = await Disciplina.findByIdAndUpdate(req.params.id, { nome }, { new: true });
        if (!disciplinaAtualizada) {
            return res.status(404).json({ message: 'Disciplina não encontrada' });
        }
        res.json(disciplinaAtualizada);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar a disciplina' });
    }
};

// Função para excluir a disciplina pelo ID
exports.deleteDisciplinaById = async (req, res) => {
    try {
        const disciplinaDeletada = await Disciplina.findByIdAndDelete(req.params.id);
        if (!disciplinaDeletada) {
            return res.status(404).json({ message: 'Disciplina não encontrada' });
        }
        res.json({ message: 'Disciplina deletada com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar a disciplina' });
    }
};

