import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../auth/AuthContext';
import Modal from '../components/Modal';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'bibliotecario' };

const ROLE_LABELS = {
  administrador: 'Administrador',
  bibliotecario: 'Bibliotecário',
  leitor: 'Leitor',
};

const ROLE_BADGES = {
  administrador: 'badge badge-blue',
  bibliotecario: 'badge badge-orange',
  leitor: 'badge badge-gray',
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(u) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const payload = { name: form.name, email: form.email, role: form.role };
      if (form.password) payload.password = form.password;
      if (editing) {
        await api.put(`/users/${editing.id}`, payload);
      } else {
        await api.post('/users', { ...payload, password: form.password });
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar usuário.');
    }
  }

  async function handleDelete(u) {
    if (u.id === currentUser.id) {
      alert('Você não pode excluir seu próprio usuário.');
      return;
    }
    if (!confirm(`Excluir usuário "${u.name}"?`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir usuário.');
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Usuários do sistema</h1>
        <button className="btn-primary" onClick={openCreate}>
          + Novo usuário
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="card empty-state">Carregando...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Papel</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={ROLE_BADGES[u.role]}>{ROLE_LABELS[u.role]}</span>
                </td>
                <td className="actions">
                  <button className="btn-secondary btn-sm" onClick={() => openEdit(u)}>Editar</button>
                  <button className="btn-danger btn-sm" onClick={() => handleDelete(u)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <Modal title={editing ? 'Editar usuário' : 'Novo usuário'} onClose={() => setModalOpen(false)}>
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
            <div className="form-row">
              <div>
                <label>Senha {editing && <small>(deixe em branco para manter)</small>}</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editing}
                />
              </div>
              <div>
                <label>Papel</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="administrador">Administrador</option>
                  <option value="bibliotecario">Bibliotecário</option>
                  <option value="leitor">Leitor</option>
                </select>
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
