export function repeat(times: number, f: Function): void {
    for (let x: number = 0; x < times; x += 1) {
        f();
    }
}

export function clone<T>(t: T): T {
    return JSON.parse(JSON.stringify(t));
}
