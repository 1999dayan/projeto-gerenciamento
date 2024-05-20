const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;

const professorSchema = new Schema({
    nome: String,
    senha: String,
    disciplinas: [{
        type: Schema.Types.ObjectId,
        ref: 'disciplinas'
    }],
    campus: [{
        type: Schema.Types.ObjectId,
        ref: 'campus'
    }],
    turmas: [{
        type: Schema.Types.ObjectId,
        ref: 'campus'
    }],
    is_admin: {
        type: Number,
        default: 0
    },
    is_verified: {
        type: Number,
        default: 0
    }
}, { strict: false });



const disciplinaSchema = new Schema({
    nome: String,
    // outros campos, se houver
});

const Disciplina = mongoose.model('disciplinas', disciplinaSchema);

const campusSchema = new Schema({
    nome: String,
    turmas: [{
        type: Schema.Types.ObjectId,
        ref: 'campus.turmas'
    }]
});

const Campus = mongoose.model('campus', campusSchema);

const turmaSchema = new Schema({
    numero: String,
    
});

const Turma = mongoose.model('campus.turmas', turmaSchema);


professorSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

professorSchema.methods.validatePassword = function(password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};

professorSchema.methods.generateJWT = function() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    return jwt.sign({
        id: this._id,
        exp: parseInt(expirationDate.getTime() / 1000, 10),
    }, 'secret');
};

professorSchema.methods.toAuthJSON = function() {
    return {
        _id: this._id,
        nome: this.nome,
        token: this.generateJWT(),
    };
};

const Professor = mongoose.model('Professor', professorSchema);

module.exports = Professor;
