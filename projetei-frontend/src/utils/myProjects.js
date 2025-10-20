// src/utils/myProjects.js
const MY_KEY = 'projetei.myProjects';

export function readMyProjects() {
    try {
        const raw = localStorage.getItem(MY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveToMyProjects(project) {
    if (!project) return;
    const arr = readMyProjects();

    const code = String(project?.code ?? '').trim();
    const id   = String(project?.id ?? '').trim();
    const name = String(project?.name ?? '');

    // evita duplicado (prioriza code; se não houver code, usa id)
    const exists = arr.some(p =>
        (code && String(p?.code ?? '').trim() === code) ||
        (!code && id && String(p?.id ?? '').trim() === id)
    );
    if (exists) return;

    arr.push({ code, id, name });
    localStorage.setItem(MY_KEY, JSON.stringify(arr));

    // avisa UI
    window.dispatchEvent(new Event('projects:changed'));
}

export function removeFromMyProjectsByIdOrCode(idOrCode) {
    const key = String(idOrCode ?? '').trim();
    if (!key) return;
    const next = readMyProjects().filter(p => {
        const pc = String(p?.code ?? '').trim();
        const pid = String(p?.id ?? '').trim();
        return pc !== key && pid !== key;
    });
    localStorage.setItem(MY_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('projects:changed'));
}

export function isInMyProjects(project) {
    const arr = readMyProjects();
    const code = String(project?.code ?? '').trim();
    const id   = String(project?.id ?? '').trim();
    return arr.some(p =>
        String(p?.code ?? '').trim() === code ||
        (!code && String(p?.id ?? '').trim() === id)
    );
}
