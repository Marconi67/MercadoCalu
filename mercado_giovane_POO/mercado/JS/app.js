// =============================================
//  SUPERMERCADO GIOVANE - Sistema POO
// =============================================

// --- Classe Produto ---
class Produto {
  constructor(id, nome, preco, categoria, imagem = '') {
    this.id = id;
    this.nome = nome;
    this.preco = preco;
    this.categoria = categoria;
    this.imagem = imagem;
  }

  formatarPreco() {
    return `R$ ${this.preco.toFixed(2).replace('.', ',')}`;
  }

  toJSON() {
    return { id: this.id, nome: this.nome, preco: this.preco, categoria: this.categoria, imagem: this.imagem };
  }
}

// --- Classe ItemCarrinho ---
class ItemCarrinho {
  constructor(produto, quantidade = 1) {
    this.produto = produto;
    this.quantidade = quantidade;
  }

  get subtotal() {
    return this.produto.preco * this.quantidade;
  }

  formatarSubtotal() {
    return `R$ ${this.subtotal.toFixed(2).replace('.', ',')}`;
  }
}

// --- Classe Carrinho ---
class Carrinho {
  constructor() {
    this.itens = [];
    this._carregarDoStorage();
  }

  _salvarNoStorage() {
    const dados = this.itens.map(item => ({
      produto: item.produto.toJSON(),
      quantidade: item.quantidade
    }));
    localStorage.setItem('carrinho', JSON.stringify(dados));
    this._atualizarBadge();
  }

  _carregarDoStorage() {
    const dados = JSON.parse(localStorage.getItem('carrinho') || '[]');
    this.itens = dados.map(d => {
      const p = new Produto(d.produto.id, d.produto.nome, d.produto.preco, d.produto.categoria, d.produto.imagem);
      return new ItemCarrinho(p, d.quantidade);
    });
    this._atualizarBadge();
  }

  _atualizarBadge() {
    const badge = document.getElementById('carrinho-badge');
    if (badge) {
      const total = this.itens.reduce((acc, i) => acc + i.quantidade, 0);
      badge.textContent = total;
      badge.style.display = total > 0 ? 'inline-flex' : 'none';
    }
  }

  adicionarProduto(produto, quantidade = 1) {
    const existente = this.itens.find(i => i.produto.id === produto.id);
    if (existente) {
      existente.quantidade += quantidade;
    } else {
      this.itens.push(new ItemCarrinho(produto, quantidade));
    }
    this._salvarNoStorage();
    this.mostrarToast(`"${produto.nome}" adicionado ao carrinho!`);
  }

  removerProduto(produtoId) {
    this.itens = this.itens.filter(i => i.produto.id !== produtoId);
    this._salvarNoStorage();
  }

  alterarQuantidade(produtoId, quantidade) {
    const item = this.itens.find(i => i.produto.id === produtoId);
    if (item) {
      if (quantidade <= 0) {
        this.removerProduto(produtoId);
      } else {
        item.quantidade = quantidade;
        this._salvarNoStorage();
      }
    }
  }

  get total() {
    return this.itens.reduce((acc, i) => acc + i.subtotal, 0);
  }

  formatarTotal() {
    return `R$ ${this.total.toFixed(2).replace('.', ',')}`;
  }

  limpar() {
    this.itens = [];
    this._salvarNoStorage();
  }

  mostrarToast(mensagem) {
    const existing = document.getElementById('toast-msg');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'toast-msg';
    toast.textContent = mensagem;
    toast.style.cssText = `
      position:fixed;bottom:30px;right:30px;background:#a3001c;color:#fff;
      padding:14px 22px;border-radius:12px;font-weight:bold;font-size:15px;
      z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.3);
      animation:slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }
}

// --- Classe Usuario ---
class Usuario {
  constructor(nome, email, senha) {
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.criadoEm = new Date().toISOString();
  }

  toJSON() {
    return { nome: this.nome, email: this.email, senha: this.senha, criadoEm: this.criadoEm };
  }
}

// --- Classe GerenciadorUsuarios ---
class GerenciadorUsuarios {
  constructor() {
    this.usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  }

  _salvar() {
    localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
  }

  cadastrar(nome, email, senha) {
    if (!nome || !email || !senha) throw new Error('Preencha todos os campos.');
    if (this.usuarios.find(u => u.email === email)) throw new Error('Email já cadastrado.');
    if (senha.length < 4) throw new Error('Senha deve ter pelo menos 4 caracteres.');
    const usuario = new Usuario(nome, email, senha);
    this.usuarios.push(usuario.toJSON());
    this._salvar();
    return usuario;
  }

  login(emailOuNome, senha) {
    const usuario = this.usuarios.find(
      u => (u.email === emailOuNome || u.nome === emailOuNome) && u.senha === senha
    );
    if (!usuario) throw new Error('Credenciais inválidas.');
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    return usuario;
  }

  logout() {
    localStorage.removeItem('usuarioLogado');
  }

  usuarioLogado() {
    return JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
  }
}

// --- Classe Catalogo (Gerencia produtos) ---
class Catalogo {
  constructor() {
    this.produtos = this._produtosPadrao();
  }

  _produtosPadrao() {
    return [
      new Produto(1, 'Abacaxi', 4.99, 'Feira', '../imagens/1.png'),
      new Produto(2, 'Maçã', 6.90, 'Feira', '../imagens/2.png'),
      new Produto(3, 'Banana', 3.50, 'Feira', '../imagens/3.png'),
      new Produto(4, 'Melancia', 12.99, 'Feira', '../imagens/1.png'),
      new Produto(5, 'Laranja', 5.49, 'Feira', '../imagens/2.png'),
      new Produto(6, 'Pão Francês', 0.89, 'Padaria', '../imagens/3.png'),
      new Produto(7, 'Bolo de Chocolate', 25.00, 'Padaria', '../imagens/1.png'),
      new Produto(8, 'Croissant', 4.50, 'Padaria', '../imagens/2.png'),
      new Produto(9, 'Frango Inteiro', 22.90, 'Açougue', '../imagens/3.png'),
      new Produto(10, 'Picanha', 79.90, 'Açougue', '../imagens/1.png'),
      new Produto(11, 'Linguiça', 14.50, 'Açougue', '../imagens/2.png'),
      new Produto(12, 'Queijo Mussarela', 38.00, 'Frios', '../imagens/3.png'),
      new Produto(13, 'Presunto', 32.00, 'Frios', '../imagens/1.png'),
      new Produto(14, 'Shampoo', 18.90, 'Higiene', '../imagens/2.png'),
      new Produto(15, 'Sabonete', 3.99, 'Higiene', '../imagens/3.png'),
      new Produto(16, 'Detergente', 2.79, 'Limpeza', '../imagens/1.png'),
      new Produto(17, 'Amaciante', 9.90, 'Limpeza', '../imagens/2.png'),
    ];
  }

  filtrarPorCategoria(categoria) {
    if (!categoria || categoria === 'Todos') return this.produtos;
    return this.produtos.filter(p => p.categoria === categoria);
  }

  buscar(termo) {
    const t = termo.toLowerCase();
    return this.produtos.filter(p => p.nome.toLowerCase().includes(t) || p.categoria.toLowerCase().includes(t));
  }

  get categorias() {
    return ['Todos', ...new Set(this.produtos.map(p => p.categoria))];
  }
}

// --- Instâncias globais ---
const carrinho = new Carrinho();
const gerenciadorUsuarios = new GerenciadorUsuarios();
const catalogo = new Catalogo();

// --- Helpers de UI ---
function atualizarNavUsuario() {
  const logado = gerenciadorUsuarios.usuarioLogado();
  const linkLogin = document.getElementById('link-login');
  const linkCadastro = document.getElementById('link-cadastro');
  const linkUsuario = document.getElementById('link-usuario');
  if (logado) {
    if (linkLogin) linkLogin.style.display = 'none';
    if (linkCadastro) linkCadastro.style.display = 'none';
    if (linkUsuario) { linkUsuario.style.display = 'inline'; linkUsuario.textContent = `👤 ${logado.nome}`; }
  } else {
    if (linkLogin) linkLogin.style.display = 'inline';
    if (linkCadastro) linkCadastro.style.display = 'inline';
    if (linkUsuario) linkUsuario.style.display = 'none';
  }
}
