function getSecondsRemaining(targetTime) {
    const now = new Date();
    const targetDate = new Date(targetTime);

    const timeDifference = targetDate - now;

    const secondsRemaining = Math.floor(timeDifference / 1000);

    return secondsRemaining;
}

