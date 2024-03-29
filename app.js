const vm = new Vue({
  el: "#app",
  data: {
    produtos: [],
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
    fetchProdutos() {
      fetch("./api/produtos.json").then((response) =>
        response.json().then((response) => {
          this.produtos = response;
        })
      );
    },
  },
  created() {
    this.fetchProdutos();
  },
});
