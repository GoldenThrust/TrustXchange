export function getSecondsRemaining(targetDateStr) {
    const now = new Date().getTime();

    const targetDate = new Date(targetDateStr).getTime();

    const timeDifference = targetDate - now;

    const seconds = Math.floor(timeDifference / 1000);

    return seconds > 0 ? seconds : 0;
}