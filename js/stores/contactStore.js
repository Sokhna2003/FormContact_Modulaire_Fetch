
// ── Constantes ─────────────────────────────────────────────────────────────────
const STORAGE_KEY   = "contacts_v2";
// const STORAGE_KEY   = "http://localhost:3000/contact";


// ══════════════════════════════════════════════════════════════════════════════
// STORE — localStorage
// ══════════════════════════════════════════════════════════════════════════════

// export function getContacts() {
//     const response = await fetch (STORAGE_KEY)
//     const data = await response.json()

//     return Array.isArray(data) ? data.map(createContact) : []
// }

export function getContacts() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

export function saveContacts(contacts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}


