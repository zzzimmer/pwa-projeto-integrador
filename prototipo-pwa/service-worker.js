/**
 * Versão do cache, é importante mudar o valor da variável 'version'
 * toda vez que algum dos arquivos em no array 'arquivos' for modificado
 * isso garante que a aplicação será atualizada nos clientes onde já exista
 * um cache salvo
 */
const version = 2
const cachename = 'app-cache-v'+version

/**
 * Arquivos que serão salvos no cache para uso offline
 * O caminho para os arquivos deve ser completo e sem o dominio
 * Ex: arquivo logo.png
 *      URL: https://bpvifsc.github.io/template-app-pwa/imagens/logo.png
 *      Caminho: /template-app-pwa/imagens/logo.png
 * Ou utilizar caminhos relativos ao arquivo html aberto
 * Ex: arquivo aberto index.html (utilizar em PWA)
 *      URL: https://bpvifsc.github.io/template-app-pwa/index.html
 *      Caminho: ./imagens/logo.png
 */
const arquivos = [
    "./",
    "./index.html",
    "./script.js"
  ]

  /**
   * Cria o cache dos arquivos
   */
  self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open(cachename).then(function(cache) {
        return cache.addAll(arquivos);
      })
    );
  });
  
  /**
   * Verifica se existe uma versão em cache das páginas
   * Caso não seja possivel retorna o match(index) da catch
   * Está página pode ser tratada e retornar uma mensagem de erro/offline
   */
  // self.addEventListener('fetch', function(event) {
  //   event.respondWith(caches.match(event.request).then(function(response) {
  //     if (response !== undefined) {
  //       return response;
  //     } else {
  //       return fetch(event.request).then(function (response) {
  //         let responseClone = response.clone();
          
  //         caches.open(cachename).then(function (cache) {
  //           cache.put(event.request, responseClone);
  //         });
  //         return response;
  //       }).catch(function () {
  //         return caches.match('./index.html');
  //       });
  //     }
  //   }));
  // });

  /**
   * Tava tendo uns problemas com Token, precisei investigar isso.
   * Descobri que pro navegador tudo é requisição, tanto mpuxar dados da API quanto pegar os elementos de HTML. Então o Gemini me mostrou que da pra implementar um "filtro" das requisições do navegador
   */

  self.addEventListener('fetch', function(event) {
  // se a URL for da API (contém o prexifo de localhost:8080) não usa cache
  if (event.request.url.includes('localhost:8080')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // o else, no caso arquivos estáticos (html, css, js e imagens), continua priorizando o cache
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        return response;
      }
      return fetch(event.request).then(function(response) {
        // Não cacheia respostas inválidas
        if(!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        let responseClone = response.clone();
        caches.open(cachename).then(function(cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      });
    })
  );
});