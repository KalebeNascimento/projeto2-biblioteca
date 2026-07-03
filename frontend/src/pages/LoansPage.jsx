import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../auth/AuthContext';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

const STATUS_BADGES = {
  aberto: <span className="badge badge-blue">Em aberto</span>,
  devolvido: <span className="badge badge-green">Devolvido</span>,
  atrasado: <span className="badge badge-red">Atrasado</span>,
};

export default function LoansPage() {
  const { user } = useAuth();
  const canManage = user.role === 'administrador' || user.role === 'bibliotecario';

  const [loans, setLoans] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [readers, setReaders] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: '', readerId: '', from: '', to: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ readerId: '', bookId: '', dueDate: '' });

  async function load(targetPage = page) {
    setLoading(true);
    setError(null);
    try {
      const params = { page: targetPage, pageSize: 10 };
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== '') params[k] = v;
      });
      const { data } = await api.get('/loans', { params });
      setLoans(data.data);
      setMeta(data.meta);
      setPage(data.meta.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar empréstimos.');
    } finally {
      setLoading(false);
    }
  }

  async function loadRefData() {
    if (!canManage) return;
    try {
      const [r, b] = await Promise.all([
        api.get('/readers', { params: { pageSize: 100 } }),
        api.get('/books', { params: { available: true, pageSize: 100 } }),
      ]);
      setReaders(r.data.data);
      setBooks(b.data.data);
    } catch (err) {
      /* ignore */
    }
  }

  useEffect(() => {
    load(1);
    loadRefData();
  }, []);

  function openCreate() {
    setForm({ readerId: '', bookId: '', dueDate: '' });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        readerId: Number(form.readerId),
        bookId: Number(form.bookId),
        ...(form.dueDate ? { dueDate: form.dueDate } : {}),
      };
      await api.post('/loans', payload);
      setModalOpen(false);
      load(page);
      loadRefData();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao registrar empréstimo.');
    }
  }

  async function handleReturn(loan) {
    if (!confirm(`Registrar devolução do empréstimo #${loan.id}?`)) return;
    try {
      await api.patch(`/loans/${loan.id}/return`);
      load(page);
      loadRefData();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao registrar devolução.');
    }
  }

  function clearFilters() {
    setFilters({ status: '', readerId: '', from: '', to: '' });
    setTimeout(() => load(1), 0);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Empréstimos</h1>
        {canManage && (
          <button className="btn-primary" onClick={openCreate}>
            + Novo empréstimo
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <div className="filters">
          <div>
            <label>Status</label>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">Todos</option>
              <option value="aberto">Em aberto</option>
              <option value="devolvido">Devolvido</option>
              <option value="atrasado">Atrasado</option>
            </select>
          </div>
          {canManage && (
            <div>
              <label>Leitor</label>
              <select value={filters.readerId} onChange={(e) => setFilters({ ...filters, readerId: e.target.value })}>
                <option value="">Todos</option>
                {readers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.user.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label>De</label>
            <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
          </div>
          <div>
            <label>Até</label>
            <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
          </div>
          <div className="filter-actions">
            <button className="btn-primary" onClick={() => load(1)}>Filtrar</button>
            <button className="btn-secondary" onClick={clearFilters}>Limpar</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card empty-state">Carregando...</div>
      ) : loans.length === 0 ? (
        <div className="card empty-state">Nenhum empréstimo encontrado.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Leitor</th>
              <th>Livro</th>
              <th>Data empréstimo</th>
              <th>Prevista devolução</th>
              <th>Devolvido em</th>
              <th>Status</th>
              {canManage && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {loans.map((l) => (
              <tr key={l.id}>
                <td>{l.id}</td>
                <td>{l.reader?.user?.name}</td>
                <td>{l.book?.title}</td>
                <td>{l.loanDate}</td>
                <td>{l.dueDate}</td>
                <td>{l.returnDate || '-'}</td>
                <td>{STATUS_BADGES[l.status]}</td>
                {canManage && (
                  <td className="actions">
                    {l.status !== 'devolvido' && (
                      <button className="btn-success btn-sm" onClick={() => handleReturn(l)}>
                        Devolver
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Pagination meta={meta} onChange={(p) => load(p)} />

      {modalOpen && (
        <Modal title="Novo empréstimo" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label>Leitor</label>
              <select value={form.readerId} onChange={(e) => setForm({ ...form, readerId: e.target.value })} required>
                <option value="">Selecione um leitor</option>
                {readers
                  .filter((r) => r.status === 'ativo')
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.user.name} ({r.cpfRa})
                    </option>
                  ))}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Livro</label>
              <select value={form.bookId} onChange={(e) => setForm({ ...form, bookId: e.target.value })} required>
                <option value="">Selecione um livro disponível</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} — {b.availableQuantity} disponível(is)
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Data prevista de devolução (opcional — padrão: +14 dias)</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button type="submit" className="btn-primary">Registrar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
