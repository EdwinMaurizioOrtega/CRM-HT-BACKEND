function formatDateTime() {
    const currentDate = new Date(); // Obtiene la fecha actual

    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'America/Guayaquil'
    };

    const formattedDate = new Intl.DateTimeFormat('es-EC', options).format(currentDate);
    return formattedDate.replace(/\//g, '-').replace(', ', ' ');
}

export default formatDateTime;