export function formatDate(date) {
    return date.toLocaleDateString("fr-FR", {
        day: "2-digit", 
        month: "short", 
        year: "numeric"
    });
}
