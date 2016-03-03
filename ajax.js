define(["require", "exports", "jquery"], function (require, exports, $) {
    function jsonp(url, args, callback) {
        if (args === void 0) { args = {}; }
        if (callback === void 0) { callback = "callback"; }
        var d = $.Deferred();
        {
            args[callback] = "define";
            var uri = url + "?" + Object.keys(args).map(function (k) { return (k + "=" + args[k]); }).join('&');
            require([uri], function (data) { return d.resolve(data); });
        }
        return d;
    }
    exports.jsonp = jsonp;
});
