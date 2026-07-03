# Biblioteca - Backend

API REST do Sistema de Gerenciamento de Biblioteca (Projeto 2). Node.js + Express + Sequelize (PostgreSQL) + JWT + Swagger.

## Requisitos

- Node.js 18+
- PostgreSQL (local ou via Docker)

## Configuração

1. Copie `.env.example` para `.env` e ajuste as credenciais do banco se necessário.
2. Suba um PostgreSQL, por exemplo com Docker:
   ```
   docker run -d --name biblioteca-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=biblioteca_dev -p 5432:5432 postgres:16-alpine
   ```
3. Instale as dependências:
   ```
   npm install
   ```
4. Rode as migrations e os seeders:
   ```
   npm run db:migrate
   npm run db:seed
   ```
5. Inicie o servidor:
   ```
   npm run dev
   ```

A API sobe em `http://localhost:3000`. Documentação Swagger em `http://localhost:3000/api-docs`.

## Usuários de demonstração (criados pelo seeder)

Senha para todos: `senha123`

| Papel         | E-mail                       |
|---------------|-------------------------------|
| Administrador | admin@biblioteca.com          |
| Bibliotecário | bibliotecario@biblioteca.com  |
| Leitor        | leitor1@biblioteca.com        |
| Leitor        | leitor2@biblioteca.com        |

3 livros de exemplo também são criados pelo seeder.

## Regras de acesso (JWT)

- Todas as rotas (exceto `/api/auth/login`) exigem `Authorization: Bearer <token>`.
- **Administrador**: acesso total, incluindo `/api/users` (cadastro/edição/exclusão de usuários e definição de papel).
- **Bibliotecário**: CRUD de livros, cadastro/edição/inativação de leitores, registro de empréstimos e devoluções. Não acessa `/api/users`.
- **Leitor**: apenas leitura de livros, consulta do próprio perfil (`/api/readers/me`) e dos próprios empréstimos (`/api/loans` já filtra automaticamente pelo usuário autenticado).

## Estrutura

```
src/
  config/       configuração do Sequelize e do Swagger
  models/       modelos Sequelize (User, Reader, Book, Loan)
  migrations/   migrations do banco
  seeders/      dados de demonstração obrigatórios
  middlewares/  autenticação/autorização JWT e tratamento de erros
  controllers/  regras de negócio de cada recurso
  routes/       rotas Express + anotações Swagger (JSDoc)
  app.js        configuração do Express
  server.js     ponto de entrada
```

## Scripts úteis

- `npm run dev` - inicia com nodemon
- `npm run db:migrate` / `npm run db:migrate:undo`
- `npm run db:seed` / `npm run db:seed:undo`
- `npm run db:reset` - desfaz tudo, recria e popula novamente
