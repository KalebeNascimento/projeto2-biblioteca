const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');

function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Rota não encontrada.' });
}

function errorHandler(err, req, res, next) {
  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({ message: 'Registro já existe.', errors: err.errors.map((e) => e.message) });
  }

  if (err instanceof ForeignKeyConstraintError) {
    return res.status(409).json({ message: 'Não é possível excluir: existem registros relacionados (ex.: empréstimos).' });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({ message: 'Dados inválidos.', errors: err.errors.map((e) => e.message) });
  }

  console.error(err);
  return res.status(err.status || 500).json({ message: err.message || 'Erro interno do servidor.' });
}

module.exports = { notFoundHandler, errorHandler };
