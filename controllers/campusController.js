// controllers/campusController.js

const Campus = require('../models/Campus');

// Função para criar um novo campus
exports.createCampus = async (req, res) => {
    try {
        const { nome } = req.body;
        const novoCampus = new Campus({ nome });
        await novoCampus.save();
        res.status(201).json(novoCampus);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar o campus' });
    }
};

// Função para obter informações do campus pelo ID
exports.getCampusById = async (req, res) => {
    try {
        const campus = await Campus.findById(req.params.id);
        if (!campus) {
            return res.status(404).json({ message: 'Campus não encontrado' });
        }
        res.json(campus);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao obter o campus' });
    }
};

// Função para atualizar as informações do campus pelo ID
exports.updateCampusById = async (req, res) => {
    try {
        const { nome } = req.body;
        const campusAtualizado = await Campus.findByIdAndUpdate(req.params.id, { nome }, { new: true });
        if (!campusAtualizado) {
            return res.status(404).json({ message: 'Campus não encontrado' });
        }
        res.json(campusAtualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar o campus' });
    }
};

// Função para excluir o campus pelo ID
exports.deleteCampusById = async (req, res) => {
    try {
        const campusDeletado = await Campus.findByIdAndDelete(req.params.id);
        if (!campusDeletado) {
            return res.status(404).json({ message: 'Campus não encontrado' });
        }
        res.json({ message: 'Campus deletado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar o campus' });
    }
};