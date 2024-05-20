const Presenca = require('../models/Presenca');

// Função para criar uma nova presença
exports.createPresenca = async (req, res) => {
    try {
        // Seu código para criar uma nova presença
    } catch (error) {
        // Tratamento de erro
    }
};

// Função para obter informações da presença pelo ID
exports.getPresencaById = async (req, res) => {
    try {
        // Seu código para obter uma presença pelo ID
    } catch (error) {
        // Tratamento de erro
    }
};

// Função para atualizar as informações da presença pelo ID
exports.updatePresencaById = async (req, res) => {
    try {
        // Seu código para atualizar uma presença pelo ID
    } catch (error) {
        // Tratamento de erro
    }
};

// Função para excluir a presença pelo ID
exports.deletePresencaById = async (req, res) => {
    try {
        // Seu código para excluir uma presença pelo ID
    } catch (error) {
        // Tratamento de erro
    }
};

// Função para renderizar a página de presença
exports.renderizarPaginaDePresenca = async (req, res) => {
    try {
        // Busque todas as presenças no banco de dados, populando as informações do professor e da disciplina
        const presencas = await Presenca.find()
            .populate('professor', 'nome') // Popula apenas o campo 'nome' do professor
            .populate('disciplina', 'nome'); // Popula apenas o campo 'nome' da disciplina
        
        // Verifique se há presenças antes de renderizar a página
        if (presencas.length === 0) {
            // Se não houver presenças, você pode renderizar uma página de aviso ou redirecionar para outra página
            return res.render('no-presences', { title: 'Sem Presenças' });
        }
        
        // Se houver presenças, renderize a página normalmente
        res.render('presence', { 
            presencas,
            title: 'Presenças' // Defina a variável title aqui
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro interno do servidor');
    }
};
