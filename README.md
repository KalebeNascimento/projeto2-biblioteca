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

## Link do vídeo da apresentação

> **[ADICIONAR LINK DO VÍDEO AQUI]** — a ser preenchido após a gravação.

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

## Passo a passo para instalação e execução

Existem **duas formas de rodar**. Escolha uma.

### Opção A — Docker (mais simples, um único comando)

Pré-requisito: Docker Desktop instalado.

```bash
docker compose up --build
```

Isso sobe automaticamente:
- PostgreSQL (porta 5432) com o banco `biblioteca_dev` criado
- Backend (porta 3000) — as migrations e o seed rodam sozinhos na primeira subida
- Frontend (porta 5173) servido por nginx, com proxy `/api` para o backend

Depois de subir, acesse:
- Frontend: <http://localhost:5173>
- Swagger da API: <http://localhost:3000/api-docs>

Para parar:
```bash
docker compose down          # mantém os dados
docker compose down -v       # apaga também o volume do PostgreSQL
```

### Opção B — Execução manual (sem Docker)

Pré-requisitos: **Node.js 18+** e **PostgreSQL** instalados localmente.

**1. Criar o banco de dados**

No `psql`:
```sql
CREATE DATABASE biblioteca_dev;
```

**2. Backend**

```bash
cd backend
cp .env.example .env          # ajuste DB_USER/DB_PASSWORD se necessário
npm install
npm run db:migrate            # cria as tabelas
npm run db:seed               # insere os usuários e livros de demonstração
npm run dev                   # sobe a API em http://localhost:3000
```

**3. Frontend** (em outro terminal)

```bash
cd frontend
npm install
npm run dev                   # sobe o Vite em http://localhost:5173
```

### Opção C — Alternativa: script SQL puro (apenas se preferir criar o schema sem o Sequelize CLI)

Já disponibilizamos um script SQL completo em [backend/database/script.sql](backend/database/script.sql) com toda a estrutura das tabelas e a população obrigatória (mesmos usuários e livros que o seed do Sequelize gera).

```bash
psql -U postgres -c "CREATE DATABASE biblioteca_dev;"
psql -U postgres -d biblioteca_dev -f backend/database/script.sql
```

Após rodar o script, você pode iniciar o backend direto com `npm run dev` (pulando os passos `db:migrate` e `db:seed` da Opção B).

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

---

## Observações para a entrega

- O `node_modules/` **NÃO** está incluído; use `npm install` em `backend/` e `frontend/` após descompactar.
- Todas as senhas dos usuários seed são `senha123`.
- O `.env.example` já está com as credenciais padrão do PostgreSQL local (`postgres/postgres`). Ajuste em `backend/.env` se seu banco local usar credenciais diferentes.
