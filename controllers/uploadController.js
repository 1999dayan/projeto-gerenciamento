// controllers/uploadController.js

const fs = require('fs');
const multer = require('multer');
const mammoth = require('mammoth');
const Presenca = require('../models/Presenca');

// Configuração do multer
const upload = multer({ dest: __dirname + '/../uploads/' });

exports.uploadFile = (req, res) => {
    upload.single('arquivo')(req, res, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao fazer o upload do arquivo.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
        }

        const arquivo = req.file;

        const extensao = arquivo.originalname.split('.').pop().toLowerCase();
        if (extensao !== 'txt' && extensao !== 'docx') {
            fs.unlinkSync(arquivo.path);
            return res.status(400).json({ message: 'Formato de arquivo inválido. Permitidos: .txt, .docx' });
        }

        const uploadPath = arquivo.path;

        if (extensao === 'docx') {
            mammoth.extractRawText({ path: uploadPath })
                .then(result => {
                    const texto = result.value;
                    const novaPresenca = new Presenca({ observacoes: texto });
                    novaPresenca.save()
                        .then(() => {
                            fs.unlinkSync(uploadPath);
                            // Redirecione para a página de presença após o upload bem-sucedido
                            res.redirect('/presence');
                        })
                        .catch(err => {
                            fs.unlinkSync(uploadPath);
                            res.status(500).json({ message: 'Erro ao salvar os dados no banco de dados.' });
                        });
                })
                .catch(err => {
                    fs.unlinkSync(uploadPath);
                    res.status(500).json({ message: 'Erro ao converter o arquivo para JSON.' });
                });
        } else if (extensao === 'txt') {
            fs.readFile(uploadPath, 'utf8', (err, data) => {
                if (err) {
                    fs.unlinkSync(uploadPath);
                    return res.status(500).json({ message: 'Erro ao ler o arquivo de texto.' });
                }
                const novaPresenca = new Presenca({ observacoes: data });
                novaPresenca.save()
                    .then(() => {
                        fs.unlinkSync(uploadPath);
                        // Redirecione para a página de presença após o upload bem-sucedido
                        res.redirect('/presence');
                    })
                    .catch(err => {
                        fs.unlinkSync(uploadPath);
                        res.status(500).json({ message: 'Erro ao salvar os dados no banco de dados.' });
                    });
            });
        }
    });
};

