/* tslint:disable */
export interface Position {
    x: number;
    y: number;
}

// ignores the first start position. callback should return TRUE if we should stop iteration
export function forEachOnLineInGrid(start: Position, end: Position, callback: (Position) => boolean) {
    let x0 = start.x;
    let y0 = start.y;

    const x1 = end.x;
    const y1 = end.y;

    // bresenham's (http://stackoverflow.com/a/4672319)
    var dx = Math.abs(x1-x0);
    var dy = Math.abs(y1-y0);
    var sx = (x0 < x1) ? 1 : -1;
    var sy = (y0 < y1) ? 1 : -1;
    var err = dx-dy;

    while(true){
      if ((x0==x1) && (y0==y1)) break;
      var e2 = 2*err;
      if (e2 >-dy){ err -= dy; x0  += sx; }
      if (e2 < dx){ err += dx; y0  += sy; }

      const shouldStop = callback({x: x0, y: y0});
      if (shouldStop) break;
    }
}

export function forEachInRect(topLeft: Position, bottomRight: Position, cb: (Position) => any) {
    for(let x = topLeft.x; x <= bottomRight.x; x += 1) {
        for(let y = topLeft.y; y <= bottomRight.y; y += 1) {
            cb({x: x, y: y});
        }
    }
}
