/*
 * TweetDeck software is protected by copyright worldwide, and may be used only
 * in accordance with the Terms of Service found at http://www.tweetdeck.com
 */
var TD = {
    storage: {
        cache: {},
        model: {}
    },
    core: {},
    net: {},
    services: {},
    controller: {
        auth: {}
    },
    util: {},
    vo: {},
    sync: {}
};
(function () {
    var a = function (d, c) {
            for (var e = c.exec(d), g = [], j; e != null;) {
                j = e.index;
                if (j != 0) {
                    d.substring(0, j);
                    g.push(d.substring(0, j));
                    d = d.slice(j)
                }
                g.push(e[0]);
                d = d.slice(e[0].length);
                e = c.exec(d)
            }!d == "" && g.push(d);
            return g
        },
        b = function (d, c) {
            for (var e in c) if (c.hasOwnProperty(e)) d[e] = c[e]
        };
    EJS = function (d) {
        d = typeof d == "string" ? {
            view: d
        } : d;
        this.set_options(d);
        if (d.precompiled) {
            this.template = {};
            this.template.process = d.precompiled;
            EJS.update(this.name, this)
        } else {
            if (d.element) {
                if (typeof d.element == "string") {
                    var c = d.element;
                    d.element = document.getElementById(d.element);
                    if (d.element == null) throw c + "does not exist!";
                }
                this.text = d.element.value ? d.element.value : d.element.innerHTML;
                this.name = d.element.id
            } else if (d.url) {
                d.url = EJS.endExt(d.url, this.extMatch);
                this.name = this.name ? this.name : d.url;
                c = d.url;
                var e = EJS.get(this.name, this.cache);
                if (e) return e;
                if (e == EJS.INVALID_PATH) return null;
                try {
                    this.text = EJS.request(c + (this.cache ? "" : "?" + Math.random()))
                } catch (g) {}
                if (this.text == null) throw {
                    type: "EJS",
                    message: "There is no template at " + c
                };
            }
            e = new EJS.Compiler(this.text, this.type);
            e.compile(d, this.name);
            EJS.update(this.name, this);
            this.template = e
        }
    };
    EJS.prototype = {
        render: function (d, c) {
            d = d || {};
            this._extra_helpers = c;
            var e = new EJS.Helpers(d, c || {});
            return this.template.process.call(d, d, e)
        },
        update: function (d, c) {
            if (typeof d == "string") d = document.getElementById(d);
            if (c == null) {
                _template = this;
                return function (e) {
                    EJS.prototype.update.call(_template, d, e)
                }
            }
            if (typeof c == "string") {
                params = {};
                params.url = c;
                _template = this;
                params.onComplete = function (e) {
                    e = eval(e.responseText);
                    EJS.prototype.update.call(_template, d, e)
                };
                EJS.ajax_request(params)
            } else d.innerHTML = this.render(c)
        },
        out: function () {
            return this.template.out
        },
        set_options: function (d) {
            this.type = d.type || EJS.type;
            this.cache = d.cache != null ? d.cache : EJS.cache;
            this.text = d.text || null;
            this.name = d.name || null;
            this.ext = d.ext || EJS.ext;
            this.extMatch = RegExp(this.ext.replace(/\./, "."))
        }
    };
    EJS.endExt = function (d, c) {
        if (!d) return null;
        c.lastIndex = 0;
        return d + (c.test(d) ? "" : this.ext)
    };
    EJS.Scanner = function (d, c, e) {
        b(this, {
            left_delimiter: c + "%",
            right_delimiter: "%" + e,
            double_left: c + "%%",
            double_right: "%%" + e,
            left_equal: c + "%=",
            left_comment: c + "%#"
        });
        this.SplitRegexp = c == "[" ? /(\[%%)|(%%\])|(\[%=)|(\[%#)|(\[%)|(%\]\n)|(%\])|(\n)/ : RegExp("(" + this.double_left + ")|(%%" + this.double_right + ")|(" + this.left_equal + ")|(" + this.left_comment + ")|(" + this.left_delimiter + ")|(" + this.right_delimiter + "\n)|(" + this.right_delimiter + ")|(\n)");
        this.source = d;
        this.stag = null;
        this.lines = 0
    };
    EJS.Scanner.to_text = function (d) {
        if (d == null || d === undefined) return "";
        if (d instanceof Date) return d.toDateString();
        if (d.toString) return d.toString();
        return ""
    };
    EJS.Scanner.prototype = {
        scan: function (d) {
            scanline = this.scanline;
            regex = this.SplitRegexp;
            if (!this.source == "") for (var c = a(this.source, /\n/), e = 0; e < c.length; e++) this.scanline(c[e], regex, d)
        },
        scanline: function (d, c, e) {
            this.lines++;
            d = a(d, c);
            for (c = 0; c < d.length; c++) {
                var g = d[c];
                if (g != null) try {
                    e(g, this)
                } catch (j) {
                    throw {
                        type: "EJS.Scanner",
                        line: this.lines
                    };
                }
            }
        },
        replaceTranslations: function () {
            this.source = TD.util.i18n.localiseText(this.source)
        }
    };
    EJS.Buffer = function (d, c) {
        this.line = [];
        this.script = "";
        this.pre_cmd = d;
        this.post_cmd = c;
        for (var e = 0; e < this.pre_cmd.length; e++) this.push(d[e])
    };
    EJS.Buffer.prototype = {
        push: function (d) {
            this.line.push(d)
        },
        cr: function () {
            this.script += this.line.join("; ");
            this.line = [];
            this.script += "\n"
        },
        close: function () {
            if (this.line.length > 0) {
                for (var d = 0; d < this.post_cmd.length; d++) this.push(pre_cmd[d]);
                this.script += this.line.join("; ");
                line = null
            }
        }
    };
    EJS.Compiler = function (d, c) {
        this.pre_cmd = ["var ___ViewO = [];"];
        this.post_cmd = [];
        this.source = " ";
        if (d != null) {
            if (typeof d == "string") {
                d = d.replace(/\r\n/g, "\n");
                this.source = d = d.replace(/\r/g, "\n")
            } else if (d.innerHTML) this.source = d.innerHTML;
            if (typeof this.source != "string") this.source = ""
        }
        c = c || "<";
        var e = ">";
        switch (c) {
        case "[":
            e = "]";
            break;
        case "<":
            break;
        default:
            throw c + " is not a supported deliminator";
        }
        this.scanner = new EJS.Scanner(this.source, c, e);
        this.out = ""
    };
    EJS.Compiler.prototype = {
        compile: function (d, c) {
            d = d || {};
            this.out = "";
            var e = new EJS.Buffer(this.pre_cmd, this.post_cmd),
                g = "",
                j = function (r) {
                    r = r.replace(/\\/g, "\\\\");
                    r = r.replace(/\n/g, "");
                    return r = r.replace(/"/g, '\\"')
                };
            this.scanner.replaceTranslations();
            this.scanner.scan(function (r, s) {
                if (s.stag == null) switch (r) {
                case "\n":
                    g += "\n";
                    e.push('___ViewO.push("' + j(g) + '");');
                    e.cr();
                    g = "";
                    break;
                case s.left_delimiter:
                case s.left_equal:
                case s.left_comment:
                    s.stag = r;
                    g.length > 0 && e.push('___ViewO.push("' + j(g) + '")');
                    g = "";
                    break;
                case s.double_left:
                    g += s.left_delimiter;
                    break;
                default:
                    g += r
                } else switch (r) {
                case s.right_delimiter:
                    switch (s.stag) {
                    case s.left_delimiter:
                        if (g[g.length - 1] == "\n") {
                            g = g.substr(0, g.length - 1);
                            e.push(g);
                            e.cr()
                        } else e.push(g);
                        break;
                    case s.left_equal:
                        e.push("___ViewO.push((EJS.Scanner.to_text(" + g + ")))")
                    }
                    s.stag = null;
                    g = "";
                    break;
                case s.double_right:
                    g += s.right_delimiter;
                    break;
                default:
                    g += r
                }
            });
            g.length > 0 && e.push('___ViewO.push("' + j(g) + '")');
            e.close();
            this.out = e.script + ";";
            var n = "/*" + c + "*/this.process = function(_CONTEXT,_VIEW) { try { with(_VIEW) { with (_CONTEXT) {" + this.out + " return ___ViewO.join('');}}}catch(e){e.lineNumber=null;throw e;}};";
            try {
                eval(n)
            } catch (p) {
                if (typeof JSLINT != "undefined") {
                    JSLINT(this.out);
                    for (n = 0; n < JSLINT.errors.length; n++) {
                        var o = JSLINT.errors[n];
                        if (o.reason != "Unnecessary semicolon.") {
                            o.line++;
                            p = Error();
                            p.lineNumber = o.line;
                            p.message = o.reason;
                            if (d.view) p.fileName = d.view;
                            throw p;
                        }
                    }
                } else throw p;
            }
        }
    };
    EJS.config = function (d) {
        EJS.cache = d.cache != null ? d.cache : EJS.cache;
        EJS.type = d.type != null ? d.type : EJS.type;
        EJS.ext = d.ext != null ? d.ext : EJS.ext;
        var c = EJS.templates_directory || {};
        EJS.templates_directory = c;
        EJS.get = function (e, g) {
            if (g == false) return null;
            if (c[e]) return c[e];
            return null
        };
        EJS.update = function (e, g) {
            if (e != null) c[e] = g
        };
        EJS.INVALID_PATH = -1
    };
    EJS.config({
        cache: true,
        type: "<",
        ext: ".ejs"
    });
    EJS.Helpers = function (d, c) {
        this._data = d;
        this._extras = c;
        b(this, c)
    };
    EJS.Helpers.prototype = {
        view: function (d, c, e) {
            if (!e) e = this._extras;
            if (!c) c = this._data;
            return (new EJS(d)).render(c, e)
        },
        to_text: function (d, c) {
            if (d == null || d === undefined) return c || "";
            if (d instanceof Date) return d.toDateString();
            if (d.toString) return d.toString().replace(/\n/g, "<br />").replace(/''/g, "'");
            return ""
        }
    };
    EJS.newRequest = function () {
        for (var d = [function () {
            return new ActiveXObject("Msxml2.XMLHTTP")
        }, function () {
            return new XMLHttpRequest
        }, function () {
            return new ActiveXObject("Microsoft.XMLHTTP")
        }], c = 0; c < d.length; c++) try {
            var e = d[c]();
            if (e != null) return e
        } catch (g) {}
    };
    EJS.request = function (d) {
        var c = new EJS.newRequest;
        c.open("GET", d, false);
        try {
            c.send(null)
        } catch (e) {
            return null
        }
        if (c.status == 404 || c.status == 2 || c.status == 0 && c.responseText == "") return null;
        return c.responseText
    };
    EJS.ajax_request = function (d) {
        d.method = d.method ? d.method : "GET";
        var c = new EJS.newRequest;
        c.onreadystatechange = function () {
            if (c.readyState == 4) d.onComplete(c)
        };
        c.open(d.method, d.url);
        c.send(null)
    }
})();
EJS.Helpers.prototype.pluralise = function (a, b, d) {
    if (d != 1) return b;
    return a
};
(function (a, b) {
    function d(f) {
        return l.isWindow(f) ? f : f.nodeType === 9 ? f.defaultView || f.parentWindow : false
    }
    function c(f) {
        if (!Fb[f]) {
            var k = l("<" + f + ">").appendTo("body"),
                h = k.css("display");
            k.remove();
            if (h === "none" || h === "") h = "block";
            Fb[f] = h
        }
        return Fb[f]
    }
    function e(f, k) {
        var h = {};
        l.each(Ta.concat.apply([], Ta.slice(0, k)), function () {
            h[this] = f
        });
        return h
    }
    function g() {
        try {
            return new a.XMLHttpRequest
        } catch (f) {}
    }
    function j() {
        l(a).unload(function () {
            for (var f in ab) ab[f](0, 1)
        })
    }
    function n(f, k, h, m) {
        if (l.isArray(k) && k.length) l.each(k, function (t, w) {
            h || vb.test(f) ? m(f, w) : n(f + "[" + (typeof w === "object" || l.isArray(w) ? t : "") + "]", w, h, m)
        });
        else if (h || k == null || typeof k !== "object") m(f, k);
        else if (l.isArray(k) || l.isEmptyObject(k)) m(f, "");
        else for (var q in k) n(f + "[" + q + "]", k[q], h, m)
    }
    function p(f, k, h, m, q, t) {
        q = q || k.dataTypes[0];
        t = t || {};
        t[q] = true;
        q = f[q];
        for (var w = 0, A = q ? q.length : 0, D = f === Ha, E; w < A && (D || !E); w++) {
            E = q[w](k, h, m);
            typeof E === "string" && (!D || t[E] ? E = b : (k.dataTypes.unshift(E), E = p(f, k, h, m, E, t)))
        }(D || !E) && !t["*"] && (E = p(f, k, h, m, "*", t));
        return E
    }
    function o(f) {
        return function (k, h) {
            typeof k !== "string" && (h = k, k = "*");
            if (l.isFunction(h)) for (var m = k.toLowerCase().split(Ia), q = 0, t = m.length, w, A; q < t; q++) {
                w = m[q];
                (A = /^\+/.test(w)) && (w = w.substr(1) || "*");
                w = f[w] = f[w] || [];
                w[A ? "unshift" : "push"](h)
            }
        }
    }
    function r(f, k, h) {
        var m = k === "width" ? f.offsetWidth : f.offsetHeight;
        if (h === "border") return m;
        l.each(k === "width" ? wb : xb, function () {
            h || (m -= parseFloat(l.css(f, "padding" + this)) || 0);
            h === "margin" ? m += parseFloat(l.css(f, "margin" + this)) || 0 : m -= parseFloat(l.css(f, "border" + this + "Width")) || 0
        });
        return m
    }
    function s(f, k) {
        k.src ? l.ajax({
            url: k.src,
            async: false,
            dataType: "script"
        }) : l.globalEval(k.text || k.textContent || k.innerHTML || "");
        k.parentNode && k.parentNode.removeChild(k)
    }
    function u(f) {
        return "getElementsByTagName" in f ? f.getElementsByTagName("*") : "querySelectorAll" in f ? f.querySelectorAll("*") : []
    }
    function x(f, k) {
        if (k.nodeType === 1) {
            var h = k.nodeName.toLowerCase();
            k.clearAttributes();
            k.mergeAttributes(f);
            if (h === "object") k.outerHTML = f.outerHTML;
            else if (h !== "input" || f.type !== "checkbox" && f.type !== "radio") if (h === "option") k.selected = f.defaultSelected;
            else {
                if (h === "input" || h === "textarea") k.defaultValue = f.defaultValue
            } else {
                f.checked && (k.defaultChecked = k.checked = f.checked);
                k.value !== f.value && (k.value = f.value)
            }
            k.removeAttribute(l.expando)
        }
    }
    function y(f, k) {
        if (k.nodeType === 1 && l.hasData(f)) {
            var h = l.expando,
                m = l.data(f),
                q = l.data(k, m);
            if (m = m[h]) {
                var t = m.events;
                q = q[h] = l.extend({}, m);
                if (t) {
                    delete q.handle;
                    q.events = {};
                    for (var w in t) {
                        h = 0;
                        for (m = t[w].length; h < m; h++) l.event.add(k, w + (t[w][h].namespace ? "." : "") + t[w][h].namespace, t[w][h], t[w][h].data)
                    }
                }
            }
        }
    }
    function I(f, k, h) {
        if (l.isFunction(k)) return l.grep(f, function (q, t) {
            return !!k.call(q, t, q) === h
        });
        if (k.nodeType) return l.grep(f, function (q) {
            return q === k === h
        });
        if (typeof k === "string") {
            var m = l.grep(f, function (q) {
                return q.nodeType === 1
            });
            if (Gb.test(k)) return l.filter(k, m, !h);
            k = l.filter(k, m)
        }
        return l.grep(f, function (q) {
            return l.inArray(q, k) >= 0 === h
        })
    }
    function G(f, k) {
        return (f && f !== "*" ? f + "." : "") + k.replace(Rb, "`").replace(Oa, "&")
    }
    function J(f) {
        var k, h, m, q, t, w, A, D, E, P, X, da = [];
        q = [];
        t = l._data(this, "events");
        if (f.liveFired !== this && t && t.live && !f.target.disabled && (!f.button || f.type !== "click")) {
            f.namespace && (X = RegExp("(^|\\.)" + f.namespace.split(".").join("\\.(?:.*\\.)?") + "(\\.|$)"));
            f.liveFired = this;
            var aa = t.live.slice(0);
            for (A = 0; A < aa.length; A++) {
                t = aa[A];
                t.origType.replace(Da, "") === f.type ? q.push(t.selector) : aa.splice(A--, 1)
            }
            q = l(f.target).closest(q, f.currentTarget);
            D = 0;
            for (E = q.length; D < E; D++) {
                P = q[D];
                for (A = 0; A < aa.length; A++) {
                    t = aa[A];
                    if (P.selector === t.selector && (!X || X.test(t.namespace)) && !P.elem.disabled) {
                        w = P.elem;
                        m = null;
                        if (t.preType === "mouseenter" || t.preType === "mouseleave") {
                            f.type = t.preType;
                            m = l(f.relatedTarget).closest(t.selector)[0]
                        }(!m || m !== w) && da.push({
                            elem: w,
                            handleObj: t,
                            level: P.level
                        })
                    }
                }
            }
            D = 0;
            for (E = da.length; D < E; D++) {
                q = da[D];
                if (h && q.level > h) break;
                f.currentTarget = q.elem;
                f.data = q.handleObj.data;
                f.handleObj = q.handleObj;
                X = q.handleObj.origHandler.apply(q.elem, arguments);
                if (X === false || f.isPropagationStopped()) {
                    h = q.level;
                    X === false && (k = false);
                    if (f.isImmediatePropagationStopped()) break
                }
            }
            return k
        }
    }

    function V(f, k, h) {
        var m = l.extend({}, h[0]);
        m.type = f;
        m.originalEvent = {};
        m.liveFired = b;
        l.event.handle.call(k, m);
        m.isDefaultPrevented() && h[0].preventDefault()
    }
    function C() {
        return true
    }
    function Y() {
        return false
    }
    function na(f) {
        for (var k in f) if (k !== "toJSON") return false;
        return true
    }
    function U(f, k, h) {
        if (h === b && f.nodeType === 1) {
            h = f.getAttribute("data-" + k);
            if (typeof h === "string") {
                try {
                    h = h === "true" ? true : h === "false" ? false : h === "null" ? null : l.isNaN(h) ? ka.test(h) ? l.parseJSON(h) : h : parseFloat(h)
                } catch (m) {}
                l.data(f, k, h)
            } else h = b
        }
        return h
    }
    var Q = a.document,
        l = function () {
            function f() {
                if (!k.isReady) {
                    try {
                        Q.documentElement.doScroll("left")
                    } catch (B) {
                        setTimeout(f, 1);
                        return
                    }
                    k.ready()
                }
            }
            var k = function (B, N) {
                    return new k.fn.init(B, N, q)
                },
                h = a.jQuery,
                m = a.$,
                q, t = /^(?:[^<]*(<[\w\W]+>)[^>]*$|#([\w\-]+)$)/,
                w = /\S/,
                A = /^\s+/,
                D = /\s+$/,
                E = /\d/,
                P = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,
                X = /^[\],:{}\s]*$/,
                da = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
                aa = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
                ea = /(?:^|:|,)(?:\s*\[)+/g,
                la = /(webkit)[ \/]([\w.]+)/,
                oa = /(opera)(?:.*version)?[ \/]([\w.]+)/,
                ua = /(msie) ([\w.]+)/,
                sa = /(mozilla)(?:.*? rv:([\w.]+))?/,
                v = navigator.userAgent,
                F = false,
                O, L = "then done fail isResolved isRejected promise".split(" "),
                M, S = Object.prototype.toString,
                ba = Object.prototype.hasOwnProperty,
                Z = Array.prototype.push,
                ha = Array.prototype.slice,
                wa = String.prototype.trim,
                va = Array.prototype.indexOf,
                ya = {};
            k.fn = k.prototype = {
                constructor: k,
                init: function (B, N, T) {
                    var W, fa;
                    if (!B) return this;
                    if (B.nodeType) {
                        this.context = this[0] = B;
                        this.length = 1;
                        return this
                    }
                    if (B === "body" && !N && Q.body) {
                        this.context = Q;
                        this[0] = Q.body;
                        this.selector = "body";
                        this.length = 1;
                        return this
                    }
                    if (typeof B === "string") {
                        W = t.exec(B);
                        if (!W || !W[1] && N) return !N || N.jquery ? (N || T).find(B) : this.constructor(N).find(B);
                        if (W[1]) {
                            fa = (N = N instanceof k ? N[0] : N) ? N.ownerDocument || N : Q;
                            (T = P.exec(B)) ? k.isPlainObject(N) ? (B = [Q.createElement(T[1])], k.fn.attr.call(B, N, true)) : B = [fa.createElement(T[1])] : (T = k.buildFragment([W[1]], [fa]), B = (T.cacheable ? k.clone(T.fragment) : T.fragment).childNodes);
                            return k.merge(this, B)
                        }
                        if ((N = Q.getElementById(W[2])) && N.parentNode) {
                            if (N.id !== W[2]) return T.find(B);
                            this.length = 1;
                            this[0] = N
                        }
                        this.context = Q;
                        this.selector = B;
                        return this
                    }
                    if (k.isFunction(B)) return T.ready(B);
                    B.selector !== b && (this.selector = B.selector, this.context = B.context);
                    return k.makeArray(B, this)
                },
                selector: "",
                jquery: "1.5.1",
                length: 0,
                size: function () {
                    return this.length
                },
                toArray: function () {
                    return ha.call(this, 0)
                },
                get: function (B) {
                    return B == null ? this.toArray() : B < 0 ? this[this.length + B] : this[B]
                },
                pushStack: function (B, N, T) {
                    var W = this.constructor();
                    k.isArray(B) ? Z.apply(W, B) : k.merge(W, B);
                    W.prevObject = this;
                    W.context = this.context;
                    N === "find" ? W.selector = this.selector + (this.selector ? " " : "") + T : N && (W.selector = this.selector + "." + N + "(" + T + ")");
                    return W
                },
                each: function (B, N) {
                    return k.each(this, B, N)
                },
                ready: function (B) {
                    k.bindReady();
                    O.done(B);
                    return this
                },
                eq: function (B) {
                    return B === -1 ? this.slice(B) : this.slice(B, +B + 1)
                },
                first: function () {
                    return this.eq(0)
                },
                last: function () {
                    return this.eq(-1)
                },
                slice: function () {
                    return this.pushStack(ha.apply(this, arguments), "slice", ha.call(arguments).join(","))
                },
                map: function (B) {
                    return this.pushStack(k.map(this, function (N, T) {
                        return B.call(N, T, N)
                    }))
                },
                end: function () {
                    return this.prevObject || this.constructor(null)
                },
                push: Z,
                sort: [].sort,
                splice: [].splice
            };
            k.fn.init.prototype = k.fn;
            k.extend = k.fn.extend = function () {
                var B, N, T, W, fa, ia, ma = arguments[0] || {},
                    ra = 1,
                    Ba = arguments.length,
                    Ua = false;
                typeof ma === "boolean" && (Ua = ma, ma = arguments[1] || {}, ra = 2);
                typeof ma !== "object" && !k.isFunction(ma) && (ma = {});
                for (Ba === ra && (ma = this, --ra); ra < Ba; ra++) if ((B = arguments[ra]) != null) for (N in B) {
                    T = ma[N];
                    W = B[N];
                    if (ma !== W) Ua && W && (k.isPlainObject(W) || (fa = k.isArray(W))) ? (fa ? (fa = false, ia = T && k.isArray(T) ? T : []) : ia = T && k.isPlainObject(T) ? T : {}, ma[N] = k.extend(Ua, ia, W)) : W !== b && (ma[N] = W)
                }
                return ma
            };
            k.extend({
                noConflict: function (B) {
                    a.$ = m;
                    B && (a.jQuery = h);
                    return k
                },
                isReady: false,
                readyWait: 1,
                ready: function (B) {
                    B === true && k.readyWait--;
                    if (!k.readyWait || B !== true && !k.isReady) {
                        if (!Q.body) return setTimeout(k.ready, 1);
                        k.isReady = true;
                        if (!(B !== true && --k.readyWait > 0)) {
                            O.resolveWith(Q, [k]);
                            k.fn.trigger && k(Q).trigger("ready").unbind("ready")
                        }
                    }
                },
                bindReady: function () {
                    if (!F) {
                        F = true;
                        if (Q.readyState === "complete") return setTimeout(k.ready, 1);
                        if (Q.addEventListener) {
                            Q.addEventListener("DOMContentLoaded", M, false);
                            a.addEventListener("load", k.ready, false)
                        } else if (Q.attachEvent) {
                            Q.attachEvent("onreadystatechange", M);
                            a.attachEvent("onload", k.ready);
                            var B = false;
                            try {
                                B = a.frameElement == null
                            } catch (N) {}
                            Q.documentElement.doScroll && B && f()
                        }
                    }
                },
                isFunction: function (B) {
                    return k.type(B) === "function"
                },
                isArray: Array.isArray ||
                function (B) {
                    return k.type(B) === "array"
                },
                isWindow: function (B) {
                    return B && typeof B === "object" && "setInterval" in B
                },
                isNaN: function (B) {
                    return B == null || !E.test(B) || isNaN(B)
                },
                type: function (B) {
                    return B == null ? String(B) : ya[S.call(B)] || "object"
                },
                isPlainObject: function (B) {
                    if (!B || k.type(B) !== "object" || B.nodeType || k.isWindow(B)) return false;
                    if (B.constructor && !ba.call(B, "constructor") && !ba.call(B.constructor.prototype, "isPrototypeOf")) return false;
                    for (var N in B);
                    return N === b || ba.call(B, N)
                },
                isEmptyObject: function (B) {
                    for (var N in B) return false;
                    return true
                },
                error: function (B) {
                    throw B;
                },
                parseJSON: function (B) {
                    if (typeof B !== "string" || !B) return null;
                    B = k.trim(B);
                    if (X.test(B.replace(da, "@").replace(aa, "]").replace(ea, ""))) return a.JSON && a.JSON.parse ? a.JSON.parse(B) : (new Function("return " + B))();
                    k.error("Invalid JSON: " + B)
                },
                parseXML: function (B, N, T) {
                    a.DOMParser ? (T = new DOMParser, N = T.parseFromString(B, "text/xml")) : (N = new ActiveXObject("Microsoft.XMLDOM"), N.async = "false", N.loadXML(B));
                    T = N.documentElement;
                    (!T || !T.nodeName || T.nodeName === "parsererror") && k.error("Invalid XML: " + B);
                    return N
                },
                noop: function () {},
                globalEval: function (B) {
                    if (B && w.test(B)) {
                        var N = Q.head || Q.getElementsByTagName("head")[0] || Q.documentElement,
                            T = Q.createElement("script");
                        k.support.scriptEval() ? T.appendChild(Q.createTextNode(B)) : T.text = B;
                        N.insertBefore(T, N.firstChild);
                        N.removeChild(T)
                    }
                },
                nodeName: function (B, N) {
                    return B.nodeName && B.nodeName.toUpperCase() === N.toUpperCase()
                },
                each: function (B, N, T) {
                    var W, fa = 0,
                        ia = B.length,
                        ma = ia === b || k.isFunction(B);
                    if (T) if (ma) for (W in B) {
                        if (N.apply(B[W], T) === false) break
                    } else for (; fa < ia;) {
                        if (N.apply(B[fa++], T) === false) break
                    } else if (ma) for (W in B) {
                        if (N.call(B[W], W, B[W]) === false) break
                    } else for (T = B[0]; fa < ia && N.call(T, fa, T) !== false; T = B[++fa]);
                    return B
                },
                trim: wa ?
                function (B) {
                    return B == null ? "" : wa.call(B)
                } : function (B) {
                    return B == null ? "" : (B + "").replace(A, "").replace(D, "")
                },
                makeArray: function (B, N) {
                    var T = N || [];
                    if (B != null) {
                        var W = k.type(B);
                        B.length == null || W === "string" || W === "function" || W === "regexp" || k.isWindow(B) ? Z.call(T, B) : k.merge(T, B)
                    }
                    return T
                },
                inArray: function (B, N) {
                    if (N.indexOf) return N.indexOf(B);
                    for (var T = 0, W = N.length; T < W; T++) if (N[T] === B) return T;
                    return -1
                },
                merge: function (B, N) {
                    var T = B.length,
                        W = 0;
                    if (typeof N.length === "number") for (var fa = N.length; W < fa; W++) B[T++] = N[W];
                    else for (; N[W] !== b;) B[T++] = N[W++];
                    B.length = T;
                    return B
                },
                grep: function (B, N, T) {
                    var W = [],
                        fa;
                    T = !! T;
                    for (var ia = 0, ma = B.length; ia < ma; ia++) {
                        fa = !! N(B[ia], ia);
                        T !== fa && W.push(B[ia])
                    }
                    return W
                },
                map: function (B, N, T) {
                    for (var W = [], fa, ia = 0, ma = B.length; ia < ma; ia++) {
                        fa = N(B[ia], ia, T);
                        fa != null && (W[W.length] = fa)
                    }
                    return W.concat.apply([], W)
                },
                guid: 1,
                proxy: function (B, N, T) {
                    arguments.length === 2 && (typeof N === "string" ? (T = B, B = T[N], N = b) : N && !k.isFunction(N) && (T = N, N = b));
                    !N && B && (N = function () {
                        return B.apply(T || this, arguments)
                    });
                    B && (N.guid = B.guid = B.guid || N.guid || k.guid++);
                    return N
                },
                access: function (B, N, T, W, fa, ia) {
                    var ma = B.length;
                    if (typeof N === "object") {
                        for (var ra in N) k.access(B, ra, N[ra], W, fa, T);
                        return B
                    }
                    if (T !== b) {
                        W = !ia && W && k.isFunction(T);
                        for (ra = 0; ra < ma; ra++) fa(B[ra], N, W ? T.call(B[ra], ra, fa(B[ra], N)) : T, ia);
                        return B
                    }
                    return ma ? fa(B[0], N) : b
                },
                now: function () {
                    return (new Date).getTime()
                },
                _Deferred: function () {
                    var B = [],
                        N, T, W, fa = {
                            done: function () {
                                if (!W) {
                                    var ia = arguments,
                                        ma, ra, Ba, Ua, Va;
                                    N && (Va = N, N = 0);
                                    ma = 0;
                                    for (ra = ia.length; ma < ra; ma++) {
                                        Ba = ia[ma];
                                        Ua = k.type(Ba);
                                        Ua === "array" ? fa.done.apply(fa, Ba) : Ua === "function" && B.push(Ba)
                                    }
                                    Va && fa.resolveWith(Va[0], Va[1])
                                }
                                return this
                            },
                            resolveWith: function (ia, ma) {
                                if (!W && !N && !T) {
                                    T = 1;
                                    try {
                                        for (; B[0];) B.shift().apply(ia, ma)
                                    } catch (ra) {
                                        throw ra;
                                    } finally {
                                        N = [ia, ma];
                                        T = 0
                                    }
                                }
                                return this
                            },
                            resolve: function () {
                                fa.resolveWith(k.isFunction(this.promise) ? this.promise() : this, arguments);
                                return this
                            },
                            isResolved: function () {
                                return T || N
                            },
                            cancel: function () {
                                W = 1;
                                B = [];
                                return this
                            }
                        };
                    return fa
                },
                Deferred: function (B) {
                    var N = k._Deferred(),
                        T = k._Deferred(),
                        W;
                    k.extend(N, {
                        then: function (fa, ia) {
                            N.done(fa).fail(ia);
                            return this
                        },
                        fail: T.done,
                        rejectWith: T.resolveWith,
                        reject: T.resolve,
                        isRejected: T.isResolved,
                        promise: function (fa) {
                            if (fa == null) {
                                if (W) return W;
                                W = fa = {}
                            }
                            for (var ia = L.length; ia--;) fa[L[ia]] = N[L[ia]];
                            return fa
                        }
                    });
                    N.done(T.cancel).fail(N.cancel);
                    delete N.cancel;
                    B && B.call(N, N);
                    return N
                },
                when: function (B) {
                    var N = arguments.length,
                        T = N <= 1 && B && k.isFunction(B.promise) ? B : k.Deferred(),
                        W = T.promise();
                    if (N > 1) {
                        for (var fa = ha.call(arguments, 0), ia = N, ma = function (ra) {
                                return function (Ba) {
                                    fa[ra] = arguments.length > 1 ? ha.call(arguments, 0) : Ba;
                                    --ia || T.resolveWith(W, fa)
                                }
                            }; N--;)(B = fa[N]) && k.isFunction(B.promise) ? B.promise().then(ma(N), T.reject) : --ia;
                        ia || T.resolveWith(W, fa)
                    } else T !== B && T.resolve(B);
                    return W
                },
                uaMatch: function (B) {
                    B = B.toLowerCase();
                    B = la.exec(B) || oa.exec(B) || ua.exec(B) || B.indexOf("compatible") < 0 && sa.exec(B) || [];
                    return {
                        browser: B[1] || "",
                        version: B[2] || "0"
                    }
                },
                sub: function () {
                    function B(T, W) {
                        return new B.fn.init(T, W)
                    }
                    k.extend(true, B, this);
                    B.superclass = this;
                    B.fn = B.prototype = this();
                    B.fn.constructor = B;
                    B.subclass = this.subclass;
                    B.fn.init = function T(T, W) {
                        W && W instanceof k && !(W instanceof B) && (W = B(W));
                        return k.fn.init.call(this, T, W, N)
                    };
                    B.fn.init.prototype = B.fn;
                    var N = B(Q);
                    return B
                },
                browser: {}
            });
            O = k._Deferred();
            k.each("Boolean Number String Function Array Date RegExp Object".split(" "), function (B, N) {
                ya["[object " + N + "]"] = N.toLowerCase()
            });
            v = k.uaMatch(v);
            v.browser && (k.browser[v.browser] = true, k.browser.version = v.version);
            k.browser.webkit && (k.browser.safari = true);
            va && (k.inArray = function (B, N) {
                return va.call(N, B)
            });
            w.test("\u00a0") && (A = /^[\s\xA0]+/, D = /[\s\xA0]+$/);
            q = k(Q);
            Q.addEventListener ? M = function () {
                Q.removeEventListener("DOMContentLoaded", M, false);
                k.ready()
            } : Q.attachEvent && (M = function () {
                Q.readyState === "complete" && (Q.detachEvent("onreadystatechange", M), k.ready())
            });
            return k
        }();
    (function () {
        l.support = {};
        var f = Q.createElement("div");
        f.style.display = "none";
        f.innerHTML = "   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";
        var k = f.getElementsByTagName("*"),
            h = f.getElementsByTagName("a")[0],
            m = Q.createElement("select"),
            q = m.appendChild(Q.createElement("option")),
            t = f.getElementsByTagName("input")[0];
        if (k && k.length && h) {
            l.support = {
                leadingWhitespace: f.firstChild.nodeType === 3,
                tbody: !f.getElementsByTagName("tbody").length,
                htmlSerialize: !! f.getElementsByTagName("link").length,
                style: /red/.test(h.getAttribute("style")),
                hrefNormalized: h.getAttribute("href") === "/a",
                opacity: /^0.55$/.test(h.style.opacity),
                cssFloat: !! h.style.cssFloat,
                checkOn: t.value === "on",
                optSelected: q.selected,
                deleteExpando: true,
                optDisabled: false,
                checkClone: false,
                noCloneEvent: true,
                noCloneChecked: true,
                boxModel: null,
                inlineBlockNeedsLayout: false,
                shrinkWrapBlocks: false,
                reliableHiddenOffsets: true
            };
            t.checked = true;
            l.support.noCloneChecked = t.cloneNode(true).checked;
            m.disabled = true;
            l.support.optDisabled = !q.disabled;
            var w = null;
            l.support.scriptEval = function () {
                if (w === null) {
                    var D = Q.documentElement,
                        E = Q.createElement("script"),
                        P = "script" + l.now();
                    try {
                        E.appendChild(Q.createTextNode("window." + P + "=1;"))
                    } catch (X) {}
                    D.insertBefore(E, D.firstChild);
                    a[P] ? (w = true, delete a[P]) : w = false;
                    D.removeChild(E)
                }
                return w
            };
            try {
                delete f.test
            } catch (A) {
                l.support.deleteExpando = false
            }!f.addEventListener && f.attachEvent && f.fireEvent && (f.attachEvent("onclick", function D() {
                l.support.noCloneEvent = false;
                f.detachEvent("onclick", D)
            }), f.cloneNode(true).fireEvent("onclick"));
            f = Q.createElement("div");
            f.innerHTML = "<input type='radio' name='radiotest' checked='checked'/>";
            k = Q.createDocumentFragment();
            k.appendChild(f.firstChild);
            l.support.checkClone = k.cloneNode(true).cloneNode(true).lastChild.checked;
            l(function () {
                var D = Q.createElement("div"),
                    E = Q.getElementsByTagName("body")[0];
                if (E) {
                    D.style.width = D.style.paddingLeft = "1px";
                    E.appendChild(D);
                    l.boxModel = l.support.boxModel = D.offsetWidth === 2;
                    "zoom" in D.style && (D.style.display = "inline", D.style.zoom = 1, l.support.inlineBlockNeedsLayout = D.offsetWidth === 2, D.style.display = "", D.innerHTML = "<div style='width:4px;'></div>", l.support.shrinkWrapBlocks = D.offsetWidth !== 2);
                    D.innerHTML = "<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";
                    var P = D.getElementsByTagName("td");
                    l.support.reliableHiddenOffsets = P[0].offsetHeight === 0;
                    P[0].style.display = "";
                    P[1].style.display = "none";
                    l.support.reliableHiddenOffsets = l.support.reliableHiddenOffsets && P[0].offsetHeight === 0;
                    D.innerHTML = "";
                    E.removeChild(D).style.display = "none"
                }
            });
            k = function (D) {
                var E = Q.createElement("div");
                D = "on" + D;
                if (!E.attachEvent) return true;
                var P = D in E;
                P || (E.setAttribute(D, "return;"), P = typeof E[D] === "function");
                return P
            };
            l.support.submitBubbles = k("submit");
            l.support.changeBubbles = k("change");
            f = k = h = null
        }
    })();
    var ka = /^(?:\{.*\}|\[.*\])$/;
    l.extend({
        cache: {},
        uuid: 0,
        expando: "jQuery" + (l.fn.jquery + Math.random()).replace(/\D/g, ""),
        noData: {
            embed: true,
            object: "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
            applet: true
        },
        hasData: function (f) {
            f = f.nodeType ? l.cache[f[l.expando]] : f[l.expando];
            return !!f && !na(f)
        },
        data: function (f, k, h, m) {
            if (l.acceptData(f)) {
                var q = l.expando,
                    t = typeof k === "string",
                    w = f.nodeType,
                    A = w ? l.cache : f,
                    D = w ? f[l.expando] : f[l.expando] && l.expando;
                if (!((!D || m && D && !A[D][q]) && t && h === b)) {
                    D || (w ? f[l.expando] = D = ++l.uuid : D = l.expando);
                    A[D] || (A[D] = {}, w || (A[D].toJSON = l.noop));
                    if (typeof k === "object" || typeof k === "function") m ? A[D][q] = l.extend(A[D][q], k) : A[D] = l.extend(A[D], k);
                    f = A[D];
                    m && (f[q] || (f[q] = {}), f = f[q]);
                    h !== b && (f[k] = h);
                    if (k === "events" && !f[k]) return f[q] && f[q].events;
                    return t ? f[k] : f
                }
            }
        },
        removeData: function (f, k, h) {
            if (l.acceptData(f)) {
                var m = l.expando,
                    q = f.nodeType,
                    t = q ? l.cache : f,
                    w = q ? f[l.expando] : l.expando;
                if (t[w]) {
                    if (k) {
                        var A = h ? t[w][m] : t[w];
                        if (A) {
                            delete A[k];
                            if (!na(A)) return
                        }
                    }
                    if (h) {
                        delete t[w][m];
                        if (!na(t[w])) return
                    }
                    k = t[w][m];
                    l.support.deleteExpando || t != a ? delete t[w] : t[w] = null;
                    k ? (t[w] = {}, q || (t[w].toJSON = l.noop), t[w][m] = k) : q && (l.support.deleteExpando ? delete f[l.expando] : f.removeAttribute ? f.removeAttribute(l.expando) : f[l.expando] = null)
                }
            }
        },
        _data: function (f, k, h) {
            return l.data(f, k, h, true)
        },
        acceptData: function (f) {
            if (f.nodeName) {
                var k = l.noData[f.nodeName.toLowerCase()];
                if (k) return k !== true && f.getAttribute("classid") === k
            }
            return true
        }
    });
    l.fn.extend({
        data: function (f, k) {
            var h = null;
            if (typeof f === "undefined") {
                if (this.length) {
                    h = l.data(this[0]);
                    if (this[0].nodeType === 1) for (var m = this[0].attributes, q, t = 0, w = m.length; t < w; t++) {
                        q = m[t].name;
                        q.indexOf("data-") === 0 && (q = q.substr(5), U(this[0], q, h[q]))
                    }
                }
                return h
            }
            if (typeof f === "object") return this.each(function () {
                l.data(this, f)
            });
            var A = f.split(".");
            A[1] = A[1] ? "." + A[1] : "";
            if (k === b) {
                h = this.triggerHandler("getData" + A[1] + "!", [A[0]]);
                h === b && this.length && (h = l.data(this[0], f), h = U(this[0], f, h));
                return h === b && A[1] ? this.data(A[0]) : h
            }
            return this.each(function () {
                var D = l(this),
                    E = [A[0], k];
                D.triggerHandler("setData" + A[1] + "!", E);
                l.data(this, f, k);
                D.triggerHandler("changeData" + A[1] + "!", E)
            })
        },
        removeData: function (f) {
            return this.each(function () {
                l.removeData(this, f)
            })
        }
    });
    l.extend({
        queue: function (f, k, h) {
            if (f) {
                k = (k || "fx") + "queue";
                var m = l._data(f, k);
                if (!h) return m || [];
                !m || l.isArray(h) ? m = l._data(f, k, l.makeArray(h)) : m.push(h);
                return m
            }
        },
        dequeue: function (f, k) {
            k = k || "fx";
            var h = l.queue(f, k),
                m = h.shift();
            m === "inprogress" && (m = h.shift());
            m && (k === "fx" && h.unshift("inprogress"), m.call(f, function () {
                l.dequeue(f, k)
            }));
            h.length || l.removeData(f, k + "queue", true)
        }
    });
    l.fn.extend({
        queue: function (f, k) {
            typeof f !== "string" && (k = f, f = "fx");
            if (k === b) return l.queue(this[0], f);
            return this.each(function () {
                var h = l.queue(this, f, k);
                f === "fx" && h[0] !== "inprogress" && l.dequeue(this, f)
            })
        },
        dequeue: function (f) {
            return this.each(function () {
                l.dequeue(this, f)
            })
        },
        delay: function (f, k) {
            f = l.fx ? l.fx.speeds[f] || f : f;
            k = k || "fx";
            return this.queue(k, function () {
                var h = this;
                setTimeout(function () {
                    l.dequeue(h, k)
                }, f)
            })
        },
        clearQueue: function (f) {
            return this.queue(f || "fx", [])
        }
    });
    var ta = /[\n\t\r]/g,
        z = /\s+/,
        H = /\r/g,
        K = /^(?:href|src|style)$/,
        R = /^(?:button|input)$/i,
        ca = /^(?:button|input|object|select|textarea)$/i,
        ga = /^a(?:rea)?$/i,
        qa = /^(?:radio|checkbox)$/i;
    l.props = {
        "for": "htmlFor",
        "class": "className",
        readonly: "readOnly",
        maxlength: "maxLength",
        cellspacing: "cellSpacing",
        rowspan: "rowSpan",
        colspan: "colSpan",
        tabindex: "tabIndex",
        usemap: "useMap",
        frameborder: "frameBorder"
    };
    l.fn.extend({
        attr: function (f, k) {
            return l.access(this, f, k, true, l.attr)
        },
        removeAttr: function (f) {
            return this.each(function () {
                l.attr(this, f, "");
                this.nodeType === 1 && this.removeAttribute(f)
            })
        },
        addClass: function (f) {
            if (l.isFunction(f)) return this.each(function (E) {
                var P = l(this);
                P.addClass(f.call(this, E, P.attr("class")))
            });
            if (f && typeof f === "string") for (var k = (f || "").split(z), h = 0, m = this.length; h < m; h++) {
                var q = this[h];
                if (q.nodeType === 1) if (q.className) {
                    for (var t = " " + q.className + " ", w = q.className, A = 0, D = k.length; A < D; A++) t.indexOf(" " + k[A] + " ") < 0 && (w += " " + k[A]);
                    q.className = l.trim(w)
                } else q.className = f
            }
            return this
        },
        removeClass: function (f) {
            if (l.isFunction(f)) return this.each(function (D) {
                var E = l(this);
                E.removeClass(f.call(this, D, E.attr("class")))
            });
            if (f && typeof f === "string" || f === b) for (var k = (f || "").split(z), h = 0, m = this.length; h < m; h++) {
                var q = this[h];
                if (q.nodeType === 1 && q.className) if (f) {
                    for (var t = (" " + q.className + " ").replace(ta, " "), w = 0, A = k.length; w < A; w++) t = t.replace(" " + k[w] + " ", " ");
                    q.className = l.trim(t)
                } else q.className = ""
            }
            return this
        },
        toggleClass: function (f, k) {
            var h = typeof f,
                m = typeof k === "boolean";
            if (l.isFunction(f)) return this.each(function (q) {
                var t = l(this);
                t.toggleClass(f.call(this, q, t.attr("class"), k), k)
            });
            return this.each(function () {
                if (h === "string") for (var q, t = 0, w = l(this), A = k, D = f.split(z); q = D[t++];) {
                    A = m ? A : !w.hasClass(q);
                    w[A ? "addClass" : "removeClass"](q)
                } else if (h === "undefined" || h === "boolean") {
                    this.className && l._data(this, "__className__", this.className);
                    this.className = this.className || f === false ? "" : l._data(this, "__className__") || ""
                }
            })
        },
        hasClass: function (f) {
            f = " " + f + " ";
            for (var k = 0, h = this.length; k < h; k++) if ((" " + this[k].className + " ").replace(ta, " ").indexOf(f) > -1) return true;
            return false
        },
        val: function (f) {
            if (!arguments.length) {
                var k = this[0];
                if (k) {
                    if (l.nodeName(k, "option")) {
                        var h = k.attributes.value;
                        return !h || h.specified ? k.value : k.text
                    }
                    if (l.nodeName(k, "select")) {
                        h = k.selectedIndex;
                        var m = [],
                            q = k.options;
                        k = k.type === "select-one";
                        if (h < 0) return null;
                        for (var t = k ? h : 0, w = k ? h + 1 : q.length; t < w; t++) {
                            var A = q[t];
                            if (A.selected && (l.support.optDisabled ? !A.disabled : A.getAttribute("disabled") === null) && (!A.parentNode.disabled || !l.nodeName(A.parentNode, "optgroup"))) {
                                f = l(A).val();
                                if (k) return f;
                                m.push(f)
                            }
                        }
                        if (k && !m.length && q.length) return l(q[h]).val();
                        return m
                    }
                    if (qa.test(k.type) && !l.support.checkOn) return k.getAttribute("value") === null ? "on" : k.value;
                    return (k.value || "").replace(H, "")
                }
                return b
            }
            var D = l.isFunction(f);
            return this.each(function (E) {
                var P = l(this),
                    X = f;
                if (this.nodeType === 1) {
                    D && (X = f.call(this, E, P.val()));
                    X == null ? X = "" : typeof X === "number" ? X += "" : l.isArray(X) && (X = l.map(X, function (aa) {
                        return aa == null ? "" : aa + ""
                    }));
                    if (l.isArray(X) && qa.test(this.type)) this.checked = l.inArray(P.val(), X) >= 0;
                    else if (l.nodeName(this, "select")) {
                        var da = l.makeArray(X);
                        l("option", this).each(function () {
                            this.selected = l.inArray(l(this).val(), da) >= 0
                        });
                        da.length || (this.selectedIndex = -1)
                    } else this.value = X
                }
            })
        }
    });
    l.extend({
        attrFn: {
            val: true,
            css: true,
            html: true,
            text: true,
            data: true,
            width: true,
            height: true,
            offset: true
        },
        attr: function (f, k, h, m) {
            if (!f || f.nodeType === 3 || f.nodeType === 8 || f.nodeType === 2) return b;
            if (m && k in l.attrFn) return l(f)[k](h);
            m = f.nodeType !== 1 || !l.isXMLDoc(f);
            var q = h !== b;
            k = m && l.props[k] || k;
            if (f.nodeType === 1) {
                var t = K.test(k);
                if ((k in f || f[k] !== b) && m && !t) {
                    q && (k === "type" && R.test(f.nodeName) && f.parentNode && l.error("type property can't be changed"), h === null ? f.nodeType === 1 && f.removeAttribute(k) : f[k] = h);
                    if (l.nodeName(f, "form") && f.getAttributeNode(k)) return f.getAttributeNode(k).nodeValue;
                    if (k === "tabIndex") return (k = f.getAttributeNode("tabIndex")) && k.specified ? k.value : ca.test(f.nodeName) || ga.test(f.nodeName) && f.href ? 0 : b;
                    return f[k]
                }
                if (!l.support.style && m && k === "style") {
                    q && (f.style.cssText = "" + h);
                    return f.style.cssText
                }
                q && f.setAttribute(k, "" + h);
                if (!f.attributes[k] && f.hasAttribute && !f.hasAttribute(k)) return b;
                f = !l.support.hrefNormalized && m && t ? f.getAttribute(k, 2) : f.getAttribute(k);
                return f === null ? b : f
            }
            q && (f[k] = h);
            return f[k]
        }
    });
    var Da = /\.(.*)$/,
        lb = /^(?:textarea|input|select)$/i,
        Rb = /\./g,
        Oa = / /g,
        bb = /[^\w\s.|`]/g,
        mb = function (f) {
            return f.replace(bb, "\\$&")
        };
    l.event = {
        add: function (f, k, h, m) {
            if (f.nodeType !== 3 && f.nodeType !== 8) {
                try {
                    l.isWindow(f) && f !== a && !f.frameElement && (f = a)
                } catch (q) {}
                if (h === false) h = Y;
                else if (!h) return;
                var t, w;
                h.handler && (t = h, h = t.handler);
                h.guid || (h.guid = l.guid++);
                if (w = l._data(f)) {
                    var A = w.events,
                        D = w.handle;
                    A || (w.events = A = {});
                    D || (w.handle = D = function () {
                        return typeof l !== "undefined" && !l.event.triggered ? l.event.handle.apply(D.elem, arguments) : b
                    });
                    D.elem = f;
                    k = k.split(" ");
                    for (var E, P = 0, X; E = k[P++];) {
                        w = t ? l.extend({}, t) : {
                            handler: h,
                            data: m
                        };
                        E.indexOf(".") > -1 ? (X = E.split("."), E = X.shift(), w.namespace = X.slice(0).sort().join(".")) : (X = [], w.namespace = "");
                        w.type = E;
                        w.guid || (w.guid = h.guid);
                        var da = A[E],
                            aa = l.event.special[E] || {};
                        if (!da) {
                            da = A[E] = [];
                            if (!aa.setup || aa.setup.call(f, m, X, D) === false) f.addEventListener ? f.addEventListener(E, D, false) : f.attachEvent && f.attachEvent("on" + E, D)
                        }
                        aa.add && (aa.add.call(f, w), w.handler.guid || (w.handler.guid = h.guid));
                        da.push(w);
                        l.event.global[E] = true
                    }
                    f = null
                }
            }
        },
        global: {},
        remove: function (f, k, h, m) {
            if (f.nodeType !== 3 && f.nodeType !== 8) {
                h === false && (h = Y);
                var q, t, w = 0,
                    A, D, E, P, X, da, aa = l.hasData(f) && l._data(f),
                    ea = aa && aa.events;
                if (aa && ea) {
                    k && k.type && (h = k.handler, k = k.type);
                    if (!k || typeof k === "string" && k.charAt(0) === ".") {
                        k = k || "";
                        for (q in ea) l.event.remove(f, q + k)
                    } else {
                        for (k = k.split(" "); q = k[w++];) {
                            P = q;
                            A = q.indexOf(".") < 0;
                            D = [];
                            A || (D = q.split("."), q = D.shift(), E = RegExp("(^|\\.)" + l.map(D.slice(0).sort(), mb).join("\\.(?:.*\\.)?") + "(\\.|$)"));
                            if (X = ea[q]) if (h) {
                                P = l.event.special[q] || {};
                                for (t = m || 0; t < X.length; t++) {
                                    da = X[t];
                                    if (h.guid === da.guid) {
                                        if (A || E.test(da.namespace)) {
                                            m == null && X.splice(t--, 1);
                                            P.remove && P.remove.call(f, da)
                                        }
                                        if (m != null) break
                                    }
                                }
                                if (X.length === 0 || m != null && X.length === 1) {
                                    (!P.teardown || P.teardown.call(f, D) === false) && l.removeEvent(f, q, aa.handle);
                                    delete ea[q]
                                }
                            } else for (t = 0; t < X.length; t++) {
                                da = X[t];
                                if (A || E.test(da.namespace)) {
                                    l.event.remove(f, P, da.handler, t);
                                    X.splice(t--, 1)
                                }
                            }
                        }
                        if (l.isEmptyObject(ea)) {
                            (k = aa.handle) && (k.elem = null);
                            delete aa.events;
                            delete aa.handle;
                            l.isEmptyObject(aa) && l.removeData(f, b, true)
                        }
                    }
                }
            }
        },
        trigger: function (f, k, h, m) {
            var q = f.type || f;
            if (!m) {
                f = typeof f === "object" ? f[l.expando] ? f : l.extend(l.Event(q), f) : l.Event(q);
                q.indexOf("!") >= 0 && (f.type = q = q.slice(0, -1), f.exclusive = true);
                h || (f.stopPropagation(), l.event.global[q] && l.each(l.cache, function () {
                    var X = this[l.expando];
                    X && X.events && X.events[q] && l.event.trigger(f, k, X.handle.elem)
                }));
                if (!h || h.nodeType === 3 || h.nodeType === 8) return b;
                f.result = b;
                f.target = h;
                k = l.makeArray(k);
                k.unshift(f)
            }
            f.currentTarget = h;
            (m = l._data(h, "handle")) && m.apply(h, k);
            m = h.parentNode || h.ownerDocument;
            try {
                h && h.nodeName && l.noData[h.nodeName.toLowerCase()] || h["on" + q] && h["on" + q].apply(h, k) === false && (f.result = false, f.preventDefault())
            } catch (t) {}
            if (!f.isPropagationStopped() && m) l.event.trigger(f, k, m, true);
            else if (!f.isDefaultPrevented()) {
                var w;
                m = f.target;
                var A = q.replace(Da, ""),
                    D = l.nodeName(m, "a") && A === "click",
                    E = l.event.special[A] || {};
                if ((!E._default || E._default.call(h, f) === false) && !D && !(m && m.nodeName && l.noData[m.nodeName.toLowerCase()])) {
                    try {
                        m[A] && (w = m["on" + A], w && (m["on" + A] = null), l.event.triggered = true, m[A]())
                    } catch (P) {}
                    w && (m["on" + A] = w);
                    l.event.triggered = false
                }
            }
        },
        handle: function (f) {
            var k, h, m, q;
            q = [];
            var t = l.makeArray(arguments);
            f = t[0] = l.event.fix(f || a.event);
            f.currentTarget = this;
            (k = f.type.indexOf(".") < 0 && !f.exclusive) || (h = f.type.split("."), f.type = h.shift(), q = h.slice(0).sort(), m = RegExp("(^|\\.)" + q.join("\\.(?:.*\\.)?") + "(\\.|$)"));
            f.namespace = f.namespace || q.join(".");
            q = l._data(this, "events");
            h = (q || {})[f.type];
            if (q && h) {
                h = h.slice(0);
                q = 0;
                for (var w = h.length; q < w; q++) {
                    var A = h[q];
                    if (k || m.test(A.namespace)) {
                        f.handler = A.handler;
                        f.data = A.data;
                        f.handleObj = A;
                        A = A.handler.apply(this, t);
                        A !== b && (f.result = A, A === false && (f.preventDefault(), f.stopPropagation()));
                        if (f.isImmediatePropagationStopped()) break
                    }
                }
            }
            return f.result
        },
        props: "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),
        fix: function (f) {
            if (f[l.expando]) return f;
            var k = f;
            f = l.Event(k);
            for (var h = this.props.length, m; h;) {
                m = this.props[--h];
                f[m] = k[m]
            }
            f.target || (f.target = f.srcElement || Q);
            f.target.nodeType === 3 && (f.target = f.target.parentNode);
            !f.relatedTarget && f.fromElement && (f.relatedTarget = f.fromElement === f.target ? f.toElement : f.fromElement);
            if (f.pageX == null && f.clientX != null) {
                k = Q.documentElement;
                h = Q.body;
                f.pageX = f.clientX + (k && k.scrollLeft || h && h.scrollLeft || 0) - (k && k.clientLeft || h && h.clientLeft || 0);
                f.pageY = f.clientY + (k && k.scrollTop || h && h.scrollTop || 0) - (k && k.clientTop || h && h.clientTop || 0)
            }
            f.which == null && (f.charCode != null || f.keyCode != null) && (f.which = f.charCode != null ? f.charCode : f.keyCode);
            !f.metaKey && f.ctrlKey && (f.metaKey = f.ctrlKey);
            !f.which && f.button !== b && (f.which = f.button & 1 ? 1 : f.button & 2 ? 3 : f.button & 4 ? 2 : 0);
            return f
        },
        guid: 1E8,
        proxy: l.proxy,
        special: {
            ready: {
                setup: l.bindReady,
                teardown: l.noop
            },
            live: {
                add: function (f) {
                    l.event.add(this, G(f.origType, f.selector), l.extend({}, f, {
                        handler: J,
                        guid: f.handler.guid
                    }))
                },
                remove: function (f) {
                    l.event.remove(this, G(f.origType, f.selector), f)
                }
            },
            beforeunload: {
                setup: function (f, k, h) {
                    l.isWindow(this) && (this.onbeforeunload = h)
                },
                teardown: function (f, k) {
                    this.onbeforeunload === k && (this.onbeforeunload = null)
                }
            }
        }
    };
    l.removeEvent = Q.removeEventListener ?
    function (f, k, h) {
        f.removeEventListener && f.removeEventListener(k, h, false)
    } : function (f, k, h) {
        f.detachEvent && f.detachEvent("on" + k, h)
    };
    l.Event = function (f) {
        if (!this.preventDefault) return new l.Event(f);
        f && f.type ? (this.originalEvent = f, this.type = f.type, this.isDefaultPrevented = f.defaultPrevented || f.returnValue === false || f.getPreventDefault && f.getPreventDefault() ? C : Y) : this.type = f;
        this.timeStamp = l.now();
        this[l.expando] = true
    };
    l.Event.prototype = {
        preventDefault: function () {
            this.isDefaultPrevented = C;
            var f = this.originalEvent;
            f && (f.preventDefault ? f.preventDefault() : f.returnValue = false)
        },
        stopPropagation: function () {
            this.isPropagationStopped = C;
            var f = this.originalEvent;
            f && (f.stopPropagation && f.stopPropagation(), f.cancelBubble = true)
        },
        stopImmediatePropagation: function () {
            this.isImmediatePropagationStopped = C;
            this.stopPropagation()
        },
        isDefaultPrevented: Y,
        isPropagationStopped: Y,
        isImmediatePropagationStopped: Y
    };
    var Hb = function (f) {
            var k = f.relatedTarget;
            try {
                if (!(k !== Q && !k.parentNode)) {
                    for (; k && k !== this;) k = k.parentNode;
                    k !== this && (f.type = f.data, l.event.handle.apply(this, arguments))
                }
            } catch (h) {}
        },
        Ib = function (f) {
            f.type = f.data;
            l.event.handle.apply(this, arguments)
        };
    l.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    }, function (f, k) {
        l.event.special[f] = {
            setup: function (h) {
                l.event.add(this, k, h && h.selector ? Ib : Hb, f)
            },
            teardown: function (h) {
                l.event.remove(this, k, h && h.selector ? Ib : Hb)
            }
        }
    });
    l.support.submitBubbles || (l.event.special.submit = {
        setup: function () {
            if (this.nodeName && this.nodeName.toLowerCase() !== "form") {
                l.event.add(this, "click.specialSubmit", function (f) {
                    var k = f.target,
                        h = k.type;
                    (h === "submit" || h === "image") && l(k).closest("form").length && V("submit", this, arguments)
                });
                l.event.add(this, "keypress.specialSubmit", function (f) {
                    var k = f.target,
                        h = k.type;
                    (h === "text" || h === "password") && l(k).closest("form").length && f.keyCode === 13 && V("submit", this, arguments)
                })
            } else return false
        },
        teardown: function () {
            l.event.remove(this, ".specialSubmit")
        }
    });
    if (!l.support.changeBubbles) {
        var nb, ob = function (f) {
                var k = f.type,
                    h = f.value;
                k === "radio" || k === "checkbox" ? h = f.checked : k === "select-multiple" ? h = f.selectedIndex > -1 ? l.map(f.options, function (m) {
                    return m.selected
                }).join("-") : "" : f.nodeName.toLowerCase() === "select" && (h = f.selectedIndex);
                return h
            },
            pb = function (f, k) {
                var h = f.target,
                    m, q;
                if (lb.test(h.nodeName) && !h.readOnly) {
                    m = l._data(h, "_change_data");
                    q = ob(h);
                    (f.type !== "focusout" || h.type !== "radio") && l._data(h, "_change_data", q);
                    if (!(m === b || q === m)) if (m != null || q) {
                        f.type = "change";
                        f.liveFired = b;
                        l.event.trigger(f, k, h)
                    }
                }
            };
        l.event.special.change = {
            filters: {
                focusout: pb,
                beforedeactivate: pb,
                click: function (f) {
                    var k = f.target,
                        h = k.type;
                    (h === "radio" || h === "checkbox" || k.nodeName.toLowerCase() === "select") && pb.call(this, f)
                },
                keydown: function (f) {
                    var k = f.target,
                        h = k.type;
                    (f.keyCode === 13 && k.nodeName.toLowerCase() !== "textarea" || f.keyCode === 32 && (h === "checkbox" || h === "radio") || h === "select-multiple") && pb.call(this, f)
                },
                beforeactivate: function (f) {
                    f = f.target;
                    l._data(f, "_change_data", ob(f))
                }
            },
            setup: function () {
                if (this.type === "file") return false;
                for (var f in nb) l.event.add(this, f + ".specialChange", nb[f]);
                return lb.test(this.nodeName)
            },
            teardown: function () {
                l.event.remove(this, ".specialChange");
                return lb.test(this.nodeName)
            }
        };
        nb = l.event.special.change.filters;
        nb.focus = nb.beforeactivate
    }
    Q.addEventListener && l.each({
        focus: "focusin",
        blur: "focusout"
    }, function (f, k) {
        function h(m) {
            m = l.event.fix(m);
            m.type = k;
            return l.event.handle.call(this, m)
        }
        l.event.special[k] = {
            setup: function () {
                this.addEventListener(f, h, true)
            },
            teardown: function () {
                this.removeEventListener(f, h, true)
            }
        }
    });
    l.each(["bind", "one"], function (f, k) {
        l.fn[k] = function (h, m, q) {
            if (typeof h === "object") {
                for (var t in h) this[k](t, m, h[t], q);
                return this
            }
            if (l.isFunction(m) || m === false) {
                q = m;
                m = b
            }
            var w = k === "one" ? l.proxy(q, function (D) {
                l(this).unbind(D, w);
                return q.apply(this, arguments)
            }) : q;
            if (h === "unload" && k !== "one") this.one(h, m, q);
            else {
                t = 0;
                for (var A = this.length; t < A; t++) l.event.add(this[t], h, w, m)
            }
            return this
        }
    });
    l.fn.extend({
        unbind: function (f, k) {
            if (typeof f !== "object" || f.preventDefault) for (var h = 0, m = this.length; h < m; h++) l.event.remove(this[h], f, k);
            else for (h in f) this.unbind(h, f[h]);
            return this
        },
        delegate: function (f, k, h, m) {
            return this.live(k, h, m, f)
        },
        undelegate: function (f, k, h) {
            return arguments.length === 0 ? this.unbind("live") : this.die(k, null, h, f)
        },
        trigger: function (f, k) {
            return this.each(function () {
                l.event.trigger(f, k, this)
            })
        },
        triggerHandler: function (f, k) {
            if (this[0]) {
                var h = l.Event(f);
                h.preventDefault();
                h.stopPropagation();
                l.event.trigger(h, k, this[0]);
                return h.result
            }
        },
        toggle: function (f) {
            for (var k = arguments, h = 1; h < k.length;) l.proxy(f, k[h++]);
            return this.click(l.proxy(f, function (m) {
                var q = (l._data(this, "lastToggle" + f.guid) || 0) % h;
                l._data(this, "lastToggle" + f.guid, q + 1);
                m.preventDefault();
                return k[q].apply(this, arguments) || false
            }))
        },
        hover: function (f, k) {
            return this.mouseenter(f).mouseleave(k || f)
        }
    });
    var Jb = {
        focus: "focusin",
        blur: "focusout",
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    };
    l.each(["live", "die"], function (f, k) {
        l.fn[k] = function (h, m, q, t) {
            var w, A = 0,
                D, E, P = t || this.selector;
            t = t ? this : l(this.context);
            if (typeof h === "object" && !h.preventDefault) {
                for (w in h) t[k](w, m, h[w], P);
                return this
            }
            l.isFunction(m) && (q = m, m = b);
            for (h = (h || "").split(" ");
            (w = h[A++]) != null;) {
                D = Da.exec(w);
                E = "";
                D && (E = D[0], w = w.replace(Da, ""));
                if (w === "hover") h.push("mouseenter" + E, "mouseleave" + E);
                else {
                    D = w;
                    w === "focus" || w === "blur" ? (h.push(Jb[w] + E), w += E) : w = (Jb[w] || w) + E;
                    if (k === "live") {
                        E = 0;
                        for (var X = t.length; E < X; E++) l.event.add(t[E], "live." + G(w, P), {
                            data: m,
                            selector: P,
                            handler: q,
                            origType: w,
                            origHandler: q,
                            preType: D
                        })
                    } else t.unbind("live." + G(w, P), q)
                }
            }
            return this
        }
    });
    l.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error".split(" "), function (f, k) {
        l.fn[k] = function (h, m) {
            m == null && (m = h, h = null);
            return arguments.length > 0 ? this.bind(k, h, m) : this.trigger(k)
        };
        l.attrFn && (l.attrFn[k] = true)
    });
    (function () {
        function f(v, F, O, L, M, S) {
            M = 0;
            for (var ba = L.length; M < ba; M++) {
                var Z = L[M];
                if (Z) {
                    var ha = false;
                    for (Z = Z[v]; Z;) {
                        if (Z.sizcache === O) {
                            ha = L[Z.sizset];
                            break
                        }
                        if (Z.nodeType === 1) {
                            S || (Z.sizcache = O, Z.sizset = M);
                            if (typeof F !== "string") {
                                if (Z === F) {
                                    ha = true;
                                    break
                                }
                            } else if (E.filter(F, [Z]).length > 0) {
                                ha = Z;
                                break
                            }
                        }
                        Z = Z[v]
                    }
                    L[M] = ha
                }
            }
        }
        function k(v, F, O, L, M, S) {
            M = 0;
            for (var ba = L.length; M < ba; M++) {
                var Z = L[M];
                if (Z) {
                    var ha = false;
                    for (Z = Z[v]; Z;) {
                        if (Z.sizcache === O) {
                            ha = L[Z.sizset];
                            break
                        }
                        Z.nodeType === 1 && !S && (Z.sizcache = O, Z.sizset = M);
                        if (Z.nodeName.toLowerCase() === F) {
                            ha = Z;
                            break
                        }
                        Z = Z[v]
                    }
                    L[M] = ha
                }
            }
        }
        var h = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
            m = 0,
            q = Object.prototype.toString,
            t = false,
            w = true,
            A = /\\/g,
            D = /\W/;
        [0, 0].sort(function () {
            w = false;
            return 0
        });
        var E = function (v, F, O, L) {
                O = O || [];
                var M = F = F || Q;
                if (F.nodeType !== 1 && F.nodeType !== 9) return [];
                if (!v || typeof v !== "string") return O;
                var S, ba, Z, ha, wa, va, ya = true,
                    B = E.isXML(F),
                    N = [],
                    T = v;
                do {
                    h.exec("");
                    if (S = h.exec(T)) {
                        T = S[3];
                        N.push(S[1]);
                        if (S[2]) {
                            ha = S[3];
                            break
                        }
                    }
                } while (S);
                if (N.length > 1 && X.exec(v)) if (N.length === 2 && P.relative[N[0]]) ba = sa(N[0] + N[1], F);
                else for (ba = P.relative[N[0]] ? [F] : E(N.shift(), F); N.length;) {
                    v = N.shift();
                    P.relative[v] && (v += N.shift());
                    ba = sa(v, ba)
                } else {
                    !L && N.length > 1 && F.nodeType === 9 && !B && P.match.ID.test(N[0]) && !P.match.ID.test(N[N.length - 1]) && (wa = E.find(N.shift(), F, B), F = wa.expr ? E.filter(wa.expr, wa.set)[0] : wa.set[0]);
                    if (F) {
                        wa = L ? {
                            expr: N.pop(),
                            set: ea(L)
                        } : E.find(N.pop(), N.length === 1 && (N[0] === "~" || N[0] === "+") && F.parentNode ? F.parentNode : F, B);
                        ba = wa.expr ? E.filter(wa.expr, wa.set) : wa.set;
                        for (N.length > 0 ? Z = ea(ba) : ya = false; N.length;) {
                            S = va = N.pop();
                            P.relative[va] ? S = N.pop() : va = "";
                            S == null && (S = F);
                            P.relative[va](Z, S, B)
                        }
                    } else Z = []
                }
                Z || (Z = ba);
                Z || E.error(va || v);
                if (q.call(Z) === "[object Array]") if (ya) if (F && F.nodeType === 1) for (v = 0; Z[v] != null; v++) Z[v] && (Z[v] === true || Z[v].nodeType === 1 && E.contains(F, Z[v])) && O.push(ba[v]);
                else for (v = 0; Z[v] != null; v++) Z[v] && Z[v].nodeType === 1 && O.push(ba[v]);
                else O.push.apply(O, Z);
                else ea(Z, O);
                ha && (E(ha, M, O, L), E.uniqueSort(O));
                return O
            };
        E.uniqueSort = function (v) {
            if (oa) {
                t = w;
                v.sort(oa);
                if (t) for (var F = 1; F < v.length; F++) v[F] === v[F - 1] && v.splice(F--, 1)
            }
            return v
        };
        E.matches = function (v, F) {
            return E(v, null, null, F)
        };
        E.matchesSelector = function (v, F) {
            return E(F, null, null, [v]).length > 0
        };
        E.find = function (v, F, O) {
            var L;
            if (!v) return [];
            for (var M = 0, S = P.order.length; M < S; M++) {
                var ba, Z = P.order[M];
                if (ba = P.leftMatch[Z].exec(v)) {
                    var ha = ba[1];
                    ba.splice(1, 1);
                    if (ha.substr(ha.length - 1) !== "\\") {
                        ba[1] = (ba[1] || "").replace(A, "");
                        L = P.find[Z](ba, F, O);
                        if (L != null) {
                            v = v.replace(P.match[Z], "");
                            break
                        }
                    }
                }
            }
            L || (L = typeof F.getElementsByTagName !== "undefined" ? F.getElementsByTagName("*") : []);
            return {
                set: L,
                expr: v
            }
        };
        E.filter = function (v, F, O, L) {
            for (var M, S, ba = v, Z = [], ha = F, wa = F && F[0] && E.isXML(F[0]); v && F.length;) {
                for (var va in P.filter) if ((M = P.leftMatch[va].exec(v)) != null && M[2]) {
                    var ya, B, N = P.filter[va];
                    B = M[1];
                    S = false;
                    M.splice(1, 1);
                    if (B.substr(B.length - 1) !== "\\") {
                        ha === Z && (Z = []);
                        if (P.preFilter[va]) if (M = P.preFilter[va](M, ha, O, Z, L, wa)) {
                            if (M === true) continue
                        } else S = ya = true;
                        if (M) for (var T = 0;
                        (B = ha[T]) != null; T++) if (B) {
                            ya = N(B, M, T, ha);
                            var W = L ^ !! ya;
                            O && ya != null ? W ? S = true : ha[T] = false : W && (Z.push(B), S = true)
                        }
                        if (ya !== b) {
                            O || (ha = Z);
                            v = v.replace(P.match[va], "");
                            if (!S) return [];
                            break
                        }
                    }
                }
                if (v === ba) if (S == null) E.error(v);
                else break;
                ba = v
            }
            return ha
        };
        E.error = function (v) {
            throw "Syntax error, unrecognized expression: " + v;
        };
        var P = E.selectors = {
            order: ["ID", "NAME", "TAG"],
            match: {
                ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
                ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
                TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
                CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
                POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
                PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
            },
            leftMatch: {},
            attrMap: {
                "class": "className",
                "for": "htmlFor"
            },
            attrHandle: {
                href: function (v) {
                    return v.getAttribute("href")
                },
                type: function (v) {
                    return v.getAttribute("type")
                }
            },
            relative: {
                "+": function (v, F) {
                    var O = typeof F === "string",
                        L = O && !D.test(F);
                    O = O && !L;
                    L && (F = F.toLowerCase());
                    L = 0;
                    for (var M = v.length, S; L < M; L++) if (S = v[L]) {
                        for (;
                        (S = S.previousSibling) && S.nodeType !== 1;);
                        v[L] = O || S && S.nodeName.toLowerCase() === F ? S || false : S === F
                    }
                    O && E.filter(F, v, true)
                },
                ">": function (v, F) {
                    var O, L = typeof F === "string",
                        M = 0,
                        S = v.length;
                    if (L && !D.test(F)) for (F = F.toLowerCase(); M < S; M++) {
                        if (O = v[M]) {
                            O = O.parentNode;
                            v[M] = O.nodeName.toLowerCase() === F ? O : false
                        }
                    } else {
                        for (; M < S; M++)(O = v[M]) && (v[M] = L ? O.parentNode : O.parentNode === F);
                        L && E.filter(F, v, true)
                    }
                },
                "": function (v, F, O) {
                    var L, M = m++,
                        S = f;
                    typeof F === "string" && !D.test(F) && (F = F.toLowerCase(), L = F, S = k);
                    S("parentNode", F, M, v, L, O)
                },
                "~": function (v, F, O) {
                    var L, M = m++,
                        S = f;
                    typeof F === "string" && !D.test(F) && (F = F.toLowerCase(), L = F, S = k);
                    S("previousSibling", F, M, v, L, O)
                }
            },
            find: {
                ID: function (v, F, O) {
                    if (typeof F.getElementById !== "undefined" && !O) return (v = F.getElementById(v[1])) && v.parentNode ? [v] : []
                },
                NAME: function (v, F) {
                    if (typeof F.getElementsByName !== "undefined") {
                        for (var O = [], L = F.getElementsByName(v[1]), M = 0, S = L.length; M < S; M++) L[M].getAttribute("name") === v[1] && O.push(L[M]);
                        return O.length === 0 ? null : O
                    }
                },
                TAG: function (v, F) {
                    if (typeof F.getElementsByTagName !== "undefined") return F.getElementsByTagName(v[1])
                }
            },
            preFilter: {
                CLASS: function (v, F, O, L, M, S) {
                    v = " " + v[1].replace(A, "") + " ";
                    if (S) return v;
                    S = 0;
                    for (var ba;
                    (ba = F[S]) != null; S++) ba && (M ^ (ba.className && (" " + ba.className + " ").replace(/[\t\n\r]/g, " ").indexOf(v) >= 0) ? O || L.push(ba) : O && (F[S] = false));
                    return false
                },
                ID: function (v) {
                    return v[1].replace(A, "")
                },
                TAG: function (v) {
                    return v[1].replace(A, "").toLowerCase()
                },
                CHILD: function (v) {
                    if (v[1] === "nth") {
                        v[2] || E.error(v[0]);
                        v[2] = v[2].replace(/^\+|\s*/g, "");
                        var F = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(v[2] === "even" && "2n" || v[2] === "odd" && "2n+1" || !/\D/.test(v[2]) && "0n+" + v[2] || v[2]);
                        v[2] = F[1] + (F[2] || 1) - 0;
                        v[3] = F[3] - 0
                    } else v[2] && E.error(v[0]);
                    v[0] = m++;
                    return v
                },
                ATTR: function (v, F, O, L, M, S) {
                    F = v[1] = v[1].replace(A, "");
                    !S && P.attrMap[F] && (v[1] = P.attrMap[F]);
                    v[4] = (v[4] || v[5] || "").replace(A, "");
                    v[2] === "~=" && (v[4] = " " + v[4] + " ");
                    return v
                },
                PSEUDO: function (v, F, O, L, M) {
                    if (v[1] === "not") if ((h.exec(v[3]) || "").length > 1 || /^\w/.test(v[3])) v[3] = E(v[3], null, null, F);
                    else {
                        v = E.filter(v[3], F, O, true ^ M);
                        O || L.push.apply(L, v);
                        return false
                    } else if (P.match.POS.test(v[0]) || P.match.CHILD.test(v[0])) return true;
                    return v
                },
                POS: function (v) {
                    v.unshift(true);
                    return v
                }
            },
            filters: {
                enabled: function (v) {
                    return v.disabled === false && v.type !== "hidden"
                },
                disabled: function (v) {
                    return v.disabled === true
                },
                checked: function (v) {
                    return v.checked === true
                },
                selected: function (v) {
                    return v.selected === true
                },
                parent: function (v) {
                    return !!v.firstChild
                },
                empty: function (v) {
                    return !v.firstChild
                },
                has: function (v, F, O) {
                    return !!E(O[3], v).length
                },
                header: function (v) {
                    return /h\d/i.test(v.nodeName)
                },
                text: function (v) {
                    return "text" === v.getAttribute("type")
                },
                radio: function (v) {
                    return "radio" === v.type
                },
                checkbox: function (v) {
                    return "checkbox" === v.type
                },
                file: function (v) {
                    return "file" === v.type
                },
                password: function (v) {
                    return "password" === v.type
                },
                submit: function (v) {
                    return "submit" === v.type
                },
                image: function (v) {
                    return "image" === v.type
                },
                reset: function (v) {
                    return "reset" === v.type
                },
                button: function (v) {
                    return "button" === v.type || v.nodeName.toLowerCase() === "button"
                },
                input: function (v) {
                    return /input|select|textarea|button/i.test(v.nodeName)
                }
            },
            setFilters: {
                first: function (v, F) {
                    return F === 0
                },
                last: function (v, F, O, L) {
                    return F === L.length - 1
                },
                even: function (v, F) {
                    return F % 2 === 0
                },
                odd: function (v, F) {
                    return F % 2 === 1
                },
                lt: function (v, F, O) {
                    return F < O[3] - 0
                },
                gt: function (v, F, O) {
                    return F > O[3] - 0
                },
                nth: function (v, F, O) {
                    return O[3] - 0 === F
                },
                eq: function (v, F, O) {
                    return O[3] - 0 === F
                }
            },
            filter: {
                PSEUDO: function (v, F, O, L) {
                    var M = F[1],
                        S = P.filters[M];
                    if (S) return S(v, O, F, L);
                    if (M === "contains") return (v.textContent || v.innerText || E.getText([v]) || "").indexOf(F[3]) >= 0;
                    if (M === "not") {
                        F = F[3];
                        O = 0;
                        for (L = F.length; O < L; O++) if (F[O] === v) return false;
                        return true
                    }
                    E.error(M)
                },
                CHILD: function (v, F) {
                    var O = F[1],
                        L = v;
                    switch (O) {
                    case "only":
                    case "first":
                        for (; L = L.previousSibling;) if (L.nodeType === 1) return false;
                        if (O === "first") return true;
                        L = v;
                    case "last":
                        for (; L = L.nextSibling;) if (L.nodeType === 1) return false;
                        return true;
                    case "nth":
                        O = F[2];
                        var M = F[3];
                        if (O === 1 && M === 0) return true;
                        var S = F[0],
                            ba = v.parentNode;
                        if (ba && (ba.sizcache !== S || !v.nodeIndex)) {
                            var Z = 0;
                            for (L = ba.firstChild; L; L = L.nextSibling) L.nodeType === 1 && (L.nodeIndex = ++Z);
                            ba.sizcache = S
                        }
                        L = v.nodeIndex - M;
                        return O === 0 ? L === 0 : L % O === 0 && L / O >= 0
                    }
                },
                ID: function (v, F) {
                    return v.nodeType === 1 && v.getAttribute("id") === F
                },
                TAG: function (v, F) {
                    return F === "*" && v.nodeType === 1 || v.nodeName.toLowerCase() === F
                },
                CLASS: function (v, F) {
                    return (" " + (v.className || v.getAttribute("class")) + " ").indexOf(F) > -1
                },
                ATTR: function (v, F) {
                    var O = F[1];
                    O = P.attrHandle[O] ? P.attrHandle[O](v) : v[O] != null ? v[O] : v.getAttribute(O);
                    var L = O + "",
                        M = F[2],
                        S = F[4];
                    return O == null ? M === "!=" : M === "=" ? L === S : M === "*=" ? L.indexOf(S) >= 0 : M === "~=" ? (" " + L + " ").indexOf(S) >= 0 : S ? M === "!=" ? L !== S : M === "^=" ? L.indexOf(S) === 0 : M === "$=" ? L.substr(L.length - S.length) === S : M === "|=" ? L === S || L.substr(0, S.length + 1) === S + "-" : false : L && O !== false
                },
                POS: function (v, F, O, L) {
                    var M = P.setFilters[F[2]];
                    if (M) return M(v, O, F, L)
                }
            }
        },
            X = P.match.POS,
            da = function (v, F) {
                return "\\" + (F - 0 + 1)
            },
            aa;
        for (aa in P.match) {
            P.match[aa] = RegExp(P.match[aa].source + /(?![^\[]*\])(?![^\(]*\))/.source);
            P.leftMatch[aa] = RegExp(/(^(?:.|\r|\n)*?)/.source + P.match[aa].source.replace(/\\(\d+)/g, da))
        }
        var ea = function (v, F) {
                v = Array.prototype.slice.call(v, 0);
                if (F) {
                    F.push.apply(F, v);
                    return F
                }
                return v
            };
        try {
            Array.prototype.slice.call(Q.documentElement.childNodes, 0)
        } catch (la) {
            ea = function (v, F) {
                var O = 0,
                    L = F || [];
                if (q.call(v) === "[object Array]") Array.prototype.push.apply(L, v);
                else if (typeof v.length === "number") for (var M = v.length; O < M; O++) L.push(v[O]);
                else for (; v[O]; O++) L.push(v[O]);
                return L
            }
        }
        var oa, ua;
        Q.documentElement.compareDocumentPosition ? oa = function (v, F) {
            if (v === F) {
                t = true;
                return 0
            }
            if (!v.compareDocumentPosition || !F.compareDocumentPosition) return v.compareDocumentPosition ? -1 : 1;
            return v.compareDocumentPosition(F) & 4 ? -1 : 1
        } : (oa = function (v, F) {
            var O, L, M = [],
                S = [];
            O = v.parentNode;
            L = F.parentNode;
            var ba = O;
            if (v === F) {
                t = true;
                return 0
            }
            if (O === L) return ua(v, F);
            if (!O) return -1;
            if (!L) return 1;
            for (; ba;) {
                M.unshift(ba);
                ba = ba.parentNode
            }
            for (ba = L; ba;) {
                S.unshift(ba);
                ba = ba.parentNode
            }
            O = M.length;
            L = S.length;
            for (ba = 0; ba < O && ba < L; ba++) if (M[ba] !== S[ba]) return ua(M[ba], S[ba]);
            return ba === O ? ua(v, S[ba], -1) : ua(M[ba], F, 1)
        }, ua = function (v, F, O) {
            if (v === F) return O;
            for (v = v.nextSibling; v;) {
                if (v === F) return -1;
                v = v.nextSibling
            }
            return 1
        });
        E.getText = function (v) {
            for (var F = "", O, L = 0; v[L]; L++) {
                O = v[L];
                O.nodeType === 3 || O.nodeType === 4 ? F += O.nodeValue : O.nodeType !== 8 && (F += E.getText(O.childNodes))
            }
            return F
        };
        (function () {
            var v = Q.createElement("div"),
                F = "script" + (new Date).getTime(),
                O = Q.documentElement;
            v.innerHTML = "<a name='" + F + "'/>";
            O.insertBefore(v, O.firstChild);
            Q.getElementById(F) && (P.find.ID = function (L, M, S) {
                if (typeof M.getElementById !== "undefined" && !S) return (M = M.getElementById(L[1])) ? M.id === L[1] || typeof M.getAttributeNode !== "undefined" && M.getAttributeNode("id").nodeValue === L[1] ? [M] : b : []
            }, P.filter.ID = function (L, M) {
                var S = typeof L.getAttributeNode !== "undefined" && L.getAttributeNode("id");
                return L.nodeType === 1 && S && S.nodeValue === M
            });
            O.removeChild(v);
            O = v = null
        })();
        (function () {
            var v = Q.createElement("div");
            v.appendChild(Q.createComment(""));
            v.getElementsByTagName("*").length > 0 && (P.find.TAG = function (F, O) {
                var L = O.getElementsByTagName(F[1]);
                if (F[1] === "*") {
                    for (var M = [], S = 0; L[S]; S++) L[S].nodeType === 1 && M.push(L[S]);
                    L = M
                }
                return L
            });
            v.innerHTML = "<a href='#'></a>";
            v.firstChild && typeof v.firstChild.getAttribute !== "undefined" && v.firstChild.getAttribute("href") !== "#" && (P.attrHandle.href = function (F) {
                return F.getAttribute("href", 2)
            });
            v = null
        })();
        Q.querySelectorAll &&
        function () {
            var v = E,
                F = Q.createElement("div");
            F.innerHTML = "<p class='TEST'></p>";
            if (!F.querySelectorAll || F.querySelectorAll(".TEST").length !== 0) {
                E = function (L, M, S, ba) {
                    M = M || Q;
                    if (!ba && !E.isXML(M)) {
                        var Z = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(L);
                        if (Z && (M.nodeType === 1 || M.nodeType === 9)) {
                            if (Z[1]) return ea(M.getElementsByTagName(L), S);
                            if (Z[2] && P.find.CLASS && M.getElementsByClassName) return ea(M.getElementsByClassName(Z[2]), S)
                        }
                        if (M.nodeType === 9) {
                            if (L === "body" && M.body) return ea([M.body], S);
                            if (Z && Z[3]) {
                                var ha = M.getElementById(Z[3]);
                                if (!ha || !ha.parentNode) return ea([], S);
                                if (ha.id === Z[3]) return ea([ha], S)
                            }
                            try {
                                return ea(M.querySelectorAll(L), S)
                            } catch (wa) {}
                        } else if (M.nodeType === 1 && M.nodeName.toLowerCase() !== "object") {
                            Z = M;
                            var va = (ha = M.getAttribute("id")) || "__sizzle__",
                                ya = M.parentNode,
                                B = /^\s*[+~]/.test(L);
                            ha ? va = va.replace(/'/g, "\\$&") : M.setAttribute("id", va);
                            B && ya && (M = M.parentNode);
                            try {
                                if (!B || ya) return ea(M.querySelectorAll("[id='" + va + "'] " + L), S)
                            } catch (N) {} finally {
                                ha || Z.removeAttribute("id")
                            }
                        }
                    }
                    return v(L, M, S, ba)
                };
                for (var O in v) E[O] = v[O];
                F = null
            }
        }();
        (function () {
            var v = Q.documentElement,
                F = v.matchesSelector || v.mozMatchesSelector || v.webkitMatchesSelector || v.msMatchesSelector,
                O = false;
            try {
                F.call(Q.documentElement, "[test!='']:sizzle")
            } catch (L) {
                O = true
            }
            F && (E.matchesSelector = function (M, S) {
                S = S.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");
                if (!E.isXML(M)) try {
                    if (O || !P.match.PSEUDO.test(S) && !/!=/.test(S)) return F.call(M, S)
                } catch (ba) {}
                return E(S, null, null, [M]).length > 0
            })
        })();
        (function () {
            var v = Q.createElement("div");
            v.innerHTML = "<div class='test e'></div><div class='test'></div>";
            if (v.getElementsByClassName && v.getElementsByClassName("e").length !== 0) {
                v.lastChild.className = "e";
                if (v.getElementsByClassName("e").length !== 1) {
                    P.order.splice(1, 0, "CLASS");
                    P.find.CLASS = function (F, O, L) {
                        if (typeof O.getElementsByClassName !== "undefined" && !L) return O.getElementsByClassName(F[1])
                    };
                    v = null
                }
            }
        })();
        Q.documentElement.contains ? E.contains = function (v, F) {
            return v !== F && (v.contains ? v.contains(F) : true)
        } : Q.documentElement.compareDocumentPosition ? E.contains = function (v, F) {
            return !!(v.compareDocumentPosition(F) & 16)
        } : E.contains = function () {
            return false
        };
        E.isXML = function (v) {
            return (v = (v ? v.ownerDocument || v : 0).documentElement) ? v.nodeName !== "HTML" : false
        };
        var sa = function (v, F) {
                for (var O, L = [], M = "", S = F.nodeType ? [F] : F; O = P.match.PSEUDO.exec(v);) {
                    M += O[0];
                    v = v.replace(P.match.PSEUDO, "")
                }
                v = P.relative[v] ? v + "*" : v;
                O = 0;
                for (var ba = S.length; O < ba; O++) E(v, S[O], L);
                return E.filter(M, L)
            };
        l.find = E;
        l.expr = E.selectors;
        l.expr[":"] = l.expr.filters;
        l.unique = E.uniqueSort;
        l.text = E.getText;
        l.isXMLDoc = E.isXML;
        l.contains = E.contains
    })();
    var Kb = /Until$/,
        Ca = /^(?:parents|prevUntil|prevAll)/,
        Wa = /,/,
        Gb = /^.[^:#\[\.,]*$/,
        Ja = Array.prototype.slice,
        Xa = l.expr.match.POS,
        Sb = {
            children: true,
            contents: true,
            next: true,
            prev: true
        };
    l.fn.extend({
        find: function (f) {
            for (var k = this.pushStack("", "find", f), h = 0, m = 0, q = this.length; m < q; m++) {
                h = k.length;
                l.find(f, this[m], k);
                if (m > 0) for (var t = h; t < k.length; t++) for (var w = 0; w < h; w++) if (k[w] === k[t]) {
                    k.splice(t--, 1);
                    break
                }
            }
            return k
        },
        has: function (f) {
            var k = l(f);
            return this.filter(function () {
                for (var h = 0, m = k.length; h < m; h++) if (l.contains(this, k[h])) return true
            })
        },
        not: function (f) {
            return this.pushStack(I(this, f, false), "not", f)
        },
        filter: function (f) {
            return this.pushStack(I(this, f, true), "filter", f)
        },
        is: function (f) {
            return !!f && l.filter(f, this).length > 0
        },
        closest: function (f, k) {
            var h = [],
                m, q, t = this[0];
            if (l.isArray(f)) {
                var w, A = {},
                    D = 1;
                if (t && f.length) {
                    m = 0;
                    for (q = f.length; m < q; m++) {
                        w = f[m];
                        A[w] || (A[w] = l.expr.match.POS.test(w) ? l(w, k || this.context) : w)
                    }
                    for (; t && t.ownerDocument && t !== k;) {
                        for (w in A) {
                            m = A[w];
                            (m.jquery ? m.index(t) > -1 : l(t).is(m)) && h.push({
                                selector: w,
                                elem: t,
                                level: D
                            })
                        }
                        t = t.parentNode;
                        D++
                    }
                }
                return h
            }
            w = Xa.test(f) ? l(f, k || this.context) : null;
            m = 0;
            for (q = this.length; m < q; m++) for (t = this[m]; t;) {
                if (w ? w.index(t) > -1 : l.find.matchesSelector(t, f)) {
                    h.push(t);
                    break
                }
                t = t.parentNode;
                if (!t || !t.ownerDocument || t === k) break
            }
            h = h.length > 1 ? l.unique(h) : h;
            return this.pushStack(h, "closest", f)
        },
        index: function (f) {
            if (!f || typeof f === "string") return l.inArray(this[0], f ? l(f) : this.parent().children());
            return l.inArray(f.jquery ? f[0] : f, this)
        },
        add: function (f, k) {
            var h = typeof f === "string" ? l(f, k) : l.makeArray(f),
                m = l.merge(this.get(), h);
            return this.pushStack(!h[0] || !h[0].parentNode || h[0].parentNode.nodeType === 11 || !m[0] || !m[0].parentNode || m[0].parentNode.nodeType === 11 ? m : l.unique(m))
        },
        andSelf: function () {
            return this.add(this.prevObject)
        }
    });
    l.each({
        parent: function (f) {
            return (f = f.parentNode) && f.nodeType !== 11 ? f : null
        },
        parents: function (f) {
            return l.dir(f, "parentNode")
        },
        parentsUntil: function (f, k, h) {
            return l.dir(f, "parentNode", h)
        },
        next: function (f) {
            return l.nth(f, 2, "nextSibling")
        },
        prev: function (f) {
            return l.nth(f, 2, "previousSibling")
        },
        nextAll: function (f) {
            return l.dir(f, "nextSibling")
        },
        prevAll: function (f) {
            return l.dir(f, "previousSibling")
        },
        nextUntil: function (f, k, h) {
            return l.dir(f, "nextSibling", h)
        },
        prevUntil: function (f, k, h) {
            return l.dir(f, "previousSibling", h)
        },
        siblings: function (f) {
            return l.sibling(f.parentNode.firstChild, f)
        },
        children: function (f) {
            return l.sibling(f.firstChild)
        },
        contents: function (f) {
            return l.nodeName(f, "iframe") ? f.contentDocument || f.contentWindow.document : l.makeArray(f.childNodes)
        }
    }, function (f, k) {
        l.fn[f] = function (h, m) {
            var q = l.map(this, k, h),
                t = Ja.call(arguments);
            Kb.test(f) || (m = h);
            m && typeof m === "string" && (q = l.filter(m, q));
            q = this.length > 1 && !Sb[f] ? l.unique(q) : q;
            (this.length > 1 || Wa.test(m)) && Ca.test(f) && (q = q.reverse());
            return this.pushStack(q, f, t.join(","))
        }
    });
    l.extend({
        filter: function (f, k, h) {
            h && (f = ":not(" + f + ")");
            return k.length === 1 ? l.find.matchesSelector(k[0], f) ? [k[0]] : [] : l.find.matches(f, k)
        },
        dir: function (f, k, h) {
            var m = [];
            for (f = f[k]; f && f.nodeType !== 9 && (h === b || f.nodeType !== 1 || !l(f).is(h));) {
                f.nodeType === 1 && m.push(f);
                f = f[k]
            }
            return m
        },
        nth: function (f, k, h) {
            k = k || 1;
            for (var m = 0; f; f = f[h]) if (f.nodeType === 1 && ++m === k) break;
            return f
        },
        sibling: function (f, k) {
            for (var h = []; f; f = f.nextSibling) f.nodeType === 1 && f !== k && h.push(f);
            return h
        }
    });
    var Lb = / jQuery\d+="(?:\d+|null)"/g,
        cb = /^\s+/,
        pa = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        Pa = /<([\w:]+)/,
        za = /<tbody/i,
        yb = /<|&#?\w+;/,
        Qa = /<(?:script|object|embed|option|style)/i,
        ja = /checked\s*(?:[^=]|=\s*.checked.)/i,
        Aa = {
            option: [1, "<select multiple='multiple'>", "</select>"],
            legend: [1, "<fieldset>", "</fieldset>"],
            thead: [1, "<table>", "</table>"],
            tr: [2, "<table><tbody>", "</tbody></table>"],
            td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
            col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
            area: [1, "<map>", "</map>"],
            _default: [0, "", ""]
        };
    Aa.optgroup = Aa.option;
    Aa.tbody = Aa.tfoot = Aa.colgroup = Aa.caption = Aa.thead;
    Aa.th = Aa.td;
    l.support.htmlSerialize || (Aa._default = [1, "div<div>", "</div>"]);
    l.fn.extend({
        text: function (f) {
            if (l.isFunction(f)) return this.each(function (k) {
                var h = l(this);
                h.text(f.call(this, k, h.text()))
            });
            if (typeof f !== "object" && f !== b) return this.empty().append((this[0] && this[0].ownerDocument || Q).createTextNode(f));
            return l.text(this)
        },
        wrapAll: function (f) {
            if (l.isFunction(f)) return this.each(function (h) {
                l(this).wrapAll(f.call(this, h))
            });
            if (this[0]) {
                var k = l(f, this[0].ownerDocument).eq(0).clone(true);
                this[0].parentNode && k.insertBefore(this[0]);
                k.map(function () {
                    for (var h = this; h.firstChild && h.firstChild.nodeType === 1;) h = h.firstChild;
                    return h
                }).append(this)
            }
            return this
        },
        wrapInner: function (f) {
            if (l.isFunction(f)) return this.each(function (k) {
                l(this).wrapInner(f.call(this, k))
            });
            return this.each(function () {
                var k = l(this),
                    h = k.contents();
                h.length ? h.wrapAll(f) : k.append(f)
            })
        },
        wrap: function (f) {
            return this.each(function () {
                l(this).wrapAll(f)
            })
        },
        unwrap: function () {
            return this.parent().each(function () {
                l.nodeName(this, "body") || l(this).replaceWith(this.childNodes)
            }).end()
        },
        append: function () {
            return this.domManip(arguments, true, function (f) {
                this.nodeType === 1 && this.appendChild(f)
            })
        },
        prepend: function () {
            return this.domManip(arguments, true, function (f) {
                this.nodeType === 1 && this.insertBefore(f, this.firstChild)
            })
        },
        before: function () {
            if (this[0] && this[0].parentNode) return this.domManip(arguments, false, function (k) {
                this.parentNode.insertBefore(k, this)
            });
            if (arguments.length) {
                var f = l(arguments[0]);
                f.push.apply(f, this.toArray());
                return this.pushStack(f, "before", arguments)
            }
        },
        after: function () {
            if (this[0] && this[0].parentNode) return this.domManip(arguments, false, function (k) {
                this.parentNode.insertBefore(k, this.nextSibling)
            });
            if (arguments.length) {
                var f = this.pushStack(this, "after", arguments);
                f.push.apply(f, l(arguments[0]).toArray());
                return f
            }
        },
        remove: function (f, k) {
            for (var h = 0, m;
            (m = this[h]) != null; h++) if (!f || l.filter(f, [m]).length) {
                !k && m.nodeType === 1 && (l.cleanData(m.getElementsByTagName("*")), l.cleanData([m]));
                m.parentNode && m.parentNode.removeChild(m)
            }
            return this
        },
        empty: function () {
            for (var f = 0, k;
            (k = this[f]) != null; f++) for (k.nodeType === 1 && l.cleanData(k.getElementsByTagName("*")); k.firstChild;) k.removeChild(k.firstChild);
            return this
        },
        clone: function (f, k) {
            f = f == null ? false : f;
            k = k == null ? f : k;
            return this.map(function () {
                return l.clone(this, f, k)
            })
        },
        html: function (f) {
            if (f === b) return this[0] && this[0].nodeType === 1 ? this[0].innerHTML.replace(Lb, "") : null;
            if (typeof f !== "string" || Qa.test(f) || !l.support.leadingWhitespace && cb.test(f) || Aa[(Pa.exec(f) || ["", ""])[1].toLowerCase()]) l.isFunction(f) ? this.each(function (q) {
                var t = l(this);
                t.html(f.call(this, q, t.html()))
            }) : this.empty().append(f);
            else {
                f = f.replace(pa, "<$1></$2>");
                try {
                    for (var k = 0, h = this.length; k < h; k++) this[k].nodeType === 1 && (l.cleanData(this[k].getElementsByTagName("*")), this[k].innerHTML = f)
                } catch (m) {
                    this.empty().append(f)
                }
            }
            return this
        },
        replaceWith: function (f) {
            if (this[0] && this[0].parentNode) {
                if (l.isFunction(f)) return this.each(function (k) {
                    var h = l(this),
                        m = h.html();
                    h.replaceWith(f.call(this, k, m))
                });
                typeof f !== "string" && (f = l(f).detach());
                return this.each(function () {
                    var k = this.nextSibling,
                        h = this.parentNode;
                    l(this).remove();
                    k ? l(k).before(f) : l(h).append(f)
                })
            }
            return this.pushStack(l(l.isFunction(f) ? f() : f), "replaceWith", f)
        },
        detach: function (f) {
            return this.remove(f, true)
        },
        domManip: function (f, k, h) {
            var m, q, t, w = f[0],
                A = [];
            if (!l.support.checkClone && arguments.length === 3 && typeof w === "string" && ja.test(w)) return this.each(function () {
                l(this).domManip(f, k, h, true)
            });
            if (l.isFunction(w)) return this.each(function (P) {
                var X = l(this);
                f[0] = w.call(this, P, k ? X.html() : b);
                X.domManip(f, k, h)
            });
            if (this[0]) {
                t = w && w.parentNode;
                l.support.parentNode && t && t.nodeType === 11 && t.childNodes.length === this.length ? m = {
                    fragment: t
                } : m = l.buildFragment(f, this, A);
                t = m.fragment;
                t.childNodes.length === 1 ? q = t = t.firstChild : q = t.firstChild;
                if (q) {
                    k = k && l.nodeName(q, "tr");
                    q = 0;
                    for (var D = this.length, E = D - 1; q < D; q++) h.call(k ? l.nodeName(this[q], "table") ? this[q].getElementsByTagName("tbody")[0] || this[q].appendChild(this[q].ownerDocument.createElement("tbody")) : this[q] : this[q], m.cacheable || D > 1 && q < E ? l.clone(t, true, true) : t)
                }
                A.length && l.each(A, s)
            }
            return this
        }
    });
    l.buildFragment = function (f, k, h) {
        var m, q, t;
        k = k && k[0] ? k[0].ownerDocument || k[0] : Q;
        f.length === 1 && typeof f[0] === "string" && f[0].length < 512 && k === Q && f[0].charAt(0) === "<" && !Qa.test(f[0]) && (l.support.checkClone || !ja.test(f[0])) && (q = true, t = l.fragments[f[0]], t && t !== 1 && (m = t));
        m || (m = k.createDocumentFragment(), l.clean(f, k, m, h));
        q && (l.fragments[f[0]] = t ? m : 1);
        return {
            fragment: m,
            cacheable: q
        }
    };
    l.fragments = {};
    l.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function (f, k) {
        l.fn[f] = function (h) {
            var m = [];
            h = l(h);
            var q = this.length === 1 && this[0].parentNode;
            if (q && q.nodeType === 11 && q.childNodes.length === 1 && h.length === 1) {
                h[k](this[0]);
                return this
            }
            q = 0;
            for (var t = h.length; q < t; q++) {
                var w = (q > 0 ? this.clone(true) : this).get();
                l(h[q])[k](w);
                m = m.concat(w)
            }
            return this.pushStack(m, f, h.selector)
        }
    });
    l.extend({
        clone: function (f, k, h) {
            var m = f.cloneNode(true),
                q, t, w;
            if ((!l.support.noCloneEvent || !l.support.noCloneChecked) && (f.nodeType === 1 || f.nodeType === 11) && !l.isXMLDoc(f)) {
                x(f, m);
                q = u(f);
                t = u(m);
                for (w = 0; q[w]; ++w) x(q[w], t[w])
            }
            if (k) {
                y(f, m);
                if (h) {
                    q = u(f);
                    t = u(m);
                    for (w = 0; q[w]; ++w) y(q[w], t[w])
                }
            }
            return m
        },
        clean: function (f, k, h, m) {
            k = k || Q;
            typeof k.createElement === "undefined" && (k = k.ownerDocument || k[0] && k[0].ownerDocument || Q);
            for (var q = [], t = 0, w;
            (w = f[t]) != null; t++) {
                typeof w === "number" && (w += "");
                if (w) {
                    if (typeof w !== "string" || yb.test(w)) {
                        if (typeof w === "string") {
                            w = w.replace(pa, "<$1></$2>");
                            var A = (Pa.exec(w) || ["", ""])[1].toLowerCase(),
                                D = Aa[A] || Aa._default,
                                E = D[0],
                                P = k.createElement("div");
                            for (P.innerHTML = D[1] + w + D[2]; E--;) P = P.lastChild;
                            if (!l.support.tbody) {
                                E = za.test(w);
                                A = A === "table" && !E ? P.firstChild && P.firstChild.childNodes : D[1] === "<table>" && !E ? P.childNodes : [];
                                for (D = A.length - 1; D >= 0; --D) l.nodeName(A[D], "tbody") && !A[D].childNodes.length && A[D].parentNode.removeChild(A[D])
                            }!l.support.leadingWhitespace && cb.test(w) && P.insertBefore(k.createTextNode(cb.exec(w)[0]), P.firstChild);
                            w = P.childNodes
                        }
                    } else w = k.createTextNode(w);
                    w.nodeType ? q.push(w) : q = l.merge(q, w)
                }
            }
            if (h) for (t = 0; q[t]; t++)!m || !l.nodeName(q[t], "script") || q[t].type && q[t].type.toLowerCase() !== "text/javascript" ? (q[t].nodeType === 1 && q.splice.apply(q, [t + 1, 0].concat(l.makeArray(q[t].getElementsByTagName("script")))), h.appendChild(q[t])) : m.push(q[t].parentNode ? q[t].parentNode.removeChild(q[t]) : q[t]);
            return q
        },
        cleanData: function (f) {
            for (var k, h, m = l.cache, q = l.expando, t = l.event.special, w = l.support.deleteExpando, A = 0, D;
            (D = f[A]) != null; A++) if (!(D.nodeName && l.noData[D.nodeName.toLowerCase()])) if (h = D[l.expando]) {
                if ((k = m[h] && m[h][q]) && k.events) {
                    for (var E in k.events) t[E] ? l.event.remove(D, E) : l.removeEvent(D, E, k.handle);
                    k.handle && (k.handle.elem = null)
                }
                w ? delete D[l.expando] : D.removeAttribute && D.removeAttribute(l.expando);
                delete m[h]
            }
        }
    });
    var db = /alpha\([^)]*\)/i,
        Tb = /opacity=([^)]*)/,
        Pb = /-([a-z])/ig,
        qb = /([A-Z])/g,
        Mb = /^-?\d+(?:px)?$/i,
        Nb = /^-?\d/,
        Ub = {
            position: "absolute",
            visibility: "hidden",
            display: "block"
        },
        wb = ["Left", "Right"],
        xb = ["Top", "Bottom"],
        Ya, Ma, eb, Vb = function (f, k) {
            return k.toUpperCase()
        };
    l.fn.css = function (f, k) {
        if (arguments.length === 2 && k === b) return this;
        return l.access(this, f, k, true, function (h, m, q) {
            return q !== b ? l.style(h, m, q) : l.css(h, m)
        })
    };
    l.extend({
        cssHooks: {
            opacity: {
                get: function (f, k) {
                    if (k) {
                        var h = Ya(f, "opacity", "opacity");
                        return h === "" ? "1" : h
                    }
                    return f.style.opacity
                }
            }
        },
        cssNumber: {
            zIndex: true,
            fontWeight: true,
            opacity: true,
            zoom: true,
            lineHeight: true
        },
        cssProps: {
            "float": l.support.cssFloat ? "cssFloat" : "styleFloat"
        },
        style: function (f, k, h, m) {
            if (f && f.nodeType !== 3 && f.nodeType !== 8 && f.style) {
                var q, t = l.camelCase(k),
                    w = f.style,
                    A = l.cssHooks[t];
                k = l.cssProps[t] || t;
                if (h === b) {
                    if (A && "get" in A && (q = A.get(f, false, m)) !== b) return q;
                    return w[k]
                }
                if (!(typeof h === "number" && isNaN(h) || h == null)) {
                    typeof h === "number" && !l.cssNumber[t] && (h += "px");
                    if (!A || !("set" in A) || (h = A.set(f, h)) !== b) try {
                        w[k] = h
                    } catch (D) {}
                }
            }
        },
        css: function (f, k, h) {
            var m, q = l.camelCase(k),
                t = l.cssHooks[q];
            k = l.cssProps[q] || q;
            if (t && "get" in t && (m = t.get(f, true, h)) !== b) return m;
            if (Ya) return Ya(f, k, q)
        },
        swap: function (f, k, h) {
            var m = {},
                q;
            for (q in k) {
                m[q] = f.style[q];
                f.style[q] = k[q]
            }
            h.call(f);
            for (q in k) f.style[q] = m[q]
        },
        camelCase: function (f) {
            return f.replace(Pb, Vb)
        }
    });
    l.curCSS = l.css;
    l.each(["height", "width"], function (f, k) {
        l.cssHooks[k] = {
            get: function (h, m, q) {
                var t;
                if (m) {
                    h.offsetWidth !== 0 ? t = r(h, k, q) : l.swap(h, Ub, function () {
                        t = r(h, k, q)
                    });
                    if (t <= 0) {
                        t = Ya(h, k, k);
                        t === "0px" && eb && (t = eb(h, k, k));
                        if (t != null) return t === "" || t === "auto" ? "0px" : t
                    }
                    if (t < 0 || t == null) {
                        t = h.style[k];
                        return t === "" || t === "auto" ? "0px" : t
                    }
                    return typeof t === "string" ? t : t + "px"
                }
            },
            set: function (h, m) {
                if (!Mb.test(m)) return m;
                m = parseFloat(m);
                if (m >= 0) return m + "px"
            }
        }
    });
    l.support.opacity || (l.cssHooks.opacity = {
        get: function (f, k) {
            return Tb.test((k && f.currentStyle ? f.currentStyle.filter : f.style.filter) || "") ? parseFloat(RegExp.$1) / 100 + "" : k ? "1" : ""
        },
        set: function (f, k) {
            var h = f.style;
            h.zoom = 1;
            var m = l.isNaN(k) ? "" : "alpha(opacity=" + k * 100 + ")",
                q = h.filter || "";
            h.filter = db.test(q) ? q.replace(db, m) : h.filter + " " + m
        }
    });
    Q.defaultView && Q.defaultView.getComputedStyle && (Ma = function (f, k, h) {
        var m;
        h = h.replace(qb, "-$1").toLowerCase();
        if (!(k = f.ownerDocument.defaultView)) return b;
        if (k = k.getComputedStyle(f, null)) {
            m = k.getPropertyValue(h);
            m === "" && !l.contains(f.ownerDocument.documentElement, f) && (m = l.style(f, h))
        }
        return m
    });
    Q.documentElement.currentStyle && (eb = function (f, k) {
        var h, m = f.currentStyle && f.currentStyle[k],
            q = f.runtimeStyle && f.runtimeStyle[k],
            t = f.style;
        !Mb.test(m) && Nb.test(m) && (h = t.left, q && (f.runtimeStyle.left = f.currentStyle.left), t.left = k === "fontSize" ? "1em" : m || 0, m = t.pixelLeft + "px", t.left = h, q && (f.runtimeStyle.left = q));
        return m === "" ? "auto" : m
    });
    Ya = Ma || eb;
    l.expr && l.expr.filters && (l.expr.filters.hidden = function (f) {
        var k = f.offsetHeight;
        return f.offsetWidth === 0 && k === 0 || !l.support.reliableHiddenOffsets && (f.style.display || l.css(f, "display")) === "none"
    }, l.expr.filters.visible = function (f) {
        return !l.expr.filters.hidden(f)
    });
    var Ea = /%20/g,
        vb = /\[\]$/,
        Ob = /\r?\n/g,
        Wb = /#.*$/,
        rb = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg,
        zb = /^(?:color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
        fb = /^(?:GET|HEAD)$/,
        sb = /^\/\//,
        Ab = /\?/,
        Fa = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        Za = /^(?:select|textarea)/i,
        Ia = /\s+/,
        $a = /([?&])_=[^&]*/,
        xa = /(^|\-)([a-z])/g,
        Ka = function (f, k, h) {
            return k + h.toUpperCase()
        },
        gb = /^([\w\+\.\-]+:)\/\/([^\/?#:]*)(?::(\d+))?/,
        Bb = l.fn.load,
        Ha = {},
        tb = {},
        La, Ga;
    try {
        La = Q.location.href
    } catch (Qb) {
        La = Q.createElement("a");
        La.href = "";
        La = La.href
    }
    Ga = gb.exec(La.toLowerCase());
    l.fn.extend({
        load: function (f, k, h) {
            if (typeof f !== "string" && Bb) return Bb.apply(this, arguments);
            if (!this.length) return this;
            var m = f.indexOf(" ");
            if (m >= 0) {
                var q = f.slice(m, f.length);
                f = f.slice(0, m)
            }
            m = "GET";
            k && (l.isFunction(k) ? (h = k, k = b) : typeof k === "object" && (k = l.param(k, l.ajaxSettings.traditional), m = "POST"));
            var t = this;
            l.ajax({
                url: f,
                type: m,
                dataType: "html",
                data: k,
                complete: function (w, A, D) {
                    D = w.responseText;
                    w.isResolved() && (w.done(function (E) {
                        D = E
                    }), t.html(q ? l("<div>").append(D.replace(Fa, "")).find(q) : D));
                    h && t.each(h, [D, A, w])
                }
            });
            return this
        },
        serialize: function () {
            return l.param(this.serializeArray())
        },
        serializeArray: function () {
            return this.map(function () {
                return this.elements ? l.makeArray(this.elements) : this
            }).filter(function () {
                return this.name && !this.disabled && (this.checked || Za.test(this.nodeName) || zb.test(this.type))
            }).map(function (f, k) {
                var h = l(this).val();
                return h == null ? null : l.isArray(h) ? l.map(h, function (m) {
                    return {
                        name: k.name,
                        value: m.replace(Ob, "\r\n")
                    }
                }) : {
                    name: k.name,
                    value: h.replace(Ob, "\r\n")
                }
            }).get()
        }
    });
    l.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "), function (f, k) {
        l.fn[k] = function (h) {
            return this.bind(k, h)
        }
    });
    l.each(["get", "post"], function (f, k) {
        l[k] = function (h, m, q, t) {
            l.isFunction(m) && (t = t || q, q = m, m = b);
            return l.ajax({
                type: k,
                url: h,
                data: m,
                success: q,
                dataType: t
            })
        }
    });
    l.extend({
        getScript: function (f, k) {
            return l.get(f, b, k, "script")
        },
        getJSON: function (f, k, h) {
            return l.get(f, k, h, "json")
        },
        ajaxSetup: function (f, k) {
            k ? l.extend(true, f, l.ajaxSettings, k) : (k = f, f = l.extend(true, l.ajaxSettings, k));
            for (var h in {
                context: 1,
                url: 1
            }) h in k ? f[h] = k[h] : h in l.ajaxSettings && (f[h] = l.ajaxSettings[h]);
            return f
        },
        ajaxSettings: {
            url: La,
            isLocal: /(?:^file|^widget|\-extension):$/.test(Ga[1]),
            global: true,
            type: "GET",
            contentType: "application/x-www-form-urlencoded",
            processData: true,
            async: true,
            accepts: {
                xml: "application/xml, text/xml",
                html: "text/html",
                text: "text/plain",
                json: "application/json, text/javascript",
                "*": "*/*"
            },
            contents: {
                xml: /xml/,
                html: /html/,
                json: /json/
            },
            responseFields: {
                xml: "responseXML",
                text: "responseText"
            },
            converters: {
                "* text": a.String,
                "text html": true,
                "text json": l.parseJSON,
                "text xml": l.parseXML
            }
        },
        ajaxPrefilter: o(Ha),
        ajaxTransport: o(tb),
        ajax: function (f, k) {
            function h(L, M, S, ba) {
                if (oa !== 2) {
                    oa = 2;
                    ea && clearTimeout(ea);
                    aa = b;
                    X = ba || "";
                    v.readyState = L ? 4 : 0;
                    var Z, ha, wa;
                    if (S) {
                        ba = m;
                        var va = v,
                            ya = ba.contents,
                            B = ba.dataTypes,
                            N = ba.responseFields,
                            T, W, fa, ia;
                        for (W in N) W in S && (va[N[W]] = S[W]);
                        for (; B[0] === "*";) {
                            B.shift();
                            T === b && (T = ba.mimeType || va.getResponseHeader("content-type"))
                        }
                        if (T) for (W in ya) if (ya[W] && ya[W].test(T)) {
                            B.unshift(W);
                            break
                        }
                        if (B[0] in S) fa = B[0];
                        else {
                            for (W in S) {
                                if (!B[0] || ba.converters[W + " " + B[0]]) {
                                    fa = W;
                                    break
                                }
                                ia || (ia = W)
                            }
                            fa = fa || ia
                        }
                        if (fa) {
                            fa !== B[0] && B.unshift(fa);
                            S = S[fa]
                        } else S = void 0
                    } else S = b;
                    if (L >= 200 && L < 300 || L === 304) {
                        if (m.ifModified) {
                            if (T = v.getResponseHeader("Last-Modified")) l.lastModified[E] = T;
                            if (T = v.getResponseHeader("Etag")) l.etag[E] = T
                        }
                        if (L === 304) {
                            M = "notmodified";
                            Z = true
                        } else try {
                            T = m;
                            T.dataFilter && (S = T.dataFilter(S, T.dataType));
                            var ma = T.dataTypes;
                            W = {};
                            var ra, Ba, Ua = ma.length,
                                Va, hb = ma[0],
                                Cb, Xb, ib, ub, Db;
                            for (ra = 1; ra < Ua; ra++) {
                                if (ra === 1) for (Ba in T.converters) typeof Ba === "string" && (W[Ba.toLowerCase()] = T.converters[Ba]);
                                Cb = hb;
                                hb = ma[ra];
                                if (hb === "*") hb = Cb;
                                else if (Cb !== "*" && Cb !== hb) {
                                    Xb = Cb + " " + hb;
                                    ib = W[Xb] || W["* " + hb];
                                    if (!ib) {
                                        Db = b;
                                        for (ub in W) {
                                            Va = ub.split(" ");
                                            if (Va[0] === Cb || Va[0] === "*") if (Db = W[Va[1] + " " + hb]) {
                                                ub = W[ub];
                                                ub === true ? ib = Db : Db === true && (ib = ub);
                                                break
                                            }
                                        }
                                    }!ib && !Db && l.error("No conversion from " + Xb.replace(" ", " to "));
                                    ib !== true && (S = ib ? ib(S) : Db(ub(S)))
                                }
                            }
                            ha = S;
                            M = "success";
                            Z = true
                        } catch ($b) {
                            M = "parsererror";
                            wa = $b
                        }
                    } else {
                        wa = M;
                        if (!M || L) {
                            M = "error";
                            L < 0 && (L = 0)
                        }
                    }
                    v.status = L;
                    v.statusText = M;
                    Z ? w.resolveWith(q, [ha, M, v]) : w.rejectWith(q, [v, M, wa]);
                    v.statusCode(D);
                    D = b;
                    ua && t.trigger("ajax" + (Z ? "Success" : "Error"), [v, m, Z ? ha : wa]);
                    A.resolveWith(q, [v, M]);
                    ua && (t.trigger("ajaxComplete", [v, m]), --l.active || l.event.trigger("ajaxStop"))
                }
            }
            typeof f === "object" && (k = f, f = b);
            k = k || {};
            var m = l.ajaxSetup({}, k),
                q = m.context || m,
                t = q !== m && (q.nodeType || q instanceof l) ? l(q) : l.event,
                w = l.Deferred(),
                A = l._Deferred(),
                D = m.statusCode || {},
                E, P = {},
                X, da, aa, ea, la, oa = 0,
                ua, sa, v = {
                    readyState: 0,
                    setRequestHeader: function (L, M) {
                        oa || (P[L.toLowerCase().replace(xa, Ka)] = M);
                        return this
                    },
                    getAllResponseHeaders: function () {
                        return oa === 2 ? X : null
                    },
                    getResponseHeader: function (L) {
                        var M;
                        if (oa === 2) {
                            if (!da) for (da = {}; M = rb.exec(X);) da[M[1].toLowerCase()] = M[2];
                            M = da[L.toLowerCase()]
                        }
                        return M === b ? null : M
                    },
                    overrideMimeType: function (L) {
                        oa || (m.mimeType = L);
                        return this
                    },
                    abort: function (L) {
                        L = L || "abort";
                        aa && aa.abort(L);
                        h(0, L);
                        return this
                    }
                };
            w.promise(v);
            v.success = v.done;
            v.error = v.fail;
            v.complete = A.done;
            v.statusCode = function (L) {
                if (L) {
                    var M;
                    if (oa < 2) for (M in L) D[M] = [D[M], L[M]];
                    else {
                        M = L[v.status];
                        v.then(M, M)
                    }
                }
                return this
            };
            m.url = ((f || m.url) + "").replace(Wb, "").replace(sb, Ga[1] + "//");
            m.dataTypes = l.trim(m.dataType || "*").toLowerCase().split(Ia);
            m.crossDomain || (la = gb.exec(m.url.toLowerCase()), m.crossDomain = la && (la[1] != Ga[1] || la[2] != Ga[2] || (la[3] || (la[1] === "http:" ? 80 : 443)) != (Ga[3] || (Ga[1] === "http:" ? 80 : 443))));
            m.data && m.processData && typeof m.data !== "string" && (m.data = l.param(m.data, m.traditional));
            p(Ha, m, k, v);
            if (oa === 2) return false;
            ua = m.global;
            m.type = m.type.toUpperCase();
            m.hasContent = !fb.test(m.type);
            ua && l.active++ === 0 && l.event.trigger("ajaxStart");
            if (!m.hasContent) {
                m.data && (m.url += (Ab.test(m.url) ? "&" : "?") + m.data);
                E = m.url;
                if (m.cache === false) {
                    la = l.now();
                    var F = m.url.replace($a, "$1_=" + la);
                    m.url = F + (F === m.url ? (Ab.test(m.url) ? "&" : "?") + "_=" + la : "")
                }
            }
            if (m.data && m.hasContent && m.contentType !== false || k.contentType) P["Content-Type"] = m.contentType;
            m.ifModified && (E = E || m.url, l.lastModified[E] && (P["If-Modified-Since"] = l.lastModified[E]), l.etag[E] && (P["If-None-Match"] = l.etag[E]));
            P.Accept = m.dataTypes[0] && m.accepts[m.dataTypes[0]] ? m.accepts[m.dataTypes[0]] + (m.dataTypes[0] !== "*" ? ", */*; q=0.01" : "") : m.accepts["*"];
            for (sa in m.headers) v.setRequestHeader(sa, m.headers[sa]);
            if (m.beforeSend && (m.beforeSend.call(q, v, m) === false || oa === 2)) {
                v.abort();
                return false
            }
            for (sa in {
                success: 1,
                error: 1,
                complete: 1
            }) v[sa](m[sa]);
            if (aa = p(tb, m, k, v)) {
                v.readyState = 1;
                ua && t.trigger("ajaxSend", [v, m]);
                m.async && m.timeout > 0 && (ea = setTimeout(function () {
                    v.abort("timeout")
                }, m.timeout));
                try {
                    oa = 1;
                    aa.send(P, h)
                } catch (O) {
                    status < 2 ? h(-1, O) : l.error(O)
                }
            } else h(-1, "No Transport");
            return v
        },
        param: function (f, k) {
            var h = [],
                m = function (t, w) {
                    w = l.isFunction(w) ? w() : w;
                    h[h.length] = encodeURIComponent(t) + "=" + encodeURIComponent(w)
                };
            k === b && (k = l.ajaxSettings.traditional);
            if (l.isArray(f) || f.jquery && !l.isPlainObject(f)) l.each(f, function () {
                m(this.name, this.value)
            });
            else for (var q in f) n(q, f[q], k, m);
            return h.join("&").replace(Ea, "+")
        }
    });
    l.extend({
        active: 0,
        lastModified: {},
        etag: {}
    });
    var jb = l.now(),
        Ra = /(\=)\?(&|$)|()\?\?()/i;
    l.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function () {
            return l.expando + "_" + jb++
        }
    });
    l.ajaxPrefilter("json jsonp", function (f, k, h) {
        var m = typeof f.data === "string";
        if (f.dataTypes[0] === "jsonp" || k.jsonpCallback || k.jsonp != null || f.jsonp !== false && (Ra.test(f.url) || m && Ra.test(f.data))) {
            var q, t = f.jsonpCallback = l.isFunction(f.jsonpCallback) ? f.jsonpCallback() : f.jsonpCallback,
                w = a[t];
            k = f.url;
            var A = f.data,
                D = "$1" + t + "$2",
                E = function () {
                    a[t] = w;
                    q && l.isFunction(w) && a[t](q[0])
                };
            f.jsonp !== false && (k = k.replace(Ra, D), f.url === k && (m && (A = A.replace(Ra, D)), f.data === A && (k += (/\?/.test(k) ? "&" : "?") + f.jsonp + "=" + t)));
            f.url = k;
            f.data = A;
            a[t] = function (P) {
                q = [P]
            };
            h.then(E, E);
            f.converters["script json"] = function () {
                q || l.error(t + " was not called");
                return q[0]
            };
            f.dataTypes[0] = "json";
            return "script"
        }
    });
    l.ajaxSetup({
        accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },
        contents: {
            script: /javascript|ecmascript/
        },
        converters: {
            "text script": function (f) {
                l.globalEval(f);
                return f
            }
        }
    });
    l.ajaxPrefilter("script", function (f) {
        f.cache === b && (f.cache = false);
        f.crossDomain && (f.type = "GET", f.global = false)
    });
    l.ajaxTransport("script", function (f) {
        if (f.crossDomain) {
            var k, h = Q.head || Q.getElementsByTagName("head")[0] || Q.documentElement;
            return {
                send: function (m, q) {
                    k = Q.createElement("script");
                    k.async = "async";
                    f.scriptCharset && (k.charset = f.scriptCharset);
                    k.src = f.url;
                    k.onload = k.onreadystatechange = function (t, w) {
                        if (!k.readyState || /loaded|complete/.test(k.readyState)) {
                            k.onload = k.onreadystatechange = null;
                            h && k.parentNode && h.removeChild(k);
                            k = b;
                            w || q(200, "success")
                        }
                    };
                    h.insertBefore(k, h.firstChild)
                },
                abort: function () {
                    k && k.onload(0, 1)
                }
            }
        }
    });
    var Na = l.now(),
        ab;
    l.ajaxSettings.xhr = a.ActiveXObject ?
    function () {
        var f;
        if (!(f = !this.isLocal && g())) a: {
            try {
                f = new a.ActiveXObject("Microsoft.XMLHTTP");
                break a
            } catch (k) {}
            f = void 0
        }
        return f
    } : g;
    Ma = l.ajaxSettings.xhr();
    l.support.ajax = !! Ma;
    l.support.cors = Ma && "withCredentials" in Ma;
    Ma = b;
    l.support.ajax && l.ajaxTransport(function (f) {
        if (!f.crossDomain || l.support.cors) {
            var k;
            return {
                send: function (h, m) {
                    var q = f.xhr(),
                        t, w;
                    f.username ? q.open(f.type, f.url, f.async, f.username, f.password) : q.open(f.type, f.url, f.async);
                    if (f.xhrFields) for (w in f.xhrFields) q[w] = f.xhrFields[w];
                    f.mimeType && q.overrideMimeType && q.overrideMimeType(f.mimeType);
                    (!f.crossDomain || f.hasContent) && !h["X-Requested-With"] && (h["X-Requested-With"] = "XMLHttpRequest");
                    try {
                        for (w in h) q.setRequestHeader(w, h[w])
                    } catch (A) {}
                    q.send(f.hasContent && f.data || null);
                    k = function (D, E) {
                        var P, X, da, aa, ea;
                        try {
                            if (k && (E || q.readyState === 4)) {
                                k = b;
                                t && (q.onreadystatechange = l.noop, delete ab[t]);
                                if (E) q.readyState !== 4 && q.abort();
                                else {
                                    P = q.status;
                                    da = q.getAllResponseHeaders();
                                    aa = {};
                                    (ea = q.responseXML) && ea.documentElement && (aa.xml = ea);
                                    aa.text = q.responseText;
                                    try {
                                        X = q.statusText
                                    } catch (la) {
                                        X = ""
                                    }
                                    P || !f.isLocal || f.crossDomain ? P === 1223 && (P = 204) : P = aa.text ? 200 : 404
                                }
                            }
                        } catch (oa) {
                            E || m(-1, oa)
                        }
                        aa && m(P, X, aa, da)
                    };
                    f.async && q.readyState !== 4 ? (ab || (ab = {}, j()), t = Na++, q.onreadystatechange = ab[t] = k) : k()
                },
                abort: function () {
                    k && k(0, 1)
                }
            }
        }
    });
    var Fb = {},
        Yb = /^(?:toggle|show|hide)$/,
        Zb = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
        kb, Ta = [
            ["height", "marginTop", "marginBottom", "paddingTop", "paddingBottom"],
            ["width", "marginLeft", "marginRight", "paddingLeft", "paddingRight"],
            ["opacity"]
        ];
    l.fn.extend({
        show: function (f, k, h) {
            if (f || f === 0) return this.animate(e("show", 3), f, k, h);
            h = 0;
            for (var m = this.length; h < m; h++) {
                f = this[h];
                k = f.style.display;
                !l._data(f, "olddisplay") && k === "none" && (k = f.style.display = "");
                k === "" && l.css(f, "display") === "none" && l._data(f, "olddisplay", c(f.nodeName))
            }
            for (h = 0; h < m; h++) {
                f = this[h];
                k = f.style.display;
                if (k === "" || k === "none") f.style.display = l._data(f, "olddisplay") || ""
            }
            return this
        },
        hide: function (f, k, h) {
            if (f || f === 0) return this.animate(e("hide", 3), f, k, h);
            f = 0;
            for (k = this.length; f < k; f++) {
                h = l.css(this[f], "display");
                h !== "none" && !l._data(this[f], "olddisplay") && l._data(this[f], "olddisplay", h)
            }
            for (f = 0; f < k; f++) this[f].style.display = "none";
            return this
        },
        _toggle: l.fn.toggle,
        toggle: function (f, k, h) {
            var m = typeof f === "boolean";
            l.isFunction(f) && l.isFunction(k) ? this._toggle.apply(this, arguments) : f == null || m ? this.each(function () {
                var q = m ? f : l(this).is(":hidden");
                l(this)[q ? "show" : "hide"]()
            }) : this.animate(e("toggle", 3), f, k, h);
            return this
        },
        fadeTo: function (f, k, h, m) {
            return this.filter(":hidden").css("opacity", 0).show().end().animate({
                opacity: k
            }, f, h, m)
        },
        animate: function (f, k, h, m) {
            var q = l.speed(k, h, m);
            if (l.isEmptyObject(f)) return this.each(q.complete);
            return this[q.queue === false ? "each" : "queue"](function () {
                var t = l.extend({}, q),
                    w, A = this.nodeType === 1,
                    D = A && l(this).is(":hidden"),
                    E = this;
                for (w in f) {
                    var P = l.camelCase(w);
                    w !== P && (f[P] = f[w], delete f[w], w = P);
                    if (f[w] === "hide" && D || f[w] === "show" && !D) return t.complete.call(this);
                    if (A && (w === "height" || w === "width")) {
                        t.overflow = [this.style.overflow, this.style.overflowX, this.style.overflowY];
                        if (l.css(this, "display") === "inline" && l.css(this, "float") === "none") if (l.support.inlineBlockNeedsLayout) c(this.nodeName) === "inline" ? this.style.display = "inline-block" : (this.style.display = "inline", this.style.zoom = 1);
                        else this.style.display = "inline-block"
                    }
                    l.isArray(f[w]) && ((t.specialEasing = t.specialEasing || {})[w] = f[w][1], f[w] = f[w][0])
                }
                t.overflow != null && (this.style.overflow = "hidden");
                t.curAnim = l.extend({}, f);
                l.each(f, function (X, da) {
                    var aa = new l.fx(E, t, X);
                    if (Yb.test(da)) aa[da === "toggle" ? D ? "show" : "hide" : da](f);
                    else {
                        var ea = Zb.exec(da),
                            la = aa.cur();
                        if (ea) {
                            var oa = parseFloat(ea[2]),
                                ua = ea[3] || (l.cssNumber[X] ? "" : "px");
                            ua !== "px" && (l.style(E, X, (oa || 1) + ua), la *= (oa || 1) / aa.cur(), l.style(E, X, la + ua));
                            ea[1] && (oa = (ea[1] === "-=" ? -1 : 1) * oa + la);
                            aa.custom(la, oa, ua)
                        } else aa.custom(la, da, "")
                    }
                });
                return true
            })
        },
        stop: function (f, k) {
            var h = l.timers;
            f && this.queue([]);
            this.each(function () {
                for (var m = h.length - 1; m >= 0; m--) h[m].elem === this && (k && h[m](true), h.splice(m, 1))
            });
            k || this.dequeue();
            return this
        }
    });
    l.each({
        slideDown: e("show", 1),
        slideUp: e("hide", 1),
        slideToggle: e("toggle", 1),
        fadeIn: {
            opacity: "show"
        },
        fadeOut: {
            opacity: "hide"
        },
        fadeToggle: {
            opacity: "toggle"
        }
    }, function (f, k) {
        l.fn[f] = function (h, m, q) {
            return this.animate(k, h, m, q)
        }
    });
    l.extend({
        speed: function (f, k, h) {
            var m = f && typeof f === "object" ? l.extend({}, f) : {
                complete: h || !h && k || l.isFunction(f) && f,
                duration: f,
                easing: h && k || k && !l.isFunction(k) && k
            };
            m.duration = l.fx.off ? 0 : typeof m.duration === "number" ? m.duration : m.duration in l.fx.speeds ? l.fx.speeds[m.duration] : l.fx.speeds._default;
            m.old = m.complete;
            m.complete = function () {
                m.queue !== false && l(this).dequeue();
                l.isFunction(m.old) && m.old.call(this)
            };
            return m
        },
        easing: {
            linear: function (f, k, h, m) {
                return h + m * f
            },
            swing: function (f, k, h, m) {
                return (-Math.cos(f * Math.PI) / 2 + 0.5) * m + h
            }
        },
        timers: [],
        fx: function (f, k, h) {
            this.options = k;
            this.elem = f;
            this.prop = h;
            k.orig || (k.orig = {})
        }
    });
    l.fx.prototype = {
        update: function () {
            this.options.step && this.options.step.call(this.elem, this.now, this);
            (l.fx.step[this.prop] || l.fx.step._default)(this)
        },
        cur: function () {
            if (this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null)) return this.elem[this.prop];
            var f, k = l.css(this.elem, this.prop);
            return isNaN(f = parseFloat(k)) ? !k || k === "auto" ? 0 : k : f
        },
        custom: function (f, k, h) {
            function m(w) {
                return q.step(w)
            }
            var q = this,
                t = l.fx;
            this.startTime = l.now();
            this.start = f;
            this.end = k;
            this.unit = h || this.unit || (l.cssNumber[this.prop] ? "" : "px");
            this.now = this.start;
            this.pos = this.state = 0;
            m.elem = this.elem;
            m() && l.timers.push(m) && !kb && (kb = setInterval(t.tick, t.interval))
        },
        show: function () {
            this.options.orig[this.prop] = l.style(this.elem, this.prop);
            this.options.show = true;
            this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());
            l(this.elem).show()
        },
        hide: function () {
            this.options.orig[this.prop] = l.style(this.elem, this.prop);
            this.options.hide = true;
            this.custom(this.cur(), 0)
        },
        step: function (f) {
            var k = l.now(),
                h = true;
            if (f || k >= this.options.duration + this.startTime) {
                this.now = this.end;
                this.pos = this.state = 1;
                this.update();
                this.options.curAnim[this.prop] = true;
                for (var m in this.options.curAnim) this.options.curAnim[m] !== true && (h = false);
                if (h) {
                    if (this.options.overflow != null && !l.support.shrinkWrapBlocks) {
                        var q = this.elem,
                            t = this.options;
                        l.each(["", "X", "Y"], function (A, D) {
                            q.style["overflow" + D] = t.overflow[A]
                        })
                    }
                    this.options.hide && l(this.elem).hide();
                    if (this.options.hide || this.options.show) for (var w in this.options.curAnim) l.style(this.elem, w, this.options.orig[w]);
                    this.options.complete.call(this.elem)
                }
                return false
            }
            f = k - this.startTime;
            this.state = f / this.options.duration;
            k = this.options.easing || (l.easing.swing ? "swing" : "linear");
            this.pos = l.easing[this.options.specialEasing && this.options.specialEasing[this.prop] || k](this.state, f, 0, 1, this.options.duration);
            this.now = this.start + (this.end - this.start) * this.pos;
            this.update();
            return true
        }
    };
    l.extend(l.fx, {
        tick: function () {
            for (var f = l.timers, k = 0; k < f.length; k++) f[k]() || f.splice(k--, 1);
            f.length || l.fx.stop()
        },
        interval: 13,
        stop: function () {
            clearInterval(kb);
            kb = null
        },
        speeds: {
            slow: 600,
            fast: 200,
            _default: 400
        },
        step: {
            opacity: function (f) {
                l.style(f.elem, "opacity", f.now)
            },
            _default: function (f) {
                f.elem.style && f.elem.style[f.prop] != null ? f.elem.style[f.prop] = (f.prop === "width" || f.prop === "height" ? Math.max(0, f.now) : f.now) + f.unit : f.elem[f.prop] = f.now
            }
        }
    });
    l.expr && l.expr.filters && (l.expr.filters.animated = function (f) {
        return l.grep(l.timers, function (k) {
            return f === k.elem
        }).length
    });
    var Sa = /^t(?:able|d|h)$/i,
        Eb = /^(?:body|html)$/i;
    "getBoundingClientRect" in Q.documentElement ? l.fn.offset = function (f) {
        var k = this[0],
            h;
        if (f) return this.each(function (w) {
            l.offset.setOffset(this, f, w)
        });
        if (!k || !k.ownerDocument) return null;
        if (k === k.ownerDocument.body) return l.offset.bodyOffset(k);
        try {
            h = k.getBoundingClientRect()
        } catch (m) {}
        var q = k.ownerDocument,
            t = q.documentElement;
        if (!h || !l.contains(t, k)) return h ? {
            top: h.top,
            left: h.left
        } : {
            top: 0,
            left: 0
        };
        k = q.body;
        q = d(q);
        return {
            top: h.top + (q.pageYOffset || l.support.boxModel && t.scrollTop || k.scrollTop) - (t.clientTop || k.clientTop || 0),
            left: h.left + (q.pageXOffset || l.support.boxModel && t.scrollLeft || k.scrollLeft) - (t.clientLeft || k.clientLeft || 0)
        }
    } : l.fn.offset = function (f) {
        var k = this[0];
        if (f) return this.each(function (E) {
            l.offset.setOffset(this, f, E)
        });
        if (!k || !k.ownerDocument) return null;
        if (k === k.ownerDocument.body) return l.offset.bodyOffset(k);
        l.offset.initialize();
        var h, m = k.offsetParent,
            q = k.ownerDocument,
            t = q.documentElement,
            w = q.body;
        h = (q = q.defaultView) ? q.getComputedStyle(k, null) : k.currentStyle;
        for (var A = k.offsetTop, D = k.offsetLeft;
        (k = k.parentNode) && k !== w && k !== t;) {
            if (l.offset.supportsFixedPosition && h.position === "fixed") break;
            h = q ? q.getComputedStyle(k, null) : k.currentStyle;
            A -= k.scrollTop;
            D -= k.scrollLeft;
            k === m && (A += k.offsetTop, D += k.offsetLeft, l.offset.doesNotAddBorder && (!l.offset.doesAddBorderForTableAndCells || !Sa.test(k.nodeName)) && (A += parseFloat(h.borderTopWidth) || 0, D += parseFloat(h.borderLeftWidth) || 0), m = k.offsetParent);
            l.offset.subtractsBorderForOverflowNotVisible && h.overflow !== "visible" && (A += parseFloat(h.borderTopWidth) || 0, D += parseFloat(h.borderLeftWidth) || 0)
        }
        if (h.position === "relative" || h.position === "static") {
            A += w.offsetTop;
            D += w.offsetLeft
        }
        l.offset.supportsFixedPosition && h.position === "fixed" && (A += Math.max(t.scrollTop, w.scrollTop), D += Math.max(t.scrollLeft, w.scrollLeft));
        return {
            top: A,
            left: D
        }
    };
    l.offset = {
        initialize: function () {
            var f = Q.body,
                k = Q.createElement("div"),
                h, m, q, t = parseFloat(l.css(f, "marginTop")) || 0;
            l.extend(k.style, {
                position: "absolute",
                top: 0,
                left: 0,
                margin: 0,
                border: 0,
                width: "1px",
                height: "1px",
                visibility: "hidden"
            });
            k.innerHTML = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";
            f.insertBefore(k, f.firstChild);
            h = k.firstChild;
            m = h.firstChild;
            q = h.nextSibling.firstChild.firstChild;
            this.doesNotAddBorder = m.offsetTop !== 5;
            this.doesAddBorderForTableAndCells = q.offsetTop === 5;
            m.style.position = "fixed";
            m.style.top = "20px";
            this.supportsFixedPosition = m.offsetTop === 20 || m.offsetTop === 15;
            m.style.position = m.style.top = "";
            h.style.overflow = "hidden";
            h.style.position = "relative";
            this.subtractsBorderForOverflowNotVisible = m.offsetTop === -5;
            this.doesNotIncludeMarginInBodyOffset = f.offsetTop !== t;
            f.removeChild(k);
            l.offset.initialize = l.noop
        },
        bodyOffset: function (f) {
            var k = f.offsetTop,
                h = f.offsetLeft;
            l.offset.initialize();
            l.offset.doesNotIncludeMarginInBodyOffset && (k += parseFloat(l.css(f, "marginTop")) || 0, h += parseFloat(l.css(f, "marginLeft")) || 0);
            return {
                top: k,
                left: h
            }
        },
        setOffset: function (f, k, h) {
            var m = l.css(f, "position");
            m === "static" && (f.style.position = "relative");
            var q = l(f),
                t = q.offset(),
                w = l.css(f, "top"),
                A = l.css(f, "left"),
                D = m === "absolute" && l.inArray("auto", [w, A]) > -1;
            m = {};
            var E = {};
            D && (E = q.position());
            w = D ? E.top : parseInt(w, 10) || 0;
            A = D ? E.left : parseInt(A, 10) || 0;
            l.isFunction(k) && (k = k.call(f, h, t));
            k.top != null && (m.top = k.top - t.top + w);
            k.left != null && (m.left = k.left - t.left + A);
            "using" in k ? k.using.call(f, m) : q.css(m)
        }
    };
    l.fn.extend({
        position: function () {
            if (!this[0]) return null;
            var f = this[0],
                k = this.offsetParent(),
                h = this.offset(),
                m = Eb.test(k[0].nodeName) ? {
                    top: 0,
                    left: 0
                } : k.offset();
            h.top -= parseFloat(l.css(f, "marginTop")) || 0;
            h.left -= parseFloat(l.css(f, "marginLeft")) || 0;
            m.top += parseFloat(l.css(k[0], "borderTopWidth")) || 0;
            m.left += parseFloat(l.css(k[0], "borderLeftWidth")) || 0;
            return {
                top: h.top - m.top,
                left: h.left - m.left
            }
        },
        offsetParent: function () {
            return this.map(function () {
                for (var f = this.offsetParent || Q.body; f && !Eb.test(f.nodeName) && l.css(f, "position") === "static";) f = f.offsetParent;
                return f
            })
        }
    });
    l.each(["Left", "Top"], function (f, k) {
        var h = "scroll" + k;
        l.fn[h] = function (m) {
            var q = this[0],
                t;
            if (!q) return null;
            if (m !== b) return this.each(function () {
                (t = d(this)) ? t.scrollTo(f ? l(t).scrollLeft() : m, f ? m : l(t).scrollTop()) : this[h] = m
            });
            return (t = d(q)) ? "pageXOffset" in t ? t[f ? "pageYOffset" : "pageXOffset"] : l.support.boxModel && t.document.documentElement[h] || t.document.body[h] : q[h]
        }
    });
    l.each(["Height", "Width"], function (f, k) {
        var h = k.toLowerCase();
        l.fn["inner" + k] = function () {
            return this[0] ? parseFloat(l.css(this[0], h, "padding")) : null
        };
        l.fn["outer" + k] = function (m) {
            return this[0] ? parseFloat(l.css(this[0], h, m ? "margin" : "border")) : null
        };
        l.fn[h] = function (m) {
            var q = this[0];
            if (!q) return m == null ? null : this;
            if (l.isFunction(m)) return this.each(function (w) {
                var A = l(this);
                A[h](m.call(this, w, A[h]()))
            });
            if (l.isWindow(q)) {
                var t = q.document.documentElement["client" + k];
                return q.document.compatMode === "CSS1Compat" && t || q.document.body["client" + k] || t
            }
            if (q.nodeType === 9) return Math.max(q.documentElement["client" + k], q.body["scroll" + k], q.documentElement["scroll" + k], q.body["offset" + k], q.documentElement["offset" + k]);
            if (m === b) {
                q = l.css(q, h);
                t = parseFloat(q);
                return l.isNaN(t) ? q : t
            }
            return this.css(h, typeof m === "string" ? m : m + "px")
        }
    });
    a.jQuery = a.$ = l
})(window);
(function (a, b) {
    function d(c) {
        return !a(c).parents().andSelf().filter(function () {
            return a.curCSS(this, "visibility") === "hidden" || a.expr.filters.hidden(this)
        }).length
    }
    a.ui = a.ui || {};
    if (!a.ui.version) {
        a.extend(a.ui, {
            version: "1.8.7",
            keyCode: {
                ALT: 18,
                BACKSPACE: 8,
                CAPS_LOCK: 20,
                COMMA: 188,
                COMMAND: 91,
                COMMAND_LEFT: 91,
                COMMAND_RIGHT: 93,
                CONTROL: 17,
                DELETE: 46,
                DOWN: 40,
                END: 35,
                ENTER: 13,
                ESCAPE: 27,
                HOME: 36,
                INSERT: 45,
                LEFT: 37,
                MENU: 93,
                NUMPAD_ADD: 107,
                NUMPAD_DECIMAL: 110,
                NUMPAD_DIVIDE: 111,
                NUMPAD_ENTER: 108,
                NUMPAD_MULTIPLY: 106,
                NUMPAD_SUBTRACT: 109,
                PAGE_DOWN: 34,
                PAGE_UP: 33,
                PERIOD: 190,
                RIGHT: 39,
                SHIFT: 16,
                SPACE: 32,
                TAB: 9,
                UP: 38,
                WINDOWS: 91
            }
        });
        a.fn.extend({
            _focus: a.fn.focus,
            focus: function (c, e) {
                return typeof c === "number" ? this.each(function () {
                    var g = this;
                    setTimeout(function () {
                        a(g).focus();
                        e && e.call(g)
                    }, c)
                }) : this._focus.apply(this, arguments)
            },
            scrollParent: function () {
                var c;
                c = a.browser.msie && /(static|relative)/.test(this.css("position")) || /absolute/.test(this.css("position")) ? this.parents().filter(function () {
                    return /(relative|absolute|fixed)/.test(a.curCSS(this, "position", 1)) && /(auto|scroll)/.test(a.curCSS(this, "overflow", 1) + a.curCSS(this, "overflow-y", 1) + a.curCSS(this, "overflow-x", 1))
                }).eq(0) : this.parents().filter(function () {
                    return /(auto|scroll)/.test(a.curCSS(this, "overflow", 1) + a.curCSS(this, "overflow-y", 1) + a.curCSS(this, "overflow-x", 1))
                }).eq(0);
                return /fixed/.test(this.css("position")) || !c.length ? a(document) : c
            },
            zIndex: function (c) {
                if (c !== b) return this.css("zIndex", c);
                if (this.length) {
                    c = a(this[0]);
                    for (var e; c.length && c[0] !== document;) {
                        e = c.css("position");
                        if (e === "absolute" || e === "relative" || e === "fixed") {
                            e = parseInt(c.css("zIndex"), 10);
                            if (!isNaN(e) && e !== 0) return e
                        }
                        c = c.parent()
                    }
                }
                return 0
            },
            disableSelection: function () {
                return this.bind((a.support.selectstart ? "selectstart" : "mousedown") + ".ui-disableSelection", function (c) {
                    c.preventDefault()
                })
            },
            enableSelection: function () {
                return this.unbind(".ui-disableSelection")
            }
        });
        a.each(["Width", "Height"], function (c, e) {
            function g(o, r, s, u) {
                a.each(j, function () {
                    r -= parseFloat(a.curCSS(o, "padding" + this, true)) || 0;
                    if (s) r -= parseFloat(a.curCSS(o, "border" + this + "Width", true)) || 0;
                    if (u) r -= parseFloat(a.curCSS(o, "margin" + this, true)) || 0
                });
                return r
            }
            var j = e === "Width" ? ["Left", "Right"] : ["Top", "Bottom"],
                n = e.toLowerCase(),
                p = {
                    innerWidth: a.fn.innerWidth,
                    innerHeight: a.fn.innerHeight,
                    outerWidth: a.fn.outerWidth,
                    outerHeight: a.fn.outerHeight
                };
            a.fn["inner" + e] = function (o) {
                if (o === b) return p["inner" + e].call(this);
                return this.each(function () {
                    a(this).css(n, g(this, o) + "px")
                })
            };
            a.fn["outer" + e] = function (o, r) {
                if (typeof o !== "number") return p["outer" + e].call(this, o);
                return this.each(function () {
                    a(this).css(n, g(this, o, true, r) + "px")
                })
            }
        });
        a.extend(a.expr[":"], {
            data: function (c, e, g) {
                return !!a.data(c, g[3])
            },
            focusable: function (c) {
                var e = c.nodeName.toLowerCase(),
                    g = a.attr(c, "tabindex");
                if ("area" === e) {
                    e = c.parentNode;
                    g = e.name;
                    if (!c.href || !g || e.nodeName.toLowerCase() !== "map") return false;
                    c = a("img[usemap=#" + g + "]")[0];
                    return !!c && d(c)
                }
                return (/input|select|textarea|button|object/.test(e) ? !c.disabled : "a" == e ? c.href || !isNaN(g) : !isNaN(g)) && d(c)
            },
            tabbable: function (c) {
                var e = a.attr(c, "tabindex");
                return (isNaN(e) || e >= 0) && a(c).is(":focusable")
            }
        });
        a(function () {
            var c = document.body,
                e = c.appendChild(e = document.createElement("div"));
            a.extend(e.style, {
                minHeight: "100px",
                height: "auto",
                padding: 0,
                borderWidth: 0
            });
            a.support.minHeight = e.offsetHeight === 100;
            a.support.selectstart = "onselectstart" in e;
            c.removeChild(e).style.display = "none"
        });
        a.extend(a.ui, {
            plugin: {
                add: function (c, e, g) {
                    c = a.ui[c].prototype;
                    for (var j in g) {
                        c.plugins[j] = c.plugins[j] || [];
                        c.plugins[j].push([e, g[j]])
                    }
                },
                call: function (c, e, g) {
                    if ((e = c.plugins[e]) && c.element[0].parentNode) for (var j = 0; j < e.length; j++) c.options[e[j][0]] && e[j][1].apply(c.element, g)
                }
            },
            contains: function (c, e) {
                return document.compareDocumentPosition ? c.compareDocumentPosition(e) & 16 : c !== e && c.contains(e)
            },
            hasScroll: function (c, e) {
                if (a(c).css("overflow") === "hidden") return false;
                e = e && e === "left" ? "scrollLeft" : "scrollTop";
                var g = false;
                if (c[e] > 0) return true;
                c[e] = 1;
                g = c[e] > 0;
                c[e] = 0;
                return g
            },
            isOverAxis: function (c, e, g) {
                return c > e && c < e + g
            },
            isOver: function (c, e, g, j, n, p) {
                return a.ui.isOverAxis(c, g, n) && a.ui.isOverAxis(e, j, p)
            }
        })
    }
})(jQuery);
(function (a, b) {
    if (a.cleanData) {
        var d = a.cleanData;
        a.cleanData = function (e) {
            for (var g = 0, j;
            (j = e[g]) != null; g++) a(j).triggerHandler("remove");
            d(e)
        }
    } else {
        var c = a.fn.remove;
        a.fn.remove = function (e, g) {
            return this.each(function () {
                if (!g) if (!e || a.filter(e, [this]).length) a("*", this).add([this]).each(function () {
                    a(this).triggerHandler("remove")
                });
                return c.call(a(this), e, g)
            })
        }
    }
    a.widget = function (e, g, j) {
        var n = e.split(".")[0],
            p;
        e = e.split(".")[1];
        p = n + "-" + e;
        if (!j) {
            j = g;
            g = a.Widget
        }
        a.expr[":"][p] = function (o) {
            return !!a.data(o, e)
        };
        a[n] = a[n] || {};
        a[n][e] = function (o, r) {
            arguments.length && this._createWidget(o, r)
        };
        g = new g;
        g.options = a.extend(true, {}, g.options);
        a[n][e].prototype = a.extend(true, g, {
            namespace: n,
            widgetName: e,
            widgetEventPrefix: a[n][e].prototype.widgetEventPrefix || e,
            widgetBaseClass: p
        }, j);
        a.widget.bridge(e, a[n][e])
    };
    a.widget.bridge = function (e, g) {
        a.fn[e] = function (j) {
            var n = typeof j === "string",
                p = Array.prototype.slice.call(arguments, 1),
                o = this;
            j = !n && p.length ? a.extend.apply(null, [true, j].concat(p)) : j;
            if (n && j.charAt(0) === "_") return o;
            n ? this.each(function () {
                var r = a.data(this, e),
                    s = r && a.isFunction(r[j]) ? r[j].apply(r, p) : r;
                if (s !== r && s !== b) {
                    o = s;
                    return false
                }
            }) : this.each(function () {
                var r = a.data(this, e);
                r ? r.option(j || {})._init() : a.data(this, e, new g(j, this))
            });
            return o
        }
    };
    a.Widget = function (e, g) {
        arguments.length && this._createWidget(e, g)
    };
    a.Widget.prototype = {
        widgetName: "widget",
        widgetEventPrefix: "",
        options: {
            disabled: false
        },
        _createWidget: function (e, g) {
            a.data(g, this.widgetName, this);
            this.element = a(g);
            this.options = a.extend(true, {}, this.options, this._getCreateOptions(), e);
            var j = this;
            this.element.bind("remove." + this.widgetName, function () {
                j.destroy()
            });
            this._create();
            this._trigger("create");
            this._init()
        },
        _getCreateOptions: function () {
            return a.metadata && a.metadata.get(this.element[0])[this.widgetName]
        },
        _create: function () {},
        _init: function () {},
        destroy: function () {
            this.element.unbind("." + this.widgetName).removeData(this.widgetName);
            this.widget().unbind("." + this.widgetName).removeAttr("aria-disabled").removeClass(this.widgetBaseClass + "-disabled ui-state-disabled")
        },
        widget: function () {
            return this.element
        },
        option: function (e, g) {
            var j = e;
            if (arguments.length === 0) return a.extend({}, this.options);
            if (typeof e === "string") {
                if (g === b) return this.options[e];
                j = {};
                j[e] = g
            }
            this._setOptions(j);
            return this
        },
        _setOptions: function (e) {
            var g = this;
            a.each(e, function (j, n) {
                g._setOption(j, n)
            });
            return this
        },
        _setOption: function (e, g) {
            this.options[e] = g;
            if (e === "disabled") this.widget()[g ? "addClass" : "removeClass"](this.widgetBaseClass + "-disabled ui-state-disabled").attr("aria-disabled", g);
            return this
        },
        enable: function () {
            return this._setOption("disabled", false)
        },
        disable: function () {
            return this._setOption("disabled", true)
        },
        _trigger: function (e, g, j) {
            var n = this.options[e];
            g = a.Event(g);
            g.type = (e === this.widgetEventPrefix ? e : this.widgetEventPrefix + e).toLowerCase();
            j = j || {};
            if (g.originalEvent) {
                e = a.event.props.length;
                for (var p; e;) {
                    p = a.event.props[--e];
                    g[p] = g.originalEvent[p]
                }
            }
            this.element.trigger(g, j);
            return !(a.isFunction(n) && n.call(this.element[0], g, j) === false || g.isDefaultPrevented())
        }
    }
})(jQuery);
(function (a) {
    a.widget("ui.mouse", {
        options: {
            cancel: ":input,option",
            distance: 1,
            delay: 0
        },
        _mouseInit: function () {
            var b = this;
            this.element.bind("mousedown." + this.widgetName, function (d) {
                return b._mouseDown(d)
            }).bind("click." + this.widgetName, function (d) {
                if (true === a.data(d.target, b.widgetName + ".preventClickEvent")) {
                    a.removeData(d.target, b.widgetName + ".preventClickEvent");
                    d.stopImmediatePropagation();
                    return false
                }
            });
            this.started = false
        },
        _mouseDestroy: function () {
            this.element.unbind("." + this.widgetName)
        },
        _mouseDown: function (b) {
            b.originalEvent = b.originalEvent || {};
            if (!b.originalEvent.mouseHandled) {
                this._mouseStarted && this._mouseUp(b);
                this._mouseDownEvent = b;
                var d = this,
                    c = b.which == 1,
                    e = typeof this.options.cancel == "string" ? a(b.target).parents().add(b.target).filter(this.options.cancel).length : false;
                if (!c || e || !this._mouseCapture(b)) return true;
                this.mouseDelayMet = !this.options.delay;
                if (!this.mouseDelayMet) this._mouseDelayTimer = setTimeout(function () {
                    d.mouseDelayMet = true
                }, this.options.delay);
                if (this._mouseDistanceMet(b) && this._mouseDelayMet(b)) {
                    this._mouseStarted = this._mouseStart(b) !== false;
                    if (!this._mouseStarted) {
                        b.preventDefault();
                        return true
                    }
                }
                this._mouseMoveDelegate = function (g) {
                    return d._mouseMove(g)
                };
                this._mouseUpDelegate = function (g) {
                    return d._mouseUp(g)
                };
                a(document).bind("mousemove." + this.widgetName, this._mouseMoveDelegate).bind("mouseup." + this.widgetName, this._mouseUpDelegate);
                b.preventDefault();
                return b.originalEvent.mouseHandled = true
            }
        },
        _mouseMove: function (b) {
            if (a.browser.msie && !(document.documentMode >= 9) && !b.button) return this._mouseUp(b);
            if (this._mouseStarted) {
                this._mouseDrag(b);
                return b.preventDefault()
            }
            if (this._mouseDistanceMet(b) && this._mouseDelayMet(b))(this._mouseStarted = this._mouseStart(this._mouseDownEvent, b) !== false) ? this._mouseDrag(b) : this._mouseUp(b);
            return !this._mouseStarted
        },
        _mouseUp: function (b) {
            a(document).unbind("mousemove." + this.widgetName, this._mouseMoveDelegate).unbind("mouseup." + this.widgetName, this._mouseUpDelegate);
            if (this._mouseStarted) {
                this._mouseStarted = false;
                b.target == this._mouseDownEvent.target && a.data(b.target, this.widgetName + ".preventClickEvent", true);
                this._mouseStop(b)
            }
            return false
        },
        _mouseDistanceMet: function (b) {
            return Math.max(Math.abs(this._mouseDownEvent.pageX - b.pageX), Math.abs(this._mouseDownEvent.pageY - b.pageY)) >= this.options.distance
        },
        _mouseDelayMet: function () {
            return this.mouseDelayMet
        },
        _mouseStart: function () {},
        _mouseDrag: function () {},
        _mouseStop: function () {},
        _mouseCapture: function () {
            return true
        }
    })
})(jQuery);
(function (a) {
    a.widget("ui.sortable", a.ui.mouse, {
        widgetEventPrefix: "sort",
        options: {
            appendTo: "parent",
            axis: false,
            connectWith: false,
            containment: false,
            cursor: "auto",
            cursorAt: false,
            dropOnEmpty: true,
            forcePlaceholderSize: false,
            forceHelperSize: false,
            grid: false,
            handle: false,
            helper: "original",
            items: "> *",
            opacity: false,
            placeholder: false,
            revert: false,
            scroll: true,
            scrollSensitivity: 20,
            scrollSpeed: 20,
            scope: "default",
            tolerance: "intersect",
            zIndex: 1E3
        },
        _create: function () {
            this.containerCache = {};
            this.element.addClass("ui-sortable");
            this.refresh();
            this.floating = this.items.length ? /left|right/.test(this.items[0].item.css("float")) : false;
            this.offset = this.element.offset();
            this._mouseInit()
        },
        destroy: function () {
            this.element.removeClass("ui-sortable ui-sortable-disabled").removeData("sortable").unbind(".sortable");
            this._mouseDestroy();
            for (var b = this.items.length - 1; b >= 0; b--) this.items[b].item.removeData("sortable-item");
            return this
        },
        _setOption: function (b, d) {
            if (b === "disabled") {
                this.options[b] = d;
                this.widget()[d ? "addClass" : "removeClass"]("ui-sortable-disabled")
            } else a.Widget.prototype._setOption.apply(this, arguments)
        },
        _mouseCapture: function (b, d) {
            if (this.reverting) return false;
            if (this.options.disabled || this.options.type == "static") return false;
            this._refreshItems(b);
            var c = null,
                e = this;
            a(b.target).parents().each(function () {
                if (a.data(this, "sortable-item") == e) {
                    c = a(this);
                    return false
                }
            });
            if (a.data(b.target, "sortable-item") == e) c = a(b.target);
            if (!c) return false;
            if (this.options.handle && !d) {
                var g = false;
                a(this.options.handle, c).find("*").andSelf().each(function () {
                    if (this == b.target) g = true
                });
                if (!g) return false
            }
            this.currentItem = c;
            this._removeCurrentsFromItems();
            return true
        },
        _mouseStart: function (b, d, c) {
            d = this.options;
            this.currentContainer = this;
            this.refreshPositions();
            this.helper = this._createHelper(b);
            this._cacheHelperProportions();
            this._cacheMargins();
            this.scrollParent = this.helper.scrollParent();
            this.offset = this.currentItem.offset();
            this.offset = {
                top: this.offset.top - this.margins.top,
                left: this.offset.left - this.margins.left
            };
            this.helper.css("position", "absolute");
            this.cssPosition = this.helper.css("position");
            a.extend(this.offset, {
                click: {
                    left: b.pageX - this.offset.left,
                    top: b.pageY - this.offset.top
                },
                parent: this._getParentOffset(),
                relative: this._getRelativeOffset()
            });
            this.originalPosition = this._generatePosition(b);
            this.originalPageX = b.pageX;
            this.originalPageY = b.pageY;
            d.cursorAt && this._adjustOffsetFromHelper(d.cursorAt);
            this.domPosition = {
                prev: this.currentItem.prev()[0],
                parent: this.currentItem.parent()[0]
            };
            this.helper[0] != this.currentItem[0] && this.currentItem.hide();
            this._createPlaceholder();
            d.containment && this._setContainment();
            if (d.cursor) {
                if (a("body").css("cursor")) this._storedCursor = a("body").css("cursor");
                a("body").css("cursor", d.cursor)
            }
            if (d.opacity) {
                if (this.helper.css("opacity")) this._storedOpacity = this.helper.css("opacity");
                this.helper.css("opacity", d.opacity)
            }
            if (d.zIndex) {
                if (this.helper.css("zIndex")) this._storedZIndex = this.helper.css("zIndex");
                this.helper.css("zIndex", d.zIndex)
            }
            if (this.scrollParent[0] != document && this.scrollParent[0].tagName != "HTML") this.overflowOffset = this.scrollParent.offset();
            this._trigger("start", b, this._uiHash());
            this._preserveHelperProportions || this._cacheHelperProportions();
            if (!c) for (c = this.containers.length - 1; c >= 0; c--) this.containers[c]._trigger("activate", b, this._uiHash(this));
            if (a.ui.ddmanager) a.ui.ddmanager.current = this;
            a.ui.ddmanager && !d.dropBehaviour && a.ui.ddmanager.prepareOffsets(this, b);
            this.dragging = true;
            this.helper.addClass("ui-sortable-helper");
            this._mouseDrag(b);
            return true
        },
        _mouseDrag: function (b) {
            this.position = this._generatePosition(b);
            this.positionAbs = this._convertPositionTo("absolute");
            if (!this.lastPositionAbs) this.lastPositionAbs = this.positionAbs;
            if (this.options.scroll) {
                var d = this.options,
                    c = false;
                if (this.scrollParent[0] != document && this.scrollParent[0].tagName != "HTML") {
                    if (this.overflowOffset.top + this.scrollParent[0].offsetHeight - b.pageY < d.scrollSensitivity) this.scrollParent[0].scrollTop = c = this.scrollParent[0].scrollTop + d.scrollSpeed;
                    else if (b.pageY - this.overflowOffset.top < d.scrollSensitivity) this.scrollParent[0].scrollTop = c = this.scrollParent[0].scrollTop - d.scrollSpeed;
                    if (this.overflowOffset.left + this.scrollParent[0].offsetWidth - b.pageX < d.scrollSensitivity) this.scrollParent[0].scrollLeft = c = this.scrollParent[0].scrollLeft + d.scrollSpeed;
                    else if (b.pageX - this.overflowOffset.left < d.scrollSensitivity) this.scrollParent[0].scrollLeft = c = this.scrollParent[0].scrollLeft - d.scrollSpeed
                } else {
                    if (b.pageY - a(document).scrollTop() < d.scrollSensitivity) c = a(document).scrollTop(a(document).scrollTop() - d.scrollSpeed);
                    else if (a(window).height() - (b.pageY - a(document).scrollTop()) < d.scrollSensitivity) c = a(document).scrollTop(a(document).scrollTop() + d.scrollSpeed);
                    if (b.pageX - a(document).scrollLeft() < d.scrollSensitivity) c = a(document).scrollLeft(a(document).scrollLeft() - d.scrollSpeed);
                    else if (a(window).width() - (b.pageX - a(document).scrollLeft()) < d.scrollSensitivity) c = a(document).scrollLeft(a(document).scrollLeft() + d.scrollSpeed)
                }
                c !== false && a.ui.ddmanager && !d.dropBehaviour && a.ui.ddmanager.prepareOffsets(this, b)
            }
            this.positionAbs = this._convertPositionTo("absolute");
            if (!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left + "px";
            if (!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top + "px";
            for (d = this.items.length - 1; d >= 0; d--) {
                c = this.items[d];
                var e = c.item[0],
                    g = this._intersectsWithPointer(c);
                if (g) if (e != this.currentItem[0] && this.placeholder[g == 1 ? "next" : "prev"]()[0] != e && !a.ui.contains(this.placeholder[0], e) && (this.options.type == "semi-dynamic" ? !a.ui.contains(this.element[0], e) : 1)) {
                    this.direction = g == 1 ? "down" : "up";
                    if (this.options.tolerance == "pointer" || this._intersectsWithSides(c)) this._rearrange(b, c);
                    else break;
                    this._trigger("change", b, this._uiHash());
                    break
                }
            }
            this._contactContainers(b);
            a.ui.ddmanager && a.ui.ddmanager.drag(this, b);
            this._trigger("sort", b, this._uiHash());
            this.lastPositionAbs = this.positionAbs;
            return false
        },
        _mouseStop: function (b, d) {
            if (b) {
                a.ui.ddmanager && !this.options.dropBehaviour && a.ui.ddmanager.drop(this, b);
                if (this.options.revert) {
                    var c = this;
                    d = c.placeholder.offset();
                    c.reverting = true;
                    a(this.helper).animate({
                        left: d.left - this.offset.parent.left - c.margins.left + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollLeft),
                        top: d.top - this.offset.parent.top - c.margins.top + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollTop)
                    }, parseInt(this.options.revert, 10) || 500, function () {
                        c._clear(b)
                    })
                } else this._clear(b, d);
                return false
            }
        },
        cancel: function () {
            if (this.dragging) {
                this._mouseUp();
                this.options.helper == "original" ? this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper") : this.currentItem.show();
                for (var b = this.containers.length - 1; b >= 0; b--) {
                    this.containers[b]._trigger("deactivate", null, this._uiHash(this));
                    if (this.containers[b].containerCache.over) {
                        this.containers[b]._trigger("out", null, this._uiHash(this));
                        this.containers[b].containerCache.over = 0
                    }
                }
            }
            this.placeholder[0].parentNode && this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
            this.options.helper != "original" && this.helper && this.helper[0].parentNode && this.helper.remove();
            a.extend(this, {
                helper: null,
                dragging: false,
                reverting: false,
                _noFinalSort: null
            });
            this.domPosition.prev ? a(this.domPosition.prev).after(this.currentItem) : a(this.domPosition.parent).prepend(this.currentItem);
            return this
        },
        serialize: function (b) {
            var d = this._getItemsAsjQuery(b && b.connected),
                c = [];
            b = b || {};
            a(d).each(function () {
                var e = (a(b.item || this).attr(b.attribute || "id") || "").match(b.expression || /(.+)[-=_](.+)/);
                if (e) c.push((b.key || e[1] + "[]") + "=" + (b.key && b.expression ? e[1] : e[2]))
            });
            !c.length && b.key && c.push(b.key + "=");
            return c.join("&")
        },
        toArray: function (b) {
            var d = this._getItemsAsjQuery(b && b.connected),
                c = [];
            b = b || {};
            d.each(function () {
                c.push(a(b.item || this).attr(b.attribute || "id") || "")
            });
            return c
        },
        _intersectsWith: function (b) {
            var d = this.positionAbs.left,
                c = d + this.helperProportions.width,
                e = this.positionAbs.top,
                g = e + this.helperProportions.height,
                j = b.left,
                n = j + b.width,
                p = b.top,
                o = p + b.height,
                r = this.offset.click.top,
                s = this.offset.click.left;
            return this.options.tolerance == "pointer" || this.options.forcePointerForContainers || this.options.tolerance != "pointer" && this.helperProportions[this.floating ? "width" : "height"] > b[this.floating ? "width" : "height"] ? e + r > p && e + r < o && d + s > j && d + s < n : j < d + this.helperProportions.width / 2 && c - this.helperProportions.width / 2 < n && p < e + this.helperProportions.height / 2 && g - this.helperProportions.height / 2 < o
        },
        _intersectsWithPointer: function (b) {
            var d = a.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, b.top, b.height);
            b = a.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, b.left, b.width);
            d = d && b;
            b = this._getDragVerticalDirection();
            var c = this._getDragHorizontalDirection();
            if (!d) return false;
            return this.floating ? c && c == "right" || b == "down" ? 2 : 1 : b && (b == "down" ? 2 : 1)
        },
        _intersectsWithSides: function (b) {
            var d = a.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, b.top + b.height / 2, b.height);
            b = a.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, b.left + b.width / 2, b.width);
            var c = this._getDragVerticalDirection(),
                e = this._getDragHorizontalDirection();
            return this.floating && e ? e == "right" && b || e == "left" && !b : c && (c == "down" && d || c == "up" && !d)
        },
        _getDragVerticalDirection: function () {
            var b = this.positionAbs.top - this.lastPositionAbs.top;
            return b != 0 && (b > 0 ? "down" : "up")
        },
        _getDragHorizontalDirection: function () {
            var b = this.positionAbs.left - this.lastPositionAbs.left;
            return b != 0 && (b > 0 ? "right" : "left")
        },
        refresh: function (b) {
            this._refreshItems(b);
            this.refreshPositions();
            return this
        },
        _connectWith: function () {
            var b = this.options;
            return b.connectWith.constructor == String ? [b.connectWith] : b.connectWith
        },
        _getItemsAsjQuery: function (b) {
            var d = [],
                c = [],
                e = this._connectWith();
            if (e && b) for (b = e.length - 1; b >= 0; b--) for (var g = a(e[b]), j = g.length - 1; j >= 0; j--) {
                var n = a.data(g[j], "sortable");
                if (n && n != this && !n.options.disabled) c.push([a.isFunction(n.options.items) ? n.options.items.call(n.element) : a(n.options.items, n.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), n])
            }
            c.push([a.isFunction(this.options.items) ? this.options.items.call(this.element, null, {
                options: this.options,
                item: this.currentItem
            }) : a(this.options.items, this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), this]);
            for (b = c.length - 1; b >= 0; b--) c[b][0].each(function () {
                d.push(this)
            });
            return a(d)
        },
        _removeCurrentsFromItems: function () {
            for (var b = this.currentItem.find(":data(sortable-item)"), d = 0; d < this.items.length; d++) for (var c = 0; c < b.length; c++) b[c] == this.items[d].item[0] && this.items.splice(d, 1)
        },
        _refreshItems: function (b) {
            this.items = [];
            this.containers = [this];
            var d = this.items,
                c = [
                    [a.isFunction(this.options.items) ? this.options.items.call(this.element[0], b, {
                        item: this.currentItem
                    }) : a(this.options.items, this.element), this]
                ],
                e = this._connectWith();
            if (e) for (var g = e.length - 1; g >= 0; g--) for (var j = a(e[g]), n = j.length - 1; n >= 0; n--) {
                var p = a.data(j[n], "sortable");
                if (p && p != this && !p.options.disabled) {
                    c.push([a.isFunction(p.options.items) ? p.options.items.call(p.element[0], b, {
                        item: this.currentItem
                    }) : a(p.options.items, p.element), p]);
                    this.containers.push(p)
                }
            }
            for (g = c.length - 1; g >= 0; g--) {
                b = c[g][1];
                e = c[g][0];
                n = 0;
                for (j = e.length; n < j; n++) {
                    p = a(e[n]);
                    p.data("sortable-item", b);
                    d.push({
                        item: p,
                        instance: b,
                        width: 0,
                        height: 0,
                        left: 0,
                        top: 0
                    })
                }
            }
        },
        refreshPositions: function (b) {
            if (this.offsetParent && this.helper) this.offset.parent = this._getParentOffset();
            for (var d = this.items.length - 1; d >= 0; d--) {
                var c = this.items[d],
                    e = this.options.toleranceElement ? a(this.options.toleranceElement, c.item) : c.item;
                if (!b) {
                    c.width = e.outerWidth();
                    c.height = e.outerHeight()
                }
                e = e.offset();
                c.left = e.left;
                c.top = e.top
            }
            if (this.options.custom && this.options.custom.refreshContainers) this.options.custom.refreshContainers.call(this);
            else for (d = this.containers.length - 1; d >= 0; d--) {
                e = this.containers[d].element.offset();
                this.containers[d].containerCache.left = e.left;
                this.containers[d].containerCache.top = e.top;
                this.containers[d].containerCache.width = this.containers[d].element.outerWidth();
                this.containers[d].containerCache.height = this.containers[d].element.outerHeight()
            }
            return this
        },
        _createPlaceholder: function (b) {
            var d = b || this,
                c = d.options;
            if (!c.placeholder || c.placeholder.constructor == String) {
                var e = c.placeholder;
                c.placeholder = {
                    element: function () {
                        var g = a(document.createElement(d.currentItem[0].nodeName)).addClass(e || d.currentItem[0].className + " ui-sortable-placeholder").removeClass("ui-sortable-helper")[0];
                        if (!e) g.style.visibility = "hidden";
                        return g
                    },
                    update: function (g, j) {
                        if (!(e && !c.forcePlaceholderSize)) {
                            j.height() || j.height(d.currentItem.innerHeight() - parseInt(d.currentItem.css("paddingTop") || 0, 10) - parseInt(d.currentItem.css("paddingBottom") || 0, 10));
                            j.width() || j.width(d.currentItem.innerWidth() - parseInt(d.currentItem.css("paddingLeft") || 0, 10) - parseInt(d.currentItem.css("paddingRight") || 0, 10))
                        }
                    }
                }
            }
            d.placeholder = a(c.placeholder.element.call(d.element, d.currentItem));
            d.currentItem.after(d.placeholder);
            c.placeholder.update(d, d.placeholder)
        },
        _contactContainers: function (b) {
            for (var d = null, c = null, e = this.containers.length - 1; e >= 0; e--) if (!a.ui.contains(this.currentItem[0], this.containers[e].element[0])) if (this._intersectsWith(this.containers[e].containerCache)) {
                if (!(d && a.ui.contains(this.containers[e].element[0], d.element[0]))) {
                    d = this.containers[e];
                    c = e
                }
            } else if (this.containers[e].containerCache.over) {
                this.containers[e]._trigger("out", b, this._uiHash(this));
                this.containers[e].containerCache.over = 0
            }
            if (d) if (this.containers.length === 1) {
                this.containers[c]._trigger("over", b, this._uiHash(this));
                this.containers[c].containerCache.over = 1
            } else if (this.currentContainer != this.containers[c]) {
                d = 1E4;
                e = null;
                for (var g = this.positionAbs[this.containers[c].floating ? "left" : "top"], j = this.items.length - 1; j >= 0; j--) if (a.ui.contains(this.containers[c].element[0], this.items[j].item[0])) {
                    var n = this.items[j][this.containers[c].floating ? "left" : "top"];
                    if (Math.abs(n - g) < d) {
                        d = Math.abs(n - g);
                        e = this.items[j]
                    }
                }
                if (e || this.options.dropOnEmpty) {
                    this.currentContainer = this.containers[c];
                    e ? this._rearrange(b, e, null, true) : this._rearrange(b, null, this.containers[c].element, true);
                    this._trigger("change", b, this._uiHash());
                    this.containers[c]._trigger("change", b, this._uiHash(this));
                    this.options.placeholder.update(this.currentContainer, this.placeholder);
                    this.containers[c]._trigger("over", b, this._uiHash(this));
                    this.containers[c].containerCache.over = 1
                }
            }
        },
        _createHelper: function (b) {
            var d = this.options;
            b = a.isFunction(d.helper) ? a(d.helper.apply(this.element[0], [b, this.currentItem])) : d.helper == "clone" ? this.currentItem.clone() : this.currentItem;
            b.parents("body").length || a(d.appendTo != "parent" ? d.appendTo : this.currentItem[0].parentNode)[0].appendChild(b[0]);
            if (b[0] == this.currentItem[0]) this._storedCSS = {
                width: this.currentItem[0].style.width,
                height: this.currentItem[0].style.height,
                position: this.currentItem.css("position"),
                top: this.currentItem.css("top"),
                left: this.currentItem.css("left")
            };
            if (b[0].style.width == "" || d.forceHelperSize) b.width(this.currentItem.width());
            if (b[0].style.height == "" || d.forceHelperSize) b.height(this.currentItem.height());
            return b
        },
        _adjustOffsetFromHelper: function (b) {
            if (typeof b == "string") b = b.split(" ");
            if (a.isArray(b)) b = {
                left: +b[0],
                top: +b[1] || 0
            };
            if ("left" in b) this.offset.click.left = b.left + this.margins.left;
            if ("right" in b) this.offset.click.left = this.helperProportions.width - b.right + this.margins.left;
            if ("top" in b) this.offset.click.top = b.top + this.margins.top;
            if ("bottom" in b) this.offset.click.top = this.helperProportions.height - b.bottom + this.margins.top
        },
        _getParentOffset: function () {
            this.offsetParent = this.helper.offsetParent();
            var b = this.offsetParent.offset();
            if (this.cssPosition == "absolute" && this.scrollParent[0] != document && a.ui.contains(this.scrollParent[0], this.offsetParent[0])) {
                b.left += this.scrollParent.scrollLeft();
                b.top += this.scrollParent.scrollTop()
            }
            if (this.offsetParent[0] == document.body || this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == "html" && a.browser.msie) b = {
                top: 0,
                left: 0
            };
            return {
                top: b.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0),
                left: b.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0)
            }
        },
        _getRelativeOffset: function () {
            if (this.cssPosition == "relative") {
                var b = this.currentItem.position();
                return {
                    top: b.top - (parseInt(this.helper.css("top"), 10) || 0) + this.scrollParent.scrollTop(),
                    left: b.left - (parseInt(this.helper.css("left"), 10) || 0) + this.scrollParent.scrollLeft()
                }
            } else return {
                top: 0,
                left: 0
            }
        },
        _cacheMargins: function () {
            this.margins = {
                left: parseInt(this.currentItem.css("marginLeft"), 10) || 0,
                top: parseInt(this.currentItem.css("marginTop"), 10) || 0
            }
        },
        _cacheHelperProportions: function () {
            this.helperProportions = {
                width: this.helper.outerWidth(),
                height: this.helper.outerHeight()
            }
        },
        _setContainment: function () {
            var b = this.options;
            if (b.containment == "parent") b.containment = this.helper[0].parentNode;
            if (b.containment == "document" || b.containment == "window") this.containment = [0 - this.offset.relative.left - this.offset.parent.left, 0 - this.offset.relative.top - this.offset.parent.top, a(b.containment == "document" ? document : window).width() - this.helperProportions.width - this.margins.left, (a(b.containment == "document" ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top];
            if (!/^(document|window|parent)$/.test(b.containment)) {
                var d = a(b.containment)[0];
                b = a(b.containment).offset();
                var c = a(d).css("overflow") != "hidden";
                this.containment = [b.left + (parseInt(a(d).css("borderLeftWidth"), 10) || 0) + (parseInt(a(d).css("paddingLeft"), 10) || 0) - this.margins.left, b.top + (parseInt(a(d).css("borderTopWidth"), 10) || 0) + (parseInt(a(d).css("paddingTop"), 10) || 0) - this.margins.top, b.left + (c ? Math.max(d.scrollWidth, d.offsetWidth) : d.offsetWidth) - (parseInt(a(d).css("borderLeftWidth"), 10) || 0) - (parseInt(a(d).css("paddingRight"), 10) || 0) - this.helperProportions.width - this.margins.left, b.top + (c ? Math.max(d.scrollHeight, d.offsetHeight) : d.offsetHeight) - (parseInt(a(d).css("borderTopWidth"), 10) || 0) - (parseInt(a(d).css("paddingBottom"), 10) || 0) - this.helperProportions.height - this.margins.top]
            }
        },
        _convertPositionTo: function (b, d) {
            if (!d) d = this.position;
            b = b == "absolute" ? 1 : -1;
            var c = this.cssPosition == "absolute" && !(this.scrollParent[0] != document && a.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent,
                e = /(html|body)/i.test(c[0].tagName);
            return {
                top: d.top + this.offset.relative.top * b + this.offset.parent.top * b - (a.browser.safari && this.cssPosition == "fixed" ? 0 : (this.cssPosition == "fixed" ? -this.scrollParent.scrollTop() : e ? 0 : c.scrollTop()) * b),
                left: d.left + this.offset.relative.left * b + this.offset.parent.left * b - (a.browser.safari && this.cssPosition == "fixed" ? 0 : (this.cssPosition == "fixed" ? -this.scrollParent.scrollLeft() : e ? 0 : c.scrollLeft()) * b)
            }
        },
        _generatePosition: function (b) {
            var d = this.options,
                c = this.cssPosition == "absolute" && !(this.scrollParent[0] != document && a.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent,
                e = /(html|body)/i.test(c[0].tagName);
            if (this.cssPosition == "relative" && !(this.scrollParent[0] != document && this.scrollParent[0] != this.offsetParent[0])) this.offset.relative = this._getRelativeOffset();
            var g = b.pageX,
                j = b.pageY;
            if (this.originalPosition) {
                if (this.containment) {
                    if (b.pageX - this.offset.click.left < this.containment[0]) g = this.containment[0] + this.offset.click.left;
                    if (b.pageY - this.offset.click.top < this.containment[1]) j = this.containment[1] + this.offset.click.top;
                    if (b.pageX - this.offset.click.left > this.containment[2]) g = this.containment[2] + this.offset.click.left;
                    if (b.pageY - this.offset.click.top > this.containment[3]) j = this.containment[3] + this.offset.click.top
                }
                if (d.grid) {
                    j = this.originalPageY + Math.round((j - this.originalPageY) / d.grid[1]) * d.grid[1];
                    j = this.containment ? !(j - this.offset.click.top < this.containment[1] || j - this.offset.click.top > this.containment[3]) ? j : !(j - this.offset.click.top < this.containment[1]) ? j - d.grid[1] : j + d.grid[1] : j;
                    g = this.originalPageX + Math.round((g - this.originalPageX) / d.grid[0]) * d.grid[0];
                    g = this.containment ? !(g - this.offset.click.left < this.containment[0] || g - this.offset.click.left > this.containment[2]) ? g : !(g - this.offset.click.left < this.containment[0]) ? g - d.grid[0] : g + d.grid[0] : g
                }
            }
            return {
                top: j - this.offset.click.top - this.offset.relative.top - this.offset.parent.top + (a.browser.safari && this.cssPosition == "fixed" ? 0 : this.cssPosition == "fixed" ? -this.scrollParent.scrollTop() : e ? 0 : c.scrollTop()),
                left: g - this.offset.click.left - this.offset.relative.left - this.offset.parent.left + (a.browser.safari && this.cssPosition == "fixed" ? 0 : this.cssPosition == "fixed" ? -this.scrollParent.scrollLeft() : e ? 0 : c.scrollLeft())
            }
        },
        _rearrange: function (b, d, c, e) {
            c ? c[0].appendChild(this.placeholder[0]) : d.item[0].parentNode.insertBefore(this.placeholder[0], this.direction == "down" ? d.item[0] : d.item[0].nextSibling);
            this.counter = this.counter ? ++this.counter : 1;
            var g = this,
                j = this.counter;
            window.setTimeout(function () {
                j == g.counter && g.refreshPositions(!e)
            }, 0)
        },
        _clear: function (b, d) {
            this.reverting = false;
            var c = [];
            !this._noFinalSort && this.currentItem[0].parentNode && this.placeholder.before(this.currentItem);
            this._noFinalSort = null;
            if (this.helper[0] == this.currentItem[0]) {
                for (var e in this._storedCSS) if (this._storedCSS[e] == "auto" || this._storedCSS[e] == "static") this._storedCSS[e] = "";
                this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper")
            } else this.currentItem.show();
            this.fromOutside && !d && c.push(function (g) {
                this._trigger("receive", g, this._uiHash(this.fromOutside))
            });
            if ((this.fromOutside || this.domPosition.prev != this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent != this.currentItem.parent()[0]) && !d) c.push(function (g) {
                this._trigger("update", g, this._uiHash())
            });
            if (!a.ui.contains(this.element[0], this.currentItem[0])) {
                d || c.push(function (g) {
                    this._trigger("remove", g, this._uiHash())
                });
                for (e = this.containers.length - 1; e >= 0; e--) if (a.ui.contains(this.containers[e].element[0], this.currentItem[0]) && !d) {
                    c.push(function (g) {
                        return function (j) {
                            g._trigger("receive", j, this._uiHash(this))
                        }
                    }.call(this, this.containers[e]));
                    c.push(function (g) {
                        return function (j) {
                            g._trigger("update", j, this._uiHash(this))
                        }
                    }.call(this, this.containers[e]))
                }
            }
            for (e = this.containers.length - 1; e >= 0; e--) {
                d || c.push(function (g) {
                    return function (j) {
                        g._trigger("deactivate", j, this._uiHash(this))
                    }
                }.call(this, this.containers[e]));
                if (this.containers[e].containerCache.over) {
                    c.push(function (g) {
                        return function (j) {
                            g._trigger("out", j, this._uiHash(this))
                        }
                    }.call(this, this.containers[e]));
                    this.containers[e].containerCache.over = 0
                }
            }
            this._storedCursor && a("body").css("cursor", this._storedCursor);
            this._storedOpacity && this.helper.css("opacity", this._storedOpacity);
            if (this._storedZIndex) this.helper.css("zIndex", this._storedZIndex == "auto" ? "" : this._storedZIndex);
            this.dragging = false;
            if (this.cancelHelperRemoval) {
                if (!d) {
                    this._trigger("beforeStop", b, this._uiHash());
                    for (e = 0; e < c.length; e++) c[e].call(this, b);
                    this._trigger("stop", b, this._uiHash())
                }
                return false
            }
            d || this._trigger("beforeStop", b, this._uiHash());
            this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
            this.helper[0] != this.currentItem[0] && this.helper.remove();
            this.helper = null;
            if (!d) {
                for (e = 0; e < c.length; e++) c[e].call(this, b);
                this._trigger("stop", b, this._uiHash())
            }
            this.fromOutside = false;
            return true
        },
        _trigger: function () {
            a.Widget.prototype._trigger.apply(this, arguments) === false && this.cancel()
        },
        _uiHash: function (b) {
            var d = b || this;
            return {
                helper: d.helper,
                placeholder: d.placeholder || a([]),
                position: d.position,
                originalPosition: d.originalPosition,
                offset: d.positionAbs,
                item: d.currentItem,
                sender: b ? b.element : null
            }
        }
    });
    a.extend(a.ui.sortable, {
        version: "1.8.7"
    })
})(jQuery);
(function (a) {
    var b = {};
    a.publish = function (d, c) {
        var e = b[d];
        e && a.each(e, function () {
            this.apply(a, c || [])
        })
    };
    a.subscribe = function (d, c) {
        b[d] || (b[d] = []);
        b[d].push(c);
        return [d, c]
    };
    a.unsubscribe = function (d) {
        var c = d[0];
        b[c] && a.each(b[c], function (e) {
            this == d[1] && b[c].splice(e, 1)
        })
    };
    a.unsubscribeAll = function (d) {
        delete b[d]
    }
})(jQuery);
TD.core.base64 = function () {
    return {
        encode: function (a) {
            var b = "",
                d, c, e, g, j, n, p = 0;
            a = a.replace(/\r\n/g, "\n");
            c = "";
            for (e = 0; e < a.length; e++) {
                g = a.charCodeAt(e);
                if (g < 128) c += String.fromCharCode(g);
                else {
                    if (g > 127 && g < 2048) c += String.fromCharCode(g >> 6 | 192);
                    else {
                        c += String.fromCharCode(g >> 12 | 224);
                        c += String.fromCharCode(g >> 6 & 63 | 128)
                    }
                    c += String.fromCharCode(g & 63 | 128)
                }
            }
            for (a = c; p < a.length;) {
                d = a.charCodeAt(p++);
                c = a.charCodeAt(p++);
                e = a.charCodeAt(p++);
                g = d >> 2;
                d = (d & 3) << 4 | c >> 4;
                j = (c & 15) << 2 | e >> 6;
                n = e & 63;
                if (isNaN(c)) j = n = 64;
                else if (isNaN(e)) n = 64;
                b = b + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(g) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(d) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(j) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(n)
            }
            return b
        },
        decode: function (a) {
            var b = "",
                d, c, e, g, j, n = 0;
            for (a = a.replace(/[^A-Za-z0-9\+\/\=]/g, ""); n < a.length;) {
                d = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(n++));
                c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(n++));
                g = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(n++));
                j = keyStr.indexOf(a.charAt(n++));
                d = d << 2 | c >> 4;
                c = (c & 15) << 4 | g >> 2;
                e = (g & 3) << 6 | j;
                b += String.fromCharCode(d);
                if (g != 64) b += String.fromCharCode(c);
                if (j != 64) b += String.fromCharCode(e)
            }
            a = b;
            b = "";
            for (j = c1 = c2 = g = 0; g < a.length;) {
                j = a.charCodeAt(g);
                if (j < 128) {
                    b += String.fromCharCode(j);
                    g++
                } else if (j > 191 && j < 224) {
                    c2 = a.charCodeAt(g + 1);
                    b += String.fromCharCode((j & 31) << 6 | c2 & 63);
                    g += 2
                } else {
                    c2 = a.charCodeAt(g + 1);
                    c3 = a.charCodeAt(g + 2);
                    b += String.fromCharCode((j & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                    g += 3
                }
            }
            return b
        }
    }
}();
(function () {
    var a = this,
        b = a._,
        d = {},
        c = Array.prototype,
        e = Object.prototype,
        g = c.slice,
        j = c.unshift,
        n = e.toString,
        p = e.hasOwnProperty,
        o = c.forEach,
        r = c.map,
        s = c.reduce,
        u = c.reduceRight,
        x = c.filter,
        y = c.every,
        I = c.some,
        G = c.indexOf,
        J = c.lastIndexOf;
    e = Array.isArray;
    var V = Object.keys,
        C = function (z) {
            return new l(z)
        };
    if (typeof module !== "undefined" && module.exports) {
        module.exports = C;
        C._ = C
    } else a._ = C;
    C.VERSION = "1.1.4";
    var Y = C.each = C.forEach = function (z, H, K) {
            if (z != null) if (o && z.forEach === o) z.forEach(H, K);
            else if (C.isNumber(z.length)) for (var R = 0, ca = z.length; R < ca; R++) {
                if (H.call(K, z[R], R, z) === d) break
            } else for (R in z) if (p.call(z, R)) if (H.call(K, z[R], R, z) === d) break
        };
    C.map = function (z, H, K) {
        var R = [];
        if (z == null) return R;
        if (r && z.map === r) return z.map(H, K);
        Y(z, function (ca, ga, qa) {
            R[R.length] = H.call(K, ca, ga, qa)
        });
        return R
    };
    C.reduce = C.foldl = C.inject = function (z, H, K, R) {
        var ca = K !== void 0;
        if (z == null) z = [];
        if (s && z.reduce === s) {
            if (R) H = C.bind(H, R);
            return ca ? z.reduce(H, K) : z.reduce(H)
        }
        Y(z, function (ga, qa, Da) {
            if (!ca && qa === 0) {
                K = ga;
                ca = true
            } else K = H.call(R, K, ga, qa, Da)
        });
        if (!ca) throw new TypeError("Reduce of empty array with no initial value");
        return K
    };
    C.reduceRight = C.foldr = function (z, H, K, R) {
        if (z == null) z = [];
        if (u && z.reduceRight === u) {
            if (R) H = C.bind(H, R);
            return K !== void 0 ? z.reduceRight(H, K) : z.reduceRight(H)
        }
        z = (C.isArray(z) ? z.slice() : C.toArray(z)).reverse();
        return C.reduce(z, H, K, R)
    };
    C.find = C.detect = function (z, H, K) {
        var R;
        na(z, function (ca, ga, qa) {
            if (H.call(K, ca, ga, qa)) {
                R = ca;
                return true
            }
        });
        return R
    };
    C.filter = C.select = function (z, H, K) {
        var R = [];
        if (z == null) return R;
        if (x && z.filter === x) return z.filter(H, K);
        Y(z, function (ca, ga, qa) {
            if (H.call(K, ca, ga, qa)) R[R.length] = ca
        });
        return R
    };
    C.reject = function (z, H, K) {
        var R = [];
        if (z == null) return R;
        Y(z, function (ca, ga, qa) {
            H.call(K, ca, ga, qa) || (R[R.length] = ca)
        });
        return R
    };
    C.every = C.all = function (z, H, K) {
        H = H || C.identity;
        var R = true;
        if (z == null) return R;
        if (y && z.every === y) return z.every(H, K);
        Y(z, function (ca, ga, qa) {
            if (!(R = R && H.call(K, ca, ga, qa))) return d
        });
        return R
    };
    var na = C.some = C.any = function (z, H, K) {
            H = H || C.identity;
            var R = false;
            if (z == null) return R;
            if (I && z.some === I) return z.some(H, K);
            Y(z, function (ca, ga, qa) {
                if (R = H.call(K, ca, ga, qa)) return d
            });
            return R
        };
    C.include = C.contains = function (z, H) {
        var K = false;
        if (z == null) return K;
        if (G && z.indexOf === G) return z.indexOf(H) != -1;
        na(z, function (R) {
            if (K = R === H) return true
        });
        return K
    };
    C.invoke = function (z, H) {
        var K = g.call(arguments, 2);
        return C.map(z, function (R) {
            return (H ? R[H] : R).apply(R, K)
        })
    };
    C.pluck = function (z, H) {
        return C.map(z, function (K) {
            return K[H]
        })
    };
    C.max = function (z, H, K) {
        if (!H && C.isArray(z)) return Math.max.apply(Math, z);
        var R = {
            computed: -Infinity
        };
        Y(z, function (ca, ga, qa) {
            ga = H ? H.call(K, ca, ga, qa) : ca;
            ga >= R.computed && (R = {
                value: ca,
                computed: ga
            })
        });
        return R.value
    };
    C.min = function (z, H, K) {
        if (!H && C.isArray(z)) return Math.min.apply(Math, z);
        var R = {
            computed: Infinity
        };
        Y(z, function (ca, ga, qa) {
            ga = H ? H.call(K, ca, ga, qa) : ca;
            ga < R.computed && (R = {
                value: ca,
                computed: ga
            })
        });
        return R.value
    };
    C.sortBy = function (z, H, K) {
        return C.pluck(C.map(z, function (R, ca, ga) {
            return {
                value: R,
                criteria: H.call(K, R, ca, ga)
            }
        }).sort(function (R, ca) {
            var ga = R.criteria,
                qa = ca.criteria;
            return ga < qa ? -1 : ga > qa ? 1 : 0
        }), "value")
    };
    C.sortedIndex = function (z, H, K) {
        K = K || C.identity;
        for (var R = 0, ca = z.length; R < ca;) {
            var ga = R + ca >> 1;
            K(z[ga]) < K(H) ? R = ga + 1 : ca = ga
        }
        return R
    };
    C.toArray = function (z) {
        if (!z) return [];
        if (z.toArray) return z.toArray();
        if (C.isArray(z)) return z;
        if (C.isArguments(z)) return g.call(z);
        return C.values(z)
    };
    C.size = function (z) {
        return C.toArray(z).length
    };
    C.first = C.head = function (z, H, K) {
        return H && !K ? g.call(z, 0, H) : z[0]
    };
    C.rest = C.tail = function (z, H, K) {
        return g.call(z, C.isUndefined(H) || K ? 1 : H)
    };
    C.last = function (z) {
        return z[z.length - 1]
    };
    C.compact = function (z) {
        return C.filter(z, function (H) {
            return !!H
        })
    };
    C.flatten = function (z) {
        return C.reduce(z, function (H, K) {
            if (C.isArray(K)) return H.concat(C.flatten(K));
            H[H.length] = K;
            return H
        }, [])
    };
    C.without = function (z) {
        var H = g.call(arguments, 1);
        return C.filter(z, function (K) {
            return !C.include(H, K)
        })
    };
    C.uniq = C.unique = function (z, H) {
        return C.reduce(z, function (K, R, ca) {
            if (0 == ca || (H === true ? C.last(K) != R : !C.include(K, R))) K[K.length] = R;
            return K
        }, [])
    };
    C.intersect = function (z) {
        var H = g.call(arguments, 1);
        return C.filter(C.uniq(z), function (K) {
            return C.every(H, function (R) {
                return C.indexOf(R, K) >= 0
            })
        })
    };
    C.zip = function () {
        for (var z = g.call(arguments), H = C.max(C.pluck(z, "length")), K = Array(H), R = 0; R < H; R++) K[R] = C.pluck(z, "" + R);
        return K
    };
    C.indexOf = function (z, H, K) {
        if (z == null) return -1;
        if (K) {
            K = C.sortedIndex(z, H);
            return z[K] === H ? K : -1
        }
        if (G && z.indexOf === G) return z.indexOf(H);
        K = 0;
        for (var R = z.length; K < R; K++) if (z[K] === H) return K;
        return -1
    };
    C.lastIndexOf = function (z, H) {
        if (z == null) return -1;
        if (J && z.lastIndexOf === J) return z.lastIndexOf(H);
        for (var K = z.length; K--;) if (z[K] === H) return K;
        return -1
    };
    C.range = function (z, H, K) {
        var R = g.call(arguments),
            ca = R.length <= 1;
        z = ca ? 0 : R[0];
        H = ca ? R[0] : R[1];
        K = R[2] || 1;
        R = Math.max(Math.ceil((H - z) / K), 0);
        ca = 0;
        for (var ga = Array(R); ca < R;) {
            ga[ca++] = z;
            z += K
        }
        return ga
    };
    C.bind = function (z, H) {
        var K = g.call(arguments, 2);
        return function () {
            return z.apply(H || {}, K.concat(g.call(arguments)))
        }
    };
    C.bindAll = function (z) {
        var H = g.call(arguments, 1);
        if (H.length == 0) H = C.functions(z);
        Y(H, function (K) {
            z[K] = C.bind(z[K], z)
        });
        return z
    };
    C.memoize = function (z, H) {
        var K = {};
        H = H || C.identity;
        return function () {
            var R = H.apply(this, arguments);
            return R in K ? K[R] : K[R] = z.apply(this, arguments)
        }
    };
    C.delay = function (z, H) {
        var K = g.call(arguments, 2);
        return setTimeout(function () {
            return z.apply(z, K)
        }, H)
    };
    C.defer = function (z) {
        return C.delay.apply(C, [z, 1].concat(g.call(arguments, 1)))
    };
    var U = function (z, H, K) {
            var R;
            return function () {
                var ca = this,
                    ga = arguments,
                    qa = function () {
                        R = null;
                        z.apply(ca, ga)
                    };
                K && clearTimeout(R);
                if (K || !R) R = setTimeout(qa, H)
            }
        };
    C.throttle = function (z, H) {
        return U(z, H, false)
    };
    C.debounce = function (z, H) {
        return U(z, H, true)
    };
    C.wrap = function (z, H) {
        return function () {
            var K = [z].concat(g.call(arguments));
            return H.apply(this, K)
        }
    };
    C.compose = function () {
        var z = g.call(arguments);
        return function () {
            for (var H = g.call(arguments), K = z.length - 1; K >= 0; K--) H = [z[K].apply(this, H)];
            return H[0]
        }
    };
    C.keys = V ||
    function (z) {
        if (C.isArray(z)) return C.range(0, z.length);
        var H = [],
            K;
        for (K in z) if (p.call(z, K)) H[H.length] = K;
        return H
    };
    C.values = function (z) {
        return C.map(z, C.identity)
    };
    C.functions = C.methods = function (z) {
        return C.filter(C.keys(z), function (H) {
            return C.isFunction(z[H])
        }).sort()
    };
    C.extend = function (z) {
        Y(g.call(arguments, 1), function (H) {
            for (var K in H) z[K] = H[K]
        });
        return z
    };
    C.clone = function (z) {
        return C.isArray(z) ? z.slice() : C.extend({}, z)
    };
    C.tap = function (z, H) {
        H(z);
        return z
    };
    C.isEqual = function (z, H) {
        if (z === H) return true;
        var K = typeof z;
        if (K != typeof H) return false;
        if (z == H) return true;
        if (!z && H || z && !H) return false;
        if (z._chain) z = z._wrapped;
        if (H._chain) H = H._wrapped;
        if (z.isEqual) return z.isEqual(H);
        if (C.isDate(z) && C.isDate(H)) return z.getTime() === H.getTime();
        if (C.isNaN(z) && C.isNaN(H)) return false;
        if (C.isRegExp(z) && C.isRegExp(H)) return z.source === H.source && z.global === H.global && z.ignoreCase === H.ignoreCase && z.multiline === H.multiline;
        if (K !== "object") return false;
        if (z.length && z.length !== H.length) return false;
        K = C.keys(z);
        var R = C.keys(H);
        if (K.length != R.length) return false;
        for (var ca in z) if (!(ca in H) || !C.isEqual(z[ca], H[ca])) return false;
        return true
    };
    C.isEmpty = function (z) {
        if (C.isArray(z) || C.isString(z)) return z.length === 0;
        for (var H in z) if (p.call(z, H)) return false;
        return true
    };
    C.isElement = function (z) {
        return !!(z && z.nodeType == 1)
    };
    C.isArray = e ||
    function (z) {
        return n.call(z) === "[object Array]"
    };
    C.isArguments = function (z) {
        return !!(z && p.call(z, "callee"))
    };
    C.isFunction = function (z) {
        return !!(z && z.constructor && z.call && z.apply)
    };
    C.isString = function (z) {
        return !!(z === "" || z && z.charCodeAt && z.substr)
    };
    C.isNumber = function (z) {
        return !!(z === 0 || z && z.toExponential && z.toFixed)
    };
    C.isNaN = function (z) {
        return z !== z
    };
    C.isBoolean = function (z) {
        return z === true || z === false
    };
    C.isDate = function (z) {
        return !!(z && z.getTimezoneOffset && z.setUTCFullYear)
    };
    C.isRegExp = function (z) {
        return !!(z && z.test && z.exec && (z.ignoreCase || z.ignoreCase === false))
    };
    C.isNull = function (z) {
        return z === null
    };
    C.isUndefined = function (z) {
        return z === void 0
    };
    C.noConflict = function () {
        a._ = b;
        return this
    };
    C.identity = function (z) {
        return z
    };
    C.times = function (z, H, K) {
        for (var R = 0; R < z; R++) H.call(K, R)
    };
    C.mixin = function (z) {
        Y(C.functions(z), function (H) {
            ta(H, C[H] = z[H])
        })
    };
    var Q = 0;
    C.uniqueId = function (z) {
        var H = Q++;
        return z ? z + H : H
    };
    C.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g
    };
    C.template = function (z, H) {
        var K = C.templateSettings;
        K = "var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('" + z.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(K.interpolate, function (R, ca) {
            return "'," + ca.replace(/\\'/g, "'") + ",'"
        }).replace(K.evaluate || null, function (R, ca) {
            return "');" + ca.replace(/\\'/g, "'").replace(/[\r\n\t]/g, " ") + "__p.push('"
        }).replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t") + "');}return __p.join('');";
        K = new Function("obj", K);
        return H ? K(H) : K
    };
    var l = function (z) {
            this._wrapped = z
        };
    C.prototype = l.prototype;
    var ka = function (z, H) {
            return H ? C(z).chain() : z
        },
        ta = function (z, H) {
            l.prototype[z] = function () {
                var K = g.call(arguments);
                j.call(K, this._wrapped);
                return ka(H.apply(C, K), this._chain)
            }
        };
    C.mixin(C);
    Y(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function (z) {
        var H = c[z];
        l.prototype[z] = function () {
            H.apply(this._wrapped, arguments);
            return ka(this._wrapped, this._chain)
        }
    });
    Y(["concat", "join", "slice"], function (z) {
        var H = c[z];
        l.prototype[z] = function () {
            return ka(H.apply(this._wrapped, arguments), this._chain)
        }
    });
    l.prototype.chain = function () {
        this._chain = true;
        return this
    };
    l.prototype.value = function () {
        return this._wrapped
    }
})();
(function () {
    function a(c) {
        if (c) return d.escapeRegExp(c);
        return "\\s"
    }
    var b = String.prototype.trim,
        d;
    d = this._s = {
        capitalize: function (c) {
            return c.charAt(0).toUpperCase() + c.substring(1).toLowerCase()
        },
        join: function (c) {
            for (var e = "", g = 1; g < arguments.length; g += 1) {
                e += String(arguments[g]);
                if (g !== arguments.length - 1) e += String(c)
            }
            return e
        },
        escapeRegExp: function (c) {
            return c.replace(/([-.*+?^${}()|[\]\/\\])/g, "\\$1")
        },
        reverse: function (c) {
            return Array.prototype.reverse.apply(c.split("")).join("")
        },
        contains: function (c, e) {
            return c.indexOf(e) !== -1
        },
        clean: function (c) {
            return d.strip(c.replace(/\s+/g, " "))
        },
        trim: function (c, e) {
            if (!e && b) return b.call(c);
            e = a(e);
            return c.replace(RegExp("^[" + e + "]+|[" + e + "]+$", "g"), "")
        },
        ltrim: function (c, e) {
            e = a(e);
            return c.replace(RegExp("^[" + e + "]+", "g"), "")
        },
        rtrim: function (c, e) {
            e = a(e);
            return c.replace(RegExp("[" + e + "]+$", "g"), "")
        },
        startsWith: function (c, e) {
            return c.length >= e.length && c.substring(0, e.length) === e
        },
        endsWith: function (c, e) {
            return c.length >= e.length && c.substring(c.length - e.length) === e
        },
        sprintf: function () {
            for (var c = 0, e, g = arguments[c++], j = [], n, p, o; g;) {
                if (n = /^[^\x25]+/.exec(g)) j.push(n[0]);
                else if (n = /^\x25{2}/.exec(g)) j.push("%");
                else if (n = /^\x25(?:(\d+)\$)?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(g)) {
                    if ((e = arguments[n[1] || c++]) == null || e == undefined) throw "Too few arguments.";
                    if (/[^s]/.test(n[7]) && typeof e != "number") throw "Expecting number but found " + typeof e;
                    switch (n[7]) {
                    case "b":
                        e = e.toString(2);
                        break;
                    case "c":
                        e = String.fromCharCode(e);
                        break;
                    case "d":
                        e = parseInt(e);
                        break;
                    case "e":
                        e = n[6] ? e.toExponential(n[6]) : e.toExponential();
                        break;
                    case "f":
                        e = n[6] ? parseFloat(e).toFixed(n[6]) : parseFloat(e);
                        break;
                    case "o":
                        e = e.toString(8);
                        break;
                    case "s":
                        e = (e = String(e)) && n[6] ? e.substring(0, n[6]) : e;
                        break;
                    case "u":
                        e = Math.abs(e);
                        break;
                    case "x":
                        e = e.toString(16);
                        break;
                    case "X":
                        e = e.toString(16).toUpperCase()
                    }
                    e = /[def]/.test(n[7]) && n[2] && e >= 0 ? "+" + e : e;
                    p = n[3] ? n[3] == "0" ? "0" : n[3].charAt(1) : " ";
                    o = n[5] - String(e).length - 0;
                    if (n[5]) {
                        for (var r = []; o > 0; r[--o] = p);
                        p = r.join("")
                    } else p = "";
                    j.push("" + (n[4] ? e + p : p + e))
                } else throw "Huh ?!";
                g = g.substring(n[0].length)
            }
            return j.join("")
        }
    };
    this._s.strip = d.trim;
    this._s.lstrip = d.ltrim;
    this._s.rstrip = d.rtrim;
    this._ && this._.mixin(this._s)
})();
TD.core.sha1 = function (a) {
    function b(J, V) {
        return J << V | J >>> 32 - V
    }
    function d(J) {
        var V = "",
            C, Y;
        for (C = 7; C >= 0; C--) {
            Y = J >>> C * 4 & 15;
            V += Y.toString(16)
        }
        return V
    }
    var c, e, g = Array(80),
        j = 1732584193,
        n = 4023233417,
        p = 2562383102,
        o = 271733878,
        r = 3285377520,
        s, u, x, y, I;
    a = function (J) {
        J = J.replace(/\r\n/g, "\n");
        for (var V = "", C = 0; C < J.length; C++) {
            var Y = J.charCodeAt(C);
            if (Y < 128) V += String.fromCharCode(Y);
            else {
                if (Y > 127 && Y < 2048) V += String.fromCharCode(Y >> 6 | 192);
                else {
                    V += String.fromCharCode(Y >> 12 | 224);
                    V += String.fromCharCode(Y >> 6 & 63 | 128)
                }
                V += String.fromCharCode(Y & 63 | 128)
            }
        }
        return V
    }(a);
    s = a.length;
    var G = [];
    for (c = 0; c < s - 3; c += 4) {
        e = a.charCodeAt(c) << 24 | a.charCodeAt(c + 1) << 16 | a.charCodeAt(c + 2) << 8 | a.charCodeAt(c + 3);
        G.push(e)
    }
    switch (s % 4) {
    case 0:
        c = 2147483648;
        break;
    case 1:
        c = a.charCodeAt(s - 1) << 24 | 8388608;
        break;
    case 2:
        c = a.charCodeAt(s - 2) << 24 | a.charCodeAt(s - 1) << 16 | 32768;
        break;
    case 3:
        c = a.charCodeAt(s - 3) << 24 | a.charCodeAt(s - 2) << 16 | a.charCodeAt(s - 1) << 8 | 128
    }
    for (G.push(c); G.length % 16 != 14;) G.push(0);
    G.push(s >>> 29);
    G.push(s << 3 & 4294967295);
    for (a = 0; a < G.length; a += 16) {
        for (c = 0; c < 16; c++) g[c] = G[a + c];
        for (c = 16; c <= 79; c++) g[c] = b(g[c - 3] ^ g[c - 8] ^ g[c - 14] ^ g[c - 16], 1);
        e = j;
        s = n;
        u = p;
        x = o;
        y = r;
        for (c = 0; c <= 19; c++) {
            I = b(e, 5) + (s & u | ~s & x) + y + g[c] + 1518500249 & 4294967295;
            y = x;
            x = u;
            u = b(s, 30);
            s = e;
            e = I
        }
        for (c = 20; c <= 39; c++) {
            I = b(e, 5) + (s ^ u ^ x) + y + g[c] + 1859775393 & 4294967295;
            y = x;
            x = u;
            u = b(s, 30);
            s = e;
            e = I
        }
        for (c = 40; c <= 59; c++) {
            I = b(e, 5) + (s & u | s & x | u & x) + y + g[c] + 2400959708 & 4294967295;
            y = x;
            x = u;
            u = b(s, 30);
            s = e;
            e = I
        }
        for (c = 60; c <= 79; c++) {
            I = b(e, 5) + (s ^ u ^ x) + y + g[c] + 3395469782 & 4294967295;
            y = x;
            x = u;
            u = b(s, 30);
            s = e;
            e = I
        }
        j = j + e & 4294967295;
        n = n + s & 4294967295;
        p = p + u & 4294967295;
        o = o + x & 4294967295;
        r = r + y & 4294967295
    }
    I = d(j) + d(n) + d(p) + d(o) + d(r);
    return I.toLowerCase()
};
window.Modernizr = function (a, b, d) {
    function c(y, I) {
        for (var G in y) if (n[y[G]] !== d && (!I || I(y[G], j))) return true
    }
    var e = {},
        g = b.documentElement;
    b.head || b.getElementsByTagName("head");
    var j = b.createElement("modernizr"),
        n = j.style;
    b.createElement("input");
    " -webkit- -moz- -o- -ms- -khtml- ".split(" ");
    var p = "Webkit Moz O ms Khtml".split(" ");
    a = {};
    var o = [],
        r;
    (function () {
        var y = {
            select: "input",
            change: "input",
            submit: "form",
            reset: "form",
            error: "img",
            load: "img",
            abort: "img"
        };
        return function (I, G) {
            G = G || b.createElement(y[I] || "div");
            var J = (I = "on" + I) in G;
            J || (G.setAttribute || (G = b.createElement("div")), G.setAttribute && G.removeAttribute && (G.setAttribute(I, ""), J = typeof G[I] === "function", typeof G[I] === d || (G[I] = d), G.removeAttribute(I)));
            return J
        }
    })();
    var s = {}.hasOwnProperty,
        u;
    typeof s === d || typeof s.call === d ? u = function (y, I) {
        return I in y && typeof y.constructor.prototype[I] === d
    } : u = function (y, I) {
        return s.call(y, I)
    };
    a.csstransforms = function () {
        return !!c(["transformProperty", "WebkitTransform", "MozTransform", "OTransform", "msTransform"])
    };
    a.csstransitions = function () {
        var y = "transitionProperty".charAt(0).toUpperCase() + "ransitionProperty";
        y = ("transitionProperty " + p.join(y + " ") + y).split(" ");
        return !!c(y, void 0)
    };
    for (var x in a) u(a, x) && (r = x.toLowerCase(), e[r] = a[x](), o.push((e[r] ? "" : "no-") + r));
    e.crosswindowmessaging = e.postmessage;
    e.historymanagement = e.history;
    e.addTest = function (y, I) {
        y = y.toLowerCase();
        if (!e[y]) {
            I = !! I();
            g.className += " " + (I ? "" : "no-") + y;
            e[y] = I;
            return e
        }
    };
    n.cssText = "";
    j = null;
    e._enableHTML5 = true;
    e._version = "1.7";
    g.className = g.className.replace(/\bno-js\b/, "") + " js " + o.join(" ");
    return e
}(this, this.document);
TD.services.bitly = function () {
    var a = {},
        b, d;
    a.setUserAccount = function (c, e) {
        if (b) b = c;
        if (e) d = e
    };
    a.shorten = function (c, e) {
        if (!_.startsWith(c, "http://") && !_.startsWith(c, "https://")) c = "http://" + c;
        var g = {
            longUrl: c
        };
        g.login = "tweetdeckapi";
        g.apiKey = "R_b8032856b71a14fabfe64f6845689ddf";
        g.format = "json";
        g.domain = "j.mp";
        if (b) {
            g.x_login = b;
            g.x_apiKey = d
        }
        TD.net.ajax.jsonp("http://api.bitly.com/v3/shorten", g, e)
    };
    return a
}();
TD.services.translation = function () {
    var a = {},
        b;
    a.callback = function (d) {
        d.data && d.data.translations && d.data.translations.length ? b(d.data.translations[0].translatedText) : b()
    };
    a.translate = function (d, c) {
        var e = {
            callback: "TD.services.translation.callback",
            q: d,
            key: "AIzaSyBkULrn_Wc1mN1cAhQCtC6_QBnh1E7HGRk"
        },
            g = TD.util.i18n.getLocale();
        e.target = g.split("_")[0];
        b = c;
        g = "https://www.googleapis.com/language/translate/v2";
        var j = [],
            n;
        for (n in e) j.push(n + "=" + encodeURIComponent(e[n]));
        g += "?" + j.join("&");
        e = g;
        n = document.createElement("script");
        n.setAttribute("language", "javascript");
        n.setAttribute("type", "text/javascript");
        n.setAttribute("src", e);
        document.body.appendChild(n)
    };
    return a
}();
TD.services.media = function () {
    var a = {},
        b = /http:\/\/(.*youtube\.com\/watch.*|.*\.youtube\.com\/v\/.*|youtu\.be\/.*|.*\.youtube\.com\/user\/.*|.*\.youtube\.com\/.*#.*\/.*|m\.youtube\.com\/watch.*|m\.youtube\.com\/index.*|.*\.youtube\.com\/profile.*|www\.ustream\.tv\/recorded\/.*|www\.ustream\.tv\/channel\/.*|www\.ustream\.tv\/.*|qik\.com\/video\/.*|qik\.com\/.*|qik\.ly\/.*|.*revision3\.com\/.*|.*\.dailymotion\.com\/video\/.*|.*\.dailymotion\.com\/.*\/video\/.*|www\.collegehumor\.com\/video:.*|.*twitvid\.com\/.*|www\.break\.com\/.*\/.*|vids\.myspace\.com\/index\.cfm\?fuseaction=vids\.individual&videoid.*|www\.myspace\.com\/index\.cfm\?fuseaction=.*&videoid.*|www\.metacafe\.com\/watch\/.*|www\.metacafe\.com\/w\/.*|video\.google\.com\/videoplay\?.*|video\.yahoo\.com\/watch\/.*\/.*|video\.yahoo\.com\/network\/.*|.*viddler\.com\/explore\/.*\/videos\/.*|.*yfrog\..*\/.*|tweetphoto\.com\/.*|www\.flickr\.com\/photos\/.*|flic\.kr\/.*|twitpic\.com\/.*|www\.twitpic\.com\/.*|twitpic\.com\/photos\/.*|www\.twitpic\.com\/photos\/.*|.*\.posterous\.com\/.*|post\.ly\/.*|twitgoo\.com\/.*|i.*\.photobucket\.com\/albums\/.*|s.*\.photobucket\.com\/albums\/.*|www\.mobypicture\.com\/user\/.*\/view\/.*|moby\.to\/.*|xkcd\.com\/.*|www\.xkcd\.com\/.*|imgs\.xkcd\.com\/.*|.*dribbble\.com\/shots\/.*|drbl\.in\/.*|.*\.smugmug\.com\/.*|.*\.smugmug\.com\/.*#.*|emberapp\.com\/.*\/images\/.*|emberapp\.com\/.*\/images\/.*\/sizes\/.*|emberapp\.com\/.*\/collections\/.*\/.*|emberapp\.com\/.*\/categories\/.*\/.*\/.*|embr\.it\/.*|picasaweb\.google\.com.*\/.*\/.*#.*|picasaweb\.google\.com.*\/lh\/photo\/.*|picasaweb\.google\.com.*\/.*\/.*|dailybooth\.com\/.*\/.*|brizzly\.com\/pic\/.*|pics\.brizzly\.com\/.*\.jpg|img\.ly\/.*|.*\.deviantart\.com\/art\/.*|.*\.deviantart\.com\/gallery\/.*|.*\.deviantart\.com\/#\/.*|fav\.me\/.*|.*\.deviantart\.com|.*\.deviantart\.com\/gallery|.*\.deviantart\.com\/.*\/.*\.jpg|.*\.deviantart\.com\/.*\/.*\.gif|.*\.deviantart\.net\/.*\/.*\.jpg|.*\.deviantart\.net\/.*\/.*\.gif|plixi\.com\/p\/.*|plixi\.com\/profile\/home\/.*|plixi\.com\/.*|share\.ovi\.com\/media\/.*\/.*|www\.hulu\.com\/watch.*|www\.hulu\.com\/w\/.*|hulu\.com\/watch.*|hulu\.com\/w\/.*|www\.vimeo\.com\/groups\/.*\/videos\/.*|www\.vimeo\.com\/.*|vimeo\.com\/m\/#\/featured\/.*|vimeo\.com\/groups\/.*\/videos\/.*|vimeo\.com\/.*|vimeo\.com\/m\/#\/featured\/.*|www\.ted\.com\/talks\/.*\.html.*|www\.ted\.com\/talks\/lang\/.*\/.*\.html.*|www\.ted\.com\/index\.php\/talks\/.*\.html.*|www\.ted\.com\/index\.php\/talks\/lang\/.*\/.*\.html.*|www\.theonion\.com\/video\/.*|theonion\.com\/video\/.*|wordpress\.tv\/.*\/.*\/.*\/.*\/|techcrunch\.tv\/watch.*|techcrunch\.tv\/.*\/watch.*|tv\.digg\.com\/diggnation\/.*|tv\.digg\.com\/diggreel\/.*|tv\.digg\.com\/diggdialogg\/.*|soundcloud\.com\/.*|soundcloud\.com\/.*\/.*|soundcloud\.com\/.*\/sets\/.*|soundcloud\.com\/groups\/.*|snd\.sc\/.*|www\.last\.fm\/music\/.*|www\.last\.fm\/music\/+videos\/.*|www\.last\.fm\/music\/+images\/.*|www\.last\.fm\/music\/.*\/_\/.*|www\.last\.fm\/music\/.*\/.*|www\.mixcloud\.com\/.*\/.*\/|www\.audioboo\.fm\/boos\/.*|audioboo\.fm\/boos\/.*|boo\.fm\/b.*|www\.slideshare\.net\/.*\/.*|www\.slideshare\.net\/mobile\/.*\/.*http:\/\/(www\.facebook\.com\/photo\.php.*|www\.facebook\.com\/video\/video\.php.*|www\.facebook\.com\/v\/.*))/i,
        d = {},
        c = {},
        e = function (n, p) {
            var o, r, s, u, x, y;
            if (!n || !n.thumbnail_url) return null;
            s = d[p.url];
            y = {
                url: p.url,
                oembed: n
            };
            for (o = 0; o < s.length; o++) {
                r = s[o];
                x = $(r).closest("section").attr("data-column");
                r = $(r).closest("article");
                r = $(".updateDetail", r);
                if (r.children().length > 0) {
                    u = TD.ui.template.render("media/mediapreviewmulti", y);
                    if (!r.children(".prevMultiImage").length) {
                        x = $(".prevImage", r);
                        x.removeClass().addClass("prevMultiImage")
                    }
                    x = $(u).css({
                        display: "none"
                    });
                    r.append(x)
                } else {
                    TD.ui.columns.freezeScroll(x);
                    u = TD.ui.template.render("status/mediapreview", y);
                    r.prepend(u);
                    TD.ui.columns.unfreezeScroll(x)
                }
            }
            c[p.url] = n;
            delete d[p.url]
        },
        g = function (n) {
            return {
                thumbnail_url: "http://api.plixi.com/api/tpapi.svc/imagefromurl?size=thumbnail&url=" + n,
                url: "http://api.plixi.com/api/tpapi.svc/imagefromurl?size=medium&url=" + n,
                type: "photo",
                provider_name: "Lockerz"
            }
        },
        j = [
            [/http(s)?:\/\/twitter.com\/\w+\/status\/[0-9]+\/photo\/[0-9]+/, function (n, p) {
                var o = p.attr("data-media-url"),
                    r = p.attr("data-media-thumb-url");
                return o && r ? {
                    thumbnail_url: r,
                    url: o,
                    type: "photo",
                    provider_name: "Twitter"
                } : null
            }],
            [/(http:\/\/|www.)?twitpic.com\/\w+/, function (n) {
                return {
                    thumbnail_url: "http://twitpic.com/show/thumb/" + n.split("/").pop(),
                    url: "http://twitpic.com/show/full/" + n.split("/").pop(),
                    type: "photo",
                    provider_name: "Twitpic"
                }
            }],
            [/(http:\/\/|www.)?yfrog.com\/\w+/, function (n) {
                return {
                    thumbnail_url: n + ":small",
                    url: n + ":iphone",
                    type: "photo",
                    provider_name: "YFrog"
                }
            }],
            [/(http:\/\/|www.)?plixi.com\/p\/[0-9]+/, g],
            [/(http:\/\/|www.)?lockerz.com\/s\/[0-9]+/, g],
            [/(http:\/\/|www.)?instagr.am\/p\/\w+(\/)/, function (n) {
                if (_.endsWith(n, "/")) n = n.substring(0, n.length - 1);
                n = "http://instagr.am/p/" + n.split("/").pop() + "/media/?size=";
                return {
                    thumbnail_url: n + "t",
                    url: n + "l",
                    type: "photo",
                    provider_name: "Instagr.am"
                }
            }]
        ];
    a.getEmbedableContent = function () {
        var n = [],
            p = function (o) {
                o.attr("rel", "mediaPreviewLink")
            };
        $("div.update a:not(.embed)", "article.twitter").addClass("embed").each(function () {
            var o = $(this),
                r = o.attr("title") || o.attr("data-full-url") || o.attr("href");
            if (typeof r != "undefined") if (c[r]) {
                d[r] = [this];
                e(c[r], {
                    url: r
                });
                p(o)
            } else if (d[r]) {
                d[r].push(this);
                p(o)
            } else {
                for (var s = 0; s < j.length; s++) {
                    var u = r.match(j[s][0]);
                    if (u && u[0] == r) if (u = j[s][1](r, o)) {
                        d[r] = [this];
                        p(o);
                        e(u, {
                            url: r
                        });
                        return
                    }
                }
                if (u = r.match(b)) {
                    d[r] = [this];
                    p(o);
                    n.push(r)
                }
            }
        });
        n.length && $.embedly(n, {
            maxwidth: 500,
            maxheight: 500,
            wmode: "opaque",
            urlRe: b,
            key: "1db5affa06d111e084894040444cdc60"
        }, e)
    };
    a.createVideoEmbed = function (n, p, o, r) {
        var s = {};
        s.type = "video";
        s.provider_name = "Video";
        s.height = 360;
        s.width = 640;
        s.title = n;
        if (r) {
            n = TD.ui.template.render("media/oembed", {
                url: o
            });
            s.html = n
        } else s.html = o;
        c[p] = s
    };
    a.getMedia = function (n, p, o, r) {
        if (c[n]) o(c[n]);
        else _.contains(n, "facebook.com/photo.php") ? TD.controller.clients.getClient(p).getPhotoInfo(n, function (s) {
            o({
                thumbnail_url: s.picture,
                url: s.source,
                type: "photo",
                provider_name: "Facebook"
            })
        }) : r()
    };
    return a
}();
TD.services.wtt = function () {
    var a = {};
    TREND_CACHE = {};
    var b = function (c) {
            c = TREND_CACHE[c];
            var e = new Date;
            if (c && e - c[1] < 6E4) return c[0]
        },
        d = function (c, e) {
            var g, j;
            for (g = 0; g < e.length; g++) if (e[g].name.toLowerCase() == c.toLowerCase()) {
                j = e[g];
                break
            }
            if (j) return {
                desc: j.description ? j.description.text : "",
                name: j.name
            }
        };
    a.getTrends = function (c, e, g, j) {
        var n = {
            api_key: "6a3b8ee39db8871646105d45ed93531a35740694"
        },
            p, o = function (r) {
                console.error("Error fetching what the trend ", r);
                j({
                    name: c
                })
            };
        if (p = b(e)) if (p = d(c, p)) {
            g(p);
            return
        }
        n.woeid = e;
        TD.net.ajax.jsonp("http://api.whatthetrend.com/api/v2/trends.json", n, function (r) {
            var s = r.trends;
            s || o(r);
            TREND_CACHE[e] = [s, new Date];
            (r = d(c, s)) ? g(r) : g({
                name: c
            })
        }, o)
    };
    return a
}();
(function () {
    var a = function (p) {
            var o = [],
                r = p.length * 8,
                s;
            for (s = 0; s < r; s += 8) o[s >> 5] |= (p.charCodeAt(s / 8) & 255) << 24 - s % 32;
            return o
        },
        b = function (p) {
            var o = [],
                r = p.length,
                s, u;
            for (s = 0; s < r; s += 2) {
                u = parseInt(p.substr(s, 2), 16);
                if (isNaN(u)) return "INVALID HEX STRING";
                else o[s >> 3] |= u << 24 - 4 * (s % 8)
            }
            return o
        },
        d = function (p) {
            var o = "",
                r = p.length * 4,
                s, u;
            for (s = 0; s < r; s += 1) {
                u = p[s >> 2] >> (3 - s % 4) * 8;
                o += "0123456789abcdef".charAt(u >> 4 & 15) + "0123456789abcdef".charAt(u & 15)
            }
            return o
        },
        c = function (p) {
            var o = "",
                r = p.length * 4,
                s, u, x;
            for (s = 0; s < r; s += 3) {
                x = (p[s >> 2] >> 8 * (3 - s % 4) & 255) << 16 | (p[s + 1 >> 2] >> 8 * (3 - (s + 1) % 4) & 255) << 8 | p[s + 2 >> 2] >> 8 * (3 - (s + 2) % 4) & 255;
                for (u = 0; u < 4; u += 1) o += s * 8 + u * 6 <= p.length * 32 ? "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(x >> 6 * (3 - u) & 63) : "="
            }
            return o
        },
        e = function (p, o) {
            return p >>> o | p << 32 - o
        },
        g = function (p, o) {
            var r = (p & 65535) + (o & 65535);
            return ((p >>> 16) + (o >>> 16) + (r >>> 16) & 65535) << 16 | r & 65535
        },
        j = function (p, o, r) {
            var s, u, x, y, I, G, J, V, C, Y, na, U, Q, l = [],
                ka;
            if (r === "SHA-224" || r === "SHA-256") {
                s = (o + 65 >> 9 << 4) + 15;
                Q = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298];
                Y = r === "SHA-224" ? [3238371032, 914150663, 812702999, 4144912697, 4290775857, 1750603025, 1694076839, 3204075428] : [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225]
            }
            p[o >> 5] |= 128 << 24 - o % 32;
            p[s] = o;
            ka = p.length;
            for (na = 0; na < ka; na += 16) {
                o = Y[0];
                s = Y[1];
                u = Y[2];
                x = Y[3];
                y = Y[4];
                I = Y[5];
                G = Y[6];
                J = Y[7];
                for (U = 0; U < 64; U += 1) {
                    V = l;
                    C = U;
                    var ta;
                    if (U < 16) ta = p[U + na];
                    else {
                        ta = e(l[U - 2], 17) ^ e(l[U - 2], 19) ^ l[U - 2] >>> 10;
                        var z = l[U - 7],
                            H = e(l[U - 15], 7) ^ e(l[U - 15], 18) ^ l[U - 15] >>> 3,
                            K = l[U - 16],
                            R = (ta & 65535) + (z & 65535) + (H & 65535) + (K & 65535);
                        ta = ((ta >>> 16) + (z >>> 16) + (H >>> 16) + (K >>> 16) + (R >>> 16) & 65535) << 16 | R & 65535
                    }
                    V[C] = ta;
                    V = e(y, 6) ^ e(y, 11) ^ e(y, 25);
                    C = y & I ^ ~y & G;
                    ta = Q[U];
                    z = l[U];
                    H = (J & 65535) + (V & 65535) + (C & 65535) + (ta & 65535) + (z & 65535);
                    V = ((J >>> 16) + (V >>> 16) + (C >>> 16) + (ta >>> 16) + (z >>> 16) + (H >>> 16) & 65535) << 16 | H & 65535;
                    C = g(e(o, 2) ^ e(o, 13) ^ e(o, 22), o & s ^ o & u ^ s & u);
                    J = G;
                    G = I;
                    I = y;
                    y = g(x, V);
                    x = u;
                    u = s;
                    s = o;
                    o = g(V, C)
                }
                Y[0] = g(o, Y[0]);
                Y[1] = g(s, Y[1]);
                Y[2] = g(u, Y[2]);
                Y[3] = g(x, Y[3]);
                Y[4] = g(y, Y[4]);
                Y[5] = g(I, Y[5]);
                Y[6] = g(G, Y[6]);
                Y[7] = g(J, Y[7])
            }
            switch (r) {
            case "SHA-224":
                return [Y[0], Y[1], Y[2], Y[3], Y[4], Y[5], Y[6]];
            case "SHA-256":
                return Y;
            default:
                return []
            }
        },
        n = function (p, o) {
            this.strToHash = this.strBinLen = this.sha256 = this.sha224 = null;
            if ("HEX" === o) {
                if (0 !== p.length % 2) return "TEXT MUST BE IN BYTE INCREMENTS";
                this.strBinLen = p.length * 4;
                this.strToHash = b(p)
            } else if ("ASCII" === o || "undefined" === typeof o) {
                this.strBinLen = p.length * 8;
                this.strToHash = a(p)
            } else return "UNKNOWN TEXT INPUT TYPE"
        };
    n.prototype = {
        getHash: function (p, o) {
            var r = null,
                s = this.strToHash.slice();
            switch (o) {
            case "HEX":
                r = d;
                break;
            case "B64":
                r = c;
                break;
            default:
                return "FORMAT NOT RECOGNIZED"
            }
            switch (p) {
            case "SHA-224":
                if (null === this.sha224) this.sha224 = j(s, this.strBinLen, p);
                return r(this.sha224);
            case "SHA-256":
                if (null === this.sha256) this.sha256 = j(s, this.strBinLen, p);
                return r(this.sha256);
            default:
                return "HASH NOT RECOGNIZED"
            }
        },
        getHMAC: function (p, o, r, s) {
            var u, x;
            u = [];
            var y = [];
            switch (s) {
            case "HEX":
                s = d;
                break;
            case "B64":
                s = c;
                break;
            default:
                return "FORMAT NOT RECOGNIZED"
            }
            switch (r) {
            case "SHA-224":
                x = 224;
                break;
            case "SHA-256":
                x = 256;
                break;
            default:
                return "HASH NOT RECOGNIZED"
            }
            if ("HEX" === o) {
                if (0 !== p.length % 2) return "KEY MUST BE IN BYTE INCREMENTS";
                o = b(p);
                p = p.length * 4
            } else if ("ASCII" === o) {
                o = a(p);
                p = p.length * 8
            } else return "UNKNOWN KEY INPUT TYPE";
            if (64 < p / 8) {
                o = j(o, p, r);
                o[15] &= 4294967040
            } else if (64 > p / 8) o[15] &= 4294967040;
            for (p = 0; p <= 15; p += 1) {
                u[p] = o[p] ^ 909522486;
                y[p] = o[p] ^ 1549556828
            }
            u = j(u.concat(this.strToHash), 512 + this.strBinLen, r);
            u = j(y.concat(u), 512 + x, r);
            return s(u)
        }
    };
    window.jsSHA = n
})();
TD.util = function () {
    var a, b;
    return {
        TWITTER_HASHTAG_REGEXP: /(^|[.,@:;()\s])#([a-zA-Z0-9_]+)/g,
        TWITTER_USER_REGEXP: /(^|[^\w\d])@([a-zA-Z0-9_]{1,15})/g,
        TWITTER_DM_REGEX: /^[dD]\ ([a-zA-Z0-9_]{1,15})/g,
        TWITTER_LIST_REGEXP: /(^|\s)@([a-zA-Z0-9_]{1,15}\/[a-zA-Z0-9_-]{1,25})/g,
        LINK_REGEXP: /(((http|https|ftp):\/\/)?([-\._a-zA-Z0-9]+@)?([-a-zA-Z0-9]+\.)+[a-zA-Z]{2,4}\.?(:[\d]+)?([/?][^\s"]*)?(?!\d|\w))/g,
        EMAIL_VALIDATOR: /^[a-zA-Z0-9_\-\.+]+@[a-zA-Z0-9_\-\.]+\.[a-zA-Z]{2,4}$/,
        SPOTIFY_REGEXP: /spotify:(track|artist|search|album|(user:\w+:playlist)):\w+/g,
        DATE_DASH_REGEXP: /-/g,
        DATE_TIMEZONE_REGEXP: /[TZ]/g,
        DATE_MS_REGEXP: /\.(.*)/,
        ANCHOR_TAG_REGEXP: /href=/g,
        LT_REGEXP: /</g,
        GT_REGEXP: />/g,
        QUOTE_REGEXP: /"/g,
        toSeconds: function (d) {
            return (new Date((d || "").replace(DATE_DASH_REGEXP, "/").replace(DATE_TIMEZONE_REGEXP, " ").replace(DATE_MS_REGEXP, ""))).getTime()
        },
        parseISO8601: function (d) {
            var c = d.split("T");
            d = c[0].split("-");
            c = c[1].split("Z")[0].split(":");
            var e = c[2].split("."),
                g = Number(c[0]),
                j = new Date;
            j.setUTCFullYear(Number(d[0]));
            j.setUTCMonth(Number(d[1]) - 1);
            j.setUTCDate(Number(d[2]));
            j.setUTCHours(Number(g));
            j.setUTCMinutes(Number(c[1]));
            j.setUTCSeconds(Number(e[0]));
            e[1] && j.setUTCMilliseconds(Number(e[1]));
            return j
        },
        iso8601: function (d) {
            return ("000" + d.getUTCFullYear()).slice(-4) + "-" + ("0" + (d.getUTCMonth() + 1)).slice(-2) + "-" + ("0" + d.getUTCDate()).slice(-2) + "T" + ("0" + d.getUTCHours()).slice(-2) + ":" + ("0" + d.getUTCMinutes()).slice(-2) + ":" + ("0" + d.getUTCSeconds()).slice(-2)
        },
        prettyDate: function (d) {
            var c, e = new Date((new Date).getTime() + 0);
            d = (e.getTime() - d.getTime()) / 1E3;
            e = Math.ceil((d / 3600 - e.getHours()) / 24);
            if (isNaN(e) || e < 0) c = TD.util.i18n.getMessage("time_now");
            else if (e == 0) if (d < 60) c = TD.util.i18n.getMessage("time_now");
            else if (d < 120) c = TD.util.i18n.getMessage("time_1_min");
            else if (d < 3600) c = TD.util.i18n.getMessage("time_x_mins", [Math.floor(d / 60)]);
            else if (d < 7200) c = TD.util.i18n.getMessage("time_1_hour");
            else {
                if (d < 86400) c = TD.util.i18n.getMessage("time_x_hours", [Math.floor(d / 3600)])
            } else c = e == 1 ? TD.util.i18n.getMessage("time_yesterday") : e < 7 ? TD.util.i18n.getMessage("time_x_days", [e]) : e < 14 ? TD.util.i18n.getMessage("time_1_week") : e < 31 ? TD.util.i18n.getMessage("time_x_weeks", [Math.ceil(e / 7)]) : TD.util.i18n.getMessage("time_months");
            return c
        },
        unstringify: function (d) {
            d = d.split("&");
            for (var c = {}, e = 0, g; g = d[e]; ++e) {
                g = g.split("=");
                c[decodeURIComponent(g[0])] = decodeURIComponent(g[1])
            }
            return c
        },
        stringify: function (d) {
            var c = [],
                e;
            for (e in d) c.push(encodeURIComponent(e) + "=" + encodeURIComponent(d[e]));
            return c.join("&")
        },
        clean: function (d) {
            if (!d) return d;
            return d.replace(this.LT_REGEXP, "&lt;").replace(this.GT_REGEXP, "&gt;").replace(this.QUOTE_REGEXP, "&quot;")
        },
        removeHTMLCodes: function (d) {
            return d.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        },
        h: function (d) {
            var c = $("<div/>"),
                e = function (g) {
                    return g ? c.text(g).html().replace(/\"/gi, "&quot;") : g
                };
            this.h = function (g) {
                return e(g)
            };
            return e(d)
        },
        transform: function (d, c) {
            if (d) {
                var e;
                e = this.clean(d);
                e = this.linkify(e, c);
                e = this.hashify(e);
                return e = this.userify(e)
            }
        },
        createLink: function (d, c) {
            return "<a href='" + d + "' rel='url' class ='url-ext'>" + c + "</a>"
        },
        linkify: function (d, c) {
            var e = d,
                g = d.match(this.LINK_REGEXP);
            if (g != null) {
                e = "";
                var j = d,
                    n, p, o, r, s = "",
                    u = {},
                    x;
                x = function (I) {
                    for (var G = 0; G < I.length; G++) u[I[G].url] = I[G]
                };
                if (c) {
                    c.urls && x(c.urls);
                    c.media && x(c.media)
                }
                for (x = 0; x < g.length; x++) {
                    var y = g[x];
                    n = y.charAt(y.length - 1);
                    if (n.match(/[\.?!'",]/) != null) y = y.slice(0, y.length - 1);
                    else if (n == ")") _.contains(y, "(") || (y = y.slice(0, y.length - 1));
                    n = j.indexOf(y);
                    e += j.slice(0, n);
                    if (y.match(this.EMAIL_VALIDATOR)) e += TD.util.createLink("mailto:" + y, y);
                    else {
                        s = _.contains(y, "://") ? "" : "http://";
                        o = y;
                        p = s + y;
                        r = "";
                        if (s = u[y]) {
                            o = s.display_url || o;
                            p = s.url || p;
                            if (o.charCodeAt(o.length - 1) == 8230) r = s.expanded_url || ""
                        }
                        e += "<a href='" + p + "' ";
                        if (r) e += "title='" + r + "' ";
                        else if (s && s.expanded_url) e += "data-full-url='" + s.expanded_url + "' ";
                        if (s && s.type == "photo") {
                            p = "";
                            if (s.sizes && s.sizes.large) p = ":large";
                            e += "data-media-url='" + s.media_url + p + "' ";
                            e += "data-media-thumb-url='" + s.media_url + ":thumb' "
                        }
                        e += "rel='url' class='url-ext'>" + o + "</a>"
                    }
                    j = j.slice(n + y.length)
                }
                e += j
            }
            return e = e.replace(this.SPOTIFY_REGEXP, "<a href='$&' rel='spotify'>$&</a>")
        },
        hashify: function (d) {
            return d.replace(this.TWITTER_HASHTAG_REGEXP, "$1#<a href='http://twitter.com/search?q=#$2' rel='hashtag'>$2</a>")
        },
        getHashtags: function (d) {
            if (d = d.match(this.TWITTER_HASHTAG_REGEXP)) for (var c = 0; c < d.length; c++) d[c] = d[c].replace(this.TWITTER_HASHTAG_REGEXP, "#$2");
            return d
        },
        userify: function (d) {
            d = d.replace(this.TWITTER_LIST_REGEXP, "$1@<a href='http://twitter.com/$2' rel='url' class='extUrl'>$2</a>");
            return d = d.replace(this.TWITTER_USER_REGEXP, "$1@<a href='http://twitter.com/$2' rel='user' target='_blank'>$2</a>")
        },
        getUsers: function (d) {
            if (d = d.match(this.TWITTER_USER_REGEXP)) for (var c = 0; c < d.length; c++) d[c] = d[c].replace(this.TWITTER_USER_REGEXP, "@$2");
            return d
        },
        getReplyUsers: function (d) {
            var c = [],
                e = [],
                g = {},
                j = "";
            d.retweetedStatus && c.push("@" + d.retweetedStatus.user.screenName);
            c.push("@" + d.user.screenName);
            c = c.concat(this.getUsers(d.text) || []);
            if (d.account) j = "@" + d.account.username.toLowerCase();
            for (var n = 0; n < c.length; n++) {
                d = c[n].toLowerCase();
                !g[d] && d != j && e.push(c[n]);
                g[d] = true
            }
            return e
        },
        getUserEntities: function (d) {
            return TD.util.getEntities(d, TD.util.TWITTER_USER_REGEXP, "@", 2)
        },
        getHashtagEntities: function (d) {
            return TD.util.getEntities(d, TD.util.TWITTER_HASHTAG_REGEXP, "#", 2)
        },
        getEntities: function (d, c, e, g) {
            var j = [],
                n = 0;
            e = e || "";
            for (g = g || 0; d.length > 0;) {
                var p = d.search(c),
                    o, r;
                if (p == -1) break;
                c.lastIndex = p;
                var s = c.exec(d);
                r = e + s[g];
                o = n + p + s[0].indexOf(e);
                j.push({
                    start: o,
                    end: o + r.length,
                    value: r
                });
                p += s[0].length;
                n += p;
                d = d.substr(p)
            }
            return j
        },
        pluralise: function (d, c, e) {
            if (e != 1) return c;
            return d
        },
        selectAttrsFrom: function (d, c) {
            for (var e = {}, g = 0; g < c.length; g++) e[c[g]] = d[c[g]];
            return e
        },
        values: function (d) {
            var c = [],
                e;
            for (e in d) d.hasOwnProperty(e) && c.push(d[e]);
            return c
        },
        isChromeApp: function () {
            if (a == null) a = _.startsWith(window.location.href, "chrome-extension://");
            return a
        },
        isDesktopApp: function () {
            if (b == null) b = _.startsWith(window.location.href, "app://com.tweetdeck.chrome");
            return b
        },
        getCurrentLocation: function (d, c, e) {
            var g = Number.MAX_VALUE,
                j, n, p = navigator.geolocation,
                o = function () {
                    p.clearWatch(n);
                    if (j) c(j);
                    else e && e()
                };
            setTimeout(o, d);
            n = p.watchPosition(function (r) {
                var s = r.coords.accuracy;
                if (s < g) {
                    j = r;
                    g = s
                }
                if (s < 50) {
                    clearTimeout(timer);
                    o()
                }
            }, e, {
                enableHighAccuracy: true
            })
        },
        openURL: function (d) {
            window.open(d).focus()
        },
        escape: function (d) {
            return this.clean(d)
        },
        truncateText: function (d, c, e, g, j, n) {
            c = c == undefined ? "\ufffd" : c;
            var p;
            if (d.length > e + (g || 0)) {
                g = d.indexOf(" ", e - (n || 0) - 1);
                if (g != -1) e = Math.min(e, g + 1);
                p = d.substr(0, e);
                if (j) p = this.transform(p);
                p += c
            }
            return p
        }
    }
}();
var KEYS = {
    BACKSPACE: 8,
    TAB: 9,
    ESC: 27,
    RETURN: 13,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    LEFT: 37,
    RIGHT: 39,
    UP: 38,
    DOWN: 40,
    DELETE: 46
};
jQuery.extend({
    createElement: function (a) {
        return jQuery(document.createElement(a))
    }
});
(function (a) {
    function b(c) {
        if (c.attr("title") || typeof c.attr("original-title") != "string") c.attr("original-title", c.attr("title") || "").removeAttr("title")
    }
    function d(c, e) {
        this.$element = a(c);
        this.options = e;
        this.enabled = true;
        b(this.$element)
    }
    d.prototype = {
        show: function () {
            var c = this.getTitle();
            if (c && this.enabled) {
                var e = this.tip();
                e.find(".tipsy-inner")[this.options.html ? "html" : "text"](c);
                e[0].className = "tipsy";
                e.remove().css({
                    top: 0,
                    left: 0,
                    visibility: "hidden",
                    display: "block"
                }).appendTo(document.body);
                c = a.extend({}, this.$element.offset(), {
                    width: this.$element[0].offsetWidth,
                    height: this.$element[0].offsetHeight
                });
                var g = e[0].offsetWidth,
                    j = e[0].offsetHeight,
                    n = typeof this.options.gravity == "function" ? this.options.gravity.call(this.$element[0]) : this.options.gravity,
                    p;
                switch (n.charAt(0)) {
                case "n":
                    p = {
                        top: c.top + c.height + this.options.offset,
                        left: c.left + c.width / 2 - g / 2
                    };
                    break;
                case "s":
                    p = {
                        top: c.top - j - this.options.offset,
                        left: c.left + c.width / 2 - g / 2
                    };
                    break;
                case "e":
                    p = {
                        top: c.top + c.height / 2 - j / 2,
                        left: c.left - g - this.options.offset
                    };
                    break;
                case "w":
                    p = {
                        top: c.top + c.height / 2 - j / 2,
                        left: c.left + c.width + this.options.offset
                    }
                }
                if (n.length == 2) p.left = n.charAt(1) == "w" ? c.left + c.width / 2 - 15 : c.left + c.width / 2 - g + 15;
                e.css(p).addClass("tipsy-" + n);
                this.options.fade ? e.stop().css({
                    opacity: 0,
                    display: "block",
                    visibility: "visible"
                }).animate({
                    opacity: this.options.opacity
                }) : e.css({
                    visibility: "visible",
                    opacity: this.options.opacity
                })
            }
        },
        hide: function () {
            this.options.fade ? this.tip().stop().fadeOut(function () {
                a(this).remove()
            }) : this.tip().remove()
        },
        getTitle: function () {
            var c, e = this.$element,
                g = this.options;
            b(e);
            g = this.options;
            if (typeof g.title == "string") c = e.attr(g.title == "title" ? "original-title" : g.title);
            else if (typeof g.title == "function") c = g.title.call(e[0]);
            return (c = ("" + c).replace(/(^\s*|\s*$)/, "")) || g.fallback
        },
        tip: function () {
            if (!this.$tip) this.$tip = a('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"/></div>');
            return this.$tip
        },
        validate: function () {
            if (!this.$element[0].parentNode) {
                this.hide();
                this.options = this.$element = null
            }
        },
        enable: function () {
            this.enabled = true
        },
        disable: function () {
            this.enabled = false
        },
        toggleEnabled: function () {
            this.enabled = !this.enabled
        }
    };
    a.fn.tipsy = function (c) {
        function e(o) {
            var r = a.data(o, "tipsy");
            if (!r) {
                r = new d(o, a.fn.tipsy.elementOptions(o, c));
                a.data(o, "tipsy", r)
            }
            return r
        }
        function g() {
            var o = e(this);
            o.hoverState = "in";
            c.delayIn == 0 ? o.show() : setTimeout(function () {
                o.hoverState == "in" && o.show()
            }, c.delayIn)
        }
        function j() {
            var o = e(this);
            o.hoverState = "out";
            c.delayOut == 0 ? o.hide() : setTimeout(function () {
                o.hoverState == "out" && o.hide()
            }, c.delayOut)
        }
        if (c === true) return this.data("tipsy");
        else if (typeof c == "string") return this.data("tipsy")[c]();
        c = a.extend({}, a.fn.tipsy.defaults, c);
        c.live || this.each(function () {
            e(this)
        });
        if (c.trigger != "manual") {
            var n = c.live ? "live" : "bind",
                p = c.trigger == "hover" ? "mouseleave" : "blur";
            this[n](c.trigger == "hover" ? "mouseenter" : "focus", g)[n](p, j)
        }
        return this
    };
    a.fn.tipsy.defaults = {
        delayIn: 0,
        delayOut: 0,
        fade: false,
        fallback: "",
        gravity: "n",
        html: false,
        live: false,
        offset: 0,
        opacity: 1,
        title: "title",
        trigger: "hover"
    };
    a.fn.tipsy.elementOptions = function (c, e) {
        return a.metadata ? a.extend({}, e, a(c).metadata()) : e
    };
    a.fn.tipsy.autoNS = function () {
        return a(this).offset().top > a(document).scrollTop() + a(window).height() / 2 ? "s" : "n"
    };
    a.fn.tipsy.autoWE = function () {
        return a(this).offset().left > a(document).scrollLeft() + a(window).width() / 2 ? "e" : "w"
    }
})(jQuery);
TD.util.i18n = function () {
    var a = {},
        b = /__MSG_([\w@]+)__/gm,
        d, c = function (e, g) {
            var j = TD_locale_messages[e];
            if (j) {
                if (g) {
                    if (typeof g == "string") g = [g];
                    for (var n = 0; n < g.length; n++) j = j.replace("$" + (n + 1), g[n])
                }
                return j
            }
        };
    a.getMessage = function (e, g) {
        d || (d = TD.util.isChromeApp() ? chrome.i18n.getMessage : c);
        return d(e, g)
    };
    a.localiseText = function (e) {
        var g = null,
            j;
        b.lastIndex = 0;
        for (g = b.exec(e); g;) {
            if (g.length > 1) {
                j = a.getMessage(g[1]);
                if (j !== undefined) {
                    g = "__MSG_" + g[1] + "__";
                    e = e.replace(g, j);
                    b.lastIndex += j.length - g
                }
            }
            g = b.exec(e)
        }
        return e
    };
    a.localiseTags = function () {
        $('[data-i18n="1"]').each(function (e, g) {
            var j = $(g),
                n;
            j.html(a.localiseText(j.html()));
            (n = j.attr("title")) && j.attr("title", a.localiseText(n))
        })
    };
    a.getLocale = function () {
        return a.getMessage("@@ui_locale")
    };
    return a
}();
TD.vo.URLInfo = function (a) {
    var b;
    this.originalURL = a;
    this.synonyms = [a];
    if (TD.util.urls.isShortURL(a)) this.shortURL = a;
    if (b = TD.util.mediaURLs.getYouTubeVideoIDFromURL(a)) this.addSynonym(TD.util.mediaURLs.getShortYouTubeURL(b));
    else(b = TD.util.mediaURLs.getFlickrPhotoIDFromURL(a)) && this.addSynonym(TD.util.mediaURLs.getFlickrShortURLFromPhotoID(b))
};
TD.vo.URLInfo.prototype.addSynonym = function (a) {
    this.synonyms.push(a);
    this.shortURL = a
};
TD.vo.URLInfo.prototype.getNextSynonym = function (a) {
    for (var b = this.synonyms.length, d = 0; d < b; d++) if (this.synonyms[d] == a) {
        nextIndex = (d + 1) % b;
        return this.synonyms[nextIndex]
    }
    return a
};
TD.vo.URLInfo.prototype.shorten = function (a, b, d) {
    var c = this;
    if (this.shortURL && !b) {
        d(this.originalURL, this.shortURL);
        return false
    }
    this.shorteningInProgress = true;
    TD.services.bitly.shorten(this.originalURL, function (e) {
        if (e.data.url) {
            c.shortURL = e.data.url;
            c.addSynonym(c.shortURL);
            d(c.originalURL, e.data.url)
        }
    })
};
TD.vo.Column = function () {
    this.description = this.title = "";
    this.feeds = [];
    this.type = this.key = "";
    this.updateArray = [];
    this.updateIndex = {};
    this.feedSubscriptions = {};
    this.deleteSubscriptions = {};
    this.feedsFetched = 0;
    this.isFirstFetch = true;
    this.isFetchingOlderUpdates = false;
    this.lastInfiniteScrollTime = null;
    this.hasNotification = this.hasSound = false;
    this.CHIRP_BLOCK_SIZE = 20;
    this.holdingArray = [];
    var a = this;
    this.init = function () {
        this.updateArray = [];
        this.updateIndex = {};
        this.feedSubscriptions = {};
        this.deleteSubscriptions = {};
        this.feedsFetched = 0;
        this.isFirstFetch = true;
        this.isFetchingOlderUpdates = false;
        this.lastInfiniteScrollTime = null;
        this.CHIRP_BLOCK_SIZE = 20;
        this.holdingArray = [];
        this.containerUpdatesSelector = "[data-column='" + this.key + "'] .container-updates .scroll-content";
        this.refreshSubscriptions()
    };
    this.refreshSubscriptions = function () {
        for (var b, d, c = {}, e = 0; e < this.feeds.length; e++) {
            b = this.feeds[e];
            c[b.key] = b;
            this.feedSubscriptions[b.key] || (this.feedSubscriptions[b.key] = $.subscribe("/feed/" + b.key, this.addToIndex));
            this.deleteSubscriptions[b.key] || (this.deleteSubscriptions[b.key] = $.subscribe("/delete/" + b.key, this.removeFromIndex))
        }
        for (d in this.feedSubscriptions) if (!c[d]) {
            $.unsubscribe(this.feedSubscriptions[d]);
            delete this.feedSubscriptions[d]
        }
        for (d in this.deleteSubscriptions) if (!c[d]) {
            $.unsubscribe(this.deleteSubscriptions[d]);
            delete this.deleteSubscriptions[d]
        }
    };
    this.makeHomeColumn = function () {
        this.feeds = [];
        var b, d = TD.storage.store.accountStore.getAll();
        b = TD.storage.store.accountStore.getDefault();
        var c;
        if (b && b.type == "twitter") {
            c = b;
            b = TD.storage.store.feedStore.makeFeed("home", c.type, c.key, "");
            this.feeds.push(b)
        }
        for (var e = 0; e < d.length; e++) switch (d[e].type) {
        case "twitter":
            if (c) break;
            c = d[e];
        case "facebook":
        case "buzz":
        case "foursquare":
            b = TD.storage.store.feedStore.makeFeed("home", d[e].type, d[e].key, "");
            this.feeds.push(b)
        }
    };
    this.makeMeColumn = function () {
        this.feeds = [];
        for (var b, d = TD.storage.store.accountStore.getAll(), c = 0; c < d.length; c++) switch (d[c].type) {
        case "facebook":
            b = TD.storage.store.feedStore.makeFeed("notifications", d[c].type, d[c].key, "");
            this.feeds.push(b);
            break;
        case "twitter":
            b = TD.storage.store.feedStore.makeFeed("mentions", d[c].type, d[c].key, "");
            this.feeds.push(b)
        }
    };
    this.makePrivateMeColumn = function () {
        this.feeds = [];
        for (var b, d = TD.storage.store.accountStore.getAll(), c = 0; c < d.length; c++) switch (d[c].type) {
        case "twitter":
            b = TD.storage.store.feedStore.makeFeed("direct", d[c].type, d[c].key, "");
            this.feeds.push(b);
            b = TD.storage.store.feedStore.makeFeed("sentdirect", d[c].type, d[c].key, "");
            this.feeds.push(b)
        }
    };
    this.fetchOlderUpdates = function () {
        var b = this.feeds,
            d, c = b.length,
            e, g = this.updateArray[this.updateArray.length - 1].created.getTime(),
            j = this.updateArray.length,
            n = 0;
        if (!this.isFetchingOlderUpdates) {
            this.isFetchingOlderUpdates = true;
            this.addInfiniteScrollSpinner();
            for (e = 0; e < c; e++) {
                d = TD.controller.feedManager.getPoller(b[e].key);
                d.fetchOlderChirps(g, function (p, o) {
                    o = o.concat();
                    a.lastInfiniteScrollTime = (new Date).getTime();
                    a.addItemsToIndex(o, true, p, false);
                    n++;
                    if (n == a.feeds.length) {
                        a.removeInfiniteScrollSpinner();
                        a.feedsFetched = 0;
                        a.isFetchingOlderUpdates = false;
                        a.truncate(j + a.CHIRP_BLOCK_SIZE)
                    }
                })
            }
        }
    };
    this.sortFunction = function (b, d) {
        return d.created.getTime() - b.created.getTime()
    };
    this.addToIndex = function (b, d) {
        var c = d.concat();
        c.splice(a.CHIRP_BLOCK_SIZE);
        a.addItemsToIndex(c, a.updateArray.length, b.feed, true);
        if (a.isFirstFetch) {
            a.feedsFetched++;
            if (a.feedsFetched == a.feeds.length) {
                a.truncate(a.CHIRP_BLOCK_SIZE);
                a.feedsFetched = 0;
                a.isFirstFetch = false
            }
        }
    };
    this.addItemsToIndex = function (b, d, c) {
        var e, g = [],
            j, n = a.updateArray.length ? a.updateArray[a.updateArray.length - 1].created.getTime() : 0;
        j = $(a.containerUpdatesSelector);
        var p = [],
            o = c.latestTime;
        a.updateArray.length === 0 && j.empty();
        b.sort(a.sortFunction);
        b.splice(a.CHIRP_BLOCK_SIZE + a.updateArray.length);
        e = b.length;
        for (var r = 0; r < e; r++) {
            j = b[r];
            if (a.updateIndex[j.id] === undefined) if (!(!d && j.created.getTime() < n)) {
                a.updateIndex[j.id] = j;
                g.push(j);
                var s = j.created.getTime();
                if (s > o) {
                    p.push(j);
                    c.setNewLatestTime(s)
                }
            }
        }
        if (g.length) {
            g.sort(a.sortFunction);
            b = "";
            d = [];
            for (n = a.updateArray; g.length > 0 || n.length > 0;) if (g.length === 0) {
                d = d.concat(n);
                n = []
            } else if (n.length === 0) {
                d = d.concat(g);
                a.addToView(c, b, g);
                g = []
            } else {
                o = [];
                e = g[0].created.getTime();
                for (r = n[0].created.getTime(); e > r && g.length > 0;) {
                    j = g.shift();
                    o.push(j);
                    if (g.length > 0) e = g[0].created.getTime()
                }
                if (o.length > 0) {
                    a.addToView(c, b, o);
                    d = d.concat(o)
                } else {
                    j = n.shift();
                    b = j.id;
                    d.push(j)
                }
            }
            a.updateArray = d
        }
        TD.controller.notifications.newUpdates(a, c, p)
    };
    this.removeFromIndex = function (b, d) {
        for (var c = 0; c < d.length; c++) a.removeChirp(d[c])
    };
    this.removeChirp = function (b) {
        var d = a.updateIndex[b.id];
        if (d) {
            for (var c = 0; c < a.updateArray.length; c++) {
                b = a.updateArray[c];
                if (b === d) {
                    a.updateArray.splice(c, 1);
                    break
                }
            }
            delete a.updateIndex[b.id];
            $(a.containerUpdatesSelector + " [data-key='" + b.id + "']").remove()
        }
    };
    this.truncate = function (b) {
        var d, c, e = -1;
        for (d = a.feedsFetched = 0; d < this.feeds.length; d++) if (c = TD.controller.feedManager.getPoller(this.feeds[d].key)) {
            c = c.getRangeStartTime();
            if (c > e) e = c
        }
        d = a.updateArray.length - 1;
        for (var g; d >= 0; d--) if (this.updateArray[d].created.getTime() >= e) {
            g = d;
            break
        }
        if (g) {
            g = Math.min(b + 1, g);
            d = a.updateArray.length - 1;
            for (b = $("[data-column='" + a.key + "'] .scroll-content"); d > g; d--) {
                e = a.updateArray[d].id.toString();
                c = b.children("article#" + e);
                delete a.updateIndex[e];
                c.remove()
            }
            a.updateArray.splice(g + 1, Number.MAX_VALUE)
        }
    };
    this.trimUpdates = function () {
        var b;
        if (this.lastInfiniteScrollTime) {
            b = (new Date).getTime() - a.lastInfiniteScrollTime;
            if (b < 6E4) return;
            else {
                b = Math.floor((a.updateArray.length - 20) * (1 - b / 6E5));
                this.maxUpdatesPerColumn = Math.max(20 + b, 20)
            }
        }
        b = Math.max(a.maxUpdatesPerColumn || 20, 20);
        b = a.updateArray.splice(b, Math.max(a.updateArray.length - b, 0));
        for (var d = b.length, c = $("[data-column='" + a.key + "'] .scroll-content"), e = 0; e < d; e++) {
            var g = b[e].id.toString(),
                j = c.children("article#" + g);
            delete a.updateIndex[g];
            j.remove()
        }
    };
    this.addInfiniteScrollSpinner = function () {
        $(a.containerUpdatesSelector).append('<div class="spinner"></div>')
    };
    this.removeInfiniteScrollSpinner = function () {
        $(a.containerUpdatesSelector + " .spinner").remove()
    };
    this.addToView = function (b, d, c) {
        var e = this;
        b = $(e.containerUpdatesSelector);
        var g = [],
            j = c.length,
            n;
        for (n = 0; n < j; n++) {
            c[n].deckExtend();
            var p = c[n].render();
            g.push(p)
        }
        c = g.join("\n");
        TD.ui.columns.freezeScroll(e.key);
        if (d === "") b.children("article").size() === 0 ? b.html(c) : b.prepend(c);
        else {
            d = d.toString().replace(/:/g, "\\:");
            d = d.replace(/,/g, ",");
            b.children("article#" + d).after(c)
        }
        this.isFetchingOlderUpdates || TD.ui.columns.unfreezeScroll(e.key, function () {
            TD.ui.columns.setHeaderState(e.key, true)
        });
        TD.services.media.getEmbedableContent()
    }
};
TD.util.urls = function () {
    var a = {},
        b = RegExp('((http|https|ftp):\\/\\/)?([-\\._a-z0-9]+@)?([-a-z0-9]+\\.)+([a-z][a-z]+\\.?)(:[\\d]+)?([/?][^\\s"]*)?(?!\\d)', "i");
    " /~*?.;,:-%=_$&'@!+".split("");
    var d = ["http://", "https://", "ftp://"],
        c = ["ac", "ad", "ae", "aero", "af", "ag", "ai", "al", "am", "an", "ao", "aq", "ar", "arpa", "as", "asia", "at", "au", "aw", "ax", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "biz", "bj", "bm", "bn", "bo", "br", "bs", "bt", "bv", "bw", "by", "bz", "ca", "cat", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "com", "coop", "cr", "cu", "cv", "cx", "cy", "cz", "de", "dj", "dk", "dm", "do", "dz", "ec", "edu", "ee", "eg", "er", "es", "et", "eu", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", "gf", "gg", "gh", "gi", "gl", "gm", "gn", "gov", "gp", "gq", "gr", "gs", "gt", "gu", "gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "im", "in", "info", "int", "io", "iq", "ir", "is", "it", "je", "jm", "jo", "jobs", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", "ky", "kz", "la", "lb", "lc", "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mg", "mh", "mil", "mk", "ml", "mm", "mn", "mo", "mobi", "mp", "mq", "mr", "ms", "mt", "mu", "museum", "mv", "mw", "mx", "my", "mz", "na", "name", "nc", "ne", "net", "nf", "ng", "ni", "nl", "no", "np", "nr", "nu", "nz", "om", "org", "pa", "pe", "pf", "pg", "ph", "pk", "pl", "pm", "pn", "pr", "pro", "ps", "pt", "pw", "py", "qa", "re", "ro", "rs", "ru", "rw", "sa", "sb", "sc", "sd", "se", "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "st", "su", "sv", "sy", "sz", "tc", "td", "tel", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn", "to", "tp", "tr", "travel", "tt", "tv", "tw", "tz", "ua", "ug", "uk", "us", "uy", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wf", "ws", "ye", "yt", "yu", "za", "zm", "zw"],
        e = ["deck.ly", "deck.to", "deckly.com", "3.ly", "alturl.com", "awe.sm", "bit.ly", "bitly.tv", "bkite.com", "bte.tc", "budurl.com", "burnurl.com", "buzzup.com", "chilp.it", "cli.gs", "digg.com", "doiop.com", "eepurl.com", "epr24.com", "ff.im", "fb.me", "flic.kr", "flic.kr", "goo.gl", "hopurl.com", "ht.ly", "htxt.it", "icio.us", "idek.net", "ihid.us", "inuiva.com", "is.gd", "j.mp", "justin.tv", "kl.am", "link.reuters.com", "lkbk.nu", "lnk.ms", "loopt.us", "migre.me", "mltp.ly", "moby.to", "mobypicture.com", "om.ly", "omg.ly", "ow.ly", "pic.gd", "ping.fm", "plixi.com", "post.ly", "qik.com", "qik.ly", "redirx.com", "rep.ly", "retwt.me", "rubyurl.com", "rurl.org", "shar.es", "short.ie", "short.to", "shortlinks.co.uk", "sml.vg", "sn.im", "snipr.com", "snipurl.com", "snurl.com", "su.pr", "t.co", "t.love.com", "tiny.cc", "tiny12.tv", "tinychat.com", "tinylink.com", "tinysong.com", "tinyurl.com", "tl.gd", "tlre.us", "tobtr.com", "tr.im", "trim.su", "trunc.it", "tu.nu", "twi.cc", "twicli.com", "twit.ac", "twitpwr.com", "twitthis.com", "twitpic.com", "twitvid.com", "twlol.com", "twurl.cc", "twurl.nl", "u.mavrev.com", "u.nu", "url4.eu", "urlpire.com", "ustre.am", "viigo.im", "wp.me", "x.hypem.com", "x.imeem.com", "yep.it", "yfrog.com", "youtu.be", "zipz.me", "znl.me"],
        g = function (j) {
            j = j.toLowerCase();
            var n;
            for (n = 0; n < d.length; n++) if (_.startsWith(j, d[n])) {
                j = j.slice(d[n].length);
                break
            }
            j = j.split("?")[0];
            j = j.split("/")[0];
            return j = j.split(":")[0]
        };
    a.validate = function (j) {
        var n = false,
            p = b.exec(j);
        if (p != null && j.length == p[0].length) {
            parts = g(j).split(".");
            n = _.include(c, parts[parts.length - 1].toLowerCase())
        }
        return n
    };
    a.findEntities = function (j) {
        var n = [];
        j = TD.util.urls.find(j);
        for (var p = 0; p < j.length; p++) {
            var o = j[p];
            n.push({
                start: o.startIndex,
                end: o.endIndex,
                value: o.url
            })
        }
        return n
    };
    a.find = function (j) {
        for (var n = j, p = [], o; n.length > 3;) if (b.exec(n) != null) {
            o = b.exec(n)[0];
            for (var r = o.length, s = void 0; r > 0; r--) {
                s = o.substr(o.length - 1);
                if (s.match(/[\.?!'",]/) != null) o = o.slice(0, o.length - 1);
                else if (s == ")") if (_.contains(o, "(")) break;
                else o = o.slice(0, o.length - 1);
                else break
            }
            if (a.validate(o)) {
                r = {};
                r.url = o;
                r.length = o.length;
                r.startIndex = j.indexOf(o, j.length - n.length);
                r.endIndex = r.startIndex + o.length;
                p.push(r)
            }
            o = n.indexOf(o) + o.length;
            n = n.substring(o)
        } else n = "";
        return p
    };
    a.isShortURL = function (j) {
        j = g(j);
        return _.include(e, j)
    };
    return a
}();
TD.util.mediaURLs = function () {
    var a = {},
        b = /(http:\/\/)?(www.)?flickr.com\/photos\/[A-Za-z0-9-_\@]+\/([0-9]+)/gi,
        d = /http:\/\/flic.kr\/p\/([A-Za-z0-9]+)/gi,
        c = /http:\/\/farm[0-9]+.static.flickr.com\/[0-9]+\/([0-9]+)_[0-9A-Za-z]+(_[mstb].jpg|.jpg|_o.(jpg|gif|png))/gi,
        e = /http:\/\/(youtu.be\/|www.youtube.com\/watch\?v=)([A-Za-z0-9_-]+)/gi;
    a.getYouTubeVideoIDFromURL = function (g) {
        var j;
        j = 2;
        g = g.match(e);
        j = !g || g.length == 0 ? null : g[0].replace(e, "$" + j);
        return j
    };
    a.getFlickrPhotoIDFromURL = function (g) {
        if ((matches = g.match(b)) && matches.length != 0) return matches[0].replace(b, "$3");
        if ((matches = g.match(d)) && matches.length != 0) {
            g = matches[0].replace(d, "$1");
            for (var j = String, n = 0, p = 1, o = g.length - 1; o >= 0; o--) {
                n += p * "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ".indexOf(g.substr(o, 1));
                p *= 58
            }
            return j(n)
        }
        if ((matches = g.match(c)) && matches.length != 0) return matches[0].replace(c, "$1");
        return null
    };
    a.getShortYouTubeURL = function (g) {
        return "http://youtu.be/" + g
    };
    a.getFlickrShortURLFromPhotoID = function (g) {
        g = Number(g);
        for (var j = "", n = g; g >= 58;) {
            n = g / 58;
            j = "" + "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ".substr(g - 58 * Math.floor(n), 1) + j;
            g = Math.floor(n)
        }
        return "http://flic.kr/p/" + (n ? "" + "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ".substr(n, 1) + j : j)
    };
    return a
}();
TD.controller.clients = function () {
    var a = {};
    return {
        initialiseClients: function () {
            var b, d;
            d = TD.storage.store.accountStore.getAll();
            d.length == 0 && TD.ui.startup.showSignin();
            for (var c = 0; c < d.length; c++) {
                b = a[d[c].key];
                if (!b) {
                    b = TD.services.makeServiceClient(d[c].type, d[c]);
                    a[d[c].key] = b
                }
            }
            TD.ui.main.refreshAccounts(d);
            TD.ui.columns.refreshCombinedColumnFeeds()
        },
        getClient: function (b) {
            return a[b]
        },
        getClientsByService: function (b) {
            var d = [],
                c;
            for (c in a) a[c].type == b && d.push(a[c]);
            return d
        },
        setDefault: function (b) {
            TD.storage.store.set(":DEFAULT_SENDING_ACCOUNTS", [b])
        },
        addClient: function (b, d) {
            var c, e, g = function () {
                    c = TD.services.makeServiceClient(d.type, d);
                    a[d.key] = c;
                    TD.storage.store.accountStore.add(d);
                    TD.ui.main.refreshAccounts(TD.storage.store.accountStore.getAll());
                    TD.sync.controller.pushAccount(d);
                    TD.ui.columns.refreshCombinedColumnFeeds()
                };
            if (d) g();
            else {
                d = new TD.storage.model.Account;
                d.type = b;
                e = TD.controller.auth.create(b, d);
                e.start(d, g)
            }
        },
        removeClient: function (b) {
            var d, c, e, g, j, n, p;
            delete a[b];
            d = TD.storage.store.accountStore.get(b);
            c = TD.storage.store.columnStore.getAll();
            j = c.length;
            for (n = 0; n < j; n++) {
                e = c[n];
                g = e.feeds.length;
                for (p = g - 1; p >= 0; p--) {
                    g = e.feeds[p];
                    if (g.accountkey === b) {
                        TD.storage.store.feedStore.remove(g);
                        e.feeds.splice(p, 1)
                    }
                }
                e.feeds.length === 0 && TD.ui.columns.removeColumnFromUI(e.key)
            }
            TD.storage.store.accountStore.remove(d);
            b = TD.storage.store.settingsStore.get(":ACCOUNTS_BLACKLIST") || {};
            b[d.key] = true;
            TD.storage.store.settingsStore.set(":ACCOUNTS_BLACKLIST", b);
            TD.ui.main.refreshAccounts(TD.storage.store.accountStore.getAll())
        }
    }
}();
TD.controller.userImport = function () {
    $("window").bind("message", function (b) {
        b = JSON.parse(b.data);
        a(b.tdUsername, b.tdPassword, b.accountsArray, b.columnsArray)
    }, false);
    var a = function (b, d, c, e) {
            var g, j, n, p, o, r;
            TD.storage.store.set("tweetdeck_account", {
                email: b,
                password: d
            });
            d = function (u, x, y) {
                n = u;
                p = x;
                o = y
            };
            for (b = 0; b < c.length; b++) {
                j = c[b];
                g = new TD.storage.model.Account;
                switch (j.service) {
                case "twitter":
                    g.username = j.screen_name;
                case "foursquare":
                case "buzz":
                    g.userId = j.uid;
                    g.oauth_token = j.key;
                    g.token_secret = j.secret;
                    g.authType = "oauth";
                    break;
                case "facebook":
                    g.userId = j.uid;
                    g.oauth_token = j.token;
                    g.type = j.service;
                    g.authType = "fb";
                    break;
                default:
                    continue
                }
                if (!g.username) g.username = j.service;
                g.type = j.service;
                g.key = j.service + ":" + g.userId;
                g.profileImageURL = j.pic;
                TD.controller.clients.addClient(j.service, g)
            }
            TD.storage.store.accountStore.setFirstRunDefault();
            e.sort(function (u, x) {
                return u.order - x.order
            });
            for (b = 0; b < e.length; b++) {
                g = e[b];
                j = {};
                c = g.name;
                switch (g.columnType) {
                case 2:
                    d("mentions", "twitter:" + g.account, "twitter");
                    break;
                case 3:
                    d("home", "twitter:" + g.account, "twitter");
                    break;
                case 4:
                    d("search", "twitter:" + g.account, "twitter");
                    j = {
                        term: g.meta
                    };
                    break;
                case 5:
                    d("direct", "twitter:" + g.account, "twitter");
                    break;
                case 8:
                    d("favorites", "twitter:" + g.account, "twitter");
                    break;
                case 17:
                    d("home", "facebook:" + g.account, "facebook");
                    break;
                case 22:
                    d("list", "twitter:" + g.account, "twitter");
                    try {
                        r = JSON.parse(g.meta)
                    } catch (s) {
                        continue
                    }
                    j = {
                        screenName: r.user.screenName,
                        slug: r.slug
                    };
                    break;
                case 29:
                    g = TD.storage.store.accountStore.getAccountsForService("foursquare");
                    if (!g.length) continue;
                    d("home", g[0].key, "foursquare");
                    break;
                case 30:
                    g = TD.storage.store.accountStore.getAccountsForService("buzz");
                    if (!g.length) continue;
                    d("home", g[0].key, "buzz");
                    break;
                default:
                    continue
                }
                TD.ui.columns.addColumnToUI(TD.storage.store.columnStore.makeColumnAndFeed(c, n, o, p, j))
            }
            TD.ui.startup.exitStartup();
            TD.ui.main.renderTDButton()
        };
    return {}
}();
TD.controller.scheduler = function () {
    var a = {},
        b = {},
        d = function (g) {
            var j = {},
                n;
            for (n in a) {
                a[n].trimUpdates();
                for (var p = a[n].feeds, o = 0; o < p.length; o++) if (!(g && p[o].accountkey !== g)) {
                    if (b[p[o].key] == undefined) b[p[o].key] = [];
                    if (p[o]) j[p[o].key] = p[o]
                }
            }
            for (var r in j) TD.controller.feedManager.getPoller(r).refresh()
        },
        c = function () {
            d();
            TD.controller.feedManager.trimPollers();
            TD.ui.updates.refreshTimestamps();
            e();
            TD.storage.store.set(":CACHED_TWITTER_USERS", TD.ui.compose.usernameSet);
            TD.storage.store.set(":CACHED_HASHTAGS", TD.ui.compose.hashtagSet);
            TD.storage.store.feedStore.save()
        },
        e = function () {
            var g = TD.storage.store.accountStore.getAccountsForService("twitter"),
                j;
            for (j = 0; j < g.length; j++) TD.controller.clients.getClient(g[j].key).checkUserStream()
        };
    return {
        initialiseColumns: function () {
            var g, j = TD.storage.store.columnStore.getAll();
            for (g = 0; g < j.length; g++) a[j[g].key] || (a[j[g].key] = j[g]);
            setInterval(c, 12E4);
            d();
            e()
        },
        getClient: function (g) {
            return clients[g]
        },
        removeColumn: function (g) {
            if (a[g]) {
                delete a[g];
                TD.controller.feedManager.cleanupFeeds()
            }
        },
        addColumn: function (g, j, n) {
            var p;
            a[g.key] = g;
            for (var o = 0; o < g.feeds.length; o++) {
                if (j) g.feeds[o].isTemp = true;
                p = TD.controller.feedManager.addFeed(g.feeds[o]);
                p.publishChirpsOrFetch()
            }
            n && e()
        },
        refreshColumn: function (g) {
            g = a[g].feeds;
            var j = g.length,
                n;
            for (n = 0; n < j; n++) TD.controller.feedManager.getPoller(g[n].key).refresh()
        },
        refreshAccountColumns: function () {
            d()
        },
        getColumns: function () {
            return a
        },
        getColumn: function (g) {
            return a[g]
        }
    }
}();
TD.controller.FeedPoller = function (a) {
    this.OPTIMUM_ARRAY_LENGTH = 100;
    this.CLEANUP_WAIT_PERIOD = 12E4;
    this.feed = a;
    this.mark = "";
    this.chirpArray = [];
    this.chirpIndex = {};
    this.isExhausted = this.isRefreshing = false;
    this.lastInfiniteScrollTime = 0;
    this.sortFunction = function (b, d) {
        return d.created.getTime() - b.created.getTime()
    };
    this.removeChirp = function (b) {
        var d = this.chirpIndex[b],
            c;
        if (d) {
            for (var e = 0; e < this.chirpArray.length; e++) {
                c = this.chirpArray[e];
                if (c === d) {
                    this.chirpArray.splice(e, 1);
                    break
                }
            }
            delete this.chirpIndex[b];
            $.publish("/delete/" + a.key, [this, [d]])
        }
    };
    this.getRangeStartTime = function () {
        var b, d;
        b = Number.MAX_VALUE;
        d = this.feed;
        if (this.isExhausted) return 0;
        else if (d.service == "facebook" && d.type == "notifications") return 0;
        else if (d.service == "foursquare") return 0;
        else if (d.service == "buzz") {
            for (d = 0; d < this.chirpArray.length; d++) b = Math.min(this.chirpArray[d].updated.getTime(), b);
            return b
        }
        b = this.getOldestChirp();
        if (!b) return 0;
        return b.created.getTime()
    };
    this.acceptChirps = function (b) {
        if (b && b.length) {
            b = this.addChirpsToMemCache(b);
            $.publish("/feed/" + a.key, [this, b]);
            a.latestTime = Math.max(a.latestTime, a.newLatestTime);
            TD.storage.store.feedStore.save()
        }
    };
    this.refresh = function () {
        var b = this,
            d = this.feed,
            c = function (g) {
                b.isRefreshing = false;
                b.acceptChirps(g)
            },
            e = function () {
                b.isRefreshing = false
            };
        if (!this.isRefreshing) if (d = TD.controller.clients.getClient(d.accountkey)) {
            this.isRefreshing = true;
            d.refreshFeed(this, false, c, e)
        }
    };
    this.publishChirpsOrFetch = function () {
        this.chirpArray && this.chirpArray.length ? $.publish("/feed/" + this.feed.key, [this, this.chirpArray]) : this.refresh()
    };
    this.getOldestChirp = function () {
        return this.chirpArray[this.chirpArray.length - 1]
    };
    this.addChirpsToMemCache = function (b) {
        var d, c, e = this.chirpIndex,
            g = this.chirpArray,
            j = [];
        for (d = 0; d < b.length; d++) {
            c = b[d];
            if (!e[c.id]) {
                j.push(c);
                e[c.id] = c;
                g.push(c)
            }
        }
        g.sort(this.sortFunction);
        return j
    };
    this.fetchOlderChirps = function (b, d) {
        this.lastInfiniteScrollTime = (new Date).getTime();
        var c = this,
            e = c.feed;
        this.getRangeStartTime() < b ? d(e, this.chirpArray) : TD.controller.clients.getClient(e.accountkey).refreshFeed(this, true, function (g) {
            c.addChirpsToMemCache(g);
            if (g.length == 0) c.isExhausted = true;
            d(e, c.chirpArray)
        })
    };
    this.trimChirps = function () {
        if (!(this.chirpArray.length < this.OPTIMUM_ARRAY_LENGTH)) if (!((new Date).getTime() - this.lastInfiniteScrollTime < this.CLEANUP_WAIT_PERIOD)) {
            for (var b = this.chirpArray.splice(this.OPTIMUM_ARRAY_LENGTH, Number.MAX_VALUE), d = 0; d < b.length; d++) delete this.chirpIndex[b[d].id];
            this.isExhaused = false
        }
    };
    this.addChirps = function (b) {
        var d = this.feed;
        b = this.addChirpsToMemCache(b);
        $.publish("/feed/" + d.key, [d, b])
    };
    this.destroy = function () {
        var b = this.feed;
        this.chirpArray = [];
        this.chirpIndex = {};
        $.unsubscribeAll("/feed/" + b.key);
        $.unsubscribeAll("/delete/" + b.key)
    }
};
TD.controller.feedManager = function () {
    var a = {},
        b = {};
    a.init = function () {
        var d = TD.storage.store.feedStore.getAll(),
            c, e;
        for (e = 0; e < d.length; e++) {
            c = d[e];
            b[c.generateKey()] = new TD.controller.FeedPoller(c)
        }
    };
    a.getPoller = function (d) {
        return b[d]
    };
    a.trimPollers = function () {
        for (var d in b) b[d].trimChirps()
    };
    a.addFeed = function (d) {
        var c = d.generateKey();
        c = b[c];
        if (!c) {
            c = new TD.controller.FeedPoller(d);
            b[d.generateKey()] = c
        }
        return c
    };
    a.removeFeed = function (d) {
        var c = b[d.key];
        delete b[d.key];
        c.destroy();
        if (d.service == "twitter")(client = TD.controller.clients.getClient(d.accountkey)) && client.checkUserStream()
    };
    a.cleanupFeeds = function () {
        var d = TD.controller.scheduler.getColumns(),
            c = {},
            e;
        for (e in d) for (var g = d[e].feeds, j = 0; j < g.length; j++) c[g[j].key] = true;
        for (var n in b) if (!c[n]) {
            d = b[n].feed;
            a.removeFeed(d);
            TD.storage.store.feedStore.remove(d)
        }
    };
    a.deleteChirp = function (d) {
        for (var c in b) b[c].removeChirp(d)
    };
    return a
}();
TD.controller.progressIndicator = function () {
    function a() {
        x = c;
        y = g;
        var G, J = [],
            V;
        for (V in u) {
            G = u[V];
            if (G.state == e) {
                x = e;
                J.push(TD.util.i18n.getMessage("pi_working", G.message))
            }
            if (G.state == j) {
                y = j;
                J.push(TD.util.i18n.getMessage("pi_failed", G.message))
            }
        }
        if (J.length > 0) {
            o.html(J.join("<br>"));
            o.addClass("statusOn")
        } else o.removeClass();
        I || d()
    }
    function b() {
        if (!I) {
            I = setTimeout(function () {
                I = null;
                a()
            }, 100);
            d()
        }
    }
    function d() {
        if (I) {
            p.removeClass("ongoing");
            p.addClass("complete");
            r.removeClass("statusSpin")
        } else if (x == e) {
            p.removeClass("complete");
            p.addClass("ongoing");
            r.addClass("statusSpin")
        } else {
            p.removeClass("complete");
            p.removeClass("ongoing");
            r.removeClass("statusSpin")
        }
        if (y == j) {
            p.removeClass("warn");
            p.addClass("failed")
        } else if (y == n) {
            p.removeClass("failed");
            p.addClass("warn")
        } else {
            p.removeClass("failed");
            p.removeClass("warn")
        }
    }
    var c = "complete",
        e = "working",
        g = "ok",
        j = "failed",
        n = "warning",
        p = $("#statusDisplay"),
        o = $("#statusDetail"),
        r = $("#statusSpinner"),
        s = {},
        u = {},
        x = c,
        y = g,
        I = null;
    s.addTask = function (G) {
        var J = "t" + (new Date).getTime();
        u[J] = {
            message: G,
            state: e,
            timeout: null
        };
        a();
        return J
    };
    s.deleteTask = function (G) {
        delete u[G];
        a()
    };
    s.taskComplete = function (G) {
        delete u[G];
        b()
    };
    s.taskFailed = function (G, J) {
        var V = u[G];
        if (V) {
            V.state = j;
            V.message = J || V.message;
            V.timeout = setTimeout(function () {
                delete u[G];
                a()
            }, 3E4);
            a()
        }
    };
    s.changeMessage = function (G, J) {
        var V = u[G];
        if (V) {
            V.message = J;
            a()
        }
    };
    return s
}();
TD.controller.notifications = function () {
    var a = {},
        b, d = false,
        c, e = [],
        g = {},
        j = false,
        n, p = window.webkitNotifications,
        o = p && window.SharedWorker,
        r, s = function () {
            n = null;
            if (j) {
                document.getElementById("updateSound").play();
                j = false
            }
            if (e.length !== 0) {
                c = webkitNotifications.createHTMLNotification("../templates/notification.html");
                c.onclose = function () {
                    c = null;
                    g = {};
                    j = false
                };
                c.show()
            }
        },
        u = function (x) {
            switch (x) {
            case "privateMe":
                return 5;
            case "direct":
                return 4;
            case "me":
                return 3;
            case "mentions":
                return 2;
            case "home":
                return 1;
            case "search":
                return -1;
            default:
                return 0
            }
        };
    a.init = function () {
        r = o && p.checkPermission() == 0;
        if (o) {
            b = new SharedWorker("../scripts/notification.js");
            b.port.addEventListener("message", function (x) {
                if (x.data === "ready") {
                    d = true;
                    b.port.postMessage({
                        updates: e
                    });
                    e = []
                } else if (x.data.action) {
                    var y = x.data,
                        I = $("#" + y.info.columnKey),
                        G = $('article[data-key="' + y.info.chirpID + '"]', I),
                        J = true;
                    x = true;
                    var V = false;
                    switch (y.action) {
                    case "retweet":
                        $('a[rel="retweet"]', G).trigger("click");
                        break;
                    case "reply":
                        V = true;
                        $('a[rel="reply"]', G).trigger("click");
                        break;
                    case "favorite":
                        $('a[rel="favorite"]', G).trigger("click");
                        x = J = false;
                        break;
                    case "like":
                        $('a[rel="like"]', G).trigger("click");
                        x = J = false;
                        break;
                    case "comments":
                        V = true;
                        $('a[rel="comments"]', G).trigger("click");
                        break;
                    case "url":
                        window.open(y.href).focus();
                        break;
                    case "user":
                        TD.ui.profile.showProfile(TD.ui.updates.findParentArticle(G), y.href);
                        break;
                    case "hashtag":
                        TD.ui.accounts.showSearch("#" + y.text);
                        break;
                    case "showColumn":
                        V = true
                    }
                    J && chrome.extension.getBackgroundPage().TD.bg.utils.showTDTab();
                    if (V) {
                        y = $("#container");
                        I = I.position().left + I.width() / 2 - y.width() / 2;
                        $("#container").scrollLeft(I)
                    }
                    x && b.port.postMessage("closeNotification")
                }
            });
            b.port.start()
        }
    };
    a.newUpdates = function (x, y, I) {
        if (!(!r || I.length == 0 || y.isTemp)) {
            y = [];
            if (x.hasNotification) for (var G = 0; G < I.length; G++) {
                var J = I[G];
                if (!J.isOwnChirp()) {
                    var V = g[J.id];
                    if (V) {
                        if (u(x.type) > u(V.columnType)) {
                            V.columnKey = x.key;
                            V.columnTitle = x.title;
                            V.columnType = x.type;
                            V.accountKey = J.account.key
                        }
                    } else {
                        J = {
                            html: J.renderNotification(),
                            chirpID: J.id,
                            accountKey: J.account.key,
                            columnKey: x.key,
                            columnTitle: x.title,
                            columnType: x.type
                        };
                        y.push(J);
                        g[I[G].id] = J
                    }
                }
            }
            if (c) b.port.postMessage({
                updates: y
            });
            else {
                j = j || x.hasSound;
                e = e.concat(y);
                if (!n && e.length > 0) n = setTimeout(s, 500)
            }
        }
    };
    a.reRender = function (x) {
        var y = g[x.id];
        if (y) {
            var I = x.renderNotification();
            y.html = I;
            d && b.port.postMessage({
                replaceID: x.id,
                accountKey: x.account.key,
                html: I
            })
        }
    };
    a.getPermission = function () {
        if (p.checkPermission() == 0) r = true;
        else p.requestPermission(function () {
            if (p.checkPermission() == 0) r = true
        })
    };
    return a
}();
TD.controller.stats = function () {
    var a = {},
        b = "twid";
    b = "twid";
    var d, c = function (j, n) {
            var p;
            n.v = 2;
            n.cl = TD.env;
            n.tz = 0;
            n.cache = Math.round(Math.random() * 1E5);
            p = "http://tracking.tweetdeck.com/track/" + j + "?" + TD.net.util.urlencode(n);
            d.attr("src", p)
        },
        e = function () {
            var j = TD.storage.store.accountStore.getAll(),
                n, p = {};
            if (j) for (var o = 0; o < j.length; o++) {
                n = j[o];
                if (n.type == "twitter" && (!p.tw || p.tw > n.userId)) p.tw = n.userId;
                else if (n.type == "facebook" && !p.fb) p.fb = n.userId
            }
            return p
        },
        g = function (j, n, p, o, r) {
            j.tw = r;
            j.oid = p;
            j[b] = o;
            c(n, j)
        };
    a.init = function () {
        d = $("#tracking_image")
    };
    a.appOpen = function () {
        var j = e();
        j.ver = TD.version;
        c("app_open", j)
    };
    a.ping = function () {
        var j = e();
        j.interval = "900";
        c("ping", j)
    };
    a.favorite = function (j, n, p) {
        g({}, "favourite", j, n, p)
    };
    a.unfavorite = function (j, n, p) {
        g({}, "unfavourite", j, n, p)
    };
    a.retweet = function (j, n, p) {
        g({}, "retweet", j, n, p)
    };
    a.spam = function (j, n, p) {
        p = TD.core.sha1(String(p));
        var o = {};
        o.tsn = j;
        o.spam_uid = n;
        o.token = p;
        c("spam", o)
    };
    a.post = function (j) {
        var n = {};
        j = TD.storage.store.accountStore.get(j);
        var p;
        if (j) {
            switch (j.type) {
            case "twitter":
                p = "tw";
                break;
            case "facebook":
                p = "fb";
                break;
            case "buzz":
                p = "bu";
                break;
            case "foursquare":
                p = "fs";
                break;
            default:
                return
            }
            n[p] = j.userId;
            c("post", n)
        }
    };
    return a
}();
TD.controller.harmonizer = function () {
    var a = {};
    a.start = function () {
        b()
    };
    var b = function () {
            for (var d = TD.storage.store.accountStore.getAccountsForService("twitter"), c, e = (new Date).getTime() - 864E5, g = function () {}, j = 0; j < d.length; j++) {
                c = d[j];
                if (!c.updated || e > c.updated) TD.controller.auth.create("twitter", c).verifyAccount(g, g)
            }
        };
    return a
}();
TD.sync.controller = function () {
    var a = {};
    a.generalAjaxErrback = function (c, e, g) {
        console.log("Ajax request failed:");
        console.log([c, e, g]);
        var j, n;
        try {
            n = JSON.parse(c.responseText)
        } catch (p) {
            console.log(p);
            console.log(c.responseText);
            j = "failed to parse JSON response"
        }
        if (n && n.error) j = n.error;
        TD.ui.main.showError(j)
    };
    a.getAuthHeader = function (c, e) {
        if (!c || !e) {
            var g = TD.storage.store.get("tweetdeck_account");
            c = g.email;
            e = g.password
        }
        return "Basic " + TD.core.base64.encode(c + ":" + e)
    };
    var b = function (c, e, g, j) {
            c = {
                url: "https://api.tweetdeck.com/accounts",
                method: "GET",
                headers: {
                    Authorization: a.getAuthHeader(c, e)
                }
            };
            TD.net.ajax.request(c, g, j)
        },
        d = function (c, e, g, j) {
            var n = TD.util.iso8601(new Date),
                p = (new window.jsSHA("/userWRaMQNHU2Jy51bhFEL3C" + n, "ASCII")).getHMAC("MiLkmD1t1xlZqKoLLY8ScxX5gwpOQsjBopZcV4KLcuo=", "ASCII", "SHA-256", "B64");
            c = {
                url: "https://api.tweetdeck.com/user?mail_list=False",
                method: "PUT",
                headers: {
                    Authorization: a.getAuthHeader(c, e),
                    "x-td-sig": p,
                    "x-td-timestamp": n,
                    "x-td-create": "WRaMQNHU2Jy51bhFEL3C"
                }
            };
            TD.net.ajax.request(c, g, j)
        };
    a.init = function () {
        var c = TD.storage.store.get("tweetdeck_account");
        c.email && c.password && a.fetchAccounts()
    };
    a.loginTweetdeck = function (c, e, g, j, n) {
        var p = TD.core.sha1(e);
        n && TD.ui.main.showInfoMessage(TD.util.i18n.getMessage("signing_in"), "message");
        return b(c, p, function (o) {
            TD.storage.store.set("tweetdeck_account", {
                email: c,
                password: p
            });
            var r = TD.storage.store.accountStore.getAll(),
                s;
            for (s = 0; s < r.length; s++) a.pushAccount(r[s]);
            a.addAccounts(o, n);
            g && g()
        }, function (o, r, s) {
            n && TD.ui.main.showInfoMessage(TD.util.i18n.getMessage("sign_in_unsuccessful"), "error");
            if (j) j(o, r, s);
            else n || a.generalAjaxErrback(o, r, s)
        })
    };
    a.createTweetdeckAccount = function (c, e, g, j) {
        var n = TD.core.sha1(e);
        if (!j) j = a.generalAjaxErrback;
        return d(c, n, function (p) {
            var o = {
                email: c,
                password: n
            },
                r = TD.storage.store.accountStore.getAll();
            TD.storage.store.set("tweetdeck_account", o);
            a.addAccounts(p);
            for (p = 0; p < r.length; p++) a.pushAccount(r[p]);
            g && g()
        }, j)
    };
    a.fetchAccounts = function (c, e) {
        if (!e) e = a.generalAjaxErrback;
        return b(null, null, function (g) {
            a.addAccounts(g);
            if ((TD.storage.store.get("dbg").colnames || []).length > 0) {
                g = TD.storage.store;
                for (var j = g.get("dbg").colnames || [], n = g.columnStore.getAll(), p = g.accountStore.getAll(), o = 0; o < p.length; o++) for (var r = TD.controller.auth.create(p[o].type, null).getColumnDescriptors(), s = 0; s < r.length; s++) for (var u = r[s], x = 0; x < j.length; x++) {
                    for (var y = false, I = 0; I < n.length; I++) if (j[x] === n[I].title) {
                        y = true;
                        break
                    }!y && u.title === j[x] && TD.ui.columns.addColumnToUI(g.columnStore.makeColumnAndFeed(u.title, u.type, u.service, p[o].key, {}))
                }
            }
            c && c()
        }, e)
    };
    a.pushAccounts = function () {
        TD.ui.main.showError("Someone has been overly optimistic.  Bummer.")
    };
    a.pushAccount = function (c, e, g) {
        var j = {
            secret: c.token_secret,
            screen_name: c.screen_name
        };
        if (TD.storage.store.get("tweetdeck_account").email) {
            if (c.type === "facebook") j.token = c.oauth_token;
            else j.key = c.oauth_token;
            c = {
                url: "https://api.tweetdeck.com/accounts/" + c.type + "/" + c.userId,
                method: "POST",
                headers: {
                    Authorization: a.getAuthHeader()
                },
                body: JSON.stringify(j)
            };
            if (!g) g = a.generalAjaxErrback;
            TD.net.ajax.request(c, e, g)
        }
    };
    a.deleteAccount = function (c, e, g) {
        c = {
            url: "https://api.tweetdeck.com/accounts/" + c.type + "/" + c.userId,
            method: "DELETE",
            headers: {
                Authorization: a.getAuthHeader()
            }
        };
        if (!g) g = a.generalAjaxErrback;
        TD.net.ajax.request(c, e, g)
    };
    a.addAccounts = function (c, e) {
        var g = {},
            j, n, p, o, r = TD.storage.store.accountStore;
        p = TD.storage.store.settingsStore.get(":ACCOUNTS_BLACKLIST") || {};
        var s = r.getAll().length == 0,
            u = TD.controller.auth.create;
        if (c) {
            e && TD.ui.main.showInfoMessage(TD.util.i18n.getMessage("syncing_accounts"), "message");
            for (j = 0; j < c.length; j++) {
                n = c[j];
                if (!p[encodeURI(n.service + ":" + n.uid)]) {
                    switch (n.service) {
                    case "twitter":
                    case "foursquare":
                    case "buzz":
                        if (!n.key || !n.service || n.uid == 1E3) continue;
                        break;
                    case "facebook":
                        if (!n.token) continue;
                        break;
                    default:
                        continue
                    }
                    g[n.service] = g[n.service] || [];
                    if (n.service == "twitter" || g[n.service].length == 0) g[n.service].push(n);
                    else if (Number(g[n.service][0].uid) > Number(n.uid)) g[n.service][0] = n
                }
            }
            var x = 0,
                y = function () {
                    x++;
                    if (x == c.length) {
                        e && TD.ui.main.showInfoMessage(TD.util.i18n.getMessage("account_sync_complete"), "message");
                        s && x >= 1 && r.setFirstRunDefault();
                        TD.controller.clients.initialiseClients();
                        TD.ui.main.renderTDButton()
                    }
                },
                I = function (J) {
                    J.computeKey();
                    r.add(J);
                    y()
                },
                G = function () {
                    y()
                };
            for (j = 0; j < c.length; j++) {
                n = c[j];
                p = n.service;
                if (!g[p] || g[p].indexOf(n) === -1) y();
                else switch (p) {
                case "twitter":
                case "buzz":
                case "foursquare":
                    if (!n.key || !n.secret) {
                        y();
                        continue
                    }
                    o = r.makeAccount(p);
                    o.authType = "oauth";
                    o.uid = n.uid;
                    o.oauth_token = n.key;
                    o.token_secret = n.secret;
                    u(p, o).verifyAccount(I, G);
                    break;
                case "facebook":
                    o = r.makeAccount(p);
                    o.authType = "fb";
                    o.oauth_token = n.token;
                    o.userId = n.uid;
                    o.profileImageURL = "http://graph.facebook.com/" + n.uid + "/picture";
                    u(p, o).verifyAccount(I, G);
                    break;
                case "myspace":
                case "linkedin":
                    console.log("api returned known account type not supported in chrome client yet:");
                    console.log(n);
                    y();
                    break;
                default:
                    console.log("api returned unknown account type:");
                    console.log(n);
                    y()
                }
            }
        } else console.log("sync.controller.addAccounts(): no accounts in response :-(")
    };
    a.plank = function (c, e, g, j, n) {
        var p = false,
            o = {
                url: PLANK_ROOT + "/longer",
                method: "POST",
                headers: {},
                body: JSON.stringify({
                    screen_name: e.username,
                    uid: e.userId,
                    long_text: c,
                    store_only: true
                })
            };
        e = function (s) {
            if (p) {
                if (!s || !s.headers || !s.headers.Authorization) {
                    n();
                    return
                }
                o.headers["X-Auth-Service-Provider"] = "https://api.twitter.com/1/account/verify_credentials.json";
                o.headers["X-Verify-Credentials-Authorization"] = s.headers.Authorization
            }
            TD.net.ajax.request(o, function (u, x, y) {
                plank_cache[u.id] = {
                    long_text: c
                };
                j && j(u, x, y)
            }, n)
        };
        var r = TD.storage.store.get("tweetdeck_account");
        if (r && r.email && r.password) {
            o.headers.Authorization = _getAuthHeader(r.email, r.password);
            e()
        } else {
            p = true;
            g.getOAuthEchoHeader(e, n, true)
        }
    };
    a.unplank = function (c, e, g) {
        plank_cache[c] ? e(plank_cache[c], "success", null) : TD.net.ajax.request({
            url: PLANK_ROOT + "/longer/" + c,
            method: "GET"
        }, function (j, n, p) {
            if (j && j.id) plank_cache[j.id] = j;
            e && e(j, n, p)
        }, g)
    };
    return a
}();
TD.sync.deckly = function () {
    var a = {};
    a.PLANK_RE = /^([\s\S]*)\ \(cont\)\ (http:\/\/)?(deck\.ly|deck\.to|deckly\.com)\/~(\w+)$/;
    var b = {};
    a.plank = function (c, e, g, j) {
        var n = TD.controller.clients.getClient(e),
            p = function (s) {
                event.preventDefault();
                s = s.attr("rel");
                TD.ui.main.hideModalWindow();
                switch (s) {
                case "ok":
                    d(o, e, r, j);
                    break;
                case "cancel":
                    j()
                }
            },
            o = {
                url: "https://api.tweetdeck.com/longer",
                method: "POST",
                body: JSON.stringify({
                    screen_name: n.oauth.account.username,
                    uid: n.oauth.account.userId,
                    long_text: c,
                    store_only: true
                })
            },
            r = function (s, u, x) {
                b[s.id] = {
                    long_text: c,
                    id: s.id
                };
                g && g(s, u, x)
            };
        if (n.oauth.account.isPrivate) {
            n = {
                title: TD.util.i18n.getMessage("deckly_confirm_title"),
                desc: TD.util.i18n.getMessage("deckly_confirm_description", [n.oauth.account.username]),
                okLabel: TD.util.i18n.getMessage("yes"),
                cancelLabel: TD.util.i18n.getMessage("no")
            };
            n = TD.ui.template.render("menus/modal_dialogue", {
                content: n
            });
            TD.ui.main.showModalWindow(n, null, null, null, null, true, p)
        } else d(o, e, r, j)
    };
    a.link = function (c, e, g) {
        c = {
            url: "https://api.tweetdeck.com/link",
            method: "POST",
            body: JSON.stringify({
                token: c,
                id: e,
                update_id: g
            })
        };
        TD.net.ajax.request(c)
    };
    a.destroy = function (c, e) {
        var g = {
            url: "https://api.tweetdeck.com/longer/" + c,
            method: "DELETE"
        };
        delete b[c];
        d(g, e)
    };
    a.unplank = function (c, e, g) {
        b[c] ? e(b[c], "success", null) : TD.net.ajax.request({
            url: "https://api.tweetdeck.com/longer/" + c,
            method: "GET"
        }, function (j, n, p) {
            if (j && j.id) b[j.id] = j;
            e && e(j, n, p)
        }, g)
    };
    var d = function (c, e, g, j) {
            var n;
            e = TD.controller.clients.getClient(e);
            var p = TD.storage.store.get("tweetdeck_account");
            c.headers = c.headers || {};
            var o = function (r) {
                    if (n) {
                        if (!r || !r.headers || !r.headers.Authorization) {
                            j && j();
                            return
                        }
                        c.headers["X-Auth-Service-Provider"] = "https://api.twitter.com/1/account/verify_credentials.json";
                        c.headers["X-Verify-Credentials-Authorization"] = r.headers.Authorization
                    }
                    TD.net.ajax.request(c, g, j)
                };
            if (p && p.email && p.password) {
                n = false;
                c.headers.Authorization = TD.sync.controller.getAuthHeader(p.email, p.password);
                o()
            } else {
                n = true;
                e.getOAuthEchoHeader(o, j, true)
            }
        };
    return a
}();
TD.storage.model.Account = function () {
    this.username = "";
    this.isDefault = false;
    this.profileImageURL = this.key = this.token_secret = this.oauth_token = this.type = this.userId = "";
    this.isPrivate = null;
    this.computeKey = function () {
        if (!this.type || !this.userId) throw {
            name: "NotReadyError",
            message: "cannot computeKey on account; insufficient data"
        };
        this.key = encodeURI(this.type + ":" + this.userId)
    }
};
TD.storage.model.Feed = function () {
    this.metadata = {};
    this.mark = this.key = this.accountkey = this.service = this.type = "";
    this.newLatestTime = this.latestTime = 0;
    this.generateKey = function () {
        return encodeURI(this.accountkey + this.type + (this.type == "search" ? this.metadata.term : this.type == "list" ? this.metadata.screenName + this.metadata.slug : this.type == "group" || this.type == "page" ? this.metadata.id : this.type == "favorites" ? this.metadata.id || "" : this.type == "usertweets" ? this.metadata.id : ""))
    };
    this.setNewLatestTime = function (a) {
        this.newLatestTime = Math.max(this.newLatestTime, a)
    }
};
TD.storage.model.Column = TD.vo.Column;
TD.storage.store = function (a) {
    var b = {},
        d = {
            feedStore: {},
            inits: []
        },
        c;
    b.feedStore = function () {
        var e = {},
            g = ["type", "service", "accountkey", "metadata", "latestTime"],
            j = {},
            n = function (o, r, s, u, x) {
                var y = new a.model.Feed;
                y.metadata = u;
                y.type = o;
                y.service = r;
                y.accountkey = s;
                y.latestTime = x || 0;
                y.accountkey || console.log("WARNING; creating feed with no accountkey set");
                y.key = y.generateKey();
                return y
            },
            p = function (o) {
                return j[o]
            };
        d.feedStore._get = p;
        d.inits.push(function () {
            var o = b.get("feeds"),
                r;
            for (r in o) {
                var s = o[r];
                if (!s.accountkey) {
                    console.log("WARNING: accountkey not set in stored feed;");
                    console.log(s)
                }
                s = n(s.type, s.service, s.accountkey, s.metadata, s.latestTime);
                j[s.key] = s
            }
        });
        e.addFeeds = function (o) {
            for (var r = 0; r < o.length; r++) {
                var s = o[r];
                j[s.key] = s;
                e.save()
            }
        };
        e.remove = function (o) {
            delete j[o.key];
            e.save()
        };
        e.getAll = function () {
            return TD.util.values(j)
        };
        e.makeFeed = function (o, r, s, u) {
            o = n(o, r, s, u);
            return (r = p(o.generateKey())) ? r : o
        };
        e.save = function () {
            var o = {},
                r;
            for (r in j) o[r] = TD.util.selectAttrsFrom(j[r], g);
            b.set("feeds", o)
        };
        return e
    }();
    b.columnStore = function () {
        var e = {},
            g = ["key", "title", "type", "hasSound", "hasNotification"],
            j = {},
            n = 0,
            p = function (o, r, s, u) {
                var x = new a.model.Column;
                x.key = o;
                x.title = r;
                x.feeds = s;
                if (u) {
                    x.type = u;
                    switch (u) {
                    case "me":
                    case "privateMe":
                    case "mentions":
                    case "direct":
                        x.hasSound = true;
                        x.hasNotification = true
                    }
                }
                return x
            };
        d.inits.push(function () {
            var o, r = b.get("columns"),
                s;
            for (s in r) {
                for (var u = r[s], x = [], y = 0; y < u.feedkeys.length; y++)(o = d.feedStore._get(u.feedkeys[y])) && x.push(o);
                o = p(u.key, u.title, x, u.type);
                if (u.hasSound != undefined) o.hasSound = u.hasSound;
                if (u.hasNotification != undefined) o.hasNotification = u.hasNotification;
                j[o.key] = o
            }
        });
        e.add = function (o) {
            j[o.key] = o;
            e.save()
        };
        e.remove = function (o) {
            delete j[o.key];
            e.save()
        };
        e.getAll = function () {
            return TD.util.values(j)
        };
        e.addDefaultColumns = function () {
            var o, r = [];
            o = e.makeColumn(TD.util.i18n.getMessage("home"), [], "home");
            e.add(o);
            r.push(o.key);
            o = e.makeColumn(TD.util.i18n.getMessage("me"), [], "me");
            e.add(o);
            r.push(o.key);
            o = e.makeColumn(TD.util.i18n.getMessage("messages"), [], "privateMe");
            e.add(o);
            r.push(o.key);
            TD.storage.store.settingsStore.set("column_order", r)
        };
        e.get = function (o) {
            return j[o]
        };
        e.makeColumn = function (o, r, s) {
            var u = "c" + (new Date).getTime() + "s" + n++;
            return p(u, o, r, s)
        };
        e.makeColumnAndFeed = function (o, r, s, u, x) {
            var y = [],
                I = b.feedStore.makeFeed(r, s, u, x);
            y.push(I);
            if (r == "direct") {
                I = b.feedStore.makeFeed("sentdirect", s, u, x);
                y.push(I)
            }
            return e.makeColumn(o, y, "other")
        };
        e.save = function () {
            var o = {},
                r;
            for (r in j) {
                var s = j[r],
                    u = TD.util.selectAttrsFrom(s, g);
                u.feedkeys = [];
                for (var x in s.feeds) u.feedkeys.push(s.feeds[x].key);
                o[r] = u
            }
            b.set("columns", o)
        };
        return e
    }();
    b.accountStore = function () {
        var e = {},
            g = ["username", "userId", "profileImageURL", "type", "isDefault", "oauth_token", "token_secret", "key", "isPrivate", "updated"],
            j = {};
        e.__dbg = {};
        var n = function () {
                var p = b.get("accounts"),
                    o;
                for (o in p) {
                    for (var r = new a.model.Account, s = 0; s < g.length; s++) r[g[s]] = p[o][g[s]];
                    j[r.key] = r
                }
            };
        e.__dbg._load = n;
        d.inits.push(n);
        e.add = function (p) {
            if (!p.key) throw {
                name: "TypeError",
                message: "account must have its .key set"
            };
            j[p.key] = p;
            e.save();
            e.getDefault() || e.setDefault(p.key)
        };
        e.remove = function (p) {
            var o = p.key === e.getDefault().key;
            delete j[p.key];
            e.save();
            o && e.setFirstRunDefault()
        };
        e.getAll = function () {
            var p = TD.util.values(j);
            p.sort(function (o, r) {
                var s = o.type == "twitter" ? 2 : 1,
                    u = r.type == "twitter" ? 2 : 1;
                return s < u ? 1 : s > u ? -1 : s == 2 && u == 2 ? o.userId > r.userId ? 1 : -1 : o.type > r.type ? 1 : -1
            });
            return p
        };
        e.get = function (p) {
            return j[p]
        };
        e.getDefault = function () {
            var p = TD.storage.store.get(":DEFAULT_ACCOUNT");
            if (p && p.length) return j[p[0]]
        };
        e.setDefault = function (p) {
            TD.storage.store.set(":DEFAULT_ACCOUNT", [p]);
            TD.ui.columns.refreshCombinedColumnFeeds()
        };
        e.setFirstRunDefault = function () {
            var p = e.getAll();
            p.length && e.setDefault(p[0].key)
        };
        e.getAccountsForService = function (p) {
            var o, r = [];
            for (o in j) j[o].type === p && r.push(j[o]);
            return r
        };
        e.makeAccount = function (p) {
            var o = new TD.storage.model.Account;
            o.type = p;
            return o
        };
        e.save = function () {
            var p = {},
                o;
            for (o in j) p[o] = TD.util.selectAttrsFrom(j[o], g);
            b.set("accounts", p)
        };
        return e
    }();
    b.settingsStore = function () {
        var e = {},
            g;
        d.inits.push(function () {
            g = b.get("settings")
        });
        e.set = function (j, n) {
            g[j] = n;
            b.set("settings", g)
        };
        e.get = function (j) {
            return g[j]
        };
        e.remove = function (j) {
            delete g[j];
            b.set("settings", g)
        };
        return e
    }();
    b.init = function (e) {
        try {
            e.getItem("tweetdeck_account")
        } catch (g) {
            console.log(g);
            alert("failed to open localStorage")
        }
        c = e;
        for (var j in d.inits) d.inits[j]()
    };
    b.get = function (e) {
        try {
            return JSON.parse(c.getItem(e)) || {}
        } catch (g) {
            console.log("ERROR: failed to parse store key (" + e + ")");
            console.log(g);
            return c.getItem(e)
        }
    };
    b.set = function (e, g) {
        c.setItem(e, JSON.stringify(g))
    };
    b.size = function () {
        return c.length
    };
    b.remove = function (e) {
        c.removeItem(e)
    };
    return b
}(TD.storage);
TD.controller.auth = function () {
    var a = {},
        b = {
            twitter: "TwitterAuth",
            buzz: "BuzzAuth",
            facebook: "FacebookAuth",
            foursquare: "FoursquareAuth"
        };
    a.create = function (d, c) {
        return new TD.controller.auth[b[d]](c)
    };
    return a
}();
TD.controller.auth.AuthorisationProcessor = function () {
    this.start = function (a, b) {
        TD.util.isChromeApp() ? this.start_chrome(a, b) : this.start_web(a, b)
    };
    this.start_web = function (a, b) {
        var d = window.open(this.getAuthURL(a.type), "mywindow", "width=800,height=450"),
            c = this,
            e = function () {
                var g;
                try {
                    if (d && d.location && d.location.href) g = d.location.href
                } catch (j) {
                    console.log(j)
                }
                if (g) if (g = c.getTokenFromURL(a, g, b)) {
                    g.access_token ? c.updateAccount(g.access_token, b) : c.updateAccount(g.oauth_token, g.oauth_token_secret, b);
                    d.close();
                    return
                }
                setTimeout(e, 100)
            };
        setTimeout(e, 500)
    };
    this.getAuthURL = function (a) {
        return TD.net.ajax.HOST_BASE_URL + (a == "facebook" ? "oauth2/authorize" : "oauth/authorize/" + a)
    };
    this.getTokenFromURL = function (a, b) {
        var d;
        if (_.contains(b, "/oauth/success/" + a.type) || _.contains(b, "/oauth2/success")) {
            d = b.split("?")[1];
            d = TD.net.util.formDecode(d)
        }
        return d
    };
    this.start_chrome = function (a, b) {
        var d = this,
            c, e;
        chrome.tabs.getSelected(null, function (g) {
            c = g.id
        });
        e = {
            url: this.getAuthURL(a.type)
        };
        chrome.tabs.create(e, function (g) {
            var j = g.id;
            chrome.tabs.onUpdated.addListener(function (n, p, o) {
                if (n === j && o.url && o.status == "complete") if (p = d.getTokenFromURL(a, o.url, b)) {
                    p.access_token ? d.updateAccount(p.access_token, b) : d.updateAccount(p.oauth_token, p.oauth_token_secret, b);
                    chrome.tabs.update(c, {
                        selected: true
                    });
                    chrome.tabs.remove(n)
                }
            })
        })
    };
    this.makeColDesc = function (a, b, d, c, e) {
        var g = a;
        if (e) g = e + " " + g;
        return {
            title: a,
            columnTitle: g,
            type: b,
            service: d,
            meta: c
        }
    }
};
TD.controller.auth.TwitterAuth = function (a) {
    var b = this;
    b.account = a;
    b.getColumnDescriptors = function () {
        var d = [b.makeColDesc(TD.util.i18n.getMessage("col_title_all_friends"), "home", "twitter", null, b.account.username), b.makeColDesc(TD.util.i18n.getMessage("mentions"), "mentions", "twitter", null, b.account.username), b.makeColDesc(TD.util.i18n.getMessage("col_title_dms"), "direct", "twitter", null, b.account.username), b.makeColDesc(TD.util.i18n.getMessage("favorites"), "favorites", "twitter", b.account.userId, b.account.username)],
            c = [],
            e = TD.controller.clients.getClient(b.account.key),
            g, j;
        if (e && e.lists) {
            var n = [],
                p = [];
            for (g = 0; g < e.lists.length; g++) {
                j = e.lists[g];
                var o = {};
                o.name = j.name;
                o.username = j.user.screen_name;
                if (j.following) {
                    o.realname = j.user.name;
                    p.push(b.makeColDesc(j.full_name, "list", "twitter", o))
                } else n.push(b.makeColDesc(j.full_name, "list", "twitter", o))
            }
            c = c.concat(n, p)
        }
        return {
            columns: d,
            lists: c
        }
    };
    this.verifyAccount = function (d, c) {
        var e = b.account,
            g = function (j) {
                e.username = j.screen_name;
                e.profileImageURL = j.profile_image_url;
                e.userId = j.id;
                e.isPrivate = j["protected"];
                e.updated = (new Date).getTime();
                e.key = encodeURI(e.type + ":" + e.userId);
                TD.storage.store.accountStore.save();
                d(e)
            };
        !TD.util.isChromeApp() && !TD.util.isDesktopApp() ? TD.net.ajax.proxy("https://api.twitter.com/1/account/verify_credentials.json", g, {
            method: "GET"
        }, e, c) : TD.net.ajax.bounce("https://api.twitter.com/1/account/verify_credentials.json", g, {
            method: "GET"
        }, e, c)
    };
    this.updateAccount = function (d, c, e) {
        var g = b.account;
        g.username = "";
        g.userId = "";
        g.type = "twitter";
        g.authType = "oauth";
        g.oauth_token = d;
        g.token_secret = c;
        this.verifyAccount(e)
    }
};
TD.controller.auth.FacebookAuth = function (a) {
    var b = this;
    b.account = a;
    b.getColumnDescriptors = function () {
        var d = [b.makeColDesc(TD.util.i18n.getMessage("col_title_news_feed"), "home", "facebook"), b.makeColDesc(TD.util.i18n.getMessage("col_title_notif"), "notifications", "facebook")],
            c = [],
            e = [],
            g = TD.controller.clients.getClient(b.account.key),
            j, n;
        if (g && g.groups) for (j = 0; j < g.groups.length; j++) {
            n = g.groups[j];
            c.push(b.makeColDesc(n.name, "group", "facebook", n.id))
        }
        if (g && g.pages) for (j = 0; j < g.pages.length; j++) {
            n = g.pages[j];
            e.push(b.makeColDesc(n.name, "page", "facebook", n.id))
        }
        return {
            columns: d,
            pages: e,
            groups: c
        }
    };
    this.verifyAccount = function (d, c) {
        var e = b.account;
        TD.net.ajax.jsonp("https://graph.facebook.com/me", {
            access_token: e.oauth_token
        }, function (g) {
            try {
                e.userId = g.id;
                e.profileImageURL = "http://graph.facebook.com/" + g.id + "/picture";
                e.username = g.name;
                e.key = encodeURI(e.type + ":" + e.userId);
                d(e)
            } catch (j) {
                c()
            }
        }, function () {
            c()
        })
    };
    this.updateAccount = function (d, c) {
        var e = b.account;
        e.username = "Facebook";
        e.oauth_token = d;
        this.verifyAccount(c)
    }
};
TD.controller.auth.BuzzAuth = function (a) {
    var b = this;
    b.account = a;
    b.getColumnDescriptors = function () {
        return {
            columns: [b.makeColDesc(TD.util.i18n.getMessage("home"), "home", "buzz")]
        }
    };
    this.verifyAccount = function (d, c) {
        var e = b.account,
            g = {
                alt: "json"
            },
            j = function (n) {
                e.username = n.data.displayName;
                e.userId = n.data.id;
                e.profileImageURL = n.data.thumbnailUrl;
                e.key = encodeURI(e.type + ":" + e.userId);
                d(e)
            };
        !TD.util.isChromeApp() && !TD.util.isDesktopApp() ? TD.net.ajax.proxy("https://www.googleapis.com/buzz/v1/people/@me/@self", j, {
            method: "GET",
            parameters: g
        }, e, c) : TD.net.ajax.bounce("https://www.googleapis.com/buzz/v1/people/@me/@self", j, {
            method: "GET",
            parameters: g
        }, e, c)
    };
    this.updateAccount = function (d, c, e) {
        var g = b.account;
        g.username = "";
        g.userId = "";
        g.type = "buzz";
        g.oauth_token = d;
        g.token_secret = c;
        g.key = encodeURI(d);
        this.verifyAccount(e)
    }
};
TD.controller.auth.FoursquareAuth = function (a) {
    var b = this;
    b.account = a;
    b.getColumnDescriptors = function () {
        return {
            columns: [b.makeColDesc(TD.util.i18n.getMessage("friends_checkins"), "home", "foursquare")]
        }
    };
    this.updateAccount = function (d, c, e) {
        var g = b.account;
        g.username = "";
        g.userId = "";
        g.type = "foursquare";
        g.oauth_token = d;
        g.token_secret = c;
        g.key = encodeURI(d);
        this.verifyAccount(e)
    };
    this.verifyAccount = function (d, c) {
        var e = b.account;
        TD.net.ajax.request({
            method: "GET",
            url: "https://api.foursquare.com/v2/users/self",
            params: {
                oauth_token: e.token_secret
            }
        }, function (g) {
            if (!g.meta || g.meta.code != 200) c();
            g = g.response.user;
            e.username = g.firstName;
            if (g.lastName) e.username += " " + g.lastName;
            e.userId = g.id;
            e.profileImageURL = g.photo;
            e.key = encodeURI(e.type + ":" + e.userId);
            d(e)
        }, c)
    }
};
TD.controller.auth.TwitterAuth.prototype = new TD.controller.auth.AuthorisationProcessor;
TD.controller.auth.FacebookAuth.prototype = new TD.controller.auth.AuthorisationProcessor;
TD.controller.auth.BuzzAuth.prototype = new TD.controller.auth.AuthorisationProcessor;
TD.controller.auth.FoursquareAuth.prototype = new TD.controller.auth.AuthorisationProcessor;
TD.services.makeServiceClient = function (a, b) {
    switch (a) {
    case "twitter":
        return new TD.services.TwitterClient(b);
    case "facebook":
        return new TD.services.FacebookClient(b);
    case "buzz":
        return new TD.services.BuzzClient(b);
    case "foursquare":
        return new TD.services.FoursquareClient(b)
    }
};
TD.services.ServiceClient = function () {};
TD.services.ServiceClient.prototype.profileCache = {};
TD.services.ServiceClient.prototype.get = function (a, b, d, c, e) {
    if (d) TD.util.isChromeApp() || TD.util.isDesktopApp() ? TD.net.ajax.bounce(a, c, {
        method: "GET",
        parameters: b
    }, this.oauth.account, e) : TD.net.ajax.proxy(a, c, {
        method: "GET",
        parameters: b
    }, this.oauth.account, e);
    else TD.net.ajax.request({
        url: a,
        method: "GET",
        params: b
    }, c, e)
};
TD.services.ServiceClient.prototype.post = function (a, b, d, c, e, g) {
    TD.util.isChromeApp() || TD.util.isDesktopApp() ? TD.net.ajax.bounce(a, e, {
        method: "POST",
        parameters: b,
        body: d,
        headers: c
    }, this.oauth.account, g) : TD.net.ajax.proxy(a, e, {
        method: "POST",
        parameters: b,
        body: d,
        headers: c
    }, this.oauth.account, g)
};
TD.services.ServiceClient.prototype.put = function (a, b, d, c, e, g) {
    TD.util.isChromeApp() || TD.util.isDesktopApp() ? TD.net.ajax.bounce(a, e, {
        method: "PUT",
        parameters: b,
        body: d,
        headers: c
    }, this.oauth.account, g) : TD.net.ajax.proxy(a, e, {
        method: "PUT",
        parameters: b,
        body: d,
        headers: c
    }, this.oauth.account, g)
};
TD.services.ServiceClient.prototype.del = function (a, b, d, c, e, g) {
    TD.util.isChromeApp() || TD.util.isDesktopApp() ? TD.net.ajax.bounce(a, e, {
        method: "DELETE",
        parameters: b,
        body: d,
        headers: c
    }, this.oauth.account, g) : TD.net.ajax.proxy(a, e, {
        method: "DELETE",
        parameters: b,
        body: d,
        headers: c
    }, this.oauth.account, g)
};
TD.services.ChirpBase = function (a) {
    this.account = a
};
TD.services.ChirpBase.prototype.id = "";
TD.services.ChirpBase.prototype.text = "";
TD.services.ChirpBase.prototype.translatedText = "";
TD.services.ChirpBase.prototype.isTranslated = false;
TD.services.ChirpBase.prototype.extendedText = "";
TD.services.ChirpBase.prototype.extendedTextHTML = "";
TD.services.ChirpBase.prototype.created = null;
TD.services.ChirpBase.prototype.htmlText = "";
TD.services.ChirpBase.prototype.decklyID = "";
TD.services.ChirpBase.prototype.decklyURL = "";
TD.services.ChirpBase.prototype.fullText = "";
TD.services.ChirpBase.prototype.isTruncatable = false;
TD.services.ChirpBase.prototype.isTruncated = false;
TD.services.ChirpBase.prototype.TRUNCATE_THRESHOLD = 250;
TD.services.ChirpBase.prototype.TRUNCATE_STRETCH = 100;
TD.services.ChirpBase.prototype.fromJSONObject = function () {
    throw "fromJSONObject Not Implemented";
};
TD.services.ChirpBase.prototype.isOwnChirp = function () {
    throw "isOwnChirp Not Implemented";
};
TD.services.ChirpBase.prototype.destroy = function () {
    throw "destroy Not Implemented";
};
TD.services.ChirpBase.prototype.render = function () {
    throw "render Not Implemented";
};
TD.services.ChirpBase.prototype.renderNotification = function () {
    throw "renderNotification Not Implemented";
};
TD.services.ChirpBase.prototype.email = function () {
    throw "email Not Implemented";
};
TD.services.ChirpBase.prototype.getComments = function () {
    throw "getComments Not Implemented";
};
TD.services.ChirpBase.prototype.postComment = function () {
    throw "postComment Not Implemented";
};
TD.services.ChirpBase.prototype.getChirpURL = function () {
    throw "getChirpURL Not Implemented";
};
TD.services.ChirpBase.prototype.toHTML = function (a) {
    return TD.util.transform(a)
};
TD.services.ChirpBase.prototype.translate = function () {
    var a = this,
        b = TD.controller.progressIndicator.addTask("Translation");
    TD.services.translation.translate(this.fullText || this.text, function (d) {
        if (d) {
            TD.controller.progressIndicator.taskComplete(b);
            a.isTranslated = true;
            a.translatedText = d;
            a.renderAndReplace()
        } else TD.controller.progressIndicator.taskFailed(b)
    })
};
TD.services.ChirpBase.prototype.untranslate = function () {
    this.isTranslated = false;
    this.renderAndReplace()
};
TD.services.ChirpBase.prototype.deckExtend = function () {
    this._deckExtendInternal(this.retweetedStatus ? this.retweetedStatus.text : this.text)
};
TD.services.ChirpBase.prototype._deckExtendInternal = function (a) {
    if (!(!a || this.fullText)) {
        var b = this,
            d = a.match(TD.sync.deckly.PLANK_RE);
        d && TD.sync.deckly.unplank(d[4], function (c) {
            var e = b.getMainUser();
            if (c && c.long_text) if (c.uid && e.id && c.uid != e.id) console.log("bad uid");
            else if (c.screen_name && c.screen_name.toLowerCase() != e.screenName.toLowerCase()) console.log("bad screen name");
            else {
                var g = /\S{1,10}/;
                e = g.exec(d[1])[0];
                g = g.exec(c.long_text)[0];
                if (e != g) console.log("bad text");
                else {
                    b.decklyID = c.id;
                    b.decklyURL = "http://" + d[3] + "/~" + d[4];
                    b.fullText = c.long_text;
                    b.isTruncated = b.fullText.length > b.TRUNCATE_THRESHOLD;
                    b.renderAndReplace()
                }
            }
        })
    }
};
TD.services.ChirpBase.prototype.toggleReadMore = function () {
    this.isTruncated = !this.isTruncated;
    this.renderAndReplace()
};
TD.services.ChirpBase.prototype._generateHTMLText = function () {
    var a;
    a = this.isTranslated ? this.translatedText : this.fullText || this.text;
    this.isTruncated ? this._showTruncatedText(a) : this._showFullText(a)
};
TD.services.ChirpBase.prototype._showTruncatedText = function (a) {
    var b = TD.util.truncateText(a, "&#8230;", this.TRUNCATE_THRESHOLD, this.TRUNCATE_STRETCH, true, 4);
    if (b) {
        if (this.decklyID) {
            a = TD.util.i18n.getMessage("read_more").replace(/\ /g, "&nbsp;");
            b += ' <a href="' + this.decklyURL + '" rel="toggleReadMore" class="url-ext">' + a + "</a>"
        }
        this.htmlText = b;
        this.isTruncated = this.isTruncatable = true
    } else {
        this.htmlText = this.toHTML(a);
        this.isTruncated = false
    }
};
TD.services.ChirpBase.prototype._showFullText = function (a) {
    this.htmlText = this.toHTML(a);
    if (this.isTruncatable) this.htmlText += '<br><a href="#" rel="toggleReadMore" class="url-ext">' + TD.util.i18n.getMessage("read_less").replace(/\ /g, "&nbsp;") + "</a>";
    this.isTruncated = false
};
TD.services.ChirpBase.prototype.renderAndReplace = function () {
    this._generateHTMLText();
    var a = this.render();
    $("article[data-key='" + this.id + "'][data-account-key='" + this.account.key + "']").each(function () {
        $(this).replaceWith(a)
    })
};
TD.services.TwitterStatus = function (a) {
    this.account = a
};
TD.services.TwitterStatus.prototype = new TD.services.ChirpBase;
TD.services.TwitterStatus.prototype.user = null;
TD.services.TwitterStatus.prototype.inReplyToID = "";
TD.services.TwitterStatus.prototype.inReplyToScreenName = "";
TD.services.TwitterStatus.prototype.isFavorite = false;
TD.services.TwitterStatus.prototype.entities = {
    urls: [],
    hashtags: [],
    user_mentions: [],
    media: []
};
TD.services.TwitterStatus.prototype.location = null;
TD.services.TwitterStatus.prototype.place = null;
TD.services.TwitterStatus.prototype.locationName = "";
TD.services.TwitterStatus.prototype.country = "";
TD.services.TwitterStatus.prototype.coordinates = null;
TD.services.TwitterStatus.prototype.mapURL = "";
TD.services.TwitterStatus.msFudge = 0;
TD.services.TwitterStatus.prototype.fromJSONObject = function (a) {
    var b, d = TD.services.TwitterStatus.msFudge;
    this.user = new TD.services.TwitterUser(this.account);
    if (a.from_user) {
        this.user.screenName = a.from_user;
        this.user.profileImageURL = a.profile_image_url
    } else if (a.user) this.user = this.user.fromJSONObject(a.user);
    this.creatorAccount = TD.storage.store.accountStore.get("twitter:" + this.user.id);
    this.id = a.id_str || a.id;
    this.inReplyToID = a.in_reply_to_status_id_str || a.in_reply_to_status_id;
    this.inReplyToScreenName = a.in_reply_to_screen_name;
    this.isFavorite = a.favorited;
    if (a.retweeted_status) {
        this.text = a.retweeted_status.text;
        this.retweetedStatus = (new TD.services.TwitterStatus(this.account)).fromJSONObject(a.retweeted_status);
        if (a.retweeted_status.entities) this.entities = a.retweeted_status.entities
    } else {
        this.text = a.text;
        if (a.entities) this.entities = a.entities
    }
    this.location = null;
    this.coordinates = a.coordinates;
    this.place = a.place;
    this.locationName = this.mapURL = "";
    if (this.coordinates) this.mapURL = "http://maps.google.com/?q=" + this.coordinates.coordinates[1] + "," + this.coordinates.coordinates[0];
    else if (this.place) {
        this.mapURL = "http://maps.google.com/?q=" + this.place.full_name;
        if (b = this.place.country_code || this.place.country) this.mapURL += ", " + b
    }
    if (this.place) {
        this.locationName = this.place.full_name;
        if (this.place.country_code) this.locationName += ", " + this.place.country_code
    } else if (this.coordinates) this.locationName = this.coordinates.coordinates[1] + ", " + this.coordinates.coordinates[0];
    b = new Date(a.created_at || "");
    b.setMilliseconds(d);
    d++;
    if (d == 999) d = 0;
    TD.services.TwitterStatus.msFudge = d;
    this.created = a.created = b;
    this._generateHTMLText();
    return this
};
TD.services.TwitterStatus.prototype.toHTML = function (a) {
    return TD.util.transform(a, this.entities)
};
TD.services.TwitterStatus.prototype.getMainUser = function () {
    return this.retweetedStatus ? this.retweetedStatus.user : this.user
};
TD.services.TwitterStatus.prototype.getMainTweet = function () {
    return this.retweetedStatus ? this.retweetedStatus : this
};
TD.services.TwitterStatus.prototype.hasLocationData = function () {
    var a = this.getMainTweet();
    return a.coordinates || a.place
};
TD.services.TwitterStatus.prototype.isOwnChirp = function () {
    return Boolean(this.creatorAccount)
};
TD.services.TwitterStatus.prototype.getLocationMapURL = function () {
    var a = this.getMainTweet();
    if (a.coordinates) return "http://maps.google.com?q=" + a.coordinates.coordinates[1] + "," + a.coordinates.coordinates[0]
};
TD.services.TwitterStatus.prototype.getChirpURL = function () {
    var a = this.getMainTweet();
    return a.decklyID ? a.decklyURL : "http://twitter.com/" + a.user.screenName + "/status/" + a.id
};
TD.services.TwitterStatus.prototype.destroy = function () {
    this.isOwnChirp() ? this._action("delete", function (a) {
        a.decklyID && TD.sync.deckly.destroy(a.decklyID, a.account.key);
        TD.controller.feedManager.deleteChirp(a.id)
    }) : TD.ui.main.showInfoMessage("You don't own this tweet - can't delete", "error")
};
TD.services.TwitterStatus.prototype.getComments = function (a) {
    var b = this,
        d = this.getMainTweet();
    d.inReplyToID ? TD.controller.clients.getClient(this.account.key).getConversation(d.id, function (c) {
        var e, g = [],
            j = b.getMainTweet();
        for (e = 0; e < c.length; e++) j.id != c[e].id && g.push(c[e].renderAsConversation());
        a.targetContainer.html(g.join(""))
    }) : a.targetContainer.empty()
};
TD.services.TwitterStatus.prototype.render = function () {
    return TD.ui.template.render("status/status_twitter", {
        tweets: [this]
    })
};
TD.services.TwitterStatus.prototype.renderNotification = function () {
    return TD.ui.template.render("status/status_twitter_notification", {
        tweets: [this]
    })
};
TD.services.TwitterStatus.prototype.renderAsConversation = function () {
    return TD.ui.template.render("status/conversation_twitter", {
        tweets: [this]
    })
};
TD.services.TwitterStatus.prototype.favorite = function () {
    function a() {
        TD.controller.progressIndicator.taskFailed(c)
    }
    function b(p) {
        if (p.error) a();
        else {
            var o = !d.isFavorite;
            d.isFavorite = o;
            TD.controller.clients.getClient(d.account.key).updateFavoriteInternal(p, o);
            TD.controller.progressIndicator.taskComplete(c)
        }
    }
    var d = this,
        c, e = d.getMainUser(),
        g = d.getMainTweet(),
        j, n;
    if (this.isFavorite) {
        n = TD.util.i18n.getMessage("pi_unfavoriting");
        TD.controller.clients.getClient(d.account.key).unfavorite(d.id, b, a);
        j = TD.controller.stats.unfavorite
    } else {
        n = TD.util.i18n.getMessage("pi_favoriting");
        TD.controller.clients.getClient(d.account.key).favorite(d.id, b, a);
        j = TD.controller.stats.favorite
    }
    c = TD.controller.progressIndicator.addTask(n);
    j(e.id, g.id, d.account.userId)
};
TD.services.TwitterStatus.prototype.email = function () {
    var a = "mailto:?",
        b = {},
        d = [];
    b.subject = TD.util.i18n.getMessage("email_tweet_subject", this.account.username);
    d.push(this.text);
    d.push(TD.util.i18n.getMessage("email_tweet_link", this.getChirpURL()));
    d.push(TD.util.i18n.getMessage("email_tweet_via_TD"));
    b.body = d.join("\n\n");
    a += TD.net.util.formEncode(b);
    window.open(a)
};
TD.services.TwitterStatus.prototype.postComment = function (a) {
    var b = a.colObj.commentField,
        d = this.getMainTweet(),
        c = d.id,
        e = TD.controller.clients.getClient(this.account.key).create(),
        g = b.val();
    d = "@" + d.user.screenName.toLowerCase();
    var j;
    if (g.length) {
        if (!(g.length > 140)) {
            if (g.substr(0, d.length).toLowerCase() != d) c = "";
            c !== "" && e.InReplyTo(c);
            e.WithMessage(g);
            j = TD.controller.progressIndicator.addTask(TD.util.i18n.getMessage("pi_replying"));
            e.Post(function () {
                TD.ui.updates.hideConversationView(a);
                TD.controller.progressIndicator.taskComplete(j);
                b.text("")
            }, function () {
                TD.controller.progressIndicator.taskFailed(j)
            })
        }
    } else TD.ui.main.showInfoMessage("You can't send nothing!", 5E3)
};
TD.services.TwitterStatus.prototype.reply = function () {
    TD.ui.compose.reply(this, this.account.key)
};
TD.services.TwitterStatus.prototype.retweet = function () {
    var a = this.retweetedStatus ? this.retweetedStatus : this;
    TD.ui.compose.retweet(a, this.account.key);
    TD.controller.stats.retweet(a.user.screenName, a.id, this.account.userId)
};
TD.services.TwitterStatus.prototype.dm = function () {
    TD.ui.compose.directMessage(this.user, this.account.key)
};
TD.services.TwitterStatus.prototype.referenceTo = function () {
    var a = this.account.key;
    TD.services.bitly.shorten(this.getChirpURL(), function (b) {
        b.data.url && TD.ui.compose.referenceTo(b.data.url, a)
    })
};
TD.services.TwitterStatus.prototype.follow = function () {
    this._action("follow", function (a) {
        a.user.following = true
    })
};
TD.services.TwitterStatus.prototype.unfollow = function () {
    this._action("unfollow", function (a) {
        a.user.following = false
    })
};
TD.services.TwitterStatus.prototype.block = function () {
    this._action("block")
};
TD.services.TwitterStatus.prototype.reportSpam = function () {
    var a = this.getMainUser();
    this._action("reportSpam");
    TD.controller.stats.spam(a.screenName, a.id, this.account.userId)
};
TD.services.TwitterStatus.prototype._action = function (a, b) {
    function d() {
        TD.controller.progressIndicator.taskFailed(j)
    }
    function c(o) {
        if (o.error) {
            TD.controller.progressIndicator.changeMessage(j, n + " - " + o.error);
            d()
        } else {
            TD.controller.progressIndicator.taskComplete(j);
            b && b(e)
        }
    }
    var e = this,
        g = TD.controller.clients.getClient(this.account.key),
        j, n, p;
    switch (a) {
    case "delete":
        n = this.retweetedStatus ? TD.util.i18n.getMessage("pi_undoing_RT") : TD.util.i18n.getMessage("pi_deleting");
        g = TD.controller.clients.getClient(this.creatorAccount.key);
        g.destroy(this.id, c, d);
        break;
    case "deleteDM":
        n = TD.util.i18n.getMessage("pi_deleting");
        if (this.creatorAccount) g = TD.controller.clients.getClient(this.creatorAccount.key);
        g.destroyDM(this.id, c, d);
        break;
    case "follow":
        n = "Follow " + this.user.screenName;
        g.followUser(this.user.screenName, c, d);
        break;
    case "unfollow":
        n = "Unfollow " + this.user.screenName;
        g.unfollowUser(this.user.screenName, c, d);
        break;
    case "block":
        p = this.getMainUser();
        n = TD.util.i18n.getMessage("block_user", p.screenName);
        g.blockUser(p.screenName, c, d);
        break;
    case "reportSpam":
        p = this.getMainUser();
        n = TD.util.i18n.getMessage("report_spam", p.screenName);
        g.blockAndReportUser(p.screenName, c, d)
    }
    j = TD.controller.progressIndicator.addTask(n)
};
TD.services.TwitterStatus.prototype.deckExtend = function () {
    var a, b;
    if (this.retweetedStatus) {
        a = this.retweetedStatus.text;
        b = this.retweetedStatus.entities
    } else {
        a = this.text;
        b = this.entities
    }
    if (b && b.urls) {
        b.urls.sort(this._entitySort);
        for (var d = 0; d < b.urls.length; d++) {
            var c = b.urls[d];
            if (c.url && c.expanded_url) {
                var e = a.substring(0, c.indices[0]);
                a = a.substring(c.indices[1]);
                a = e + c.expanded_url + a
            }
        }
    }
    this._deckExtendInternal(a)
};
TD.services.TwitterStatus.prototype._entitySort = function (a, b) {
    return b.indices[0] - a.indices[0]
};
TD.services.TwitterDirectMessage = function (a) {
    this.account = a
};
TD.services.TwitterDirectMessage.prototype = new TD.services.TwitterStatus;
TD.services.TwitterDirectMessage.prototype.fromJSONObject = function (a) {
    this.id = a.id;
    this.text = a.text;
    this.isTranslated = false;
    this.sender = (new TD.services.TwitterUser(this.account)).fromJSONObject(a.sender);
    this.recipient = (new TD.services.TwitterUser(this.account)).fromJSONObject(a.recipient);
    this.creatorAccount = TD.storage.store.accountStore.get("twitter:" + this.sender.id);
    this.created = a.created = new Date((a.created_at || "").replace(/-/g, "/").replace(/[TZ]/g, " "));
    this.createdDate = TD.util.prettyDate(a.created);
    this.cleanText = a.retweeted_status ? TD.util.transform(a.retweeted_status.text) : TD.util.transform(a.text);
    return this
};
TD.services.TwitterDirectMessage.prototype.hasLocationData = function () {
    return false
};
TD.services.TwitterDirectMessage.prototype.getMainUser = function () {
    return this.sender
};
TD.services.TwitterDirectMessage.prototype.isOwnChirp = function () {
    return Boolean(this.creatorAccount)
};
TD.services.TwitterDirectMessage.prototype.dm = function () {
    var a = this.sender;
    if (this.isOwnChirp()) a = this.recipient;
    TD.ui.compose.directMessage(a, this.account.key)
};
TD.services.TwitterDirectMessage.prototype.getChirpURL = function () {
    return ""
};
TD.services.TwitterDirectMessage.prototype.destroy = function () {
    this._action("deleteDM", function (a) {
        TD.controller.feedManager.deleteChirp(a.id)
    })
};
TD.services.TwitterDirectMessage.prototype.render = function () {
    return TD.ui.template.render("status/message_twitter", {
        tweets: [this]
    })
};
TD.services.TwitterDirectMessage.prototype.toggleFavorite = function () {};
TD.services.TwitterDirectMessage.prototype.deckExtend = function () {};
TD.services.TwitterUser = function (a) {
    this.account = a
};
TD.services.TwitterUser.prototype.fromJSONObject = function (a) {
    this.id = a.id;
    this.screenName = a.screen_name;
    this.profileImageURL = a.profile_image_url;
    this.name = a.name;
    this.location = a.location;
    this.description = a.description;
    this.friendsCount = a.friends_count;
    this.followersCount = a.followers_count;
    this.statusesCount = a.statuses_count;
    this.favoritesCount = a.favourites_count;
    this.url = a.url;
    this.isProtected = a["protected"];
    this.following = a.following;
    if (a.status) {
        this.lastStatus = (new TD.services.TwitterStatus(this.account)).fromJSONObject(a.status);
        this.lastStatus.user = this
    }
    TD.ui.compose.usernameSet[this.screenName.toLowerCase()] = {
        s: this.screenName,
        p: this.profileImageURL
    };
    return this
};
TD.services.TwitterUser.prototype.largeProfileImageURL = function () {
    return this.profileImageURL.replace("_normal", "")
};
TD.services.TwitterUser.prototype.biggerProfileImageURL = function () {
    return this.profileImageURL.replace("_normal", "_bigger")
};
TD.services.TwitterUser.prototype.mention = function () {
    TD.ui.compose.reply(this.screenName, this.account.key)
};
TD.services.TwitterUser.prototype.message = function () {
    TD.ui.compose.directMessage(this, this.account.key)
};
TD.services.TwitterUser.prototype.follow = function () {
    var a = this;
    TD.controller.clients.getClient(this.account.key).followUser(this.screenName, function () {
        TD.ui.main.showInfoMessage("Successfully followed @" + a.screenName);
        a.following = true
    })
};
TD.services.TwitterUser.prototype.unfollow = function () {
    var a = this;
    TD.controller.clients.getClient(this.account.key).unfollowUser(this.screenName, function () {
        TD.ui.main.showInfoMessage("Successfully unfollowed @" + a.screenName);
        a.following = false
    })
};
TD.services.TwitterUser.prototype.block = function () {
    var a = this;
    TD.controller.clients.getClient(this.account.key).blockUser(this.screenName, function () {
        TD.ui.main.showInfoMessage("Successfully blocked @" + a.screenName);
        a.following = false
    })
};
TD.services.TwitterUser.prototype.blockAndReport = function () {
    var a = this;
    TD.controller.clients.getClient(this.account.key).blockAndReportUser(this.screenName, function () {
        TD.ui.main.showInfoMessage("Successfully blocked & reported @" + a.screenName);
        a.following = false
    })
};
TD.services.TwitterUser.prototype.bio = function () {
    return TD.util.transform(this.description)
};
TD.services.TwitterUser.prototype.getFollowerURL = function () {
    return "http://twitter.com/" + this.screenName + "/followers"
};
TD.services.TwitterUser.prototype.getFriendURL = function () {
    return "http://twitter.com/" + this.screenName + "/following"
};
TD.services.TwitterUser.prototype.recentTweets = function (a) {
    TD.controller.clients.getClient(this.account.key).getProfileTimeline(this.id, 20, null, null, a)
};
TD.services.TwitterUser.prototype.recentMentions = function (a) {
    TD.controller.clients.getClient(this.account.key).getSearchTimeline("@" + this.screenName, null, null, null, a)
};
TD.services.TwitterUser.prototype.recentFavorites = function (a) {
    TD.controller.clients.getClient(this.account.key).getFavoritesTimeline(null, this.id, null, 20, a)
};
TD.services.TwitterUser.prototype.publicLists = function (a) {
    TD.controller.clients.getClient(this.account.key).getLists(this.screenName, a)
};
TD.services.TrendingTopic = function () {};
TD.services.TrendingTopic.prototype.name = "";
TD.services.TrendingTopic.prototype.query = "";
TD.services.TrendingTopic.prototype.url = "";
TD.services.TrendingTopic.prototype.description = "";
TD.services.TrendingTopic.prototype.attribution = "";
TD.services.TrendingTopic.prototype.created = 0;
TD.services.TrendingTopic.prototype.promotedContent = null;
TD.services.TrendingTopic.prototype.events = null;
TD.services.TrendingTopic.prototype.fromJSONObject = function (a) {
    this.name = a.name;
    this.query = a.query;
    this.promotedContent = a.promoted_content;
    this.events = a.events;
    this.created = (new Date).getTime();
    this.query = encodeURIComponent(this.name);
    if (!this.url) this.url = "http://search.twitter.com/search?q=" + this.query;
    if (this.promotedContent && this.promotedContent.description) this.description = TD.util.escape(this.promotedContent.description);
    return this
};
TD.services.TrendLocation = function () {};
TD.services.TrendLocation.prototype.PLACE_TYPE_SUPERNAME = 19;
TD.services.TrendLocation.prototype.PLACE_TYPE_COUNTRY = 12;
TD.services.TrendLocation.prototype.PLACE_TYPE_TOWN = 7;
TD.services.TrendLocation.prototype.placeType = null;
TD.services.TrendLocation.prototype.name = "";
TD.services.TrendLocation.prototype.woeid = -1;
TD.services.TrendLocation.prototype.url = "";
TD.services.TrendLocation.prototype.countryCode = "";
TD.services.TrendLocation.prototype.country = "";
TD.services.TrendLocation.prototype.label = "";
TD.services.TrendLocation.prototype.sortString = "";
TD.services.TrendLocation.prototype.fromJSONObject = function (a) {
    this.name = a.name;
    this.woeid = a.woeid;
    this.url = a.url;
    this.countryCode = a.countryCode;
    this.country = a.country;
    this.placeType = a.placeType;
    switch (this.placeType.code) {
    case this.PLACE_TYPE_TOWN:
        this.label = "\ufffd" + this.name;
        this.sortString = this.country + this.name;
        break;
    case this.PLACE_TYPE_SUPERNAME:
        this.label = this.name.toUpperCase();
        this.sortString = "";
        break;
    default:
        this.sortString = this.label = this.name
    }
    return this
};
TD.services.FacebookClient = function (a) {
    var b = this;
    FB._apiKey = "56212371378";
    FB._session = {
        access_token: a.oauth_token,
        expires: 0,
        uid: a.userId
    };
    this.type = "facebook";
    this.oauth = TD.controller.auth.create("facebook", a);
    this.statusMenuTemplate = "menus/facebook";
    this.groups = [];
    this.pages = [];
    this.pagesIndex = {};
    this.getGroups(function (c) {
        b.groups = c || [];
        b.groups.length && TD.ui.compose.refreshPostingAccounts(TD.storage.store.accountStore.getAll())
    });
    this.getPages(function (c) {
        var e, g, j = [];
        if (c && c.length) for (e = 0; e < c.length; e++) {
            g = c[e];
            if (g.name) {
                g.name = TD.util.escape(g.name);
                j.push(g);
                b.pagesIndex[g.id] = g
            }
        }
        b.pages = j;
        b.pages.length && TD.ui.compose.refreshPostingAccounts(TD.storage.store.accountStore.getAll())
    });
    this.create = function () {
        return new d
    };
    this.refreshFeed = function (c, e, g) {
        var j = 1,
            n = null,
            p = c.feed;
        if (c.chirpArray && c.chirpArray.length) if (e) n = Math.ceil(c.getOldestChirp().created.getTime() / 1E3);
        else j = Math.floor(c.chirpArray[0].created.getTime() / 1E3);
        if (p.type == "home") b.getNewsFeed(j, n, g);
        else if (p.type == "notifications") b.getNotifications(j, g);
        else if (p.type == "group") b.getGroupFeed(p.metadata.id, j, n, g);
        else p.type == "page" && b.getPageFeed(p.metadata.id, j, n, g);
        return this
    };
    var d = function () {
            var c, e = {
                feed: "/feed"
            },
                g = {
                    message: ""
                };
            this.Retweet = function () {
                return this
            };
            this.WithMessage = function (j, n) {
                n || (n = "feed");
                c = e[n];
                g.message = j;
                return this
            };
            this.InReplyTo = function () {
                return this
            };
            this.toPage = function (j) {
                c = "/" + j + "/feed";
                g.access_token = b.pagesIndex[j].access_token;
                return this
            };
            this.toGroup = function (j) {
                c = "/" + j + "/feed";
                return this
            };
            this.DirectlyTo = function () {
                return this
            };
            this.WithLatLng = function () {
                return this
            };
            this.Post = function (j, n) {
                FB.api(c, "post", g, function (p) {
                    if (!p || p.error) {
                        p.errorMessage = p.error.message;
                        n(p)
                    } else j()
                })
            }
        }
};
TD.services.FacebookClient.prototype = new TD.services.ServiceClient;
TD.services.FacebookClient.prototype.constructor = TD.services.ServiceClient;
TD.services.FacebookClient.prototype.makeFBCall = function (a, b, d, c, e) {
    var g = this;
    FB.api(a, d, b, function (j) {
        if (c) j = c.call(g, j);
        e(j)
    })
};
TD.services.FacebookClient.prototype.getGroups = function (a, b) {
    this.makeFBCall("/me/groups", {}, "GET", this.processGroups, a, b)
};
TD.services.FacebookClient.prototype.getPages = function (a, b) {
    this.makeFBCall("/me/accounts", {}, "GET", this.processAccounts, a, b)
};
TD.services.FacebookClient.prototype.getFeedInternal = function (a, b, d, c) {
    var e = {};
    if (b) e.since = b;
    if (d) e.until = d;
    this.makeFBCall(a, e, "GET", this.processUpdates, c)
};
TD.services.FacebookClient.prototype.getPost = function (a, b) {
    this.makeFBCall(a, {}, "GET", this.processUpdate, b)
};
TD.services.FacebookClient.prototype.getNewsFeed = function (a, b, d, c) {
    this.getFeedInternal("/me/home", a, b, d, c)
};
TD.services.FacebookClient.prototype.getGroupFeed = function (a, b, d, c, e) {
    this.getFeedInternal("/" + a + "/feed", b, d, c, e)
};
TD.services.FacebookClient.prototype.getPageFeed = function (a, b, d, c, e) {
    this.getFeedInternal("/" + a + "/feed", b, d, c, e)
};
TD.services.FacebookClient.prototype.getNotifications = function (a, b) {
    var d = this,
        c = {
            method: "fql.multiquery"
        },
        e = "SELECT notification_id, sender_id, title_html, body_text, created_time, href, object_type, object_id FROM notification WHERE recipient_id=" + this.oauth.account.userId;
    if (a) e += " AND created_time > " + a;
    c.queries = JSON.stringify({
        query1: e
    });
    FB.api(c, function (g) {
        g = d.processNotifications.call(d, g);
        b(g)
    })
};
TD.services.FacebookClient.prototype.getPhotoInfo = function (a, b, d) {
    a = TD.net.util.decodeURL(a);
    !a || !a.fbid ? d() : this.makeFBCall(a.fbid, {}, "GET", this.processPhotos, b)
};
TD.services.FacebookClient.prototype.processPhotos = function (a) {
    return a
};
TD.services.FacebookClient.prototype.getComments = function (a, b) {
    this.makeFBCall(a + "/comments", {}, "GET", this.processComments, b)
};
TD.services.FacebookClient.prototype.addComment = function (a, b, d) {
    var c = this;
    this.makeFBCall(a + "/comments", {
        message: b
    }, "POST", function (e) {
        e.message = b;
        e.created = new Date;
        e.from = {
            id: c.oauth.account.userId,
            name: c.oauth.account.username
        };
        return c.processComment(e)
    }, d)
};
TD.services.FacebookClient.prototype.likeUpdate = function (a, b) {
    this.makeFBCall(a + "/likes", {}, "POST", null, b)
};
TD.services.FacebookClient.prototype.unlikeUpdate = function (a, b) {
    this.makeFBCall(a + "/likes", {}, "DELETE", null, b)
};
TD.services.FacebookClient.prototype.destroy = function (a, b) {
    this.makeFBCall(a, {}, "DELETE", null, b)
};
TD.services.FacebookClient.prototype.processUpdate = function (a) {
    return (new TD.services.FacebookUpdate(this.oauth.account)).fromJSONObject(a)
};
TD.services.FacebookClient.prototype.processNotification = function (a) {
    return (new TD.services.FacebookNotification(this.oauth.account)).fromJSONObject(a)
};
TD.services.FacebookClient.prototype.processComment = function (a) {
    return (new TD.services.FacebookComment(this.oauth.account)).fromJSONObject(a)
};
TD.services.FacebookClient.prototype.processUpdates = function (a) {
    a = a.data;
    var b;
    if (!a) return [];
    b = a.length;
    for (var d = 0; d < b; d++) a[d] = this.processUpdate(a[d]);
    return a
};
TD.services.FacebookClient.prototype.processNotifications = function (a) {
    var b = [];
    a = a[0].fql_result_set;
    var d, c = a.length,
        e;
    for (e = 0; e < c; e++) {
        d = a[e];
        if (d.body_text || d.title_html) b.push(this.processNotification(d))
    }
    return b
};
TD.services.FacebookClient.prototype.processComments = function (a) {
    a = a.data;
    for (var b = a.length, d = 0; d < b; d++) a[d] = this.processComment(a[d]);
    return a
};
TD.services.FacebookClient.prototype.processGroups = function (a) {
    var b, d, c = [];
    if (a.data && a.data.length) for (b = 0; b < a.data.length; b++) {
        d = a.data[b];
        d.name = TD.util.escape(d.name);
        if (d.version === 1) {
            d.picture = "https://graph.facebook.com/" + d.id + "/picture/?access_token=" + this.oauth.account.oauth_token;
            c.push(d)
        }
    }
    return c
};
TD.services.FacebookClient.prototype.processAccounts = function (a) {
    return a.data || []
};
TD.services.FacebookUpdate = function (a) {
    this.account = a
};
TD.services.FacebookUpdate.prototype = new TD.services.ChirpBase;
TD.services.FacebookUpdate.prototype.fromJSONObject = function (a) {
    var b, d;
    b = {};
    var c = {},
        e, g, j;
    this.id = a.id;
    this.type = a.type;
    this.place = a.place;
    this.picture = a.picture;
    this.name = TD.util.transform(a.name);
    this.caption = TD.util.transform(a.caption);
    this.description = TD.util.transform(a.description);
    if (a.from) a.from.name = TD.util.escape(a.from.name);
    this.from = a.from;
    this.to = [];
    if (this.place) {
        this.mapURL = "http://maps.google.com/?q=" + this.place.location.latitude + "," + this.place.location.longitude;
        this.locationName = TD.util.escape(a.place.name)
    }
    this.link = a.link;
    if (a.message) {
        this.message = TD.util.transform(a.message);
        if (a.to && a.to.data && a.to.data.length) {
            d = a.to.data.length;
            for (g = 0; g < d; g++) {
                e = a.to.data[g].name;
                a.to.data[g].name = TD.util.escape(e);
                b[e] = (b[e] || 0) + 1;
                c[e] = a.to.data[g]
            }
            for (e in b) {
                j = false;
                d = RegExp(e, "g");
                g = a.message.match(d);
                if (!g || !g.length) this.to.push(c[e]);
                else {
                    g.length < b[e] && this.to.push(c[e]);
                    j = true
                }
                if (j) this.message = this.message.replace(d, this.getFacebookProfileLink(c[e].id, e))
            }
        }
    }
    this.text = this.message;
    if (a.comments) this.comments = a.comments;
    if (a.likes) {
        this.likes = a.likes;
        if (a.likes.data && a.likes.data.length > 0) for (g = 0; g < a.likes.data.length; g++) if (this.account.userId == a.likes.data[g].id) {
            this.isLiked = true;
            break
        }
    }
    this.isLiked = this.isLiked || false;
    b = a.created_time;
    b = a.created_time.substr(0, b.length - 5);
    if (b !== undefined) {
        this.created = TD.util.parseISO8601(b);
        this.created_time = TD.util.prettyDate(this.created)
    }
    if (this.type == "video") {
        if (a.embed_html) {
            b = a.embed_html;
            c = false
        } else {
            b = a.source;
            c = true
        }
        TD.services.media.createVideoEmbed(a.name, a.link, b, c)
    }
    return this
};
TD.services.FacebookUpdate.prototype.render = function () {
    return TD.ui.template.render("status/status_facebook", {
        updates: [this]
    })
};
TD.services.FacebookUpdate.prototype.renderNotification = function () {
    return TD.ui.template.render("status/status_facebook_notification", {
        updates: [this]
    })
};
TD.services.FacebookUpdate.prototype.getChirpURL = function () {
    return "http://www.facebook.com/permalink.php?story_fbid=" + this.id.split("_")[1] + "&id=" + this.from.id
};
TD.services.FacebookUpdate.prototype.isOwnChirp = function () {
    return this.account.userId == this.from.id
};
TD.services.FacebookUpdate.prototype.isDeletable = function () {
    var a = this.isOwnChirp(),
        b;
    if (!a) {
        b = TD.controller.clients.getClient(this.account.key);
        if (b.pagesIndex[this.from.id] || this.to && this.to.length && b.pagesIndex[this.to[0].id]) a = true
    }
    return a
};
TD.services.FacebookUpdate.prototype.getActionAccount = function () {
    var a = TD.controller.clients.getClient(this.account.key);
    return a.pagesIndex[this.from.id] ? this.from.id : this.to && this.to.length && a.pagesIndex[this.to[0].id] ? this.to[0].id : this.account.userId
};
TD.services.FacebookUpdate.prototype.destroy = function () {
    var a = this;
    if (this.isDeletable()) {
        var b = TD.controller.progressIndicator.addTask(TD.util.i18n.getMessage("pi_deleting"));
        TD.controller.clients.getClient(this.account.key).destroy(this.id, function () {
            $(a.id).remove();
            TD.controller.progressIndicator.taskComplete(b)
        })
    } else TD.ui.main.showInfoMessage("You don't own this account - can't delete", "error")
};
TD.services.FacebookUpdate.prototype.like = function () {
    function a() {
        TD.controller.progressIndicator.taskFailed(d)
    }
    var b = this,
        d, c = function () {
            b.isLiked = !b.isLiked;
            var e = "article[data-key='" + b.id + "'][data-account-key='" + b.account.key + "'] [title='" + TD.util.i18n.getMessage("like") + "']";
            $(e).each(function () {
                b.isLiked ? $(this).addClass("show") : $(this).removeClass("show")
            });
            TD.controller.progressIndicator.taskComplete(d)
        };
    if (this.isLiked) {
        d = TD.controller.progressIndicator.addTask(TD.util.i18n.getMessage("pi_unliking"));
        TD.controller.clients.getClient(this.account.key).unlikeUpdate(this.id, c, a)
    } else {
        d = TD.controller.progressIndicator.addTask(TD.util.i18n.getMessage("pi_liking"));
        TD.controller.clients.getClient(this.account.key).likeUpdate(this.id, c, a)
    }
    TD.controller.clients.getClient(this.account.key).likeUpdate(this.id, function () {})
};
TD.services.FacebookUpdate.prototype.getComments = function (a) {
    var b = this;
    TD.controller.clients.getClient(this.account.key).getComments(this.id, function (d) {
        d = b.renderComments(d);
        a.targetContainer.html(d)
    })
};
TD.services.FacebookUpdate.prototype.postComment = function (a) {
    var b = a.colObj.commentField,
        d = b.val(),
        c = TD.controller.progressIndicator.addTask(TD.util.i18n.getMessage("pi_replying"));
    TD.controller.clients.getClient(this.account.key).addComment(this.id, d, function () {
        b.text("");
        TD.ui.updates.hideConversationView(a);
        TD.controller.progressIndicator.taskComplete(c)
    }, function () {
        TD.controller.progressIndicator.taskFailed(c)
    })
};
TD.services.FacebookUpdate.prototype.renderComments = function (a) {
    return TD.ui.template.render("status/comments_facebook", {
        updates: a,
        showTextBox: true
    })
};
TD.services.FacebookUpdate.prototype.wallToWall = function () {
    this.to && this.to.length && window.open("http://www.facebook.com/walltowall.php?id=" + this.from.id + "&banter_id=" + this.to[0].id)
};
TD.services.FacebookUpdate.prototype.getFacebookProfileLink = function (a, b) {
    return '<a rel="urlUsr" href="http://facebook.com/profile.php?id=' + a + '">' + b + "</a>"
};
TD.services.FacebookComment = function (a) {
    this.account = a
};
TD.services.FacebookComment.prototype.fromJSONObject = function (a) {
    this.id = a.id;
    if (a.from) {
        a.from.name = TD.util.escape(a.from.name);
        this.from = a.from
    } else this.from = {
        id: 1,
        name: "Facebook User"
    };
    if (a.message) this.message = TD.util.transform(a.message);
    if (a.created) this.created = a.created;
    else {
        a = a.created_time;
        a = a.substr(0, a.length - 5);
        if (a !== undefined) this.created = TD.util.parseISO8601(a)
    }
    if (this.created) this.created_time = TD.util.prettyDate(this.created);
    return this
};
TD.services.FacebookComment.prototype.render = function () {
    return TD.ui.template.render("status/comments_facebook", {
        updates: [this],
        showTextBox: false
    })
};
TD.services.FacebookComment.prototype.destroy = function () {
    var a = this;
    if (this.actor.id != this.account.userId) TD.ui.main.showInfoMessage("You don't own this account - can't delete", "error");
    else {
        var b = TD.controller.progressIndicator.addTask(TD.util.i18n.getMessage("pi_deleting"));
        TD.controller.clients.getClient(this.account.key).destroy(this.getFullID(this.id), function () {
            $(a.id).remove();
            TD.controller.progressIndicator.taskComplete(b)
        })
    }
};
TD.services.FacebookNotification = function (a) {
    this.account = a
};
TD.services.FacebookNotification.prototype = new TD.services.FacebookUpdate;
TD.services.FacebookNotification.prototype.constructor = TD.services.FacebookUpdate;
TD.services.FacebookNotification.prototype.fromJSONObject = function (a) {
    var b = $("<div>");
    this.getNotificationType(a);
    this.id = a.notification_id;
    this.isNotification = true;
    this.type = a.type;
    this.objectId = a.object_id;
    this.href = a.href;
    if (this.message = a.title_html || "") {
        b.append(this.message);
        b.contents("a.uiTooltip").replaceWith(function () {
            return $(this).contents(":not(span)").text()
        });
        b.contents("a").attr("rel", "urlUsr");
        this.message = b.html()
    }
    this.description = TD.util.transform(a.body_text);
    this.from = {
        id: a.sender_id
    };
    a = new Date(Number(a.created_time) * 1E3);
    if (a !== undefined) {
        this.created = a;
        this.created_time = TD.util.prettyDate(this.created)
    }
    return this
};
TD.services.FacebookNotification.prototype.getChirpURL = function () {
    return this.href || "http://www.facebook.com/notifications.php"
};
TD.services.FacebookNotification.prototype.isCommentable = function () {
    return this.type == "wall_post" && this.objectId
};
TD.services.FacebookNotification.prototype.getNotificationType = function (a) {
    var b = "",
        d = a.href,
        c;
    try {
        c = TD.net.util.decodeURL(d);
        if ((_.contains(d, "profile.php") || _.contains(d, "permalink.php")) && c.id && c.story_fbid) {
            b = "wall_post";
            if (a.type.length > 0 && c.id && c.story_fbid) a.object_id = c.id + "_" + c.story_fbid
        } else if (_.contains(d, "/posts/") && a.object_id && a.object_type && a.object_id.indexOf("_") != -1 && a.object_type === "stream") b = "wall_post"
    } catch (e) {}
    a.type = b
};
TD.services.TwitterClient = function (a) {
    var b = this;
    this.type = "twitter";
    this.streamEngine = null;
    this.isStreaming = false;
    this.firstStreamConnect = true;
    this.friends = {};
    this.blocks = {};
    this.lists = [];
    this.streamingFeeds = {};
    this.STREAMING_FEED_TYPES = {
        home: true,
        mentions: true,
        direct: true,
        favorites: true,
        search: true
    };
    this.oauth = TD.controller.auth.create("twitter", a);
    this.statusMenuTemplate = "menus/twitter";
    this.getLists(null, function (c) {
        b.lists = c
    });
    this.refreshFeed = function (c, e, g, j) {
        var n = 1,
            p = null,
            o = c.feed,
            r = o.metadata,
            s = this.streamingFeeds,
            u = function (x, y, I) {
                if (y > x.length - 1) return x;
                return x.substr(0, y) + I + x.substr(y + 1)
            };
        if (c.chirpArray && c.chirpArray.length) if (e) {
            p = c.getOldestChirp().id;
            if (typeof p == "string") for (e = p.length - 1; e >= 0; e--) {
                c = p.charAt(e);
                if (c == "0") p = u(p, e, 9);
                else {
                    c = String(Number(c) - 1);
                    p = u(p, e, c);
                    break
                }
            } else p--
        } else n = c.chirpArray[0].id;
        if (b.STREAMING_FEED_TYPES[o.type]) s[o.key] = o;
        switch (o.type) {
        case "home":
            if (!b.isStreaming || n === 1) b.getHomeTimeline(n, p, null, g, j);
            break;
        case "mentions":
            if (!b.isStreaming || n === 1) b.getMentionsTimeline(n, p, null, g, j);
            break;
        case "direct":
            if (!b.isStreaming || n === 1) b.getDMTimeline(n, p, null, g, j);
            break;
        case "sentdirect":
            if (!b.isStreaming || n === 1) b.getSentDMTimeline(n, p, null, g, j);
            break;
        case "favorites":
            if (!b.isStreaming || n === 1 || r.id != this.oauth.account.userId) b.getFavoritesTimeline(n, r.id, p, null, g, j);
            break;
        case "list":
            b.getListTimeline(r.screenName, r.slug, n, p, null, g, j);
            break;
        case "search":
            b.getSearchTimeline(r.term, n, p, null, g, j);
            !o.isTemp && b.isStreaming && b.streamEngine.addQuery(r.term);
            break;
        case "usertweets":
            b.getProfileTimeline(r.id, null, n, p, g, j)
        }
        return this
    };
    var d = function () {
            var c = {},
                e = "https://api.twitter.com/1/statuses/update.json",
                g = false,
                j = false;
            this.Retweet = function (n) {
                e = "https://api.twitter.com/1/statuses/retweet/:id.json".replace(":id", n);
                j = true;
                return this
            };
            this.DirectlyTo = function (n) {
                e = "https://api.twitter.com/1/direct_messages/new.json";
                g = true;
                c.screen_name = n;
                return this
            };
            this.InReplyTo = function (n) {
                c.in_reply_to_status_id = n;
                g = false;
                return this
            };
            this.WithLatLng = function (n, p) {
                c.lat = n;
                c["long"] = p;
                return this
            };
            this.WithLocation = function (n) {
                c.place_id = n
            };
            this.WithMessage = function (n) {
                if (g) c.text = n;
                else c.status = n;
                return this
            };
            this.Post = function (n, p) {
                var o = this;
                if (j || g || c.status.length <= 140) this._postToTwitter(n, p);
                else {
                    var r, s, u = function (x, y, I) {
                            s && x && x.id && TD.sync.deckly.link(s, r, x.id);
                            n(x, y, I)
                        };
                    TD.sync.deckly.plank(c.status, b.oauth.account.key, function (x) {
                        if (x && x.truncated) {
                            c.status = x.truncated;
                            r = x.id;
                            s = x.token;
                            o._postToTwitter(u, p)
                        } else p()
                    }, function () {
                        p()
                    })
                }
                return this
            };
            this._postToTwitter = function (n, p) {
                b.post(e, c, null, null, function (o) {
                    if (o.error) {
                        o.errorMessage = o.error;
                        p(o)
                    } else {
                        if (g) {
                            b.publishTweet("sentdirect", o);
                            o = b.processDM(o)
                        } else {
                            b.publishTweet("home", o);
                            o = b.processTweet(o)
                        }
                        n(o)
                    }
                }, p)
            }
        };
    this.create = function () {
        return new d
    };
    this.renderProfile = function (c) {
        return TD.ui.template.render("profile/profile_twitter", {
            profile: c
        })
    };
    this.renderProfileDetail = function (c) {
        return TD.ui.template.render("profile/profile_detail", {
            viewing: c
        })
    };
    this.renderProfileShortlist = function (c) {
        c.account = this.oauth.account;
        return TD.ui.template.render("profile/profile_twitter_shortlist", {
            data: c
        })
    };
    this.renderUser = function (c) {
        return TD.ui.template.render("status/user", {
            users: c
        })
    };
    this.renderTrends = function (c) {
        return TD.ui.template.render("status/trend", {
            trends: c
        })
    }
};
TD.services.TwitterClient.prototype = new TD.services.ServiceClient;
TD.services.TwitterClient.prototype.constructor = TD.services.ServiceClient;
TD.services.TwitterClient.prototype.API_BASE_URL = "https://api.twitter.com/1/";
TD.services.TwitterClient.prototype.SEARCH_BASE_URL = "http://search.twitter.com/";
TD.services.TwitterClient.prototype.getOAuthEchoHeader = function (a, b, d) {
    d = TD.net.ajax.HOST_BASE_URL + "oauth/echo/twitter/" + encodeURIComponent("https://api.twitter.com/1/account/verify_credentials." + (d ? "json" : "xml"));
    var c = {};
    c["x-td-oauth-key"] = this.oauth.account.oauth_token;
    c["x-td-oauth-secret"] = this.oauth.account.token_secret;
    c["x-td-oauth-service"] = "twitter";
    TD.net.ajax.request({
        url: d,
        headers: c
    }, a, b)
};
TD.services.TwitterClient.prototype.makeTwitterCall = function (a, b, d, c, e, g, j) {
    var n = this;
    d == "GET" ? this.get(a, b, c, function (p) {
        if (e) p = e.call(n, p);
        g(p)
    }, j) : this.post(a, b, null, null, g, j)
};
TD.services.TwitterClient.prototype.processTweet = function (a) {
    var b = new TD.services.TwitterStatus(this.oauth.account);
    b.fromJSONObject(a);
    a = b.getMainUser();
    this.profileCache[a.screenName.toLowerCase()] = a;
    return b
};
TD.services.TwitterClient.prototype.processDM = function (a) {
    var b = new TD.services.TwitterDirectMessage(this.oauth.account);
    b.fromJSONObject(a);
    return b
};
TD.services.TwitterClient.prototype.processPlaces = function (a) {
    return a.result.places
};
TD.services.TwitterClient.prototype.processTimeline = function (a) {
    var b, d;
    a = a.results ? a.results : a;
    if (!a.length) return [];
    for (b = a.length; b--;) {
        d = a[b];
        d = d.sender ? this.processDM(d) : this.processTweet(d);
        a[b] = d
    }
    return a
};
TD.services.TwitterClient.prototype.processTrends = function (a) {
    var b = {
        locations: a[0].locations,
        trends: []
    };
    a = a[0].trends;
    for (var d, c = 0; c < a.length; c++) {
        d = (new TD.services.TrendingTopic).fromJSONObject(a[c]);
        b.trends.push(d)
    }
    return b
};
TD.services.TwitterClient.prototype.processTrendLocations = function (a) {
    var b = [],
        d, c;
    for (c = 0; c < a.length; c++) {
        d = (new TD.services.TrendLocation).fromJSONObject(a[c]);
        b.push(d)
    }
    return b.sort(function (e, g) {
        var j = e.sortString,
            n = g.sortString;
        if (j < n) return -1;
        else if (j > n) return 1;
        return 0
    })
};
TD.services.TwitterClient.prototype.processLists = function (a) {
    return a
};
TD.services.TwitterClient.prototype.processUser = function (a) {
    a = (new TD.services.TwitterUser(this.oauth.account)).fromJSONObject(a);
    return this.profileCache[a.screenName.toLowerCase()] = a
};
TD.services.TwitterClient.prototype.processUsers = function (a) {
    for (var b = [], d = 0; d < a.length; d++) b.push(this.processUser(a[d]));
    return b
};
TD.services.TwitterClient.prototype.showUser = function (a, b, d) {
    this.makeTwitterCall(this.API_BASE_URL + "users/show.json", {
        screen_name: a
    }, "GET", true, this.processUser, b, d)
};
TD.services.TwitterClient.prototype.followUser = function (a, b, d) {
    this.makeTwitterCall(this.API_BASE_URL + "friendships/create.json", {
        screen_name: a
    }, "POST", true, this.processUser, b, d)
};
TD.services.TwitterClient.prototype.unfollowUser = function (a, b, d) {
    this.makeTwitterCall(this.API_BASE_URL + "friendships/destroy.json", {
        screen_name: a
    }, "POST", true, this.processUser, b, d)
};
TD.services.TwitterClient.prototype.userSearch = function (a, b, d) {
    var c = this;
    this.makeTwitterCall(this.API_BASE_URL + "users/search.json", {
        q: a
    }, "GET", true, function (e) {
        var g, j = a.toLowerCase(),
            n;
        e = c.processUsers(e);
        for (g = 0; g < e.length; g++) {
            n = e[g];
            if (n.screenName.toLowerCase() == j && g !== 0) {
                e.splice(g, 1);
                e = [n].concat(e);
                break
            }
        }
        return e
    }, b, d)
};
TD.services.TwitterClient.prototype.friendshipExists = function (a, b, d, c) {
    this.makeTwitterCall(this.API_BASE_URL + "friendships/exists.json", {
        user_a: a,
        user_b: b
    }, "GET", true, null, d, c)
};
TD.services.TwitterClient.prototype.blockUser = function (a, b, d) {
    this.makeTwitterCall(this.API_BASE_URL + "blocks/create.json", {
        screen_name: a
    }, "POST", true, this.processUser, b, d)
};
TD.services.TwitterClient.prototype.blockAndReportUser = function (a, b, d) {
    this.makeTwitterCall(this.API_BASE_URL + "report_spam.json", {
        screen_name: a
    }, "POST", true, this.processUser, b, d)
};
TD.services.TwitterClient.prototype.getHomeTimeline = function (a, b, d, c, e) {
    this.getTimeline("statuses/home_timeline.json", a, b, d, c, e)
};
TD.services.TwitterClient.prototype.getMentionsTimeline = function (a, b, d, c, e) {
    this.getTimeline("statuses/mentions.json", a, b, d, c, e)
};
TD.services.TwitterClient.prototype.getDMTimeline = function (a, b, d, c, e) {
    this.getTimeline("direct_messages.json", a, b, d, c, e)
};
TD.services.TwitterClient.prototype.getSentDMTimeline = function (a, b, d, c, e) {
    this.getTimeline("direct_messages/sent.json", a, b, d, c, e)
};
TD.services.TwitterClient.prototype.getFavoritesTimeline = function (a, b, d, c, e, g) {
    b ? this.getTimeline("favorites/:id.json".replace(":id", b), a, d, c, e, g) : this.getTimeline("favorites.json", a, d, c, e, g)
};
TD.services.TwitterClient.prototype.getListTimeline = function (a, b, d, c, e, g, j) {
    this.getTimeline(":user/lists/:id/statuses.json".replace(":user", a).replace(":id", b), d, c, e, g, j)
};
TD.services.TwitterClient.prototype.getProfileTimeline = function (a, b, d, c, e, g) {
    this.getTimeline("statuses/user_timeline.json?include_rts=1&user_id=:userid".replace(":userid", a), d, c, b, e, g)
};
TD.services.TwitterClient.prototype.getSearchTimeline = function (a, b, d, c, e, g) {
    a = {
        count: c || 20,
        q: a
    };
    var j = this;
    c = j.SEARCH_BASE_URL + "search.json";
    if (d) a.max_id = d;
    if (b && b != 1) a.since_id = b;
    TD.util.isChromeApp() ? this.makeTwitterCall(c, a, "GET", false, this.processTimeline, e, g) : TD.net.ajax.jsonp(c, a, function (n) {
        e(j.processTimeline(n))
    }, g)
};
TD.services.TwitterClient.prototype.getTimeline = function (a, b, d, c, e, g) {
    c || (c = 50);
    b || (b = 1);
    b = {
        since_id: b,
        count: c,
        include_entities: 1
    };
    if (d) b.max_id = d;
    this.makeTwitterCall(this.API_BASE_URL + a, b, "GET", true, this.processTimeline, e, g)
};
TD.services.TwitterClient.prototype.getConversation = function (a, b, d) {
    this.makeTwitterCall("https://api.tweetdeck.com/conversation/" + a, {
        trim_future: 1,
        trim_branches: 1
    }, "GET", true, this.processTimeline, b, d)
};
TD.services.TwitterClient.prototype.destroy = function (a, b, d) {
    this.makeTwitterCall(this.API_BASE_URL + "statuses/destroy/:id.json".replace(":id", a), {}, "POST", true, this.processTweet, b, d)
};
TD.services.TwitterClient.prototype.update = function (a, b, d, c, e, g, j) {
    a = {
        status: a
    };
    a.in_reply_to_status_id = b;
    a.lat = d;
    a["long"] = c;
    a.place_id = e;
    this.makeTwitterCall(this.API_BASE_URL + "statuses/update.json", a, "POST", true, this.processTweet, g, j)
};
TD.services.TwitterClient.prototype.getLists = function (a, b, d) {
    var c = {};
    if (a) c.screen_name = a;
    this.makeTwitterCall(this.API_BASE_URL + "lists/all.json", c, "GET", true, this.processLists, b, d)
};
TD.services.TwitterClient.prototype.retweet = function (a, b, d) {
    this.makeTwitterCall(this.API_BASE_URL + "statuses/retweet/:id.json".replace(":id", a), {}, "POST", true, this.processTweet, b, d)
};
TD.services.TwitterClient.prototype.favorite = function (a, b, d) {
    this.makeTwitterCall(this.API_BASE_URL + "favorites/create/:id.json".replace(":id", a), {}, "POST", true, null, b, d)
};
TD.services.TwitterClient.prototype.unfavorite = function (a, b, d) {
    this.makeTwitterCall(this.API_BASE_URL + "favorites/destroy/:id.json".replace(":id", a), {}, "POST", true, null, b, d)
};
TD.services.TwitterClient.prototype.updateFavoriteInternal = function (a, b) {
    a.isFavorite = b;
    var d = "article[data-key='" + a.id_str + "'][data-account-key='" + this.oauth.account.key + "'] [title='" + TD.util.i18n.getMessage("favorite") + "']";
    if (b) {
        var c = this.publishTweet("favorites", a);
        $(d).each(function () {
            $(this).addClass("favorite")
        })
    } else {
        c = this.removeTweet("favorites", a);
        $(d).each(function () {
            $(this).removeClass("favorite")
        })
    }
    c && TD.controller.notifications.reRender(c)
};
TD.services.TwitterClient.prototype.createDM = function (a, b, d, c) {
    this.makeTwitterCall(this.API_BASE_URL + "direct_messages/new.json", {
        screen_name: a,
        text: b
    }, "POST", true, this.processTweet, d, c)
};
TD.services.TwitterClient.prototype.destroyDM = function (a, b, d) {
    this.makeTwitterCall(this.API_BASE_URL + "direct_messages/destroy/:id.json".replace(":id", a), {}, "POST", true, this.processTweet, b, d)
};
TD.services.TwitterClient.prototype.geoSearch = function (a, b, d, c, e, g) {
    var j = {};
    if (a) j.lat = a;
    if (b) j["long"] = b;
    if (d) j.accuracy = d;
    j.granularity = c || "neighborhood";
    this.makeTwitterCall(this.API_BASE_URL + "geo/search.json", j, "GET", true, this.processPlaces, e, g)
};
TD.services.TwitterClient.prototype.getTrends = function (a, b, d) {
    this.makeTwitterCall(this.API_BASE_URL + "trends/" + (a || 1) + ".json", {
        pc: "false"
    }, "GET", true, this.processTrends, b, d)
};
TD.services.TwitterClient.prototype.getTrendLocations = function (a, b) {
    this.makeTwitterCall(this.API_BASE_URL + "trends/available.json", null, "GET", true, this.processTrendLocations, a, b)
};
TD.services.TwitterClient.prototype.publishTweet = function (a, b, d) {
    return this.publishTweetInternal("publish", a, b, d)
};
TD.services.TwitterClient.prototype.removeTweet = function (a, b, d) {
    return this.publishTweetInternal("remove", a, b, d)
};
TD.services.TwitterClient.prototype.publishTweetInternal = function (a, b, d, c) {
    d = b === "direct" || b === "sentdirect" ? (new TD.services.TwitterDirectMessage(this.oauth.account)).fromJSONObject(d) : (new TD.services.TwitterStatus(this.oauth.account)).fromJSONObject(d);
    var e = new TD.storage.model.Feed;
    e.type = b;
    e.accountkey = this.oauth.account.key;
    e.service = "twitter";
    if (b == "search") e.metadata.term = c;
    else if (b == "favorites") e.metadata.id = this.oauth.account.userId;
    e.key = e.generateKey();
    if (b = TD.controller.feedManager.getPoller(e.key)) {
        if (a == "publish") b.acceptChirps([d]);
        else a == "remove" && b.removeChirp(d.id);
        return d
    }
};
TD.services.TwitterClient.prototype.checkUserStream = function () {
    var a = this;
    TD.util.isChromeApp() && chrome.tabs && chrome.tabs.getCurrent(function (b) {
        a.checkUserStreamInternal(b)
    })
};
TD.services.TwitterClient.prototype.checkUserStreamInternal = function (a) {
    var b = this,
        d = RegExp("([^a-zA-Z0-9_]|^)@" + this.oauth.account.username + "([^a-zA-Z0-9_]|$)", "i"),
        c = function (n) {
            switch (n.eventType) {
            case "data":
                n = n.data;
                var p = false,
                    o = false,
                    r = false;
                if (n.friends) {
                    var s = n.friends;
                    n = s.length;
                    for (p = 0; p < n; p++) b.friends[s[p]] = true;
                    if (!b.isStreaming) {
                        try {
                            b.firstStreamConnect || TD.controller.scheduler.refreshAccountColumns(b.oauth.account.key, true)
                        } finally {
                            b.isStreaming = true;
                            b.firstStreamConnect = false
                        }
                        b.isStreaming = true
                    }
                } else if (n.event) {
                    if (n.source.id == b.oauth.account.userId) switch (n.event) {
                    case "favorite":
                        b.updateFavoriteInternal(n.target_object, true);
                        break;
                    case "unfavorite":
                        b.updateFavoriteInternal(n.target_object, false);
                        break;
                    case "follow":
                        b.friends[n.target.id] = true;
                        break;
                    case "unfollow":
                        delete b.friends[n.target.id];
                        break;
                    case "block":
                        b.blocks[n.target.id] = true;
                        delete b.friends[n.target.id];
                        break;
                    case "unblock":
                        delete b.blocks[n.target.id]
                    }
                } else if (!n.limit) if (n["delete"]) if (n["delete"].status) TD.controller.feedManager.deleteChirp(n["delete"].status.id_str);
                else n["delete"].direct_message && TD.controller.feedManager.deleteChirp(n["delete"].direct_message.id);
                else if (n.direct_message) b.publishTweet("direct", n.direct_message);
                else if (!(b.blocks[n.user.id] || n.friendStatus && b.blocks[n.friendStatus.user.id])) {
                    o = b.friends[n.user.id] || n.user.screen_name.toLowerCase() === b.oauth.account.username;
                    r = n.in_reply_to_user_id ? b.friends[n.in_reply_to_user_id] : true;
                    p = n.text.search(d) !== -1;
                    if (o && (r || p)) b.publishTweet("home", n);
                    p && b.publishTweet("mentions", n);
                    for (s in b.streamEngine.queries) {
                        p = b.streamEngine.queries[s];
                        p.match(n.text) && b.publishTweet("search", n, p.query)
                    }
                }
                break;
            case "disconnect":
                b.isStreaming = false
            }
        },
        e = TD.net.ajax.HOST_BASE_URL + "oauth/echo/twitter/",
        g = chrome.extension.getBackgroundPage();
    if (!b.streamEngine) {
        b.streamEngine = g.getStreamEngine(e, this.oauth.account, c, a);
        if (!b.streamEngine) return
    }
    c = a = false;
    for (var j in b.streamingFeeds) {
        e = b.streamingFeeds[j];
        if (TD.controller.feedManager.getPoller(j)) {
            a = true;
            if (e.type == "search" && !e.isTemp) this.streamEngine.addQuery(e.metadata.term);
            else if (e.type == "home") c = true
        } else {
            delete b.streamingFeeds[j];
            e.type == "search" && this.streamEngine.removeQuery(e.metadata.term)
        }
    }
    this.streamEngine.setStreamAllFriends(c);
    a ? this.streamEngine.start() : this.streamEngine.stop()
};
TD.services.TwitterClient.prototype.removeStreamingFeed = function (a) {
    var b = this.streamEngine;
    b && a.type == "search" && b.removeQuery(a.metadata.term);
    this.checkUserStream()
};
TD.services.BuzzClient = function (a) {
    var b = this,
        d = function () {
            var c;
            this.Retweet = function () {
                return this
            };
            this.WithMessage = function (e) {
                c = e;
                return this
            };
            this.InReplyTo = function () {
                return this
            };
            this.DirectlyTo = function () {
                return this
            };
            this.Post = function (e) {
                b.postActivity(c, e)
            }
        };
    this.type = "buzz";
    this.oauth = TD.controller.auth.create("buzz", a);
    this.statusMenuTemplate = "menus/buzz";
    this.maxResults = {};
    this.refreshFeed = function (c, e, g) {
        var j = this,
            n = c.feed,
            p = 40,
            o = null;
        if (e) o = c.continuationToken;
        else if (c.continuationToken) p = 1;
        else b.maxResults[n.key] = 1;
        n.type == "home" && b.getHomeStream(p, o, function (r) {
            if (e || !c.continuationToken) c.continuationToken = j.continuationTokenTemp;
            g(r)
        })
    };
    this.create = function () {
        return new d
    }
};
TD.services.BuzzClient.prototype = new TD.services.ServiceClient;
TD.services.BuzzClient.prototype.constructor = TD.services.ServiceClient;
TD.services.BuzzClient.prototype.API_BASE_URL = "https://www.googleapis.com/buzz/v1/";
TD.services.BuzzClient.prototype.makeBuzzCall = function (a, b, d, c, e, g, j, n, p) {
    var o = this,
        r = function (s) {
            if (j) s = j.call(o, s);
            n(s)
        };
    if (e == "GET") this.get(a, b, g, r, p);
    else if (e == "DELETE") this.del(a, b, d, c, r, p);
    else e == "PUT" ? this.put(a, b, d, c, r, p) : this.post(a, b, d, c, r, p)
};
TD.services.BuzzClient.prototype.processComments = function (a) {
    a = a.data.items;
    var b;
    if (!a) return [];
    for (b = 0; b < a.length; b++) a[b] = this.processComment(a[b]);
    return a
};
TD.services.BuzzClient.prototype.processComment = function (a) {
    if (a && !a.id && a.data) a = a.data;
    return (new TD.services.BuzzComment(this.oauth.account)).fromJSONObject(a)
};
TD.services.BuzzClient.prototype.processTimeline = function (a) {
    var b = a.data.items;
    if (a.data.links && a.data.links.next && a.data.links.next.length && a.data.links.next[0].href) {
        a = a.data.links.next[0].href.split("?")[1];
        this.continuationTokenTemp = TD.net.util.formDecode(a).c
    }
    if (b) {
        for (a = 0; a < b.length; a++) b[a] = this.processActivity(b[a]);
        return b
    }
};
TD.services.BuzzClient.prototype.processActivity = function (a) {
    if (a && !a.id && a.data) a = a.data;
    return (new TD.services.BuzzActivity(this.oauth.account)).fromJSONObject(a)
};
TD.services.BuzzClient.prototype.getHomeStream = function (a, b, d, c) {
    a = {
        alt: "json",
        "max-results": a
    };
    if (b) a.c = b;
    this.makeBuzzCall(this.API_BASE_URL + "activities/@me/@consumption", a, null, null, "GET", true, this.processTimeline, d, c)
};
TD.services.BuzzClient.prototype.postActivity = function (a, b, d) {
    var c = {
        data: {
            object: {}
        }
    };
    c.data.object.content = a;
    this.makeBuzzCall(this.API_BASE_URL + "activities/@me/@self", {
        alt: "json"
    }, JSON.stringify(c), {
        "Content-Type": "application/json"
    }, "POST", true, this.processActivity, b, d)
};
TD.services.BuzzClient.prototype.destroy = function (a, b, d) {
    this.makeBuzzCall(this.API_BASE_URL + "activities/@me/@self/" + a, {
        alt: "json"
    }, null, null, "DELETE", true, null, b, d)
};
TD.services.BuzzClient.prototype.like = function (a, b, d) {
    this.makeBuzzCall(this.API_BASE_URL + "activities/@me/@liked/" + a, {
        alt: "json"
    }, null, null, "PUT", true, this.processActivity, b, d)
};
TD.services.BuzzClient.prototype.muteActivity = function (a, b, d) {
    this.makeBuzzCall(this.API_BASE_URL + "activities/@me/@muted/" + a, {
        alt: "json"
    }, null, null, "PUT", true, this.processActivity, b, d)
};
TD.services.BuzzClient.prototype.reportActivityAsSpam = function (a, b, d) {
    this.makeBuzzCall(this.API_BASE_URL + "activities/@me/@abuse/" + a, {
        alt: "json"
    }, null, null, "PUT", true, this.processActivity, b, d)
};
TD.services.BuzzClient.prototype.getComments = function (a, b, d) {
    this.makeBuzzCall(this.API_BASE_URL + "activities/@me/@self/" + a + "/@comments", {
        alt: "json"
    }, null, null, "GET", true, this.processComments, b, d)
};
TD.services.BuzzClient.prototype.addComment = function (a, b, d, c) {
    var e = {
        data: {}
    };
    e.data.content = b;
    b = JSON.stringify(e);
    this.makeBuzzCall(this.API_BASE_URL + "activities/@me/@self/" + a + "/@comments", {
        alt: "json"
    }, b, {
        "Content-Type": "application/json"
    }, "POST", true, this.processComment, d, c)
};
TD.services.BuzzActivity = function (a) {
    this.account = a
};
TD.services.BuzzActivity.BUZZ_URL_REGEXP = /<a href="/g;
TD.services.BuzzActivity.prototype = new TD.services.ChirpBase;
TD.services.BuzzActivity.prototype.isOwnChirp = function () {
    return Boolean(this.actor.id == this.account.userId)
};
TD.services.BuzzActivity.prototype.fromJSONObject = function (a) {
    this.id = a.id.substring(25);
    this.links = a.links;
    this.actor = a.actor;
    if (!this.actor.thumbnailUrl) this.actor.thumbnailUrl = "http://mail.google.com/mail/c/static/images/NoPicture.gif?sz=45";
    this.object = a.object;
    this.object.content = a.object.content.replace(TD.services.BuzzActivity.BUZZ_URL_REGEXP, '<a rel="url" href="');
    this.created = TD.util.parseISO8601(a.published || a.created);
    this.updated = TD.util.parseISO8601(a.updated);
    this.createdDate = TD.util.prettyDate(this.created);
    return this
};
TD.services.BuzzActivity.prototype.render = function () {
    return TD.ui.template.render("status/status_buzz", {
        statuses: [this]
    })
};
TD.services.BuzzActivity.prototype.renderNotification = function () {
    return TD.ui.template.render("status/status_buzz_notification", {
        statuses: [this]
    })
};
TD.services.BuzzActivity.prototype.destroy = function () {
    var a = this;
    if (this.actor.id != this.account.userId) TD.ui.main.showInfoMessage("You don't own this account - can't delete", "error");
    else {
        var b = TD.controller.progressIndicator.addTask(TD.util.i18n.getMessage("pi_deleting"));
        TD.controller.clients.getClient(this.account.key).destroy(this.getFullID(this.id), function () {
            $(a.id).remove();
            TD.controller.progressIndicator.taskComplete(b)
        })
    }
};
TD.services.BuzzActivity.prototype.like = function () {
    var a = TD.controller.progressIndicator.addTask(TD.util.i18n.getMessage("pi_liking"));
    TD.controller.clients.getClient(this.account.key).like(this.getFullID(this.id), function () {
        TD.controller.progressIndicator.taskComplete(a)
    })
};
TD.services.BuzzActivity.prototype.mute = function () {
    var a = this,
        b = TD.controller.progressIndicator.addTask(TD.util.i18n.getMessage("pi_muting"));
    TD.controller.clients.getClient(this.account.key).muteActivity(this.getFullID(this.id), function () {
        $(a.id).remove();
        TD.controller.progressIndicator.taskComplete(b)
    })
};
TD.services.BuzzActivity.prototype.reportAsSpam = function () {
    var a = this,
        b = TD.controller.progressIndicator.addTask(TD.util.i18n.getMessage("pi_reporting"));
    TD.controller.clients.getClient(this.account.key).reportActivityAsSpam(this.getFullID(this.id), function () {
        $(a.id).remove();
        TD.controller.progressIndicator.taskComplete(b)
    })
};
TD.services.BuzzActivity.prototype.getComments = function (a) {
    var b = this;
    TD.controller.clients.getClient(this.account.key).getComments(this.getFullID(this.id), function (d) {
        d = b.renderComments(d);
        a.targetContainer.html(d)
    })
};
TD.services.BuzzActivity.prototype.postComment = function (a) {
    var b = a.colObj.commentField,
        d = b.val(),
        c = TD.controller.progressIndicator.addTask(TD.util.i18n.getMessage("pi_replying"));
    TD.controller.clients.getClient(this.account.key).addComment(this.getFullID(this.id), d, function () {
        b.text("");
        TD.ui.updates.hideConversationView(a);
        TD.controller.progressIndicator.taskComplete(c)
    }, function () {
        TD.controller.progressIndicator.taskFailed(c)
    })
};
TD.services.BuzzActivity.prototype.renderComments = function (a) {
    return TD.ui.template.render("status/comments_buzz", {
        statuses: a,
        showTextBox: true
    })
};
TD.services.BuzzActivity.prototype.getFullID = function (a) {
    return _.startsWith(a, "tag:google.com,2010:buzz:") ? a : "tag:google.com,2010:buzz:" + a
};
TD.services.BuzzComment = function (a) {
    this.account = a
};
TD.services.BuzzComment.prototype.fromJSONObject = function (a) {
    this.id = a.id.substring(25);
    this.actor = a.actor;
    this.content = TD.util.transform(a.content);
    this.parent = a.links.inReplyTo[0];
    this.created = TD.util.parseISO8601(a.published);
    this.createdDate = TD.util.prettyDate(this.created);
    return this
};
TD.services.BuzzComment.prototype.render = function (a) {
    return TD.ui.template.render("status/comments_buzz", {
        statuses: [this],
        showTextBox: a
    })
};
TD.services.BuzzComment.prototype.destroy = function () {
    var a = this;
    if (this.actor.id != this.account.userId) TD.ui.main.showInfoMessage("You don't own this account - can't delete", "error");
    else {
        var b = TD.controller.progressIndicator.addTask(TD.util.i18n.getMessage("pi_deleting"));
        TD.controller.clients.getClient(this.account.key).destroy(this.getFullID(this.id), function () {
            $(a.id).remove();
            TD.controller.progressIndicator.taskComplete(b)
        })
    }
};
TD.services.BuzzActivity.prototype.reportAsSpam = function () {
    var a = this,
        b = TD.controller.progressIndicator.addTask(TD.util.i18n.getMessage("pi_reporting"));
    TD.controller.clients.getClient(this.account.key).reportActivityAsSpam(this.getFullID(this.id), function () {
        $(a.id).remove();
        TD.controller.progressIndicator.taskComplete(b)
    })
};
TD.services.BuzzActivity.prototype.getFullID = function (a) {
    return _.startsWith(a, "tag:google.com,2010:buzz:") ? a : "tag:google.com,2010:buzz:" + a
};
TD.services.FoursquareClient = function (a) {
    var b = this;
    this.type = "foursquare";
    this.oauth = TD.controller.auth.create("foursquare", a);
    this.create = function () {
        return new d
    };
    this.refreshFeed = function (c, e, g, j) {
        var n;
        e && g([]);
        if (c.chirpArray) for (e = 0; e < c.chirpArray.length; e++) if (c.chirpArray[e].user.id != this.oauth.account.userId) {
            n = Math.floor(c.chirpArray[e].created.getTime() / 1E3);
            break
        }
        b.getFriendsCheckins(n, g, j)
    };
    var d = function () {
            var c = {
                broadcast: "public"
            };
            this.Retweet = function () {
                return this
            };
            this.WithMessage = function (e) {
                c.shout = e;
                return this
            };
            this.InReplyTo = function () {
                return this
            };
            this.DirectlyTo = function () {
                return this
            };
            this.Post = function (e, g) {
                b.make4sqCall(b.API_BASE_URL + "checkins/add", c, "POST", false, null, function (j) {
                    if (j && j.meta.code == 200) {
                        j.response.checkin.user = {
                            id: b.oauth.account.userId,
                            photo: b.oauth.account.profileImageURL,
                            firstName: b.oauth.account.username
                        };
                        j = b.processCheckin(j.response.checkin);
                        b.publishCheckin("home", j);
                        e(j)
                    } else {
                        j.errorMessage = j.meta.errorDetail;
                        g(j)
                    }
                }, g)
            }
        }
};
TD.services.FoursquareClient.prototype = new TD.services.ServiceClient;
TD.services.FoursquareClient.prototype.constructor = TD.services.ServiceClient;
TD.services.FoursquareClient.prototype.API_BASE_URL = "https://api.foursquare.com/v2/";
TD.services.FoursquareClient.prototype.publishCheckin = function (a, b) {
    var d = new TD.storage.model.Feed;
    d.type = a;
    d.accountkey = this.oauth.account.key;
    d.service = "foursquare";
    d.key = d.generateKey();
    (d = TD.controller.feedManager.getPoller(d.key)) && d.acceptChirps([b])
};
TD.services.FoursquareClient.prototype.make4sqCall = function (a, b, d, c, e, g, j) {
    var n = this;
    b.oauth_token = this.oauth.account.token_secret;
    TD.net.ajax.request({
        method: d,
        url: a,
        params: b
    }, function (p) {
        if (e) p = e.call(n, p);
        g(p)
    }, j)
};
TD.services.FoursquareClient.prototype.processCheckins = function (a) {
    var b, d;
    if (!a || a.meta.code != 200) return [];
    d = a.response.recent;
    a = d.length;
    for (b = 0; b < a; b++) d[b] = this.processCheckin(d[b]);
    return d
};
TD.services.FoursquareClient.prototype.processCheckin = function (a) {
    return (new TD.services.FoursquareCheckin(this.oauth.account)).fromJSONObject(a)
};
TD.services.FoursquareClient.prototype.getFriendsCheckins = function (a, b, d) {
    var c = {};
    if (a) c.afterTimestamp = a;
    c.limit = 100;
    this.make4sqCall(this.API_BASE_URL + "checkins/recent.json", c, "GET", true, this.processCheckins, b, d)
};
TD.services.FoursquareCheckin = function (a) {
    this.account = a
};
TD.services.FoursquareCheckin.prototype = new TD.services.ChirpBase;
TD.services.FoursquareCheckin.prototype.fromJSONObject = function (a) {
    this.id = a.id;
    this.user = a.user;
    this.user = (new TD.services.FoursquareUser(this.account)).fromJSONObject(a.user);
    if (a.venue) a.venue.name = TD.util.escape(a.venue.name);
    this.venue = a.venue;
    if (a.shout) this.shout = TD.util.transform(a.shout);
    this.created = new Date(a.createdAt * 1E3);
    this.createdDate = TD.util.prettyDate(this.created);
    return this
};
TD.services.FoursquareCheckin.prototype.render = function () {
    return TD.ui.template.render("status/status_foursquare", {
        tweets: [this]
    })
};
TD.services.FoursquareCheckin.prototype.renderNotification = function () {
    return TD.ui.template.render("status/status_foursquare_notification", {
        tweets: [this]
    })
};
TD.services.FoursquareCheckin.prototype.isOwnChirp = function () {
    return Boolean(this.user.id == this.account.userId)
};
TD.services.FoursquareCheckin.prototype.getChirpURL = function () {
    return "http://foursquare.com/user/" + this.user.id + "/checkin/" + this.id
};
TD.services.FoursquareUser = function (a) {
    this.account = a
};
TD.services.FoursquareUser.prototype.fromJSONObject = function (a) {
    this.id = a.id;
    this.lastname = TD.util.escape(a.lastName) || "";
    this.firstname = TD.util.escape(a.firstName);
    this.photo = a.photo;
    return this
};
TD.ui = {};
TD.ui.main = function () {
    function a(r, s) {
        var u = TD.ui.template.render("menus/tdstatus_menu", {
            tdAccount: s
        });
        TD.ui.popover.show($(r.target), {
            timedelay: 100,
            position: "top_right"
        }, u)
    }
    function b(r) {
        r = r.timeStamp;
        var s = $(this);
        if (r - TD.ui.columns.lastScroll < 150) s.scrollLeft(this.lastScroll || 0);
        else {
            this.lastScroll = s.scrollLeft();
            n.lastScroll = r
        }
    }
    function d(r) {
        switch (r.attr("rel")) {
        case "addTDAccount":
            r = $("#tdRegEmail", p).val();
            var s = $("#tdRegPassword", p).val();
            if (r && s !== "") TD.sync.controller.loginTweetdeck(r, s, c, e, false);
            else {
                $("#tdAccountForm").addClass("tdFormError");
                g()
            }
            break;
        case "registerTDAccount":
            r = $("#tdAccountFormRegister");
            s = $("#tdRegEmail", p).val();
            var u = $("#tdRegPassword", p).val(),
                x = $("#tdRegPasswordConfirm", p).val();
            if (s == "" || !s.match(TD.util.EMAIL_VALIDATOR)) {
                $(".frmErrorText", r).text(TD.util.i18n.getMessage("td_correct_email_error"));
                r.addClass("tdFormError");
                g()
            } else if (u != x) {
                $(".frmErrorText", r).text(TD.util.i18n.getMessage("td_passw_match_error"));
                r.addClass("tdFormError");
                g()
            } else if (u.length > 6) TD.sync.controller.createTweetdeckAccount(s, u, c, j);
            else {
                $(".frmErrorText", r).text(TD.util.i18n.getMessage("td_account_passw_len_error"));
                r.addClass("tdFormError");
                g()
            }
            break;
        case "cancel":
            TD.ui.main.hideModalWindow()
        }
    }
    function c() {
        TD.ui.main.hideModalWindow();
        TD.ui.accounts.showAccounts();
        TD.ui.main.renderTDButton()
    }
    function e() {
        $("#tdAccountForm").addClass("tdFormError");
        $(".frmErrorText", p).text(TD.util.i18n.getMessage("sign_in_unsuccessful"));
        g()
    }
    function g() {
        $(".frmText", p).hide();
        $(".frmErrorText", p).show()
    }
    function j() {
        $("#tdAccountForm").addClass("tdFormError");
        $("#tdAccountFormRegister .frmErrorText").text(TD.util.i18n.getMessage("register_unsuccessful"));
        g()
    }
    var n = {},
        p = $("#infoWindow"),
        o = $(".infoContent", p);
    n.columnWidth = 335;
    n.infoWindow = p;
    n.infoContent = o;
    n.init = function () {
        TD.ui.columns.init();
        TD.ui.updates.init();
        TD.ui.sidePanel.init();
        TD.ui.accounts.init();
        TD.ui.profile.init();
        TD.ui.startup.init();
        TD.ui.mediabox.init();
        $("header a").live("click", n.handleHeaderUI);
        $("#composeEntry").click(function () {
            TD.ui.compose.showComposeWindow()
        });
        $("#contextMenu a").live("click", n.handleOptionsMenuClick);
        $("#container").scroll(b);
        n.renderTDButton();
        $(".showTip").tipsy({
            live: true,
            gravity: "s"
        })
    };
    n.showModalWindow = function (r, s, u, x, y, I, G) {
        x & y ? o.html(r).css({
            "max-width": x,
            "max-height": y
        }) : o.html(r).css({
            width: u || 300
        });
        p.css("background", "rgba(0,0,0,0.5)");
        s ? p.show().delay(s).fadeOut(300) : p.show();
        $(".disp-cell").bind("click", function (J) {
            targetElement = $(J.target);
            if (targetElement.hasClass("disp-cell") && I == true) n.hideModalWindow();
            else targetElement.is("a") && G(targetElement)
        })
    };
    n.hideModalWindow = function () {
        $(".disp-cell").unbind("click");
        p.hide()
    };
    n.showMediaInModal = function () {
        var r = TD.ui.template.render("menus/mediabox");
        o.addClass("infoMessageForm").css({
            width: 300,
            height: 400
        });
        o.html(r);
        p.css("background", "rgba(0,0,0,0.5)");
        p.show()
    };
    n.showInfoMessage = function (r, s, u) {
        r = $.createElement("p").text(r);
        r.addClass("infoMessage");
        n.showModalWindow(r, u || 2E3, 300)
    };
    n.showError = function (r) {
        n.showInfoMessage("Error with TweetDeck account: " + r, "error", 5E3)
    };
    n.refreshAccounts = function (r) {
        TD.ui.compose.refreshPostingAccounts(r);
        $("aside").hasClass("active") && PANEL_ACCOUNTS.is(":visible") && TD.ui.accounts.showAccounts()
    };
    n.addAccount = function () {
        addAccount()
    };
    n.handleOptionsMenuClick = function (r) {
        r.preventDefault();
        r = $(r.target);
        var s = r.attr("rel");
        switch (r.closest("#contextMenu").attr("data-menutype")) {
        case "account":
            TD.ui.accounts.handleAccountOptionsMenu(r, s);
            break;
        case "status":
            TD.ui.updates.handleOptionsMenuClick(r, s);
            break;
        case "setLocation":
            TD.ui.compose.setLocation(r, s);
            break;
        case "profile":
            TD.ui.profile.handleProfileOptionsMenu(r, s);
            break;
        case "tdstatus":
            switch (s) {
            case "signIn":
                r = TD.ui.template.render("menus/accounttd_menu", {});
                n.showModalWindow(r, null, 415, null, null, false, d);
                break;
            case "register":
                r = TD.ui.template.render("menus/accounttd_register_menu", {});
                n.showModalWindow(r, null, 415, null, null, false, d);
                break;
            case "signOut":
                for (key in localStorage) key !== "debug" && key !== "dbg" && delete localStorage[key];
                window.location.reload();
                break;
            case "url":
                TD.util.openURL(r.attr("href"))
            }
            break;
        case "setTrendLoc":
            TD.ui.trends.selectTrendLocation(r, s)
        }
        TD.ui.popover.hide()
    };
    n.handleHeaderUI = function (r) {
        r.preventDefault();
        switch ($(r.currentTarget).attr("rel")) {
        case "sidePanel":
            TD.ui.accounts.showAccounts();
            break;
        case "tdAccount":
            a(r, false);
            break;
        case "tdAccName":
            a(r, true)
        }
    };
    n.renderTDButton = function () {
        var r = TD.ui.template.render("tdaccount_header");
        $("#tdStatus").html(r)
    };
    return n
}();
TD.ui.popover = function () {
    var a = {},
        b = $("#popOver"),
        d = $(".popHolder", b),
        c = $("#popContents", b),
        e = false,
        g, j, n = {
            width: "200px",
            height: "50px",
            timedelay: 500,
            position: "top_right"
        };
    a.show = function (p, o, r) {
        p.addClass("active");
        activeButtonTarget = p;
        e && a.hide();
        o = $.extend(n, o);
        b.bind("mouseenter", function () {
            e = true
        });
        b.bind("mouseleave", function () {
            a.hide(p)
        });
        g != 0 && clearTimeout(g);
        r && c.html(r);
        g = setTimeout(function () {
            g = 0;
            var s = p.offset(),
                u = c.outerHeight(true),
                x = c.outerWidth(true);
            if (o.position == "bottom") {
                b.css({
                    left: s.left,
                    right: "inherit",
                    top: s.top - (u + 28),
                    minWidth: o.width,
                    minHeight: o.height
                });
                d.css({
                    marginTop: 0,
                    marginBottom: 38
                })
            } else {
                if (o.position == "top_right") b.css({
                    right: "4px",
                    left: "inherit",
                    top: s.top + 10,
                    minWidth: o.width,
                    minHeight: o.height
                });
                else o.position == "top_left" ? b.css({
                    left: s.left,
                    top: s.top + 10,
                    minWidth: o.width,
                    minHeight: o.height
                }) : b.css({
                    left: s.left - (x - p.outerWidth(true) - 5),
                    right: "inherit",
                    top: s.top + 8,
                    minWidth: o.width,
                    minHeight: o.height
                });
                d.css({
                    marginTop: 26,
                    marginBottom: 0
                })
            }
            b.css({
                visibility: "visible"
            });
            e = true
        }, o.timedelay)
    };
    a.hide = function () {
        b.unbind("mouseenter");
        b.unbind("mouseleave");
        j != 0 && clearTimeout(j);
        j = setTimeout(function () {
            j = 0;
            b.css({
                visibility: "hidden"
            });
            e = false;
            activeButtonTarget && activeButtonTarget.removeClass("active");
            clearTimeout(g)
        }, 150)
    };
    a.content = function (p) {
        if (e) {
            clearTimeout(j);
            b.css({
                visibility: "hidden"
            })
        }
        c.html(p)
    };
    a.timerReset = function () {
        clearTimeout(g);
        clearTimeout(j)
    };
    return a
}();
TD.ui.startup = function () {
    function a() {
        var G = $("#tdRegEmail", I).val(),
            J = $("#tdRegPassword", I).val();
        if (G && J !== "") {
            TD.sync.controller.loginTweetdeck(G, J, b, d, false);
            j("STATE4")
        } else {
            $("#tdAccountForm").addClass(y);
            e()
        }
    }
    function b() {
        j("FINISH")
    }
    function d() {
        j("STATE2");
        $("#tdAccountForm .frmErrorText").text(TD.util.i18n.getMessage("sign_in_unsuccessful"));
        $("#tdAccountForm").addClass(y)
    }
    function c() {
        j("STATE3");
        $("#tdAccountFormRegister .frmErrorText").text(TD.util.i18n.getMessage("register_unsuccessful"));
        $("#tdAccountFormRegister").addClass(y)
    }
    function e() {
        u.hide();
        s.show()
    }
    function g() {
        helpBubble1 = TD.ui.template.render("startup/info_bubble", {
            text: TD.util.i18n.getMessage("help_main_button"),
            position: "top:50px",
            direction: "up"
        });
        helpBubble2 = TD.ui.template.render("startup/info_bubble", {
            text: TD.util.i18n.getMessage("help_add_acc"),
            position: "bottom:80px",
            direction: "down"
        });
        $("body").append(helpBubble1, helpBubble2);
        $(".infoBubble.up").click(function () {
            $(this).fadeOut()
        });
        $(".infoBubble.down").click(function () {
            $(this).fadeOut()
        })
    }

    function j(G) {
        $(".startflow").hide();
        $("#tdAccountFormRegister").removeClass("tdFormError");
        $("#tdAccountForm").removeClass("tdFormError");
        u.show();
        s.hide();
        switch (G) {
        case "STATE1":
            x.show();
            $(".step1", I).show();
            break;
        case "STATE2":
            x.hide();
            $(".step2", I).show();
            break;
        case "STATE3":
            x.hide();
            $(".step3", I).show();
            break;
        case "STATE4":
            x.hide();
            $(".step4", I).show();
            break;
        case "FINISH":
            TD.ui.accounts.showAccounts();
            g();
            x.empty();
            r.show();
            p.hide()
        }
    }
    var n = {},
        p = $("#startupModal"),
        o = $(".startup-content", p),
        r = $("header"),
        s, u, x, y = "form-error",
        I;
    n.init = function () {
        var G = {
            url: window.location,
            locale: TD.util.i18n.getLocale()
        };
        $("#importBtn").attr("src", "http://www.tweetdeck.com/chrome/bridge/?" + TD.net.util.formEncode(G));
        I = $("#startupForm");
        $("a", I).live("click", n.handleStartupClick);
        I.live("keypress", function (J) {
            J.keyCode == 13 && a()
        });
        s = $(".frmErrorText");
        u = $(".frmText");
        x = $("#importBtn")
    };
    n.showSignin = function () {
        r.hide();
        newHTML = TD.ui.template.render("startup/signin", {});
        p.show();
        o.html(newHTML)
    };
    n.exitStartup = function () {
        TD.ui.accounts.showAccounts();
        g();
        x.empty();
        r.show();
        p.hide()
    };
    n.handleStartupClick = function (G) {
        G.preventDefault();
        G = $(G.currentTarget);
        switch (G.attr("rel")) {
        case "skip":
            j("FINISH");
            break;
        case "register":
            j("STATE3");
            break;
        case "url":
            window.open(G.attr("href")).focus();
            break;
        case "addTDAccount":
            a();
            break;
        case "registerTDAccount":
            G = $("#tdRegEmail", I).eq(1).val();
            var J = $("#tdRegPassword", I).eq(1).val(),
                V = $("#tdRegPasswordConfirm", I).val();
            if (G == "" || !G.match(TD.util.EMAIL_VALIDATOR)) {
                $("#tdAccountFormRegister .frmErrorText").text(TD.util.i18n.getMessage("td_correct_email_error"));
                $("#tdAccountFormRegister").addClass(y);
                e()
            } else if (J != V) {
                $("#tdAccountFormRegister .frmErrorText").text(TD.util.i18n.getMessage("td_passw_match_error"));
                $("#tdAccountFormRegister").addClass(y);
                e()
            } else if (J.length > 6) {
                TD.sync.controller.createTweetdeckAccount(G, J, b, c);
                j("STATE4")
            } else {
                $("#tdAccountFormRegister .frmErrorText").text(TD.util.i18n.getMessage("td_account_passw_len_error"));
                $("#tdAccountFormRegister").addClass(y);
                e()
            }
            break;
        case "skipImport":
            j("STATE2");
            break;
        case "cancel":
        case "state1":
            j("STATE1");
            break;
        case "state2":
            j("STATE2")
        }
    };
    n.hideInfoBubbles = function (G) {
        switch (G) {
        case "up":
            $(".infoBubble.up").fadeOut(150, function () {
                $(this).remove()
            });
            $(".infoBubble.up").unbind();
            break;
        case "down":
            $(".infoBubble.down").fadeOut(150, function () {
                $(this).remove()
            });
            $(".infoBubble.down").unbind()
        }
    };
    return n
}();
TD.ui.mediabox = function () {
    function a(o, r) {
        var s = $("#mediaHolder"),
            u = false,
            x = function () {
                window.open(o).focus();
                TD.ui.mediabox.hide()
            };
        TD.services.media.getMedia(o, r, function (y) {
            if (y.type !== "photo" && y.html == null) x();
            else {
                var I = TD.ui.template.render("menus/mediabox_header", {
                    href: o,
                    provider: y.provider_name
                });
                $("#mediaHeader").html(I);
                j.addClass("infoMessageForm");
                s.html("");
                $("#mediaBox").addClass("mediaLoading");
                if (e.length > 1) {
                    j.css({
                        paddingBottom: p
                    });
                    u = true
                } else j.css({
                    paddingBottom: 0
                });
                if (y.type !== "photo") {
                    I = y.html.replace('allowscriptaccess="always"', 'allowscriptaccess="false"');
                    I = I.replace('param name="allowScriptAccess" value="always"', 'param name="allowScriptAccess" value="false"');
                    if (!y.width) y.width = 500;
                    if (!y.height) y.height = 500;
                    b(y.width + 2, y.height + n, u, true);
                    s.html(I).css({
                        width: y.width,
                        height: y.height
                    })
                } else {
                    var G = new Image;
                    G.onload = function () {
                        var J = $.createElement("img"),
                            V = G.width > 500 ? 500 : G.width,
                            C = G.height > 500 ? 500 : G.height;
                        J.css({
                            maxHeight: C,
                            maxWidth: V
                        }).attr("src", y.url);
                        s.html(J);
                        s.css({
                            width: 500,
                            height: 500
                        });
                        b(V + 2, C + n, u, false)
                    };
                    G.src = y.url
                }
            }
        }, x)
    }
    function b(o, r, s, u) {
        var x = j.width(),
            y = j.height() - r;
        if (x - o >= 0 && y >= 0 && !u) {
            $("#mediaHolder img").css({
                opacity: "1"
            });
            $("#mediaHolder").css({
                display: "table-cell",
                background: "#171717"
            });
            $("#mediaBox").removeClass("mediaLoading");
            s && $("#mediaChooser").show()
        } else j.animate({
            width: o,
            height: r
        }, 300, function () {
            $("#mediaHolder").css({
                display: "table-cell",
                background: "#171717"
            });
            $("#mediaBox").removeClass("mediaLoading");
            s && $("#mediaChooser").show()
        })
    }

    function d() {
        var o = TD.ui.template.render("menus/mediabox");
        j.html(o);
        g.css("background", "rgba(0,0,0,0.25)");
        j.css({
            width: 502,
            height: 540
        });
        g.show();
        $(".disp-cell").bind("click", function (r) {
            r.preventDefault();
            targetElement = $(r.target);
            if (targetElement.hasClass("disp-cell")) TD.ui.mediabox.hide();
            else targetElement.is("a") ? TD.ui.mediabox.handleMediaClick(targetElement) : TD.ui.mediabox.handleMediaClick(targetElement.parent())
        })
    }
    var c = {},
        e = [],
        g, j, n = 40,
        p = 70;
    c.init = function () {
        g = TD.ui.main.infoWindow;
        j = TD.ui.main.infoContent
    };
    c.handleMediaClick = function (o) {
        switch (o.attr("rel")) {
        case "url":
            window.open(o.attr("href")).focus();
            break;
        case "shareMedia":
            TD.ui.compose.showComposeWindow(o.attr("data-url"), true);
            TD.ui.mediabox.hide();
            break;
        case "closeMedia":
            TD.ui.mediabox.hide()
        }
    };
    c.show = function (o) {
        $("body").attr("id", "media");
        $("embed, object, select").css({
            visibility: "hidden"
        });
        d();
        e.length = 0;
        e = $("a[rel=mediaPreview]", o.element);
        if (e.length > 1) {
            for (var r = 0; r < e.length;) {
                var s = $.createElement("li");
                $(e[r]).clone().appendTo(s);
                $("#mediaChooser").append(s);
                r++
            }
            $("#mediaChooser a").bind("click", function (u) {
                u.preventDefault();
                u = $(u.currentTarget);
                u = u.attr("title") || u.attr("data-full-url") || u.attr("href");
                a(u)
            })
        }
        r = $(o.targetElement);
        r = r.attr("title") || r.attr("data-full-url") || r.attr("href");
        a(r, o.dataKey)
    };
    c.hide = function () {
        $(".disp-cell").unbind("click");
        g.hide();
        $("body").removeAttr("id");
        j.html("").removeClass("infoMessageForm");
        $("embed, object, select").css({
            visibility: "visible"
        })
    };
    return c
}();
TD.ui.compose = function () {
    function a(h) {
        console.log("called");
        h.preventDefault();
        Na = !Na;
        if (Ra) {
            Kb();
            pb()
        } else Jb()
    }
    function b() {
        rb = Text.getRange();
        Aa.val("");
        Aa.focus();
        setTimeout(function () {
            Xa();
            K(Aa.val());
            Q(true)
        }, 5)
    }
    function d(h) {
        h.originalEvent.preventDefault()
    }
    function c(h) {
        h.originalEvent.preventDefault();
        if (h = h.originalEvent.dataTransfer.getData("Text")) {
            if (ja[0].textContent) h = " " + h;
            R(h)
        }
    }
    function e(h) {
        if (h.target.constructor !== HTMLAnchorElement) {
            rb = Text.getRange();
            Q();
            C();
            Ca()
        }
    }
    function g(h) {
        var m = $(h.target);
        m.attr("rel") || (m = $(h.target).parent());
        var q = m.attr("rel");
        if (q) {
            h.preventDefault();
            if (!(Wb && q !== "account" && q !== "edit")) switch (q) {
            case "send":
                Hb();
                break;
            case "clear":
                ob();
                Oa();
                break;
            case "cancelRT":
                ob();
                Oa();
                pa.hideComposeWindow();
                break;
            case "toggleHidden":
                if (Pa.hasClass("full")) {
                    Pa.removeClass("full");
                    Ya.hide()
                } else {
                    Pa.addClass("full");
                    Ya.show()
                }
                break;
            case "account":
                if (Ab) break;
                else if (h.shiftKey) {
                    $("li", wb).removeClass("selected");
                    $("li", xb).removeClass("selected");
                    m.parents("li.accSelector:not(.disabled)").addClass("selected")
                } else m.parents("li.accSelector:not(.disabled)").toggleClass("selected");
                jb = undefined;
                mb();
                Ca();
                break;
            case "addAccount":
                TD.ui.compose.hideComposeWindow();
                TD.ui.main.addAccount();
                break;
            case "addPhoto":
                document.getElementById("fileUploadInput").click();
                break;
            case "addRecord":
                I();
                break;
            case "addLocation":
                r();
                break;
            case "removeLocation":
                x();
                break;
            case "addMention":
                K(" @");
                V(TD.util.i18n.getMessage("autocomplete_prompt_sn"));
                Ca();
                break;
            case "addDM":
                ka();
                break;
            case kb:
            case Eb:
            case Ta:
                lb(m[0]);
                C();
                Ca();
                break;
            case Sa:
                Xa();
                break;
            case f:
                ga(null, m[0]);
                Xa()
            }
        }
    }
    function j(h) {
        h.preventDefault();
        if (h = $(h.target).closest("li")) {
            Ka = h.data("index");
            Xa();
            U()
        }
    }
    function n(h) {
        Qb == "down" && Ca();
        Qb = "down";
        if ($a) switch (h.which) {
        case 9:
            U();
            h.preventDefault();
            break;
        case 13:
            U();
            h.preventDefault();
            break;
        case 27:
            G();
            break;
        case 38:
            na(-1);
            h.preventDefault();
            break;
        case 40:
            na(1);
            h.preventDefault()
        } else {
            var m = false;
            switch (h.which) {
            case 8:
                m = l(true, true);
                break;
            case 37:
                m = l(true);
                break;
            case 39:
                m = l(false);
                break;
            case 46:
                m = l(false, true);
                break;
            case 27:
                pa.hideComposeWindow();
                m = true
            }
            m && h.preventDefault()
        }
    }
    function p(h) {
        switch (h.charCode) {
        case 10:
        case 13:
            h.preventDefault();
            if (h.ctrlKey) Hb();
            else {
                h = Text.getRange();
                var m = document.createElement("br");
                h.deleteContents();
                h.insertNode(m);
                h.setStartAfter(m);
                h.setEndAfter(m);
                Ja(h)
            }
        }
    }
    function o(h) {
        Qb = "up";
        Ca();
        Wa();
        rb = Text.getRange();
        switch (h.which) {
        case 27:
            break;
        case 38:
        case 40:
            if ($a) break;
        case 35:
        case 36:
        case 37:
        case 39:
            if (h.shiftKey) break;
        case 8:
        case 13:
        case 32:
            Q();
            C();
            break;
        default:
            C()
        }
    }
    function r() {
        var h, m;
        if (Fa) u();
        else {
            h = TD.controller.clients.getClientsByService("twitter");
            if (h.length) {
                m = h[0];
                qb.html('<span class="spinner-dark"></span>' + TD.util.i18n.getMessage("add_your_location"));
                TD.util.getCurrentLocation(6E3, function (q) {
                    q = q.coords;
                    m.geoSearch(q.latitude, q.longitude, "", null, s, x)
                }, x)
            }
        }
    }
    function s(h) {
        if (h && h.length > 0) {
            Fa = h;
            var m = h[0];
            $("#composePanel #twitterPlaceID").val(m.id);
            qb.html("<span></span>" + m.full_name);
            Mb.css("visibility", "visible");
            TD.storage.store.set(":CACHED_PLACES", h)
        }
    }
    function u() {
        if (Fa) {
            var h = TD.ui.template.render("menus/compose_location", {
                places: Fa
            });
            TD.ui.popover.show(qb, {
                timedelay: 0,
                position: "top"
            });
            TD.ui.popover.content(h)
        }
    }

    function x() {
        Fa = null;
        $("#composePanel #twitterPlaceID").val("");
        qb.html("<span></span>" + TD.util.i18n.getMessage("add_your_location"));
        TD.storage.store.set(":CACHED_PLACES", null);
        Mb.css("visibility", "hidden")
    }
    function y() {
        var h = yb.offset();
        Qa.css("bottom", h.bottom);
        Qa.show()
    }
    function I() {
        var h = bb(),
            m, q;
        for (m = 0; m < h.length; m++) if (h[m].type == "twitter") {
            q = h[m];
            break
        }
        if (q) {
            h = TD.net.ajax.HOST_BASE_URL + "video/record/twitvid";
            h = TD.net.util.addURLParam(h, "x-td-oauth-key", q.oauth_token);
            h = TD.net.util.addURLParam(h, "x-td-oauth-secret", q.token_secret);
            chrome.tabs.getSelected(null, function (t) {
                mainUITabID = t.id
            });
            chrome.tabs.create({
                url: h
            }, function (t) {
                var w = t.id;
                chrome.tabs.onUpdated.addListener(function (A, D, E) {
                    if (A === w && E.url && E.status === "complete") if (_.contains(E.url, "/video/submit/success")) {
                        D = E.url.split("?")[1];
                        params = TD.net.util.formDecode(D);
                        chrome.tabs.update(mainUITabID, {
                            selected: true
                        });
                        chrome.tabs.remove(A);
                        Xa();
                        R(" " + params.media_url)
                    }
                })
            })
        } else TD.ui.main.showInfoMessage(TD.util.i18n.getMessage("upload_error_no_acc"))
    }

    function G() {
        if ($a) {
            gb = [];
            xa = "";
            Ka = -1;
            Qa.hide();
            Qa.html("");
            $a = false
        }
    }
    function J(h) {
        h == "d " && V(TD.util.i18n.getMessage("autocomplete_prompt_sn"));
        if (h == "d " || h == "@") {
            tb = _.keys(pa.usernameSet);
            tb = tb.sort()
        } else if (h == "#") {
            La = _.keys(pa.hashtagSet);
            La = La.sort()
        }
        $a = true;
        Ha = h;
        y()
    }
    function V(h) {
        Qa.html('<p id="composeMessage">' + h + "</p>");
        $("p#composeMessage", za).fadeIn(300);
        Qa.fadeIn(300);
        $a = true
    }
    function C() {
        var h = Text.getRange(),
            m = "";
        if (h && h.startContainer === h.endContainer && h.startContainer.nodeType == Node.TEXT_NODE) m = h.endContainer.data.substring(0, h.endOffset);
        if (h.endContainer === ja.contents()[0] && m.toLowerCase() == "d\u00a0") {
            h.startContainer.data = h.startContainer.data.substr(2);
            ka()
        } else Y(m)
    }
    function Y(h) {
        function m(sa) {
            var v = {},
                F = pa.usernameSet[sa].s,
                O = sa.indexOf(xa);
            v.pic = pa.usernameSet[sa].p;
            v.screenName = O == -1 ? F : F.substring(0, O) + "<strong>" + F.substr(O, xa.length) + "</strong>" + F.substring(O + xa.length);
            return v
        }
        function q(sa) {
            var v = sa;
            sa = sa.indexOf(xa);
            if (sa == -1) return v;
            return v = v.substring(0, sa) + "<strong>" + v.substr(sa, xa.length) + "</strong>" + v.substring(sa + xa.length)
        }
        var t, w, A, D, E = [],
            P = [],
            X = [],
            da = [];
        w = 0;
        var aa;
        w = [];
        var ea, la, oa, ua = Text.getRange();
        aa = h.match(ab);
        ea = "@";
        if (!aa) {
            aa = h.match(Fb);
            ea = "#"
        }
        if (!aa) if (ua.endContainer === ja.contents()[1]) {
            ua = ja.contents()[0];
            if (ua.constructor === HTMLAnchorElement && ua.rel == Sa) {
                aa = h.match(Yb);
                ea = "d "
            }
        }
        if (aa) {
            xa = aa[1];
            J(ea);
            if (xa != "") {
                if (ea == "d " || ea == "@") {
                    la = tb;
                    t = m;
                    D = TD.storage.store.get(":AC_TWITTER_USER_GUESSES");
                    oa = "compose/autocomplete_twitter_user"
                } else if (ea == "#") {
                    la = La;
                    t = q;
                    D = TD.storage.store.get(":AC_HASHTAG_GUESSES");
                    oa = "compose/autocomplete_hashtag"
                }
                gb = [];
                if (h = D[xa]) {
                    for (A in h) pa.usernameSet[A] && w.push([A, h[A]]);
                    w.sort(function (sa, v) {
                        return v[1] - sa[1]
                    });
                    for (A = 0; A < w.length; A++) {
                        screenName = w[A][0];
                        P.push(screenName)
                    }
                }
                ea = RegExp(xa.split("").join("\\w*").replace(/\W/, ""), "i");
                D = la.length;
                for (A = 0; A < D; A++) {
                    w = la[A];
                    if (w.match(ea)) if (!(h && h[w])) {
                        aa = w.indexOf(xa);
                        if (aa == -1) da.push(w);
                        else aa == 0 ? E.push(w) : X.push(w)
                    }
                }
                E = [E, X, da];
                w = 0;
                for (X = []; w < pa.MAX_AUTOCOMPLETE_RESULTS;) {
                    for (; P && P.length == 0;) P = E.shift();
                    if (!P) break;
                    if (da = P.shift()) {
                        gb.push(da);
                        X.push(t(da));
                        w++
                    }
                }
                if (w > 0) {
                    t = TD.ui.template.render(oa, {
                        results: X
                    });
                    Qa.html(t);
                    y();
                    Bb = $("div#composeResults ul#autoCompleteResultsList li.composeResultItem");
                    Ka = -1;
                    na(1)
                } else G()
            }
        } else G()
    }
    function na(h) {
        h = Ka + h;
        h = Math.max(0, h);
        h = Math.min(gb.length - 1, h);
        if (h != Ka) {
            Ka != -1 && Bb.eq(Ka).toggleClass("active");
            Ka = h;
            Bb.eq(Ka).toggleClass("active")
        }
    }
    function U() {
        if ($a) {
            var h = gb[Ka],
                m, q;
            if (Ha == "d " || Ha == "@") {
                q = ":AC_TWITTER_USER_GUESSES";
                h = pa.usernameSet[h].s
            } else if (Ha == "#") q = ":AC_HASHTAG_GUESSES";
            m = TD.storage.store.get(q);
            var t = m[xa] || {};
            t[h.toLowerCase()] = (t[h.toLowerCase()] || 0) + 1;
            m[xa] = t;
            TD.storage.store.set(q, m);
            switch (Ha) {
            case "#":
                m = Ha + xa;
                break;
            case "d ":
                m = "\u00a0" + xa;
                h = "\u00a0" + h;
                break;
            default:
                m = Ha + xa;
                h = Ha + h
            }
            q = Text.getRange();
            if (t = q.startContainer.data) if (t.substring(q.endOffset - m.length, q.endOffset) == m) {
                t = q.endOffset + (1 + h.length - m.length);
                q.startContainer.replaceData(q.endOffset - m.length, m.length, h + "\u00a0");
                q.setStart(q.startContainer, t);
                q.setEnd(q.startContainer, t);
                Ja(q);
                Q()
            }
            G()
        }
    }
    function Q(h) {
        var m = ja.contents(),
            q = Text.getRange();
        if (!(!q || q.startContainer !== q.endContainer)) {
            Gb();
            var t = m[0],
                w = m[1];
            if (t.rel == Sa && w && w.nodeType == Node.TEXT_NODE) {
                var A = w.data.match(Zb);
                if (A) {
                    var D = w === q.startContainer && q.startOffset <= A[0].length;
                    if (h || !D) {
                        q = TD.util.i18n.getMessage("dm_message_user", [A[1]]);
                        $(t).remove();
                        qa(0, A[0].length, w, Ta, q, {
                            "data-username": A[1]
                        });
                        q = Text.getRange()
                    }
                }
            }
            t = [TD.util.getUserEntities, TD.util.getHashtagEntities, TD.util.urls.findEntities];
            w = [kb, Eb, f];
            for (A = 0; A < t.length; A++) {
                D = t[A];
                for (var E = w[A], P = 0; P < m.length; P++) {
                    var X = m[P];
                    if (X.nodeType == Node.TEXT_NODE) {
                        var da = q.startContainer === X,
                            aa = q.endContainer === X,
                            ea = D(X.data);
                        ea.sort(function (ua, sa) {
                            return (ua.start < sa.start) - (ua.start > sa.start)
                        });
                        for (var la = 0; la < ea.length; la++) {
                            var oa = ea[la];
                            if (!(!h && da && aa && q.startOffset <= oa.end && q.endOffset >= oa.start)) {
                                qa(oa.start, oa.end, X, E);
                                q = Text.getRange();
                                E == f && ca(oa.value)
                            }
                        }
                    }
                }
            }
        }
    }
    function l(h, m) {
        var q = Text.getRange(),
            t = ja.contents(),
            w = -1,
            A;
        if (!q.collapsed) return false;
        if (q.startContainer.nodeType == Node.TEXT_NODE) {
            if (q.startOffset == 0 || q.startOffset == q.startContainer.data.length) for (var D = 0; D < t.length; D++) {
                A = t[D];
                if (A === q.startContainer) {
                    w = D;
                    w += q.startOffset === 0 ? 0 : 1;
                    break
                }
            }
        } else if (q.startContainer.constructor === HTMLAnchorElement) for (D = 0; D < t.length; D++) {
            A = t[D];
            if (A === q.startContainer) {
                w = D;
                w += q.startOffset === 0 ? 0 : 1;
                break
            }
        } else if (q.startContainer === ja[0]) w = q.startOffset;
        if (w == -1) return false;
        if (h) for (D = w - 1; D >= 0; D--) {
            A = t[D];
            if (A.constructor === HTMLAnchorElement) {
                lb(A, m);
                return true
            } else if (!(A.nodeType == Node.TEXT_NODE && A.data === "")) break
        } else for (D = w; D < t.length; D++) {
            A = t[D];
            if (A.constructor === HTMLAnchorElement) {
                lb(A, m);
                return true
            } else if (!(A.nodeType == Node.TEXT_NODE && A.data === "")) break
        }
        return false
    }
    function ka() {
        Wa();
        if (z() == null) {
            zb = true;
            var h = Da(TD.util.i18n.getMessage("message"), Sa),
                m = document.createTextNode("\u00a0"),
                q = ja.contents()[0];
            $(m).insertBefore($(q));
            $(h).insertBefore($(m));
            h = document.createRange();
            h.setStart(m, 1);
            h.setEnd(m, 1);
            Ja(h);
            V(TD.util.i18n.getMessage("autocomplete_prompt_sn"));
            cb();
            Ca()
        }
    }
    function ta(h) {
        zb = false;
        h && $(h).remove();
        cb()
    }
    function z() {
        H();
        var h = ja.contents()[0];
        if (h) if (h.rel == Ta) return h.dataset.username;
        else if (h.rel == Sa) return "";
        return null
    }
    function H() {
        for (var h, m = false, q = ja.contents().length - 1; q >= 0; q--) {
            h = ja.contents()[q];
            if (m) $(h).remove();
            else if (h.rel == Ta || h.rel == Sa) m = true
        }
        m || ta()
    }
    function K(h) {
        Wa();
        var m = Text.getRange();
        m.deleteContents();
        h = h.replace(/\ /g, "\u00a0");
        h = h.split("\n");
        for (var q, t = 0; t < h.length; t++) {
            q = document.createTextNode(h[t]);
            m.insertNode(q);
            m.setStartAfter(q);
            m.setEndAfter(q);
            if (t < h.length - 1) {
                q = document.createElement("br");
                m.insertNode(q);
                m.setStartAfter(q);
                m.setEndAfter(q)
            }
        }
        Ja(m)
    }
    function R(h) {
        Wa();
        h = h.replace(/\ /g, "\u00a0");
        h = document.createTextNode(h);
        var m = ja.contents();
        m = m[m.length - 1];
        $(h).insertBefore($(m));
        Q()
    }
    function ca(h) {
        var m;
        if (!Ga[h]) {
            m = new TD.vo.URLInfo(h);
            Ga[h] = m
        }
        m && m.shorten(false, false, function (q, t) {
            t.length < q.length && ga(q)
        })
    }
    function ga(h, m) {
        if (!h && m) h = m.innerText;
        var q = Ga[h];
        if (q) {
            if (!m) for (var t = ja.contents(), w = 0; w < t.length; w++) if (t[w].innerText == h) {
                m = t[w];
                break
            }
            if (m) {
                t = q.getNextSynonym(h);
                m.innerHTML = TD.util.h(t);
                Ga[t] = q;
                Ca()
            }
        }
    }
    function qa(h, m, q, t, w, A) {
        if (q.nodeType == Node.TEXT_NODE) {
            var D = q.data,
                E = Text.getRange(),
                P = false,
                X, da, aa, ea;
            w = w || D.substring(h, m);
            var la = D.substring(m);
            la = document.createTextNode(la);
            if (E) {
                if (q === E.startContainer) {
                    P = true;
                    if (E.startOffset > h) {
                        X = Math.max(0, E.startOffset - m);
                        da = la
                    } else {
                        aa = X = E.startOffset;
                        da = ea = q
                    }
                }
                if (q === E.endContainer) if (E.endOffset > h) {
                    P = true;
                    aa = Math.max(0, E.endOffset - m);
                    ea = la
                }
            }
            q.data = D.substring(0, h);
            $(la).insertAfter(q);
            h = Da(w, t, A);
            $(h).insertBefore($(la));
            if (P) {
                da && E.setStart(da, X);
                ea && E.setEnd(ea, aa);
                Ja(E)
            }
            if (!Text.getRange()) {
                document.createRange();
                E.setStart(la);
                E.setEnd(la);
                Ja(E)
            }
        }
    }
    function Da(h, m, q) {
        m = m || "";
        m = "<a contenteditable='false' data-is-processed='1' rel='" + m + "' class='" + m + "' ";
        for (var t in q) m += t + "='" + q[t] + "' ";
        m += ">" + TD.util.h(h) + "</a>";
        return m
    }
    function lb(h, m) {
        var q = h.innerText,
            t = 0,
            w = q.length;
        switch (h.rel) {
        case kb:
        case Eb:
            t = 1;
            break;
        case Sa:
            m && ta(h);
            return;
        case Ta:
            t = z();
            $(h).remove();
            ka();
            K(t);
            t = Text.getRange();
            t.setStart(ja.contents()[1], 1);
            Ja(t);
            Gb();
            return;
        default:
            t = 0
        }
        q = document.createTextNode(q);
        $(h).before($(q));
        $(h).remove();
        var A = document.createRange();
        A.setStart(q, t);
        A.setEnd(q, w);
        Ja(A);
        Gb()
    }
    function Rb() {
        var h = bb(),
            m, q = this.files,
            t = q.length,
            w;
        for (m = 0; m < h.length; m++) if (Ia[h[m]].service == "twitter") {
            w = h[m];
            break
        }
        if (w) for (m = 0; m < t; m++) {
            h = q[m];
            k(h, w)
        } else TD.ui.main.showInfoMessage(TD.util.i18n.getMessage("upload_error_no_acc"))
    }
    function Oa(h) {
        var m = $("div#composePanel div.accounts li"),
            q;
        if (h && !$.isArray(h)) h = [h];
        m.removeClass("selected");
        if (h && h.length) for (q = 0; q < h.length; q++) m.filter("li[data-id='" + h[q] + "']").addClass("selected");
        else {
            (h = TD.storage.store.accountStore.getDefault()) || m.eq(0).addClass("selected");
            m.filter("li[data-id='" + h.key + "']").addClass("selected")
        }
        jb = undefined;
        mb();
        Ca()
    }
    function bb() {
        var h, m = [],
            q;
        if (jb) return jb.concat();
        h = $("ul#postingAccounts li.selected, ul#hiddenAccounts li.selected");
        for (var t = 0; t < h.length; t++) {
            q = h[t].attributes["data-id"].value;
            m.push(q)
        }
        return jb = m
    }
    function mb() {
        (numberOfAccSelected = $("ul#hiddenAccounts li.selected").length) ? Ma.addClass("multiple") : Ma.removeClass("multiple")
    }
    function Hb() {
        function h(E) {
            E = Ia[E];
            var P = E.account,
                X = TD.controller.clients.getClient(E.account).create();
            if (fb && q != "") X.Retweet(q);
            else q != "" && X.InReplyTo && X.InReplyTo(q);
            if (D != null) X = X.DirectlyTo(D).WithMessage(m);
            else fb || (X = X.WithMessage(m));
            X.WithLocation && w && X.WithLocation(w);
            if (E.service == "facebook") if (E.type == "page") X.toPage(E.id);
            else E.type == "group" && X.toGroup(E.id);
            var da = TD.util.i18n.getMessage("pi_sending", E.service);
            TD.controller.progressIndicator.changeMessage(Za, da);
            X.Post(function () {
                TD.controller.stats.post(P);
                if (A.length > 0) h(A.pop());
                else {
                    TD.controller.progressIndicator.taskComplete(Za);
                    Lb();
                    ob();
                    TD.ui.compose.hideComposeWindow()
                }
            }, function (aa) {
                if (aa && aa.errorMessage) da += " - " + aa.errorMessage + "";
                TD.controller.progressIndicator.taskFailed(Za, da)
            })
        }
        var m = Ib(),
            q = db.val(),
            t = $("#replyToScreenName").val(),
            w = $("#twitterPlaceID").val(),
            A = bb(),
            D = z();
        if (D == "") TD.ui.main.showInfoMessage(TD.util.i18n.getMessage("compose_error_dm_no_user"), "error");
        else if (m.length) {
            if (!(Ea.is(":visible") && parseInt(Ea.text()) < 0)) {
                if (t && m.substr(0, t.length).toLowerCase() != t) q = "";
                if (Za) {
                    TD.controller.progressIndicator.deleteTask(Za);
                    Za = null
                }
                nb(m);
                if (A.length > 0) {
                    pa.hideComposeWindow();
                    Za = TD.controller.progressIndicator.addTask("Sending update");
                    h(A.pop())
                } else TD.ui.main.showInfoMessage(TD.util.i18n.getMessage("compose_error_no_acc"), "error")
            }
        } else TD.ui.main.showInfoMessage(TD.util.i18n.getMessage("compose_error_no_content"), 5E3)
    }
    function Ib(h) {
        var m = ja.contents(),
            q = "",
            t = false;
        h = h == undefined ? true : h;
        if (m) {
            Wa();
            H();
            for (var w, A = 0; A < m.length - 1; A++) {
                w = m[A];
                if (w.rel == Ta || w.rel == Sa) t = true;
                else q += w.constructor === HTMLBRElement ? "\n" : w.textContent
            }
        }
        q = q.replace(/\xa0/g, " ");
        if (h) q = q.trim();
        else if (t) q = q.replace(/^\ /, "");
        return q
    }
    function nb(h) {
        var m = TD.util.getHashtags(h) || [];
        for (i = 0; i < m.length; i++) {
            h = m[i];
            pa.hashtagSet[h.toLowerCase()] = h
        }
    }
    function ob() {
        ta();
        Lb();
        G();
        ja.empty();
        Ga = {};
        Ca();
        Na = null;
        db.val("");
        $("#composePanel #replyToScreenName").val("");
        $("div#composePanel div.accounts li").removeClass("selected");
        jb = undefined;
        Wa();
        ja.focus()
    }
    function pb() {
        vb.show();
        Ea.addClass("overCharCount");
        vb.removeClass("anim-jump")
    }
    function Jb() {
        Na = true;
        Ea.hide();
        Ob.show().addClass("anim-jump");
        vb.hide();
        Ra || (Ra = true)
    }
    function Kb() {
        Ea.removeClass("overCharCount");
        Ob.hide();
        vb.hide();
        Ea.show();
        if (Na) Na = false;
        if (Ra) Ra = false
    }
    function Ca() {
        var h = bb(),
            m, q, t = Number.MAX_VALUE,
            w = Ib(false).length,
            A = true,
            D = false;
        for (q = 0; q < h.length; q++) {
            m = Ia[h[q]];
            switch (m.service) {
            case "twitter":
                t = Math.min(140, t);
                D = true;
                break;
            case "foursquare":
                t = Math.min(140, t);
                A = false;
                break;
            case "facebook":
                t = Math.min(420, t)
            }
        }
        if (t != Number.MAX_VALUE) {
            h = Math.min(t - w, t);
            if (h < 0 && A && D && z() == null) if (h < -30 && Na !== false || Na) {
                Ea.text(h);
                Jb()
            } else {
                Ea.text(h);
                Kb();
                pb()
            } else {
                Ea.text(h);
                Kb();
                Na = null;
                h < 0 && Ea.addClass("overCharCount")
            }
        } else Ea.text("").hide()
    }
    function Wa() {
        var h = ja.contents();
        if (h.length > 0) {
            h = h[h.length - 1];
            if (h.nodeType != Node.ELEMENT_NODE || h.constructor !== HTMLBRElement) {
                var m = document.createElement("br");
                $(m).insertAfter($(h))
            }
        } else {
            m = document.createElement("br");
            ja.append(m)
        }
    }
    function Gb() {
        var h = ja.contents(),
            m, q = Text.getRange(),
            t, w, A = q.startContainer,
            D = q.startOffset,
            E = q.endContainer,
            P = q.endOffset;
        for (m = h.length - 1; m >= 0; m--) {
            t = h[m];
            if (t.nodeType == Node.TEXT_NODE) {
                if (w === A) {
                    A = t;
                    D = t.data.length + D
                }
                if (w === E) {
                    E = t;
                    P = t.data.length + P
                }
            }
            w = t
        }
        for (m = 0; m < h.length; m++) {
            t = h[m];
            t.nodeType == Node.TEXT_NODE && t.replaceWholeText(t.wholeText)
        }
        q.setStart(A, D);
        q.setEnd(E, P);
        Ja(q)
    }
    function Ja(h) {
        rb = h;
        Xa()
    }
    function Xa() {
        var h = window.getSelection();
        h.removeAllRanges();
        h.addRange(rb)
    }
    function Sb(h) {
        fb = true;
        sb = h;
        $("#cmpCancelButton").show();
        $(".controlBarAddons").hide();
        $("#cmpMessageButton").addClass("invisible");
        $("#cmpSendButton").html(TD.util.i18n.getMessage("retweet"));
        if ($("#retweetOverlay").size() == 0) {
            var m = TD.ui.template.render("compose/retweet_overlay", {});
            yb.append(m);
            ja[0].contenteditable = false;
            $("#switchRTEdit").bind("click.retweet", function () {
                Lb()
            })
        }
        m = yb.height() + 6;
        $("#retweetOverlay").css({
            height: m
        });
        Nb.html(TD.util.i18n.getMessage("posting_RT_label", [h.getMainUser().screenName]));
        cb()
    }
    function Lb() {
        var h;
        fb = false;
        yb.removeClass("retweet");
        ja[0].contenteditable = true;
        $("#switchRTEdit").unbind("click.retweet");
        db.val("");
        if (sb) {
            h = "RT @" + sb.getMainUser().screenName + ": " + TD.util.removeHTMLCodes(sb.text);
            pa.showComposeWindow(h);
            sb = null;
            Q(true)
        }
        $("#cmpCancelButton").hide();
        $(".controlBarAddons").show();
        $("#cmpMessageButton").removeClass("invisible");
        $("#cmpSendButton").html(TD.util.i18n.getMessage("send"));
        $("#retweetOverlay").remove();
        Ca();
        cb()
    }
    function cb() {
        if (zb || fb) {
            $("li:not(.twitter)", wb).removeClass("selected").addClass("disabled");
            $("li:not(.twitter)", xb).removeClass("selected").addClass("disabled")
        } else {
            $("li:not(.twitter)", wb).removeClass("disabled");
            $("li:not(.twitter)", xb).removeClass("disabled")
        }
        mb();
        if (zb) Nb.html(TD.util.i18n.getMessage("posting_dm_label"));
        else fb || Nb.html(TD.util.i18n.getMessage("posting_label"))
    }
    var pa = {},
        Pa = $("#compose"),
        za = $("#composePanel", Pa),
        yb = $("div#composeBox", za),
        Qa = $("div#composeResults", za);
    $("p#composeMessage", za);
    var ja = $("div#composeInput", za).first(),
        Aa = $("#hiddenTextarea"),
        db = $("#statusID", za),
        Tb = $("#autoCompleteResultsList", za),
        Pb = $("#composeAltText"),
        qb = $("#addLocationButton", za),
        Mb = $(".removeLocationButton", za),
        Nb = $("#composeInfo", za);
    $("div.accounts li a", za);
    var Ub = $("#hiddenAccounts, #postingAccounts"),
        wb = $("#postingAccounts"),
        xb = $("#hiddenAccounts"),
        Ya = $("#hiddenAccountsHolder"),
        Ma, eb = $("#overlay"),
        Vb = $("div#composePanel #fileUploadInput"),
        Ea = $("#characterCount", za),
        vb = $("#dispDeckly"),
        Ob = $("#dispDecklyOn");
    $("#dispCharCount");
    var Wb = false,
        rb, zb = false,
        fb = false,
        sb, Ab = false,
        Fa, Za, Ia = {},
        $a = false,
        xa = "",
        Ka = -1,
        gb = [],
        Bb, Ha, tb, La, Ga = {},
        Qb = "up",
        jb, Ra = false,
        Na = null,
        ab = /@([a-zA-Z0-9_]+)$/,
        Fb = /#([a-zA-Z0-9_]+)$/,
        Yb = /^[\ \xa0]([a-zA-Z0-9_]*)$/,
        Zb = /^[\ \xa0]([a-zA-Z0-9_]+)/,
        kb = "cpMention",
        Ta = "cpDm",
        Sa = "cpDmEdit",
        Eb = "cpHash",
        f = "cpUrl";
    pa.hashtagSet = {};
    pa.usernameSet = {};
    pa.MAX_AUTOCOMPLETE_RESULTS = 5;
    pa.init = function () {
        ja.keypress(p);
        ja.keydown(n);
        ja.keyup(o);
        ja.mouseup(e);
        ja.bind("paste", b);
        ja.bind("dragenter", d);
        ja.bind("dragover", d);
        ja.bind("drop", c);
        $("#dispDecklyOn, #dispDeckly").click(a);
        za.focus();
        ja.blur(function () {});
        za.live("click", g);
        Tb.live("click", j);
        $("#cmpCancelButton").hide();
        Vb.change(Rb);
        pa.hashtagSet = TD.storage.store.get(":CACHED_HASHTAGS");
        pa.usernameSet = TD.storage.store.get(":CACHED_TWITTER_USERS");
        if (navigator.geolocation) {
            qb.show();
            var h = TD.storage.store.get(":CACHED_PLACES");
            h && s(h)
        }
        h = TD.util.i18n.getMessage("compose_box_message");
        Pb.html(h);
        Ub.sortable({
            connectWith: ".accountList",
            placeholder: "sortAccountPlaceholder",
            items: "li:not(.notSortable)",
            distance: 3,
            stop: function () {
                mb();
                TD.storage.store.set(":SHOWN_SENDING_ACCOUNTS", wb.sortable("toArray"));
                TD.storage.store.set(":HIDDEN_SENDING_ACCOUNTS", xb.sortable("toArray"));
                Ab = true;
                setTimeout(function () {
                    Ab = false
                }, 50)
            }
        })
    };
    pa.refreshPostingAccounts = function (h) {
        var m, q, t, w, A, D, E, P, X = [],
            da;
        da = bb();
        var aa = function (ea) {
                !_.include(P, ea) && !_.include(E, ea) && X.push(ea)
            };
        Ia = {};
        E = TD.storage.store.get(":SHOWN_SENDING_ACCOUNTS");
        if (!E || !E.length) E = [];
        P = TD.storage.store.get(":HIDDEN_SENDING_ACCOUNTS");
        if (!P || !P.length) P = [];
        for (m = 0; m < h.length; m++) {
            t = h[m];
            D = t.key;
            aa(D);
            Ia[t.key] = {
                account: t.key,
                type: "account",
                username: t.username,
                service: t.type,
                picture: t.profileImageURL
            };
            if (t.type == "facebook") {
                w = TD.controller.clients.getClient(t.key).pages;
                for (q = 0; q < w.length; q++) {
                    A = w[q];
                    D = t.key + "page" + A.id;
                    aa(D);
                    Ia[D] = {
                        account: t.key,
                        username: TD.util.i18n.getMessage("compose_fb_page_tt", A.name),
                        id: A.id,
                        type: "page",
                        service: "facebook",
                        picture: "http://graph.facebook.com/" + A.id + "/picture"
                    }
                }
                w = TD.controller.clients.getClient(t.key).groups;
                for (q = 0; q < w.length; q++) {
                    A = w[q];
                    D = t.key + "group" + A.id;
                    aa(D);
                    Ia[D] = {
                        account: t.key,
                        id: A.id,
                        username: TD.util.i18n.getMessage("compose_fb_group_tt", A.name),
                        type: "group",
                        service: "facebook",
                        picture: A.picture
                    }
                }
            }
        }
        E = E.concat(X);
        if (E.length) {
            h = TD.ui.template.render("compose_accounts", {
                accountOrder: E,
                accountIndex: Ia,
                showAccToggle: true
            });
            $("ul#postingAccounts").html(h)
        }
        if (P.length) {
            h = TD.ui.template.render("compose_accounts", {
                accountOrder: P,
                accountIndex: Ia,
                showAccToggle: false
            });
            $("ul#hiddenAccounts").html(h)
        }
        Ma = $(".accToggleTile", za);
        mb();
        da.length && Oa(da)
    };
    pa.hideComposeWindow = function () {
        var h = ja.text().trim() || TD.util.i18n.getMessage("compose_box_message");
        Pb.text(h);
        Pa.hide();
        eb.unbind("click");
        eb.removeClass("active")
    };
    pa.showComposeWindow = function (h, m, q, t) {
        var w, A;
        if (h != null) {
            A = document.createTextNode(h.replace(/\ /g, "\u00a0"));
            ja.html(A);
            q = q == undefined ? h.length : q;
            t = t == undefined ? h.length : t;
            w = document.createRange();
            w.setStart(A, q);
            w.setEnd(A, t)
        }
        bb().length || Oa();
        Pa.removeClass("full");
        Ya.hide();
        Ca();
        eb.addClass("active").bind("click", function () {
            TD.ui.compose.hideComposeWindow()
        });
        Pa.show();
        pa.setFocus();
        w && Ja(w);
        Wa();
        m && Q()
    };
    pa.setFocus = function () {
        var h = ja.contents().length,
            m = window.getSelection();
        h > 1 ? m.collapse(ja[0], h + 2) : m.collapseToStart();
        ja.focus()
    };
    pa.referenceTo = function (h, m) {
        Oa(m);
        this.showComposeWindow("RE " + h + " ", true)
    };
    pa.mention = function (h) {
        this.showComposeWindow("@" + h + " ", true)
    };
    pa.replyToTweet = function (h, m) {
        var q = TD.util.getReplyUsers(),
            t = "",
            w = h.id,
            A = undefined,
            D = undefined;
        if (q.length > 0) {
            t = q.join(" ") + " ";
            A = q[0].length + 1;
            D = t.length
        }
        this.showReply(t, w, replyToScreenName, A, D, m)
    };
    pa.showReply = function (h, m, q, t, w, A) {
        h || (h = "@" + q + " ");
        this.showComposeWindow(h, true, t, w);
        Oa(A);
        db.val(m);
        $("#replyToScreenName", za).val(q.toLowerCase())
    };
    pa.retweet = function (h, m) {
        ob();
        this.showComposeWindow(TD.util.removeHTMLCodes(h.text));
        Oa(m);
        Sb(h, m);
        db.val(h.id);
        $("#switchRTEdit").focus()
    };
    pa.directMessage = function (h, m) {
        this.showComposeWindow("");
        Oa(m);
        ka();
        K(h.screenName + " ");
        Q();
        C()
    };
    pa.setLocation = function (h) {
        h = h.attr("data-place-id");
        var m, q;
        for (m = 0; m < Fa.length; m++) {
            q = Fa[m];
            if (q.id == h) {
                Fa.splice(m, 1);
                Fa = [q].concat(Fa)
            }
        }
        s(Fa)
    };
    var k = function (h, m) {
            var q = TD.controller.progressIndicator.addTask(TD.util.i18n.getMessage("uploading", [h.name]));
            TD.net.fileUpload.uploadFile(h, m, function (t) {
                Xa();
                R(" " + t);
                TD.controller.progressIndicator.taskComplete(q)
            }, function () {
                TD.controller.progressIndicator.taskFailed(q)
            })
        };
    return pa
}();
Text = function () {
    var a;
    if (window.getSelection) a = {
        getRange: function () {
            var b = window.getSelection();
            return b.rangeCount > 0 ? b.getRangeAt(0) : null
        },
        getFocusNode: function (b) {
            b = b || this.getRange();
            return b.endContainer
        },
        getFocusNodeValue: function (b) {
            b = b || this.getRange();
            return this.getFocusNode(b).data
        },
        getFocusNodeOffset: function (b) {
            if (b = b || this.getRange()) return b.startOffset || 0;
            return 0
        }
    };
    return a
}();
TD.ui.template = function () {
    var a = {},
        b = {},
        d, c = function (g) {
            return {
                text: TD_templates[g + ".ejs"]
            }
        },
        e = function (g) {
            return {
                url: "../EJSTemplates/" + g + ".ejs"
            }
        };
    b.render = function (g, j) {
        var n = a[g];
        if (!n) {
            d || (d = TD.util.isChromeApp() ? e : c);
            n = new EJS(d(g));
            a[g] = n
        }
        return n.render(j)
    };
    return b
}();
TD.ui.columns = function () {
    var a = $("#columns"),
        b = {},
        d = {},
        c = {},
        e = function () {
            TD.storage.store.settingsStore.set("column_order", a.sortable("toArray"))
        },
        g = function (o) {
            var r = $(o.target);
            r.attr("rel") || (r = r.parent());
            var s = r.attr("rel"),
                u = r.parents("section"),
                x = u.data("column");
            switch (s) {
            case "options":
                o.preventDefault();
                if (u.hasClass("editing")) {
                    o = r;
                    r = TD.controller.scheduler.getColumn($(u).data("column"));
                    $("header h1", u).text(r.title);
                    u.removeClass("editing");
                    o.html("<span></span>").removeClass().addClass("button-icon button-xsml button-minimal i-options");
                    u = $(".container-detail", u);
                    u.css({
                        "z-index": "inherit"
                    }, true);
                    u.empty();
                    a.sortable("disable")
                } else {
                    s = r;
                    $(".container-updates", u);
                    o = $(".container-detail", u);
                    r = TD.controller.scheduler.getColumn($(u).data("column"));
                    u.addClass("editing");
                    s.html("<strong>" + TD.util.i18n.getMessage("done") + "</strong>").removeClass().addClass("button-label button-xsml button-action op-1");
                    s = TD.ui.template.render("column/column_options", {
                        columnObj: r
                    });
                    o.html(s).css({
                        "z-index": 7
                    });
                    $("header h1", u).text(TD.util.i18n.getMessage("col_options_title", r.title));
                    a.sortable("enable")
                }
                break;
            case "resetToTopColumn":
                TD.ui.columns.setColumnToTop(x)
            }
        },
        j = function (o) {
            o.preventDefault();
            o = $(o.target);
            o.attr("rel") || (o = o.parent());
            switch (o.attr("rel")) {
            case "remove":
                o = o.closest(".editHolder").data("columnid");
                TD.ui.columns.removeColumnFromUI(o);
                a.sortable("disable");
                break;
            case "setNotification":
            case "setSound":
                var r = o.closest(".editHolder").data("columnid");
                r = TD.controller.scheduler.getColumn(r);
                var s = o.data("option");
                if (o.data("setting")) {
                    r[s] = false;
                    o.data("setting", false)
                } else {
                    TD.controller.notifications.getPermission();
                    r[s] = true;
                    o.data("setting", true)
                }
                o.toggleClass("i-optionon", o.data("setting"));
                TD.storage.store.columnStore.save()
            }
        },
        n = function (o) {
            var r;
            return function (s) {
                var u = s.timeStamp,
                    x = $(this);
                p.lastScroll = u;
                if (u - TD.ui.main.lastScroll < 200) x.scrollTop(r || 0);
                else {
                    r = u = x.scrollTop();
                    if ((x.height() + u) /s.target.scrollHeight>0.99){s=TD.controller.scheduler.getColumn(o);s.fetchOlderUpdates()}else u===0&&p.setHeaderState(o,false)}}},p={init:function(){$("section>header").live("click",
g);$(".editHolder").live("click",j);$.browser.webkit||$("#container").tdScroller({direction:"h"});a.sortable({revert:true,handle:"header",containment:"#container",disabled:true,stop:e})},setHeaderState:function(o,r){var s=$("[data-column='"+o+"'] header");r?s.addClass("newchirps"):s.removeClass("newchirps")},setColumnToTop:function(o){var r=d[o],s=r.scrollTop(),u=250,x=function(){var y=Math.max(s-u,0);s-=u;r.scrollTop(y);y>0?setTimeout(x,10):p.setHeaderState(o,false)};if(s*10/u > 350) u = s * 10 / 350;
                    x()
                }, freezeScroll: function (o) {
                    var r = d[o];
                    if (r) {
                        var s = r.scrollTop();
                        b[o] = [r[0].scrollHeight - s, s]
                    }
                },
                unfreezeScroll: function (o, r) {
                    var s = d[o],
                        u = b[o],
                        x = c[o];
                    if (s) {
                        if (u[1] > 0 && (new Date).getTime() - TD.ui.columns.lastScroll > 500) {
                            s.scrollTop(s[0].scrollHeight - u[0]);
                            r && r()
                        }
                        x && x.resizeScroller()
                    }
                },
                makeColumn: function (o) {
                    var r = o.currentTarget,
                        s = r.attributes["data-title"] ? r.attributes["data-title"].value : "",
                        u = r.attributes["data-type"].value,
                        x, y = {},
                        I = TD.storage.store;
                    if (s === "Go") {
                        r = o.target.previousElementSibling;
                        x = r.value;
                        s = TD.util.i18n.getMessage("search") + ": " + x
                    }
                    o = r.attributes["data-service"].value;
                    if (o == "tweetdeck") {
                        if (u == "home") {
                            G = I.columnStore.makeColumn(TD.util.i18n.getMessage("home"), [], "home");
                            G.makeHomeColumn()
                        } else if (u == "me") {
                            G = I.columnStore.makeColumn(TD.util.i18n.getMessage("me"), [], "me");
                            G.makeMeColumn()
                        } else if (u == "privateMe") {
                            G = I.columnStore.makeColumn(TD.util.i18n.getMessage("messages"), [], "privateMe");
                            G.makePrivateMeColumn()
                        }
                        G.init();
                        return G
                    }
                    accountkey = r.attributes["data-key"].value;
                    if (u == "search") y.term = x;
                    else if (u == "list") {
                        r = r.attributes["data-meta"].value;
                        y.screenName = r.split("/")[0];
                        y.slug = r.split("/")[1]
                    } else if (u == "group" || u == "page") y.id = r.attributes["data-meta"].value;
                    else if (u == "favorites") y.id = r.attributes["data-meta"].value;
                    else if (u == "usertweets") y.id = r.attributes["data-meta"].value;
                    var G = I.columnStore.makeColumnAndFeed(s, u, o, accountkey, y);
                    G.init();
                    return G
                },
                loadColumns: function () {
                    var o = TD.storage.store.columnStore.getAll();
                    o.length || TD.storage.store.columnStore.addDefaultColumns();
                    o = TD.storage.store.columnStore.getAll();
                    var r = [],
                        s = TD.storage.store.settingsStore.get("column_order");
                    if (s) for (var u = 0, x; x = s[u]; ++u) for (var y = 0, I; I = o[y]; ++y) {
                        if (I.key == x) {
                            r.push(I);
                            break
                        }
                    } else for (y = 0; I = o[y]; ++y) r.push(I);
                    this.addColumnsToUI(r);
                    a.css("width", 330 * r.length)
                },
                removeColumnFromUI: function (o) {
                    $("[data-column='" + o + "']").remove();
                    delete d[o];
                    delete c[o];
                    TD.storage.store.columnStore.remove(TD.storage.store.columnStore.get(o));
                    TD.controller.scheduler.removeColumn(o);
                    e();
                    oldColumnsWidth = a.width();
                    a.css("width", oldColumnsWidth - 330)
                },
                addColumnsToUI: function (o) {
                    var r, s, u, x, y;
                    for (r = 0; r < o.length; r++) {
                        u = o[r];
                        y = u.key;
                        s = TD.ui.template.render("column", u);
                        a.append(s);
                        u.init();
                        s = $(".container-updates", "#" + y);
                        x = n(y);
                        if ($.browser.webkit) {
                            scrollContainer = s;
                            s.scroll(x)
                        } else {
                            s.tdScroller();
                            c[y] = s.data("tdScroller");
                            scrollContainer = $(".scroll-pane", s);
                            scrollContainer.scroll(x)
                        }
                        d[y] = scrollContainer;
                        TD.controller.scheduler.addColumn(u, false, true)
                    }
                },
                addColumnToUI: function (o) {
                    var r = a.width();
                    this.addColumnsToUI([o]);
                    a.css("width", r + 330);
                    TD.storage.store.columnStore.add(o);
                    TD.storage.store.feedStore.addFeeds(o.feeds);
                    e()
                },
                refreshCombinedColumnFeeds: function () {
                    for (var o = TD.storage.store.columnStore.getAll(), r, s = 0; s < o.length; s++) {
                        r = o[s];
                        switch (r.type) {
                        case "home":
                            r.makeHomeColumn();
                            break;
                        case "me":
                            r.makeMeColumn();
                            break;
                        case "privateMe":
                            r.makePrivateMeColumn();
                            break;
                        default:
                            continue
                        }
                        r.refreshSubscriptions();
                        TD.storage.store.feedStore.addFeeds(r.feeds);
                        TD.storage.store.columnStore.save();
                        TD.controller.scheduler.addColumn(r, false, false)
                    }
                    TD.controller.feedManager.cleanupFeeds()
                }
            };
            return p
        }();
    TD.ui.updates = function () {
        function a(u, x) {
            var y = TD.storage.store.accountStore.getAll();
            for (i = 0; i < y.length; i++) if (y[i].type == "twitter") {
                var I = y[i];
                break
            }
            if (I) {
                y = TD.controller.clients.getClient(I.key);
                x.id = x.element.attr("id");
                var G = $(".followAction", "#" + x.id);
                G.addClass("spinner-sml");
                $("a", G).hide();
                if (x.id !== I.id) switch (u) {
                case "follow":
                    y.followUser(x.element.attr("data-screename"), function () {
                        x.following = true;
                        b(x, G)
                    });
                    break;
                case "unFollow":
                    y.unfollowUser(x.element.attr("data-screename"), function () {
                        x.following = false;
                        b(x, G)
                    })
                }
            }
        }
        function b(u, x) {
            x.removeClass("spinner-sml");
            actionButtonAnchor = $("a", x);
            actionButtonAnchor.show();
            if (u.following) {
                actionButtonAnchor.attr("rel", "unFollow");
                actionButtonAnchor.removeClass("button-userunfollow").addClass("button-userfollow")
            } else {
                actionButtonAnchor.attr("rel", "follow");
                actionButtonAnchor.removeClass("button-userfollow").addClass("button-userunfollow")
            }
            x.show()
        }
        function d(u) {
            var x = false,
                y, I;
            if (!($("article", u.target).length > 0)) {
                y = $(u.target);
                y.attr("rel") || (y = y.closest("a"));
                I = p.findParentArticle(y);
                I.targetElement = y;
                var G = y.attr("rel");
                switch (G) {
                case "user":
                    x = !TD.ui.profile.showProfile(I, y.attr("href"));
                    break;
                case "trend":
                    TD.ui.accounts.showSearch(y.data("name"));
                    break;
                case "trendDetail":
                    TD.ui.trends.fetchTrendDetail(I);
                    break;
                case "hashtag":
                    TD.ui.accounts.showSearch("#" + y.text());
                    break;
                case "more":
                    if (y = TD.controller.scheduler.getColumns()[I.column]) {
                        y = y.updateIndex[I.statusKey];
                        G = TD.controller.clients.getClient(I.dataKey);
                        y = TD.ui.template.render(G.statusMenuTemplate, {
                            status: y
                        });
                        TD.ui.popover.show(I.targetElement, {
                            timedelay: 100,
                            position: "top"
                        }, y);
                        s = I
                    }
                    break;
                case "like":
                case "favorite":
                case "destroy":
                case "dm":
                case "retweet":
                case "follow":
                case "unFollow":
                case "block":
                case "blockAndReport":
                case "reportAsSpam":
                case "mute":
                case "toggleReadMore":
                    p.statusAction(G, I);
                    break;
                case "reply":
                case "comments":
                    I.action = G;
                    I.colObj = TD.controller.scheduler.getColumn(I.column);
                    $("#" + I.column).hasClass("detail") ? e(I) : c(I);
                    break;
                case "url":
                case "urlUsr":
                    window.open(y.attr("href")).focus();
                    break;
                case "spotify":
                    x = true;
                    break;
                case "mediaPreview":
                case "mediaPreviewLink":
                    x = false;
                    TD.ui.mediabox.show(I)
                }
                if (!x) {
                    u.preventDefault();
                    u.stopPropagation()
                }
            }
        }
        function c(u) {
            var x = u.column,
                y = $("#" + x),
                I = $(".container-updates", y),
                G = $(".container-detail", y),
                J = u.element,
                V, C = {
                    columnID: x,
                    offset: Math.round(y.outerHeight() / 3) - o
                },
                Y, na, U, Q, l, ka, ta;
            y.addClass("detail");
            C = TD.ui.template.render("status/incolumn_detail", C);
            G.html(C).css({
                "z-index": 7
            }).addClass(J.data("service"));
            Y = $("#detailOverlay_" + x);
            na = $(".detail-holder", Y);
            U = $(".detail-rootchirp", na);
            Q = $(".form-comment", na);
            l = $(".inlineCharCount", Q);
            V = $(".composeInputReply", Q);
            ka = $(".inlineFromLabel", Q);
            ta = $(".inlineFromAvatar", Q);
            $.browser.webkit || $(".detail-chirps", na).tdScroller();
            var z = function (K) {
                    K.appendTo(U);
                    Y.css({
                        opacity: 1,
                        "-webkit-transition-duration": r,
                        "-moz-transition-duration": r,
                        "-o-transition-duration": r
                    });
                    na.css({
                        top: 0,
                        opacity: 1,
                        "-webkit-transition-duration": r,
                        "-moz-transition-duration": r,
                        "-o-transition-duration": r
                    });
                    Q.css({
                        top: 0,
                        "-webkit-transition-duration": r,
                        "-moz-transition-duration": r,
                        "-o-transition-duration": r
                    });
                    V.focus();
                    $("a[rel='comments'], a[rel='reply']", U).addClass("current");
                    u.targetContainer = $(".detail-comments", na);
                    u.colObj.column = y;
                    u.colObj.commentForm = Q;
                    u.colObj.overlayContainer = Y;
                    u.colObj.detailHolder = na;
                    u.colObj.originalPos = Math.round(y.outerHeight() / 3);
                    u.colObj.containerUpdates = I;
                    u.colObj.detailContainer = G;
                    u.colObj.commentField = V;
                    g(u);
                    if (u.action == "reply") {
                        u.statusData = u.colObj.updateIndex[u.statusKey];
                        n(u)
                    }
                    if (u.statusData) {
                        ka.html(u.statusData.account.username);
                        ta.html('<img src="' + u.statusData.account.profileImageURL + '" width="30" height="30" />')
                    } else ka.html("");
                    H();
                    u.statusData.getComments(u);
                    $.browser.webkit ? na.bind("click", function (R) {
                        R.target.className == "detail-chirps" && e(u)
                    }) : $(".scroll-pane", na).bind("click", function (R) {
                        R.target.className == "scroll-pane" && e(u)
                    })
                },
                H = function (K) {
                    return function () {
                        l[0].innerHTML = K.dataService == "twitter" || K.dataService == "foursquare" ? 140 - V[0].value.length : ""
                    }
                }(u);
            V.keydown(function (K) {
                switch (K.which) {
                case 27:
                    K.preventDefault();
                    e(u);
                    break;
                default:
                    H()
                }
            });
            V.keypress(function (K) {
                switch (K.charCode) {
                case 10:
                case 13:
                    if (K.ctrlKey) {
                        K.preventDefault();
                        u.statusData.postComment(u)
                    }
                }
            });
            V.keyup(function () {
                H()
            });
            Q.click(function (K) {
                K = $(K.target);
                var R, ca, ga, qa, Da;
                K.attr("rel") || (K = K.parent());
                switch (K.attr("rel")) {
                case "mainInput":
                    Da = V.val();
                    if (u.action == "reply") {
                        K = u.statusData.id;
                        R = "@" + u.statusData.user.screenName;
                        ca = u.statusData.account.key;
                        ga = V[0].selectionStart;
                        qa = V[0].selectionEnd;
                        TD.ui.compose.showReply(Da, K, R, ga, qa, ca)
                    } else TD.ui.compose.showComposeWindow(Da, true);
                    e(u);
                    break;
                case "postComment":
                    u.statusData.postComment(u)
                }
            });
            if (u.action == "comments") {
                u.statusData = u.colObj.updateIndex[u.statusKey];
                if (u.dataService == "facebook" && u.statusData.isNotification) {
                    TD.controller.clients.getClient(u.dataKey).getPost(u.statusData.objectId, function (K) {
                        var R = $(K.render());
                        u.statusData = K;
                        z(R)
                    });
                    return
                }
            }
            z(J.clone())
        }
        function e(u) {
            var x = u.colObj;
            x.column.removeClass("detail");
            j(x);
            var y = function (I) {
                    if (I.target.className == "detail-holder") {
                        x.detailContainer.css({
                            "z-index": "inherit"
                        }, true);
                        x.detailContainer.empty();
                        x.overlayContainer[0].removeEventListener()
                    }
                };
            if (Modernizr.csstransitions) {
                x.overlayContainer[0].addEventListener("webkitTransitionEnd", y, true);
                x.overlayContainer[0].addEventListener("transitionend", y, true);
                x.commentForm.css({
                    top: o,
                    "-webkit-transition-property": "top",
                    "-webkit-transition": r,
                    "-moz-transition-property": "top",
                    "-moz-transition": r,
                    "-o-transition-property": "top",
                    "-o-transition": r
                });
                x.detailHolder.css({
                    top: x.originalPos,
                    opacity: 0,
                    "-webkit-transition-duration": r,
                    "-webkit-transition-delay": "0, 0",
                    "-moz-transition-duration": r,
                    "-moz-transition-delay": "0, 0",
                    "-o-transition-duration": r,
                    "-o-transition-delay": "0, 0"
                });
                x.overlayContainer.css({
                    opacity: 0,
                    "-webkit-transition-property": "top",
                    "-webkit-transition": r,
                    "-moz-transition-property": "top",
                    "-moz-transition": r,
                    "-o-transition-property": "top",
                    "-o-transition": r
                })
            } else {
                x.detailContainer.css({
                    "z-index": "inherit"
                }, true);
                x.detailContainer.empty()
            }
            x.detailHolder.unbind("click", function () {});
            delete u.colObj
        }
        function g(u) {
            var x = $("#" + u.column + " header");
            x.addClass("active");
            $("h1", x).text(TD.util.i18n.getMessage("back_to_column", u.colObj.title));
            x.bind("click", function (y) {
                e(u);
                y.stopPropagation()
            })
        }
        function j(u) {
            var x = $("header", u.column);
            $("h1", x).text(u.title);
            x.removeClass("active");
            x.unbind("click")
        }
        function n(u) {
            var x = TD.util.getReplyUsers(u.statusData),
                y = "";
            if (x.length > 0) y = x.join(" ") + " ";
            u.colObj.commentField.val(y);
            var I = y.length;
            y = y.length;
            if (x.length > 0) I = x[0].length + 1;
            u.colObj.commentField[0].setSelectionRange(I, y)
        }
        var p = {
            currentlyDisplayedProfile: null
        },
            o = 110,
            r = "0.45s",
            s;
        p.init = function () {
            $("article").live("click", d);
            $(".form-comment").live("click", d)
        };
        p.handleOptionsMenuClick = function (u, x) {
            this.statusAction(x, s)
        };
        p.statusAction = function (u, x) {
            var y = TD.controller.scheduler.getColumns()[x.column];
            if (y) y.updateIndex[x.statusKey][u](x);
            else a(u, x)
        };
        p.markStatusAsRead = function (u) {
            u.toggleClass("selected")
        };
        p.refreshTimestamps = function () {
            var u = TD.util.prettyDate;
            $("article time").each(function () {
                var x, y = $(this);
                x = y.attr("data-time");
                x = u(new Date(Number(x)));
                y.text(x)
            })
        };
        p.hideConversationView = function (u) {
            e(u)
        };
        p.findParentArticle = function (u) {
            var x = {};
            u = u.closest("article");
            x.element = u;
            x.dataService = u.attr("data-service");
            x.dataKey = u.attr("data-account-key");
            x.statusKey = u.attr("data-key");
            x.statusUser = u.attr("data-username");
            x.column = u.closest("section").attr("data-column");
            return x
        };
        return p
    }();
    TD.ui.sidePanel = function () {
        function a(j) {
            j.preventDefault();
            targetElement = $(j.currentTarget);
            switch (targetElement.data("panel")) {
            case "p1":
                TD.ui.sidePanel.hideSidePanel();
                break;
            case "p2":
                TD.ui.sidePanel.contractSidePanel()
            }
        }
        var b = {},
            d, c, e, g;
        b.init = function () {
            d = $("body");
            c = $("aside");
            e = $("#accounts");
            $("aside div.holder");
            g = $("#overlay");
            PANEL_ACCOUNTS = $("#accounts");
            PANEL_PROFILE = $("#profile");
            PANEL_DETAIL = $("#asideDetail");
            SearchInput = $("#searchInput", PANEL_ACCOUNTS);
            $("header a", c).live("click", a);
            c.live("click", function (j) {
                j.preventDefault();
                targetElement = $(j.target);
                targetElement.is("aside") && TD.ui.sidePanel.hideSidePanel()
            })
        };
        b.showSidePanel = function () {
            g.addClass("active").bind("click", function () {
                b.hideSidePanel()
            });
            if (!d.hasClass("sidePanelState")) {
                d.addClass("sidePanelState");
                c.css("left", "0");
                c.removeClass().addClass("active")
            }
            TD.ui.startup.hideInfoBubbles("up")
        };
        b.hideSidePanel = function () {
            $("body").removeClass("sidePanelState");
            g.removeClass("active");
            g.unbind("click");
            c.removeClass("active");
            c.hasClass("expand") && b.contractSidePanel();
            c.css("left", -402);
            PANEL_DETAIL.html("");
            TD.ui.startup.hideInfoBubbles("down")
        };
        b.expandSidePanel = function () {
            c.addClass("expand");
            c.css("width", 656)
        };
        b.contractSidePanel = function () {
            c.removeClass("expand");
            c.css({
                width: 327
            });
            TD.ui.accounts.clearTempColumn();
            e.find(".acc-section ul li").removeClass("active")
        };
        b.showProfile = function () {
            PANEL_PROFILE.show();
            PANEL_ACCOUNTS.hide();
            TD.ui.sidePanel.showSidePanel()
        };
        return b
    }();
    TD.ui.accounts = function () {
        function a(U) {
            for (var Q = TD.storage.store.accountStore.getAll(), l = [], ka = 0; ka < Q.length; ka++) l.push({
                account: Q[ka],
                columnDescs: TD.controller.auth.create(Q[ka].type, Q[ka]).getColumnDescriptors()
            });
            U(l)
        }
        function b(U) {
            G && clearTimeout(G);
            if (U.which != 13) G = setTimeout(j, I);
            clearBtn.addClass("inputFilled")
        }
        function d(U) {
            G && clearTimeout(G);
            if (U.keyCode == 13) {
                j();
                return false
            } else G = setTimeout(j, I)
        }
        function c(U) {
            U.preventDefault();
            targetElement = $(U.currentTarget);
            action = targetElement.attr("rel");
            switch (action) {
            case "trends":
                TD.ui.trends.showTrends();
                break;
            case "options":
                x.accountObject = $(U.target).closest("a")[0];
                var Q = TD.ui.template.render("menus/account_menu", {});
                TD.ui.popover.show($(U.target), {
                    timedelay: 100,
                    position: "top"
                }, Q);
                break;
            case "addcolumn":
                g(U);
                break;
            case "addSearchColumn":
                u(U);
                $("#searchInput").focus();
                na = $("li.active a", accountsHolder).data("type");
                PANEL_DETAIL.html("");
                o();
                j();
                break;
            case "syncTDAccount":
                td_acct = TD.storage.store.get("tweetdeck_account");
                TDSync.loginTweetdeck(td_acct.email, td_acct.cleartext_password, TDSync.addAccounts);
                break;
            case "addAccountMenu":
                Q = TD.ui.template.render("menus/accountadd_menu", {
                    addAccountTypes: V
                });
                TD.ui.popover.show($(U.target), {
                    timedelay: 0,
                    position: "bottom"
                }, Q);
                TD.ui.startup.hideInfoBubbles("down");
                break;
            case "addAccount":
                TD.controller.clients.addClient(U.target.attributes["data-account"].value);
                break;
            case "removeAccount":
                U = {};
                U.title = TD.util.i18n.getMessage("remove_account_title");
                U.desc = TD.util.i18n.getMessage("remove_account_blurb", $(".acc-header.active h3").text());
                U.okLabel = TD.util.i18n.getMessage("modal_dialog_remove");
                U.cancelLabel = TD.util.i18n.getMessage("cancel");
                U = TD.ui.template.render("menus/modal_dialogue", {
                    content: U
                });
                TD.ui.main.showModalWindow(U, null, 415, null, null, false, e);
                break;
            case "addTempColumn":
                for (U = 0; U < J.feeds.length; U++) J.feeds[U].isTemp = false;
                TD.ui.columns.addColumnToUI(J);
                J = null;
                TD.ui.sidePanel.hideSidePanel();
                break;
            case "clearForm":
                $("#searchInput").val("");
                $("#searchInput").focus();
                x.clearTempColumn();
                o();
                break;
            case "setDefaultAccount":
                TD.storage.store.accountStore.setDefault(U.currentTarget.attributes["data-key"].value);
                $("a[rel='setDefaultAccount']", C).removeClass("default");
                targetElement.addClass("default");
                break;
            case "allLists":
                targetElement.next("ul").removeClass("hide");
                targetElement.remove();
                break;
            case "trendLocations":
                TD.ui.trends.showTrendLocations(targetElement)
            }
        }
        function e(U) {
            event.preventDefault();
            switch (U.attr("rel")) {
            case "ok":
                TD.controller.clients.removeClient($(".acc-header.active").data("key"));
                TD.ui.main.hideModalWindow();
                break;
            case "cancel":
                TD.ui.main.hideModalWindow()
            }
        }
        function g(U) {
            u(U);
            TD.ui.sidePanel.expandSidePanel();
            x.clearTempColumn();
            J = TD.ui.columns.makeColumn(U);
            U = TD.ui.template.render("sidepanel/detail", {
                column: J,
                isSearch: false
            });
            PANEL_DETAIL.html(U);
            $.browser.webkit || $(".scroller", PANEL_DETAIL).tdScroller();
            TD.controller.scheduler.addColumn(J, true)
        }
        function j() {
            var U = $("#searchInput").val();
            switch (na) {
            case "tweets":
                p(U);
                break;
            case "people":
                n(U)
            }
        }
        function n(U) {
            var Q, l;
            if (U) {
                r(false);
                Q = TD.ui.template.render("sidepanel/simple_detail", {
                    title: TD.util.escape(U),
                    isTrend: false
                });
                PANEL_DETAIL.html(Q);
                if (U) {
                    Q = TD.controller.clients.getClientsByService("twitter");
                    if (Q.length > 0) {
                        l = Q[0];
                        TD.ui.sidePanel.expandSidePanel();
                        l.userSearch(U, function (ka) {
                            s();
                            if (ka.length !== 0) {
                                ka = l.renderUser(ka);
                                $(".scroll-content", PANEL_DETAIL).html(ka)
                            }
                        }, function () {
                            s();
                            console.error("Error getting user search")
                        })
                    }
                }
            }
        }
        function p(U, Q) {
            var l, ka, ta;
            if (U) {
                G = null;
                l = TD.storage.store.accountStore.getAll();
                for (ta = 0; ta < l.length; ta++) if (l[ta].type == "twitter") {
                    ka = l[ta];
                    break
                }
                r(true);
                if (ka) {
                    TD.ui.sidePanel.expandSidePanel();
                    J && TD.controller.scheduler.removeColumn(J.key);
                    Q = Q || TD.util.i18n.getMessage("search") + ": " + U;
                    J = TD.storage.store.columnStore.makeColumnAndFeed(TD.util.escape(Q), "search", ka.type, ka.key, {
                        term: U
                    });
                    J.init();
                    l = TD.ui.template.render("sidepanel/detail", {
                        column: J,
                        isSearch: true
                    });
                    PANEL_DETAIL.html(l);
                    $.browser.webkit || $(".scroller", PANEL_DETAIL).tdScroller();
                    TD.controller.scheduler.addColumn(J, true)
                } else TD.ui.sidePanel.contractSidePanel()
            }
        }
        function o() {
            var U = TD.ui.template.render("sidepanel/simple_detail", {
                title: TD.util.i18n.getMessage("search_noresult"),
                isTrend: false
            });
            PANEL_DETAIL.html(U)
        }

        function r(U) {
            if ($("#searchForm").length) {
                clearBtn.removeClass("inputFilled").addClass("inputSearching");
                U && setTimeout(s, 1500)
            }
        }
        function s() {
            clearBtn.removeClass("inputSearching").addClass("inputFilled")
        }
        function u(U) {
            $("li", Y).removeClass("active");
            U = $(U.target);
            if (U.tagName !== "li") U = U.closest("li");
            U.addClass("active")
        }
        var x = {},
            y, I = 1E3,
            G, J, V, C = $("aside #accounts"),
            Y = $("aside");
        $("aside");
        var na;
        x.init = function () {
            accountsHolder = $("#accounts");
            $("a", accountsHolder).live("click", c);
            $("a.actionButton", PANEL_DETAIL).live("click", c);
            SearchInput.live("keypress", d);
            SearchInput.live("keyup", b)
        };
        x.showAccounts = function (U) {
            PANEL_ACCOUNTS.show();
            PANEL_PROFILE.hide();
            TD.ui.sidePanel.showSidePanel();
            a(function (Q) {
                V = {
                    twitter: true,
                    facebook: true,
                    foursquare: true,
                    buzz: true
                };
                var l = Q.length,
                    ka;
                for (ka = 0; ka < l; ka++) delete V[Q[ka].account.type];
                V.twitter = true;
                y = TD.ui.template.render("sidepanel/add_column", {
                    accountColumns: Q
                });
                C.html(y);
                $.browser.webkit || $(".scroller", C).tdScroller();
                $("#accountsHolder").tdAccordion()
            });
            searchForm = $("#searchForm");
            clearBtn = $(".inputAction", searchForm);
            U && $("#searchForm").click()
        };
        x.handleAccountOptionsMenu = function (U, Q) {
            switch (Q) {
            case "addAccount":
                var l = U.attr("data-account");
                TD.controller.clients.addClient(l)
            }
        };
        x.clearTempColumn = function () {
            J && TD.controller.scheduler.removeColumn(J.key)
        };
        x.showSearch = function (U) {
            TD.ui.accounts.showAccounts(true);
            $("#searchInput").val(U).focus();
            na = "tweets";
            p(U)
        };
        x.showUserSearch = function (U) {
            TD.ui.accounts.showAccounts();
            $("#searchInput").val(U).click();
            $("a[rel='addSearchColumn'][data-type='people']").click()
        };
        x.showTempSearchColumn = function (U, Q, l) {
            u(U);
            p(Q, l)
        };
        x.addDetailTempColumn = function (U) {
            g(U)
        };
        return x
    }();
    TD.ui.profile = function () {
        function a() {
            TD.ui.sidePanel.expandSidePanel();
            u.html(TD.ui.template.render("spinner", {}))
        }
        function b() {
            if (o.id == o.account.userId) y.text(TD.util.i18n.getMessage("follow_btn_you"));
            else if (o.following) {
                r ? y.text(TD.util.i18n.getMessage("folow_btn_recip")) : y.text(TD.util.i18n.getMessage("folow_btn_out"));
                y.removeClass(I).addClass(G)
            } else {
                r ? y.text(TD.util.i18n.getMessage("folow_btn_in")) : y.text(TD.util.i18n.getMessage("follow"));
                y.removeClass(G).addClass(I)
            }
        }
        function d() {
            if (o.id == o.account.userId) y.text(TD.util.i18n.getMessage("folow_btn_awesome"));
            else if (o.following) {
                y.text(TD.util.i18n.getMessage("unfollow"));
                y.removeClass(I).addClass(G)
            } else {
                y.text(TD.util.i18n.getMessage("follow"));
                y.removeClass(G).addClass(I)
            }
        }
        function c() {
            if (o.id != o.account.userId) o.following ? x.unfollowUser(o.screenName, function () {
                o.following = false;
                b()
            }) : x.followUser(o.screenName, function () {
                o.following = true;
                b()
            })
        }
        function e(J) {
            n = [];
            p = [];
            J.publicLists(function (V) {
                for (var C = {}, Y = V.length; Y--;) V[Y].user.id == J.id ? n.push(V[Y]) : p.push(V[Y]);
                C.ownLists = n;
                C.followLists = p;
                C.screenName = J.screenName;
                V = x.renderProfileShortlist(C);
                $("#userLists").html(V)
            })
        }
        function g() {
            o.id != o.account.userId && x.friendshipExists(o.id, o.account.userId, function (J) {
                r = J;
                b()
            })
        }
        var j = {},
            n, p, o, r, s, u, x, y, I = "button-gofollow",
            G = "button-norm";
        j.init = function () {
            s = $("#profile");
            u = $("#asideDetail");
            $("aside div.holder");
            $("#profile a").live("click", function (J) {
                J.preventDefault();
                var V = $(J.currentTarget),
                    C = V.attr("rel");
                C || (C = V.data("type"));
                switch (C) {
                case "more":
                    V = TD.ui.template.render("menus/twitter_profile", {
                        user: o
                    });
                    TD.ui.popover.show($(J.target), {
                        timedelay: 0,
                        position: "top"
                    }, V);
                    break;
                case "list":
                    TD.ui.accounts.addDetailTempColumn(J);
                    break;
                case "navPrevious":
                    TD.ui.accounts.showAccounts();
                    break;
                case "usertweets":
                    a();
                    TD.ui.accounts.addDetailTempColumn(J);
                    break;
                case "mentions":
                    a();
                    TD.ui.accounts.showTempSearchColumn(J, "@" + o.screenName, o.screenName + " " + TD.util.i18n.getMessage("mentions"));
                    break;
                case "favorites":
                    a();
                    TD.ui.accounts.addDetailTempColumn(J);
                    break;
                case "closePanel":
                    TD.ui.sidePanel.hideSidePanel();
                    break;
                case "user":
                    TD.ui.profile.showProfile(null, V.attr("href"));
                    break;
                case "url":
                case "urlImg":
                    window.open(V.attr("href")).focus()
                }
            })
        };
        j.showProfile = function (J, V) {
            var C;
            if (V) {
                if (_.startsWith(V, "http")) {
                    C = V.split("/");
                    V = C[C.length - 1]
                }
                if (!J || J.dataService != "twitter" || !J.dataKey) {
                    C = TD.controller.clients.getClientsByService("twitter");
                    if (C.length > 0) x = C[0];
                    else return false
                } else x = TD.controller.clients.getClient(J.dataKey);
                TD.ui.sidePanel.showProfile();
                s.html(TD.ui.template.render("spinner", {}));
                x.showUser(V, function (Y) {
                    var na;
                    o = Y;
                    r = false;
                    na = x.renderProfile(Y);
                    s.html(na);
                    y = $("#twitterProfileFollowButton");
                    y.mouseenter(d);
                    y.mouseleave(b);
                    y.click(c);
                    b();
                    e(Y);
                    g(Y)
                });
                return true
            }
        };
        j.handleProfileOptionsMenu = function (J, V) {
            var C = x.oauth.account.key;
            switch (V) {
            case "dm":
                TD.ui.compose.directMessage(o, C);
                break;
            case "mention":
                TD.ui.compose.showReply(null, null, o.screenName, null, null, C);
                break;
            case "block":
                o.block();
                break;
            case "reportSpam":
                o.reportSpam()
            }
        };
        return j
    }();
    TD.ui.trends = function () {
        var a = {},
            b = $("#asideDetail"),
            d = function (c) {
                function e(r) {
                    var s, u = new Date;
                    TD.ui.sidePanel.expandSidePanel();
                    TD.controller.progressIndicator.taskComplete(o);
                    if (r.trends.length) {
                        s = {
                            title: TD.util.i18n.getMessage("search_trends"),
                            isTrend: true,
                            location: r.locations[0]
                        };
                        s = TD.ui.template.render("sidepanel/simple_detail", s);
                        b.html(s);
                        $.browser.webkit || $(".scroller", b).tdScroller();
                        s = p.renderTrends(r.trends);
                        $(".scroll-content", b).html(s);
                        if (j) {
                            a.currentWoeid = c;
                            TD.storage.store.set(":LAST_VIEWED_TRENDS", {
                                date: u,
                                trends: r
                            });
                            a.lastViewedSet = {
                                date: u,
                                trends: r
                            };
                            j = false
                        }
                    }
                }
                function g() {
                    TD.controller.progressIndicator.taskFailed(o);
                    console.error("Error getting user search")
                }
                var j = false,
                    n, p, o;
                n = TD.controller.clients.getClientsByService("twitter");
                if (n.length > 0) {
                    p = n[0];
                    a.lastViewedSet = TD.storage.store.get(":LAST_VIEWED_TRENDS");
                    if ($.isEmptyObject(a.lastViewedSet.trends)) {
                        j = true;
                        c = 1
                    } else {
                        n = (new Date(a.lastViewedSet.date)).getTime();
                        n = (new Date).getTime() - n;
                        if (n > 6E5 || c !== a.currentWoeid) j = true;
                        if (typeof c == "undefined") c = a.lastViewedSet.trends.locations[0].woeid
                    }
                    o = TD.controller.progressIndicator.addTask(TD.util.i18n.getMessage("pi_searching"));
                    if (j) {
                        $(".scroll-content", b).html(TD.ui.template.render("spinner"));
                        p.getTrends(c, e, g)
                    } else e(a.lastViewedSet.trends)
                }
            };
        a.fetchTrendDetail = function (c) {
            var e = $("section", c.element),
                g;
            c = a.lastViewedSet.trends.locations[0].woeid;
            e.is(":visible") ? e.parent(".trend").removeClass("active") : e.parent(".trend").addClass("active");
            e.toggle();
            if (e.children().length === 0) {
                g = TD.ui.template.render("spinner");
                e.html(g);
                g = e.data("query");
                TD.services.wtt.getTrends(g, c, function (j) {
                    j = TD.ui.template.render("status/trend_detail", {
                        trend: j
                    });
                    e.html(j)
                }, function (j) {
                    j = TD.ui.template.render("status/trend_detail", {
                        trend: j
                    });
                    e.html(j)
                })
            }
        };
        a.showTrends = function (c) {
            d(c)
        };
        a.selectTrendLocation = function (c) {
            (c = $(c).data("woeid")) && a.showTrends(c)
        };
        a.showTrendLocations = function (c) {
            function e(o) {
                var r;
                if (o.length) {
                    r = TD.ui.template.render("sidepanel/trend_loc_list", {
                        locations: o
                    });
                    TD.ui.popover.show(c, {
                        timedelay: 0,
                        position: "top_left"
                    }, r);
                    r = new Date;
                    TD.storage.store.set(":TREND_LOCATIONS", {
                        date: r,
                        locations: o
                    });
                    return o
                }
            }
            function g(o) {
                console.error(o)
            }
            var j, n, p;
            a.trendLocations = TD.storage.store.get(":TREND_LOCATIONS");
            if ($.isEmptyObject(a.trendLocations.locations)) {
                n = TD.storage.store.accountStore.getAll();
                for (p = 0; p < n.length; p++) if (n[p].type == "twitter") {
                    j = n[p];
                    break
                }
                j = TD.controller.clients.getClient(j.key);
                j.getTrendLocations(e, g)
            } else e(a.trendLocations.locations)
        };
        return a
    }();
    var jQuery;
    TD.net.ajax = function () {
        var a = {},
            b = function (e, g, j, n, p, o) {
                e = {
                    url: g,
                    global: false,
                    type: e,
                    success: function (r, s, u) {
                        r || console.log('WARNING: call to "' + g + '" returned no data');
                        p && p(r, s, u)
                    },
                    error: function (r, s, u) {
                        o && o(r, s, u)
                    },
                    beforeSend: function (r) {
                        if (j) for (var s in j) j.hasOwnProperty(s) && s.toLowerCase() !== "content-type" && r.setRequestHeader(s, j[s])
                    },
                    dataType: "text json"
                };
                if (n) e.data = n;
                if (j["Content-Type"]) e.contentType = j["Content-Type"];
                jQuery.ajax(e)
            },
            d = window.location.href;
        a.HOST_BASE_URL = _.contains(d, "d.tweetdeck.com") ? "http://d.tweetdeck.com/" : _.contains(d, "localhost:8090") ? "http://localhost:8090/" : _.contains(d, "d.tweetdeck.dev:8090") ? "http://d.tweetdeck.dev:8090/" : "https://api.tweetdeck.com/";
        var c = function (e, g, j, n, p, o) {
                var r = a.HOST_BASE_URL;
                if (_.startsWith(g, a.HOST_BASE_URL)) r = g;
                else r += j && j["x-td-oauth-key"] !== undefined ? "oauth/sign/" + j["x-td-oauth-service"] + "/" + encodeURIComponent(g) : "proxy/" + encodeURIComponent(g);
                b(e, r, j, n, p, o)
            };
        a.bounce = function (e, g, j, n, p) {
            var o = j && j.method || "GET",
                r = j && j.parameters || {},
                s = j && j.body || null,
                u = j && j.headers || {},
                x = j = "";
            if (r) {
                var y = [],
                    I;
                for (I in r) y.push(I + "=" + encodeURIComponent(r[I]));
                if (y.length) {
                    x = e.indexOf("?");
                    if (x == -1) j = "?";
                    else if (x != e.length - 1) j = "&";
                    e += j + y.join("&")
                }
            }
            if (n) {
                u["x-td-oauth-key"] = n.oauth_token;
                u["x-td-oauth-secret"] = n.token_secret;
                u["x-td-oauth-service"] = n.type
            }
            n = function (G) {
                var J = G.headers || {};
                if (u && u["Content-Type"]) J["Content-Type"] = u["Content-Type"];
                b(o, G.url, J, G.body, g, p)
            };
            o === "GET" ? c(o, e, u, s, g, p) : c(o, e, u, s, n, p)
        };
        a.proxy = function (e, g, j, n, p) {
            var o = j && j.method || "GET",
                r = j && j.parameters || {},
                s = j && j.body || null;
            j = j && j.headers || {};
            if (r) {
                var u = [],
                    x;
                for (x in r) u.push(x + "=" + encodeURIComponent(r[x]));
                if (u.length) e += (e.indexOf("?") >= 0 ? "" : "?") + u.join("&")
            }
            if (n) {
                j["x-td-oauth-key"] = n.oauth_token;
                j["x-td-oauth-secret"] = n.token_secret;
                j["x-td-oauth-service"] = n.type
            }
            n = a.HOST_BASE_URL;
            n += "oauth/proxy/" + j["x-td-oauth-service"] + "/";
            n += encodeURIComponent(e);
            b(o, n, j, s, g, p)
        };
        a.request = function (e, g, j) {
            var n = e && e.url,
                p = e && e.method || "GET",
                o = e && e.params || {},
                r = e && e.body || null;
            e = e && e.headers || {};
            if (!n) throw {
                name: "TypeError",
                message: '"url" argument not provided'
            };
            if (o) {
                var s = [],
                    u;
                for (u in o) s.push(u + "=" + encodeURIComponent(o[u]));
                if (s.length) n += "?" + s.join("&")
            }
            b(p, n, e, r, g, j)
        };
        a.jsonp = function (e, g, j, n) {
            $.ajax({
                url: e,
                data: g,
                dataType: "jsonp",
                success: j,
                error: n,
                timeout: 1E4
            })
        };
        return a
    }();
    TD.net.util = function () {
        var a = {};
        a.addURLParam = function (b, d, c) {
            var e = b.indexOf("?") >= 0 ? "&" : "?";
            return b + e + encodeURIComponent(d) + "=" + encodeURIComponent(c)
        };
        a.formDecode = function (b) {
            b = b.split("&");
            for (var d = {}, c = 0, e; e = b[c]; c++) {
                e = e.split("=");
                if (e.length == 2) d[decodeURIComponent(e[0])] = decodeURIComponent(e[1])
            }
            return d
        };
        a.decodeURL = function (b) {
            var d = b.split("?");
            if (d.length > 1) return a.formDecode(d[1]);
            return b
        };
        a.formEncode = function (b) {
            var d = [],
                c;
            for (c in b) d.push(c + "=" + encodeURIComponent(b[c]));
            return d.join("&")
        };
        a.getQueryStringParams = function () {
            var b = window.location.href.split("?");
            if (b.length >= 2) return this.formDecode(b.slice(1).join("?"));
            return {}
        };
        a.urlencode = function (b) {
            var d = [],
                c, e;
            for (e in b) {
                c = e + "=" + encodeURIComponent(b[e]);
                d.push(c)
            }
            return d.join("&")
        };
        return a
    }();
    TD.net.fileUpload = function () {
        var a = {},
            b = ["jpg", "jpeg", "gif", "png"],
            d = ["3gp", "3g2", "asf", "asx", "avi", "flv", "m4v", "mkv", "mov", "mp2", "mp4", "mpg", "mpeg", "ogv", "qt", "wmv"];
        a.uploadFile = function (c, e, g, j) {
            var n = function (r) {
                    var s = new XMLHttpRequest;
                    s.open("POST", "https://yfrog.com/api/xauth_upload");
                    s.setRequestHeader("X-Auth-Service-Provider", "https://api.twitter.com/1/account/verify_credentials.xml");
                    s.setRequestHeader("X-Verify-Credentials-Authorization", r.headers.Authorization);
                    r = new FormData;
                    r.append("key", "TYXZVR7He14dd1b1c27b0e95911e5c2fd5363984");
                    r.append("source", "TweetDeck");
                    r.append("media", c);
                    s.send(r);
                    s.onreadystatechange = function () {
                        if (s.readyState == 4) {
                            if (s.status == 200) {
                                var u;
                                u = s.responseText;
                                if (window.DOMParser) {
                                    parser = new DOMParser;
                                    xmlDoc = parser.parseFromString(u, "text/xml")
                                } else {
                                    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                                    xmlDoc.async = "false";
                                    xmlDoc.loadXML(u)
                                }
                                u = xmlDoc.getElementsByTagName("rsp")[0].getAttribute("stat") == "ok" ? xmlDoc.getElementsByTagName("mediaurl")[0].firstChild.nodeValue : void 0;
                                if (u) {
                                    g(u);
                                    return
                                }
                            }
                            j && j()
                        }
                    }
                },
                p = function (r) {
                    var s = new XMLHttpRequest;
                    s.open("POST", "http://im.twitvid.com/api/upload ");
                    var u = new FormData;
                    u.append("x_auth_service_provider", "https://api.twitter.com/1/account/verify_credentials.xml");
                    u.append("x_verify_credentials_authorization", r.headers.Authorization);
                    u.append("source", "TweetDeck");
                    u.append("format", "json");
                    u.append("media", c);
                    s.send(u);
                    s.onreadystatechange = function () {
                        if (s.readyState == 4 && s.status == 200) {
                            var x;
                            var y = s.responseText;
                            y = JSON.parse(y);
                            if (y.rsp.stat == "ok") x = y.rsp.media_url;
                            g(x)
                        } else s.readyState == 4 && j()
                    }
                };
            e = TD.controller.clients.getClient(e);
            var o = c.type.split("/")[1];
            if (_.include(b, o)) e.getOAuthEchoHeader(n);
            else _.include(d, o) ? e.getOAuthEchoHeader(p) : TD.ui.main.showInfoMessage("Cannot upload this file type", "error")
        };
        return a
    }();
    TD.buildID = "bad9b993a497d3a217683bd422287c73dbef2b6f";
    TD.version = "0.9.7.11";
    TD.env = "chrome";
    (function (a) {
        a.fn.tdAccordion = function (b) {
            b = a.extend({
                headerClass: ".acc-header-fix, .acc-header",
                headerTitle: "h3",
                triggerClass: ".accTrigger",
                sectionClass: ".acc-section",
                activeClass: "active",
                speed: 180
            }, b);
            return this.each(function () {
                var d = a(this),
                    c = a(b.headerClass, d),
                    e = a(b.sectionClass, d);
                a(b.triggerClass, this).live("click", {
                    toggleHeader: function (g) {
                        g.preventDefault();
                        var j = a(this).parent();
                        if (j.hasClass(b.activeClass)) {
                            if (!j.hasClass("acc-header-fix")) {
                                a("#asideDetail header.header-aside a[rel='closePanel']").trigger("click");
                                j.next().slideUp(b.speed, function () {
                                    j.removeClass(b.activeClass);
                                    d.trigger("content:change")
                                })
                            }
                        } else {
                            e.slideUp(b.speed);
                            c.removeClass(b.activeClass);
                            j.hasClass("header-locked") ? j.next().find("a:first").trigger("click") : j.next().slideDown(b.speed, function () {
                                j.next().find("a:first").trigger("click");
                                d.trigger("content:change")
                            });
                            j.addClass(b.activeClass)
                        }
                    }
                }.toggleHeader)
            })
        }
    })($);
    (function (a) {
        a.tdScroller = function (b, d) {
            var c = this;
            c.$el = a(b);
            c.el = b;
            var e, g, j, n, p, o, r, s, u, x, y = 0,
                I = false;
            c.$el.data("tdScroller", c);
            c.init = function () {
                var G = function (J) {
                        J < 0 || (c.options.direction == "v" ? e.css("top", J + "px") : e.css("left", J + "px"))
                    };
                c.options = a.extend({}, a.tdScroller.defaultOptions, d);
                c.options.direction == "v" ? c.$el.addClass("scroll-active scroll-v") : c.$el.addClass("scroll-active scroll-h");
                c.$el.bind("scroll", function () {
                    this.scrollTop = this.scrollLeft = 0
                });
                c.$el.css({
                    overflow: "hidden"
                });
                g = jQuery(document.createElement("div"));
                g.addClass("scroll-track");
                c.$el.append(g);
                e = jQuery(document.createElement("div"));
                e.addClass("scroll-thumb");
                c.$el.append(e);
                j = a(c.options.holderClass, c.$el);
                n = a(c.options.contentClass, c.$el);
                c.resizeScroller();
                jQuery(window).bind("resize", function () {
                    c.resizeScroller()
                });
                c.$el.bind("content:change", function () {
                    c.resizeScroller()
                });
                g.bind("click", function (J) {
                    if (c.options.direction == "v") {
                        J = J.clientY;
                        J -= e.height() * 2;
                        J /= c.$el.height();
                        j.scrollTop(p * J)
                    } else {
                        J = J.clientX;
                        J -= e.width() * 2;
                        J /= c.$el.width();
                        j.scrollLeft(o * J)
                    }
                });
                j.bind("scroll", function () {
                    var J;
                    if (c.options.direction == "v") {
                        J = j.scrollTop() / p;
                        J = Math.ceil(J * r)
                    } else {
                        J = j.scrollLeft() / o;
                        J = Math.ceil(J * s)
                    }
                    G(J);
                    I || (y = J)
                });
                e.bind("mousedown", function (J) {
                    var V = jQuery(document),
                        C, Y, na, U;
                    I = true;
                    if (c.options.direction == "v") {
                        U = J.clientY;
                        Y = function (Q) {
                            C = Q.clientY - U + y;
                            contentPosition = C / c.$el.outerHeight();
                            j.scrollTop(p * contentPosition);
                            C = Math.min(C, r - u);
                            G(C)
                        }
                    } else {
                        na = J.clientX;
                        Y = function (Q) {
                            C = Q.clientX - na + y;
                            contentPosition = C / c.$el.outerWidth();
                            C = Math.min(C, s - x);
                            j.scrollLeft(o * contentPosition)
                        }
                    }
                    V.bind("mousemove", Y);
                    V.bind("mouseup", function () {
                        y = C;
                        V.unbind("mousemove", Y);
                        I = false
                    });
                    return false
                })
            };
            c.resizeScroller = function () {
                var G;
                if (c.options.direction == "v") {
                    p = n.outerHeight();
                    r = j.outerHeight();
                    G = r / p;
                    if (G > 1) {
                        c.$el.removeClass("scroll-active");
                        return
                    } else c.$el.addClass("scroll-active");
                    u = r * G;
                    G = j.scrollTop() / p;
                    G = Math.ceil(G * r);
                    e.css({
                        height: u,
                        top: G + "px"
                    })
                } else {
                    o = n.outerWidth();
                    s = j.outerWidth();
                    G = s / o;
                    if (G > 1) {
                        c.$el.removeClass("scroll-active");
                        return
                    } else c.$el.addClass("scroll-active");
                    x = s * G;
                    G = j.scrollLeft() / o;
                    G = Math.ceil(G * s);
                    e.css({
                        width: x,
                        left: G + "px"
                    })
                }
                y = G
            };
            c.init()
        };
        a.tdScroller.defaultOptions = {
            contentClass: ".scroll-content",
            holderClass: ".scroll-pane",
            direction: "v"
        };
        a.fn.tdScroller = function (b) {
            return this.each(function () {
                new a.tdScroller(this, b)
            })
        }
    })(jQuery);
    (function (a) {
        a.embedly = a.embedly || {};
        if (!a.embedly.version) {
            a.embedly.version = "2.0.0";
            a.extend({
                embedly: function (b, d, c) {
                    var e = [],
                        g = {
                            maxWidth: null,
                            maxHeight: null,
                            wmode: "opaque",
                            method: "replace",
                            addImageStyles: true,
                            wrapElement: "div",
                            className: "embed",
                            urlRe: null,
                            key: null,
                            elems: [],
                            success: null
                        },
                        j;
                    j = typeof d != "undefined" ? a.extend(g, d) : g;
                    if (typeof b == "string") b = Array(b);
                    if (typeof c != "undefined") j.success = c;
                    if (j.success == null) j.success = function (p, o) {
                        var r, s = a(o.node);
                        if (!p) return null;
                        if ((r = j.method) === "replace") return s.replaceWith(p.code);
                        else if (r === "after") return s.after(p.code);
                        else if (r === "afterParent") return s.parent().after(p.code)
                    };
                    var n = function (p) {
                            p = "urls=" + p;
                            if (j.maxWidth != null) p += "&maxwidth=" + j.maxWidth;
                            else if (typeof dimensions != "undefined") p += "&maxwidth=" + dimensions.width;
                            if (j.maxHeight != null) p += "&maxheight=" + j.maxHeight;
                            p += "&wmode=" + j.wmode;
                            if (typeof j.key == "string") p += "&key=" + j.key;
                            return p
                        };
                    d = function (p) {
                        var o;
                        o = a.map(p, function (r, s) {
                            if (s == 0) if (r.node !== null) node = a(r.node);
                            return encodeURIComponent(r.url)
                        }).join(",");
                        a.ajax({
                            url: typeof j.key == "string" ? "http://pro.embedly.com/1/oembed" : "http://api.embed.ly/1/oembed",
                            dataType: "jsonp",
                            data: n(o),
                            success: function (r) {
                                return a.each(r, function (s, u) {
                                    var x;
                                    if (u.type != "error") {
                                        x = p[s];
                                        var y, I;
                                        if ((y = u.type) === "photo") {
                                            I = u.title || "";
                                            y = [];
                                            if (j.addImageStyles) {
                                                if (j.maxWidth) {
                                                    units = typeof j.maxHeight == "number" ? "px" : "";
                                                    y.push("max-width: " + j.maxWidth + units)
                                                }
                                                if (j.maxHeight) {
                                                    units = typeof j.maxHeight == "number" ? "px" : "";
                                                    y.push("max-height: " + j.maxHeight + units)
                                                }
                                            }
                                            y = y.join(";");
                                            y = "<a href='" + x.url + "' target='_blank'><img style='" + y + "' src='" + u.url + "' alt='" + I + "' /></a>"
                                        } else if (y === "video") y = u.html;
                                        else if (y === "rich") y = u.html;
                                        else {
                                            I = u.title || x.url;
                                            thumb = u.thumbnail_url ? '<img src="' + u.thumbnail_url + '" class="thumb" />' : "";
                                            description = u.description;
                                            provider = u.provider_name ? '<a href="' + u.provider_url + '" class="provider">' + u.provider_name + "</a> - " : "";
                                            y = thumb + "<a href='" + x.url + "'>" + I + "</a>";
                                            y += provider;
                                            y += description
                                        }
                                        if (j.wrapElement) y = "<" + j.wrapElement + ' class="' + j.className + '">' + y + "</" + j.wrapElement + ">";
                                        u.code = y;
                                        typeof x.node != "undefined" && a(x.node).data("oembed", u).trigger("embedly-oembed", [u]);
                                        x = j.success(u, x)
                                    } else x = null;
                                    return x
                                })
                            }
                        })
                    };
                    a.each(b, function (p, o) {
                        node = typeof j.elems !== "undefined" ? j.elems[p] : null;
                        if (typeof node != "undefined" && !(o.match(j.urlRe) !== null || j.key)) a(node).data("oembed", false);
                        return o && (o.match(j.urlRe) !== null || j.key) ? e.push({
                            url: o,
                            node: node
                        }) : null
                    });
                    b = [];
                    c = e.length;
                    for (i = 0; 0 <= c ? i < c : i > c; i += 20) b = b.concat(d(e.slice(i, i + 20)));
                    return j.elems ? j.elems : this
                }
            })
        }
    })($);
    if (!this.JSON) this.JSON = {};
    (function () {
        function a(o) {
            return o < 10 ? "0" + o : o
        }
        function b(o) {
            e.lastIndex = 0;
            return e.test(o) ? '"' + o.replace(e, function (r) {
                var s = n[r];
                return typeof s === "string" ? s : "\\u" + ("0000" + r.charCodeAt(0).toString(16)).slice(-4)
            }) + '"' : '"' + o + '"'
        }
        function d(o, r) {
            var s, u, x, y, I = g,
                G, J = r[o];
            if (J && typeof J === "object" && typeof J.toJSON === "function") J = J.toJSON(o);
            if (typeof p === "function") J = p.call(r, o, J);
            switch (typeof J) {
            case "string":
                return b(J);
            case "number":
                return isFinite(J) ? String(J) : "null";
            case "boolean":
            case "null":
                return String(J);
            case "object":
                if (!J) return "null";
                g += j;
                G = [];
                if (Object.prototype.toString.apply(J) === "[object Array]") {
                    y = J.length;
                    for (s = 0; s < y; s += 1) G[s] = d(s, J) || "null";
                    x = G.length === 0 ? "[]" : g ? "[\n" + g + G.join(",\n" + g) + "\n" + I + "]" : "[" + G.join(",") + "]";
                    g = I;
                    return x
                }
                if (p && typeof p === "object") {
                    y = p.length;
                    for (s = 0; s < y; s += 1) {
                        u = p[s];
                        if (typeof u === "string") if (x = d(u, J)) G.push(b(u) + (g ? ": " : ":") + x)
                    }
                } else for (u in J) if (Object.hasOwnProperty.call(J, u)) if (x = d(u, J)) G.push(b(u) + (g ? ": " : ":") + x);
                x = G.length === 0 ? "{}" : g ? "{\n" + g + G.join(",\n" + g) + "\n" + I + "}" : "{" + G.join(",") + "}";
                g = I;
                return x
            }
        }
        if (typeof Date.prototype.toJSON !== "function") {
            Date.prototype.toJSON = function () {
                return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + a(this.getUTCMonth() + 1) + "-" + a(this.getUTCDate()) + "T" + a(this.getUTCHours()) + ":" + a(this.getUTCMinutes()) + ":" + a(this.getUTCSeconds()) + "Z" : null
            };
            String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function () {
                return this.valueOf()
            }
        }
        var c = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            e = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            g, j, n = {
                "\u0008": "\\b",
                "\t": "\\t",
                "\n": "\\n",
                "\u000c": "\\f",
                "\r": "\\r",
                '"': '\\"',
                "\\": "\\\\"
            },
            p;
        if (typeof JSON.stringify !== "function") JSON.stringify = function (o, r, s) {
            var u;
            j = g = "";
            if (typeof s === "number") for (u = 0; u < s; u += 1) j += " ";
            else if (typeof s === "string") j = s;
            if ((p = r) && typeof r !== "function" && (typeof r !== "object" || typeof r.length !== "number")) throw Error("JSON.stringify");
            return d("", {
                "": o
            })
        };
        if (typeof JSON.parse !== "function") JSON.parse = function (o, r) {
            function s(x, y) {
                var I, G, J = x[y];
                if (J && typeof J === "object") for (I in J) if (Object.hasOwnProperty.call(J, I)) {
                    G = s(J, I);
                    if (G !== undefined) J[I] = G;
                    else delete J[I]
                }
                return r.call(x, y, J)
            }
            var u;
            c.lastIndex = 0;
            if (c.test(o)) o = o.replace(c, function (x) {
                return "\\u" + ("0000" + x.charCodeAt(0).toString(16)).slice(-4)
            });
            if (/^[\],:{}\s]*$/.test(o.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
                u = eval("(" + o + ")");
                return typeof r === "function" ? s({
                    "": u
                }, "") : u
            }
            throw new SyntaxError("JSON.parse");
        }
    })();
    window.FB || (FB = {
        _apiKey: null,
        _session: null,
        _userStatus: "unknown",
        _logging: true,
        _inCanvas: window.location.search.indexOf("fb_sig_in_iframe=1") > -1 || window.location.search.indexOf("session=") > -1,
        _domain: {
            api: "https://api.facebook.com/",
            api_read: "https://api-read.facebook.com/",
            cdn: window.location.protocol == "https:" ? "https://s-static.ak.fbcdn.net/" : "http://static.ak.fbcdn.net/",
            graph: "https://graph.facebook.com/",
            staticfb: "http://static.ak.facebook.com/",
            www: window.location.protocol + "//www.facebook.com/"
        },
        _locale: null,
        _localeIsRtl: false,
        copy: function (a, b, d, c) {
            for (var e in b) if (d || typeof a[e] === "undefined") a[e] = c ? c(b[e]) : b[e];
            return a
        },
        create: function (a, b) {
            for (var d = window.FB, c = a ? a.split(".") : [], e = c.length, g = 0; g < e; g++) {
                var j = c[g],
                    n = d[j];
                if (!n) {
                    n = b && g + 1 == e ? b : {};
                    d[j] = n
                }
                d = n
            }
            return d
        },
        provide: function (a, b, d) {
            return FB.copy(typeof a == "string" ? FB.create(a) : a, b, d)
        },
        guid: function () {
            return "f" + (Math.random() * 1073741824).toString(16).replace(".", "")
        },
        log: function (a) {
            if (FB._logging) if (window.Debug && window.Debug.writeln) window.Debug.writeln(a);
            else window.console && window.console.log(a);
            FB.Event && FB.Event.fire("fb.log", a)
        },
        $: function (a) {
            return document.getElementById(a)
        }
    });
    FB.provide("", {
        api: function () {
            typeof arguments[0] === "string" ? FB.ApiServer.graph.apply(FB.ApiServer, arguments) : FB.ApiServer.rest.apply(FB.ApiServer, arguments)
        }
    });
    FB.provide("ApiServer", {
        METHODS: ["get", "post", "delete", "put"],
        _callbacks: {},
        _readOnlyCalls: {
            fql_query: true,
            fql_multiquery: true,
            friends_get: true,
            notifications_get: true,
            stream_get: true,
            users_getinfo: true
        },
        graph: function () {
            for (var a = Array.prototype.slice.call(arguments), b = a.shift(), d = a.shift(), c, e, g; d;) {
                var j = typeof d;
                if (j === "string" && !c) c = d.toLowerCase();
                else if (j === "function" && !g) g = d;
                else if (j === "object" && !e) e = d;
                else {
                    FB.log("Invalid argument passed to FB.api(): " + d);
                    return
                }
                d = a.shift()
            }
            c = c || "get";
            e = e || {};
            if (b[0] === "/") b = b.substr(1);
            FB.Array.indexOf(FB.ApiServer.METHODS, c) < 0 ? FB.log("Invalid method passed to FB.api(): " + c) : FB.ApiServer.oauthRequest("graph", b, c, e, g)
        },
        rest: function (a, b) {
            var d = a.method.toLowerCase().replace(".", "_");
            if (FB.Auth && d === "auth_revokeauthorization") {
                var c = b;
                b = function (e) {
                    e === true && FB.Auth.setSession(null, "notConnected");
                    c && c(e)
                }
            }
            a.format = "json-strings";
            a.api_key = FB._apiKey;
            FB.ApiServer.oauthRequest(FB.ApiServer._readOnlyCalls[d] ? "api_read" : "api", "restserver.php", "get", a, b)
        },
        oauthRequest: function (a, b, d, c, e) {
            if (FB._session && FB._session.access_token && !c.access_token) c.access_token = FB._session.access_token;
            c.sdk = "joey";
            try {
                FB.ApiServer.jsonp(a, b, d, FB.JSON.flatten(c), e)
            } catch (g) {
                if (FB.Flash.hasMinVersion()) FB.ApiServer.flash(a, b, d, FB.JSON.flatten(c), e);
                else throw Error("Flash is required for this API call.");
            }
        },
        jsonp: function (a, b, d, c, e) {
            var g = FB.guid(),
                j = document.createElement("script");
            if (a === "graph" && d !== "get") c.method = d;
            c.callback = "FB.ApiServer._callbacks." + g;
            a = FB._domain[a] + b + (b.indexOf("?") > -1 ? "&" : "?") + FB.QS.encode(c);
            if (a.length > 2E3) throw Error("JSONP only support a maximum of 2000 bytes of input.");
            FB.ApiServer._callbacks[g] = function (n) {
                e && e(n);
                delete FB.ApiServer._callbacks[g];
                j.parentNode.removeChild(j)
            };
            j.src = a;
            document.getElementsByTagName("head")[0].appendChild(j)
        },
        flash: function (a, b, d, c, e) {
            if (!window.FB_OnXdHttpResult) window.FB_OnXdHttpResult = function (g, j) {
                FB.ApiServer._callbacks[g](decodeURIComponent(j))
            };
            FB.Flash.onReady(function () {
                var g = FB._domain[a] + b,
                    j = FB.QS.encode(c);
                if (d === "get") if (g.length + j.length > 2E3) {
                    if (a === "graph") c.method = "get";
                    d = "post";
                    j = FB.QS.encode(c)
                } else {
                    g += (g.indexOf("?") > -1 ? "&" : "?") + j;
                    j = ""
                } else if (d !== "post") {
                    if (a === "graph") c.method = d;
                    d = "post";
                    j = FB.QS.encode(c)
                }
                var n = document.XdComm.sendXdHttpRequest(d.toUpperCase(), g, j, null);
                FB.ApiServer._callbacks[n] = function (p) {
                    e && e(FB.JSON.parse(p));
                    delete FB.ApiServer._callbacks[n]
                }
            })
        }
    });
    FB.provide("Content", {
        _root: null,
        _hiddenRoot: null,
        _callbacks: {},
        append: function (a, b) {
            if (!b) if (FB.Content._root) b = FB.Content._root;
            else if (FB.Content._root = b = FB.$("fb-root")) b.className += " fb_reset";
            else {
                FB.log('The "fb-root" div has not been created.');
                return
            }
            if (typeof a == "string") {
                var d = document.createElement("div");
                b.appendChild(d).innerHTML = a;
                return d
            } else return b.appendChild(a)
        },
        appendHidden: function (a) {
            if (!FB.Content._hiddenRoot) {
                var b = document.createElement("div"),
                    d = b.style;
                d.position = "absolute";
                d.top = "-10000px";
                d.width = d.height = 0;
                FB.Content._hiddenRoot = FB.Content.append(b)
            }
            return FB.Content.append(a, FB.Content._hiddenRoot)
        },
        insertIframe: function (a) {
            a.id = a.id || FB.guid();
            a.name = a.name || FB.guid();
            var b = FB.guid(),
                d = false,
                c = false;
            FB.Content._callbacks[b] = function () {
                if (d && !c) {
                    c = true;
                    a.onload && a.onload(a.root.firstChild)
                }
            };
            if (document.attachEvent) {
                var e = '<iframe id="' + a.id + '" name="' + a.name + '"' + (a.className ? ' class="' + a.className + '"' : "") + ' style="border:none;' + (a.width ? "width:" + a.width + "px;" : "") + (a.height ? "height:" + a.height + "px;" : "") + '" src="' + a.url + '" frameborder="0" scrolling="no" allowtransparency="true" onload="FB.Content._callbacks.' + b + '()"></iframe>';
                a.root.innerHTML = '<iframe src="javascript:false" frameborder="0" scrolling="no" style="height:1px"></iframe>';
                d = true;
                window.setTimeout(function () {
                    a.root.innerHTML = e
                }, 0)
            } else {
                var g = document.createElement("iframe");
                g.id = a.id;
                g.name = a.name;
                g.onload = FB.Content._callbacks[b];
                g.style.border = "none";
                g.style.overflow = "hidden";
                if (a.className) g.className = a.className;
                if (a.height) g.style.height = a.height + "px";
                if (a.width) g.style.width = a.width + "px";
                a.root.appendChild(g);
                d = true;
                g.src = a.url
            }
        },
        postTarget: function (a) {
            var b = document.createElement("form");
            b.action = a.url;
            b.target = a.target;
            b.method = "POST";
            FB.Content.appendHidden(b);
            FB.Array.forEach(a.params, function (d, c) {
                if (d !== null && d !== undefined) {
                    var e = document.createElement("input");
                    e.name = c;
                    e.value = d;
                    b.appendChild(e)
                }
            });
            b.submit();
            b.parentNode.removeChild(b)
        }
    });
    FB.provide("Flash", {
        _minVersions: [
            [9, 0, 159, 0],
            [10, 0, 22, 87]
        ],
        _swfPath: "swf/XdComm.swf",
        _callbacks: [],
        init: function () {
            if (!FB.Flash._init) {
                FB.Flash._init = true;
                window.FB_OnFlashXdCommReady = function () {
                    FB.Flash._ready = true;
                    for (var d = 0, c = FB.Flash._callbacks.length; d < c; d++) FB.Flash._callbacks[d]();
                    FB.Flash._callbacks = []
                };
                var a = !! document.attachEvent,
                    b = FB._domain.cdn + FB.Flash._swfPath;
                FB.Content.appendHidden('<object type="application/x-shockwave-flash" id="XdComm" ' + (a ? 'name="XdComm" ' : "") + (a ? "" : 'data="' + b + '" ') + (a ? 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ' : "") + 'allowscriptaccess="always"><param name="movie" value="' + b + '"></param><param name="allowscriptaccess" value="always"></param></object>')
            }
        },
        hasMinVersion: function () {
            if (typeof FB.Flash._hasMinVersion === "undefined") {
                var a, b, d = [];
                try {
                    a = (new ActiveXObject("ShockwaveFlash.ShockwaveFlash")).GetVariable("$version")
                } catch (c) {
                    if (navigator.mimeTypes.length > 0) if (navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin) a = (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]).description
                }
                if (a) {
                    var e = a.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1].split(",");
                    a = 0;
                    for (b = e.length; a < b; a++) d.push(parseInt(e[a], 10))
                }
                FB.Flash._hasMinVersion = false;
                a = 0;
                b = FB.Flash._minVersions.length;
                a: for (; a < b; a++) {
                    e = FB.Flash._minVersions[a];
                    if (e[0] == d[0]) for (var g = 1, j = e.length, n = d.length; g < j && g < n; g++) if (d[g] < e[g]) {
                        FB.Flash._hasMinVersion = false;
                        continue a
                    } else {
                        FB.Flash._hasMinVersion = true;
                        if (d[g] > e[g]) break a
                    }
                }
            }
            return FB.Flash._hasMinVersion
        },
        onReady: function (a) {
            FB.Flash.init();
            FB.Flash._ready ? window.setTimeout(a, 0) : FB.Flash._callbacks.push(a)
        }
    });
    FB.provide("JSON", {
        stringify: function (a) {
            return window.Prototype && Object.toJSON ? Object.toJSON(a) : JSON.stringify(a)
        },
        parse: function (a) {
            return JSON.parse(a)
        },
        flatten: function (a) {
            var b = {},
                d;
            for (d in a) if (a.hasOwnProperty(d)) {
                var c = a[d];
                null === c || undefined === c || (b[d] = typeof c == "string" ? c : FB.JSON.stringify(c))
            }
            return b
        }
    });
    FB.provide("QS", {
        encode: function (a, b, d) {
            b = b === undefined ? "&" : b;
            d = d === false ?
            function (e) {
                return e
            } : encodeURIComponent;
            var c = [];
            FB.Array.forEach(a, function (e, g) {
                e !== null && typeof e != "undefined" && c.push(d(g) + "=" + d(e))
            });
            c.sort();
            return c.join(b)
        },
        decode: function (a) {
            var b = decodeURIComponent,
                d = {};
            a = a.split("&");
            var c, e;
            for (c = 0; c < a.length; c++) if ((e = a[c].split("=", 2)) && e[0]) d[b(e[0])] = b(e[1]);
            return d
        }
    });
    FB.provide("Array", {
        indexOf: function (a, b) {
            if (a.indexOf) return a.indexOf(b);
            var d = a.length;
            if (d) for (var c = 0; c < d; c++) if (a[c] === b) return c;
            return -1
        },
        merge: function (a, b) {
            for (var d = 0; d < b.length; d++) FB.Array.indexOf(a, b[d]) < 0 && a.push(b[d]);
            return a
        },
        filter: function (a, b) {
            for (var d = [], c = 0; c < a.length; c++) b(a[c]) && d.push(a[c]);
            return d
        },
        keys: function (a, b) {
            var d = [],
                c;
            for (c in a) if (b || a.hasOwnProperty(c)) d.push(c);
            return d
        },
        map: function (a, b) {
            for (var d = [], c = 0; c < a.length; c++) d.push(b(a[c]));
            return d
        },
        forEach: function (a, b, d) {
            if (a) if (Object.prototype.toString.apply(a) === "[object Array]" || !(a instanceof Function) && typeof a.length == "number") if (a.forEach) a.forEach(b);
            else {
                d = 0;
                for (var c = a.length; d < c; d++) b(a[d], d, a)
            } else for (c in a) if (d || a.hasOwnProperty(c)) b(a[c], c, a)
        }
    });