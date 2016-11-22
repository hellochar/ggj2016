declare module "redux-batched-subscribe" {
    import * as Redux from "redux";
    
    interface NotifyFn {
        (): void;
    }
    function batchedSubscribe(fn: (notify: NotifyFn) => void): Redux.GenericStoreEnhancer;
}
