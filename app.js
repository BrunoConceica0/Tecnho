const vm = new Vue({
  el: "#app",
  data: {
    produtos: [],
    produto: false,
    carrinho: [],
    mensagemAlerta: "",
    ativarAlerta: false,
  },
  filters: {
    formatarValorReal(valor) {
      return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    },
  },
  computed: {
    // Para funcionar tem que colocar o carrinhoTotal no template com algum tag sem precisa de colocar a (), saira o valor total
    // 1* passo colocar um let totol = 0, return total, tem que conferir se existe o item no carrinho. se existir, tem que fazer um interração para cada item no carrinho usado forEach, em sequêmcia coloque total+=item.preco.
    carrinhoTotal() {
      let total = 0;
      if (this.carrinho.length) {
        this.carrinho.forEach((item) => {
          total += item.preco;
        });
      }
      return total;
    },
  },
  methods: {
    // ao click no item do produto, aparecera mais informação do produto selecionado
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
    //Para adiocinar os itens selecionado pelo usuário no carrinho.
    //Primeiro passo: cada item tem o seu estoque, no momento é clicando para adicionar ao carrinho tem que diminuir o seu estoque.
    //Segundo passo: tem que colocar os item selecionados no carrinho, crie um novo objeto com array de lista "carrinho:[]", em sequencia pegue o id, nome e preco da lista de produto pode fazer destruturado, e adiciona no carrinho com metodo de push()
    adicionarItem() {
      if (this.produto.estoque > 0) {
        this.produto.estoque--;
        const { id, nome, preco } = this.produto;
        this.carrinho.push({ id, nome, preco });
        this.alerta(`${nome} adicionado ao carrinho.`);
      } else {
        this.alerta(`Este item está esgotado.`);
      }
    },
    // Para remover o item esta no carrinho é necessário usar o metodo de splice, altera o conteúdo de uma lista, adicionando novos elementos enquanto remove elementos antigos, usando o paramentro de index quando for usar diretiva no element html v-for do carrinho, pega o index e coloque o botão de remove junto com o loop e adicione a função ao click removeItem(index), pagara o index o elemento e removerá.
    removeItem(index) {
      this.carrinho.splice(index, 1);
    },
    // Salvando os dados do usuário com localStorage:
    //Primeiro, faça uma condição se existir algum no localStorage no carrinho e faça um ação para pode usar a armazenagem dos objetos usando com referente o this carrinho, tem que converter voltar para string com parse()
    checarLocalStorage() {
      if (window.localStorage.carrinho)
        this.carrinho = JSON.parse(window.localStorage.carrinho);
    },

    //  O alerta mensagem, coloque um paramentro para deixar um mensagem, e coloque mensagemAlerta é igual ao paramentro, e deixando o objeto false com true para ativar o classe, para não fica para sempre a mensagem, é colocado setTimeout, em 3s dar ao objeto com false novamento. Da para reutilizar a função como por exemplo (this.alerta(`${nome} adicionado ao carrinho.`);)
    alerta(mensagem) {
      this.mensagemAlerta = mensagem;
      this.ativarAlerta = true;
      setTimeout(() => {
        this.ativarAlerta = false;
      }, 3000);
    },
  },
  // Observado os eventos do carrinho, o wacth vai observar o dados do localStorage e vai aramzena os dados para fazer um ação. usando o JSON.strigify tirando a valor que vai estar em string para resposta em json.
  watch: {
    carrinho() {
      window.localStorage.carrinho = JSON.stringify(this.carrinho);
    },
  },
  // mostra os dados e valor em precisa um de evento antes, ele já é populado quado iniciamos a site
  created() {
    this.fetchProdutos();
    this.checarLocalStorage();
  },
});
