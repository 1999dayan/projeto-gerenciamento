const mongoose = require('mongoose');

const campusSchema = new mongoose.Schema({
  nome: String,
  turmas: [{
    numero: String,
    alunos: [{ nome: String }]
}]
});

const Campus = mongoose.model('Campus', campusSchema);

module.exports = Campus;
