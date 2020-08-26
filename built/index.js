var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    const TINY = 0.00000001;
    function isInt(value) {
        return TINY > Math.abs(value - Math.round(value));
    }
    function isEq(v1, v2) {
        return TINY > Math.abs(v1 - v2);
    }
    function isLt(v1, v2) {
        return TINY < v2 - v1;
    }
    function isGt(v1, v2) {
        return TINY < v1 - v2;
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
            const info = explode(extent);
            const rootInfo = explode(this.root.extent);
            if (!extent_1.containsExtent(this.root.extent, extent)) {
                if (isLt(info.xmin, rootInfo.xmin))
                    throw "xmin too small";
                if (isLt(info.ymin, rootInfo.ymin))
                    throw "ymin too small";
                if (isGt(info.xmax, rootInfo.xmax))
                    throw `xmax too large: ${info.xmax} > ${rootInfo.xmax}`;
                if (isGt(info.ymax, rootInfo.ymax))
                    throw "ymax too large";
            }
            if (!isEq(info.w, info.h))
                throw "not square";
            if (isEq(info.w, 0))
                throw "too small";
            if (!isInt(Math.log2(rootInfo.w / info.w))) {
                throw "wrong power";
            }
            return this.findNode(this.root, this.asTileNode(extent));
        }
        findNode(root, child) {
            const info = explode(child.extent);
            const rootInfo = explode(root.extent);
            if (!extent_1.containsExtent(root.extent, child.extent)) {
                if (isLt(info.xmin, rootInfo.xmin))
                    throw "xmin too small";
                if (isLt(info.ymin, rootInfo.ymin))
                    throw "ymin too small";
                if (isGt(info.xmax, rootInfo.xmax))
                    throw `xmax too large: ${info.xmax} > ${rootInfo.xmax}`;
                if (isGt(info.ymax, rootInfo.ymax))
                    throw "ymax too large";
            }
            if (isEq(info.w, rootInfo.w))
                return root;
            const isLeftQuad = isLt(info.xmin, rootInfo.xmid) ? 1 : 0;
            const isBottomQuad = isLt(info.ymin, rootInfo.ymid) ? 1 : 0;
            const quadIndex = (1 - isLeftQuad) * 1 + (1 - isBottomQuad) * 2;
            if (!root.quad[quadIndex]) {
                this.defineAllQuads(root);
            }
            return this.findNode(root.quad[quadIndex], child);
        }
    }
    exports.TileTree = TileTree;
});
define("node_modules/ol/src/tilegrid", ["require", "exports", "node_modules/ol/src/extent/Corner", "node_modules/ol/src/tilegrid/TileGrid", "node_modules/ol/src/proj/Units", "node_modules/ol/src/tilegrid/common", "node_modules/ol/src/proj", "node_modules/ol/src/extent", "node_modules/ol/src/size"], function (require, exports, Corner_js_2, TileGrid_js_1, Units_js_6, common_js_2, proj_js_2, extent_js_13, size_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extentFromProjection = exports.createForProjection = exports.createXYZ = exports.createForExtent = exports.wrapX = exports.getForProjection = void 0;
    function getForProjection(projection) {
        let tileGrid = projection.getDefaultTileGrid();
        if (!tileGrid) {
            tileGrid = createForProjection(projection);
            projection.setDefaultTileGrid(tileGrid);
        }
        return tileGrid;
    }
    exports.getForProjection = getForProjection;
    function wrapX(tileGrid, tileCoord, projection) {
        const z = tileCoord[0];
        const center = tileGrid.getTileCoordCenter(tileCoord);
        const projectionExtent = extentFromProjection(projection);
        if (!extent_js_13.containsCoordinate(projectionExtent, center)) {
            const worldWidth = extent_js_13.getWidth(projectionExtent);
            const worldsAway = Math.ceil((projectionExtent[0] - center[0]) / worldWidth);
            center[0] += worldWidth * worldsAway;
            return tileGrid.getTileCoordForCoordAndZ(center, z);
        }
        else {
            return tileCoord;
        }
    }
    exports.wrapX = wrapX;
    function createForExtent(extent, opt_maxZoom, opt_tileSize, opt_corner) {
        const corner = opt_corner !== undefined ? opt_corner : Corner_js_2.default.TOP_LEFT;
        const resolutions = resolutionsFromExtent(extent, opt_maxZoom, opt_tileSize);
        return new TileGrid_js_1.default({
            extent: extent,
            origin: extent_js_13.getCorner(extent, corner),
            resolutions: resolutions,
            tileSize: opt_tileSize,
        });
    }
    exports.createForExtent = createForExtent;
    function createXYZ(opt_options) {
        const xyzOptions = opt_options || {};
        const extent = xyzOptions.extent || proj_js_2.get('EPSG:3857').getExtent();
        const gridOptions = {
            extent: extent,
            minZoom: xyzOptions.minZoom,
            tileSize: xyzOptions.tileSize,
            resolutions: resolutionsFromExtent(extent, xyzOptions.maxZoom, xyzOptions.tileSize, xyzOptions.maxResolution),
        };
        return new TileGrid_js_1.default(gridOptions);
    }
    exports.createXYZ = createXYZ;
    function resolutionsFromExtent(extent, opt_maxZoom, opt_tileSize, opt_maxResolution) {
        const maxZoom = opt_maxZoom !== undefined ? opt_maxZoom : common_js_2.DEFAULT_MAX_ZOOM;
        const height = extent_js_13.getHeight(extent);
        const width = extent_js_13.getWidth(extent);
        const tileSize = size_js_2.toSize(opt_tileSize !== undefined ? opt_tileSize : common_js_2.DEFAULT_TILE_SIZE);
        const maxResolution = opt_maxResolution > 0
            ? opt_maxResolution
            : Math.max(width / tileSize[0], height / tileSize[1]);
        const length = maxZoom + 1;
        const resolutions = new Array(length);
        for (let z = 0; z < length; ++z) {
            resolutions[z] = maxResolution / Math.pow(2, z);
        }
        return resolutions;
    }
    function createForProjection(projection, opt_maxZoom, opt_tileSize, opt_corner) {
        const extent = extentFromProjection(projection);
        return createForExtent(extent, opt_maxZoom, opt_tileSize, opt_corner);
    }
    exports.createForProjection = createForProjection;
    function extentFromProjection(projection) {
        projection = proj_js_2.get(projection);
        let extent = projection.getExtent();
        if (!extent) {
            const half = (180 * proj_js_2.METERS_PER_UNIT[Units_js_6.default.DEGREES]) / projection.getMetersPerUnit();
            extent = extent_js_13.createOrUpdate(-half, -half, half, half);
        }
        return extent;
    }
    exports.extentFromProjection = extentFromProjection;
});
define("node_modules/ol/src/loadingstrategy", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.tile = exports.bbox = exports.all = void 0;
    function all(extent, resolution) {
        return [[-Infinity, -Infinity, Infinity, Infinity]];
    }
    exports.all = all;
    function bbox(extent, resolution) {
        return [extent];
    }
    exports.bbox = bbox;
    function tile(tileGrid) {
        return (function (extent, resolution) {
            const z = tileGrid.getZForResolution(resolution);
            const tileRange = tileGrid.getTileRangeForExtentAndZ(extent, z);
            const extents = [];
            const tileCoord = [z, 0, 0];
            for (tileCoord[1] = tileRange.minX; tileCoord[1] <= tileRange.maxX; ++tileCoord[1]) {
                for (tileCoord[2] = tileRange.minY; tileCoord[2] <= tileRange.maxY; ++tileCoord[2]) {
                    extents.push(tileGrid.getTileCoordExtent(tileCoord));
                }
            }
            return extents;
        });
    }
    exports.tile = tile;
});
define("node_modules/ol/src/CollectionEventType", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        ADD: 'add',
        REMOVE: 'remove',
    };
});
define("node_modules/ol/src/Collection", ["require", "exports", "node_modules/ol/src/AssertionError", "node_modules/ol/src/Object", "node_modules/ol/src/CollectionEventType", "node_modules/ol/src/events/Event"], function (require, exports, AssertionError_js_2, Object_js_2, CollectionEventType_js_1, Event_js_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CollectionEvent = void 0;
    const Property = {
        LENGTH: 'length',
    };
    class CollectionEvent extends Event_js_3.default {
        constructor(type, opt_element, opt_index) {
            super(type);
            this.element = opt_element;
            this.index = opt_index;
        }
    }
    exports.CollectionEvent = CollectionEvent;
    class Collection extends Object_js_2.default {
        constructor(opt_array, opt_options) {
            super();
            const options = opt_options || {};
            this.unique_ = !!options.unique;
            this.array_ = opt_array ? opt_array : [];
            if (this.unique_) {
                for (let i = 0, ii = this.array_.length; i < ii; ++i) {
                    this.assertUnique_(this.array_[i], i);
                }
            }
            this.updateLength_();
        }
        clear() {
            while (this.getLength() > 0) {
                this.pop();
            }
        }
        extend(arr) {
            for (let i = 0, ii = arr.length; i < ii; ++i) {
                this.push(arr[i]);
            }
            return this;
        }
        forEach(f) {
            const array = this.array_;
            for (let i = 0, ii = array.length; i < ii; ++i) {
                f(array[i], i, array);
            }
        }
        getArray() {
            return this.array_;
        }
        item(index) {
            return this.array_[index];
        }
        getLength() {
            return this.get(Property.LENGTH);
        }
        insertAt(index, elem) {
            if (this.unique_) {
                this.assertUnique_(elem);
            }
            this.array_.splice(index, 0, elem);
            this.updateLength_();
            this.dispatchEvent(new CollectionEvent(CollectionEventType_js_1.default.ADD, elem, index));
        }
        pop() {
            return this.removeAt(this.getLength() - 1);
        }
        push(elem) {
            if (this.unique_) {
                this.assertUnique_(elem);
            }
            const n = this.getLength();
            this.insertAt(n, elem);
            return this.getLength();
        }
        remove(elem) {
            const arr = this.array_;
            for (let i = 0, ii = arr.length; i < ii; ++i) {
                if (arr[i] === elem) {
                    return this.removeAt(i);
                }
            }
            return undefined;
        }
        removeAt(index) {
            const prev = this.array_[index];
            this.array_.splice(index, 1);
            this.updateLength_();
            this.dispatchEvent(new CollectionEvent(CollectionEventType_js_1.default.REMOVE, prev, index));
            return prev;
        }
        setAt(index, elem) {
            const n = this.getLength();
            if (index < n) {
                if (this.unique_) {
                    this.assertUnique_(elem, index);
                }
                const prev = this.array_[index];
                this.array_[index] = elem;
                this.dispatchEvent(new CollectionEvent(CollectionEventType_js_1.default.REMOVE, prev, index));
                this.dispatchEvent(new CollectionEvent(CollectionEventType_js_1.default.ADD, elem, index));
            }
            else {
                for (let j = n; j < index; ++j) {
                    this.insertAt(j, undefined);
                }
                this.insertAt(index, elem);
            }
        }
        updateLength_() {
            this.set(Property.LENGTH, this.array_.length);
        }
        assertUnique_(elem, opt_except) {
            for (let i = 0, ii = this.array_.length; i < ii; ++i) {
                if (this.array_[i] === elem && i !== opt_except) {
                    throw new AssertionError_js_2.default(58);
                }
            }
        }
    }
    exports.default = Collection;
});
define("node_modules/quickselect/index", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function quickselect(arr, k, left, right, compare) {
        quickselectStep(arr, k, left || 0, right || (arr.length - 1), compare || defaultCompare);
    }
    exports.default = quickselect;
    function quickselectStep(arr, k, left, right, compare) {
        while (right > left) {
            if (right - left > 600) {
                var n = right - left + 1;
                var m = k - left + 1;
                var z = Math.log(n);
                var s = 0.5 * Math.exp(2 * z / 3);
                var sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
                var newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
                var newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
                quickselectStep(arr, k, newLeft, newRight, compare);
            }
            var t = arr[k];
            var i = left;
            var j = right;
            swap(arr, left, k);
            if (compare(arr[right], t) > 0)
                swap(arr, left, right);
            while (i < j) {
                swap(arr, i, j);
                i++;
                j--;
                while (compare(arr[i], t) < 0)
                    i++;
                while (compare(arr[j], t) > 0)
                    j--;
            }
            if (compare(arr[left], t) === 0)
                swap(arr, left, j);
            else {
                j++;
                swap(arr, j, right);
            }
            if (j <= k)
                left = j + 1;
            if (k <= j)
                right = j - 1;
        }
    }
    function swap(arr, i, j) {
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
    function defaultCompare(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    }
});
define("node_modules/rbush/index", ["require", "exports", "node_modules/quickselect/index"], function (require, exports, quickselect_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RBush {
        constructor(maxEntries = 9) {
            this._maxEntries = Math.max(4, maxEntries);
            this._minEntries = Math.max(2, Math.ceil(this._maxEntries * 0.4));
            this.clear();
        }
        all() {
            return this._all(this.data, []);
        }
        search(bbox) {
            let node = this.data;
            const result = [];
            if (!intersects(bbox, node))
                return result;
            const toBBox = this.toBBox;
            const nodesToSearch = [];
            while (node) {
                for (let i = 0; i < node.children.length; i++) {
                    const child = node.children[i];
                    const childBBox = node.leaf ? toBBox(child) : child;
                    if (intersects(bbox, childBBox)) {
                        if (node.leaf)
                            result.push(child);
                        else if (contains(bbox, childBBox))
                            this._all(child, result);
                        else
                            nodesToSearch.push(child);
                    }
                }
                node = nodesToSearch.pop();
            }
            return result;
        }
        collides(bbox) {
            let node = this.data;
            if (!intersects(bbox, node))
                return false;
            const nodesToSearch = [];
            while (node) {
                for (let i = 0; i < node.children.length; i++) {
                    const child = node.children[i];
                    const childBBox = node.leaf ? this.toBBox(child) : child;
                    if (intersects(bbox, childBBox)) {
                        if (node.leaf || contains(bbox, childBBox))
                            return true;
                        nodesToSearch.push(child);
                    }
                }
                node = nodesToSearch.pop();
            }
            return false;
        }
        load(data) {
            if (!(data && data.length))
                return this;
            if (data.length < this._minEntries) {
                for (let i = 0; i < data.length; i++) {
                    this.insert(data[i]);
                }
                return this;
            }
            let node = this._build(data.slice(), 0, data.length - 1, 0);
            if (!this.data.children.length) {
                this.data = node;
            }
            else if (this.data.height === node.height) {
                this._splitRoot(this.data, node);
            }
            else {
                if (this.data.height < node.height) {
                    const tmpNode = this.data;
                    this.data = node;
                    node = tmpNode;
                }
                this._insert(node, this.data.height - node.height - 1, true);
            }
            return this;
        }
        insert(item) {
            if (item)
                this._insert(item, this.data.height - 1);
            return this;
        }
        clear() {
            this.data = createNode([]);
            return this;
        }
        remove(item, equalsFn) {
            if (!item)
                return this;
            let node = this.data;
            const bbox = this.toBBox(item);
            const path = [];
            const indexes = [];
            let i, parent, goingUp;
            while (node || path.length) {
                if (!node) {
                    node = path.pop();
                    parent = path[path.length - 1];
                    i = indexes.pop();
                    goingUp = true;
                }
                if (node.leaf) {
                    const index = findItem(item, node.children, equalsFn);
                    if (index !== -1) {
                        node.children.splice(index, 1);
                        path.push(node);
                        this._condense(path);
                        return this;
                    }
                }
                if (!goingUp && !node.leaf && contains(node, bbox)) {
                    path.push(node);
                    indexes.push(i);
                    i = 0;
                    parent = node;
                    node = node.children[0];
                }
                else if (parent) {
                    i++;
                    node = parent.children[i];
                    goingUp = false;
                }
                else
                    node = null;
            }
            return this;
        }
        toBBox(item) { return item; }
        compareMinX(a, b) { return a.minX - b.minX; }
        compareMinY(a, b) { return a.minY - b.minY; }
        toJSON() { return this.data; }
        fromJSON(data) {
            this.data = data;
            return this;
        }
        _all(node, result) {
            const nodesToSearch = [];
            while (node) {
                if (node.leaf)
                    result.push(...node.children);
                else
                    nodesToSearch.push(...node.children);
                node = nodesToSearch.pop();
            }
            return result;
        }
        _build(items, left, right, height) {
            const N = right - left + 1;
            let M = this._maxEntries;
            let node;
            if (N <= M) {
                node = createNode(items.slice(left, right + 1));
                calcBBox(node, this.toBBox);
                return node;
            }
            if (!height) {
                height = Math.ceil(Math.log(N) / Math.log(M));
                M = Math.ceil(N / Math.pow(M, height - 1));
            }
            node = createNode([]);
            node.leaf = false;
            node.height = height;
            const N2 = Math.ceil(N / M);
            const N1 = N2 * Math.ceil(Math.sqrt(M));
            multiSelect(items, left, right, N1, this.compareMinX);
            for (let i = left; i <= right; i += N1) {
                const right2 = Math.min(i + N1 - 1, right);
                multiSelect(items, i, right2, N2, this.compareMinY);
                for (let j = i; j <= right2; j += N2) {
                    const right3 = Math.min(j + N2 - 1, right2);
                    node.children.push(this._build(items, j, right3, height - 1));
                }
            }
            calcBBox(node, this.toBBox);
            return node;
        }
        _chooseSubtree(bbox, node, level, path) {
            while (true) {
                path.push(node);
                if (node.leaf || path.length - 1 === level)
                    break;
                let minArea = Infinity;
                let minEnlargement = Infinity;
                let targetNode;
                for (let i = 0; i < node.children.length; i++) {
                    const child = node.children[i];
                    const area = bboxArea(child);
                    const enlargement = enlargedArea(bbox, child) - area;
                    if (enlargement < minEnlargement) {
                        minEnlargement = enlargement;
                        minArea = area < minArea ? area : minArea;
                        targetNode = child;
                    }
                    else if (enlargement === minEnlargement) {
                        if (area < minArea) {
                            minArea = area;
                            targetNode = child;
                        }
                    }
                }
                node = targetNode || node.children[0];
            }
            return node;
        }
        _insert(item, level, isNode) {
            const bbox = isNode ? item : this.toBBox(item);
            const insertPath = [];
            const node = this._chooseSubtree(bbox, this.data, level, insertPath);
            node.children.push(item);
            extend(node, bbox);
            while (level >= 0) {
                if (insertPath[level].children.length > this._maxEntries) {
                    this._split(insertPath, level);
                    level--;
                }
                else
                    break;
            }
            this._adjustParentBBoxes(bbox, insertPath, level);
        }
        _split(insertPath, level) {
            const node = insertPath[level];
            const M = node.children.length;
            const m = this._minEntries;
            this._chooseSplitAxis(node, m, M);
            const splitIndex = this._chooseSplitIndex(node, m, M);
            const newNode = createNode(node.children.splice(splitIndex, node.children.length - splitIndex));
            newNode.height = node.height;
            newNode.leaf = node.leaf;
            calcBBox(node, this.toBBox);
            calcBBox(newNode, this.toBBox);
            if (level)
                insertPath[level - 1].children.push(newNode);
            else
                this._splitRoot(node, newNode);
        }
        _splitRoot(node, newNode) {
            this.data = createNode([node, newNode]);
            this.data.height = node.height + 1;
            this.data.leaf = false;
            calcBBox(this.data, this.toBBox);
        }
        _chooseSplitIndex(node, m, M) {
            let index;
            let minOverlap = Infinity;
            let minArea = Infinity;
            for (let i = m; i <= M - m; i++) {
                const bbox1 = distBBox(node, 0, i, this.toBBox);
                const bbox2 = distBBox(node, i, M, this.toBBox);
                const overlap = intersectionArea(bbox1, bbox2);
                const area = bboxArea(bbox1) + bboxArea(bbox2);
                if (overlap < minOverlap) {
                    minOverlap = overlap;
                    index = i;
                    minArea = area < minArea ? area : minArea;
                }
                else if (overlap === minOverlap) {
                    if (area < minArea) {
                        minArea = area;
                        index = i;
                    }
                }
            }
            return index || M - m;
        }
        _chooseSplitAxis(node, m, M) {
            const compareMinX = node.leaf ? this.compareMinX : compareNodeMinX;
            const compareMinY = node.leaf ? this.compareMinY : compareNodeMinY;
            const xMargin = this._allDistMargin(node, m, M, compareMinX);
            const yMargin = this._allDistMargin(node, m, M, compareMinY);
            if (xMargin < yMargin)
                node.children.sort(compareMinX);
        }
        _allDistMargin(node, m, M, compare) {
            node.children.sort(compare);
            const toBBox = this.toBBox;
            const leftBBox = distBBox(node, 0, m, toBBox);
            const rightBBox = distBBox(node, M - m, M, toBBox);
            let margin = bboxMargin(leftBBox) + bboxMargin(rightBBox);
            for (let i = m; i < M - m; i++) {
                const child = node.children[i];
                extend(leftBBox, node.leaf ? toBBox(child) : child);
                margin += bboxMargin(leftBBox);
            }
            for (let i = M - m - 1; i >= m; i--) {
                const child = node.children[i];
                extend(rightBBox, node.leaf ? toBBox(child) : child);
                margin += bboxMargin(rightBBox);
            }
            return margin;
        }
        _adjustParentBBoxes(bbox, path, level) {
            for (let i = level; i >= 0; i--) {
                extend(path[i], bbox);
            }
        }
        _condense(path) {
            for (let i = path.length - 1, siblings; i >= 0; i--) {
                if (path[i].children.length === 0) {
                    if (i > 0) {
                        siblings = path[i - 1].children;
                        siblings.splice(siblings.indexOf(path[i]), 1);
                    }
                    else
                        this.clear();
                }
                else
                    calcBBox(path[i], this.toBBox);
            }
        }
    }
    exports.default = RBush;
    function findItem(item, items, equalsFn) {
        if (!equalsFn)
            return items.indexOf(item);
        for (let i = 0; i < items.length; i++) {
            if (equalsFn(item, items[i]))
                return i;
        }
        return -1;
    }
    function calcBBox(node, toBBox) {
        distBBox(node, 0, node.children.length, toBBox, node);
    }
    function distBBox(node, k, p, toBBox, destNode) {
        if (!destNode)
            destNode = createNode(null);
        destNode.minX = Infinity;
        destNode.minY = Infinity;
        destNode.maxX = -Infinity;
        destNode.maxY = -Infinity;
        for (let i = k; i < p; i++) {
            const child = node.children[i];
            extend(destNode, node.leaf ? toBBox(child) : child);
        }
        return destNode;
    }
    function extend(a, b) {
        a.minX = Math.min(a.minX, b.minX);
        a.minY = Math.min(a.minY, b.minY);
        a.maxX = Math.max(a.maxX, b.maxX);
        a.maxY = Math.max(a.maxY, b.maxY);
        return a;
    }
    function compareNodeMinX(a, b) { return a.minX - b.minX; }
    function compareNodeMinY(a, b) { return a.minY - b.minY; }
    function bboxArea(a) { return (a.maxX - a.minX) * (a.maxY - a.minY); }
    function bboxMargin(a) { return (a.maxX - a.minX) + (a.maxY - a.minY); }
    function enlargedArea(a, b) {
        return (Math.max(b.maxX, a.maxX) - Math.min(b.minX, a.minX)) *
            (Math.max(b.maxY, a.maxY) - Math.min(b.minY, a.minY));
    }
    function intersectionArea(a, b) {
        const minX = Math.max(a.minX, b.minX);
        const minY = Math.max(a.minY, b.minY);
        const maxX = Math.min(a.maxX, b.maxX);
        const maxY = Math.min(a.maxY, b.maxY);
        return Math.max(0, maxX - minX) *
            Math.max(0, maxY - minY);
    }
    function contains(a, b) {
        return a.minX <= b.minX &&
            a.minY <= b.minY &&
            b.maxX <= a.maxX &&
            b.maxY <= a.maxY;
    }
    function intersects(a, b) {
        return b.minX <= a.maxX &&
            b.minY <= a.maxY &&
            b.maxX >= a.minX &&
            b.maxY >= a.minY;
    }
    function createNode(children) {
        return {
            children,
            height: 1,
            leaf: true,
            minX: Infinity,
            minY: Infinity,
            maxX: -Infinity,
            maxY: -Infinity
        };
    }
    function multiSelect(arr, left, right, n, compare) {
        const stack = [left, right];
        while (stack.length) {
            right = stack.pop();
            left = stack.pop();
            if (right - left <= n)
                continue;
            const mid = left + Math.ceil((right - left) / n / 2) * n;
            quickselect_1.default(arr, mid, left, right, compare);
            stack.push(left, mid, mid, right);
        }
    }
});
define("node_modules/ol/src/structs/RBush", ["require", "exports", "node_modules/rbush/index", "node_modules/ol/src/extent", "node_modules/ol/src/util", "node_modules/ol/src/obj"], function (require, exports, rbush_js_1, extent_js_14, util_js_5, obj_js_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RBush {
        constructor(opt_maxEntries) {
            this.rbush_ = new rbush_js_1.default(opt_maxEntries);
            this.items_ = {};
        }
        insert(extent, value) {
            const item = {
                minX: extent[0],
                minY: extent[1],
                maxX: extent[2],
                maxY: extent[3],
                value: value,
            };
            this.rbush_.insert(item);
            this.items_[util_js_5.getUid(value)] = item;
        }
        load(extents, values) {
            const items = new Array(values.length);
            for (let i = 0, l = values.length; i < l; i++) {
                const extent = extents[i];
                const value = values[i];
                const item = {
                    minX: extent[0],
                    minY: extent[1],
                    maxX: extent[2],
                    maxY: extent[3],
                    value: value,
                };
                items[i] = item;
                this.items_[util_js_5.getUid(value)] = item;
            }
            this.rbush_.load(items);
        }
        remove(value) {
            const uid = util_js_5.getUid(value);
            const item = this.items_[uid];
            delete this.items_[uid];
            return this.rbush_.remove(item) !== null;
        }
        update(extent, value) {
            const item = this.items_[util_js_5.getUid(value)];
            const bbox = [item.minX, item.minY, item.maxX, item.maxY];
            if (!extent_js_14.equals(bbox, extent)) {
                this.remove(value);
                this.insert(extent, value);
            }
        }
        getAll() {
            const items = this.rbush_.all();
            return items.map(function (item) {
                return item.value;
            });
        }
        getInExtent(extent) {
            const bbox = {
                minX: extent[0],
                minY: extent[1],
                maxX: extent[2],
                maxY: extent[3],
            };
            const items = this.rbush_.search(bbox);
            return items.map(function (item) {
                return item.value;
            });
        }
        forEach(callback) {
            return this.forEach_(this.getAll(), callback);
        }
        forEachInExtent(extent, callback) {
            return this.forEach_(this.getInExtent(extent), callback);
        }
        forEach_(values, callback) {
            let result;
            for (let i = 0, l = values.length; i < l; i++) {
                result = callback(values[i]);
                if (result) {
                    return result;
                }
            }
            return result;
        }
        isEmpty() {
            return obj_js_5.isEmpty(this.items_);
        }
        clear() {
            this.rbush_.clear();
            this.items_ = {};
        }
        getExtent(opt_extent) {
            const data = this.rbush_.toJSON();
            return extent_js_14.createOrUpdate(data.minX, data.minY, data.maxX, data.maxY, opt_extent);
        }
        concat(rbush) {
            this.rbush_.load(rbush.rbush_.all());
            for (const i in rbush.items_) {
                this.items_[i] = rbush.items_[i];
            }
        }
    }
    exports.default = RBush;
});
define("node_modules/ol/src/source/State", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        UNDEFINED: 'undefined',
        LOADING: 'loading',
        READY: 'ready',
        ERROR: 'error',
    };
});
define("node_modules/ol/src/layer/Property", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        OPACITY: 'opacity',
        VISIBLE: 'visible',
        EXTENT: 'extent',
        Z_INDEX: 'zIndex',
        MAX_RESOLUTION: 'maxResolution',
        MIN_RESOLUTION: 'minResolution',
        MAX_ZOOM: 'maxZoom',
        MIN_ZOOM: 'minZoom',
        SOURCE: 'source',
    };
});
define("node_modules/ol/src/render/EventType", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        PRERENDER: 'prerender',
        POSTRENDER: 'postrender',
        PRECOMPOSE: 'precompose',
        POSTCOMPOSE: 'postcompose',
        RENDERCOMPLETE: 'rendercomplete',
    };
});
define("node_modules/ol/src/ImageState", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        IDLE: 0,
        LOADING: 1,
        LOADED: 2,
        ERROR: 3,
        EMPTY: 4,
    };
});
define("node_modules/ol/src/geom/flat/interpolate", ["require", "exports", "node_modules/ol/src/array", "node_modules/ol/src/math"], function (require, exports, array_js_5, math_js_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.lineStringsCoordinateAtM = exports.lineStringCoordinateAtM = exports.interpolatePoint = void 0;
    function interpolatePoint(flatCoordinates, offset, end, stride, fraction, opt_dest, opt_dimension) {
        let o, t;
        const n = (end - offset) / stride;
        if (n === 1) {
            o = offset;
        }
        else if (n === 2) {
            o = offset;
            t = fraction;
        }
        else if (n !== 0) {
            let x1 = flatCoordinates[offset];
            let y1 = flatCoordinates[offset + 1];
            let length = 0;
            const cumulativeLengths = [0];
            for (let i = offset + stride; i < end; i += stride) {
                const x2 = flatCoordinates[i];
                const y2 = flatCoordinates[i + 1];
                length += Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
                cumulativeLengths.push(length);
                x1 = x2;
                y1 = y2;
            }
            const target = fraction * length;
            const index = array_js_5.binarySearch(cumulativeLengths, target);
            if (index < 0) {
                t =
                    (target - cumulativeLengths[-index - 2]) /
                        (cumulativeLengths[-index - 1] - cumulativeLengths[-index - 2]);
                o = offset + (-index - 2) * stride;
            }
            else {
                o = offset + index * stride;
            }
        }
        const dimension = opt_dimension > 1 ? opt_dimension : 2;
        const dest = opt_dest ? opt_dest : new Array(dimension);
        for (let i = 0; i < dimension; ++i) {
            dest[i] =
                o === undefined
                    ? NaN
                    : t === undefined
                        ? flatCoordinates[o + i]
                        : math_js_10.lerp(flatCoordinates[o + i], flatCoordinates[o + stride + i], t);
        }
        return dest;
    }
    exports.interpolatePoint = interpolatePoint;
    function lineStringCoordinateAtM(flatCoordinates, offset, end, stride, m, extrapolate) {
        if (end == offset) {
            return null;
        }
        let coordinate;
        if (m < flatCoordinates[offset + stride - 1]) {
            if (extrapolate) {
                coordinate = flatCoordinates.slice(offset, offset + stride);
                coordinate[stride - 1] = m;
                return coordinate;
            }
            else {
                return null;
            }
        }
        else if (flatCoordinates[end - 1] < m) {
            if (extrapolate) {
                coordinate = flatCoordinates.slice(end - stride, end);
                coordinate[stride - 1] = m;
                return coordinate;
            }
            else {
                return null;
            }
        }
        if (m == flatCoordinates[offset + stride - 1]) {
            return flatCoordinates.slice(offset, offset + stride);
        }
        let lo = offset / stride;
        let hi = end / stride;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (m < flatCoordinates[(mid + 1) * stride - 1]) {
                hi = mid;
            }
            else {
                lo = mid + 1;
            }
        }
        const m0 = flatCoordinates[lo * stride - 1];
        if (m == m0) {
            return flatCoordinates.slice((lo - 1) * stride, (lo - 1) * stride + stride);
        }
        const m1 = flatCoordinates[(lo + 1) * stride - 1];
        const t = (m - m0) / (m1 - m0);
        coordinate = [];
        for (let i = 0; i < stride - 1; ++i) {
            coordinate.push(math_js_10.lerp(flatCoordinates[(lo - 1) * stride + i], flatCoordinates[lo * stride + i], t));
        }
        coordinate.push(m);
        return coordinate;
    }
    exports.lineStringCoordinateAtM = lineStringCoordinateAtM;
    function lineStringsCoordinateAtM(flatCoordinates, offset, ends, stride, m, extrapolate, interpolate) {
        if (interpolate) {
            return lineStringCoordinateAtM(flatCoordinates, offset, ends[ends.length - 1], stride, m, extrapolate);
        }
        let coordinate;
        if (m < flatCoordinates[stride - 1]) {
            if (extrapolate) {
                coordinate = flatCoordinates.slice(0, stride);
                coordinate[stride - 1] = m;
                return coordinate;
            }
            else {
                return null;
            }
        }
        if (flatCoordinates[flatCoordinates.length - 1] < m) {
            if (extrapolate) {
                coordinate = flatCoordinates.slice(flatCoordinates.length - stride);
                coordinate[stride - 1] = m;
                return coordinate;
            }
            else {
                return null;
            }
        }
        for (let i = 0, ii = ends.length; i < ii; ++i) {
            const end = ends[i];
            if (offset == end) {
                continue;
            }
            if (m < flatCoordinates[offset + stride - 1]) {
                return null;
            }
            else if (m <= flatCoordinates[end - 1]) {
                return lineStringCoordinateAtM(flatCoordinates, offset, end, stride, m, false);
            }
            offset = end;
        }
        return null;
    }
    exports.lineStringsCoordinateAtM = lineStringsCoordinateAtM;
});
define("node_modules/ol/src/geom/flat/center", ["require", "exports", "node_modules/ol/src/extent"], function (require, exports, extent_js_15) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.linearRingss = void 0;
    function linearRingss(flatCoordinates, offset, endss, stride) {
        const flatCenters = [];
        let extent = extent_js_15.createEmpty();
        for (let i = 0, ii = endss.length; i < ii; ++i) {
            const ends = endss[i];
            extent = extent_js_15.createOrUpdateFromFlatCoordinates(flatCoordinates, offset, ends[0], stride);
            flatCenters.push((extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2);
            offset = ends[ends.length - 1];
        }
        return flatCenters;
    }
    exports.linearRingss = linearRingss;
});
define("node_modules/ol/src/render/Feature", ["require", "exports", "node_modules/ol/src/geom/GeometryType", "node_modules/ol/src/transform", "node_modules/ol/src/extent", "node_modules/ol/src/array", "node_modules/ol/src/geom/flat/interiorpoint", "node_modules/ol/src/proj", "node_modules/ol/src/geom/flat/interpolate", "node_modules/ol/src/geom/flat/center", "node_modules/ol/src/geom/flat/transform"], function (require, exports, GeometryType_js_7, transform_js_5, extent_js_16, array_js_6, interiorpoint_js_2, proj_js_3, interpolate_js_1, center_js_1, transform_js_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tmpTransform = transform_js_5.create();
    class RenderFeature {
        constructor(type, flatCoordinates, ends, properties, id) {
            this.extent_;
            this.id_ = id;
            this.type_ = type;
            this.flatCoordinates_ = flatCoordinates;
            this.flatInteriorPoints_ = null;
            this.flatMidpoints_ = null;
            this.ends_ = ends;
            this.properties_ = properties;
        }
        get(key) {
            return this.properties_[key];
        }
        getExtent() {
            if (!this.extent_) {
                this.extent_ =
                    this.type_ === GeometryType_js_7.default.POINT
                        ? extent_js_16.createOrUpdateFromCoordinate(this.flatCoordinates_)
                        : extent_js_16.createOrUpdateFromFlatCoordinates(this.flatCoordinates_, 0, this.flatCoordinates_.length, 2);
            }
            return this.extent_;
        }
        getFlatInteriorPoint() {
            if (!this.flatInteriorPoints_) {
                const flatCenter = extent_js_16.getCenter(this.getExtent());
                this.flatInteriorPoints_ = interiorpoint_js_2.getInteriorPointOfArray(this.flatCoordinates_, 0, (this.ends_), 2, flatCenter, 0);
            }
            return this.flatInteriorPoints_;
        }
        getFlatInteriorPoints() {
            if (!this.flatInteriorPoints_) {
                const flatCenters = center_js_1.linearRingss(this.flatCoordinates_, 0, (this.ends_), 2);
                this.flatInteriorPoints_ = interiorpoint_js_2.getInteriorPointsOfMultiArray(this.flatCoordinates_, 0, (this.ends_), 2, flatCenters);
            }
            return this.flatInteriorPoints_;
        }
        getFlatMidpoint() {
            if (!this.flatMidpoints_) {
                this.flatMidpoints_ = interpolate_js_1.interpolatePoint(this.flatCoordinates_, 0, this.flatCoordinates_.length, 2, 0.5);
            }
            return this.flatMidpoints_;
        }
        getFlatMidpoints() {
            if (!this.flatMidpoints_) {
                this.flatMidpoints_ = [];
                const flatCoordinates = this.flatCoordinates_;
                let offset = 0;
                const ends = (this.ends_);
                for (let i = 0, ii = ends.length; i < ii; ++i) {
                    const end = ends[i];
                    const midpoint = interpolate_js_1.interpolatePoint(flatCoordinates, offset, end, 2, 0.5);
                    array_js_6.extend(this.flatMidpoints_, midpoint);
                    offset = end;
                }
            }
            return this.flatMidpoints_;
        }
        getId() {
            return this.id_;
        }
        getOrientedFlatCoordinates() {
            return this.flatCoordinates_;
        }
        getGeometry() {
            return this;
        }
        getSimplifiedGeometry(squaredTolerance) {
            return this;
        }
        simplifyTransformed(squaredTolerance, opt_transform) {
            return this;
        }
        getProperties() {
            return this.properties_;
        }
        getStride() {
            return 2;
        }
        getStyleFunction() {
            return undefined;
        }
        getType() {
            return this.type_;
        }
        transform(source, destination) {
            source = proj_js_3.get(source);
            const pixelExtent = source.getExtent();
            const projectedExtent = source.getWorldExtent();
            const scale = extent_js_16.getHeight(projectedExtent) / extent_js_16.getHeight(pixelExtent);
            transform_js_5.compose(tmpTransform, projectedExtent[0], projectedExtent[3], scale, -scale, 0, 0, 0);
            transform_js_6.transform2D(this.flatCoordinates_, 0, this.flatCoordinates_.length, 2, tmpTransform, this.flatCoordinates_);
        }
        getEnds() {
            return this.ends_;
        }
    }
    RenderFeature.prototype.getEndss = RenderFeature.prototype.getEnds;
    RenderFeature.prototype.getFlatCoordinates =
        RenderFeature.prototype.getOrientedFlatCoordinates;
    exports.default = RenderFeature;
});
define("node_modules/ol/src/style/Image", ["require", "exports", "node_modules/ol/src/util", "node_modules/ol/src/size"], function (require, exports, util_js_6, size_js_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ImageStyle {
        constructor(options) {
            this.opacity_ = options.opacity;
            this.rotateWithView_ = options.rotateWithView;
            this.rotation_ = options.rotation;
            this.scale_ = options.scale;
            this.scaleArray_ = size_js_3.toSize(options.scale);
            this.displacement_ = options.displacement;
        }
        clone() {
            const scale = this.getScale();
            return new ImageStyle({
                opacity: this.getOpacity(),
                scale: Array.isArray(scale) ? scale.slice() : scale,
                rotation: this.getRotation(),
                rotateWithView: this.getRotateWithView(),
                displacement: this.getDisplacement().slice(),
            });
        }
        getOpacity() {
            return this.opacity_;
        }
        getRotateWithView() {
            return this.rotateWithView_;
        }
        getRotation() {
            return this.rotation_;
        }
        getScale() {
            return this.scale_;
        }
        getScaleArray() {
            return this.scaleArray_;
        }
        getDisplacement() {
            return this.displacement_;
        }
        getAnchor() {
            return util_js_6.abstract();
        }
        getImage(pixelRatio) {
            return util_js_6.abstract();
        }
        getHitDetectionImage() {
            return util_js_6.abstract();
        }
        getPixelRatio(pixelRatio) {
            return 1;
        }
        getImageState() {
            return util_js_6.abstract();
        }
        getImageSize() {
            return util_js_6.abstract();
        }
        getHitDetectionImageSize() {
            return util_js_6.abstract();
        }
        getOrigin() {
            return util_js_6.abstract();
        }
        getSize() {
            return util_js_6.abstract();
        }
        setOpacity(opacity) {
            this.opacity_ = opacity;
        }
        setRotateWithView(rotateWithView) {
            this.rotateWithView_ = rotateWithView;
        }
        setRotation(rotation) {
            this.rotation_ = rotation;
        }
        setScale(scale) {
            this.scale_ = scale;
            this.scaleArray_ = size_js_3.toSize(scale);
        }
        listenImageChange(listener) {
            util_js_6.abstract();
        }
        load() {
            util_js_6.abstract();
        }
        unlistenImageChange(listener) {
            util_js_6.abstract();
        }
    }
    exports.default = ImageStyle;
});
define("node_modules/ol/src/color", ["require", "exports", "node_modules/ol/src/asserts", "node_modules/ol/src/math"], function (require, exports, asserts_js_4, math_js_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isStringColor = exports.toString = exports.normalize = exports.asArray = exports.fromString = exports.asString = void 0;
    const HEX_COLOR_RE_ = /^#([a-f0-9]{3}|[a-f0-9]{4}(?:[a-f0-9]{2}){0,2})$/i;
    const NAMED_COLOR_RE_ = /^([a-z]*)$|^hsla?\(.*\)$/i;
    function asString(color) {
        if (typeof color === 'string') {
            return color;
        }
        else {
            return toString(color);
        }
    }
    exports.asString = asString;
    function fromNamed(color) {
        const el = document.createElement('div');
        el.style.color = color;
        if (el.style.color !== '') {
            document.body.appendChild(el);
            const rgb = getComputedStyle(el).color;
            document.body.removeChild(el);
            return rgb;
        }
        else {
            return '';
        }
    }
    exports.fromString = (function () {
        const MAX_CACHE_SIZE = 1024;
        const cache = {};
        let cacheSize = 0;
        return (function (s) {
            let color;
            if (cache.hasOwnProperty(s)) {
                color = cache[s];
            }
            else {
                if (cacheSize >= MAX_CACHE_SIZE) {
                    let i = 0;
                    for (const key in cache) {
                        if ((i++ & 3) === 0) {
                            delete cache[key];
                            --cacheSize;
                        }
                    }
                }
                color = fromStringInternal_(s);
                cache[s] = color;
                ++cacheSize;
            }
            return color;
        });
    })();
    function asArray(color) {
        if (Array.isArray(color)) {
            return color;
        }
        else {
            return exports.fromString(color);
        }
    }
    exports.asArray = asArray;
    function fromStringInternal_(s) {
        let r, g, b, a, color;
        if (NAMED_COLOR_RE_.exec(s)) {
            s = fromNamed(s);
        }
        if (HEX_COLOR_RE_.exec(s)) {
            const n = s.length - 1;
            let d;
            if (n <= 4) {
                d = 1;
            }
            else {
                d = 2;
            }
            const hasAlpha = n === 4 || n === 8;
            r = parseInt(s.substr(1 + 0 * d, d), 16);
            g = parseInt(s.substr(1 + 1 * d, d), 16);
            b = parseInt(s.substr(1 + 2 * d, d), 16);
            if (hasAlpha) {
                a = parseInt(s.substr(1 + 3 * d, d), 16);
            }
            else {
                a = 255;
            }
            if (d == 1) {
                r = (r << 4) + r;
                g = (g << 4) + g;
                b = (b << 4) + b;
                if (hasAlpha) {
                    a = (a << 4) + a;
                }
            }
            color = [r, g, b, a / 255];
        }
        else if (s.indexOf('rgba(') == 0) {
            color = s.slice(5, -1).split(',').map(Number);
            normalize(color);
        }
        else if (s.indexOf('rgb(') == 0) {
            color = s.slice(4, -1).split(',').map(Number);
            color.push(1);
            normalize(color);
        }
        else {
            asserts_js_4.assert(false, 14);
        }
        return color;
    }
    function normalize(color) {
        color[0] = math_js_11.clamp((color[0] + 0.5) | 0, 0, 255);
        color[1] = math_js_11.clamp((color[1] + 0.5) | 0, 0, 255);
        color[2] = math_js_11.clamp((color[2] + 0.5) | 0, 0, 255);
        color[3] = math_js_11.clamp(color[3], 0, 1);
        return color;
    }
    exports.normalize = normalize;
    function toString(color) {
        let r = color[0];
        if (r != (r | 0)) {
            r = (r + 0.5) | 0;
        }
        let g = color[1];
        if (g != (g | 0)) {
            g = (g + 0.5) | 0;
        }
        let b = color[2];
        if (b != (b | 0)) {
            b = (b + 0.5) | 0;
        }
        const a = color[3] === undefined ? 1 : color[3];
        return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    }
    exports.toString = toString;
    function isStringColor(s) {
        if (NAMED_COLOR_RE_.test(s)) {
            s = fromNamed(s);
        }
        return (HEX_COLOR_RE_.test(s) || s.indexOf('rgba(') === 0 || s.indexOf('rgb(') === 0);
    }
    exports.isStringColor = isStringColor;
});
define("node_modules/ol/src/colorlike", ["require", "exports", "node_modules/ol/src/color"], function (require, exports, color_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.asColorLike = void 0;
    function asColorLike(color) {
        if (Array.isArray(color)) {
            return color_js_1.toString(color);
        }
        else {
            return color;
        }
    }
    exports.asColorLike = asColorLike;
});
define("node_modules/ol/src/has", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PASSIVE_EVENT_LISTENERS = exports.IMAGE_DECODE = exports.WORKER_OFFSCREEN_CANVAS = exports.DEVICE_PIXEL_RATIO = exports.MAC = exports.WEBKIT = exports.SAFARI = exports.FIREFOX = void 0;
    const ua = typeof navigator !== 'undefined' && typeof navigator.userAgent !== 'undefined'
        ? navigator.userAgent.toLowerCase()
        : '';
    exports.FIREFOX = ua.indexOf('firefox') !== -1;
    exports.SAFARI = ua.indexOf('safari') !== -1 && ua.indexOf('chrom') == -1;
    exports.WEBKIT = ua.indexOf('webkit') !== -1 && ua.indexOf('edge') == -1;
    exports.MAC = ua.indexOf('macintosh') !== -1;
    exports.DEVICE_PIXEL_RATIO = typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1;
    exports.WORKER_OFFSCREEN_CANVAS = typeof WorkerGlobalScope !== 'undefined' &&
        typeof OffscreenCanvas !== 'undefined' &&
        self instanceof WorkerGlobalScope;
    exports.IMAGE_DECODE = typeof Image !== 'undefined' && Image.prototype.decode;
    exports.PASSIVE_EVENT_LISTENERS = (function () {
        let passive = false;
        try {
            const options = Object.defineProperty({}, 'passive', {
                get: function () {
                    passive = true;
                },
            });
            window.addEventListener('_', null, options);
            window.removeEventListener('_', null, options);
        }
        catch (error) {
        }
        return passive;
    })();
});
define("node_modules/ol/src/dom", ["require", "exports", "node_modules/ol/src/has"], function (require, exports, has_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.replaceChildren = exports.removeChildren = exports.removeNode = exports.replaceNode = exports.outerHeight = exports.outerWidth = exports.createCanvasContext2D = void 0;
    function createCanvasContext2D(opt_width, opt_height, opt_canvasPool) {
        const canvas = opt_canvasPool && opt_canvasPool.length
            ? opt_canvasPool.shift()
            : has_js_1.WORKER_OFFSCREEN_CANVAS
                ? new OffscreenCanvas(opt_width || 300, opt_height || 300)
                : document.createElement('canvas');
        if (opt_width) {
            canvas.width = opt_width;
        }
        if (opt_height) {
            canvas.height = opt_height;
        }
        return (canvas.getContext('2d'));
    }
    exports.createCanvasContext2D = createCanvasContext2D;
    function outerWidth(element) {
        let width = element.offsetWidth;
        const style = getComputedStyle(element);
        width += parseInt(style.marginLeft, 10) + parseInt(style.marginRight, 10);
        return width;
    }
    exports.outerWidth = outerWidth;
    function outerHeight(element) {
        let height = element.offsetHeight;
        const style = getComputedStyle(element);
        height += parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10);
        return height;
    }
    exports.outerHeight = outerHeight;
    function replaceNode(newNode, oldNode) {
        const parent = oldNode.parentNode;
        if (parent) {
            parent.replaceChild(newNode, oldNode);
        }
    }
    exports.replaceNode = replaceNode;
    function removeNode(node) {
        return node && node.parentNode ? node.parentNode.removeChild(node) : null;
    }
    exports.removeNode = removeNode;
    function removeChildren(node) {
        while (node.lastChild) {
            node.removeChild(node.lastChild);
        }
    }
    exports.removeChildren = removeChildren;
    function replaceChildren(node, children) {
        const oldChildren = node.childNodes;
        for (let i = 0; true; ++i) {
            const oldChild = oldChildren[i];
            const newChild = children[i];
            if (!oldChild && !newChild) {
                break;
            }
            if (oldChild === newChild) {
                continue;
            }
            if (!oldChild) {
                node.appendChild(newChild);
                continue;
            }
            if (!newChild) {
                node.removeChild(oldChild);
                --i;
                continue;
            }
            node.insertBefore(newChild, oldChild);
        }
    }
    exports.replaceChildren = replaceChildren;
});
define("node_modules/ol/src/css", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getFontParameters = exports.CLASS_COLLAPSED = exports.CLASS_CONTROL = exports.CLASS_UNSUPPORTED = exports.CLASS_UNSELECTABLE = exports.CLASS_SELECTABLE = exports.CLASS_HIDDEN = void 0;
    exports.CLASS_HIDDEN = 'ol-hidden';
    exports.CLASS_SELECTABLE = 'ol-selectable';
    exports.CLASS_UNSELECTABLE = 'ol-unselectable';
    exports.CLASS_UNSUPPORTED = 'ol-unsupported';
    exports.CLASS_CONTROL = 'ol-control';
    exports.CLASS_COLLAPSED = 'ol-collapsed';
    const fontRegEx = new RegExp([
        '^\\s*(?=(?:(?:[-a-z]+\\s*){0,2}(italic|oblique))?)',
        '(?=(?:(?:[-a-z]+\\s*){0,2}(small-caps))?)',
        '(?=(?:(?:[-a-z]+\\s*){0,2}(bold(?:er)?|lighter|[1-9]00 ))?)',
        '(?:(?:normal|\\1|\\2|\\3)\\s*){0,3}((?:xx?-)?',
        '(?:small|large)|medium|smaller|larger|[\\.\\d]+(?:\\%|in|[cem]m|ex|p[ctx]))',
        '(?:\\s*\\/\\s*(normal|[\\.\\d]+(?:\\%|in|[cem]m|ex|p[ctx])?))',
        '?\\s*([-,\\"\\\'\\sa-z]+?)\\s*$',
    ].join(''), 'i');
    const fontRegExMatchIndex = [
        'style',
        'variant',
        'weight',
        'size',
        'lineHeight',
        'family',
    ];
    exports.getFontParameters = function (fontSpec) {
        const match = fontSpec.match(fontRegEx);
        if (!match) {
            return null;
        }
        const style = ({
            lineHeight: 'normal',
            size: '1.2em',
            style: 'normal',
            weight: 'normal',
            variant: 'normal',
        });
        for (let i = 0, ii = fontRegExMatchIndex.length; i < ii; ++i) {
            const value = match[i + 1];
            if (value !== undefined) {
                style[fontRegExMatchIndex[i]] = value;
            }
        }
        style.families = style.family.split(/,\s?/);
        return style;
    };
});
define("node_modules/ol/src/style/Fill", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Fill {
        constructor(opt_options) {
            const options = opt_options || {};
            this.color_ = options.color !== undefined ? options.color : null;
        }
        clone() {
            const color = this.getColor();
            return new Fill({
                color: Array.isArray(color) ? color.slice() : color || undefined,
            });
        }
        getColor() {
            return this.color_;
        }
        setColor(color) {
            this.color_ = color;
        }
    }
    exports.default = Fill;
});
define("node_modules/ol/src/style/Stroke", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Stroke {
        constructor(opt_options) {
            const options = opt_options || {};
            this.color_ = options.color !== undefined ? options.color : null;
            this.lineCap_ = options.lineCap;
            this.lineDash_ = options.lineDash !== undefined ? options.lineDash : null;
            this.lineDashOffset_ = options.lineDashOffset;
            this.lineJoin_ = options.lineJoin;
            this.miterLimit_ = options.miterLimit;
            this.width_ = options.width;
        }
        clone() {
            const color = this.getColor();
            return new Stroke({
                color: Array.isArray(color) ? color.slice() : color || undefined,
                lineCap: this.getLineCap(),
                lineDash: this.getLineDash() ? this.getLineDash().slice() : undefined,
                lineDashOffset: this.getLineDashOffset(),
                lineJoin: this.getLineJoin(),
                miterLimit: this.getMiterLimit(),
                width: this.getWidth(),
            });
        }
        getColor() {
            return this.color_;
        }
        getLineCap() {
            return this.lineCap_;
        }
        getLineDash() {
            return this.lineDash_;
        }
        getLineDashOffset() {
            return this.lineDashOffset_;
        }
        getLineJoin() {
            return this.lineJoin_;
        }
        getMiterLimit() {
            return this.miterLimit_;
        }
        getWidth() {
            return this.width_;
        }
        setColor(color) {
            this.color_ = color;
        }
        setLineCap(lineCap) {
            this.lineCap_ = lineCap;
        }
        setLineDash(lineDash) {
            this.lineDash_ = lineDash;
        }
        setLineDashOffset(lineDashOffset) {
            this.lineDashOffset_ = lineDashOffset;
        }
        setLineJoin(lineJoin) {
            this.lineJoin_ = lineJoin;
        }
        setMiterLimit(miterLimit) {
            this.miterLimit_ = miterLimit;
        }
        setWidth(width) {
            this.width_ = width;
        }
    }
    exports.default = Stroke;
});
define("node_modules/ol/src/render/canvas", ["require", "exports", "node_modules/ol/src/Object", "node_modules/ol/src/events/Target", "node_modules/ol/src/has", "node_modules/ol/src/obj", "node_modules/ol/src/dom", "node_modules/ol/src/css", "node_modules/ol/src/transform"], function (require, exports, Object_js_3, Target_js_2, has_js_2, obj_js_6, dom_js_1, css_js_1, transform_js_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createTransformString = exports.drawImageOrLabel = exports.rotateAtOffset = exports.measureTextWidths = exports.measureAndCacheTextWidth = exports.measureTextWidth = exports.measureTextHeight = exports.registerFont = exports.textHeights = exports.labelCache = exports.checkedFonts = exports.defaultLineWidth = exports.defaultPadding = exports.defaultTextBaseline = exports.defaultTextAlign = exports.defaultStrokeStyle = exports.defaultMiterLimit = exports.defaultLineJoin = exports.defaultLineDashOffset = exports.defaultLineDash = exports.defaultLineCap = exports.defaultFillStyle = exports.defaultFont = void 0;
    exports.defaultFont = '10px sans-serif';
    exports.defaultFillStyle = '#000';
    exports.defaultLineCap = 'round';
    exports.defaultLineDash = [];
    exports.defaultLineDashOffset = 0;
    exports.defaultLineJoin = 'round';
    exports.defaultMiterLimit = 10;
    exports.defaultStrokeStyle = '#000';
    exports.defaultTextAlign = 'center';
    exports.defaultTextBaseline = 'middle';
    exports.defaultPadding = [0, 0, 0, 0];
    exports.defaultLineWidth = 1;
    exports.checkedFonts = new Object_js_3.default();
    exports.labelCache = new Target_js_2.default();
    exports.labelCache.setSize = function () {
        console.warn('labelCache is deprecated.');
    };
    let measureContext = null;
    let measureFont;
    exports.textHeights = {};
    exports.registerFont = (function () {
        const retries = 100;
        const size = '32px ';
        const referenceFonts = ['monospace', 'serif'];
        const len = referenceFonts.length;
        const text = 'wmytzilWMYTZIL@#/&?$%10\uF013';
        let interval, referenceWidth;
        function isAvailable(fontStyle, fontWeight, fontFamily) {
            let available = true;
            for (let i = 0; i < len; ++i) {
                const referenceFont = referenceFonts[i];
                referenceWidth = measureTextWidth(fontStyle + ' ' + fontWeight + ' ' + size + referenceFont, text);
                if (fontFamily != referenceFont) {
                    const width = measureTextWidth(fontStyle +
                        ' ' +
                        fontWeight +
                        ' ' +
                        size +
                        fontFamily +
                        ',' +
                        referenceFont, text);
                    available = available && width != referenceWidth;
                }
            }
            if (available) {
                return true;
            }
            return false;
        }
        function check() {
            let done = true;
            const fonts = exports.checkedFonts.getKeys();
            for (let i = 0, ii = fonts.length; i < ii; ++i) {
                const font = fonts[i];
                if (exports.checkedFonts.get(font) < retries) {
                    if (isAvailable.apply(this, font.split('\n'))) {
                        obj_js_6.clear(exports.textHeights);
                        measureContext = null;
                        measureFont = undefined;
                        exports.checkedFonts.set(font, retries);
                    }
                    else {
                        exports.checkedFonts.set(font, exports.checkedFonts.get(font) + 1, true);
                        done = false;
                    }
                }
            }
            if (done) {
                clearInterval(interval);
                interval = undefined;
            }
        }
        return function (fontSpec) {
            const font = css_js_1.getFontParameters(fontSpec);
            if (!font) {
                return;
            }
            const families = font.families;
            for (let i = 0, ii = families.length; i < ii; ++i) {
                const family = families[i];
                const key = font.style + '\n' + font.weight + '\n' + family;
                if (exports.checkedFonts.get(key) === undefined) {
                    exports.checkedFonts.set(key, retries, true);
                    if (!isAvailable(font.style, font.weight, family)) {
                        exports.checkedFonts.set(key, 0, true);
                        if (interval === undefined) {
                            interval = setInterval(check, 32);
                        }
                    }
                }
            }
        };
    })();
    exports.measureTextHeight = (function () {
        let div;
        const heights = exports.textHeights;
        return function (fontSpec) {
            let height = heights[fontSpec];
            if (height == undefined) {
                if (has_js_2.WORKER_OFFSCREEN_CANVAS) {
                    const font = css_js_1.getFontParameters(fontSpec);
                    const metrics = measureText(fontSpec, 'Žg');
                    const lineHeight = isNaN(Number(font.lineHeight))
                        ? 1.2
                        : Number(font.lineHeight);
                    exports.textHeights[fontSpec] =
                        lineHeight *
                            (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
                }
                else {
                    if (!div) {
                        div = document.createElement('div');
                        div.innerHTML = 'M';
                        div.style.margin = '0 !important';
                        div.style.padding = '0 !important';
                        div.style.position = 'absolute !important';
                        div.style.left = '-99999px !important';
                    }
                    div.style.font = fontSpec;
                    document.body.appendChild(div);
                    height = div.offsetHeight;
                    heights[fontSpec] = height;
                    document.body.removeChild(div);
                }
            }
            return height;
        };
    })();
    function measureText(font, text) {
        if (!measureContext) {
            measureContext = dom_js_1.createCanvasContext2D(1, 1);
        }
        if (font != measureFont) {
            measureContext.font = font;
            measureFont = measureContext.font;
        }
        return measureContext.measureText(text);
    }
    function measureTextWidth(font, text) {
        return measureText(font, text).width;
    }
    exports.measureTextWidth = measureTextWidth;
    function measureAndCacheTextWidth(font, text, cache) {
        if (text in cache) {
            return cache[text];
        }
        const width = measureTextWidth(font, text);
        cache[text] = width;
        return width;
    }
    exports.measureAndCacheTextWidth = measureAndCacheTextWidth;
    function measureTextWidths(font, lines, widths) {
        const numLines = lines.length;
        let width = 0;
        for (let i = 0; i < numLines; ++i) {
            const currentWidth = measureTextWidth(font, lines[i]);
            width = Math.max(width, currentWidth);
            widths.push(currentWidth);
        }
        return width;
    }
    exports.measureTextWidths = measureTextWidths;
    function rotateAtOffset(context, rotation, offsetX, offsetY) {
        if (rotation !== 0) {
            context.translate(offsetX, offsetY);
            context.rotate(rotation);
            context.translate(-offsetX, -offsetY);
        }
    }
    exports.rotateAtOffset = rotateAtOffset;
    function drawImageOrLabel(context, transform, opacity, labelOrImage, originX, originY, w, h, x, y, scale) {
        context.save();
        if (opacity !== 1) {
            context.globalAlpha *= opacity;
        }
        if (transform) {
            context.setTransform.apply(context, transform);
        }
        if ((labelOrImage).contextInstructions) {
            context.translate(x, y);
            context.scale(scale[0], scale[1]);
            executeLabelInstructions((labelOrImage), context);
        }
        else if (scale[0] < 0 || scale[1] < 0) {
            context.translate(x, y);
            context.scale(scale[0], scale[1]);
            context.drawImage((labelOrImage), originX, originY, w, h, 0, 0, w, h);
        }
        else {
            context.drawImage((labelOrImage), originX, originY, w, h, x, y, w * scale[0], h * scale[1]);
        }
        context.restore();
    }
    exports.drawImageOrLabel = drawImageOrLabel;
    function executeLabelInstructions(label, context) {
        const contextInstructions = label.contextInstructions;
        for (let i = 0, ii = contextInstructions.length; i < ii; i += 2) {
            if (Array.isArray(contextInstructions[i + 1])) {
                context[contextInstructions[i]].apply(context, contextInstructions[i + 1]);
            }
            else {
                context[contextInstructions[i]] = contextInstructions[i + 1];
            }
        }
    }
    let createTransformStringCanvas = null;
    function createTransformString(transform) {
        if (has_js_2.WORKER_OFFSCREEN_CANVAS) {
            return transform_js_7.toString(transform);
        }
        else {
            if (!createTransformStringCanvas) {
                createTransformStringCanvas = dom_js_1.createCanvasContext2D(1, 1).canvas;
            }
            createTransformStringCanvas.style.transform = transform_js_7.toString(transform);
            return createTransformStringCanvas.style.transform;
        }
    }
    exports.createTransformString = createTransformString;
});
define("node_modules/ol/src/style/RegularShape", ["require", "exports", "node_modules/ol/src/ImageState", "node_modules/ol/src/style/Image", "node_modules/ol/src/color", "node_modules/ol/src/colorlike", "node_modules/ol/src/dom", "node_modules/ol/src/render/canvas"], function (require, exports, ImageState_js_1, Image_js_1, color_js_2, colorlike_js_1, dom_js_2, canvas_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RegularShape extends Image_js_1.default {
        constructor(options) {
            const rotateWithView = options.rotateWithView !== undefined ? options.rotateWithView : false;
            super({
                opacity: 1,
                rotateWithView: rotateWithView,
                rotation: options.rotation !== undefined ? options.rotation : 0,
                scale: 1,
                displacement: options.displacement !== undefined ? options.displacement : [0, 0],
            });
            this.canvas_ = {};
            this.hitDetectionCanvas_ = null;
            this.fill_ = options.fill !== undefined ? options.fill : null;
            this.origin_ = [0, 0];
            this.points_ = options.points;
            this.radius_ =
                options.radius !== undefined ? options.radius : options.radius1;
            this.radius2_ = options.radius2;
            this.angle_ = options.angle !== undefined ? options.angle : 0;
            this.stroke_ = options.stroke !== undefined ? options.stroke : null;
            this.anchor_ = null;
            this.size_ = null;
            this.imageSize_ = null;
            this.hitDetectionImageSize_ = null;
            this.render();
        }
        clone() {
            const style = new RegularShape({
                fill: this.getFill() ? this.getFill().clone() : undefined,
                points: this.getPoints(),
                radius: this.getRadius(),
                radius2: this.getRadius2(),
                angle: this.getAngle(),
                stroke: this.getStroke() ? this.getStroke().clone() : undefined,
                rotation: this.getRotation(),
                rotateWithView: this.getRotateWithView(),
                displacement: this.getDisplacement().slice(),
            });
            style.setOpacity(this.getOpacity());
            style.setScale(this.getScale());
            return style;
        }
        getAnchor() {
            return this.anchor_;
        }
        getAngle() {
            return this.angle_;
        }
        getFill() {
            return this.fill_;
        }
        getHitDetectionImage() {
            if (!this.hitDetectionCanvas_) {
                const renderOptions = this.createRenderOptions();
                this.createHitDetectionCanvas_(renderOptions);
            }
            return this.hitDetectionCanvas_;
        }
        getImage(pixelRatio) {
            if (!this.canvas_[pixelRatio || 1]) {
                const renderOptions = this.createRenderOptions();
                const context = dom_js_2.createCanvasContext2D(renderOptions.size * pixelRatio || 1, renderOptions.size * pixelRatio || 1);
                this.draw_(renderOptions, context, 0, 0, pixelRatio || 1);
                this.canvas_[pixelRatio || 1] = context.canvas;
            }
            return this.canvas_[pixelRatio || 1];
        }
        getPixelRatio(pixelRatio) {
            return pixelRatio;
        }
        getImageSize() {
            return this.imageSize_;
        }
        getHitDetectionImageSize() {
            return this.hitDetectionImageSize_;
        }
        getImageState() {
            return ImageState_js_1.default.LOADED;
        }
        getOrigin() {
            return this.origin_;
        }
        getPoints() {
            return this.points_;
        }
        getRadius() {
            return this.radius_;
        }
        getRadius2() {
            return this.radius2_;
        }
        getSize() {
            return this.size_;
        }
        getStroke() {
            return this.stroke_;
        }
        listenImageChange(listener) { }
        load() { }
        unlistenImageChange(listener) { }
        createRenderOptions() {
            let lineCap = canvas_js_1.defaultLineCap;
            let lineJoin = canvas_js_1.defaultLineJoin;
            let miterLimit = 0;
            let lineDash = null;
            let lineDashOffset = 0;
            let strokeStyle;
            let strokeWidth = 0;
            if (this.stroke_) {
                strokeStyle = this.stroke_.getColor();
                if (strokeStyle === null) {
                    strokeStyle = canvas_js_1.defaultStrokeStyle;
                }
                strokeStyle = colorlike_js_1.asColorLike(strokeStyle);
                strokeWidth = this.stroke_.getWidth();
                if (strokeWidth === undefined) {
                    strokeWidth = canvas_js_1.defaultLineWidth;
                }
                lineDash = this.stroke_.getLineDash();
                lineDashOffset = this.stroke_.getLineDashOffset();
                lineJoin = this.stroke_.getLineJoin();
                if (lineJoin === undefined) {
                    lineJoin = canvas_js_1.defaultLineJoin;
                }
                lineCap = this.stroke_.getLineCap();
                if (lineCap === undefined) {
                    lineCap = canvas_js_1.defaultLineCap;
                }
                miterLimit = this.stroke_.getMiterLimit();
                if (miterLimit === undefined) {
                    miterLimit = canvas_js_1.defaultMiterLimit;
                }
            }
            const size = 2 * (this.radius_ + strokeWidth) + 1;
            return {
                strokeStyle: strokeStyle,
                strokeWidth: strokeWidth,
                size: size,
                lineCap: lineCap,
                lineDash: lineDash,
                lineDashOffset: lineDashOffset,
                lineJoin: lineJoin,
                miterLimit: miterLimit,
            };
        }
        render() {
            const renderOptions = this.createRenderOptions();
            const context = dom_js_2.createCanvasContext2D(renderOptions.size, renderOptions.size);
            this.draw_(renderOptions, context, 0, 0, 1);
            this.canvas_[1] = context.canvas;
            const size = context.canvas.width;
            const imageSize = size;
            const displacement = this.getDisplacement();
            this.hitDetectionImageSize_ = [renderOptions.size, renderOptions.size];
            this.createHitDetectionCanvas_(renderOptions);
            this.anchor_ = [size / 2 - displacement[0], size / 2 + displacement[1]];
            this.size_ = [size, size];
            this.imageSize_ = [imageSize, imageSize];
        }
        draw_(renderOptions, context, x, y, pixelRatio) {
            let i, angle0, radiusC;
            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            context.translate(x, y);
            context.beginPath();
            let points = this.points_;
            if (points === Infinity) {
                context.arc(renderOptions.size / 2, renderOptions.size / 2, this.radius_, 0, 2 * Math.PI, true);
            }
            else {
                const radius2 = this.radius2_ !== undefined ? this.radius2_ : this.radius_;
                if (radius2 !== this.radius_) {
                    points = 2 * points;
                }
                for (i = 0; i <= points; i++) {
                    angle0 = (i * 2 * Math.PI) / points - Math.PI / 2 + this.angle_;
                    radiusC = i % 2 === 0 ? this.radius_ : radius2;
                    context.lineTo(renderOptions.size / 2 + radiusC * Math.cos(angle0), renderOptions.size / 2 + radiusC * Math.sin(angle0));
                }
            }
            if (this.fill_) {
                let color = this.fill_.getColor();
                if (color === null) {
                    color = canvas_js_1.defaultFillStyle;
                }
                context.fillStyle = colorlike_js_1.asColorLike(color);
                context.fill();
            }
            if (this.stroke_) {
                context.strokeStyle = renderOptions.strokeStyle;
                context.lineWidth = renderOptions.strokeWidth;
                if (context.setLineDash && renderOptions.lineDash) {
                    context.setLineDash(renderOptions.lineDash);
                    context.lineDashOffset = renderOptions.lineDashOffset;
                }
                context.lineCap = renderOptions.lineCap;
                context.lineJoin = renderOptions.lineJoin;
                context.miterLimit = renderOptions.miterLimit;
                context.stroke();
            }
            context.closePath();
        }
        createHitDetectionCanvas_(renderOptions) {
            this.hitDetectionCanvas_ = this.getImage(1);
            if (this.fill_) {
                let color = this.fill_.getColor();
                let opacity = 0;
                if (typeof color === 'string') {
                    color = color_js_2.asArray(color);
                }
                if (color === null) {
                    opacity = 1;
                }
                else if (Array.isArray(color)) {
                    opacity = color.length === 4 ? color[3] : 1;
                }
                if (opacity === 0) {
                    const context = dom_js_2.createCanvasContext2D(renderOptions.size, renderOptions.size);
                    this.hitDetectionCanvas_ = context.canvas;
                    this.drawHitDetectionCanvas_(renderOptions, context, 0, 0);
                }
            }
        }
        drawHitDetectionCanvas_(renderOptions, context, x, y) {
            context.translate(x, y);
            context.beginPath();
            let points = this.points_;
            if (points === Infinity) {
                context.arc(renderOptions.size / 2, renderOptions.size / 2, this.radius_, 0, 2 * Math.PI, true);
            }
            else {
                const radius2 = this.radius2_ !== undefined ? this.radius2_ : this.radius_;
                if (radius2 !== this.radius_) {
                    points = 2 * points;
                }
                let i, radiusC, angle0;
                for (i = 0; i <= points; i++) {
                    angle0 = (i * 2 * Math.PI) / points - Math.PI / 2 + this.angle_;
                    radiusC = i % 2 === 0 ? this.radius_ : radius2;
                    context.lineTo(renderOptions.size / 2 + radiusC * Math.cos(angle0), renderOptions.size / 2 + radiusC * Math.sin(angle0));
                }
            }
            context.fillStyle = canvas_js_1.defaultFillStyle;
            context.fill();
            if (this.stroke_) {
                context.strokeStyle = renderOptions.strokeStyle;
                context.lineWidth = renderOptions.strokeWidth;
                if (renderOptions.lineDash) {
                    context.setLineDash(renderOptions.lineDash);
                    context.lineDashOffset = renderOptions.lineDashOffset;
                }
                context.stroke();
            }
            context.closePath();
        }
    }
    exports.default = RegularShape;
});
define("node_modules/ol/src/style/Circle", ["require", "exports", "node_modules/ol/src/style/RegularShape"], function (require, exports, RegularShape_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CircleStyle extends RegularShape_js_1.default {
        constructor(opt_options) {
            const options = opt_options ? opt_options : {};
            super({
                points: Infinity,
                fill: options.fill,
                radius: options.radius,
                stroke: options.stroke,
                displacement: options.displacement !== undefined ? options.displacement : [0, 0],
            });
        }
        clone() {
            const style = new CircleStyle({
                fill: this.getFill() ? this.getFill().clone() : undefined,
                stroke: this.getStroke() ? this.getStroke().clone() : undefined,
                radius: this.getRadius(),
                displacement: this.getDisplacement().slice(),
            });
            style.setOpacity(this.getOpacity());
            style.setScale(this.getScale());
            return style;
        }
        setRadius(radius) {
            this.radius_ = radius;
            this.render();
        }
    }
    exports.default = CircleStyle;
});
define("node_modules/ol/src/geom/flat/length", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.linearRingLength = exports.lineStringLength = void 0;
    function lineStringLength(flatCoordinates, offset, end, stride) {
        let x1 = flatCoordinates[offset];
        let y1 = flatCoordinates[offset + 1];
        let length = 0;
        for (let i = offset + stride; i < end; i += stride) {
            const x2 = flatCoordinates[i];
            const y2 = flatCoordinates[i + 1];
            length += Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            x1 = x2;
            y1 = y2;
        }
        return length;
    }
    exports.lineStringLength = lineStringLength;
    function linearRingLength(flatCoordinates, offset, end, stride) {
        let perimeter = lineStringLength(flatCoordinates, offset, end, stride);
        const dx = flatCoordinates[end - stride] - flatCoordinates[offset];
        const dy = flatCoordinates[end - stride + 1] - flatCoordinates[offset + 1];
        perimeter += Math.sqrt(dx * dx + dy * dy);
        return perimeter;
    }
    exports.linearRingLength = linearRingLength;
});
define("node_modules/ol/src/geom/LineString", ["require", "exports", "node_modules/ol/src/geom/GeometryLayout", "node_modules/ol/src/geom/GeometryType", "node_modules/ol/src/geom/SimpleGeometry", "node_modules/ol/src/geom/flat/closest", "node_modules/ol/src/extent", "node_modules/ol/src/geom/flat/deflate", "node_modules/ol/src/geom/flat/simplify", "node_modules/ol/src/array", "node_modules/ol/src/geom/flat/segments", "node_modules/ol/src/geom/flat/inflate", "node_modules/ol/src/geom/flat/interpolate", "node_modules/ol/src/geom/flat/intersectsextent", "node_modules/ol/src/geom/flat/length"], function (require, exports, GeometryLayout_js_4, GeometryType_js_8, SimpleGeometry_js_5, closest_js_3, extent_js_17, deflate_js_5, simplify_js_3, array_js_7, segments_js_2, inflate_js_3, interpolate_js_2, intersectsextent_js_2, length_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LineString extends SimpleGeometry_js_5.default {
        constructor(coordinates, opt_layout) {
            super();
            this.flatMidpoint_ = null;
            this.flatMidpointRevision_ = -1;
            this.maxDelta_ = -1;
            this.maxDeltaRevision_ = -1;
            if (opt_layout !== undefined && !Array.isArray(coordinates[0])) {
                this.setFlatCoordinates(opt_layout, (coordinates));
            }
            else {
                this.setCoordinates((coordinates), opt_layout);
            }
        }
        appendCoordinate(coordinate) {
            if (!this.flatCoordinates) {
                this.flatCoordinates = coordinate.slice();
            }
            else {
                array_js_7.extend(this.flatCoordinates, coordinate);
            }
            this.changed();
        }
        clone() {
            return new LineString(this.flatCoordinates.slice(), this.layout);
        }
        closestPointXY(x, y, closestPoint, minSquaredDistance) {
            if (minSquaredDistance < extent_js_17.closestSquaredDistanceXY(this.getExtent(), x, y)) {
                return minSquaredDistance;
            }
            if (this.maxDeltaRevision_ != this.getRevision()) {
                this.maxDelta_ = Math.sqrt(closest_js_3.maxSquaredDelta(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, 0));
                this.maxDeltaRevision_ = this.getRevision();
            }
            return closest_js_3.assignClosestPoint(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, this.maxDelta_, false, x, y, closestPoint, minSquaredDistance);
        }
        forEachSegment(callback) {
            return segments_js_2.forEach(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, callback);
        }
        getCoordinateAtM(m, opt_extrapolate) {
            if (this.layout != GeometryLayout_js_4.default.XYM &&
                this.layout != GeometryLayout_js_4.default.XYZM) {
                return null;
            }
            const extrapolate = opt_extrapolate !== undefined ? opt_extrapolate : false;
            return interpolate_js_2.lineStringCoordinateAtM(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, m, extrapolate);
        }
        getCoordinates() {
            return inflate_js_3.inflateCoordinates(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride);
        }
        getCoordinateAt(fraction, opt_dest) {
            return interpolate_js_2.interpolatePoint(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, fraction, opt_dest, this.stride);
        }
        getLength() {
            return length_js_1.lineStringLength(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride);
        }
        getFlatMidpoint() {
            if (this.flatMidpointRevision_ != this.getRevision()) {
                this.flatMidpoint_ = this.getCoordinateAt(0.5, this.flatMidpoint_);
                this.flatMidpointRevision_ = this.getRevision();
            }
            return this.flatMidpoint_;
        }
        getSimplifiedGeometryInternal(squaredTolerance) {
            const simplifiedFlatCoordinates = [];
            simplifiedFlatCoordinates.length = simplify_js_3.douglasPeucker(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, squaredTolerance, simplifiedFlatCoordinates, 0);
            return new LineString(simplifiedFlatCoordinates, GeometryLayout_js_4.default.XY);
        }
        getType() {
            return GeometryType_js_8.default.LINE_STRING;
        }
        intersectsExtent(extent) {
            return intersectsextent_js_2.intersectsLineString(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, extent);
        }
        setCoordinates(coordinates, opt_layout) {
            this.setLayout(opt_layout, coordinates, 1);
            if (!this.flatCoordinates) {
                this.flatCoordinates = [];
            }
            this.flatCoordinates.length = deflate_js_5.deflateCoordinates(this.flatCoordinates, 0, coordinates, this.stride);
            this.changed();
        }
    }
    exports.default = LineString;
});
define("node_modules/ol/src/geom/MultiLineString", ["require", "exports", "node_modules/ol/src/geom/GeometryLayout", "node_modules/ol/src/geom/GeometryType", "node_modules/ol/src/geom/LineString", "node_modules/ol/src/geom/SimpleGeometry", "node_modules/ol/src/geom/flat/closest", "node_modules/ol/src/extent", "node_modules/ol/src/geom/flat/deflate", "node_modules/ol/src/geom/flat/simplify", "node_modules/ol/src/array", "node_modules/ol/src/geom/flat/inflate", "node_modules/ol/src/geom/flat/interpolate", "node_modules/ol/src/geom/flat/intersectsextent"], function (require, exports, GeometryLayout_js_5, GeometryType_js_9, LineString_js_1, SimpleGeometry_js_6, closest_js_4, extent_js_18, deflate_js_6, simplify_js_4, array_js_8, inflate_js_4, interpolate_js_3, intersectsextent_js_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MultiLineString extends SimpleGeometry_js_6.default {
        constructor(coordinates, opt_layout, opt_ends) {
            super();
            this.ends_ = [];
            this.maxDelta_ = -1;
            this.maxDeltaRevision_ = -1;
            if (Array.isArray(coordinates[0])) {
                this.setCoordinates((coordinates), opt_layout);
            }
            else if (opt_layout !== undefined && opt_ends) {
                this.setFlatCoordinates(opt_layout, (coordinates));
                this.ends_ = opt_ends;
            }
            else {
                let layout = this.getLayout();
                const lineStrings = (coordinates);
                const flatCoordinates = [];
                const ends = [];
                for (let i = 0, ii = lineStrings.length; i < ii; ++i) {
                    const lineString = lineStrings[i];
                    if (i === 0) {
                        layout = lineString.getLayout();
                    }
                    array_js_8.extend(flatCoordinates, lineString.getFlatCoordinates());
                    ends.push(flatCoordinates.length);
                }
                this.setFlatCoordinates(layout, flatCoordinates);
                this.ends_ = ends;
            }
        }
        appendLineString(lineString) {
            if (!this.flatCoordinates) {
                this.flatCoordinates = lineString.getFlatCoordinates().slice();
            }
            else {
                array_js_8.extend(this.flatCoordinates, lineString.getFlatCoordinates().slice());
            }
            this.ends_.push(this.flatCoordinates.length);
            this.changed();
        }
        clone() {
            return new MultiLineString(this.flatCoordinates.slice(), this.layout, this.ends_.slice());
        }
        closestPointXY(x, y, closestPoint, minSquaredDistance) {
            if (minSquaredDistance < extent_js_18.closestSquaredDistanceXY(this.getExtent(), x, y)) {
                return minSquaredDistance;
            }
            if (this.maxDeltaRevision_ != this.getRevision()) {
                this.maxDelta_ = Math.sqrt(closest_js_4.arrayMaxSquaredDelta(this.flatCoordinates, 0, this.ends_, this.stride, 0));
                this.maxDeltaRevision_ = this.getRevision();
            }
            return closest_js_4.assignClosestArrayPoint(this.flatCoordinates, 0, this.ends_, this.stride, this.maxDelta_, false, x, y, closestPoint, minSquaredDistance);
        }
        getCoordinateAtM(m, opt_extrapolate, opt_interpolate) {
            if ((this.layout != GeometryLayout_js_5.default.XYM &&
                this.layout != GeometryLayout_js_5.default.XYZM) ||
                this.flatCoordinates.length === 0) {
                return null;
            }
            const extrapolate = opt_extrapolate !== undefined ? opt_extrapolate : false;
            const interpolate = opt_interpolate !== undefined ? opt_interpolate : false;
            return interpolate_js_3.lineStringsCoordinateAtM(this.flatCoordinates, 0, this.ends_, this.stride, m, extrapolate, interpolate);
        }
        getCoordinates() {
            return inflate_js_4.inflateCoordinatesArray(this.flatCoordinates, 0, this.ends_, this.stride);
        }
        getEnds() {
            return this.ends_;
        }
        getLineString(index) {
            if (index < 0 || this.ends_.length <= index) {
                return null;
            }
            return new LineString_js_1.default(this.flatCoordinates.slice(index === 0 ? 0 : this.ends_[index - 1], this.ends_[index]), this.layout);
        }
        getLineStrings() {
            const flatCoordinates = this.flatCoordinates;
            const ends = this.ends_;
            const layout = this.layout;
            const lineStrings = [];
            let offset = 0;
            for (let i = 0, ii = ends.length; i < ii; ++i) {
                const end = ends[i];
                const lineString = new LineString_js_1.default(flatCoordinates.slice(offset, end), layout);
                lineStrings.push(lineString);
                offset = end;
            }
            return lineStrings;
        }
        getFlatMidpoints() {
            const midpoints = [];
            const flatCoordinates = this.flatCoordinates;
            let offset = 0;
            const ends = this.ends_;
            const stride = this.stride;
            for (let i = 0, ii = ends.length; i < ii; ++i) {
                const end = ends[i];
                const midpoint = interpolate_js_3.interpolatePoint(flatCoordinates, offset, end, stride, 0.5);
                array_js_8.extend(midpoints, midpoint);
                offset = end;
            }
            return midpoints;
        }
        getSimplifiedGeometryInternal(squaredTolerance) {
            const simplifiedFlatCoordinates = [];
            const simplifiedEnds = [];
            simplifiedFlatCoordinates.length = simplify_js_4.douglasPeuckerArray(this.flatCoordinates, 0, this.ends_, this.stride, squaredTolerance, simplifiedFlatCoordinates, 0, simplifiedEnds);
            return new MultiLineString(simplifiedFlatCoordinates, GeometryLayout_js_5.default.XY, simplifiedEnds);
        }
        getType() {
            return GeometryType_js_9.default.MULTI_LINE_STRING;
        }
        intersectsExtent(extent) {
            return intersectsextent_js_3.intersectsLineStringArray(this.flatCoordinates, 0, this.ends_, this.stride, extent);
        }
        setCoordinates(coordinates, opt_layout) {
            this.setLayout(opt_layout, coordinates, 2);
            if (!this.flatCoordinates) {
                this.flatCoordinates = [];
            }
            const ends = deflate_js_6.deflateCoordinatesArray(this.flatCoordinates, 0, coordinates, this.stride, this.ends_);
            this.flatCoordinates.length = ends.length === 0 ? 0 : ends[ends.length - 1];
            this.changed();
        }
    }
    exports.default = MultiLineString;
});
define("node_modules/ol/src/geom/MultiPoint", ["require", "exports", "node_modules/ol/src/geom/GeometryType", "node_modules/ol/src/geom/Point", "node_modules/ol/src/geom/SimpleGeometry", "node_modules/ol/src/extent", "node_modules/ol/src/geom/flat/deflate", "node_modules/ol/src/array", "node_modules/ol/src/geom/flat/inflate", "node_modules/ol/src/math"], function (require, exports, GeometryType_js_10, Point_js_2, SimpleGeometry_js_7, extent_js_19, deflate_js_7, array_js_9, inflate_js_5, math_js_12) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MultiPoint extends SimpleGeometry_js_7.default {
        constructor(coordinates, opt_layout) {
            super();
            if (opt_layout && !Array.isArray(coordinates[0])) {
                this.setFlatCoordinates(opt_layout, (coordinates));
            }
            else {
                this.setCoordinates((coordinates), opt_layout);
            }
        }
        appendPoint(point) {
            if (!this.flatCoordinates) {
                this.flatCoordinates = point.getFlatCoordinates().slice();
            }
            else {
                array_js_9.extend(this.flatCoordinates, point.getFlatCoordinates());
            }
            this.changed();
        }
        clone() {
            const multiPoint = new MultiPoint(this.flatCoordinates.slice(), this.layout);
            return multiPoint;
        }
        closestPointXY(x, y, closestPoint, minSquaredDistance) {
            if (minSquaredDistance < extent_js_19.closestSquaredDistanceXY(this.getExtent(), x, y)) {
                return minSquaredDistance;
            }
            const flatCoordinates = this.flatCoordinates;
            const stride = this.stride;
            for (let i = 0, ii = flatCoordinates.length; i < ii; i += stride) {
                const squaredDistance = math_js_12.squaredDistance(x, y, flatCoordinates[i], flatCoordinates[i + 1]);
                if (squaredDistance < minSquaredDistance) {
                    minSquaredDistance = squaredDistance;
                    for (let j = 0; j < stride; ++j) {
                        closestPoint[j] = flatCoordinates[i + j];
                    }
                    closestPoint.length = stride;
                }
            }
            return minSquaredDistance;
        }
        getCoordinates() {
            return inflate_js_5.inflateCoordinates(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride);
        }
        getPoint(index) {
            const n = !this.flatCoordinates
                ? 0
                : this.flatCoordinates.length / this.stride;
            if (index < 0 || n <= index) {
                return null;
            }
            return new Point_js_2.default(this.flatCoordinates.slice(index * this.stride, (index + 1) * this.stride), this.layout);
        }
        getPoints() {
            const flatCoordinates = this.flatCoordinates;
            const layout = this.layout;
            const stride = this.stride;
            const points = [];
            for (let i = 0, ii = flatCoordinates.length; i < ii; i += stride) {
                const point = new Point_js_2.default(flatCoordinates.slice(i, i + stride), layout);
                points.push(point);
            }
            return points;
        }
        getType() {
            return GeometryType_js_10.default.MULTI_POINT;
        }
        intersectsExtent(extent) {
            const flatCoordinates = this.flatCoordinates;
            const stride = this.stride;
            for (let i = 0, ii = flatCoordinates.length; i < ii; i += stride) {
                const x = flatCoordinates[i];
                const y = flatCoordinates[i + 1];
                if (extent_js_19.containsXY(extent, x, y)) {
                    return true;
                }
            }
            return false;
        }
        setCoordinates(coordinates, opt_layout) {
            this.setLayout(opt_layout, coordinates, 1);
            if (!this.flatCoordinates) {
                this.flatCoordinates = [];
            }
            this.flatCoordinates.length = deflate_js_7.deflateCoordinates(this.flatCoordinates, 0, coordinates, this.stride);
            this.changed();
        }
    }
    exports.default = MultiPoint;
});
define("node_modules/ol/src/geom/MultiPolygon", ["require", "exports", "node_modules/ol/src/geom/GeometryLayout", "node_modules/ol/src/geom/GeometryType", "node_modules/ol/src/geom/MultiPoint", "node_modules/ol/src/geom/Polygon", "node_modules/ol/src/geom/SimpleGeometry", "node_modules/ol/src/geom/flat/closest", "node_modules/ol/src/extent", "node_modules/ol/src/geom/flat/deflate", "node_modules/ol/src/array", "node_modules/ol/src/geom/flat/interiorpoint", "node_modules/ol/src/geom/flat/inflate", "node_modules/ol/src/geom/flat/intersectsextent", "node_modules/ol/src/geom/flat/orient", "node_modules/ol/src/geom/flat/area", "node_modules/ol/src/geom/flat/center", "node_modules/ol/src/geom/flat/contains", "node_modules/ol/src/geom/flat/simplify"], function (require, exports, GeometryLayout_js_6, GeometryType_js_11, MultiPoint_js_1, Polygon_js_1, SimpleGeometry_js_8, closest_js_5, extent_js_20, deflate_js_8, array_js_10, interiorpoint_js_3, inflate_js_6, intersectsextent_js_4, orient_js_2, area_js_3, center_js_2, contains_js_4, simplify_js_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MultiPolygon extends SimpleGeometry_js_8.default {
        constructor(coordinates, opt_layout, opt_endss) {
            super();
            this.endss_ = [];
            this.flatInteriorPointsRevision_ = -1;
            this.flatInteriorPoints_ = null;
            this.maxDelta_ = -1;
            this.maxDeltaRevision_ = -1;
            this.orientedRevision_ = -1;
            this.orientedFlatCoordinates_ = null;
            if (!opt_endss && !Array.isArray(coordinates[0])) {
                let layout = this.getLayout();
                const polygons = (coordinates);
                const flatCoordinates = [];
                const endss = [];
                for (let i = 0, ii = polygons.length; i < ii; ++i) {
                    const polygon = polygons[i];
                    if (i === 0) {
                        layout = polygon.getLayout();
                    }
                    const offset = flatCoordinates.length;
                    const ends = polygon.getEnds();
                    for (let j = 0, jj = ends.length; j < jj; ++j) {
                        ends[j] += offset;
                    }
                    array_js_10.extend(flatCoordinates, polygon.getFlatCoordinates());
                    endss.push(ends);
                }
                opt_layout = layout;
                coordinates = flatCoordinates;
                opt_endss = endss;
            }
            if (opt_layout !== undefined && opt_endss) {
                this.setFlatCoordinates(opt_layout, (coordinates));
                this.endss_ = opt_endss;
            }
            else {
                this.setCoordinates((coordinates), opt_layout);
            }
        }
        appendPolygon(polygon) {
            let ends;
            if (!this.flatCoordinates) {
                this.flatCoordinates = polygon.getFlatCoordinates().slice();
                ends = polygon.getEnds().slice();
                this.endss_.push();
            }
            else {
                const offset = this.flatCoordinates.length;
                array_js_10.extend(this.flatCoordinates, polygon.getFlatCoordinates());
                ends = polygon.getEnds().slice();
                for (let i = 0, ii = ends.length; i < ii; ++i) {
                    ends[i] += offset;
                }
            }
            this.endss_.push(ends);
            this.changed();
        }
        clone() {
            const len = this.endss_.length;
            const newEndss = new Array(len);
            for (let i = 0; i < len; ++i) {
                newEndss[i] = this.endss_[i].slice();
            }
            return new MultiPolygon(this.flatCoordinates.slice(), this.layout, newEndss);
        }
        closestPointXY(x, y, closestPoint, minSquaredDistance) {
            if (minSquaredDistance < extent_js_20.closestSquaredDistanceXY(this.getExtent(), x, y)) {
                return minSquaredDistance;
            }
            if (this.maxDeltaRevision_ != this.getRevision()) {
                this.maxDelta_ = Math.sqrt(closest_js_5.multiArrayMaxSquaredDelta(this.flatCoordinates, 0, this.endss_, this.stride, 0));
                this.maxDeltaRevision_ = this.getRevision();
            }
            return closest_js_5.assignClosestMultiArrayPoint(this.getOrientedFlatCoordinates(), 0, this.endss_, this.stride, this.maxDelta_, true, x, y, closestPoint, minSquaredDistance);
        }
        containsXY(x, y) {
            return contains_js_4.linearRingssContainsXY(this.getOrientedFlatCoordinates(), 0, this.endss_, this.stride, x, y);
        }
        getArea() {
            return area_js_3.linearRingss(this.getOrientedFlatCoordinates(), 0, this.endss_, this.stride);
        }
        getCoordinates(opt_right) {
            let flatCoordinates;
            if (opt_right !== undefined) {
                flatCoordinates = this.getOrientedFlatCoordinates().slice();
                orient_js_2.orientLinearRingsArray(flatCoordinates, 0, this.endss_, this.stride, opt_right);
            }
            else {
                flatCoordinates = this.flatCoordinates;
            }
            return inflate_js_6.inflateMultiCoordinatesArray(flatCoordinates, 0, this.endss_, this.stride);
        }
        getEndss() {
            return this.endss_;
        }
        getFlatInteriorPoints() {
            if (this.flatInteriorPointsRevision_ != this.getRevision()) {
                const flatCenters = center_js_2.linearRingss(this.flatCoordinates, 0, this.endss_, this.stride);
                this.flatInteriorPoints_ = interiorpoint_js_3.getInteriorPointsOfMultiArray(this.getOrientedFlatCoordinates(), 0, this.endss_, this.stride, flatCenters);
                this.flatInteriorPointsRevision_ = this.getRevision();
            }
            return this.flatInteriorPoints_;
        }
        getInteriorPoints() {
            return new MultiPoint_js_1.default(this.getFlatInteriorPoints().slice(), GeometryLayout_js_6.default.XYM);
        }
        getOrientedFlatCoordinates() {
            if (this.orientedRevision_ != this.getRevision()) {
                const flatCoordinates = this.flatCoordinates;
                if (orient_js_2.linearRingssAreOriented(flatCoordinates, 0, this.endss_, this.stride)) {
                    this.orientedFlatCoordinates_ = flatCoordinates;
                }
                else {
                    this.orientedFlatCoordinates_ = flatCoordinates.slice();
                    this.orientedFlatCoordinates_.length = orient_js_2.orientLinearRingsArray(this.orientedFlatCoordinates_, 0, this.endss_, this.stride);
                }
                this.orientedRevision_ = this.getRevision();
            }
            return this.orientedFlatCoordinates_;
        }
        getSimplifiedGeometryInternal(squaredTolerance) {
            const simplifiedFlatCoordinates = [];
            const simplifiedEndss = [];
            simplifiedFlatCoordinates.length = simplify_js_5.quantizeMultiArray(this.flatCoordinates, 0, this.endss_, this.stride, Math.sqrt(squaredTolerance), simplifiedFlatCoordinates, 0, simplifiedEndss);
            return new MultiPolygon(simplifiedFlatCoordinates, GeometryLayout_js_6.default.XY, simplifiedEndss);
        }
        getPolygon(index) {
            if (index < 0 || this.endss_.length <= index) {
                return null;
            }
            let offset;
            if (index === 0) {
                offset = 0;
            }
            else {
                const prevEnds = this.endss_[index - 1];
                offset = prevEnds[prevEnds.length - 1];
            }
            const ends = this.endss_[index].slice();
            const end = ends[ends.length - 1];
            if (offset !== 0) {
                for (let i = 0, ii = ends.length; i < ii; ++i) {
                    ends[i] -= offset;
                }
            }
            return new Polygon_js_1.default(this.flatCoordinates.slice(offset, end), this.layout, ends);
        }
        getPolygons() {
            const layout = this.layout;
            const flatCoordinates = this.flatCoordinates;
            const endss = this.endss_;
            const polygons = [];
            let offset = 0;
            for (let i = 0, ii = endss.length; i < ii; ++i) {
                const ends = endss[i].slice();
                const end = ends[ends.length - 1];
                if (offset !== 0) {
                    for (let j = 0, jj = ends.length; j < jj; ++j) {
                        ends[j] -= offset;
                    }
                }
                const polygon = new Polygon_js_1.default(flatCoordinates.slice(offset, end), layout, ends);
                polygons.push(polygon);
                offset = end;
            }
            return polygons;
        }
        getType() {
            return GeometryType_js_11.default.MULTI_POLYGON;
        }
        intersectsExtent(extent) {
            return intersectsextent_js_4.intersectsLinearRingMultiArray(this.getOrientedFlatCoordinates(), 0, this.endss_, this.stride, extent);
        }
        setCoordinates(coordinates, opt_layout) {
            this.setLayout(opt_layout, coordinates, 3);
            if (!this.flatCoordinates) {
                this.flatCoordinates = [];
            }
            const endss = deflate_js_8.deflateMultiCoordinatesArray(this.flatCoordinates, 0, coordinates, this.stride, this.endss_);
            if (endss.length === 0) {
                this.flatCoordinates.length = 0;
            }
            else {
                const lastEnds = endss[endss.length - 1];
                this.flatCoordinates.length =
                    lastEnds.length === 0 ? 0 : lastEnds[lastEnds.length - 1];
            }
            this.changed();
        }
    }
    exports.default = MultiPolygon;
});
define("node_modules/ol/src/style/TextPlacement", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        POINT: 'point',
        LINE: 'line',
    };
});
define("node_modules/ol/src/style/Text", ["require", "exports", "node_modules/ol/src/style/Fill", "node_modules/ol/src/style/TextPlacement", "node_modules/ol/src/size"], function (require, exports, Fill_js_1, TextPlacement_js_1, size_js_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const DEFAULT_FILL_COLOR = '#333';
    class Text {
        constructor(opt_options) {
            const options = opt_options || {};
            this.font_ = options.font;
            this.rotation_ = options.rotation;
            this.rotateWithView_ = options.rotateWithView;
            this.scale_ = options.scale;
            this.scaleArray_ = size_js_4.toSize(options.scale !== undefined ? options.scale : 1);
            this.text_ = options.text;
            this.textAlign_ = options.textAlign;
            this.textBaseline_ = options.textBaseline;
            this.fill_ =
                options.fill !== undefined
                    ? options.fill
                    : new Fill_js_1.default({ color: DEFAULT_FILL_COLOR });
            this.maxAngle_ =
                options.maxAngle !== undefined ? options.maxAngle : Math.PI / 4;
            this.placement_ =
                options.placement !== undefined ? options.placement : TextPlacement_js_1.default.POINT;
            this.overflow_ = !!options.overflow;
            this.stroke_ = options.stroke !== undefined ? options.stroke : null;
            this.offsetX_ = options.offsetX !== undefined ? options.offsetX : 0;
            this.offsetY_ = options.offsetY !== undefined ? options.offsetY : 0;
            this.backgroundFill_ = options.backgroundFill
                ? options.backgroundFill
                : null;
            this.backgroundStroke_ = options.backgroundStroke
                ? options.backgroundStroke
                : null;
            this.padding_ = options.padding === undefined ? null : options.padding;
        }
        clone() {
            const scale = this.getScale();
            return new Text({
                font: this.getFont(),
                placement: this.getPlacement(),
                maxAngle: this.getMaxAngle(),
                overflow: this.getOverflow(),
                rotation: this.getRotation(),
                rotateWithView: this.getRotateWithView(),
                scale: Array.isArray(scale) ? scale.slice() : scale,
                text: this.getText(),
                textAlign: this.getTextAlign(),
                textBaseline: this.getTextBaseline(),
                fill: this.getFill() ? this.getFill().clone() : undefined,
                stroke: this.getStroke() ? this.getStroke().clone() : undefined,
                offsetX: this.getOffsetX(),
                offsetY: this.getOffsetY(),
                backgroundFill: this.getBackgroundFill()
                    ? this.getBackgroundFill().clone()
                    : undefined,
                backgroundStroke: this.getBackgroundStroke()
                    ? this.getBackgroundStroke().clone()
                    : undefined,
                padding: this.getPadding(),
            });
        }
        getOverflow() {
            return this.overflow_;
        }
        getFont() {
            return this.font_;
        }
        getMaxAngle() {
            return this.maxAngle_;
        }
        getPlacement() {
            return this.placement_;
        }
        getOffsetX() {
            return this.offsetX_;
        }
        getOffsetY() {
            return this.offsetY_;
        }
        getFill() {
            return this.fill_;
        }
        getRotateWithView() {
            return this.rotateWithView_;
        }
        getRotation() {
            return this.rotation_;
        }
        getScale() {
            return this.scale_;
        }
        getScaleArray() {
            return this.scaleArray_;
        }
        getStroke() {
            return this.stroke_;
        }
        getText() {
            return this.text_;
        }
        getTextAlign() {
            return this.textAlign_;
        }
        getTextBaseline() {
            return this.textBaseline_;
        }
        getBackgroundFill() {
            return this.backgroundFill_;
        }
        getBackgroundStroke() {
            return this.backgroundStroke_;
        }
        getPadding() {
            return this.padding_;
        }
        setOverflow(overflow) {
            this.overflow_ = overflow;
        }
        setFont(font) {
            this.font_ = font;
        }
        setMaxAngle(maxAngle) {
            this.maxAngle_ = maxAngle;
        }
        setOffsetX(offsetX) {
            this.offsetX_ = offsetX;
        }
        setOffsetY(offsetY) {
            this.offsetY_ = offsetY;
        }
        setPlacement(placement) {
            this.placement_ = placement;
        }
        setRotateWithView(rotateWithView) {
            this.rotateWithView_ = rotateWithView;
        }
        setFill(fill) {
            this.fill_ = fill;
        }
        setRotation(rotation) {
            this.rotation_ = rotation;
        }
        setScale(scale) {
            this.scale_ = scale;
            this.scaleArray_ = size_js_4.toSize(scale !== undefined ? scale : 1);
        }
        setStroke(stroke) {
            this.stroke_ = stroke;
        }
        setText(text) {
            this.text_ = text;
        }
        setTextAlign(textAlign) {
            this.textAlign_ = textAlign;
        }
        setTextBaseline(textBaseline) {
            this.textBaseline_ = textBaseline;
        }
        setBackgroundFill(fill) {
            this.backgroundFill_ = fill;
        }
        setBackgroundStroke(stroke) {
            this.backgroundStroke_ = stroke;
        }
        setPadding(padding) {
            this.padding_ = padding;
        }
    }
    exports.default = Text;
});
define("node_modules/ol/src/render/VectorContext", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class VectorContext {
        drawCustom(geometry, feature, renderer) { }
        drawGeometry(geometry) { }
        setStyle(style) { }
        drawCircle(circleGeometry, feature) { }
        drawFeature(feature, style) { }
        drawGeometryCollection(geometryCollectionGeometry, feature) { }
        drawLineString(lineStringGeometry, feature) { }
        drawMultiLineString(multiLineStringGeometry, feature) { }
        drawMultiPoint(multiPointGeometry, feature) { }
        drawMultiPolygon(multiPolygonGeometry, feature) { }
        drawPoint(pointGeometry, feature) { }
        drawPolygon(polygonGeometry, feature) { }
        drawText(geometry, feature) { }
        setFillStrokeStyle(fillStyle, strokeStyle) { }
        setImageStyle(imageStyle, opt_declutterGroup) { }
        setTextStyle(textStyle, opt_declutterGroups) { }
    }
    exports.default = VectorContext;
});
define("node_modules/ol/src/render/canvas/Immediate", ["require", "exports", "node_modules/ol/src/geom/GeometryType", "node_modules/ol/src/render/VectorContext", "node_modules/ol/src/colorlike", "node_modules/ol/src/transform", "node_modules/ol/src/render/canvas", "node_modules/ol/src/array", "node_modules/ol/src/extent", "node_modules/ol/src/geom/flat/transform", "node_modules/ol/src/geom/SimpleGeometry"], function (require, exports, GeometryType_js_12, VectorContext_js_1, colorlike_js_2, transform_js_8, canvas_js_2, array_js_11, extent_js_21, transform_js_9, SimpleGeometry_js_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CanvasImmediateRenderer extends VectorContext_js_1.default {
        constructor(context, pixelRatio, extent, transform, viewRotation, opt_squaredTolerance, opt_userTransform) {
            super();
            this.context_ = context;
            this.pixelRatio_ = pixelRatio;
            this.extent_ = extent;
            this.transform_ = transform;
            this.viewRotation_ = viewRotation;
            this.squaredTolerance_ = opt_squaredTolerance;
            this.userTransform_ = opt_userTransform;
            this.contextFillState_ = null;
            this.contextStrokeState_ = null;
            this.contextTextState_ = null;
            this.fillState_ = null;
            this.strokeState_ = null;
            this.image_ = null;
            this.imageAnchorX_ = 0;
            this.imageAnchorY_ = 0;
            this.imageHeight_ = 0;
            this.imageOpacity_ = 0;
            this.imageOriginX_ = 0;
            this.imageOriginY_ = 0;
            this.imageRotateWithView_ = false;
            this.imageRotation_ = 0;
            this.imageScale_ = [0, 0];
            this.imageWidth_ = 0;
            this.text_ = '';
            this.textOffsetX_ = 0;
            this.textOffsetY_ = 0;
            this.textRotateWithView_ = false;
            this.textRotation_ = 0;
            this.textScale_ = [0, 0];
            this.textFillState_ = null;
            this.textStrokeState_ = null;
            this.textState_ = null;
            this.pixelCoordinates_ = [];
            this.tmpLocalTransform_ = transform_js_8.create();
        }
        drawImages_(flatCoordinates, offset, end, stride) {
            if (!this.image_) {
                return;
            }
            const pixelCoordinates = transform_js_9.transform2D(flatCoordinates, offset, end, 2, this.transform_, this.pixelCoordinates_);
            const context = this.context_;
            const localTransform = this.tmpLocalTransform_;
            const alpha = context.globalAlpha;
            if (this.imageOpacity_ != 1) {
                context.globalAlpha = alpha * this.imageOpacity_;
            }
            let rotation = this.imageRotation_;
            if (this.imageRotateWithView_) {
                rotation += this.viewRotation_;
            }
            for (let i = 0, ii = pixelCoordinates.length; i < ii; i += 2) {
                const x = pixelCoordinates[i] - this.imageAnchorX_;
                const y = pixelCoordinates[i + 1] - this.imageAnchorY_;
                if (rotation !== 0 ||
                    this.imageScale_[0] != 1 ||
                    this.imageScale_[1] != 1) {
                    const centerX = x + this.imageAnchorX_;
                    const centerY = y + this.imageAnchorY_;
                    transform_js_8.compose(localTransform, centerX, centerY, 1, 1, rotation, -centerX, -centerY);
                    context.setTransform.apply(context, localTransform);
                    context.translate(centerX, centerY);
                    context.scale(this.imageScale_[0], this.imageScale_[1]);
                    context.drawImage(this.image_, this.imageOriginX_, this.imageOriginY_, this.imageWidth_, this.imageHeight_, -this.imageAnchorX_, -this.imageAnchorY_, this.imageWidth_, this.imageHeight_);
                    context.setTransform(1, 0, 0, 1, 0, 0);
                }
                else {
                    context.drawImage(this.image_, this.imageOriginX_, this.imageOriginY_, this.imageWidth_, this.imageHeight_, x, y, this.imageWidth_, this.imageHeight_);
                }
            }
            if (this.imageOpacity_ != 1) {
                context.globalAlpha = alpha;
            }
        }
        drawText_(flatCoordinates, offset, end, stride) {
            if (!this.textState_ || this.text_ === '') {
                return;
            }
            if (this.textFillState_) {
                this.setContextFillState_(this.textFillState_);
            }
            if (this.textStrokeState_) {
                this.setContextStrokeState_(this.textStrokeState_);
            }
            this.setContextTextState_(this.textState_);
            const pixelCoordinates = transform_js_9.transform2D(flatCoordinates, offset, end, stride, this.transform_, this.pixelCoordinates_);
            const context = this.context_;
            let rotation = this.textRotation_;
            if (this.textRotateWithView_) {
                rotation += this.viewRotation_;
            }
            for (; offset < end; offset += stride) {
                const x = pixelCoordinates[offset] + this.textOffsetX_;
                const y = pixelCoordinates[offset + 1] + this.textOffsetY_;
                if (rotation !== 0 ||
                    this.textScale_[0] != 1 ||
                    this.textScale_[1] != 1) {
                    const localTransform = transform_js_8.compose(this.tmpLocalTransform_, x, y, 1, 1, rotation, -x, -y);
                    context.setTransform.apply(context, localTransform);
                    context.translate(x, y);
                    context.scale(this.textScale_[0], this.textScale_[1]);
                    if (this.textStrokeState_) {
                        context.strokeText(this.text_, 0, 0);
                    }
                    if (this.textFillState_) {
                        context.fillText(this.text_, 0, 0);
                    }
                    context.setTransform(1, 0, 0, 1, 0, 0);
                }
                else {
                    if (this.textStrokeState_) {
                        context.strokeText(this.text_, x, y);
                    }
                    if (this.textFillState_) {
                        context.fillText(this.text_, x, y);
                    }
                }
            }
        }
        moveToLineTo_(flatCoordinates, offset, end, stride, close) {
            const context = this.context_;
            const pixelCoordinates = transform_js_9.transform2D(flatCoordinates, offset, end, stride, this.transform_, this.pixelCoordinates_);
            context.moveTo(pixelCoordinates[0], pixelCoordinates[1]);
            let length = pixelCoordinates.length;
            if (close) {
                length -= 2;
            }
            for (let i = 2; i < length; i += 2) {
                context.lineTo(pixelCoordinates[i], pixelCoordinates[i + 1]);
            }
            if (close) {
                context.closePath();
            }
            return end;
        }
        drawRings_(flatCoordinates, offset, ends, stride) {
            for (let i = 0, ii = ends.length; i < ii; ++i) {
                offset = this.moveToLineTo_(flatCoordinates, offset, ends[i], stride, true);
            }
            return offset;
        }
        drawCircle(geometry) {
            if (!extent_js_21.intersects(this.extent_, geometry.getExtent())) {
                return;
            }
            if (this.fillState_ || this.strokeState_) {
                if (this.fillState_) {
                    this.setContextFillState_(this.fillState_);
                }
                if (this.strokeState_) {
                    this.setContextStrokeState_(this.strokeState_);
                }
                const pixelCoordinates = SimpleGeometry_js_9.transformGeom2D(geometry, this.transform_, this.pixelCoordinates_);
                const dx = pixelCoordinates[2] - pixelCoordinates[0];
                const dy = pixelCoordinates[3] - pixelCoordinates[1];
                const radius = Math.sqrt(dx * dx + dy * dy);
                const context = this.context_;
                context.beginPath();
                context.arc(pixelCoordinates[0], pixelCoordinates[1], radius, 0, 2 * Math.PI);
                if (this.fillState_) {
                    context.fill();
                }
                if (this.strokeState_) {
                    context.stroke();
                }
            }
            if (this.text_ !== '') {
                this.drawText_(geometry.getCenter(), 0, 2, 2);
            }
        }
        setStyle(style) {
            this.setFillStrokeStyle(style.getFill(), style.getStroke());
            this.setImageStyle(style.getImage());
            this.setTextStyle(style.getText());
        }
        setTransform(transform) {
            this.transform_ = transform;
        }
        drawGeometry(geometry) {
            const type = geometry.getType();
            switch (type) {
                case GeometryType_js_12.default.POINT:
                    this.drawPoint((geometry));
                    break;
                case GeometryType_js_12.default.LINE_STRING:
                    this.drawLineString((geometry));
                    break;
                case GeometryType_js_12.default.POLYGON:
                    this.drawPolygon((geometry));
                    break;
                case GeometryType_js_12.default.MULTI_POINT:
                    this.drawMultiPoint((geometry));
                    break;
                case GeometryType_js_12.default.MULTI_LINE_STRING:
                    this.drawMultiLineString((geometry));
                    break;
                case GeometryType_js_12.default.MULTI_POLYGON:
                    this.drawMultiPolygon((geometry));
                    break;
                case GeometryType_js_12.default.GEOMETRY_COLLECTION:
                    this.drawGeometryCollection((geometry));
                    break;
                case GeometryType_js_12.default.CIRCLE:
                    this.drawCircle((geometry));
                    break;
                default:
            }
        }
        drawFeature(feature, style) {
            const geometry = style.getGeometryFunction()(feature);
            if (!geometry || !extent_js_21.intersects(this.extent_, geometry.getExtent())) {
                return;
            }
            this.setStyle(style);
            this.drawGeometry(geometry);
        }
        drawGeometryCollection(geometry) {
            const geometries = geometry.getGeometriesArray();
            for (let i = 0, ii = geometries.length; i < ii; ++i) {
                this.drawGeometry(geometries[i]);
            }
        }
        drawPoint(geometry) {
            if (this.squaredTolerance_) {
                geometry = (geometry.simplifyTransformed(this.squaredTolerance_, this.userTransform_));
            }
            const flatCoordinates = geometry.getFlatCoordinates();
            const stride = geometry.getStride();
            if (this.image_) {
                this.drawImages_(flatCoordinates, 0, flatCoordinates.length, stride);
            }
            if (this.text_ !== '') {
                this.drawText_(flatCoordinates, 0, flatCoordinates.length, stride);
            }
        }
        drawMultiPoint(geometry) {
            if (this.squaredTolerance_) {
                geometry = (geometry.simplifyTransformed(this.squaredTolerance_, this.userTransform_));
            }
            const flatCoordinates = geometry.getFlatCoordinates();
            const stride = geometry.getStride();
            if (this.image_) {
                this.drawImages_(flatCoordinates, 0, flatCoordinates.length, stride);
            }
            if (this.text_ !== '') {
                this.drawText_(flatCoordinates, 0, flatCoordinates.length, stride);
            }
        }
        drawLineString(geometry) {
            if (this.squaredTolerance_) {
                geometry = (geometry.simplifyTransformed(this.squaredTolerance_, this.userTransform_));
            }
            if (!extent_js_21.intersects(this.extent_, geometry.getExtent())) {
                return;
            }
            if (this.strokeState_) {
                this.setContextStrokeState_(this.strokeState_);
                const context = this.context_;
                const flatCoordinates = geometry.getFlatCoordinates();
                context.beginPath();
                this.moveToLineTo_(flatCoordinates, 0, flatCoordinates.length, geometry.getStride(), false);
                context.stroke();
            }
            if (this.text_ !== '') {
                const flatMidpoint = geometry.getFlatMidpoint();
                this.drawText_(flatMidpoint, 0, 2, 2);
            }
        }
        drawMultiLineString(geometry) {
            if (this.squaredTolerance_) {
                geometry = (geometry.simplifyTransformed(this.squaredTolerance_, this.userTransform_));
            }
            const geometryExtent = geometry.getExtent();
            if (!extent_js_21.intersects(this.extent_, geometryExtent)) {
                return;
            }
            if (this.strokeState_) {
                this.setContextStrokeState_(this.strokeState_);
                const context = this.context_;
                const flatCoordinates = geometry.getFlatCoordinates();
                let offset = 0;
                const ends = (geometry.getEnds());
                const stride = geometry.getStride();
                context.beginPath();
                for (let i = 0, ii = ends.length; i < ii; ++i) {
                    offset = this.moveToLineTo_(flatCoordinates, offset, ends[i], stride, false);
                }
                context.stroke();
            }
            if (this.text_ !== '') {
                const flatMidpoints = geometry.getFlatMidpoints();
                this.drawText_(flatMidpoints, 0, flatMidpoints.length, 2);
            }
        }
        drawPolygon(geometry) {
            if (this.squaredTolerance_) {
                geometry = (geometry.simplifyTransformed(this.squaredTolerance_, this.userTransform_));
            }
            if (!extent_js_21.intersects(this.extent_, geometry.getExtent())) {
                return;
            }
            if (this.strokeState_ || this.fillState_) {
                if (this.fillState_) {
                    this.setContextFillState_(this.fillState_);
                }
                if (this.strokeState_) {
                    this.setContextStrokeState_(this.strokeState_);
                }
                const context = this.context_;
                context.beginPath();
                this.drawRings_(geometry.getOrientedFlatCoordinates(), 0, (geometry.getEnds()), geometry.getStride());
                if (this.fillState_) {
                    context.fill();
                }
                if (this.strokeState_) {
                    context.stroke();
                }
            }
            if (this.text_ !== '') {
                const flatInteriorPoint = geometry.getFlatInteriorPoint();
                this.drawText_(flatInteriorPoint, 0, 2, 2);
            }
        }
        drawMultiPolygon(geometry) {
            if (this.squaredTolerance_) {
                geometry = (geometry.simplifyTransformed(this.squaredTolerance_, this.userTransform_));
            }
            if (!extent_js_21.intersects(this.extent_, geometry.getExtent())) {
                return;
            }
            if (this.strokeState_ || this.fillState_) {
                if (this.fillState_) {
                    this.setContextFillState_(this.fillState_);
                }
                if (this.strokeState_) {
                    this.setContextStrokeState_(this.strokeState_);
                }
                const context = this.context_;
                const flatCoordinates = geometry.getOrientedFlatCoordinates();
                let offset = 0;
                const endss = geometry.getEndss();
                const stride = geometry.getStride();
                context.beginPath();
                for (let i = 0, ii = endss.length; i < ii; ++i) {
                    const ends = endss[i];
                    offset = this.drawRings_(flatCoordinates, offset, ends, stride);
                }
                if (this.fillState_) {
                    context.fill();
                }
                if (this.strokeState_) {
                    context.stroke();
                }
            }
            if (this.text_ !== '') {
                const flatInteriorPoints = geometry.getFlatInteriorPoints();
                this.drawText_(flatInteriorPoints, 0, flatInteriorPoints.length, 2);
            }
        }
        setContextFillState_(fillState) {
            const context = this.context_;
            const contextFillState = this.contextFillState_;
            if (!contextFillState) {
                context.fillStyle = fillState.fillStyle;
                this.contextFillState_ = {
                    fillStyle: fillState.fillStyle,
                };
            }
            else {
                if (contextFillState.fillStyle != fillState.fillStyle) {
                    contextFillState.fillStyle = fillState.fillStyle;
                    context.fillStyle = fillState.fillStyle;
                }
            }
        }
        setContextStrokeState_(strokeState) {
            const context = this.context_;
            const contextStrokeState = this.contextStrokeState_;
            if (!contextStrokeState) {
                context.lineCap = strokeState.lineCap;
                if (context.setLineDash) {
                    context.setLineDash(strokeState.lineDash);
                    context.lineDashOffset = strokeState.lineDashOffset;
                }
                context.lineJoin = strokeState.lineJoin;
                context.lineWidth = strokeState.lineWidth;
                context.miterLimit = strokeState.miterLimit;
                context.strokeStyle = strokeState.strokeStyle;
                this.contextStrokeState_ = {
                    lineCap: strokeState.lineCap,
                    lineDash: strokeState.lineDash,
                    lineDashOffset: strokeState.lineDashOffset,
                    lineJoin: strokeState.lineJoin,
                    lineWidth: strokeState.lineWidth,
                    miterLimit: strokeState.miterLimit,
                    strokeStyle: strokeState.strokeStyle,
                };
            }
            else {
                if (contextStrokeState.lineCap != strokeState.lineCap) {
                    contextStrokeState.lineCap = strokeState.lineCap;
                    context.lineCap = strokeState.lineCap;
                }
                if (context.setLineDash) {
                    if (!array_js_11.equals(contextStrokeState.lineDash, strokeState.lineDash)) {
                        context.setLineDash((contextStrokeState.lineDash = strokeState.lineDash));
                    }
                    if (contextStrokeState.lineDashOffset != strokeState.lineDashOffset) {
                        contextStrokeState.lineDashOffset = strokeState.lineDashOffset;
                        context.lineDashOffset = strokeState.lineDashOffset;
                    }
                }
                if (contextStrokeState.lineJoin != strokeState.lineJoin) {
                    contextStrokeState.lineJoin = strokeState.lineJoin;
                    context.lineJoin = strokeState.lineJoin;
                }
                if (contextStrokeState.lineWidth != strokeState.lineWidth) {
                    contextStrokeState.lineWidth = strokeState.lineWidth;
                    context.lineWidth = strokeState.lineWidth;
                }
                if (contextStrokeState.miterLimit != strokeState.miterLimit) {
                    contextStrokeState.miterLimit = strokeState.miterLimit;
                    context.miterLimit = strokeState.miterLimit;
                }
                if (contextStrokeState.strokeStyle != strokeState.strokeStyle) {
                    contextStrokeState.strokeStyle = strokeState.strokeStyle;
                    context.strokeStyle = strokeState.strokeStyle;
                }
            }
        }
        setContextTextState_(textState) {
            const context = this.context_;
            const contextTextState = this.contextTextState_;
            const textAlign = textState.textAlign
                ? textState.textAlign
                : canvas_js_2.defaultTextAlign;
            if (!contextTextState) {
                context.font = textState.font;
                context.textAlign = (textAlign);
                context.textBaseline = (textState.textBaseline);
                this.contextTextState_ = {
                    font: textState.font,
                    textAlign: textAlign,
                    textBaseline: textState.textBaseline,
                };
            }
            else {
                if (contextTextState.font != textState.font) {
                    contextTextState.font = textState.font;
                    context.font = textState.font;
                }
                if (contextTextState.textAlign != textAlign) {
                    contextTextState.textAlign = (textAlign);
                    context.textAlign = (textAlign);
                }
                if (contextTextState.textBaseline != textState.textBaseline) {
                    contextTextState.textBaseline = (textState.textBaseline);
                    context.textBaseline = (textState.textBaseline);
                }
            }
        }
        setFillStrokeStyle(fillStyle, strokeStyle) {
            if (!fillStyle) {
                this.fillState_ = null;
            }
            else {
                const fillStyleColor = fillStyle.getColor();
                this.fillState_ = {
                    fillStyle: colorlike_js_2.asColorLike(fillStyleColor ? fillStyleColor : canvas_js_2.defaultFillStyle),
                };
            }
            if (!strokeStyle) {
                this.strokeState_ = null;
            }
            else {
                const strokeStyleColor = strokeStyle.getColor();
                const strokeStyleLineCap = strokeStyle.getLineCap();
                const strokeStyleLineDash = strokeStyle.getLineDash();
                const strokeStyleLineDashOffset = strokeStyle.getLineDashOffset();
                const strokeStyleLineJoin = strokeStyle.getLineJoin();
                const strokeStyleWidth = strokeStyle.getWidth();
                const strokeStyleMiterLimit = strokeStyle.getMiterLimit();
                this.strokeState_ = {
                    lineCap: strokeStyleLineCap !== undefined
                        ? strokeStyleLineCap
                        : canvas_js_2.defaultLineCap,
                    lineDash: strokeStyleLineDash ? strokeStyleLineDash : canvas_js_2.defaultLineDash,
                    lineDashOffset: strokeStyleLineDashOffset
                        ? strokeStyleLineDashOffset
                        : canvas_js_2.defaultLineDashOffset,
                    lineJoin: strokeStyleLineJoin !== undefined
                        ? strokeStyleLineJoin
                        : canvas_js_2.defaultLineJoin,
                    lineWidth: this.pixelRatio_ *
                        (strokeStyleWidth !== undefined
                            ? strokeStyleWidth
                            : canvas_js_2.defaultLineWidth),
                    miterLimit: strokeStyleMiterLimit !== undefined
                        ? strokeStyleMiterLimit
                        : canvas_js_2.defaultMiterLimit,
                    strokeStyle: colorlike_js_2.asColorLike(strokeStyleColor ? strokeStyleColor : canvas_js_2.defaultStrokeStyle),
                };
            }
        }
        setImageStyle(imageStyle) {
            if (!imageStyle) {
                this.image_ = null;
            }
            else {
                const imageSize = imageStyle.getSize();
                if (!imageSize) {
                    this.image_ = null;
                }
                else {
                    const imageAnchor = imageStyle.getAnchor();
                    const imageImage = imageStyle.getImage(1);
                    const imageOrigin = imageStyle.getOrigin();
                    const imageScale = imageStyle.getScaleArray();
                    this.imageAnchorX_ = imageAnchor[0];
                    this.imageAnchorY_ = imageAnchor[1];
                    this.imageHeight_ = imageSize[1];
                    this.image_ = imageImage;
                    this.imageOpacity_ = imageStyle.getOpacity();
                    this.imageOriginX_ = imageOrigin[0];
                    this.imageOriginY_ = imageOrigin[1];
                    this.imageRotateWithView_ = imageStyle.getRotateWithView();
                    this.imageRotation_ = imageStyle.getRotation();
                    this.imageScale_ = [
                        this.pixelRatio_ * imageScale[0],
                        this.pixelRatio_ * imageScale[1],
                    ];
                    this.imageWidth_ = imageSize[0];
                }
            }
        }
        setTextStyle(textStyle) {
            if (!textStyle) {
                this.text_ = '';
            }
            else {
                const textFillStyle = textStyle.getFill();
                if (!textFillStyle) {
                    this.textFillState_ = null;
                }
                else {
                    const textFillStyleColor = textFillStyle.getColor();
                    this.textFillState_ = {
                        fillStyle: colorlike_js_2.asColorLike(textFillStyleColor ? textFillStyleColor : canvas_js_2.defaultFillStyle),
                    };
                }
                const textStrokeStyle = textStyle.getStroke();
                if (!textStrokeStyle) {
                    this.textStrokeState_ = null;
                }
                else {
                    const textStrokeStyleColor = textStrokeStyle.getColor();
                    const textStrokeStyleLineCap = textStrokeStyle.getLineCap();
                    const textStrokeStyleLineDash = textStrokeStyle.getLineDash();
                    const textStrokeStyleLineDashOffset = textStrokeStyle.getLineDashOffset();
                    const textStrokeStyleLineJoin = textStrokeStyle.getLineJoin();
                    const textStrokeStyleWidth = textStrokeStyle.getWidth();
                    const textStrokeStyleMiterLimit = textStrokeStyle.getMiterLimit();
                    this.textStrokeState_ = {
                        lineCap: textStrokeStyleLineCap !== undefined
                            ? textStrokeStyleLineCap
                            : canvas_js_2.defaultLineCap,
                        lineDash: textStrokeStyleLineDash
                            ? textStrokeStyleLineDash
                            : canvas_js_2.defaultLineDash,
                        lineDashOffset: textStrokeStyleLineDashOffset
                            ? textStrokeStyleLineDashOffset
                            : canvas_js_2.defaultLineDashOffset,
                        lineJoin: textStrokeStyleLineJoin !== undefined
                            ? textStrokeStyleLineJoin
                            : canvas_js_2.defaultLineJoin,
                        lineWidth: textStrokeStyleWidth !== undefined
                            ? textStrokeStyleWidth
                            : canvas_js_2.defaultLineWidth,
                        miterLimit: textStrokeStyleMiterLimit !== undefined
                            ? textStrokeStyleMiterLimit
                            : canvas_js_2.defaultMiterLimit,
                        strokeStyle: colorlike_js_2.asColorLike(textStrokeStyleColor ? textStrokeStyleColor : canvas_js_2.defaultStrokeStyle),
                    };
                }
                const textFont = textStyle.getFont();
                const textOffsetX = textStyle.getOffsetX();
                const textOffsetY = textStyle.getOffsetY();
                const textRotateWithView = textStyle.getRotateWithView();
                const textRotation = textStyle.getRotation();
                const textScale = textStyle.getScaleArray();
                const textText = textStyle.getText();
                const textTextAlign = textStyle.getTextAlign();
                const textTextBaseline = textStyle.getTextBaseline();
                this.textState_ = {
                    font: textFont !== undefined ? textFont : canvas_js_2.defaultFont,
                    textAlign: textTextAlign !== undefined ? textTextAlign : canvas_js_2.defaultTextAlign,
                    textBaseline: textTextBaseline !== undefined
                        ? textTextBaseline
                        : canvas_js_2.defaultTextBaseline,
                };
                this.text_ = textText !== undefined ? textText : '';
                this.textOffsetX_ =
                    textOffsetX !== undefined ? this.pixelRatio_ * textOffsetX : 0;
                this.textOffsetY_ =
                    textOffsetY !== undefined ? this.pixelRatio_ * textOffsetY : 0;
                this.textRotateWithView_ =
                    textRotateWithView !== undefined ? textRotateWithView : false;
                this.textRotation_ = textRotation !== undefined ? textRotation : 0;
                this.textScale_ = [
                    this.pixelRatio_ * textScale[0],
                    this.pixelRatio_ * textScale[1],
                ];
            }
        }
    }
    exports.default = CanvasImmediateRenderer;
});
define("node_modules/ol/src/render/canvas/BuilderType", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        CIRCLE: 'Circle',
        DEFAULT: 'Default',
        IMAGE: 'Image',
        LINE_STRING: 'LineString',
        POLYGON: 'Polygon',
        TEXT: 'Text',
    };
});
define("node_modules/ol/src/render/canvas/Instruction", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.closePathInstruction = exports.beginPathInstruction = exports.strokeInstruction = exports.fillInstruction = void 0;
    const Instruction = {
        BEGIN_GEOMETRY: 0,
        BEGIN_PATH: 1,
        CIRCLE: 2,
        CLOSE_PATH: 3,
        CUSTOM: 4,
        DRAW_CHARS: 5,
        DRAW_IMAGE: 6,
        END_GEOMETRY: 7,
        FILL: 8,
        MOVE_TO_LINE_TO: 9,
        SET_FILL_STYLE: 10,
        SET_STROKE_STYLE: 11,
        STROKE: 12,
    };
    exports.fillInstruction = [Instruction.FILL];
    exports.strokeInstruction = [Instruction.STROKE];
    exports.beginPathInstruction = [Instruction.BEGIN_PATH];
    exports.closePathInstruction = [Instruction.CLOSE_PATH];
    exports.default = Instruction;
});
define("node_modules/ol/src/render/canvas/Builder", ["require", "exports", "node_modules/ol/src/render/canvas/Instruction", "node_modules/ol/src/geom/GeometryType", "node_modules/ol/src/extent/Relationship", "node_modules/ol/src/render/VectorContext", "node_modules/ol/src/colorlike", "node_modules/ol/src/extent", "node_modules/ol/src/render/canvas", "node_modules/ol/src/array", "node_modules/ol/src/geom/flat/inflate"], function (require, exports, Instruction_js_1, GeometryType_js_13, Relationship_js_2, VectorContext_js_2, colorlike_js_3, extent_js_22, canvas_js_3, array_js_12, inflate_js_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CanvasBuilder extends VectorContext_js_2.default {
        constructor(tolerance, maxExtent, resolution, pixelRatio) {
            super();
            this.tolerance = tolerance;
            this.maxExtent = maxExtent;
            this.pixelRatio = pixelRatio;
            this.maxLineWidth = 0;
            this.resolution = resolution;
            this.beginGeometryInstruction1_ = null;
            this.beginGeometryInstruction2_ = null;
            this.bufferedMaxExtent_ = null;
            this.instructions = [];
            this.coordinates = [];
            this.tmpCoordinate_ = [];
            this.hitDetectionInstructions = [];
            this.state = ({});
        }
        applyPixelRatio(dashArray) {
            const pixelRatio = this.pixelRatio;
            return pixelRatio == 1
                ? dashArray
                : dashArray.map(function (dash) {
                    return dash * pixelRatio;
                });
        }
        appendFlatCoordinates(flatCoordinates, offset, end, stride, closed, skipFirst) {
            let myEnd = this.coordinates.length;
            const extent = this.getBufferedMaxExtent();
            if (skipFirst) {
                offset += stride;
            }
            let lastXCoord = flatCoordinates[offset];
            let lastYCoord = flatCoordinates[offset + 1];
            const nextCoord = this.tmpCoordinate_;
            let skipped = true;
            let i, lastRel, nextRel;
            for (i = offset + stride; i < end; i += stride) {
                nextCoord[0] = flatCoordinates[i];
                nextCoord[1] = flatCoordinates[i + 1];
                nextRel = extent_js_22.coordinateRelationship(extent, nextCoord);
                if (nextRel !== lastRel) {
                    if (skipped) {
                        this.coordinates[myEnd++] = lastXCoord;
                        this.coordinates[myEnd++] = lastYCoord;
                    }
                    this.coordinates[myEnd++] = nextCoord[0];
                    this.coordinates[myEnd++] = nextCoord[1];
                    skipped = false;
                }
                else if (nextRel === Relationship_js_2.default.INTERSECTING) {
                    this.coordinates[myEnd++] = nextCoord[0];
                    this.coordinates[myEnd++] = nextCoord[1];
                    skipped = false;
                }
                else {
                    skipped = true;
                }
                lastXCoord = nextCoord[0];
                lastYCoord = nextCoord[1];
                lastRel = nextRel;
            }
            if ((closed && skipped) || i === offset + stride) {
                this.coordinates[myEnd++] = lastXCoord;
                this.coordinates[myEnd++] = lastYCoord;
            }
            return myEnd;
        }
        drawCustomCoordinates_(flatCoordinates, offset, ends, stride, builderEnds) {
            for (let i = 0, ii = ends.length; i < ii; ++i) {
                const end = ends[i];
                const builderEnd = this.appendFlatCoordinates(flatCoordinates, offset, end, stride, false, false);
                builderEnds.push(builderEnd);
                offset = end;
            }
            return offset;
        }
        drawCustom(geometry, feature, renderer) {
            this.beginGeometry(geometry, feature);
            const type = geometry.getType();
            const stride = geometry.getStride();
            const builderBegin = this.coordinates.length;
            let flatCoordinates, builderEnd, builderEnds, builderEndss;
            let offset;
            if (type == GeometryType_js_13.default.MULTI_POLYGON) {
                flatCoordinates = (geometry).getOrientedFlatCoordinates();
                builderEndss = [];
                const endss = (geometry).getEndss();
                offset = 0;
                for (let i = 0, ii = endss.length; i < ii; ++i) {
                    const myEnds = [];
                    offset = this.drawCustomCoordinates_(flatCoordinates, offset, endss[i], stride, myEnds);
                    builderEndss.push(myEnds);
                }
                this.instructions.push([
                    Instruction_js_1.default.CUSTOM,
                    builderBegin,
                    builderEndss,
                    geometry,
                    renderer,
                    inflate_js_7.inflateMultiCoordinatesArray,
                ]);
            }
            else if (type == GeometryType_js_13.default.POLYGON ||
                type == GeometryType_js_13.default.MULTI_LINE_STRING) {
                builderEnds = [];
                flatCoordinates =
                    type == GeometryType_js_13.default.POLYGON
                        ? (geometry).getOrientedFlatCoordinates()
                        : geometry.getFlatCoordinates();
                offset = this.drawCustomCoordinates_(flatCoordinates, 0, (geometry).getEnds(), stride, builderEnds);
                this.instructions.push([
                    Instruction_js_1.default.CUSTOM,
                    builderBegin,
                    builderEnds,
                    geometry,
                    renderer,
                    inflate_js_7.inflateCoordinatesArray,
                ]);
            }
            else if (type == GeometryType_js_13.default.LINE_STRING ||
                type == GeometryType_js_13.default.MULTI_POINT) {
                flatCoordinates = geometry.getFlatCoordinates();
                builderEnd = this.appendFlatCoordinates(flatCoordinates, 0, flatCoordinates.length, stride, false, false);
                this.instructions.push([
                    Instruction_js_1.default.CUSTOM,
                    builderBegin,
                    builderEnd,
                    geometry,
                    renderer,
                    inflate_js_7.inflateCoordinates,
                ]);
            }
            else if (type == GeometryType_js_13.default.POINT) {
                flatCoordinates = geometry.getFlatCoordinates();
                this.coordinates.push(flatCoordinates[0], flatCoordinates[1]);
                builderEnd = this.coordinates.length;
                this.instructions.push([
                    Instruction_js_1.default.CUSTOM,
                    builderBegin,
                    builderEnd,
                    geometry,
                    renderer,
                ]);
            }
            this.endGeometry(feature);
        }
        beginGeometry(geometry, feature) {
            const extent = geometry.getExtent();
            this.beginGeometryInstruction1_ = [
                Instruction_js_1.default.BEGIN_GEOMETRY,
                feature,
                0,
                extent,
            ];
            this.instructions.push(this.beginGeometryInstruction1_);
            this.beginGeometryInstruction2_ = [
                Instruction_js_1.default.BEGIN_GEOMETRY,
                feature,
                0,
                extent,
            ];
            this.hitDetectionInstructions.push(this.beginGeometryInstruction2_);
        }
        finish() {
            return {
                instructions: this.instructions,
                hitDetectionInstructions: this.hitDetectionInstructions,
                coordinates: this.coordinates,
            };
        }
        reverseHitDetectionInstructions() {
            const hitDetectionInstructions = this.hitDetectionInstructions;
            hitDetectionInstructions.reverse();
            let i;
            const n = hitDetectionInstructions.length;
            let instruction;
            let type;
            let begin = -1;
            for (i = 0; i < n; ++i) {
                instruction = hitDetectionInstructions[i];
                type = (instruction[0]);
                if (type == Instruction_js_1.default.END_GEOMETRY) {
                    begin = i;
                }
                else if (type == Instruction_js_1.default.BEGIN_GEOMETRY) {
                    instruction[2] = i;
                    array_js_12.reverseSubArray(this.hitDetectionInstructions, begin, i);
                    begin = -1;
                }
            }
        }
        setFillStrokeStyle(fillStyle, strokeStyle) {
            const state = this.state;
            if (fillStyle) {
                const fillStyleColor = fillStyle.getColor();
                state.fillStyle = colorlike_js_3.asColorLike(fillStyleColor ? fillStyleColor : canvas_js_3.defaultFillStyle);
            }
            else {
                state.fillStyle = undefined;
            }
            if (strokeStyle) {
                const strokeStyleColor = strokeStyle.getColor();
                state.strokeStyle = colorlike_js_3.asColorLike(strokeStyleColor ? strokeStyleColor : canvas_js_3.defaultStrokeStyle);
                const strokeStyleLineCap = strokeStyle.getLineCap();
                state.lineCap =
                    strokeStyleLineCap !== undefined ? strokeStyleLineCap : canvas_js_3.defaultLineCap;
                const strokeStyleLineDash = strokeStyle.getLineDash();
                state.lineDash = strokeStyleLineDash
                    ? strokeStyleLineDash.slice()
                    : canvas_js_3.defaultLineDash;
                const strokeStyleLineDashOffset = strokeStyle.getLineDashOffset();
                state.lineDashOffset = strokeStyleLineDashOffset
                    ? strokeStyleLineDashOffset
                    : canvas_js_3.defaultLineDashOffset;
                const strokeStyleLineJoin = strokeStyle.getLineJoin();
                state.lineJoin =
                    strokeStyleLineJoin !== undefined
                        ? strokeStyleLineJoin
                        : canvas_js_3.defaultLineJoin;
                const strokeStyleWidth = strokeStyle.getWidth();
                state.lineWidth =
                    strokeStyleWidth !== undefined ? strokeStyleWidth : canvas_js_3.defaultLineWidth;
                const strokeStyleMiterLimit = strokeStyle.getMiterLimit();
                state.miterLimit =
                    strokeStyleMiterLimit !== undefined
                        ? strokeStyleMiterLimit
                        : canvas_js_3.defaultMiterLimit;
                if (state.lineWidth > this.maxLineWidth) {
                    this.maxLineWidth = state.lineWidth;
                    this.bufferedMaxExtent_ = null;
                }
            }
            else {
                state.strokeStyle = undefined;
                state.lineCap = undefined;
                state.lineDash = null;
                state.lineDashOffset = undefined;
                state.lineJoin = undefined;
                state.lineWidth = undefined;
                state.miterLimit = undefined;
            }
        }
        createFill(state) {
            const fillStyle = state.fillStyle;
            const fillInstruction = [Instruction_js_1.default.SET_FILL_STYLE, fillStyle];
            if (typeof fillStyle !== 'string') {
                fillInstruction.push(true);
            }
            return fillInstruction;
        }
        applyStroke(state) {
            this.instructions.push(this.createStroke(state));
        }
        createStroke(state) {
            return [
                Instruction_js_1.default.SET_STROKE_STYLE,
                state.strokeStyle,
                state.lineWidth * this.pixelRatio,
                state.lineCap,
                state.lineJoin,
                state.miterLimit,
                this.applyPixelRatio(state.lineDash),
                state.lineDashOffset * this.pixelRatio,
            ];
        }
        updateFillStyle(state, createFill) {
            const fillStyle = state.fillStyle;
            if (typeof fillStyle !== 'string' || state.currentFillStyle != fillStyle) {
                if (fillStyle !== undefined) {
                    this.instructions.push(createFill.call(this, state));
                }
                state.currentFillStyle = fillStyle;
            }
        }
        updateStrokeStyle(state, applyStroke) {
            const strokeStyle = state.strokeStyle;
            const lineCap = state.lineCap;
            const lineDash = state.lineDash;
            const lineDashOffset = state.lineDashOffset;
            const lineJoin = state.lineJoin;
            const lineWidth = state.lineWidth;
            const miterLimit = state.miterLimit;
            if (state.currentStrokeStyle != strokeStyle ||
                state.currentLineCap != lineCap ||
                (lineDash != state.currentLineDash &&
                    !array_js_12.equals(state.currentLineDash, lineDash)) ||
                state.currentLineDashOffset != lineDashOffset ||
                state.currentLineJoin != lineJoin ||
                state.currentLineWidth != lineWidth ||
                state.currentMiterLimit != miterLimit) {
                if (strokeStyle !== undefined) {
                    applyStroke.call(this, state);
                }
                state.currentStrokeStyle = strokeStyle;
                state.currentLineCap = lineCap;
                state.currentLineDash = lineDash;
                state.currentLineDashOffset = lineDashOffset;
                state.currentLineJoin = lineJoin;
                state.currentLineWidth = lineWidth;
                state.currentMiterLimit = miterLimit;
            }
        }
        endGeometry(feature) {
            this.beginGeometryInstruction1_[2] = this.instructions.length;
            this.beginGeometryInstruction1_ = null;
            this.beginGeometryInstruction2_[2] = this.hitDetectionInstructions.length;
            this.beginGeometryInstruction2_ = null;
            const endGeometryInstruction = [Instruction_js_1.default.END_GEOMETRY, feature];
            this.instructions.push(endGeometryInstruction);
            this.hitDetectionInstructions.push(endGeometryInstruction);
        }
        getBufferedMaxExtent() {
            if (!this.bufferedMaxExtent_) {
                this.bufferedMaxExtent_ = extent_js_22.clone(this.maxExtent);
                if (this.maxLineWidth > 0) {
                    const width = (this.resolution * (this.maxLineWidth + 1)) / 2;
                    extent_js_22.buffer(this.bufferedMaxExtent_, width, this.bufferedMaxExtent_);
                }
            }
            return this.bufferedMaxExtent_;
        }
    }
    exports.default = CanvasBuilder;
});
define("node_modules/ol/src/render/canvas/ImageBuilder", ["require", "exports", "node_modules/ol/src/render/canvas/Builder", "node_modules/ol/src/render/canvas/Instruction"], function (require, exports, Builder_js_1, Instruction_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CanvasImageBuilder extends Builder_js_1.default {
        constructor(tolerance, maxExtent, resolution, pixelRatio) {
            super(tolerance, maxExtent, resolution, pixelRatio);
            this.declutterGroups_ = null;
            this.hitDetectionImage_ = null;
            this.image_ = null;
            this.imagePixelRatio_ = undefined;
            this.anchorX_ = undefined;
            this.anchorY_ = undefined;
            this.height_ = undefined;
            this.opacity_ = undefined;
            this.originX_ = undefined;
            this.originY_ = undefined;
            this.rotateWithView_ = undefined;
            this.rotation_ = undefined;
            this.scale_ = undefined;
            this.width_ = undefined;
        }
        drawCoordinates_(flatCoordinates, offset, end, stride) {
            return this.appendFlatCoordinates(flatCoordinates, offset, end, stride, false, false);
        }
        drawPoint(pointGeometry, feature) {
            if (!this.image_) {
                return;
            }
            this.beginGeometry(pointGeometry, feature);
            const flatCoordinates = pointGeometry.getFlatCoordinates();
            const stride = pointGeometry.getStride();
            const myBegin = this.coordinates.length;
            const myEnd = this.drawCoordinates_(flatCoordinates, 0, flatCoordinates.length, stride);
            this.instructions.push([
                Instruction_js_2.default.DRAW_IMAGE,
                myBegin,
                myEnd,
                this.image_,
                this.anchorX_ * this.imagePixelRatio_,
                this.anchorY_ * this.imagePixelRatio_,
                this.declutterGroups_,
                Math.ceil(this.height_ * this.imagePixelRatio_),
                this.opacity_,
                this.originX_,
                this.originY_,
                this.rotateWithView_,
                this.rotation_,
                [
                    (this.scale_[0] * this.pixelRatio) / this.imagePixelRatio_,
                    (this.scale_[1] * this.pixelRatio) / this.imagePixelRatio_,
                ],
                Math.ceil(this.width_ * this.imagePixelRatio_),
            ]);
            this.hitDetectionInstructions.push([
                Instruction_js_2.default.DRAW_IMAGE,
                myBegin,
                myEnd,
                this.hitDetectionImage_,
                this.anchorX_,
                this.anchorY_,
                this.declutterGroups_,
                this.height_,
                this.opacity_,
                this.originX_,
                this.originY_,
                this.rotateWithView_,
                this.rotation_,
                this.scale_,
                this.width_,
            ]);
            this.endGeometry(feature);
        }
        drawMultiPoint(multiPointGeometry, feature) {
            if (!this.image_) {
                return;
            }
            this.beginGeometry(multiPointGeometry, feature);
            const flatCoordinates = multiPointGeometry.getFlatCoordinates();
            const stride = multiPointGeometry.getStride();
            const myBegin = this.coordinates.length;
            const myEnd = this.drawCoordinates_(flatCoordinates, 0, flatCoordinates.length, stride);
            this.instructions.push([
                Instruction_js_2.default.DRAW_IMAGE,
                myBegin,
                myEnd,
                this.image_,
                this.anchorX_ * this.imagePixelRatio_,
                this.anchorY_ * this.imagePixelRatio_,
                this.declutterGroups_,
                Math.ceil(this.height_ * this.imagePixelRatio_),
                this.opacity_,
                this.originX_,
                this.originY_,
                this.rotateWithView_,
                this.rotation_,
                [
                    (this.scale_[0] * this.pixelRatio) / this.imagePixelRatio_,
                    (this.scale_[1] * this.pixelRatio) / this.imagePixelRatio_,
                ],
                Math.ceil(this.width_ * this.imagePixelRatio_),
            ]);
            this.hitDetectionInstructions.push([
                Instruction_js_2.default.DRAW_IMAGE,
                myBegin,
                myEnd,
                this.hitDetectionImage_,
                this.anchorX_,
                this.anchorY_,
                this.declutterGroups_,
                this.height_,
                this.opacity_,
                this.originX_,
                this.originY_,
                this.rotateWithView_,
                this.rotation_,
                this.scale_,
                this.width_,
            ]);
            this.endGeometry(feature);
        }
        finish() {
            this.reverseHitDetectionInstructions();
            this.anchorX_ = undefined;
            this.anchorY_ = undefined;
            this.hitDetectionImage_ = null;
            this.image_ = null;
            this.imagePixelRatio_ = undefined;
            this.height_ = undefined;
            this.scale_ = undefined;
            this.opacity_ = undefined;
            this.originX_ = undefined;
            this.originY_ = undefined;
            this.rotateWithView_ = undefined;
            this.rotation_ = undefined;
            this.width_ = undefined;
            return super.finish();
        }
        setImageStyle(imageStyle, declutterGroups) {
            const anchor = imageStyle.getAnchor();
            const size = imageStyle.getSize();
            const hitDetectionImage = imageStyle.getHitDetectionImage();
            const image = imageStyle.getImage(this.pixelRatio);
            const origin = imageStyle.getOrigin();
            this.imagePixelRatio_ = imageStyle.getPixelRatio(this.pixelRatio);
            this.anchorX_ = anchor[0];
            this.anchorY_ = anchor[1];
            this.declutterGroups_ = declutterGroups;
            this.hitDetectionImage_ = hitDetectionImage;
            this.image_ = image;
            this.height_ = size[1];
            this.opacity_ = imageStyle.getOpacity();
            this.originX_ = origin[0];
            this.originY_ = origin[1];
            this.rotateWithView_ = imageStyle.getRotateWithView();
            this.rotation_ = imageStyle.getRotation();
            this.scale_ = imageStyle.getScaleArray();
            this.width_ = size[0];
        }
    }
    exports.default = CanvasImageBuilder;
});
define("node_modules/ol/src/render/canvas/LineStringBuilder", ["require", "exports", "node_modules/ol/src/render/canvas/Builder", "node_modules/ol/src/render/canvas/Instruction"], function (require, exports, Builder_js_2, Instruction_js_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CanvasLineStringBuilder extends Builder_js_2.default {
        constructor(tolerance, maxExtent, resolution, pixelRatio) {
            super(tolerance, maxExtent, resolution, pixelRatio);
        }
        drawFlatCoordinates_(flatCoordinates, offset, end, stride) {
            const myBegin = this.coordinates.length;
            const myEnd = this.appendFlatCoordinates(flatCoordinates, offset, end, stride, false, false);
            const moveToLineToInstruction = [
                Instruction_js_3.default.MOVE_TO_LINE_TO,
                myBegin,
                myEnd,
            ];
            this.instructions.push(moveToLineToInstruction);
            this.hitDetectionInstructions.push(moveToLineToInstruction);
            return end;
        }
        drawLineString(lineStringGeometry, feature) {
            const state = this.state;
            const strokeStyle = state.strokeStyle;
            const lineWidth = state.lineWidth;
            if (strokeStyle === undefined || lineWidth === undefined) {
                return;
            }
            this.updateStrokeStyle(state, this.applyStroke);
            this.beginGeometry(lineStringGeometry, feature);
            this.hitDetectionInstructions.push([
                Instruction_js_3.default.SET_STROKE_STYLE,
                state.strokeStyle,
                state.lineWidth,
                state.lineCap,
                state.lineJoin,
                state.miterLimit,
                state.lineDash,
                state.lineDashOffset,
            ], Instruction_js_3.beginPathInstruction);
            const flatCoordinates = lineStringGeometry.getFlatCoordinates();
            const stride = lineStringGeometry.getStride();
            this.drawFlatCoordinates_(flatCoordinates, 0, flatCoordinates.length, stride);
            this.hitDetectionInstructions.push(Instruction_js_3.strokeInstruction);
            this.endGeometry(feature);
        }
        drawMultiLineString(multiLineStringGeometry, feature) {
            const state = this.state;
            const strokeStyle = state.strokeStyle;
            const lineWidth = state.lineWidth;
            if (strokeStyle === undefined || lineWidth === undefined) {
                return;
            }
            this.updateStrokeStyle(state, this.applyStroke);
            this.beginGeometry(multiLineStringGeometry, feature);
            this.hitDetectionInstructions.push([
                Instruction_js_3.default.SET_STROKE_STYLE,
                state.strokeStyle,
                state.lineWidth,
                state.lineCap,
                state.lineJoin,
                state.miterLimit,
                state.lineDash,
                state.lineDashOffset,
            ], Instruction_js_3.beginPathInstruction);
            const ends = multiLineStringGeometry.getEnds();
            const flatCoordinates = multiLineStringGeometry.getFlatCoordinates();
            const stride = multiLineStringGeometry.getStride();
            let offset = 0;
            for (let i = 0, ii = ends.length; i < ii; ++i) {
                offset = this.drawFlatCoordinates_(flatCoordinates, offset, (ends[i]), stride);
            }
            this.hitDetectionInstructions.push(Instruction_js_3.strokeInstruction);
            this.endGeometry(feature);
        }
        finish() {
            const state = this.state;
            if (state.lastStroke != undefined &&
                state.lastStroke != this.coordinates.length) {
                this.instructions.push(Instruction_js_3.strokeInstruction);
            }
            this.reverseHitDetectionInstructions();
            this.state = null;
            return super.finish();
        }
        applyStroke(state) {
            if (state.lastStroke != undefined &&
                state.lastStroke != this.coordinates.length) {
                this.instructions.push(Instruction_js_3.strokeInstruction);
                state.lastStroke = this.coordinates.length;
            }
            state.lastStroke = 0;
            super.applyStroke(state);
            this.instructions.push(Instruction_js_3.beginPathInstruction);
        }
    }
    exports.default = CanvasLineStringBuilder;
});
define("node_modules/ol/src/render/canvas/PolygonBuilder", ["require", "exports", "node_modules/ol/src/render/canvas/Builder", "node_modules/ol/src/render/canvas/Instruction", "node_modules/ol/src/render/canvas", "node_modules/ol/src/geom/flat/simplify"], function (require, exports, Builder_js_3, Instruction_js_4, canvas_js_4, simplify_js_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CanvasPolygonBuilder extends Builder_js_3.default {
        constructor(tolerance, maxExtent, resolution, pixelRatio) {
            super(tolerance, maxExtent, resolution, pixelRatio);
        }
        drawFlatCoordinatess_(flatCoordinates, offset, ends, stride) {
            const state = this.state;
            const fill = state.fillStyle !== undefined;
            const stroke = state.strokeStyle !== undefined;
            const numEnds = ends.length;
            this.instructions.push(Instruction_js_4.beginPathInstruction);
            this.hitDetectionInstructions.push(Instruction_js_4.beginPathInstruction);
            for (let i = 0; i < numEnds; ++i) {
                const end = ends[i];
                const myBegin = this.coordinates.length;
                const myEnd = this.appendFlatCoordinates(flatCoordinates, offset, end, stride, true, !stroke);
                const moveToLineToInstruction = [
                    Instruction_js_4.default.MOVE_TO_LINE_TO,
                    myBegin,
                    myEnd,
                ];
                this.instructions.push(moveToLineToInstruction);
                this.hitDetectionInstructions.push(moveToLineToInstruction);
                if (stroke) {
                    this.instructions.push(Instruction_js_4.closePathInstruction);
                    this.hitDetectionInstructions.push(Instruction_js_4.closePathInstruction);
                }
                offset = end;
            }
            if (fill) {
                this.instructions.push(Instruction_js_4.fillInstruction);
                this.hitDetectionInstructions.push(Instruction_js_4.fillInstruction);
            }
            if (stroke) {
                this.instructions.push(Instruction_js_4.strokeInstruction);
                this.hitDetectionInstructions.push(Instruction_js_4.strokeInstruction);
            }
            return offset;
        }
        drawCircle(circleGeometry, feature) {
            const state = this.state;
            const fillStyle = state.fillStyle;
            const strokeStyle = state.strokeStyle;
            if (fillStyle === undefined && strokeStyle === undefined) {
                return;
            }
            this.setFillStrokeStyles_();
            this.beginGeometry(circleGeometry, feature);
            if (state.fillStyle !== undefined) {
                this.hitDetectionInstructions.push([
                    Instruction_js_4.default.SET_FILL_STYLE,
                    canvas_js_4.defaultFillStyle,
                ]);
            }
            if (state.strokeStyle !== undefined) {
                this.hitDetectionInstructions.push([
                    Instruction_js_4.default.SET_STROKE_STYLE,
                    state.strokeStyle,
                    state.lineWidth,
                    state.lineCap,
                    state.lineJoin,
                    state.miterLimit,
                    state.lineDash,
                    state.lineDashOffset,
                ]);
            }
            const flatCoordinates = circleGeometry.getFlatCoordinates();
            const stride = circleGeometry.getStride();
            const myBegin = this.coordinates.length;
            this.appendFlatCoordinates(flatCoordinates, 0, flatCoordinates.length, stride, false, false);
            const circleInstruction = [Instruction_js_4.default.CIRCLE, myBegin];
            this.instructions.push(Instruction_js_4.beginPathInstruction, circleInstruction);
            this.hitDetectionInstructions.push(Instruction_js_4.beginPathInstruction, circleInstruction);
            if (state.fillStyle !== undefined) {
                this.instructions.push(Instruction_js_4.fillInstruction);
                this.hitDetectionInstructions.push(Instruction_js_4.fillInstruction);
            }
            if (state.strokeStyle !== undefined) {
                this.instructions.push(Instruction_js_4.strokeInstruction);
                this.hitDetectionInstructions.push(Instruction_js_4.strokeInstruction);
            }
            this.endGeometry(feature);
        }
        drawPolygon(polygonGeometry, feature) {
            const state = this.state;
            const fillStyle = state.fillStyle;
            const strokeStyle = state.strokeStyle;
            if (fillStyle === undefined && strokeStyle === undefined) {
                return;
            }
            this.setFillStrokeStyles_();
            this.beginGeometry(polygonGeometry, feature);
            if (state.fillStyle !== undefined) {
                this.hitDetectionInstructions.push([
                    Instruction_js_4.default.SET_FILL_STYLE,
                    canvas_js_4.defaultFillStyle,
                ]);
            }
            if (state.strokeStyle !== undefined) {
                this.hitDetectionInstructions.push([
                    Instruction_js_4.default.SET_STROKE_STYLE,
                    state.strokeStyle,
                    state.lineWidth,
                    state.lineCap,
                    state.lineJoin,
                    state.miterLimit,
                    state.lineDash,
                    state.lineDashOffset,
                ]);
            }
            const ends = polygonGeometry.getEnds();
            const flatCoordinates = polygonGeometry.getOrientedFlatCoordinates();
            const stride = polygonGeometry.getStride();
            this.drawFlatCoordinatess_(flatCoordinates, 0, (ends), stride);
            this.endGeometry(feature);
        }
        drawMultiPolygon(multiPolygonGeometry, feature) {
            const state = this.state;
            const fillStyle = state.fillStyle;
            const strokeStyle = state.strokeStyle;
            if (fillStyle === undefined && strokeStyle === undefined) {
                return;
            }
            this.setFillStrokeStyles_();
            this.beginGeometry(multiPolygonGeometry, feature);
            if (state.fillStyle !== undefined) {
                this.hitDetectionInstructions.push([
                    Instruction_js_4.default.SET_FILL_STYLE,
                    canvas_js_4.defaultFillStyle,
                ]);
            }
            if (state.strokeStyle !== undefined) {
                this.hitDetectionInstructions.push([
                    Instruction_js_4.default.SET_STROKE_STYLE,
                    state.strokeStyle,
                    state.lineWidth,
                    state.lineCap,
                    state.lineJoin,
                    state.miterLimit,
                    state.lineDash,
                    state.lineDashOffset,
                ]);
            }
            const endss = multiPolygonGeometry.getEndss();
            const flatCoordinates = multiPolygonGeometry.getOrientedFlatCoordinates();
            const stride = multiPolygonGeometry.getStride();
            let offset = 0;
            for (let i = 0, ii = endss.length; i < ii; ++i) {
                offset = this.drawFlatCoordinatess_(flatCoordinates, offset, endss[i], stride);
            }
            this.endGeometry(feature);
        }
        finish() {
            this.reverseHitDetectionInstructions();
            this.state = null;
            const tolerance = this.tolerance;
            if (tolerance !== 0) {
                const coordinates = this.coordinates;
                for (let i = 0, ii = coordinates.length; i < ii; ++i) {
                    coordinates[i] = simplify_js_6.snap(coordinates[i], tolerance);
                }
            }
            return super.finish();
        }
        setFillStrokeStyles_() {
            const state = this.state;
            const fillStyle = state.fillStyle;
            if (fillStyle !== undefined) {
                this.updateFillStyle(state, this.createFill);
            }
            if (state.strokeStyle !== undefined) {
                this.updateStrokeStyle(state, this.applyStroke);
            }
        }
    }
    exports.default = CanvasPolygonBuilder;
});
define("node_modules/ol/src/geom/flat/straightchunk", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.matchingChunk = void 0;
    function matchingChunk(maxAngle, flatCoordinates, offset, end, stride) {
        let chunkStart = offset;
        let chunkEnd = offset;
        let chunkM = 0;
        let m = 0;
        let start = offset;
        let acos, i, m12, m23, x1, y1, x12, y12, x23, y23;
        for (i = offset; i < end; i += stride) {
            const x2 = flatCoordinates[i];
            const y2 = flatCoordinates[i + 1];
            if (x1 !== undefined) {
                x23 = x2 - x1;
                y23 = y2 - y1;
                m23 = Math.sqrt(x23 * x23 + y23 * y23);
                if (x12 !== undefined) {
                    m += m12;
                    acos = Math.acos((x12 * x23 + y12 * y23) / (m12 * m23));
                    if (acos > maxAngle) {
                        if (m > chunkM) {
                            chunkM = m;
                            chunkStart = start;
                            chunkEnd = i;
                        }
                        m = 0;
                        start = i - stride;
                    }
                }
                m12 = m23;
                x12 = x23;
                y12 = y23;
            }
            x1 = x2;
            y1 = y2;
        }
        m += m23;
        return m > chunkM ? [start, i] : [chunkStart, chunkEnd];
    }
    exports.matchingChunk = matchingChunk;
});
define("node_modules/ol/src/render/canvas/TextBuilder", ["require", "exports", "node_modules/ol/src/render/canvas/Builder", "node_modules/ol/src/render/canvas/Instruction", "node_modules/ol/src/geom/GeometryType", "node_modules/ol/src/style/TextPlacement", "node_modules/ol/src/colorlike", "node_modules/ol/src/render/canvas", "node_modules/ol/src/util", "node_modules/ol/src/extent", "node_modules/ol/src/geom/flat/straightchunk"], function (require, exports, Builder_js_4, Instruction_js_5, GeometryType_js_14, TextPlacement_js_2, colorlike_js_4, canvas_js_5, util_js_7, extent_js_23, straightchunk_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TEXT_ALIGN = void 0;
    exports.TEXT_ALIGN = {
        'left': 0,
        'end': 0,
        'center': 0.5,
        'right': 1,
        'start': 1,
        'top': 0,
        'middle': 0.5,
        'hanging': 0.2,
        'alphabetic': 0.8,
        'ideographic': 0.8,
        'bottom': 1,
    };
    class CanvasTextBuilder extends Builder_js_4.default {
        constructor(tolerance, maxExtent, resolution, pixelRatio) {
            super(tolerance, maxExtent, resolution, pixelRatio);
            this.declutterGroups_;
            this.labels_ = null;
            this.text_ = '';
            this.textOffsetX_ = 0;
            this.textOffsetY_ = 0;
            this.textRotateWithView_ = undefined;
            this.textRotation_ = 0;
            this.textFillState_ = null;
            this.fillStates = {};
            this.textStrokeState_ = null;
            this.strokeStates = {};
            this.textState_ = ({});
            this.textStates = {};
            this.textKey_ = '';
            this.fillKey_ = '';
            this.strokeKey_ = '';
        }
        finish() {
            const instructions = super.finish();
            instructions.textStates = this.textStates;
            instructions.fillStates = this.fillStates;
            instructions.strokeStates = this.strokeStates;
            return instructions;
        }
        drawText(geometry, feature) {
            const fillState = this.textFillState_;
            const strokeState = this.textStrokeState_;
            const textState = this.textState_;
            if (this.text_ === '' || !textState || (!fillState && !strokeState)) {
                return;
            }
            let begin = this.coordinates.length;
            const geometryType = geometry.getType();
            let flatCoordinates = null;
            let end = 2;
            let stride = geometry.getStride();
            let i, ii;
            if (textState.placement === TextPlacement_js_2.default.LINE) {
                if (!extent_js_23.intersects(this.getBufferedMaxExtent(), geometry.getExtent())) {
                    return;
                }
                let ends;
                flatCoordinates = geometry.getFlatCoordinates();
                if (geometryType == GeometryType_js_14.default.LINE_STRING) {
                    ends = [flatCoordinates.length];
                }
                else if (geometryType == GeometryType_js_14.default.MULTI_LINE_STRING) {
                    ends = (geometry).getEnds();
                }
                else if (geometryType == GeometryType_js_14.default.POLYGON) {
                    ends = (geometry)
                        .getEnds()
                        .slice(0, 1);
                }
                else if (geometryType == GeometryType_js_14.default.MULTI_POLYGON) {
                    const endss = (geometry).getEndss();
                    ends = [];
                    for (i = 0, ii = endss.length; i < ii; ++i) {
                        ends.push(endss[i][0]);
                    }
                }
                this.beginGeometry(geometry, feature);
                const textAlign = textState.textAlign;
                let flatOffset = 0;
                let flatEnd;
                for (let o = 0, oo = ends.length; o < oo; ++o) {
                    if (textAlign == undefined) {
                        const range = straightchunk_js_1.matchingChunk(textState.maxAngle, flatCoordinates, flatOffset, ends[o], stride);
                        flatOffset = range[0];
                        flatEnd = range[1];
                    }
                    else {
                        flatEnd = ends[o];
                    }
                    for (i = flatOffset; i < flatEnd; i += stride) {
                        this.coordinates.push(flatCoordinates[i], flatCoordinates[i + 1]);
                    }
                    end = this.coordinates.length;
                    flatOffset = ends[o];
                    const declutterGroup = this.declutterGroups_
                        ? o === 0
                            ? this.declutterGroups_[0]
                            : [].concat(this.declutterGroups_[0])
                        : null;
                    this.drawChars_(begin, end, declutterGroup);
                    begin = end;
                }
                this.endGeometry(feature);
            }
            else {
                let geometryWidths = null;
                if (!textState.overflow) {
                    geometryWidths = [];
                }
                switch (geometryType) {
                    case GeometryType_js_14.default.POINT:
                    case GeometryType_js_14.default.MULTI_POINT:
                        flatCoordinates = (geometry).getFlatCoordinates();
                        end = flatCoordinates.length;
                        break;
                    case GeometryType_js_14.default.LINE_STRING:
                        flatCoordinates = (geometry).getFlatMidpoint();
                        break;
                    case GeometryType_js_14.default.CIRCLE:
                        flatCoordinates = (geometry).getCenter();
                        break;
                    case GeometryType_js_14.default.MULTI_LINE_STRING:
                        flatCoordinates = (geometry).getFlatMidpoints();
                        stride = 2;
                        end = flatCoordinates.length;
                        break;
                    case GeometryType_js_14.default.POLYGON:
                        flatCoordinates = (geometry).getFlatInteriorPoint();
                        if (!textState.overflow) {
                            geometryWidths.push(flatCoordinates[2] / this.resolution);
                        }
                        stride = 3;
                        break;
                    case GeometryType_js_14.default.MULTI_POLYGON:
                        const interiorPoints = (geometry).getFlatInteriorPoints();
                        flatCoordinates = [];
                        for (i = 0, ii = interiorPoints.length; i < ii; i += 3) {
                            if (!textState.overflow) {
                                geometryWidths.push(interiorPoints[i + 2] / this.resolution);
                            }
                            flatCoordinates.push(interiorPoints[i], interiorPoints[i + 1]);
                        }
                        stride = 2;
                        end = flatCoordinates.length;
                        if (end == 0) {
                            return;
                        }
                        break;
                    default:
                }
                end = this.appendFlatCoordinates(flatCoordinates, 0, end, stride, false, false);
                this.saveTextStates_();
                if (textState.backgroundFill || textState.backgroundStroke) {
                    this.setFillStrokeStyle(textState.backgroundFill, textState.backgroundStroke);
                    if (textState.backgroundFill) {
                        this.updateFillStyle(this.state, this.createFill);
                        this.hitDetectionInstructions.push(this.createFill(this.state));
                    }
                    if (textState.backgroundStroke) {
                        this.updateStrokeStyle(this.state, this.applyStroke);
                        this.hitDetectionInstructions.push(this.createStroke(this.state));
                    }
                }
                this.beginGeometry(geometry, feature);
                let padding = textState.padding;
                if (padding != canvas_js_5.defaultPadding &&
                    (textState.scale[0] < 0 || textState.scale[1] < 0)) {
                    let p0 = textState.padding[0];
                    let p1 = textState.padding[1];
                    let p2 = textState.padding[2];
                    let p3 = textState.padding[3];
                    if (textState.scale[0] < 0) {
                        p1 = -p1;
                        p3 = -p3;
                    }
                    if (textState.scale[1] < 0) {
                        p0 = -p0;
                        p2 = -p2;
                    }
                    padding = [p0, p1, p2, p3];
                }
                const pixelRatio = this.pixelRatio;
                this.instructions.push([
                    Instruction_js_5.default.DRAW_IMAGE,
                    begin,
                    end,
                    null,
                    NaN,
                    NaN,
                    this.declutterGroups_,
                    NaN,
                    1,
                    0,
                    0,
                    this.textRotateWithView_,
                    this.textRotation_,
                    [1, 1],
                    NaN,
                    padding == canvas_js_5.defaultPadding
                        ? canvas_js_5.defaultPadding
                        : padding.map(function (p) {
                            return p * pixelRatio;
                        }),
                    !!textState.backgroundFill,
                    !!textState.backgroundStroke,
                    this.text_,
                    this.textKey_,
                    this.strokeKey_,
                    this.fillKey_,
                    this.textOffsetX_,
                    this.textOffsetY_,
                    geometryWidths,
                ]);
                const scale = 1 / pixelRatio;
                this.hitDetectionInstructions.push([
                    Instruction_js_5.default.DRAW_IMAGE,
                    begin,
                    end,
                    null,
                    NaN,
                    NaN,
                    this.declutterGroups_,
                    NaN,
                    1,
                    0,
                    0,
                    this.textRotateWithView_,
                    this.textRotation_,
                    [scale, scale],
                    NaN,
                    padding,
                    !!textState.backgroundFill,
                    !!textState.backgroundStroke,
                    this.text_,
                    this.textKey_,
                    this.strokeKey_,
                    this.fillKey_,
                    this.textOffsetX_,
                    this.textOffsetY_,
                    geometryWidths,
                ]);
                this.endGeometry(feature);
            }
        }
        saveTextStates_() {
            const strokeState = this.textStrokeState_;
            const textState = this.textState_;
            const fillState = this.textFillState_;
            const strokeKey = this.strokeKey_;
            if (strokeState) {
                if (!(strokeKey in this.strokeStates)) {
                    this.strokeStates[strokeKey] = {
                        strokeStyle: strokeState.strokeStyle,
                        lineCap: strokeState.lineCap,
                        lineDashOffset: strokeState.lineDashOffset,
                        lineWidth: strokeState.lineWidth,
                        lineJoin: strokeState.lineJoin,
                        miterLimit: strokeState.miterLimit,
                        lineDash: strokeState.lineDash,
                    };
                }
            }
            const textKey = this.textKey_;
            if (!(textKey in this.textStates)) {
                this.textStates[textKey] = {
                    font: textState.font,
                    textAlign: textState.textAlign || canvas_js_5.defaultTextAlign,
                    textBaseline: textState.textBaseline || canvas_js_5.defaultTextBaseline,
                    scale: textState.scale,
                };
            }
            const fillKey = this.fillKey_;
            if (fillState) {
                if (!(fillKey in this.fillStates)) {
                    this.fillStates[fillKey] = {
                        fillStyle: fillState.fillStyle,
                    };
                }
            }
        }
        drawChars_(begin, end, declutterGroup) {
            const strokeState = this.textStrokeState_;
            const textState = this.textState_;
            const strokeKey = this.strokeKey_;
            const textKey = this.textKey_;
            const fillKey = this.fillKey_;
            this.saveTextStates_();
            const pixelRatio = this.pixelRatio;
            const baseline = exports.TEXT_ALIGN[textState.textBaseline];
            const offsetY = this.textOffsetY_ * pixelRatio;
            const text = this.text_;
            const strokeWidth = strokeState
                ? (strokeState.lineWidth * Math.abs(textState.scale[0])) / 2
                : 0;
            this.instructions.push([
                Instruction_js_5.default.DRAW_CHARS,
                begin,
                end,
                baseline,
                declutterGroup,
                textState.overflow,
                fillKey,
                textState.maxAngle,
                pixelRatio,
                offsetY,
                strokeKey,
                strokeWidth * pixelRatio,
                text,
                textKey,
                1,
            ]);
            this.hitDetectionInstructions.push([
                Instruction_js_5.default.DRAW_CHARS,
                begin,
                end,
                baseline,
                declutterGroup,
                textState.overflow,
                fillKey,
                textState.maxAngle,
                1,
                offsetY,
                strokeKey,
                strokeWidth,
                text,
                textKey,
                1 / pixelRatio,
            ]);
        }
        setTextStyle(textStyle, declutterGroups) {
            let textState, fillState, strokeState;
            if (!textStyle) {
                this.text_ = '';
            }
            else {
                this.declutterGroups_ = declutterGroups;
                const textFillStyle = textStyle.getFill();
                if (!textFillStyle) {
                    fillState = null;
                    this.textFillState_ = fillState;
                }
                else {
                    fillState = this.textFillState_;
                    if (!fillState) {
                        fillState = ({});
                        this.textFillState_ = fillState;
                    }
                    fillState.fillStyle = colorlike_js_4.asColorLike(textFillStyle.getColor() || canvas_js_5.defaultFillStyle);
                }
                const textStrokeStyle = textStyle.getStroke();
                if (!textStrokeStyle) {
                    strokeState = null;
                    this.textStrokeState_ = strokeState;
                }
                else {
                    strokeState = this.textStrokeState_;
                    if (!strokeState) {
                        strokeState = ({});
                        this.textStrokeState_ = strokeState;
                    }
                    const lineDash = textStrokeStyle.getLineDash();
                    const lineDashOffset = textStrokeStyle.getLineDashOffset();
                    const lineWidth = textStrokeStyle.getWidth();
                    const miterLimit = textStrokeStyle.getMiterLimit();
                    strokeState.lineCap = textStrokeStyle.getLineCap() || canvas_js_5.defaultLineCap;
                    strokeState.lineDash = lineDash ? lineDash.slice() : canvas_js_5.defaultLineDash;
                    strokeState.lineDashOffset =
                        lineDashOffset === undefined ? canvas_js_5.defaultLineDashOffset : lineDashOffset;
                    strokeState.lineJoin = textStrokeStyle.getLineJoin() || canvas_js_5.defaultLineJoin;
                    strokeState.lineWidth =
                        lineWidth === undefined ? canvas_js_5.defaultLineWidth : lineWidth;
                    strokeState.miterLimit =
                        miterLimit === undefined ? canvas_js_5.defaultMiterLimit : miterLimit;
                    strokeState.strokeStyle = colorlike_js_4.asColorLike(textStrokeStyle.getColor() || canvas_js_5.defaultStrokeStyle);
                }
                textState = this.textState_;
                const font = textStyle.getFont() || canvas_js_5.defaultFont;
                canvas_js_5.registerFont(font);
                const textScale = textStyle.getScaleArray();
                textState.overflow = textStyle.getOverflow();
                textState.font = font;
                textState.maxAngle = textStyle.getMaxAngle();
                textState.placement = textStyle.getPlacement();
                textState.textAlign = textStyle.getTextAlign();
                textState.textBaseline =
                    textStyle.getTextBaseline() || canvas_js_5.defaultTextBaseline;
                textState.backgroundFill = textStyle.getBackgroundFill();
                textState.backgroundStroke = textStyle.getBackgroundStroke();
                textState.padding = textStyle.getPadding() || canvas_js_5.defaultPadding;
                textState.scale = textScale === undefined ? [1, 1] : textScale;
                const textOffsetX = textStyle.getOffsetX();
                const textOffsetY = textStyle.getOffsetY();
                const textRotateWithView = textStyle.getRotateWithView();
                const textRotation = textStyle.getRotation();
                this.text_ = textStyle.getText() || '';
                this.textOffsetX_ = textOffsetX === undefined ? 0 : textOffsetX;
                this.textOffsetY_ = textOffsetY === undefined ? 0 : textOffsetY;
                this.textRotateWithView_ =
                    textRotateWithView === undefined ? false : textRotateWithView;
                this.textRotation_ = textRotation === undefined ? 0 : textRotation;
                this.strokeKey_ = strokeState
                    ? (typeof strokeState.strokeStyle == 'string'
                        ? strokeState.strokeStyle
                        : util_js_7.getUid(strokeState.strokeStyle)) +
                        strokeState.lineCap +
                        strokeState.lineDashOffset +
                        '|' +
                        strokeState.lineWidth +
                        strokeState.lineJoin +
                        strokeState.miterLimit +
                        '[' +
                        strokeState.lineDash.join() +
                        ']'
                    : '';
                this.textKey_ =
                    textState.font +
                        textState.scale +
                        (textState.textAlign || '?') +
                        (textState.textBaseline || '?');
                this.fillKey_ = fillState
                    ? typeof fillState.fillStyle == 'string'
                        ? fillState.fillStyle
                        : '|' + util_js_7.getUid(fillState.fillStyle)
                    : '';
            }
        }
    }
    exports.default = CanvasTextBuilder;
});
define("node_modules/ol/src/render/canvas/BuilderGroup", ["require", "exports", "node_modules/ol/src/render/canvas/Builder", "node_modules/ol/src/render/canvas/ImageBuilder", "node_modules/ol/src/render/canvas/LineStringBuilder", "node_modules/ol/src/render/canvas/PolygonBuilder", "node_modules/ol/src/render/canvas/TextBuilder"], function (require, exports, Builder_js_5, ImageBuilder_js_1, LineStringBuilder_js_1, PolygonBuilder_js_1, TextBuilder_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const BATCH_CONSTRUCTORS = {
        'Circle': PolygonBuilder_js_1.default,
        'Default': Builder_js_5.default,
        'Image': ImageBuilder_js_1.default,
        'LineString': LineStringBuilder_js_1.default,
        'Polygon': PolygonBuilder_js_1.default,
        'Text': TextBuilder_js_1.default,
    };
    class BuilderGroup {
        constructor(tolerance, maxExtent, resolution, pixelRatio, declutter) {
            this.declutter_ = declutter;
            this.declutterGroups_ = null;
            this.tolerance_ = tolerance;
            this.maxExtent_ = maxExtent;
            this.pixelRatio_ = pixelRatio;
            this.resolution_ = resolution;
            this.buildersByZIndex_ = {};
        }
        addDeclutter(group) {
            let declutter = null;
            if (this.declutter_) {
                if (group) {
                    declutter = this.declutterGroups_;
                    (declutter[0][0])++;
                }
                else {
                    declutter = [[1]];
                    this.declutterGroups_ = declutter;
                }
            }
            return declutter;
        }
        finish() {
            const builderInstructions = {};
            for (const zKey in this.buildersByZIndex_) {
                builderInstructions[zKey] = builderInstructions[zKey] || {};
                const builders = this.buildersByZIndex_[zKey];
                for (const builderKey in builders) {
                    const builderInstruction = builders[builderKey].finish();
                    builderInstructions[zKey][builderKey] = builderInstruction;
                }
            }
            return builderInstructions;
        }
        getBuilder(zIndex, builderType) {
            const zIndexKey = zIndex !== undefined ? zIndex.toString() : '0';
            let replays = this.buildersByZIndex_[zIndexKey];
            if (replays === undefined) {
                replays = {};
                this.buildersByZIndex_[zIndexKey] = replays;
            }
            let replay = replays[builderType];
            if (replay === undefined) {
                const Constructor = BATCH_CONSTRUCTORS[builderType];
                replay = new Constructor(this.tolerance_, this.maxExtent_, this.resolution_, this.pixelRatio_);
                replays[builderType] = replay;
            }
            return replay;
        }
    }
    exports.default = BuilderGroup;
});
define("node_modules/ol/src/renderer/vector", ["require", "exports", "node_modules/ol/src/render/canvas/BuilderType", "node_modules/ol/src/geom/GeometryType", "node_modules/ol/src/ImageState", "node_modules/ol/src/util"], function (require, exports, BuilderType_js_1, GeometryType_js_15, ImageState_js_2, util_js_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderFeature = exports.getTolerance = exports.getSquaredTolerance = exports.defaultOrder = void 0;
    const SIMPLIFY_TOLERANCE = 0.5;
    const GEOMETRY_RENDERERS = {
        'Point': renderPointGeometry,
        'LineString': renderLineStringGeometry,
        'Polygon': renderPolygonGeometry,
        'MultiPoint': renderMultiPointGeometry,
        'MultiLineString': renderMultiLineStringGeometry,
        'MultiPolygon': renderMultiPolygonGeometry,
        'GeometryCollection': renderGeometryCollectionGeometry,
        'Circle': renderCircleGeometry,
    };
    function defaultOrder(feature1, feature2) {
        return parseInt(util_js_8.getUid(feature1), 10) - parseInt(util_js_8.getUid(feature2), 10);
    }
    exports.defaultOrder = defaultOrder;
    function getSquaredTolerance(resolution, pixelRatio) {
        const tolerance = getTolerance(resolution, pixelRatio);
        return tolerance * tolerance;
    }
    exports.getSquaredTolerance = getSquaredTolerance;
    function getTolerance(resolution, pixelRatio) {
        return (SIMPLIFY_TOLERANCE * resolution) / pixelRatio;
    }
    exports.getTolerance = getTolerance;
    function renderCircleGeometry(builderGroup, geometry, style, feature) {
        const fillStyle = style.getFill();
        const strokeStyle = style.getStroke();
        if (fillStyle || strokeStyle) {
            const circleReplay = builderGroup.getBuilder(style.getZIndex(), BuilderType_js_1.default.CIRCLE);
            circleReplay.setFillStrokeStyle(fillStyle, strokeStyle);
            circleReplay.drawCircle(geometry, feature);
        }
        const textStyle = style.getText();
        if (textStyle) {
            const textReplay = builderGroup.getBuilder(style.getZIndex(), BuilderType_js_1.default.TEXT);
            textReplay.setTextStyle(textStyle, builderGroup.addDeclutter(false));
            textReplay.drawText(geometry, feature);
        }
    }
    function renderFeature(replayGroup, feature, style, squaredTolerance, listener, opt_transform) {
        let loading = false;
        const imageStyle = style.getImage();
        if (imageStyle) {
            let imageState = imageStyle.getImageState();
            if (imageState == ImageState_js_2.default.LOADED || imageState == ImageState_js_2.default.ERROR) {
                imageStyle.unlistenImageChange(listener);
            }
            else {
                if (imageState == ImageState_js_2.default.IDLE) {
                    imageStyle.load();
                }
                imageState = imageStyle.getImageState();
                imageStyle.listenImageChange(listener);
                loading = true;
            }
        }
        renderFeatureInternal(replayGroup, feature, style, squaredTolerance, opt_transform);
        return loading;
    }
    exports.renderFeature = renderFeature;
    function renderFeatureInternal(replayGroup, feature, style, squaredTolerance, opt_transform) {
        const geometry = style.getGeometryFunction()(feature);
        if (!geometry) {
            return;
        }
        const simplifiedGeometry = geometry.simplifyTransformed(squaredTolerance, opt_transform);
        const renderer = style.getRenderer();
        if (renderer) {
            renderGeometry(replayGroup, simplifiedGeometry, style, feature);
        }
        else {
            const geometryRenderer = GEOMETRY_RENDERERS[simplifiedGeometry.getType()];
            geometryRenderer(replayGroup, simplifiedGeometry, style, feature);
        }
    }
    function renderGeometry(replayGroup, geometry, style, feature) {
        if (geometry.getType() == GeometryType_js_15.default.GEOMETRY_COLLECTION) {
            const geometries = (geometry).getGeometries();
            for (let i = 0, ii = geometries.length; i < ii; ++i) {
                renderGeometry(replayGroup, geometries[i], style, feature);
            }
            return;
        }
        const replay = replayGroup.getBuilder(style.getZIndex(), BuilderType_js_1.default.DEFAULT);
        replay.drawCustom((geometry), feature, style.getRenderer());
    }
    function renderGeometryCollectionGeometry(replayGroup, geometry, style, feature) {
        const geometries = geometry.getGeometriesArray();
        let i, ii;
        for (i = 0, ii = geometries.length; i < ii; ++i) {
            const geometryRenderer = GEOMETRY_RENDERERS[geometries[i].getType()];
            geometryRenderer(replayGroup, geometries[i], style, feature);
        }
    }
    function renderLineStringGeometry(builderGroup, geometry, style, feature) {
        const strokeStyle = style.getStroke();
        if (strokeStyle) {
            const lineStringReplay = builderGroup.getBuilder(style.getZIndex(), BuilderType_js_1.default.LINE_STRING);
            lineStringReplay.setFillStrokeStyle(null, strokeStyle);
            lineStringReplay.drawLineString(geometry, feature);
        }
        const textStyle = style.getText();
        if (textStyle) {
            const textReplay = builderGroup.getBuilder(style.getZIndex(), BuilderType_js_1.default.TEXT);
            textReplay.setTextStyle(textStyle, builderGroup.addDeclutter(false));
            textReplay.drawText(geometry, feature);
        }
    }
    function renderMultiLineStringGeometry(builderGroup, geometry, style, feature) {
        const strokeStyle = style.getStroke();
        if (strokeStyle) {
            const lineStringReplay = builderGroup.getBuilder(style.getZIndex(), BuilderType_js_1.default.LINE_STRING);
            lineStringReplay.setFillStrokeStyle(null, strokeStyle);
            lineStringReplay.drawMultiLineString(geometry, feature);
        }
        const textStyle = style.getText();
        if (textStyle) {
            const textReplay = builderGroup.getBuilder(style.getZIndex(), BuilderType_js_1.default.TEXT);
            textReplay.setTextStyle(textStyle, builderGroup.addDeclutter(false));
            textReplay.drawText(geometry, feature);
        }
    }
    function renderMultiPolygonGeometry(builderGroup, geometry, style, feature) {
        const fillStyle = style.getFill();
        const strokeStyle = style.getStroke();
        if (strokeStyle || fillStyle) {
            const polygonReplay = builderGroup.getBuilder(style.getZIndex(), BuilderType_js_1.default.POLYGON);
            polygonReplay.setFillStrokeStyle(fillStyle, strokeStyle);
            polygonReplay.drawMultiPolygon(geometry, feature);
        }
        const textStyle = style.getText();
        if (textStyle) {
            const textReplay = builderGroup.getBuilder(style.getZIndex(), BuilderType_js_1.default.TEXT);
            textReplay.setTextStyle(textStyle, builderGroup.addDeclutter(false));
            textReplay.drawText(geometry, feature);
        }
    }
    function renderPointGeometry(builderGroup, geometry, style, feature) {
        const imageStyle = style.getImage();
        if (imageStyle) {
            if (imageStyle.getImageState() != ImageState_js_2.default.LOADED) {
                return;
            }
            const imageReplay = builderGroup.getBuilder(style.getZIndex(), BuilderType_js_1.default.IMAGE);
            imageReplay.setImageStyle(imageStyle, builderGroup.addDeclutter(false));
            imageReplay.drawPoint(geometry, feature);
        }
        const textStyle = style.getText();
        if (textStyle) {
            const textReplay = builderGroup.getBuilder(style.getZIndex(), BuilderType_js_1.default.TEXT);
            textReplay.setTextStyle(textStyle, builderGroup.addDeclutter(!!imageStyle));
            textReplay.drawText(geometry, feature);
        }
    }
    function renderMultiPointGeometry(builderGroup, geometry, style, feature) {
        const imageStyle = style.getImage();
        if (imageStyle) {
            if (imageStyle.getImageState() != ImageState_js_2.default.LOADED) {
                return;
            }
            const imageReplay = builderGroup.getBuilder(style.getZIndex(), BuilderType_js_1.default.IMAGE);
            imageReplay.setImageStyle(imageStyle, builderGroup.addDeclutter(false));
            imageReplay.drawMultiPoint(geometry, feature);
        }
        const textStyle = style.getText();
        if (textStyle) {
            const textReplay = builderGroup.getBuilder(style.getZIndex(), BuilderType_js_1.default.TEXT);
            textReplay.setTextStyle(textStyle, builderGroup.addDeclutter(!!imageStyle));
            textReplay.drawText(geometry, feature);
        }
    }
    function renderPolygonGeometry(builderGroup, geometry, style, feature) {
        const fillStyle = style.getFill();
        const strokeStyle = style.getStroke();
        if (fillStyle || strokeStyle) {
            const polygonReplay = builderGroup.getBuilder(style.getZIndex(), BuilderType_js_1.default.POLYGON);
            polygonReplay.setFillStrokeStyle(fillStyle, strokeStyle);
            polygonReplay.drawPolygon(geometry, feature);
        }
        const textStyle = style.getText();
        if (textStyle) {
            const textReplay = builderGroup.getBuilder(style.getZIndex(), BuilderType_js_1.default.TEXT);
            textReplay.setTextStyle(textStyle, builderGroup.addDeclutter(false));
            textReplay.drawText(geometry, feature);
        }
    }
});
define("node_modules/ol/src/render/Event", ["require", "exports", "node_modules/ol/src/events/Event"], function (require, exports, Event_js_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RenderEvent extends Event_js_4.default {
        constructor(type, opt_inversePixelTransform, opt_frameState, opt_context) {
            super(type);
            this.inversePixelTransform = opt_inversePixelTransform;
            this.frameState = opt_frameState;
            this.context = opt_context;
        }
    }
    exports.default = RenderEvent;
});
define("node_modules/ol/src/render", ["require", "exports", "node_modules/ol/src/render/canvas/Immediate", "node_modules/ol/src/has", "node_modules/ol/src/transform", "node_modules/ol/src/renderer/vector", "node_modules/ol/src/proj"], function (require, exports, Immediate_js_1, has_js_3, transform_js_10, vector_js_1, proj_js_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderDeclutterItems = exports.getRenderPixel = exports.getVectorContext = exports.toContext = void 0;
    function toContext(context, opt_options) {
        const canvas = context.canvas;
        const options = opt_options ? opt_options : {};
        const pixelRatio = options.pixelRatio || has_js_3.DEVICE_PIXEL_RATIO;
        const size = options.size;
        if (size) {
            canvas.width = size[0] * pixelRatio;
            canvas.height = size[1] * pixelRatio;
            canvas.style.width = size[0] + 'px';
            canvas.style.height = size[1] + 'px';
        }
        const extent = [0, 0, canvas.width, canvas.height];
        const transform = transform_js_10.scale(transform_js_10.create(), pixelRatio, pixelRatio);
        return new Immediate_js_1.default(context, pixelRatio, extent, transform, 0);
    }
    exports.toContext = toContext;
    function getVectorContext(event) {
        const frameState = event.frameState;
        const transform = transform_js_10.multiply(event.inversePixelTransform.slice(), frameState.coordinateToPixelTransform);
        const squaredTolerance = vector_js_1.getSquaredTolerance(frameState.viewState.resolution, frameState.pixelRatio);
        let userTransform;
        const userProjection = proj_js_4.getUserProjection();
        if (userProjection) {
            userTransform = proj_js_4.getTransformFromProjections(userProjection, frameState.viewState.projection);
        }
        return new Immediate_js_1.default(event.context, frameState.pixelRatio, frameState.extent, transform, frameState.viewState.rotation, squaredTolerance, userTransform);
    }
    exports.getVectorContext = getVectorContext;
    function getRenderPixel(event, pixel) {
        const result = pixel.slice(0);
        transform_js_10.apply(event.inversePixelTransform.slice(), result);
        return result;
    }
    exports.getRenderPixel = getRenderPixel;
    function renderDeclutterItems(frameState, declutterTree) {
        if (declutterTree) {
            declutterTree.clear();
        }
        const items = frameState.declutterItems;
        for (let z = items.length - 1; z >= 0; --z) {
            const item = items[z];
            const zIndexItems = item.items;
            for (let i = 0, ii = zIndexItems.length; i < ii; i += 3) {
                declutterTree = zIndexItems[i].renderDeclutter(zIndexItems[i + 1], zIndexItems[i + 2], item.opacity, declutterTree);
            }
        }
        items.length = 0;
        return declutterTree;
    }
    exports.renderDeclutterItems = renderDeclutterItems;
});
define("node_modules/ol/src/style/Style", ["require", "exports", "node_modules/ol/src/style/Circle", "node_modules/ol/src/style/Fill", "node_modules/ol/src/geom/GeometryType", "node_modules/ol/src/style/Stroke", "node_modules/ol/src/asserts"], function (require, exports, Circle_js_1, Fill_js_2, GeometryType_js_16, Stroke_js_1, asserts_js_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createEditingStyle = exports.createDefaultStyle = exports.toFunction = void 0;
    class Style {
        constructor(opt_options) {
            const options = opt_options || {};
            this.geometry_ = null;
            this.geometryFunction_ = defaultGeometryFunction;
            if (options.geometry !== undefined) {
                this.setGeometry(options.geometry);
            }
            this.fill_ = options.fill !== undefined ? options.fill : null;
            this.image_ = options.image !== undefined ? options.image : null;
            this.renderer_ = options.renderer !== undefined ? options.renderer : null;
            this.stroke_ = options.stroke !== undefined ? options.stroke : null;
            this.text_ = options.text !== undefined ? options.text : null;
            this.zIndex_ = options.zIndex;
        }
        clone() {
            let geometry = this.getGeometry();
            if (geometry && typeof geometry === 'object') {
                geometry = (geometry).clone();
            }
            return new Style({
                geometry: geometry,
                fill: this.getFill() ? this.getFill().clone() : undefined,
                image: this.getImage() ? this.getImage().clone() : undefined,
                stroke: this.getStroke() ? this.getStroke().clone() : undefined,
                text: this.getText() ? this.getText().clone() : undefined,
                zIndex: this.getZIndex(),
            });
        }
        getRenderer() {
            return this.renderer_;
        }
        setRenderer(renderer) {
            this.renderer_ = renderer;
        }
        getGeometry() {
            return this.geometry_;
        }
        getGeometryFunction() {
            return this.geometryFunction_;
        }
        getFill() {
            return this.fill_;
        }
        setFill(fill) {
            this.fill_ = fill;
        }
        getImage() {
            return this.image_;
        }
        setImage(image) {
            this.image_ = image;
        }
        getStroke() {
            return this.stroke_;
        }
        setStroke(stroke) {
            this.stroke_ = stroke;
        }
        getText() {
            return this.text_;
        }
        setText(text) {
            this.text_ = text;
        }
        getZIndex() {
            return this.zIndex_;
        }
        setGeometry(geometry) {
            if (typeof geometry === 'function') {
                this.geometryFunction_ = geometry;
            }
            else if (typeof geometry === 'string') {
                this.geometryFunction_ = function (feature) {
                    return (feature.get(geometry));
                };
            }
            else if (!geometry) {
                this.geometryFunction_ = defaultGeometryFunction;
            }
            else if (geometry !== undefined) {
                this.geometryFunction_ = function () {
                    return (geometry);
                };
            }
            this.geometry_ = geometry;
        }
        setZIndex(zIndex) {
            this.zIndex_ = zIndex;
        }
    }
    function toFunction(obj) {
        let styleFunction;
        if (typeof obj === 'function') {
            styleFunction = obj;
        }
        else {
            let styles;
            if (Array.isArray(obj)) {
                styles = obj;
            }
            else {
                asserts_js_5.assert(typeof ((obj).getZIndex) === 'function', 41);
                const style = (obj);
                styles = [style];
            }
            styleFunction = function () {
                return styles;
            };
        }
        return styleFunction;
    }
    exports.toFunction = toFunction;
    let defaultStyles = null;
    function createDefaultStyle(feature, resolution) {
        if (!defaultStyles) {
            const fill = new Fill_js_2.default({
                color: 'rgba(255,255,255,0.4)',
            });
            const stroke = new Stroke_js_1.default({
                color: '#3399CC',
                width: 1.25,
            });
            defaultStyles = [
                new Style({
                    image: new Circle_js_1.default({
                        fill: fill,
                        stroke: stroke,
                        radius: 5,
                    }),
                    fill: fill,
                    stroke: stroke,
                }),
            ];
        }
        return defaultStyles;
    }
    exports.createDefaultStyle = createDefaultStyle;
    function createEditingStyle() {
        const styles = {};
        const white = [255, 255, 255, 1];
        const blue = [0, 153, 255, 1];
        const width = 3;
        styles[GeometryType_js_16.default.POLYGON] = [
            new Style({
                fill: new Fill_js_2.default({
                    color: [255, 255, 255, 0.5],
                }),
            }),
        ];
        styles[GeometryType_js_16.default.MULTI_POLYGON] = styles[GeometryType_js_16.default.POLYGON];
        styles[GeometryType_js_16.default.LINE_STRING] = [
            new Style({
                stroke: new Stroke_js_1.default({
                    color: white,
                    width: width + 2,
                }),
            }),
            new Style({
                stroke: new Stroke_js_1.default({
                    color: blue,
                    width: width,
                }),
            }),
        ];
        styles[GeometryType_js_16.default.MULTI_LINE_STRING] = styles[GeometryType_js_16.default.LINE_STRING];
        styles[GeometryType_js_16.default.CIRCLE] = styles[GeometryType_js_16.default.POLYGON].concat(styles[GeometryType_js_16.default.LINE_STRING]);
        styles[GeometryType_js_16.default.POINT] = [
            new Style({
                image: new Circle_js_1.default({
                    radius: width * 2,
                    fill: new Fill_js_2.default({
                        color: blue,
                    }),
                    stroke: new Stroke_js_1.default({
                        color: white,
                        width: width / 2,
                    }),
                }),
                zIndex: Infinity,
            }),
        ];
        styles[GeometryType_js_16.default.MULTI_POINT] = styles[GeometryType_js_16.default.POINT];
        styles[GeometryType_js_16.default.GEOMETRY_COLLECTION] = styles[GeometryType_js_16.default.POLYGON].concat(styles[GeometryType_js_16.default.LINE_STRING], styles[GeometryType_js_16.default.POINT]);
        return styles;
    }
    exports.createEditingStyle = createEditingStyle;
    function defaultGeometryFunction(feature) {
        return feature.getGeometry();
    }
    exports.default = Style;
});
define("node_modules/ol/src/Feature", ["require", "exports", "node_modules/ol/src/Object", "node_modules/ol/src/events/EventType", "node_modules/ol/src/asserts", "node_modules/ol/src/events"], function (require, exports, Object_js_4, EventType_js_3, asserts_js_6, events_js_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createStyleFunction = void 0;
    class Feature extends Object_js_4.default {
        constructor(opt_geometryOrProperties) {
            super();
            this.id_ = undefined;
            this.geometryName_ = 'geometry';
            this.style_ = null;
            this.styleFunction_ = undefined;
            this.geometryChangeKey_ = null;
            this.addEventListener(Object_js_4.getChangeEventType(this.geometryName_), this.handleGeometryChanged_);
            if (opt_geometryOrProperties) {
                if (typeof ((opt_geometryOrProperties).getSimplifiedGeometry) === 'function') {
                    const geometry = (opt_geometryOrProperties);
                    this.setGeometry(geometry);
                }
                else {
                    const properties = opt_geometryOrProperties;
                    this.setProperties(properties);
                }
            }
        }
        clone() {
            const clone = new Feature(this.hasProperties() ? this.getProperties() : null);
            clone.setGeometryName(this.getGeometryName());
            const geometry = this.getGeometry();
            if (geometry) {
                clone.setGeometry(geometry.clone());
            }
            const style = this.getStyle();
            if (style) {
                clone.setStyle(style);
            }
            return clone;
        }
        getGeometry() {
            return (this.get(this.geometryName_));
        }
        getId() {
            return this.id_;
        }
        getGeometryName() {
            return this.geometryName_;
        }
        getStyle() {
            return this.style_;
        }
        getStyleFunction() {
            return this.styleFunction_;
        }
        handleGeometryChange_() {
            this.changed();
        }
        handleGeometryChanged_() {
            if (this.geometryChangeKey_) {
                events_js_3.unlistenByKey(this.geometryChangeKey_);
                this.geometryChangeKey_ = null;
            }
            const geometry = this.getGeometry();
            if (geometry) {
                this.geometryChangeKey_ = events_js_3.listen(geometry, EventType_js_3.default.CHANGE, this.handleGeometryChange_, this);
            }
            this.changed();
        }
        setGeometry(geometry) {
            this.set(this.geometryName_, geometry);
        }
        setStyle(opt_style) {
            this.style_ = opt_style;
            this.styleFunction_ = !opt_style
                ? undefined
                : createStyleFunction(opt_style);
            this.changed();
        }
        setId(id) {
            this.id_ = id;
            this.changed();
        }
        setGeometryName(name) {
            this.removeEventListener(Object_js_4.getChangeEventType(this.geometryName_), this.handleGeometryChanged_);
            this.geometryName_ = name;
            this.addEventListener(Object_js_4.getChangeEventType(this.geometryName_), this.handleGeometryChanged_);
            this.handleGeometryChanged_();
        }
    }
    function createStyleFunction(obj) {
        if (typeof obj === 'function') {
            return obj;
        }
        else {
            let styles;
            if (Array.isArray(obj)) {
                styles = obj;
            }
            else {
                asserts_js_6.assert(typeof ((obj).getZIndex) === 'function', 41);
                const style = (obj);
                styles = [style];
            }
            return function () {
                return styles;
            };
        }
    }
    exports.createStyleFunction = createStyleFunction;
    exports.default = Feature;
});
define("node_modules/ol/src/TileState", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        IDLE: 0,
        LOADING: 1,
        LOADED: 2,
        ERROR: 3,
        EMPTY: 4,
    };
});
define("node_modules/ol/src/easing", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.upAndDown = exports.linear = exports.inAndOut = exports.easeOut = exports.easeIn = void 0;
    function easeIn(t) {
        return Math.pow(t, 3);
    }
    exports.easeIn = easeIn;
    function easeOut(t) {
        return 1 - easeIn(1 - t);
    }
    exports.easeOut = easeOut;
    function inAndOut(t) {
        return 3 * t * t - 2 * t * t * t;
    }
    exports.inAndOut = inAndOut;
    function linear(t) {
        return t;
    }
    exports.linear = linear;
    function upAndDown(t) {
        if (t < 0.5) {
            return inAndOut(2 * t);
        }
        else {
            return 1 - inAndOut(2 * (t - 0.5));
        }
    }
    exports.upAndDown = upAndDown;
});
define("node_modules/ol/src/Tile", ["require", "exports", "node_modules/ol/src/events/Target", "node_modules/ol/src/events/EventType", "node_modules/ol/src/TileState", "node_modules/ol/src/util", "node_modules/ol/src/easing"], function (require, exports, Target_js_3, EventType_js_4, TileState_js_1, util_js_9, easing_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Tile extends Target_js_3.default {
        constructor(tileCoord, state, opt_options) {
            super();
            const options = opt_options ? opt_options : {};
            this.tileCoord = tileCoord;
            this.state = state;
            this.interimTile = null;
            this.hifi = true;
            this.key = '';
            this.transition_ =
                options.transition === undefined ? 250 : options.transition;
            this.transitionStarts_ = {};
        }
        changed() {
            this.dispatchEvent(EventType_js_4.default.CHANGE);
        }
        release() { }
        getKey() {
            return this.key + '/' + this.tileCoord;
        }
        getInterimTile() {
            if (!this.interimTile) {
                return this;
            }
            let tile = this.interimTile;
            do {
                if (tile.getState() == TileState_js_1.default.LOADED) {
                    this.transition_ = 0;
                    return tile;
                }
                tile = tile.interimTile;
            } while (tile);
            return this;
        }
        refreshInterimChain() {
            if (!this.interimTile) {
                return;
            }
            let tile = this.interimTile;
            let prev = (this);
            do {
                if (tile.getState() == TileState_js_1.default.LOADED) {
                    tile.interimTile = null;
                    break;
                }
                else if (tile.getState() == TileState_js_1.default.LOADING) {
                    prev = tile;
                }
                else if (tile.getState() == TileState_js_1.default.IDLE) {
                    prev.interimTile = tile.interimTile;
                }
                else {
                    prev = tile;
                }
                tile = prev.interimTile;
            } while (tile);
        }
        getTileCoord() {
            return this.tileCoord;
        }
        getState() {
            return this.state;
        }
        setState(state) {
            if (this.state !== TileState_js_1.default.ERROR && this.state > state) {
                throw new Error('Tile load sequence violation');
            }
            this.state = state;
            this.changed();
        }
        load() {
            util_js_9.abstract();
        }
        getAlpha(id, time) {
            if (!this.transition_) {
                return 1;
            }
            let start = this.transitionStarts_[id];
            if (!start) {
                start = time;
                this.transitionStarts_[id] = start;
            }
            else if (start === -1) {
                return 1;
            }
            const delta = time - start + 1000 / 60;
            if (delta >= this.transition_) {
                return 1;
            }
            return easing_js_1.easeIn(delta / this.transition_);
        }
        inTransition(id) {
            if (!this.transition_) {
                return false;
            }
            return this.transitionStarts_[id] !== -1;
        }
        endTransition(id) {
            if (this.transition_) {
                this.transitionStarts_[id] = -1;
            }
        }
    }
    exports.default = Tile;
});
define("node_modules/ol/src/structs/LRUCache", ["require", "exports", "node_modules/ol/src/asserts"], function (require, exports, asserts_js_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LRUCache {
        constructor(opt_highWaterMark) {
            this.highWaterMark =
                opt_highWaterMark !== undefined ? opt_highWaterMark : 2048;
            this.count_ = 0;
            this.entries_ = {};
            this.oldest_ = null;
            this.newest_ = null;
        }
        canExpireCache() {
            return this.highWaterMark > 0 && this.getCount() > this.highWaterMark;
        }
        clear() {
            this.count_ = 0;
            this.entries_ = {};
            this.oldest_ = null;
            this.newest_ = null;
        }
        containsKey(key) {
            return this.entries_.hasOwnProperty(key);
        }
        forEach(f) {
            let entry = this.oldest_;
            while (entry) {
                f(entry.value_, entry.key_, this);
                entry = entry.newer;
            }
        }
        get(key, opt_options) {
            const entry = this.entries_[key];
            asserts_js_7.assert(entry !== undefined, 15);
            if (entry === this.newest_) {
                return entry.value_;
            }
            else if (entry === this.oldest_) {
                this.oldest_ = (this.oldest_.newer);
                this.oldest_.older = null;
            }
            else {
                entry.newer.older = entry.older;
                entry.older.newer = entry.newer;
            }
            entry.newer = null;
            entry.older = this.newest_;
            this.newest_.newer = entry;
            this.newest_ = entry;
            return entry.value_;
        }
        remove(key) {
            const entry = this.entries_[key];
            asserts_js_7.assert(entry !== undefined, 15);
            if (entry === this.newest_) {
                this.newest_ = (entry.older);
                if (this.newest_) {
                    this.newest_.newer = null;
                }
            }
            else if (entry === this.oldest_) {
                this.oldest_ = (entry.newer);
                if (this.oldest_) {
                    this.oldest_.older = null;
                }
            }
            else {
                entry.newer.older = entry.older;
                entry.older.newer = entry.newer;
            }
            delete this.entries_[key];
            --this.count_;
            return entry.value_;
        }
        getCount() {
            return this.count_;
        }
        getKeys() {
            const keys = new Array(this.count_);
            let i = 0;
            let entry;
            for (entry = this.newest_; entry; entry = entry.older) {
                keys[i++] = entry.key_;
            }
            return keys;
        }
        getValues() {
            const values = new Array(this.count_);
            let i = 0;
            let entry;
            for (entry = this.newest_; entry; entry = entry.older) {
                values[i++] = entry.value_;
            }
            return values;
        }
        peekLast() {
            return this.oldest_.value_;
        }
        peekLastKey() {
            return this.oldest_.key_;
        }
        peekFirstKey() {
            return this.newest_.key_;
        }
        pop() {
            const entry = this.oldest_;
            delete this.entries_[entry.key_];
            if (entry.newer) {
                entry.newer.older = null;
            }
            this.oldest_ = (entry.newer);
            if (!this.oldest_) {
                this.newest_ = null;
            }
            --this.count_;
            return entry.value_;
        }
        replace(key, value) {
            this.get(key);
            this.entries_[key].value_ = value;
        }
        set(key, value) {
            asserts_js_7.assert(!(key in this.entries_), 16);
            const entry = {
                key_: key,
                newer: null,
                older: this.newest_,
                value_: value,
            };
            if (!this.newest_) {
                this.oldest_ = entry;
            }
            else {
                this.newest_.newer = entry;
            }
            this.newest_ = entry;
            this.entries_[key] = entry;
            ++this.count_;
        }
        setSize(size) {
            this.highWaterMark = size;
        }
    }
    exports.default = LRUCache;
});
define("node_modules/ol/src/TileCache", ["require", "exports", "node_modules/ol/src/structs/LRUCache", "node_modules/ol/src/tilecoord"], function (require, exports, LRUCache_js_1, tilecoord_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TileCache extends LRUCache_js_1.default {
        expireCache(usedTiles) {
            while (this.canExpireCache()) {
                const tile = this.peekLast();
                if (tile.getKey() in usedTiles) {
                    break;
                }
                else {
                    this.pop().release();
                }
            }
        }
        pruneExceptNewestZ() {
            if (this.getCount() === 0) {
                return;
            }
            const key = this.peekFirstKey();
            const tileCoord = tilecoord_js_2.fromKey(key);
            const z = tileCoord[0];
            this.forEach(function (tile) {
                if (tile.tileCoord[0] !== z) {
                    this.remove(tilecoord_js_2.getKey(tile.tileCoord));
                    tile.release();
                }
            }.bind(this));
        }
    }
    exports.default = TileCache;
});
define("node_modules/ol/src/source/Tile", ["require", "exports", "node_modules/ol/src/events/Event", "node_modules/ol/src/source/Source", "node_modules/ol/src/TileCache", "node_modules/ol/src/TileState", "node_modules/ol/src/util", "node_modules/ol/src/proj", "node_modules/ol/src/tilecoord", "node_modules/ol/src/tilegrid", "node_modules/ol/src/size"], function (require, exports, Event_js_5, Source_js_1, TileCache_js_1, TileState_js_2, util_js_10, proj_js_5, tilecoord_js_3, tilegrid_js_1, size_js_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TileSourceEvent = void 0;
    class TileSource extends Source_js_1.default {
        constructor(options) {
            super({
                attributions: options.attributions,
                attributionsCollapsible: options.attributionsCollapsible,
                projection: options.projection,
                state: options.state,
                wrapX: options.wrapX,
            });
            this.opaque_ = options.opaque !== undefined ? options.opaque : false;
            this.tilePixelRatio_ =
                options.tilePixelRatio !== undefined ? options.tilePixelRatio : 1;
            this.tileGrid = options.tileGrid !== undefined ? options.tileGrid : null;
            const tileSize = [256, 256];
            const tileGrid = options.tileGrid;
            if (tileGrid) {
                size_js_5.toSize(tileGrid.getTileSize(tileGrid.getMinZoom()), tileSize);
            }
            this.tileCache = new TileCache_js_1.default(options.cacheSize || 0);
            this.tmpSize = [0, 0];
            this.key_ = options.key || '';
            this.tileOptions = { transition: options.transition };
            this.zDirection = options.zDirection ? options.zDirection : 0;
        }
        canExpireCache() {
            return this.tileCache.canExpireCache();
        }
        expireCache(projection, usedTiles) {
            const tileCache = this.getTileCacheForProjection(projection);
            if (tileCache) {
                tileCache.expireCache(usedTiles);
            }
        }
        forEachLoadedTile(projection, z, tileRange, callback) {
            const tileCache = this.getTileCacheForProjection(projection);
            if (!tileCache) {
                return false;
            }
            let covered = true;
            let tile, tileCoordKey, loaded;
            for (let x = tileRange.minX; x <= tileRange.maxX; ++x) {
                for (let y = tileRange.minY; y <= tileRange.maxY; ++y) {
                    tileCoordKey = tilecoord_js_3.getKeyZXY(z, x, y);
                    loaded = false;
                    if (tileCache.containsKey(tileCoordKey)) {
                        tile = (tileCache.get(tileCoordKey));
                        loaded = tile.getState() === TileState_js_2.default.LOADED;
                        if (loaded) {
                            loaded = callback(tile) !== false;
                        }
                    }
                    if (!loaded) {
                        covered = false;
                    }
                }
            }
            return covered;
        }
        getGutterForProjection(projection) {
            return 0;
        }
        getKey() {
            return this.key_;
        }
        setKey(key) {
            if (this.key_ !== key) {
                this.key_ = key;
                this.changed();
            }
        }
        getOpaque(projection) {
            return this.opaque_;
        }
        getResolutions() {
            return this.tileGrid.getResolutions();
        }
        getTile(z, x, y, pixelRatio, projection) {
            return util_js_10.abstract();
        }
        getTileGrid() {
            return this.tileGrid;
        }
        getTileGridForProjection(projection) {
            if (!this.tileGrid) {
                return tilegrid_js_1.getForProjection(projection);
            }
            else {
                return this.tileGrid;
            }
        }
        getTileCacheForProjection(projection) {
            const thisProj = this.getProjection();
            if (thisProj && !proj_js_5.equivalent(thisProj, projection)) {
                return null;
            }
            else {
                return this.tileCache;
            }
        }
        getTilePixelRatio(pixelRatio) {
            return this.tilePixelRatio_;
        }
        getTilePixelSize(z, pixelRatio, projection) {
            const tileGrid = this.getTileGridForProjection(projection);
            const tilePixelRatio = this.getTilePixelRatio(pixelRatio);
            const tileSize = size_js_5.toSize(tileGrid.getTileSize(z), this.tmpSize);
            if (tilePixelRatio == 1) {
                return tileSize;
            }
            else {
                return size_js_5.scale(tileSize, tilePixelRatio, this.tmpSize);
            }
        }
        getTileCoordForTileUrlFunction(tileCoord, opt_projection) {
            const projection = opt_projection !== undefined ? opt_projection : this.getProjection();
            const tileGrid = this.getTileGridForProjection(projection);
            if (this.getWrapX() && projection.isGlobal()) {
                tileCoord = tilegrid_js_1.wrapX(tileGrid, tileCoord, projection);
            }
            return tilecoord_js_3.withinExtentAndZ(tileCoord, tileGrid) ? tileCoord : null;
        }
        clear() {
            this.tileCache.clear();
        }
        refresh() {
            this.clear();
            super.refresh();
        }
        updateCacheSize(tileCount, projection) {
            const tileCache = this.getTileCacheForProjection(projection);
            if (tileCount > tileCache.highWaterMark) {
                tileCache.highWaterMark = tileCount;
            }
        }
        useTile(z, x, y, projection) { }
    }
    class TileSourceEvent extends Event_js_5.default {
        constructor(type, tile) {
            super(type);
            this.tile = tile;
        }
    }
    exports.TileSourceEvent = TileSourceEvent;
    exports.default = TileSource;
});
define("node_modules/ol/src/ImageBase", ["require", "exports", "node_modules/ol/src/events/Target", "node_modules/ol/src/events/EventType", "node_modules/ol/src/util"], function (require, exports, Target_js_4, EventType_js_5, util_js_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ImageBase extends Target_js_4.default {
        constructor(extent, resolution, pixelRatio, state) {
            super();
            this.extent = extent;
            this.pixelRatio_ = pixelRatio;
            this.resolution = resolution;
            this.state = state;
        }
        changed() {
            this.dispatchEvent(EventType_js_5.default.CHANGE);
        }
        getExtent() {
            return this.extent;
        }
        getImage() {
            return util_js_11.abstract();
        }
        getPixelRatio() {
            return this.pixelRatio_;
        }
        getResolution() {
            return (this.resolution);
        }
        getState() {
            return this.state;
        }
        load() {
            util_js_11.abstract();
        }
    }
    exports.default = ImageBase;
});
define("node_modules/ol/src/Image", ["require", "exports", "node_modules/ol/src/events/EventType", "node_modules/ol/src/ImageBase", "node_modules/ol/src/ImageState", "node_modules/ol/src/has", "node_modules/ol/src/extent", "node_modules/ol/src/events"], function (require, exports, EventType_js_6, ImageBase_js_1, ImageState_js_3, has_js_4, extent_js_24, events_js_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.listenImage = void 0;
    class ImageWrapper extends ImageBase_js_1.default {
        constructor(extent, resolution, pixelRatio, src, crossOrigin, imageLoadFunction) {
            super(extent, resolution, pixelRatio, ImageState_js_3.default.IDLE);
            this.src_ = src;
            this.image_ = new Image();
            if (crossOrigin !== null) {
                this.image_.crossOrigin = crossOrigin;
            }
            this.unlisten_ = null;
            this.state = ImageState_js_3.default.IDLE;
            this.imageLoadFunction_ = imageLoadFunction;
        }
        getImage() {
            return this.image_;
        }
        handleImageError_() {
            this.state = ImageState_js_3.default.ERROR;
            this.unlistenImage_();
            this.changed();
        }
        handleImageLoad_() {
            if (this.resolution === undefined) {
                this.resolution = extent_js_24.getHeight(this.extent) / this.image_.height;
            }
            this.state = ImageState_js_3.default.LOADED;
            this.unlistenImage_();
            this.changed();
        }
        load() {
            if (this.state == ImageState_js_3.default.IDLE || this.state == ImageState_js_3.default.ERROR) {
                this.state = ImageState_js_3.default.LOADING;
                this.changed();
                this.imageLoadFunction_(this, this.src_);
                this.unlisten_ = listenImage(this.image_, this.handleImageLoad_.bind(this), this.handleImageError_.bind(this));
            }
        }
        setImage(image) {
            this.image_ = image;
        }
        unlistenImage_() {
            if (this.unlisten_) {
                this.unlisten_();
                this.unlisten_ = null;
            }
        }
    }
    function listenImage(image, loadHandler, errorHandler) {
        const img = (image);
        if (img.src && has_js_4.IMAGE_DECODE) {
            const promise = img.decode();
            let listening = true;
            const unlisten = function () {
                listening = false;
            };
            promise
                .then(function () {
                if (listening) {
                    loadHandler();
                }
            })
                .catch(function (error) {
                if (listening) {
                    if (error.name === 'EncodingError' &&
                        error.message === 'Invalid image type.') {
                        loadHandler();
                    }
                    else {
                        errorHandler();
                    }
                }
            });
            return unlisten;
        }
        const listenerKeys = [
            events_js_4.listenOnce(img, EventType_js_6.default.LOAD, loadHandler),
            events_js_4.listenOnce(img, EventType_js_6.default.ERROR, errorHandler),
        ];
        return function unlisten() {
            listenerKeys.forEach(events_js_4.unlistenByKey);
        };
    }
    exports.listenImage = listenImage;
    exports.default = ImageWrapper;
});
define("node_modules/ol/src/renderer/Layer", ["require", "exports", "node_modules/ol/src/events/EventType", "node_modules/ol/src/ImageState", "node_modules/ol/src/Observable", "node_modules/ol/src/source/State", "node_modules/ol/src/util"], function (require, exports, EventType_js_7, ImageState_js_4, Observable_js_2, State_js_1, util_js_12) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LayerRenderer extends Observable_js_2.default {
        constructor(layer) {
            super();
            this.boundHandleImageChange_ = this.handleImageChange_.bind(this);
            this.layer_ = layer;
        }
        getFeatures(pixel) {
            return util_js_12.abstract();
        }
        prepareFrame(frameState) {
            return util_js_12.abstract();
        }
        renderFrame(frameState, target) {
            return util_js_12.abstract();
        }
        loadedTileCallback(tiles, zoom, tile) {
            if (!tiles[zoom]) {
                tiles[zoom] = {};
            }
            tiles[zoom][tile.tileCoord.toString()] = tile;
            return undefined;
        }
        createLoadedTileFinder(source, projection, tiles) {
            return (function (zoom, tileRange) {
                const callback = this.loadedTileCallback.bind(this, tiles, zoom);
                return source.forEachLoadedTile(projection, zoom, tileRange, callback);
            }.bind(this));
        }
        forEachFeatureAtCoordinate(coordinate, frameState, hitTolerance, callback, declutteredFeatures) { }
        getDataAtPixel(pixel, frameState, hitTolerance) {
            return util_js_12.abstract();
        }
        getLayer() {
            return this.layer_;
        }
        handleFontsChanged() { }
        handleImageChange_(event) {
            const image = (event.target);
            if (image.getState() === ImageState_js_4.default.LOADED) {
                this.renderIfReadyAndVisible();
            }
        }
        loadImage(image) {
            let imageState = image.getState();
            if (imageState != ImageState_js_4.default.LOADED && imageState != ImageState_js_4.default.ERROR) {
                image.addEventListener(EventType_js_7.default.CHANGE, this.boundHandleImageChange_);
            }
            if (imageState == ImageState_js_4.default.IDLE) {
                image.load();
                imageState = image.getState();
            }
            return imageState == ImageState_js_4.default.LOADED;
        }
        renderIfReadyAndVisible() {
            const layer = this.getLayer();
            if (layer.getVisible() && layer.getSourceState() == State_js_1.default.READY) {
                layer.changed();
            }
        }
    }
    exports.default = LayerRenderer;
});
define("node_modules/ol/src/ViewHint", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        ANIMATING: 0,
        INTERACTING: 1,
    };
});
define("node_modules/ol/src/ViewProperty", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        CENTER: 'center',
        RESOLUTION: 'resolution',
        ROTATION: 'rotation',
    };
});
define("node_modules/ol/src/centerconstraint", ["require", "exports", "node_modules/ol/src/math"], function (require, exports, math_js_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.none = exports.createExtent = void 0;
    function createExtent(extent, onlyCenter, smooth) {
        return (function (center, resolution, size, opt_isMoving) {
            if (center) {
                const viewWidth = onlyCenter ? 0 : size[0] * resolution;
                const viewHeight = onlyCenter ? 0 : size[1] * resolution;
                let minX = extent[0] + viewWidth / 2;
                let maxX = extent[2] - viewWidth / 2;
                let minY = extent[1] + viewHeight / 2;
                let maxY = extent[3] - viewHeight / 2;
                if (minX > maxX) {
                    minX = (maxX + minX) / 2;
                    maxX = minX;
                }
                if (minY > maxY) {
                    minY = (maxY + minY) / 2;
                    maxY = minY;
                }
                let x = math_js_13.clamp(center[0], minX, maxX);
                let y = math_js_13.clamp(center[1], minY, maxY);
                const ratio = 30 * resolution;
                if (opt_isMoving && smooth) {
                    x +=
                        -ratio * Math.log(1 + Math.max(0, minX - center[0]) / ratio) +
                            ratio * Math.log(1 + Math.max(0, center[0] - maxX) / ratio);
                    y +=
                        -ratio * Math.log(1 + Math.max(0, minY - center[1]) / ratio) +
                            ratio * Math.log(1 + Math.max(0, center[1] - maxY) / ratio);
                }
                return [x, y];
            }
            else {
                return undefined;
            }
        });
    }
    exports.createExtent = createExtent;
    function none(center) {
        return center;
    }
    exports.none = none;
});
define("node_modules/ol/src/resolutionconstraint", ["require", "exports", "node_modules/ol/src/math", "node_modules/ol/src/extent", "node_modules/ol/src/array"], function (require, exports, math_js_14, extent_js_25, array_js_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createMinMaxResolution = exports.createSnapToPower = exports.createSnapToResolutions = void 0;
    function getViewportClampedResolution(resolution, maxExtent, viewportSize, showFullExtent) {
        const xResolution = extent_js_25.getWidth(maxExtent) / viewportSize[0];
        const yResolution = extent_js_25.getHeight(maxExtent) / viewportSize[1];
        if (showFullExtent) {
            return Math.min(resolution, Math.max(xResolution, yResolution));
        }
        return Math.min(resolution, Math.min(xResolution, yResolution));
    }
    function getSmoothClampedResolution(resolution, maxResolution, minResolution) {
        let result = Math.min(resolution, maxResolution);
        const ratio = 50;
        result *=
            Math.log(1 + ratio * Math.max(0, resolution / maxResolution - 1)) / ratio +
                1;
        if (minResolution) {
            result = Math.max(result, minResolution);
            result /=
                Math.log(1 + ratio * Math.max(0, minResolution / resolution - 1)) /
                    ratio +
                    1;
        }
        return math_js_14.clamp(result, minResolution / 2, maxResolution * 2);
    }
    function createSnapToResolutions(resolutions, opt_smooth, opt_maxExtent, opt_showFullExtent) {
        return (function (resolution, direction, size, opt_isMoving) {
            if (resolution !== undefined) {
                const maxResolution = resolutions[0];
                const minResolution = resolutions[resolutions.length - 1];
                const cappedMaxRes = opt_maxExtent
                    ? getViewportClampedResolution(maxResolution, opt_maxExtent, size, opt_showFullExtent)
                    : maxResolution;
                if (opt_isMoving) {
                    const smooth = opt_smooth !== undefined ? opt_smooth : true;
                    if (!smooth) {
                        return math_js_14.clamp(resolution, minResolution, cappedMaxRes);
                    }
                    return getSmoothClampedResolution(resolution, cappedMaxRes, minResolution);
                }
                const capped = Math.min(cappedMaxRes, resolution);
                const z = Math.floor(array_js_13.linearFindNearest(resolutions, capped, direction));
                if (resolutions[z] > cappedMaxRes && z < resolutions.length - 1) {
                    return resolutions[z + 1];
                }
                return resolutions[z];
            }
            else {
                return undefined;
            }
        });
    }
    exports.createSnapToResolutions = createSnapToResolutions;
    function createSnapToPower(power, maxResolution, opt_minResolution, opt_smooth, opt_maxExtent, opt_showFullExtent) {
        return (function (resolution, direction, size, opt_isMoving) {
            if (resolution !== undefined) {
                const cappedMaxRes = opt_maxExtent
                    ? getViewportClampedResolution(maxResolution, opt_maxExtent, size, opt_showFullExtent)
                    : maxResolution;
                const minResolution = opt_minResolution !== undefined ? opt_minResolution : 0;
                if (opt_isMoving) {
                    const smooth = opt_smooth !== undefined ? opt_smooth : true;
                    if (!smooth) {
                        return math_js_14.clamp(resolution, minResolution, cappedMaxRes);
                    }
                    return getSmoothClampedResolution(resolution, cappedMaxRes, minResolution);
                }
                const tolerance = 1e-9;
                const minZoomLevel = Math.ceil(Math.log(maxResolution / cappedMaxRes) / Math.log(power) - tolerance);
                const offset = -direction * (0.5 - tolerance) + 0.5;
                const capped = Math.min(cappedMaxRes, resolution);
                const cappedZoomLevel = Math.floor(Math.log(maxResolution / capped) / Math.log(power) + offset);
                const zoomLevel = Math.max(minZoomLevel, cappedZoomLevel);
                const newResolution = maxResolution / Math.pow(power, zoomLevel);
                return math_js_14.clamp(newResolution, minResolution, cappedMaxRes);
            }
            else {
                return undefined;
            }
        });
    }
    exports.createSnapToPower = createSnapToPower;
    function createMinMaxResolution(maxResolution, minResolution, opt_smooth, opt_maxExtent, opt_showFullExtent) {
        return (function (resolution, direction, size, opt_isMoving) {
            if (resolution !== undefined) {
                const cappedMaxRes = opt_maxExtent
                    ? getViewportClampedResolution(maxResolution, opt_maxExtent, size, opt_showFullExtent)
                    : maxResolution;
                const smooth = opt_smooth !== undefined ? opt_smooth : true;
                if (!smooth || !opt_isMoving) {
                    return math_js_14.clamp(resolution, minResolution, cappedMaxRes);
                }
                return getSmoothClampedResolution(resolution, cappedMaxRes, minResolution);
            }
            else {
                return undefined;
            }
        });
    }
    exports.createMinMaxResolution = createMinMaxResolution;
});
define("node_modules/ol/src/rotationconstraint", ["require", "exports", "node_modules/ol/src/math"], function (require, exports, math_js_15) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createSnapToZero = exports.createSnapToN = exports.none = exports.disable = void 0;
    function disable(rotation) {
        if (rotation !== undefined) {
            return 0;
        }
        else {
            return undefined;
        }
    }
    exports.disable = disable;
    function none(rotation) {
        if (rotation !== undefined) {
            return rotation;
        }
        else {
            return undefined;
        }
    }
    exports.none = none;
    function createSnapToN(n) {
        const theta = (2 * Math.PI) / n;
        return (function (rotation, opt_isMoving) {
            if (opt_isMoving) {
                return rotation;
            }
            if (rotation !== undefined) {
                rotation = Math.floor(rotation / theta + 0.5) * theta;
                return rotation;
            }
            else {
                return undefined;
            }
        });
    }
    exports.createSnapToN = createSnapToN;
    function createSnapToZero(opt_tolerance) {
        const tolerance = opt_tolerance || math_js_15.toRadians(5);
        return (function (rotation, opt_isMoving) {
            if (opt_isMoving) {
                return rotation;
            }
            if (rotation !== undefined) {
                if (Math.abs(rotation) <= tolerance) {
                    return 0;
                }
                else {
                    return rotation;
                }
            }
            else {
                return undefined;
            }
        });
    }
    exports.createSnapToZero = createSnapToZero;
});
define("node_modules/ol/src/View", ["require", "exports", "node_modules/ol/src/Object", "node_modules/ol/src/geom/GeometryType", "node_modules/ol/src/proj/Units", "node_modules/ol/src/ViewHint", "node_modules/ol/src/ViewProperty", "node_modules/ol/src/tilegrid/common", "node_modules/ol/src/proj", "node_modules/ol/src/functions", "node_modules/ol/src/coordinate", "node_modules/ol/src/asserts", "node_modules/ol/src/obj", "node_modules/ol/src/centerconstraint", "node_modules/ol/src/math", "node_modules/ol/src/resolutionconstraint", "node_modules/ol/src/rotationconstraint", "node_modules/ol/src/resolutionconstraint", "node_modules/ol/src/easing", "node_modules/ol/src/coordinate", "node_modules/ol/src/extent", "node_modules/ol/src/easing", "node_modules/ol/src/array", "node_modules/ol/src/geom/Polygon"], function (require, exports, Object_js_5, GeometryType_js_17, Units_js_7, ViewHint_js_1, ViewProperty_js_1, common_js_3, proj_js_6, functions_js_3, coordinate_js_2, asserts_js_8, obj_js_7, centerconstraint_js_1, math_js_16, resolutionconstraint_js_1, rotationconstraint_js_1, resolutionconstraint_js_2, easing_js_2, coordinate_js_3, extent_js_26, easing_js_3, array_js_14, Polygon_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isNoopAnimation = exports.createRotationConstraint = exports.createResolutionConstraint = exports.createCenterConstraint = void 0;
    const DEFAULT_MIN_ZOOM = 0;
    class View extends Object_js_5.default {
        constructor(opt_options) {
            super();
            const options = obj_js_7.assign({}, opt_options);
            this.hints_ = [0, 0];
            this.animations_ = [];
            this.updateAnimationKey_;
            this.projection_ = proj_js_6.createProjection(options.projection, 'EPSG:3857');
            this.viewportSize_ = [100, 100];
            this.targetCenter_ = null;
            this.targetResolution_;
            this.targetRotation_;
            this.cancelAnchor_ = undefined;
            if (options.center) {
                options.center = proj_js_6.fromUserCoordinate(options.center, this.projection_);
            }
            if (options.extent) {
                options.extent = proj_js_6.fromUserExtent(options.extent, this.projection_);
            }
            this.applyOptions_(options);
        }
        applyOptions_(options) {
            const properties = {};
            const resolutionConstraintInfo = createResolutionConstraint(options);
            this.maxResolution_ = resolutionConstraintInfo.maxResolution;
            this.minResolution_ = resolutionConstraintInfo.minResolution;
            this.zoomFactor_ = resolutionConstraintInfo.zoomFactor;
            this.resolutions_ = options.resolutions;
            this.minZoom_ = resolutionConstraintInfo.minZoom;
            const centerConstraint = createCenterConstraint(options);
            const resolutionConstraint = resolutionConstraintInfo.constraint;
            const rotationConstraint = createRotationConstraint(options);
            this.constraints_ = {
                center: centerConstraint,
                resolution: resolutionConstraint,
                rotation: rotationConstraint,
            };
            this.setRotation(options.rotation !== undefined ? options.rotation : 0);
            this.setCenterInternal(options.center !== undefined ? options.center : null);
            if (options.resolution !== undefined) {
                this.setResolution(options.resolution);
            }
            else if (options.zoom !== undefined) {
                this.setZoom(options.zoom);
            }
            this.setProperties(properties);
            this.options_ = options;
        }
        getUpdatedOptions_(newOptions) {
            const options = obj_js_7.assign({}, this.options_);
            if (options.resolution !== undefined) {
                options.resolution = this.getResolution();
            }
            else {
                options.zoom = this.getZoom();
            }
            options.center = this.getCenterInternal();
            options.rotation = this.getRotation();
            return obj_js_7.assign({}, options, newOptions);
        }
        animate(var_args) {
            if (this.isDef() && !this.getAnimating()) {
                this.resolveConstraints(0);
            }
            const args = new Array(arguments.length);
            for (let i = 0; i < args.length; ++i) {
                let options = arguments[i];
                if (options.center) {
                    options = obj_js_7.assign({}, options);
                    options.center = proj_js_6.fromUserCoordinate(options.center, this.getProjection());
                }
                if (options.anchor) {
                    options = obj_js_7.assign({}, options);
                    options.anchor = proj_js_6.fromUserCoordinate(options.anchor, this.getProjection());
                }
                args[i] = options;
            }
            this.animateInternal.apply(this, args);
        }
        animateInternal(var_args) {
            let animationCount = arguments.length;
            let callback;
            if (animationCount > 1 &&
                typeof arguments[animationCount - 1] === 'function') {
                callback = arguments[animationCount - 1];
                --animationCount;
            }
            if (!this.isDef()) {
                const state = arguments[animationCount - 1];
                if (state.center) {
                    this.setCenterInternal(state.center);
                }
                if (state.zoom !== undefined) {
                    this.setZoom(state.zoom);
                }
                if (state.rotation !== undefined) {
                    this.setRotation(state.rotation);
                }
                if (callback) {
                    animationCallback(callback, true);
                }
                return;
            }
            let start = Date.now();
            let center = this.targetCenter_.slice();
            let resolution = this.targetResolution_;
            let rotation = this.targetRotation_;
            const series = [];
            for (let i = 0; i < animationCount; ++i) {
                const options = (arguments[i]);
                const animation = {
                    start: start,
                    complete: false,
                    anchor: options.anchor,
                    duration: options.duration !== undefined ? options.duration : 1000,
                    easing: options.easing || easing_js_3.inAndOut,
                    callback: callback,
                };
                if (options.center) {
                    animation.sourceCenter = center;
                    animation.targetCenter = options.center.slice();
                    center = animation.targetCenter;
                }
                if (options.zoom !== undefined) {
                    animation.sourceResolution = resolution;
                    animation.targetResolution = this.getResolutionForZoom(options.zoom);
                    resolution = animation.targetResolution;
                }
                else if (options.resolution) {
                    animation.sourceResolution = resolution;
                    animation.targetResolution = options.resolution;
                    resolution = animation.targetResolution;
                }
                if (options.rotation !== undefined) {
                    animation.sourceRotation = rotation;
                    const delta = math_js_16.modulo(options.rotation - rotation + Math.PI, 2 * Math.PI) - Math.PI;
                    animation.targetRotation = rotation + delta;
                    rotation = animation.targetRotation;
                }
                if (isNoopAnimation(animation)) {
                    animation.complete = true;
                }
                else {
                    start += animation.duration;
                }
                series.push(animation);
            }
            this.animations_.push(series);
            this.setHint(ViewHint_js_1.default.ANIMATING, 1);
            this.updateAnimations_();
        }
        getAnimating() {
            return this.hints_[ViewHint_js_1.default.ANIMATING] > 0;
        }
        getInteracting() {
            return this.hints_[ViewHint_js_1.default.INTERACTING] > 0;
        }
        cancelAnimations() {
            this.setHint(ViewHint_js_1.default.ANIMATING, -this.hints_[ViewHint_js_1.default.ANIMATING]);
            let anchor;
            for (let i = 0, ii = this.animations_.length; i < ii; ++i) {
                const series = this.animations_[i];
                if (series[0].callback) {
                    animationCallback(series[0].callback, false);
                }
                if (!anchor) {
                    for (let j = 0, jj = series.length; j < jj; ++j) {
                        const animation = series[j];
                        if (!animation.complete) {
                            anchor = animation.anchor;
                            break;
                        }
                    }
                }
            }
            this.animations_.length = 0;
            this.cancelAnchor_ = anchor;
        }
        updateAnimations_() {
            if (this.updateAnimationKey_ !== undefined) {
                cancelAnimationFrame(this.updateAnimationKey_);
                this.updateAnimationKey_ = undefined;
            }
            if (!this.getAnimating()) {
                return;
            }
            const now = Date.now();
            let more = false;
            for (let i = this.animations_.length - 1; i >= 0; --i) {
                const series = this.animations_[i];
                let seriesComplete = true;
                for (let j = 0, jj = series.length; j < jj; ++j) {
                    const animation = series[j];
                    if (animation.complete) {
                        continue;
                    }
                    const elapsed = now - animation.start;
                    let fraction = animation.duration > 0 ? elapsed / animation.duration : 1;
                    if (fraction >= 1) {
                        animation.complete = true;
                        fraction = 1;
                    }
                    else {
                        seriesComplete = false;
                    }
                    const progress = animation.easing(fraction);
                    if (animation.sourceCenter) {
                        const x0 = animation.sourceCenter[0];
                        const y0 = animation.sourceCenter[1];
                        const x1 = animation.targetCenter[0];
                        const y1 = animation.targetCenter[1];
                        const x = x0 + progress * (x1 - x0);
                        const y = y0 + progress * (y1 - y0);
                        this.targetCenter_ = [x, y];
                    }
                    if (animation.sourceResolution && animation.targetResolution) {
                        const resolution = progress === 1
                            ? animation.targetResolution
                            : animation.sourceResolution +
                                progress *
                                    (animation.targetResolution - animation.sourceResolution);
                        if (animation.anchor) {
                            const size = this.getViewportSize_(this.getRotation());
                            const constrainedResolution = this.constraints_.resolution(resolution, 0, size, true);
                            this.targetCenter_ = this.calculateCenterZoom(constrainedResolution, animation.anchor);
                        }
                        this.targetResolution_ = resolution;
                        this.applyTargetState_(true);
                    }
                    if (animation.sourceRotation !== undefined &&
                        animation.targetRotation !== undefined) {
                        const rotation = progress === 1
                            ? math_js_16.modulo(animation.targetRotation + Math.PI, 2 * Math.PI) -
                                Math.PI
                            : animation.sourceRotation +
                                progress *
                                    (animation.targetRotation - animation.sourceRotation);
                        if (animation.anchor) {
                            const constrainedRotation = this.constraints_.rotation(rotation, true);
                            this.targetCenter_ = this.calculateCenterRotate(constrainedRotation, animation.anchor);
                        }
                        this.targetRotation_ = rotation;
                    }
                    this.applyTargetState_(true);
                    more = true;
                    if (!animation.complete) {
                        break;
                    }
                }
                if (seriesComplete) {
                    this.animations_[i] = null;
                    this.setHint(ViewHint_js_1.default.ANIMATING, -1);
                    const callback = series[0].callback;
                    if (callback) {
                        animationCallback(callback, true);
                    }
                }
            }
            this.animations_ = this.animations_.filter(Boolean);
            if (more && this.updateAnimationKey_ === undefined) {
                this.updateAnimationKey_ = requestAnimationFrame(this.updateAnimations_.bind(this));
            }
        }
        calculateCenterRotate(rotation, anchor) {
            let center;
            const currentCenter = this.getCenterInternal();
            if (currentCenter !== undefined) {
                center = [currentCenter[0] - anchor[0], currentCenter[1] - anchor[1]];
                coordinate_js_2.rotate(center, rotation - this.getRotation());
                coordinate_js_2.add(center, anchor);
            }
            return center;
        }
        calculateCenterZoom(resolution, anchor) {
            let center;
            const currentCenter = this.getCenterInternal();
            const currentResolution = this.getResolution();
            if (currentCenter !== undefined && currentResolution !== undefined) {
                const x = anchor[0] -
                    (resolution * (anchor[0] - currentCenter[0])) / currentResolution;
                const y = anchor[1] -
                    (resolution * (anchor[1] - currentCenter[1])) / currentResolution;
                center = [x, y];
            }
            return center;
        }
        getViewportSize_(opt_rotation) {
            const size = this.viewportSize_;
            if (opt_rotation) {
                const w = size[0];
                const h = size[1];
                return [
                    Math.abs(w * Math.cos(opt_rotation)) +
                        Math.abs(h * Math.sin(opt_rotation)),
                    Math.abs(w * Math.sin(opt_rotation)) +
                        Math.abs(h * Math.cos(opt_rotation)),
                ];
            }
            else {
                return size;
            }
        }
        setViewportSize(opt_size) {
            this.viewportSize_ = Array.isArray(opt_size)
                ? opt_size.slice()
                : [100, 100];
            if (!this.getAnimating()) {
                this.resolveConstraints(0);
            }
        }
        getCenter() {
            const center = this.getCenterInternal();
            if (!center) {
                return center;
            }
            return proj_js_6.toUserCoordinate(center, this.getProjection());
        }
        getCenterInternal() {
            return (this.get(ViewProperty_js_1.default.CENTER));
        }
        getConstraints() {
            return this.constraints_;
        }
        getConstrainResolution() {
            return this.options_.constrainResolution;
        }
        getHints(opt_hints) {
            if (opt_hints !== undefined) {
                opt_hints[0] = this.hints_[0];
                opt_hints[1] = this.hints_[1];
                return opt_hints;
            }
            else {
                return this.hints_.slice();
            }
        }
        calculateExtent(opt_size) {
            const extent = this.calculateExtentInternal(opt_size);
            return proj_js_6.toUserExtent(extent, this.getProjection());
        }
        calculateExtentInternal(opt_size) {
            const size = opt_size || this.getViewportSize_();
            const center = (this.getCenterInternal());
            asserts_js_8.assert(center, 1);
            const resolution = (this.getResolution());
            asserts_js_8.assert(resolution !== undefined, 2);
            const rotation = (this.getRotation());
            asserts_js_8.assert(rotation !== undefined, 3);
            return extent_js_26.getForViewAndSize(center, resolution, rotation, size);
        }
        getMaxResolution() {
            return this.maxResolution_;
        }
        getMinResolution() {
            return this.minResolution_;
        }
        getMaxZoom() {
            return (this.getZoomForResolution(this.minResolution_));
        }
        setMaxZoom(zoom) {
            this.applyOptions_(this.getUpdatedOptions_({ maxZoom: zoom }));
        }
        getMinZoom() {
            return (this.getZoomForResolution(this.maxResolution_));
        }
        setMinZoom(zoom) {
            this.applyOptions_(this.getUpdatedOptions_({ minZoom: zoom }));
        }
        setConstrainResolution(enabled) {
            this.applyOptions_(this.getUpdatedOptions_({ constrainResolution: enabled }));
        }
        getProjection() {
            return this.projection_;
        }
        getResolution() {
            return (this.get(ViewProperty_js_1.default.RESOLUTION));
        }
        getResolutions() {
            return this.resolutions_;
        }
        getResolutionForExtent(extent, opt_size) {
            return this.getResolutionForExtentInternal(proj_js_6.fromUserExtent(extent, this.getProjection()), opt_size);
        }
        getResolutionForExtentInternal(extent, opt_size) {
            const size = opt_size || this.getViewportSize_();
            const xResolution = extent_js_26.getWidth(extent) / size[0];
            const yResolution = extent_js_26.getHeight(extent) / size[1];
            return Math.max(xResolution, yResolution);
        }
        getResolutionForValueFunction(opt_power) {
            const power = opt_power || 2;
            const maxResolution = this.getConstrainedResolution(this.maxResolution_);
            const minResolution = this.minResolution_;
            const max = Math.log(maxResolution / minResolution) / Math.log(power);
            return (function (value) {
                const resolution = maxResolution / Math.pow(power, value * max);
                return resolution;
            });
        }
        getRotation() {
            return (this.get(ViewProperty_js_1.default.ROTATION));
        }
        getValueForResolutionFunction(opt_power) {
            const logPower = Math.log(opt_power || 2);
            const maxResolution = this.getConstrainedResolution(this.maxResolution_);
            const minResolution = this.minResolution_;
            const max = Math.log(maxResolution / minResolution) / logPower;
            return (function (resolution) {
                const value = Math.log(maxResolution / resolution) / logPower / max;
                return value;
            });
        }
        getState() {
            const center = (this.getCenterInternal());
            const projection = this.getProjection();
            const resolution = (this.getResolution());
            const rotation = this.getRotation();
            return {
                center: center.slice(0),
                projection: projection !== undefined ? projection : null,
                resolution: resolution,
                rotation: rotation,
                zoom: this.getZoom(),
            };
        }
        getZoom() {
            let zoom;
            const resolution = this.getResolution();
            if (resolution !== undefined) {
                zoom = this.getZoomForResolution(resolution);
            }
            return zoom;
        }
        getZoomForResolution(resolution) {
            let offset = this.minZoom_ || 0;
            let max, zoomFactor;
            if (this.resolutions_) {
                const nearest = array_js_14.linearFindNearest(this.resolutions_, resolution, 1);
                offset = nearest;
                max = this.resolutions_[nearest];
                if (nearest == this.resolutions_.length - 1) {
                    zoomFactor = 2;
                }
                else {
                    zoomFactor = max / this.resolutions_[nearest + 1];
                }
            }
            else {
                max = this.maxResolution_;
                zoomFactor = this.zoomFactor_;
            }
            return offset + Math.log(max / resolution) / Math.log(zoomFactor);
        }
        getResolutionForZoom(zoom) {
            if (this.resolutions_) {
                if (this.resolutions_.length <= 1) {
                    return 0;
                }
                const baseLevel = math_js_16.clamp(Math.floor(zoom), 0, this.resolutions_.length - 2);
                const zoomFactor = this.resolutions_[baseLevel] / this.resolutions_[baseLevel + 1];
                return (this.resolutions_[baseLevel] /
                    Math.pow(zoomFactor, math_js_16.clamp(zoom - baseLevel, 0, 1)));
            }
            else {
                return (this.maxResolution_ / Math.pow(this.zoomFactor_, zoom - this.minZoom_));
            }
        }
        fit(geometryOrExtent, opt_options) {
            const options = obj_js_7.assign({ size: this.getViewportSize_() }, opt_options || {});
            let geometry;
            asserts_js_8.assert(Array.isArray(geometryOrExtent) ||
                typeof ((geometryOrExtent).getSimplifiedGeometry) ===
                    'function', 24);
            if (Array.isArray(geometryOrExtent)) {
                asserts_js_8.assert(!extent_js_26.isEmpty(geometryOrExtent), 25);
                const extent = proj_js_6.fromUserExtent(geometryOrExtent, this.getProjection());
                geometry = Polygon_js_2.fromExtent(extent);
            }
            else if (geometryOrExtent.getType() === GeometryType_js_17.default.CIRCLE) {
                const extent = proj_js_6.fromUserExtent(geometryOrExtent.getExtent(), this.getProjection());
                geometry = Polygon_js_2.fromExtent(extent);
                geometry.rotate(this.getRotation(), extent_js_26.getCenter(extent));
            }
            else {
                const userProjection = proj_js_6.getUserProjection();
                if (userProjection) {
                    geometry = (geometryOrExtent
                        .clone()
                        .transform(userProjection, this.getProjection()));
                }
                else {
                    geometry = geometryOrExtent;
                }
            }
            this.fitInternal(geometry, options);
        }
        fitInternal(geometry, opt_options) {
            const options = opt_options || {};
            let size = options.size;
            if (!size) {
                size = this.getViewportSize_();
            }
            const padding = options.padding !== undefined ? options.padding : [0, 0, 0, 0];
            const nearest = options.nearest !== undefined ? options.nearest : false;
            let minResolution;
            if (options.minResolution !== undefined) {
                minResolution = options.minResolution;
            }
            else if (options.maxZoom !== undefined) {
                minResolution = this.getResolutionForZoom(options.maxZoom);
            }
            else {
                minResolution = 0;
            }
            const coords = geometry.getFlatCoordinates();
            const rotation = this.getRotation();
            const cosAngle = Math.cos(-rotation);
            let sinAngle = Math.sin(-rotation);
            let minRotX = +Infinity;
            let minRotY = +Infinity;
            let maxRotX = -Infinity;
            let maxRotY = -Infinity;
            const stride = geometry.getStride();
            for (let i = 0, ii = coords.length; i < ii; i += stride) {
                const rotX = coords[i] * cosAngle - coords[i + 1] * sinAngle;
                const rotY = coords[i] * sinAngle + coords[i + 1] * cosAngle;
                minRotX = Math.min(minRotX, rotX);
                minRotY = Math.min(minRotY, rotY);
                maxRotX = Math.max(maxRotX, rotX);
                maxRotY = Math.max(maxRotY, rotY);
            }
            let resolution = this.getResolutionForExtentInternal([minRotX, minRotY, maxRotX, maxRotY], [size[0] - padding[1] - padding[3], size[1] - padding[0] - padding[2]]);
            resolution = isNaN(resolution)
                ? minResolution
                : Math.max(resolution, minResolution);
            resolution = this.getConstrainedResolution(resolution, nearest ? 0 : 1);
            sinAngle = -sinAngle;
            let centerRotX = (minRotX + maxRotX) / 2;
            let centerRotY = (minRotY + maxRotY) / 2;
            centerRotX += ((padding[1] - padding[3]) / 2) * resolution;
            centerRotY += ((padding[0] - padding[2]) / 2) * resolution;
            const centerX = centerRotX * cosAngle - centerRotY * sinAngle;
            const centerY = centerRotY * cosAngle + centerRotX * sinAngle;
            const center = [centerX, centerY];
            const callback = options.callback ? options.callback : functions_js_3.VOID;
            if (options.duration !== undefined) {
                this.animateInternal({
                    resolution: resolution,
                    center: this.getConstrainedCenter(center, resolution),
                    duration: options.duration,
                    easing: options.easing,
                }, callback);
            }
            else {
                this.targetResolution_ = resolution;
                this.targetCenter_ = center;
                this.applyTargetState_(false, true);
                animationCallback(callback, true);
            }
        }
        centerOn(coordinate, size, position) {
            this.centerOnInternal(proj_js_6.fromUserCoordinate(coordinate, this.getProjection()), size, position);
        }
        centerOnInternal(coordinate, size, position) {
            const rotation = this.getRotation();
            const cosAngle = Math.cos(-rotation);
            let sinAngle = Math.sin(-rotation);
            let rotX = coordinate[0] * cosAngle - coordinate[1] * sinAngle;
            let rotY = coordinate[1] * cosAngle + coordinate[0] * sinAngle;
            const resolution = this.getResolution();
            rotX += (size[0] / 2 - position[0]) * resolution;
            rotY += (position[1] - size[1] / 2) * resolution;
            sinAngle = -sinAngle;
            const centerX = rotX * cosAngle - rotY * sinAngle;
            const centerY = rotY * cosAngle + rotX * sinAngle;
            this.setCenterInternal([centerX, centerY]);
        }
        isDef() {
            return !!this.getCenterInternal() && this.getResolution() !== undefined;
        }
        adjustCenter(deltaCoordinates) {
            const center = proj_js_6.toUserCoordinate(this.targetCenter_, this.getProjection());
            this.setCenter([
                center[0] + deltaCoordinates[0],
                center[1] + deltaCoordinates[1],
            ]);
        }
        adjustCenterInternal(deltaCoordinates) {
            const center = this.targetCenter_;
            this.setCenterInternal([
                center[0] + deltaCoordinates[0],
                center[1] + deltaCoordinates[1],
            ]);
        }
        adjustResolution(ratio, opt_anchor) {
            const anchor = opt_anchor && proj_js_6.fromUserCoordinate(opt_anchor, this.getProjection());
            this.adjustResolutionInternal(ratio, anchor);
        }
        adjustResolutionInternal(ratio, opt_anchor) {
            const isMoving = this.getAnimating() || this.getInteracting();
            const size = this.getViewportSize_(this.getRotation());
            const newResolution = this.constraints_.resolution(this.targetResolution_ * ratio, 0, size, isMoving);
            if (opt_anchor) {
                this.targetCenter_ = this.calculateCenterZoom(newResolution, opt_anchor);
            }
            this.targetResolution_ *= ratio;
            this.applyTargetState_();
        }
        adjustZoom(delta, opt_anchor) {
            this.adjustResolution(Math.pow(this.zoomFactor_, -delta), opt_anchor);
        }
        adjustRotation(delta, opt_anchor) {
            if (opt_anchor) {
                opt_anchor = proj_js_6.fromUserCoordinate(opt_anchor, this.getProjection());
            }
            this.adjustRotationInternal(delta, opt_anchor);
        }
        adjustRotationInternal(delta, opt_anchor) {
            const isMoving = this.getAnimating() || this.getInteracting();
            const newRotation = this.constraints_.rotation(this.targetRotation_ + delta, isMoving);
            if (opt_anchor) {
                this.targetCenter_ = this.calculateCenterRotate(newRotation, opt_anchor);
            }
            this.targetRotation_ += delta;
            this.applyTargetState_();
        }
        setCenter(center) {
            this.setCenterInternal(proj_js_6.fromUserCoordinate(center, this.getProjection()));
        }
        setCenterInternal(center) {
            this.targetCenter_ = center;
            this.applyTargetState_();
        }
        setHint(hint, delta) {
            this.hints_[hint] += delta;
            this.changed();
            return this.hints_[hint];
        }
        setResolution(resolution) {
            this.targetResolution_ = resolution;
            this.applyTargetState_();
        }
        setRotation(rotation) {
            this.targetRotation_ = rotation;
            this.applyTargetState_();
        }
        setZoom(zoom) {
            this.setResolution(this.getResolutionForZoom(zoom));
        }
        applyTargetState_(opt_doNotCancelAnims, opt_forceMoving) {
            const isMoving = this.getAnimating() || this.getInteracting() || opt_forceMoving;
            const newRotation = this.constraints_.rotation(this.targetRotation_, isMoving);
            const size = this.getViewportSize_(newRotation);
            const newResolution = this.constraints_.resolution(this.targetResolution_, 0, size, isMoving);
            const newCenter = this.constraints_.center(this.targetCenter_, newResolution, size, isMoving);
            if (this.get(ViewProperty_js_1.default.ROTATION) !== newRotation) {
                this.set(ViewProperty_js_1.default.ROTATION, newRotation);
            }
            if (this.get(ViewProperty_js_1.default.RESOLUTION) !== newResolution) {
                this.set(ViewProperty_js_1.default.RESOLUTION, newResolution);
            }
            if (!this.get(ViewProperty_js_1.default.CENTER) ||
                !coordinate_js_3.equals(this.get(ViewProperty_js_1.default.CENTER), newCenter)) {
                this.set(ViewProperty_js_1.default.CENTER, newCenter);
            }
            if (this.getAnimating() && !opt_doNotCancelAnims) {
                this.cancelAnimations();
            }
            this.cancelAnchor_ = undefined;
        }
        resolveConstraints(opt_duration, opt_resolutionDirection, opt_anchor) {
            const duration = opt_duration !== undefined ? opt_duration : 200;
            const direction = opt_resolutionDirection || 0;
            const newRotation = this.constraints_.rotation(this.targetRotation_);
            const size = this.getViewportSize_(newRotation);
            const newResolution = this.constraints_.resolution(this.targetResolution_, direction, size);
            const newCenter = this.constraints_.center(this.targetCenter_, newResolution, size);
            if (duration === 0 && !this.cancelAnchor_) {
                this.targetResolution_ = newResolution;
                this.targetRotation_ = newRotation;
                this.targetCenter_ = newCenter;
                this.applyTargetState_();
                return;
            }
            const anchor = opt_anchor || (duration === 0 ? this.cancelAnchor_ : undefined);
            this.cancelAnchor_ = undefined;
            if (this.getResolution() !== newResolution ||
                this.getRotation() !== newRotation ||
                !this.getCenterInternal() ||
                !coordinate_js_3.equals(this.getCenterInternal(), newCenter)) {
                if (this.getAnimating()) {
                    this.cancelAnimations();
                }
                this.animateInternal({
                    rotation: newRotation,
                    center: newCenter,
                    resolution: newResolution,
                    duration: duration,
                    easing: easing_js_2.easeOut,
                    anchor: anchor,
                });
            }
        }
        beginInteraction() {
            this.resolveConstraints(0);
            this.setHint(ViewHint_js_1.default.INTERACTING, 1);
        }
        endInteraction(opt_duration, opt_resolutionDirection, opt_anchor) {
            const anchor = opt_anchor && proj_js_6.fromUserCoordinate(opt_anchor, this.getProjection());
            this.endInteractionInternal(opt_duration, opt_resolutionDirection, anchor);
        }
        endInteractionInternal(opt_duration, opt_resolutionDirection, opt_anchor) {
            this.setHint(ViewHint_js_1.default.INTERACTING, -1);
            this.resolveConstraints(opt_duration, opt_resolutionDirection, opt_anchor);
        }
        getConstrainedCenter(targetCenter, opt_targetResolution) {
            const size = this.getViewportSize_(this.getRotation());
            return this.constraints_.center(targetCenter, opt_targetResolution || this.getResolution(), size);
        }
        getConstrainedZoom(targetZoom, opt_direction) {
            const targetRes = this.getResolutionForZoom(targetZoom);
            return this.getZoomForResolution(this.getConstrainedResolution(targetRes, opt_direction));
        }
        getConstrainedResolution(targetResolution, opt_direction) {
            const direction = opt_direction || 0;
            const size = this.getViewportSize_(this.getRotation());
            return this.constraints_.resolution(targetResolution, direction, size);
        }
    }
    function animationCallback(callback, returnValue) {
        setTimeout(function () {
            callback(returnValue);
        }, 0);
    }
    function createCenterConstraint(options) {
        if (options.extent !== undefined) {
            const smooth = options.smoothExtentConstraint !== undefined
                ? options.smoothExtentConstraint
                : true;
            return centerconstraint_js_1.createExtent(options.extent, options.constrainOnlyCenter, smooth);
        }
        const projection = proj_js_6.createProjection(options.projection, 'EPSG:3857');
        if (options.multiWorld !== true && projection.isGlobal()) {
            const extent = projection.getExtent().slice();
            extent[0] = -Infinity;
            extent[2] = Infinity;
            return centerconstraint_js_1.createExtent(extent, false, false);
        }
        return centerconstraint_js_1.none;
    }
    exports.createCenterConstraint = createCenterConstraint;
    function createResolutionConstraint(options) {
        let resolutionConstraint;
        let maxResolution;
        let minResolution;
        const defaultMaxZoom = 28;
        const defaultZoomFactor = 2;
        let minZoom = options.minZoom !== undefined ? options.minZoom : DEFAULT_MIN_ZOOM;
        let maxZoom = options.maxZoom !== undefined ? options.maxZoom : defaultMaxZoom;
        const zoomFactor = options.zoomFactor !== undefined ? options.zoomFactor : defaultZoomFactor;
        const multiWorld = options.multiWorld !== undefined ? options.multiWorld : false;
        const smooth = options.smoothResolutionConstraint !== undefined
            ? options.smoothResolutionConstraint
            : true;
        const showFullExtent = options.showFullExtent !== undefined ? options.showFullExtent : false;
        const projection = proj_js_6.createProjection(options.projection, 'EPSG:3857');
        const projExtent = projection.getExtent();
        let constrainOnlyCenter = options.constrainOnlyCenter;
        let extent = options.extent;
        if (!multiWorld && !extent && projection.isGlobal()) {
            constrainOnlyCenter = false;
            extent = projExtent;
        }
        if (options.resolutions !== undefined) {
            const resolutions = options.resolutions;
            maxResolution = resolutions[minZoom];
            minResolution =
                resolutions[maxZoom] !== undefined
                    ? resolutions[maxZoom]
                    : resolutions[resolutions.length - 1];
            if (options.constrainResolution) {
                resolutionConstraint = resolutionconstraint_js_2.createSnapToResolutions(resolutions, smooth, !constrainOnlyCenter && extent, showFullExtent);
            }
            else {
                resolutionConstraint = resolutionconstraint_js_1.createMinMaxResolution(maxResolution, minResolution, smooth, !constrainOnlyCenter && extent, showFullExtent);
            }
        }
        else {
            const size = !projExtent
                ?
                    (360 * proj_js_6.METERS_PER_UNIT[Units_js_7.default.DEGREES]) / projection.getMetersPerUnit()
                : Math.max(extent_js_26.getWidth(projExtent), extent_js_26.getHeight(projExtent));
            const defaultMaxResolution = size / common_js_3.DEFAULT_TILE_SIZE / Math.pow(defaultZoomFactor, DEFAULT_MIN_ZOOM);
            const defaultMinResolution = defaultMaxResolution /
                Math.pow(defaultZoomFactor, defaultMaxZoom - DEFAULT_MIN_ZOOM);
            maxResolution = options.maxResolution;
            if (maxResolution !== undefined) {
                minZoom = 0;
            }
            else {
                maxResolution = defaultMaxResolution / Math.pow(zoomFactor, minZoom);
            }
            minResolution = options.minResolution;
            if (minResolution === undefined) {
                if (options.maxZoom !== undefined) {
                    if (options.maxResolution !== undefined) {
                        minResolution = maxResolution / Math.pow(zoomFactor, maxZoom);
                    }
                    else {
                        minResolution = defaultMaxResolution / Math.pow(zoomFactor, maxZoom);
                    }
                }
                else {
                    minResolution = defaultMinResolution;
                }
            }
            maxZoom =
                minZoom +
                    Math.floor(Math.log(maxResolution / minResolution) / Math.log(zoomFactor));
            minResolution = maxResolution / Math.pow(zoomFactor, maxZoom - minZoom);
            if (options.constrainResolution) {
                resolutionConstraint = resolutionconstraint_js_2.createSnapToPower(zoomFactor, maxResolution, minResolution, smooth, !constrainOnlyCenter && extent, showFullExtent);
            }
            else {
                resolutionConstraint = resolutionconstraint_js_1.createMinMaxResolution(maxResolution, minResolution, smooth, !constrainOnlyCenter && extent, showFullExtent);
            }
        }
        return {
            constraint: resolutionConstraint,
            maxResolution: maxResolution,
            minResolution: minResolution,
            minZoom: minZoom,
            zoomFactor: zoomFactor,
        };
    }
    exports.createResolutionConstraint = createResolutionConstraint;
    function createRotationConstraint(options) {
        const enableRotation = options.enableRotation !== undefined ? options.enableRotation : true;
        if (enableRotation) {
            const constrainRotation = options.constrainRotation;
            if (constrainRotation === undefined || constrainRotation === true) {
                return rotationconstraint_js_1.createSnapToZero();
            }
            else if (constrainRotation === false) {
                return rotationconstraint_js_1.none;
            }
            else if (typeof constrainRotation === 'number') {
                return rotationconstraint_js_1.createSnapToN(constrainRotation);
            }
            else {
                return rotationconstraint_js_1.none;
            }
        }
        else {
            return rotationconstraint_js_1.disable;
        }
    }
    exports.createRotationConstraint = createRotationConstraint;
    function isNoopAnimation(animation) {
        if (animation.sourceCenter && animation.targetCenter) {
            if (!coordinate_js_2.equals(animation.sourceCenter, animation.targetCenter)) {
                return false;
            }
        }
        if (animation.sourceResolution !== animation.targetResolution) {
            return false;
        }
        if (animation.sourceRotation !== animation.targetRotation) {
            return false;
        }
        return true;
    }
    exports.isNoopAnimation = isNoopAnimation;
    exports.default = View;
});
define("node_modules/ol/src/layer/Layer", ["require", "exports", "node_modules/ol/src/layer/Base", "node_modules/ol/src/events/EventType", "node_modules/ol/src/layer/Property", "node_modules/ol/src/render/EventType", "node_modules/ol/src/source/State", "node_modules/ol/src/asserts", "node_modules/ol/src/obj", "node_modules/ol/src/Object", "node_modules/ol/src/events"], function (require, exports, Base_js_1, EventType_js_8, Property_js_1, EventType_js_9, State_js_2, asserts_js_9, obj_js_8, Object_js_6, events_js_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.inView = void 0;
    class Layer extends Base_js_1.default {
        constructor(options) {
            const baseOptions = obj_js_8.assign({}, options);
            delete baseOptions.source;
            super(baseOptions);
            this.mapPrecomposeKey_ = null;
            this.mapRenderKey_ = null;
            this.sourceChangeKey_ = null;
            this.renderer_ = null;
            if (options.render) {
                this.render = options.render;
            }
            if (options.map) {
                this.setMap(options.map);
            }
            this.addEventListener(Object_js_6.getChangeEventType(Property_js_1.default.SOURCE), this.handleSourcePropertyChange_);
            const source = options.source
                ? (options.source)
                : null;
            this.setSource(source);
        }
        getLayersArray(opt_array) {
            const array = opt_array ? opt_array : [];
            array.push(this);
            return array;
        }
        getLayerStatesArray(opt_states) {
            const states = opt_states ? opt_states : [];
            states.push(this.getLayerState());
            return states;
        }
        getSource() {
            return (this.get(Property_js_1.default.SOURCE)) || null;
        }
        getSourceState() {
            const source = this.getSource();
            return !source ? State_js_2.default.UNDEFINED : source.getState();
        }
        handleSourceChange_() {
            this.changed();
        }
        handleSourcePropertyChange_() {
            if (this.sourceChangeKey_) {
                events_js_5.unlistenByKey(this.sourceChangeKey_);
                this.sourceChangeKey_ = null;
            }
            const source = this.getSource();
            if (source) {
                this.sourceChangeKey_ = events_js_5.listen(source, EventType_js_8.default.CHANGE, this.handleSourceChange_, this);
            }
            this.changed();
        }
        getFeatures(pixel) {
            return this.renderer_.getFeatures(pixel);
        }
        render(frameState, target) {
            const layerRenderer = this.getRenderer();
            if (layerRenderer.prepareFrame(frameState)) {
                return layerRenderer.renderFrame(frameState, target);
            }
        }
        setMap(map) {
            if (this.mapPrecomposeKey_) {
                events_js_5.unlistenByKey(this.mapPrecomposeKey_);
                this.mapPrecomposeKey_ = null;
            }
            if (!map) {
                this.changed();
            }
            if (this.mapRenderKey_) {
                events_js_5.unlistenByKey(this.mapRenderKey_);
                this.mapRenderKey_ = null;
            }
            if (map) {
                this.mapPrecomposeKey_ = events_js_5.listen(map, EventType_js_9.default.PRECOMPOSE, function (evt) {
                    const renderEvent = (evt);
                    const layerStatesArray = renderEvent.frameState.layerStatesArray;
                    const layerState = this.getLayerState(false);
                    asserts_js_9.assert(!layerStatesArray.some(function (arrayLayerState) {
                        return arrayLayerState.layer === layerState.layer;
                    }), 67);
                    layerStatesArray.push(layerState);
                }, this);
                this.mapRenderKey_ = events_js_5.listen(this, EventType_js_8.default.CHANGE, map.render, map);
                this.changed();
            }
        }
        setSource(source) {
            this.set(Property_js_1.default.SOURCE, source);
        }
        getRenderer() {
            if (!this.renderer_) {
                this.renderer_ = this.createRenderer();
            }
            return this.renderer_;
        }
        hasRenderer() {
            return !!this.renderer_;
        }
        createRenderer() {
            return null;
        }
        disposeInternal() {
            this.setSource(null);
            super.disposeInternal();
        }
    }
    function inView(layerState, viewState) {
        if (!layerState.visible) {
            return false;
        }
        const resolution = viewState.resolution;
        if (resolution < layerState.minResolution ||
            resolution >= layerState.maxResolution) {
            return false;
        }
        const zoom = viewState.zoom;
        return zoom > layerState.minZoom && zoom <= layerState.maxZoom;
    }
    exports.inView = inView;
    exports.default = Layer;
});
define("node_modules/ol/src/layer/Base", ["require", "exports", "node_modules/ol/src/Object", "node_modules/ol/src/layer/Property", "node_modules/ol/src/util", "node_modules/ol/src/asserts", "node_modules/ol/src/obj", "node_modules/ol/src/math"], function (require, exports, Object_js_7, Property_js_2, util_js_13, asserts_js_10, obj_js_9, math_js_17) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BaseLayer extends Object_js_7.default {
        constructor(options) {
            super();
            const properties = obj_js_9.assign({}, options);
            properties[Property_js_2.default.OPACITY] =
                options.opacity !== undefined ? options.opacity : 1;
            asserts_js_10.assert(typeof properties[Property_js_2.default.OPACITY] === 'number', 64);
            properties[Property_js_2.default.VISIBLE] =
                options.visible !== undefined ? options.visible : true;
            properties[Property_js_2.default.Z_INDEX] = options.zIndex;
            properties[Property_js_2.default.MAX_RESOLUTION] =
                options.maxResolution !== undefined ? options.maxResolution : Infinity;
            properties[Property_js_2.default.MIN_RESOLUTION] =
                options.minResolution !== undefined ? options.minResolution : 0;
            properties[Property_js_2.default.MIN_ZOOM] =
                options.minZoom !== undefined ? options.minZoom : -Infinity;
            properties[Property_js_2.default.MAX_ZOOM] =
                options.maxZoom !== undefined ? options.maxZoom : Infinity;
            this.className_ =
                properties.className !== undefined ? options.className : 'ol-layer';
            delete properties.className;
            this.setProperties(properties);
            this.state_ = null;
        }
        getClassName() {
            return this.className_;
        }
        getLayerState(opt_managed) {
            const state = this.state_ ||
                ({
                    layer: this,
                    managed: opt_managed === undefined ? true : opt_managed,
                });
            const zIndex = this.getZIndex();
            state.opacity = math_js_17.clamp(Math.round(this.getOpacity() * 100) / 100, 0, 1);
            state.sourceState = this.getSourceState();
            state.visible = this.getVisible();
            state.extent = this.getExtent();
            state.zIndex =
                zIndex !== undefined ? zIndex : state.managed === false ? Infinity : 0;
            state.maxResolution = this.getMaxResolution();
            state.minResolution = Math.max(this.getMinResolution(), 0);
            state.minZoom = this.getMinZoom();
            state.maxZoom = this.getMaxZoom();
            this.state_ = state;
            return state;
        }
        getLayersArray(opt_array) {
            return util_js_13.abstract();
        }
        getLayerStatesArray(opt_states) {
            return util_js_13.abstract();
        }
        getExtent() {
            return (this.get(Property_js_2.default.EXTENT));
        }
        getMaxResolution() {
            return (this.get(Property_js_2.default.MAX_RESOLUTION));
        }
        getMinResolution() {
            return (this.get(Property_js_2.default.MIN_RESOLUTION));
        }
        getMinZoom() {
            return (this.get(Property_js_2.default.MIN_ZOOM));
        }
        getMaxZoom() {
            return (this.get(Property_js_2.default.MAX_ZOOM));
        }
        getOpacity() {
            return (this.get(Property_js_2.default.OPACITY));
        }
        getSourceState() {
            return util_js_13.abstract();
        }
        getVisible() {
            return (this.get(Property_js_2.default.VISIBLE));
        }
        getZIndex() {
            return (this.get(Property_js_2.default.Z_INDEX));
        }
        setExtent(extent) {
            this.set(Property_js_2.default.EXTENT, extent);
        }
        setMaxResolution(maxResolution) {
            this.set(Property_js_2.default.MAX_RESOLUTION, maxResolution);
        }
        setMinResolution(minResolution) {
            this.set(Property_js_2.default.MIN_RESOLUTION, minResolution);
        }
        setMaxZoom(maxZoom) {
            this.set(Property_js_2.default.MAX_ZOOM, maxZoom);
        }
        setMinZoom(minZoom) {
            this.set(Property_js_2.default.MIN_ZOOM, minZoom);
        }
        setOpacity(opacity) {
            asserts_js_10.assert(typeof opacity === 'number', 64);
            this.set(Property_js_2.default.OPACITY, opacity);
        }
        setVisible(visible) {
            this.set(Property_js_2.default.VISIBLE, visible);
        }
        setZIndex(zindex) {
            this.set(Property_js_2.default.Z_INDEX, zindex);
        }
        disposeInternal() {
            if (this.state_) {
                this.state_.layer = null;
                this.state_ = null;
            }
            super.disposeInternal();
        }
    }
    exports.default = BaseLayer;
});
define("node_modules/ol/src/layer/Group", ["require", "exports", "node_modules/ol/src/layer/Base", "node_modules/ol/src/Collection", "node_modules/ol/src/CollectionEventType", "node_modules/ol/src/events/EventType", "node_modules/ol/src/ObjectEventType", "node_modules/ol/src/source/State", "node_modules/ol/src/asserts", "node_modules/ol/src/obj", "node_modules/ol/src/Object", "node_modules/ol/src/extent", "node_modules/ol/src/util", "node_modules/ol/src/events"], function (require, exports, Base_js_2, Collection_js_1, CollectionEventType_js_2, EventType_js_10, ObjectEventType_js_2, State_js_3, asserts_js_11, obj_js_10, Object_js_8, extent_js_27, util_js_14, events_js_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Property = {
        LAYERS: 'layers',
    };
    class LayerGroup extends Base_js_2.default {
        constructor(opt_options) {
            const options = opt_options || {};
            const baseOptions = (obj_js_10.assign({}, options));
            delete baseOptions.layers;
            let layers = options.layers;
            super(baseOptions);
            this.layersListenerKeys_ = [];
            this.listenerKeys_ = {};
            this.addEventListener(Object_js_8.getChangeEventType(Property.LAYERS), this.handleLayersChanged_);
            if (layers) {
                if (Array.isArray(layers)) {
                    layers = new Collection_js_1.default(layers.slice(), { unique: true });
                }
                else {
                    asserts_js_11.assert(typeof ((layers).getArray) === 'function', 43);
                }
            }
            else {
                layers = new Collection_js_1.default(undefined, { unique: true });
            }
            this.setLayers(layers);
        }
        handleLayerChange_() {
            this.changed();
        }
        handleLayersChanged_() {
            this.layersListenerKeys_.forEach(events_js_6.unlistenByKey);
            this.layersListenerKeys_.length = 0;
            const layers = this.getLayers();
            this.layersListenerKeys_.push(events_js_6.listen(layers, CollectionEventType_js_2.default.ADD, this.handleLayersAdd_, this), events_js_6.listen(layers, CollectionEventType_js_2.default.REMOVE, this.handleLayersRemove_, this));
            for (const id in this.listenerKeys_) {
                this.listenerKeys_[id].forEach(events_js_6.unlistenByKey);
            }
            obj_js_10.clear(this.listenerKeys_);
            const layersArray = layers.getArray();
            for (let i = 0, ii = layersArray.length; i < ii; i++) {
                const layer = layersArray[i];
                this.listenerKeys_[util_js_14.getUid(layer)] = [
                    events_js_6.listen(layer, ObjectEventType_js_2.default.PROPERTYCHANGE, this.handleLayerChange_, this),
                    events_js_6.listen(layer, EventType_js_10.default.CHANGE, this.handleLayerChange_, this),
                ];
            }
            this.changed();
        }
        handleLayersAdd_(collectionEvent) {
            const layer = (collectionEvent.element);
            this.listenerKeys_[util_js_14.getUid(layer)] = [
                events_js_6.listen(layer, ObjectEventType_js_2.default.PROPERTYCHANGE, this.handleLayerChange_, this),
                events_js_6.listen(layer, EventType_js_10.default.CHANGE, this.handleLayerChange_, this),
            ];
            this.changed();
        }
        handleLayersRemove_(collectionEvent) {
            const layer = (collectionEvent.element);
            const key = util_js_14.getUid(layer);
            this.listenerKeys_[key].forEach(events_js_6.unlistenByKey);
            delete this.listenerKeys_[key];
            this.changed();
        }
        getLayers() {
            return (this.get(Property.LAYERS));
        }
        setLayers(layers) {
            this.set(Property.LAYERS, layers);
        }
        getLayersArray(opt_array) {
            const array = opt_array !== undefined ? opt_array : [];
            this.getLayers().forEach(function (layer) {
                layer.getLayersArray(array);
            });
            return array;
        }
        getLayerStatesArray(opt_states) {
            const states = opt_states !== undefined ? opt_states : [];
            const pos = states.length;
            this.getLayers().forEach(function (layer) {
                layer.getLayerStatesArray(states);
            });
            const ownLayerState = this.getLayerState();
            for (let i = pos, ii = states.length; i < ii; i++) {
                const layerState = states[i];
                layerState.opacity *= ownLayerState.opacity;
                layerState.visible = layerState.visible && ownLayerState.visible;
                layerState.maxResolution = Math.min(layerState.maxResolution, ownLayerState.maxResolution);
                layerState.minResolution = Math.max(layerState.minResolution, ownLayerState.minResolution);
                layerState.minZoom = Math.max(layerState.minZoom, ownLayerState.minZoom);
                layerState.maxZoom = Math.min(layerState.maxZoom, ownLayerState.maxZoom);
                if (ownLayerState.extent !== undefined) {
                    if (layerState.extent !== undefined) {
                        layerState.extent = extent_js_27.getIntersection(layerState.extent, ownLayerState.extent);
                    }
                    else {
                        layerState.extent = ownLayerState.extent;
                    }
                }
            }
            return states;
        }
        getSourceState() {
            return State_js_3.default.READY;
        }
    }
    exports.default = LayerGroup;
});
define("node_modules/ol/src/MapEvent", ["require", "exports", "node_modules/ol/src/events/Event"], function (require, exports, Event_js_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MapEvent extends Event_js_6.default {
        constructor(type, map, opt_frameState) {
            super(type);
            this.map = map;
            this.frameState = opt_frameState !== undefined ? opt_frameState : null;
        }
    }
    exports.default = MapEvent;
});
define("node_modules/ol/src/MapBrowserEvent", ["require", "exports", "node_modules/ol/src/MapEvent"], function (require, exports, MapEvent_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MapBrowserEvent extends MapEvent_js_1.default {
        constructor(type, map, originalEvent, opt_dragging, opt_frameState) {
            super(type, map, opt_frameState);
            this.originalEvent = originalEvent;
            this.pixel_ = null;
            this.coordinate_ = null;
            this.dragging = opt_dragging !== undefined ? opt_dragging : false;
        }
        get pixel() {
            if (!this.pixel_) {
                this.pixel_ = this.map.getEventPixel(this.originalEvent);
            }
            return this.pixel_;
        }
        set pixel(pixel) {
            this.pixel_ = pixel;
        }
        get coordinate() {
            if (!this.coordinate_) {
                this.coordinate_ = this.map.getCoordinateFromPixel(this.pixel);
            }
            return this.coordinate_;
        }
        set coordinate(coordinate) {
            this.coordinate_ = coordinate;
        }
        preventDefault() {
            super.preventDefault();
            this.originalEvent.preventDefault();
        }
        stopPropagation() {
            super.stopPropagation();
            this.originalEvent.stopPropagation();
        }
    }
    exports.default = MapBrowserEvent;
});
define("node_modules/ol/src/MapBrowserEventType", ["require", "exports", "node_modules/ol/src/events/EventType"], function (require, exports, EventType_js_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        SINGLECLICK: 'singleclick',
        CLICK: EventType_js_11.default.CLICK,
        DBLCLICK: EventType_js_11.default.DBLCLICK,
        POINTERDRAG: 'pointerdrag',
        POINTERMOVE: 'pointermove',
        POINTERDOWN: 'pointerdown',
        POINTERUP: 'pointerup',
        POINTEROVER: 'pointerover',
        POINTEROUT: 'pointerout',
        POINTERENTER: 'pointerenter',
        POINTERLEAVE: 'pointerleave',
        POINTERCANCEL: 'pointercancel',
    };
});
define("node_modules/ol/src/pointer/EventType", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        POINTERMOVE: 'pointermove',
        POINTERDOWN: 'pointerdown',
        POINTERUP: 'pointerup',
        POINTEROVER: 'pointerover',
        POINTEROUT: 'pointerout',
        POINTERENTER: 'pointerenter',
        POINTERLEAVE: 'pointerleave',
        POINTERCANCEL: 'pointercancel',
    };
});
define("node_modules/ol/src/MapBrowserEventHandler", ["require", "exports", "node_modules/ol/src/events/Target", "node_modules/ol/src/events/EventType", "node_modules/ol/src/MapBrowserEvent", "node_modules/ol/src/MapBrowserEventType", "node_modules/ol/src/pointer/EventType", "node_modules/ol/src/has", "node_modules/ol/src/events"], function (require, exports, Target_js_5, EventType_js_12, MapBrowserEvent_js_1, MapBrowserEventType_js_1, EventType_js_13, has_js_5, events_js_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MapBrowserEventHandler extends Target_js_5.default {
        constructor(map, moveTolerance) {
            super(map);
            this.map_ = map;
            this.clickTimeoutId_;
            this.dragging_ = false;
            this.dragListenerKeys_ = [];
            this.moveTolerance_ = moveTolerance
                ? moveTolerance * has_js_5.DEVICE_PIXEL_RATIO
                : has_js_5.DEVICE_PIXEL_RATIO;
            this.down_ = null;
            const element = this.map_.getViewport();
            this.activePointers_ = 0;
            this.trackedTouches_ = {};
            this.element_ = element;
            this.pointerdownListenerKey_ = events_js_7.listen(element, EventType_js_13.default.POINTERDOWN, this.handlePointerDown_, this);
            this.originalPointerMoveEvent_;
            this.relayedListenerKey_ = events_js_7.listen(element, EventType_js_13.default.POINTERMOVE, this.relayEvent_, this);
            this.boundHandleTouchMove_ = this.handleTouchMove_.bind(this);
            this.element_.addEventListener(EventType_js_12.default.TOUCHMOVE, this.boundHandleTouchMove_, has_js_5.PASSIVE_EVENT_LISTENERS ? { passive: false } : false);
        }
        emulateClick_(pointerEvent) {
            let newEvent = new MapBrowserEvent_js_1.default(MapBrowserEventType_js_1.default.CLICK, this.map_, pointerEvent);
            this.dispatchEvent(newEvent);
            if (this.clickTimeoutId_ !== undefined) {
                clearTimeout(this.clickTimeoutId_);
                this.clickTimeoutId_ = undefined;
                newEvent = new MapBrowserEvent_js_1.default(MapBrowserEventType_js_1.default.DBLCLICK, this.map_, pointerEvent);
                this.dispatchEvent(newEvent);
            }
            else {
                this.clickTimeoutId_ = setTimeout(function () {
                    this.clickTimeoutId_ = undefined;
                    const newEvent = new MapBrowserEvent_js_1.default(MapBrowserEventType_js_1.default.SINGLECLICK, this.map_, pointerEvent);
                    this.dispatchEvent(newEvent);
                }.bind(this), 250);
            }
        }
        updateActivePointers_(pointerEvent) {
            const event = pointerEvent;
            if (event.type == MapBrowserEventType_js_1.default.POINTERUP ||
                event.type == MapBrowserEventType_js_1.default.POINTERCANCEL) {
                delete this.trackedTouches_[event.pointerId];
            }
            else if (event.type == MapBrowserEventType_js_1.default.POINTERDOWN) {
                this.trackedTouches_[event.pointerId] = true;
            }
            this.activePointers_ = Object.keys(this.trackedTouches_).length;
        }
        handlePointerUp_(pointerEvent) {
            this.updateActivePointers_(pointerEvent);
            const newEvent = new MapBrowserEvent_js_1.default(MapBrowserEventType_js_1.default.POINTERUP, this.map_, pointerEvent);
            this.dispatchEvent(newEvent);
            if (!newEvent.propagationStopped &&
                !this.dragging_ &&
                this.isMouseActionButton_(pointerEvent)) {
                this.emulateClick_(this.down_);
            }
            if (this.activePointers_ === 0) {
                this.dragListenerKeys_.forEach(events_js_7.unlistenByKey);
                this.dragListenerKeys_.length = 0;
                this.dragging_ = false;
                this.down_ = null;
            }
        }
        isMouseActionButton_(pointerEvent) {
            return pointerEvent.button === 0;
        }
        handlePointerDown_(pointerEvent) {
            this.updateActivePointers_(pointerEvent);
            const newEvent = new MapBrowserEvent_js_1.default(MapBrowserEventType_js_1.default.POINTERDOWN, this.map_, pointerEvent);
            this.dispatchEvent(newEvent);
            this.down_ = pointerEvent;
            if (this.dragListenerKeys_.length === 0) {
                this.dragListenerKeys_.push(events_js_7.listen(document, MapBrowserEventType_js_1.default.POINTERMOVE, this.handlePointerMove_, this), events_js_7.listen(document, MapBrowserEventType_js_1.default.POINTERUP, this.handlePointerUp_, this), events_js_7.listen(this.element_, MapBrowserEventType_js_1.default.POINTERCANCEL, this.handlePointerUp_, this));
                if (this.element_.getRootNode &&
                    this.element_.getRootNode() !== document) {
                    this.dragListenerKeys_.push(events_js_7.listen(this.element_.getRootNode(), MapBrowserEventType_js_1.default.POINTERUP, this.handlePointerUp_, this));
                }
            }
        }
        handlePointerMove_(pointerEvent) {
            if (this.isMoving_(pointerEvent)) {
                this.dragging_ = true;
                const newEvent = new MapBrowserEvent_js_1.default(MapBrowserEventType_js_1.default.POINTERDRAG, this.map_, pointerEvent, this.dragging_);
                this.dispatchEvent(newEvent);
            }
        }
        relayEvent_(pointerEvent) {
            this.originalPointerMoveEvent_ = pointerEvent;
            const dragging = !!(this.down_ && this.isMoving_(pointerEvent));
            this.dispatchEvent(new MapBrowserEvent_js_1.default(pointerEvent.type, this.map_, pointerEvent, dragging));
        }
        handleTouchMove_(event) {
            if (!this.originalPointerMoveEvent_ ||
                this.originalPointerMoveEvent_.defaultPrevented) {
                event.preventDefault();
            }
        }
        isMoving_(pointerEvent) {
            return (this.dragging_ ||
                Math.abs(pointerEvent.clientX - this.down_.clientX) >
                    this.moveTolerance_ ||
                Math.abs(pointerEvent.clientY - this.down_.clientY) > this.moveTolerance_);
        }
        disposeInternal() {
            if (this.relayedListenerKey_) {
                events_js_7.unlistenByKey(this.relayedListenerKey_);
                this.relayedListenerKey_ = null;
            }
            this.element_.removeEventListener(EventType_js_12.default.TOUCHMOVE, this.boundHandleTouchMove_);
            if (this.pointerdownListenerKey_) {
                events_js_7.unlistenByKey(this.pointerdownListenerKey_);
                this.pointerdownListenerKey_ = null;
            }
            this.dragListenerKeys_.forEach(events_js_7.unlistenByKey);
            this.dragListenerKeys_.length = 0;
            this.element_ = null;
            super.disposeInternal();
        }
    }
    exports.default = MapBrowserEventHandler;
});
define("node_modules/ol/src/MapEventType", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        POSTRENDER: 'postrender',
        MOVESTART: 'movestart',
        MOVEEND: 'moveend',
    };
});
define("node_modules/ol/src/MapProperty", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        LAYERGROUP: 'layergroup',
        SIZE: 'size',
        TARGET: 'target',
        VIEW: 'view',
    };
});
define("node_modules/ol/src/structs/PriorityQueue", ["require", "exports", "node_modules/ol/src/asserts", "node_modules/ol/src/obj"], function (require, exports, asserts_js_12, obj_js_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DROP = void 0;
    exports.DROP = Infinity;
    class PriorityQueue {
        constructor(priorityFunction, keyFunction) {
            this.priorityFunction_ = priorityFunction;
            this.keyFunction_ = keyFunction;
            this.elements_ = [];
            this.priorities_ = [];
            this.queuedElements_ = {};
        }
        clear() {
            this.elements_.length = 0;
            this.priorities_.length = 0;
            obj_js_11.clear(this.queuedElements_);
        }
        dequeue() {
            const elements = this.elements_;
            const priorities = this.priorities_;
            const element = elements[0];
            if (elements.length == 1) {
                elements.length = 0;
                priorities.length = 0;
            }
            else {
                elements[0] = elements.pop();
                priorities[0] = priorities.pop();
                this.siftUp_(0);
            }
            const elementKey = this.keyFunction_(element);
            delete this.queuedElements_[elementKey];
            return element;
        }
        enqueue(element) {
            asserts_js_12.assert(!(this.keyFunction_(element) in this.queuedElements_), 31);
            const priority = this.priorityFunction_(element);
            if (priority != exports.DROP) {
                this.elements_.push(element);
                this.priorities_.push(priority);
                this.queuedElements_[this.keyFunction_(element)] = true;
                this.siftDown_(0, this.elements_.length - 1);
                return true;
            }
            return false;
        }
        getCount() {
            return this.elements_.length;
        }
        getLeftChildIndex_(index) {
            return index * 2 + 1;
        }
        getRightChildIndex_(index) {
            return index * 2 + 2;
        }
        getParentIndex_(index) {
            return (index - 1) >> 1;
        }
        heapify_() {
            let i;
            for (i = (this.elements_.length >> 1) - 1; i >= 0; i--) {
                this.siftUp_(i);
            }
        }
        isEmpty() {
            return this.elements_.length === 0;
        }
        isKeyQueued(key) {
            return key in this.queuedElements_;
        }
        isQueued(element) {
            return this.isKeyQueued(this.keyFunction_(element));
        }
        siftUp_(index) {
            const elements = this.elements_;
            const priorities = this.priorities_;
            const count = elements.length;
            const element = elements[index];
            const priority = priorities[index];
            const startIndex = index;
            while (index < count >> 1) {
                const lIndex = this.getLeftChildIndex_(index);
                const rIndex = this.getRightChildIndex_(index);
                const smallerChildIndex = rIndex < count && priorities[rIndex] < priorities[lIndex]
                    ? rIndex
                    : lIndex;
                elements[index] = elements[smallerChildIndex];
                priorities[index] = priorities[smallerChildIndex];
                index = smallerChildIndex;
            }
            elements[index] = element;
            priorities[index] = priority;
            this.siftDown_(startIndex, index);
        }
        siftDown_(startIndex, index) {
            const elements = this.elements_;
            const priorities = this.priorities_;
            const element = elements[index];
            const priority = priorities[index];
            while (index > startIndex) {
                const parentIndex = this.getParentIndex_(index);
                if (priorities[parentIndex] > priority) {
                    elements[index] = elements[parentIndex];
                    priorities[index] = priorities[parentIndex];
                    index = parentIndex;
                }
                else {
                    break;
                }
            }
            elements[index] = element;
            priorities[index] = priority;
        }
        reprioritize() {
            const priorityFunction = this.priorityFunction_;
            const elements = this.elements_;
            const priorities = this.priorities_;
            let index = 0;
            const n = elements.length;
            let element, i, priority;
            for (i = 0; i < n; ++i) {
                element = elements[i];
                priority = priorityFunction(element);
                if (priority == exports.DROP) {
                    delete this.queuedElements_[this.keyFunction_(element)];
                }
                else {
                    priorities[index] = priority;
                    elements[index++] = element;
                }
            }
            elements.length = index;
            priorities.length = index;
            this.heapify_();
        }
    }
    exports.default = PriorityQueue;
});
define("node_modules/ol/src/TileQueue", ["require", "exports", "node_modules/ol/src/events/EventType", "node_modules/ol/src/structs/PriorityQueue", "node_modules/ol/src/TileState"], function (require, exports, EventType_js_14, PriorityQueue_js_1, TileState_js_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getTilePriority = void 0;
    class TileQueue extends PriorityQueue_js_1.default {
        constructor(tilePriorityFunction, tileChangeCallback) {
            super(function (element) {
                return tilePriorityFunction.apply(null, element);
            }, function (element) {
                return (element[0]).getKey();
            });
            this.boundHandleTileChange_ = this.handleTileChange.bind(this);
            this.tileChangeCallback_ = tileChangeCallback;
            this.tilesLoading_ = 0;
            this.tilesLoadingKeys_ = {};
        }
        enqueue(element) {
            const added = super.enqueue(element);
            if (added) {
                const tile = element[0];
                tile.addEventListener(EventType_js_14.default.CHANGE, this.boundHandleTileChange_);
            }
            return added;
        }
        getTilesLoading() {
            return this.tilesLoading_;
        }
        handleTileChange(event) {
            const tile = (event.target);
            const state = tile.getState();
            if ((tile.hifi && state === TileState_js_3.default.LOADED) ||
                state === TileState_js_3.default.ERROR ||
                state === TileState_js_3.default.EMPTY) {
                tile.removeEventListener(EventType_js_14.default.CHANGE, this.boundHandleTileChange_);
                const tileKey = tile.getKey();
                if (tileKey in this.tilesLoadingKeys_) {
                    delete this.tilesLoadingKeys_[tileKey];
                    --this.tilesLoading_;
                }
                this.tileChangeCallback_();
            }
        }
        loadMoreTiles(maxTotalLoading, maxNewLoads) {
            let newLoads = 0;
            let state, tile, tileKey;
            while (this.tilesLoading_ < maxTotalLoading &&
                newLoads < maxNewLoads &&
                this.getCount() > 0) {
                tile = (this.dequeue()[0]);
                tileKey = tile.getKey();
                state = tile.getState();
                if (state === TileState_js_3.default.IDLE && !(tileKey in this.tilesLoadingKeys_)) {
                    this.tilesLoadingKeys_[tileKey] = true;
                    ++this.tilesLoading_;
                    ++newLoads;
                    tile.load();
                }
            }
        }
    }
    exports.default = TileQueue;
    function getTilePriority(frameState, tile, tileSourceKey, tileCenter, tileResolution) {
        if (!frameState || !(tileSourceKey in frameState.wantedTiles)) {
            return PriorityQueue_js_1.DROP;
        }
        if (!frameState.wantedTiles[tileSourceKey][tile.getKey()]) {
            return PriorityQueue_js_1.DROP;
        }
        const center = frameState.viewState.center;
        const deltaX = tileCenter[0] - center[0];
        const deltaY = tileCenter[1] - center[1];
        return (65536 * Math.log(tileResolution) +
            Math.sqrt(deltaX * deltaX + deltaY * deltaY) / tileResolution);
    }
    exports.getTilePriority = getTilePriority;
});
define("node_modules/ol/src/control/Control", ["require", "exports", "node_modules/ol/src/Object", "node_modules/ol/src/MapEventType", "node_modules/ol/src/functions", "node_modules/ol/src/events", "node_modules/ol/src/dom"], function (require, exports, Object_js_9, MapEventType_js_1, functions_js_4, events_js_8, dom_js_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Control extends Object_js_9.default {
        constructor(options) {
            super();
            const element = options.element;
            if (element && !options.target && !element.style.pointerEvents) {
                element.style.pointerEvents = 'auto';
            }
            this.element = element ? element : null;
            this.target_ = null;
            this.map_ = null;
            this.listenerKeys = [];
            if (options.render) {
                this.render = options.render;
            }
            if (options.target) {
                this.setTarget(options.target);
            }
        }
        disposeInternal() {
            dom_js_3.removeNode(this.element);
            super.disposeInternal();
        }
        getMap() {
            return this.map_;
        }
        setMap(map) {
            if (this.map_) {
                dom_js_3.removeNode(this.element);
            }
            for (let i = 0, ii = this.listenerKeys.length; i < ii; ++i) {
                events_js_8.unlistenByKey(this.listenerKeys[i]);
            }
            this.listenerKeys.length = 0;
            this.map_ = map;
            if (this.map_) {
                const target = this.target_
                    ? this.target_
                    : map.getOverlayContainerStopEvent();
                target.appendChild(this.element);
                if (this.render !== functions_js_4.VOID) {
                    this.listenerKeys.push(events_js_8.listen(map, MapEventType_js_1.default.POSTRENDER, this.render, this));
                }
                map.render();
            }
        }
        render(mapEvent) { }
        setTarget(target) {
            this.target_ =
                typeof target === 'string' ? document.getElementById(target) : target;
        }
    }
    exports.default = Control;
});
define("node_modules/ol/src/interaction/Property", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        ACTIVE: 'active',
    };
});
define("node_modules/ol/src/interaction/Interaction", ["require", "exports", "node_modules/ol/src/Object", "node_modules/ol/src/interaction/Property", "node_modules/ol/src/easing"], function (require, exports, Object_js_10, Property_js_3, easing_js_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.zoomByDelta = exports.pan = void 0;
    class Interaction extends Object_js_10.default {
        constructor(opt_options) {
            super();
            if (opt_options && opt_options.handleEvent) {
                this.handleEvent = opt_options.handleEvent;
            }
            this.map_ = null;
            this.setActive(true);
        }
        getActive() {
            return (this.get(Property_js_3.default.ACTIVE));
        }
        getMap() {
            return this.map_;
        }
        handleEvent(mapBrowserEvent) {
            return true;
        }
        setActive(active) {
            this.set(Property_js_3.default.ACTIVE, active);
        }
        setMap(map) {
            this.map_ = map;
        }
    }
    function pan(view, delta, opt_duration) {
        const currentCenter = view.getCenterInternal();
        if (currentCenter) {
            const center = [currentCenter[0] + delta[0], currentCenter[1] + delta[1]];
            view.animateInternal({
                duration: opt_duration !== undefined ? opt_duration : 250,
                easing: easing_js_4.linear,
                center: view.getConstrainedCenter(center),
            });
        }
    }
    exports.pan = pan;
    function zoomByDelta(view, delta, opt_anchor, opt_duration) {
        const currentZoom = view.getZoom();
        if (currentZoom === undefined) {
            return;
        }
        const newZoom = view.getConstrainedZoom(currentZoom + delta);
        const newResolution = view.getResolutionForZoom(newZoom);
        if (view.getAnimating()) {
            view.cancelAnimations();
        }
        view.animate({
            resolution: newResolution,
            anchor: opt_anchor,
            duration: opt_duration !== undefined ? opt_duration : 250,
            easing: easing_js_4.easeOut,
        });
    }
    exports.zoomByDelta = zoomByDelta;
    exports.default = Interaction;
});
define("node_modules/ol/src/OverlayPositioning", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        BOTTOM_LEFT: 'bottom-left',
        BOTTOM_CENTER: 'bottom-center',
        BOTTOM_RIGHT: 'bottom-right',
        CENTER_LEFT: 'center-left',
        CENTER_CENTER: 'center-center',
        CENTER_RIGHT: 'center-right',
        TOP_LEFT: 'top-left',
        TOP_CENTER: 'top-center',
        TOP_RIGHT: 'top-right',
    };
});
define("node_modules/ol/src/Overlay", ["require", "exports", "node_modules/ol/src/Object", "node_modules/ol/src/MapEventType", "node_modules/ol/src/OverlayPositioning", "node_modules/ol/src/css", "node_modules/ol/src/extent", "node_modules/ol/src/events", "node_modules/ol/src/dom"], function (require, exports, Object_js_11, MapEventType_js_2, OverlayPositioning_js_1, css_js_2, extent_js_28, events_js_9, dom_js_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Property = {
        ELEMENT: 'element',
        MAP: 'map',
        OFFSET: 'offset',
        POSITION: 'position',
        POSITIONING: 'positioning',
    };
    class Overlay extends Object_js_11.default {
        constructor(options) {
            super();
            this.options = options;
            this.id = options.id;
            this.insertFirst =
                options.insertFirst !== undefined ? options.insertFirst : true;
            this.stopEvent = options.stopEvent !== undefined ? options.stopEvent : true;
            this.element = document.createElement('div');
            this.element.className =
                options.className !== undefined
                    ? options.className
                    : 'ol-overlay-container ' + css_js_2.CLASS_SELECTABLE;
            this.element.style.position = 'absolute';
            this.element.style.pointerEvents = 'auto';
            let autoPan = options.autoPan;
            if (autoPan && 'object' !== typeof autoPan) {
                autoPan = {
                    animation: options.autoPanAnimation,
                    margin: options.autoPanMargin,
                };
            }
            this.autoPan = (autoPan) || false;
            this.rendered = {
                transform_: '',
                visible: true,
            };
            this.mapPostrenderListenerKey = null;
            this.addEventListener(Object_js_11.getChangeEventType(Property.ELEMENT), this.handleElementChanged);
            this.addEventListener(Object_js_11.getChangeEventType(Property.MAP), this.handleMapChanged);
            this.addEventListener(Object_js_11.getChangeEventType(Property.OFFSET), this.handleOffsetChanged);
            this.addEventListener(Object_js_11.getChangeEventType(Property.POSITION), this.handlePositionChanged);
            this.addEventListener(Object_js_11.getChangeEventType(Property.POSITIONING), this.handlePositioningChanged);
            if (options.element !== undefined) {
                this.setElement(options.element);
            }
            this.setOffset(options.offset !== undefined ? options.offset : [0, 0]);
            this.setPositioning(options.positioning !== undefined
                ? (options.positioning)
                : OverlayPositioning_js_1.default.TOP_LEFT);
            if (options.position !== undefined) {
                this.setPosition(options.position);
            }
        }
        getElement() {
            return (this.get(Property.ELEMENT));
        }
        getId() {
            return this.id;
        }
        getMap() {
            return (this.get(Property.MAP));
        }
        getOffset() {
            return (this.get(Property.OFFSET));
        }
        getPosition() {
            return (this.get(Property.POSITION));
        }
        getPositioning() {
            return (this.get(Property.POSITIONING));
        }
        handleElementChanged() {
            dom_js_4.removeChildren(this.element);
            const element = this.getElement();
            if (element) {
                this.element.appendChild(element);
            }
        }
        handleMapChanged() {
            if (this.mapPostrenderListenerKey) {
                dom_js_4.removeNode(this.element);
                events_js_9.unlistenByKey(this.mapPostrenderListenerKey);
                this.mapPostrenderListenerKey = null;
            }
            const map = this.getMap();
            if (map) {
                this.mapPostrenderListenerKey = events_js_9.listen(map, MapEventType_js_2.default.POSTRENDER, this.render, this);
                this.updatePixelPosition();
                const container = this.stopEvent
                    ? map.getOverlayContainerStopEvent()
                    : map.getOverlayContainer();
                if (this.insertFirst) {
                    container.insertBefore(this.element, container.childNodes[0] || null);
                }
                else {
                    container.appendChild(this.element);
                }
                this.performAutoPan();
            }
        }
        render() {
            this.updatePixelPosition();
        }
        handleOffsetChanged() {
            this.updatePixelPosition();
        }
        handlePositionChanged() {
            this.updatePixelPosition();
            this.performAutoPan();
        }
        handlePositioningChanged() {
            this.updatePixelPosition();
        }
        setElement(element) {
            this.set(Property.ELEMENT, element);
        }
        setMap(map) {
            this.set(Property.MAP, map);
        }
        setOffset(offset) {
            this.set(Property.OFFSET, offset);
        }
        setPosition(position) {
            this.set(Property.POSITION, position);
        }
        performAutoPan() {
            if (this.autoPan) {
                this.panIntoView(this.autoPan);
            }
        }
        panIntoView(opt_panIntoViewOptions) {
            const map = this.getMap();
            if (!map || !map.getTargetElement() || !this.get(Property.POSITION)) {
                return;
            }
            const mapRect = this.getRect(map.getTargetElement(), map.getSize());
            const element = this.getElement();
            const overlayRect = this.getRect(element, [
                dom_js_4.outerWidth(element),
                dom_js_4.outerHeight(element),
            ]);
            const panIntoViewOptions = opt_panIntoViewOptions || {};
            const myMargin = panIntoViewOptions.margin === undefined ? 20 : panIntoViewOptions.margin;
            if (!extent_js_28.containsExtent(mapRect, overlayRect)) {
                const offsetLeft = overlayRect[0] - mapRect[0];
                const offsetRight = mapRect[2] - overlayRect[2];
                const offsetTop = overlayRect[1] - mapRect[1];
                const offsetBottom = mapRect[3] - overlayRect[3];
                const delta = [0, 0];
                if (offsetLeft < 0) {
                    delta[0] = offsetLeft - myMargin;
                }
                else if (offsetRight < 0) {
                    delta[0] = Math.abs(offsetRight) + myMargin;
                }
                if (offsetTop < 0) {
                    delta[1] = offsetTop - myMargin;
                }
                else if (offsetBottom < 0) {
                    delta[1] = Math.abs(offsetBottom) + myMargin;
                }
                if (delta[0] !== 0 || delta[1] !== 0) {
                    const center = (map
                        .getView()
                        .getCenterInternal());
                    const centerPx = map.getPixelFromCoordinateInternal(center);
                    const newCenterPx = [centerPx[0] + delta[0], centerPx[1] + delta[1]];
                    const panOptions = panIntoViewOptions.animation || {};
                    map.getView().animateInternal({
                        center: map.getCoordinateFromPixelInternal(newCenterPx),
                        duration: panOptions.duration,
                        easing: panOptions.easing,
                    });
                }
            }
        }
        getRect(element, size) {
            const box = element.getBoundingClientRect();
            const offsetX = box.left + window.pageXOffset;
            const offsetY = box.top + window.pageYOffset;
            return [offsetX, offsetY, offsetX + size[0], offsetY + size[1]];
        }
        setPositioning(positioning) {
            this.set(Property.POSITIONING, positioning);
        }
        setVisible(visible) {
            if (this.rendered.visible !== visible) {
                this.element.style.display = visible ? '' : 'none';
                this.rendered.visible = visible;
            }
        }
        updatePixelPosition() {
            const map = this.getMap();
            const position = this.getPosition();
            if (!map || !map.isRendered() || !position) {
                this.setVisible(false);
                return;
            }
            const pixel = map.getPixelFromCoordinate(position);
            const mapSize = map.getSize();
            this.updateRenderedPosition(pixel, mapSize);
        }
        updateRenderedPosition(pixel, mapSize) {
            const style = this.element.style;
            const offset = this.getOffset();
            const positioning = this.getPositioning();
            this.setVisible(true);
            const x = Math.round(pixel[0] + offset[0]) + 'px';
            const y = Math.round(pixel[1] + offset[1]) + 'px';
            let posX = '0%';
            let posY = '0%';
            if (positioning == OverlayPositioning_js_1.default.BOTTOM_RIGHT ||
                positioning == OverlayPositioning_js_1.default.CENTER_RIGHT ||
                positioning == OverlayPositioning_js_1.default.TOP_RIGHT) {
                posX = '-100%';
            }
            else if (positioning == OverlayPositioning_js_1.default.BOTTOM_CENTER ||
                positioning == OverlayPositioning_js_1.default.CENTER_CENTER ||
                positioning == OverlayPositioning_js_1.default.TOP_CENTER) {
                posX = '-50%';
            }
            if (positioning == OverlayPositioning_js_1.default.BOTTOM_LEFT ||
                positioning == OverlayPositioning_js_1.default.BOTTOM_CENTER ||
                positioning == OverlayPositioning_js_1.default.BOTTOM_RIGHT) {
                posY = '-100%';
            }
            else if (positioning == OverlayPositioning_js_1.default.CENTER_LEFT ||
                positioning == OverlayPositioning_js_1.default.CENTER_CENTER ||
                positioning == OverlayPositioning_js_1.default.CENTER_RIGHT) {
                posY = '-50%';
            }
            const transform = `translate(${posX}, ${posY}) translate(${x}, ${y})`;
            if (this.rendered.transform_ != transform) {
                this.rendered.transform_ = transform;
                style.transform = transform;
                style.msTransform = transform;
            }
        }
        getOptions() {
            return this.options;
        }
    }
    exports.default = Overlay;
});
define("node_modules/ol/src/style/IconImage", ["require", "exports", "node_modules/ol/src/events/Target", "node_modules/ol/src/events/EventType", "node_modules/ol/src/ImageState", "node_modules/ol/src/dom", "node_modules/ol/src/style/IconImageCache", "node_modules/ol/src/Image"], function (require, exports, Target_js_6, EventType_js_15, ImageState_js_5, dom_js_5, IconImageCache_js_1, Image_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.get = void 0;
    let taintedTestContext = null;
    class IconImage extends Target_js_6.default {
        constructor(image, src, size, crossOrigin, imageState, color) {
            super();
            this.hitDetectionImage_ = null;
            this.image_ = !image ? new Image() : image;
            if (crossOrigin !== null) {
                (this.image_).crossOrigin = crossOrigin;
            }
            this.canvas_ = {};
            this.color_ = color;
            this.unlisten_ = null;
            this.imageState_ = imageState;
            this.size_ = size;
            this.src_ = src;
            this.tainted_;
        }
        isTainted_() {
            if (this.tainted_ === undefined && this.imageState_ === ImageState_js_5.default.LOADED) {
                if (!taintedTestContext) {
                    taintedTestContext = dom_js_5.createCanvasContext2D(1, 1);
                }
                taintedTestContext.drawImage(this.image_, 0, 0);
                try {
                    taintedTestContext.getImageData(0, 0, 1, 1);
                    this.tainted_ = false;
                }
                catch (e) {
                    taintedTestContext = null;
                    this.tainted_ = true;
                }
            }
            return this.tainted_ === true;
        }
        dispatchChangeEvent_() {
            this.dispatchEvent(EventType_js_15.default.CHANGE);
        }
        handleImageError_() {
            this.imageState_ = ImageState_js_5.default.ERROR;
            this.unlistenImage_();
            this.dispatchChangeEvent_();
        }
        handleImageLoad_() {
            this.imageState_ = ImageState_js_5.default.LOADED;
            if (this.size_) {
                this.image_.width = this.size_[0];
                this.image_.height = this.size_[1];
            }
            else {
                this.size_ = [this.image_.width, this.image_.height];
            }
            this.unlistenImage_();
            this.dispatchChangeEvent_();
        }
        getImage(pixelRatio) {
            this.replaceColor_(pixelRatio);
            return this.canvas_[pixelRatio] ? this.canvas_[pixelRatio] : this.image_;
        }
        getPixelRatio(pixelRatio) {
            this.replaceColor_(pixelRatio);
            return this.canvas_[pixelRatio] ? pixelRatio : 1;
        }
        getImageState() {
            return this.imageState_;
        }
        getHitDetectionImage() {
            if (!this.hitDetectionImage_) {
                if (this.isTainted_()) {
                    const width = this.size_[0];
                    const height = this.size_[1];
                    const context = dom_js_5.createCanvasContext2D(width, height);
                    context.fillRect(0, 0, width, height);
                    this.hitDetectionImage_ = context.canvas;
                }
                else {
                    this.hitDetectionImage_ = this.image_;
                }
            }
            return this.hitDetectionImage_;
        }
        getSize() {
            return this.size_;
        }
        getSrc() {
            return this.src_;
        }
        load() {
            if (this.imageState_ == ImageState_js_5.default.IDLE) {
                this.imageState_ = ImageState_js_5.default.LOADING;
                try {
                    (this.image_).src = this.src_;
                }
                catch (e) {
                    this.handleImageError_();
                }
                this.unlisten_ = Image_js_2.listenImage(this.image_, this.handleImageLoad_.bind(this), this.handleImageError_.bind(this));
            }
        }
        replaceColor_(pixelRatio) {
            if (!this.color_ || this.canvas_[pixelRatio]) {
                return;
            }
            const canvas = document.createElement('canvas');
            this.canvas_[pixelRatio] = canvas;
            canvas.width = Math.ceil(this.image_.width * pixelRatio);
            canvas.height = Math.ceil(this.image_.height * pixelRatio);
            const ctx = canvas.getContext('2d');
            ctx.scale(pixelRatio, pixelRatio);
            ctx.drawImage(this.image_, 0, 0);
            if (this.isTainted_()) {
                const c = this.color_;
                ctx.globalCompositeOperation = 'multiply';
                ctx.fillStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.globalCompositeOperation = 'destination-in';
                ctx.drawImage(this.image_, 0, 0);
                return;
            }
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;
            const r = this.color_[0] / 255.0;
            const g = this.color_[1] / 255.0;
            const b = this.color_[2] / 255.0;
            for (let i = 0, ii = data.length; i < ii; i += 4) {
                data[i] *= r;
                data[i + 1] *= g;
                data[i + 2] *= b;
            }
            ctx.putImageData(imgData, 0, 0);
        }
        unlistenImage_() {
            if (this.unlisten_) {
                this.unlisten_();
                this.unlisten_ = null;
            }
        }
    }
    function get(image, src, size, crossOrigin, imageState, color) {
        let iconImage = IconImageCache_js_1.shared.get(src, crossOrigin, color);
        if (!iconImage) {
            iconImage = new IconImage(image, src, size, crossOrigin, imageState, color);
            IconImageCache_js_1.shared.set(src, crossOrigin, color, iconImage);
        }
        return iconImage;
    }
    exports.get = get;
    exports.default = IconImage;
});
define("node_modules/ol/src/style/IconImageCache", ["require", "exports", "node_modules/ol/src/color"], function (require, exports, color_js_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.shared = void 0;
    class IconImageCache {
        constructor() {
            this.cache_ = {};
            this.cacheSize_ = 0;
            this.maxCacheSize_ = 32;
        }
        clear() {
            this.cache_ = {};
            this.cacheSize_ = 0;
        }
        canExpireCache() {
            return this.cacheSize_ > this.maxCacheSize_;
        }
        expire() {
            if (this.canExpireCache()) {
                let i = 0;
                for (const key in this.cache_) {
                    const iconImage = this.cache_[key];
                    if ((i++ & 3) === 0 && !iconImage.hasListener()) {
                        delete this.cache_[key];
                        --this.cacheSize_;
                    }
                }
            }
        }
        get(src, crossOrigin, color) {
            const key = getKey(src, crossOrigin, color);
            return key in this.cache_ ? this.cache_[key] : null;
        }
        set(src, crossOrigin, color, iconImage) {
            const key = getKey(src, crossOrigin, color);
            this.cache_[key] = iconImage;
            ++this.cacheSize_;
        }
        setSize(maxCacheSize) {
            this.maxCacheSize_ = maxCacheSize;
            this.expire();
        }
    }
    function getKey(src, crossOrigin, color) {
        const colorString = color ? color_js_3.asString(color) : 'null';
        return crossOrigin + ':' + src + ':' + colorString;
    }
    exports.default = IconImageCache;
    exports.shared = new IconImageCache();
});
define("node_modules/ol/src/renderer/Map", ["require", "exports", "node_modules/ol/src/Disposable", "node_modules/ol/src/functions", "node_modules/ol/src/util", "node_modules/ol/src/transform", "node_modules/ol/src/extent", "node_modules/ol/src/style/IconImageCache", "node_modules/ol/src/layer/Layer", "node_modules/ol/src/render", "node_modules/ol/src/coordinate"], function (require, exports, Disposable_js_2, functions_js_5, util_js_15, transform_js_11, extent_js_29, IconImageCache_js_2, Layer_js_1, render_js_1, coordinate_js_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MapRenderer extends Disposable_js_2.default {
        constructor(map) {
            super();
            this.map_ = map;
            this.declutterTree_ = null;
        }
        dispatchRenderEvent(type, frameState) {
            util_js_15.abstract();
        }
        calculateMatrices2D(frameState) {
            const viewState = frameState.viewState;
            const coordinateToPixelTransform = frameState.coordinateToPixelTransform;
            const pixelToCoordinateTransform = frameState.pixelToCoordinateTransform;
            transform_js_11.compose(coordinateToPixelTransform, frameState.size[0] / 2, frameState.size[1] / 2, 1 / viewState.resolution, -1 / viewState.resolution, -viewState.rotation, -viewState.center[0], -viewState.center[1]);
            transform_js_11.makeInverse(pixelToCoordinateTransform, coordinateToPixelTransform);
        }
        forEachFeatureAtCoordinate(coordinate, frameState, hitTolerance, checkWrapped, callback, thisArg, layerFilter, thisArg2) {
            let result;
            const viewState = frameState.viewState;
            function forEachFeatureAtCoordinate(managed, feature, layer) {
                return callback.call(thisArg, feature, managed ? layer : null);
            }
            const projection = viewState.projection;
            const translatedCoordinate = coordinate_js_4.wrapX(coordinate.slice(), projection);
            const offsets = [[0, 0]];
            if (projection.canWrapX() && checkWrapped) {
                const projectionExtent = projection.getExtent();
                const worldWidth = extent_js_29.getWidth(projectionExtent);
                offsets.push([-worldWidth, 0], [worldWidth, 0]);
            }
            const layerStates = frameState.layerStatesArray;
            const numLayers = layerStates.length;
            let declutteredFeatures;
            if (this.declutterTree_) {
                declutteredFeatures = this.declutterTree_.all().map(function (entry) {
                    return entry.value;
                });
            }
            const tmpCoord = [];
            for (let i = 0; i < offsets.length; i++) {
                for (let j = numLayers - 1; j >= 0; --j) {
                    const layerState = layerStates[j];
                    const layer = (layerState.layer);
                    if (layer.hasRenderer() &&
                        Layer_js_1.inView(layerState, viewState) &&
                        layerFilter.call(thisArg2, layer)) {
                        const layerRenderer = layer.getRenderer();
                        const source = layer.getSource();
                        if (layerRenderer && source) {
                            const coordinates = source.getWrapX()
                                ? translatedCoordinate
                                : coordinate;
                            const callback = forEachFeatureAtCoordinate.bind(null, layerState.managed);
                            tmpCoord[0] = coordinates[0] + offsets[i][0];
                            tmpCoord[1] = coordinates[1] + offsets[i][1];
                            result = layerRenderer.forEachFeatureAtCoordinate(tmpCoord, frameState, hitTolerance, callback, declutteredFeatures);
                        }
                        if (result) {
                            return result;
                        }
                    }
                }
            }
            return undefined;
        }
        forEachLayerAtPixel(pixel, frameState, hitTolerance, callback, layerFilter) {
            return util_js_15.abstract();
        }
        hasFeatureAtCoordinate(coordinate, frameState, hitTolerance, checkWrapped, layerFilter, thisArg) {
            const hasFeature = this.forEachFeatureAtCoordinate(coordinate, frameState, hitTolerance, checkWrapped, functions_js_5.TRUE, this, layerFilter, thisArg);
            return hasFeature !== undefined;
        }
        getMap() {
            return this.map_;
        }
        renderFrame(frameState) {
            this.declutterTree_ = render_js_1.renderDeclutterItems(frameState, this.declutterTree_);
        }
        scheduleExpireIconCache(frameState) {
            if (IconImageCache_js_2.shared.canExpireCache()) {
                frameState.postRenderFunctions.push(expireIconCache);
            }
        }
    }
    function expireIconCache(map, frameState) {
        IconImageCache_js_2.shared.expire();
    }
    exports.default = MapRenderer;
});
define("node_modules/ol/src/PluggableMap", ["require", "exports", "node_modules/ol/src/Object", "node_modules/ol/src/Collection", "node_modules/ol/src/CollectionEventType", "node_modules/ol/src/events/EventType", "node_modules/ol/src/layer/Group", "node_modules/ol/src/MapBrowserEvent", "node_modules/ol/src/MapBrowserEventHandler", "node_modules/ol/src/MapBrowserEventType", "node_modules/ol/src/MapEvent", "node_modules/ol/src/MapEventType", "node_modules/ol/src/MapProperty", "node_modules/ol/src/ObjectEventType", "node_modules/ol/src/pointer/EventType", "node_modules/ol/src/render/EventType", "node_modules/ol/src/TileQueue", "node_modules/ol/src/View", "node_modules/ol/src/ViewHint", "node_modules/ol/src/has", "node_modules/ol/src/functions", "node_modules/ol/src/transform", "node_modules/ol/src/asserts", "node_modules/ol/src/extent", "node_modules/ol/src/proj", "node_modules/ol/src/size", "node_modules/ol/src/events", "node_modules/ol/src/dom"], function (require, exports, Object_js_12, Collection_js_2, CollectionEventType_js_3, EventType_js_16, Group_js_1, MapBrowserEvent_js_2, MapBrowserEventHandler_js_1, MapBrowserEventType_js_2, MapEvent_js_2, MapEventType_js_3, MapProperty_js_1, ObjectEventType_js_3, EventType_js_17, EventType_js_18, TileQueue_js_1, View_js_1, ViewHint_js_2, has_js_6, functions_js_6, transform_js_12, asserts_js_13, extent_js_30, proj_js_7, size_js_6, events_js_10, dom_js_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PluggableMap extends Object_js_12.default {
        constructor(options) {
            super();
            const optionsInternal = createOptionsInternal(options);
            this.boundHandleBrowserEvent_ = this.handleBrowserEvent.bind(this);
            this.maxTilesLoading_ =
                options.maxTilesLoading !== undefined ? options.maxTilesLoading : 16;
            this.pixelRatio_ =
                options.pixelRatio !== undefined
                    ? options.pixelRatio
                    : has_js_6.DEVICE_PIXEL_RATIO;
            this.postRenderTimeoutHandle_;
            this.animationDelayKey_;
            this.animationDelay_ = function () {
                this.animationDelayKey_ = undefined;
                this.renderFrame_(Date.now());
            }.bind(this);
            this.coordinateToPixelTransform_ = transform_js_12.create();
            this.pixelToCoordinateTransform_ = transform_js_12.create();
            this.frameIndex_ = 0;
            this.frameState_ = null;
            this.previousExtent_ = null;
            this.viewPropertyListenerKey_ = null;
            this.viewChangeListenerKey_ = null;
            this.layerGroupPropertyListenerKeys_ = null;
            this.viewport_ = document.createElement('div');
            this.viewport_.className =
                'ol-viewport' + ('ontouchstart' in window ? ' ol-touch' : '');
            this.viewport_.style.position = 'relative';
            this.viewport_.style.overflow = 'hidden';
            this.viewport_.style.width = '100%';
            this.viewport_.style.height = '100%';
            this.overlayContainer_ = document.createElement('div');
            this.overlayContainer_.style.position = 'absolute';
            this.overlayContainer_.style.zIndex = '0';
            this.overlayContainer_.style.width = '100%';
            this.overlayContainer_.style.height = '100%';
            this.overlayContainer_.style.pointerEvents = 'none';
            this.overlayContainer_.className = 'ol-overlaycontainer';
            this.viewport_.appendChild(this.overlayContainer_);
            this.overlayContainerStopEvent_ = document.createElement('div');
            this.overlayContainerStopEvent_.style.position = 'absolute';
            this.overlayContainerStopEvent_.style.zIndex = '0';
            this.overlayContainerStopEvent_.style.width = '100%';
            this.overlayContainerStopEvent_.style.height = '100%';
            this.overlayContainerStopEvent_.style.pointerEvents = 'none';
            this.overlayContainerStopEvent_.className = 'ol-overlaycontainer-stopevent';
            this.viewport_.appendChild(this.overlayContainerStopEvent_);
            this.mapBrowserEventHandler_ = null;
            this.moveTolerance_ = options.moveTolerance;
            this.keyboardEventTarget_ = optionsInternal.keyboardEventTarget;
            this.keyHandlerKeys_ = null;
            this.controls = optionsInternal.controls || new Collection_js_2.default();
            this.interactions = optionsInternal.interactions || new Collection_js_2.default();
            this.overlays_ = optionsInternal.overlays;
            this.overlayIdIndex_ = {};
            this.renderer_ = null;
            this.handleResize_;
            this.postRenderFunctions_ = [];
            this.tileQueue_ = new TileQueue_js_1.default(this.getTilePriority.bind(this), this.handleTileChange_.bind(this));
            this.addEventListener(Object_js_12.getChangeEventType(MapProperty_js_1.default.LAYERGROUP), this.handleLayerGroupChanged_);
            this.addEventListener(Object_js_12.getChangeEventType(MapProperty_js_1.default.VIEW), this.handleViewChanged_);
            this.addEventListener(Object_js_12.getChangeEventType(MapProperty_js_1.default.SIZE), this.handleSizeChanged_);
            this.addEventListener(Object_js_12.getChangeEventType(MapProperty_js_1.default.TARGET), this.handleTargetChanged_);
            this.setProperties(optionsInternal.values);
            this.controls.forEach(function (control) {
                control.setMap(this);
            }.bind(this));
            this.controls.addEventListener(CollectionEventType_js_3.default.ADD, function (event) {
                event.element.setMap(this);
            }.bind(this));
            this.controls.addEventListener(CollectionEventType_js_3.default.REMOVE, function (event) {
                event.element.setMap(null);
            }.bind(this));
            this.interactions.forEach(function (interaction) {
                interaction.setMap(this);
            }.bind(this));
            this.interactions.addEventListener(CollectionEventType_js_3.default.ADD, function (event) {
                event.element.setMap(this);
            }.bind(this));
            this.interactions.addEventListener(CollectionEventType_js_3.default.REMOVE, function (event) {
                event.element.setMap(null);
            }.bind(this));
            this.overlays_.forEach(this.addOverlayInternal_.bind(this));
            this.overlays_.addEventListener(CollectionEventType_js_3.default.ADD, function (event) {
                this.addOverlayInternal_((event.element));
            }.bind(this));
            this.overlays_.addEventListener(CollectionEventType_js_3.default.REMOVE, function (event) {
                const overlay = (event.element);
                const id = overlay.getId();
                if (id !== undefined) {
                    delete this.overlayIdIndex_[id.toString()];
                }
                event.element.setMap(null);
            }.bind(this));
        }
        createRenderer() {
            throw new Error('Use a map type that has a createRenderer method');
        }
        addControl(control) {
            this.getControls().push(control);
        }
        addInteraction(interaction) {
            this.getInteractions().push(interaction);
        }
        addLayer(layer) {
            const layers = this.getLayerGroup().getLayers();
            layers.push(layer);
        }
        addOverlay(overlay) {
            this.getOverlays().push(overlay);
        }
        addOverlayInternal_(overlay) {
            const id = overlay.getId();
            if (id !== undefined) {
                this.overlayIdIndex_[id.toString()] = overlay;
            }
            overlay.setMap(this);
        }
        disposeInternal() {
            this.setTarget(null);
            super.disposeInternal();
        }
        forEachFeatureAtPixel(pixel, callback, opt_options) {
            if (!this.frameState_) {
                return;
            }
            const coordinate = this.getCoordinateFromPixelInternal(pixel);
            opt_options = opt_options !== undefined ? opt_options : {};
            const hitTolerance = opt_options.hitTolerance !== undefined
                ? opt_options.hitTolerance * this.frameState_.pixelRatio
                : 0;
            const layerFilter = opt_options.layerFilter !== undefined ? opt_options.layerFilter : functions_js_6.TRUE;
            const checkWrapped = opt_options.checkWrapped !== false;
            return this.renderer_.forEachFeatureAtCoordinate(coordinate, this.frameState_, hitTolerance, checkWrapped, callback, null, layerFilter, null);
        }
        getFeaturesAtPixel(pixel, opt_options) {
            const features = [];
            this.forEachFeatureAtPixel(pixel, function (feature) {
                features.push(feature);
            }, opt_options);
            return features;
        }
        forEachLayerAtPixel(pixel, callback, opt_options) {
            if (!this.frameState_) {
                return;
            }
            const options = opt_options || {};
            const hitTolerance = options.hitTolerance !== undefined
                ? options.hitTolerance * this.frameState_.pixelRatio
                : 0;
            const layerFilter = options.layerFilter || functions_js_6.TRUE;
            return this.renderer_.forEachLayerAtPixel(pixel, this.frameState_, hitTolerance, callback, layerFilter);
        }
        hasFeatureAtPixel(pixel, opt_options) {
            if (!this.frameState_) {
                return false;
            }
            const coordinate = this.getCoordinateFromPixelInternal(pixel);
            opt_options = opt_options !== undefined ? opt_options : {};
            const layerFilter = opt_options.layerFilter !== undefined ? opt_options.layerFilter : functions_js_6.TRUE;
            const hitTolerance = opt_options.hitTolerance !== undefined
                ? opt_options.hitTolerance * this.frameState_.pixelRatio
                : 0;
            const checkWrapped = opt_options.checkWrapped !== false;
            return this.renderer_.hasFeatureAtCoordinate(coordinate, this.frameState_, hitTolerance, checkWrapped, layerFilter, null);
        }
        getEventCoordinate(event) {
            return this.getCoordinateFromPixel(this.getEventPixel(event));
        }
        getEventCoordinateInternal(event) {
            return this.getCoordinateFromPixelInternal(this.getEventPixel(event));
        }
        getEventPixel(event) {
            const viewportPosition = this.viewport_.getBoundingClientRect();
            const eventPosition = 'changedTouches' in event
                ? (event).changedTouches[0]
                : (event);
            return [
                eventPosition.clientX - viewportPosition.left,
                eventPosition.clientY - viewportPosition.top,
            ];
        }
        getTarget() {
            return (this.get(MapProperty_js_1.default.TARGET));
        }
        getTargetElement() {
            const target = this.getTarget();
            if (target !== undefined) {
                return typeof target === 'string'
                    ? document.getElementById(target)
                    : target;
            }
            else {
                return null;
            }
        }
        getCoordinateFromPixel(pixel) {
            return proj_js_7.toUserCoordinate(this.getCoordinateFromPixelInternal(pixel), this.getView().getProjection());
        }
        getCoordinateFromPixelInternal(pixel) {
            const frameState = this.frameState_;
            if (!frameState) {
                return null;
            }
            else {
                return transform_js_12.apply(frameState.pixelToCoordinateTransform, pixel.slice());
            }
        }
        getControls() {
            return this.controls;
        }
        getOverlays() {
            return this.overlays_;
        }
        getOverlayById(id) {
            const overlay = this.overlayIdIndex_[id.toString()];
            return overlay !== undefined ? overlay : null;
        }
        getInteractions() {
            return this.interactions;
        }
        getLayerGroup() {
            return (this.get(MapProperty_js_1.default.LAYERGROUP));
        }
        getLayers() {
            const layers = this.getLayerGroup().getLayers();
            return layers;
        }
        getLoading() {
            const layerStatesArray = this.getLayerGroup().getLayerStatesArray();
            for (let i = 0, ii = layerStatesArray.length; i < ii; ++i) {
                const layer = layerStatesArray[i].layer;
                const source = (layer).getSource();
                if (source && source.loading) {
                    return true;
                }
            }
            return false;
        }
        getPixelFromCoordinate(coordinate) {
            const viewCoordinate = proj_js_7.fromUserCoordinate(coordinate, this.getView().getProjection());
            return this.getPixelFromCoordinateInternal(viewCoordinate);
        }
        getPixelFromCoordinateInternal(coordinate) {
            const frameState = this.frameState_;
            if (!frameState) {
                return null;
            }
            else {
                return transform_js_12.apply(frameState.coordinateToPixelTransform, coordinate.slice(0, 2));
            }
        }
        getRenderer() {
            return this.renderer_;
        }
        getSize() {
            return (this.get(MapProperty_js_1.default.SIZE));
        }
        getView() {
            return (this.get(MapProperty_js_1.default.VIEW));
        }
        getViewport() {
            return this.viewport_;
        }
        getOverlayContainer() {
            return this.overlayContainer_;
        }
        getOverlayContainerStopEvent() {
            return this.overlayContainerStopEvent_;
        }
        getTilePriority(tile, tileSourceKey, tileCenter, tileResolution) {
            return TileQueue_js_1.getTilePriority(this.frameState_, tile, tileSourceKey, tileCenter, tileResolution);
        }
        handleBrowserEvent(browserEvent, opt_type) {
            const type = opt_type || browserEvent.type;
            const mapBrowserEvent = new MapBrowserEvent_js_2.default(type, this, browserEvent);
            this.handleMapBrowserEvent(mapBrowserEvent);
        }
        handleMapBrowserEvent(mapBrowserEvent) {
            if (!this.frameState_) {
                return;
            }
            const originalEvent = (mapBrowserEvent.originalEvent);
            const eventType = originalEvent.type;
            if (eventType === EventType_js_17.default.POINTERDOWN ||
                eventType === EventType_js_16.default.WHEEL ||
                eventType === EventType_js_16.default.KEYDOWN) {
                const rootNode = this.viewport_.getRootNode
                    ? this.viewport_.getRootNode()
                    : document;
                const target = rootNode === document
                    ? (originalEvent.target)
                    : (rootNode).elementFromPoint(originalEvent.clientX, originalEvent.clientY);
                if (this.overlayContainerStopEvent_.contains(target) ||
                    !(rootNode === document ? document.documentElement : rootNode).contains(target)) {
                    return;
                }
            }
            mapBrowserEvent.frameState = this.frameState_;
            const interactionsArray = this.getInteractions().getArray();
            if (this.dispatchEvent(mapBrowserEvent) !== false) {
                for (let i = interactionsArray.length - 1; i >= 0; i--) {
                    const interaction = interactionsArray[i];
                    if (!interaction.getActive()) {
                        continue;
                    }
                    const cont = interaction.handleEvent(mapBrowserEvent);
                    if (!cont) {
                        break;
                    }
                }
            }
        }
        handlePostRender() {
            const frameState = this.frameState_;
            const tileQueue = this.tileQueue_;
            if (!tileQueue.isEmpty()) {
                let maxTotalLoading = this.maxTilesLoading_;
                let maxNewLoads = maxTotalLoading;
                if (frameState) {
                    const hints = frameState.viewHints;
                    if (hints[ViewHint_js_2.default.ANIMATING] || hints[ViewHint_js_2.default.INTERACTING]) {
                        const lowOnFrameBudget = !has_js_6.IMAGE_DECODE && Date.now() - frameState.time > 8;
                        maxTotalLoading = lowOnFrameBudget ? 0 : 8;
                        maxNewLoads = lowOnFrameBudget ? 0 : 2;
                    }
                }
                if (tileQueue.getTilesLoading() < maxTotalLoading) {
                    tileQueue.reprioritize();
                    tileQueue.loadMoreTiles(maxTotalLoading, maxNewLoads);
                }
            }
            if (frameState &&
                this.hasListener(EventType_js_18.default.RENDERCOMPLETE) &&
                !frameState.animate &&
                !this.tileQueue_.getTilesLoading() &&
                !this.getLoading()) {
                this.renderer_.dispatchRenderEvent(EventType_js_18.default.RENDERCOMPLETE, frameState);
            }
            const postRenderFunctions = this.postRenderFunctions_;
            for (let i = 0, ii = postRenderFunctions.length; i < ii; ++i) {
                postRenderFunctions[i](this, frameState);
            }
            postRenderFunctions.length = 0;
        }
        handleSizeChanged_() {
            if (this.getView() && !this.getView().getAnimating()) {
                this.getView().resolveConstraints(0);
            }
            this.render();
        }
        handleTargetChanged_() {
            let targetElement;
            if (this.getTarget()) {
                targetElement = this.getTargetElement();
            }
            if (this.mapBrowserEventHandler_) {
                for (let i = 0, ii = this.keyHandlerKeys_.length; i < ii; ++i) {
                    events_js_10.unlistenByKey(this.keyHandlerKeys_[i]);
                }
                this.keyHandlerKeys_ = null;
                this.viewport_.removeEventListener(EventType_js_16.default.CONTEXTMENU, this.boundHandleBrowserEvent_);
                this.viewport_.removeEventListener(EventType_js_16.default.WHEEL, this.boundHandleBrowserEvent_);
                if (this.handleResize_ !== undefined) {
                    removeEventListener(EventType_js_16.default.RESIZE, this.handleResize_, false);
                    this.handleResize_ = undefined;
                }
                this.mapBrowserEventHandler_.dispose();
                this.mapBrowserEventHandler_ = null;
                dom_js_6.removeNode(this.viewport_);
            }
            if (!targetElement) {
                if (this.renderer_) {
                    clearTimeout(this.postRenderTimeoutHandle_);
                    this.postRenderFunctions_.length = 0;
                    this.renderer_.dispose();
                    this.renderer_ = null;
                }
                if (this.animationDelayKey_) {
                    cancelAnimationFrame(this.animationDelayKey_);
                    this.animationDelayKey_ = undefined;
                }
            }
            else {
                targetElement.appendChild(this.viewport_);
                if (!this.renderer_) {
                    this.renderer_ = this.createRenderer();
                }
                this.mapBrowserEventHandler_ = new MapBrowserEventHandler_js_1.default(this, this.moveTolerance_);
                for (const key in MapBrowserEventType_js_2.default) {
                    this.mapBrowserEventHandler_.addEventListener(MapBrowserEventType_js_2.default[key], this.handleMapBrowserEvent.bind(this));
                }
                this.viewport_.addEventListener(EventType_js_16.default.CONTEXTMENU, this.boundHandleBrowserEvent_, false);
                this.viewport_.addEventListener(EventType_js_16.default.WHEEL, this.boundHandleBrowserEvent_, has_js_6.PASSIVE_EVENT_LISTENERS ? { passive: false } : false);
                const keyboardEventTarget = !this.keyboardEventTarget_
                    ? targetElement
                    : this.keyboardEventTarget_;
                this.keyHandlerKeys_ = [
                    events_js_10.listen(keyboardEventTarget, EventType_js_16.default.KEYDOWN, this.handleBrowserEvent, this),
                    events_js_10.listen(keyboardEventTarget, EventType_js_16.default.KEYPRESS, this.handleBrowserEvent, this),
                ];
                if (!this.handleResize_) {
                    this.handleResize_ = this.updateSize.bind(this);
                    window.addEventListener(EventType_js_16.default.RESIZE, this.handleResize_, false);
                }
            }
            this.updateSize();
        }
        handleTileChange_() {
            this.render();
        }
        handleViewPropertyChanged_() {
            this.render();
        }
        handleViewChanged_() {
            if (this.viewPropertyListenerKey_) {
                events_js_10.unlistenByKey(this.viewPropertyListenerKey_);
                this.viewPropertyListenerKey_ = null;
            }
            if (this.viewChangeListenerKey_) {
                events_js_10.unlistenByKey(this.viewChangeListenerKey_);
                this.viewChangeListenerKey_ = null;
            }
            const view = this.getView();
            if (view) {
                this.updateViewportSize_();
                this.viewPropertyListenerKey_ = events_js_10.listen(view, ObjectEventType_js_3.default.PROPERTYCHANGE, this.handleViewPropertyChanged_, this);
                this.viewChangeListenerKey_ = events_js_10.listen(view, EventType_js_16.default.CHANGE, this.handleViewPropertyChanged_, this);
                view.resolveConstraints(0);
            }
            this.render();
        }
        handleLayerGroupChanged_() {
            if (this.layerGroupPropertyListenerKeys_) {
                this.layerGroupPropertyListenerKeys_.forEach(events_js_10.unlistenByKey);
                this.layerGroupPropertyListenerKeys_ = null;
            }
            const layerGroup = this.getLayerGroup();
            if (layerGroup) {
                this.layerGroupPropertyListenerKeys_ = [
                    events_js_10.listen(layerGroup, ObjectEventType_js_3.default.PROPERTYCHANGE, this.render, this),
                    events_js_10.listen(layerGroup, EventType_js_16.default.CHANGE, this.render, this),
                ];
            }
            this.render();
        }
        isRendered() {
            return !!this.frameState_;
        }
        renderSync() {
            if (this.animationDelayKey_) {
                cancelAnimationFrame(this.animationDelayKey_);
            }
            this.animationDelay_();
        }
        redrawText() {
            const layerStates = this.getLayerGroup().getLayerStatesArray();
            for (let i = 0, ii = layerStates.length; i < ii; ++i) {
                const layer = layerStates[i].layer;
                if (layer.hasRenderer()) {
                    layer.getRenderer().handleFontsChanged();
                }
            }
        }
        render() {
            if (this.renderer_ && this.animationDelayKey_ === undefined) {
                this.animationDelayKey_ = requestAnimationFrame(this.animationDelay_);
            }
        }
        removeControl(control) {
            return this.getControls().remove(control);
        }
        removeInteraction(interaction) {
            return this.getInteractions().remove(interaction);
        }
        removeLayer(layer) {
            const layers = this.getLayerGroup().getLayers();
            return layers.remove(layer);
        }
        removeOverlay(overlay) {
            return this.getOverlays().remove(overlay);
        }
        renderFrame_(time) {
            const size = this.getSize();
            const view = this.getView();
            const previousFrameState = this.frameState_;
            let frameState = null;
            if (size !== undefined && size_js_6.hasArea(size) && view && view.isDef()) {
                const viewHints = view.getHints(this.frameState_ ? this.frameState_.viewHints : undefined);
                const viewState = view.getState();
                frameState = {
                    animate: false,
                    coordinateToPixelTransform: this.coordinateToPixelTransform_,
                    declutterItems: previousFrameState
                        ? previousFrameState.declutterItems
                        : [],
                    extent: extent_js_30.getForViewAndSize(viewState.center, viewState.resolution, viewState.rotation, size),
                    index: this.frameIndex_++,
                    layerIndex: 0,
                    layerStatesArray: this.getLayerGroup().getLayerStatesArray(),
                    pixelRatio: this.pixelRatio_,
                    pixelToCoordinateTransform: this.pixelToCoordinateTransform_,
                    postRenderFunctions: [],
                    size: size,
                    tileQueue: this.tileQueue_,
                    time: time,
                    usedTiles: {},
                    viewState: viewState,
                    viewHints: viewHints,
                    wantedTiles: {},
                };
            }
            this.frameState_ = frameState;
            this.renderer_.renderFrame(frameState);
            if (frameState) {
                if (frameState.animate) {
                    this.render();
                }
                Array.prototype.push.apply(this.postRenderFunctions_, frameState.postRenderFunctions);
                if (previousFrameState) {
                    const moveStart = !this.previousExtent_ ||
                        (!extent_js_30.isEmpty(this.previousExtent_) &&
                            !extent_js_30.equals(frameState.extent, this.previousExtent_));
                    if (moveStart) {
                        this.dispatchEvent(new MapEvent_js_2.default(MapEventType_js_3.default.MOVESTART, this, previousFrameState));
                        this.previousExtent_ = extent_js_30.createOrUpdateEmpty(this.previousExtent_);
                    }
                }
                const idle = this.previousExtent_ &&
                    !frameState.viewHints[ViewHint_js_2.default.ANIMATING] &&
                    !frameState.viewHints[ViewHint_js_2.default.INTERACTING] &&
                    !extent_js_30.equals(frameState.extent, this.previousExtent_);
                if (idle) {
                    this.dispatchEvent(new MapEvent_js_2.default(MapEventType_js_3.default.MOVEEND, this, frameState));
                    extent_js_30.clone(frameState.extent, this.previousExtent_);
                }
            }
            this.dispatchEvent(new MapEvent_js_2.default(MapEventType_js_3.default.POSTRENDER, this, frameState));
            this.postRenderTimeoutHandle_ = setTimeout(this.handlePostRender.bind(this), 0);
        }
        setLayerGroup(layerGroup) {
            this.set(MapProperty_js_1.default.LAYERGROUP, layerGroup);
        }
        setSize(size) {
            this.set(MapProperty_js_1.default.SIZE, size);
        }
        setTarget(target) {
            this.set(MapProperty_js_1.default.TARGET, target);
        }
        setView(view) {
            this.set(MapProperty_js_1.default.VIEW, view);
        }
        updateSize() {
            const targetElement = this.getTargetElement();
            if (!targetElement) {
                this.setSize(undefined);
            }
            else {
                const computedStyle = getComputedStyle(targetElement);
                this.setSize([
                    targetElement.offsetWidth -
                        parseFloat(computedStyle['borderLeftWidth']) -
                        parseFloat(computedStyle['paddingLeft']) -
                        parseFloat(computedStyle['paddingRight']) -
                        parseFloat(computedStyle['borderRightWidth']),
                    targetElement.offsetHeight -
                        parseFloat(computedStyle['borderTopWidth']) -
                        parseFloat(computedStyle['paddingTop']) -
                        parseFloat(computedStyle['paddingBottom']) -
                        parseFloat(computedStyle['borderBottomWidth']),
                ]);
            }
            this.updateViewportSize_();
        }
        updateViewportSize_() {
            const view = this.getView();
            if (view) {
                let size = undefined;
                const computedStyle = getComputedStyle(this.viewport_);
                if (computedStyle.width && computedStyle.height) {
                    size = [
                        parseInt(computedStyle.width, 10),
                        parseInt(computedStyle.height, 10),
                    ];
                }
                view.setViewportSize(size);
            }
        }
    }
    function createOptionsInternal(options) {
        let keyboardEventTarget = null;
        if (options.keyboardEventTarget !== undefined) {
            keyboardEventTarget =
                typeof options.keyboardEventTarget === 'string'
                    ? document.getElementById(options.keyboardEventTarget)
                    : options.keyboardEventTarget;
        }
        const values = {};
        const layerGroup = options.layers &&
            typeof ((options.layers).getLayers) === 'function'
            ? (options.layers)
            : new Group_js_1.default({ layers: (options.layers) });
        values[MapProperty_js_1.default.LAYERGROUP] = layerGroup;
        values[MapProperty_js_1.default.TARGET] = options.target;
        values[MapProperty_js_1.default.VIEW] =
            options.view !== undefined ? options.view : new View_js_1.default();
        let controls;
        if (options.controls !== undefined) {
            if (Array.isArray(options.controls)) {
                controls = new Collection_js_2.default(options.controls.slice());
            }
            else {
                asserts_js_13.assert(typeof ((options.controls).getArray) === 'function', 47);
                controls = (options.controls);
            }
        }
        let interactions;
        if (options.interactions !== undefined) {
            if (Array.isArray(options.interactions)) {
                interactions = new Collection_js_2.default(options.interactions.slice());
            }
            else {
                asserts_js_13.assert(typeof ((options.interactions).getArray) ===
                    'function', 48);
                interactions = (options.interactions);
            }
        }
        let overlays;
        if (options.overlays !== undefined) {
            if (Array.isArray(options.overlays)) {
                overlays = new Collection_js_2.default(options.overlays.slice());
            }
            else {
                asserts_js_13.assert(typeof ((options.overlays).getArray) === 'function', 49);
                overlays = options.overlays;
            }
        }
        else {
            overlays = new Collection_js_2.default();
        }
        return {
            controls: controls,
            interactions: interactions,
            keyboardEventTarget: keyboardEventTarget,
            overlays: overlays,
            values: values,
        };
    }
    exports.default = PluggableMap;
});
define("node_modules/ol/src/source/Source", ["require", "exports", "node_modules/ol/src/Object", "node_modules/ol/src/source/State", "node_modules/ol/src/util", "node_modules/ol/src/proj"], function (require, exports, Object_js_13, State_js_4, util_js_16, proj_js_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Source extends Object_js_13.default {
        constructor(options) {
            super();
            this.projection_ = proj_js_8.get(options.projection);
            this.attributions_ = adaptAttributions(options.attributions);
            this.attributionsCollapsible_ =
                options.attributionsCollapsible !== undefined
                    ? options.attributionsCollapsible
                    : true;
            this.loading = false;
            this.state_ =
                options.state !== undefined ? options.state : State_js_4.default.READY;
            this.wrapX_ = options.wrapX !== undefined ? options.wrapX : false;
        }
        getAttributions() {
            return this.attributions_;
        }
        getAttributionsCollapsible() {
            return this.attributionsCollapsible_;
        }
        getProjection() {
            return this.projection_;
        }
        getResolutions() {
            return util_js_16.abstract();
        }
        getState() {
            return this.state_;
        }
        getWrapX() {
            return this.wrapX_;
        }
        getContextOptions() {
            return undefined;
        }
        refresh() {
            this.changed();
        }
        setAttributions(attributions) {
            this.attributions_ = adaptAttributions(attributions);
            this.changed();
        }
        setState(state) {
            this.state_ = state;
            this.changed();
        }
    }
    function adaptAttributions(attributionLike) {
        if (!attributionLike) {
            return null;
        }
        if (Array.isArray(attributionLike)) {
            return function (frameState) {
                return attributionLike;
            };
        }
        if (typeof attributionLike === 'function') {
            return attributionLike;
        }
        return function (frameState) {
            return [attributionLike];
        };
    }
    exports.default = Source;
});
define("node_modules/ol/src/source/VectorEventType", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        ADDFEATURE: 'addfeature',
        CHANGEFEATURE: 'changefeature',
        CLEAR: 'clear',
        REMOVEFEATURE: 'removefeature',
    };
});
define("node_modules/ol/src/format/FormatType", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        ARRAY_BUFFER: 'arraybuffer',
        JSON: 'json',
        TEXT: 'text',
        XML: 'xml',
    };
});
define("node_modules/ol/src/format/Feature", ["require", "exports", "node_modules/ol/src/proj/Units", "node_modules/ol/src/util", "node_modules/ol/src/obj", "node_modules/ol/src/proj"], function (require, exports, Units_js_8, util_js_17, obj_js_12, proj_js_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.transformExtentWithOptions = exports.transformGeometryWithOptions = void 0;
    class FeatureFormat {
        constructor() {
            this.dataProjection = null;
            this.defaultFeatureProjection = null;
        }
        getReadOptions(source, opt_options) {
            let options;
            if (opt_options) {
                let dataProjection = opt_options.dataProjection
                    ? proj_js_9.get(opt_options.dataProjection)
                    : this.readProjection(source);
                if (opt_options.extent &&
                    dataProjection &&
                    dataProjection.getUnits() === Units_js_8.default.TILE_PIXELS) {
                    dataProjection = proj_js_9.get(dataProjection);
                    dataProjection.setWorldExtent(opt_options.extent);
                }
                options = {
                    dataProjection: dataProjection,
                    featureProjection: opt_options.featureProjection,
                };
            }
            return this.adaptOptions(options);
        }
        adaptOptions(options) {
            return obj_js_12.assign({
                dataProjection: this.dataProjection,
                featureProjection: this.defaultFeatureProjection,
            }, options);
        }
        getType() {
            return util_js_17.abstract();
        }
        readFeature(source, opt_options) {
            return util_js_17.abstract();
        }
        readFeatures(source, opt_options) {
            return util_js_17.abstract();
        }
        readGeometry(source, opt_options) {
            return util_js_17.abstract();
        }
        readProjection(source) {
            return util_js_17.abstract();
        }
        writeFeature(feature, opt_options) {
            return util_js_17.abstract();
        }
        writeFeatures(features, opt_options) {
            return util_js_17.abstract();
        }
        writeGeometry(geometry, opt_options) {
            return util_js_17.abstract();
        }
    }
    exports.default = FeatureFormat;
    function transformGeometryWithOptions(geometry, write, opt_options) {
        const featureProjection = opt_options
            ? proj_js_9.get(opt_options.featureProjection)
            : null;
        const dataProjection = opt_options
            ? proj_js_9.get(opt_options.dataProjection)
            : null;
        let transformed;
        if (featureProjection &&
            dataProjection &&
            !proj_js_9.equivalent(featureProjection, dataProjection)) {
            transformed = (write ? geometry.clone() : geometry).transform(write ? featureProjection : dataProjection, write ? dataProjection : featureProjection);
        }
        else {
            transformed = geometry;
        }
        if (write &&
            opt_options &&
            (opt_options).decimals !== undefined) {
            const power = Math.pow(10, (opt_options).decimals);
            const transform = function (coordinates) {
                for (let i = 0, ii = coordinates.length; i < ii; ++i) {
                    coordinates[i] = Math.round(coordinates[i] * power) / power;
                }
                return coordinates;
            };
            if (transformed === geometry) {
                transformed = geometry.clone();
            }
            transformed.applyTransform(transform);
        }
        return transformed;
    }
    exports.transformGeometryWithOptions = transformGeometryWithOptions;
    function transformExtentWithOptions(extent, opt_options) {
        const featureProjection = opt_options
            ? proj_js_9.get(opt_options.featureProjection)
            : null;
        const dataProjection = opt_options
            ? proj_js_9.get(opt_options.dataProjection)
            : null;
        if (featureProjection &&
            dataProjection &&
            !proj_js_9.equivalent(featureProjection, dataProjection)) {
            return proj_js_9.transformExtent(extent, dataProjection, featureProjection);
        }
        else {
            return extent;
        }
    }
    exports.transformExtentWithOptions = transformExtentWithOptions;
});
define("node_modules/ol/src/VectorTile", ["require", "exports", "node_modules/ol/src/Tile", "node_modules/ol/src/TileState"], function (require, exports, Tile_js_1, TileState_js_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class VectorTile extends Tile_js_1.default {
        constructor(tileCoord, state, src, format, tileLoadFunction, opt_options) {
            super(tileCoord, state, opt_options);
            this.extent = null;
            this.format_ = format;
            this.features_ = null;
            this.loader_;
            this.projection = null;
            this.resolution;
            this.tileLoadFunction_ = tileLoadFunction;
            this.url_ = src;
        }
        getFormat() {
            return this.format_;
        }
        getFeatures() {
            return this.features_;
        }
        getKey() {
            return this.url_;
        }
        load() {
            if (this.state == TileState_js_4.default.IDLE) {
                this.setState(TileState_js_4.default.LOADING);
                this.tileLoadFunction_(this, this.url_);
                if (this.loader_) {
                    this.loader_(this.extent, this.resolution, this.projection);
                }
            }
        }
        onLoad(features, dataProjection) {
            this.setFeatures(features);
        }
        onError() {
            this.setState(TileState_js_4.default.ERROR);
        }
        setFeatures(features) {
            this.features_ = features;
            this.setState(TileState_js_4.default.LOADED);
        }
        setLoader(loader) {
            this.loader_ = loader;
        }
    }
    exports.default = VectorTile;
});
define("node_modules/ol/src/featureloader", ["require", "exports", "node_modules/ol/src/format/FormatType", "node_modules/ol/src/functions"], function (require, exports, FormatType_js_1, functions_js_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setWithCredentials = exports.xhr = exports.loadFeaturesXhr = void 0;
    let withCredentials = false;
    function loadFeaturesXhr(url, format, success, failure) {
        return (function (extent, resolution, projection) {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', typeof url === 'function' ? url(extent, resolution, projection) : url, true);
            if (format.getType() == FormatType_js_1.default.ARRAY_BUFFER) {
                xhr.responseType = 'arraybuffer';
            }
            xhr.withCredentials = withCredentials;
            xhr.onload = function (event) {
                if (!xhr.status || (xhr.status >= 200 && xhr.status < 300)) {
                    const type = format.getType();
                    let source;
                    if (type == FormatType_js_1.default.JSON || type == FormatType_js_1.default.TEXT) {
                        source = xhr.responseText;
                    }
                    else if (type == FormatType_js_1.default.XML) {
                        source = xhr.responseXML;
                        if (!source) {
                            source = new DOMParser().parseFromString(xhr.responseText, 'application/xml');
                        }
                    }
                    else if (type == FormatType_js_1.default.ARRAY_BUFFER) {
                        source = (xhr.response);
                    }
                    if (source) {
                        success.call(this, format.readFeatures(source, {
                            extent: extent,
                            featureProjection: projection,
                        }), format.readProjection(source));
                    }
                    else {
                        failure.call(this);
                    }
                }
                else {
                    failure.call(this);
                }
            }.bind(this);
            xhr.onerror = function () {
                failure.call(this);
            }.bind(this);
            xhr.send();
        });
    }
    exports.loadFeaturesXhr = loadFeaturesXhr;
    function xhr(url, format) {
        return loadFeaturesXhr(url, format, function (features, dataProjection) {
            const sourceOrTile = (this);
            if (typeof sourceOrTile.addFeatures === 'function') {
                (sourceOrTile).addFeatures(features);
            }
        }, functions_js_7.VOID);
    }
    exports.xhr = xhr;
    function setWithCredentials(xhrWithCredentials) {
        withCredentials = xhrWithCredentials;
    }
    exports.setWithCredentials = setWithCredentials;
});
define("node_modules/ol/src/source/Vector", ["require", "exports", "node_modules/ol/src/Collection", "node_modules/ol/src/CollectionEventType", "node_modules/ol/src/events/Event", "node_modules/ol/src/events/EventType", "node_modules/ol/src/ObjectEventType", "node_modules/ol/src/structs/RBush", "node_modules/ol/src/source/Source", "node_modules/ol/src/source/State", "node_modules/ol/src/source/VectorEventType", "node_modules/ol/src/functions", "node_modules/ol/src/loadingstrategy", "node_modules/ol/src/asserts", "node_modules/ol/src/extent", "node_modules/ol/src/array", "node_modules/ol/src/util", "node_modules/ol/src/obj", "node_modules/ol/src/events", "node_modules/ol/src/featureloader"], function (require, exports, Collection_js_3, CollectionEventType_js_4, Event_js_7, EventType_js_19, ObjectEventType_js_4, RBush_js_1, Source_js_2, State_js_5, VectorEventType_js_1, functions_js_8, loadingstrategy_js_1, asserts_js_14, extent_js_31, array_js_15, util_js_18, obj_js_13, events_js_11, featureloader_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VectorSourceEvent = void 0;
    class VectorSourceEvent extends Event_js_7.default {
        constructor(type, opt_feature) {
            super(type);
            this.feature = opt_feature;
        }
    }
    exports.VectorSourceEvent = VectorSourceEvent;
    class VectorSource extends Source_js_2.default {
        constructor(opt_options) {
            const options = opt_options || {};
            super({
                attributions: options.attributions,
                projection: undefined,
                state: State_js_5.default.READY,
                wrapX: options.wrapX !== undefined ? options.wrapX : true,
            });
            this.loader_ = functions_js_8.VOID;
            this.format_ = options.format;
            this.overlaps_ = options.overlaps === undefined ? true : options.overlaps;
            this.url_ = options.url;
            if (options.loader !== undefined) {
                this.loader_ = options.loader;
            }
            else if (this.url_ !== undefined) {
                asserts_js_14.assert(this.format_, 7);
                this.loader_ = featureloader_js_1.xhr(this.url_, (this.format_));
            }
            this.strategy_ =
                options.strategy !== undefined ? options.strategy : loadingstrategy_js_1.all;
            const useSpatialIndex = options.useSpatialIndex !== undefined ? options.useSpatialIndex : true;
            this.featuresRtree_ = useSpatialIndex ? new RBush_js_1.default() : null;
            this.loadedExtentsRtree_ = new RBush_js_1.default();
            this.nullGeometryFeatures_ = {};
            this.idIndex_ = {};
            this.uidIndex_ = {};
            this.featureChangeKeys_ = {};
            this.featuresCollection_ = null;
            let collection, features;
            if (Array.isArray(options.features)) {
                features = options.features;
            }
            else if (options.features) {
                collection = options.features;
                features = collection.getArray();
            }
            if (!useSpatialIndex && collection === undefined) {
                collection = new Collection_js_3.default(features);
            }
            if (features !== undefined) {
                this.addFeaturesInternal(features);
            }
            if (collection !== undefined) {
                this.bindFeaturesCollection_(collection);
            }
        }
        addFeature(feature) {
            this.addFeatureInternal(feature);
            this.changed();
        }
        addFeatureInternal(feature) {
            const featureKey = util_js_18.getUid(feature);
            if (!this.addToIndex_(featureKey, feature)) {
                if (this.featuresCollection_) {
                    this.featuresCollection_.remove(feature);
                }
                return;
            }
            this.setupChangeEvents_(featureKey, feature);
            const geometry = feature.getGeometry();
            if (geometry) {
                const extent = geometry.getExtent();
                if (this.featuresRtree_) {
                    this.featuresRtree_.insert(extent, feature);
                }
            }
            else {
                this.nullGeometryFeatures_[featureKey] = feature;
            }
            this.dispatchEvent(new VectorSourceEvent(VectorEventType_js_1.default.ADDFEATURE, feature));
        }
        setupChangeEvents_(featureKey, feature) {
            this.featureChangeKeys_[featureKey] = [
                events_js_11.listen(feature, EventType_js_19.default.CHANGE, this.handleFeatureChange_, this),
                events_js_11.listen(feature, ObjectEventType_js_4.default.PROPERTYCHANGE, this.handleFeatureChange_, this),
            ];
        }
        addToIndex_(featureKey, feature) {
            let valid = true;
            const id = feature.getId();
            if (id !== undefined) {
                if (!(id.toString() in this.idIndex_)) {
                    this.idIndex_[id.toString()] = feature;
                }
                else {
                    valid = false;
                }
            }
            if (valid) {
                asserts_js_14.assert(!(featureKey in this.uidIndex_), 30);
                this.uidIndex_[featureKey] = feature;
            }
            return valid;
        }
        addFeatures(features) {
            this.addFeaturesInternal(features);
            this.changed();
        }
        addFeaturesInternal(features) {
            const extents = [];
            const newFeatures = [];
            const geometryFeatures = [];
            for (let i = 0, length = features.length; i < length; i++) {
                const feature = features[i];
                const featureKey = util_js_18.getUid(feature);
                if (this.addToIndex_(featureKey, feature)) {
                    newFeatures.push(feature);
                }
            }
            for (let i = 0, length = newFeatures.length; i < length; i++) {
                const feature = newFeatures[i];
                const featureKey = util_js_18.getUid(feature);
                this.setupChangeEvents_(featureKey, feature);
                const geometry = feature.getGeometry();
                if (geometry) {
                    const extent = geometry.getExtent();
                    extents.push(extent);
                    geometryFeatures.push(feature);
                }
                else {
                    this.nullGeometryFeatures_[featureKey] = feature;
                }
            }
            if (this.featuresRtree_) {
                this.featuresRtree_.load(extents, geometryFeatures);
            }
            for (let i = 0, length = newFeatures.length; i < length; i++) {
                this.dispatchEvent(new VectorSourceEvent(VectorEventType_js_1.default.ADDFEATURE, newFeatures[i]));
            }
        }
        bindFeaturesCollection_(collection) {
            let modifyingCollection = false;
            this.addEventListener(VectorEventType_js_1.default.ADDFEATURE, function (evt) {
                if (!modifyingCollection) {
                    modifyingCollection = true;
                    collection.push(evt.feature);
                    modifyingCollection = false;
                }
            });
            this.addEventListener(VectorEventType_js_1.default.REMOVEFEATURE, function (evt) {
                if (!modifyingCollection) {
                    modifyingCollection = true;
                    collection.remove(evt.feature);
                    modifyingCollection = false;
                }
            });
            collection.addEventListener(CollectionEventType_js_4.default.ADD, function (evt) {
                if (!modifyingCollection) {
                    modifyingCollection = true;
                    this.addFeature((evt.element));
                    modifyingCollection = false;
                }
            }.bind(this));
            collection.addEventListener(CollectionEventType_js_4.default.REMOVE, function (evt) {
                if (!modifyingCollection) {
                    modifyingCollection = true;
                    this.removeFeature((evt.element));
                    modifyingCollection = false;
                }
            }.bind(this));
            this.featuresCollection_ = collection;
        }
        clear(opt_fast) {
            if (opt_fast) {
                for (const featureId in this.featureChangeKeys_) {
                    const keys = this.featureChangeKeys_[featureId];
                    keys.forEach(events_js_11.unlistenByKey);
                }
                if (!this.featuresCollection_) {
                    this.featureChangeKeys_ = {};
                    this.idIndex_ = {};
                    this.uidIndex_ = {};
                }
            }
            else {
                if (this.featuresRtree_) {
                    this.featuresRtree_.forEach(this.removeFeatureInternal.bind(this));
                    for (const id in this.nullGeometryFeatures_) {
                        this.removeFeatureInternal(this.nullGeometryFeatures_[id]);
                    }
                }
            }
            if (this.featuresCollection_) {
                this.featuresCollection_.clear();
            }
            if (this.featuresRtree_) {
                this.featuresRtree_.clear();
            }
            this.nullGeometryFeatures_ = {};
            const clearEvent = new VectorSourceEvent(VectorEventType_js_1.default.CLEAR);
            this.dispatchEvent(clearEvent);
            this.changed();
        }
        forEachFeature(callback) {
            if (this.featuresRtree_) {
                return this.featuresRtree_.forEach(callback);
            }
            else if (this.featuresCollection_) {
                this.featuresCollection_.forEach(callback);
            }
        }
        forEachFeatureAtCoordinateDirect(coordinate, callback) {
            const extent = [coordinate[0], coordinate[1], coordinate[0], coordinate[1]];
            return this.forEachFeatureInExtent(extent, function (feature) {
                const geometry = feature.getGeometry();
                if (geometry.intersectsCoordinate(coordinate)) {
                    return callback(feature);
                }
                else {
                    return undefined;
                }
            });
        }
        forEachFeatureInExtent(extent, callback) {
            if (this.featuresRtree_) {
                return this.featuresRtree_.forEachInExtent(extent, callback);
            }
            else if (this.featuresCollection_) {
                this.featuresCollection_.forEach(callback);
            }
        }
        forEachFeatureIntersectingExtent(extent, callback) {
            return this.forEachFeatureInExtent(extent, function (feature) {
                const geometry = feature.getGeometry();
                if (geometry.intersectsExtent(extent)) {
                    const result = callback(feature);
                    if (result) {
                        return result;
                    }
                }
            });
        }
        getFeaturesCollection() {
            return this.featuresCollection_;
        }
        getFeatures() {
            let features;
            if (this.featuresCollection_) {
                features = this.featuresCollection_.getArray();
            }
            else if (this.featuresRtree_) {
                features = this.featuresRtree_.getAll();
                if (!obj_js_13.isEmpty(this.nullGeometryFeatures_)) {
                    array_js_15.extend(features, obj_js_13.getValues(this.nullGeometryFeatures_));
                }
            }
            return (features);
        }
        getFeaturesAtCoordinate(coordinate) {
            const features = [];
            this.forEachFeatureAtCoordinateDirect(coordinate, function (feature) {
                features.push(feature);
            });
            return features;
        }
        getFeaturesInExtent(extent) {
            if (this.featuresRtree_) {
                return this.featuresRtree_.getInExtent(extent);
            }
            else if (this.featuresCollection_) {
                return this.featuresCollection_.getArray();
            }
            else {
                return [];
            }
        }
        getClosestFeatureToCoordinate(coordinate, opt_filter) {
            const x = coordinate[0];
            const y = coordinate[1];
            let closestFeature = null;
            const closestPoint = [NaN, NaN];
            let minSquaredDistance = Infinity;
            const extent = [-Infinity, -Infinity, Infinity, Infinity];
            const filter = opt_filter ? opt_filter : functions_js_8.TRUE;
            this.featuresRtree_.forEachInExtent(extent, function (feature) {
                if (filter(feature)) {
                    const geometry = feature.getGeometry();
                    const previousMinSquaredDistance = minSquaredDistance;
                    minSquaredDistance = geometry.closestPointXY(x, y, closestPoint, minSquaredDistance);
                    if (minSquaredDistance < previousMinSquaredDistance) {
                        closestFeature = feature;
                        const minDistance = Math.sqrt(minSquaredDistance);
                        extent[0] = x - minDistance;
                        extent[1] = y - minDistance;
                        extent[2] = x + minDistance;
                        extent[3] = y + minDistance;
                    }
                }
            });
            return closestFeature;
        }
        getExtent(opt_extent) {
            return this.featuresRtree_.getExtent(opt_extent);
        }
        getFeatureById(id) {
            const feature = this.idIndex_[id.toString()];
            return feature !== undefined ? feature : null;
        }
        getFeatureByUid(uid) {
            const feature = this.uidIndex_[uid];
            return feature !== undefined ? feature : null;
        }
        getFormat() {
            return this.format_;
        }
        getOverlaps() {
            return this.overlaps_;
        }
        getUrl() {
            return this.url_;
        }
        handleFeatureChange_(event) {
            const feature = (event.target);
            const featureKey = util_js_18.getUid(feature);
            const geometry = feature.getGeometry();
            if (!geometry) {
                if (!(featureKey in this.nullGeometryFeatures_)) {
                    if (this.featuresRtree_) {
                        this.featuresRtree_.remove(feature);
                    }
                    this.nullGeometryFeatures_[featureKey] = feature;
                }
            }
            else {
                const extent = geometry.getExtent();
                if (featureKey in this.nullGeometryFeatures_) {
                    delete this.nullGeometryFeatures_[featureKey];
                    if (this.featuresRtree_) {
                        this.featuresRtree_.insert(extent, feature);
                    }
                }
                else {
                    if (this.featuresRtree_) {
                        this.featuresRtree_.update(extent, feature);
                    }
                }
            }
            const id = feature.getId();
            if (id !== undefined) {
                const sid = id.toString();
                if (this.idIndex_[sid] !== feature) {
                    this.removeFromIdIndex_(feature);
                    this.idIndex_[sid] = feature;
                }
            }
            else {
                this.removeFromIdIndex_(feature);
                this.uidIndex_[featureKey] = feature;
            }
            this.changed();
            this.dispatchEvent(new VectorSourceEvent(VectorEventType_js_1.default.CHANGEFEATURE, feature));
        }
        hasFeature(feature) {
            const id = feature.getId();
            if (id !== undefined) {
                return id in this.idIndex_;
            }
            else {
                return util_js_18.getUid(feature) in this.uidIndex_;
            }
        }
        isEmpty() {
            return this.featuresRtree_.isEmpty() && obj_js_13.isEmpty(this.nullGeometryFeatures_);
        }
        loadFeatures(extent, resolution, projection) {
            const loadedExtentsRtree = this.loadedExtentsRtree_;
            const extentsToLoad = this.strategy_(extent, resolution);
            this.loading = false;
            for (let i = 0, ii = extentsToLoad.length; i < ii; ++i) {
                const extentToLoad = extentsToLoad[i];
                const alreadyLoaded = loadedExtentsRtree.forEachInExtent(extentToLoad, function (object) {
                    return extent_js_31.containsExtent(object.extent, extentToLoad);
                });
                if (!alreadyLoaded) {
                    this.loader_.call(this, extentToLoad, resolution, projection);
                    loadedExtentsRtree.insert(extentToLoad, { extent: extentToLoad.slice() });
                    this.loading = this.loader_ !== functions_js_8.VOID;
                }
            }
        }
        refresh() {
            this.clear(true);
            this.loadedExtentsRtree_.clear();
            super.refresh();
        }
        removeLoadedExtent(extent) {
            const loadedExtentsRtree = this.loadedExtentsRtree_;
            let obj;
            loadedExtentsRtree.forEachInExtent(extent, function (object) {
                if (extent_js_31.equals(object.extent, extent)) {
                    obj = object;
                    return true;
                }
            });
            if (obj) {
                loadedExtentsRtree.remove(obj);
            }
        }
        removeFeature(feature) {
            const featureKey = util_js_18.getUid(feature);
            if (featureKey in this.nullGeometryFeatures_) {
                delete this.nullGeometryFeatures_[featureKey];
            }
            else {
                if (this.featuresRtree_) {
                    this.featuresRtree_.remove(feature);
                }
            }
            this.removeFeatureInternal(feature);
            this.changed();
        }
        removeFeatureInternal(feature) {
            const featureKey = util_js_18.getUid(feature);
            this.featureChangeKeys_[featureKey].forEach(events_js_11.unlistenByKey);
            delete this.featureChangeKeys_[featureKey];
            const id = feature.getId();
            if (id !== undefined) {
                delete this.idIndex_[id.toString()];
            }
            delete this.uidIndex_[featureKey];
            this.dispatchEvent(new VectorSourceEvent(VectorEventType_js_1.default.REMOVEFEATURE, feature));
        }
        removeFromIdIndex_(feature) {
            let removed = false;
            for (const id in this.idIndex_) {
                if (this.idIndex_[id] === feature) {
                    delete this.idIndex_[id];
                    removed = true;
                    break;
                }
            }
            return removed;
        }
        setLoader(loader) {
            this.loader_ = loader;
        }
        setUrl(url) {
            asserts_js_14.assert(this.format_, 7);
            this.setLoader(featureloader_js_1.xhr(url, this.format_));
        }
    }
    exports.default = VectorSource;
});
define("poc/FeatureServiceRequest", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("poc/fun/asQueryString", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.asQueryString = void 0;
    function asQueryString(o) {
        return Object.keys(o)
            .map((v) => `${v}=${o[v]}`)
            .join("&");
    }
    exports.asQueryString = asQueryString;
});
define("poc/FeatureServiceProxy", ["require", "exports", "poc/fun/asQueryString"], function (require, exports, asQueryString_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FeatureServiceProxy = void 0;
    class FeatureServiceProxy {
        constructor(options) {
            this.options = options;
        }
        fetch(request) {
            return __awaiter(this, void 0, void 0, function* () {
                const baseUrl = `${this.options.service}?${asQueryString_1.asQueryString(request)}`;
                const response = yield fetch(baseUrl);
                if (!response.ok)
                    throw response.statusText;
                const data = yield response.json();
                return data;
            });
        }
    }
    exports.FeatureServiceProxy = FeatureServiceProxy;
});
define("poc/fun/removeAuthority", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.removeAuthority = void 0;
    function removeAuthority(projCode) {
        var _a;
        return parseInt(((_a = projCode.split(":", 2)) === null || _a === void 0 ? void 0 : _a.pop()) || "0");
    }
    exports.removeAuthority = removeAuthority;
});
define("poc/fun/createWeightedFeature", ["require", "exports", "node_modules/ol/src/extent", "node_modules/ol/src/geom/Point", "node_modules/ol/src/Feature"], function (require, exports, extent_2, Point_1, Feature_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createWeightedFeature = void 0;
    function createWeightedFeature(featureCountPerQuadrant, extent) {
        const weight = featureCountPerQuadrant.reduce((a, b) => a + b, 0);
        if (!weight)
            return;
        const dx = featureCountPerQuadrant[0] +
            featureCountPerQuadrant[3] -
            featureCountPerQuadrant[1] -
            featureCountPerQuadrant[2];
        const dy = featureCountPerQuadrant[0] +
            featureCountPerQuadrant[1] -
            featureCountPerQuadrant[2] -
            featureCountPerQuadrant[3];
        const [cx, cy] = extent_2.getCenter(extent);
        const width = extent_2.getWidth(extent) / 2;
        const height = extent_2.getHeight(extent) / 2;
        const center = new Point_1.default([
            cx + width * (dx / weight),
            cy + height * (dy / weight),
        ]);
        const x = cx + (dx / weight) * (width / 2);
        const y = cy + (dy / weight) * (height / 2);
        const feature = new Feature_1.default(new Point_1.default([x, y]));
        feature.setProperties({ count: weight });
        return feature;
    }
    exports.createWeightedFeature = createWeightedFeature;
});
define("poc/test/index", ["require", "exports", "mocha", "chai", "node_modules/ol/src/extent", "node_modules/ol/src/proj", "poc/index", "node_modules/ol/src/tilegrid", "node_modules/ol/src/loadingstrategy", "node_modules/ol/src/source/Vector", "node_modules/ol/src/geom/Point", "node_modules/ol/src/Feature", "node_modules/ol/src/source/VectorEventType", "poc/FeatureServiceProxy", "poc/fun/removeAuthority", "poc/fun/createWeightedFeature"], function (require, exports, mocha_1, chai_1, extent_3, proj_1, index_1, tilegrid_1, loadingstrategy_1, Vector_1, Point_2, Feature_2, VectorEventType_1, FeatureServiceProxy_1, removeAuthority_1, createWeightedFeature_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function removeFeaturesFromSource(extent, resolution, source) {
        const featuresToRemove = source
            .getFeaturesInExtent(extent)
            .filter((f) => f.getProperties().resolution > resolution);
        featuresToRemove.forEach((f) => source.removeFeature(f));
    }
    function bbox(extent) {
        const [xmin, ymin, xmax, ymax] = extent;
        return JSON.stringify({ xmin, ymin, xmax, ymax });
    }
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
            chai_1.assert.throws(() => tree.find([1, 1, 2, 2]), "xmax too large: 2 > 1");
            chai_1.assert.throws(() => tree.find([0.1, 0.1, 0.9, 1.00001]), "ymax too large");
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
            const q33 = tree.find([0.375, 0.375, 0.5, 0.5]);
            q0.count = 1;
            q1.count = 2;
            q2.count = 4;
            q3.count = 8;
            q33.count = 16;
            const totalCount = visit(root, (a, b) => a + ((b === null || b === void 0 ? void 0 : b.count) || 0), 0);
            chai_1.assert.equal(totalCount, 31);
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
        mocha_1.it("can cache tiles from a TileGrid", () => {
            const extent = proj_1.get("EPSG:3857").getExtent();
            const tree = new index_1.TileTree({
                extent,
            });
            const tileGrid = tilegrid_1.createXYZ({ extent });
            const addTiles = (level) => tileGrid.forEachTileCoord(extent, level, (tileCoord) => {
                const [z, x, y] = tileCoord;
                const extent = tileGrid.getTileCoordExtent(tileCoord);
                tree.find(extent).tileCoord = tileCoord;
            });
            const maxX = () => visit(tree.find(extent), (a, b) => Math.max(a, b.tileCoord ? b.tileCoord[1] : a), 0);
            for (let i = 0; i <= 8; i++) {
                addTiles(i);
                chai_1.assert.equal(Math.pow(2, i) - 1, maxX(), `addTiles(${i})`);
            }
        });
        mocha_1.it("integrates with a tiling strategy", () => {
            const extent = proj_1.get("EPSG:3857").getExtent();
            const tree = new index_1.TileTree({ extent });
            const tileGrid = tilegrid_1.createXYZ({ extent });
            const strategy = loadingstrategy_1.tile(tileGrid);
            const resolutions = tileGrid.getResolutions();
            let quad0 = extent;
            resolutions.slice(0, 28).forEach((resolution, i) => {
                const extents = strategy(quad0, resolution);
                quad0 = extents[0];
                tree.find(quad0);
            });
            chai_1.assert.equal(0.0005831682455839253, resolutions[28]);
            resolutions.slice(28).forEach((resolution, i) => {
                const extents = strategy(quad0, resolution);
                quad0 = extents[0];
                chai_1.assert.throws(() => tree.find(quad0), "wrong power");
            });
        });
        mocha_1.it("integrates with a feature source", () => {
            const url = "http://localhost:3002/mock/sampleserver3/arcgis/rest/services/Petroleum/KSFields/FeatureServer/0/query";
            const projection = proj_1.get("EPSG:3857");
            const tileGrid = tilegrid_1.createXYZ({ tileSize: 512 });
            const strategy = loadingstrategy_1.tile(tileGrid);
            const tree = new index_1.TileTree({
                extent: tileGrid.getExtent(),
            });
            const loader = (extent, resolution, projection) => __awaiter(void 0, void 0, void 0, function* () {
                const tileNode = tree.find(extent);
                if (tileNode.count)
                    return;
                const proxy = new FeatureServiceProxy_1.FeatureServiceProxy({
                    service: url,
                });
                const request = {
                    f: "json",
                    geometry: "",
                    geometryType: "esriGeometryEnvelope",
                    inSR: removeAuthority_1.removeAuthority(projection.getCode()),
                    outFields: "*",
                    outSR: removeAuthority_1.removeAuthority(projection.getCode()),
                    returnGeometry: true,
                    returnCountOnly: false,
                    spatialRel: "esriSpatialRelIntersects",
                };
                request.geometry = bbox(extent);
                request.returnCountOnly = true;
                const response = yield proxy.fetch(request);
                const count = response.count;
                tileNode.count = count;
                const geom = new Point_2.default(extent_3.getCenter(extent));
                const feature = new Feature_2.default(geom);
                feature.setProperties({ count, resolution });
                source.addFeature(feature);
                removeFeaturesFromSource(extent, resolution, source);
            });
            const source = new Vector_1.default({ strategy, loader });
            source.loadFeatures(tileGrid.getExtent(), tileGrid.getResolution(0), projection);
            source.on(VectorEventType_1.default.ADDFEATURE, (args) => {
                const { count, resolution } = args.feature.getProperties();
                console.log(count, resolution);
                createWeightedFeature_1.createWeightedFeature;
            });
        });
    });
});
define("index", ["require", "exports", "poc/test/index"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
//# sourceMappingURL=index.js.map