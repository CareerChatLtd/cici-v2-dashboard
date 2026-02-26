/**
 * Taken from https://stackoverflow.com/a/46181/921476
 * @see https://stackoverflow.com/a/46181/921476
 *
 * I haven't thoroughly tested this, but it's probably good enough for our current
 * use-case of making sure we have valid handover email addresses
 */
export const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

export const toLowerCamelCase = (str) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
        if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
}

export const snakeToSentenceCase = (str: string) => {
    const[head, ...tail] = str.split('_')
    return [head.charAt(0).toUpperCase() + head.slice(1), ...tail].join(' ')
}

export const makeEmptyStringNull = (v: unknown) =>
    typeof v === 'string'
        ? v.trim().length
            ? v
            : null
        : null