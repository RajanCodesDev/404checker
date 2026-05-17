const patterns = [
    '404',
    'page not found',
    'sorry we could not find this page',
    'does not exist',
    'not available'
];

export function isSoft404(status, title, text) {

    if (status !== 200) {
        return false;
    }

    const combined =
        `${title} ${text}`.toLowerCase();

    return patterns.some(pattern =>
        combined.includes(pattern)
    );

}