// ══════════════════════════════════════════════════════════════════════════════
// MODAL
// ══════════════════════════════════════════════════════════════════════════════

export function openModal(overlay) {
    overlay.classList.add("open");
}

export function closeModal(overlay) {
    overlay.classList.remove("open");
}

// Fermer en cliquant sur l'overlay
// [modalDelete, modalDeleteMulti].forEach((overlay) => {
//     overlay.addEventListener("click", (e) => {
//         if (e.target === overlay) closeModal(overlay);
//     });
// });

// modalDeleteCancel.addEventListener("click",      () => { closeModal(modalDelete); pendingDeleteId = null; });
// modalDeleteMultiCancel.addEventListener("click", () => closeModal(modalDeleteMulti));
