export default function Pagination({ meta, onChange }) {
  if (!meta || meta.totalPages <= 1) return null;

  const { page, totalPages, total } = meta;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
      <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
        Página {page} de {totalPages} — {total} registro(s)
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn-secondary btn-sm" disabled={!canPrev} onClick={() => onChange(page - 1)}>
          ← Anterior
        </button>
        <button className="btn-secondary btn-sm" disabled={!canNext} onClick={() => onChange(page + 1)}>
          Próxima →
        </button>
      </div>
    </div>
  );
}
