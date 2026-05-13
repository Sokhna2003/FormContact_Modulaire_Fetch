import { elements } from "../DOM/elements.js";

// ── Constantes ─────────────────────────────────────────────────────────────────
const PHONE_REGEX   = /^(70|71|75|76|77|78)\d{7}$/;
const EMAIL_REGEX   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ══════════════════════════════════════════════════════════════════════════════
// VALIDATION
// ══════════════════════════════════════════════════════════════════════════════
export function validateForm(data) {
    const errors = {};

    if (!data.firstName.trim())
        errors.firstName = "Le prénom est requis.";

    if (!data.lastName.trim())
        errors.lastName = "Le nom est requis.";

    if (!data.email.trim())
        errors.email = "L'email est requis.";
    else if (!EMAIL_REGEX.test(data.email.trim()))
        errors.email = "Format invalide. Ex: nom@domaine.com";

    if (!data.phone.trim())
        errors.phone = "Le numéro est requis.";
    else if (!PHONE_REGEX.test(data.phone.trim()))
        errors.phone = "Format invalide. Ex: 771234567 (70/71/75/76/77/78 + 7 chiffres)";

    if (!data.role)
        errors.role = "Veuillez choisir un rôle.";

    return errors;
}

export function showErrors(errors) {
    clearErrors();
    const fields = ["firstName", "lastName", "email", "phone", "role"];
    fields.forEach((f) => {
        const errEl   = document.getElementById(`err-${f}`);
        const inputEl = elements[`${f}El`] || document.getElementById(f);
        if (errors[f]) {
            errEl.textContent = errors[f];
            inputEl.classList.add("invalid");
        }
    });
    // Focus le premier champ en erreur
    const first = fields.find((f) => errors[f]);
    if (first) elements[`${first}El`] || document.getElementById(first).focus();
}

export function clearErrors() {
    ["firstName", "lastName", "email", "phone", "role"].forEach((f) => {
        document.getElementById(`err-${f}`).textContent = "";
        elements[`${f}El`] || document.getElementById(f).classList.remove("invalid");
    });
}

// Effacer l'erreur au focus
// ["firstName", "lastName", "email", "phone", "role"].forEach((f) => {
//     document.getElementById(f).addEventListener("input", () => {
//         document.getElementById(`err-${f}`).textContent = "";
//         document.getElementById(f).classList.remove("invalid");
//     });
// });