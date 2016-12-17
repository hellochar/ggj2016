// TODO make immutable

/**
 * Binary Heap priority queue. Adapted from https://github.com/adamhooper/js-priority-queue.
 */
export default class PriorityQueue<T> {
    private length: number;
    private data: T[];

    constructor(private comparator: (a: T, b: T) => number) {
        this.length = 0;
        this.data = [];
        // this._heapify()
    }

    //   private _heapify() {
    //     if (this.data.length > 0) {
    //       for (const i in [ 1 ... this.data.length ])
    //         this._bubbleUp(i)
    //     }
    //   }

    public queue(value: T) {
        this.data.push(value)
        this._bubbleUp(this.data.length - 1)
    }

    public dequeue() {
        const ret = this.data[0];
        const last = this.data.pop();
        if (last === undefined) {
            throw "Cannot dequeue empty queue!";
        }
        if (this.data.length > 0) {
            this.data[0] = last;
            this._bubbleDown(0);
        }
        return ret;
    }

    public peek() {
        return this.data[0];
    }

    public clear() {
        this.length = 0;
        this.data.length = 0;
    }

    private _bubbleUp(pos: number) {
        while (pos > 0) {
            const parent = (pos - 1) >>> 1;
            if (this.comparator(this.data[pos], this.data[parent]) < 0) {
                const x = this.data[parent];
                this.data[parent] = this.data[pos];
                this.data[pos] = x;
                pos = parent;
            } else {
                break;
            }
        }
    }

    private _bubbleDown(pos: number) {
        const last = this.data.length - 1;

        while (true) {
            const left = (pos << 1) + 1;
            const right = left + 1;
            let minIndex = pos;
            if (left <= last && this.comparator(this.data[left], this.data[minIndex]) < 0) {
                minIndex = left;
            }
            if (right <= last && this.comparator(this.data[right], this.data[minIndex]) < 0) {
                minIndex = right;
            }

            if (minIndex !== pos) {
                const x = this.data[minIndex]; this.data[minIndex] = this.data[pos]; this.data[pos] = x;
                pos = minIndex;
            } else {
                break;
            }
        }
    }
}