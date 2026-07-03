module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define(
    'Book',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      publisher: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      publicationYear: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'publication_year',
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isbn: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      totalQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'total_quantity',
        validate: { min: 0 },
      },
      availableQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'available_quantity',
        validate: { min: 0 },
      },
      status: {
        type: DataTypes.ENUM('disponivel', 'indisponivel'),
        allowNull: false,
        defaultValue: 'disponivel',
      },
    },
    {
      tableName: 'books',
      underscored: true,
      hooks: {
        beforeSave: (book) => {
          book.status = book.availableQuantity > 0 ? 'disponivel' : 'indisponivel';
        },
      },
    }
  );

  Book.associate = (models) => {
    Book.hasMany(models.Loan, { foreignKey: 'bookId', as: 'loans' });
  };

  return Book;
};
