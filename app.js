const vm = new Vue({
  el: "#app",
  data: {
    produtos: [],
    produto: false,
    carrinho: [],
    mensagemAlerta: "",
    ativarAlerta: false,
    carrinhoAtivo: false,
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
    clickForaCarrinho({ target, currentTarget }) {
      if (target === currentTarget) this.carrinhoAtivo = false;
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
      }, 1000);
    },
    //Ao adicionar o item, remove a unidade do estoque
    // tem que chamar o objeto do carrinho e colocar para filtar somento o "id", assim passando arrow funcion, para cada item selecionado, faz uma comparação se o item.id é igual ao produto.id, o produto carrega o estoque, então, coloque este método em um const itens,
    //No final chamar o produtos.estoque subtrair com itens.length, assim quando adcionar o item no carrinho, ele removerá o item do estoque.
    //A função sozinho não vai fazer nada, tem que cria outra função no watch e conferir se o this.produto existir, se ele existir de this.comparaEstoque, somente assim ele funcionara
    comparaEstoque() {
      const itens = this.carrinho.filter((item) => {
        if (item.id === this.produto.id) {
          return true;
        }
      });
      this.produto.estoque = this.produto.estoque - itens.length;
    },

    //É pegado o hash da página e fazendo um condição de hash. vai chamar fetchProduto e colocar o hash no paramentro, tem que retira o #, se não, não vai funcionar e támbem tem que colocar a função no created, vai iniciar junto com site.
    router() {
      const hash = document.location.hash;
      if (hash) {
        this.fetchProduto(hash.replace("#", ""));
      }
    },
  },
  watch: {
    // observar o evento do produto, quando estiver dentro do conteúdo, mudara o titulo da página pelo nome do produto e se não ouver, vai para o nome da página orinal.
    //támbem vai adicionar o history.pushState para remonear o nome do diretorio. colocando um # no começa com o id do produto, para finalzar é criado um função de router para pode compartilha o item
    produto() {
      document.title = this.produto.nome || "Techno";
      const hash = this.produto.id || "";
      history.pushState(null, null, `#${hash}`);
      if (this.produto) {
        this.comparaEstoque();
      }
    },
    // Observado os eventos do carrinho, o wacth vai observar o dados do localStorage e vai aramzena os dados para fazer um ação. usando o JSON.strigify tirando a valor que vai estar em string para resposta em json.
    carrinho() {
      window.localStorage.carrinho = JSON.stringify(this.carrinho);
    },
  },
  // mostra os dados e valor em precisa um de evento antes, ele já é populado quado iniciamos a site
  created() {
    this.fetchProdutos();
    this.router();
    this.checarLocalStorage();
  },
});
