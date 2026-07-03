module.exports = {
  up: async (queryInterface) => {
    const now = new Date();

    await queryInterface.bulkInsert('books', [
      {
        title: 'Dom Casmurro',
        author: 'Machado de Assis',
        publisher: 'Editora Ática',
        publication_year: 1899,
        category: 'Romance',
        isbn: '9788508046989',
        total_quantity: 3,
        available_quantity: 3,
        status: 'disponivel',
        created_at: now,
        updated_at: now,
      },
      {
        title: 'O Cortiço',
        author: 'Aluísio Azevedo',
        publisher: 'Editora Globo',
        publication_year: 1890,
        category: 'Romance',
        isbn: '9788525046851',
        total_quantity: 2,
        available_quantity: 2,
        status: 'disponivel',
        created_at: now,
        updated_at: now,
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        publisher: 'Prentice Hall',
        publication_year: 2008,
        category: 'Tecnologia',
        isbn: '9780132350884',
        total_quantity: 1,
        available_quantity: 1,
        status: 'disponivel',
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('books', {
      isbn: ['9788508046989', '9788525046851', '9780132350884'],
    });
  },
};
