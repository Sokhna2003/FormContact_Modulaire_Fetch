import { elements } from "../DOM/elements.js";
import { getContacts } from "../stores/contactStore.js";

// Met à jour le compteur global des contacts (ex: 3 contacts)
export function updateGlobalStats() {
    const total = getContacts().length;
    elements.listCount.textContent = `${total} contact${total > 1 ? "s" : ""}`;
}
