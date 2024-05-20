const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PresencaSchema = new Schema({
    campus: {
        type: Schema.Types.ObjectId,
        ref: 'Campus',
        required: true
    },
    turma: {
        type: Schema.Types.ObjectId,
        ref: 'Turma',
        required: true
    },
    professor: {
        type: Schema.Types.ObjectId,
        ref: 'Professor',
        required: true
    },
    disciplina: {
      type: Schema.Types.ObjectId,
      ref: 'disciplinas',
      required: true
   },
    presencas: [{
      type: Schema.Types.ObjectId
    }],
    anotacao: {
        type: String,
        default: ''
    },
    data: {
        type: Date,
        default: Date.now
    }
});

// Exportando o modelo de presença
module.exports = mongoose.model('Presenca', PresencaSchema);
