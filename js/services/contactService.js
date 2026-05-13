// gere la logique CRUD (createContact, updateContact, deleteContact). Ce fichier appelle le contactStore pour sauvegarder

import { getContacts, saveContacts } from "../stores/contactStore.js";
import { formatDate } from "../Utile/dateFormatter.js";

// Créer un nouveau contact
export function createContact(data) {
    const contacts = getContacts();
    const contact = {
        id:        Date.now(),
        firstName: data.firstName.trim(),
        lastName:  data.lastName.trim(),
        email:     data.email.trim().toLowerCase(),
        phone:     data.phone.trim(),
        role:      data.role,
        createdAt: formatDate(new Date()),
        // new Date().toLocaleDateString("fr-FR", {
            // day: "2-digit", month: "short", year: "numeric"
        // }),
    };
    contacts.push(contact);
    saveContacts(contacts);
    return contact;
}

// Récupérer par ID
export function getContactById(id) {
    return getContacts().find((c) => c.id === id) || null;
}

// Mettre à jour
export function updateContact(id, data) {
    const contacts = getContacts();
    const i = contacts.findIndex((c) => c.id === id);
    if (i === -1) return null;
    contacts[i] = {
        ...contacts[i],
        firstName: data.firstName.trim(),
        lastName:  data.lastName.trim(),
        email:     data.email.trim().toLowerCase(),
        phone:     data.phone.trim(),
        role:      data.role,
    };
    saveContacts(contacts);
    return contacts[i];
}

// Supprimer un contact
export function deleteContact(id) {
    saveContacts(getContacts().filter((c) => c.id !== id));
}

// Supprimer plusieurs contacts (la sélection)
export function deleteContacts(ids) {
    saveContacts(getContacts().filter((c) => !ids.has(c.id)));
}

