export interface IPosition {
    x: number;
    y: number;
}

// ignores the first start position. callback should return TRUE if we should stop iteration
export function forEachOnLineInGrid(start: IPosition, end: IPosition, callback: (Position) => boolean | void) {
    let x0 = start.x;
    let y0 = start.y;

    const x1 = end.x;
    const y1 = end.y;

    // bresenham's (http://stackoverflow.com/a/4672319)
    let dx = Math.abs( x1 - x0 );
    let dy = Math.abs( y1 - y0 );
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
        if ( x0 === x1 && y0 === y1 ) {
            break;
        }
        let e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }

        const shouldStop = callback({ x: x0, y: y0 });
        if (shouldStop) {
            break;
        }
    }
}

export function forEachInRect(topLeft: IPosition, bottomRight: IPosition, cb: (Position) => any) {
    for (let x = topLeft.x; x <= bottomRight.x; x += 1) {
        for (let y = topLeft.y; y <= bottomRight.y; y += 1) {
            cb({x: x, y: y});
        }
    }
}

export function forEachInCircle(center: IPosition, radius: number, cb: (Position) => any) {
    forEachInRect({x: center.x - radius, y: center.y - radius},
        {x: center.x + radius, y: center.y + radius},
        (p) => {
            const {x, y} = p;
            const isInCircle = (x - center.x) * (x - center.x) + (y - center.y) * (y - center.y) < radius * radius;
            if (isInCircle) {
                cb(p);
            }
        });
    }
