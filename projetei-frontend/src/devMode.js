/**
 * MODO DESENVOLVEDOR — Habilita ver "Todos os projetos" no frontend.
 *
 * COMO DESABILITAR EM PRODUÇÃO:
 *   - Opção A (recomendada): defina VITE_DEV_PASS="" (string vazia) no .env de produção.
 *     Resultado: tryActivateDevMode() nunca ativa e isDevMode() sempre será false.
 *   - Opção B: apague este arquivo e remova as importações dele (Header/Dashboard).
 *
 * Segurança: isto NÃO é segurança real, é só um gate de conveniência no frontend.
 */

const DEV_MODE_KEY = 'projetei.devMode';           // flag no localStorage
const DEV_PASS = import.meta.env.VITE_DEV_PASS || 'projetaidev'; // senha do modo dev

export function isDevMode() {
    // Se não houver senha válida, nunca entra em dev
    if (!DEV_PASS) return false;
    return localStorage.getItem(DEV_MODE_KEY) === '1';
}

export function activateDevMode() {
    if (!DEV_PASS) return; // desativado por env
    localStorage.setItem(DEV_MODE_KEY, '1');
    window.dispatchEvent(new Event('devmode:changed'));
    window.dispatchEvent(new CustomEvent('ui:toast', { detail: { message: 'Modo desenvolvedor ativado.' } }));
}

export function deactivateDevMode() {
    localStorage.removeItem(DEV_MODE_KEY);
    window.dispatchEvent(new Event('devmode:changed'));
    window.dispatchEvent(new CustomEvent('ui:toast', { detail: { message: 'Modo desenvolvedor desativado.' } }));
}

/**
 * Tenta ativar/desativar dev mode a partir de um token digitado na busca.
 * - Token válido para ativar: a senha (VITE_DEV_PASS ou 'projetaidev' por padrão)
 * - Para desativar: "dev:off"
 * Retorna:
 *   'on'  -> ativado
 *   'off' -> desativado
 *   false -> token não reconhecido
 */
export function tryActivateDevMode(token) {
    const t = String(token || '').trim();
    if (!t) return false;

    if (t.toLowerCase() === 'dev:off') {
        deactivateDevMode();
        return 'off';
    }

    if (DEV_PASS && t === DEV_PASS) {
        activateDevMode();
        return 'on';
    }

    return false;
}

/** Utilitário (opcional) — só para leitura em outros pontos */
export function getDevPass() {
    return DEV_PASS;
}
