export function badTypeError(t: never): never {
    throw new Error(`Didn't understand ${JSON.stringify(t)}`);
}
