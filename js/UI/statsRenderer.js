import { elements } from "../DOM/elements.js";

// Met à jour le compteur global des contacts (ex: 3 contacts)
export function updateGlobalStats(allContacts) {
    // si le tableau n'est pas encore chargé, on considère qu'il est vide
    const total = allContacts ? allContacts.length : O;

    // Met à jour le texte du compteur dans le DOM
    elements.listCount.textContent = `${total} contact${total > 1 ? "s" : ""}`;
}
