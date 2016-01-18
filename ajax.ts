import $ = require("jquery");

export function jsonp<T>(url: string, args = <any>{}) {
    let d = $.Deferred<T>();
    {
        args["callback"] = "define";
        let uri = url + "?" + Object.keys(args).map(k => `${k}=${args[k]}`).join('&');
        require([uri], (data: T) => d.resolve(data));
    }
    return d;
}
