module.exports = (sequelize, DataTypes) => {
  const Reader = sequelize.define(
    'Reader',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'user_id',
      },
      cpfRa: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'cpf_ra',
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('ativo', 'inativo'),
        allowNull: false,
        defaultValue: 'ativo',
      },
    },
    {
      tableName: 'readers',
      underscored: true,
    }
  );

  Reader.associate = (models) => {
    Reader.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Reader.hasMany(models.Loan, { foreignKey: 'readerId', as: 'loans' });
  };

  return Reader;
};
