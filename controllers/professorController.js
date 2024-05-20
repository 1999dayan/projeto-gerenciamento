// professorController.js
const Professor = require('../models/Professor');
const Disciplina = require('../models/Disciplina');
const Campus = require('../models/Campus');
const mongoose = require('mongoose');

const adicionarDisciplinasECampus = async (req, res) => {
    try {
        // Dados recebidos do formulário
        const { professorId, disciplinasSelecionadas, campusSelecionado } = req.body;

        // Converta campusSelecionado para ObjectId
        const campusObjectId = mongoose.Types.ObjectId(campusSelecionado);

        // Encontre o professor pelo ID
        const professor = await Professor.findById(professorId);

        if (!professor) {
            return res.status(404).json({ message: 'Professor não encontrado.' });
        }

        // Verifique se as disciplinas selecionadas existem
        const disciplinasExistentes = await Disciplina.find({ _id: { $in: disciplinasSelecionadas } });
        if (disciplinasExistentes.length !== disciplinasSelecionadas.length) {
            return res.status(400).json({ message: 'Uma ou mais disciplinas selecionadas não existem.' });
        }

        // Adicione as disciplinas selecionadas ao professor
        professor.disciplinas.push(...disciplinasSelecionadas);

        // Adicione o campus selecionado ao professor
        professor.campus.push(campusObjectId);

        // Salve as alterações no banco de dados
        await professor.save();

        res.status(200).json({ message: 'Disciplinas e campus adicionados com sucesso ao professor.' });
    } catch (error) {
        console.error('Erro ao adicionar disciplinas e campus ao professor:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

module.exports = {
    adicionarDisciplinasECampus
};
