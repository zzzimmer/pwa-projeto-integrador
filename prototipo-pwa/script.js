let telaAnterior = 'tela-home'
let telaAtual = 'tela-home'
let eventoAtualId = null;

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

    let idUser; // Você não parece usar essa variável
    let url = `http://localhost:8080/usuario/${idUsuario}/eventos`;
    const telaEventos = document.getElementById("tela-meus-eventos");

    try {
        navegar('tela-meus-eventos');
        telaEventos.innerHTML = "<h2>Carregando seus eventos ... :) </h2>";

        const response = await axios.get(url);
        const eventos = response.data;

        // 1. Cria o elemento acordeão FORA do loop
        telaEventos.innerHTML = `
            <div class="accordion" id="accordionMeusEventos">
                </div>
        `;

        const accordionWrapper = document.getElementById("accordionMeusEventos");

        eventos.forEach(evento => {
            const accordionItem = document.createElement("div");
            accordionItem.className = "accordion-item";

            // ID único para este item do acordeão
            const collapseId = `collapse-${evento.id}`;

            accordionItem.innerHTML = `
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" 
                            data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
                        
                        <div>
                            <div>${evento.name}</div>
                            <small class="text-muted">${evento.data}</small> 
                        </div>
                    </button>
                </h2>
                <div id="${collapseId}" class="accordion-collapse collapse" data-bs-parent="#accordionMeusEventos">

                    <div class="accordion-body">        
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <p class="mb-1">${evento.local}</p>
                                <p class="mb-0">${evento.horario}</p>
                            </div>
                            
                            <div class="dropdown">
                                <button class="btn btn-link" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    &#8942; </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#">Editar</a></li>
                                    <li><a class="dropdown-item" href="#">Excluir</a></li>
                                </ul>
                            </div>
                        </div>

                        <div class="d-grid gap-2 mt-3">
                            <button class="btn btn-outline-primary" type="button" onclick="verListaDeConvidados(${evento.id})">
                                Lista de Convidados
                            </button>
                        </div>

                    </div>
                </div>
            `;

            accordionWrapper.appendChild(accordionItem);
        });

        navegar('tela-meus-eventos');
        return idUser;
    } catch (error) {
        console.error("Erro ao carregar seus eventos:", error);
    }
}

async function verListaDeConvidados(id) {
    try {

        eventoAtualId = id;
        // 1. Pegue APENAS o elemento da lista (UL)
        const unorderedList = document.getElementById("detalhes-lista-ul");

        // 2. Navegue para a tela
        navegar("tela-convidados-evento");

        // 3. Coloque o "Carregando..." DENTRO da lista
        // unorderedList.innerHTML = "<li class='list-group-item'>Carregando...</li>";

        const url = `http://localhost:8080/usuario/eventos/${id}`

        const response = await axios.get(url);
        const evento = response.data;
        const convidados = evento.convidados;
        console.log(convidados);
        console.log(evento);

        // 4. Limpe a lista (removendo o "Carregando...") ANTES do loop
        unorderedList.innerHTML = "";

        // 5. Verifique se a lista está vazia
        if (convidados.length === 0) {
            unorderedList.innerHTML = "<li class='list-group-item'>Nenhum convidado cadastrado para este evento.</li>";
            return;
        }

        // 6. Faça o loop corretamente
        convidados.forEach(convidado => {
            // Use "+=" para ADICIONAR
            // Use "convidado" (a string) e não "convidado.emailConvidado"
            unorderedList.innerHTML += `<li class="list-group-item">${convidado}</li>`;
        });

    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
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