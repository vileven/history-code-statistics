function getFormattedString(date: Date): string {
    return date.toISOString().split('T')[0];
}

function* periodIterator(from: Date, period: number) {
    yield getFormattedString(from);

    const now = Date.now();
    let nextPoint = new Date(+from + period);

    while (+nextPoint < now) {
        const dateFormat: string = getFormattedString(nextPoint);

        yield dateFormat;

        nextPoint = new Date(+nextPoint + period);
    }

    yield getFormattedString(new Date());
}

export default periodIterator;
