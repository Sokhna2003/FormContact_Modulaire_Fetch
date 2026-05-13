const STORAGE_KEY = "http://localhost:3000/contacts";

// Convertit les données du serveur pour l'application
function normalizeContact(rawContact) {
  return {
    firstName: rawContact.firstName,
    lastName: rawContact.lastName,
    email: rawContact.email,
    phone: rawContact.phone,
    role: rawContact.role,
    createdAt: rawContact.createdAt ? new Date(rawContact.createdAt) : new Date(),
    id: rawContact.id,
  };
}
// LIRE : Récupère et normalise directement depuis le serveur
export async function getContacts() {
  try {
    const response = await fetch(STORAGE_KEY)

    if (!response.ok) {
      throw new Error("Erreur lors du chargement des contacts")
    }

    const data = await response.json()

    return Array.isArray(data) ? data.map(normalizeContact) : []

  } catch (error) {
    console.error("Erreur :", error)
    return []
  }
}

// CRÉER : Envoie au serveur et retourne le contact créé
export async function addContactToStore(contact) {
  try {
    const response = await fetch(STORAGE_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact)
    })

    if (!response.ok) {
      throw new Error("Erreur lors de l'ajout")
    }

    return await response.json()

  } catch (error) {
    console.error("Erreur addContact :", error)
  }
}

// SUPPRIMER : Supprime sur le serveur et retourne un booléen de réussite
export async function removeContactFromStore(id) {
  try {
    const response = await fetch(`${STORAGE_KEY}/${id}`, {
      method: "DELETE"
    })

    if (!response.ok) {
      throw new Error("Erreur suppression")
    }
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}
// MODIFIER : Met à jour sur le serveur et retourne le contact modifié
export async function updateContactInStore(id, updatedData) {
  try {
    const response = await fetch(`${STORAGE_KEY}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    })

    if (!response.ok) {
      throw new Error("Erreur modification")
    }

    return await response.json()

  } catch (error) {
    console.error(error)
  }
}

// export async function toggleContactInStore(id) {
//   await fetch(`${STORAGE_KEY}/${id}`, {

//     method: "PATCH",
//     headers: { "Content-Type": "application/json" },
//     // body : JSON.stringify({done : !currentDone})

//   })
// }
// export function clearContacts() {
//   contacts = [];
//   //   saveContactToStorage();
// }

