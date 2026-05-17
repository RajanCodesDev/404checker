export function isHard404(status) {

    return [
        404,
        410
    ].includes(status);

}