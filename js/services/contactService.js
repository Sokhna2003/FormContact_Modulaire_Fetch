// gere la logique CRUD (createContact, updateContact, deleteContact). Ce fichier appelle le contactStore pour sauvegarder

import { 
    addContactToStore, 
    removeContactFromStore,
    updateContactInStore

} from "../stores/contactStore.js";
import { formatDate } from "../Utile/dateFormatter.js";

// Créer un nouveau contact
export function createContactObject(firstName,lastName,email,phone,role) {
    
    return {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role: role,
        createdAt: formatDate(new Date()),
    };
}

// Récupérer par ID
// export function getContactById(id) {
//     return getContacts().find((c) => c.id === id) || null;
// }

// ajouter un contact au serveur
export async function addContact(firstName,lastName,email,phone,role) {
    const contactObj = createContactObject(firstName, lastName, email, phone, role)
    
    return await addContactToStore(contactObj);
}

// Mettre à jour un contact sur le serveur
export async function updateContact(id, data) {
    const contactModifiees = {
        firstName: data.firstName.trim(),
        lastName:  data.lastName.trim(),
        email:     data.email.trim().toLowerCase(),
        phone:     data.phone.trim(),
        role:      data.role,
    };
    // On envoie les modifications directement au serveur
    return await updateContactInStore(id, contactModifiees);
}

// Supprimer un contact sur le serveur
export async function deleteContact(id) {
    return await removeContactFromStore(id)
}

// Supprimer plusieurs contacts (la sélection)
// json-server ne permet pas de supprimer plusieurs éléments d'un coup, on utilise donc une boucle
export async function deleteContacts(ids) {
    try {
        // Crée une liste de promesses de suppression pour paralléliser les requêtes réseau
        const promesses = ids.map(id => removeContactFromStore(id));
        // Attend que toutes les suppressions soient terminées sur le serveur
        await Promise.all(promesses);
        return true;
    } catch (error) {
        console.error("Erreur lors de la suppression groupée :", error);
        return false;
    }
    
}

