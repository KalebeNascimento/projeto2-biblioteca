import { useAuth } from '../auth/AuthContext';

const ROLE_LABELS = {
  administrador: 'Administrador',
  bibliotecario: 'Bibliotecário',
  leitor: 'Leitor',
};

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-header">
        <h1>Bem-vindo(a), {user.name}</h1>
      </div>
      <div className="card">
        <p>Você está autenticado como <strong>{ROLE_LABELS[user.role]}</strong>.</p>
        <p>Use o menu lateral para navegar entre livros, leitores e empréstimos.</p>
      </div>
    </div>
  );
}
