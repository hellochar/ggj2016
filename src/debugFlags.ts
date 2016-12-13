import * as _ from "lodash";

interface IQueryStringObject {
    debug?: boolean;
    noAnimation?: boolean;
}

export const DEBUG_FLAGS: IQueryStringObject = _.transform(window.location.search.slice(1).split("&"), (obj, searchParam) => {
    // only support boolean properties (yes/no) for now
    obj[searchParam] = true;
}, {});

export default DEBUG_FLAGS;