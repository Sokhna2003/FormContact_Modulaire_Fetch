import { elements } from "./DOM/elements.js";
import { createContact, updateContact, deleteContact, deleteContacts, getContactById } from "./services/contactService.js";
import { state, renderList, updateSelectionUI } from "./UI/contactRenderer.js";
import { showToast } from "./UI/messageRenderer.js";
import { openModal, closeModal } from "./UI/modalRenderer.js";
import { validateForm, showErrors, clearErrors } from "./Utile/validateForm.js";


// ── État local : pour modal suppression simple 
let pendingDeleteId = null;

// ── FORMULAIRE : Soumission ( ajout /modification ) 
elements.form.addEventListener("submit", (e) => {
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

    if (id) {
        // update
        const updated = updateContact(Number(id), data)
        resetForm()
        renderList()
        showToast("success", "Mis à jour", `${updated.firstName} ${updated.lastName} a été modifié `)
    } else {
        // Create
        const created = createContact(data)
        resetForm()
        state.currentPage = 1
        renderList()
        showToast("success", "Ajouté", `${created.firstName} a été ajouté avec succès `)
    }
})

// ── RECHERCHE ────────────────────────────────────────────────────────────────
elements.searchInput.addEventListener("input", () => {
    state.searchQuery = elements.searchInput.value;
    state.currentPage = 1;
    renderList();
});

// ── ACTIONS SUR LA LISTE (Délégation) ────────────────────────────────────────
elements.contactList.addEventListener("click", (e) => {
    const id = Number(e.target.closest("li")?.dataset.id);
    if (!id) return;

    // Bouton Modifier
    if (e.target.closest(".btn-edit")) {
        const contact = getContactById(id);
        if (contact) setEditMode(contact);
    }
    // Bouton Supprimer (ouvre le modal)
    if (e.target.closest(".btn-delete")) {
        const contact = getContactById(id);
        pendingDeleteId = id;
        elements.modalDeleteDesc.textContent = `Supprimer ${contact.firstName} ${contact.lastName} ?`;
        openModal(elements.modalDelete);
    }
});
// ── GESTION DE LA SÉLECTION ──────────────────────────────────────────────────
// Checkbox individuelle
elements.contactList.addEventListener("change", (e) => {
    const chk = e.target.closest(".card-checkbox");
    if (!chk) return;

    const id = Number(chk.dataset.id);
    if (chk.checked) state.selectedIds.add(id);
    else state.selectedIds.delete(id);

    chk.closest(".contact-card").classList.toggle("selected", chk.checked);
    updateSelectionUI();
});
// Tout sélectionner (page courante)
elements.selectAllChk.addEventListener("change", () => {
    const cards = elements.contactList.querySelectorAll(".card-checkbox");
    cards.forEach(chk => {
        const id = Number(chk.dataset.id);
        if (elements.selectAllChk.checked) state.selectedIds.add(id);
        else state.selectedIds.delete(id);
    });
    renderList();
});
// ── MODALS ET CONFIRMATIONS ──────────────────────────────────────────────────
// Confirmation suppression simple
elements.modalDeleteConfirm.addEventListener("click", () => {
    if (pendingDeleteId) {
        const contact = getContactById(pendingDeleteId);
        const name = contact ? `${contact.firstName} ${contact.lastName}` : "";
        
        deleteContact(pendingDeleteId);
        state.selectedIds.delete(pendingDeleteId);
        
        closeModal(elements.modalDelete);
        renderList();
        showToast("danger", "Supprimé", `${name} a été retiré.`);
        pendingDeleteId = null;
    }
});
// Suppression multiple
elements.deleteSelBtn.addEventListener("click", () => {
    const count = state.selectedIds.size;
    elements.modalDeleteMultiDesc.textContent = `Vous allez supprimer ${count} contacts.`;
    openModal(elements.modalDeleteMulti);
});

elements.modalDeleteMultiConfirm.addEventListener("click", () => {
    const count = state.selectedIds.size;
    deleteContacts(state.selectedIds);
    state.selectedIds.clear();
    closeModal(elements.modalDeleteMulti);
    state.currentPage = 1;
    renderList();
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
// ── INITIALISATION ───────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    renderList();
});








// ══════════════════════════════════════════════════════════════════════════════
// MODAL
// ══════════════════════════════════════════════════════════════════════════════
// Fermer en cliquant sur l'overlay
// [modalDelete, modalDeleteMulti].forEach((overlay) => {
//     overlay.addEventListener("click", (e) => {
//         if (e.target === overlay) closeModal(overlay);
//     });
// });

// modalDeleteCancel.addEventListener("click",      () => { closeModal(modalDelete); pendingDeleteId = null; });
// modalDeleteMultiCancel.addEventListener("click", () => closeModal(modalDeleteMulti));


// ══════════════════════════════════════════════════════════════════════════════
// VALIDATION
// ══════════════════════════════════════════════════════════════════════════════
// Effacer l'erreur au focus
// ["firstName", "lastName", "email", "phone", "role"].forEach((f) => {
//     document.getElementById(f).addEventListener("input", () => {
//         document.getElementById(`err-${f}`).textContent = "";
//         document.getElementById(f).classList.remove("invalid");
//     });
// });

// Délégation — checkbox sur chaque carte
// contactList.addEventListener("change", (e) => {
//     const chk = e.target.closest(".card-checkbox");
//     if (!chk) return;
//     const id = Number(chk.dataset.id);
//     if (chk.checked) selectedIds.add(id);
//     else selectedIds.delete(id);

//     const card = chk.closest(".contact-card");
//     card.classList.toggle("selected", chk.checked);

//     updateSelectionUI();
// });

// "Tout sélectionner" — uniquement la page courante
// selectAllChk.addEventListener("change", () => {
//     const visibleIds = getPageSlice(getFiltered()).map((c) => c.id);
//     if (selectAllChk.checked) {
//         visibleIds.forEach((id) => selectedIds.add(id));
//     } else {
//         visibleIds.forEach((id) => selectedIds.delete(id));
//     }
//     renderList();
// });

// Bouton supprimer la sélection
// deleteSelBtn.addEventListener("click", () => {
//     if (selectedIds.size < 3) return;
//     const count = selectedIds.size;
//     modalDeleteMultiDesc.textContent =
//         `Vous allez supprimer ${count} contact${count > 1 ? "s" : ""}. Cette action est irréversible.`;
//     openModal(modalDeleteMulti);
// });

// modalDeleteMultiConfirm.addEventListener("click", () => {
//     const count = selectedIds.size;
//     deleteContacts(new Set(selectedIds));
//     selectedIds.clear();
//     closeModal(modalDeleteMulti);
//     currentPage = 1;
//     renderList();
//     showToast("danger", "Contacts supprimés", `${count} contacts ont été supprimés.`);
// });

// ══════════════════════════════════════════════════════════════════════════════
// DÉLÉGATION — boutons Modifier / Supprimer sur les cartes
// ══════════════════════════════════════════════════════════════════════════════

// contactList.addEventListener("click", (e) => {
//     const editBtn   = e.target.closest(".btn-edit");
//     const deleteBtn = e.target.closest(".btn-delete");

//     // ── MODIFIER ──
//     if (editBtn) {
//         const id = Number(editBtn.dataset.id);
//         const contact = getContactById(id);
//         if (!contact) return;
//         setEditMode(contact);
//     }

//     // ── SUPPRIMER (ouvre le modal) ──
//     if (deleteBtn) {
//         const id = Number(deleteBtn.dataset.id);
//         const contact = getContactById(id);
//         if (!contact) return;
//         pendingDeleteId = id;
//         modalDeleteDesc.textContent =
//             `Supprimer ${contact.firstName} ${contact.lastName} ? Cette action est irréversible.`;
//         openModal(modalDelete);
//     }
// });

// Confirmation suppression simple
// modalDeleteConfirm.addEventListener("click", () => {
//     if (!pendingDeleteId) return;
//     const contact = getContactById(pendingDeleteId);
//     const name    = contact ? `${contact.firstName} ${contact.lastName}` : "le contact";
//     deleteContact(pendingDeleteId);
//     selectedIds.delete(pendingDeleteId);
//     pendingDeleteId = null;
//     closeModal(modalDelete);

//     // Si on supprimait la carte en édition → reset formulaire
//     if (Number(editIdInput.value) === pendingDeleteId) resetForm();

//     renderList();
//     showToast("danger", "Contact supprimé", `${name} a été supprimé avec succès.`);
// });

// ══════════════════════════════════════════════════════════════════════════════
// FORMULAIRE — état ajout / édition
// ══════════════════════════════════════════════════════════════════════════════

// function setEditMode(contact) {
//     editIdInput.value  = contact.id;
//     firstNameEl.value  = contact.firstName;
//     lastNameEl.value   = contact.lastName;
//     emailEl.value      = contact.email;
//     phoneEl.value      = contact.phone;
//     roleEl.value       = contact.role;
//     submitLabel.textContent = "Mettre à jour";
//     cancelBtn.classList.add("visible");
//     clearErrors();

//     document.querySelectorAll(".contact-card").forEach((el) => {
//         el.classList.toggle("editing", Number(el.dataset.id) === contact.id);
//     });

//     // Scroll vers le formulaire
//     document.querySelector(".panel-form").scrollTo({ top: 0, behavior: "smooth" });
//     firstNameEl.focus();
// }

// function resetForm() {
//     form.reset();
//     editIdInput.value = "";
//     submitLabel.textContent = "Ajouter";
//     cancelBtn.classList.remove("visible");
//     clearErrors();
//     document.querySelectorAll(".contact-card.editing").forEach((el) => {
//         el.classList.remove("editing");
//     });
// }

// cancelBtn.addEventListener("click", () => {
//     resetForm();
// });

// ══════════════════════════════════════════════════════════════════════════════
// SOUMISSION — CREATE + UPDATE
// ══════════════════════════════════════════════════════════════════════════════

// form.addEventListener("submit", (e) => {
//     e.preventDefault();

//     const data = {
//         firstName: firstNameEl.value,
//         lastName:  lastNameEl.value,
//         email:     emailEl.value,
//         phone:     phoneEl.value,
//         role:      roleEl.value,
//     };

//     const errors = validateForm(data);

//     if (Object.keys(errors).length > 0) {
//         showErrors(errors);
//         return;
//     }

    // clearErrors();
    // const id = editIdInput.value;

    // if (id) {
    //     // UPDATE
    //     const updated = updateContact(Number(id), data);
    //     resetForm();
    //     renderList();
    //     showToast(
    //         "success",
    //         "Contact mis à jour",
    //         `${updated.firstName} ${updated.lastName} a été modifié avec succès.`
    //     );
    // } else {
        // CREATE
//         const created = createContact(data);
//         resetForm();
//         // Aller à la dernière page pour voir le nouveau contact
//         const filtered   = getFiltered();
//         currentPage = getTotalPages(filtered);
//         renderList();
//         showToast(
//             "success",
//             "Contact ajouté",
//             `${created.firstName} ${created.lastName} a été ajouté avec succès.`
//         );
//     }
// });

// ══════════════════════════════════════════════════════════════════════════════
// RECHERCHE
// ══════════════════════════════════════════════════════════════════════════════

// searchInput.addEventListener("input", () => {
//     searchQuery = searchInput.value;
//     currentPage = 1;
//     renderList();
// });

// ══════════════════════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════════════════════

// renderList();
