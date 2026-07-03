const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize, User, Reader } = require('../models');
const { parsePagination, buildMeta } = require('../utils/pagination');

const USER_ATTRIBUTES = { exclude: ['password'] };

function withUser() {
  return { model: User, as: 'user', attributes: USER_ATTRIBUTES };
}

async function list(req, res, next) {
  try {
    const { search } = req.query;
    const where = {};
    const include = [withUser()];

    if (search) {
      where[Op.or] = [
        { cpfRa: { [Op.iLike]: `%${search}%` } },
        { '$user.name$': { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { page, pageSize, limit, offset } = parsePagination(req.query);
    const { rows, count } = await Reader.findAndCountAll({
      where,
      include,
      order: [['id', 'ASC']],
      limit,
      offset,
      distinct: true,
    });

    return res.json({ data: rows, meta: buildMeta({ page, pageSize, total: count }) });
  } catch (err) {
    return next(err);
  }
}

async function getById(req, res, next) {
  try {
    const reader = await Reader.findByPk(req.params.id, { include: [withUser()] });
    if (!reader) return res.status(404).json({ message: 'Leitor não encontrado.' });
    return res.json(reader);
  } catch (err) {
    return next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const reader = await Reader.findOne({ where: { userId: req.user.id }, include: [withUser()] });
    if (!reader) return res.status(404).json({ message: 'Perfil de leitor não encontrado.' });
    return res.json(reader);
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const { name, email, password, cpfRa, phone, address } = req.body;
    if (!name || !email || !password || !cpfRa || !phone || !address) {
      return res.status(400).json({ message: 'name, email, password, cpfRa, phone e address são obrigatórios.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: 'leitor' }, { transaction: t });
    const reader = await Reader.create({ userId: user.id, cpfRa, phone, address }, { transaction: t });

    await t.commit();

    const result = await Reader.findByPk(reader.id, { include: [withUser()] });
    return res.status(201).json(result);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const reader = await Reader.findByPk(req.params.id, { include: [withUser()] });
    if (!reader) return res.status(404).json({ message: 'Leitor não encontrado.' });

    const { name, email, cpfRa, phone, address, status } = req.body;

    if (cpfRa !== undefined) reader.cpfRa = cpfRa;
    if (phone !== undefined) reader.phone = phone;
    if (address !== undefined) reader.address = address;
    if (status !== undefined) reader.status = status;
    await reader.save();

    if (name !== undefined || email !== undefined) {
      const user = await User.findByPk(reader.userId);
      if (name !== undefined) user.name = name;
      if (email !== undefined) user.email = email;
      await user.save();
    }

    const result = await Reader.findByPk(reader.id, { include: [withUser()] });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

async function inactivate(req, res, next) {
  try {
    const reader = await Reader.findByPk(req.params.id);
    if (!reader) return res.status(404).json({ message: 'Leitor não encontrado.' });

    reader.status = 'inativo';
    await reader.save();
    return res.json(reader);
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const reader = await Reader.findByPk(req.params.id, { transaction: t });
    if (!reader) {
      await t.rollback();
      return res.status(404).json({ message: 'Leitor não encontrado.' });
    }

    const userId = reader.userId;
    await reader.destroy({ transaction: t });
    await User.destroy({ where: { id: userId }, transaction: t });

    await t.commit();
    return res.status(204).send();
  } catch (err) {
    await t.rollback();
    return next(err);
  }
}

module.exports = { list, getById, getMe, create, update, inactivate, remove };
