// Carregar receitas do db.json
fetch('../../db/db.json')
  .then(response => response.json())
  .then(data => {
    const receitas = data.receitas;

    // Carrossel
    const carouselInner = document.getElementById("carousel-inner");
    if (carouselInner) {
      receitas.forEach((receita, index) => {
        const item = document.createElement("div");
        item.className = `carousel-item${index === 0 ? " active" : ""}`;
        item.innerHTML = `
          <a href="detalhes.html?id=${receita.id}">
            <img src="${receita.imagem}" class="d-block w-100" alt="${receita.titulo}" style="max-height: 400px; object-fit: cover;">
          </a>
          <div class="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded">
            <h5>${receita.titulo}</h5>
            <p>${receita.descricao}</p>
          </div>
        `;
        carouselInner.appendChild(item);
      });
    }

    // Cards
    const container = document.getElementById("receitas-container");
    if (container) {
      receitas.forEach((receita) => {
        const div = document.createElement("div");
        div.className = "col-md-4 col-12 mb-4 receita-card";
        div.innerHTML = `
          <div class="card h-100">
            <a href="detalhes.html?id=${receita.id}" style="text-decoration:none; color:inherit;">
              <img src="${receita.imagem}" class="card-img-top" alt="${receita.titulo}" style="object-fit: cover; max-height: 200px;">
              <div class="card-body">
                <h5 class="card-title">${receita.titulo}</h5>
                <p class="card-text">${receita.descricao}</p>
              </div>
            </a>
          </div>
        `;
        container.appendChild(div);
      });
    }
  });

fetch('http://localhost:3000/receitas')
  .then(response => response.json())
  .then(receitas => {
    fetch('http://localhost:3000/favoritos')
      .then(res => res.json())
      .then(favoritos => {
        const usuario = JSON.parse(sessionStorage.getItem('usuarioLogado') || 'null');
        const container = document.getElementById("receitas-container");
        container.innerHTML = '';
        receitas.forEach((receita) => {
          // Verifica se está nos favoritos do usuário logado
          let favoritada = false;
          if (usuario) {
            favoritada = favoritos.some(fav => fav.receitaId == receita.id && fav.usuarioId == usuario.id);
          }
          const icone = favoritada
            ? '<span class="bi bi-heart-fill text-danger"></span>'
            : '<span class="bi bi-heart"></span>';

          const div = document.createElement("div");
          div.className = "col-md-4 col-12 mb-4 receita-card";
          div.innerHTML = `
            <div class="card h-100">
              <a href="detalhes.html?id=${receita.id}" style="text-decoration:none; color:inherit;">
                <img src="${receita.imagem}" class="card-img-top" alt="${receita.titulo}" style="object-fit: cover; max-height: 200px;">
                <div class="card-body">
                  <h5 class="card-title">${receita.titulo} ${icone}</h5>
                  <p class="card-text">${receita.descricao}</p>
                </div>
              </a>
            </div>
          `;
          container.appendChild(div);
        });
      });
  });

// Buscar receita por id
if (window.location.pathname.endsWith('detalhes.html')) {
  function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  const id = getIdFromUrl();
  const usuario = JSON.parse(sessionStorage.getItem('usuarioLogado') || 'null');

  fetch('http://localhost:3000/receitas/' + id)
    .then(response => response.json())
    .then(receita => {
      fetch('http://localhost:3000/favoritos')
        .then(res => res.json())
        .then(favoritos => {
          const detalhesDiv = document.getElementById('detalhes-receita');
          let favoritada = false;
          let favoritoId = null;
          if (usuario) {
            const fav = favoritos.find(f => f.receitaId == receita.id && f.usuarioId == usuario.id);
            favoritada = !!fav;
            favoritoId = fav ? fav.id : null;
          }
          const icone = favoritada
            ? '<span id="icone-fav" class="bi bi-heart-fill text-danger fs-3"></span>'
            : '<span id="icone-fav" class="bi bi-heart fs-3"></span>';

          detalhesDiv.innerHTML = `
            <img src="${receita.imagem}" alt="${receita.titulo}">
            <h2>${receita.titulo}</h2>
            <p>${receita.descricao}</p>
            <button id="btn-favoritar" class="btn btn-warning mt-3">${icone}</button>
            <div id="msg-favorito" class="mt-2"></div>
          `;

          // Botão de favoritar/desfavoritar
          document.getElementById('btn-favoritar').onclick = function() {
            if (!usuario) {
              document.getElementById('msg-favorito').innerHTML = '<span class="text-danger">Faça login para favoritar.</span>';
              return;
            }
            if (!favoritada) {
              // Favoritar
              fetch('http://localhost:3000/favoritos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  receitaId: receita.id,
                  usuarioId: usuario.id,
                  titulo: receita.titulo,
                  imagem: receita.imagem
                })
              })
              .then(response => {
                if (response.ok) {
                  document.getElementById('icone-fav').className = 'bi bi-heart-fill text-danger fs-3';
                  document.getElementById('msg-favorito').innerHTML = '<span class="text-success">Receita favoritada!</span>';
                  favoritada = true;
                } else {
                  document.getElementById('msg-favorito').innerHTML = '<span class="text-danger">Erro ao favoritar.</span>';
                }
              });
            } else {
              // Desfavoritar
              fetch('http://localhost:3000/favoritos/' + favoritoId, {
                method: 'DELETE'
              })
              .then(response => {
                if (response.ok) {
                  document.getElementById('icone-fav').className = 'bi bi-heart fs-3';
                  document.getElementById('msg-favorito').innerHTML = '<span class="text-success">Removido dos favoritos.</span>';
                  favoritada = false;
                } else {
                  document.getElementById('msg-favorito').innerHTML = '<span class="text-danger">Erro ao remover favorito.</span>';
                }
              });
            }
          };
        });
    });
}

/* Adicionar nova receita via formulário 
if (document.getElementById('form-receita')) {
  document.getElementById('form-receita').addEventListener('submit', function(e) {
    e.preventDefault();

    const titulo = document.getElementById('titulo').value.trim();
    const imagem = document.getElementById('imagem').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const categoria = document.getElementById('categoria').value;

    fetch('http://localhost:3000/receitas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo,
        imagem,
        descricao,
        categoria,
        destaque: false
      })
    })
    .then(response => {
      if (response.ok) {
        document.getElementById('msg-receita').innerHTML = '<span class="text-success">Receita adicionada com sucesso!</span>';
        document.getElementById('form-receita').reset();
      } else {
        document.getElementById('msg-receita').innerHTML = '<span class="text-danger">Erro ao adicionar receita.</span>';
      }
    })
    .catch(() => {
      document.getElementById('msg-receita').innerHTML = '<span class="text-danger">Erro ao conectar ao servidor.</span>';
    });
  });
}
*/
// Gráfico de categorias
if (document.getElementById('grafico-categorias')) {
  fetch('http://localhost:3000/receitas')
    .then(response => response.json())
    .then(receitas => {
      const categorias = {};
      receitas.forEach(r => {
        const cat = r.categoria || 'outros';
        categorias[cat] = (categorias[cat] || 0) + 1;
      });

      const labels = Object.keys(categorias);
      const data = Object.values(categorias);

      new Chart(document.getElementById('grafico-categorias'), {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: [
              '#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    });
}

// Receitas favoritas 
if (document.getElementById('favoritos-container')) {
  fetch('http://localhost:3000/favoritos')
    .then(response => response.json())
    .then(favoritos => {
      const container = document.getElementById('favoritos-container');
      if (favoritos.length === 0) {
        container.innerHTML = '<p class="text-center">Nenhuma receita favoritada ainda.</p>';
        return;
      }
      favoritos.forEach(fav => {
        const div = document.createElement('div');
        div.className = "col-md-4 col-12 mb-4 receita-card";
        div.innerHTML = `
          <div class="card h-100">
            <img src="${fav.imagem}" class="card-img-top" alt="${fav.titulo}" style="object-fit: cover; max-height: 200px;">
            <div class="card-body">
              <h5 class="card-title">${fav.titulo}</h5>
              <a href="detalhes.html?id=${fav.receitaId}" class="btn btn-primary mt-2">Ver Detalhes</a>
            </div>
          </div>
        `;
        container.appendChild(div);
      });
    });
}

// Formulário de pesquisa 
if (document.getElementById('form-pesquisa')) {
  document.getElementById('form-pesquisa').addEventListener('submit', function(e) {
    e.preventDefault();
    const termo = document.getElementById('input-pesquisa').value.trim().toLowerCase();

    fetch('http://localhost:3000/receitas')
      .then(response => response.json())
      .then(receitas => {
        const container = document.getElementById("receitas-container");
        container.innerHTML = '';
        const filtradas = receitas.filter(r => r.titulo.toLowerCase().includes(termo));
        if (filtradas.length === 0) {
          container.innerHTML = '<p class="text-center">Nenhuma receita encontrada.</p>';
        } else {
          filtradas.forEach((receita) => {
            const div = document.createElement("div");
            div.className = "col-md-4 col-12 mb-4 receita-card";
            div.innerHTML = `
              <div class="card h-100">
                <a href="detalhes.html?id=${receita.id}" style="text-decoration:none; color:inherit;">
                  <img src="${receita.imagem}" class="card-img-top" alt="${receita.titulo}" style="object-fit: cover; max-height: 200px;">
                  <div class="card-body">
                    <h5 class="card-title">${receita.titulo}</h5>
                    <p class="card-text">${receita.descricao}</p>
                  </div>
                </a>
              </div>
            `;
            container.appendChild(div);
          });
        }
      });
  });
}

// LOGIN
if (document.getElementById('form-login')) {
  document.getElementById('form-login').addEventListener('submit', function(e) {
    e.preventDefault();
    const login = document.getElementById('login').value.trim();
    const senha = document.getElementById('senha').value.trim();

    fetch('http://localhost:3000/usuarios?login=' + encodeURIComponent(login) + '&senha=' + encodeURIComponent(senha))
      .then(res => res.json())
      .then(users => {
        if (users.length > 0) {
          sessionStorage.setItem('usuarioLogado', JSON.stringify(users[0]));
          window.location.href = 'index.html';
        } else {
          document.getElementById('msg-login').innerHTML = '<span class="text-danger">Login ou senha inválidos.</span>';
        }
      });
  });
}

// CADASTRO
if (document.getElementById('form-cadastro')) {
  document.getElementById('form-cadastro').addEventListener('submit', function(e) {
    e.preventDefault();
    const login = document.getElementById('novo-login').value.trim();
    const nome = document.getElementById('novo-nome').value.trim();
    const email = document.getElementById('novo-email').value.trim();
    const senha = document.getElementById('novo-senha').value.trim();

    fetch('http://localhost:3000/usuarios?login=' + encodeURIComponent(login))
      .then(res => res.json())
      .then(users => {
        if (users.length > 0) {
          document.getElementById('msg-cadastro').innerHTML = '<span class="text-danger">Login já existe.</span>';
        } else {
          fetch('http://localhost:3000/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, nome, email, senha, admin: false })
          })
          .then(response => {
            if (response.ok) {
              document.getElementById('msg-cadastro').innerHTML = '<span class="text-success">Usuário cadastrado! Faça login.</span>';
              document.getElementById('form-cadastro').reset();
            } else {
              document.getElementById('msg-cadastro').innerHTML = '<span class="text-danger">Erro ao cadastrar.</span>';
            }
          });
        }
      });
  });
}

// LOGOUT
function logout() {
  sessionStorage.removeItem('usuarioLogado');
  window.location.href = 'index.html';
}

// Atualiza menu conforme login
function atualizarMenu() {
  const usuario = JSON.parse(sessionStorage.getItem('usuarioLogado') || 'null');
  document.querySelectorAll('.btn-login').forEach(btn => btn.style.display = usuario ? 'none' : '');
  document.querySelectorAll('.btn-logout').forEach(btn => btn.style.display = usuario ? '' : 'none');
  document.querySelectorAll('.btn-favoritos').forEach(btn => btn.style.display = usuario ? '' : 'none');
  document.querySelectorAll('.btn-cadastro').forEach(btn => {
    btn.style.display = (usuario && usuario.admin) ? '' : 'none';
  });
}
document.addEventListener('DOMContentLoaded', atualizarMenu);

// CRUD
if (window.location.pathname.endsWith('crud.html')) {
  const crudContainer = document.getElementById('crud-container');

  function carregarReceitas() {
    fetch('http://localhost:3000/receitas')
      .then(res => res.json())
      .then(receitas => {
        let html = `<button class="btn btn-success mb-3" onclick="mostrarFormulario()">Nova Receita</button>`;
        html += `<table class="table table-bordered"><thead><tr>
          <th>ID</th><th>Título</th><th>Categoria</th><th>Ações</th></tr></thead><tbody>`;
        receitas.forEach(r => {
          html += `<tr>
            <td>${r.id}</td>
            <td>${r.titulo}</td>
            <td>${r.categoria}</td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="editarReceita('${r.id}')">Editar</button>
              <button class="btn btn-sm btn-danger" onclick="excluirReceita('${r.id}')">Excluir</button>
            </td>
          </tr>`;
        });
        html += `</tbody></table>
        <div id="form-receita-admin" style="display:none"></div>`;
        crudContainer.innerHTML = html;
      });
  }

  window.mostrarFormulario = function() {
    document.getElementById('form-receita-admin').style.display = '';
    document.getElementById('form-receita-admin').innerHTML = `
      <form id="admin-form">
        <input type="text" id="admin-titulo" placeholder="Título" required class="form-control mb-2">
        <input type="text" id="admin-imagem" placeholder="URL da Imagem" required class="form-control mb-2">
        <input type="text" id="admin-categoria" placeholder="Categoria" required class="form-control mb-2">
        <textarea id="admin-descricao" placeholder="Descrição" required class="form-control mb-2"></textarea>
        <button type="submit" class="btn btn-success">Salvar</button>
        <button type="button" class="btn btn-secondary" onclick="cancelarAdmin()">Cancelar</button>
      </form>
    `;
    document.getElementById('admin-form').onsubmit = function(e) {
      e.preventDefault();
      fetch('http://localhost:3000/receitas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: document.getElementById('admin-titulo').value,
          imagem: document.getElementById('admin-imagem').value,
          categoria: document.getElementById('admin-categoria').value,
          descricao: document.getElementById('admin-descricao').value,
          destaque: false
        })
      }).then(() => carregarReceitas());
      cancelarAdmin();
    };
  };

  window.cancelarAdmin = function() {
    document.getElementById('form-receita-admin').style.display = 'none';
    document.getElementById('form-receita-admin').innerHTML = '';
  };

  window.editarReceita = function(id) {
    fetch('http://localhost:3000/receitas/' + id)
      .then(res => res.json())
      .then(r => {
        document.getElementById('form-receita-admin').style.display = '';
        document.getElementById('form-receita-admin').innerHTML = `
          <form id="admin-form">
            <input type="text" id="admin-titulo" value="${r.titulo}" required class="form-control mb-2">
            <input type="text" id="admin-imagem" value="${r.imagem}" required class="form-control mb-2">
            <input type="text" id="admin-categoria" value="${r.categoria}" required class="form-control mb-2">
            <textarea id="admin-descricao" required class="form-control mb-2">${r.descricao}</textarea>
            <button type="submit" class="btn btn-success">Salvar</button>
            <button type="button" class="btn btn-secondary" onclick="cancelarAdmin()">Cancelar</button>
          </form>
        `;
        document.getElementById('admin-form').onsubmit = function(e) {
          e.preventDefault();
          fetch('http://localhost:3000/receitas/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              titulo: document.getElementById('admin-titulo').value,
              imagem: document.getElementById('admin-imagem').value,
              categoria: document.getElementById('admin-categoria').value,
              descricao: document.getElementById('admin-descricao').value,
              destaque: false
            })
          }).then(() => carregarReceitas());
          cancelarAdmin();
        };
      });
  };

  window.excluirReceita = function(id) {
    if (confirm('Tem certeza que deseja excluir?')) {
      fetch('http://localhost:3000/receitas/' + id, { method: 'DELETE' })
        .then(() => carregarReceitas());
    }
  };

  carregarReceitas();
}
