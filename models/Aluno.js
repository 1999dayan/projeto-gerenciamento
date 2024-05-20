const mongoose = require('mongoose');

const alunoSchema = new mongoose.Schema({
    matricula: { type: String, unique: true }, // Definindo a matrícula como única
    nome: String,
    professor: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor' },
    disciplinas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Disciplina' }],
    // Outros campos do aluno, se houver
});

const Aluno = mongoose.model('Aluno', alunoSchema);

module.exports = Aluno;
