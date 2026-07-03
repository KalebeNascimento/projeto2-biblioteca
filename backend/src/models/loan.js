module.exports = (sequelize, DataTypes) => {
  const Loan = sequelize.define(
    'Loan',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      readerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'reader_id',
      },
      bookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'book_id',
      },
      loanDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'loan_date',
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'due_date',
      },
      returnDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'return_date',
      },
      status: {
        type: DataTypes.ENUM('aberto', 'devolvido', 'atrasado'),
        allowNull: false,
        defaultValue: 'aberto',
      },
    },
    {
      tableName: 'loans',
      underscored: true,
    }
  );

  Loan.associate = (models) => {
    Loan.belongsTo(models.Reader, { foreignKey: 'readerId', as: 'reader' });
    Loan.belongsTo(models.Book, { foreignKey: 'bookId', as: 'book' });
  };

  return Loan;
};
