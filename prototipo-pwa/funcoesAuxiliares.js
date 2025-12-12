let telaAnterior = 'tela-home'
let telaAtual = 'tela-home'

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

export function navegar(destino) {
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

function sair(){

    localStorage.removeItem('token');
    localStorage.removeItem('usuarioNome');

    document.getElementById("accordionMeusEventos").innerHTML = "";
    document.getElementById("listaConvidadosAccordion").innerHTML = "";

    navegar('tela-abertura')
}

window.navegar = navegar;
window.sair = sair;

