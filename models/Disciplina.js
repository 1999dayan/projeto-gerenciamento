// models/Disciplina.js

const mongoose = require('mongoose');

const disciplinaSchema = new mongoose.Schema({
  nome: String
});

disciplinaSchema.methods.toAuthJSON = function() {
  return {
      nome: this.nome
  };
};

const Disciplina = mongoose.model('Disciplina', disciplinaSchema);

module.exports = Disciplina;