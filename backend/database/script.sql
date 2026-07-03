-- ============================================================
-- Script de criação e população do banco - Projeto 2 Biblioteca
-- SGBD: PostgreSQL
-- Este script é UMA ALTERNATIVA às migrations e seeders do
-- Sequelize (que são a forma oficial usada pelo backend).
-- Use este arquivo apenas se preferir criar o schema manualmente.
--
-- Passos:
--   1. Criar o banco (fora do arquivo, no psql):
--        CREATE DATABASE biblioteca_dev;
--        \c biblioteca_dev
--   2. Rodar este arquivo:
--        \i script.sql
--
-- Todos os usuários seed são criados com a senha "senha123"
-- (hash bcrypt já embutido abaixo).
-- ============================================================

-- ---------- Enums ----------
DO $$ BEGIN CREATE TYPE enum_users_role AS ENUM ('administrador','bibliotecario','leitor'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_readers_status AS ENUM ('ativo','inativo'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_books_status AS ENUM ('disponivel','indisponivel'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_loans_status AS ENUM ('aberto','devolvido','atrasado'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- Tabelas ----------
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS readers CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        enum_users_role NOT NULL DEFAULT 'leitor',
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE readers (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL UNIQUE REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  cpf_ra      VARCHAR(50) NOT NULL UNIQUE,
  phone       VARCHAR(50) NOT NULL,
  address     VARCHAR(255) NOT NULL,
  status      enum_readers_status NOT NULL DEFAULT 'ativo',
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE books (
  id                  SERIAL PRIMARY KEY,
  title               VARCHAR(255) NOT NULL,
  author              VARCHAR(255) NOT NULL,
  publisher           VARCHAR(255) NOT NULL,
  publication_year    INTEGER NOT NULL,
  category            VARCHAR(100) NOT NULL,
  isbn                VARCHAR(50) NOT NULL UNIQUE,
  total_quantity      INTEGER NOT NULL CHECK (total_quantity >= 0),
  available_quantity  INTEGER NOT NULL CHECK (available_quantity >= 0),
  status              enum_books_status NOT NULL DEFAULT 'disponivel',
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE loans (
  id          SERIAL PRIMARY KEY,
  reader_id   INTEGER NOT NULL REFERENCES readers(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  book_id     INTEGER NOT NULL REFERENCES books(id)   ON UPDATE CASCADE ON DELETE RESTRICT,
  loan_date   DATE NOT NULL,
  due_date    DATE NOT NULL,
  return_date DATE,
  status      enum_loans_status NOT NULL DEFAULT 'aberto',
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------- Seed obrigatório: 1 admin, 1 bibliotecário, 2 leitores ----------
-- Senha "senha123" (bcrypt cost 10)
INSERT INTO users (name, email, password, role) VALUES
  ('Administrador Geral',    'admin@biblioteca.com',          '$2a$10$JVarGwKIlAbLT.T9fjUGTeGZTSD/4oHk.swEj0TEyXJCb/OKQj1Ei', 'administrador'),
  ('Bibliotecário Padrão',   'bibliotecario@biblioteca.com',  '$2a$10$JVarGwKIlAbLT.T9fjUGTeGZTSD/4oHk.swEj0TEyXJCb/OKQj1Ei', 'bibliotecario'),
  ('Leitor Um',              'leitor1@biblioteca.com',        '$2a$10$JVarGwKIlAbLT.T9fjUGTeGZTSD/4oHk.swEj0TEyXJCb/OKQj1Ei', 'leitor'),
  ('Leitor Dois',            'leitor2@biblioteca.com',        '$2a$10$JVarGwKIlAbLT.T9fjUGTeGZTSD/4oHk.swEj0TEyXJCb/OKQj1Ei', 'leitor');

INSERT INTO readers (user_id, cpf_ra, phone, address, status)
SELECT id, '11111111111', '(11) 90000-0001', 'Rua dos Leitores, 100', 'ativo' FROM users WHERE email = 'leitor1@biblioteca.com';

INSERT INTO readers (user_id, cpf_ra, phone, address, status)
SELECT id, '22222222222', '(11) 90000-0002', 'Rua dos Leitores, 200', 'ativo' FROM users WHERE email = 'leitor2@biblioteca.com';

-- ---------- Seed de livros para demonstração ----------
INSERT INTO books (title, author, publisher, publication_year, category, isbn, total_quantity, available_quantity, status) VALUES
  ('Dom Casmurro', 'Machado de Assis', 'Editora Ática',   1899, 'Romance',    '9788508046989', 3, 3, 'disponivel'),
  ('O Cortiço',    'Aluísio Azevedo',  'Editora Globo',   1890, 'Romance',    '9788525046851', 2, 2, 'disponivel'),
  ('Clean Code',   'Robert C. Martin', 'Prentice Hall',   2008, 'Tecnologia', '9780132350884', 1, 1, 'disponivel');
