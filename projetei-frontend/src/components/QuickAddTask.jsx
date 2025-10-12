// src/components/QuickAddTask.jsx
import { useEffect, useState } from 'react';
import './QuickAddTask.css';

export default function QuickAddTask({ onCreate, creating = false, expose }) {
    const [expanded, setExpanded] = useState(false);
    const [title, setTitle] = useState('');

    // expõe API para o pai abrir/fechar
    useEffect(() => {
        expose?.({
            open: () => setExpanded(true),
            close: () => setExpanded(false),
        });
    }, [expose]);

    async function submit() {
        const t = title.trim();
        if (!t) return;
        await onCreate({ title: t });
        setTitle('');
        setExpanded(false);
    }

    // 🔹 quando fechado NÃO renderiza nada → zero espaço reservado
    if (!expanded) return null;

    return (
        <div className="qa-wrap">
      <textarea
          className="qa-textarea"
          placeholder="Título da tarefa"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
              if (e.key === 'Escape') { e.preventDefault(); setExpanded(false); setTitle(''); }
          }}
          rows={2}
          autoFocus
          disabled={creating}
      />
            <div className="qa-actions">
                <button className="qa-btn primary" onClick={submit} disabled={creating || !title.trim()}>
                    {creating ? 'Criando…' : 'Criar'}
                </button>
                <button className="qa-btn" onClick={() => { setExpanded(false); setTitle(''); }} disabled={creating}>
                    Cancelar
                </button>
            </div>
        </div>
    );
}
