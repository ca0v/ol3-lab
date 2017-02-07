import $ = require("jquery");

export function jsonp<T>(url: string, args = <any>{}, callback = "callback") {
    let d = $.Deferred<T>();
    {
        args[callback] = "define";
        let uri = url + "?" + Object.keys(args).map(k => `${k}=${args[k]}`).join('&');
        require([uri], (data: T) => d.resolve(data));
    }
    return d;
}

export function post<T>(url: string, args = <any>{}) {
    let d = $.Deferred<T>();
    {
        false && $.post(url, args, (data: any, status: string, XHR: JQueryXHR) => {
            d.resolve(data);
        }, "json");

        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                d.resolve(JSON.parse(xmlHttp.responseText));
        };
        xmlHttp.open("POST", url, true); // true for asynchronous 
        xmlHttp.send(JSON.stringify(args));

    }

    return d;
}

/**
 * If "to" is an array then multiple "to" query strings should be provided (seriously)
 */
export function mapquest<T>(url: string, args = <any>{}, callback = "callback") {
    let d = $.Deferred<T>();
    {
        args[callback] = "define";
        let values = <Array<{ name: string, value: string }>>[];
        Object.keys(args).forEach(k => {
            let value = args[k];
            if (Array.isArray(value)) {
                let arr = <Array<string>>value;
                arr.forEach(v => values.push({ name: k, value: v }));
            } else {
                values.push({ name: k, value: value });
            }
        });

        let uri = url + "?" + values.map(k => `${k.name}=${k.value}`).join('&');
        require([uri], (data: T) => d.resolve(data));
    }
    return d;
}
