define("node_modules/ol/src/extent/Corner", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        BOTTOM_LEFT: 'bottom-left',
        BOTTOM_RIGHT: 'bottom-right',
        TOP_LEFT: 'top-left',
        TOP_RIGHT: 'top-right',
    };
});
define("node_modules/ol/src/extent/Relationship", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        UNKNOWN: 0,
        INTERSECTING: 1,
        ABOVE: 2,
        RIGHT: 4,
        BELOW: 8,
        LEFT: 16,
    };
});
define("node_modules/ol/src/util", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VERSION = exports.getUid = exports.abstract = void 0;
    function abstract() {
        return ((function () {
            throw new Error('Unimplemented abstract method.');
        })());
    }
    exports.abstract = abstract;
    let uidCounter_ = 0;
    function getUid(obj) {
        return obj.ol_uid || (obj.ol_uid = String(++uidCounter_));
    }
    exports.getUid = getUid;
    exports.VERSION = 'latest';
});
define("node_modules/ol/src/AssertionError", ["require", "exports", "node_modules/ol/src/util"], function (require, exports, util_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AssertionError extends Error {
        constructor(code) {
            const path = util_js_1.VERSION === 'latest' ? util_js_1.VERSION : 'v' + util_js_1.VERSION.split('-')[0];
            const message = 'Assertion failed. See https://openlayers.org/en/' +
                path +
                '/doc/errors/#' +
                code +
                ' for details.';
            super(message);
            this.code = code;
            this.name = 'AssertionError';
            this.message = message;
        }
    }
    exports.default = AssertionError;
});
define("node_modules/ol/src/asserts", ["require", "exports", "node_modules/ol/src/AssertionError"], function (require, exports, AssertionError_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assert = void 0;
    function assert(assertion, errorCode) {
        if (!assertion) {
            throw new AssertionError_js_1.default(errorCode);
        }
    }
    exports.assert = assert;
});
define("node_modules/ol/src/math", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.lerp = exports.modulo = exports.toRadians = exports.toDegrees = exports.solveLinearSystem = exports.squaredDistance = exports.squaredSegmentDistance = exports.log2 = exports.cosh = exports.clamp = void 0;
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    exports.clamp = clamp;
    exports.cosh = (function () {
        let cosh;
        if ('cosh' in Math) {
            cosh = Math.cosh;
        }
        else {
            cosh = function (x) {
                const y = (Math).exp(x);
                return (y + 1 / y) / 2;
            };
        }
        return cosh;
    })();
    exports.log2 = (function () {
        let log2;
        if ('log2' in Math) {
            log2 = Math.log2;
        }
        else {
            log2 = function (x) {
                return Math.log(x) * Math.LOG2E;
            };
        }
        return log2;
    })();
    function squaredSegmentDistance(x, y, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        if (dx !== 0 || dy !== 0) {
            const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
            if (t > 1) {
                x1 = x2;
                y1 = y2;
            }
            else if (t > 0) {
                x1 += dx * t;
                y1 += dy * t;
            }
        }
        return squaredDistance(x, y, x1, y1);
    }
    exports.squaredSegmentDistance = squaredSegmentDistance;
    function squaredDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    }
    exports.squaredDistance = squaredDistance;
    function solveLinearSystem(mat) {
        const n = mat.length;
        for (let i = 0; i < n; i++) {
            let maxRow = i;
            let maxEl = Math.abs(mat[i][i]);
            for (let r = i + 1; r < n; r++) {
                const absValue = Math.abs(mat[r][i]);
                if (absValue > maxEl) {
                    maxEl = absValue;
                    maxRow = r;
                }
            }
            if (maxEl === 0) {
                return null;
            }
            const tmp = mat[maxRow];
            mat[maxRow] = mat[i];
            mat[i] = tmp;
            for (let j = i + 1; j < n; j++) {
                const coef = -mat[j][i] / mat[i][i];
                for (let k = i; k < n + 1; k++) {
                    if (i == k) {
                        mat[j][k] = 0;
                    }
                    else {
                        mat[j][k] += coef * mat[i][k];
                    }
                }
            }
        }
        const x = new Array(n);
        for (let l = n - 1; l >= 0; l--) {
            x[l] = mat[l][n] / mat[l][l];
            for (let m = l - 1; m >= 0; m--) {
                mat[m][n] -= mat[m][l] * x[l];
            }
        }
        return x;
    }
    exports.solveLinearSystem = solveLinearSystem;
    function toDegrees(angleInRadians) {
        return (angleInRadians * 180) / Math.PI;
    }
    exports.toDegrees = toDegrees;
    function toRadians(angleInDegrees) {
        return (angleInDegrees * Math.PI) / 180;
    }
    exports.toRadians = toRadians;
    function modulo(a, b) {
        const r = a % b;
        return r * b < 0 ? r + b : r;
    }
    exports.modulo = modulo;
    function lerp(a, b, x) {
        return a + x * (b - a);
    }
    exports.lerp = lerp;
});
define("node_modules/ol/src/string", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.compareVersions = exports.padNumber = void 0;
    function padNumber(number, width, opt_precision) {
        const numberString = opt_precision !== undefined ? number.toFixed(opt_precision) : '' + number;
        let decimal = numberString.indexOf('.');
        decimal = decimal === -1 ? numberString.length : decimal;
        return decimal > width
            ? numberString
            : new Array(1 + width - decimal).join('0') + numberString;
    }
    exports.padNumber = padNumber;
    function compareVersions(v1, v2) {
        const s1 = ('' + v1).split('.');
        const s2 = ('' + v2).split('.');
        for (let i = 0; i < Math.max(s1.length, s2.length); i++) {
            const n1 = parseInt(s1[i] || '0', 10);
            const n2 = parseInt(s2[i] || '0', 10);
            if (n1 > n2) {
                return 1;
            }
            if (n2 > n1) {
                return -1;
            }
        }
        return 0;
    }
    exports.compareVersions = compareVersions;
});
define("node_modules/ol/src/geom/GeometryType", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        POINT: 'Point',
        LINE_STRING: 'LineString',
        LINEAR_RING: 'LinearRing',
        POLYGON: 'Polygon',
        MULTI_POINT: 'MultiPoint',
        MULTI_LINE_STRING: 'MultiLineString',
        MULTI_POLYGON: 'MultiPolygon',
        GEOMETRY_COLLECTION: 'GeometryCollection',
        CIRCLE: 'Circle',
    };
});
define("node_modules/ol/src/events/Event", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.preventDefault = exports.stopPropagation = void 0;
    class BaseEvent {
        constructor(type) {
            this.propagationStopped;
            this.type = type;
            this.target = null;
        }
        preventDefault() {
            this.propagationStopped = true;
        }
        stopPropagation() {
            this.propagationStopped = true;
        }
    }
    function stopPropagation(evt) {
        evt.stopPropagation();
    }
    exports.stopPropagation = stopPropagation;
    function preventDefault(evt) {
        evt.preventDefault();
    }
    exports.preventDefault = preventDefault;
    exports.default = BaseEvent;
});
define("node_modules/ol/src/ObjectEventType", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        PROPERTYCHANGE: 'propertychange',
    };
});
define("node_modules/ol/src/Disposable", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Disposable {
        constructor() {
            this.disposed = false;
        }
        dispose() {
            if (!this.disposed) {
                this.disposed = true;
                this.disposeInternal();
            }
        }
        disposeInternal() { }
    }
    exports.default = Disposable;
});
define("node_modules/ol/src/array", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isSorted = exports.findIndex = exports.stableSort = exports.equals = exports.find = exports.remove = exports.extend = exports.reverseSubArray = exports.linearFindNearest = exports.includes = exports.numberSafeCompareFunction = exports.binarySearch = void 0;
    function binarySearch(haystack, needle, opt_comparator) {
        let mid, cmp;
        const comparator = opt_comparator || numberSafeCompareFunction;
        let low = 0;
        let high = haystack.length;
        let found = false;
        while (low < high) {
            mid = low + ((high - low) >> 1);
            cmp = +comparator(haystack[mid], needle);
            if (cmp < 0.0) {
                low = mid + 1;
            }
            else {
                high = mid;
                found = !cmp;
            }
        }
        return found ? low : ~low;
    }
    exports.binarySearch = binarySearch;
    function numberSafeCompareFunction(a, b) {
        return a > b ? 1 : a < b ? -1 : 0;
    }
    exports.numberSafeCompareFunction = numberSafeCompareFunction;
    function includes(arr, obj) {
        return arr.indexOf(obj) >= 0;
    }
    exports.includes = includes;
    function linearFindNearest(arr, target, direction) {
        const n = arr.length;
        if (arr[0] <= target) {
            return 0;
        }
        else if (target <= arr[n - 1]) {
            return n - 1;
        }
        else {
            let i;
            if (direction > 0) {
                for (i = 1; i < n; ++i) {
                    if (arr[i] < target) {
                        return i - 1;
                    }
                }
            }
            else if (direction < 0) {
                for (i = 1; i < n; ++i) {
                    if (arr[i] <= target) {
                        return i;
                    }
                }
            }
            else {
                for (i = 1; i < n; ++i) {
                    if (arr[i] == target) {
                        return i;
                    }
                    else if (arr[i] < target) {
                        if (arr[i - 1] - target < target - arr[i]) {
                            return i - 1;
                        }
                        else {
                            return i;
                        }
                    }
                }
            }
            return n - 1;
        }
    }
    exports.linearFindNearest = linearFindNearest;
    function reverseSubArray(arr, begin, end) {
        while (begin < end) {
            const tmp = arr[begin];
            arr[begin] = arr[end];
            arr[end] = tmp;
            ++begin;
            --end;
        }
    }
    exports.reverseSubArray = reverseSubArray;
    function extend(arr, data) {
        const extension = Array.isArray(data) ? data : [data];
        const length = extension.length;
        for (let i = 0; i < length; i++) {
            arr[arr.length] = extension[i];
        }
    }
    exports.extend = extend;
    function remove(arr, obj) {
        const i = arr.indexOf(obj);
        const found = i > -1;
        if (found) {
            arr.splice(i, 1);
        }
        return found;
    }
    exports.remove = remove;
    function find(arr, func) {
        const length = arr.length >>> 0;
        let value;
        for (let i = 0; i < length; i++) {
            value = arr[i];
            if (func(value, i, arr)) {
                return value;
            }
        }
        return null;
    }
    exports.find = find;
    function equals(arr1, arr2) {
        const len1 = arr1.length;
        if (len1 !== arr2.length) {
            return false;
        }
        for (let i = 0; i < len1; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
        return true;
    }
    exports.equals = equals;
    function stableSort(arr, compareFnc) {
        const length = arr.length;
        const tmp = Array(arr.length);
        let i;
        for (i = 0; i < length; i++) {
            tmp[i] = { index: i, value: arr[i] };
        }
        tmp.sort(function (a, b) {
            return compareFnc(a.value, b.value) || a.index - b.index;
        });
        for (i = 0; i < arr.length; i++) {
            arr[i] = tmp[i].value;
        }
    }
    exports.stableSort = stableSort;
    function findIndex(arr, func) {
        let index;
        const found = !arr.every(function (el, idx) {
            index = idx;
            return !func(el, idx, arr);
        });
        return found ? index : -1;
    }
    exports.findIndex = findIndex;
    function isSorted(arr, opt_func, opt_strict) {
        const compare = opt_func || numberSafeCompareFunction;
        return arr.every(function (currentVal, index) {
            if (index === 0) {
                return true;
            }
            const res = compare(arr[index - 1], currentVal);
            return !(res > 0 || (opt_strict && res === 0));
        });
    }
    exports.isSorted = isSorted;
});
define("node_modules/ol/src/functions", ["require", "exports", "node_modules/ol/src/array"], function (require, exports, array_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.memoizeOne = exports.VOID = exports.FALSE = exports.TRUE = void 0;
    function TRUE() {
        return true;
    }
    exports.TRUE = TRUE;
    function FALSE() {
        return false;
    }
    exports.FALSE = FALSE;
    function VOID() { }
    exports.VOID = VOID;
    function memoizeOne(fn) {
        let called = false;
        let lastResult;
        let lastArgs;
        let lastThis;
        return function () {
            const nextArgs = Array.prototype.slice.call(arguments);
            if (!called || this !== lastThis || !array_js_1.equals(nextArgs, lastArgs)) {
                called = true;
                lastThis = this;
                lastArgs = nextArgs;
                lastResult = fn.apply(this, arguments);
            }
            return lastResult;
        };
    }
    exports.memoizeOne = memoizeOne;
});
define("node_modules/ol/src/obj", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isEmpty = exports.getValues = exports.clear = exports.assign = void 0;
    exports.assign = typeof Object.assign === 'function'
        ? Object.assign
        : function (target, var_sources) {
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }
            const output = Object(target);
            for (let i = 1, ii = arguments.length; i < ii; ++i) {
                const source = arguments[i];
                if (source !== undefined && source !== null) {
                    for (const key in source) {
                        if (source.hasOwnProperty(key)) {
                            output[key] = source[key];
                        }
                    }
                }
            }
            return output;
        };
    function clear(object) {
        for (const property in object) {
            delete object[property];
        }
    }
    exports.clear = clear;
    exports.getValues = typeof Object.values === 'function'
        ? Object.values
        : function (object) {
            const values = [];
            for (const property in object) {
                values.push(object[property]);
            }
            return values;
        };
    function isEmpty(object) {
        let property;
        for (property in object) {
            return false;
        }
        return !property;
    }
    exports.isEmpty = isEmpty;
});
define("node_modules/ol/src/events", ["require", "exports", "node_modules/ol/src/obj"], function (require, exports, obj_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.unlistenByKey = exports.listenOnce = exports.listen = void 0;
    function listen(target, type, listener, opt_this, opt_once) {
        if (opt_this && opt_this !== target) {
            listener = listener.bind(opt_this);
        }
        if (opt_once) {
            const originalListener = listener;
            listener = function () {
                target.removeEventListener(type, listener);
                originalListener.apply(this, arguments);
            };
        }
        const eventsKey = {
            target: target,
            type: type,
            listener: listener,
        };
        target.addEventListener(type, listener);
        return eventsKey;
    }
    exports.listen = listen;
    function listenOnce(target, type, listener, opt_this) {
        return listen(target, type, listener, opt_this, true);
    }
    exports.listenOnce = listenOnce;
    function unlistenByKey(key) {
        if (key && key.target) {
            key.target.removeEventListener(key.type, key.listener);
            obj_js_1.clear(key);
        }
    }
    exports.unlistenByKey = unlistenByKey;
});
define("node_modules/ol/src/events/Target", ["require", "exports", "node_modules/ol/src/Disposable", "node_modules/ol/src/events/Event", "node_modules/ol/src/functions", "node_modules/ol/src/obj"], function (require, exports, Disposable_js_1, Event_js_1, functions_js_1, obj_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Target extends Disposable_js_1.default {
        constructor(opt_target) {
            super();
            this.eventTarget_ = opt_target;
            this.pendingRemovals_ = null;
            this.dispatching_ = null;
            this.listeners_ = null;
        }
        addEventListener(type, listener) {
            if (!type || !listener) {
                return;
            }
            const listeners = this.listeners_ || (this.listeners_ = {});
            const listenersForType = listeners[type] || (listeners[type] = []);
            if (listenersForType.indexOf(listener) === -1) {
                listenersForType.push(listener);
            }
        }
        dispatchEvent(event) {
            const evt = typeof event === 'string' ? new Event_js_1.default(event) : event;
            const type = evt.type;
            if (!evt.target) {
                evt.target = this.eventTarget_ || this;
            }
            const listeners = this.listeners_ && this.listeners_[type];
            let propagate;
            if (listeners) {
                const dispatching = this.dispatching_ || (this.dispatching_ = {});
                const pendingRemovals = this.pendingRemovals_ || (this.pendingRemovals_ = {});
                if (!(type in dispatching)) {
                    dispatching[type] = 0;
                    pendingRemovals[type] = 0;
                }
                ++dispatching[type];
                for (let i = 0, ii = listeners.length; i < ii; ++i) {
                    if ('handleEvent' in listeners[i]) {
                        propagate = (listeners[i]).handleEvent(evt);
                    }
                    else {
                        propagate = (listeners[i]).call(this, evt);
                    }
                    if (propagate === false || evt.propagationStopped) {
                        propagate = false;
                        break;
                    }
                }
                --dispatching[type];
                if (dispatching[type] === 0) {
                    let pr = pendingRemovals[type];
                    delete pendingRemovals[type];
                    while (pr--) {
                        this.removeEventListener(type, functions_js_1.VOID);
                    }
                    delete dispatching[type];
                }
                return propagate;
            }
        }
        disposeInternal() {
            this.listeners_ && obj_js_2.clear(this.listeners_);
        }
        getListeners(type) {
            return (this.listeners_ && this.listeners_[type]) || undefined;
        }
        hasListener(opt_type) {
            if (!this.listeners_) {
                return false;
            }
            return opt_type
                ? opt_type in this.listeners_
                : Object.keys(this.listeners_).length > 0;
        }
        removeEventListener(type, listener) {
            const listeners = this.listeners_ && this.listeners_[type];
            if (listeners) {
                const index = listeners.indexOf(listener);
                if (index !== -1) {
                    if (this.pendingRemovals_ && type in this.pendingRemovals_) {
                        listeners[index] = functions_js_1.VOID;
                        ++this.pendingRemovals_[type];
                    }
                    else {
                        listeners.splice(index, 1);
                        if (listeners.length === 0) {
                            delete this.listeners_[type];
                        }
                    }
                }
            }
        }
    }
    exports.default = Target;
});
define("node_modules/ol/src/events/EventType", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        CHANGE: 'change',
        ERROR: 'error',
        BLUR: 'blur',
        CLEAR: 'clear',
        CONTEXTMENU: 'contextmenu',
        CLICK: 'click',
        DBLCLICK: 'dblclick',
        DRAGENTER: 'dragenter',
        DRAGOVER: 'dragover',
        DROP: 'drop',
        FOCUS: 'focus',
        KEYDOWN: 'keydown',
        KEYPRESS: 'keypress',
        LOAD: 'load',
        RESIZE: 'resize',
        TOUCHMOVE: 'touchmove',
        WHEEL: 'wheel',
    };
});
define("node_modules/ol/src/Observable", ["require", "exports", "node_modules/ol/src/events/Target", "node_modules/ol/src/events/EventType", "node_modules/ol/src/events"], function (require, exports, Target_js_1, EventType_js_1, events_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.unByKey = void 0;
    class Observable extends Target_js_1.default {
        constructor() {
            super();
            this.revision_ = 0;
        }
        changed() {
            ++this.revision_;
            this.dispatchEvent(EventType_js_1.default.CHANGE);
        }
        getRevision() {
            return this.revision_;
        }
        on(type, listener) {
            if (Array.isArray(type)) {
                const len = type.length;
                const keys = new Array(len);
                for (let i = 0; i < len; ++i) {
                    keys[i] = events_js_1.listen(this, type[i], listener);
                }
                return keys;
            }
            else {
                return events_js_1.listen(this, (type), listener);
            }
        }
        once(type, listener) {
            let key;
            if (Array.isArray(type)) {
                const len = type.length;
                key = new Array(len);
                for (let i = 0; i < len; ++i) {
                    key[i] = events_js_1.listenOnce(this, type[i], listener);
                }
            }
            else {
                key = events_js_1.listenOnce(this, (type), listener);
            }
            (listener).ol_key = key;
            return key;
        }
        un(type, listener) {
            const key = (listener).ol_key;
            if (key) {
                unByKey(key);
            }
            else if (Array.isArray(type)) {
                for (let i = 0, ii = type.length; i < ii; ++i) {
                    this.removeEventListener(type[i], listener);
                }
            }
            else {
                this.removeEventListener(type, listener);
            }
        }
    }
    function unByKey(key) {
        if (Array.isArray(key)) {
            for (let i = 0, ii = key.length; i < ii; ++i) {
                events_js_1.unlistenByKey(key[i]);
            }
        }
        else {
            events_js_1.unlistenByKey((key));
        }
    }
    exports.unByKey = unByKey;
    exports.default = Observable;
});
define("node_modules/ol/src/Object", ["require", "exports", "node_modules/ol/src/events/Event", "node_modules/ol/src/ObjectEventType", "node_modules/ol/src/Observable", "node_modules/ol/src/obj", "node_modules/ol/src/util"], function (require, exports, Event_js_2, ObjectEventType_js_1, Observable_js_1, obj_js_3, util_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getChangeEventType = exports.ObjectEvent = void 0;
    class ObjectEvent extends Event_js_2.default {
        constructor(type, key, oldValue) {
            super(type);
            this.key = key;
            this.oldValue = oldValue;
        }
    }
    exports.ObjectEvent = ObjectEvent;
    class BaseObject extends Observable_js_1.default {
        constructor(opt_values) {
            super();
            util_js_2.getUid(this);
            this.values_ = null;
            if (opt_values !== undefined) {
                this.setProperties(opt_values);
            }
        }
        get(key) {
            let value;
            if (this.values_ && this.values_.hasOwnProperty(key)) {
                value = this.values_[key];
            }
            return value;
        }
        getKeys() {
            return (this.values_ && Object.keys(this.values_)) || [];
        }
        getProperties() {
            return (this.values_ && obj_js_3.assign({}, this.values_)) || {};
        }
        hasProperties() {
            return !!this.values_;
        }
        notify(key, oldValue) {
            let eventType;
            eventType = getChangeEventType(key);
            this.dispatchEvent(new ObjectEvent(eventType, key, oldValue));
            eventType = ObjectEventType_js_1.default.PROPERTYCHANGE;
            this.dispatchEvent(new ObjectEvent(eventType, key, oldValue));
        }
        set(key, value, opt_silent) {
            const values = this.values_ || (this.values_ = {});
            if (opt_silent) {
                values[key] = value;
            }
            else {
                const oldValue = values[key];
                values[key] = value;
                if (oldValue !== value) {
                    this.notify(key, oldValue);
                }
            }
        }
        setProperties(values, opt_silent) {
            for (const key in values) {
                this.set(key, values[key], opt_silent);
            }
        }
        unset(key, opt_silent) {
            if (this.values_ && key in this.values_) {
                const oldValue = this.values_[key];
                delete this.values_[key];
                if (obj_js_3.isEmpty(this.values_)) {
                    this.values_ = null;
                }
                if (!opt_silent) {
                    this.notify(key, oldValue);
                }
            }
        }
    }
    const changeEventTypeCache = {};
    function getChangeEventType(key) {
        return changeEventTypeCache.hasOwnProperty(key)
            ? changeEventTypeCache[key]
            : (changeEventTypeCache[key] = 'change:' + key);
    }
    exports.getChangeEventType = getChangeEventType;
    exports.default = BaseObject;
});
define("node_modules/ol/src/proj/Units", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.METERS_PER_UNIT = void 0;
    const Units = {
        DEGREES: 'degrees',
        FEET: 'ft',
        METERS: 'm',
        PIXELS: 'pixels',
        TILE_PIXELS: 'tile-pixels',
        USFEET: 'us-ft',
    };
    exports.METERS_PER_UNIT = {};
    exports.METERS_PER_UNIT[Units.DEGREES] = (2 * Math.PI * 6370997) / 360;
    exports.METERS_PER_UNIT[Units.FEET] = 0.3048;
    exports.METERS_PER_UNIT[Units.METERS] = 1;
    exports.METERS_PER_UNIT[Units.USFEET] = 1200 / 3937;
    exports.default = Units;
});
define("node_modules/ol/src/pixel", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.nothing = void 0;
});
define("node_modules/ol/src/transform", ["require", "exports", "node_modules/ol/src/asserts"], function (require, exports, asserts_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toString = exports.determinant = exports.makeInverse = exports.invert = exports.composeCssTransform = exports.compose = exports.translate = exports.makeScale = exports.scale = exports.rotate = exports.apply = exports.setFromArray = exports.set = exports.multiply = exports.reset = exports.create = void 0;
    const tmp_ = new Array(6);
    function create() {
        return [1, 0, 0, 1, 0, 0];
    }
    exports.create = create;
    function reset(transform) {
        return set(transform, 1, 0, 0, 1, 0, 0);
    }
    exports.reset = reset;
    function multiply(transform1, transform2) {
        const a1 = transform1[0];
        const b1 = transform1[1];
        const c1 = transform1[2];
        const d1 = transform1[3];
        const e1 = transform1[4];
        const f1 = transform1[5];
        const a2 = transform2[0];
        const b2 = transform2[1];
        const c2 = transform2[2];
        const d2 = transform2[3];
        const e2 = transform2[4];
        const f2 = transform2[5];
        transform1[0] = a1 * a2 + c1 * b2;
        transform1[1] = b1 * a2 + d1 * b2;
        transform1[2] = a1 * c2 + c1 * d2;
        transform1[3] = b1 * c2 + d1 * d2;
        transform1[4] = a1 * e2 + c1 * f2 + e1;
        transform1[5] = b1 * e2 + d1 * f2 + f1;
        return transform1;
    }
    exports.multiply = multiply;
    function set(transform, a, b, c, d, e, f) {
        transform[0] = a;
        transform[1] = b;
        transform[2] = c;
        transform[3] = d;
        transform[4] = e;
        transform[5] = f;
        return transform;
    }
    exports.set = set;
    function setFromArray(transform1, transform2) {
        transform1[0] = transform2[0];
        transform1[1] = transform2[1];
        transform1[2] = transform2[2];
        transform1[3] = transform2[3];
        transform1[4] = transform2[4];
        transform1[5] = transform2[5];
        return transform1;
    }
    exports.setFromArray = setFromArray;
    function apply(transform, coordinate) {
        const x = coordinate[0];
        const y = coordinate[1];
        coordinate[0] = transform[0] * x + transform[2] * y + transform[4];
        coordinate[1] = transform[1] * x + transform[3] * y + transform[5];
        return coordinate;
    }
    exports.apply = apply;
    function rotate(transform, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return multiply(transform, set(tmp_, cos, sin, -sin, cos, 0, 0));
    }
    exports.rotate = rotate;
    function scale(transform, x, y) {
        return multiply(transform, set(tmp_, x, 0, 0, y, 0, 0));
    }
    exports.scale = scale;
    function makeScale(target, x, y) {
        return set(target, x, 0, 0, y, 0, 0);
    }
    exports.makeScale = makeScale;
    function translate(transform, dx, dy) {
        return multiply(transform, set(tmp_, 1, 0, 0, 1, dx, dy));
    }
    exports.translate = translate;
    function compose(transform, dx1, dy1, sx, sy, angle, dx2, dy2) {
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        transform[0] = sx * cos;
        transform[1] = sy * sin;
        transform[2] = -sx * sin;
        transform[3] = sy * cos;
        transform[4] = dx2 * sx * cos - dy2 * sx * sin + dx1;
        transform[5] = dx2 * sy * sin + dy2 * sy * cos + dy1;
        return transform;
    }
    exports.compose = compose;
    function composeCssTransform(dx1, dy1, sx, sy, angle, dx2, dy2) {
        return toString(compose(create(), dx1, dy1, sx, sy, angle, dx2, dy2));
    }
    exports.composeCssTransform = composeCssTransform;
    function invert(source) {
        return makeInverse(source, source);
    }
    exports.invert = invert;
    function makeInverse(target, source) {
        const det = determinant(source);
        asserts_js_1.assert(det !== 0, 32);
        const a = source[0];
        const b = source[1];
        const c = source[2];
        const d = source[3];
        const e = source[4];
        const f = source[5];
        target[0] = d / det;
        target[1] = -b / det;
        target[2] = -c / det;
        target[3] = a / det;
        target[4] = (c * f - d * e) / det;
        target[5] = -(a * f - b * e) / det;
        return target;
    }
    exports.makeInverse = makeInverse;
    function determinant(mat) {
        return mat[0] * mat[3] - mat[1] * mat[2];
    }
    exports.determinant = determinant;
    function toString(mat) {
        return 'matrix(' + mat.join(', ') + ')';
    }
    exports.toString = toString;
});
define("node_modules/ol/src/tilecoord", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.withinExtentAndZ = exports.hash = exports.fromKey = exports.getKey = exports.getKeyZXY = exports.createOrUpdate = void 0;
    function createOrUpdate(z, x, y, opt_tileCoord) {
        if (opt_tileCoord !== undefined) {
            opt_tileCoord[0] = z;
            opt_tileCoord[1] = x;
            opt_tileCoord[2] = y;
            return opt_tileCoord;
        }
        else {
            return [z, x, y];
        }
    }
    exports.createOrUpdate = createOrUpdate;
    function getKeyZXY(z, x, y) {
        return z + '/' + x + '/' + y;
    }
    exports.getKeyZXY = getKeyZXY;
    function getKey(tileCoord) {
        return getKeyZXY(tileCoord[0], tileCoord[1], tileCoord[2]);
    }
    exports.getKey = getKey;
    function fromKey(key) {
        return key.split('/').map(Number);
    }
    exports.fromKey = fromKey;
    function hash(tileCoord) {
        return (tileCoord[1] << tileCoord[0]) + tileCoord[2];
    }
    exports.hash = hash;
    function withinExtentAndZ(tileCoord, tileGrid) {
        const z = tileCoord[0];
        const x = tileCoord[1];
        const y = tileCoord[2];
        if (tileGrid.getMinZoom() > z || z > tileGrid.getMaxZoom()) {
            return false;
        }
        const extent = tileGrid.getExtent();
        let tileRange;
        if (!extent) {
            tileRange = tileGrid.getFullTileRange(z);
        }
        else {
            tileRange = tileGrid.getTileRangeForExtentAndZ(extent, z);
        }
        if (!tileRange) {
            return true;
        }
        else {
            return tileRange.containsXY(x, y);
        }
    }
    exports.withinExtentAndZ = withinExtentAndZ;
});
define("node_modules/ol/src/size", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toSize = exports.scale = exports.hasArea = exports.buffer = void 0;
    function buffer(size, num, opt_size) {
        if (opt_size === undefined) {
            opt_size = [0, 0];
        }
        opt_size[0] = size[0] + 2 * num;
        opt_size[1] = size[1] + 2 * num;
        return opt_size;
    }
    exports.buffer = buffer;
    function hasArea(size) {
        return size[0] > 0 && size[1] > 0;
    }
    exports.hasArea = hasArea;
    function scale(size, ratio, opt_size) {
        if (opt_size === undefined) {
            opt_size = [0, 0];
        }
        opt_size[0] = (size[0] * ratio + 0.5) | 0;
        opt_size[1] = (size[1] * ratio + 0.5) | 0;
        return opt_size;
    }
    exports.scale = scale;
    function toSize(size, opt_size) {
        if (Array.isArray(size)) {
            return size;
        }
        else {
            if (opt_size === undefined) {
                opt_size = [size, size];
            }
            else {
                opt_size[0] = size;
                opt_size[1] = size;
            }
            return opt_size;
        }
    }
    exports.toSize = toSize;
});
define("node_modules/ol/src/TileRange", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createOrUpdate = void 0;
    class TileRange {
        constructor(minX, maxX, minY, maxY) {
            this.minX = minX;
            this.maxX = maxX;
            this.minY = minY;
            this.maxY = maxY;
        }
        contains(tileCoord) {
            return this.containsXY(tileCoord[1], tileCoord[2]);
        }
        containsTileRange(tileRange) {
            return (this.minX <= tileRange.minX &&
                tileRange.maxX <= this.maxX &&
                this.minY <= tileRange.minY &&
                tileRange.maxY <= this.maxY);
        }
        containsXY(x, y) {
            return this.minX <= x && x <= this.maxX && this.minY <= y && y <= this.maxY;
        }
        equals(tileRange) {
            return (this.minX == tileRange.minX &&
                this.minY == tileRange.minY &&
                this.maxX == tileRange.maxX &&
                this.maxY == tileRange.maxY);
        }
        extend(tileRange) {
            if (tileRange.minX < this.minX) {
                this.minX = tileRange.minX;
            }
            if (tileRange.maxX > this.maxX) {
                this.maxX = tileRange.maxX;
            }
            if (tileRange.minY < this.minY) {
                this.minY = tileRange.minY;
            }
            if (tileRange.maxY > this.maxY) {
                this.maxY = tileRange.maxY;
            }
        }
        getHeight() {
            return this.maxY - this.minY + 1;
        }
        getSize() {
            return [this.getWidth(), this.getHeight()];
        }
        getWidth() {
            return this.maxX - this.minX + 1;
        }
        intersects(tileRange) {
            return (this.minX <= tileRange.maxX &&
                this.maxX >= tileRange.minX &&
                this.minY <= tileRange.maxY &&
                this.maxY >= tileRange.minY);
        }
    }
    function createOrUpdate(minX, maxX, minY, maxY, tileRange) {
        if (tileRange !== undefined) {
            tileRange.minX = minX;
            tileRange.maxX = maxX;
            tileRange.minY = minY;
            tileRange.maxY = maxY;
            return tileRange;
        }
        else {
            return new TileRange(minX, maxX, minY, maxY);
        }
    }
    exports.createOrUpdate = createOrUpdate;
    exports.default = TileRange;
});
define("node_modules/ol/src/tilegrid/common", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DEFAULT_TILE_SIZE = exports.DEFAULT_MAX_ZOOM = void 0;
    exports.DEFAULT_MAX_ZOOM = 42;
    exports.DEFAULT_TILE_SIZE = 256;
});
define("node_modules/ol/src/tilegrid/TileGrid", ["require", "exports", "node_modules/ol/src/TileRange", "node_modules/ol/src/tilegrid/common", "node_modules/ol/src/asserts", "node_modules/ol/src/math", "node_modules/ol/src/extent", "node_modules/ol/src/tilecoord", "node_modules/ol/src/array", "node_modules/ol/src/size"], function (require, exports, TileRange_js_1, common_js_1, asserts_js_2, math_js_1, extent_js_1, tilecoord_js_1, array_js_2, size_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tmpTileCoord = [0, 0, 0];
    class TileGrid {
        constructor(options) {
            this.minZoom = options.minZoom !== undefined ? options.minZoom : 0;
            this.resolutions_ = options.resolutions;
            asserts_js_2.assert(array_js_2.isSorted(this.resolutions_, function (a, b) {
                return b - a;
            }, true), 17);
            let zoomFactor;
            if (!options.origins) {
                for (let i = 0, ii = this.resolutions_.length - 1; i < ii; ++i) {
                    if (!zoomFactor) {
                        zoomFactor = this.resolutions_[i] / this.resolutions_[i + 1];
                    }
                    else {
                        if (this.resolutions_[i] / this.resolutions_[i + 1] !== zoomFactor) {
                            zoomFactor = undefined;
                            break;
                        }
                    }
                }
            }
            this.zoomFactor_ = zoomFactor;
            this.maxZoom = this.resolutions_.length - 1;
            this.origin_ = options.origin !== undefined ? options.origin : null;
            this.origins_ = null;
            if (options.origins !== undefined) {
                this.origins_ = options.origins;
                asserts_js_2.assert(this.origins_.length == this.resolutions_.length, 20);
            }
            const extent = options.extent;
            if (extent !== undefined && !this.origin_ && !this.origins_) {
                this.origin_ = extent_js_1.getTopLeft(extent);
            }
            asserts_js_2.assert((!this.origin_ && this.origins_) || (this.origin_ && !this.origins_), 18);
            this.tileSizes_ = null;
            if (options.tileSizes !== undefined) {
                this.tileSizes_ = options.tileSizes;
                asserts_js_2.assert(this.tileSizes_.length == this.resolutions_.length, 19);
            }
            this.tileSize_ =
                options.tileSize !== undefined
                    ? options.tileSize
                    : !this.tileSizes_
                        ? common_js_1.DEFAULT_TILE_SIZE
                        : null;
            asserts_js_2.assert((!this.tileSize_ && this.tileSizes_) ||
                (this.tileSize_ && !this.tileSizes_), 22);
            this.extent_ = extent !== undefined ? extent : null;
            this.fullTileRanges_ = null;
            this.tmpSize_ = [0, 0];
            if (options.sizes !== undefined) {
                this.fullTileRanges_ = options.sizes.map(function (size, z) {
                    const tileRange = new TileRange_js_1.default(Math.min(0, size[0]), Math.max(size[0] - 1, -1), Math.min(0, size[1]), Math.max(size[1] - 1, -1));
                    return tileRange;
                }, this);
            }
            else if (extent) {
                this.calculateTileRanges_(extent);
            }
        }
        forEachTileCoord(extent, zoom, callback) {
            const tileRange = this.getTileRangeForExtentAndZ(extent, zoom);
            for (let i = tileRange.minX, ii = tileRange.maxX; i <= ii; ++i) {
                for (let j = tileRange.minY, jj = tileRange.maxY; j <= jj; ++j) {
                    callback([zoom, i, j]);
                }
            }
        }
        forEachTileCoordParentTileRange(tileCoord, callback, opt_tileRange, opt_extent) {
            let tileRange, x, y;
            let tileCoordExtent = null;
            let z = tileCoord[0] - 1;
            if (this.zoomFactor_ === 2) {
                x = tileCoord[1];
                y = tileCoord[2];
            }
            else {
                tileCoordExtent = this.getTileCoordExtent(tileCoord, opt_extent);
            }
            while (z >= this.minZoom) {
                if (this.zoomFactor_ === 2) {
                    x = Math.floor(x / 2);
                    y = Math.floor(y / 2);
                    tileRange = TileRange_js_1.createOrUpdate(x, x, y, y, opt_tileRange);
                }
                else {
                    tileRange = this.getTileRangeForExtentAndZ(tileCoordExtent, z, opt_tileRange);
                }
                if (callback(z, tileRange)) {
                    return true;
                }
                --z;
            }
            return false;
        }
        getExtent() {
            return this.extent_;
        }
        getMaxZoom() {
            return this.maxZoom;
        }
        getMinZoom() {
            return this.minZoom;
        }
        getOrigin(z) {
            if (this.origin_) {
                return this.origin_;
            }
            else {
                return this.origins_[z];
            }
        }
        getResolution(z) {
            return this.resolutions_[z];
        }
        getResolutions() {
            return this.resolutions_;
        }
        getTileCoordChildTileRange(tileCoord, opt_tileRange, opt_extent) {
            if (tileCoord[0] < this.maxZoom) {
                if (this.zoomFactor_ === 2) {
                    const minX = tileCoord[1] * 2;
                    const minY = tileCoord[2] * 2;
                    return TileRange_js_1.createOrUpdate(minX, minX + 1, minY, minY + 1, opt_tileRange);
                }
                const tileCoordExtent = this.getTileCoordExtent(tileCoord, opt_extent);
                return this.getTileRangeForExtentAndZ(tileCoordExtent, tileCoord[0] + 1, opt_tileRange);
            }
            return null;
        }
        getTileRangeExtent(z, tileRange, opt_extent) {
            const origin = this.getOrigin(z);
            const resolution = this.getResolution(z);
            const tileSize = size_js_1.toSize(this.getTileSize(z), this.tmpSize_);
            const minX = origin[0] + tileRange.minX * tileSize[0] * resolution;
            const maxX = origin[0] + (tileRange.maxX + 1) * tileSize[0] * resolution;
            const minY = origin[1] + tileRange.minY * tileSize[1] * resolution;
            const maxY = origin[1] + (tileRange.maxY + 1) * tileSize[1] * resolution;
            return extent_js_1.createOrUpdate(minX, minY, maxX, maxY, opt_extent);
        }
        getTileRangeForExtentAndZ(extent, z, opt_tileRange) {
            const tileCoord = tmpTileCoord;
            this.getTileCoordForXYAndZ_(extent[0], extent[3], z, false, tileCoord);
            const minX = tileCoord[1];
            const minY = tileCoord[2];
            this.getTileCoordForXYAndZ_(extent[2], extent[1], z, true, tileCoord);
            return TileRange_js_1.createOrUpdate(minX, tileCoord[1], minY, tileCoord[2], opt_tileRange);
        }
        getTileCoordCenter(tileCoord) {
            const origin = this.getOrigin(tileCoord[0]);
            const resolution = this.getResolution(tileCoord[0]);
            const tileSize = size_js_1.toSize(this.getTileSize(tileCoord[0]), this.tmpSize_);
            return [
                origin[0] + (tileCoord[1] + 0.5) * tileSize[0] * resolution,
                origin[1] - (tileCoord[2] + 0.5) * tileSize[1] * resolution,
            ];
        }
        getTileCoordExtent(tileCoord, opt_extent) {
            const origin = this.getOrigin(tileCoord[0]);
            const resolution = this.getResolution(tileCoord[0]);
            const tileSize = size_js_1.toSize(this.getTileSize(tileCoord[0]), this.tmpSize_);
            const minX = origin[0] + tileCoord[1] * tileSize[0] * resolution;
            const minY = origin[1] - (tileCoord[2] + 1) * tileSize[1] * resolution;
            const maxX = minX + tileSize[0] * resolution;
            const maxY = minY + tileSize[1] * resolution;
            return extent_js_1.createOrUpdate(minX, minY, maxX, maxY, opt_extent);
        }
        getTileCoordForCoordAndResolution(coordinate, resolution, opt_tileCoord) {
            return this.getTileCoordForXYAndResolution_(coordinate[0], coordinate[1], resolution, false, opt_tileCoord);
        }
        getTileCoordForXYAndResolution_(x, y, resolution, reverseIntersectionPolicy, opt_tileCoord) {
            const z = this.getZForResolution(resolution);
            const scale = resolution / this.getResolution(z);
            const origin = this.getOrigin(z);
            const tileSize = size_js_1.toSize(this.getTileSize(z), this.tmpSize_);
            const adjustX = reverseIntersectionPolicy ? 0.5 : 0;
            const adjustY = reverseIntersectionPolicy ? 0.5 : 0;
            const xFromOrigin = Math.floor((x - origin[0]) / resolution + adjustX);
            const yFromOrigin = Math.floor((origin[1] - y) / resolution + adjustY);
            let tileCoordX = (scale * xFromOrigin) / tileSize[0];
            let tileCoordY = (scale * yFromOrigin) / tileSize[1];
            if (reverseIntersectionPolicy) {
                tileCoordX = Math.ceil(tileCoordX) - 1;
                tileCoordY = Math.ceil(tileCoordY) - 1;
            }
            else {
                tileCoordX = Math.floor(tileCoordX);
                tileCoordY = Math.floor(tileCoordY);
            }
            return tilecoord_js_1.createOrUpdate(z, tileCoordX, tileCoordY, opt_tileCoord);
        }
        getTileCoordForXYAndZ_(x, y, z, reverseIntersectionPolicy, opt_tileCoord) {
            const origin = this.getOrigin(z);
            const resolution = this.getResolution(z);
            const tileSize = size_js_1.toSize(this.getTileSize(z), this.tmpSize_);
            const adjustX = reverseIntersectionPolicy ? 0.5 : 0;
            const adjustY = reverseIntersectionPolicy ? 0.5 : 0;
            const xFromOrigin = Math.floor((x - origin[0]) / resolution + adjustX);
            const yFromOrigin = Math.floor((origin[1] - y) / resolution + adjustY);
            let tileCoordX = xFromOrigin / tileSize[0];
            let tileCoordY = yFromOrigin / tileSize[1];
            if (reverseIntersectionPolicy) {
                tileCoordX = Math.ceil(tileCoordX) - 1;
                tileCoordY = Math.ceil(tileCoordY) - 1;
            }
            else {
                tileCoordX = Math.floor(tileCoordX);
                tileCoordY = Math.floor(tileCoordY);
            }
            return tilecoord_js_1.createOrUpdate(z, tileCoordX, tileCoordY, opt_tileCoord);
        }
        getTileCoordForCoordAndZ(coordinate, z, opt_tileCoord) {
            return this.getTileCoordForXYAndZ_(coordinate[0], coordinate[1], z, false, opt_tileCoord);
        }
        getTileCoordResolution(tileCoord) {
            return this.resolutions_[tileCoord[0]];
        }
        getTileSize(z) {
            if (this.tileSize_) {
                return this.tileSize_;
            }
            else {
                return this.tileSizes_[z];
            }
        }
        getFullTileRange(z) {
            if (!this.fullTileRanges_) {
                return null;
            }
            else {
                return this.fullTileRanges_[z];
            }
        }
        getZForResolution(resolution, opt_direction) {
            const z = array_js_2.linearFindNearest(this.resolutions_, resolution, opt_direction || 0);
            return math_js_1.clamp(z, this.minZoom, this.maxZoom);
        }
        calculateTileRanges_(extent) {
            const length = this.resolutions_.length;
            const fullTileRanges = new Array(length);
            for (let z = this.minZoom; z < length; ++z) {
                fullTileRanges[z] = this.getTileRangeForExtentAndZ(extent, z);
            }
            this.fullTileRanges_ = fullTileRanges;
        }
    }
    exports.default = TileGrid;
});
define("node_modules/ol/src/proj/Projection", ["require", "exports", "node_modules/ol/src/proj/Units"], function (require, exports, Units_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Projection {
        constructor(options) {
            this.code_ = options.code;
            this.units_ = (options.units);
            this.extent_ = options.extent !== undefined ? options.extent : null;
            this.worldExtent_ =
                options.worldExtent !== undefined ? options.worldExtent : null;
            this.axisOrientation_ =
                options.axisOrientation !== undefined ? options.axisOrientation : 'enu';
            this.global_ = options.global !== undefined ? options.global : false;
            this.canWrapX_ = !!(this.global_ && this.extent_);
            this.getPointResolutionFunc_ = options.getPointResolution;
            this.defaultTileGrid_ = null;
            this.metersPerUnit_ = options.metersPerUnit;
        }
        canWrapX() {
            return this.canWrapX_;
        }
        getCode() {
            return this.code_;
        }
        getExtent() {
            return this.extent_;
        }
        getUnits() {
            return this.units_;
        }
        getMetersPerUnit() {
            return this.metersPerUnit_ || Units_js_1.METERS_PER_UNIT[this.units_];
        }
        getWorldExtent() {
            return this.worldExtent_;
        }
        getAxisOrientation() {
            return this.axisOrientation_;
        }
        isGlobal() {
            return this.global_;
        }
        setGlobal(global) {
            this.global_ = global;
            this.canWrapX_ = !!(global && this.extent_);
        }
        getDefaultTileGrid() {
            return this.defaultTileGrid_;
        }
        setDefaultTileGrid(tileGrid) {
            this.defaultTileGrid_ = tileGrid;
        }
        setExtent(extent) {
            this.extent_ = extent;
            this.canWrapX_ = !!(this.global_ && extent);
        }
        setWorldExtent(worldExtent) {
            this.worldExtent_ = worldExtent;
        }
        setGetPointResolution(func) {
            this.getPointResolutionFunc_ = func;
        }
        getPointResolutionFunc() {
            return this.getPointResolutionFunc_;
        }
    }
    exports.default = Projection;
});
define("node_modules/ol/src/proj/epsg3857", ["require", "exports", "node_modules/ol/src/proj/Projection", "node_modules/ol/src/proj/Units", "node_modules/ol/src/math"], function (require, exports, Projection_js_1, Units_js_2, math_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toEPSG4326 = exports.fromEPSG4326 = exports.PROJECTIONS = exports.WORLD_EXTENT = exports.EXTENT = exports.HALF_SIZE = exports.RADIUS = void 0;
    exports.RADIUS = 6378137;
    exports.HALF_SIZE = Math.PI * exports.RADIUS;
    exports.EXTENT = [-exports.HALF_SIZE, -exports.HALF_SIZE, exports.HALF_SIZE, exports.HALF_SIZE];
    exports.WORLD_EXTENT = [-180, -85, 180, 85];
    class EPSG3857Projection extends Projection_js_1.default {
        constructor(code) {
            super({
                code: code,
                units: Units_js_2.default.METERS,
                extent: exports.EXTENT,
                global: true,
                worldExtent: exports.WORLD_EXTENT,
                getPointResolution: function (resolution, point) {
                    return resolution / math_js_2.cosh(point[1] / exports.RADIUS);
                },
            });
        }
    }
    exports.PROJECTIONS = [
        new EPSG3857Projection('EPSG:3857'),
        new EPSG3857Projection('EPSG:102100'),
        new EPSG3857Projection('EPSG:102113'),
        new EPSG3857Projection('EPSG:900913'),
        new EPSG3857Projection('urn:ogc:def:crs:EPSG:6.18:3:3857'),
        new EPSG3857Projection('urn:ogc:def:crs:EPSG::3857'),
        new EPSG3857Projection('http://www.opengis.net/gml/srs/epsg.xml#3857'),
    ];
    function fromEPSG4326(input, opt_output, opt_dimension) {
        const length = input.length;
        const dimension = opt_dimension > 1 ? opt_dimension : 2;
        let output = opt_output;
        if (output === undefined) {
            if (dimension > 2) {
                output = input.slice();
            }
            else {
                output = new Array(length);
            }
        }
        const halfSize = exports.HALF_SIZE;
        for (let i = 0; i < length; i += dimension) {
            output[i] = (halfSize * input[i]) / 180;
            let y = exports.RADIUS * Math.log(Math.tan((Math.PI * (+input[i + 1] + 90)) / 360));
            if (y > halfSize) {
                y = halfSize;
            }
            else if (y < -halfSize) {
                y = -halfSize;
            }
            output[i + 1] = y;
        }
        return output;
    }
    exports.fromEPSG4326 = fromEPSG4326;
    function toEPSG4326(input, opt_output, opt_dimension) {
        const length = input.length;
        const dimension = opt_dimension > 1 ? opt_dimension : 2;
        let output = opt_output;
        if (output === undefined) {
            if (dimension > 2) {
                output = input.slice();
            }
            else {
                output = new Array(length);
            }
        }
        for (let i = 0; i < length; i += dimension) {
            output[i] = (180 * input[i]) / exports.HALF_SIZE;
            output[i + 1] =
                (360 * Math.atan(Math.exp(input[i + 1] / exports.RADIUS))) / Math.PI - 90;
        }
        return output;
    }
    exports.toEPSG4326 = toEPSG4326;
});
define("node_modules/ol/src/proj/epsg4326", ["require", "exports", "node_modules/ol/src/proj/Projection", "node_modules/ol/src/proj/Units"], function (require, exports, Projection_js_2, Units_js_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PROJECTIONS = exports.METERS_PER_UNIT = exports.EXTENT = exports.RADIUS = void 0;
    exports.RADIUS = 6378137;
    exports.EXTENT = [-180, -90, 180, 90];
    exports.METERS_PER_UNIT = (Math.PI * exports.RADIUS) / 180;
    class EPSG4326Projection extends Projection_js_2.default {
        constructor(code, opt_axisOrientation) {
            super({
                code: code,
                units: Units_js_3.default.DEGREES,
                extent: exports.EXTENT,
                axisOrientation: opt_axisOrientation,
                global: true,
                metersPerUnit: exports.METERS_PER_UNIT,
                worldExtent: exports.EXTENT,
            });
        }
    }
    exports.PROJECTIONS = [
        new EPSG4326Projection('CRS:84'),
        new EPSG4326Projection('EPSG:4326', 'neu'),
        new EPSG4326Projection('urn:ogc:def:crs:EPSG::4326', 'neu'),
        new EPSG4326Projection('urn:ogc:def:crs:EPSG:6.6:4326', 'neu'),
        new EPSG4326Projection('urn:ogc:def:crs:OGC:1.3:CRS84'),
        new EPSG4326Projection('urn:ogc:def:crs:OGC:2:84'),
        new EPSG4326Projection('http://www.opengis.net/gml/srs/epsg.xml#4326', 'neu'),
        new EPSG4326Projection('urn:x-ogc:def:crs:EPSG:4326', 'neu'),
    ];
});
define("node_modules/ol/src/proj/projections", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.add = exports.get = exports.clear = void 0;
    let cache = {};
    function clear() {
        cache = {};
    }
    exports.clear = clear;
    function get(code) {
        return cache[code] || null;
    }
    exports.get = get;
    function add(code, projection) {
        cache[code] = projection;
    }
    exports.add = add;
});
define("node_modules/ol/src/proj/transforms", ["require", "exports", "node_modules/ol/src/obj"], function (require, exports, obj_js_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.get = exports.remove = exports.add = exports.clear = void 0;
    let transforms = {};
    function clear() {
        transforms = {};
    }
    exports.clear = clear;
    function add(source, destination, transformFn) {
        const sourceCode = source.getCode();
        const destinationCode = destination.getCode();
        if (!(sourceCode in transforms)) {
            transforms[sourceCode] = {};
        }
        transforms[sourceCode][destinationCode] = transformFn;
    }
    exports.add = add;
    function remove(source, destination) {
        const sourceCode = source.getCode();
        const destinationCode = destination.getCode();
        const transform = transforms[sourceCode][destinationCode];
        delete transforms[sourceCode][destinationCode];
        if (obj_js_4.isEmpty(transforms[sourceCode])) {
            delete transforms[sourceCode];
        }
        return transform;
    }
    exports.remove = remove;
    function get(sourceCode, destinationCode) {
        let transform;
        if (sourceCode in transforms && destinationCode in transforms[sourceCode]) {
            transform = transforms[sourceCode][destinationCode];
        }
        return transform;
    }
    exports.get = get;
});
define("node_modules/ol/src/geom/GeometryCollection", ["require", "exports", "node_modules/ol/src/events/EventType", "node_modules/ol/src/geom/Geometry", "node_modules/ol/src/geom/GeometryType", "node_modules/ol/src/extent", "node_modules/ol/src/events"], function (require, exports, EventType_js_2, Geometry_js_1, GeometryType_js_1, extent_js_2, events_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GeometryCollection extends Geometry_js_1.default {
        constructor(opt_geometries) {
            super();
            this.geometries_ = opt_geometries ? opt_geometries : null;
            this.changeEventsKeys_ = [];
            this.listenGeometriesChange_();
        }
        unlistenGeometriesChange_() {
            this.changeEventsKeys_.forEach(events_js_2.unlistenByKey);
            this.changeEventsKeys_.length = 0;
        }
        listenGeometriesChange_() {
            if (!this.geometries_) {
                return;
            }
            for (let i = 0, ii = this.geometries_.length; i < ii; ++i) {
                this.changeEventsKeys_.push(events_js_2.listen(this.geometries_[i], EventType_js_2.default.CHANGE, this.changed, this));
            }
        }
        clone() {
            const geometryCollection = new GeometryCollection(null);
            geometryCollection.setGeometries(this.geometries_);
            return geometryCollection;
        }
        closestPointXY(x, y, closestPoint, minSquaredDistance) {
            if (minSquaredDistance < extent_js_2.closestSquaredDistanceXY(this.getExtent(), x, y)) {
                return minSquaredDistance;
            }
            const geometries = this.geometries_;
            for (let i = 0, ii = geometries.length; i < ii; ++i) {
                minSquaredDistance = geometries[i].closestPointXY(x, y, closestPoint, minSquaredDistance);
            }
            return minSquaredDistance;
        }
        containsXY(x, y) {
            const geometries = this.geometries_;
            for (let i = 0, ii = geometries.length; i < ii; ++i) {
                if (geometries[i].containsXY(x, y)) {
                    return true;
                }
            }
            return false;
        }
        computeExtent(extent) {
            extent_js_2.createOrUpdateEmpty(extent);
            const geometries = this.geometries_;
            for (let i = 0, ii = geometries.length; i < ii; ++i) {
                extent_js_2.extend(extent, geometries[i].getExtent());
            }
            return extent;
        }
        getGeometries() {
            return cloneGeometries(this.geometries_);
        }
        getGeometriesArray() {
            return this.geometries_;
        }
        getGeometriesArrayRecursive() {
            let geometriesArray = [];
            const geometries = this.geometries_;
            for (let i = 0, ii = geometries.length; i < ii; ++i) {
                if (geometries[i].getType() === this.getType()) {
                    geometriesArray = geometriesArray.concat((geometries[i]).getGeometriesArrayRecursive());
                }
                else {
                    geometriesArray.push(geometries[i]);
                }
            }
            return geometriesArray;
        }
        getSimplifiedGeometry(squaredTolerance) {
            if (this.simplifiedGeometryRevision !== this.getRevision()) {
                this.simplifiedGeometryMaxMinSquaredTolerance = 0;
                this.simplifiedGeometryRevision = this.getRevision();
            }
            if (squaredTolerance < 0 ||
                (this.simplifiedGeometryMaxMinSquaredTolerance !== 0 &&
                    squaredTolerance < this.simplifiedGeometryMaxMinSquaredTolerance)) {
                return this;
            }
            const simplifiedGeometries = [];
            const geometries = this.geometries_;
            let simplified = false;
            for (let i = 0, ii = geometries.length; i < ii; ++i) {
                const geometry = geometries[i];
                const simplifiedGeometry = geometry.getSimplifiedGeometry(squaredTolerance);
                simplifiedGeometries.push(simplifiedGeometry);
                if (simplifiedGeometry !== geometry) {
                    simplified = true;
                }
            }
            if (simplified) {
                const simplifiedGeometryCollection = new GeometryCollection(null);
                simplifiedGeometryCollection.setGeometriesArray(simplifiedGeometries);
                return simplifiedGeometryCollection;
            }
            else {
                this.simplifiedGeometryMaxMinSquaredTolerance = squaredTolerance;
                return this;
            }
        }
        getType() {
            return GeometryType_js_1.default.GEOMETRY_COLLECTION;
        }
        intersectsExtent(extent) {
            const geometries = this.geometries_;
            for (let i = 0, ii = geometries.length; i < ii; ++i) {
                if (geometries[i].intersectsExtent(extent)) {
                    return true;
                }
            }
            return false;
        }
        isEmpty() {
            return this.geometries_.length === 0;
        }
        rotate(angle, anchor) {
            const geometries = this.geometries_;
            for (let i = 0, ii = geometries.length; i < ii; ++i) {
                geometries[i].rotate(angle, anchor);
            }
            this.changed();
        }
        scale(sx, opt_sy, opt_anchor) {
            let anchor = opt_anchor;
            if (!anchor) {
                anchor = extent_js_2.getCenter(this.getExtent());
            }
            const geometries = this.geometries_;
            for (let i = 0, ii = geometries.length; i < ii; ++i) {
                geometries[i].scale(sx, opt_sy, anchor);
            }
            this.changed();
        }
        setGeometries(geometries) {
            this.setGeometriesArray(cloneGeometries(geometries));
        }
        setGeometriesArray(geometries) {
            this.unlistenGeometriesChange_();
            this.geometries_ = geometries;
            this.listenGeometriesChange_();
            this.changed();
        }
        applyTransform(transformFn) {
            const geometries = this.geometries_;
            for (let i = 0, ii = geometries.length; i < ii; ++i) {
                geometries[i].applyTransform(transformFn);
            }
            this.changed();
        }
        translate(deltaX, deltaY) {
            const geometries = this.geometries_;
            for (let i = 0, ii = geometries.length; i < ii; ++i) {
                geometries[i].translate(deltaX, deltaY);
            }
            this.changed();
        }
        disposeInternal() {
            this.unlistenGeometriesChange_();
            super.disposeInternal();
        }
    }
    function cloneGeometries(geometries) {
        const clonedGeometries = [];
        for (let i = 0, ii = geometries.length; i < ii; ++i) {
            clonedGeometries.push(geometries[i].clone());
        }
        return clonedGeometries;
    }
    exports.default = GeometryCollection;
});
define("node_modules/ol/src/geom/GeometryLayout", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        XY: 'XY',
        XYZ: 'XYZ',
        XYM: 'XYM',
        XYZM: 'XYZM',
    };
});
define("node_modules/ol/src/geom/flat/closest", ["require", "exports", "node_modules/ol/src/math"], function (require, exports, math_js_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assignClosestMultiArrayPoint = exports.assignClosestArrayPoint = exports.assignClosestPoint = exports.multiArrayMaxSquaredDelta = exports.arrayMaxSquaredDelta = exports.maxSquaredDelta = void 0;
    function assignClosest(flatCoordinates, offset1, offset2, stride, x, y, closestPoint) {
        const x1 = flatCoordinates[offset1];
        const y1 = flatCoordinates[offset1 + 1];
        const dx = flatCoordinates[offset2] - x1;
        const dy = flatCoordinates[offset2 + 1] - y1;
        let offset;
        if (dx === 0 && dy === 0) {
            offset = offset1;
        }
        else {
            const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
            if (t > 1) {
                offset = offset2;
            }
            else if (t > 0) {
                for (let i = 0; i < stride; ++i) {
                    closestPoint[i] = math_js_3.lerp(flatCoordinates[offset1 + i], flatCoordinates[offset2 + i], t);
                }
                closestPoint.length = stride;
                return;
            }
            else {
                offset = offset1;
            }
        }
        for (let i = 0; i < stride; ++i) {
            closestPoint[i] = flatCoordinates[offset + i];
        }
        closestPoint.length = stride;
    }
    function maxSquaredDelta(flatCoordinates, offset, end, stride, max) {
        let x1 = flatCoordinates[offset];
        let y1 = flatCoordinates[offset + 1];
        for (offset += stride; offset < end; offset += stride) {
            const x2 = flatCoordinates[offset];
            const y2 = flatCoordinates[offset + 1];
            const squaredDelta = math_js_3.squaredDistance(x1, y1, x2, y2);
            if (squaredDelta > max) {
                max = squaredDelta;
            }
            x1 = x2;
            y1 = y2;
        }
        return max;
    }
    exports.maxSquaredDelta = maxSquaredDelta;
    function arrayMaxSquaredDelta(flatCoordinates, offset, ends, stride, max) {
        for (let i = 0, ii = ends.length; i < ii; ++i) {
            const end = ends[i];
            max = maxSquaredDelta(flatCoordinates, offset, end, stride, max);
            offset = end;
        }
        return max;
    }
    exports.arrayMaxSquaredDelta = arrayMaxSquaredDelta;
    function multiArrayMaxSquaredDelta(flatCoordinates, offset, endss, stride, max) {
        for (let i = 0, ii = endss.length; i < ii; ++i) {
            const ends = endss[i];
            max = arrayMaxSquaredDelta(flatCoordinates, offset, ends, stride, max);
            offset = ends[ends.length - 1];
        }
        return max;
    }
    exports.multiArrayMaxSquaredDelta = multiArrayMaxSquaredDelta;
    function assignClosestPoint(flatCoordinates, offset, end, stride, maxDelta, isRing, x, y, closestPoint, minSquaredDistance, opt_tmpPoint) {
        if (offset == end) {
            return minSquaredDistance;
        }
        let i, squaredDistance;
        if (maxDelta === 0) {
            squaredDistance = math_js_3.squaredDistance(x, y, flatCoordinates[offset], flatCoordinates[offset + 1]);
            if (squaredDistance < minSquaredDistance) {
                for (i = 0; i < stride; ++i) {
                    closestPoint[i] = flatCoordinates[offset + i];
                }
                closestPoint.length = stride;
                return squaredDistance;
            }
            else {
                return minSquaredDistance;
            }
        }
        const tmpPoint = opt_tmpPoint ? opt_tmpPoint : [NaN, NaN];
        let index = offset + stride;
        while (index < end) {
            assignClosest(flatCoordinates, index - stride, index, stride, x, y, tmpPoint);
            squaredDistance = math_js_3.squaredDistance(x, y, tmpPoint[0], tmpPoint[1]);
            if (squaredDistance < minSquaredDistance) {
                minSquaredDistance = squaredDistance;
                for (i = 0; i < stride; ++i) {
                    closestPoint[i] = tmpPoint[i];
                }
                closestPoint.length = stride;
                index += stride;
            }
            else {
                index +=
                    stride *
                        Math.max(((Math.sqrt(squaredDistance) - Math.sqrt(minSquaredDistance)) /
                            maxDelta) |
                            0, 1);
            }
        }
        if (isRing) {
            assignClosest(flatCoordinates, end - stride, offset, stride, x, y, tmpPoint);
            squaredDistance = math_js_3.squaredDistance(x, y, tmpPoint[0], tmpPoint[1]);
            if (squaredDistance < minSquaredDistance) {
                minSquaredDistance = squaredDistance;
                for (i = 0; i < stride; ++i) {
                    closestPoint[i] = tmpPoint[i];
                }
                closestPoint.length = stride;
            }
        }
        return minSquaredDistance;
    }
    exports.assignClosestPoint = assignClosestPoint;
    function assignClosestArrayPoint(flatCoordinates, offset, ends, stride, maxDelta, isRing, x, y, closestPoint, minSquaredDistance, opt_tmpPoint) {
        const tmpPoint = opt_tmpPoint ? opt_tmpPoint : [NaN, NaN];
        for (let i = 0, ii = ends.length; i < ii; ++i) {
            const end = ends[i];
            minSquaredDistance = assignClosestPoint(flatCoordinates, offset, end, stride, maxDelta, isRing, x, y, closestPoint, minSquaredDistance, tmpPoint);
            offset = end;
        }
        return minSquaredDistance;
    }
    exports.assignClosestArrayPoint = assignClosestArrayPoint;
    function assignClosestMultiArrayPoint(flatCoordinates, offset, endss, stride, maxDelta, isRing, x, y, closestPoint, minSquaredDistance, opt_tmpPoint) {
        const tmpPoint = opt_tmpPoint ? opt_tmpPoint : [NaN, NaN];
        for (let i = 0, ii = endss.length; i < ii; ++i) {
            const ends = endss[i];
            minSquaredDistance = assignClosestArrayPoint(flatCoordinates, offset, ends, stride, maxDelta, isRing, x, y, closestPoint, minSquaredDistance, tmpPoint);
            offset = ends[ends.length - 1];
        }
        return minSquaredDistance;
    }
    exports.assignClosestMultiArrayPoint = assignClosestMultiArrayPoint;
});
define("node_modules/ol/src/geom/flat/deflate", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.deflateMultiCoordinatesArray = exports.deflateCoordinatesArray = exports.deflateCoordinates = exports.deflateCoordinate = void 0;
    function deflateCoordinate(flatCoordinates, offset, coordinate, stride) {
        for (let i = 0, ii = coordinate.length; i < ii; ++i) {
            flatCoordinates[offset++] = coordinate[i];
        }
        return offset;
    }
    exports.deflateCoordinate = deflateCoordinate;
    function deflateCoordinates(flatCoordinates, offset, coordinates, stride) {
        for (let i = 0, ii = coordinates.length; i < ii; ++i) {
            const coordinate = coordinates[i];
            for (let j = 0; j < stride; ++j) {
                flatCoordinates[offset++] = coordinate[j];
            }
        }
        return offset;
    }
    exports.deflateCoordinates = deflateCoordinates;
    function deflateCoordinatesArray(flatCoordinates, offset, coordinatess, stride, opt_ends) {
        const ends = opt_ends ? opt_ends : [];
        let i = 0;
        for (let j = 0, jj = coordinatess.length; j < jj; ++j) {
            const end = deflateCoordinates(flatCoordinates, offset, coordinatess[j], stride);
            ends[i++] = end;
            offset = end;
        }
        ends.length = i;
        return ends;
    }
    exports.deflateCoordinatesArray = deflateCoordinatesArray;
    function deflateMultiCoordinatesArray(flatCoordinates, offset, coordinatesss, stride, opt_endss) {
        const endss = opt_endss ? opt_endss : [];
        let i = 0;
        for (let j = 0, jj = coordinatesss.length; j < jj; ++j) {
            const ends = deflateCoordinatesArray(flatCoordinates, offset, coordinatesss[j], stride, endss[i]);
            endss[i++] = ends;
            offset = ends[ends.length - 1];
        }
        endss.length = i;
        return endss;
    }
    exports.deflateMultiCoordinatesArray = deflateMultiCoordinatesArray;
});
define("node_modules/ol/src/geom/flat/simplify", ["require", "exports", "node_modules/ol/src/math"], function (require, exports, math_js_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.quantizeMultiArray = exports.quantizeArray = exports.quantize = exports.snap = exports.radialDistance = exports.douglasPeuckerMultiArray = exports.douglasPeuckerArray = exports.douglasPeucker = exports.simplifyLineString = void 0;
    function simplifyLineString(flatCoordinates, offset, end, stride, squaredTolerance, highQuality, opt_simplifiedFlatCoordinates) {
        const simplifiedFlatCoordinates = opt_simplifiedFlatCoordinates !== undefined
            ? opt_simplifiedFlatCoordinates
            : [];
        if (!highQuality) {
            end = radialDistance(flatCoordinates, offset, end, stride, squaredTolerance, simplifiedFlatCoordinates, 0);
            flatCoordinates = simplifiedFlatCoordinates;
            offset = 0;
            stride = 2;
        }
        simplifiedFlatCoordinates.length = douglasPeucker(flatCoordinates, offset, end, stride, squaredTolerance, simplifiedFlatCoordinates, 0);
        return simplifiedFlatCoordinates;
    }
    exports.simplifyLineString = simplifyLineString;
    function douglasPeucker(flatCoordinates, offset, end, stride, squaredTolerance, simplifiedFlatCoordinates, simplifiedOffset) {
        const n = (end - offset) / stride;
        if (n < 3) {
            for (; offset < end; offset += stride) {
                simplifiedFlatCoordinates[simplifiedOffset++] = flatCoordinates[offset];
                simplifiedFlatCoordinates[simplifiedOffset++] =
                    flatCoordinates[offset + 1];
            }
            return simplifiedOffset;
        }
        const markers = new Array(n);
        markers[0] = 1;
        markers[n - 1] = 1;
        const stack = [offset, end - stride];
        let index = 0;
        while (stack.length > 0) {
            const last = stack.pop();
            const first = stack.pop();
            let maxSquaredDistance = 0;
            const x1 = flatCoordinates[first];
            const y1 = flatCoordinates[first + 1];
            const x2 = flatCoordinates[last];
            const y2 = flatCoordinates[last + 1];
            for (let i = first + stride; i < last; i += stride) {
                const x = flatCoordinates[i];
                const y = flatCoordinates[i + 1];
                const squaredDistance = math_js_4.squaredSegmentDistance(x, y, x1, y1, x2, y2);
                if (squaredDistance > maxSquaredDistance) {
                    index = i;
                    maxSquaredDistance = squaredDistance;
                }
            }
            if (maxSquaredDistance > squaredTolerance) {
                markers[(index - offset) / stride] = 1;
                if (first + stride < index) {
                    stack.push(first, index);
                }
                if (index + stride < last) {
                    stack.push(index, last);
                }
            }
        }
        for (let i = 0; i < n; ++i) {
            if (markers[i]) {
                simplifiedFlatCoordinates[simplifiedOffset++] =
                    flatCoordinates[offset + i * stride];
                simplifiedFlatCoordinates[simplifiedOffset++] =
                    flatCoordinates[offset + i * stride + 1];
            }
        }
        return simplifiedOffset;
    }
    exports.douglasPeucker = douglasPeucker;
    function douglasPeuckerArray(flatCoordinates, offset, ends, stride, squaredTolerance, simplifiedFlatCoordinates, simplifiedOffset, simplifiedEnds) {
        for (let i = 0, ii = ends.length; i < ii; ++i) {
            const end = ends[i];
            simplifiedOffset = douglasPeucker(flatCoordinates, offset, end, stride, squaredTolerance, simplifiedFlatCoordinates, simplifiedOffset);
            simplifiedEnds.push(simplifiedOffset);
            offset = end;
        }
        return simplifiedOffset;
    }
    exports.douglasPeuckerArray = douglasPeuckerArray;
    function douglasPeuckerMultiArray(flatCoordinates, offset, endss, stride, squaredTolerance, simplifiedFlatCoordinates, simplifiedOffset, simplifiedEndss) {
        for (let i = 0, ii = endss.length; i < ii; ++i) {
            const ends = endss[i];
            const simplifiedEnds = [];
            simplifiedOffset = douglasPeuckerArray(flatCoordinates, offset, ends, stride, squaredTolerance, simplifiedFlatCoordinates, simplifiedOffset, simplifiedEnds);
            simplifiedEndss.push(simplifiedEnds);
            offset = ends[ends.length - 1];
        }
        return simplifiedOffset;
    }
    exports.douglasPeuckerMultiArray = douglasPeuckerMultiArray;
    function radialDistance(flatCoordinates, offset, end, stride, squaredTolerance, simplifiedFlatCoordinates, simplifiedOffset) {
        if (end <= offset + stride) {
            for (; offset < end; offset += stride) {
                simplifiedFlatCoordinates[simplifiedOffset++] = flatCoordinates[offset];
                simplifiedFlatCoordinates[simplifiedOffset++] =
                    flatCoordinates[offset + 1];
            }
            return simplifiedOffset;
        }
        let x1 = flatCoordinates[offset];
        let y1 = flatCoordinates[offset + 1];
        simplifiedFlatCoordinates[simplifiedOffset++] = x1;
        simplifiedFlatCoordinates[simplifiedOffset++] = y1;
        let x2 = x1;
        let y2 = y1;
        for (offset += stride; offset < end; offset += stride) {
            x2 = flatCoordinates[offset];
            y2 = flatCoordinates[offset + 1];
            if (math_js_4.squaredDistance(x1, y1, x2, y2) > squaredTolerance) {
                simplifiedFlatCoordinates[simplifiedOffset++] = x2;
                simplifiedFlatCoordinates[simplifiedOffset++] = y2;
                x1 = x2;
                y1 = y2;
            }
        }
        if (x2 != x1 || y2 != y1) {
            simplifiedFlatCoordinates[simplifiedOffset++] = x2;
            simplifiedFlatCoordinates[simplifiedOffset++] = y2;
        }
        return simplifiedOffset;
    }
    exports.radialDistance = radialDistance;
    function snap(value, tolerance) {
        return tolerance * Math.round(value / tolerance);
    }
    exports.snap = snap;
    function quantize(flatCoordinates, offset, end, stride, tolerance, simplifiedFlatCoordinates, simplifiedOffset) {
        if (offset == end) {
            return simplifiedOffset;
        }
        let x1 = snap(flatCoordinates[offset], tolerance);
        let y1 = snap(flatCoordinates[offset + 1], tolerance);
        offset += stride;
        simplifiedFlatCoordinates[simplifiedOffset++] = x1;
        simplifiedFlatCoordinates[simplifiedOffset++] = y1;
        let x2, y2;
        do {
            x2 = snap(flatCoordinates[offset], tolerance);
            y2 = snap(flatCoordinates[offset + 1], tolerance);
            offset += stride;
            if (offset == end) {
                simplifiedFlatCoordinates[simplifiedOffset++] = x2;
                simplifiedFlatCoordinates[simplifiedOffset++] = y2;
                return simplifiedOffset;
            }
        } while (x2 == x1 && y2 == y1);
        while (offset < end) {
            const x3 = snap(flatCoordinates[offset], tolerance);
            const y3 = snap(flatCoordinates[offset + 1], tolerance);
            offset += stride;
            if (x3 == x2 && y3 == y2) {
                continue;
            }
            const dx1 = x2 - x1;
            const dy1 = y2 - y1;
            const dx2 = x3 - x1;
            const dy2 = y3 - y1;
            if (dx1 * dy2 == dy1 * dx2 &&
                ((dx1 < 0 && dx2 < dx1) || dx1 == dx2 || (dx1 > 0 && dx2 > dx1)) &&
                ((dy1 < 0 && dy2 < dy1) || dy1 == dy2 || (dy1 > 0 && dy2 > dy1))) {
                x2 = x3;
                y2 = y3;
                continue;
            }
            simplifiedFlatCoordinates[simplifiedOffset++] = x2;
            simplifiedFlatCoordinates[simplifiedOffset++] = y2;
            x1 = x2;
            y1 = y2;
            x2 = x3;
            y2 = y3;
        }
        simplifiedFlatCoordinates[simplifiedOffset++] = x2;
        simplifiedFlatCoordinates[simplifiedOffset++] = y2;
        return simplifiedOffset;
    }
    exports.quantize = quantize;
    function quantizeArray(flatCoordinates, offset, ends, stride, tolerance, simplifiedFlatCoordinates, simplifiedOffset, simplifiedEnds) {
        for (let i = 0, ii = ends.length; i < ii; ++i) {
            const end = ends[i];
            simplifiedOffset = quantize(flatCoordinates, offset, end, stride, tolerance, simplifiedFlatCoordinates, simplifiedOffset);
            simplifiedEnds.push(simplifiedOffset);
            offset = end;
        }
        return simplifiedOffset;
    }
    exports.quantizeArray = quantizeArray;
    function quantizeMultiArray(flatCoordinates, offset, endss, stride, tolerance, simplifiedFlatCoordinates, simplifiedOffset, simplifiedEndss) {
        for (let i = 0, ii = endss.length; i < ii; ++i) {
            const ends = endss[i];
            const simplifiedEnds = [];
            simplifiedOffset = quantizeArray(flatCoordinates, offset, ends, stride, tolerance, simplifiedFlatCoordinates, simplifiedOffset, simplifiedEnds);
            simplifiedEndss.push(simplifiedEnds);
            offset = ends[ends.length - 1];
        }
        return simplifiedOffset;
    }
    exports.quantizeMultiArray = quantizeMultiArray;
});
define("node_modules/ol/src/geom/flat/inflate", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.inflateMultiCoordinatesArray = exports.inflateCoordinatesArray = exports.inflateCoordinates = void 0;
    function inflateCoordinates(flatCoordinates, offset, end, stride, opt_coordinates) {
        const coordinates = opt_coordinates !== undefined ? opt_coordinates : [];
        let i = 0;
        for (let j = offset; j < end; j += stride) {
            coordinates[i++] = flatCoordinates.slice(j, j + stride);
        }
        coordinates.length = i;
        return coordinates;
    }
    exports.inflateCoordinates = inflateCoordinates;
    function inflateCoordinatesArray(flatCoordinates, offset, ends, stride, opt_coordinatess) {
        const coordinatess = opt_coordinatess !== undefined ? opt_coordinatess : [];
        let i = 0;
        for (let j = 0, jj = ends.length; j < jj; ++j) {
            const end = ends[j];
            coordinatess[i++] = inflateCoordinates(flatCoordinates, offset, end, stride, coordinatess[i]);
            offset = end;
        }
        coordinatess.length = i;
        return coordinatess;
    }
    exports.inflateCoordinatesArray = inflateCoordinatesArray;
    function inflateMultiCoordinatesArray(flatCoordinates, offset, endss, stride, opt_coordinatesss) {
        const coordinatesss = opt_coordinatesss !== undefined ? opt_coordinatesss : [];
        let i = 0;
        for (let j = 0, jj = endss.length; j < jj; ++j) {
            const ends = endss[j];
            coordinatesss[i++] = inflateCoordinatesArray(flatCoordinates, offset, ends, stride, coordinatesss[i]);
            offset = ends[ends.length - 1];
        }
        coordinatesss.length = i;
        return coordinatesss;
    }
    exports.inflateMultiCoordinatesArray = inflateMultiCoordinatesArray;
});
define("node_modules/ol/src/geom/flat/area", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.linearRingss = exports.linearRings = exports.linearRing = void 0;
    function linearRing(flatCoordinates, offset, end, stride) {
        let twiceArea = 0;
        let x1 = flatCoordinates[end - stride];
        let y1 = flatCoordinates[end - stride + 1];
        for (; offset < end; offset += stride) {
            const x2 = flatCoordinates[offset];
            const y2 = flatCoordinates[offset + 1];
            twiceArea += y1 * x2 - x1 * y2;
            x1 = x2;
            y1 = y2;
        }
        return twiceArea / 2;
    }
    exports.linearRing = linearRing;
    function linearRings(flatCoordinates, offset, ends, stride) {
        let area = 0;
        for (let i = 0, ii = ends.length; i < ii; ++i) {
            const end = ends[i];
            area += linearRing(flatCoordinates, offset, end, stride);
            offset = end;
        }
        return area;
    }
    exports.linearRings = linearRings;
    function linearRingss(flatCoordinates, offset, endss, stride) {
        let area = 0;
        for (let i = 0, ii = endss.length; i < ii; ++i) {
            const ends = endss[i];
            area += linearRings(flatCoordinates, offset, ends, stride);
            offset = ends[ends.length - 1];
        }
        return area;
    }
    exports.linearRingss = linearRingss;
});
define("node_modules/ol/src/geom/LinearRing", ["require", "exports", "node_modules/ol/src/geom/GeometryLayout", "node_modules/ol/src/geom/GeometryType", "node_modules/ol/src/geom/SimpleGeometry", "node_modules/ol/src/geom/flat/closest", "node_modules/ol/src/extent", "node_modules/ol/src/geom/flat/deflate", "node_modules/ol/src/geom/flat/simplify", "node_modules/ol/src/geom/flat/inflate", "node_modules/ol/src/geom/flat/area"], function (require, exports, GeometryLayout_js_1, GeometryType_js_2, SimpleGeometry_js_1, closest_js_1, extent_js_3, deflate_js_1, simplify_js_1, inflate_js_1, area_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LinearRing extends SimpleGeometry_js_1.default {
        constructor(coordinates, opt_layout) {
            super();
            this.maxDelta_ = -1;
            this.maxDeltaRevision_ = -1;
            if (opt_layout !== undefined && !Array.isArray(coordinates[0])) {
                this.setFlatCoordinates(opt_layout, (coordinates));
            }
            else {
                this.setCoordinates((coordinates), opt_layout);
            }
        }
        clone() {
            return new LinearRing(this.flatCoordinates.slice(), this.layout);
        }
        closestPointXY(x, y, closestPoint, minSquaredDistance) {
            if (minSquaredDistance < extent_js_3.closestSquaredDistanceXY(this.getExtent(), x, y)) {
                return minSquaredDistance;
            }
            if (this.maxDeltaRevision_ != this.getRevision()) {
                this.maxDelta_ = Math.sqrt(closest_js_1.maxSquaredDelta(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, 0));
                this.maxDeltaRevision_ = this.getRevision();
            }
            return closest_js_1.assignClosestPoint(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, this.maxDelta_, true, x, y, closestPoint, minSquaredDistance);
        }
        getArea() {
            return area_js_1.linearRing(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride);
        }
        getCoordinates() {
            return inflate_js_1.inflateCoordinates(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride);
        }
        getSimplifiedGeometryInternal(squaredTolerance) {
            const simplifiedFlatCoordinates = [];
            simplifiedFlatCoordinates.length = simplify_js_1.douglasPeucker(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, squaredTolerance, simplifiedFlatCoordinates, 0);
            return new LinearRing(simplifiedFlatCoordinates, GeometryLayout_js_1.default.XY);
        }
        getType() {
            return GeometryType_js_2.default.LINEAR_RING;
        }
        intersectsExtent(extent) {
            return false;
        }
        setCoordinates(coordinates, opt_layout) {
            this.setLayout(opt_layout, coordinates, 1);
            if (!this.flatCoordinates) {
                this.flatCoordinates = [];
            }
            this.flatCoordinates.length = deflate_js_1.deflateCoordinates(this.flatCoordinates, 0, coordinates, this.stride);
            this.changed();
        }
    }
    exports.default = LinearRing;
});
define("node_modules/ol/src/geom/Point", ["require", "exports", "node_modules/ol/src/geom/GeometryType", "node_modules/ol/src/geom/SimpleGeometry", "node_modules/ol/src/extent", "node_modules/ol/src/geom/flat/deflate", "node_modules/ol/src/math"], function (require, exports, GeometryType_js_3, SimpleGeometry_js_2, extent_js_4, deflate_js_2, math_js_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Point extends SimpleGeometry_js_2.default {
        constructor(coordinates, opt_layout) {
            super();
            this.setCoordinates(coordinates, opt_layout);
        }
        clone() {
            const point = new Point(this.flatCoordinates.slice(), this.layout);
            return point;
        }
        closestPointXY(x, y, closestPoint, minSquaredDistance) {
            const flatCoordinates = this.flatCoordinates;
            const squaredDistance = math_js_5.squaredDistance(x, y, flatCoordinates[0], flatCoordinates[1]);
            if (squaredDistance < minSquaredDistance) {
                const stride = this.stride;
                for (let i = 0; i < stride; ++i) {
                    closestPoint[i] = flatCoordinates[i];
                }
                closestPoint.length = stride;
                return squaredDistance;
            }
            else {
                return minSquaredDistance;
            }
        }
        getCoordinates() {
            return !this.flatCoordinates ? [] : this.flatCoordinates.slice();
        }
        computeExtent(extent) {
            return extent_js_4.createOrUpdateFromCoordinate(this.flatCoordinates, extent);
        }
        getType() {
            return GeometryType_js_3.default.POINT;
        }
        intersectsExtent(extent) {
            return extent_js_4.containsXY(extent, this.flatCoordinates[0], this.flatCoordinates[1]);
        }
        setCoordinates(coordinates, opt_layout) {
            this.setLayout(opt_layout, coordinates, 0);
            if (!this.flatCoordinates) {
                this.flatCoordinates = [];
            }
            this.flatCoordinates.length = deflate_js_2.deflateCoordinate(this.flatCoordinates, 0, coordinates, this.stride);
            this.changed();
        }
    }
    exports.default = Point;
});
define("node_modules/ol/src/geom/flat/contains", ["require", "exports", "node_modules/ol/src/extent"], function (require, exports, extent_js_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.linearRingssContainsXY = exports.linearRingsContainsXY = exports.linearRingContainsXY = exports.linearRingContainsExtent = void 0;
    function linearRingContainsExtent(flatCoordinates, offset, end, stride, extent) {
        const outside = extent_js_5.forEachCorner(extent, function (coordinate) {
            return !linearRingContainsXY(flatCoordinates, offset, end, stride, coordinate[0], coordinate[1]);
        });
        return !outside;
    }
    exports.linearRingContainsExtent = linearRingContainsExtent;
    function linearRingContainsXY(flatCoordinates, offset, end, stride, x, y) {
        let wn = 0;
        let x1 = flatCoordinates[end - stride];
        let y1 = flatCoordinates[end - stride + 1];
        for (; offset < end; offset += stride) {
            const x2 = flatCoordinates[offset];
            const y2 = flatCoordinates[offset + 1];
            if (y1 <= y) {
                if (y2 > y && (x2 - x1) * (y - y1) - (x - x1) * (y2 - y1) > 0) {
                    wn++;
                }
            }
            else if (y2 <= y && (x2 - x1) * (y - y1) - (x - x1) * (y2 - y1) < 0) {
                wn--;
            }
            x1 = x2;
            y1 = y2;
        }
        return wn !== 0;
    }
    exports.linearRingContainsXY = linearRingContainsXY;
    function linearRingsContainsXY(flatCoordinates, offset, ends, stride, x, y) {
        if (ends.length === 0) {
            return false;
        }
        if (!linearRingContainsXY(flatCoordinates, offset, ends[0], stride, x, y)) {
            return false;
        }
        for (let i = 1, ii = ends.length; i < ii; ++i) {
            if (linearRingContainsXY(flatCoordinates, ends[i - 1], ends[i], stride, x, y)) {
                return false;
            }
        }
        return true;
    }
    exports.linearRingsContainsXY = linearRingsContainsXY;
    function linearRingssContainsXY(flatCoordinates, offset, endss, stride, x, y) {
        if (endss.length === 0) {
            return false;
        }
        for (let i = 0, ii = endss.length; i < ii; ++i) {
            const ends = endss[i];
            if (linearRingsContainsXY(flatCoordinates, offset, ends, stride, x, y)) {
                return true;
            }
            offset = ends[ends.length - 1];
        }
        return false;
    }
    exports.linearRingssContainsXY = linearRingssContainsXY;
});
define("node_modules/ol/src/geom/flat/interiorpoint", ["require", "exports", "node_modules/ol/src/geom/flat/contains", "node_modules/ol/src/array"], function (require, exports, contains_js_1, array_js_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getInteriorPointsOfMultiArray = exports.getInteriorPointOfArray = void 0;
    function getInteriorPointOfArray(flatCoordinates, offset, ends, stride, flatCenters, flatCentersOffset, opt_dest) {
        let i, ii, x, x1, x2, y1, y2;
        const y = flatCenters[flatCentersOffset + 1];
        const intersections = [];
        for (let r = 0, rr = ends.length; r < rr; ++r) {
            const end = ends[r];
            x1 = flatCoordinates[end - stride];
            y1 = flatCoordinates[end - stride + 1];
            for (i = offset; i < end; i += stride) {
                x2 = flatCoordinates[i];
                y2 = flatCoordinates[i + 1];
                if ((y <= y1 && y2 <= y) || (y1 <= y && y <= y2)) {
                    x = ((y - y1) / (y2 - y1)) * (x2 - x1) + x1;
                    intersections.push(x);
                }
                x1 = x2;
                y1 = y2;
            }
        }
        let pointX = NaN;
        let maxSegmentLength = -Infinity;
        intersections.sort(array_js_3.numberSafeCompareFunction);
        x1 = intersections[0];
        for (i = 1, ii = intersections.length; i < ii; ++i) {
            x2 = intersections[i];
            const segmentLength = Math.abs(x2 - x1);
            if (segmentLength > maxSegmentLength) {
                x = (x1 + x2) / 2;
                if (contains_js_1.linearRingsContainsXY(flatCoordinates, offset, ends, stride, x, y)) {
                    pointX = x;
                    maxSegmentLength = segmentLength;
                }
            }
            x1 = x2;
        }
        if (isNaN(pointX)) {
            pointX = flatCenters[flatCentersOffset];
        }
        if (opt_dest) {
            opt_dest.push(pointX, y, maxSegmentLength);
            return opt_dest;
        }
        else {
            return [pointX, y, maxSegmentLength];
        }
    }
    exports.getInteriorPointOfArray = getInteriorPointOfArray;
    function getInteriorPointsOfMultiArray(flatCoordinates, offset, endss, stride, flatCenters) {
        let interiorPoints = [];
        for (let i = 0, ii = endss.length; i < ii; ++i) {
            const ends = endss[i];
            interiorPoints = getInteriorPointOfArray(flatCoordinates, offset, ends, stride, flatCenters, 2 * i, interiorPoints);
            offset = ends[ends.length - 1];
        }
        return interiorPoints;
    }
    exports.getInteriorPointsOfMultiArray = getInteriorPointsOfMultiArray;
});
define("node_modules/ol/src/geom/flat/segments", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.forEach = void 0;
    function forEach(flatCoordinates, offset, end, stride, callback) {
        const point1 = [flatCoordinates[offset], flatCoordinates[offset + 1]];
        const point2 = [];
        let ret;
        for (; offset + stride < end; offset += stride) {
            point2[0] = flatCoordinates[offset + stride];
            point2[1] = flatCoordinates[offset + stride + 1];
            ret = callback(point1, point2);
            if (ret) {
                return ret;
            }
            point1[0] = point2[0];
            point1[1] = point2[1];
        }
        return false;
    }
    exports.forEach = forEach;
});
define("node_modules/ol/src/geom/flat/intersectsextent", ["require", "exports", "node_modules/ol/src/extent", "node_modules/ol/src/geom/flat/segments", "node_modules/ol/src/geom/flat/contains"], function (require, exports, extent_js_6, segments_js_1, contains_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.intersectsLinearRingMultiArray = exports.intersectsLinearRingArray = exports.intersectsLinearRing = exports.intersectsLineStringArray = exports.intersectsLineString = void 0;
    function intersectsLineString(flatCoordinates, offset, end, stride, extent) {
        const coordinatesExtent = extent_js_6.extendFlatCoordinates(extent_js_6.createEmpty(), flatCoordinates, offset, end, stride);
        if (!extent_js_6.intersects(extent, coordinatesExtent)) {
            return false;
        }
        if (extent_js_6.containsExtent(extent, coordinatesExtent)) {
            return true;
        }
        if (coordinatesExtent[0] >= extent[0] && coordinatesExtent[2] <= extent[2]) {
            return true;
        }
        if (coordinatesExtent[1] >= extent[1] && coordinatesExtent[3] <= extent[3]) {
            return true;
        }
        return segments_js_1.forEach(flatCoordinates, offset, end, stride, function (point1, point2) {
            return extent_js_6.intersectsSegment(extent, point1, point2);
        });
    }
    exports.intersectsLineString = intersectsLineString;
    function intersectsLineStringArray(flatCoordinates, offset, ends, stride, extent) {
        for (let i = 0, ii = ends.length; i < ii; ++i) {
            if (intersectsLineString(flatCoordinates, offset, ends[i], stride, extent)) {
                return true;
            }
            offset = ends[i];
        }
        return false;
    }
    exports.intersectsLineStringArray = intersectsLineStringArray;
    function intersectsLinearRing(flatCoordinates, offset, end, stride, extent) {
        if (intersectsLineString(flatCoordinates, offset, end, stride, extent)) {
            return true;
        }
        if (contains_js_2.linearRingContainsXY(flatCoordinates, offset, end, stride, extent[0], extent[1])) {
            return true;
        }
        if (contains_js_2.linearRingContainsXY(flatCoordinates, offset, end, stride, extent[0], extent[3])) {
            return true;
        }
        if (contains_js_2.linearRingContainsXY(flatCoordinates, offset, end, stride, extent[2], extent[1])) {
            return true;
        }
        if (contains_js_2.linearRingContainsXY(flatCoordinates, offset, end, stride, extent[2], extent[3])) {
            return true;
        }
        return false;
    }
    exports.intersectsLinearRing = intersectsLinearRing;
    function intersectsLinearRingArray(flatCoordinates, offset, ends, stride, extent) {
        if (!intersectsLinearRing(flatCoordinates, offset, ends[0], stride, extent)) {
            return false;
        }
        if (ends.length === 1) {
            return true;
        }
        for (let i = 1, ii = ends.length; i < ii; ++i) {
            if (contains_js_2.linearRingContainsExtent(flatCoordinates, ends[i - 1], ends[i], stride, extent)) {
                if (!intersectsLineString(flatCoordinates, ends[i - 1], ends[i], stride, extent)) {
                    return false;
                }
            }
        }
        return true;
    }
    exports.intersectsLinearRingArray = intersectsLinearRingArray;
    function intersectsLinearRingMultiArray(flatCoordinates, offset, endss, stride, extent) {
        for (let i = 0, ii = endss.length; i < ii; ++i) {
            const ends = endss[i];
            if (intersectsLinearRingArray(flatCoordinates, offset, ends, stride, extent)) {
                return true;
            }
            offset = ends[ends.length - 1];
        }
        return false;
    }
    exports.intersectsLinearRingMultiArray = intersectsLinearRingMultiArray;
});
define("node_modules/ol/src/geom/flat/reverse", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.coordinates = void 0;
    function coordinates(flatCoordinates, offset, end, stride) {
        while (offset < end - stride) {
            for (let i = 0; i < stride; ++i) {
                const tmp = flatCoordinates[offset + i];
                flatCoordinates[offset + i] = flatCoordinates[end - stride + i];
                flatCoordinates[end - stride + i] = tmp;
            }
            offset += stride;
            end -= stride;
        }
    }
    exports.coordinates = coordinates;
});
define("node_modules/ol/src/geom/flat/orient", ["require", "exports", "node_modules/ol/src/geom/flat/reverse"], function (require, exports, reverse_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.orientLinearRingsArray = exports.orientLinearRings = exports.linearRingssAreOriented = exports.linearRingsAreOriented = exports.linearRingIsClockwise = void 0;
    function linearRingIsClockwise(flatCoordinates, offset, end, stride) {
        let firstVertexRepeated = true;
        for (let i = 0; i < stride; ++i) {
            if (flatCoordinates[offset + i] !== flatCoordinates[end - stride + i]) {
                firstVertexRepeated = false;
                break;
            }
        }
        if (firstVertexRepeated) {
            end -= stride;
        }
        const iMinVertex = findCornerVertex(flatCoordinates, offset, end, stride);
        let iPreviousVertex = iMinVertex - stride;
        if (iPreviousVertex < offset) {
            iPreviousVertex = end - stride;
        }
        let iNextVertex = iMinVertex + stride;
        if (iNextVertex >= end) {
            iNextVertex = offset;
        }
        const aX = flatCoordinates[iPreviousVertex];
        const aY = flatCoordinates[iPreviousVertex + 1];
        const bX = flatCoordinates[iMinVertex];
        const bY = flatCoordinates[iMinVertex + 1];
        const cX = flatCoordinates[iNextVertex];
        const cY = flatCoordinates[iNextVertex + 1];
        const determinant = bX * cY + aX * bY + aY * cX - (aY * bX + bY * cX + aX * cY);
        return determinant < 0;
    }
    exports.linearRingIsClockwise = linearRingIsClockwise;
    function findCornerVertex(flatCoordinates, offset, end, stride) {
        let iMinVertex = -1;
        let minY = Infinity;
        let minXAtMinY = Infinity;
        for (let i = offset; i < end; i += stride) {
            const x = flatCoordinates[i];
            const y = flatCoordinates[i + 1];
            if (y > minY) {
                continue;
            }
            if (y == minY) {
                if (x >= minXAtMinY) {
                    continue;
                }
            }
            iMinVertex = i;
            minY = y;
            minXAtMinY = x;
        }
        return iMinVertex;
    }
    function linearRingsAreOriented(flatCoordinates, offset, ends, stride, opt_right) {
        const right = opt_right !== undefined ? opt_right : false;
        for (let i = 0, ii = ends.length; i < ii; ++i) {
            const end = ends[i];
            const isClockwise = linearRingIsClockwise(flatCoordinates, offset, end, stride);
            if (i === 0) {
                if ((right && isClockwise) || (!right && !isClockwise)) {
                    return false;
                }
            }
            else {
                if ((right && !isClockwise) || (!right && isClockwise)) {
                    return false;
                }
            }
            offset = end;
        }
        return true;
    }
    exports.linearRingsAreOriented = linearRingsAreOriented;
    function linearRingssAreOriented(flatCoordinates, offset, endss, stride, opt_right) {
        for (let i = 0, ii = endss.length; i < ii; ++i) {
            const ends = endss[i];
            if (!linearRingsAreOriented(flatCoordinates, offset, ends, stride, opt_right)) {
                return false;
            }
            if (ends.length) {
                offset = ends[ends.length - 1];
            }
        }
        return true;
    }
    exports.linearRingssAreOriented = linearRingssAreOriented;
    function orientLinearRings(flatCoordinates, offset, ends, stride, opt_right) {
        const right = opt_right !== undefined ? opt_right : false;
        for (let i = 0, ii = ends.length; i < ii; ++i) {
            const end = ends[i];
            const isClockwise = linearRingIsClockwise(flatCoordinates, offset, end, stride);
            const reverse = i === 0
                ? (right && isClockwise) || (!right && !isClockwise)
                : (right && !isClockwise) || (!right && isClockwise);
            if (reverse) {
                reverse_js_1.coordinates(flatCoordinates, offset, end, stride);
            }
            offset = end;
        }
        return offset;
    }
    exports.orientLinearRings = orientLinearRings;
    function orientLinearRingsArray(flatCoordinates, offset, endss, stride, opt_right) {
        for (let i = 0, ii = endss.length; i < ii; ++i) {
            offset = orientLinearRings(flatCoordinates, offset, endss[i], stride, opt_right);
        }
        return offset;
    }
    exports.orientLinearRingsArray = orientLinearRingsArray;
});
define("node_modules/ol/src/geom/Polygon", ["require", "exports", "node_modules/ol/src/geom/GeometryLayout", "node_modules/ol/src/geom/GeometryType", "node_modules/ol/src/geom/LinearRing", "node_modules/ol/src/geom/Point", "node_modules/ol/src/geom/SimpleGeometry", "node_modules/ol/src/geom/flat/closest", "node_modules/ol/src/extent", "node_modules/ol/src/geom/flat/deflate", "node_modules/ol/src/array", "node_modules/ol/src/geom/flat/interiorpoint", "node_modules/ol/src/geom/flat/inflate", "node_modules/ol/src/geom/flat/intersectsextent", "node_modules/ol/src/geom/flat/orient", "node_modules/ol/src/geom/flat/area", "node_modules/ol/src/geom/flat/contains", "node_modules/ol/src/math", "node_modules/ol/src/geom/flat/simplify", "node_modules/ol/src/sphere"], function (require, exports, GeometryLayout_js_2, GeometryType_js_4, LinearRing_js_1, Point_js_1, SimpleGeometry_js_3, closest_js_2, extent_js_7, deflate_js_3, array_js_4, interiorpoint_js_1, inflate_js_2, intersectsextent_js_1, orient_js_1, area_js_2, contains_js_3, math_js_6, simplify_js_2, sphere_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.makeRegular = exports.fromCircle = exports.fromExtent = exports.circular = void 0;
    class Polygon extends SimpleGeometry_js_3.default {
        constructor(coordinates, opt_layout, opt_ends) {
            super();
            this.ends_ = [];
            this.flatInteriorPointRevision_ = -1;
            this.flatInteriorPoint_ = null;
            this.maxDelta_ = -1;
            this.maxDeltaRevision_ = -1;
            this.orientedRevision_ = -1;
            this.orientedFlatCoordinates_ = null;
            if (opt_layout !== undefined && opt_ends) {
                this.setFlatCoordinates(opt_layout, (coordinates));
                this.ends_ = opt_ends;
            }
            else {
                this.setCoordinates((coordinates), opt_layout);
            }
        }
        appendLinearRing(linearRing) {
            if (!this.flatCoordinates) {
                this.flatCoordinates = linearRing.getFlatCoordinates().slice();
            }
            else {
                array_js_4.extend(this.flatCoordinates, linearRing.getFlatCoordinates());
            }
            this.ends_.push(this.flatCoordinates.length);
            this.changed();
        }
        clone() {
            return new Polygon(this.flatCoordinates.slice(), this.layout, this.ends_.slice());
        }
        closestPointXY(x, y, closestPoint, minSquaredDistance) {
            if (minSquaredDistance < extent_js_7.closestSquaredDistanceXY(this.getExtent(), x, y)) {
                return minSquaredDistance;
            }
            if (this.maxDeltaRevision_ != this.getRevision()) {
                this.maxDelta_ = Math.sqrt(closest_js_2.arrayMaxSquaredDelta(this.flatCoordinates, 0, this.ends_, this.stride, 0));
                this.maxDeltaRevision_ = this.getRevision();
            }
            return closest_js_2.assignClosestArrayPoint(this.flatCoordinates, 0, this.ends_, this.stride, this.maxDelta_, true, x, y, closestPoint, minSquaredDistance);
        }
        containsXY(x, y) {
            return contains_js_3.linearRingsContainsXY(this.getOrientedFlatCoordinates(), 0, this.ends_, this.stride, x, y);
        }
        getArea() {
            return area_js_2.linearRings(this.getOrientedFlatCoordinates(), 0, this.ends_, this.stride);
        }
        getCoordinates(opt_right) {
            let flatCoordinates;
            if (opt_right !== undefined) {
                flatCoordinates = this.getOrientedFlatCoordinates().slice();
                orient_js_1.orientLinearRings(flatCoordinates, 0, this.ends_, this.stride, opt_right);
            }
            else {
                flatCoordinates = this.flatCoordinates;
            }
            return inflate_js_2.inflateCoordinatesArray(flatCoordinates, 0, this.ends_, this.stride);
        }
        getEnds() {
            return this.ends_;
        }
        getFlatInteriorPoint() {
            if (this.flatInteriorPointRevision_ != this.getRevision()) {
                const flatCenter = extent_js_7.getCenter(this.getExtent());
                this.flatInteriorPoint_ = interiorpoint_js_1.getInteriorPointOfArray(this.getOrientedFlatCoordinates(), 0, this.ends_, this.stride, flatCenter, 0);
                this.flatInteriorPointRevision_ = this.getRevision();
            }
            return this.flatInteriorPoint_;
        }
        getInteriorPoint() {
            return new Point_js_1.default(this.getFlatInteriorPoint(), GeometryLayout_js_2.default.XYM);
        }
        getLinearRingCount() {
            return this.ends_.length;
        }
        getLinearRing(index) {
            if (index < 0 || this.ends_.length <= index) {
                return null;
            }
            return new LinearRing_js_1.default(this.flatCoordinates.slice(index === 0 ? 0 : this.ends_[index - 1], this.ends_[index]), this.layout);
        }
        getLinearRings() {
            const layout = this.layout;
            const flatCoordinates = this.flatCoordinates;
            const ends = this.ends_;
            const linearRings = [];
            let offset = 0;
            for (let i = 0, ii = ends.length; i < ii; ++i) {
                const end = ends[i];
                const linearRing = new LinearRing_js_1.default(flatCoordinates.slice(offset, end), layout);
                linearRings.push(linearRing);
                offset = end;
            }
            return linearRings;
        }
        getOrientedFlatCoordinates() {
            if (this.orientedRevision_ != this.getRevision()) {
                const flatCoordinates = this.flatCoordinates;
                if (orient_js_1.linearRingsAreOriented(flatCoordinates, 0, this.ends_, this.stride)) {
                    this.orientedFlatCoordinates_ = flatCoordinates;
                }
                else {
                    this.orientedFlatCoordinates_ = flatCoordinates.slice();
                    this.orientedFlatCoordinates_.length = orient_js_1.orientLinearRings(this.orientedFlatCoordinates_, 0, this.ends_, this.stride);
                }
                this.orientedRevision_ = this.getRevision();
            }
            return this.orientedFlatCoordinates_;
        }
        getSimplifiedGeometryInternal(squaredTolerance) {
            const simplifiedFlatCoordinates = [];
            const simplifiedEnds = [];
            simplifiedFlatCoordinates.length = simplify_js_2.quantizeArray(this.flatCoordinates, 0, this.ends_, this.stride, Math.sqrt(squaredTolerance), simplifiedFlatCoordinates, 0, simplifiedEnds);
            return new Polygon(simplifiedFlatCoordinates, GeometryLayout_js_2.default.XY, simplifiedEnds);
        }
        getType() {
            return GeometryType_js_4.default.POLYGON;
        }
        intersectsExtent(extent) {
            return intersectsextent_js_1.intersectsLinearRingArray(this.getOrientedFlatCoordinates(), 0, this.ends_, this.stride, extent);
        }
        setCoordinates(coordinates, opt_layout) {
            this.setLayout(opt_layout, coordinates, 2);
            if (!this.flatCoordinates) {
                this.flatCoordinates = [];
            }
            const ends = deflate_js_3.deflateCoordinatesArray(this.flatCoordinates, 0, coordinates, this.stride, this.ends_);
            this.flatCoordinates.length = ends.length === 0 ? 0 : ends[ends.length - 1];
            this.changed();
        }
    }
    exports.default = Polygon;
    function circular(center, radius, opt_n, opt_sphereRadius) {
        const n = opt_n ? opt_n : 32;
        const flatCoordinates = [];
        for (let i = 0; i < n; ++i) {
            array_js_4.extend(flatCoordinates, sphere_js_1.offset(center, radius, (2 * Math.PI * i) / n, opt_sphereRadius));
        }
        flatCoordinates.push(flatCoordinates[0], flatCoordinates[1]);
        return new Polygon(flatCoordinates, GeometryLayout_js_2.default.XY, [
            flatCoordinates.length,
        ]);
    }
    exports.circular = circular;
    function fromExtent(extent) {
        const minX = extent[0];
        const minY = extent[1];
        const maxX = extent[2];
        const maxY = extent[3];
        const flatCoordinates = [
            minX,
            minY,
            minX,
            maxY,
            maxX,
            maxY,
            maxX,
            minY,
            minX,
            minY,
        ];
        return new Polygon(flatCoordinates, GeometryLayout_js_2.default.XY, [
            flatCoordinates.length,
        ]);
    }
    exports.fromExtent = fromExtent;
    function fromCircle(circle, opt_sides, opt_angle) {
        const sides = opt_sides ? opt_sides : 32;
        const stride = circle.getStride();
        const layout = circle.getLayout();
        const center = circle.getCenter();
        const arrayLength = stride * (sides + 1);
        const flatCoordinates = new Array(arrayLength);
        for (let i = 0; i < arrayLength; i += stride) {
            flatCoordinates[i] = 0;
            flatCoordinates[i + 1] = 0;
            for (let j = 2; j < stride; j++) {
                flatCoordinates[i + j] = center[j];
            }
        }
        const ends = [flatCoordinates.length];
        const polygon = new Polygon(flatCoordinates, layout, ends);
        makeRegular(polygon, center, circle.getRadius(), opt_angle);
        return polygon;
    }
    exports.fromCircle = fromCircle;
    function makeRegular(polygon, center, radius, opt_angle) {
        const flatCoordinates = polygon.getFlatCoordinates();
        const stride = polygon.getStride();
        const sides = flatCoordinates.length / stride - 1;
        const startAngle = opt_angle ? opt_angle : 0;
        for (let i = 0; i <= sides; ++i) {
            const offset = i * stride;
            const angle = startAngle + (math_js_6.modulo(i, sides) * 2 * Math.PI) / sides;
            flatCoordinates[offset] = center[0] + radius * Math.cos(angle);
            flatCoordinates[offset + 1] = center[1] + radius * Math.sin(angle);
        }
        polygon.changed();
    }
    exports.makeRegular = makeRegular;
});
define("node_modules/ol/src/sphere", ["require", "exports", "node_modules/ol/src/geom/GeometryType", "node_modules/ol/src/math"], function (require, exports, GeometryType_js_5, math_js_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.offset = exports.getArea = exports.getLength = exports.getDistance = exports.DEFAULT_RADIUS = void 0;
    exports.DEFAULT_RADIUS = 6371008.8;
    function getDistance(c1, c2, opt_radius) {
        const radius = opt_radius || exports.DEFAULT_RADIUS;
        const lat1 = math_js_7.toRadians(c1[1]);
        const lat2 = math_js_7.toRadians(c2[1]);
        const deltaLatBy2 = (lat2 - lat1) / 2;
        const deltaLonBy2 = math_js_7.toRadians(c2[0] - c1[0]) / 2;
        const a = Math.sin(deltaLatBy2) * Math.sin(deltaLatBy2) +
            Math.sin(deltaLonBy2) *
                Math.sin(deltaLonBy2) *
                Math.cos(lat1) *
                Math.cos(lat2);
        return 2 * radius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    exports.getDistance = getDistance;
    function getLengthInternal(coordinates, radius) {
        let length = 0;
        for (let i = 0, ii = coordinates.length; i < ii - 1; ++i) {
            length += getDistance(coordinates[i], coordinates[i + 1], radius);
        }
        return length;
    }
    function getLength(geometry, opt_options) {
        const options = opt_options || {};
        const radius = options.radius || exports.DEFAULT_RADIUS;
        const projection = options.projection || 'EPSG:3857';
        const type = geometry.getType();
        if (type !== GeometryType_js_5.default.GEOMETRY_COLLECTION) {
            geometry = geometry.clone().transform(projection, 'EPSG:4326');
        }
        let length = 0;
        let coordinates, coords, i, ii, j, jj;
        switch (type) {
            case GeometryType_js_5.default.POINT:
            case GeometryType_js_5.default.MULTI_POINT: {
                break;
            }
            case GeometryType_js_5.default.LINE_STRING:
            case GeometryType_js_5.default.LINEAR_RING: {
                coordinates = (geometry).getCoordinates();
                length = getLengthInternal(coordinates, radius);
                break;
            }
            case GeometryType_js_5.default.MULTI_LINE_STRING:
            case GeometryType_js_5.default.POLYGON: {
                coordinates = (geometry).getCoordinates();
                for (i = 0, ii = coordinates.length; i < ii; ++i) {
                    length += getLengthInternal(coordinates[i], radius);
                }
                break;
            }
            case GeometryType_js_5.default.MULTI_POLYGON: {
                coordinates = (geometry).getCoordinates();
                for (i = 0, ii = coordinates.length; i < ii; ++i) {
                    coords = coordinates[i];
                    for (j = 0, jj = coords.length; j < jj; ++j) {
                        length += getLengthInternal(coords[j], radius);
                    }
                }
                break;
            }
            case GeometryType_js_5.default.GEOMETRY_COLLECTION: {
                const geometries = (geometry).getGeometries();
                for (i = 0, ii = geometries.length; i < ii; ++i) {
                    length += getLength(geometries[i], opt_options);
                }
                break;
            }
            default: {
                throw new Error('Unsupported geometry type: ' + type);
            }
        }
        return length;
    }
    exports.getLength = getLength;
    function getAreaInternal(coordinates, radius) {
        let area = 0;
        const len = coordinates.length;
        let x1 = coordinates[len - 1][0];
        let y1 = coordinates[len - 1][1];
        for (let i = 0; i < len; i++) {
            const x2 = coordinates[i][0];
            const y2 = coordinates[i][1];
            area +=
                math_js_7.toRadians(x2 - x1) *
                    (2 + Math.sin(math_js_7.toRadians(y1)) + Math.sin(math_js_7.toRadians(y2)));
            x1 = x2;
            y1 = y2;
        }
        return (area * radius * radius) / 2.0;
    }
    function getArea(geometry, opt_options) {
        const options = opt_options || {};
        const radius = options.radius || exports.DEFAULT_RADIUS;
        const projection = options.projection || 'EPSG:3857';
        const type = geometry.getType();
        if (type !== GeometryType_js_5.default.GEOMETRY_COLLECTION) {
            geometry = geometry.clone().transform(projection, 'EPSG:4326');
        }
        let area = 0;
        let coordinates, coords, i, ii, j, jj;
        switch (type) {
            case GeometryType_js_5.default.POINT:
            case GeometryType_js_5.default.MULTI_POINT:
            case GeometryType_js_5.default.LINE_STRING:
            case GeometryType_js_5.default.MULTI_LINE_STRING:
            case GeometryType_js_5.default.LINEAR_RING: {
                break;
            }
            case GeometryType_js_5.default.POLYGON: {
                coordinates = (geometry).getCoordinates();
                area = Math.abs(getAreaInternal(coordinates[0], radius));
                for (i = 1, ii = coordinates.length; i < ii; ++i) {
                    area -= Math.abs(getAreaInternal(coordinates[i], radius));
                }
                break;
            }
            case GeometryType_js_5.default.MULTI_POLYGON: {
                coordinates = (geometry).getCoordinates();
                for (i = 0, ii = coordinates.length; i < ii; ++i) {
                    coords = coordinates[i];
                    area += Math.abs(getAreaInternal(coords[0], radius));
                    for (j = 1, jj = coords.length; j < jj; ++j) {
                        area -= Math.abs(getAreaInternal(coords[j], radius));
                    }
                }
                break;
            }
            case GeometryType_js_5.default.GEOMETRY_COLLECTION: {
                const geometries = (geometry).getGeometries();
                for (i = 0, ii = geometries.length; i < ii; ++i) {
                    area += getArea(geometries[i], opt_options);
                }
                break;
            }
            default: {
                throw new Error('Unsupported geometry type: ' + type);
            }
        }
        return area;
    }
    exports.getArea = getArea;
    function offset(c1, distance, bearing, opt_radius) {
        const radius = opt_radius || exports.DEFAULT_RADIUS;
        const lat1 = math_js_7.toRadians(c1[1]);
        const lon1 = math_js_7.toRadians(c1[0]);
        const dByR = distance / radius;
        const lat = Math.asin(Math.sin(lat1) * Math.cos(dByR) +
            Math.cos(lat1) * Math.sin(dByR) * Math.cos(bearing));
        const lon = lon1 +
            Math.atan2(Math.sin(bearing) * Math.sin(dByR) * Math.cos(lat1), Math.cos(dByR) - Math.sin(lat1) * Math.sin(lat));
        return [math_js_7.toDegrees(lon), math_js_7.toDegrees(lat)];
    }
    exports.offset = offset;
});
define("node_modules/ol/src/proj", ["require", "exports", "node_modules/ol/src/proj/Projection", "node_modules/ol/src/proj/Units", "node_modules/ol/src/proj/epsg3857", "node_modules/ol/src/proj/epsg4326", "node_modules/ol/src/proj/projections", "node_modules/ol/src/proj/transforms", "node_modules/ol/src/extent", "node_modules/ol/src/math", "node_modules/ol/src/sphere", "node_modules/ol/src/coordinate"], function (require, exports, Projection_js_3, Units_js_4, epsg3857_js_1, epsg4326_js_1, projections_js_1, transforms_js_1, extent_js_8, math_js_8, sphere_js_2, coordinate_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.addCommon = exports.createSafeCoordinateTransform = exports.fromUserExtent = exports.toUserExtent = exports.fromUserCoordinate = exports.toUserCoordinate = exports.useGeographic = exports.getUserProjection = exports.clearUserProjection = exports.setUserProjection = exports.transformWithProjections = exports.transformExtent = exports.transform = exports.getTransform = exports.getTransformFromProjections = exports.equivalent = exports.toLonLat = exports.fromLonLat = exports.addCoordinateTransforms = exports.createTransformFromCoordinateTransform = exports.createProjection = exports.clearAllProjections = exports.addEquivalentTransforms = exports.addEquivalentProjections = exports.getPointResolution = exports.get = exports.addProjections = exports.addProjection = exports.identityTransform = exports.cloneTransform = exports.Projection = exports.METERS_PER_UNIT = void 0;
    exports.Projection = Projection_js_3.default;
    Object.defineProperty(exports, "METERS_PER_UNIT", { enumerable: true, get: function () { return Units_js_4.METERS_PER_UNIT; } });
    function cloneTransform(input, opt_output, opt_dimension) {
        let output;
        if (opt_output !== undefined) {
            for (let i = 0, ii = input.length; i < ii; ++i) {
                opt_output[i] = input[i];
            }
            output = opt_output;
        }
        else {
            output = input.slice();
        }
        return output;
    }
    exports.cloneTransform = cloneTransform;
    function identityTransform(input, opt_output, opt_dimension) {
        if (opt_output !== undefined && input !== opt_output) {
            for (let i = 0, ii = input.length; i < ii; ++i) {
                opt_output[i] = input[i];
            }
            input = opt_output;
        }
        return input;
    }
    exports.identityTransform = identityTransform;
    function addProjection(projection) {
        projections_js_1.add(projection.getCode(), projection);
        transforms_js_1.add(projection, projection, cloneTransform);
    }
    exports.addProjection = addProjection;
    function addProjections(projections) {
        projections.forEach(addProjection);
    }
    exports.addProjections = addProjections;
    function get(projectionLike) {
        return typeof projectionLike === 'string'
            ? projections_js_1.get((projectionLike))
            : (projectionLike) || null;
    }
    exports.get = get;
    function getPointResolution(projection, resolution, point, opt_units) {
        projection = get(projection);
        let pointResolution;
        const getter = projection.getPointResolutionFunc();
        if (getter) {
            pointResolution = getter(resolution, point);
            if (opt_units && opt_units !== projection.getUnits()) {
                const metersPerUnit = projection.getMetersPerUnit();
                if (metersPerUnit) {
                    pointResolution =
                        (pointResolution * metersPerUnit) / Units_js_4.METERS_PER_UNIT[opt_units];
                }
            }
        }
        else {
            const units = projection.getUnits();
            if ((units == Units_js_4.default.DEGREES && !opt_units) || opt_units == Units_js_4.default.DEGREES) {
                pointResolution = resolution;
            }
            else {
                const toEPSG4326 = getTransformFromProjections(projection, get('EPSG:4326'));
                let vertices = [
                    point[0] - resolution / 2,
                    point[1],
                    point[0] + resolution / 2,
                    point[1],
                    point[0],
                    point[1] - resolution / 2,
                    point[0],
                    point[1] + resolution / 2,
                ];
                vertices = toEPSG4326(vertices, vertices, 2);
                const width = sphere_js_2.getDistance(vertices.slice(0, 2), vertices.slice(2, 4));
                const height = sphere_js_2.getDistance(vertices.slice(4, 6), vertices.slice(6, 8));
                pointResolution = (width + height) / 2;
                const metersPerUnit = opt_units
                    ? Units_js_4.METERS_PER_UNIT[opt_units]
                    : projection.getMetersPerUnit();
                if (metersPerUnit !== undefined) {
                    pointResolution /= metersPerUnit;
                }
            }
        }
        return pointResolution;
    }
    exports.getPointResolution = getPointResolution;
    function addEquivalentProjections(projections) {
        addProjections(projections);
        projections.forEach(function (source) {
            projections.forEach(function (destination) {
                if (source !== destination) {
                    transforms_js_1.add(source, destination, cloneTransform);
                }
            });
        });
    }
    exports.addEquivalentProjections = addEquivalentProjections;
    function addEquivalentTransforms(projections1, projections2, forwardTransform, inverseTransform) {
        projections1.forEach(function (projection1) {
            projections2.forEach(function (projection2) {
                transforms_js_1.add(projection1, projection2, forwardTransform);
                transforms_js_1.add(projection2, projection1, inverseTransform);
            });
        });
    }
    exports.addEquivalentTransforms = addEquivalentTransforms;
    function clearAllProjections() {
        projections_js_1.clear();
        transforms_js_1.clear();
    }
    exports.clearAllProjections = clearAllProjections;
    function createProjection(projection, defaultCode) {
        if (!projection) {
            return get(defaultCode);
        }
        else if (typeof projection === 'string') {
            return get(projection);
        }
        else {
            return (projection);
        }
    }
    exports.createProjection = createProjection;
    function createTransformFromCoordinateTransform(coordTransform) {
        return (function (input, opt_output, opt_dimension) {
            const length = input.length;
            const dimension = opt_dimension !== undefined ? opt_dimension : 2;
            const output = opt_output !== undefined ? opt_output : new Array(length);
            for (let i = 0; i < length; i += dimension) {
                const point = coordTransform([input[i], input[i + 1]]);
                output[i] = point[0];
                output[i + 1] = point[1];
                for (let j = dimension - 1; j >= 2; --j) {
                    output[i + j] = input[i + j];
                }
            }
            return output;
        });
    }
    exports.createTransformFromCoordinateTransform = createTransformFromCoordinateTransform;
    function addCoordinateTransforms(source, destination, forward, inverse) {
        const sourceProj = get(source);
        const destProj = get(destination);
        transforms_js_1.add(sourceProj, destProj, createTransformFromCoordinateTransform(forward));
        transforms_js_1.add(destProj, sourceProj, createTransformFromCoordinateTransform(inverse));
    }
    exports.addCoordinateTransforms = addCoordinateTransforms;
    function fromLonLat(coordinate, opt_projection) {
        return transform(coordinate, 'EPSG:4326', opt_projection !== undefined ? opt_projection : 'EPSG:3857');
    }
    exports.fromLonLat = fromLonLat;
    function toLonLat(coordinate, opt_projection) {
        const lonLat = transform(coordinate, opt_projection !== undefined ? opt_projection : 'EPSG:3857', 'EPSG:4326');
        const lon = lonLat[0];
        if (lon < -180 || lon > 180) {
            lonLat[0] = math_js_8.modulo(lon + 180, 360) - 180;
        }
        return lonLat;
    }
    exports.toLonLat = toLonLat;
    function equivalent(projection1, projection2) {
        if (projection1 === projection2) {
            return true;
        }
        const equalUnits = projection1.getUnits() === projection2.getUnits();
        if (projection1.getCode() === projection2.getCode()) {
            return equalUnits;
        }
        else {
            const transformFunc = getTransformFromProjections(projection1, projection2);
            return transformFunc === cloneTransform && equalUnits;
        }
    }
    exports.equivalent = equivalent;
    function getTransformFromProjections(sourceProjection, destinationProjection) {
        const sourceCode = sourceProjection.getCode();
        const destinationCode = destinationProjection.getCode();
        let transformFunc = transforms_js_1.get(sourceCode, destinationCode);
        if (!transformFunc) {
            transformFunc = identityTransform;
        }
        return transformFunc;
    }
    exports.getTransformFromProjections = getTransformFromProjections;
    function getTransform(source, destination) {
        const sourceProjection = get(source);
        const destinationProjection = get(destination);
        return getTransformFromProjections(sourceProjection, destinationProjection);
    }
    exports.getTransform = getTransform;
    function transform(coordinate, source, destination) {
        const transformFunc = getTransform(source, destination);
        return transformFunc(coordinate, undefined, coordinate.length);
    }
    exports.transform = transform;
    function transformExtent(extent, source, destination, opt_stops) {
        const transformFunc = getTransform(source, destination);
        return extent_js_8.applyTransform(extent, transformFunc, undefined, opt_stops);
    }
    exports.transformExtent = transformExtent;
    function transformWithProjections(point, sourceProjection, destinationProjection) {
        const transformFunc = getTransformFromProjections(sourceProjection, destinationProjection);
        return transformFunc(point);
    }
    exports.transformWithProjections = transformWithProjections;
    let userProjection = null;
    function setUserProjection(projection) {
        userProjection = get(projection);
    }
    exports.setUserProjection = setUserProjection;
    function clearUserProjection() {
        userProjection = null;
    }
    exports.clearUserProjection = clearUserProjection;
    function getUserProjection() {
        return userProjection;
    }
    exports.getUserProjection = getUserProjection;
    function useGeographic() {
        setUserProjection('EPSG:4326');
    }
    exports.useGeographic = useGeographic;
    function toUserCoordinate(coordinate, sourceProjection) {
        if (!userProjection) {
            return coordinate;
        }
        return transform(coordinate, sourceProjection, userProjection);
    }
    exports.toUserCoordinate = toUserCoordinate;
    function fromUserCoordinate(coordinate, destProjection) {
        if (!userProjection) {
            return coordinate;
        }
        return transform(coordinate, userProjection, destProjection);
    }
    exports.fromUserCoordinate = fromUserCoordinate;
    function toUserExtent(extent, sourceProjection) {
        if (!userProjection) {
            return extent;
        }
        return transformExtent(extent, sourceProjection, userProjection);
    }
    exports.toUserExtent = toUserExtent;
    function fromUserExtent(extent, destProjection) {
        if (!userProjection) {
            return extent;
        }
        return transformExtent(extent, userProjection, destProjection);
    }
    exports.fromUserExtent = fromUserExtent;
    function createSafeCoordinateTransform(sourceProj, destProj, transform) {
        return function (coord) {
            let sourceX = coord[0];
            let sourceY = coord[1];
            let transformed, worldsAway;
            if (sourceProj.canWrapX()) {
                const sourceExtent = sourceProj.getExtent();
                const sourceExtentWidth = extent_js_8.getWidth(sourceExtent);
                worldsAway = coordinate_js_1.getWorldsAway(coord, sourceProj, sourceExtentWidth);
                if (worldsAway) {
                    sourceX = sourceX - worldsAway * sourceExtentWidth;
                }
                sourceX = math_js_8.clamp(sourceX, sourceExtent[0], sourceExtent[2]);
                sourceY = math_js_8.clamp(sourceY, sourceExtent[1], sourceExtent[3]);
                transformed = transform([sourceX, sourceY]);
            }
            else {
                transformed = transform(coord);
            }
            if (worldsAway && destProj.canWrapX()) {
                transformed[0] += worldsAway * extent_js_8.getWidth(destProj.getExtent());
            }
            return transformed;
        };
    }
    exports.createSafeCoordinateTransform = createSafeCoordinateTransform;
    function addCommon() {
        addEquivalentProjections(epsg3857_js_1.PROJECTIONS);
        addEquivalentProjections(epsg4326_js_1.PROJECTIONS);
        addEquivalentTransforms(epsg4326_js_1.PROJECTIONS, epsg3857_js_1.PROJECTIONS, epsg3857_js_1.fromEPSG4326, epsg3857_js_1.toEPSG4326);
    }
    exports.addCommon = addCommon;
    addCommon();
});
define("node_modules/ol/src/geom/flat/transform", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.translate = exports.scale = exports.rotate = exports.transform2D = void 0;
    function transform2D(flatCoordinates, offset, end, stride, transform, opt_dest) {
        const dest = opt_dest ? opt_dest : [];
        let i = 0;
        for (let j = offset; j < end; j += stride) {
            const x = flatCoordinates[j];
            const y = flatCoordinates[j + 1];
            dest[i++] = transform[0] * x + transform[2] * y + transform[4];
            dest[i++] = transform[1] * x + transform[3] * y + transform[5];
        }
        if (opt_dest && dest.length != i) {
            dest.length = i;
        }
        return dest;
    }
    exports.transform2D = transform2D;
    function rotate(flatCoordinates, offset, end, stride, angle, anchor, opt_dest) {
        const dest = opt_dest ? opt_dest : [];
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const anchorX = anchor[0];
        const anchorY = anchor[1];
        let i = 0;
        for (let j = offset; j < end; j += stride) {
            const deltaX = flatCoordinates[j] - anchorX;
            const deltaY = flatCoordinates[j + 1] - anchorY;
            dest[i++] = anchorX + deltaX * cos - deltaY * sin;
            dest[i++] = anchorY + deltaX * sin + deltaY * cos;
            for (let k = j + 2; k < j + stride; ++k) {
                dest[i++] = flatCoordinates[k];
            }
        }
        if (opt_dest && dest.length != i) {
            dest.length = i;
        }
        return dest;
    }
    exports.rotate = rotate;
    function scale(flatCoordinates, offset, end, stride, sx, sy, anchor, opt_dest) {
        const dest = opt_dest ? opt_dest : [];
        const anchorX = anchor[0];
        const anchorY = anchor[1];
        let i = 0;
        for (let j = offset; j < end; j += stride) {
            const deltaX = flatCoordinates[j] - anchorX;
            const deltaY = flatCoordinates[j + 1] - anchorY;
            dest[i++] = anchorX + sx * deltaX;
            dest[i++] = anchorY + sy * deltaY;
            for (let k = j + 2; k < j + stride; ++k) {
                dest[i++] = flatCoordinates[k];
            }
        }
        if (opt_dest && dest.length != i) {
            dest.length = i;
        }
        return dest;
    }
    exports.scale = scale;
    function translate(flatCoordinates, offset, end, stride, deltaX, deltaY, opt_dest) {
        const dest = opt_dest ? opt_dest : [];
        let i = 0;
        for (let j = offset; j < end; j += stride) {
            dest[i++] = flatCoordinates[j] + deltaX;
            dest[i++] = flatCoordinates[j + 1] + deltaY;
            for (let k = j + 2; k < j + stride; ++k) {
                dest[i++] = flatCoordinates[k];
            }
        }
        if (opt_dest && dest.length != i) {
            dest.length = i;
        }
        return dest;
    }
    exports.translate = translate;
});
define("node_modules/ol/src/geom/Geometry", ["require", "exports", "node_modules/ol/src/Object", "node_modules/ol/src/proj/Units", "node_modules/ol/src/util", "node_modules/ol/src/transform", "node_modules/ol/src/extent", "node_modules/ol/src/proj", "node_modules/ol/src/functions", "node_modules/ol/src/geom/flat/transform"], function (require, exports, Object_js_1, Units_js_5, util_js_3, transform_js_1, extent_js_9, proj_js_1, functions_js_2, transform_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tmpTransform = transform_js_1.create();
    class Geometry extends Object_js_1.default {
        constructor() {
            super();
            this.extent_ = extent_js_9.createEmpty();
            this.extentRevision_ = -1;
            this.simplifiedGeometryMaxMinSquaredTolerance = 0;
            this.simplifiedGeometryRevision = 0;
            this.simplifyTransformedInternal = functions_js_2.memoizeOne(function (revision, squaredTolerance, opt_transform) {
                if (!opt_transform) {
                    return this.getSimplifiedGeometry(squaredTolerance);
                }
                const clone = this.clone();
                clone.applyTransform(opt_transform);
                return clone.getSimplifiedGeometry(squaredTolerance);
            });
        }
        simplifyTransformed(squaredTolerance, opt_transform) {
            return this.simplifyTransformedInternal(this.getRevision(), squaredTolerance, opt_transform);
        }
        clone() {
            return util_js_3.abstract();
        }
        closestPointXY(x, y, closestPoint, minSquaredDistance) {
            return util_js_3.abstract();
        }
        containsXY(x, y) {
            const coord = this.getClosestPoint([x, y]);
            return coord[0] === x && coord[1] === y;
        }
        getClosestPoint(point, opt_closestPoint) {
            const closestPoint = opt_closestPoint ? opt_closestPoint : [NaN, NaN];
            this.closestPointXY(point[0], point[1], closestPoint, Infinity);
            return closestPoint;
        }
        intersectsCoordinate(coordinate) {
            return this.containsXY(coordinate[0], coordinate[1]);
        }
        computeExtent(extent) {
            return util_js_3.abstract();
        }
        getExtent(opt_extent) {
            if (this.extentRevision_ != this.getRevision()) {
                const extent = this.computeExtent(this.extent_);
                if (isNaN(extent[0]) || isNaN(extent[1])) {
                    extent_js_9.createOrUpdateEmpty(extent);
                }
                this.extentRevision_ = this.getRevision();
            }
            return extent_js_9.returnOrUpdate(this.extent_, opt_extent);
        }
        rotate(angle, anchor) {
            util_js_3.abstract();
        }
        scale(sx, opt_sy, opt_anchor) {
            util_js_3.abstract();
        }
        simplify(tolerance) {
            return this.getSimplifiedGeometry(tolerance * tolerance);
        }
        getSimplifiedGeometry(squaredTolerance) {
            return util_js_3.abstract();
        }
        getType() {
            return util_js_3.abstract();
        }
        applyTransform(transformFn) {
            util_js_3.abstract();
        }
        intersectsExtent(extent) {
            return util_js_3.abstract();
        }
        translate(deltaX, deltaY) {
            util_js_3.abstract();
        }
        transform(source, destination) {
            const sourceProj = proj_js_1.get(source);
            const transformFn = sourceProj.getUnits() == Units_js_5.default.TILE_PIXELS
                ? function (inCoordinates, outCoordinates, stride) {
                    const pixelExtent = sourceProj.getExtent();
                    const projectedExtent = sourceProj.getWorldExtent();
                    const scale = extent_js_9.getHeight(projectedExtent) / extent_js_9.getHeight(pixelExtent);
                    transform_js_1.compose(tmpTransform, projectedExtent[0], projectedExtent[3], scale, -scale, 0, 0, 0);
                    transform_js_2.transform2D(inCoordinates, 0, inCoordinates.length, stride, tmpTransform, outCoordinates);
                    return proj_js_1.getTransform(sourceProj, destination)(inCoordinates, outCoordinates, stride);
                }
                : proj_js_1.getTransform(sourceProj, destination);
            this.applyTransform(transformFn);
            return this;
        }
    }
    exports.default = Geometry;
});
define("node_modules/ol/src/geom/SimpleGeometry", ["require", "exports", "node_modules/ol/src/geom/Geometry", "node_modules/ol/src/geom/GeometryLayout", "node_modules/ol/src/util", "node_modules/ol/src/extent", "node_modules/ol/src/geom/flat/transform"], function (require, exports, Geometry_js_2, GeometryLayout_js_3, util_js_4, extent_js_10, transform_js_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.transformGeom2D = exports.getStrideForLayout = void 0;
    class SimpleGeometry extends Geometry_js_2.default {
        constructor() {
            super();
            this.layout = GeometryLayout_js_3.default.XY;
            this.stride = 2;
            this.flatCoordinates = null;
        }
        computeExtent(extent) {
            return extent_js_10.createOrUpdateFromFlatCoordinates(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, extent);
        }
        getCoordinates() {
            return util_js_4.abstract();
        }
        getFirstCoordinate() {
            return this.flatCoordinates.slice(0, this.stride);
        }
        getFlatCoordinates() {
            return this.flatCoordinates;
        }
        getLastCoordinate() {
            return this.flatCoordinates.slice(this.flatCoordinates.length - this.stride);
        }
        getLayout() {
            return this.layout;
        }
        getSimplifiedGeometry(squaredTolerance) {
            if (this.simplifiedGeometryRevision !== this.getRevision()) {
                this.simplifiedGeometryMaxMinSquaredTolerance = 0;
                this.simplifiedGeometryRevision = this.getRevision();
            }
            if (squaredTolerance < 0 ||
                (this.simplifiedGeometryMaxMinSquaredTolerance !== 0 &&
                    squaredTolerance <= this.simplifiedGeometryMaxMinSquaredTolerance)) {
                return this;
            }
            const simplifiedGeometry = this.getSimplifiedGeometryInternal(squaredTolerance);
            const simplifiedFlatCoordinates = simplifiedGeometry.getFlatCoordinates();
            if (simplifiedFlatCoordinates.length < this.flatCoordinates.length) {
                return simplifiedGeometry;
            }
            else {
                this.simplifiedGeometryMaxMinSquaredTolerance = squaredTolerance;
                return this;
            }
        }
        getSimplifiedGeometryInternal(squaredTolerance) {
            return this;
        }
        getStride() {
            return this.stride;
        }
        setFlatCoordinates(layout, flatCoordinates) {
            this.stride = getStrideForLayout(layout);
            this.layout = layout;
            this.flatCoordinates = flatCoordinates;
        }
        setCoordinates(coordinates, opt_layout) {
            util_js_4.abstract();
        }
        setLayout(layout, coordinates, nesting) {
            let stride;
            if (layout) {
                stride = getStrideForLayout(layout);
            }
            else {
                for (let i = 0; i < nesting; ++i) {
                    if (coordinates.length === 0) {
                        this.layout = GeometryLayout_js_3.default.XY;
                        this.stride = 2;
                        return;
                    }
                    else {
                        coordinates = (coordinates[0]);
                    }
                }
                stride = coordinates.length;
                layout = getLayoutForStride(stride);
            }
            this.layout = layout;
            this.stride = stride;
        }
        applyTransform(transformFn) {
            if (this.flatCoordinates) {
                transformFn(this.flatCoordinates, this.flatCoordinates, this.stride);
                this.changed();
            }
        }
        rotate(angle, anchor) {
            const flatCoordinates = this.getFlatCoordinates();
            if (flatCoordinates) {
                const stride = this.getStride();
                transform_js_3.rotate(flatCoordinates, 0, flatCoordinates.length, stride, angle, anchor, flatCoordinates);
                this.changed();
            }
        }
        scale(sx, opt_sy, opt_anchor) {
            let sy = opt_sy;
            if (sy === undefined) {
                sy = sx;
            }
            let anchor = opt_anchor;
            if (!anchor) {
                anchor = extent_js_10.getCenter(this.getExtent());
            }
            const flatCoordinates = this.getFlatCoordinates();
            if (flatCoordinates) {
                const stride = this.getStride();
                transform_js_3.scale(flatCoordinates, 0, flatCoordinates.length, stride, sx, sy, anchor, flatCoordinates);
                this.changed();
            }
        }
        translate(deltaX, deltaY) {
            const flatCoordinates = this.getFlatCoordinates();
            if (flatCoordinates) {
                const stride = this.getStride();
                transform_js_3.translate(flatCoordinates, 0, flatCoordinates.length, stride, deltaX, deltaY, flatCoordinates);
                this.changed();
            }
        }
    }
    function getLayoutForStride(stride) {
        let layout;
        if (stride == 2) {
            layout = GeometryLayout_js_3.default.XY;
        }
        else if (stride == 3) {
            layout = GeometryLayout_js_3.default.XYZ;
        }
        else if (stride == 4) {
            layout = GeometryLayout_js_3.default.XYZM;
        }
        return (layout);
    }
    function getStrideForLayout(layout) {
        let stride;
        if (layout == GeometryLayout_js_3.default.XY) {
            stride = 2;
        }
        else if (layout == GeometryLayout_js_3.default.XYZ || layout == GeometryLayout_js_3.default.XYM) {
            stride = 3;
        }
        else if (layout == GeometryLayout_js_3.default.XYZM) {
            stride = 4;
        }
        return (stride);
    }
    exports.getStrideForLayout = getStrideForLayout;
    function transformGeom2D(simpleGeometry, transform, opt_dest) {
        const flatCoordinates = simpleGeometry.getFlatCoordinates();
        if (!flatCoordinates) {
            return null;
        }
        else {
            const stride = simpleGeometry.getStride();
            return transform_js_3.transform2D(flatCoordinates, 0, flatCoordinates.length, stride, transform, opt_dest);
        }
    }
    exports.transformGeom2D = transformGeom2D;
    exports.default = SimpleGeometry;
});
define("node_modules/ol/src/geom/Circle", ["require", "exports", "node_modules/ol/src/geom/GeometryType", "node_modules/ol/src/geom/SimpleGeometry", "node_modules/ol/src/extent", "node_modules/ol/src/geom/flat/deflate", "node_modules/ol/src/geom/flat/transform"], function (require, exports, GeometryType_js_6, SimpleGeometry_js_4, extent_js_11, deflate_js_4, transform_js_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Circle extends SimpleGeometry_js_4.default {
        constructor(center, opt_radius, opt_layout) {
            super();
            if (opt_layout !== undefined && opt_radius === undefined) {
                this.setFlatCoordinates(opt_layout, center);
            }
            else {
                const radius = opt_radius ? opt_radius : 0;
                this.setCenterAndRadius(center, radius, opt_layout);
            }
        }
        clone() {
            return new Circle(this.flatCoordinates.slice(), undefined, this.layout);
        }
        closestPointXY(x, y, closestPoint, minSquaredDistance) {
            const flatCoordinates = this.flatCoordinates;
            const dx = x - flatCoordinates[0];
            const dy = y - flatCoordinates[1];
            const squaredDistance = dx * dx + dy * dy;
            if (squaredDistance < minSquaredDistance) {
                if (squaredDistance === 0) {
                    for (let i = 0; i < this.stride; ++i) {
                        closestPoint[i] = flatCoordinates[i];
                    }
                }
                else {
                    const delta = this.getRadius() / Math.sqrt(squaredDistance);
                    closestPoint[0] = flatCoordinates[0] + delta * dx;
                    closestPoint[1] = flatCoordinates[1] + delta * dy;
                    for (let i = 2; i < this.stride; ++i) {
                        closestPoint[i] = flatCoordinates[i];
                    }
                }
                closestPoint.length = this.stride;
                return squaredDistance;
            }
            else {
                return minSquaredDistance;
            }
        }
        containsXY(x, y) {
            const flatCoordinates = this.flatCoordinates;
            const dx = x - flatCoordinates[0];
            const dy = y - flatCoordinates[1];
            return dx * dx + dy * dy <= this.getRadiusSquared_();
        }
        getCenter() {
            return this.flatCoordinates.slice(0, this.stride);
        }
        computeExtent(extent) {
            const flatCoordinates = this.flatCoordinates;
            const radius = flatCoordinates[this.stride] - flatCoordinates[0];
            return extent_js_11.createOrUpdate(flatCoordinates[0] - radius, flatCoordinates[1] - radius, flatCoordinates[0] + radius, flatCoordinates[1] + radius, extent);
        }
        getRadius() {
            return Math.sqrt(this.getRadiusSquared_());
        }
        getRadiusSquared_() {
            const dx = this.flatCoordinates[this.stride] - this.flatCoordinates[0];
            const dy = this.flatCoordinates[this.stride + 1] - this.flatCoordinates[1];
            return dx * dx + dy * dy;
        }
        getType() {
            return GeometryType_js_6.default.CIRCLE;
        }
        intersectsExtent(extent) {
            const circleExtent = this.getExtent();
            if (extent_js_11.intersects(extent, circleExtent)) {
                const center = this.getCenter();
                if (extent[0] <= center[0] && extent[2] >= center[0]) {
                    return true;
                }
                if (extent[1] <= center[1] && extent[3] >= center[1]) {
                    return true;
                }
                return extent_js_11.forEachCorner(extent, this.intersectsCoordinate.bind(this));
            }
            return false;
        }
        setCenter(center) {
            const stride = this.stride;
            const radius = this.flatCoordinates[stride] - this.flatCoordinates[0];
            const flatCoordinates = center.slice();
            flatCoordinates[stride] = flatCoordinates[0] + radius;
            for (let i = 1; i < stride; ++i) {
                flatCoordinates[stride + i] = center[i];
            }
            this.setFlatCoordinates(this.layout, flatCoordinates);
            this.changed();
        }
        setCenterAndRadius(center, radius, opt_layout) {
            this.setLayout(opt_layout, center, 0);
            if (!this.flatCoordinates) {
                this.flatCoordinates = [];
            }
            const flatCoordinates = this.flatCoordinates;
            let offset = deflate_js_4.deflateCoordinate(flatCoordinates, 0, center, this.stride);
            flatCoordinates[offset++] = flatCoordinates[0] + radius;
            for (let i = 1, ii = this.stride; i < ii; ++i) {
                flatCoordinates[offset++] = flatCoordinates[i];
            }
            flatCoordinates.length = offset;
            this.changed();
        }
        getCoordinates() {
            return null;
        }
        setCoordinates(coordinates, opt_layout) { }
        setRadius(radius) {
            this.flatCoordinates[this.stride] = this.flatCoordinates[0] + radius;
            this.changed();
        }
        rotate(angle, anchor) {
            const center = this.getCenter();
            const stride = this.getStride();
            this.setCenter(transform_js_4.rotate(center, 0, center.length, stride, angle, anchor, center));
            this.changed();
        }
        translate(deltaX, deltaY) {
            const center = this.getCenter();
            const stride = this.getStride();
            this.setCenter(transform_js_4.translate(center, 0, center.length, stride, deltaX, deltaY, center));
            this.changed();
        }
    }
    Circle.prototype.transform;
    exports.default = Circle;
});
define("node_modules/ol/src/coordinate", ["require", "exports", "node_modules/ol/src/extent", "node_modules/ol/src/math", "node_modules/ol/src/string"], function (require, exports, extent_js_12, math_js_9, string_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getWorldsAway = exports.wrapX = exports.toStringXY = exports.toStringHDMS = exports.squaredDistanceToSegment = exports.distance = exports.squaredDistance = exports.scale = exports.rotate = exports.equals = exports.format = exports.degreesToStringHDMS = exports.createStringXY = exports.closestOnSegment = exports.closestOnCircle = exports.add = void 0;
    function add(coordinate, delta) {
        coordinate[0] += +delta[0];
        coordinate[1] += +delta[1];
        return coordinate;
    }
    exports.add = add;
    function closestOnCircle(coordinate, circle) {
        const r = circle.getRadius();
        const center = circle.getCenter();
        const x0 = center[0];
        const y0 = center[1];
        const x1 = coordinate[0];
        const y1 = coordinate[1];
        let dx = x1 - x0;
        const dy = y1 - y0;
        if (dx === 0 && dy === 0) {
            dx = 1;
        }
        const d = Math.sqrt(dx * dx + dy * dy);
        const x = x0 + (r * dx) / d;
        const y = y0 + (r * dy) / d;
        return [x, y];
    }
    exports.closestOnCircle = closestOnCircle;
    function closestOnSegment(coordinate, segment) {
        const x0 = coordinate[0];
        const y0 = coordinate[1];
        const start = segment[0];
        const end = segment[1];
        const x1 = start[0];
        const y1 = start[1];
        const x2 = end[0];
        const y2 = end[1];
        const dx = x2 - x1;
        const dy = y2 - y1;
        const along = dx === 0 && dy === 0
            ? 0
            : (dx * (x0 - x1) + dy * (y0 - y1)) / (dx * dx + dy * dy || 0);
        let x, y;
        if (along <= 0) {
            x = x1;
            y = y1;
        }
        else if (along >= 1) {
            x = x2;
            y = y2;
        }
        else {
            x = x1 + along * dx;
            y = y1 + along * dy;
        }
        return [x, y];
    }
    exports.closestOnSegment = closestOnSegment;
    function createStringXY(opt_fractionDigits) {
        return (function (coordinate) {
            return toStringXY(coordinate, opt_fractionDigits);
        });
    }
    exports.createStringXY = createStringXY;
    function degreesToStringHDMS(hemispheres, degrees, opt_fractionDigits) {
        const normalizedDegrees = math_js_9.modulo(degrees + 180, 360) - 180;
        const x = Math.abs(3600 * normalizedDegrees);
        const dflPrecision = opt_fractionDigits || 0;
        const precision = Math.pow(10, dflPrecision);
        let deg = Math.floor(x / 3600);
        let min = Math.floor((x - deg * 3600) / 60);
        let sec = x - deg * 3600 - min * 60;
        sec = Math.ceil(sec * precision) / precision;
        if (sec >= 60) {
            sec = 0;
            min += 1;
        }
        if (min >= 60) {
            min = 0;
            deg += 1;
        }
        return (deg +
            '\u00b0 ' +
            string_js_1.padNumber(min, 2) +
            '\u2032 ' +
            string_js_1.padNumber(sec, 2, dflPrecision) +
            '\u2033' +
            (normalizedDegrees == 0
                ? ''
                : ' ' + hemispheres.charAt(normalizedDegrees < 0 ? 1 : 0)));
    }
    exports.degreesToStringHDMS = degreesToStringHDMS;
    function format(coordinate, template, opt_fractionDigits) {
        if (coordinate) {
            return template
                .replace('{x}', coordinate[0].toFixed(opt_fractionDigits))
                .replace('{y}', coordinate[1].toFixed(opt_fractionDigits));
        }
        else {
            return '';
        }
    }
    exports.format = format;
    function equals(coordinate1, coordinate2) {
        let equals = true;
        for (let i = coordinate1.length - 1; i >= 0; --i) {
            if (coordinate1[i] != coordinate2[i]) {
                equals = false;
                break;
            }
        }
        return equals;
    }
    exports.equals = equals;
    function rotate(coordinate, angle) {
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        const x = coordinate[0] * cosAngle - coordinate[1] * sinAngle;
        const y = coordinate[1] * cosAngle + coordinate[0] * sinAngle;
        coordinate[0] = x;
        coordinate[1] = y;
        return coordinate;
    }
    exports.rotate = rotate;
    function scale(coordinate, scale) {
        coordinate[0] *= scale;
        coordinate[1] *= scale;
        return coordinate;
    }
    exports.scale = scale;
    function squaredDistance(coord1, coord2) {
        const dx = coord1[0] - coord2[0];
        const dy = coord1[1] - coord2[1];
        return dx * dx + dy * dy;
    }
    exports.squaredDistance = squaredDistance;
    function distance(coord1, coord2) {
        return Math.sqrt(squaredDistance(coord1, coord2));
    }
    exports.distance = distance;
    function squaredDistanceToSegment(coordinate, segment) {
        return squaredDistance(coordinate, closestOnSegment(coordinate, segment));
    }
    exports.squaredDistanceToSegment = squaredDistanceToSegment;
    function toStringHDMS(coordinate, opt_fractionDigits) {
        if (coordinate) {
            return (degreesToStringHDMS('NS', coordinate[1], opt_fractionDigits) +
                ' ' +
                degreesToStringHDMS('EW', coordinate[0], opt_fractionDigits));
        }
        else {
            return '';
        }
    }
    exports.toStringHDMS = toStringHDMS;
    function toStringXY(coordinate, opt_fractionDigits) {
        return format(coordinate, '{x}, {y}', opt_fractionDigits);
    }
    exports.toStringXY = toStringXY;
    function wrapX(coordinate, projection) {
        if (projection.canWrapX()) {
            const worldWidth = extent_js_12.getWidth(projection.getExtent());
            const worldsAway = getWorldsAway(coordinate, projection, worldWidth);
            if (worldsAway) {
                coordinate[0] -= worldsAway * worldWidth;
            }
        }
        return coordinate;
    }
    exports.wrapX = wrapX;
    function getWorldsAway(coordinate, projection, opt_sourceExtentWidth) {
        const projectionExtent = projection.getExtent();
        let worldsAway = 0;
        if (projection.canWrapX() &&
            (coordinate[0] < projectionExtent[0] || coordinate[0] > projectionExtent[2])) {
            const sourceExtentWidth = opt_sourceExtentWidth || extent_js_12.getWidth(projectionExtent);
            worldsAway = Math.floor((coordinate[0] - projectionExtent[0]) / sourceExtentWidth);
        }
        return worldsAway;
    }
    exports.getWorldsAway = getWorldsAway;
});
define("node_modules/ol/src/extent", ["require", "exports", "node_modules/ol/src/extent/Corner", "node_modules/ol/src/extent/Relationship", "node_modules/ol/src/asserts"], function (require, exports, Corner_js_1, Relationship_js_1, asserts_js_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.wrapX = exports.applyTransform = exports.intersectsSegment = exports.scaleFromCenter = exports.returnOrUpdate = exports.isEmpty = exports.intersects = exports.getWidth = exports.getTopRight = exports.getTopLeft = exports.getSize = exports.getMargin = exports.getIntersection = exports.getIntersectionArea = exports.getHeight = exports.getForViewAndSize = exports.getEnlargedArea = exports.getCorner = exports.getCenter = exports.getBottomRight = exports.getBottomLeft = exports.getArea = exports.forEachCorner = exports.extendXY = exports.extendRings = exports.extendFlatCoordinates = exports.extendCoordinates = exports.extendCoordinate = exports.extend = exports.approximatelyEquals = exports.equals = exports.createOrUpdateFromRings = exports.createOrUpdateFromFlatCoordinates = exports.createOrUpdateFromCoordinates = exports.createOrUpdateFromCoordinate = exports.createOrUpdateEmpty = exports.createOrUpdate = exports.createEmpty = exports.coordinateRelationship = exports.containsXY = exports.containsExtent = exports.containsCoordinate = exports.closestSquaredDistanceXY = exports.clone = exports.buffer = exports.boundingExtent = void 0;
    function boundingExtent(coordinates) {
        const extent = createEmpty();
        for (let i = 0, ii = coordinates.length; i < ii; ++i) {
            extendCoordinate(extent, coordinates[i]);
        }
        return extent;
    }
    exports.boundingExtent = boundingExtent;
    function _boundingExtentXYs(xs, ys, opt_extent) {
        const minX = Math.min.apply(null, xs);
        const minY = Math.min.apply(null, ys);
        const maxX = Math.max.apply(null, xs);
        const maxY = Math.max.apply(null, ys);
        return createOrUpdate(minX, minY, maxX, maxY, opt_extent);
    }
    function buffer(extent, value, opt_extent) {
        if (opt_extent) {
            opt_extent[0] = extent[0] - value;
            opt_extent[1] = extent[1] - value;
            opt_extent[2] = extent[2] + value;
            opt_extent[3] = extent[3] + value;
            return opt_extent;
        }
        else {
            return [
                extent[0] - value,
                extent[1] - value,
                extent[2] + value,
                extent[3] + value,
            ];
        }
    }
    exports.buffer = buffer;
    function clone(extent, opt_extent) {
        if (opt_extent) {
            opt_extent[0] = extent[0];
            opt_extent[1] = extent[1];
            opt_extent[2] = extent[2];
            opt_extent[3] = extent[3];
            return opt_extent;
        }
        else {
            return extent.slice();
        }
    }
    exports.clone = clone;
    function closestSquaredDistanceXY(extent, x, y) {
        let dx, dy;
        if (x < extent[0]) {
            dx = extent[0] - x;
        }
        else if (extent[2] < x) {
            dx = x - extent[2];
        }
        else {
            dx = 0;
        }
        if (y < extent[1]) {
            dy = extent[1] - y;
        }
        else if (extent[3] < y) {
            dy = y - extent[3];
        }
        else {
            dy = 0;
        }
        return dx * dx + dy * dy;
    }
    exports.closestSquaredDistanceXY = closestSquaredDistanceXY;
    function containsCoordinate(extent, coordinate) {
        return containsXY(extent, coordinate[0], coordinate[1]);
    }
    exports.containsCoordinate = containsCoordinate;
    function containsExtent(extent1, extent2) {
        return (extent1[0] <= extent2[0] &&
            extent2[2] <= extent1[2] &&
            extent1[1] <= extent2[1] &&
            extent2[3] <= extent1[3]);
    }
    exports.containsExtent = containsExtent;
    function containsXY(extent, x, y) {
        return extent[0] <= x && x <= extent[2] && extent[1] <= y && y <= extent[3];
    }
    exports.containsXY = containsXY;
    function coordinateRelationship(extent, coordinate) {
        const minX = extent[0];
        const minY = extent[1];
        const maxX = extent[2];
        const maxY = extent[3];
        const x = coordinate[0];
        const y = coordinate[1];
        let relationship = Relationship_js_1.default.UNKNOWN;
        if (x < minX) {
            relationship = relationship | Relationship_js_1.default.LEFT;
        }
        else if (x > maxX) {
            relationship = relationship | Relationship_js_1.default.RIGHT;
        }
        if (y < minY) {
            relationship = relationship | Relationship_js_1.default.BELOW;
        }
        else if (y > maxY) {
            relationship = relationship | Relationship_js_1.default.ABOVE;
        }
        if (relationship === Relationship_js_1.default.UNKNOWN) {
            relationship = Relationship_js_1.default.INTERSECTING;
        }
        return relationship;
    }
    exports.coordinateRelationship = coordinateRelationship;
    function createEmpty() {
        return [Infinity, Infinity, -Infinity, -Infinity];
    }
    exports.createEmpty = createEmpty;
    function createOrUpdate(minX, minY, maxX, maxY, opt_extent) {
        if (opt_extent) {
            opt_extent[0] = minX;
            opt_extent[1] = minY;
            opt_extent[2] = maxX;
            opt_extent[3] = maxY;
            return opt_extent;
        }
        else {
            return [minX, minY, maxX, maxY];
        }
    }
    exports.createOrUpdate = createOrUpdate;
    function createOrUpdateEmpty(opt_extent) {
        return createOrUpdate(Infinity, Infinity, -Infinity, -Infinity, opt_extent);
    }
    exports.createOrUpdateEmpty = createOrUpdateEmpty;
    function createOrUpdateFromCoordinate(coordinate, opt_extent) {
        const x = coordinate[0];
        const y = coordinate[1];
        return createOrUpdate(x, y, x, y, opt_extent);
    }
    exports.createOrUpdateFromCoordinate = createOrUpdateFromCoordinate;
    function createOrUpdateFromCoordinates(coordinates, opt_extent) {
        const extent = createOrUpdateEmpty(opt_extent);
        return extendCoordinates(extent, coordinates);
    }
    exports.createOrUpdateFromCoordinates = createOrUpdateFromCoordinates;
    function createOrUpdateFromFlatCoordinates(flatCoordinates, offset, end, stride, opt_extent) {
        const extent = createOrUpdateEmpty(opt_extent);
        return extendFlatCoordinates(extent, flatCoordinates, offset, end, stride);
    }
    exports.createOrUpdateFromFlatCoordinates = createOrUpdateFromFlatCoordinates;
    function createOrUpdateFromRings(rings, opt_extent) {
        const extent = createOrUpdateEmpty(opt_extent);
        return extendRings(extent, rings);
    }
    exports.createOrUpdateFromRings = createOrUpdateFromRings;
    function equals(extent1, extent2) {
        return (extent1[0] == extent2[0] &&
            extent1[2] == extent2[2] &&
            extent1[1] == extent2[1] &&
            extent1[3] == extent2[3]);
    }
    exports.equals = equals;
    function approximatelyEquals(extent1, extent2, tolerance) {
        return (Math.abs(extent1[0] - extent2[0]) < tolerance &&
            Math.abs(extent1[2] - extent2[2]) < tolerance &&
            Math.abs(extent1[1] - extent2[1]) < tolerance &&
            Math.abs(extent1[3] - extent2[3]) < tolerance);
    }
    exports.approximatelyEquals = approximatelyEquals;
    function extend(extent1, extent2) {
        if (extent2[0] < extent1[0]) {
            extent1[0] = extent2[0];
        }
        if (extent2[2] > extent1[2]) {
            extent1[2] = extent2[2];
        }
        if (extent2[1] < extent1[1]) {
            extent1[1] = extent2[1];
        }
        if (extent2[3] > extent1[3]) {
            extent1[3] = extent2[3];
        }
        return extent1;
    }
    exports.extend = extend;
    function extendCoordinate(extent, coordinate) {
        if (coordinate[0] < extent[0]) {
            extent[0] = coordinate[0];
        }
        if (coordinate[0] > extent[2]) {
            extent[2] = coordinate[0];
        }
        if (coordinate[1] < extent[1]) {
            extent[1] = coordinate[1];
        }
        if (coordinate[1] > extent[3]) {
            extent[3] = coordinate[1];
        }
    }
    exports.extendCoordinate = extendCoordinate;
    function extendCoordinates(extent, coordinates) {
        for (let i = 0, ii = coordinates.length; i < ii; ++i) {
            extendCoordinate(extent, coordinates[i]);
        }
        return extent;
    }
    exports.extendCoordinates = extendCoordinates;
    function extendFlatCoordinates(extent, flatCoordinates, offset, end, stride) {
        for (; offset < end; offset += stride) {
            extendXY(extent, flatCoordinates[offset], flatCoordinates[offset + 1]);
        }
        return extent;
    }
    exports.extendFlatCoordinates = extendFlatCoordinates;
    function extendRings(extent, rings) {
        for (let i = 0, ii = rings.length; i < ii; ++i) {
            extendCoordinates(extent, rings[i]);
        }
        return extent;
    }
    exports.extendRings = extendRings;
    function extendXY(extent, x, y) {
        extent[0] = Math.min(extent[0], x);
        extent[1] = Math.min(extent[1], y);
        extent[2] = Math.max(extent[2], x);
        extent[3] = Math.max(extent[3], y);
    }
    exports.extendXY = extendXY;
    function forEachCorner(extent, callback) {
        let val;
        val = callback(getBottomLeft(extent));
        if (val) {
            return val;
        }
        val = callback(getBottomRight(extent));
        if (val) {
            return val;
        }
        val = callback(getTopRight(extent));
        if (val) {
            return val;
        }
        val = callback(getTopLeft(extent));
        if (val) {
            return val;
        }
        return false;
    }
    exports.forEachCorner = forEachCorner;
    function getArea(extent) {
        let area = 0;
        if (!isEmpty(extent)) {
            area = getWidth(extent) * getHeight(extent);
        }
        return area;
    }
    exports.getArea = getArea;
    function getBottomLeft(extent) {
        return [extent[0], extent[1]];
    }
    exports.getBottomLeft = getBottomLeft;
    function getBottomRight(extent) {
        return [extent[2], extent[1]];
    }
    exports.getBottomRight = getBottomRight;
    function getCenter(extent) {
        return [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
    }
    exports.getCenter = getCenter;
    function getCorner(extent, corner) {
        let coordinate;
        if (corner === Corner_js_1.default.BOTTOM_LEFT) {
            coordinate = getBottomLeft(extent);
        }
        else if (corner === Corner_js_1.default.BOTTOM_RIGHT) {
            coordinate = getBottomRight(extent);
        }
        else if (corner === Corner_js_1.default.TOP_LEFT) {
            coordinate = getTopLeft(extent);
        }
        else if (corner === Corner_js_1.default.TOP_RIGHT) {
            coordinate = getTopRight(extent);
        }
        else {
            asserts_js_3.assert(false, 13);
        }
        return coordinate;
    }
    exports.getCorner = getCorner;
    function getEnlargedArea(extent1, extent2) {
        const minX = Math.min(extent1[0], extent2[0]);
        const minY = Math.min(extent1[1], extent2[1]);
        const maxX = Math.max(extent1[2], extent2[2]);
        const maxY = Math.max(extent1[3], extent2[3]);
        return (maxX - minX) * (maxY - minY);
    }
    exports.getEnlargedArea = getEnlargedArea;
    function getForViewAndSize(center, resolution, rotation, size, opt_extent) {
        const dx = (resolution * size[0]) / 2;
        const dy = (resolution * size[1]) / 2;
        const cosRotation = Math.cos(rotation);
        const sinRotation = Math.sin(rotation);
        const xCos = dx * cosRotation;
        const xSin = dx * sinRotation;
        const yCos = dy * cosRotation;
        const ySin = dy * sinRotation;
        const x = center[0];
        const y = center[1];
        const x0 = x - xCos + ySin;
        const x1 = x - xCos - ySin;
        const x2 = x + xCos - ySin;
        const x3 = x + xCos + ySin;
        const y0 = y - xSin - yCos;
        const y1 = y - xSin + yCos;
        const y2 = y + xSin + yCos;
        const y3 = y + xSin - yCos;
        return createOrUpdate(Math.min(x0, x1, x2, x3), Math.min(y0, y1, y2, y3), Math.max(x0, x1, x2, x3), Math.max(y0, y1, y2, y3), opt_extent);
    }
    exports.getForViewAndSize = getForViewAndSize;
    function getHeight(extent) {
        return extent[3] - extent[1];
    }
    exports.getHeight = getHeight;
    function getIntersectionArea(extent1, extent2) {
        const intersection = getIntersection(extent1, extent2);
        return getArea(intersection);
    }
    exports.getIntersectionArea = getIntersectionArea;
    function getIntersection(extent1, extent2, opt_extent) {
        const intersection = opt_extent ? opt_extent : createEmpty();
        if (intersects(extent1, extent2)) {
            if (extent1[0] > extent2[0]) {
                intersection[0] = extent1[0];
            }
            else {
                intersection[0] = extent2[0];
            }
            if (extent1[1] > extent2[1]) {
                intersection[1] = extent1[1];
            }
            else {
                intersection[1] = extent2[1];
            }
            if (extent1[2] < extent2[2]) {
                intersection[2] = extent1[2];
            }
            else {
                intersection[2] = extent2[2];
            }
            if (extent1[3] < extent2[3]) {
                intersection[3] = extent1[3];
            }
            else {
                intersection[3] = extent2[3];
            }
        }
        else {
            createOrUpdateEmpty(intersection);
        }
        return intersection;
    }
    exports.getIntersection = getIntersection;
    function getMargin(extent) {
        return getWidth(extent) + getHeight(extent);
    }
    exports.getMargin = getMargin;
    function getSize(extent) {
        return [extent[2] - extent[0], extent[3] - extent[1]];
    }
    exports.getSize = getSize;
    function getTopLeft(extent) {
        return [extent[0], extent[3]];
    }
    exports.getTopLeft = getTopLeft;
    function getTopRight(extent) {
        return [extent[2], extent[3]];
    }
    exports.getTopRight = getTopRight;
    function getWidth(extent) {
        return extent[2] - extent[0];
    }
    exports.getWidth = getWidth;
    function intersects(extent1, extent2) {
        return (extent1[0] <= extent2[2] &&
            extent1[2] >= extent2[0] &&
            extent1[1] <= extent2[3] &&
            extent1[3] >= extent2[1]);
    }
    exports.intersects = intersects;
    function isEmpty(extent) {
        return extent[2] < extent[0] || extent[3] < extent[1];
    }
    exports.isEmpty = isEmpty;
    function returnOrUpdate(extent, opt_extent) {
        if (opt_extent) {
            opt_extent[0] = extent[0];
            opt_extent[1] = extent[1];
            opt_extent[2] = extent[2];
            opt_extent[3] = extent[3];
            return opt_extent;
        }
        else {
            return extent;
        }
    }
    exports.returnOrUpdate = returnOrUpdate;
    function scaleFromCenter(extent, value) {
        const deltaX = ((extent[2] - extent[0]) / 2) * (value - 1);
        const deltaY = ((extent[3] - extent[1]) / 2) * (value - 1);
        extent[0] -= deltaX;
        extent[2] += deltaX;
        extent[1] -= deltaY;
        extent[3] += deltaY;
    }
    exports.scaleFromCenter = scaleFromCenter;
    function intersectsSegment(extent, start, end) {
        let intersects = false;
        const startRel = coordinateRelationship(extent, start);
        const endRel = coordinateRelationship(extent, end);
        if (startRel === Relationship_js_1.default.INTERSECTING ||
            endRel === Relationship_js_1.default.INTERSECTING) {
            intersects = true;
        }
        else {
            const minX = extent[0];
            const minY = extent[1];
            const maxX = extent[2];
            const maxY = extent[3];
            const startX = start[0];
            const startY = start[1];
            const endX = end[0];
            const endY = end[1];
            const slope = (endY - startY) / (endX - startX);
            let x, y;
            if (!!(endRel & Relationship_js_1.default.ABOVE) && !(startRel & Relationship_js_1.default.ABOVE)) {
                x = endX - (endY - maxY) / slope;
                intersects = x >= minX && x <= maxX;
            }
            if (!intersects &&
                !!(endRel & Relationship_js_1.default.RIGHT) &&
                !(startRel & Relationship_js_1.default.RIGHT)) {
                y = endY - (endX - maxX) * slope;
                intersects = y >= minY && y <= maxY;
            }
            if (!intersects &&
                !!(endRel & Relationship_js_1.default.BELOW) &&
                !(startRel & Relationship_js_1.default.BELOW)) {
                x = endX - (endY - minY) / slope;
                intersects = x >= minX && x <= maxX;
            }
            if (!intersects &&
                !!(endRel & Relationship_js_1.default.LEFT) &&
                !(startRel & Relationship_js_1.default.LEFT)) {
                y = endY - (endX - minX) * slope;
                intersects = y >= minY && y <= maxY;
            }
        }
        return intersects;
    }
    exports.intersectsSegment = intersectsSegment;
    function applyTransform(extent, transformFn, opt_extent, opt_stops) {
        let coordinates = [];
        if (opt_stops > 1) {
            const width = extent[2] - extent[0];
            const height = extent[3] - extent[1];
            for (let i = 0; i < opt_stops; ++i) {
                coordinates.push(extent[0] + (width * i) / opt_stops, extent[1], extent[2], extent[1] + (height * i) / opt_stops, extent[2] - (width * i) / opt_stops, extent[3], extent[0], extent[3] - (height * i) / opt_stops);
            }
        }
        else {
            coordinates = [
                extent[0],
                extent[1],
                extent[2],
                extent[1],
                extent[2],
                extent[3],
                extent[0],
                extent[3],
            ];
        }
        transformFn(coordinates, coordinates, 2);
        const xs = [];
        const ys = [];
        for (let i = 0, l = coordinates.length; i < l; i += 2) {
            xs.push(coordinates[i]);
            ys.push(coordinates[i + 1]);
        }
        return _boundingExtentXYs(xs, ys, opt_extent);
    }
    exports.applyTransform = applyTransform;
    function wrapX(extent, projection) {
        const projectionExtent = projection.getExtent();
        const center = getCenter(extent);
        if (projection.canWrapX() &&
            (center[0] < projectionExtent[0] || center[0] >= projectionExtent[2])) {
            const worldWidth = getWidth(projectionExtent);
            const worldsAway = Math.floor((center[0] - projectionExtent[0]) / worldWidth);
            const offset = worldsAway * worldWidth;
            extent[0] -= offset;
            extent[2] -= offset;
        }
        return extent;
    }
    exports.wrapX = wrapX;
});
define("poc/index", ["require", "exports", "node_modules/ol/src/extent"], function (require, exports, extent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TileTree = void 0;
    function explode(extent) {
        const [xmin, ymin, xmax, ymax] = extent;
        const [w, h] = [xmax - xmin, ymax - ymin];
        const [xmid, ymid] = [xmin + w / 2, ymin + h / 2];
        return { xmin, ymin, xmax, ymax, w, h, xmid, ymid };
    }
    const TINY = 0.0000001;
    function isInt(value) {
        return TINY > Math.abs(value % 1);
    }
    function isEq(v1, v2) {
        return TINY > Math.abs(v1 - v2);
    }
    class TileTree {
        constructor(options) {
            this.root = this.asTileNode(options.extent);
        }
        asTileNode(extent) {
            return { extent, quad: [null, null, null, null] };
        }
        findByPoint(args, root = this.root) {
            const { point, zoom: depth } = args;
            const [x, y] = point;
            if (depth < 0)
                throw "invalid depth";
            if (!extent_1.containsXY(root.extent, x, y)) {
                throw "point is outside of extent";
            }
            if (0 === depth)
                return root;
            const rootInfo = explode(root.extent);
            const isRightQuad = x >= rootInfo.xmid;
            const isTopQuad = y >= rootInfo.ymid;
            const quadIndex = (isTopQuad ? 2 : 0) + (isRightQuad ? 1 : 0);
            if (null === root.quad[quadIndex]) {
                this.defineAllQuads(root);
            }
            return this.findByPoint({ point, zoom: depth - 1 }, root.quad[quadIndex]);
        }
        defineAllQuads(root) {
            const rootInfo = explode(root.extent);
            for (let i = 0; i < 4; i++) {
                if (root.quad[i])
                    break;
                const isTop = 2 === (i & 2);
                const isRight = 1 === (i & 1);
                root.quad[i] = this.asTileNode([
                    !isRight ? rootInfo.xmin : rootInfo.xmid,
                    !isTop ? rootInfo.ymin : rootInfo.ymid,
                    !isRight ? rootInfo.xmid : rootInfo.xmax,
                    !isTop ? rootInfo.ymid : rootInfo.ymax,
                ]);
            }
        }
        find(extent) {
            if (!extent_1.containsExtent(this.root.extent, extent))
                throw "extent is out-of-bounds";
            const info = explode(extent);
            if (info.w !== info.h)
                throw "not square";
            if (isEq(info.w, 0))
                throw "too small";
            const rootInfo = explode(this.root.extent);
            if (!isInt(Math.log2(rootInfo.w / info.w)))
                throw "wrong power";
            return this.findNode(this.root, this.asTileNode(extent));
        }
        findNode(root, child) {
            console.log("findNode", root, child);
            const info = explode(child.extent);
            const rootInfo = explode(root.extent);
            if (!extent_1.containsExtent(root.extent, child.extent)) {
                if (info.xmin < rootInfo.xmin)
                    throw "xmin too small";
                if (info.ymin < rootInfo.ymin)
                    throw "ymin too small";
                if (info.xmax > rootInfo.xmax)
                    throw "xmax too large";
                if (info.ymax > rootInfo.ymax)
                    throw "ymax too large";
            }
            if (isEq(info.w, rootInfo.w))
                return root;
            const isLeftQuad = info.xmin < rootInfo.xmid ? 1 : 0;
            const isBottomQuad = info.ymin < rootInfo.ymid ? 1 : 0;
            const quadIndex = (1 - isLeftQuad) * 1 + (1 - isBottomQuad) * 2;
            if (!root.quad[quadIndex]) {
                const subExtent = [
                    isLeftQuad ? rootInfo.xmin : rootInfo.xmid,
                    isBottomQuad ? rootInfo.ymin : rootInfo.ymid,
                    isLeftQuad ? rootInfo.xmid : rootInfo.xmax,
                    isBottomQuad ? rootInfo.ymid : rootInfo.ymax,
                ];
                root.quad[quadIndex] = this.asTileNode(subExtent);
            }
            return this.findNode(root.quad[quadIndex], child);
        }
    }
    exports.TileTree = TileTree;
});
define("index", ["require", "exports", "mocha", "chai", "node_modules/ol/src/proj", "poc/index"], function (require, exports, mocha_1, chai_1, proj_1, index_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const TINY = 0.0000001;
    function isEq(v1, v2) {
        return TINY > Math.abs(v1 - v2);
    }
    function visit(root, cb, init) {
        let result = cb(init, root);
        root.quad
            .filter((q) => !!q)
            .forEach((q) => {
            result = visit(q, cb, result);
        });
        return result;
    }
    mocha_1.describe("TileTree Tests", () => {
        mocha_1.it("creates a tile tree", () => {
            const extent = [0, 0, 10, 10];
            const tree = new index_1.TileTree({ extent });
            const root = tree.find(extent);
            chai_1.assert.isTrue(isEq(extent[0], root.extent[0]));
        });
        mocha_1.it("inserts an extent outside of the bounds of the current tree", () => {
            const extent = [0, 0, 1, 1];
            const tree = new index_1.TileTree({ extent });
            chai_1.assert.throws(() => tree.find([1, 1, 2, 2]), "extent is out-of-bounds");
            chai_1.assert.throws(() => tree.find([0.1, 0.1, 0.9, 1.00001]), "extent is out-of-bounds");
        });
        mocha_1.it("inserts an extent that misaligns to the established scale", () => {
            const extent = [0, 0, 1, 1];
            const tree = new index_1.TileTree({ extent });
            chai_1.assert.throws(() => tree.find([0, 0, 0.4, 0.4]), "wrong power");
            chai_1.assert.throws(() => tree.find([0, 0, 0.5, 0.4]), "not square");
            chai_1.assert.throws(() => {
                tree.find([0.1, 0, 0.6, 0.5]);
            }, "xmax too large");
        });
        mocha_1.it("inserts a valid extent into the 4 quadrants", () => {
            const extent = [0, 0, 1, 1];
            const tree = new index_1.TileTree({ extent });
            const result1 = tree.find([0, 0, 0.5, 0.5]);
            chai_1.assert.isTrue(result1.quad.every((q) => q === null));
            const q0 = tree.find([0, 0, 0.25, 0.25]);
            const q1 = tree.find([0.25, 0, 0.5, 0.25]);
            const q2 = tree.find([0, 0.25, 0.25, 0.5]);
            const q3 = tree.find([0.25, 0.25, 0.5, 0.5]);
            console.log(result1);
            chai_1.assert.equal(q0, result1.quad[0], "quad0");
            chai_1.assert.equal(q1, result1.quad[1], "quad1");
            chai_1.assert.equal(q2, result1.quad[2], "quad2");
            chai_1.assert.equal(q3, result1.quad[3], "quad3");
        });
        mocha_1.it("attaches data to the nodes", () => {
            const extent = [0, 0, 1, 1];
            const tree = new index_1.TileTree({ extent });
            const root = tree.find(extent);
            const q0 = tree.find([0, 0, 0.25, 0.25]);
            const q1 = tree.find([0.25, 0, 0.5, 0.25]);
            const q2 = tree.find([0, 0.25, 0.25, 0.5]);
            const q3 = tree.find([0.25, 0.25, 0.5, 0.5]);
            q0.count = 1;
            q1.count = 2;
            q2.count = 4;
            q3.count = 8;
            const totalCount = visit(root, (a, b) => a + (b === null || b === void 0 ? void 0 : b.count) || 0, 0);
            chai_1.assert.equal(totalCount, 15);
        });
        mocha_1.it("uses 3857 to find a tile for a given depth and coordinate", () => {
            const extent = proj_1.get("EPSG:3857").getExtent();
            const tree = new index_1.TileTree({ extent });
            const q0 = tree.findByPoint({ zoom: 3, point: [-1, -1] });
            const q1 = tree.findByPoint({ zoom: 3, point: [1, -1] });
            const q2 = tree.findByPoint({ zoom: 3, point: [-1, 1] });
            const q3 = tree.findByPoint({ zoom: 3, point: [1, 1] });
            const size = -5009377.085697311;
            chai_1.assert.equal(q0.extent[0], size, "q0.x");
            chai_1.assert.equal(q1.extent[0], 0, "q1.x");
            chai_1.assert.equal(q2.extent[0], size, "q2.x");
            chai_1.assert.equal(q3.extent[0], 0, "q3.x");
            chai_1.assert.equal(q0.extent[1], size, "q0.y");
            chai_1.assert.equal(q1.extent[1], size, "q1.y");
            chai_1.assert.equal(q2.extent[1], 0, "q2.y");
            chai_1.assert.equal(q3.extent[1], 0, "q3.y");
        });
    });
});
//# sourceMappingURL=index.js.map