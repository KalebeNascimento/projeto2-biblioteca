import { useEffect, useState } from 'react';
import api from '../api/client';

function KpiCard({ label, value, tone }) {
  const bg =
    tone === 'green' ? '#dcfce7' :
    tone === 'orange' ? '#ffedd5' :
    tone === 'red' ? '#fee2e2' :
    tone === 'blue' ? '#dbeafe' : '#f3f4f6';
  const color =
    tone === 'green' ? '#166534' :
    tone === 'orange' ? '#9a3412' :
    tone === 'red' ? '#991b1b' :
    tone === 'blue' ? '#1e40af' : '#374151';
  return (
    <div style={{ background: bg, color, padding: 20, borderRadius: 10, minWidth: 160 }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.85 }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function BarChart({ data, colors }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="empty-state">Sem dados para exibir.</div>;

  const width = 480;
  const height = 220;
  const padding = 40;
  const barW = (width - padding * 2) / data.length - 12;
  const max = Math.max(...data.map((d) => d.value));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxWidth: width }}>
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#d1d5db" />
      {data.map((d, i) => {
        const h = max === 0 ? 0 : ((height - padding * 2) * d.value) / max;
        const x = padding + i * (barW + 12);
        const y = height - padding - h;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barW} height={h} fill={colors?.[i] || '#2563eb'} rx="4" />
            <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="13" fill="#111827" fontWeight="700">
              {d.value}
            </text>
            <text x={x + barW / 2} y={height - padding + 18} textAnchor="middle" fontSize="12" fill="#4b5563">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/reports/dashboard');
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao carregar dashboard.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="card empty-state">Carregando dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const { totals, loansByStatus, topBorrowed } = stats;

  const statusChart = [
    { label: 'Em aberto', value: loansByStatus.aberto },
    { label: 'Devolvido', value: loansByStatus.devolvido },
    { label: 'Atrasado', value: loansByStatus.atrasado },
  ];
  const statusColors = ['#2563eb', '#16a34a', '#dc2626'];

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        <KpiCard label="Livros cadastrados" value={totals.books} tone="blue" />
        <KpiCard
          label="Exemplares disponíveis"
          value={`${totals.availableCopies} / ${totals.totalCopies}`}
          tone="green"
        />
        <KpiCard label="Leitores ativos" value={`${totals.activeReaders} / ${totals.readers}`} tone="blue" />
        <KpiCard label="Empréstimos em aberto" value={totals.loansOpen} tone="orange" />
        <KpiCard label="Empréstimos atrasados" value={totals.loansOverdue} tone="red" />
        <KpiCard label="Empréstimos devolvidos" value={totals.loansReturned} tone="green" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Empréstimos por status</h2>
          <BarChart data={statusChart} colors={statusColors} />
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Top 5 livros mais emprestados</h2>
          {topBorrowed.length === 0 ? (
            <div className="empty-state">Ainda não há empréstimos registrados.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Autor</th>
                  <th style={{ textAlign: 'right' }}>Empréstimos</th>
                </tr>
              </thead>
              <tbody>
                {topBorrowed.map((b) => (
                  <tr key={b.bookId}>
                    <td>{b.title}</td>
                    <td>{b.author}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{b.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
