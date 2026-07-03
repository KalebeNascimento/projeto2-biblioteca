import { useEffect, useState } from 'react';
import api from '../api/client';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  cpfRa: '',
  phone: '',
  address: '',
};

export default function ReadersPage() {
  const [readers, setReaders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  async function load(targetPage = page) {
    setLoading(true);
    setError(null);
    try {
      const params = { page: targetPage, pageSize: 10, ...(search ? { search } : {}) };
      const { data } = await api.get('/readers', { params });
      setReaders(data.data);
      setMeta(data.meta);
      setPage(data.meta.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar leitores.');
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

  function openEdit(r) {
    setEditing(r);
    setForm({
      name: r.user.name,
      email: r.user.email,
      password: '',
      cpfRa: r.cpfRa,
      phone: r.phone,
      address: r.address,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        const payload = { name: form.name, email: form.email, cpfRa: form.cpfRa, phone: form.phone, address: form.address };
        await api.put(`/readers/${editing.id}`, payload);
      } else {
        await api.post('/readers', form);
      }
      setModalOpen(false);
      load(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar leitor.');
    }
  }

  async function handleDelete(r) {
    if (!confirm(`Excluir leitor "${r.user.name}"?`)) return;
    try {
      await api.delete(`/readers/${r.id}`);
      load(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir leitor.');
    }
  }

  async function handleInactivate(r) {
    if (!confirm(`Inativar leitor "${r.user.name}"?`)) return;
    try {
      await api.patch(`/readers/${r.id}/inactivate`);
      load(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao inativar leitor.');
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Leitores</h1>
        <button className="btn-primary" onClick={openCreate}>
          + Novo leitor
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <div className="filters">
          <div style={{ flex: 2 }}>
            <label>Buscar por nome, CPF ou RA</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Digite para buscar..." />
          </div>
          <div className="filter-actions">
            <button className="btn-primary" onClick={() => load(1)}>Buscar</button>
            <button className="btn-secondary" onClick={() => { setSearch(''); setTimeout(() => load(1), 0); }}>Limpar</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card empty-state">Carregando...</div>
      ) : readers.length === 0 ? (
        <div className="card empty-state">Nenhum leitor encontrado.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>CPF/RA</th>
              <th>Telefone</th>
              <th>Endereço</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {readers.map((r) => (
              <tr key={r.id}>
                <td>{r.user.name}</td>
                <td>{r.user.email}</td>
                <td>{r.cpfRa}</td>
                <td>{r.phone}</td>
                <td>{r.address}</td>
                <td>
                  {r.status === 'ativo' ? (
                    <span className="badge badge-green">Ativo</span>
                  ) : (
                    <span className="badge badge-gray">Inativo</span>
                  )}
                </td>
                <td className="actions">
                  <button className="btn-secondary btn-sm" onClick={() => openEdit(r)}>Editar</button>
                  {r.status === 'ativo' && (
                    <button className="btn-warning btn-sm" onClick={() => handleInactivate(r)}>Inativar</button>
                  )}
                  <button className="btn-danger btn-sm" onClick={() => handleDelete(r)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Pagination meta={meta} onChange={(p) => load(p)} />


      {modalOpen && (
        <Modal title={editing ? 'Editar leitor' : 'Novo leitor'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div>
                <label>Nome</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label>E-mail</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            {!editing && (
              <div className="form-row">
                <div>
                  <label>Senha</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                </div>
              </div>
            )}
            <div className="form-row">
              <div>
                <label>CPF ou RA</label>
                <input value={form.cpfRa} onChange={(e) => setForm({ ...form, cpfRa: e.target.value })} required />
              </div>
              <div>
                <label>Telefone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
            </div>
            <div>
              <label>Endereço</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
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
