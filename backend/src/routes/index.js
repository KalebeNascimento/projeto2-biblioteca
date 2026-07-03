const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const bookRoutes = require('./bookRoutes');
const readerRoutes = require('./readerRoutes');
const loanRoutes = require('./loanRoutes');
const reportRoutes = require('./reportRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/books', bookRoutes);
router.use('/readers', readerRoutes);
router.use('/loans', loanRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
