const mongoose = require('mongoose');

const CampusSchema = new mongoose.Schema({
    nome: String,
    turmas: [{
        numero: String,
        alunos: [{ nome: String }]
    }]
});

const Campuss = mongoose.model('ampuss', CampusSchema);

module.exports = Campuss;