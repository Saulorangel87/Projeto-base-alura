import ui from "./ui.js";
import api from "./api.js";

const pensamentosSet = new Set()

async function adicionarChaveAoPensamento() {
    try {
        const pensamentos = await api.buscarPensamentos()
        pensamentos.forEach(pensamento => {
            const chavePensamento =
                `${pensamento.conteudo.trim().toLowerCase()}-${pensamento.autoria.trim().toLowerCase()}`
            pensamentosSet.add(chavePensamento)
        });
    } catch (error) {
        alert("Erro ao adicionar chave ao pensamento!")
    }
}

function removerEspacos(strind) {
    return strind.replaceAll(/\s+/g, '')
}

const regexConteudo = /^[A-Za-zÁ-ÿ\s.]{10,}$/

function validarConteudo(conteudo) {
    return regexConteudo.test(conteudo)
}

const regexAutoria = /^[A-Za-zÁ-ÿ\s.]{3,15}$/


function validarAutoria(autoria) {
    return regexAutoria.test(autoria)
}

document.addEventListener("DOMContentLoaded", () => {
    ui.renderPensamentos()
    adicionarChaveAoPensamento()

    const formularioPensamento = document.getElementById("pensamento-form")
    const botaoCancelar = document.getElementById("botao-cancelar")
    const inputBusca = document.getElementById("campo-busca")

    formularioPensamento.addEventListener("submit", manipularSubmissaoFormulario)
    botaoCancelar.addEventListener("click", manipularCancelamento)
    inputBusca.addEventListener("input", manipularBusca)
})

async function manipularSubmissaoFormulario(event) {
    event.preventDefault();
    const id = document.getElementById("pensamento-id").value
    const conteudo = document.getElementById("pensamento-conteudo").value
    const autoria = document.getElementById("pensamento-autoria").value
    const data = document.getElementById("pensamento-data").value

    const conteudiSemEspacos = removerEspacos(conteudo)
    const autoriaSemEspacos = removerEspacos(autoria)

    if (!validarConteudo(conteudiSemEspacos)) {
        alert("O conteúdo do pensamento é obrigatório e deve conter no mínimo 10 caracteres.")
        return
    }

    if (!validarAutoria(autoriaSemEspacos)) {
        alert("A autoria do pensamento é obrigatória e deve conter no mínimo 3 e no máximo 15 caracteres.")
        return
    }

    if (!validarData(data)) {
        alert("Não é pemitido o cadastro de datas futuras, selecione outra data.")
        return
    }

    const chaveNovoPensamento =
        `${conteudo.trim().toLowerCase()}-${autoria.trim().toLowerCase()}`

    if (pensamentosSet.has(chaveNovoPensamento)) {
        alert("Esse pensamento já existe!")
        return
    }

    try {
        if (id) {
            await api.editarPensamento({ id, conteudo, autoria, data })
        } else {
            await api.salvarPensamento({ conteudo, autoria, data })
        }
        ui.renderPensamentos()
    }
    catch (error) {
        alert("Erro ao salvar o pensamento!")
    }
}

function manipularCancelamento() {
    ui.limparFormulario()
}

async function manipularBusca() {
    const termoBusca = document.getElementById("campo-busca").value
    try {
        const pensamentosFiltrados = await api.buscarPensamentosPorTermo(termoBusca)
        ui.renderPensamentos(pensamentosFiltrados)
    } catch (error) {
        alert("Erro ao realizar a busca")
    }
}

function validarData(data) {
    const dataAtual = new Date()
    const dataInserida = new Date(data)
    return dataInserida <= dataAtual
}