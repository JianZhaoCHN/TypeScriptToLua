export function __TS__ArrayIndexOf<T>(this: T[], searchElement: T, fromIndex = 0): number {
    const len = this.length;
    if (len === 0) {
        return -1;
    }

    if (fromIndex >= len) {
        return -1;
    }

    if (fromIndex < 0) {
        fromIndex = len + fromIndex;
        if (fromIndex < 0) {
            fromIndex = 0;
        }
    }

    for (const i of $range(fromIndex + 1, len)) {
        if (this[i - 1] === searchElement) {
            return i - 1;
        }
    }

    return -1;
}
