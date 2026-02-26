export function debounce<T extends unknown[], R>(
    func: (...args: T) => R,
    waitFor: number,
): (...args: T) => void {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    return function (...args: T) {
        clearTimeout(timeout as ReturnType<typeof setTimeout>);
        timeout = setTimeout(() => func(...args), waitFor);
    };
}
