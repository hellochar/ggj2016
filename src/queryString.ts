import * as _ from "lodash";

interface IQueryStringObject {
    debug?: boolean;
    noAnimation?: boolean;
}

export const QUERY_STRING: IQueryStringObject = _.transform(window.location.search.slice(1).split("&"), (obj, searchParam) => {
    // only support boolean properties (yes/no) for now
    obj[searchParam] = true;
}, {});

export default QUERY_STRING;