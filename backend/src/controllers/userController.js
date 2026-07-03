const bcrypt = require('bcryptjs');
const { User, Reader } = require('../models');

const PUBLIC_ATTRIBUTES = { exclude: ['password'] };

async function list(req, res, next) {
  try {
    const users = await User.findAll({ attributes: PUBLIC_ATTRIBUTES, order: [['id', 'ASC']] });
    return res.json(users);
  } catch (err) {
    return next(err);
  }
}

async function getById(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id, { attributes: PUBLIC_ATTRIBUTES });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    return res.json(user);
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password e role são obrigatórios.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });

    const { password: _omit, ...safeUser } = user.toJSON();
    return res.status(201).json(safeUser);
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const { name, email, password, role } = req.body;
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    const { password: _omit, ...safeUser } = user.toJSON();
    return res.json(safeUser);
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    if (user.role === 'administrador' && Number(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Você não pode excluir o próprio usuário administrador.' });
    }

    await Reader.destroy({ where: { userId: user.id } });
    await user.destroy();
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, getById, create, update, remove };
