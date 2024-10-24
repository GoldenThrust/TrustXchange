export function formatWord(text) {
    const formattedText = text.charAt(0).toUpperCase() + text.slice(1);
    return formattedText.replace(/([A-Z])/g, ' $1').trim();
}


export function formattedDate(time) {
    const date = new Date(time);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
}

export function formattedTime(millisecondsStr) {
    const milliseconds = parseInt(millisecondsStr, 10);

    const totalSeconds = Math.floor(milliseconds / 1000);

    const minutes = Math.floor(totalSeconds / 60);

    const seconds = totalSeconds % 60;

    return `${minutes}m:${seconds}s`;
}
