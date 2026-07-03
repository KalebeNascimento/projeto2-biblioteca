import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível entrar.');
    }
  }

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Biblioteca</h1>
        <p style={{ color: '#6b7280', marginBottom: 24 }}>Acesse com sua conta.</p>

        {error && <div className="error-message">{error}</div>}

        <div style={{ marginBottom: 12 }}>
          <label>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-actions">
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>

        <div className="demo-hint">
          <strong>Usuários de demonstração (senha: senha123):</strong>
          <br />
          admin@biblioteca.com (Administrador)
          <br />
          bibliotecario@biblioteca.com (Bibliotecário)
          <br />
          leitor1@biblioteca.com / leitor2@biblioteca.com (Leitor)
        </div>
      </form>
    </div>
  );
}
