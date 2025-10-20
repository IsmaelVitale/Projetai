import './ConfirmModal.css';

export default function ConfirmModal({
                                         open,
                                         title = 'Confirmar ação',
                                         message = 'Tem certeza?',
                                         confirmText = 'Confirmar',
                                         cancelText = 'Cancelar',
                                         variant = 'danger', // 'danger' | 'default'
                                         onConfirm,
                                         onCancel,
                                     }) {
    if (!open) return null;

    const onBackdrop = (e) => {
        // fecha só se clicar fora do conteúdo
        if (e.target === e.currentTarget) onCancel?.();
    };

    return (
        <div className="confirm-backdrop" onClick={onBackdrop}>
            <div className="confirm-card" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
                <div className="confirm-header">
                    <h3 id="confirm-title">{title}</h3>
                    <button className="confirm-close" onClick={onCancel} aria-label="Fechar">×</button>
                </div>
                <div className="confirm-body">
                    <p>{message}</p>
                </div>
                <div className="confirm-footer">
                    <button className="btn light" onClick={onCancel}>{cancelText}</button>
                    <button className={`btn ${variant}`} onClick={onConfirm}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
}
