const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    const passwordHash = await bcrypt.hash('senha123', 10);

    const [users] = await queryInterface.sequelize.query(
      `INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES
        ('Administrador Geral', 'admin@biblioteca.com', :password, 'administrador', :now, :now),
        ('Bibliotecário Padrão', 'bibliotecario@biblioteca.com', :password, 'bibliotecario', :now, :now),
        ('Leitor Um', 'leitor1@biblioteca.com', :password, 'leitor', :now, :now),
        ('Leitor Dois', 'leitor2@biblioteca.com', :password, 'leitor', :now, :now)
       RETURNING id, email;`,
      { replacements: { password: passwordHash, now } }
    );

    const leitor1 = users.find((u) => u.email === 'leitor1@biblioteca.com');
    const leitor2 = users.find((u) => u.email === 'leitor2@biblioteca.com');

    await queryInterface.bulkInsert('readers', [
      {
        user_id: leitor1.id,
        cpf_ra: '11111111111',
        phone: '(11) 90000-0001',
        address: 'Rua dos Leitores, 100',
        status: 'ativo',
        created_at: now,
        updated_at: now,
      },
      {
        user_id: leitor2.id,
        cpf_ra: '22222222222',
        phone: '(11) 90000-0002',
        address: 'Rua dos Leitores, 200',
        status: 'ativo',
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('readers', null, {});
    await queryInterface.bulkDelete('users', {
      email: [
        'admin@biblioteca.com',
        'bibliotecario@biblioteca.com',
        'leitor1@biblioteca.com',
        'leitor2@biblioteca.com',
      ],
    });
  },
};
