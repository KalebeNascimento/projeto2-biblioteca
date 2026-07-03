import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../auth/AuthContext';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

const EMPTY_FORM = {
  title: '',
  author: '',
  publisher: '',
  publicationYear: '',
  category: '',
  isbn: '',
  totalQuantity: 1,
};

export default function BooksPage() {
  const { user } = useAuth();
  const canManage = user.role === 'administrador' || user.role === 'bibliotecario';

  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ title: '', author: '', category: '', isbn: '', available: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  async function load(targetPage = page) {
    setLoading(true);
    setError(null);
    try {
      const params = { page: targetPage, pageSize: 10 };
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== '') params[k] = v;
      });
      const { data } = await api.get('/books', { params });
      setBooks(data.data);
      setMeta(data.meta);
      setPage(data.meta.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar livros.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(book) {
    setEditing(book);
    setForm({
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      publicationYear: book.publicationYear,
      category: book.category,
      isbn: book.isbn,
      totalQuantity: book.totalQuantity,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const payload = { ...form, publicationYear: Number(form.publicationYear), totalQuantity: Number(form.totalQuantity) };
      if (editing) {
        await api.put(`/books/${editing.id}`, payload);
      } else {
        await api.post('/books', payload);
      }
      setModalOpen(false);
      load(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar livro.');
    }
  }

  async function handleDelete(book) {
    if (!confirm(`Excluir "${book.title}"?`)) return;
    try {
      await api.delete(`/books/${book.id}`);
      load(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir livro.');
    }
  }

  function clearFilters() {
    setFilters({ title: '', author: '', category: '', isbn: '', available: '' });
    setTimeout(() => load(1), 0);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Livros</h1>
        {canManage && (
          <button className="btn-primary" onClick={openCreate}>
            + Novo livro
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <div className="filters">
          <div>
            <label>Título</label>
            <input value={filters.title} onChange={(e) => setFilters({ ...filters, title: e.target.value })} />
          </div>
          <div>
            <label>Autor</label>
            <input value={filters.author} onChange={(e) => setFilters({ ...filters, author: e.target.value })} />
          </div>
          <div>
            <label>Categoria</label>
            <input value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
          </div>
          <div>
            <label>ISBN</label>
            <input value={filters.isbn} onChange={(e) => setFilters({ ...filters, isbn: e.target.value })} />
          </div>
          <div>
            <label>Disponibilidade</label>
            <select value={filters.available} onChange={(e) => setFilters({ ...filters, available: e.target.value })}>
              <option value="">Todos</option>
              <option value="true">Disponíveis</option>
              <option value="false">Indisponíveis</option>
            </select>
          </div>
          <div className="filter-actions">
            <button className="btn-primary" onClick={() => load(1)}>Filtrar</button>
            <button className="btn-secondary" onClick={clearFilters}>Limpar</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card empty-state">Carregando...</div>
      ) : books.length === 0 ? (
        <div className="card empty-state">Nenhum livro encontrado.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Editora</th>
              <th>Ano</th>
              <th>Categoria</th>
              <th>ISBN</th>
              <th>Estoque</th>
              <th>Status</th>
              {canManage && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.id}>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td>{b.publisher}</td>
                <td>{b.publicationYear}</td>
                <td>{b.category}</td>
                <td>{b.isbn}</td>
                <td>
                  {b.availableQuantity} / {b.totalQuantity}
                </td>
                <td>
                  {b.status === 'disponivel' ? (
                    <span className="badge badge-green">Disponível</span>
                  ) : (
                    <span className="badge badge-red">Indisponível</span>
                  )}
                </td>
                {canManage && (
                  <td className="actions">
                    <button className="btn-secondary btn-sm" onClick={() => openEdit(b)}>Editar</button>
                    <button className="btn-danger btn-sm" onClick={() => handleDelete(b)}>Excluir</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Pagination meta={meta} onChange={(p) => load(p)} />


      {modalOpen && (
        <Modal title={editing ? 'Editar livro' : 'Novo livro'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div>
                <label>Título</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label>Autor</label>
                <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required />
              </div>
            </div>
            <div className="form-row">
              <div>
                <label>Editora</label>
                <input value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} required />
              </div>
              <div>
                <label>Ano de publicação</label>
                <input type="number" value={form.publicationYear} onChange={(e) => setForm({ ...form, publicationYear: e.target.value })} required />
              </div>
            </div>
            <div className="form-row">
              <div>
                <label>Categoria</label>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
              </div>
              <div>
                <label>ISBN</label>
                <input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} required />
              </div>
              <div>
                <label>Quantidade total</label>
                <input type="number" min="0" value={form.totalQuantity} onChange={(e) => setForm({ ...form, totalQuantity: e.target.value })} required />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button type="submit" className="btn-primary">Salvar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
