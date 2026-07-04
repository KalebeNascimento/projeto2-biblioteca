# Projeto 2 – Sistema de Gerenciamento de Biblioteca

Disciplina: Programação Web (Back-End) — ES45B / ES51

## Integrantes da equipe

| Nome completo                     | Matrícula |
|-----------------------------------|-----------|
| Kalebe Silva do Nascimento        | 2503670   |
| Rafael de Godoy Vianna            | 2649160   |
| Higor Silva Fernandes             | 2313898   |
| Gleisson Santos Vieira            | 2525798   |

## Tema do projeto

**Sistema de Gerenciamento de Biblioteca**: aplicação web completa para uma biblioteca gerenciar seu acervo, leitores e empréstimos/devoluções, com três perfis de acesso (Administrador, Bibliotecário e Leitor), autenticação por token e documentação da API.

## Links importantes

- **Repositório no GitHub**: <https://github.com/KalebeNascimento/projeto2-biblioteca>
- **Vídeo da apresentação**: <https://drive.google.com/drive/folders/1lNTuJm1lq5Ukvd1MwRfIJxhGZx9vn05b?usp=sharing>

---

## Tecnologias utilizadas

Todas as tecnologias abaixo foram utilizadas conforme o conteúdo apresentado em aula. As dependências que **não foram vistas em aula** estão marcadas com **(*)** e possuem justificativa logo abaixo da tabela.

### Backend

| Tecnologia          | Uso                                                   |
|---------------------|-------------------------------------------------------|
| Node.js             | Ambiente de execução (Cap. 4-6)                       |
| Express             | Framework web / rotas / middlewares (Cap. 18-22)      |
| Sequelize           | ORM PostgreSQL (Cap. 4-6)                             |
| PostgreSQL          | Banco de dados relacional (exigido pelo enunciado)    |
| `pg` / `pg-hstore`  | Driver oficial PostgreSQL para o Sequelize            |
| `jsonwebtoken`      | Geração/verificação de JWT (Cap. 22)                  |
| `bcryptjs`          | Hash de senhas (Cap. 22)                              |
| `dotenv` (*)        | Carregar variáveis de ambiente do `.env`              |
| `cors` (*)          | Liberar requisições entre frontend e backend          |
| `swagger-jsdoc` + `swagger-ui-express` (*) | Documentação da API em `/api-docs` (exigido pelo enunciado) |

### Frontend

| Tecnologia          | Uso                                                   |
|---------------------|-------------------------------------------------------|
| React               | Biblioteca de UI (Cap. 23-26)                         |
| Vite (*)            | Toolchain de build/dev para o React                   |
| `react-router-dom` (*) | Roteamento entre telas (SPA)                       |
| `axios` (*)         | Cliente HTTP com interceptor para injetar o JWT       |

### Bônus (opcionais)

| Tecnologia                        | Uso                                     |
|-----------------------------------|-----------------------------------------|
| Jest + Supertest (*)              | Testes automatizados do backend         |
| Docker / Docker Compose (*)       | Empacotamento e execução unificada      |

### Justificativas das dependências não vistas em aula (*)

- **`dotenv`**: usado para carregar credenciais do banco e o segredo do JWT a partir de um arquivo `.env`, evitando deixar dados sensíveis dentro do código-fonte. É uma prática padrão em projetos Node.
- **`cors`**: como o frontend (porta 5173) e o backend (porta 3000) rodam em origens diferentes durante o desenvolvimento, o middleware `cors` habilita as requisições entre eles.
- **`swagger-jsdoc` + `swagger-ui-express`**: o **próprio enunciado do Projeto 2 exige** documentação com Swagger em `/api-docs`. Estas são as bibliotecas padrão da comunidade Node/Express para gerar e servir o Swagger UI a partir de anotações JSDoc nas rotas.
- **Vite**: é uma alternativa moderna e mais rápida ao Create React App (que foi descontinuado em 2023). Faz exatamente o mesmo papel (dev server + bundler para React), com HMR quase instantâneo. O código React em si segue os mesmos conceitos vistos em aula — apenas o script de execução muda de `react-scripts start` para `vite`.
- **`react-router-dom`**: necessário para navegar entre múltiplas telas (Login, Livros, Leitores, Empréstimos etc.) sem recarregar a página. É a biblioteca de roteamento padrão do ecossistema React.
- **`axios`**: cliente HTTP escolhido para poder centralizar em um único lugar o **interceptor que injeta o token JWT** em todas as requisições autenticadas, e o interceptor que faz logout automático quando o backend responde 401.
- **Jest + Supertest** (bônus): usados para os testes automatizados. Jest é o framework de testes mais popular do ecossistema Node; Supertest permite fazer requisições HTTP diretamente à instância do Express sem precisar levantar um servidor.
- **Docker / Docker Compose** (bônus): usados apenas para o item de "Dockerização do projeto" da lista de bônus da rubrica. A execução manual (sem Docker) continua totalmente suportada.

---

## Tutorial completo: do clone à execução

Este tutorial parte do zero — supõe que você **acabou de clonar o repositório** ou **acabou de descompactar o ZIP** e vai rodar o projeto pela primeira vez. Escolha **UMA** das duas opções de execução (A ou B).

### Passo 0 — Instalar os pré-requisitos comuns

Precisa dos dois programas abaixo em qualquer opção que escolher:

1. **Git** — para clonar o repositório
   - Windows: <https://git-scm.com/download/win>
   - Mac: `brew install git` (ou já vem com o Xcode Command Line Tools)
   - Linux (Ubuntu/Debian): `sudo apt install git`
2. **Node.js 18 ou superior**
   - Baixe a versão LTS em <https://nodejs.org/>
   - Verifique com `node --version` (deve mostrar `v18.x` ou maior)

### Passo 1 — Clonar o repositório

Abra um terminal na pasta onde você quer o projeto e rode:

```bash
git clone https://github.com/KalebeNascimento/projeto2-biblioteca.git
cd projeto2-biblioteca
```

Agora escolha **Opção A** (mais fácil, precisa de Docker) ou **Opção B** (precisa instalar PostgreSQL separadamente).

---

### Opção A — Rodar com Docker (recomendada, um único comando)

**Pré-requisito adicional**: **Docker Desktop** instalado
- Windows/Mac: <https://www.docker.com/products/docker-desktop/>
- Linux: <https://docs.docker.com/engine/install/>

Após instalar, **abra o Docker Desktop** e espere ele terminar de iniciar (ícone da baleia sem animação na barra de tarefas).

**1. Subir o projeto inteiro**

Dentro da pasta do projeto (`projeto2-biblioteca`), rode:

```bash
docker compose up --build
```

Aguarde alguns minutos na primeira vez (ele baixa as imagens e faz o build). Você verá logs de três containers subindo: `biblioteca-db`, `biblioteca-backend` e `biblioteca-frontend`. Quando aparecer:
```
biblioteca-backend  | Servidor rodando em http://localhost:3000
biblioteca-backend  | Documentação Swagger em http://localhost:3000/api-docs
```
está pronto.

**2. Acessar a aplicação**

- **Frontend** (aplicação): <http://localhost:5173>
- **Swagger da API**: <http://localhost:3000/api-docs>

As migrations e os dados de demonstração (4 usuários + 3 livros) são criados **automaticamente** — não precisa fazer mais nada.

**3. Parar tudo**

Volte no terminal onde o `docker compose up` está rodando e pressione `Ctrl + C`. Depois, para limpar:

```bash
docker compose down            # para os containers, mantém os dados
docker compose down -v         # para e apaga também o volume do PostgreSQL (reset total)
```

---

### Opção B — Rodar manualmente (sem Docker)

**Pré-requisitos adicionais**: além do Node.js, você vai precisar do **PostgreSQL** instalado localmente.

- Windows/Mac: baixe o instalador em <https://www.postgresql.org/download/>
- Linux (Ubuntu/Debian): `sudo apt install postgresql`

Durante a instalação no Windows, ele pede uma senha para o usuário `postgres` — **anote essa senha**. O restante das opções pode manter no padrão (porta 5432).

**1. Criar o banco de dados**

Abra o terminal e rode:
```bash
psql -U postgres -c "CREATE DATABASE biblioteca_dev;"
```
Ele vai pedir a senha do usuário `postgres` que você definiu na instalação.

> No Windows, se o comando `psql` não for reconhecido, você pode usar o **pgAdmin** (que vem com o instalador) → clique com o botão direito em "Databases" → **Create** → **Database** → nome `biblioteca_dev`.

**2. Configurar e subir o backend**

Em um terminal, dentro da pasta do projeto:

```bash
cd backend
cp .env.example .env
```

Abra o arquivo `backend/.env` no editor e ajuste **`DB_PASSWORD`** com a senha que você definiu para o `postgres`. Os demais valores (host, porta, usuário) devem funcionar com os padrões.

Ainda dentro de `backend/`:
```bash
npm install
npm run db:migrate            # cria as tabelas
npm run db:seed               # popula 4 usuários e 3 livros de demonstração
npm run dev                   # sobe a API em http://localhost:3000
```

Deixe esse terminal aberto (a API precisa continuar rodando).

**3. Subir o frontend em outro terminal**

Abra um **segundo terminal**, entre na pasta do projeto e rode:

```bash
cd frontend
npm install
npm run dev
```

Vai aparecer algo como:
```
VITE v8.1.3  ready in 300 ms
➜  Local:   http://localhost:5173/
```

**4. Acessar a aplicação**

- **Frontend**: <http://localhost:5173>
- **Swagger da API**: <http://localhost:3000/api-docs>

**5. Parar tudo**

Em cada terminal, `Ctrl + C`.

---

### Passo final — Fazer login e testar

Independente da opção que escolheu, agora abra <http://localhost:5173>. Use qualquer uma das contas de demonstração (senha `senha123` em todas):

- `admin@biblioteca.com` — Administrador
- `bibliotecario@biblioteca.com` — Bibliotecário
- `leitor1@biblioteca.com` — Leitor

Sugerido para conhecer o sistema: entre como bibliotecário, vá em **Empréstimos**, clique em "Novo empréstimo", selecione um leitor e um livro, registre. Depois vá em **Livros** e veja que a quantidade disponível daquele livro caiu.

---

### Alternativa avançada: rodar o script SQL puro (opcional)

Se por algum motivo você preferir criar o schema sem usar o Sequelize CLI, tem um script SQL pronto em [backend/database/script.sql](backend/database/script.sql):

```bash
psql -U postgres -c "CREATE DATABASE biblioteca_dev;"
psql -U postgres -d biblioteca_dev -f backend/database/script.sql
```

Depois é só rodar `npm install` e `npm run dev` no backend, pulando os passos `db:migrate` e `db:seed`.

---

### Solução de problemas comuns

| Sintoma | Causa provável / solução |
|---|---|
| `npm: command not found` | Node.js não instalado ou não está no PATH. Reinstale pelo <https://nodejs.org/> e reabra o terminal. |
| `docker: command not found` | Docker Desktop não instalado, ou não terminou de iniciar. Abra o Docker Desktop e espere. |
| `Error: connect ECONNREFUSED 127.0.0.1:5432` (backend não conecta no banco) | O PostgreSQL não está rodando (Opção B), ou você está tentando rodar o backend manual **enquanto** o Docker também está rodando na mesma porta. Escolha só uma opção. |
| `password authentication failed for user "postgres"` | A senha no `backend/.env` (`DB_PASSWORD`) não bate com a que você definiu na instalação do PostgreSQL. |
| Porta 3000, 5173 ou 5432 já em uso | Algum outro serviço está usando. Feche o outro serviço ou altere a porta no `docker-compose.yml` / `.env`. |
| Vite mostra "Failed to fetch" nas telas | O backend não está rodando. Volte no terminal do backend e veja se ele está de pé. |

---

## Credenciais de acesso

O sistema exige autenticação via JWT. Após o seed (Sequelize ou script SQL), estão disponíveis os seguintes usuários — **todos com a senha `senha123`**:

| Papel          | E-mail                          | O que faz                                                     |
|----------------|---------------------------------|---------------------------------------------------------------|
| Administrador  | `admin@biblioteca.com`          | Acesso total: usuários, livros, leitores, empréstimos, dashboard |
| Bibliotecário  | `bibliotecario@biblioteca.com`  | Livros, leitores, empréstimos, dashboard (não gerencia usuários) |
| Leitor         | `leitor1@biblioteca.com`        | Visualiza livros disponíveis e apenas seus próprios empréstimos |
| Leitor         | `leitor2@biblioteca.com`        | Idem                                                          |

Esses 4 usuários cobrem o requisito do enunciado ("no mínimo 1 admin, 1 bibliotecário e 2 leitores"). Ao rodar o seed também são inseridos 3 livros de exemplo (Dom Casmurro, O Cortiço, Clean Code).

---

## Scripts do banco de dados

Estão disponíveis DOIS caminhos equivalentes para criar e popular o banco:

1. **Sequelize (recomendado)** — via `npm run db:migrate` + `npm run db:seed`. Arquivos em:
   - [backend/src/migrations/](backend/src/migrations)
   - [backend/src/seeders/](backend/src/seeders)
2. **SQL puro** — arquivo único em [backend/database/script.sql](backend/database/script.sql) contendo `CREATE TABLE`s + `INSERT`s equivalentes.

---

## Funcionalidades implementadas

**Obrigatórias (rubrica):**

- [x] Modelagem de banco com relacionamentos (`users`, `readers`, `books`, `loans`)
- [x] CRUD de Livros com filtros (título, autor, categoria, ISBN, disponibilidade)
- [x] CRUD de Leitores com busca por nome/CPF/RA e inativação
- [x] Empréstimos e Devoluções com atualização automática de estoque
- [x] Regras de negócio: bloqueia empréstimo sem estoque, bloqueia leitor inativo, marca atrasados
- [x] Autenticação JWT com controle por papel (RBAC) — 3 perfis
- [x] Documentação Swagger em `/api-docs`
- [x] Frontend React consumindo toda a API (login + telas de livros, leitores, empréstimos, usuários)
- [x] Busca e filtros nas 3 principais telas

**Bônus (rubrica):**

- [x] Dashboard com KPIs e gráficos (0,25)
- [x] Paginação nas consultas (0,25)
- [x] Testes automatizados — Jest + Supertest, 13 testes em 3 suites (0,50)
- [x] Dockerização (0,50)

---

## Testes automatizados (bônus)

```bash
cd backend
# uma vez apenas: criar o banco de teste
psql -U postgres -c "CREATE DATABASE biblioteca_dev_test;"
npm test
```

Cobrem: login (200/401/400/token), RBAC em livros, paginação, filtro case-insensitive, ciclo empréstimo→devolução, bloqueio de estoque zero, bloqueio de leitor inativo, isolamento de empréstimos por leitor.

---

## Estrutura do repositório

```
projeto2-web-back-end/
├── backend/
│   ├── src/
│   │   ├── config/          # sequelize + swagger
│   │   ├── controllers/     # regras de cada recurso
│   │   ├── middlewares/     # auth JWT, tratamento de erros
│   │   ├── migrations/      # schema
│   │   ├── models/          # User, Reader, Book, Loan
│   │   ├── routes/          # rotas + anotações Swagger
│   │   ├── seeders/         # dados obrigatórios
│   │   ├── utils/           # jwt, paginação
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/               # Jest + Supertest
│   ├── database/script.sql  # schema+seed em SQL puro
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/             # axios com interceptor JWT
│   │   ├── auth/            # AuthContext + ProtectedRoute
│   │   ├── components/      # Layout, Modal, Pagination
│   │   ├── pages/           # Login, Dashboard, Books, Readers, Loans, Users
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

