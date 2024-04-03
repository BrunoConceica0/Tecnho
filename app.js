const vm = new Vue({
  el: "#app",
  data: {
    produtos: [],
    produto: false,
  },
  filters: {
    formatarValorReal(valor) {
      return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    },
  },
  methods: {
    // ao click no item do produto, aparecera mais informação do produto selecionado,
    fetchProdutos() {
      fetch("./api/produtos.json").then((response) =>
        response.json().then((response) => {
          this.produtos = response;
        })
      );
    },
    // esta função ela ira puxar somente o id do produto selecionado, para obter os dados do item, por isso tem um paramentro de id e ao puxar o fetch pegar todas as informação do  único item
    fetchProduto(id) {
      fetch(`./api/produtos/${id}/dados.json`).then((response) =>
        response.json().then((response) => {
          this.produto = response;
        })
      );
    },
    //Reaproveitado o fetchProduto, ao click em algum item, o site subira ao top, fazendo que, quando o usuário estive em abaixo do site, ele vera o conteúdo pela metade para o modal esta fixado em cima, quando ao clicar o produto, ele subira e vera o conteúdo por completo.
    abrirModal(id) {
      this.fetchProduto(id);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },

    // O evento outside pode ser feito quando o dois elementos de target e currentTarget forem igual ao click, quando é clicado com target, ele vai pegar o section do elemento, por tanto o currentTarget ele vai pegar o que exatamento foi clicado, se for acaso der um click para fora do container, ele vai pegar o section do elemento. Pode destruturar o paramentro, não percisa necessariamente usar o event
    fecharModal({ target, currentTarget }) {
      if (target === currentTarget) this.produto = false;
    },
  },
  // mostra os dados e valor em precisa um de evento antes, ele já é populado quado iniciamos a site
  created() {
    this.fetchProdutos();
  },
});
