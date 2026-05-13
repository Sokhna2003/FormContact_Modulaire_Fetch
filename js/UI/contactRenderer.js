import { elements } from "../DOM/elements.js";
import { updateGlobalStats } from "./statsRenderer.js";

// ── Constantes ─────────────────────────────────────────────────────────────────
const PER_PAGE      = 6;
// ── État local ─────────────────────────────────────────────────────────────────
export let state = {
    currentPage     : 1,
    searchQuery     : "",
    selectedIds     : new Set()
} 

// ══════════════════════════════════════════════════════════════════════════════
// FILTRAGE & PAGINATION
// ══════════════════════════════════════════════════════════════════════════════

function getFiltered(allContacts) {
    const q = state.searchQuery.toLowerCase().trim();
    return q
        ? allContacts.filter((c) =>
            `${c.firstName} ${c.lastName} ${c.email} ${c.role} ${c.phone}`.toLowerCase().includes(q))
        : allContacts;
}

function getTotalPages(filtered) {
    return Math.max(1, Math.ceil(filtered.length / PER_PAGE));
}

function getPageSlice(filtered) {
    const start = (state.currentPage - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
}

// ══════════════════════════════════════════════════════════════════════════════
// RENDU
// ══════════════════════════════════════════════════════════════════════════════

// Génère les initiales (ex: "John Doe" -> "JD")
function initials(f, l) {
    return ((f[0] || "") + (l[0] || "")).toUpperCase();
}

export function createCard(contact) {
    const li = document.createElement("li");
    li.className = "contact-card" + (state.selectedIds.has(contact.id) ? " selected" : "");
    li.dataset.id = contact.id;

    // Ajustement de l'affichage de la date selon le type (Date ou String)
    // const dateAffichage = contact.createdAt instanceof Date 
    //     ? contact.createdAt.toLocaleDateString() 
    //     : contact.createdAt;

    li.innerHTML = `
        <input type="checkbox" class="card-checkbox" data-id="${contact.id}"
               ${state.selectedIds.has(contact.id) ? "checked" : ""} title="Sélectionner" />
        <div class="card-top">
            <div class="card-avatar">${initials(contact.firstName, contact.lastName)}</div>
            <div>
                <div class="card-name">${contact.firstName} ${contact.lastName}</div>
                <div class="card-role">${contact.role}</div>
            </div>
        </div>
        <div class="card-info">
            <div class="card-info-row"><span>@</span>${contact.email}</div>
            <div class="card-info-row"><span>☏</span>${contact.phone}</div>
            <div class="card-info-row"><span>↗</span>Ajouté le ${contact.createdAt}</div>
        </div>
        <div class="card-actions">
            <button class="btn-edit"   data-id="${contact.id}">Modifier</button>
            <button class="btn-delete" data-id="${contact.id}">Supprimer</button>
        </div>
    `;

    return li;
}

// Gère l'affichage de la liste complète avec filtrage et pagination
export function renderList(allContacts) {
    // Si pas de tableau fourni (sécurité), on vide la liste
    if (!allContacts) return

    updateGlobalStats(allContacts)   // transmet les contacts aux statistiques
    const filtered   = getFiltered(allContacts);
    const totalPages = getTotalPages(filtered);

    // Corriger la page si hors limite
    if (state.currentPage > totalPages) state.currentPage = totalPages;

    const slice = getPageSlice(filtered);

    elements.contactList.innerHTML = "";

    if (filtered.length === 0) {
        elements.emptyState.classList.remove("hidden");
    } else {
        elements.emptyState.classList.add("hidden");
        slice.forEach((c) => elements.contactList.appendChild(createCard(c)));
    }

    renderPagination(filtered.length, totalPages, allContacts);
    updateSelectionUI(filtered, allContacts);
}

export function renderPagination(total, totalPages, allContacts) {
    elements.paginationEl.innerHTML = "";
    if (total <= PER_PAGE) return;

    // Bouton précédent
    const prev = document.createElement("button");
    prev.className = "page-btn";
    prev.textContent = "←";
    prev.disabled = state.currentPage === 1;
    prev.addEventListener("click", () => { state.currentPage--; renderList(allContacts); });
    elements.paginationEl.appendChild(prev);

    // Numéros de pages
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.className = "page-btn" + (i === state.currentPage ? " active" : "");
        btn.textContent = i;
        btn.addEventListener("click", () => { state.currentPage = i; renderList(allContacts); });
        elements.paginationEl.appendChild(btn);
    }

    // Bouton suivant
    const next = document.createElement("button");
    next.className = "page-btn";
    next.textContent = "→";
    next.disabled = state.currentPage === totalPages;
    next.addEventListener("click", () => { state.currentPage++; renderList(allContacts); });
    elements.paginationEl.appendChild(next);
}

// ══════════════════════════════════════════════════════════════════════════════
// SÉLECTION MULTIPLE
// ══════════════════════════════════════════════════════════════════════════════
export function updateSelectionUI(filtered, allContacts) {
    const count = state.selectedIds.size;
    elements.selCountEl.textContent = count;
    elements.deleteSelBtn.disabled = count < 3;

    if (!filtered || !allContacts) return

    // Mettre à jour la checkbox "tout sélectionner"
    const visibleIds = getPageSlice(getFiltered(allContacts)).map((c) => c.id);
    const allChecked = visibleIds.length > 0 && visibleIds.every((id) => state.selectedIds.has(id));
    elements.selectAllChk.checked = allChecked;
    elements.selectAllChk.indeterminate = !allChecked && visibleIds.some((id) => state.selectedIds.has(id));
}
