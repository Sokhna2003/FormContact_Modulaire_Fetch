import { elements } from "./DOM/elements.js";
import { addContact, updateContact, deleteContact, deleteContacts } from "./services/contactService.js";
import { getContacts } from "./stores/contactStore.js";
import { state, renderList, updateSelectionUI } from "./UI/contactRenderer.js";
import { showToast } from "./UI/messageRenderer.js";
import { openModal, closeModal } from "./UI/modalRenderer.js";
import { validateForm, showErrors, clearErrors } from "./Utile/validateForm.js";


// ── État local : pour modal suppression simple 
let pendingDeleteId = null;

// fonction pour recharger le serveur et rafraîchir l'interface
async function rafraichirInterface() {
    const contactsFrais = await getContacts();
    renderList(contactsFrais);
}

// ── FORMULAIRE : Soumission ( ajout /modification ) 
elements.form.addEventListener("submit", async (e) => {
    e.preventDefault()
    const data = {
        firstName: elements.firstNameEl.value,
        lastName: elements.lastNameEl.value,
        email: elements.emailEl.value,
        phone: elements.phoneEl.value,
        role: elements.roleEl.value
    }

    const errors = validateForm(data)
    if (Object.keys(errors).length > 0) {
        showErrors(errors)
        return
    }

    clearErrors()
    const id = elements.editIdInput.value

    try {
       if (id) {
        // update
        const updated = await updateContact(id, data)
        resetForm()
        await rafraichirInterface()
        showToast("success", "Mis à jour", `${updated.firstName} ${updated.lastName} a été modifié `)
    } else {
        // Create
        const created = await addContact(data.firstName, data.lastName, data.email, data.phone, data.role)
        resetForm()
        state.currentPage = 1
        await rafraichirInterface()
        showToast("success", "Ajouté", `${created.firstName} a été ajouté avec succès `)
    } 
    } catch (error) {
        console.error(error)
        showToast("warn", "Erreur", "Une erreur est survenue avec le serveur.")
    }
    
})

// ── RECHERCHE ────────────────────────────────────────────────────────────────
elements.searchInput.addEventListener("input", async () => {
    state.searchQuery = elements.searchInput.value;
    state.currentPage = 1;
    renderList(await getContacts());
});

// ── ACTIONS SUR LA LISTE (Délégation) ────────────────────────────────────────
elements.contactList.addEventListener("click", async (e) => {
    const id = e.target.closest("li")?.dataset.id;
    if (!id) return;

    const contacts = await getContacts();
    const contact = contacts.find((c) => c.id === id);
    if (!contact) return;

    // Bouton Modifier
    if (e.target.closest(".btn-edit")) {
        setEditMode(contact)
    }
    // Bouton Supprimer (ouvre le modal)
    if (e.target.closest(".btn-delete")) {
        pendingDeleteId = id;
        elements.modalDeleteDesc.textContent = `Supprimer ${contact.firstName} ${contact.lastName} ?`;
        openModal(elements.modalDelete);
    }
});
// ── GESTION DE LA SÉLECTION ──────────────────────────────────────────────────
// Checkbox individuelle
elements.contactList.addEventListener("change", async (e) => {
    const chk = e.target.closest(".card-checkbox");
    if (!chk) return;

    const id = chk.dataset.id
    if (chk.checked) state.selectedIds.add(id)
    else state.selectedIds.delete(id)

    chk.closest(".contact-card").classList.toggle("selected", chk.checked);

    const contacts = await getContacts()
    // Filtre la liste actuelle pour la passer à la mise à jour visuelle de sélection
    const q = state.searchQuery.toLowerCase().trim();
    const filtered = q ? contacts.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(q)) : contacts;
    updateSelectionUI(filtered, contacts);
});

// Tout sélectionner (page courante)
elements.selectAllChk.addEventListener("change", async () => {
    const cards = elements.contactList.querySelectorAll(".card-checkbox");
    cards.forEach(chk => {
        const id = chk.dataset.id;
        if (elements.selectAllChk.checked) state.selectedIds.add(id);
        else state.selectedIds.delete(id);
    });
    renderList(await getContacts());
});

// ── MODALS ET CONFIRMATIONS ──────────────────────────────────────────────────
// Confirmation suppression simple
elements.modalDeleteConfirm.addEventListener("click", async () => {
    if (pendingDeleteId) {
        const listContacts = await getContacts()
        const contact = listContacts.find((c) => c.id === pendingDeleteId)
        const name = contact ? `${contact.firstName} ${contact.lastName}` : "";
        
        // Supprime sur le serveur
        await deleteContact(pendingDeleteId);
        state.selectedIds.delete(pendingDeleteId);
        
        closeModal(elements.modalDelete);
        await rafraichirInterface();
        showToast("danger", "Supprimé", `${name} a été retiré.`);
        pendingDeleteId = null;
    }
});

// bouton déclencheur Suppression multiple
elements.deleteSelBtn.addEventListener("click", () => {
    const count = state.selectedIds.size;
    elements.modalDeleteMultiDesc.textContent = `Vous allez supprimer ${count} contacts.`;
    openModal(elements.modalDeleteMulti);
});

// Confirmation suppression multiple
elements.modalDeleteMultiConfirm.addEventListener("click", async () => {
    const count = state.selectedIds.size;
    // Convertit le Set en tableau d'IDs pour notre service de suppression groupée
    const ids= Array.from(state.selectedIds);

    await deleteContacts(ids);
    state.selectedIds.clear();
    closeModal(elements.modalDeleteMulti);
    state.currentPage = 1;
    await rafraichirInterface();
    showToast("danger", "Supprimé", `${count} contacts ont été supprimés.`);
});

// Fermetures (Annuler / Overlays)
elements.modalDeleteCancel.addEventListener("click", () => {
    closeModal(elements.modalDelete);
    pendingDeleteId = null;
});
elements.modalDeleteMultiCancel.addEventListener("click", () => closeModal(elements.modalDeleteMulti));

[elements.modalDelete, elements.modalDeleteMulti].forEach(m => {
    m.addEventListener("click", (e) => { if (e.target === m) closeModal(m); });
});

// ── FONCTIONS D'INTERFACE ────────────────────────────────────────────────────
function resetForm() {
    elements.form.reset();
    elements.editIdInput.value = "";
    elements.submitLabel.textContent = "Ajouter";
    elements.cancelBtn.classList.remove("visible");
    clearErrors();
    // Retirer l'état visuel "editing" sur les cartes
    document.querySelectorAll(".contact-card.editing").forEach(el => el.classList.remove("editing"));
}

function setEditMode(contact) {
    elements.editIdInput.value = contact.id;
    elements.firstNameEl.value = contact.firstName;
    elements.lastNameEl.value = contact.lastName;
    elements.emailEl.value = contact.email;
    elements.phoneEl.value = contact.phone;
    elements.roleEl.value = contact.role;
    
    elements.submitLabel.textContent = "Mettre à jour";
    elements.cancelBtn.classList.add("visible");
    clearErrors();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    elements.firstNameEl.focus();
}
elements.cancelBtn.addEventListener("click", resetForm);

// Effacer les erreurs au focus des champs
["firstName", "lastName", "email", "phone", "role"].forEach(f => {
    const input = elements[`${f}El`] || document.getElementById(f);
    input?.addEventListener("input", () => {
        const err = document.getElementById(`err-${f}`);
        if (err) err.textContent = "";
        input.classList.remove("invalid");
    });
});

document.addEventListener("DOMContentLoaded",async () => {
    await rafraichirInterface()
});


