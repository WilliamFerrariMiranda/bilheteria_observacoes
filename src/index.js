const express = require('express');
const app = express();
app.use(express.json());
const axios = require('axios');

const observacoesPorBilheteId = {};
const {
    v4: uuidv4
} = require('uuid');

const funcoes = {
    ObservacaoClassificada: (observacao) => {
        const observacoes =
        observacoesPorBilheteId[observacao.bilheteId];
        const obsParaAtualizar = observacoes.find(o => o.id ===
            observacao.id)
        obsParaAtualizar.status = observacao.status;
        axios.post('http://localhost:10000/eventos', {
            tipo: "ObservacaoAtualizada",
            dados: {
                id: observacao.id,
                texto: observacao.texto,
                bilheteId: observacao.bilheteId,
                status: observacao.status
            }
        });
    }
}
app.post("/eventos", (req, res) => {
    try {
        funcoes[req.body.tipo](req.body.dados);
    } catch (e) {}
    res.status(200).send({ msg: "ok" });
});

//:id é um placeholder
//exemplo: /lembretes/123456/observacoes
app.put('/bilhetes/:id/observacoes', async(req, res) => {
    const idObs = uuidv4();
    const {
        texto
    } = req.body;
    //req.params dá acesso à lista de parâmetros da URL
    const observacoesDoBilhete =
        observacoesPorBilheteId[req.params.id] || [];
    observacoesDoBilhete.push({
        id: idObs,
        texto,
        status: 'aguardando'
    });
    observacoesPorBilheteId[req.params.id] =
        observacoesDoBilhete;
    await axios.post('http://localhost:10000/eventos', {
        tipo: "ObservacaoCriada",
        dados: {
            id: idObs,
            texto,
            lembreteId: req.params.id,
            status: 'aguardando'
        }
    })
    res.status(201).send(observacoesDoBilhete);
});
app.get('/bilhetes/:id/observacoes', (req, res) => {
    res.send(observacoesPorBilheteId[req.params.id] || []);

});
app.listen(5000, (() => {
    console.log('Bilhetes. Porta 5000');
}));