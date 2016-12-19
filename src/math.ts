import * as Stream from "streamjs";

/**
 * Backbone 2d position property. Used extensively in the code to represent positions and vectors.
 */
export interface IPosition {
    x: number;
    y: number;
}

/**
 * Stream points that form a rasterized line going from start to end. Ignores the first start position.
 */
export function rasterizedLine(start: IPosition, end: IPosition): Stream<IPosition> {
    // do bresenham's algorithm from the end to the start since the stream includes the first start, 
    // but ignores the end
    let x0 = end.x;
    let y0 = end.y;

    const x1 = start.x;
    const y1 = start.y;

    // bresenham's (http://stackoverflow.com/a/4672319)
    let dx = Math.abs( x1 - x0 );
    let dy = Math.abs( y1 - y0 );
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    // this includes the first start but ignores the end.
    return Stream.generate(() => {
        const ret = {
            x: x0,
            y: y0,
        };
        let e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
        return ret;
    }).takeWhile( ({ x: x0, y: y0 }) => !(x0 === x1 && y0 === y1) );
}

/**
 * Return the rasterized line segments defined by successive pairs of the given points. Ignores the first start position.
 */
export function rasterizedPath(points: IPosition[]): IPosition[] {
    const path: IPosition[] = [];
    for ( let k = 0; k < points.length - 1; k++ ) {
        const from = points[k];
        const to = points[k + 1];
        path.push(...rasterizedLine(from, to).toArray());
    }
    return path;
}

/**
 * Iterate through points that form a rasterized rectangle defined by the topLeft and bottomRight. Edge values are included.
 */
export function forEachInRect(topLeft: IPosition, bottomRight: IPosition, cb: (p: IPosition) => any) {
    for (let x = topLeft.x; x <= bottomRight.x; x += 1) {
        for (let y = topLeft.y; y <= bottomRight.y; y += 1) {
            cb({x: x, y: y});
        }
    }
}

export function forEachInCircle(center: IPosition, radius: number, cb: (p: IPosition) => any) {
    forEachInRect(
        {x: center.x - radius, y: center.y - radius},
        {x: center.x + radius, y: center.y + radius},
        (p) => {
            const {x, y} = p;
            const isInCircle = (x - center.x) * (x - center.x) + (y - center.y) * (y - center.y) < radius * radius;
            if (isInCircle) {
                cb(p);
            }
        }
    );
}
