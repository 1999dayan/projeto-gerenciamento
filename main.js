const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const uploadController = require('./controllers/uploadController');
const Professor = require('./models/Professor'); // Importe o modelo de Professor
const app = express();
const Disciplina = require('./models/Disciplina');
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth'); // Para lidar com arquivos DOCX 
const Presenca = require('./models/Presenca');
const Campus = require('./models/Campus');
const Aluno = require('./models/Aluno');
const Turmas = require('./models/Turmas');
const disciplinas = require('./routes/disciplinaRoutes');
const multer = require('multer');
const csv = require('csv-parser');


app.use('/form_adicionar_disciplinas_campus', disciplinas)

// Configuração da sessão
app.use(session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false,
}));

app.use((req, res, next) => {
    try{
        res.locals.currentUser = req.session.user || null;
        res.locals.is_Admin = req.session.user ? req.session.user.is_admin : false;
        next();
    }
    catch{
        console.log('Usuario nao esta logado')
    }
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

mongoose.connect('mongodb://localhost:27017/school').then(() => {
    console.log('Conexão com o MongoDB estabelecida com sucesso!');
}).catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err);
    process.exit(1);
});


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use("/uploads", express.static('uploads'));

const checkAdminAuth = (req, res, next) => {
    if (req.session.isAuthenticated) {
        if (req.session.user && req.session.user.is_admin === 1) {
            // Se for um administrador, avance para a próxima middleware
            return next();
        } else {
            // Se não for um administrador, envie um erro de autorização
            return res.status(403).send('Apenas administradores podem acessar esta página.');
        }
    } else {
        // Se não estiver autenticado, redirecione para a página de login
        return res.redirect('/login');
    }
};

// app.get('*', (req, res) => {
//     console.log('all')
//     const isAdmin = professor && professor.is_admin === 1;
//     res.send('isAdmin')
// });

const isAdmin = (req, res, next) => {
    if (req.session.isAuthenticated && req.session.user && req.session.user.is_admin === 1) {
        // Se for um administrador, avance para a próxima middleware
        return next();
    } else {
        // Se não for um administrador, envie um erro de autorização
        return res.status(403).send('Apenas administradores podem acessar esta página.');
    }
};




app.get('/', (req, res) => {
    res.redirect('/login');
});



app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

// Rota para renderizar a página admin-index.ejs
app.get('/admin-index', checkAdminAuth, (req, res) => {
    res.render('admin-index', { title: 'Admin Index' });
});


// Rota para autenticação
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const professor = await Professor.findOne({ nome: username });

        if (!professor) {
            return res.status(404).send('Professor not found');
        }

        const isPasswordValid = await bcrypt.compare(password, professor.senha);
        if (!isPasswordValid) {
            return res.status(401).send('Incorrect password');
        }

        req.session.isAuthenticated = true;
        req.session.user = professor;

        // Verificar se o usuário é um administrador
        if (professor.is_admin === 1) {
            // Se for um administrador, redirecione-o para a rota de administração
            return res.redirect('/admin-index');
        } else {
            // Se não for um administrador, redirecione-o para a página inicial
            return res.redirect('/index');
        }
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).send('Error in login');
    }
});

const checkAuth = (req, res, next) => {
    if (req.session.isAuthenticated) {
        return next();
    } else {
        // Se não estiver autenticado, redirecione para a página de login
        return res.redirect('/login');
    }
};

app.get('/index', checkAuth, async (req, res) => {
    try {
        // Obter o ID do professor a partir da sessão
        const professorId = req.session.user._id;

        
        const professor = Professor.findById('professorId').populate('campus')
        console.log(professor)

        // // Renderizar a página inicial com os dados das disciplinas e campus
        res.render('index', { title: 'Página Inicial', disciplinas: 'teste', campus: professor });
    } catch (error) {
        console.error('Erro ao renderizar a página inicial:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

app.get('/signup', (req, res) => {
    res.render('signup', { title: 'Sign Up' });
});

// Rota para o processo de signup (registro de usuário)
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Verificar se já existe um usuário com o mesmo nome
        const existingProfessor = await Professor.findOne({ nome: username });
        if (existingProfessor) {
            return res.status(400).send('Username already exists');
        }


        const hashedPassword = await bcrypt.hash(password, 10); // 10 é o número de rounds de hashing
        const novoProfessor = new Professor({ nome: username, senha: hashedPassword });
        await novoProfessor.save();

        // novoProfessor.disciplinas = null;
        // novoProfessor.campus = null;
        //await novoProfessor.save();

        // Redirecionar para a página de login após o signup bem-sucedido
        res.redirect('/login');
    } catch (error) {
        console.error('Error in signup:', error);
        res.status(500).send('Error in signup');
    }
});


app.post('/presenca', async (req, res) => {
    const { campus, turma, disciplina, presencas, anotacao, data } = req.body;
    try {
        
        const presenca = new Presenca({campus: campus, turma: turma, professor: req.session.user._id, disciplina: disciplina, presencas: presencas, anotacao: anotacao, data: data})
        console.log(presenca)
        await presenca.save()
        res.end()
    } catch (error) {
        console.log('Error in signup:', error);
        res.status(500).send('Error in signup: ');
    }
});

app.put('/presenca/:id', async (req, res) => {
    const { id } = req.params;  // ID da presença a ser atualizada
    const { presencas } = req.body;  // Novo array de presenças

    try {
        const presenca = await Presenca.findByIdAndUpdate(
            id,
            { presencas: presencas },
            { new: true } 
        );

        if (!presenca) {
            return res.status(404).send('Presença não encontrada');
        }

        res.status(200).json(presenca);  // Enviar o documento atualizado como resposta
    } catch (error) {
        console.log('Error in updating presence:', error);
        res.status(500).send('Error in updating presence');
    }
});

// Rota para fazer logout
app.get('/logout', (req, res) => {
    // Destrua a sessão
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out:', err);
            res.status(500).send('Error logging out');
        } else {
            // Redirecione para a página de login após o logout bem-sucedido
            res.redirect('/login');
        }
    });
});

app.get('/presencas/:idProfessor?/:data/:turmaId/:campusId', async (req, res) => {
    try {
        const user = req.session.user;
        console.log(user.is_admin)
        if (user.is_admin === 0){
            idProfessor = req.session.user._id;
        }
        else{
            idProfessor = req.params.idProfessor;
            console.log('adm logado')
            console.log(idProfessor)
        }
        data = req.params.data + "T00:00:00.000+00:00"
        const filter = {};
        console.log(data)
        filter.data = data;
        filter.turma = req.params.turmaId;
        filter.campus = req.params.campusId;
        filter.professor = idProfessor;
        console.log(req.params.turmaId)
        console.log(req.params.campusId)
        console.log(req.session.user._id)
        var presencas = await Presenca.find(filter)
            .populate('campus')
            .populate('professor')
            .populate('disciplina')
            .exec();
        presencas = JSON.stringify(presencas);
        const jsonObject = JSON.parse(presencas);
        console.log(presencas)
        res.json(jsonObject);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

function getNomeAlunoById(jsonData, alunoId) {
    for (let turma of jsonData[0].campus.turmas) {
        for (let aluno of turma.alunos) {
            if (aluno._id === alunoId) {
                return aluno.nome;
            }
        }
    }
    return null; 
    }


function calcular_presenca(numeroPresencas, totalAulas){
    var percentualPresenca = (numeroPresencas / totalAulas) * 100;
    return percentualPresenca.toFixed(2);
}


app.get('/teste-aluno/:idProfessor?/:data/:turmaId/:campusId', async (req, res) => {
    try {
        const user = req.session.user;
        console.log(user.is_admin)
        if (user.is_admin === 0){
            idProfessor = req.session.user._id;
        }
        else{
            idProfessor = req.params.idProfessor;
            console.log('adm logado')
            console.log(idProfessor)
        }

        var filter = {};
        filter.turma = req.params.turmaId
    
        var presencas = await Presenca.find(filter)
            .populate('campus')
            .populate('professor')
            .populate('disciplina')
            .exec();
        presencas = JSON.stringify(presencas);
        var alunos_presentes = {};
        var jsonObject = JSON.parse(presencas);

        jsonObject.forEach(presence_list => {
            presence_list.presencas.forEach(id => {
                if (alunos_presentes[id]) {
                    alunos_presentes[id] += 1;
                } else {
                    alunos_presentes[id] = 1;
                }
            });
        });
        
        const total_aulas = jsonObject.length
  
        var filter = {};

        filter.turma = req.params.turmaId
        filter.data = req.params.data + "T00:00:00.000+00:00"
        filter.campus = req.params.campusId
        filter.professor = idProfessor
       
        var presencas = await Presenca.find(filter)
            .populate('campus')
            .populate('professor')
            .populate('disciplina')
            .exec();
        if (presencas.length > 0){
            presencas = JSON.stringify(presencas);
            var jsonObject = JSON.parse(presencas);
            aluno_response = {}
            jsonObject[0].presencas.forEach(id => {
                nome_aluno = getNomeAlunoById(jsonObject, id)
                let presencas = alunos_presentes[id];
                percentualPresenca = calcular_presenca(presencas, total_aulas)
                aluno_response[nome_aluno] = percentualPresenca
            });
            aluno_response["anotacao"] = jsonObject[0].anotacao
            for (var chave in aluno_response) {
                if (aluno_response.hasOwnProperty(chave)) {
                    var valor = aluno_response[chave];
                    console.log("Chave:", chave, "Valor:", valor);
                }
            }

            console.log(aluno_response)
        

            res.json(aluno_response);
        }
        else{
            res.json(presencas);
        }
        
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

app.get('/relatorio-get/:idProfessor?/:turmaId/:campusId', async (req, res) => {   
    try {
        const user = req.session.user;
        console.log(user.is_admin)
        if (user.is_admin === 0){
            idProfessor = req.session.user._id;
        }
        else{
            idProfessor = req.params.idProfessor;
            console.log('adm logado')
            console.log(idProfessor)
        }

        const datesString = req.query.dates;
        const datesArray = datesString.split(',').map(date => date + "T00:00:00.000+00:00");
        
        var filter = {};
        filter.turma = req.params.turmaId
        var todos_alunos  = await Presenca.find(filter)
        .populate('campus')
        .populate('professor')
        .populate('disciplina')
        .exec();
        todos_alunos = JSON.stringify(todos_alunos);

        var filter = {};
        filter.turma = req.params.turmaId;
        filter.professor = idProfessor;
        filter.data = {
            $in: datesArray
        };
    

        var presencas = await Presenca.find(filter)
            .populate('campus')
            .populate('professor')
            .populate('disciplina')
            .exec();
        
        const total_aulas = presencas.length; 
        presencas = JSON.stringify(presencas);
        const campus = await Campus.findById(req.params.campusId);
        const turmasEncontradas = [];

        var jsonObject = JSON.parse(presencas);
        var alunos_presentes = {};

        campus.turmas.forEach(turma => {
            if (turma._id.toString() === req.params.turmaId) {
                turmasEncontradas.push(turma);
            }
        });
        
        turmasEncontradas[0].alunos.forEach(aluno => {
            alunos_presentes[aluno._id] = 0;
        });

        jsonObject.forEach(presence_list => {
            presence_list.presencas.forEach(id => {
                if (alunos_presentes[id]) {
                    alunos_presentes[id] += 1;
                } else {
                    alunos_presentes[id] = 1;
                }
            });
        });



        let result = {};
        for (let alunoId in alunos_presentes) {
            nome = getNomeAlunoById(jsonObject, alunoId)
            result[nome] = {
                presencas: alunos_presentes[alunoId],
                total_aulas: total_aulas,
                porcentagem: (alunos_presentes[alunoId] / total_aulas) * 100
            };
        }

        console.log(result)
        res.json(result);
  
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

app.get('/nome-alunos/:turmaId/:campusId', async function(req, res){
    var filter = {};
    filter.turma = req.params.turmaId;
  
    const campus = await Campus.findById(req.params.campusId);
    const turmasEncontradas = [];

    var alunos_presentes = {};

    campus.turmas.forEach(turma => {
        if (turma._id.toString() === req.params.turmaId) {
            turmasEncontradas.push(turma);
        }
    });
    
   
    res.json(turmasEncontradas[0].alunos)

})

app.get('/editar/:idProfessor?/:turmaId/:campusId', async (req, res) => {   
    try {
        const user = req.session.user;
        console.log(user.is_admin)
        if (user.is_admin === 0){
            idProfessor = req.session.user._id;
        }
        else{
            idProfessor = req.params.idProfessor;
            console.log('adm logado')
            console.log(idProfessor)
        }

        const datesString = req.query.dates;
        console.log("data: ", datesString)
        const datesArray = datesString +  "T00:00:00.000+00:00";
        
        var filter = {};
        filter.turma = req.params.turmaId
        filter.campus = req.params.campusId
        filter.data = datesArray
        var presencas  = await Presenca.find(filter)
        .populate('campus')
        .populate('professor')
        .populate('disciplina')
        .exec();
        presencas = JSON.stringify(presencas);
       
        const campus = await Campus.findById(req.params.campusId);
        const turmasEncontradas = [];
        console.log(campus)
        var jsonObject = JSON.parse(presencas);
        var alunos_presentes = {};

        campus.turmas.forEach(turma => {
            if (turma._id.toString() === req.params.turmaId) {
                turmasEncontradas.push(turma);
            }
        });
        console.log(turmasEncontradas);
        turmasEncontradas[0].alunos.forEach(aluno => {
            console.log(aluno)
        })

        turmasEncontradas[0].alunos.forEach(aluno => {
            alunos_presentes[aluno._id] = 0;
        });

        jsonObject.forEach(presence_list => {
            presence_list.presencas.forEach(id => {
                if (alunos_presentes[id]) {
                    alunos_presentes[id] += 1;
                } else {
                    alunos_presentes[id] = 1;
                }
            });
        });
        alunos_presentes["presence_id"] = jsonObject[0]._id
        console.log("here: ", jsonObject[0]._id)



        res.send(alunos_presentes)
  
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});



app.get('/dados-professor/:idProfessor?', async (req, res) => {
    try {
      const user = req.session.user;
      console.log(user.is_admin)
      if (user.is_admin === 0){
        idProfessor = req.session.user._id;
      }
      else{
        idProfessor = req.params.idProfessor;
        console.log('adm logado')
        console.log(idProfessor)
      }

      const professor = await Professor.findById(idProfessor).populate('disciplinas').populate('campus').populate('campus.turmas')
  
      if (!professor) {
        return res.status(404).json({ message: 'Professor not found' });
      }
  
      const disciplinasDoProfessor = professor;
      console.log("dados do professor: ", disciplinasDoProfessor)
      res.json(disciplinasDoProfessor);
    } catch (error) {
      console.error('Error fetching professor disciplines:', error);
      res.status(500).json({ message: 'Error fetching professor disciplines' });
    }
  });

app.get('/dados-turma/:campusId/:turmaId', async (req, res) => {
    try {

      const { campusId, turmaId } = req.params;

      const campus = await Campus.findById(campusId);

      if (!campus) {
        return res.status(404).json({ message: 'Campus not found' });
      }
  
      const turmasEncontradas = [];
  
      campus.turmas.forEach(turma => {
        console.log(turma)
        if (turma._id.toString() === turmaId) {
          
          turmasEncontradas.push(turma);
        }
      });
  
      if (turmasEncontradas.length === 0) {
        return res.status(404).json({ message: 'Turma not found' });
      }

      res.json(turmasEncontradas);
    } catch (error) {
      console.error('Error fetching campus disciplines:', error);
      res.status(500).json({ message: 'Error fetching campus disciplines' });
    }
});

app.get('/nome-turma/:campusId/:turmaId', async (req, res) => {
    try {

      const { campusId, turmaId } = req.params;

      const campus = await Campus.findById(campusId);


      if (!campus) {
        return res.status(404).json({ message: 'Campus not found' });
      }
  
      const turmasEncontradas = [];
  
      campus.turmas.forEach(turma => {
        console.log(turma)
        if (turma._id.toString() === turmaId) {
          turmasEncontradas.push(turma.numero);
        }
      });
  
      if (turmasEncontradas.length === 0) {
        console.log('abacaxi')
        return res.status(404).json({ message: 'Turma not found' });
      }

      res.json(turmasEncontradas);
    } catch (error) {
      console.error('Error fetching campus disciplines:', error);
      res.status(500).json({ message: 'Error fetching campus disciplines' });
    }
  });


app.get('/presence', async (req, res) => {
    try {
        const professor = req.session.user;
        const isAdmin = professor && professor.is_admin === 1;
        const presencas = await Presenca.find();

        if (isAdmin){
            res.render('presence-admin', { title: 'Presença', presencas, isAdmin})
        }
        else{
            res.render('presence', { title: 'Presença', presencas, isAdmin });
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro interno do servidor');
    }
});

app.get('/teste-editar', async (req, res) => {
    try {
        const professor = req.session.user;
        const isAdmin = professor && professor.is_admin === 1;
        const presencas = await Professor.find();

        if (isAdmin){
            res.render('editar', { title: 'Presença', presencas, isAdmin})
        }
        else{
            res.render('editar', { title: 'Presença', presencas, isAdmin });
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro interno do servidor');
    }
});



app.get('/relatorio', async (req, res) => {
    try {
        const professor = req.session.user;
        const isAdmin = professor && professor.is_admin === 1;
        const presencas = await Professor.find();
        res.render('relatorio', { title: 'Relatorio', presencas, isAdmin });
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro interno do servidor');
    }
});

app.get('/presence-admin', async (req, res) => {
    try {
        const professor = req.session.user;

        const isAdmin = professor && professor.is_admin === 1;

        const presencas = await Professor.find();

        res.render('presence-admin', { title: 'Presença', presencas, isAdmin });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro interno do servidor');
    }
});

// Rota para editar apenas as observações de uma presença
app.get('/editar-observacoes-presenca/:id', async (req, res) => {
    try {
        const presencaId = req.params.id;
        // Encontre a presença no banco de dados
        const presenca = await Presenca.findById(presencaId);
        // Renderize a visualização para editar apenas as observações
        res.render('edit-observacoes-presenca', { title: 'Editar Observações de Presença', presenca: presenca });
    } catch (error) {
        console.error('Erro ao buscar presença para edição de observações:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

// Rota para processar a edição das observações de uma presença
app.post('/editar-observacoes-presenca/:id', async (req, res) => {
    try {
        const presencaId = req.params.id;
        const { observacoes } = req.body;
        // Atualize apenas as observações da presença no banco de dados
        await Presenca.findByIdAndUpdate(presencaId, { observacoes: observacoes });
        // Redirecione de volta para a página de presenças após a edição bem-sucedida
        res.redirect('/presence');
    } catch (error) {
        console.error('Erro ao editar observações de presença:', error);
        res.status(500).send('Erro interno do servidor');
    }
});


// Rota para deletar uma presença
app.get('/deletar-presenca/:id', async (req, res) => {
    try {
        const presencaId = req.params.id;
        
        // Lógica para deletar a presença no banco de dados pelo ID
        await Presenca.findByIdAndDelete(presencaId);
        
        // Redireciona para a página de presença após a exclusão bem-sucedida
        res.redirect('/presence');
    } catch (error) {
        console.error('Erro ao deletar presença:', error);
        res.status(500).send('Erro interno do servidor');
    }
});




// Defina uma rota GET para "/presence"
// Defina uma rota GET para "/adicionar-disciplinas-campus"
// app.get('/adicionar-disciplinas-campus', async (req, res) => {
//     try {
//         // Busque os dados necessários do banco de dados, como professores, disciplinas e campus
//         const professors = await Professor.find();
//         const disciplinas = await Disciplina.find();
//         const campus = await Campus.find();

//         // Renderize a visualização do formulário de adicionar disciplinas e campus, passando os dados necessários
//         res.render('form_adicionar_disciplinas_campus', { 
//             title: 'Adicionar Disciplinas e Campus',
//             professors: professors,
//             disciplinas: disciplinas,
//             campus: campus // Certifique-se de passar as campus aqui
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Erro interno do servidor');
//     }
// });

// Rota para renderizar o formulário de adicionar disciplinas e campus (apenas para administradores)



app.get('/adicionar-disciplinas-campus', checkAdminAuth, async (req, res) => {
    try {
       
        const professors = await Professor.find();
        console.log(professors)
        const disciplinas = await Disciplina.find();
        const campus = await Campus.find();
        
        console.log("aqui: ", disciplinas)

        res.render('form_adicionar_disciplinas_campus', { 
            title: 'Adicionar Disciplinas e Campus',
            professors: professors,
            disciplinas: disciplinas,
            campus: campus,
        });

        
        
    } catch (error) {
        console.error('Erro aqui:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

app.get('/adicionar-alunos', checkAdminAuth, async (req, res) => {
    try {
       
        const professors = await Professor.find();
        console.log(professors)
        const disciplinas = await Disciplina.find();
        const campus = await Campus.find();
        
        console.log("aqui: ", disciplinas)

        res.render('adicionar-alunos', { 
            title: 'Adicionar Disciplinas e Campus',
            professors: professors,
            disciplinas: disciplinas,
            campus: campus,
        });

    
        
    } catch (error) {
        console.error('Erro aqui:', error);
        res.status(500).send('Erro interno do servidor');
    }
});


app.get('/criar-campus', checkAdminAuth, async (req, res) => {
    const professors = await Professor.find();
    const disciplinas = await Disciplina.find();
    const campus = await Campus.find();
    
    res.render('criar-campus', {
        title: 'Adicionar Disciplinas e Campus',
        professors: professors,
        disciplinas: disciplinas,
        campus: campus,
    })
});

app.post('/criar-campus', checkAdminAuth, async (req, res) => {
    const {nome} = req.body
    try {
        const novoCampus = new Campus({
            nome: nome
          });
      
        novoCampus.save()
        res.redirect('/criar-campus');
    }
    catch (error) {
        console.error('Erro aqui:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

app.get('/index', checkAuth, async (req, res) => {
    try {

        const professors = await Professor.find();
        console.log(professors)
    
        res.render('index', {
            
            title: 'Adicionar Disciplinas e Campus',
            professors: professors,
           
           
        });

        
        
    } catch (error) {
        console.error('Erro ao renderizar a página de adicionar disciplinas, campus e professor:', error);
        res.status(500).send('Erro interno do servidor');
    }
});


// Rota para processar o formulário de adicionar disciplinas e campus (apenas para administradores)
app.post('/adicionar-disciplinas-campus', checkAdminAuth, async (req, res) => {
    try {
        // Aqui você pode acessar os dados enviados pelo formulário
        const { professorId, disciplinas, campus, turma} = req.body;
        console.log('req body', req.body)
        // Verifique se o professorId foi fornecido
        if (!professorId) {
            return res.status(400).send('ID do professor não fornecido');
        }

     
        const existingProfessor = await Professor.findById(professorId);

        if (!existingProfessor) {
            return res.status(404).send('Professor não encontrado');
        }

        //console.log('Existing Professor:', existingProfessor);
        console.log('disciplinas::', disciplinas);
        console.log('campus::', campus);
        console.log('turmas::', turma);

        existingProfessor.disciplinas.push(disciplinas);
        existingProfessor.campus.push(campus);
        existingProfessor.turmas.push(turma);

        // Salvar as alterações
        await existingProfessor.save();

        res.status(200).send('Informações adicionadas com sucesso!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro interno do servidor');
    }
});


// Rota para buscar os alunos associados à disciplina selecionada
app.get('/alunos-da-disciplina/:campus/:turma', async (req, res) => {
    try {
        const turmaId = req.params.turma;
        const campusId = req.params.campus;
        const campus = await Campus.findById(campusId)
        const turmasJSON = campus.turmas.map(turma => turma.toJSON());
        const foundObject = turmasJSON.find(obj => obj._id.toString() === turmaId);
     
        res.json(foundObject);
    } catch (error) {
        console.error('Erro ao buscar os alunos:', error);
        res.status(500).json({ message: 'Erro ao buscar os alunos' });
    }
});

app.get('/turmas-campus/:campus', async (req, res) => {
    try {
        const turmaId = req.params.turma;
        const campusId = req.params.campus;
        let campus = await Campus.findById(campusId)
        campus = campus.toJSON()
        const numerosTurmas = [];
        campus['turmas'].forEach(turma => {
            numerosTurmas.push(`${turma['numero']}:${turma._id.toString()}`);
        });
        res.json(numerosTurmas);
    } catch (error) {
        console.error('Erro ao buscar os alunos:', error);
        res.status(500).json({ message: 'Erro ao buscar os alunos' });
    }
});

app.post('/inserir-presenca', isAdmin, async (req, res) => {
    try {
        // Verificar se o usuário é um administrador
        if (!req.session.user.is_admin) {
            return res.status(403).send('Apenas administradores podem inserir o campus.');
        }

        // Extrair os dados da requisição
        const { disciplina, data, alunos } = req.body;

        // Verificar se foram fornecidos alunos para inserção de presença
        if (!alunos || alunos.length === 0) {
            return res.status(400).send('Nenhum aluno selecionado.');
        }

        // Verificar se a disciplina e a data foram fornecidas
        if (!disciplina || !data) {
            return res.status(400).send('Disciplina e data são obrigatórias.');
        }

        // Verificar se os alunos fornecidos são IDs válidos
        const invalidAlunos = alunos.filter(alunoId => !mongoose.Types.ObjectId.isValid(alunoId));
        if (invalidAlunos.length > 0) {
            return res.status(400).send(`IDs inválidos de alunos: ${invalidAlunos.join(', ')}`);
        }

        // Iterar sobre os alunos selecionados e salvar a presença de cada um
        const presencas = await Promise.all(alunos.map(async alunoId => {
            const novaPresenca = new Presenca({
                disciplina: disciplina,
                data: data,
                aluno: alunoId,
                presente: true // Você pode definir como necessário, dependendo da lógica de sua aplicação
            });
            return await novaPresenca.save();
        }));

        res.status(200).json(presencas); // Responder com as presenças criadas
    } catch (error) {
        console.error('Erro ao inserir presença:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('csvFile'), async (req, res) => {
    const { campus } = req.body;
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    try {
        // Encontre o campus existente
        const campusExistente = await Campus.findById(campus);
        if (!campusExistente) {
            return res.status(404).send('Campus not found.');
        }

        const turmasMap = {}; 

        // Ler o arquivo CSV e processar os dados
        fs.createReadStream(req.file.path)
            .pipe(csv({ separator: ',' })) 
            .on('data', (row) => {
                const turmaNumero = row['turma'];
                const alunoNome = row['nome'];

               
                let turmaExistente = turmasMap[turmaNumero];

                
                if (!turmaExistente) {
                    turmaExistente = { numero: turmaNumero, alunos: [] };
                    turmasMap[turmaNumero] = turmaExistente;
                }

                
                turmaExistente.alunos.push({ nome: alunoNome });
            })
            .on('end', async () => {
                
                for (const turmaNumero in turmasMap) {
                    campusExistente.turmas.push(turmasMap[turmaNumero]);
                }

    
                await campusExistente.save();
                fs.unlinkSync(req.file.path); 
                res.redirect('/adicionar-alunos');
            })
            .on('error', (error) => {
                console.error('Error while reading CSV:', error);
                res.status(500).send('Error while reading CSV');
            });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/get-campus', async (req, res) => {
    try {
        const campus = await Campus.find()
        res.json(campus)

    } catch (error) {
        console.error('Erro ao buscar os alunos:', error);
        res.status(500).json({ message: 'Erro ao buscar os alunos' });
    }
});
  
  // Start the server
  const port = 3000;
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
  

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});