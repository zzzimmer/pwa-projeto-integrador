let telaAnterior = 'tela-home'
let telaAtual = 'tela-home'
let eventoAtualId = null;
const corPrimaria = "#003366"
const delay = ms => new Promise(res => setTimeout(res,ms));

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("./service-worker.js");
}

var pedidoInstalacao;
window.addEventListener('beforeinstallprompt', function (installPrompt) {
    if (installPrompt) {
        document.getElementById("installAppBt").classList.add('show')
        pedidoInstalacao = installPrompt
    }
});

function installApp() {
    pedidoInstalacao.prompt();
}


function navegar(destino) {
    let telas = document.getElementsByClassName('tela')
    Array.from(telas).forEach(element => {
        element.classList.remove('show')
        element.classList.add('collapse')
    });
    document.getElementById(destino).classList.remove('collapse')
    document.getElementById(destino).classList.add('show')
    telaAnterior = telaAtual
    telaAtual = destino
}

function voltar() {
    navegar(telaAnterior)
}

async function popularTelaMeusEventos(idUsuario) {
    const url = `http://localhost:8080/usuario/${idUsuario}/eventos`;

    // buscar accordion ao inves de toda tela. Tecnica AppShell
    const accordionWrapper = document.getElementById("accordionMeusEventos");

    try {
        navegar('tela-meus-eventos');

        // loader enquanto carrega a requisicao
        accordionWrapper.innerHTML = `
            <div class="text-center mt-5">
                <div class="spinner-border text-primary" role="status"></div>
            </div>`;

        const response = await axios.get(url);
        const eventos = response.data;

        // remove o loader pos retorno requisicao
        accordionWrapper.innerHTML = "";

        if (eventos.length === 0) {
            accordionWrapper.innerHTML = "<p class='text-center text-muted mt-4'>Você ainda não criou eventos.</p>";
            return;
        }

        eventos.forEach(evento => {
            //cria o accordeon de cada evento
            const collapseId = `collapse-${evento.id}`;
            const headerId = `heading-${evento.id}`;

            const itemHTML = `
            <div class="accordion-item border-0 border-bottom">
                <h2 class="accordion-header" id="${headerId}">
                    <button class="accordion-button collapsed shadow-none bg-white text-dark align-items-start" 
                            type="button" 
                            data-bs-toggle="collapse" 
                            data-bs-target="#${collapseId}" 
                            aria-expanded="false" 
                            aria-controls="${collapseId}">
                        
                        <div class="d-flex flex-column w-100">
                            <span class="fw-normal mb-1" style="font-size: 1.05rem;">${evento.name}</span>
                            <span class="text-muted small">${evento.data}</span>
                        </div>
                    </button>
                </h2>
                <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headerId}" data-bs-parent="#accordionMeusEventos">
                    <div class="accordion-body pt-0 pb-4">
                        
                        <div class="d-flex justify-content-between">
                            <div class="text-muted small mb-3">
                                <div class="mb-1">${evento.local}</div>
                                <div>${evento.horario}</div>
                            </div>

                            <div class="dropdown">
                                <button class="btn btn-link text-dark p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="bi bi-three-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
                                    <li><a class="dropdown-item" href="#">Editar Evento</a></li>
                                    <li><a class="dropdown-item text-danger" href="#">Cancelar Evento</a></li>
                                </ul>
                            </div>
                        </div>

                        <div class="d-grid">
                            <button class="btn btn-outline-primary py-2 fw-normal" 
                                    style="border-color: #003366; color: #003366;"
                                    onmouseover="this.style.backgroundColor='#003366'; this.style.color='white';"
                                    onmouseout="this.style.backgroundColor='transparent'; this.style.color='#003366';"
                                    type="button" 
                                    onclick="verListaDeConvidados(${evento.id})">
                                Lista de Convidados
                            </button>
                        </div>

                    </div>
                </div>
            </div>
            `;

            accordionWrapper.innerHTML += itemHTML;
        });

    } catch (error) {
        // console.error("Erro ao carregar eventos:", error);
        accordionWrapper.innerHTML = "<p class='text-center text-danger mt-3'>Erro ao buscar eventos.</p>";
    }
}

async function verListaDeConvidados(id) {
    try {
        eventoAtualId = id;
        navegar("tela-convidados-evento");

        const containerLista = document.getElementById("listaConvidadosAccordion");
        const tituloEvento = document.getElementById("nome-evento-convidados");

        // limpa a lista antes de carregar
        containerLista.innerHTML = `
            <div class="text-center mt-5 text-muted">
                <div class="spinner-border text-primary" role="status"></div>
            </div>`;

        const url = `http://localhost:8080/usuario/eventos/${id}`;

        const response = await axios.get(url);
        const evento = response.data;
        const convidados = evento.convidados;

        tituloEvento.textContent = `Evento: ${evento.name}`; // nome do evento
        containerLista.innerHTML = ""; //limpa o loading

        if (!convidados || convidados.length === 0) {
            containerLista.innerHTML = "<p class='text-center text-muted mt-4'>Nenhum convidado ainda.</p>";
            return;
        }

        // aqui gera o html do accordeon para convidado
        convidados.forEach((convidadoEmail, index) => {

            // Criamos IDs únicos baseados no index para o Bootstrap saber quem abre quem
            const itemId = `guest-item-${index}`;

            // por hora, simular a data
            const dataFicticia = "dd/MM/yyyy";

            const itemHTML = `
            <div class="accordion-item border-0 border-bottom">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed shadow-none bg-white text-dark" type="button" 
                            data-bs-toggle="collapse" data-bs-target="#${itemId}" 
                            aria-expanded="false">
                        
                        <div class="d-flex flex-column text-start">
                            <span class="fw-medium text-truncate" style="max-width: 250px;">${convidadoEmail}</span>
                            <small class="text-muted" style="font-size: 0.75rem;">Convidado em: ${dataFicticia}</small>
                        </div>

                    </button>
                </h2>
                <div id="${itemId}" class="accordion-collapse collapse" data-bs-parent="#listaConvidadosAccordion">
                    <div class="accordion-body text-center bg-light">
                        <div class="d-grid">
                            <button class="btn btn-outline-danger bg-white" 
                                    onclick="console.log('Remover ${convidadoEmail}')">
                                Remover da Lista
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `;

            containerLista.innerHTML += itemHTML;
        });

    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
        document.getElementById("listaConvidadosAccordion").innerHTML =
            "<p class='text-center text-danger mt-3'>Erro ao carregar convidados.</p>";
    }
}


async function convidarPorEmail(email) {
    //primeiro a função configura o modal com os valores do convidado-email, texto pergunta

    //verifica se é não nulo e retira os espaços em branco
    const valor = (email || '').trim();

    document.getElementById('modal-convidado-email').textContent = valor;
    document.getElementById('modal-texto-pergunta').textContent = "Deseja enviar o convite para este e-mail?"

    const modalConfirmarConvite = document.getElementById('modal-confirmar-convite')

    // então realiza a criação do objeto modal
    const modal = new bootstrap.Modal(modalConfirmarConvite);

    // cria uma variavel para o botão dentro do modal
    const btn = document.getElementById('btn-confirmar-convite')

    // configura a função async efetuada ao clicar o btn
    btn.onclick = async function () {
        try {
            btn.disabled = true;
            btn.textContent = "Enviando..."

            const url = `http://localhost:8080/usuario/eventos/${eventoAtualId}/convidar`;
            const payload = { email: valor };

            const resp = await axios.put(url, payload);
            modal.hide();

            alert('Convite enviado com sucesso. ')


            // verListaDeConvidados(eventoAtualId); //bug no botão voltar devido a variável telaAnterior e telaAtual assumirem o mesmo valor "tela-convidados-evento" durante o fluxo da função.
            navegar('tela-meus-eventos');
            const input = document.getElementById("email-buscado")
            input.value = "";
        } catch (err) {
            console.error('Erro ao enviar convite: ', err);
            alert('Erro ao enviar convite. Veja console para detalhes')
        } finally {
            btn.disabled = false;
            btn.textContent = 'Sim';
        }
    };
    modal.show();
}

function telaInserirDadosEvento() {
    //seguindo a ideia de App Shell
    document.getElementById('inputNomeEvento').value = '';
    document.getElementById('inputEndereco').value = '';
    document.getElementById('inputData').value = '';
    document.getElementById('inputHorario').value = '';

    navegar('tela-inserir-dados-evento');
}

function mostrarModalFeedback(tipo, titulo, mensagem) {
    const modalEl = document.getElementById('modal-feedback');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

    const iconSuccess = document.getElementById('icone-sucesso');
    const iconError = document.getElementById('icone-erro');
    const titleEl = document.getElementById('feedback-titulo');
    const msgEl = document.getElementById('feedback-mensagem');

    titleEl.textContent = titulo;
    msgEl.textContent = mensagem;

    // configura icones e cores
    if (tipo === 'sucesso') {
        iconSuccess.style.display = 'block';
        iconError.style.display = 'none';
        titleEl.className = "fw-bold mb-2 text-success";
    } else {
        iconSuccess.style.display = 'none';
        iconError.style.display = 'block';
        titleEl.className = "fw-bold mb-2 text-danger";
    }

    modal.show();
    // retorna a instância para poder fechar depois via código se quiser
    return modal;
}

async function criarEvento(){

    const url = `http://localhost:8080/usuario/2/eventos`;

    const valName = document.getElementById('inputNomeEvento').value;
    const valData = document.getElementById('inputData').value;
    const valHorario = document.getElementById('inputHorario').value;
    const valLocal = document.getElementById('inputEndereco').value;

    const payload = {
        name : valName,
        data : valData,
        horario : valHorario,
        local : valLocal,
    }

    await axios.post(url, payload)
        .then( async function (response){ // essa função precsa ser async para usar o await delay
            const modalSucesso = mostrarModalFeedback('sucesso','Sucesso!','Seu evento foi agendado.');
            await delay(3000);

            modalSucesso.hide();

            navegar('tela-home')

        }) .catch( async function (error){
            let mensagemError = "Erro inesperado"

            if (error.response){// a requisição saiu e chegou no servidor. Erro foi la

                mensagemError = "Erro na sua requisição. Ajuste os campos";

            } else if (error.request){ // a requisição saiu mas não chegou ao servidor
                mensagemError = "Sem conexão com o servidor"

            } else { // requisição nem saiu
                mensagemError = error.message;
        }
            const modalErro = mostrarModalFeedback("erro", "Ops!", mensagemError)
            await delay(3000);
            modalErro.hide();
    });



}