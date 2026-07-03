import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const ROLE_LABELS = {
  administrador: 'Administrador',
  bibliotecario: 'Bibliotecário',
  leitor: 'Leitor',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const role = user?.role;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>Biblioteca</h2>
          <small>Projeto 2 - Web Back-End</small>
        </div>
        <nav>
          {(role === 'administrador' || role === 'bibliotecario') && (
            <NavLink to="/dashboard">Dashboard</NavLink>
          )}
          <NavLink to="/books">Livros</NavLink>
          {(role === 'administrador' || role === 'bibliotecario') && (
            <NavLink to="/readers">Leitores</NavLink>
          )}
          <NavLink to="/loans">Empréstimos</NavLink>
          {role === 'administrador' && <NavLink to="/users">Usuários</NavLink>}
        </nav>
        <div className="sidebar-footer">
          <div>{user?.name}</div>
          <div style={{ opacity: 0.8 }}>{ROLE_LABELS[role]}</div>
          <button className="btn-secondary" onClick={logout}>
            Sair
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
