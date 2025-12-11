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


const API_URL = "http://localhost:8080";

let telaAnterior = 'tela-home'
let telaAtual = 'tela-home'
let eventoAtualId = null;
const corPrimaria = "#003366"
const delay = ms => new Promise(res => setTimeout(res,ms));




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


async function carregarTelaMeusEventos(){

    const accordionWreapper = document
        .getElementById("accordionMeusEventos");

    navegar('tela-meus-eventos');
    accordionWreapper.innerHTML = `
        <div class="text-center mt-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted small">Buscando seus eventos...</p>
        </div>`;

    try{

        const eventos = await buscaEventosAPI();

        renderizarTelaMeusEventos(eventos, accordionWreapper);
    } catch (error){
        accordionWreapper.innerHTML = `
            <div class="text-center mt-5">
                <p class="text-danger">Erro ao carregar eventos.</p>
                <button class="btn btn-sm btn-outline-secondary" onclick="carregarTelaMeusEventos()">Tentar novamente</button>
            </div>`;
    }
}

async function buscaEventosAPI(){
    const url = `${API_URL}/usuario/meus-eventos`;
    const response = await axios.get(url);
    return response.data;
}

async function renderizarTelaMeusEventos(eventos, container){

    container.innerHTML = "";

    if (!eventos || eventos.length ==0){
        container.innerHTML = "<p class='text-center text-muted mt-4'>Você ainda não criou eventos.</p>";
        return;
    } else {
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
            container.innerHTML += itemHTML;
        });
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
        const chaveValorEmailData = evento.mailDoConvidado_dataConvite;
        // console.log(chaveValorEmailData);

        tituloEvento.textContent = `Evento: ${evento.name}`; // nome do evento
        containerLista.innerHTML = ""; //limpa o loading

        if (!chaveValorEmailData || Object.keys(chaveValorEmailData).length === 0) {
            containerLista.innerHTML = "<p class='text-center text-muted mt-4'>Nenhum convidado ainda.</p>";
            return;
        }
        // console.log(Object.keys(chaveValorEmailData));
        const listaConvidados = Object.entries(chaveValorEmailData);
        // console.log(listaConvidados);

        listaConvidados.forEach(([convidadoEmail,data],index) => {

            const itemId = `guest-item-${index}`;


            const itemHTML = `
            <div class="accordion-item border-0 border-bottom">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed shadow-none bg-white text-dark" type="button" 
                            data-bs-toggle="collapse" data-bs-target="#${itemId}" 
                            aria-expanded="false">
                        
                        <div class="d-flex flex-column text-start">
                            <span class="fw-medium text-truncate" style="max-width: 250px;">${convidadoEmail}</span>
                            <small class="text-muted" style="font-size: 0.75rem;">Convidado em: ${data}</small>
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
        })

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

    const url = `${API_URL}/usuario/criar-evento`;

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

axios.interceptors.request.use(function (config){
    const token = localStorage.getItem('token');
    if (token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

//para lidar com tokens expirados
axios.interceptors.response.use( response => response, error => {
    if (error.response && (error.response.status === 403 || error.response.status === 401)){
        alert("Sessão expirada, Faça login novamente");
        localStorage.removeItem('token');
        navegar('tela-abertura');
    }
    return Promise.reject(error);
});

async function realizarLogin(){
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-senha').value;

    // console.log(email, password)

    if (!email || !password) {
        alert("Preencha e-mail e senha");
        return;
    }
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email : email,
            password : password
        });

        //salvar token vindo da requisição
        const token = response.data.token;
        //ou name, tem que ver A ou O
        const nome = response.data.name;

        localStorage.setItem('token', token);
        localStorage.setItem('usuarioNome', nome);

        document.getElementById('login-email').value="";
        document.getElementById('login-senha').value="";

        navegar('tela-home');
    } catch (error) {
        console.error(error);
        alert("Falha no login. Verifique e-mail e senha.");
    }
}

async function realizarCadastro() {
    const nome = document.getElementById('cad-nome').value;
    const email = document.getElementById('cad-email').value;
    // const telefone = document.getElementById('cad-telefone').value;
    const password = document.getElementById('cad-senha').value;

    if (!nome || !email || !password) {
        alert("Preencha todos os campos obrigatórios");
        return;
    }

    try {
        const payload = {
            name: nome,
            email: email,
            password: password
        };

        const response = await axios.post(`${API_URL}/auth/register`, payload);

        // pegar o token na resposta, ja que a api fornece
        const token = response.data.token;
        localStorage.setItem('token', token);
        localStorage.setItem('usuarioNome', response.data.name);

        alert("Conta criada com sucesso!");
        navegar('tela-home');

    } catch (error) {
        console.error(error);
        alert("Erro ao criar conta. Tente outro e-mail.");
    }
}

function sair(){

    localStorage.removeItem('token');
    localStorage.removeItem('usuarioNome');

    document.getElementById("accordionMeusEventos").innerHTML = "";
    document.getElementById("listaConvidadosAccordion").innerHTML = "";

    navegar('tela-abertura')
}

