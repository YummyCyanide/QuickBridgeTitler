(function () {
    var cs = new CSInterface();
    function $(id) { return document.getElementById(id); }
    var PRESETS = ["Rise & Fade", "Blur Fade In", "Scale Pop", "Tracking Expand", "Spin Drop",
        "Typewriter", "Slide & Skew", "Cinematic Zoom Out", "Soft Focus Rise", "Color Sweep... [E]", "Spin Pop",
        "Fade In", "Slide Up", "Drop In", "Slide In", "Zoom In", "Tracking Contract", "Word by Word",
        "Line by Line", "Word Pop", "Random Fade", "Rotate In", "Focus Pull",
        "Cascade Drop & Blur", "Accent Flash Reveal... [E]", "Skew Slide & Blur", "Tracking Blur Reveal", "Tilt Swing In",
        "Line Rise & Blur (by lines)", "Word Slide & Blur (by words)", "Word Drop Pop (by words)", "Line Slide & Skew (by lines)",
        "Squash & Stretch Pop", "Stamp Slam... [E]", "Flip In", "Word Flip In (by words)", "Elastic Rise... [E]",
        "Soft Bounce Drop... [E]", "Jelly Wobble... [E]", "Rubber Band... [E]", "Slide Overshoot... [E]", "Line Rise Overshoot (by lines)... [E]",
        "Word Pop In (by words)", "Random Tumble In", "Light Sweep... [E]", "Accent Slide Reveal... [E]", "Wipe Reveal... [E]", "Line Float In (by lines)",
        "Blur Slide Up", "Shrink In", "Tilt Rise", "Skew Rise", "Squeeze In", "Tilt Drop", "Twist Pop",
        "Word Blur In (by words)", "Word Rise & Fade (by words)", "Word Rotate In (by words)",
        "Line Zoom In (by lines)", "Line Skew In (by lines)", "Line Drop Blur (by lines)", "Random Blur In", "Random Pop In",
        "Slide In from Left"];
    var DIRECTIONS = ["Letters: Right to Left", "Letters: Left to Right", "Letters: Random",
        "Lines: Bottom to Top", "Lines: Top to Bottom", "Lines: Random",
        "Words: Random", "Words: Right to Left", "Words: Left to Right"];
    var INTERPS = ["Bezier (Easy Ease)", "Linear (Straight)", "Smooth (Ease Out)", "Fast to Slow Down", "Slow to Drive Up",
        "Super Fast to Slow", "Super Slow to Fast",
        "Easy Ease (even, AE default)", "Gentle Ease (Sine)", "Material Standard", "Cinematic (slow start, long settle)", "Strong Ease (Quart)", "Extreme Ease (Expo)",
        "Ease Out Soft", "Ease In Soft", "Snappy Settle"];
    var SAFE_WIDE = ["Shrink font size to fit", "Wrap into lines (keep size)", "Wrap into lines + justify (keep size)", "Tighten letter spacing, then shrink", "Leave as is (may go outside)"];
    var SAFE_TALL = ["Shrink font size to fit", "Leave as is (may go outside)"];
    var ALIGNS = ["Align to Left", "Align to Center", "Align to Right"];
    function oldAlign(id, v) { return (id === "align" && /^[3-6]$/.test(String(v))) ? ["0", "1", "2", "0"][parseInt(v, 10) - 3] : v; }
    var FONTS = null, FILTERED = [];
    var curFont = { label: "Arial Bold", family: "Arial", uiStyle: "BOLD", ps: "Arial-BoldMT" };
    var busy = false;
    var SLIDER_FILL = { dark: "#4098e3", light: "#4098e3" };
    var setSliderTheme = function () { };
    var SLIDER_T = { "default": 12, square: 12, squaresm: 8, round: 16, fill: 3, thin: 10, pill: 20, flat: 4, bar: 3, barthin: 3, orb: 16, grip: 16, dot: 14, hollow: 14, pillbar: 4, blockbar: 4, blockthin: 4 };
    var SEEK_T = { ring: 12, glow: 10, capsule: 12 };
    var setSeekTheme = function () { };
    var setSliderRandom = function () { };
    var paintSliders = function () { };
    var applyWindowTheme = function () { };
    var deselectPreset = function () { };
    var syncBatchStyle = function () { };
    var pvRender = function () { };
    var partColorFor = function (id) { return getColor(id); };
    var partApplyColor = function () { return false; };
    var partsExport = function () { return null; };
    var partsClear = function () { };
    var posLive = { clear: function () { }, sync: function () { } };
    var shpRender = function () { };
    var sceneRev = 0;
    var pinHostRefresh = function () {
        var host = $("pinHost"), k = host.children, i, any = false;
        for (i = 0; i < k.length; i++) {
            if (window.getComputedStyle(k[i]).display !== "none") {
                any = true;
            }
        }
        host.style.display = any ? "" : "none";
    };
    var posRender = function () { };
    var partsForJob = function () { return []; };
    var onNextName = function () { };
    var exLive = false, exHold = false, exLiveText = "";
    var batchLockOn = false;
    var batchRender = function () { };
    var exCapture = function () { };
    var exEnd = function () { };
    var qbBatch = { locked: function () { return false; }, add: function () { return false; } };
    var qbHub = { src: {}, refresh: function () { }, select: function () { }, flush: function () { } };
    var partsSnap = function () { return null; };
    var partsRestore = function () { };
    var UI_KEY = "qbt_ui_v1";
    var UI = { title: null, fill: null, sel: null,
        btn: "blue",
        titleShow: true, titlePos: "left",
        foldAlign: "center", modDotOn: true, modDotMode: "blink", blinkOn: false, blink: null,
        headStyle: "default",
        headWhole: false,
        accTabs: true,
        miniSecs: 30, notiPos: "bottom",
        btnPos: "default",
        batchBtn: "disable",
        batchLast: "replace",
        btnSize: "default",
        essBtns: false,
        tabsOn: true, tabStyle: "default",
        tabH: "default", tabAlign: "default",
        notiTheme: "default", optGap: "default", headTheme: "default", selBarTheme: "default", selNote: true, sliderTheme: "default", seekOn: false, seekTheme: "default", rndSlOn: false, rndSlMode: "fill",
        simple: false,
        secStyle: "default", secBorderOn: false, secBorder: null };
    var UI_DEF = {};
    (function copyUiDefaults() { var k; for (k in UI) {
        if (UI.hasOwnProperty(k)) {
            UI_DEF[k] = UI[k];
        }
    } })();
    (function loadUI() {
        var u = null, k;
        try {
            u = JSON.parse(localStorage.getItem(UI_KEY) || "null");
        }
        catch (e) {
            u = null;
        }
        if (!u) {
            return;
        }
        for (k in UI) {
            if (UI.hasOwnProperty(k) && u[k] !== undefined && u[k] !== null) {
                UI[k] = u[k];
            }
        }
    })();
    function saveUI() { try {
        localStorage.setItem(UI_KEY, JSON.stringify(UI));
    }
    catch (e) { } }
    function fireEvent(el, type) {
        var ev = document.createEvent("Event");
        ev.initEvent(type, true, true);
        el.dispatchEvent(ev);
    }
    function nodeRequire() {
        try {
            return window.cep_node ? window.cep_node.require : (typeof require === "function" ? require : null);
        }
        catch (e) {
            return null;
        }
    }
    function log(msg, cls) {
        var d = document.createElement("div");
        if (cls) {
            d.className = cls;
        }
        d.textContent = msg;
        $("status").appendChild(d);
        $("status").scrollTop = $("status").scrollHeight;
    }
    var NOTE_MS = UI.miniSecs * 1000, IDLE_TEXT = "Quick Bridge Titler", BATCH_TEXT = "Batch creator mode activated...", PART_TEXT = "Partial selection is active - changes apply to the selected text only...", partNoteOn = false, rollNoteText = "", noteTimer = null;
    function applySelNote() {
        var on = UI.selNote !== false, row = $("partRow"), btn = $("pvBtn"), pin = $("pvPin");
        if (!row || !btn || !pin) {
            return;
        }
        if (on) {
            row.style.display = "";
            if (btn.parentNode !== row) {
                row.appendChild(btn);
            }
        }
        else {
            row.style.display = "none";
            if (btn.parentNode !== pin.parentNode) {
                pin.parentNode.insertBefore(btn, pin);
            }
        }
        noteIdleRefresh();
    }
    function note(text, kind, sticky) {
        var bars = document.querySelectorAll(".nbar"), i, t = text || "", txt, k = kind || "work";
        clearTimeout(noteTimer);
        if (!t && exLive) {
            t = exLiveText;
            k = "live";
        }
        else if (!t && batchLockOn) {
            t = BATCH_TEXT;
            k = "batch";
        }
        else if (!t && partNoteOn && UI.selNote !== false) {
            t = PART_TEXT;
            k = "batch";
        }
        else if (!t && rollNoteText) {
            t = rollNoteText;
            k = "batch";
        }
        for (i = 0; i < bars.length; i++) {
            txt = bars[i].querySelector(".ntxt");
            if (txt) {
                txt.textContent = t || IDLE_TEXT;
            }
            bars[i].title = t || IDLE_TEXT;
            bars[i].className = t ? ("nbar " + k) : "nbar idle";
        }
        if (t && !sticky && (k === "ok" || k === "err")) {
            noteTimer = setTimeout(function () { note(""); }, NOTE_MS);
        }
    }
    function noteIdleRefresh() {
        var bar = document.querySelector(".nbar"), c = bar ? String(bar.className) : "nbar idle";
        if (c === "nbar idle" || c === "nbar batch" || c === "nbar live") {
            note("");
        }
    }
    function progress(text) { note(text, "work"); }
    var openTok = 0;
    function stopOpenWatch() { openTok++; }
    function watchOpen(sticky) {
        var tok = ++openTok, started = new Date().getTime();
        (function tick() {
            if (tok !== openTok) {
                return;
            }
            if (new Date().getTime() - started > 180000) {
                if (!sticky) {
                    note("");
                }
                return;
            }
            cs.evalScript("QBT_pingAE()", function (r) {
                if (tok !== openTok) {
                    return;
                }
                if ((r || "").indexOf("OK") === 0) {
                    note("Done: After Effects is now running...", "ok", sticky);
                }
                else {
                    setTimeout(tick, 1500);
                }
            });
        })();
    }
    note("");
    function clearLog() { $("status").innerHTML = ""; }
    function fill(sel, arr) {
        var i;
        for (i = 0; i < arr.length; i++) {
            var o = document.createElement("option");
            o.value = i;
            o.textContent = arr[i];
            sel.appendChild(o);
        }
    }
    fill($("dir"), DIRECTIONS);
    fill($("interp"), INTERPS);
    fill($("shpInterp"), INTERPS);
    fill($("align"), ALIGNS);
    fill($("safeW"), SAFE_WIDE);
    fill($("safeH"), SAFE_TALL);
    $("align").selectedIndex = 1;
    function hexToRgb(h) {
        return [parseInt(h.substr(1, 2), 16) / 255, parseInt(h.substr(3, 2), 16) / 255, parseInt(h.substr(5, 2), 16) / 255];
    }
    function num(id, def) { var v = parseFloat($(id).value); return isNaN(v) ? def : v; }
    var root = cs.getSystemPath("extension");
    cs.evalScript("QBT_setRoot(" + JSON.stringify(root) + ")");
    function getColor(id) { return $(id).getAttribute("data-color"); }
    function setColor(id, hex) {
        var el = $(id);
        el.setAttribute("data-color", hex);
        if (el.hasAttribute("data-dot")) {
            var dotEl = el.querySelector(".dotfill");
            if (dotEl) {
                dotEl.style.backgroundColor = hex;
            }
            el.style.setProperty("--dot", hex);
        }
        else {
            el.style.backgroundColor = hex;
        }
    }
    function hsv2rgb(h, sat, v) {
        var c = v * sat, hh = (h % 360) / 60, x = c * (1 - Math.abs(hh % 2 - 1)), m = v - c, r = 0, g = 0, b = 0;
        if (hh < 1) {
            r = c;
            g = x;
        }
        else if (hh < 2) {
            r = x;
            g = c;
        }
        else if (hh < 3) {
            g = c;
            b = x;
        }
        else if (hh < 4) {
            g = x;
            b = c;
        }
        else if (hh < 5) {
            r = x;
            b = c;
        }
        else {
            r = c;
            b = x;
        }
        return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
    }
    function rgb2hsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0;
        if (d !== 0) {
            if (mx === r) {
                h = ((g - b) / d) % 6;
            }
            else if (mx === g) {
                h = (b - r) / d + 2;
            }
            else {
                h = (r - g) / d + 4;
            }
            h *= 60;
            if (h < 0) {
                h += 360;
            }
        }
        return [h, mx === 0 ? 0 : d / mx, mx];
    }
    function toHex(rgb) {
        var out = "#", i, t;
        for (i = 0; i < 3; i++) {
            t = rgb[i].toString(16);
            out += (t.length < 2 ? "0" : "") + t;
        }
        return out;
    }
    function parseHex(str) {
        var t = String(str).replace(/^\s+|\s+$/g, "").replace("#", "");
        if (/^[0-9a-fA-F]{3}$/.test(t)) {
            t = t.charAt(0) + t.charAt(0) + t.charAt(1) + t.charAt(1) + t.charAt(2) + t.charAt(2);
        }
        if (!/^[0-9a-fA-F]{6}$/.test(t)) {
            return null;
        }
        return "#" + t.toLowerCase();
    }
    var cp = { el: $("cp"), sv: $("cpSV"), hue: $("cpHue"), hex: $("cpHex"), prev: $("cpPrev"),
        target: null, h: 0, s: 1, v: 1, drag: null };
    function drawHue() {
        var c = cp.hue.getContext("2d"), g = c.createLinearGradient(0, 0, cp.hue.width, 0), i;
        for (i = 0; i <= 6; i++) {
            g.addColorStop(i / 6, "rgb(" + hsv2rgb(i * 60, 1, 1).join(",") + ")");
        }
        c.fillStyle = g;
        c.fillRect(0, 0, cp.hue.width, cp.hue.height);
        var x = Math.round(cp.h / 360 * (cp.hue.width - 1)) + 0.5;
        c.strokeStyle = "#000";
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(x, 0);
        c.lineTo(x, cp.hue.height);
        c.stroke();
        c.strokeStyle = "#fff";
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(x, 0);
        c.lineTo(x, cp.hue.height);
        c.stroke();
    }
    function drawSV() {
        var c = cp.sv.getContext("2d"), w = cp.sv.width, h = cp.sv.height, g;
        c.fillStyle = "rgb(" + hsv2rgb(cp.h, 1, 1).join(",") + ")";
        c.fillRect(0, 0, w, h);
        g = c.createLinearGradient(0, 0, w, 0);
        g.addColorStop(0, "#fff");
        g.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = g;
        c.fillRect(0, 0, w, h);
        g = c.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(1, "#000");
        c.fillStyle = g;
        c.fillRect(0, 0, w, h);
        var x = cp.s * (w - 1), y = (1 - cp.v) * (h - 1);
        c.beginPath();
        c.arc(x, y, 5, 0, Math.PI * 2);
        c.strokeStyle = "#000";
        c.lineWidth = 3;
        c.stroke();
        c.beginPath();
        c.arc(x, y, 5, 0, Math.PI * 2);
        c.strokeStyle = "#fff";
        c.lineWidth = 1.5;
        c.stroke();
    }
    function cpApply(fromHexBox, exact) {
        var hex = exact || toHex(hsv2rgb(cp.h, cp.s, cp.v));
        drawHue();
        drawSV();
        cp.prev.style.backgroundColor = hex;
        if (!fromHexBox) {
            cp.hex.value = hex.toUpperCase();
        }
        if (cp.target) {
            if (!partApplyColor(cp.target, hex)) {
                setColor(cp.target, hex);
            }
            saveSettings();
            themeColorPicked(cp.target);
        }
    }
    function cpLoad(hex) {
        var r = hexToRgb(hex), hsv = rgb2hsv(Math.round(r[0] * 255), Math.round(r[1] * 255), Math.round(r[2] * 255));
        if (hsv[1] > 0 && hsv[2] > 0) {
            cp.h = hsv[0];
        }
        cp.s = hsv[1];
        cp.v = hsv[2];
        cp.hex.value = hex.toUpperCase();
        cp.prev.style.backgroundColor = hex;
        drawHue();
        drawSV();
    }
    function localXY(canvas, e) {
        var r = canvas.getBoundingClientRect();
        return [Math.min(Math.max(e.clientX - r.left, 0), r.width), Math.min(Math.max(e.clientY - r.top, 0), r.height)];
    }
    function cpDrag(e) {
        var p;
        if (cp.drag === "sv") {
            p = localXY(cp.sv, e);
            cp.s = p[0] / cp.sv.getBoundingClientRect().width;
            cp.v = 1 - p[1] / cp.sv.getBoundingClientRect().height;
        }
        else if (cp.drag === "hue") {
            p = localXY(cp.hue, e);
            cp.h = Math.min(359.99, p[0] / cp.hue.getBoundingClientRect().width * 360);
        }
        else {
            return;
        }
        cpApply(false);
        e.preventDefault();
    }
    function cpDragEnd() {
        cp.drag = null;
        document.removeEventListener("mousemove", cpDrag, false);
        document.removeEventListener("mouseup", cpDragEnd, false);
    }
    function cpDragStart(kind, e) {
        cp.drag = kind;
        cpDrag(e);
        document.addEventListener("mousemove", cpDrag, false);
        document.addEventListener("mouseup", cpDragEnd, false);
    }
    cp.sv.onmousedown = function (e) { cpDragStart("sv", e); };
    cp.hue.onmousedown = function (e) { cpDragStart("hue", e); };
    function parseAnyColor(str) {
        var t = String(str).replace(/^\s+|\s+$/g, ""), hx = parseHex(t), el, c, mm;
        if (hx) {
            return hx;
        }
        if (t === "" || /^(transparent|inherit|initial|unset|revert|currentcolor)$/i.test(t)) {
            return null;
        }
        if (/^\d{1,3}([\s,]+\d{1,3}){2}$/.test(t)) {
            t = "rgb(" + t.replace(/[\s,]+/g, ",") + ")";
        }
        el = document.createElement("div");
        el.style.color = t;
        if (!el.style.color) {
            return null;
        }
        el.style.display = "none";
        document.body.appendChild(el);
        c = window.getComputedStyle(el).color;
        document.body.removeChild(el);
        mm = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(c);
        return mm ? toHex([parseInt(mm[1], 10), parseInt(mm[2], 10), parseInt(mm[3], 10)]) : null;
    }
    function cpFromHex(hx, fromBox) {
        var r = hexToRgb(hx), hsv = rgb2hsv(Math.round(r[0] * 255), Math.round(r[1] * 255), Math.round(r[2] * 255));
        if (hsv[1] > 0 && hsv[2] > 0) {
            cp.h = hsv[0];
        }
        cp.s = hsv[1];
        cp.v = hsv[2];
        cpApply(fromBox, hx);
    }
    cp.hex.oninput = function () {
        var hx = parseHex(this.value);
        if (hx) {
            cpFromHex(hx, true);
        }
    };
    cp.hex.onkeydown = function (e) {
        var hx;
        if (e.keyCode !== 13) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        hx = parseAnyColor(this.value);
        if (hx) {
            cpFromHex(hx, false);
            this.select();
            return;
        }
        cp.hex.style.borderColor = "#f0584f";
        setTimeout(function () { cp.hex.style.borderColor = ""; cp.hex.value = partColorFor(cp.target || "cText").toUpperCase(); }, 600);
    };
    cp.hex.onfocus = function () { var el = this; setTimeout(function () { el.select(); }, 0); };
    cp.hex.onblur = function () { cp.hex.style.borderColor = ""; cp.hex.value = partColorFor(cp.target || "cText").toUpperCase(); };
    function cpClose() {
        if (cp.el.style.display !== "block") {
            return;
        }
        cp.el.style.display = "none";
        cp.target = null;
        cpDragEnd();
        document.removeEventListener("click", cpClose, false);
        document.removeEventListener("keydown", cpKey, false);
        window.removeEventListener("resize", cpClose, false);
    }
    function cpKey(e) { if (e.keyCode === 27) {
        cpClose();
    } }
    function cpOpen(id, anchor) {
        var sw = anchor || $(id), r, x, y, W = document.documentElement.clientWidth, H = document.documentElement.clientHeight;
        cp.target = null;
        cp.el.style.display = "block";
        cpLoad(partColorFor(id));
        cp.target = id;
        r = sw.getBoundingClientRect();
        x = r.left;
        y = r.bottom + 4;
        if (x + cp.el.offsetWidth > W - 6) {
            x = W - cp.el.offsetWidth - 6;
        }
        if (x < 6) {
            x = 6;
        }
        if (y + cp.el.offsetHeight > H - 6) {
            y = r.top - cp.el.offsetHeight - 4;
        }
        if (y < 6) {
            y = 6;
        }
        cp.el.style.left = x + "px";
        cp.el.style.top = y + "px";
        document.addEventListener("click", cpClose, false);
        document.addEventListener("keydown", cpKey, false);
        window.addEventListener("resize", cpClose, false);
    }
    var SWATCHES = ["cText", "cAccent", "cBg", "cOutline", "cShadow", "cBox", "cLine", "cShp", "cShpLn", "cShpSh", "cShpTb", "cShpTbB", "cShpTbC", "cShpTbD", "cTkBar", "cTkLine", "cTkLineB", "cTkLabel", "cTkLabelTx", "cTitle", "cFill", "cSel", "cSecBorder", "cBlink", "cShpBg", "cRollBg", "cAnimBg"], si;
    for (si = 0; si < SWATCHES.length; si++) {
        (function (id) {
            setColor(id, getColor(id));
            $(id).onclick = function (e) {
                e.stopPropagation();
                if (cp.target === id) {
                    cpClose();
                }
                else {
                    cpClose();
                    cpOpen(id);
                }
            };
        })(SWATCHES[si]);
    }
    cp.el.onclick = function (e) { e.stopPropagation(); };
    var DEF_BASE = "Text animation";
    var NKEY = "qbt_names_v2";
    var proj = { key: "", id: "" };
    var nameDb = {};
    try {
        nameDb = JSON.parse(localStorage.getItem(NKEY) || "{}") || {};
    }
    catch (eN) {
        nameDb = {};
    }
    function cleanName(t) { return String(t === undefined || t === null ? "" : t).replace(/[\r\n\t|]+/g, " ").replace(/^\s+|\s+$/g, ""); }
    function saveNames() {
        try {
            var k, arr = [];
            for (k in nameDb) {
                if (nameDb.hasOwnProperty(k)) {
                    arr.push(k);
                }
            }
            if (arr.length > 300) {
                arr.sort(function (x, y) { return (nameDb[y].t || 0) - (nameDb[x].t || 0); });
                for (k = 300; k < arr.length; k++) {
                    delete nameDb[arr[k]];
                }
            }
            localStorage.setItem(NKEY, JSON.stringify(nameDb));
        }
        catch (eS) { }
    }
    function entryFor(key, create) {
        var e = nameDb[key];
        if (!e && create) {
            e = nameDb[key] = { id: proj.id, t: 0, base: "", n: {} };
        }
        return e;
    }
    function curBase() { var e = entryFor(proj.key, false); return (e && e.base) ? e.base : DEF_BASE; }
    function lastFor(base) { var e = entryFor(proj.key, false); return (e && e.n && e.n[base.toLowerCase()]) || 0; }
    function readProject(cb) {
        cs.evalScript("QBT_projectInfo()", function (r) {
            var p, key, id, k, changed;
            if (!r || r === "undefined" || r === "null" || r === "EvalScript error.") {
                if (!proj.key) {
                    proj.key = "unsaved";
                    cb(true);
                }
                else {
                    cb(false);
                }
                return;
            }
            p = String(r).split("\t");
            id = p[1] || "";
            key = p[0] || (id ? "doc:" + id : "unsaved");
            changed = (key !== proj.key);
            if (changed && p[0] && id && !nameDb[key]) {
                for (k in nameDb) {
                    if (nameDb.hasOwnProperty(k) && k === "doc:" + id) {
                        nameDb[key] = nameDb[k];
                        delete nameDb[k];
                        saveNames();
                        break;
                    }
                }
            }
            proj.key = key;
            proj.id = id;
            cb(changed);
        });
    }
    function refreshName() {
        var base = curBase(), last = lastFor(base), e = entryFor(proj.key, false), custom = !!(e && e.base), key = proj.key;
        cs.evalScript("QBT_nextNumber(" + JSON.stringify(base) + "," + last + ")", function (r) {
            var n = parseInt(r, 10), el = $("compName");
            if (isNaN(n) || n < 1) {
                n = last + 1;
            }
            if (key !== proj.key || base !== curBase()) {
                return;
            }
            onNextName(base, n);
            if (custom) {
                if (document.activeElement !== el) {
                    el.value = base;
                }
                el.placeholder = "";
            }
            else {
                if (document.activeElement !== el) {
                    el.value = "";
                }
                el.placeholder = DEF_BASE;
            }
        });
    }
    function commitName(v) {
        var e = entryFor(proj.key, true);
        e.t = new Date().getTime();
        if (v === "" || v.toLowerCase() === DEF_BASE.toLowerCase()) {
            e.base = "";
        }
        else {
            e.base = v;
        }
        saveNames();
        refreshName();
    }
    $("compName").onchange = function () {
        var v = cleanName(this.value);
        readProject(function () { commitName(v); });
    };
    function markUsed(key, name, base) {
        var nm = String(name).toLowerCase(), low = String(base).toLowerCase(), e, n = 0;
        if (nm === low) {
            n = 1;
        }
        else if (nm.indexOf(low + "_") === 0 && /^\d+$/.test(nm.substr(low.length + 1))) {
            n = parseInt(nm.substr(low.length + 1), 10);
        }
        if (n < 1) {
            return;
        }
        e = entryFor(key, true);
        e.n[low] = Math.max(e.n[low] || 0, n);
        e.t = new Date().getTime();
        saveNames();
    }
    var projBusy = false;
    function checkProject() {
        if (projBusy || busy || document.hidden) {
            return;
        }
        projBusy = true;
        readProject(function (changed) { projBusy = false; if (changed) {
            refreshName();
        } });
    }
    setInterval(function () { if (document.hasFocus && !document.hasFocus()) {
        return;
    } checkProject(); }, 8000);
    window.addEventListener("focus", checkProject, false);
    $("outDir").onchange = function () {
        cs.evalScript("QBT_setSessionDir(" + JSON.stringify($("outDir").value) + ")");
    };
    var SKEY = "qbt_settings_v1";
    var P_VALUES = ["text", "pvSize", "size", "tracking", "lineSp", "align", "fadeDur", "endDur", "endMode", "preset", "interp", "dir", "delay", "dur", "hold", "compDur", "compW", "compH", "fps", "trackNo",
        "outlineW", "shOp", "shDist", "shSoft", "shDir", "posX", "posY", "fxStr", "wipeDir",
        "safeW", "safeH", "safeT", "safeL", "safeB", "safeR", "safeUnit",
        "boxAnim", "boxOp", "boxPad", "boxRad", "boxDur", "lineAnim", "lineW", "linePad", "lineRad", "lineDur", "shpType", "shpAnim", "shpTh", "shpDur", "shpDelay", "shpFx", "shpFxSp", "shpLen", "shpGap", "shpOffX", "shpOffY", "shpRot", "shpRad", "shpPad", "shpOp", "shpLnW", "shpShSoft", "shpShDist", "shpSkew", "shpTbW", "shpTbWB", "shpTbWC", "shpTbWD", "shpTbHs", "shpTbVs", "shpTbAnim", "shpTbDur", "shpTbGap", "shpTbDelay", "shpInterp", "boxSkew", "lineSkew", "shpOrder", "rollMode", "rollSpeed", "rollGapIn", "rollGapOut", "crawlLines", "crawlSep", "crawlSepText", "tkAnim", "tkBarH", "tkBarOp", "tkLineW", "tkLineWB", "tkLineAnim", "tkLabel", "tkLblAnim", "tkLblSz", "tkLblExt", "tkTxY", "tkLblTxY", "tkLblTxIn", "tkLblTxFx", "tkLblTxDur", "tkLblTxSp", "tkLblTxAmt", "tkLblTxMode", "animFx", "animSp", "animAmt"];
    var P_CHECKS = ["optBg", "optMb", "optPlace", "optPlaceSingle", "optPlaceBatch", "optEnd", "optOutline", "optShadow", "optSafe", "optSafeCustom", "optPos", "optBox", "optLine", "optShp", "optShpLn", "optShpSh", "optShpTb", "shpTbSep", "shpTbOrV", "shpTbOrA", "optMbShape", "optMbText", "tkBarOn", "tkLineSep", "tkLabelOn", "tkLabelTxAuto", "tkLblTxOn", "optAnimate"];
    var P_COLORS = ["cText", "cAccent", "cBg", "cOutline", "cShadow", "cBox", "cLine", "cShp", "cShpLn", "cShpSh", "cShpTb", "cShpTbB", "cShpTbC", "cShpTbD", "cTkBar", "cTkLine", "cTkLineB", "cTkLabel", "cTkLabelTx"];
    var PRESET_VALUES = ["size", "tracking", "lineSp", "align", "fadeDur", "endDur", "endMode", "preset", "interp", "dir", "delay", "dur", "hold", "compDur",
        "outlineW", "shOp", "shDist", "shSoft", "shDir", "posX", "posY", "fxStr", "wipeDir",
        "boxAnim", "boxOp", "boxPad", "boxRad", "boxDur", "lineAnim", "lineW", "linePad", "lineRad", "lineDur", "shpType", "shpAnim", "shpTh", "shpDur", "shpDelay", "shpFx", "shpFxSp", "shpLen", "shpGap", "shpOffX", "shpOffY", "shpRot", "shpRad", "shpPad", "shpOp", "shpLnW", "shpShSoft", "shpShDist", "shpSkew", "shpTbW", "shpTbWB", "shpTbWC", "shpTbWD", "shpTbHs", "shpTbVs", "shpTbAnim", "shpTbDur", "shpTbGap", "shpTbDelay", "shpInterp", "boxSkew", "lineSkew", "shpOrder", "rollMode", "rollSpeed", "rollGapIn", "rollGapOut", "crawlLines", "crawlSep", "crawlSepText", "tkAnim", "tkBarH", "tkBarOp", "tkLineW", "tkLineWB", "tkLineAnim", "tkLabel", "tkLblAnim", "tkLblSz", "tkLblExt", "tkTxY", "tkLblTxY", "tkLblTxIn", "tkLblTxFx", "tkLblTxDur", "tkLblTxSp", "tkLblTxAmt", "tkLblTxMode", "animFx", "animSp", "animAmt"];
    var PRESET_CHECKS = ["optBg", "optMb", "optEnd", "optOutline", "optShadow", "optPos", "optBox", "optLine", "optShp", "optShpLn", "optShpSh", "optShpTb", "shpTbSep", "shpTbOrV", "shpTbOrA", "optMbShape", "optMbText", "tkBarOn", "tkLineSep", "tkLabelOn", "tkLabelTxAuto", "tkLblTxOn", "optAnimate"];
    var PRESET_COLORS = ["cText", "cAccent", "cBg", "cOutline", "cShadow", "cBox", "cLine", "cShp", "cShpLn", "cShpSh", "cShpTb", "cShpTbB", "cShpTbC", "cShpTbD", "cTkBar", "cTkLine", "cTkLineB", "cTkLabel", "cTkLabelTx"];
    var TS_VALUES = ["size", "tracking", "lineSp", "align", "posX", "posY", "outlineW", "shOp", "shDist", "shSoft", "shDir"];
    var TS_CHECKS = ["optOutline", "optShadow", "optPos"];
    var TS_COLORS = ["cText", "cOutline", "cShadow"];
    var saveTimer = null, redrawQueued = false, lastSaved = "";
    function doSave() {
        if (exLive || exHold) {
            return;
        }
        try {
            var o = { f: curFont, v: {}, k: {}, c: {} }, i;
            for (i = 0; i < P_VALUES.length; i++) {
                o.v[P_VALUES[i]] = $(P_VALUES[i]).value;
            }
            for (i = 0; i < P_CHECKS.length; i++) {
                o.k[P_CHECKS[i]] = $(P_CHECKS[i]).checked;
            }
            for (i = 0; i < P_COLORS.length; i++) {
                o.c[P_COLORS[i]] = getColor(P_COLORS[i]);
            }
            o.p = partsExport();
            i = JSON.stringify(o);
            if (i !== lastSaved) {
                lastSaved = i;
                localStorage.setItem(SKEY, i);
            }
        }
        catch (e) { }
    }
    function saveSettings() { sceneRev++; dotsNote(); clearTimeout(saveTimer); if (exLive) {
        exCapture();
    }
    else {
        saveTimer = setTimeout(doSave, 300);
    } if (!redrawQueued) {
        redrawQueued = true;
        (window.requestAnimationFrame || window.webkitRequestAnimationFrame || setTimeout).call(window, function () { redrawQueued = false; drawFxPreview(); pvRender(); posRender(); batchRender(); });
    } }
    var LBL_IN_IDX = [11, 0, 12, 13, 14, 63, 1, 2, 10, 3, 16, 5, 17, 19, 20, 21, 22, 23, 25, 26, 27, 6, 7, 8, 15, 32, 34, 36, 37, 38, 39, 40, 43, 48, 49, 50, 51, 52, 53, 55, 56, 57, 58, 59, 60, 61, 62, 33, 9, 24];
    (function () {
        var sel = $("tkLblTxIn"), i, op;
        for (i = 0; i < LBL_IN_IDX.length; i++) {
            op = document.createElement("option");
            op.value = String(LBL_IN_IDX[i]);
            op.textContent = PRESETS[LBL_IN_IDX[i]];
            sel.appendChild(op);
        }
        sel.value = "11";
        $("tkLblTxFx").innerHTML = $("animFx").innerHTML;
        $("tkLblTxFx").value = "1";
    })();
    var DEFAULTS = { f: { label: curFont.label, family: curFont.family, uiStyle: curFont.uiStyle, ps: curFont.ps }, v: {}, k: {}, c: {} };
    (function captureDefaults() {
        var i;
        for (i = 0; i < P_VALUES.length; i++) {
            DEFAULTS.v[P_VALUES[i]] = $(P_VALUES[i]).value;
        }
        for (i = 0; i < P_CHECKS.length; i++) {
            DEFAULTS.k[P_CHECKS[i]] = $(P_CHECKS[i]).checked;
        }
        for (i = 0; i < P_COLORS.length; i++) {
            DEFAULTS.c[P_COLORS[i]] = getColor(P_COLORS[i]);
        }
    })();
    var SAVED = null;
    try {
        SAVED = JSON.parse(localStorage.getItem(SKEY) || "null");
    }
    catch (e) {
        SAVED = null;
    }
    (function restore() {
        if (!SAVED) {
            return;
        }
        var i, id, od;
        try {
            if (SAVED.v) {
                od = parseInt(SAVED.v.dir, 10);
                if (!isNaN(od) && od >= DIRECTIONS.length) {
                    SAVED.v.dir = String(od % DIRECTIONS.length);
                    if (SAVED.v.interp === undefined) {
                        SAVED.v.interp = "1";
                    }
                }
            }
            if (SAVED.v && SAVED.v.shpInterp === undefined && SAVED.v.interp !== undefined) {
                SAVED.v.shpInterp = SAVED.v.interp;
            }
            for (i = 0; i < P_VALUES.length; i++) {
                id = P_VALUES[i];
                if (SAVED.v && SAVED.v[id] !== undefined && SAVED.v[id] !== null) {
                    $(id).value = oldAlign(id, SAVED.v[id]);
                }
            }
            for (i = 0; i < P_CHECKS.length; i++) {
                id = P_CHECKS[i];
                if (SAVED.k && SAVED.k[id] !== undefined) {
                    $(id).checked = !!SAVED.k[id];
                }
            }
            if (SAVED.k && SAVED.k.optFade === false) {
                $("fadeDur").value = "0";
            }
            for (i = 0; i < P_COLORS.length; i++) {
                id = P_COLORS[i];
                if (SAVED.c && parseHex(SAVED.c[id])) {
                    setColor(id, parseHex(SAVED.c[id]));
                }
            }
        }
        catch (e) { }
    })();
    if ($("dir").selectedIndex < 0) {
        $("dir").selectedIndex = 0;
    }
    if ($("interp").selectedIndex < 0) {
        $("interp").selectedIndex = 0;
    }
    if ($("shpInterp").selectedIndex < 0) {
        $("shpInterp").selectedIndex = 0;
    }
    if ($("safeW").selectedIndex < 0) {
        $("safeW").selectedIndex = 0;
    }
    if ($("safeH").selectedIndex < 0) {
        $("safeH").selectedIndex = 0;
    }
    function applyPv() {
        var v = parseInt($("pvSize").value, 10) || 12;
        $("text").style.fontSize = v + "px";
        $("pvVal").textContent = v + "px";
        syncBatchStyle();
    }
    $("pvSize").addEventListener("input", applyPv, false);
    applyPv();
    var pvHide = function () { };
    (function pvPopup() {
        var btn = $("pvBtn"), row = $("pvRow"), open = false, tm = null;
        function hide() { clearTimeout(tm); open = false; row.style.display = "none"; btn.className = "ibtn"; btn.title = "Text preview size: show the slider"; }
        function show() { open = true; row.style.display = ""; btn.className = "ibtn pvon"; btn.title = "Hide the preview size slider"; }
        pvHide = hide;
        btn.addEventListener("click", function (e) { if (e && e.stopPropagation) {
            e.stopPropagation();
        }
        if (open) {
            hide();
        }
        else {
            show();
        } }, false);
        $("pvSize").addEventListener("input", function () { clearTimeout(tm); }, false);
        $("pvSize").addEventListener("change", function () { clearTimeout(tm); tm = setTimeout(hide, 1500); }, false);
        row.addEventListener("mouseenter", function () { clearTimeout(tm); }, false);
        document.addEventListener("mousedown", function (e) {
            var n = e.target;
            if (!open) {
                return;
            }
            while (n && n.nodeType === 1) {
                if (n === row || n === btn) {
                    return;
                }
                n = n.parentNode;
            }
            hide();
        }, true);
    })();
    (function pvPinInit() {
        var PKEY = "qbt_pin_v1", btn = $("pvPin"), host = $("pinHost"), block = $("pvBlock"), t = $("text"), home = document.createElement("div"), pinned = false;
        home.style.display = "none";
        block.parentNode.insertBefore(home, block);
        function setPin(on) {
            var had = (document.activeElement === t), a = 0, b = 0;
            if (on === pinned) {
                return;
            }
            try {
                a = t.selectionStart;
                b = t.selectionEnd;
            }
            catch (e0) { }
            pinned = on;
            if (on) {
                host.insertBefore(block, host.firstChild);
                host.style.display = "";
            }
            else {
                home.parentNode.insertBefore(block, home);
                pinHostRefresh();
            }
            btn.setAttribute("data-mode", on ? "unpin" : "pin");
            btn.title = on ? "Unpin the text preview (back to the Text & Style tab)" : "Pin the text preview on top of every tab";
            try {
                localStorage.setItem(PKEY, on ? "1" : "0");
            }
            catch (e1) { }
            try {
                if (had) {
                    t.focus();
                    t.setSelectionRange(a, b);
                }
            }
            catch (e2) { }
            setTimeout(function () { try {
                pvRender();
                paintSliders();
            }
            catch (e3) { } }, 0);
        }
        btn.addEventListener("click", function (e) { if (e && e.stopPropagation) {
            e.stopPropagation();
        } setPin(!pinned); }, false);
        try {
            if (localStorage.getItem(PKEY) === "1") {
                setPin(true);
            }
        }
        catch (e4) { }
    })();
    function syncBg() {
        var on = $("optBg").checked;
        $("cBg").disabled = !on;
        if (!on && cp.target === "cBg") {
            cpClose();
        }
    }
    $("optBg").addEventListener("change", syncBg, false);
    syncBg();
    var EXTRAS = { 9: { a: 1 }, 24: { a: 1 }, 33: { s: 1 }, 36: { s: 1 }, 37: { s: 1 }, 38: { s: 1 }, 39: { s: 1 }, 40: { s: 1 }, 41: { s: 1 },
        44: { a: 1 }, 45: { a: 1 }, 46: { w: 1, s: 1 } };
    var animSet = function () { };
    function syncAccent() {
        var p = parseInt($("preset").value, 10), x = EXTRAS[p] || {}, on = !!x.a;
        $("cAccent").disabled = !on;
        $("rAccent").style.display = on ? "" : "none";
        $("rStrength").style.display = x.s ? "" : "none";
        $("rWipe").style.display = x.w ? "" : "none";
        if (!on && cp.target === "cAccent") {
            cpClose();
        }
    }
    syncAccent();
    function syncEnd() {
        var on = $("optEnd").checked, same = ($("endMode").value !== "reverse"), bs = document.querySelectorAll("button.nb"), i, f;
        $("endSame").checked = same;
        $("endRev").checked = !same;
        $("endSame").disabled = !on;
        $("endRev").disabled = !on;
        $("lblSame").className = "check" + (on ? "" : " off");
        $("lblRev").className = "check" + (on ? "" : " off");
        $("endDur").disabled = !on;
        $("fadeDur").disabled = on;
        $("rEnd").className = "row" + (on ? "" : " off");
        $("rFade").className = "row" + (on ? " off" : "");
        for (i = 0; i < bs.length; i++) {
            f = bs[i].getAttribute("data-for");
            if (f === "endDur") {
                bs[i].disabled = !on;
            }
            else if (f === "fadeDur") {
                bs[i].disabled = on;
            }
        }
    }
    $("optEnd").addEventListener("change", syncEnd, false);
    $("endSame").addEventListener("change", function () { if (this.checked) {
        $("endMode").value = "same";
        saveSettings();
    } }, false);
    $("endRev").addEventListener("change", function () { if (this.checked) {
        $("endMode").value = "reverse";
        saveSettings();
    } }, false);
    syncEnd();
    function syncPlace() {
        var on = $("optPlace").checked;
        $("trackNo").disabled = !on;
        $("placeOpts").style.display = on ? "" : "none";
    }
    $("optPlace").addEventListener("change", syncPlace, false);
    syncPlace();
    function syncFx() {
        var o = $("optOutline").checked, sh = $("optShadow").checked, i, ids;
        $("cOutline").disabled = !o;
        $("outlineW").disabled = !o;
        $("outlineWSl").disabled = !o;
        $("rOutW").className = "row" + (o ? "" : " off");
        ids = ["shOp", "shDist", "shSoft", "shDir"];
        for (i = 0; i < ids.length; i++) {
            $(ids[i]).disabled = !sh;
            $(ids[i] + "Sl").disabled = !sh;
        }
        $("cShadow").disabled = !sh;
        ids = ["rShO", "rShD", "rShS", "rShA"];
        for (i = 0; i < ids.length; i++) {
            $(ids[i]).className = "row" + (sh ? "" : " off");
        }
        if (!o && cp.target === "cOutline") {
            cpClose();
        }
        if (!sh && cp.target === "cShadow") {
            cpClose();
        }
    }
    $("optOutline").addEventListener("change", syncFx, false);
    $("optShadow").addEventListener("change", syncFx, false);
    syncFx();
    function syncShapes() {
        var groups = [
            { chk: "optBox", col: "cBox", ids: ["boxAnim", "boxOp", "boxPad", "boxRad", "boxSkew", "boxDur"] },
            { chk: "optLine", col: "cLine", ids: ["lineAnim", "lineW", "linePad", "lineRad", "lineSkew", "lineDur"] },
            { chk: "optShp", col: "cShp", ids: ["shpType", "shpAnim", "shpTh", "shpDur", "shpDelay", "shpFx", "shpLen", "shpGap", "shpOffX", "shpOffY", "shpRot", "shpSkew", "shpRad", "shpPad", "shpOp"] }
        ], g, i, on, el, sl, row, nbs, n;
        for (g = 0; g < groups.length; g++) {
            on = $(groups[g].chk).checked;
            $(groups[g].col).disabled = !on;
            for (i = 0; i < groups[g].ids.length; i++) {
                el = $(groups[g].ids[i]);
                el.disabled = !on;
                sl = $(groups[g].ids[i] + "Sl");
                if (sl) {
                    sl.disabled = !on;
                }
                nbs = document.querySelectorAll('button.nb[data-for="' + groups[g].ids[i] + '"]');
                for (n = 0; n < nbs.length; n++) {
                    nbs[n].disabled = !on;
                }
                row = $("r" + groups[g].ids[i].charAt(0).toUpperCase() + groups[g].ids[i].substr(1));
                if (row) {
                    row.className = "row" + (on ? "" : " off");
                }
            }
            if (!on && cp.target === groups[g].col) {
                cpClose();
            }
        }
        (function shpSub() {
            var shp = $("optShp").checked;
            function sub(on, ids, col) {
                var k, el, sl, row, nbs, n;
                if (col) {
                    $(col).disabled = !on;
                    if (!on && cp.target === col) {
                        cpClose();
                    }
                }
                for (k = 0; k < ids.length; k++) {
                    el = $(ids[k]);
                    el.disabled = !on;
                    sl = $(ids[k] + "Sl");
                    if (sl) {
                        sl.disabled = !on;
                    }
                    nbs = document.querySelectorAll('button.nb[data-for="' + ids[k] + '"]');
                    for (n = 0; n < nbs.length; n++) {
                        nbs[n].disabled = !on;
                    }
                    row = $("r" + ids[k].charAt(0).toUpperCase() + ids[k].substr(1));
                    if (row) {
                        row.className = "row" + (on ? "" : " off");
                    }
                }
            }
            $("optShpLn").disabled = !shp;
            $("optShpSh").disabled = !shp;
            $("rShpLnChk").className = "row" + (shp ? "" : " off");
            $("rShpShChk").className = "row" + (shp ? "" : " off");
            sub(shp && $("optShpLn").checked, ["shpLnW"], "cShpLn");
            sub(shp && $("optShpSh").checked, ["shpShSoft", "shpShDist"], "cShpSh");
            (function tbSub() {
                var tb = $("optShpTb").checked, sep = $("shpTbSep").checked;
                $("optShpTb").disabled = false;
                sub(tb, ["shpTbOrH", "shpTbW", "shpTbWB", "shpTbWC", "shpTbWD", "shpTbHs", "shpTbVs", "shpTbAnim", "shpTbDelay", "shpTbDur", "shpTbGap"], "cShpTb");
                var vt = $("shpTbOrV").checked, al = $("shpTbOrA").checked, nm4 = al && sep;
                if (al) {
                    vt = false;
                }
                $("shpTbOrH").checked = !vt && !al;
                $("shpTbOrV").checked = vt;
                $("shpTbOrV").disabled = !tb;
                $("shpTbOrA").disabled = !tb;
                $("lblTbW").textContent = al ? "Top line (px)" : (vt ? "Left line (px)" : "Top line (px)");
                $("lblTbWB").textContent = al ? "Bottom line (px)" : (vt ? "Right line (px)" : "Bottom line (px)");
                $("rShpTbWC").style.display = al ? "" : "none";
                $("rShpTbWD").style.display = al ? "" : "none";
                $("shpTbSep").disabled = !tb;
                $("rShpTbSep").className = "row" + (tb ? "" : " off");
                $("cShpTbB").disabled = !(tb && sep);
                $("cShpTbB").style.display = sep ? "" : "none";
                $("cShpTbC").disabled = !(tb && nm4);
                $("cShpTbC").style.display = nm4 ? "" : "none";
                $("cShpTbD").disabled = !(tb && nm4);
                $("cShpTbD").style.display = nm4 ? "" : "none";
                if (!(tb && sep) && cp.target === "cShpTbB") {
                    cpClose();
                }
                if (!(tb && nm4) && (cp.target === "cShpTbC" || cp.target === "cShpTbD")) {
                    cpClose();
                }
            })();
            sub(shp && $("shpFx").value !== "0", ["shpFxSp"], null);
        })();
        on = $("optBox").checked || $("optLine").checked || $("optShp").checked || $("optShpTb").checked;
        $("shpInterp").disabled = !on;
        $("rShpInterp").className = "row" + (on ? "" : " off");
        shpRender();
        $("shpOrder").disabled = !on;
        $("rShpOrder").className = "row" + (on ? "" : " off");
    }
    function syncMb() { $("rMbSub").style.display = $("optMb").checked ? "flex" : "none"; }
    $("optMb").addEventListener("change", syncMb, false);
    syncMb();
    function enRow(id, on) {
        var el = $(id), sl = $(id + "Sl"), row = $("r" + id.charAt(0).toUpperCase() + id.substr(1)), nbs, n;
        el.disabled = !on;
        if (sl) {
            sl.disabled = !on;
        }
        nbs = document.querySelectorAll('button.nb[data-for="' + id + '"]');
        for (n = 0; n < nbs.length; n++) {
            nbs[n].disabled = !on;
        }
        if (row) {
            row.className = "row" + (on ? "" : " off");
        }
    }
    var CRAWL_SEPS = ["", "     ", "-", "*", "\u2022", "\u25C6", "\u2605", "|", "/", "\u25BA"];
    function crawlSepString() {
        var k = parseInt($("crawlSep").value, 10) || 0, own;
        if (k === 0 || k === 1) {
            return CRAWL_SEPS[k];
        }
        if (k === 10) {
            own = $("crawlSepText").value;
            return own === "" ? " " : " " + own + " ";
        }
        return " " + (CRAWL_SEPS[k] || "\u2022") + " ";
    }
    function crawlRows(text, K) {
        var parts = String(text).split(/\r\n|\n|\r/), items = [], i, n, per, out = [], sep = crawlSepString();
        for (i = 0; i < parts.length; i++) {
            if (parts[i] !== "") {
                items.push(parts[i]);
            }
        }
        if (!items.length) {
            items.push("Your Text Here");
        }
        n = items.length;
        K = Math.max(1, Math.min(Math.floor(K) || 1, n));
        per = Math.ceil(n / K);
        for (i = 0; i < n; i += per) {
            out.push(items.slice(i, i + per).join(sep));
        }
        return out;
    }
    function syncRoll() {
        var mode = parseInt($("rollMode").value, 10) || 0, crawl = (mode === 3 || mode === 4), bar, lab;
        $("rollOn").checked = mode > 0;
        (function rollNote() {
            var txt = mode >= 3 ? "Crawling mode activated..." : (mode > 0 ? "Rolling mode activated..." : "");
            if (txt !== rollNoteText) {
                rollNoteText = txt;
                noteIdleRefresh();
            }
        })();
        if (mode > 0) {
            $("rollKind").value = String(mode);
        }
        $("rollKind").disabled = !(mode > 0);
        if (window.QBT_syncLock) {
            try {
                window.QBT_syncLock();
            }
            catch (eL7) { }
        }
        $("rollOpts").style.display = mode > 0 ? "" : "none";
        $("crawlOpts").style.display = crawl ? "" : "none";
        $("rCrawlSepText").style.display = ((parseInt($("crawlSep").value, 10) || 0) === 10) ? "" : "none";
        enRow("rollSpeed", mode > 0);
        enRow("rollGapIn", mode > 0);
        enRow("rollGapOut", mode > 0);
        $("tkBarOn").disabled = !crawl;
        $("tkLabelOn").disabled = !crawl;
        bar = crawl && $("tkBarOn").checked;
        lab = crawl && $("tkLabelOn").checked;
        enRow("tkAnim", bar);
        enRow("tkBarH", bar);
        enRow("tkBarOp", bar);
        enRow("tkLineW", bar);
        enRow("tkLineWB", bar);
        $("rTkAnim").style.display = $("rTkBarH").style.display = $("rTkBarOp").style.display = $("rTkLineW").style.display = $("rTkLineWB").style.display = $("rTkLineSep").style.display = $("rTkLineAnim").style.display = bar ? "" : "none";
        $("rTkLabel").style.display = lab ? "" : "none";
        $("rTkLblAnim").style.display = $("rTkLblTx").style.display = $("rTkLblSz").style.display = $("rTkLblExt").style.display = $("rTkLblTxY").style.display = $("rTkLblTxA").style.display = lab ? "" : "none";
        enRow("tkLblTxY", lab);
        syncLblTx(lab);
        enRow("tkLblAnim", lab);
        enRow("tkLblSz", lab);
        enRow("tkLblExt", lab);
        $("tkLabelTxAuto").disabled = !lab;
        $("cTkLabelTx").disabled = !(lab && !$("tkLabelTxAuto").checked);
        $("rTkLblTx").className = "row" + (lab ? "" : " off");
        $("cTkBar").disabled = !bar;
        $("cTkLine").disabled = !bar;
        $("tkLineSep").disabled = !bar;
        $("cTkLineB").disabled = !(bar && $("tkLineSep").checked);
        $("cTkLineB").style.display = $("tkLineSep").checked ? "" : "none";
        $("cTkLine").className = "swatch" + ($("tkLineSep").checked ? " half" : "");
        $("cTkLine").title = $("tkLineSep").checked ? "Top line colour (the first quarter of the line half of the strip)" : "Line colour (the right half of the strip: top and bottom line)";
        if (!(bar && $("tkLineSep").checked) && cp.target === "cTkLineB") {
            cpClose();
        }
        enRow("tkLineAnim", bar);
        enRow("tkLabel", lab);
        $("cTkLabel").disabled = !lab;
        shpRender();
        if (window.QBT_rollRender) {
            window.QBT_rollRender();
        }
        if (!(bar || lab) && (cp.target === "cTkBar" || cp.target === "cTkLine" || cp.target === "cTkLabel" || cp.target === "cTkLabelTx")) {
            cpClose();
        }
        if (lab && $("tkLabelTxAuto").checked && cp.target === "cTkLabelTx") {
            cpClose();
        }
        rollLock(mode > 0);
    }
    var rollLocked = false;
    function rollLockTargets() {
        var out = [], an = $("animSec"), k, ch, ids = ["rDur", "rHold", "rFade", "rEnd", "boxSec", "lineSec", "shpSec", "rShpInterp"];
        for (k = 0; k < an.children.length; k++) {
            ch = an.children[k];
            if (ch.tagName === "LEGEND" || ch.id === "rMbSub" || ch.querySelector("#optMb")) {
                continue;
            }
            out.push(ch);
        }
        for (k = 0; k < ids.length; k++) {
            if ($(ids[k])) {
                out.push($(ids[k]));
            }
        }
        return out;
    }
    function rollLock(on) {
        var box = $("text").parentNode, t = rollLockTargets(), k, n, ctl, el, had = rollLocked;
        if (box.className.indexOf("rolllive") >= 0) {
            if (!on) {
                box.className = box.className.replace(/\s*\brolllive\b/g, "");
            }
        }
        else if (on) {
            box.className += " rolllive";
        }
        for (k = 0; k < t.length; k++) {
            el = t[k];
            el.style.opacity = on ? ".4" : "";
            el.style.pointerEvents = on ? "none" : "";
            ctl = el.querySelectorAll("input, select, button, textarea");
            for (n = 0; n < ctl.length; n++) {
                if (on) {
                    ctl[n]._rlk = 1;
                    ctl[n].disabled = true;
                }
                else if (ctl[n]._rlk) {
                    ctl[n]._rlk = 0;
                    ctl[n].disabled = false;
                }
            }
        }
        rollLocked = on;
        if (on && !had) {
            if (cp.target && /^c(Box|Line|Shp|ShpLn|ShpSh)$/.test(cp.target)) {
                cpClose();
            }
        }
        if (!on && had) {
            syncEnd();
            syncShapes();
            syncAnimate();
        }
    }
    $("rollMode").addEventListener("change", syncRoll, false);
    function rollFromUI() {
        var k = parseInt($("rollKind").value, 10) || 1;
        $("rollMode").value = $("rollOn").checked ? String(k) : "0";
        var ev = document.createEvent("Event");
        ev.initEvent("change", true, true);
        $("rollMode").dispatchEvent(ev);
    }
    $("rollOn").addEventListener("change", rollFromUI, false);
    $("rollKind").addEventListener("change", rollFromUI, false);
    $("tkBarOn").addEventListener("change", syncRoll, false);
    $("tkLineSep").addEventListener("change", syncRoll, false);
    $("tkLabelOn").addEventListener("change", syncRoll, false);
    $("tkLabelTxAuto").addEventListener("change", function () { syncRoll(); saveSettings(); }, false);
    function syncAnimate() {
        var on = $("optAnimate").checked;
        $("animFx").disabled = !on;
        $("rAnimSp").style.display = $("rAnimAmt").style.display = on ? "" : "none";
        enRow("animSp", on);
        enRow("animAmt", on);
    }
    function syncLblTx(lab) {
        var on = !!lab && $("tkLblTxOn").checked, se = ($("tkLblTxMode").value === "1");
        $("tkLblTxOn").disabled = !lab;
        $("rTkLblTxA").className = "row" + (lab ? "" : " off");
        $("tkLblTxIn").disabled = !on;
        $("tkLblTxFx").disabled = !on;
        $("tkLblTxIn").style.display = se ? "" : "none";
        $("tkLblTxFx").style.display = se ? "none" : "";
        $("rTkLblTxM").style.display = lab ? "" : "none";
        $("tkLblTxR0").checked = !se;
        $("tkLblTxR1").checked = se;
        $("tkLblTxR0").disabled = !on;
        $("tkLblTxR1").disabled = !on;
        $("lblTxCont").className = "check" + (on ? "" : " off");
        $("lblTxSE").className = "check" + (on ? "" : " off");
        $("rTkLblTxDur").style.display = (on && se) ? "" : "none";
        $("rTkLblTxSp").style.display = $("rTkLblTxAmt").style.display = (on && !se) ? "" : "none";
        enRow("tkLblTxDur", on && se);
        enRow("tkLblTxSp", on && !se);
        enRow("tkLblTxAmt", on && !se);
    }
    function lblTxRadio() {
        $("tkLblTxMode").value = $("tkLblTxR1").checked ? "1" : "0";
        syncRoll();
        saveSettings();
    }
    $("tkLblTxR0").addEventListener("change", lblTxRadio, false);
    $("tkLblTxR1").addEventListener("change", lblTxRadio, false);
    $("tkLblTxOn").addEventListener("change", function () { syncRoll(); saveSettings(); }, false);
    $("tkLblTxIn").addEventListener("change", function () { saveSettings(); }, false);
    $("tkLblTxFx").addEventListener("change", function () { saveSettings(); }, false);
    $("optAnimate").addEventListener("change", function () { syncAnimate(); saveSettings(); }, false);
    $("animFx").addEventListener("change", function () { saveSettings(); }, false);
    syncAnimate();
    $("crawlSep").addEventListener("change", syncRoll, false);
    syncRoll();
    $("optBox").addEventListener("change", syncShapes, false);
    $("optLine").addEventListener("change", syncShapes, false);
    $("optShp").addEventListener("change", syncShapes, false);
    $("optShpLn").addEventListener("change", syncShapes, false);
    $("optShpSh").addEventListener("change", syncShapes, false);
    $("optShpTb").addEventListener("change", syncShapes, false);
    $("shpTbSep").addEventListener("change", syncShapes, false);
    $("shpTbOrH").addEventListener("change", function () { if (this.checked) {
        $("shpTbOrV").checked = false;
        $("shpTbOrA").checked = false;
    } syncShapes(); }, false);
    $("shpTbOrV").addEventListener("change", syncShapes, false);
    $("shpTbOrA").addEventListener("change", syncShapes, false);
    $("shpFx").addEventListener("change", syncShapes, false);
    syncShapes();
    function pIdx(name) { var k; for (k = 0; k < PRESETS.length; k++) {
        if (PRESETS[k].replace(/\.\.\. \[E\]$/, "") === name) {
            return String(k);
        }
    } return "0"; }
    var LT_BASE = {
        v: { shpInterp: "0", align: "0", dir: "1", delay: "0.3", dur: "1", hold: "3", posX: "7", posY: "86", boxAnim: "0", boxOp: "85", boxPad: "28", boxRad: "10", boxDur: "0.6",
            lineAnim: "0", lineW: "4", linePad: "22", lineRad: "0", lineDur: "0.8", shpType: "0", shpAnim: "0", shpTh: "8", shpDur: "0.6", shpDelay: "0", shpFx: "0", shpFxSp: "1.2", shpLen: "100", shpGap: "0", shpOffX: "0", shpOffY: "0", shpRot: "0", shpRad: "0", shpPad: "12", shpOp: "100", shpLnW: "3", shpShSoft: "12", shpShDist: "6", shpSkew: "0", shpTbW: "4", shpTbWB: "4", shpTbWC: "4", shpTbWD: "4", shpTbHs: "100", shpTbVs: "100", shpTbAnim: "0", shpTbDur: "0.6", shpTbGap: "0", shpTbDelay: "0",
            boxSkew: "0", lineSkew: "0", shpOrder: "0", rollMode: "0", rollSpeed: "160", rollGapIn: "0", rollGapOut: "0.3", crawlLines: "1", crawlSep: "4", crawlSepText: "", tkAnim: "0", tkBarH: "110", tkBarOp: "92", tkLineWB: "0", tkLineAnim: "0", tkLineW: "4", tkLabel: "BREAKING NEWS", tkLblAnim: "0", tkLblSz: "0", tkLblExt: "0", tkTxY: "0", tkLblTxY: "0", tkLblTxIn: "11", tkLblTxFx: "1", tkLblTxDur: "0.7", tkLblTxSp: "1.5", tkLblTxAmt: "100", tkLblTxMode: "0", animFx: "1", animSp: "1.5", animAmt: "100" },
        k: { optBox: false, optLine: false, optShp: false, optShpLn: false, optShpSh: false, optShpTb: false, shpTbSep: false, shpTbOrV: false, shpTbOrA: false, optPos: true, optEnd: false, tkBarOn: false, tkLineSep: false, tkLabelOn: false, tkLabelTxAuto: true, tkLblTxOn: false, optAnimate: false },
        c: { cText: "#ffffff", cBox: "#111111", cLine: "#ffffff", cShp: "#ff9800", cShpLn: "#ffffff", cShpSh: "#000000", cShpTb: "#ffffff", cShpTbB: "#ffffff", cShpTbC: "#ffffff", cShpTbD: "#ffffff", cTkBar: "#b00020", cTkLine: "#ffffff", cTkLineB: "#ffffff", cTkLabel: "#ffffff", cTkLabelTx: "#ffffff" }
    };
    var LT_LIST = [
        { n: "Clean Bar", v: { preset: pIdx("Slide In") }, k: { optBox: true, optShp: true }, c: {} },
        { n: "Boxed Title", v: { preset: pIdx("Slide Up"), align: "1", posX: "50", posY: "86", boxOp: "60", boxPad: "34" }, k: { optBox: true, optLine: true }, c: { cBox: "#000000" } },
        { n: "Underline Slide", v: { preset: pIdx("Slide Up"), shpType: "1", shpAnim: "0" }, k: { optShp: true }, c: {} },
        { n: "Corner Frame", v: { preset: pIdx("Fade In"), align: "1", posX: "50", posY: "50", shpType: "4", shpTh: "5", shpDur: "0.9" }, k: { optShp: true }, c: { cShp: "#ffffff" } },
        { n: "Circle Badge", v: { preset: pIdx("Scale Pop"), shpType: "3", shpAnim: "1", boxOp: "70" }, k: { optShp: true, optBox: true }, c: { cShp: "#e53935" } },
        { n: "Slanted Banner", v: { preset: pIdx("Slide In"), shpType: "5", shpAnim: "0" }, k: { optShp: true }, c: { cShp: "#e53935" } },
        { n: "Top and Bottom Lines", v: { preset: pIdx("Tracking Expand"), align: "1", posX: "50", posY: "50", shpType: "2", shpTh: "4" }, k: { optShp: true }, c: { cShp: "#ffffff" } },
        { n: "Intro Title (no shapes)", g: "i", v: { preset: pIdx("Cinematic Zoom Out"), align: "1", posX: "50", posY: "50", dur: "1.6", hold: "2" }, k: { optPos: false }, c: {} },
        { n: "Left Accent Bar", v: { preset: pIdx("Slide In"), shpType: "0", shpAnim: "0", shpTh: "8" }, k: { optShp: true }, c: { cShp: "#4098e3" } },
        { n: "Right Lower Third", v: { preset: pIdx("Slide In"), align: "2", posX: "93", posY: "86", shpType: "0", shpAnim: "0", shpTh: "8" }, k: { optShp: true }, c: { cShp: "#ff9800" } },
        { n: "Soft Glass Box", v: { preset: pIdx("Blur Fade In"), align: "1", posX: "50", posY: "86", boxAnim: "4", boxOp: "45", boxPad: "30", boxRad: "14" }, k: { optBox: true }, c: { cBox: "#000000" } },
        { n: "Neon Frame", v: { preset: pIdx("Fade In"), align: "1", posX: "50", posY: "86", lineAnim: "0", lineW: "3", linePad: "24", lineRad: "6" }, k: { optLine: true }, c: { cLine: "#3fd0e8" } },
        { n: "News Bar", v: { preset: pIdx("Slide In"), posX: "7", posY: "90", boxAnim: "3", boxOp: "90", boxPad: "20", boxRad: "0", shpType: "1", shpAnim: "0", shpTh: "4" }, k: { optBox: true, optShp: true }, c: { cBox: "#b71c1c", cShp: "#ffffff" } },
        { n: "Minimal Underline Fade", v: { preset: pIdx("Fade In"), shpType: "1", shpAnim: "3", shpTh: "3" }, k: { optShp: true }, c: { cShp: "#ffffff" } },
        { n: "Name Tag Pop", v: { preset: pIdx("Scale Pop"), boxAnim: "2", boxOp: "80", boxPad: "26", boxRad: "8", lineAnim: "1", lineW: "3", linePad: "26", lineRad: "8" }, k: { optBox: true, optLine: true }, c: { cBox: "#1a1a2e", cLine: "#e53935" } },
        { n: "Center Caption", v: { preset: pIdx("Rise & Fade"), align: "1", posX: "50", posY: "88", shpType: "1", shpAnim: "0", shpTh: "3" }, k: { optShp: true }, c: { cShp: "#ffd84d" } },
        { n: "Cinematic Intro", g: "i", v: { preset: pIdx("Cinematic Zoom Out"), align: "1", posX: "50", posY: "50", dur: "2.2", hold: "2.5" }, k: { optPos: false }, c: {} },
        { n: "Tracking Reveal Intro", g: "i", v: { preset: pIdx("Tracking Blur Reveal"), align: "1", posX: "50", posY: "50", dur: "1.8", hold: "2", shpType: "2", shpTh: "4" }, k: { optShp: true }, c: { cShp: "#ffffff" } },
        { n: "Stamp Intro", g: "i", v: { preset: pIdx("Stamp Slam"), align: "1", posX: "50", posY: "50", dur: "0.9", hold: "2.5" }, k: { optPos: false }, c: {} },
        { n: "Elastic Intro", g: "i", v: { preset: pIdx("Elastic Rise"), align: "1", posX: "50", posY: "50", dur: "1.4", hold: "2.5" }, k: { optPos: false }, c: {} },
        { n: "Boxed Intro", g: "i", v: { preset: pIdx("Scale Pop"), align: "1", posX: "50", posY: "50", dur: "1.2", hold: "2.5", boxAnim: "2", boxOp: "80", boxPad: "48", boxRad: "6", lineAnim: "0", lineW: "4", linePad: "40" }, k: { optBox: true, optLine: true }, c: { cBox: "#000000", cLine: "#ffffff" } },
        { n: "Light Sweep Intro", g: "i", v: { preset: pIdx("Light Sweep"), align: "1", posX: "50", posY: "50", dur: "1.8", hold: "2.5" }, k: { optPos: false }, c: {} },
        { n: "Typewriter Intro", g: "i", v: { preset: pIdx("Typewriter"), align: "1", posX: "50", posY: "50", dur: "2", hold: "2.5" }, k: { optPos: false }, c: {} },
        { n: "Stacked Tag", v: { preset: pIdx("Slide In"), boxOp: "100", boxPad: "22", boxRad: "0", shpType: "8", shpAnim: "0", shpTh: "12" }, k: { optBox: true, optShp: true }, c: { cText: "#111111", cBox: "#ffffff", cShp: "#ff9800" } },
        { n: "Slant Echo", v: { preset: pIdx("Slide In"), boxOp: "100", boxPad: "24", boxRad: "0", boxSkew: "-20", shpType: "6", shpAnim: "0", shpTh: "3", shpOrder: "0" }, k: { optBox: true, optShp: true }, c: { cBox: "#c2185b", cShp: "#ffffff" } },
        { n: "Outline Tag", v: { preset: pIdx("Fade In"), lineAnim: "0", lineW: "3", linePad: "20", lineRad: "0", shpType: "9", shpAnim: "0", shpTh: "8" }, k: { optLine: true, optShp: true }, c: { cLine: "#ffffff", cShp: "#ff9800" } },
        { n: "Slash Name", v: { preset: pIdx("Rise & Fade"), shpType: "10", shpAnim: "0", shpTh: "6", shpOrder: "0" }, k: { optShp: true }, c: { cShp: "#ff9800" } },
        { n: "Progress Lower Third", v: { preset: pIdx("Slide In"), hold: "5", boxOp: "88", boxPad: "24", boxRad: "0", shpType: "7", shpAnim: "0", shpTh: "5" }, k: { optBox: true, optShp: true }, c: { cBox: "#111111", cShp: "#ff9800" } },
        { n: "Right Side Bar", v: { preset: pIdx("Slide In"), align: "2", posX: "93", posY: "86", shpType: "9", shpAnim: "0", shpTh: "8" }, k: { optShp: true }, c: { cShp: "#ff9800" } },
        { n: "Strip Under Name", v: { preset: pIdx("Slide Up"), shpType: "8", shpAnim: "0", shpTh: "6" }, k: { optShp: true }, c: { cShp: "#ff9800" } },
        { n: "Slant Box Title", v: { preset: pIdx("Slide In"), boxOp: "92", boxPad: "26", boxRad: "0", boxSkew: "-18" }, k: { optBox: true }, c: { cBox: "#0d47a1" } },
        { n: "Echo Frame Intro", g: "i", v: { preset: pIdx("Scale Pop"), align: "1", posX: "50", posY: "50", dur: "1.2", hold: "2.5", boxAnim: "2", boxOp: "90", boxPad: "40", boxRad: "0", shpType: "6", shpAnim: "0", shpTh: "3", shpOrder: "1" }, k: { optBox: true, optShp: true }, c: { cBox: "#111111", cShp: "#ffffff" } },
        { n: "Slant Title Intro", g: "i", v: { preset: pIdx("Tracking Blur Reveal"), align: "1", posX: "50", posY: "50", dur: "1.4", hold: "3", boxAnim: "0", boxOp: "95", boxPad: "36", boxRad: "0", boxSkew: "-18", shpType: "7", shpAnim: "0", shpTh: "5" }, k: { optBox: true, optShp: true }, c: { cBox: "#c2185b", cShp: "#ffffff" } },
        { n: "Strip Title Intro", g: "i", v: { preset: pIdx("Rise & Fade"), align: "1", posX: "50", posY: "50", dur: "1.2", hold: "2.5", boxAnim: "5", boxOp: "100", boxPad: "34", boxRad: "0", shpType: "8", shpAnim: "0", shpTh: "14" }, k: { optBox: true, optShp: true }, c: { cText: "#111111", cBox: "#ffffff", cShp: "#ff9800" } },
        { n: "Frame and Lines Intro", g: "i", v: { preset: pIdx("Tracking Expand"), align: "1", posX: "50", posY: "50", dur: "1.6", hold: "3", lineAnim: "0", lineW: "3", linePad: "46", lineRad: "0", shpType: "2", shpAnim: "0", shpTh: "3" }, k: { optLine: true, optShp: true }, c: { cLine: "#ffffff", cShp: "#ffffff" } },
        { n: "Slash Reveal Intro", g: "i", v: { preset: pIdx("Slide In"), align: "1", posX: "50", posY: "50", dur: "1.2", hold: "2.5", shpType: "10", shpAnim: "0", shpTh: "8", shpOrder: "0" }, k: { optShp: true }, c: { cShp: "#ff9800" } },
        { n: "News Ticker Red", g: "t", v: { rollMode: "3", rollSpeed: "220", posX: "50", posY: "92", delay: "0.5", tkAnim: "2", tkBarH: "110", tkBarOp: "94", tkLineW: "4", tkLabel: "BREAKING NEWS" }, k: { tkBarOn: true, tkLabelOn: true }, c: { cTkBar: "#b00020", cTkLine: "#ffffff", cTkLabel: "#ffffff" } },
        { n: "News Ticker Blue", g: "t", v: { rollMode: "3", rollSpeed: "200", posX: "50", posY: "92", delay: "0.5", tkAnim: "0", tkBarH: "110", tkBarOp: "95", tkLineW: "5", tkLabel: "LIVE" }, k: { tkBarOn: true, tkLabelOn: true }, c: { cTkBar: "#0d2b5c", cTkLine: "#ffc107", cTkLabel: "#ffc107" } },
        { n: "News Ticker Dark", g: "t", v: { rollMode: "3", rollSpeed: "240", posX: "50", posY: "92", delay: "0.4", tkAnim: "3", tkBarH: "100", tkBarOp: "88", tkLineW: "3", tkLabel: "NEWS" }, k: { tkBarOn: true, tkLabelOn: true }, c: { cTkBar: "#101010", cTkLine: "#e53935", cTkLabel: "#e53935" } },
        { n: "Credits Roll Up", g: "t", v: { rollMode: "1", rollSpeed: "90", align: "1", posX: "50", posY: "50", delay: "0.5" }, k: {}, c: {} },
        { n: "Weather Alert Ticker", g: "t", v: { rollMode: "3", rollSpeed: "210", posX: "50", posY: "92", delay: "0.4", tkAnim: "2", tkBarH: "104", tkBarOp: "94", tkLineW: "4", tkLabel: "WEATHER" }, k: { tkBarOn: true, tkLabelOn: true }, c: { cTkBar: "#e65100", cTkLine: "#ffffff", cTkLabel: "#ffffff" } },
        { n: "Finance Ticker", g: "t", v: { rollMode: "3", rollSpeed: "180", posX: "50", posY: "94", delay: "0.4", tkAnim: "3", tkBarH: "92", tkBarOp: "95", tkLineW: "3", tkLabel: "MARKETS" }, k: { tkBarOn: true, tkLabelOn: true }, c: { cTkBar: "#0d1b2a", cTkLine: "#00e676", cTkLabel: "#00e676" } },
        { n: "Sports Ticker", g: "t", v: { rollMode: "3", rollSpeed: "230", posX: "50", posY: "92", delay: "0.4", tkAnim: "6", tkBarH: "104", tkBarOp: "95", tkLineW: "4", tkLabel: "SPORTS", tkLblAnim: "1" }, k: { tkBarOn: true, tkLabelOn: true }, c: { cTkBar: "#0b3d2e", cTkLine: "#ffd600", cTkLabel: "#ffd600" } },
        { n: "Election Ticker", g: "t", v: { rollMode: "3", rollSpeed: "200", posX: "50", posY: "92", delay: "0.4", tkAnim: "4", tkBarH: "108", tkBarOp: "96", tkLineW: "4", tkLabel: "ELECTION", tkLblAnim: "2", tkLblExt: "30" }, k: { tkBarOn: true, tkLabelOn: true }, c: { cTkBar: "#14213d", cTkLine: "#fca311", cTkLabel: "#fca311" } },
        { n: "Modern White Bar", g: "t", v: { rollMode: "3", rollSpeed: "210", posX: "50", posY: "92", delay: "0.4", tkAnim: "5", tkBarH: "100", tkBarOp: "94", tkLineW: "0", tkLabel: "LIVE", tkLblAnim: "5" }, k: { tkBarOn: true, tkLabelOn: true }, c: { cText: "#111111", cTkBar: "#ffffff", cTkLine: "#ffffff", cTkLabel: "#d50000" } },
        { n: "Wide Label Crawl", g: "t", v: { rollMode: "3", rollSpeed: "210", posX: "50", posY: "92", delay: "0.4", tkAnim: "3", tkBarH: "112", tkBarOp: "94", tkLineW: "3", tkLabel: "BREAKING NEWS", tkLblAnim: "0", tkLblSz: "54", tkLblExt: "120" }, k: { tkBarOn: true, tkLabelOn: true, tkLabelTxAuto: false }, c: { cTkBar: "#1b1b1b", cTkLine: "#ff1744", cTkLabel: "#ff1744", cTkLabelTx: "#ffffff" } },
        { n: "Tech Neon Crawl", g: "t", v: { rollMode: "3", rollSpeed: "240", posX: "50", posY: "92", delay: "0.4", tkAnim: "7", tkBarH: "98", tkBarOp: "95", tkLineW: "3", tkLabel: "TECH", tkLblAnim: "4" }, k: { tkBarOn: true, tkLabelOn: true }, c: { cText: "#e0f7ff", cTkBar: "#0a0a14", cTkLine: "#00e5ff", cTkLabel: "#00e5ff" } },
        { n: "Traffic Update", g: "t", v: { rollMode: "3", rollSpeed: "200", posX: "50", posY: "92", delay: "0.4", tkAnim: "8", tkBarH: "104", tkBarOp: "94", tkLineW: "5", tkLabel: "TRAFFIC", tkLblAnim: "1" }, k: { tkBarOn: true, tkLabelOn: true }, c: { cTkBar: "#263238", cTkLine: "#ff6f00", cTkLabel: "#ff6f00" } },
        { n: "Top Live Banner", g: "t", v: { rollMode: "3", rollSpeed: "220", posX: "50", posY: "8", delay: "0.4", tkAnim: "9", tkBarH: "96", tkBarOp: "95", tkLineW: "2", tkLabel: "LIVE EVENT", tkLblAnim: "0", tkLblExt: "40" }, k: { tkBarOn: true, tkLabelOn: true }, c: { cTkBar: "#4a148c", cTkLine: "#ffffff", cTkLabel: "#ff1744" } },
        { n: "Headline Big Bar", g: "t", v: { rollMode: "3", rollSpeed: "190", posX: "50", posY: "90", delay: "0.4", tkAnim: "5", tkBarH: "170", tkBarOp: "95", tkLineW: "6", tkLabel: "TOP STORY", tkLblAnim: "4", tkLblSz: "80" }, k: { tkBarOn: true, tkLabelOn: true }, c: { cTkBar: "#b71c1c", cTkLine: "#ffffff", cTkLabel: "#ffffff" } },
        { n: "Left Credits Roll", g: "t", v: { rollMode: "1", rollSpeed: "80", align: "0", posX: "10", posY: "50", delay: "0.5" }, k: {}, c: {} },
        { n: "Right Credits Roll", g: "t", v: { rollMode: "1", rollSpeed: "80", align: "2", posX: "90", posY: "50", delay: "0.5" }, k: {}, c: {} }
    ];
    var TPL_V = ["preset", "interp", "dir", "align", "delay", "dur", "hold", "fadeDur", "endDur", "endMode", "posX", "posY",
        "boxAnim", "boxOp", "boxPad", "boxRad", "boxDur", "lineAnim", "lineW", "linePad", "lineRad", "lineDur", "shpType", "shpAnim", "shpTh", "shpDur", "shpDelay", "shpFx", "shpFxSp", "shpLen", "shpGap", "shpOffX", "shpOffY", "shpRot", "shpRad", "shpPad", "shpOp", "shpLnW", "shpShSoft", "shpShDist", "shpSkew", "shpTbW", "shpTbWB", "shpTbWC", "shpTbWD", "shpTbHs", "shpTbVs", "shpTbAnim", "shpTbDur", "shpTbGap", "shpTbDelay", "shpInterp", "boxSkew", "lineSkew", "shpOrder", "rollMode", "rollSpeed", "rollGapIn", "rollGapOut", "crawlLines", "crawlSep", "crawlSepText", "tkAnim", "tkBarH", "tkBarOp", "tkLineW", "tkLineWB", "tkLineAnim", "tkLabel", "tkLblAnim", "tkLblSz", "tkLblExt", "tkTxY", "tkLblTxY", "tkLblTxIn", "tkLblTxFx", "tkLblTxDur", "tkLblTxSp", "tkLblTxAmt", "tkLblTxMode", "animFx", "animSp", "animAmt"];
    var TPL_K = ["optBox", "optLine", "optShp", "optShpLn", "optShpSh", "optShpTb", "shpTbSep", "shpTbOrV", "shpTbOrA", "optPos", "optEnd", "tkBarOn", "tkLineSep", "tkLabelOn", "tkLabelTxAuto", "tkLblTxOn", "optAnimate"];
    var TPL_C = ["cText", "cBox", "cLine", "cShp", "cShpLn", "cShpSh", "cShpTb", "cShpTbB", "cShpTbC", "cShpTbD", "cTkBar", "cTkLine", "cTkLineB", "cTkLabel", "cTkLabelTx"];
    (function ltInit() {
        var LKEY = "qbt_lttpl_v1", sel = $("ltPick"), sd = $("ltSD"), rsel = $("rtPick"), rsd = $("rtSD"), nameT = LT_LIST[0].n, nameR = "", mine = [], building = false;
        function load() {
            var raw, k;
            mine = [];
            try {
                raw = JSON.parse(localStorage.getItem(LKEY) || "[]");
            }
            catch (e) {
                raw = [];
            }
            if (!raw || raw.length === undefined) {
                raw = [];
            }
            for (k = 0; k < raw.length; k++) {
                if (raw[k] && raw[k].name && raw[k].o) {
                    mine.push({ name: cleanName(raw[k].name), o: raw[k].o, t: (raw[k].t === "l" || raw[k].t === "i" || raw[k].t === "t") ? raw[k].t : undefined });
                }
            }
        }
        function store() { try {
            localStorage.setItem(LKEY, JSON.stringify(mine));
        }
        catch (e) { } }
        function findMine(name) { var k, low = String(name).toLowerCase(); for (k = 0; k < mine.length; k++) {
            if (mine[k].name.toLowerCase() === low) {
                return k;
            }
        } return -1; }
        function findBuilt(name) { var k, low = String(name).toLowerCase(); for (k = 0; k < LT_LIST.length; k++) {
            if (LT_LIST[k].n.toLowerCase() === low) {
                return k;
            }
        } return -1; }
        function keyOf(c) { return (c.own ? "u:" : "b:") + c.i; }
        function info(v) {
            var n;
            if (!v) {
                return null;
            }
            n = parseInt(v.substr(2), 10);
            if (v.charAt(0) === "b" && LT_LIST[n]) {
                return { own: false, n: LT_LIST[n].n, i: n };
            }
            if (v.charAt(0) === "u" && mine[n]) {
                return { own: true, n: mine[n].name, i: n };
            }
            return null;
        }
        function byName(name) {
            var i = findBuilt(name);
            if (i >= 0) {
                return { own: false, n: LT_LIST[i].n, i: i };
            }
            i = findMine(name);
            return i >= 0 ? { own: true, n: mine[i].name, i: i } : null;
        }
        function chosen() { return info(sel.value); }
        function tagOfMine(m) {
            if (m.t === "l" || m.t === "i" || m.t === "t") {
                return m.t;
            }
            return (m.o && m.o.v && parseInt(m.o.v.rollMode, 10) > 0) ? "t" : "l";
        }
        function kcode(c) { return c.own ? tagOfMine(mine[c.i]) : (LT_LIST[c.i].g === "i" ? "i" : (LT_LIST[c.i].g === "t" ? "t" : "l")); }
        function chosenR() { return info(rsel.value); }
        function readNames() { var a = info(sel.value), b = info(rsel.value); nameT = (sel.value === "n:0") ? "@none" : (a ? a.n : ""); nameR = b ? b.n : ""; }
        function builtO(i) {
            var o = { v: {}, k: {}, c: {} }, t = LT_LIST[i], key;
            for (key in LT_BASE.v) {
                o.v[key] = LT_BASE.v[key];
            }
            for (key in t.v) {
                o.v[key] = t.v[key];
            }
            for (key in LT_BASE.k) {
                o.k[key] = LT_BASE.k[key];
            }
            for (key in t.k) {
                o.k[key] = t.k[key];
            }
            for (key in LT_BASE.c) {
                o.c[key] = LT_BASE.c[key];
            }
            for (key in t.c) {
                o.c[key] = t.c[key];
            }
            return o;
        }
        function oOf(c) { return c.own ? mine[c.i].o : builtO(c.i); }
        function clean(o) {
            var r = { v: {}, k: {}, c: {} }, i, x;
            if (!o || typeof o !== "object") {
                return null;
            }
            for (i = 0; i < TPL_V.length; i++) {
                x = o.v ? o.v[TPL_V[i]] : undefined;
                if (x !== undefined && x !== null && String(x).length < 40) {
                    r.v[TPL_V[i]] = String(x);
                }
            }
            for (i = 0; i < TPL_K.length; i++) {
                x = o.k ? o.k[TPL_K[i]] : undefined;
                if (x !== undefined) {
                    r.k[TPL_K[i]] = !!x;
                }
            }
            for (i = 0; i < TPL_C.length; i++) {
                x = o.c ? o.c[TPL_C[i]] : undefined;
                if (x && parseHex(x)) {
                    r.c[TPL_C[i]] = String(x);
                }
            }
            return r;
        }
        function buttons() {
            var c = chosen(), r = chosenR();
            sd.setAttribute("data-mode", (c && c.own) ? "del" : "save");
            sd.title = (c && c.own) ? "Delete the chosen template" : "Save the current look as a new template (it gets the tag Lower third or Intro)";
            rsd.setAttribute("data-mode", (r && r.own) ? "del" : "save");
            rsd.title = (r && r.own) ? "Delete the chosen roll / crawl preset" : "Save the current rolling / crawling settings as a new preset (it gets the tag Roll / crawl)";
        }
        function fill(pick) {
            var k, gm, gr, lt = document.createElement("optgroup"), it = document.createElement("optgroup"), tk = document.createElement("optgroup"), cT, cR, cp2, firstRoll = 0;
            building = true;
            if (pick) {
                cp2 = info(pick);
                if (cp2) {
                    if (kcode(cp2) === "t") {
                        nameR = cp2.n;
                    }
                    else {
                        nameT = cp2.n;
                    }
                }
            }
            sel.innerHTML = "";
            rsel.innerHTML = "";
            sel.appendChild(new Option("None", "n:0"));
            lt.label = "Ready made: Lower thirds";
            it.label = "Ready made: Intros";
            tk.label = "Ready made: Rolling & crawling";
            for (k = 0; k < LT_LIST.length; k++) {
                if (LT_LIST[k].g === "t") {
                    tk.appendChild(new Option(LT_LIST[k].n, "b:" + k));
                    if (!firstRoll) {
                        firstRoll = k;
                    }
                }
                else {
                    (LT_LIST[k].g === "i" ? it : lt).appendChild(new Option(LT_LIST[k].n, "b:" + k));
                }
            }
            sel.appendChild(lt);
            sel.appendChild(it);
            rsel.appendChild(tk);
            gm = document.createElement("optgroup");
            gm.label = "My templates";
            gr = document.createElement("optgroup");
            gr.label = "My roll / crawl presets";
            for (k = 0; k < mine.length; k++) {
                if (tagOfMine(mine[k]) === "t") {
                    gr.appendChild(new Option(mine[k].name, "u:" + k));
                }
                else {
                    gm.appendChild(new Option(mine[k].name, "u:" + k));
                }
            }
            if (gm.children.length) {
                sel.appendChild(gm);
            }
            if (gr.children.length) {
                rsel.appendChild(gr);
            }
            cT = (nameT && nameT !== "@none") ? byName(nameT) : null;
            sel.value = (nameT === "@none") ? "n:0" : ((cT && kcode(cT) !== "t") ? keyOf(cT) : "b:0");
            cR = nameR ? byName(nameR) : null;
            rsel.value = (cR && kcode(cR) === "t") ? keyOf(cR) : "b:" + firstRoll;
            if (sel.selectedIndex < 0) {
                sel.selectedIndex = 0;
            }
            if (rsel.selectedIndex < 0) {
                rsel.selectedIndex = 0;
            }
            building = false;
            readNames();
            buttons();
            qbHub.refresh();
        }
        function hubItems() {
            var out = [], k;
            for (k = 0; k < LT_LIST.length; k++) {
                out.push({ name: LT_LIST[k].n, tag: (LT_LIST[k].g === "i" ? "i" : (LT_LIST[k].g === "t" ? "t" : "l")), own: false });
            }
            for (k = 0; k < mine.length; k++) {
                out.push({ name: mine[k].name, tag: tagOfMine(mine[k]), own: true });
            }
            return out;
        }
        function snap() {
            var o = { v: {}, k: {}, c: {} }, i;
            for (i = 0; i < TPL_V.length; i++) {
                o.v[TPL_V[i]] = $(TPL_V[i]).value;
            }
            for (i = 0; i < TPL_K.length; i++) {
                o.k[TPL_K[i]] = $(TPL_K[i]).checked;
            }
            for (i = 0; i < TPL_C.length; i++) {
                o.c[TPL_C[i]] = getColor(TPL_C[i]);
            }
            return o;
        }
        function save(kind) {
            var rollNow = (parseInt($("rollMode").value, 10) || 0) > 0;
            if (kind === "t" && !rollNow) {
                note("Choose a Mode other than Off in the Rolling & crawling title section first.", "err");
                return;
            }
            if (!kind && rollNow) {
                kind = "t";
            }
            ask({ msg: kind === "t" ? "Save the current rolling / crawling settings as a preset (tag: Roll & crawl).\n\nName:" : "Save the current look (animation, position, colours and the shape sections) as a template.\n\nName and tag:", input: true, value: "", ok: "Save",
                radios: kind === "t" ? null : [{ v: "l", t: "Lower third" }, { v: "i", t: "Intro & outro" }], radio: "l", full: true }, function (name) {
                var n, at, tagSel = (kind === "t") ? "t" : (dlgRadioVal() || "l");
                if (name === null || name === false) {
                    return;
                }
                n = cleanName(name);
                if (!n) {
                    note("Type a name for the template.", "err");
                    return;
                }
                if (findBuilt(n) >= 0) {
                    ask({ msg: "\"" + n + "\" is the name of a ready made template. Choose another name.", cancel: false });
                    return;
                }
                at = findMine(n);
                function put(tag) {
                    var idx = findMine(n);
                    if (idx >= 0) {
                        mine[idx].o = snap();
                        mine[idx].t = tag;
                    }
                    else {
                        mine.push({ name: n, o: snap(), t: tag });
                        idx = mine.length - 1;
                    }
                    store();
                    fill("u:" + idx);
                    qbHub.select("m", n);
                    note((tag === "t" ? "Preset saved: " : "Template saved: ") + n, "ok");
                    log("Template saved: " + n + " (" + (tag === "i" ? "Intro & outro" : (tag === "t" ? "Roll & crawl" : "Lower third")) + ")", "ok");
                }
                function pickTag() { put(tagSel); }
                if (at >= 0) {
                    ask({ msg: "A template named \"" + n + "\" already exists. Replace it?", ok: "Replace", danger: true }, function (yes) { if (yes) {
                        pickTag();
                    } });
                }
                else {
                    pickTag();
                }
            });
        }
        function delC(c) {
            if (!c || !c.own) {
                return;
            }
            ask({ msg: "Delete the template \"" + c.n + "\"?", ok: "Delete", danger: true }, function (yes) {
                var idx;
                if (!yes) {
                    return;
                }
                idx = findMine(c.n);
                if (idx >= 0) {
                    mine.splice(idx, 1);
                }
                store();
                fill();
                note("Template deleted: " + c.n, "ok");
                log("Template deleted: " + c.n, "ok");
            });
        }
        function del() { delC(chosen()); }
        function applyTpl(c) {
            applySettings(clean(oOf(c)) || oOf(c), PRESET_VALUES, PRESET_CHECKS, PRESET_COLORS);
            try {
                deselectPreset();
            }
            catch (e) { }
        }
        function applyNamed(name) {
            var c = name ? byName(name) : null;
            if (!c) {
                return;
            }
            building = true;
            if (kcode(c) === "t") {
                rsel.value = keyOf(c);
            }
            else {
                sel.value = keyOf(c);
            }
            building = false;
            readNames();
            buttons();
            applyTpl(c);
            log("Template applied: " + c.n, "ok");
            note("Template applied successfully: " + c.n, "ok");
        }
        var SHP_V = ["shpOrder", "shpInterp", "boxAnim", "boxOp", "boxPad", "boxRad", "boxDur", "boxSkew", "lineAnim", "lineW", "linePad", "lineRad", "lineDur", "lineSkew",
            "shpType", "shpAnim", "shpTh", "shpDur", "shpDelay", "shpFx", "shpFxSp", "shpLen", "shpGap", "shpOffX", "shpOffY", "shpRot", "shpRad", "shpPad", "shpOp", "shpLnW", "shpShSoft", "shpShDist", "shpSkew", "shpTbW", "shpTbWB", "shpTbWC", "shpTbWD", "shpTbHs", "shpTbVs", "shpTbAnim", "shpTbDur", "shpTbGap", "shpTbDelay"];
        var SHP_K = ["optBox", "optLine", "optShp", "optShpLn", "optShpSh", "optShpTb", "shpTbSep", "shpTbOrV", "shpTbOrA"];
        var SHP_C = ["cBox", "cLine", "cShp", "cShpLn", "cShpSh", "cShpTb", "cShpTbB", "cShpTbC", "cShpTbD"];
        function resetShapes() {
            var o = { v: {}, k: {}, c: {} }, i, id;
            for (i = 0; i < SHP_V.length; i++) {
                id = SHP_V[i];
                o.v[id] = (DEFAULTS.v[id] !== undefined) ? DEFAULTS.v[id] : LT_BASE.v[id];
            }
            for (i = 0; i < SHP_K.length; i++) {
                id = SHP_K[i];
                o.k[id] = false;
            }
            for (i = 0; i < SHP_C.length; i++) {
                id = SHP_C[i];
                o.c[id] = (DEFAULTS.c[id] !== undefined) ? DEFAULTS.c[id] : LT_BASE.c[id];
            }
            applySettings(o, SHP_V, SHP_K, SHP_C);
            saveSettings();
            log("Shape options were reset (Template: None).", "ok");
            note("Shape options reset: you can build the shapes from zero.", "ok");
        }
        sel.addEventListener("change", function () {
            var c;
            if (building) {
                return;
            }
            readNames();
            buttons();
            if (sel.value === "n:0") {
                qbHub.select("", "");
                resetShapes();
                return;
            }
            c = chosen();
            if (c) {
                qbHub.select("m", c.n);
            }
        }, false);
        sd.addEventListener("click", function () { var c = chosen(); if (c && c.own) {
            del();
        }
        else {
            save();
        } }, false);
        rsel.addEventListener("change", function () {
            var c;
            if (building) {
                return;
            }
            readNames();
            buttons();
            c = chosenR();
            if (c) {
                qbHub.select("m", c.n);
            }
        }, false);
        rsd.addEventListener("click", function () { var c = chosenR(); if (c && c.own) {
            delC(c);
        }
        else {
            save("t");
        } }, false);
        $("rtApply").onclick = function () {
            var c = chosenR();
            if (!c) {
                return;
            }
            applyTpl(c);
            log("Roll preset applied: " + c.n, "ok");
            note("Roll preset applied successfully: " + c.n, "ok");
        };
        $("ltApply").onclick = function () {
            var c = chosen();
            if (!c) {
                return;
            }
            ask({ msg: "Apply the template \"" + c.n + "\"?\n\nYour current custom changes (animation, timing, position, colours and the shape sections) will be replaced by the template. Your text and font stay.",
                ok: "Apply", okKind: "good", noKind: "danger", row: true, focus: "no" }, function (yes) { if (yes) {
                applyTpl(c);
            } });
        };
        function rm(name) { var idx = findMine(name); if (idx < 0) {
            return false;
        } mine.splice(idx, 1); store(); fill(); return true; }
        function getO(name) { var c = byName(name); return c ? { name: c.n, t: kcode(c), o: clean(oOf(c)) } : null; }
        function importItems(items, done) {
            var queue = [], pos = 0, n = 0, bad = 0, first = "", cancelled = false, k, c;
            for (k = 0; k < items.length; k++) {
                c = items[k] && items[k].name ? clean(items[k].o) : null;
                if (c) {
                    queue.push({ name: items[k].name, o: c, t: (items[k].t === "l" || items[k].t === "i" || items[k].t === "t") ? items[k].t : undefined });
                }
                else {
                    bad++;
                }
            }
            function put(name, o2, t2) {
                var idx = findMine(name);
                if (idx >= 0) {
                    mine[idx].o = o2;
                    mine[idx].t = t2;
                }
                else {
                    mine.push({ name: name, o: o2, t: t2 });
                }
                if (!first) {
                    first = name;
                }
                n++;
            }
            function numbered(base) { var nm = base, x; for (x = 2; findMine(nm) >= 0 || findBuilt(nm) >= 0; x++) {
                nm = base + " (" + x + ")";
            } return nm; }
            function step() {
                var it, base;
                while (pos < queue.length && !cancelled) {
                    it = queue[pos++];
                    base = cleanName(it.name) || "Imported template";
                    if (findBuilt(base) >= 0) {
                        put(numbered(base), it.o, it.t);
                        continue;
                    }
                    if (findMine(base) >= 0) {
                        ask({ msg: "A template named \"" + base + "\" already exists.\n\nReplace it, keep both (the new one gets a number at the end), or cancel the import?", ok: "Replace", okKind: "danger", alt: "Keep Both", altKind: "good", noKind: "" }, (function (b, oo, tt) {
                            return function (res) {
                                if (res === true) {
                                    put(b, oo, tt);
                                }
                                else if (res === "alt") {
                                    put(numbered(b), oo, tt);
                                }
                                else {
                                    cancelled = true;
                                }
                                step();
                            };
                        })(base, it.o, it.t));
                        return;
                    }
                    put(base, it.o, it.t);
                }
                finish();
            }
            function finish() {
                var idx;
                store();
                idx = first ? findMine(first) : -1;
                fill(idx >= 0 ? "u:" + idx : (sel.value || "b:0"));
                done({ n: n, bad: bad, cancelled: cancelled, first: first });
            }
            step();
        }
        qbHub.src.m = { items: hubItems, apply: applyNamed, rm: rm, get: getO, add: importItems };
        load();
        fill();
    })();
    (function accordion() {
        var AKEY = "qbt_acc_v1", MKEY = "qbt_acc_multi_v1", secs = [], pages = ["pText", "pOut"], p, kids, k, fs, lg, hd, hue = 0, mode = "";
        function rd(key) { try {
            return localStorage.getItem(key) || "";
        }
        catch (e0) {
            return "";
        } }
        function wr(key, v) { try {
            localStorage.setItem(key, v);
        }
        catch (e1) { } }
        function isOpen(sec) { return sec.fs.className.indexOf("accopen") >= 0; }
        function setCls(sec, on) { sec.fs.className = sec.fs.className.replace(/\s*\baccopen\b/g, "") + (on ? " accopen" : ""); }
        function repaint() {
            setTimeout(function () { try {
                qbHub.flush();
                paintSliders();
                drawFxPreview();
                posRender();
                shpRender();
                if (window.QBT_rollRender) {
                    window.QBT_rollRender();
                }
            }
            catch (e2) { } }, 0);
        }
        function saveSingle() { var i, t = "-"; for (i = 0; i < secs.length; i++) {
            if (isOpen(secs[i])) {
                t = secs[i].title;
            }
        } wr(AKEY, t); }
        var TKEY = "qbt_acc_tabs_v2", tabsState = {};
        try {
            localStorage.removeItem(MKEY);
        }
        catch (e4) { }
        try {
            tabsState = JSON.parse(rd(TKEY) || "{}") || {};
        }
        catch (e7) {
            tabsState = {};
        }
        function saveTabs() {
            var i2;
            if (mode !== "multi") {
                return;
            }
            for (i2 = 0; i2 < secs.length; i2++) {
                tabsState[secs[i2].title] = isOpen(secs[i2]) ? 1 : 0;
            }
            wr(TKEY, JSON.stringify(tabsState));
        }
        function click(sec) {
            var i, on = !isOpen(sec);
            if (mode === "single") {
                for (i = 0; i < secs.length; i++) {
                    setCls(secs[i], on && secs[i] === sec);
                }
                saveSingle();
            }
            else {
                setCls(sec, on);
                saveTabs();
            }
            syncFoldBtn();
            try {
                cpClose();
                ddAccent.close();
                ddBtn.close();
            }
            catch (e5) { }
            repaint();
        }
        function add(fs, title, hd) {
            var sec = { fs: fs, title: title, hd: hd };
            hd.onclick = function () { click(sec); };
            fs.insertBefore(hd, fs.firstChild);
            secs.push(sec);
            return sec;
        }
        function make(fs, title) {
            var hd = document.createElement("div");
            hd.className = "acch acc-h" + (hue++ % 6);
            hd.innerHTML = '<span class="acct"></span><span class="accarr"></span>';
            hd.firstChild.textContent = title;
            fs.className += " acc";
            return add(fs, title, hd);
        }
        for (p = 0; p < pages.length; p++) {
            kids = $(pages[p]).children;
            for (k = 0; k < kids.length; k++) {
                fs = kids[k];
                if (fs.tagName !== "FIELDSET") {
                    continue;
                }
                lg = null;
                for (hd = fs.firstChild; hd; hd = hd.nextSibling) {
                    if (hd.tagName === "LEGEND") {
                        lg = hd;
                        break;
                    }
                }
                if (lg) {
                    make(fs, lg.textContent.replace(/^\s+|\s+$/g, ""));
                }
            }
        }
        var foldBtn = $("foldAll");
        function anyOpen() { var i; for (i = 0; i < secs.length; i++) {
            if (isOpen(secs[i])) {
                return true;
            }
        } return false; }
        function syncFoldBtn() {
            var open = anyOpen();
            foldBtn.style.display = (mode === "multi") ? "" : "none";
            foldBtn.setAttribute("data-mode", open ? "foldall" : "unfoldall");
            foldBtn.title = open ? "Fold every open section at once" : "Unfold every folded section at once";
        }
        foldBtn.onclick = function () {
            var open = anyOpen(), i;
            for (i = 0; i < secs.length; i++) {
                setCls(secs[i], !open);
            }
            saveTabs();
            try {
                cpClose();
                ddAccent.close();
                ddBtn.close();
            }
            catch (e6) { }
            syncFoldBtn();
            repaint();
        };
        function applyMode(m) {
            var i, saved, start = null, tip;
            if (m === mode) {
                return;
            }
            mode = m;
            tip = (m === "multi") ? "Click to fold or unfold this section (the others stay as they are)" : "Click to open this section (the others close). Click again to fold it.";
            for (i = 0; i < secs.length; i++) {
                secs[i].hd.title = tip;
            }
            if (m === "single") {
                {
                    saved = rd(AKEY);
                    for (i = 0; i < secs.length; i++) {
                        if (secs[i].title === saved) {
                            start = secs[i];
                        }
                    }
                    if (!start && saved !== "-" && secs.length) {
                        start = secs[0];
                    }
                }
                for (i = 0; i < secs.length; i++) {
                    setCls(secs[i], secs[i] === start);
                }
            }
            else if (m === "multi") {
                for (i = 0; i < secs.length; i++) {
                    setCls(secs[i], tabsState[secs[i].title] !== 0);
                }
            }
            syncFoldBtn();
            repaint();
        }
        window.QBT_accSet = function (el, on) {
            var i, sec = null;
            for (i = 0; i < secs.length; i++) {
                if (secs[i].fs === el) {
                    sec = secs[i];
                }
            }
            if (!sec || mode === "off" || isOpen(sec) === !!on) {
                return false;
            }
            click(sec);
            return true;
        };
        window.QBT_accIsOpen = function (el) {
            var i;
            for (i = 0; i < secs.length; i++) {
                if (secs[i].fs === el) {
                    return isOpen(secs[i]);
                }
            }
            return true;
        };
        window.QBT_accMode = function (tabsOn, accTabs) {
            var m = !tabsOn ? "single" : (accTabs ? "multi" : "off");
            if (m === "off") {
                document.documentElement.removeAttribute("data-acc");
            }
            else {
                document.documentElement.setAttribute("data-acc", "on");
            }
            applyMode(m);
        };
    })();
    (function aboutFold() {
        var box = $("qbHelp"), hd = $("qbHelpHd"), KEY = "qbt_about_open_v1", open = false;
        try {
            open = localStorage.getItem(KEY) === "1";
        }
        catch (e) { }
        function paint() { box.className = "qbfold" + (open ? " open" : ""); }
        hd.onclick = function () {
            open = !open;
            paint();
            try {
                localStorage.setItem(KEY, open ? "1" : "0");
            }
            catch (e) { }
        };
        paint();
    })();
    function syncSafe() {
        var on = $("optSafe").checked, cu = on && $("optSafeCustom").checked, i, ids = ["safeT", "safeL", "safeB", "safeR"], pct = ($("safeUnit").value === "pct");
        $("safeW").disabled = !on;
        $("safeH").disabled = !on;
        $("rSafeW").className = "row" + (on ? "" : " off");
        $("rSafeH").className = "row" + (on ? "" : " off");
        $("optSafeCustom").disabled = !on;
        $("lblSafeCustom").className = "check" + (on ? "" : " off");
        $("safePx").checked = !pct;
        $("safePct").checked = pct;
        $("safePx").disabled = !cu;
        $("safePct").disabled = !cu;
        $("lblSafePx").className = "check sunit" + (cu ? "" : " off");
        $("lblSafePct").className = "check sunit" + (cu ? "" : " off");
        for (i = 0; i < ids.length; i++) {
            $(ids[i]).disabled = !cu;
            $(ids[i]).setAttribute("data-step", pct ? "1" : "10");
            if (pct) {
                $(ids[i]).setAttribute("max", "100");
            }
            else {
                $(ids[i]).removeAttribute("max");
            }
        }
        $("safeGrid").className = "sagrid" + (cu ? "" : " off");
        $("safeOpts").style.display = on ? "" : "none";
        $("safeGrid").style.display = cu ? "" : "none";
    }
    function safeEdge(id, dim) {
        var v = Math.max(0, num(id, 0));
        return ($("safeUnit").value === "pct") ? Math.round(Math.min(100, v) * dim / 100) : v;
    }
    function safeUnitTo(u) {
        var set = [["safeT", "compH", 1080], ["safeB", "compH", 1080], ["safeL", "compW", 1920], ["safeR", "compW", 1920]], i, dim, v;
        if ($("safeUnit").value === u) {
            return;
        }
        for (i = 0; i < set.length; i++) {
            dim = Math.max(16, num(set[i][1], set[i][2]));
            v = Math.max(0, num(set[i][0], 0));
            v = (u === "pct") ? Math.min(100, Math.round(v / dim * 1000) / 10) : Math.round(v * dim / 100);
            $(set[i][0]).value = String(v);
        }
        $("safeUnit").value = u;
        syncSafe();
        saveSettings();
    }
    $("safePx").addEventListener("change", function () { if (this.checked) {
        safeUnitTo("px");
    } }, false);
    $("safePct").addEventListener("change", function () { if (this.checked) {
        safeUnitTo("pct");
    } }, false);
    $("optSafe").addEventListener("change", syncSafe, false);
    $("optSafeCustom").addEventListener("change", syncSafe, false);
    syncSafe();
    function syncPos() {
        var on = $("optPos").checked, ids = ["posX", "posY"], i;
        for (i = 0; i < ids.length; i++) {
            $(ids[i]).disabled = !on;
            $(ids[i] + "Sl").disabled = !on;
        }
        $("rPosX").style.display = on ? "" : "none";
        $("rPosY").style.display = on ? "" : "none";
        $("posPrevBox").style.display = on ? "" : "none";
        $("rPosPre").style.display = on ? "" : "none";
        posLive.sync();
    }
    $("optPos").addEventListener("change", syncPos, false);
    syncPos();
    if ($("align").selectedIndex < 0) {
        $("align").selectedIndex = 1;
    }
    (function watch() {
        var i, ids = P_VALUES.concat(P_CHECKS);
        for (i = 0; i < ids.length; i++) {
            $(ids[i]).addEventListener("input", saveSettings, false);
            $(ids[i]).addEventListener("change", saveSettings, false);
        }
    })();
    (function dropGuard() {
        function hasFiles(e) {
            var t = e.dataTransfer && e.dataTransfer.types, a;
            if (!t) {
                return false;
            }
            for (a = 0; a < t.length; a++) {
                if (t[a] === "Files") {
                    return true;
                }
            }
            return false;
        }
        document.addEventListener("dragover", function (e) { if (hasFiles(e)) {
            e.preventDefault();
        } }, false);
        document.addEventListener("drop", function (e) { if (hasFiles(e)) {
            e.preventDefault();
        } }, false);
    })();
    function stepNumber(el, dir, big) {
        if (el.disabled) {
            return;
        }
        var st = parseFloat(el.getAttribute("data-step")) || 1;
        var mn = el.getAttribute("min");
        mn = (mn === null || mn === "") ? -Infinity : parseFloat(mn);
        var dec = (String(st).split(".")[1] || "").length;
        var v = parseFloat(el.value);
        if (isNaN(v)) {
            v = 0;
        }
        var nv = parseFloat((v + dir * st * (big ? 10 : 1)).toFixed(dec));
        var mxA = el.getAttribute("max");
        if (nv < mn) {
            nv = mn;
        }
        if (mxA !== null && mxA !== "" && nv > parseFloat(mxA)) {
            nv = parseFloat(mxA);
        }
        if (el.id === "compDur" && nv <= 0) {
            el.value = "";
        }
        else {
            el.value = (dec ? nv.toFixed(dec) : String(nv));
        }
        var ev = document.createEvent("Event");
        ev.initEvent("input", true, true);
        el.dispatchEvent(ev);
    }
    window.QBT_step = function (id, dir) { stepNumber($(id), dir, false); };
    (function wheelInputs() {
        var els = document.querySelectorAll("input[data-step]"), i;
        for (i = 0; i < els.length; i++) {
            els[i].addEventListener("wheel", function (e) {
                if (!e.deltaY || this.disabled) {
                    return;
                }
                e.preventDefault();
                var now = new Date().getTime();
                if (this._lastWheel && now - this._lastWheel < 60) {
                    return;
                }
                this._lastWheel = now;
                stepNumber(this, e.deltaY < 0 ? 1 : -1, e.shiftKey);
            }, false);
        }
    })();
    var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (f) { return setTimeout(f, 16); };
    function makeSmooth(el) {
        var EASE = 0.22, MAX_LEAD = 320, pos = 0, target = 0, running = false, lastSet = 0, lastTime = 0;
        function maxTop() { return Math.max(0, el.scrollHeight - el.clientHeight); }
        function clamp(v) { return Math.min(maxTop(), Math.max(0, v)); }
        function frame() {
            var now = new Date().getTime(), dt = Math.min(64, Math.max(1, now - lastTime)), diff;
            if (!running) {
                return;
            }
            lastTime = now;
            target = clamp(target);
            diff = target - pos;
            if (Math.abs(diff) < 0.4) {
                pos = target;
                running = false;
            }
            else {
                pos += diff * (1 - Math.pow(1 - EASE, dt / 16));
            }
            lastSet = Math.round(pos);
            el.scrollTop = lastSet;
            if (running) {
                raf(frame);
            }
        }
        el.addEventListener("scroll", function () {
            if (running && Math.abs(el.scrollTop - lastSet) > 2) {
                running = false;
            }
            if (!running) {
                pos = target = el.scrollTop;
            }
        }, false);
        return {
            by: function (px) {
                if (!maxTop()) {
                    return;
                }
                if (!running) {
                    pos = target = el.scrollTop;
                }
                if (running && ((px > 0) !== (target > pos)) && Math.abs(target - pos) > 1) {
                    target = pos;
                }
                target = clamp(target + px);
                target = Math.min(pos + MAX_LEAD, Math.max(pos - MAX_LEAD, target));
                if (!running) {
                    running = true;
                    lastTime = new Date().getTime();
                    raf(frame);
                }
            }
        };
    }
    function innerCanScroll(node, root, dir) {
        var oy;
        while (node && node !== root && node.nodeType === 1) {
            if (node.scrollHeight > node.clientHeight + 1) {
                oy = window.getComputedStyle(node).overflowY;
                if (oy === "auto" || oy === "scroll") {
                    if (dir > 0 ? (node.scrollTop < node.scrollHeight - node.clientHeight - 1) : (node.scrollTop > 0)) {
                        return true;
                    }
                }
            }
            node = node.parentNode;
        }
        return false;
    }
    function smoothWheel(el, notch, chain) {
        var sm = makeSmooth(el), lastNotch = 0;
        el.addEventListener("wheel", function (e) {
            var d = e.deltaY, now, px;
            if (e.defaultPrevented || e.ctrlKey || !d) {
                return;
            }
            if (e.deltaMode === 1) {
                d *= 33;
            }
            else if (e.deltaMode === 2) {
                d *= el.clientHeight;
            }
            if (innerCanScroll(e.target, el, d > 0 ? 1 : -1)) {
                return;
            }
            if (el.scrollHeight <= el.clientHeight) {
                return;
            }
            if (chain && (d > 0 ? el.scrollTop >= el.scrollHeight - el.clientHeight - 1 : el.scrollTop <= 0)) {
                return;
            }
            e.preventDefault();
            if (Math.abs(d) >= 50) {
                now = new Date().getTime();
                if (now - lastNotch < 25) {
                    return;
                }
                lastNotch = now;
                px = (d > 0 ? 1 : -1) * notch * Math.min(3, Math.max(1, Math.round(Math.abs(d) / 100)));
            }
            else {
                px = d;
            }
            sm.by(px);
        }, false);
        return sm;
    }
    smoothWheel($("pages"), 80);
    smoothWheel($("status"), 40);
    smoothWheel($("text"), 45, true);
    var TEXT_ALIGN = ["left", "center", "right", "justify", "justify", "justify", "justify"];
    var TEXT_ALIGN_LAST = ["", "", "", "left", "center", "right", "justify"];
    function syncUI() {
        var a = parseInt($("align").value, 10), t = $("text"), tr = num("tracking", 0), lsp = num("lineSp", 0);
        t.style.textAlign = TEXT_ALIGN[a] || "center";
        try {
            t.style.textAlignLast = TEXT_ALIGN_LAST[a] || "auto";
        }
        catch (eTl) { }
        t.style.letterSpacing = (tr / 1000) + "em";
        t.style.lineHeight = lsp ? String(Math.max(0.2, 1.3 + lsp / 100)) : "";
        syncBatchStyle();
    }
    $("align").addEventListener("change", syncUI, false);
    $("tracking").addEventListener("input", syncUI, false);
    $("lineSp").addEventListener("input", syncUI, false);
    var fontIn = $("fontSearch"), fontList = $("fontList"), listOpen = false, actIdx = -1, justFocused = false, searchTimer = null;
    var FACE = (function () {
        var fs = null, made = {}, idx = null, styleEl = null, counter = 0;
        try {
            if (typeof require === "function") {
                fs = require("fs");
            }
        }
        catch (e0) {
            fs = null;
        }
        function mk(n) { return Buffer.alloc ? Buffer.alloc(n) : new Buffer(n); }
        function fontDirs() {
            var env = (typeof process !== "undefined" && process.env) ? process.env : {}, d = [];
            if (navigator.platform.indexOf("Win") === 0) {
                d.push((env.windir || env.SystemRoot || "C:\\Windows") + "\\Fonts");
                if (env.LOCALAPPDATA) {
                    d.push(env.LOCALAPPDATA + "\\Microsoft\\Windows\\Fonts");
                }
                if (env.APPDATA) {
                    d.push(env.APPDATA + "\\..\\Local\\Microsoft\\Windows\\Fonts");
                }
            }
            else {
                d.push("/Library/Fonts", "/System/Library/Fonts");
                if (env.HOME) {
                    d.push(env.HOME + "/Library/Fonts");
                }
            }
            return d;
        }
        function decode(buf, pid) {
            var o = [], j;
            if (pid === 3 || pid === 0) {
                for (j = 0; j + 1 < buf.length; j += 2) {
                    o.push(String.fromCharCode((buf[j] << 8) | buf[j + 1]));
                }
                return o.join("");
            }
            return buf.toString("binary");
        }
        function readNames(file) {
            var fd = null, res = { fonts: [], plain: false }, h, tag, offs = [0], k, cnt, dr;
            try {
                fd = fs.openSync(file, "r");
                h = mk(12);
                fs.readSync(fd, h, 0, 12, 0);
                tag = h.toString("binary", 0, 4);
                if (tag === "ttcf") {
                    cnt = Math.min(h.readUInt32BE(8), 32);
                    dr = mk(cnt * 4);
                    fs.readSync(fd, dr, 0, cnt * 4, 12);
                    offs = [];
                    for (k = 0; k < cnt; k++) {
                        offs.push(dr.readUInt32BE(k * 4));
                    }
                }
                else if (tag === "OTTO" || tag === "true" || h.readUInt32BE(0) === 65536) {
                    res.plain = true;
                }
                else {
                    offs = [];
                }
                for (k = 0; k < offs.length; k++) {
                    var hd = mk(12), nT, td, t, nOff = -1, nLen = 0, nt, cn, so, i, rec, pid, nid, len, off, e = { ps: [], full: [] };
                    fs.readSync(fd, hd, 0, 12, offs[k]);
                    nT = hd.readUInt16BE(4);
                    td = mk(nT * 16);
                    fs.readSync(fd, td, 0, nT * 16, offs[k] + 12);
                    for (t = 0; t < nT; t++) {
                        if (td.toString("binary", t * 16, t * 16 + 4) === "name") {
                            nOff = td.readUInt32BE(t * 16 + 8);
                            nLen = Math.min(td.readUInt32BE(t * 16 + 12), 262144);
                            break;
                        }
                    }
                    if (nOff < 0) {
                        continue;
                    }
                    nt = mk(nLen);
                    fs.readSync(fd, nt, 0, nLen, nOff);
                    cn = nt.readUInt16BE(2);
                    so = nt.readUInt16BE(4);
                    for (i = 0; i < cn; i++) {
                        rec = 6 + i * 12;
                        if (rec + 12 > nt.length) {
                            break;
                        }
                        pid = nt.readUInt16BE(rec);
                        nid = nt.readUInt16BE(rec + 6);
                        len = nt.readUInt16BE(rec + 8);
                        off = so + nt.readUInt16BE(rec + 10);
                        if ((nid !== 4 && nid !== 6) || (pid !== 3 && pid !== 1 && pid !== 0) || off + len > nt.length) {
                            continue;
                        }
                        (nid === 6 ? e.ps : e.full).push(decode(nt.slice(off, off + len), pid));
                    }
                    res.fonts.push(e);
                }
            }
            catch (e1) { }
            try {
                if (fd !== null) {
                    fs.closeSync(fd);
                }
            }
            catch (e2) { }
            return res;
        }
        function walk(dir, depth, out) {
            var names, i, p, st;
            try {
                names = fs.readdirSync(dir);
            }
            catch (e) {
                return;
            }
            for (i = 0; i < names.length; i++) {
                p = dir + (dir.charAt(dir.length - 1) === "/" || dir.charAt(dir.length - 1) === "\\" ? "" : (dir.indexOf("\\") !== -1 ? "\\" : "/")) + names[i];
                if (/\.(ttf|otf)$/i.test(names[i])) {
                    out.push(p);
                }
                else if (depth < 2 && names[i].charAt(0) !== ".") {
                    try {
                        st = fs.statSync(p);
                        if (st.isDirectory()) {
                            walk(p, depth + 1, out);
                        }
                    }
                    catch (e3) { }
                }
            }
        }
        function buildIndex() {
            var dirs = fontDirs(), files = [], i, j, r, f, key;
            idx = { ps: {}, full: {} };
            for (i = 0; i < dirs.length; i++) {
                walk(dirs[i], 0, files);
            }
            for (i = 0; i < files.length; i++) {
                r = readNames(files[i]);
                if (!r.plain || !r.fonts.length) {
                    continue;
                }
                f = r.fonts[0];
                for (j = 0; j < f.ps.length; j++) {
                    key = f.ps[j].toLowerCase();
                    if (!idx.ps[key]) {
                        idx.ps[key] = files[i];
                    }
                }
                for (j = 0; j < f.full.length; j++) {
                    key = f.full[j].toLowerCase();
                    if (!idx.full[key]) {
                        idx.full[key] = files[i];
                    }
                }
            }
        }
        function findFile(fd) {
            if (!fs) {
                return null;
            }
            if (!idx) {
                buildIndex();
            }
            return idx.ps[String(fd.ps).toLowerCase()] || idx.full[String(fd.label).toLowerCase()] || null;
        }
        function q(s) { return String(s).replace(/["\\\n\r]/g, ""); }
        function stack(fd, alias) {
            return (alias ? '"' + alias + '", ' : "") + '"' + q(fd.family) + '", "' + q(fd.label) + '", "' + q(fd.ps) + '", sans-serif';
        }
        function register(fd) {
            var rec = { alias: "QBTFace" + (++counter), state: "loading", cbs: [] }, src = [], file, buf, url, bold, ital, css;
            try {
                file = findFile(fd);
                if (file) {
                    buf = fs.readFileSync(file);
                    if (buf.length < 40 * 1024 * 1024) {
                        url = URL.createObjectURL(new Blob([new Uint8Array(buf)], { type: "application/octet-stream" }));
                        src.push('url("' + url + '")');
                    }
                }
            }
            catch (e) { }
            src.push('local("' + q(fd.label) + '")');
            src.push('local("' + q(fd.ps) + '")');
            bold = fd.uiStyle.indexOf("BOLD") !== -1;
            ital = fd.uiStyle.indexOf("ITALIC") !== -1;
            css = '@font-face{font-family:"' + rec.alias + '";src:' + src.join(",") + ";font-weight:" + (bold ? "bold" : "normal") + ";font-style:" + (ital ? "italic" : "normal") + ";}\n";
            if (!styleEl) {
                styleEl = document.createElement("style");
                document.getElementsByTagName("head")[0].appendChild(styleEl);
            }
            styleEl.appendChild(document.createTextNode(css));
            return rec;
        }
        function finish(rec, ok) {
            var i, cbs = rec.cbs;
            rec.state = ok ? "ok" : "fail";
            rec.cbs = [];
            for (i = 0; i < cbs.length; i++) {
                cbs[i](ok ? rec.alias : null);
            }
        }
        function start(rec, fd) {
            var spec = (fd.uiStyle.indexOf("ITALIC") !== -1 ? "italic " : "normal ") + (fd.uiStyle.indexOf("BOLD") !== -1 ? "bold " : "normal ") + '24px "' + rec.alias + '"';
            try {
                if (document.fonts && document.fonts.load) {
                    document.fonts.load(spec, "Abc").then(function (list) {
                        finish(rec, !!(list && list.length && list[0].status === "loaded"));
                    }, function () { finish(rec, false); });
                    return;
                }
            }
            catch (e) { }
            setTimeout(function () { finish(rec, true); }, 300);
        }
        return {
            stack: stack,
            peek: function (fd, cb) {
                var rec = made[fd.ps];
                if (rec) {
                    return rec.state === "ok" ? rec.alias : null;
                }
                this.get(fd, function (a) { if (a && cb) {
                    cb();
                } });
                return null;
            },
            get: function (fd, cb) {
                var rec = made[fd.ps];
                if (!rec) {
                    rec = made[fd.ps] = register(fd);
                    rec.cbs.push(cb);
                    start(rec, fd);
                    return;
                }
                if (rec.state === "loading") {
                    rec.cbs.push(cb);
                }
                else {
                    cb(rec.state === "ok" ? rec.alias : null);
                }
            }
        };
    })();
    function preview(fd) {
        curFont = fd;
        var t = $("text");
        t.style.fontFamily = FACE.stack(fd, null);
        t.style.fontWeight = (fd.uiStyle.indexOf("BOLD") !== -1) ? "bold" : "normal";
        t.style.fontStyle = (fd.uiStyle.indexOf("ITALIC") !== -1) ? "italic" : "normal";
        FACE.get(fd, function (alias) {
            if (alias && curFont === fd) {
                t.style.fontFamily = FACE.stack(fd, alias);
                syncBatchStyle();
                saveSettings();
            }
        });
        syncBatchStyle();
        saveSettings();
    }
    function parseFonts(raw) {
        var lines = raw.split("\n"), out = [], i;
        for (i = 0; i < lines.length; i++) {
            var p = lines[i].split("\t");
            if (p.length >= 4) {
                out.push({ label: p[0], family: p[1], uiStyle: p[2], ps: p[3] });
            }
        }
        return out;
    }
    function loadFontCache() {
        var cached;
        try {
            cached = localStorage.getItem("qbt_fonts_v1");
            FONTS = cached ? parseFonts(cached) : [];
        }
        catch (e) {
            FONTS = [];
        }
    }
    function fontMatches(filter) {
        var f = (filter || "").toLowerCase(), out = [], i;
        if (FONTS === null) {
            loadFontCache();
        }
        if (!FONTS.length) {
            return [curFont];
        }
        for (i = 0; i < FONTS.length; i++) {
            if (f === "" || FONTS[i].label.toLowerCase().indexOf(f) !== -1) {
                out.push(FONTS[i]);
            }
        }
        return out;
    }
    function setAct(i) {
        var kids = fontList.children, el;
        if (kids[actIdx] && kids[actIdx].className.indexOf("act") >= 0) {
            kids[actIdx].className = kids[actIdx].className.replace(/\s*act/, "");
        }
        actIdx = i;
        el = kids[i];
        if (!el || el.className.indexOf("none") >= 0) {
            return;
        }
        el.className += " act";
        if (el.offsetTop < fontList.scrollTop) {
            fontList.scrollTop = el.offsetTop;
        }
        else if (el.offsetTop + el.offsetHeight > fontList.scrollTop + fontList.clientHeight) {
            fontList.scrollTop = el.offsetTop + el.offsetHeight - fontList.clientHeight;
        }
    }
    function renderList(filter, firstActive) {
        var frag = document.createDocumentFragment(), i, d, curAt = -1;
        FILTERED = fontMatches(filter);
        fontList.innerHTML = "";
        if (!FILTERED.length) {
            d = document.createElement("div");
            d.className = "none";
            d.textContent = "No fonts found";
            frag.appendChild(d);
        }
        for (i = 0; i < FILTERED.length; i++) {
            d = document.createElement("div");
            d.textContent = FILTERED[i].label;
            d.setAttribute("data-i", i);
            if (FILTERED[i].ps === curFont.ps) {
                d.className = "cur";
                curAt = i;
            }
            frag.appendChild(d);
        }
        fontList.appendChild(frag);
        actIdx = -1;
        if (firstActive && FILTERED.length) {
            setAct(0);
            fontList.scrollTop = 0;
        }
        else if (curAt >= 0) {
            setAct(curAt);
            fontList.scrollTop = Math.max(0, fontList.children[curAt].offsetTop - 60);
        }
    }
    function placeFontList() {
        var r = fontIn.getBoundingClientRect(), H = document.documentElement.clientHeight, below = H - r.bottom - 8, above = r.top - 8;
        if (below < 150 && above > below) {
            fontList.style.top = "auto";
            fontList.style.bottom = "24px";
            fontList.style.maxHeight = Math.min(190, above) + "px";
        }
        else {
            fontList.style.bottom = "auto";
            fontList.style.top = "24px";
            fontList.style.maxHeight = Math.min(190, Math.max(80, below)) + "px";
        }
    }
    function openList(filter, firstActive) {
        listOpen = true;
        placeFontList();
        fontList.style.display = "block";
        renderList(filter, firstActive);
    }
    function closeList() {
        listOpen = false;
        fontList.style.display = "none";
        fontIn.value = curFont.label;
    }
    function pickFont(i) {
        if (!FILTERED[i]) {
            return;
        }
        preview(FILTERED[i]);
        closeList();
    }
    fontIn.onfocus = function () { justFocused = true; this.select(); openList("", false); };
    fontIn.onmouseup = function (e) { if (justFocused) {
        e.preventDefault();
        justFocused = false;
    } };
    fontIn.onclick = function () { if (!listOpen) {
        this.select();
        openList("", false);
    } };
    fontIn.onblur = function () { justFocused = false; closeList(); };
    fontIn.oninput = function () {
        var v = this.value;
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
            if (!listOpen) {
                placeFontList();
                fontList.style.display = "block";
                listOpen = true;
            }
            renderList(v, v !== "");
        }, 120);
    };
    fontIn.onkeydown = function (e) {
        var k = e.keyCode, n = fontList.children.length;
        if (k === 40 || k === 38) {
            e.preventDefault();
            if (!listOpen) {
                openList("", false);
                return;
            }
            if (n) {
                setAct(Math.min(Math.max(actIdx + (k === 40 ? 1 : -1), 0), n - 1));
            }
        }
        else if (k === 13) {
            if (listOpen && actIdx >= 0) {
                e.preventDefault();
                pickFont(actIdx);
            }
        }
        else if (k === 27) {
            closeList();
            this.blur();
        }
    };
    fontList.onmousedown = function (e) {
        e.preventDefault();
        var t = e.target;
        if (t && t.getAttribute && t.getAttribute("data-i") !== null) {
            pickFont(parseInt(t.getAttribute("data-i"), 10));
        }
    };
    $("fontArrow").onmousedown = function (e) {
        e.preventDefault();
        if (listOpen) {
            closeList();
            fontIn.blur();
        }
        else {
            fontIn.focus();
            if (!listOpen) {
                openList("", false);
            }
        }
    };
    (function fontWheel() {
        var STEP_ITEMS = 4.5, acc = 0, lastWheel = 0, glide = makeSmooth(fontList);
        fontList.addEventListener("wheel", function (e) {
            var d = e.deltaY, now = new Date().getTime(), steps = 0, h;
            e.preventDefault();
            e.stopPropagation();
            if (!d) {
                return;
            }
            if (e.deltaMode === 1) {
                d *= 33;
            }
            else if (e.deltaMode === 2) {
                d *= 100;
            }
            if (Math.abs(d) >= 50) {
                if (now - lastWheel < 80) {
                    return;
                }
                steps = d > 0 ? 1 : -1;
                acc = 0;
            }
            else {
                acc += d;
                if (Math.abs(acc) >= 60) {
                    steps = acc > 0 ? 1 : -1;
                    acc = 0;
                }
            }
            if (!steps) {
                return;
            }
            lastWheel = now;
            h = fontList.firstChild ? fontList.firstChild.offsetHeight : 19;
            glide.by(steps * Math.round(h * STEP_ITEMS));
        }, false);
    })();
    $("scanFonts").onclick = function () {
        var btn = this, lab = $("scanFontsTxt");
        btn.disabled = true;
        if (lab) { lab.textContent = "Scanning fonts..."; }
        log("Scanning fonts... (Premiere may pause for a few seconds)");
        setTimeout(function () {
            cs.evalScript("QBT_scanFonts()", function (res) {
                btn.disabled = false;
                if (lab) { lab.textContent = "Scan installed fonts"; }
                var list = parseFonts(res || "");
                if (!list.length) {
                    log("No fonts found.", "err");
                    return;
                }
                FONTS = list;
                try {
                    localStorage.setItem("qbt_fonts_v1", res);
                }
                catch (e) { }
                if (listOpen) {
                    renderList("", false);
                }
                log("Font list updated.", "ok");
                note("Successfully listed installed fonts...", "ok");
            });
        }, 60);
    };
    if (SAVED && SAVED.f && SAVED.f.ps) {
        curFont = SAVED.f;
    }
    fontIn.value = curFont.label;
    preview(curFont);
    syncUI();
    (function animCombo() {
        var inp = $("animSearch"), list = $("animList"), hid = $("preset"), order = [], FIL = [], open = false, act = -1, justF = false, timer = null, i;
        for (i = 0; i < PRESETS.length; i++) {
            order.push(i);
        }
        order.sort(function (x, y) {
            var a = PRESETS[x].toLowerCase(), b = PRESETS[y].toLowerCase();
            return a < b ? -1 : (a > b ? 1 : 0);
        });
        function cur() { var v = parseInt(hid.value, 10); return (isNaN(v) || v < 0 || v >= PRESETS.length) ? 0 : v; }
        function setAct(n) {
            var kids = list.children, el;
            if (kids[act] && kids[act].className.indexOf("act") >= 0) {
                kids[act].className = kids[act].className.replace(/\s*act/, "");
            }
            act = n;
            el = kids[n];
            if (!el || el.className.indexOf("none") >= 0) {
                return;
            }
            el.className += " act";
            if (el.offsetTop < list.scrollTop) {
                list.scrollTop = el.offsetTop;
            }
            else if (el.offsetTop + el.offsetHeight > list.scrollTop + list.clientHeight) {
                list.scrollTop = el.offsetTop + el.offsetHeight - list.clientHeight;
            }
        }
        function render(filter, first) {
            var f = (filter || "").toLowerCase(), frag = document.createDocumentFragment(), d, k, c = cur(), curAt = -1;
            FIL = [];
            for (k = 0; k < order.length; k++) {
                if (f === "" || PRESETS[order[k]].toLowerCase().indexOf(f) !== -1) {
                    FIL.push(order[k]);
                }
            }
            list.innerHTML = "";
            if (!FIL.length) {
                d = document.createElement("div");
                d.className = "none";
                d.textContent = "No animation found";
                frag.appendChild(d);
            }
            for (k = 0; k < FIL.length; k++) {
                d = document.createElement("div");
                d.textContent = PRESETS[FIL[k]];
                d.setAttribute("data-i", k);
                if (FIL[k] === c) {
                    d.className = "cur";
                    curAt = k;
                }
                frag.appendChild(d);
            }
            list.appendChild(frag);
            act = -1;
            if (first && FIL.length) {
                setAct(0);
                list.scrollTop = 0;
            }
            else if (curAt >= 0) {
                setAct(curAt);
                list.scrollTop = Math.max(0, list.children[curAt].offsetTop - 60);
            }
        }
        function place() {
            var r = inp.getBoundingClientRect(), Hh = document.documentElement.clientHeight, below = Hh - r.bottom - 8, above = r.top - 8;
            if (below < 150 && above > below) {
                list.style.top = "auto";
                list.style.bottom = "24px";
                list.style.maxHeight = Math.min(190, above) + "px";
            }
            else {
                list.style.bottom = "auto";
                list.style.top = "24px";
                list.style.maxHeight = Math.min(190, Math.max(80, below)) + "px";
            }
        }
        function openL(filter, first) { open = true; place(); list.style.display = "block"; render(filter, first); }
        function closeL() { open = false; list.style.display = "none"; inp.value = PRESETS[cur()]; }
        function pick(k) {
            if (FIL[k] === undefined) {
                return;
            }
            animSet(FIL[k]);
            closeL();
            saveSettings();
        }
        animSet = function (v) {
            v = parseInt(v, 10);
            if (isNaN(v) || v < 0 || v >= PRESETS.length) {
                v = 0;
            }
            hid.value = String(v);
            inp.value = PRESETS[v];
            syncAccent();
        };
        inp.onfocus = function () { justF = true; this.select(); openL("", false); };
        inp.onmouseup = function (e) { if (justF) {
            e.preventDefault();
            justF = false;
        } };
        inp.onclick = function () { if (!open) {
            this.select();
            openL("", false);
        } };
        inp.onblur = function () { justF = false; closeL(); };
        inp.oninput = function () {
            var v = this.value;
            clearTimeout(timer);
            timer = setTimeout(function () {
                if (!open) {
                    place();
                    list.style.display = "block";
                    open = true;
                }
                render(v, v !== "");
            }, 100);
        };
        inp.onkeydown = function (e) {
            var k = e.keyCode, n = list.children.length;
            if (k === 40 || k === 38) {
                e.preventDefault();
                if (!open) {
                    openL("", false);
                    return;
                }
                if (n) {
                    setAct(Math.min(Math.max(act + (k === 40 ? 1 : -1), 0), n - 1));
                }
            }
            else if (k === 13) {
                if (open && act >= 0) {
                    e.preventDefault();
                    pick(act);
                }
            }
            else if (k === 27) {
                closeL();
                this.blur();
            }
        };
        list.onmousedown = function (e) {
            e.preventDefault();
            var t = e.target;
            if (t && t.getAttribute && t.getAttribute("data-i") !== null) {
                pick(parseInt(t.getAttribute("data-i"), 10));
            }
        };
        $("animArrow").onmousedown = function (e) {
            e.preventDefault();
            if (open) {
                closeL();
                inp.blur();
            }
            else {
                inp.focus();
                if (!open) {
                    openL("", false);
                }
            }
        };
        (function wheel() {
            var STEP = 4.5, acc = 0, last = 0, glide = makeSmooth(list);
            list.addEventListener("wheel", function (e) {
                var d = e.deltaY, now = new Date().getTime(), steps = 0, h;
                e.preventDefault();
                e.stopPropagation();
                if (!d) {
                    return;
                }
                if (e.deltaMode === 1) {
                    d *= 33;
                }
                else if (e.deltaMode === 2) {
                    d *= 100;
                }
                if (Math.abs(d) >= 50) {
                    if (now - last < 80) {
                        return;
                    }
                    steps = d > 0 ? 1 : -1;
                    acc = 0;
                }
                else {
                    acc += d;
                    if (Math.abs(acc) >= 60) {
                        steps = acc > 0 ? 1 : -1;
                        acc = 0;
                    }
                }
                if (!steps) {
                    return;
                }
                last = now;
                h = list.firstChild ? list.firstChild.offsetHeight : 19;
                glide.by(steps * Math.round(h * STEP));
            }, false);
        })();
        animSet(cur());
    })();
    (function sliders() {
        var TRACK_DARK = "#3a3a3a";
        var TRACK_LIGHT = "#c8c8c8";
        var HANDLE = 12;
        var styleEl = document.createElement("style");
        document.getElementsByTagName("head")[0].appendChild(styleEl);
        function fraction(sl) {
            var mn = parseFloat(sl.min), mx = parseFloat(sl.max), v = parseFloat(sl.value);
            if (isNaN(mn) || isNaN(mx) || isNaN(v) || mx <= mn) {
                return 0;
            }
            return Math.min(1, Math.max(0, (v - mn) / (mx - mn)));
        }
        var SEEKIDS = ["animSeek", "shpSeek", "rollSeek", "fsSeek"], SEEKH = null;
        function handleOf(sl) { return (SEEKH !== null && /Seek$/.test(sl.id)) ? SEEKH : HANDLE; }
        function rule(sl, empty, prefix, FILL) {
            var HW = handleOf(sl), stop = "calc(" + (HW / 2) + "px + (100% - " + HW + "px) * " + fraction(sl).toFixed(4) + ")";
            return prefix + "#" + sl.id + "::-webkit-slider-runnable-track{" +
                "background:linear-gradient(to right," + FILL + " " + stop + "," + empty + " " + stop + ");}\n";
        }
        var CUR_THEME = "default", RND = { on: false, mode: "fill", map: {} };
        var RND_PAL = ["#ef4444", "#f97316", "#d4a017", "#22c55e", "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899"];
        var KNOB_ALWAYS = { orb: 1, grip: 1, dot: 1, hollow: 1, pillbar: 1, blockbar: 1, blockthin: 1 };
        var KNOB_RND = { bar: 1, barthin: 1, ring: 1, glow: 1 };
        function shuffle(a) {
            var i, j, t;
            for (i = a.length - 1; i > 0; i--) {
                j = Math.floor(Math.random() * (i + 1));
                t = a[i];
                a[i] = a[j];
                a[j] = t;
            }
            return a;
        }
        function randomize() {
            var list = document.querySelectorAll("input[type=range]"), pal = [], i, last = "", t;
            RND.map = {};
            for (i = 0; i < list.length; i++) {
                if (!pal.length) {
                    pal = shuffle(RND_PAL.slice());
                    if (pal[0] === last) {
                        t = pal[0];
                        pal[0] = pal[1];
                        pal[1] = t;
                    }
                }
                last = pal.shift();
                RND.map[list[i].id] = last;
            }
        }
        function rndColor(sl) {
            if (!RND.on) {
                return null;
            }
            if (!RND.map[sl.id]) {
                RND.map[sl.id] = RND_PAL[Math.floor(Math.random() * RND_PAL.length)];
            }
            return RND.map[sl.id];
        }
        function knobCss(name, C, light) {
            switch (name) {
                case "orb": return "background-image:radial-gradient(circle at 50% 50%," + C + " 0," + C + " 3px,rgba(0,0,0,0) 3.6px),radial-gradient(circle at 50% 32%,#ffffff 0,#e4e4e4 55%,#a8a8a8 100%);";
                case "grip": return "background-image:repeating-linear-gradient(to right," + C + " 0," + C + " 1px,rgba(0,0,0,0) 1px,rgba(0,0,0,0) 3px),linear-gradient(#f7f7f7,#cfcfcf);background-size:9px 7px,100% 100%;background-position:center center,0 0;background-repeat:no-repeat,no-repeat;";
                case "dot": return "background:" + C + ";box-shadow:none;";
                case "hollow": return "background:" + (light ? "#ffffff" : "#2b2b2b") + ";border:3px solid " + C + ";box-shadow:none;";
                case "pillbar":
                case "blockbar":
                case "blockthin": return "background:transparent;box-shadow:none;";
                case "bar":
                case "barthin": return "background:" + C + ";";
                case "ring": return "border-color:" + C + ";";
                case "glow": return "box-shadow:0 0 6px 2px " + C + ";";
            }
            return "";
        }
        function sliderRules(sl, empty, prefix, base, light) {
            var C = rndColor(sl), name = sl.getAttribute("data-sk") || CUR_THEME, css, k = "", both = !!C && RND.mode === "both";
            css = rule(sl, empty, prefix, C || base);
            if (KNOB_ALWAYS[name]) {
                k = knobCss(name, both ? C : base, light);
            }
            else if (both && KNOB_RND[name]) {
                k = knobCss(name, C, light);
            }
            if (k) {
                css += prefix + "#" + sl.id + "::-webkit-slider-thumb{" + k + "}\n";
            }
            return css;
        }
        function paintAll() {
            var list = document.querySelectorAll("input[type=range]"), css = "", i;
            for (i = 0; i < list.length; i++) {
                css += sliderRules(list[i], TRACK_DARK, "", SLIDER_FILL.dark, false);
                css += sliderRules(list[i], TRACK_LIGHT, "html.light ", SLIDER_FILL.light, true);
            }
            styleEl.textContent = css;
        }
        setSliderRandom = function (on, mode) {
            var was = RND.on;
            RND.on = !!on;
            RND.mode = (mode === "both") ? "both" : "fill";
            if (RND.on && !was) {
                randomize();
            }
            paintAll();
            window.QBT_paintSeek();
        };
        setSliderTheme = function (name) {
            if (!SLIDER_T.hasOwnProperty(name)) {
                name = "default";
            }
            HANDLE = SLIDER_T[name];
            CUR_THEME = name;
            document.documentElement.setAttribute("data-slider", name);
            paintAll();
            window.QBT_paintSeek();
        };
        setSeekTheme = function (on, name) {
            var i, sl;
            if (!SLIDER_T.hasOwnProperty(name) && !SEEK_T.hasOwnProperty(name)) {
                name = "default";
            }
            SEEKH = on ? (SEEK_T.hasOwnProperty(name) ? SEEK_T[name] : SLIDER_T[name]) : null;
            for (i = 0; i < SEEKIDS.length; i++) {
                sl = $(SEEKIDS[i]);
                if (!sl) {
                    continue;
                }
                if (on) {
                    sl.setAttribute("data-sk", name);
                }
                else {
                    sl.removeAttribute("data-sk");
                }
            }
            paintAll();
            window.QBT_paintSeek();
        };
        var seekStyle = document.createElement("style"), seekLast = "";
        document.getElementsByTagName("head")[0].appendChild(seekStyle);
        window.QBT_paintSeek = function () {
            var ids = SEEKIDS, css = "", a, sl;
            for (a = 0; a < ids.length; a++) {
                sl = $(ids[a]);
                if (sl) {
                    css += sliderRules(sl, TRACK_DARK, "", SLIDER_FILL.dark, false) + sliderRules(sl, TRACK_LIGHT, "html.light ", SLIDER_FILL.light, true);
                }
            }
            if (css !== seekLast) {
                seekLast = css;
                seekStyle.textContent = css;
            }
        };
        document.addEventListener("dblclick", function (e) {
            var sl = e.target, r, f, cx, d;
            if (!sl || sl.tagName !== "INPUT" || sl.type !== "range" || sl.disabled || /Seek$/.test(sl.id)) {
                return;
            }
            d = sl.defaultValue;
            if (d === "" || d === null || d === undefined) {
                return;
            }
            r = sl.getBoundingClientRect();
            f = fraction(sl);
            cx = r.left + HANDLE / 2 + (r.width - HANDLE) * f;
            if (Math.abs(e.clientX - cx) > HANDLE / 2 + 3) {
                return;
            }
            sl.value = d;
            fireInput(sl);
            paintAll();
            e.preventDefault();
        }, false);
        function fireInput(el) {
            var ev = document.createEvent("Event");
            ev.initEvent("input", true, true);
            el.dispatchEvent(ev);
        }
        function link(sliderId, boxId) {
            var sl = $(sliderId), box = $(boxId);
            function boxToSlider() {
                var v = parseFloat(box.value);
                if (!isNaN(v)) {
                    sl.value = v;
                }
                paintAll();
            }
            sl.addEventListener("input", function () {
                box.value = sl.value;
                fireInput(box);
            }, false);
            box.addEventListener("input", boxToSlider, false);
            boxToSlider();
        }
        link("sizeSlider", "size");
        link("trackSlider", "tracking");
        link("lineSpSlider", "lineSp");
        link("outlineWSl", "outlineW");
        link("shOpSl", "shOp");
        link("shDistSl", "shDist");
        link("shSoftSl", "shSoft");
        link("shDirSl", "shDir");
        link("boxOpSl", "boxOp");
        link("boxPadSl", "boxPad");
        link("boxRadSl", "boxRad");
        link("boxSkewSl", "boxSkew");
        link("lineSkewSl", "lineSkew");
        link("tkBarHSl", "tkBarH");
        link("tkBarOpSl", "tkBarOp");
        link("tkLineWSl", "tkLineW");
        link("tkLineWBSl", "tkLineWB");
        link("tkLblSzSl", "tkLblSz");
        link("tkLblExtSl", "tkLblExt");
        link("tkTxYSl", "tkTxY");
        link("tkLblTxYSl", "tkLblTxY");
        link("tkLblTxSpSl", "tkLblTxSp");
        link("tkLblTxAmtSl", "tkLblTxAmt");
        link("animSpSl", "animSp");
        link("animAmtSl", "animAmt");
        link("lineWSl", "lineW");
        link("linePadSl", "linePad");
        link("lineRadSl", "lineRad");
        link("shpThSl", "shpTh");
        ["shpLen", "shpGap", "shpOffX", "shpOffY", "shpRot", "shpRad", "shpPad", "shpOp", "shpLnW", "shpShSoft", "shpShDist", "shpSkew", "shpTbW", "shpTbWB", "shpTbWC", "shpTbWD", "shpTbHs", "shpTbVs", "shpTbGap"].forEach(function (id) { link(id + "Sl", id); });
        link("posXSl", "posX");
        link("posYSl", "posY");
        $("pvSize").addEventListener("input", paintAll, false);
        paintSliders = paintAll;
        paintAll();
    })();
    (function theme() {
        var rLight = $("themeLight"), rDark = $("themeDark"), cur = "dark", sv = "";
        try {
            sv = localStorage.getItem("qbt_theme_v1");
            if (sv === "light") {
                cur = sv;
            }
        }
        catch (e) { }
        function apply(t) {
            if (t !== "light") {
                t = "dark";
            }
            document.documentElement.className = (t === "dark") ? "" : t;
            rLight.checked = (t === "light");
            rDark.checked = (t === "dark");
            try {
                localStorage.setItem("qbt_theme_v1", t);
            }
            catch (e) { }
        }
        apply(cur);
        applyWindowTheme = apply;
        rLight.addEventListener("change", function () { if (rLight.checked) {
            apply("light");
        } }, false);
        rDark.addEventListener("change", function () { if (rDark.checked) {
            apply("dark");
        } }, false);
    })();
    function applySettings(o, valIds, chkIds, colIds) {
        var i, id, f, fd;
        if (!o) {
            return;
        }
        for (i = 0; i < valIds.length; i++) {
            id = valIds[i];
            if (o.v && o.v[id] !== undefined && o.v[id] !== null) {
                $(id).value = oldAlign(id, String(o.v[id]));
            }
        }
        if (o.v) {
            var SD = { lineSp: "0", shpDelay: "0", shpFx: "0", shpFxSp: "1.2", shpLen: "100", shpGap: "0", shpOffX: "0", shpOffY: "0", shpRot: "0", shpRad: "0", shpPad: "12", shpOp: "100", shpLnW: "3", shpShSoft: "12", shpShDist: "6", shpSkew: "0", shpTbW: "4", shpTbWB: "4", shpTbWC: "4", shpTbWD: "4", shpTbHs: "100", shpTbVs: "100", shpTbAnim: "0", shpTbDur: "0.6", shpTbGap: "0", shpTbDelay: "0", tkLblAnim: "0", tkLblSz: "0", tkLblExt: "0", tkTxY: "0", tkLblTxY: "0", tkLblTxIn: "11", tkLblTxFx: "1", tkLblTxDur: "0.7", tkLblTxSp: "1.5", tkLblTxAmt: "100", tkLblTxMode: "0", animFx: "1", animSp: "1.5", animAmt: "100" }, sk;
            for (sk in SD) {
                if (SD.hasOwnProperty(sk) && valIds.indexOf(sk) >= 0 && (o.v[sk] === undefined || o.v[sk] === null)) {
                    $(sk).value = SD[sk];
                }
            }
            if (valIds.indexOf("shpType") >= 0 && o.k) {
                if (chkIds.indexOf("optShpLn") >= 0 && o.k.optShpLn === undefined) {
                    $("optShpLn").checked = false;
                }
                if (chkIds.indexOf("optShpSh") >= 0 && o.k.optShpSh === undefined) {
                    $("optShpSh").checked = false;
                }
                if (chkIds.indexOf("optShpTb") >= 0 && o.k.optShpTb === undefined) {
                    $("optShpTb").checked = false;
                }
                if (chkIds.indexOf("shpTbSep") >= 0 && o.k.shpTbSep === undefined) {
                    $("shpTbSep").checked = false;
                }
                if (chkIds.indexOf("shpTbOrA") >= 0 && o.k.shpTbOrA === undefined) {
                    $("shpTbOrA").checked = false;
                }
            }
        }
        if (o.k) {
            if (chkIds.indexOf("optAnimate") >= 0 && o.k.optAnimate === undefined) {
                $("optAnimate").checked = false;
            }
            if (chkIds.indexOf("tkLabelTxAuto") >= 0 && o.k.tkLabelTxAuto === undefined) {
                $("tkLabelTxAuto").checked = true;
            }
            if (chkIds.indexOf("tkLblTxOn") >= 0 && o.k.tkLblTxOn === undefined) {
                $("tkLblTxOn").checked = false;
            }
        }
        if (o.v && o.v.shpInterp === undefined && o.v.interp !== undefined && o.v.interp !== null) {
            $("shpInterp").value = String(o.v.interp);
        }
        for (i = 0; i < chkIds.length; i++) {
            id = chkIds[i];
            if (o.k && o.k[id] !== undefined) {
                $(id).checked = !!o.k[id];
            }
        }
        for (i = 0; i < colIds.length; i++) {
            id = colIds[i];
            if (o.c && parseHex(o.c[id])) {
                setColor(id, parseHex(o.c[id]));
            }
        }
        f = o.f;
        if (f && f.ps) {
            fd = { label: String(f.label || f.ps), family: String(f.family || "Arial").replace(/["'\\;{}<>]/g, ""),
                uiStyle: String(f.uiStyle || "").replace(/[^A-Za-z ]/g, ""), ps: String(f.ps) };
            fontIn.value = fd.label;
            preview(fd);
        }
        resyncAll();
    }
    function resyncAll() {
        var pv = parseInt($("preset").value, 10), ids, i;
        if (isNaN(pv) || pv < 0 || pv >= PRESETS.length) {
            pv = 0;
            $("preset").value = "0";
        }
        animSet(pv);
        if ($("fxStr").selectedIndex < 0) {
            $("fxStr").selectedIndex = 1;
        }
        if ($("wipeDir").selectedIndex < 0) {
            $("wipeDir").selectedIndex = 0;
        }
        if ($("dir").selectedIndex < 0) {
            $("dir").selectedIndex = 0;
        }
        if ($("interp").selectedIndex < 0) {
            $("interp").selectedIndex = 0;
        }
        if ($("shpInterp").selectedIndex < 0) {
            $("shpInterp").selectedIndex = 0;
        }
        if ($("align").selectedIndex < 0) {
            $("align").selectedIndex = 1;
        }
        if ($("safeW").selectedIndex < 0) {
            $("safeW").selectedIndex = 0;
        }
        if ($("safeH").selectedIndex < 0) {
            $("safeH").selectedIndex = 0;
        }
        syncBg();
        syncAccent();
        syncEnd();
        syncPlace();
        syncFx();
        syncShapes();
        syncMb();
        syncAnimate();
        syncRoll();
        syncSafe();
        syncPos();
        syncUI();
        applyPv();
        ids = ["size", "tracking", "lineSp", "outlineW", "shOp", "shDist", "shSoft", "shDir", "pvSize", "boxOp", "boxPad", "boxRad", "boxSkew", "lineSkew", "tkBarH", "tkBarOp", "tkLineW", "tkLineWB", "tkLblSz", "tkLblExt", "tkTxY", "tkLblTxY", "tkLblTxDur", "tkLblTxSp", "tkLblTxAmt", "animSp", "animAmt", "lineW", "linePad", "lineRad", "shpTh", "shpLen", "shpGap", "shpOffX", "shpOffY", "shpRot", "shpRad", "shpPad", "shpOp", "shpLnW", "shpShSoft", "shpShDist", "shpSkew", "shpTbW", "shpTbWB", "shpTbWC", "shpTbWD", "shpTbHs", "shpTbVs", "shpTbGap"];
        for (i = 0; i < ids.length; i++) {
            fireEvent($(ids[i]), "input");
        }
        saveSettings();
    }
    var THEME_DEF = { title: "#4098e3", fill: "#4098e3", sel: "#266694" };
    var PALETTE = [
        { id: "blue", name: "Blue", t: null, f: null, s: null },
        { id: "cyan", name: "Cyan", t: "#3fd0e8", f: "#22b8d4", s: "#107c91" },
        { id: "teal", name: "Teal", t: "#2dd4bf", f: "#14b8a6", s: "#0d7c70" },
        { id: "green", name: "Green", t: "#4cd16b", f: "#3cb85a", s: "#2a7d3f" },
        { id: "lime", name: "Lime", t: "#b5e655", f: "#9ccc3c", s: "#66801f" },
        { id: "yellow", name: "Yellow", t: "#ffd84d", f: "#f2c230", s: "#9a7b0a" },
        { id: "orange", name: "Orange", t: "#ff9a3c", f: "#ff8a1f", s: "#b5560f" },
        { id: "red", name: "Red", t: "#ff6b61", f: "#f0584f", s: "#a8302a" },
        { id: "pink", name: "Pink", t: "#ff7eb6", f: "#f0589c", s: "#a82e68" },
        { id: "purple", name: "Purple", t: "#b388ff", f: "#9a6bf0", s: "#6a43b8" },
        { id: "gray", name: "Gray", t: "#c8c8c8", f: "#9a9a9a", s: "#5f5f5f" }
    ];
    var THEME_IDS = { cTitle: "title", cFill: "fill", cSel: "sel", cSecBorder: "secBorder", cBlink: "blink" };
    var themeStyle = document.createElement("style");
    document.getElementsByTagName("head")[0].appendChild(themeStyle);
    function shade(hex, f) {
        var r = hexToRgb(hex), i;
        for (i = 0; i < 3; i++) {
            r[i] = Math.min(255, Math.max(0, Math.round(r[i] * 255 * f)));
        }
        return toHex(r);
    }
    function palById(id) {
        var i;
        for (i = 0; i < PALETTE.length; i++) {
            if (PALETTE[i].id === id) {
                return PALETTE[i];
            }
        }
        return null;
    }
    function palButton(p) { return p.s || THEME_DEF.sel; }
    function palChip(p) { return p.f || THEME_DEF.fill; }
    var TAB_H = { thin: 20, normal: 24, "default": 26, medium: 32, high: 38 };
    function tabCss() {
        var T = UI.title || THEME_DEF.title, Tl = shade(T, 0.72), css = "", H = TAB_H[UI.tabH] || 26, B, p, Lc, pt, pb, on = "#tabs[data-style=", s;
        if (UI.tabStyle === "btn") {
            p = palById(UI.btn);
            if (UI.btn === "default" || !p) {
                css += on + "btn] .tab.on," + on + "btn] .tab.on:hover{background:#2e2e2e;color:#e6e6e6;box-shadow:inset 0 0 0 1px #555555;}\n";
                css += "html.light " + on + "btn] .tab.on,html.light " + on + "btn] .tab.on:hover{background:#f6f6f6;color:#222;box-shadow:inset 0 0 0 1px #a6a6a6;}\n";
            }
            else {
                B = palButton(p);
                css += on + "btn] .tab.on,html.light " + on + "btn] .tab.on{background:" + B + ";color:#fff;box-shadow:inset 0 0 0 1px " + shade(B, 0.75) + ",inset 0 1px 0 rgba(255,255,255,.14);}\n";
                css += on + "btn] .tab.on:hover,html.light " + on + "btn] .tab.on:hover{background:" + shade(B, 1.18) + ";}\n";
            }
        }
        if (UI.tabStyle === "pp" || UI.tabStyle === "ppline") {
            css += on + "pp] .tab," + on + "ppline] .tab{border-bottom-color:" + T + ";}\n";
            css += on + "pp] .tab.on," + on + "pp] .tab.on:hover," + on + "pp] .tab.on:active," + on + "ppline] .tab.on," + on + "ppline] .tab.on:hover," + on + "ppline] .tab.on:active{border-color:" + T + ";border-bottom-color:transparent;}\n";
            css += "html.light " + on + "pp] .tab,html.light " + on + "ppline] .tab{border-bottom-color:" + Tl + ";}\n";
            css += "html.light " + on + "pp] .tab.on,html.light " + on + "pp] .tab.on:hover,html.light " + on + "pp] .tab.on:active,html.light " + on + "ppline] .tab.on,html.light " + on + "ppline] .tab.on:hover,html.light " + on + "ppline] .tab.on:active{border-color:" + Tl + ";border-bottom-color:transparent;}\n";
        }
        if (UI.tabStyle === "gradient") {
            css += on + "gradient] .tab.on," + on + "gradient] .tab.on:hover," + on + "gradient] .tab.on:active{background:linear-gradient(to bottom," + T + "," + shade(T, 0.6) + ");color:#fff;}\n";
            css += "html.light " + on + "gradient] .tab.on,html.light " + on + "gradient] .tab.on:hover,html.light " + on + "gradient] .tab.on:active{background:linear-gradient(to bottom," + Tl + "," + shade(Tl, 0.75) + ");color:#fff;}\n";
        }
        if (UI.tabStyle === "fullb") {
            css += on + "fullb]{border-bottom-color:" + T + ";}\n";
            css += "html.light " + on + "fullb]{border-bottom-color:" + Tl + ";}\n";
        }
        if (UI.tabH !== "default") {
            css += "#tabs{height:" + (H + 1) + "px;}\n#tabs .tab{height:" + H + "px;}\n";
        }
        if (UI.tabAlign !== "default") {
            Lc = (UI.tabStyle === "line" || UI.tabStyle === "ppline") ? 20 : 16;
            s = { top: 0, uptop: 3, center: Math.round((H - Lc) / 2), updown: H - Lc - 3, bottom: H - Lc }[UI.tabAlign];
            pt = Math.max(0, s);
            pb = Math.max(0, H - Lc - pt);
            css += "#tabs .tab{padding-top:" + pt + "px;padding-bottom:" + pb + "px;}\n";
        }
        return css;
    }
    function secCss() {
        var st = UI.secStyle, on = UI.secBorderOn && UI.secBorder, css = "", Cd, Cl, fs = "fieldset", lg = "legend:not(.fold)";
        if (st === "default" && !on) {
            return "";
        }
        Cd = on ? UI.secBorder : (st === "default" ? "#141414" : "#555555");
        Cl = on ? UI.secBorder : (st === "default" ? "#a9a9a9" : "#9a9a9a");
        function R(sel, f) { css += sel + "{" + f(Cd, false) + "}\n"; css += "html.light " + sel.replace(/,/g, ",html.light ") + "{" + f(Cl, true) + "}\n"; }
        if (st === "default") {
            R(fs, function (c) { return "border-color:" + c + ";"; });
        }
        else if (st === "underline") {
            R(fs, function () { return "border:0;box-shadow:none;"; });
            R(lg, function (c) { return "border-bottom:1px solid " + c + ";padding:0 4px 2px;"; });
        }
        else if (st === "left") {
            R(fs, function (c) { return "border:0;border-left:3px solid " + c + ";border-radius:0;box-shadow:none;"; });
        }
        else if (st === "top") {
            R(fs, function (c) { return "border:0;border-top:2px solid " + c + ";border-radius:0;box-shadow:none;"; });
        }
        else if (st === "card") {
            R(fs, function (c, l) { return "border:1px solid " + (on ? c : (l ? "#c6c6c6" : "#2c2c2c")) + ";border-radius:7px;background:" + (l ? "#ececec" : "#292929") + ";box-shadow:0 2px 5px rgba(0,0,0," + (l ? ".15" : ".35") + ");"; });
        }
        else if (st === "dashed") {
            R(fs, function (c) { return "border:1px dashed " + c + ";box-shadow:none;"; });
        }
        else if (st === "double") {
            R(fs, function (c) { return "border:3px double " + c + ";box-shadow:none;"; });
        }
        else if (st === "round") {
            R(fs, function (c) { return "border:1px solid " + c + ";border-radius:9px;box-shadow:none;"; });
        }
        else if (st === "none") {
            R(fs, function () { return "border:0;box-shadow:none;"; });
        }
        else if (st === "inset") {
            R(fs, function (c, l) { return "border:1px solid " + (on ? c : (l ? "#b5b5b5" : "#151515")) + ";border-radius:3px;background:" + (l ? "#d4d4d4" : "#1a1a1a") + ";box-shadow:inset 0 2px 5px rgba(0,0,0," + (l ? ".25" : ".55") + ");"; });
        }
        else if (st === "corners") {
            R(fs, function (c) {
                var g = "linear-gradient(" + c + "," + c + ")";
                return "border:0;border-radius:0;box-shadow:none;background:" + g + " top left/10px 2px no-repeat," + g + " top left/2px 10px no-repeat," + g + " top right/10px 2px no-repeat," + g + " top right/2px 10px no-repeat," +
                    g + " bottom left/10px 2px no-repeat," + g + " bottom left/2px 10px no-repeat," + g + " bottom right/10px 2px no-repeat," + g + " bottom right/2px 10px no-repeat;";
            });
        }
        else if (st === "dotted") {
            R(fs, function (c) { return "border:2px dotted " + c + ";box-shadow:none;"; });
        }
        return css;
    }
    var NOTI_T = { "default": 1, flat: 1, pill: 1, tint: 1, badge: 1, square: 1, strip: 1, compact: 1, terminal: 1, gradient: 1, glow: 1, solid: 1, topline: 1, aurora: 1 };
    var HEAD_T = { "default": 1, nobase: 1, lines: 1, pill: 1, edge: 1, soft: 1, outline: 1, glass: 1, topbar: 1, trail: 1, fade: 1, dots: 1, double: 1, brackets: 1 };
    var SELB_T = { "default": 1, outline: 1, block: 1, mono: 1 };
    function mixHex(a, b, t) {
        function p(x) { var m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(x || ""); return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [128, 128, 128]; }
        var A = p(a), B = p(b), i, o = "#", v;
        for (i = 0; i < 3; i++) {
            v = Math.round(A[i] + (B[i] - A[i]) * t);
            o += (v < 16 ? "0" : "") + v.toString(16);
        }
        return o;
    }
    function readableFg(c) {
        var m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(c || "");
        var l = m ? (0.299 * parseInt(m[1], 16) + 0.587 * parseInt(m[2], 16) + 0.114 * parseInt(m[3], 16)) : 0;
        return l > 150 ? "#1a1a1a" : "#ffffff";
    }
    function barThemeCss() {
        var css = "", live = (UI.blinkOn && UI.blink) ? UI.blink : "#f2c230", n = UI.notiTheme, s = UI.selBarTheme, w, P, pre, B, S, st, q2, sc;
        var WIN = [
            { pre: "html:not(.light)", nbg: "#343434", nbd: "#4d4d4d", nfg: "#e6e6e6", sbd: "#3d3d3d", sac: "#5f6b78", ssel: "#4098e3", sfg: "#9a9a9a", sfgs: "#e2e2e2", idle: "#5a5a5a" },
            { pre: "html.light", nbg: "#f7f7f7", nbd: "#a6a6a6", nfg: "#222222", sbd: "#b4b4b4", sac: "#8a96a3", ssel: "#1a62a8", sfg: "#6a6a6a", sfgs: "#222222", idle: "#a0a0a0" }
        ];
        var ST = [["idle", null], ["work", "#39abe4"], ["warn", "#f2c230"], ["live", live], ["batch", "#ffffff"], ["ok", "#4cd16b"], ["err", "#f0584f"]];
        var ns = function (fn) { var q; for (q = 0; q < ST.length; q++) {
            css += B + "." + ST[q][0] + "{" + fn((ST[q][0] === "batch" && pre === "html.light") ? "#4a4a4a" : (ST[q][1] || P.idle), ST[q][0]) + "}\n";
        } };
        for (w = 0; w < WIN.length; w++) {
            P = WIN[w];
            pre = P.pre;
            if (n !== "default") {
                B = pre + " .nbar";
                if (n === "flat") {
                    css += B + "{background:transparent;border:0;border-bottom:1px solid " + P.nbd + ";border-radius:0;box-shadow:none;padding:0 4px;}\n";
                }
                else if (n === "pill") {
                    css += B + "{border-width:1px;border-radius:12px;box-shadow:none;padding:0 12px;}\n";
                    ns(function (c) { return "border-color:" + c + ";"; });
                }
                else if (n === "tint") {
                    css += B + "{border-width:1px;border-radius:3px;box-shadow:none;}\n";
                    ns(function (c) { return "border-color:" + c + ";background:" + mixHex(P.nbg, c, 0.22) + ";"; });
                }
                else if (n === "badge") {
                    css += B + "{border-width:1px 1px 1px 6px;border-radius:0;box-shadow:none;}\n" + B + " .ndot{display:none;}\n";
                    ns(function (c) { return "border-left-color:" + c + ";"; });
                }
                else if (n === "square") {
                    css += B + " .ndot{border-radius:0;}\n";
                }
                else if (n === "strip") {
                    css += B + "{border-left-width:0;border-radius:0;padding-left:14px;}\n" + B + " .ndot{display:none;}\n";
                    ns(function (c) { return "box-shadow:inset 6px 0 0 0 " + c + ";"; });
                }
                else if (n === "compact") {
                    css += B + "{height:20px;line-height:18px;font-size:10px;padding:0 7px;border-radius:2px;}\n" + B + " .ndot{width:6px;height:6px;margin-right:6px;}\n";
                }
                else if (n === "gradient") {
                    css += B + "{border-width:1px 1px 1px 4px;border-radius:6px;box-shadow:none;}\n";
                    ns(function (c) { return "border-color:" + c + ";background:-webkit-linear-gradient(left," + mixHex(P.nbg, c, 0.5) + "," + P.nbg + ");background:linear-gradient(to right," + mixHex(P.nbg, c, 0.5) + "," + P.nbg + ");"; });
                }
                else if (n === "glow") {
                    css += B + "{border-width:1px;border-radius:8px;}\n";
                    ns(function (c) { return "border-color:" + c + ";background:" + mixHex(P.nbg, c, 0.12) + ";box-shadow:0 0 8px " + mixHex(P.nbg, c, 0.65) + ",inset 0 0 6px " + mixHex(P.nbg, c, 0.3) + ";"; });
                }
                else if (n === "solid") {
                    css += B + "{border-width:1px;border-radius:4px;box-shadow:none;}\n";
                    ns(function (c) { return "border-color:" + shade(c, 0.8) + ";background:" + c + ";color:" + readableFg(c) + ";"; });
                    for (q2 = 0; q2 < ST.length; q2++) {
                        sc = (ST[q2][0] === "batch" && pre === "html.light") ? "#4a4a4a" : (ST[q2][1] || P.idle);
                        css += B + "." + ST[q2][0] + " .ndot{background:" + readableFg(sc) + ";box-shadow:none;}\n";
                    }
                }
                else if (n === "topline") {
                    css += B + "{border-width:3px 1px 1px 1px;border-radius:4px;box-shadow:none;}\n";
                    ns(function (c) { return "border-top-color:" + c + ";background:" + mixHex(P.nbg, c, 0.14) + ";"; });
                }
                else if (n === "aurora") {
                    css += B + "{border-width:1px;border-radius:12px;box-shadow:none;padding:0 12px;}\n";
                    ns(function (c) { return "border-color:" + c + ";background:-webkit-linear-gradient(left," + mixHex(P.nbg, c, 0.55) + "," + mixHex(P.nbg, "#a66ad8", 0.4) + ");background:linear-gradient(to right," + mixHex(P.nbg, c, 0.55) + "," + mixHex(P.nbg, "#a66ad8", 0.4) + ");"; });
                }
                else if (n === "terminal") {
                    css += B + "{background:#0b0f0b;border:1px solid #1f2d1f;border-radius:0;box-shadow:none;font-family:Consolas,\"Courier New\",monospace;color:#7bd88f;}\n" + B + " .ndot{display:none;}\n" + B + " .ntxt:before{content:\"> \";}\n";
                    ns(function (c, k2) { return "color:" + (k2 === "idle" ? "#5f7a63" : c) + ";"; });
                }
            }
            css += pre + " #setGear.on," + pre + " #setGear.on:hover{color:" + live + ";}\n";
            if (s !== "default") {
                S = pre + " #partBar.pbar";
                st = S + ":not(.idle)";
                if (s === "outline") {
                    css += S + "{background:transparent;border:1px solid " + P.sac + ";border-radius:3px;}\n" + st + "{border-color:" + P.ssel + ";}\n";
                }
                else if (s === "block") {
                    css += S + "{border-radius:2px;border-left:6px solid " + P.sac + ";padding:0 8px;}\n" + st + "{border-left-color:" + P.ssel + ";}\n";
                }
                else if (s === "mono") {
                    css += S + "{font-family:Consolas,\"Courier New\",monospace;font-size:10.5px;border-radius:0;}\n";
                }
            }
        }
        return css;
    }
    function themeCss() {
        var T = UI.title, S = UI.sel, css = "", Tl, B, p, C;
        if (T) {
            css += "html .bbar.pbar.idle{color:" + T + ";}\nhtml.light .bbar.pbar.idle{color:" + shade(T, 0.72) + ";}\n";
            Tl = shade(T, 0.72);
            css += "legend,.qa .q:before,.tab.on,.tab.on:hover,.tab.on:active,input[type=number],.ddlist div.cur{color:" + T + ";}\n";
            css += "html.light legend,html.light .qa .q:before,html.light .tab.on,html.light .tab.on:hover,html.light .tab.on:active,html.light input[type=number],html.light .ddlist div.cur{color:" + Tl + ";}\n";
        }
        if (S) {
            css += ".ddlist div:hover,.ddlist div.act{background:" + S + ";}\n";
            css += "html.light .ddlist div:hover,html.light .ddlist div.act{background:" + S + ";}\n";
            css += "select:focus,html.light select:focus{border-color:" + S + ";}\n";
            css += "::selection{background:" + S + ";color:#fff;}\n";
        }
        p = palById(UI.btn);
        if (p && p.id !== "blue") {
            B = palButton(p);
            css += "button.primary,html.light button.primary{background:" + B + ";border-color:" + shade(B, 0.75) + ";}\n";
            css += "button.primary:hover,html.light button.primary:hover{background:" + shade(B, 1.18) + ";}\n";
            css += "button.primary:active,html.light button.primary:active{background:" + shade(B, 0.85) + ";}\n";
        }
        css += tabCss();
        css += secCss();
        if (!UI.titleShow) {
            css += "legend:not(.fold){display:none;}\n";
        }
        if (UI.titlePos === "center") {
            css += "legend:not(.fold){margin-left:auto;margin-right:auto;}\n";
        }
        else if (UI.titlePos === "right") {
            css += "legend:not(.fold){margin-left:auto;margin-right:0;}\n";
        }
        if (UI.headStyle === "gradient") {
            var hd, hl;
            hd = UI.title || THEME_DEF.title;
            hl = shade(hd, 0.72);
            css += "html[data-head=gradient] legend:not(.fold){background:linear-gradient(to bottom," + hd + "," + shade(hd, 0.6) + ");color:#fff;border-color:" + shade(hd, 0.5) + ";}\n";
            css += "html.light[data-head=gradient] legend:not(.fold){background:linear-gradient(to bottom," + hl + "," + shade(hl, 0.75) + ");color:#fff;border-color:" + shade(hl, 0.6) + ";}\n";
        }
        if (UI.headWhole && UI.headStyle !== "default") {
            css += "html[data-head] legend:not(.fold){display:block;width:calc(100% + 16px);margin-left:-8px;margin-right:-8px;text-align:" + UI.titlePos + ";}\n";
        }
        if (UI.foldAlign === "left" || UI.foldAlign === "right") {
            css += "legend.fold span.ft{text-align:" + UI.foldAlign + ";}\n";
        }
        css += ".qbfh .qbft{text-align:" + (UI.foldAlign === "left" || UI.foldAlign === "right" ? UI.foldAlign : "center") + ";}\n";
        if (UI.blinkOn) {
            C = UI.blink || "#f2c230";
            css += "fieldset.open > legend.fold .fx,html.light fieldset.open > legend.fold .fx{color:" + C + ";}\n";
            css += "fieldset.open > legend.fold .fch,html.light fieldset.open > legend.fold .fch{color:" + C + ";}\n";
            css += "fieldset.open > legend.fold span.ft,html.light fieldset.open > legend.fold span.ft{color:" + C + ";}\n";
            css += "html .bbar.pbar.idle.foc,html.light .bbar.pbar.idle.foc{color:" + C + ";}\n";
            css += "html #batchRow #batchClear[data-mode=x],html.light #batchRow #batchClear[data-mode=x],html.light #batchRow #batchClear[data-mode=x]:hover{background-image:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='" + C.replace("#", "%23") + "' stroke-width='2.6' stroke-linecap='round'><path d='M5 5l14 14M19 5L5 19'/></svg>\");}\n";
            css += ".nbar.live .ndot{background:" + C + ";box-shadow:0 0 4px " + C + ";}\n";
            css += ".sechead,html.light .sechead{color:" + C + ";}\n";
            css += ".qbfold.open > .qbfh .qbfg,.qbfold.open > .qbfh .qbft,html.light .qbfold.open > .qbfh .qbfg,html.light .qbfold.open > .qbfh .qbft{color:" + C + ";}\n";
            css += ".nbar.live,html.light .nbar.live{border-left-color:" + C + ";}\n.bbar.pbar.live:before,.bbar.pbar.ex:before{background:" + C + ";box-shadow:0 0 4px " + C + ";}\n";
            css += ".pvwrap.exlive textarea,.pvwrap.rolllive textarea{border-color:" + C + ";}\n";
            css += "#textBox.exlive > legend.fold .ft:after,#textBox.rollhead > legend.fold .ft:after{background:" + C + ";}\n";
            css += "#textBox.exlive > legend.fold .ft:before,#textBox.rollhead > legend.fold .ft:before{background:" + C + ";box-shadow:0 0 4px " + C + ";}\n";
            css += "#textBox.batchhead.open > legend.fold .ft:after{background:" + C + ";}\n#textBox.batchhead.open > legend.fold span.ft{color:" + C + ";}\n#textBox.batchhead.open > legend.fold .ft:before{background:" + C + ";box-shadow:0 0 4px " + C + ";}\n";
            css += "#textBox:not(.exlive):not(.rollhead):not(.batchhead).open > legend.fold .ft:after{background:" + C + ";}\n#textBox:not(.exlive):not(.rollhead):not(.batchhead).open > legend.fold .ft:before{background:" + C + ";box-shadow:0 0 4px " + C + ";}\n";
            css += "#textBox.exlive > legend.fold .fx,html.light #textBox.exlive > legend.fold .fx{color:" + C + ";}\n";
            css += "legend.qbmod:after,.acch.qbmod .acct:after,html.light legend.qbmod:after,html.light .acch.qbmod .acct:after{background:" + C + ";box-shadow:0 0 4px " + C + ";}\n";
            css += "button.ibtn[data-mode=exlive],button.ibtn[data-mode=exlive]:hover,html.light button.ibtn[data-mode=exlive],html.light button.ibtn[data-mode=exlive]:hover{background-image:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='9' fill='none' stroke='%23777' stroke-width='2'/><circle cx='12' cy='12' r='4.8' fill='" + C.replace("#", "%23") + "'/></svg>\");}\n";
        }
        css += barThemeCss();
        return css;
    }
    function accentOf() {
        var i, a;
        for (i = 0; i < PALETTE.length; i++) {
            a = PALETTE[i];
            if (UI.title === a.t && UI.fill === a.f && UI.sel === a.s) {
                return a.id;
            }
        }
        return "";
    }
    function colorDropdown(rootId, onPick) {
        var root = $(rootId), btn = root.querySelector(".cddbtn"), arrow = root.querySelector(".ddarrow"), list = root.querySelector(".ddlist"), isOpen = false;
        function close() { isOpen = false; list.style.display = "none"; }
        function openIt() {
            var pr = $("pages").getBoundingClientRect(), br = btn.getBoundingClientRect(), h;
            list.style.display = "block";
            isOpen = true;
            h = list.offsetHeight;
            if (br.bottom + h + 6 > pr.bottom && br.top - pr.top > h + 6) {
                list.style.top = "auto";
                list.style.bottom = "24px";
            }
            else {
                list.style.bottom = "auto";
                list.style.top = "24px";
            }
        }
        function toggle() { if (isOpen) {
            close();
        }
        else {
            openIt();
        } }
        btn.onclick = toggle;
        arrow.onclick = toggle;
        list.onmousedown = function (e) {
            var t = e.target;
            e.preventDefault();
            while (t && t !== list && !t.getAttribute("data-v")) {
                t = t.parentNode;
            }
            if (t && t !== list) {
                close();
                onPick(t.getAttribute("data-v"));
            }
        };
        document.addEventListener("mousedown", function (e) { if (isOpen && !root.contains(e.target)) {
            close();
        } }, true);
        return {
            close: close,
            set: function (items, curId, customChip) {
                var i, d, c, name = "Custom", chip = customChip;
                list.innerHTML = "";
                for (i = 0; i < items.length; i++) {
                    d = document.createElement("div");
                    d.setAttribute("data-v", items[i].id);
                    c = document.createElement("span");
                    c.className = "chip";
                    c.style.background = items[i].chip;
                    d.appendChild(c);
                    d.appendChild(document.createTextNode(items[i].name));
                    if (items[i].id === curId) {
                        d.className = "cur";
                        name = items[i].name;
                        chip = items[i].chip;
                    }
                    list.appendChild(d);
                }
                btn.innerHTML = "";
                c = document.createElement("span");
                c.className = "chip";
                c.style.background = chip;
                btn.appendChild(c);
                btn.appendChild(document.createTextNode(name));
            }
        };
    }
    var ddAccent = colorDropdown("ddAccent", function (id) {
        var p = palById(id);
        if (!p) {
            return;
        }
        cpClose();
        UI.title = p.t;
        UI.fill = p.f;
        UI.sel = p.s;
        saveUI();
        applyThemeColors();
    });
    var ddBtn = colorDropdown("ddBtn", function (id) {
        UI.btn = id;
        saveUI();
        applyThemeColors();
    });
    function placeGo() {
        var go = $("go"), dock = $("dock"), page = document.querySelector(".page.on"), pos = "", unit = go;
        var wrap = $("goWrap"), fold = $("foldAll"), rst = $("resetAll"), row = $("rstRow");
        if (UI.essBtns) {
            if (!wrap) {
                wrap = document.createElement("div");
                wrap.id = "goWrap";
                $("goSlot").appendChild(wrap);
            }
            if (go.parentNode !== wrap) {
                wrap.appendChild(go);
            }
            wrap.insertBefore(fold, go);
            wrap.appendChild(rst);
            wrap.setAttribute("data-size", UI.btnSize);
            row.style.display = "none";
            unit = wrap;
        }
        else {
            if (wrap) {
                if (go.parentNode === wrap) {
                    $("goSlot").appendChild(go);
                }
                row.insertBefore(fold, row.firstChild);
                row.appendChild(rst);
                wrap.parentNode.removeChild(wrap);
            }
            row.style.display = "";
        }
        if (UI.btnPos === "sticky") {
            dock.appendChild(unit);
            pos = "sticky";
        }
        else if (UI.btnPos === "bottom") {
            if (!UI.tabsOn) {
                $("pAudit").appendChild(unit);
                pos = "bottom";
            }
            else if (page) {
                if (page.id === "pOut") {
                    page.insertBefore(unit, $("pOutEnd"));
                }
                else {
                    page.appendChild(unit);
                }
                pos = "bottom";
            }
            else {
                $("goSlot").appendChild(unit);
            }
        }
        else if (UI.btnPos === "top") {
            if (!UI.tabsOn) {
                $("pText").insertBefore(unit, $("pText").firstChild);
                pos = "top";
            }
            else if (page) {
                page.insertBefore(unit, page.firstChild);
                pos = "top";
            }
            else {
                $("goSlot").appendChild(unit);
            }
        }
        else {
            $("goSlot").appendChild(unit);
        }
        go.setAttribute("data-pos", pos);
        if (unit !== go) {
            unit.setAttribute("data-pos", pos);
        }
        dock.style.display = (pos === "sticky") ? "block" : "none";
    }
    window.QBT_placeGo = placeGo;
    function placeFoot() {
        var foot = $("foot"), want = (UI.notiPos === "top") ? "top" : "bottom";
        if (foot.getAttribute("data-pos") === want && foot.parentNode === document.body) {
            return;
        }
        if (want === "top") {
            document.body.insertBefore(foot, $("tabs"));
        }
        else {
            document.body.insertBefore(foot, $("dlg"));
        }
        foot.setAttribute("data-pos", want);
    }
    function placeDock() {
        var d = $("dock"), foot = $("foot"), top = (UI.btnPos === "sticky" && UI.notiPos === "top");
        if (top) {
            if (d.previousSibling !== foot) {
                document.body.insertBefore(d, $("tabs"));
            }
            d.setAttribute("data-at", "top");
        }
        else {
            d.removeAttribute("data-at");
            document.body.insertBefore(d, (foot.getAttribute("data-pos") === "bottom") ? foot : $("dlg"));
        }
    }
    function applyThemeColors() {
        var accItems = [], btnItems = [], i, legs, pos;
        for (i = 0; i < PALETTE.length; i++) {
            accItems.push({ id: PALETTE[i].id, name: PALETTE[i].name, chip: palChip(PALETTE[i]) });
            btnItems.push({ id: PALETTE[i].id, name: PALETTE[i].name, chip: palButton(PALETTE[i]) });
        }
        btnItems.push({ id: "default", name: "Default theme", chip: "#2e2e2e" });
        themeStyle.textContent = themeCss();
        SLIDER_FILL.dark = SLIDER_FILL.light = UI.fill || THEME_DEF.fill;
        setSliderRandom(UI.rndSlOn, UI.rndSlMode);
        setSliderTheme(UI.sliderTheme);
        setSeekTheme(UI.seekOn, UI.seekTheme);
        paintSliders();
        setColor("cTitle", UI.title || THEME_DEF.title);
        setColor("cFill", UI.fill || THEME_DEF.fill);
        setColor("cSel", UI.sel || THEME_DEF.sel);
        ddAccent.set(accItems, accentOf(), UI.fill || THEME_DEF.fill);
        ddBtn.set(btnItems, UI.btn, "#266694");
        $("go").setAttribute("data-btn", UI.btn === "default" ? "plain" : "");
        $("batchGo").setAttribute("data-btn", UI.btn === "default" ? "plain" : "");
        $("go").setAttribute("data-size", UI.btnSize);
        $("batchGo").setAttribute("data-size", UI.btnSize);
        $("themeReset").setAttribute("data-size", UI.btnSize);
        $("btnSize").value = UI.btnSize;
        $("optEss").checked = !!UI.essBtns;
        $("btnPos").value = UI.btnPos;
        $("btnPos").disabled = false;
        $("batchBtnOn").checked = (UI.batchBtn !== "disable");
        $("batchBtnReplace").checked = (UI.batchBtn === "disable" ? UI.batchLast === "replace" : UI.batchBtn === "replace");
        $("batchBtnBoth").checked = (UI.batchBtn === "disable" ? UI.batchLast === "both" : UI.batchBtn === "both");
        syncBatchRadios();
        syncBatchBtn();
        $("optTabs").checked = !!UI.tabsOn;
        $("tabStyle").value = UI.tabStyle;
        $("tabStyle").disabled = !UI.tabsOn;
        $("tabs").setAttribute("data-style", UI.tabStyle);
        $("tabH").value = UI.tabH;
        $("tabAlign").value = UI.tabAlign;
        $("tabH").disabled = !UI.tabsOn;
        $("tabAlign").disabled = !UI.tabsOn;
        if (UI.tabAlign === "default") {
            $("tabs").removeAttribute("data-align");
        }
        else {
            $("tabs").setAttribute("data-align", UI.tabAlign);
        }
        $("modeSimple").checked = !!UI.simple;
        $("modeAdvanced").checked = !UI.simple;
        $("optSecBorder").checked = !!UI.secBorderOn;
        $("cSecBorder").className = "swatch" + (UI.secBorderOn ? "" : " dim");
        setColor("cSecBorder", UI.secBorder || "#4098e3");
        $("secStyle").value = UI.secStyle;
        if (UI.simple) {
            document.documentElement.setAttribute("data-simple", "on");
        }
        else {
            document.documentElement.removeAttribute("data-simple");
        }
        shpRender();
        if (UI.tabsOn) {
            document.documentElement.removeAttribute("data-tabs");
        }
        else {
            document.documentElement.setAttribute("data-tabs", "off");
        }
        $("optAccTabs").checked = UI.accTabs !== false;
        $("optAccTabs").disabled = !UI.tabsOn;
        if (window.QBT_accMode) {
            window.QBT_accMode(!!UI.tabsOn, UI.accTabs !== false);
        }
        setTimeout(function () { paintSliders(); drawFxPreview(); }, 0);
        placeGo();
        pos = UI.titlePos;
        legs = document.getElementsByTagName("legend");
        for (i = 0; i < legs.length; i++) {
            if (legs[i].className.indexOf("fold") < 0) {
                legs[i].setAttribute("align", pos);
            }
        }
        $("optTitle").checked = !!UI.titleShow;
        $("headStyle").value = UI.headStyle;
        $("headText").checked = !UI.headWhole;
        $("headWhole").checked = !!UI.headWhole;
        if (UI.headStyle === "default") {
            document.documentElement.removeAttribute("data-head");
        }
        else {
            document.documentElement.setAttribute("data-head", UI.headStyle);
        }
        $("foldL").checked = UI.foldAlign === "left";
        $("foldC").checked = UI.foldAlign === "center";
        $("foldR").checked = UI.foldAlign === "right";
        $("optModDot").checked = !!UI.modDotOn;
        $("modStatic").checked = UI.modDotMode === "static";
        $("modBlink").checked = UI.modDotMode !== "static";
        $("modStatic").disabled = !UI.modDotOn;
        $("modBlink").disabled = !UI.modDotOn;
        $("lblModStatic").className = "check" + (UI.modDotOn ? "" : " off");
        $("lblModBlink").className = "check" + (UI.modDotOn ? "" : " off");
        if (!UI.modDotOn) {
            document.documentElement.setAttribute("data-moddot", "off");
        }
        else if (UI.modDotMode === "static") {
            document.documentElement.setAttribute("data-moddot", "static");
        }
        else {
            document.documentElement.removeAttribute("data-moddot");
        }
        $("optBlink").checked = !!UI.blinkOn;
        $("cBlink").className = "swatch" + (UI.blinkOn ? "" : " dim");
        setColor("cBlink", UI.blink || "#f2c230");
        $("titlePos").value = pos;
        $("titlePos").disabled = !UI.titleShow;
        $("miniSecs").value = UI.miniSecs;
        $("notiTop").checked = UI.notiPos === "top";
        $("notiBottom").checked = UI.notiPos !== "top";
        $("foot").style.display = "";
        placeFoot();
        placeDock();
        $("partRow").className = "";
        $("notiTheme").value = UI.notiTheme;
        $("notiTheme").disabled = false;
        $("selBarTheme").value = UI.selBarTheme;
        $("optSelNote").checked = UI.selNote !== false;
        applySelNote();
        $("headTheme").value = UI.headTheme;
        $("optGap").value = UI.optGap;
        if (UI.optGap === "default") { document.documentElement.removeAttribute("data-optgap"); } else { document.documentElement.setAttribute("data-optgap", UI.optGap); }
        document.documentElement.setAttribute("data-headtheme", UI.headTheme);
        $("sliderTheme").value = UI.sliderTheme;
        $("optSeek").checked = !!UI.seekOn;
        $("seekTheme").value = UI.seekTheme;
        $("seekTheme").disabled = !UI.seekOn;
        $("optRndSl").checked = !!UI.rndSlOn;
        $("rndSlFill").checked = UI.rndSlMode !== "both";
        $("rndSlBoth").checked = UI.rndSlMode === "both";
        $("rndSlFill").disabled = !UI.rndSlOn;
        $("rndSlBoth").disabled = !UI.rndSlOn;
        $("lblRndFill").className = "check" + (UI.rndSlOn ? "" : " off");
        $("lblRndBoth").className = "check" + (UI.rndSlOn ? "" : " off");
        NOTE_MS = UI.miniSecs * 1000;
    }
    function themeColorPicked(id) {
        if (!THEME_IDS[id]) {
            return;
        }
        UI[THEME_IDS[id]] = getColor(id);
        if (id === "cSecBorder") {
            UI.secBorderOn = true;
        }
        if (id === "cBlink") {
            UI.blinkOn = true;
        }
        saveUI();
        applyThemeColors();
    }
    (function themeSection() {
        var k, c;
        for (k in THEME_IDS) {
            if (THEME_IDS.hasOwnProperty(k)) {
                c = UI[THEME_IDS[k]];
                UI[THEME_IDS[k]] = c ? parseHex(c) : null;
            }
        }
        if (UI.btn !== "default" && !palById(UI.btn)) {
            UI.btn = "blue";
        }
        if (UI.titlePos !== "left" && UI.titlePos !== "center" && UI.titlePos !== "right") {
            UI.titlePos = "left";
        }
        UI.titleShow = !!UI.titleShow;
        UI.headWhole = !!UI.headWhole;
        UI.accTabs = (UI.accTabs !== false);
        if ({ button: 1, gradient: 1, outline: 1, underline: 1, leftbar: 1 }[UI.headStyle] !== 1) {
            UI.headStyle = "default";
        }
        if (UI.foldAlign !== "left" && UI.foldAlign !== "right") {
            UI.foldAlign = "center";
        }
        UI.modDotOn = (UI.modDotOn !== false);
        if (UI.modDotMode !== "static") {
            UI.modDotMode = "blink";
        }
        UI.blinkOn = !!UI.blinkOn;
        if (UI.notiPos !== "top") {
            UI.notiPos = "bottom";
        }
        if (!NOTI_T[UI.notiTheme]) {
            UI.notiTheme = "default";
        }
        if (UI.optGap !== "default" && !(/^([1-9]|1[0-5])$/.test(String(UI.optGap)))) {
            UI.optGap = "default";
        }
        UI.optGap = String(UI.optGap);
        if (!HEAD_T[UI.headTheme]) {
            UI.headTheme = "default";
        }
        if (!SELB_T[UI.selBarTheme]) {
            UI.selBarTheme = "default";
        }
        if (!SLIDER_T.hasOwnProperty(UI.sliderTheme)) {
            UI.sliderTheme = "default";
        }
        UI.seekOn = !!UI.seekOn;
        UI.rndSlOn = !!UI.rndSlOn;
        if (UI.rndSlMode !== "both") {
            UI.rndSlMode = "fill";
        }
        if (!SLIDER_T.hasOwnProperty(UI.seekTheme) && !SEEK_T.hasOwnProperty(UI.seekTheme)) {
            UI.seekTheme = "default";
        }
        UI.miniSecs = clampSecs(UI.miniSecs);
        if (UI.btnPos !== "bottom" && UI.btnPos !== "top" && UI.btnPos !== "sticky") {
            UI.btnPos = "default";
        }
        if (UI.batchBtn !== "disable" && UI.batchBtn !== "both" && UI.batchBtn !== "replace") {
            UI.batchBtn = "disable";
        }
        if (UI.batchLast !== "both") {
            UI.batchLast = "replace";
        }
        if (UI.btnSize !== "small" && UI.btnSize !== "large") {
            UI.btnSize = "default";
        }
        UI.essBtns = !!UI.essBtns;
        UI.tabsOn = !!UI.tabsOn;
        if ({ line: 1, top: 1, bar: 1, gradient: 1, btn: 1, invert: 1, glow: 1, pill: 1, ghost: 1, pp: 1, ppline: 1, fullb: 1 }[UI.tabStyle] !== 1) {
            UI.tabStyle = "default";
        }
        if (!TAB_H[UI.tabH]) {
            UI.tabH = "default";
        }
        if ({ top: 1, uptop: 1, center: 1, updown: 1, bottom: 1 }[UI.tabAlign] !== 1) {
            UI.tabAlign = "default";
        }
        UI.simple = !!UI.simple;
        UI.secBorderOn = !!UI.secBorderOn;
        if ({ underline: 1, left: 1, top: 1, card: 1, inset: 1, corners: 1, dashed: 1, dotted: 1, double: 1, round: 1, none: 1 }[UI.secStyle] !== 1) {
            UI.secStyle = "default";
        }
        $("btnPos").addEventListener("change", function () { UI.btnPos = this.value; saveUI(); applyThemeColors(); }, false);
        (function batchBtnControls() {
            var els = document.getElementsByName("batchBtn"), i;
            $("batchBtnOn").addEventListener("change", function () {
                UI.batchBtn = this.checked ? UI.batchLast : "disable";
                syncBatchRadios();
                saveUI();
                applyThemeColors();
            }, false);
            for (i = 0; i < els.length; i++) {
                els[i].addEventListener("change", function () { if (this.checked) {
                    UI.batchLast = this.value;
                    UI.batchBtn = this.value;
                    saveUI();
                    applyThemeColors();
                } }, false);
            }
        })();
        $("btnSize").addEventListener("change", function () { UI.btnSize = this.value; saveUI(); applyThemeColors(); }, false);
        $("optEss").addEventListener("change", function () { UI.essBtns = this.checked; saveUI(); applyThemeColors(); }, false);
        $("optTabs").addEventListener("change", function () { UI.tabsOn = this.checked; saveUI(); applyThemeColors(); }, false);
        $("tabStyle").addEventListener("change", function () { UI.tabStyle = this.value; saveUI(); applyThemeColors(); }, false);
        $("tabH").addEventListener("change", function () { UI.tabH = this.value; saveUI(); applyThemeColors(); }, false);
        $("tabAlign").addEventListener("change", function () { UI.tabAlign = this.value; saveUI(); applyThemeColors(); }, false);
        $("modeSimple").addEventListener("change", function () { if (this.checked) {
            UI.simple = true;
            saveUI();
            applyThemeColors();
        } }, false);
        $("modeAdvanced").addEventListener("change", function () { if (this.checked) {
            UI.simple = false;
            saveUI();
            applyThemeColors();
        } }, false);
        $("optSecBorder").addEventListener("change", function () { UI.secBorderOn = this.checked; if (this.checked && !UI.secBorder) {
            UI.secBorder = getColor("cSecBorder");
        } saveUI(); applyThemeColors(); }, false);
        $("secStyle").addEventListener("change", function () { UI.secStyle = this.value; saveUI(); applyThemeColors(); }, false);
        $("optTitle").addEventListener("change", function () { UI.titleShow = this.checked; saveUI(); applyThemeColors(); }, false);
        $("headStyle").addEventListener("change", function () { UI.headStyle = this.value; saveUI(); applyThemeColors(); }, false);
        $("headText").addEventListener("change", function () { if (this.checked) {
            UI.headWhole = false;
            saveUI();
            applyThemeColors();
        } }, false);
        $("headWhole").addEventListener("change", function () { if (this.checked) {
            UI.headWhole = true;
            saveUI();
            applyThemeColors();
        } }, false);
        $("optAccTabs").addEventListener("change", function () { UI.accTabs = this.checked; saveUI(); applyThemeColors(); }, false);
        $("titlePos").addEventListener("change", function () { UI.titlePos = this.value; saveUI(); applyThemeColors(); }, false);
        function foldPick() { if (this.checked) {
            UI.foldAlign = this.value;
            saveUI();
            applyThemeColors();
        } }
        $("foldL").addEventListener("change", foldPick, false);
        $("foldC").addEventListener("change", foldPick, false);
        $("foldR").addEventListener("change", foldPick, false);
        $("optModDot").addEventListener("change", function () { UI.modDotOn = this.checked; saveUI(); applyThemeColors(); }, false);
        $("modStatic").addEventListener("change", function () { if (this.checked) { UI.modDotMode = "static"; saveUI(); applyThemeColors(); } }, false);
        $("modBlink").addEventListener("change", function () { if (this.checked) { UI.modDotMode = "blink"; saveUI(); applyThemeColors(); } }, false);
        $("optBlink").addEventListener("change", function () { UI.blinkOn = this.checked; if (this.checked && !UI.blink) {
            UI.blink = getColor("cBlink");
        } saveUI(); applyThemeColors(); }, false);
        $("notiTop").addEventListener("change", function () { if (this.checked) { UI.notiPos = "top"; saveUI(); applyThemeColors(); } }, false);
        $("notiBottom").addEventListener("change", function () { if (this.checked) { UI.notiPos = "bottom"; saveUI(); applyThemeColors(); } }, false);
        $("notiTheme").addEventListener("change", function () { UI.notiTheme = this.value; saveUI(); applyThemeColors(); }, false);
        $("optGap").addEventListener("change", function () { UI.optGap = this.value; saveUI(); applyThemeColors(); }, false);
        $("headTheme").addEventListener("change", function () { UI.headTheme = this.value; saveUI(); applyThemeColors(); }, false);
        $("optSelNote").addEventListener("change", function () { UI.selNote = this.checked; saveUI(); applySelNote(); }, false);
        $("selBarTheme").addEventListener("change", function () { UI.selBarTheme = this.value; saveUI(); applyThemeColors(); }, false);
        $("sliderTheme").addEventListener("change", function () { UI.sliderTheme = this.value; saveUI(); applyThemeColors(); }, false);
        $("optSeek").addEventListener("change", function () { UI.seekOn = this.checked; saveUI(); applyThemeColors(); }, false);
        $("seekTheme").addEventListener("change", function () { UI.seekTheme = this.value; saveUI(); applyThemeColors(); }, false);
        $("optRndSl").addEventListener("change", function () { UI.rndSlOn = this.checked; saveUI(); applyThemeColors(); }, false);
        $("rndSlFill").addEventListener("change", function () { if (this.checked) { UI.rndSlMode = "fill"; saveUI(); applyThemeColors(); } }, false);
        $("rndSlBoth").addEventListener("change", function () { if (this.checked) { UI.rndSlMode = "both"; saveUI(); applyThemeColors(); } }, false);
        function commitSecs() { UI.miniSecs = clampSecs($("miniSecs").value); saveUI(); applyThemeColors(); }
        $("miniSecs").addEventListener("change", commitSecs, false);
        $("miniSecs").addEventListener("blur", commitSecs, false);
        applyThemeColors();
    })();
    function clampSecs(v) {
        v = Math.round(parseFloat(v));
        if (isNaN(v)) {
            v = 30;
        }
        return Math.min(300, Math.max(5, v));
    }
    (function folds() {
        var ids = ["textLegend", "pmLegend", "logLegend", "posLegend", "fxLegend", "animLegend", "shpLegend", "rollLegend"], i, fhs = document.querySelectorAll("legend.fold .fh"), x;
        for (i = 0; i < fhs.length; i++) {
            x = document.createElement("span");
            x.className = "fx";
            x.title = "Open or close this section";
            fhs[i].appendChild(x);
        }
        (function icons() {
            var m = { pmLegend: "p", logLegend: "l" }, id, lg, fh, s;
            for (id in m) {
                if (m.hasOwnProperty(id)) {
                    lg = $(id);
                    fh = lg ? lg.querySelector(".fh") : null;
                    if (fh) {
                        s = document.createElement("span");
                        s.className = "fic";
                        s.setAttribute("data-ic", m[id]);
                        fh.insertBefore(s, fh.firstChild);
                    }
                }
            }
            $("themeReset").onclick = function () { resetTheme(); };
        })();
        (function chevrons() {
            var j, h, c, PV = ["posLegend", "fxLegend", "animLegend", "shpLegend", "rollLegend"];
            for (j = 0; j < fhs.length; j++) {
                h = fhs[j];
                if (!h.parentNode || PV.indexOf(h.parentNode.id) < 0) {
                    continue;
                }
                c = document.createElement("span");
                c.className = "fch";
                c.title = "Open or close this section";
                h.insertBefore(c, h.firstChild);
            }
        })();
        var MINI_KEY = "qbt_fold_mini_v2", MINI = ["posPrevBox", "fxPrevBox", "animPrevBox", "shpPrevBox", "rollPrevBox"], PVS = ["animPrevBox", "shpPrevBox", "rollPrevBox"], mini = {};
        try {
            mini = JSON.parse(localStorage.getItem(MINI_KEY) || "{}") || {};
        }
        catch (eMn) {
            mini = {};
        }
        window.QBT_miniWanted = function (id) { return !!mini[id]; };
        for (i = 0; i < MINI.length; i++) {
            if (PVS.indexOf(MINI[i]) >= 0) {
                mini[MINI[i]] = 0;
                continue;
            }
            if (mini[MINI[i]] && $(MINI[i]).className.indexOf(" open") < 0) {
                $(MINI[i]).className += " open";
            }
        }
        setTimeout(function () { try {
            posRender();
            drawFxPreview();
        }
        catch (eM) { } }, 450);
        function toggle() {
            var fs = this.parentNode, j, other;
            if (fs.className.indexOf(" dis") >= 0) {
                return;
            }
            fs.className = (fs.className.indexOf(" open") >= 0) ? fs.className.replace(" open", "") : fs.className + " open";
            if (PVS.indexOf(fs.id) >= 0 && fs.className.indexOf(" open") >= 0) {
                for (j = 0; j < PVS.length; j++) {
                    other = $(PVS[j]);
                    if (PVS[j] !== fs.id && other.className.indexOf(" open") >= 0 && other.parentNode.id !== "pinHost") {
                        other.className = other.className.replace(" open", "");
                        mini[PVS[j]] = 0;
                    }
                }
            }
            if (MINI.indexOf(fs.id) >= 0 && fs.parentNode.id !== "pinHost") {
                mini[fs.id] = (fs.className.indexOf(" open") >= 0) ? 1 : 0;
                try {
                    localStorage.setItem(MINI_KEY, JSON.stringify(mini));
                }
                catch (eMs) { }
            }
            cpClose();
            ddAccent.close();
            ddBtn.close();
            if (fs.id === "posPrevBox" && fs.className.indexOf(" open") < 0) {
                posLive.clear();
            }
            if (PVS.indexOf(fs.id) >= 0 && window.QBT_pvFolded) {
                window.QBT_pvFolded();
            }
            qbHub.flush();
            posRender();
            shpRender();
            drawFxPreview();
            if (window.QBT_rollRender) {
                window.QBT_rollRender();
            }
        }
        for (i = 0; i < ids.length; i++) {
            $(ids[i]).onclick = toggle;
        }
    })();
    (function sectionSearch() {
        var DEFS = [["pmBox", "pmList", true], ["logBox", "status", false]], i;
        function wire(boxId, listId, isList) {
            var fs = $(boxId), list = $(listId), fh = fs ? fs.querySelector("legend.fold .fh") : null, fx = fh ? fh.querySelector(".fx") : null, body = fs ? fs.querySelector(".foldbody") : null, btn, bar, inp, cnt, busy = false;
            if (!fs || !list || !fh || !fx || !body) {
                return;
            }
            btn = document.createElement("button");
            btn.type = "button";
            btn.className = "fsr";
            btn.title = "Search";
            btn.setAttribute("aria-label", "Search");
            if (boxId !== "pmBox") {
                fh.insertBefore(btn, fx);
            }
            bar = document.createElement("div");
            bar.className = "qsearch";
            inp = document.createElement("input");
            inp.type = "text";
            inp.placeholder = isList ? "Search..." : "Search the log...";
            inp.title = "Type to show only the matching entries. Esc clears it.";
            cnt = document.createElement("span");
            cnt.className = "qsn";
            bar.appendChild(inp);
            bar.appendChild(cnt);
            fs.insertBefore(bar, body);
            if (boxId === "pmBox") {
                bar.appendChild($("pmFilter"));
                fs.className += " srchon";
            }
            function filter() {
                var q = inp.value.replace(/^\s+|\s+$/g, "").toLowerCase(), c = list.children, k, e, hit, shown = 0, total = 0, item;
                for (k = 0; k < c.length; k++) {
                    e = c[k];
                    item = isList ? (e.getAttribute("data-name") !== null) : true;
                    if (!q) {
                        if (e.style.display === "none") {
                            e.style.display = "";
                        }
                        if (item) {
                            total++;
                            shown++;
                        }
                        continue;
                    }
                    if (!item) {
                        e.style.display = "none";
                        continue;
                    }
                    total++;
                    hit = (e.textContent || "").toLowerCase().indexOf(q) >= 0;
                    e.style.display = hit ? "" : "none";
                    if (hit) {
                        shown++;
                    }
                }
                cnt.textContent = q ? (shown ? shown + " / " + total : "No match") : "";
            }
            function run() { if (busy) {
                return;
            } busy = true; try {
                filter();
            }
            catch (eS) { } busy = false; }
            function show(on) {
                var has = fs.className.indexOf(" srchon") >= 0;
                if (boxId === "pmBox") {
                    if (!on) {
                        inp.value = "";
                        run();
                    }
                    return;
                }
                if (on === has) {
                    return;
                }
                if (on) {
                    fs.className += " srchon";
                    btn.className = "fsr on";
                    btn.title = "Close the search";
                    try {
                        inp.focus();
                    }
                    catch (eF) { }
                }
                else {
                    fs.className = fs.className.replace(" srchon", "");
                    btn.className = "fsr";
                    btn.title = "Search";
                    inp.value = "";
                    run();
                }
            }
            btn.onclick = function (e) { if (e && e.stopPropagation) {
                e.stopPropagation();
            } show(fs.className.indexOf(" srchon") < 0); };
            inp.addEventListener("input", run, false);
            inp.addEventListener("keydown", function (e) { if (e.keyCode === 27) {
                show(false);
                e.stopPropagation();
            } }, false);
            inp.addEventListener("click", function (e) { e.stopPropagation(); }, false);
            if (window.MutationObserver) {
                new MutationObserver(function () { if (inp.value) {
                    run();
                } }).observe(list, { childList: true });
            }
        }
        for (i = 0; i < DEFS.length; i++) {
            wire(DEFS[i][0], DEFS[i][1], DEFS[i][2]);
        }
    })();
    (function smoothLists() {
        var lists = document.querySelectorAll(".qlist"), i, ITEMS = 4.5, CHASE = 0.13;
        function wire(el) {
            var target = null, running = false, last = 0, pos = 0, fpos = null;
            function itemH() { var c = el.querySelector("div.it"), r; if (!c) {
                return 22;
            } r = c.getBoundingClientRect(); return (r && r.height) ? r.height : (c.offsetHeight || 22); }
            function step() {
                var now = new Date().getTime(), dt = Math.min(48, Math.max(1, now - last)), d, mv;
                last = now;
                if (target === null) {
                    running = false;
                    return;
                }
                d = target - pos;
                if (Math.abs(d) < 0.8) {
                    el.scrollTop = target;
                    target = null;
                    running = false;
                    fpos = null;
                    return;
                }
                mv = d * (1 - Math.pow(1 - CHASE, dt / 16.7));
                if (Math.abs(mv) < 0.9) {
                    mv = d > 0 ? 0.9 : -0.9;
                }
                if (Math.abs(mv) > Math.abs(d)) {
                    mv = d;
                }
                pos += mv;
                el.scrollTop = Math.round(pos);
                raf(step);
            }
            el.addEventListener("wheel", function (e) {
                var max = el.scrollHeight - el.clientHeight, base, dy, h, dir, next, notch;
                if (max <= 0 || e.ctrlKey) {
                    return;
                }
                dy = e.deltaY;
                if (!dy) {
                    return;
                }
                h = itemH();
                if (!running) {
                    pos = el.scrollTop;
                }
                base = (target === null) ? el.scrollTop : target;
                if (fpos === null) {
                    fpos = base / h;
                }
                dir = dy > 0 ? 1 : -1;
                if (e.deltaMode === 0 && Math.abs(dy) < 40) {
                    notch = dy / 100;
                }
                else {
                    notch = dir;
                }
                fpos += notch * ITEMS;
                next = Math.round(fpos) * h;
                if (e.deltaMode === 0 && Math.abs(dy) < 40) {
                    next = fpos * h;
                }
                next = Math.min(max, Math.max(0, next));
                if (Math.abs(next - base) < 0.5) {
                    fpos = null;
                    return;
                }
                target = next;
                e.preventDefault();
                if (!running) {
                    running = true;
                    last = new Date().getTime();
                    raf(step);
                }
            }, false);
            el.addEventListener("mousedown", function () { target = null; fpos = null; }, false);
            el.addEventListener("keydown", function () { target = null; fpos = null; }, false);
        }
        for (i = 0; i < lists.length; i++) {
            wire(lists[i]);
        }
    })();
    var dlg = { box: $("dlg"), msg: $("dlgMsg"), inp: $("dlgInput"), ok: $("dlgOk"), no: $("dlgCancel"), alt: $("dlgAlt"), btns: $("dlgBtns"), cb: null, input: false };
    var dlgRad = $("dlgRadios");
    function dlgRadioVal() { var r = dlgRad.getElementsByTagName("input"), i; for (i = 0; i < r.length; i++) {
        if (r[i].checked) {
            return r[i].value;
        }
    } return ""; }
    function dlgClose(result) {
        var cb = dlg.cb;
        dlg.cb = null;
        dlg.box.style.display = "none";
        document.removeEventListener("keydown", dlgKey, true);
        if (cb) {
            cb(result);
        }
    }
    function dlgKey(e) {
        if (e.keyCode === 27) {
            e.preventDefault();
            e.stopPropagation();
            dlg.no.click();
        }
        else if (e.keyCode === 13) {
            e.preventDefault();
            e.stopPropagation();
            if (document.activeElement === dlg.no) {
                dlg.no.click();
            }
            else if (document.activeElement === dlg.alt) {
                dlg.alt.click();
            }
            else {
                dlg.ok.click();
            }
        }
    }
    function ask(o, cb) {
        dlg.cb = cb || null;
        dlg.input = !!o.input;
        dlg.msg.textContent = o.msg || "";
        dlg.inp.style.display = o.input ? "block" : "none";
        dlg.inp.value = o.value || "";
        dlgRad.innerHTML = "";
        dlgRad.style.display = "none";
        if (o.radios && o.radios.length) {
            (function () {
                var i, l, r, t;
                for (i = 0; i < o.radios.length; i++) {
                    l = document.createElement("label");
                    r = document.createElement("input");
                    t = document.createElement("span");
                    r.type = "radio";
                    r.name = "dlgRad";
                    r.value = o.radios[i].v;
                    r.checked = (o.radios[i].v === o.radio) || (i === 0 && !o.radio);
                    t.textContent = o.radios[i].t;
                    l.appendChild(r);
                    l.appendChild(t);
                    dlgRad.appendChild(l);
                }
                dlgRad.style.display = "-webkit-flex";
                dlgRad.style.display = "flex";
            })();
        }
        dlg.ok.textContent = o.ok || "OK";
        dlg.ok.className = o.okKind || (o.danger ? "danger" : "");
        dlg.alt.className = o.altKind || "";
        dlg.no.className = o.noKind || "";
        dlg.no.textContent = o.no || "Cancel";
        dlg.no.style.display = (o.cancel === false) ? "none" : "";
        dlg.alt.style.display = o.alt ? "" : "none";
        dlg.alt.textContent = o.alt || "";
        dlg.btns.className = ((o.alt || o.row) ? "dbtns row" : "dbtns") + (o.full ? " full" : "") + (o.yesFirst ? " yesfirst" : "");
        dlg.box.style.display = "-webkit-flex";
        dlg.box.style.display = "flex";
        document.addEventListener("keydown", dlgKey, true);
        setTimeout(function () { if (o.input) {
            dlg.inp.focus();
            dlg.inp.select();
        }
        else if (o.focus === "no") {
            dlg.no.focus();
        }
        else if (o.alt) {
            dlg.alt.focus();
        }
        else {
            dlg.ok.focus();
        } }, 0);
    }
    dlg.ok.onclick = function () { dlgClose(dlg.input ? dlg.inp.value : true); };
    dlg.no.onclick = function () { dlgClose(dlg.input ? null : false); };
    dlg.alt.onclick = function () { dlgClose("alt"); };
    (function presets() {
        var sel = $("presetPick"), btn = $("presetBtn"), last = "", fs = null, path = null, DIR = "", list = [], loaded = false;
        (function init() {
            var req = nodeRequire();
            if (!req) {
                return;
            }
            try {
                fs = req("fs");
                path = req("path");
                DIR = path.join(cs.getSystemPath("extension"), "presets");
            }
            catch (e) {
                fs = null;
            }
        })();
        function fileFor(name) { return path.join(DIR, name.replace(/[\\\/:*?"<>|]+/g, "_") + ".json"); }
        function ensure() {
            if (!loaded) {
                fill("");
            }
        }
        function find(name) {
            var i, low = String(name).toLowerCase();
            ensure();
            for (i = 0; i < list.length; i++) {
                if (list[i].name.toLowerCase() === low) {
                    return list[i];
                }
            }
            return null;
        }
        function problem(text, e, short) {
            ask({ msg: text + (e ? "\n\n" + e : ""), cancel: false });
            if (short) {
                note(short, "err");
            }
        }
        function noFiles() { problem("Presets need file access (Node.js), which is not available in this panel.", "", "Presets are not available (no file access)."); }
        function snapshot() {
            var o = { f: { label: curFont.label, family: curFont.family, uiStyle: curFont.uiStyle, ps: curFont.ps }, v: {}, k: {}, c: {} }, i;
            for (i = 0; i < TS_VALUES.length; i++) {
                o.v[TS_VALUES[i]] = $(TS_VALUES[i]).value;
            }
            for (i = 0; i < TS_CHECKS.length; i++) {
                o.k[TS_CHECKS[i]] = $(TS_CHECKS[i]).checked;
            }
            for (i = 0; i < TS_COLORS.length; i++) {
                o.c[TS_COLORS[i]] = getColor(TS_COLORS[i]);
            }
            return o;
        }
        function readAll() {
            var out = [], names, i, o;
            if (!fs) {
                return out;
            }
            try {
                if (!fs.existsSync(DIR)) {
                    return out;
                }
                names = fs.readdirSync(DIR);
            }
            catch (e) {
                return out;
            }
            for (i = 0; i < names.length; i++) {
                if (!/\.json$/i.test(names[i])) {
                    continue;
                }
                try {
                    o = JSON.parse(fs.readFileSync(path.join(DIR, names[i]), "utf8").replace(/^\uFEFF/, ""));
                    if (o && o.settings) {
                        out.push({ name: String(o.name || names[i].replace(/\.json$/i, "")), settings: o.settings, ts: o.ts ? 1 : 0, file: path.join(DIR, names[i]) });
                    }
                }
                catch (e2) { }
            }
            out.sort(function (a, b) { var x = a.name.toLowerCase(), y = b.name.toLowerCase(); return x < y ? -1 : (x > y ? 1 : 0); });
            return out;
        }
        function setBtn() {
            btn.setAttribute("data-mode", last ? "del" : "save");
            btn.title = last ? "Delete the selected preset" : "Save the current settings as a new preset";
        }
        function fill(selectName) {
            var i, o;
            loaded = true;
            list = readAll();
            sel.innerHTML = "";
            o = document.createElement("option");
            o.value = "";
            o.textContent = list.length ? "Select a preset..." : "No presets yet";
            sel.appendChild(o);
            for (i = 0; i < list.length; i++) {
                o = document.createElement("option");
                o.value = "n:" + list[i].name;
                o.textContent = list[i].name;
                sel.appendChild(o);
            }
            last = (selectName && find(selectName)) ? find(selectName).name : "";
            sel.value = last ? "n:" + last : "";
            if (sel.selectedIndex < 0) {
                sel.selectedIndex = 0;
            }
            setBtn();
            if (last) {
                qbHub.select("p", last);
            }
            qbHub.refresh();
        }
        deselectPreset = function () { last = ""; sel.selectedIndex = 0; setBtn(); };
        function writeFile(name, settings, ts) {
            var ex = find(name), target;
            if (!fs.existsSync(DIR)) {
                fs.mkdirSync(DIR);
            }
            target = fileFor(name);
            fs.writeFileSync(target, JSON.stringify({ qbtPreset: 1, name: name, ts: ts ? 1 : 0, settings: settings }, null, 2), "utf8");
            if (ex && ex.file !== target) {
                try {
                    fs.unlinkSync(ex.file);
                }
                catch (e) { }
            }
        }
        function saveCurrent() {
            if (!fs) {
                noFiles();
                return;
            }
            ask({ msg: "Name for the new Text style preset (tag: Text style).\n\nIt stores the font, size, tracking, alignment, text colour, position, outline and shadow only.\n\nName:", input: true, value: "", ok: "Save" }, function (v) {
                var name;
                if (v === null) {
                    return;
                }
                name = cleanName(v);
                if (!name) {
                    problem("Please type a name for the preset.");
                    return;
                }
                function doWrite() {
                    try {
                        writeFile(name, snapshot(), 1);
                        list = readAll();
                        fill(name);
                        log("Preset saved: " + name, "ok");
                        note("Preset saved successfully: " + name, "ok");
                    }
                    catch (e) {
                        problem("Could not save the preset into the extension folder:\n" + DIR, e, "Could not save the preset.");
                    }
                }
                if (find(name)) {
                    ask({ msg: "A preset named \"" + name + "\" already exists. Replace it?", ok: "Replace" }, function (yes) { if (yes) {
                        doWrite();
                    } });
                }
                else {
                    doWrite();
                }
            });
        }
        function loadPreset(name) {
            var p = name ? find(name) : null;
            if (!p) {
                return;
            }
            last = p.name;
            sel.value = "n:" + p.name;
            if (sel.selectedIndex < 0) {
                sel.selectedIndex = 0;
            }
            setBtn();
            qbHub.select("p", p.name);
            if (p.ts) {
                applySettings(p.settings, TS_VALUES, TS_CHECKS, TS_COLORS);
            }
            else {
                applySettings(p.settings, PRESET_VALUES, PRESET_CHECKS, PRESET_COLORS);
            }
            log("Preset loaded: " + p.name, "ok");
            note("Preset loaded successfully: " + p.name, "ok");
        }
        function deleteNamed(name) {
            var p = name ? find(name) : null;
            if (!fs) {
                noFiles();
                return;
            }
            if (!p) {
                problem("Choose a preset in the list first.");
                return;
            }
            ask({ msg: "Delete the preset \"" + p.name + "\"?\n\nThis cannot be undone.", ok: "Delete", danger: true }, function (yes) {
                if (!yes) {
                    return;
                }
                try {
                    fs.unlinkSync(p.file);
                    log("Preset deleted: " + p.name, "ok");
                    fill(last && last !== p.name ? last : "");
                    note("Preset deleted successfully: " + p.name, "ok");
                }
                catch (e) {
                    problem("Could not delete the preset file:\n" + p.file, e, "Could not delete the preset.");
                }
            });
        }
        function deleteSelected() { deleteNamed(last); }
        function rm(name) {
            var p = name ? find(name) : null;
            if (!fs || !p) {
                return false;
            }
            try {
                fs.unlinkSync(p.file);
            }
            catch (e) {
                return false;
            }
            fill(last && last !== p.name ? last : "");
            return true;
        }
        function getP(name) { var p = name ? find(name) : null; return p ? { name: p.name, ts: p.ts, settings: p.settings } : null; }
        function itemsP() { var a = [], i; ensure(); for (i = 0; i < list.length; i++) {
            a.push({ name: list[i].name, tag: "s", own: true });
        } return a; }
        function importItems(items, done) {
            var queue = [], pos = 0, n = 0, bad = 0, first = "", cancelled = false, k;
            if (!fs) {
                done({ n: 0, bad: items.length, cancelled: false, first: "" });
                return;
            }
            for (k = 0; k < items.length; k++) {
                if (items[k] && items[k].settings) {
                    queue.push(items[k]);
                }
                else {
                    bad++;
                }
            }
            function put(name, settings, ts) {
                try {
                    writeFile(name, settings, ts);
                    if (!first) {
                        first = name;
                    }
                    n++;
                }
                catch (e) {
                    bad++;
                }
            }
            function numbered(base) {
                var nm = base, c;
                list = readAll();
                for (c = 2; find(nm); c++) {
                    nm = base + " (" + c + ")";
                }
                return nm;
            }
            function step() {
                var it, base;
                while (pos < queue.length && !cancelled) {
                    it = queue[pos++];
                    base = cleanName(it.name) || "Imported preset";
                    list = readAll();
                    if (find(base)) {
                        ask({ msg: "A text style preset named \"" + base + "\" already exists.\n\nReplace it, keep both (the new one gets a number at the end), or cancel the import?", ok: "Replace", okKind: "danger", alt: "Keep Both", altKind: "good" }, (function (b, st, ts) {
                            return function (res) {
                                if (res === true) {
                                    put(b, st, ts);
                                }
                                else if (res === "alt") {
                                    put(numbered(b), st, ts);
                                }
                                else {
                                    cancelled = true;
                                }
                                step();
                            };
                        })(base, it.settings, it.ts));
                        return;
                    }
                    put(base, it.settings, it.ts);
                }
                finish();
            }
            function finish() { fill(first || last); done({ n: n, bad: bad, cancelled: cancelled, first: first }); }
            step();
        }
        qbHub.src.p = { items: itemsP, apply: loadPreset, rm: rm, get: getP, add: importItems };
        sel.addEventListener("change", function () {
            if (sel.value === "") {
                last = "";
                setBtn();
                return;
            }
            loadPreset(sel.value.substr(2));
        }, false);
        btn.addEventListener("click", function () { if (last) {
            deleteSelected();
        }
        else {
            saveCurrent();
        } }, false);
        function hasFiles() {
            var names, i;
            try {
                if (fs && fs.existsSync(DIR)) {
                    names = fs.readdirSync(DIR);
                    for (i = 0; i < names.length; i++) {
                        if (/\.json$/i.test(names[i])) {
                            return true;
                        }
                    }
                }
            }
            catch (e) { }
            return false;
        }
        (function placeholder() {
            var o = document.createElement("option");
            o.value = "";
            o.textContent = hasFiles() ? "Select a preset..." : "No presets yet";
            sel.appendChild(o);
            setBtn();
        })();
        sel.addEventListener("mousedown", ensure, false);
        sel.addEventListener("focus", ensure, false);
        sel.addEventListener("keydown", ensure, false);
    })();
    (function savedTitles() {
        var fs = null, path = null, DIR = "", list = [], loaded = false;
        (function init() {
            var req = nodeRequire(), base, ud;
            if (!req) {
                return;
            }
            try {
                fs = req("fs");
                path = req("path");
                try {
                    ud = cs.getSystemPath("userData");
                    if (!ud) {
                        throw new Error("no user data folder");
                    }
                    base = path.join(ud, "QuickBridgeTitler");
                    if (!fs.existsSync(base)) {
                        fs.mkdirSync(base);
                    }
                    DIR = path.join(base, "saved-titles");
                    if (!fs.existsSync(DIR)) {
                        fs.mkdirSync(DIR);
                    }
                }
                catch (e1) {
                    DIR = path.join(cs.getSystemPath("extension"), "saved-titles");
                }
            }
            catch (e) {
                fs = null;
            }
        })();
        function fileFor(name) { return path.join(DIR, name.replace(/[\\\/:*?"<>|]+/g, "_") + ".json"); }
        function ensure() {
            if (!loaded) {
                render("");
            }
        }
        function find(name) {
            var i, low = String(name).toLowerCase();
            ensure();
            for (i = 0; i < list.length; i++) {
                if (list[i].name.toLowerCase() === low) {
                    return list[i];
                }
            }
            return null;
        }
        function problem(text, e, short) {
            ask({ msg: text + (e ? "\n\n" + e : ""), cancel: false });
            if (short) {
                note(short, "err");
            }
        }
        function noFiles() { problem("Saved titles need file access (Node.js), which is not available in this panel.", "", "Saved titles are not available (no file access)."); }
        function partsUsed(p) {
            var i;
            if (!p || !p.f || !p.s) {
                return false;
            }
            for (i = 0; i < p.f.length; i++) {
                if (p.f[i] || p.s[i]) {
                    return true;
                }
            }
            return false;
        }
        function firstLine(text, max) {
            var lines = String(text).split(/\r\n|\r|\n/), i, s;
            for (i = 0; i < lines.length; i++) {
                s = lines[i].replace(/\s+/g, " ").replace(/^ | $/g, "");
                if (s) {
                    return s.length > max ? s.substr(0, max) + "\u2026" : s;
                }
            }
            return "";
        }
        function snapshot() {
            var o = { f: { label: curFont.label, family: curFont.family, uiStyle: curFont.uiStyle, ps: curFont.ps }, v: {}, k: {}, c: {} }, i;
            for (i = 0; i < PRESET_VALUES.length; i++) {
                o.v[PRESET_VALUES[i]] = $(PRESET_VALUES[i]).value;
            }
            for (i = 0; i < PRESET_CHECKS.length; i++) {
                o.k[PRESET_CHECKS[i]] = $(PRESET_CHECKS[i]).checked;
            }
            for (i = 0; i < PRESET_COLORS.length; i++) {
                o.c[PRESET_COLORS[i]] = getColor(PRESET_COLORS[i]);
            }
            return o;
        }
        function readAll() {
            var out = [], names, i, o;
            if (!fs) {
                return out;
            }
            try {
                if (!fs.existsSync(DIR)) {
                    return out;
                }
                names = fs.readdirSync(DIR);
            }
            catch (e) {
                return out;
            }
            for (i = 0; i < names.length; i++) {
                if (!/\.json$/i.test(names[i])) {
                    continue;
                }
                try {
                    o = JSON.parse(fs.readFileSync(path.join(DIR, names[i]), "utf8").replace(/^\uFEFF/, ""));
                    if (o && o.settings && typeof o.text === "string") {
                        out.push({ name: String(o.name || names[i].replace(/\.json$/i, "")), text: o.text, settings: o.settings, parts: o.parts || null, file: path.join(DIR, names[i]) });
                    }
                }
                catch (e2) { }
            }
            out.sort(function (a, b) { var x = a.name.toLowerCase(), y = b.name.toLowerCase(); return x < y ? -1 : (x > y ? 1 : 0); });
            return out;
        }
        function render(sel) {
            loaded = true;
            list = readAll();
            if (sel && find(sel)) {
                qbHub.select("v", find(sel).name);
            }
            qbHub.refresh();
        }
        function writeFile(name, it) {
            var ex = find(name), target;
            if (!fs.existsSync(DIR)) {
                fs.mkdirSync(DIR);
            }
            target = fileFor(name);
            fs.writeFileSync(target, JSON.stringify({ qbtTitle: 1, name: name, text: it.text, settings: it.settings, parts: it.parts || null }, null, 2), "utf8");
            if (ex && ex.file !== target) {
                try {
                    fs.unlinkSync(ex.file);
                }
                catch (e) { }
            }
        }
        function saveCurrent() {
            var text, st, ps, parts;
            if (!fs) {
                noFiles();
                return;
            }
            if (qbBatch.locked()) {
                problem("The batch has more than one title box, so the main text box is locked.\n\nPress the round Go live button on an exception box to save that title, or remove the extra boxes first.", "", "Saved titles are saved from the main text box (locked in batch mode).");
                return;
            }
            text = $("text").value;
            if (text.replace(/\s+/g, "") === "") {
                problem("The text box is empty: type the title text first.", "", "Nothing to save: the text box is empty.");
                return;
            }
            st = snapshot();
            ps = partsSnap();
            parts = partsUsed(ps) ? ps : null;
            ask({ msg: "Name for the saved title (tag: Saved titles).\n\nIt keeps the text and everything of the look: font and style, shapes, animation, rolling / crawling and the colours of separate words.\n\nName:", input: true, value: firstLine(text, 30), ok: "Save" }, function (v) {
                var name;
                if (v === null) {
                    return;
                }
                name = cleanName(v);
                if (!name) {
                    problem("Please type a name for the saved title.");
                    return;
                }
                function doWrite() {
                    try {
                        writeFile(name, { text: text, settings: st, parts: parts });
                        render(name);
                        log("Saved title saved: " + name, "ok");
                        note("Title saved successfully: " + name, "ok");
                    }
                    catch (e) {
                        problem("Could not save the title into the folder:\n" + DIR, e, "Could not save the title.");
                    }
                }
                list = readAll();
                if (find(name)) {
                    ask({ msg: "A saved title named \"" + name + "\" already exists. Replace it?", ok: "Replace" }, function (yes) { if (yes) {
                        doWrite();
                    } });
                }
                else {
                    doWrite();
                }
            });
        }
        function applyTitle(it) {
            applySettings(it.settings, PRESET_VALUES, PRESET_CHECKS, PRESET_COLORS);
            deselectPreset();
            if (partsUsed(it.parts)) {
                partsRestore(it.parts);
                $("text").value = it.text;
                partsSnap();
            }
            else {
                $("text").value = it.text;
                partsClear();
            }
            fireEvent($("text"), "input");
            log("Saved title applied: " + it.name, "ok");
            note((exLive ? "Saved title applied to the live exception: " : "Saved title applied: ") + it.name, "ok");
        }
        function openTitle(it) {
            if (!it) {
                return;
            }
            if (qbBatch.locked()) {
                if (qbBatch.add(it)) {
                    log("Saved title added to the batch: " + it.name, "ok");
                    note("Saved title added to the batch: " + it.name, "ok");
                }
                else {
                    problem("The batch already has the maximum of 20 title boxes.", "", "The batch is full (20 titles).");
                }
                return;
            }
            applyTitle(it);
        }
        function rm(name) {
            var p = name ? find(name) : null;
            if (!fs || !p) {
                return false;
            }
            try {
                fs.unlinkSync(p.file);
            }
            catch (e) {
                return false;
            }
            render("");
            return true;
        }
        function getT(name) { var t = name ? find(name) : null; return t ? { name: t.name, text: t.text, settings: t.settings, parts: t.parts } : null; }
        function itemsT() { var a = [], i; ensure(); for (i = 0; i < list.length; i++) {
            a.push({ name: list[i].name, tag: "v", own: true });
        } return a; }
        function importItems(items, done) {
            var queue = [], pos = 0, n = 0, bad = 0, first = "", cancelled = false, k;
            if (!fs) {
                done({ n: 0, bad: items.length, cancelled: false, first: "" });
                return;
            }
            for (k = 0; k < items.length; k++) {
                if (items[k] && items[k].settings && typeof items[k].text === "string") {
                    queue.push(items[k]);
                }
                else {
                    bad++;
                }
            }
            function put(name, it) {
                try {
                    writeFile(name, it);
                    if (!first) {
                        first = name;
                    }
                    n++;
                }
                catch (e) {
                    bad++;
                }
            }
            function numbered(base) {
                var nm = base, c;
                list = readAll();
                for (c = 2; find(nm); c++) {
                    nm = base + " (" + c + ")";
                }
                return nm;
            }
            function step() {
                var it, base;
                while (pos < queue.length && !cancelled) {
                    it = queue[pos++];
                    base = cleanName(it.name) || "Imported title";
                    list = readAll();
                    if (find(base)) {
                        ask({ msg: "A saved title named \"" + base + "\" already exists.\n\nReplace it, keep both (the new one gets a number at the end), or cancel the import?", ok: "Replace", okKind: "danger", alt: "Keep Both", altKind: "good" }, (function (b, t) {
                            return function (res) {
                                if (res === true) {
                                    put(b, t);
                                }
                                else if (res === "alt") {
                                    put(numbered(b), t);
                                }
                                else {
                                    cancelled = true;
                                }
                                step();
                            };
                        })(base, it));
                        return;
                    }
                    put(base, it);
                }
                finish();
            }
            function finish() { render(first); done({ n: n, bad: bad, cancelled: cancelled, first: first }); }
            step();
        }
        qbHub.src.v = { items: itemsT, apply: function (name) { openTitle(name ? find(name) : null); }, rm: rm, get: getT, add: importItems, save: saveCurrent };
    })();
    (function presetManagement() {
        var listEl = $("pmList"), bSave = $("pmSave"), bImp = $("pmImport"), bExp = $("pmExport"), bExp1 = $("pmExportOne"), bDel = $("pmDel"), bAll = $("pmDelAll"), filt = $("pmFilter"), TAGN = { s: "Text style", l: "Lower third", i: "Intro & outro", t: "Roll & crawl", v: "Saved titles" }, ORDER = ["s", "l", "i", "t", "v"], SRC = ["p", "m", "v"], selKey = "", shown = [], fs = null, path = null;
        (function init() { var req = nodeRequire(); if (!req) {
            return;
        } try {
            fs = req("fs");
            path = req("path");
        }
        catch (e) {
            fs = null;
        } })();
        function keyOf(it) { return it.src + "|" + it.name; }
        function byKey(k) { var i; for (i = 0; i < shown.length; i++) {
            if (keyOf(shown[i]) === k) {
                return shown[i];
            }
        } return null; }
        function simpleOn() { return document.documentElement.getAttribute("data-simple") === "on"; }
        function safeFile(n) { return String(n).replace(/[\\\/:*?"<>|]+/g, "_"); }
        function noFiles() { ask({ msg: "Import / export needs file access (Node.js), which is not available in this panel.", cancel: false }); note("Import / export is not available (no file access).", "err"); }
        function collect() {
            var all = [], out = [], s, a, k, o, f = filt.value, simple = simpleOn(), t;
            for (s = 0; s < SRC.length; s++) {
                if (!qbHub.src[SRC[s]]) {
                    continue;
                }
                a = qbHub.src[SRC[s]].items();
                for (k = 0; k < a.length; k++) {
                    a[k].src = SRC[s];
                    all.push(a[k]);
                }
            }
            for (o = 0; o < ORDER.length; o++) {
                t = ORDER[o];
                if (f !== "all" && f !== t) {
                    continue;
                }
                if (simple && (t === "l" || t === "i" || t === "t")) {
                    continue;
                }
                for (k = 0; k < all.length; k++) {
                    if (all[k].tag === t) {
                        out.push(all[k]);
                    }
                }
            }
            return out;
        }
        function sync() {
            var it = selKey ? byKey(selKey) : null, own = 0, i;
            for (i = 0; i < shown.length; i++) {
                if (shown[i].own) {
                    own++;
                }
            }
            bExp1.disabled = !it;
            bDel.disabled = !(it && it.own);
            bExp.disabled = !own;
            bAll.disabled = !own;
            bExp.style.display = it ? "none" : "";
            bAll.style.display = it ? "none" : "";
            bExp1.style.display = it ? "" : "none";
            bDel.style.display = it ? "" : "none";
        }
        function mark() {
            var i, c = listEl.children, k;
            for (i = 0; i < c.length; i++) {
                if (c[i].getAttribute("data-none")) {
                    c[i].className = selKey ? "it sn0" : "it sn0 sel";
                    continue;
                }
                k = c[i].getAttribute("data-key");
                c[i].className = (k === null) ? "none" : (k === selKey ? "it sel" : "it");
            }
            sync();
        }
        function visible() {
            var c = listEl.children, i, e;
            for (i = 0; i < c.length; i++) {
                if (c[i].getAttribute("data-key") === selKey) {
                    e = c[i];
                    if (e.offsetTop < listEl.scrollTop + c[0].offsetHeight) {
                        listEl.scrollTop = e.offsetTop - c[0].offsetHeight;
                    }
                    else if (e.offsetTop + e.offsetHeight > listEl.scrollTop + listEl.clientHeight) {
                        listEl.scrollTop = e.offsetTop + e.offsetHeight - listEl.clientHeight;
                    }
                }
            }
        }
        function choose(k) { selKey = k; mark(); }
        function open(it) {
            var verb;
            if (!it || !qbHub.src[it.src]) {
                return;
            }
            verb = (it.tag === "v") ? "open" : "apply";
            ask({ msg: "You are about to " + verb + " \"" + it.name + "\" (" + TAGN[it.tag] + ").\n\nYour current settings" + (it.tag === "v" ? " and text" : "") + " will be changed. Continue?",
                ok: "OK", okKind: "good", noKind: "danger", row: true, focus: "no" }, function (yes) {
                if (yes && qbHub.src[it.src]) {
                    qbHub.src[it.src].apply(it.name);
                }
            });
        }
        function render() {
            var i, d, a, t;
            shown = collect();
            if (selKey && !byKey(selKey)) {
                selKey = "";
            }
            listEl.innerHTML = "";
            d = document.createElement("div");
            d.setAttribute("data-none", "1");
            d.className = "it sn0";
            d.textContent = "[Select None]";
            d.onclick = function () { choose(""); };
            listEl.appendChild(d);
            if (!shown.length) {
                d = document.createElement("div");
                d.className = "none";
                d.textContent = filt.value === "all" ? "Nothing here yet" : "Nothing with this tag yet";
                listEl.appendChild(d);
            }
            for (i = 0; i < shown.length; i++) {
                d = document.createElement("div");
                d.setAttribute("data-name", shown[i].name);
                d.setAttribute("data-key", keyOf(shown[i]));
                a = document.createElement("span");
                a.className = "nm";
                a.textContent = shown[i].name;
                d.appendChild(a);
                t = document.createElement("span");
                t.className = "sn";
                t.textContent = TAGN[shown[i].tag];
                d.appendChild(t);
                d.title = shown[i].name + " (" + TAGN[shown[i].tag] + ")\n\n(double click to " + (shown[i].tag === "v" ? "open" : "apply") + ")";
                d.onclick = (function (k) { return function () { choose(k); }; })(keyOf(shown[i]));
                d.ondblclick = (function (it) { return function () { choose(keyOf(it)); open(it); }; })(shown[i]);
                listEl.appendChild(d);
            }
            mark();
            visible();
        }
        var hubDirty = true, hubBusy = false;
        function hubFlush() {
            if (!hubDirty || hubBusy || listEl.offsetWidth <= 0) {
                return;
            }
            hubBusy = true;
            hubDirty = false;
            try {
                render();
            }
            finally {
                hubBusy = false;
            }
        }
        qbHub.refresh = function () { if (!hubBusy) {
            hubDirty = true;
            hubFlush();
        } };
        qbHub.flush = hubFlush;
        qbHub.select = function (src, name) { selKey = src ? src + "|" + name : ""; mark(); visible(); };
        function delChosen() {
            var it = selKey ? byKey(selKey) : null;
            if (!it || !it.own) {
                return;
            }
            ask({ msg: "Delete \"" + it.name + "\" (" + TAGN[it.tag] + ")?\n\nThis cannot be undone.", ok: "Delete", danger: true }, function (yes) {
                if (!yes) {
                    return;
                }
                if (qbHub.src[it.src].rm(it.name)) {
                    selKey = "";
                    render();
                    log("Deleted: " + it.name + " (" + TAGN[it.tag] + ")", "ok");
                    note("Deleted successfully: " + it.name, "ok");
                }
                else {
                    ask({ msg: "Could not delete \"" + it.name + "\".", cancel: false });
                    note("Could not delete: " + it.name, "err");
                }
            });
        }
        function ownShown() { var o = [], i; for (i = 0; i < shown.length; i++) {
            if (shown[i].own) {
                o.push(shown[i]);
            }
        } return o; }
        function delAll() {
            var own = ownShown();
            if (!own.length) {
                return;
            }
            ask({ msg: "Delete all " + own.length + " item" + (own.length === 1 ? "" : "s") + " shown in the list" + (filt.value === "all" ? "" : " (tag: " + TAGN[filt.value] + ")") + "?\n\nThe ready made ones stay. This cannot be undone.", ok: "Delete All", danger: true }, function (yes) {
                var n = 0, failed = 0, i;
                if (!yes) {
                    return;
                }
                for (i = 0; i < own.length; i++) {
                    if (qbHub.src[own[i].src].rm(own[i].name)) {
                        n++;
                    }
                    else {
                        failed++;
                    }
                }
                selKey = "";
                render();
                log("Deleted: " + n + (failed ? " (" + failed + " could not be deleted)" : ""), failed ? "err" : "ok");
                note(failed ? "Some items could not be deleted (" + failed + ")" : "Deleted successfully (" + n + ")", failed ? "err" : "ok");
            });
        }
        function exportItems(items, fileName, title, what) {
            if (!fs) {
                noFiles();
                return;
            }
            cs.evalScript("QBT_pickFolderFor(" + JSON.stringify(title) + ")", function (dir) {
                var b = { qbtBundle: 1, presets: [], titles: [], templates: [] }, i, g, n = 0, target;
                if (!dir || dir === "undefined" || dir === "null" || dir === "EvalScript error.") {
                    return;
                }
                for (i = 0; i < items.length; i++) {
                    g = qbHub.src[items[i].src].get(items[i].name);
                    if (!g) {
                        continue;
                    }
                    (items[i].src === "p" ? b.presets : (items[i].src === "v" ? b.titles : b.templates)).push(g);
                    n++;
                }
                target = path.join(dir, fileName);
                try {
                    fs.writeFileSync(target, JSON.stringify(b, null, 2), "utf8");
                    log("Exported: " + target, "ok");
                    note(what + " exported successfully" + (n > 1 ? " (" + n + ")" : ""), "ok");
                }
                catch (e) {
                    ask({ msg: "Could not write the export file:\n" + target + "\n\n" + e, cancel: false });
                    note("Could not export.", "err");
                }
            });
        }
        function exportChosen() {
            var it = selKey ? byKey(selKey) : null;
            if (!it) {
                return;
            }
            exportItems([it], safeFile(it.name) + ".json", "Choose a folder to export \"" + it.name + "\" to", "\"" + it.name + "\"");
        }
        function exportAll() {
            var own = ownShown();
            if (!own.length) {
                note("There is nothing of your own to export in the list.", "err");
                return;
            }
            exportItems(own, "QuickBridgeTitler-presets.json", "Choose a folder to export the items of the list to", "Items");
        }
        function classify(o, got) {
            var n = 0, k;
            if (!o || typeof o !== "object") {
                return 0;
            }
            if (o.presets && o.presets.length) {
                for (k = 0; k < o.presets.length; k++) {
                    got.p.push(o.presets[k]);
                    n++;
                }
            }
            if (o.titles && o.titles.length) {
                for (k = 0; k < o.titles.length; k++) {
                    got.v.push(o.titles[k]);
                    n++;
                }
            }
            if (o.templates && o.templates.length) {
                for (k = 0; k < o.templates.length; k++) {
                    got.m.push(o.templates[k]);
                    n++;
                }
            }
            if (n) {
                return n;
            }
            if (o.settings && typeof o.text === "string") {
                got.v.push(o);
                return 1;
            }
            if (o.settings) {
                got.p.push(o);
                return 1;
            }
            if (o.o && o.name) {
                got.m.push(o);
                return 1;
            }
            return 0;
        }
        function importFiles() {
            if (!fs) {
                noFiles();
                return;
            }
            cs.evalScript("QBT_pickPresetFiles()", function (r) {
                var files, i, o, got = { p: [], v: [], m: [] }, bad = 0, sum = 0, order = ["p", "m", "v"], pos = 0, cancelled = false, first = null;
                if (!r || r === "undefined" || r === "null" || r === "EvalScript error.") {
                    return;
                }
                files = String(r).split("|");
                for (i = 0; i < files.length; i++) {
                    try {
                        o = JSON.parse(fs.readFileSync(files[i], "utf8").replace(/^\uFEFF/, ""));
                        if (!classify(o, got)) {
                            bad++;
                        }
                    }
                    catch (e) {
                        bad++;
                    }
                }
                function next() {
                    var s;
                    if (cancelled || pos >= order.length) {
                        finish();
                        return;
                    }
                    s = order[pos++];
                    if (!got[s].length || !qbHub.src[s]) {
                        next();
                        return;
                    }
                    qbHub.src[s].add(got[s], function (res) {
                        sum += res.n;
                        bad += res.bad;
                        if (res.cancelled) {
                            cancelled = true;
                        }
                        if (res.first && !first) {
                            first = { src: s, name: res.first };
                        }
                        next();
                    });
                }
                function finish() {
                    if (first) {
                        selKey = first.src + "|" + first.name;
                        render();
                        if (!byKey(selKey) && filt.value !== "all") {
                            filt.value = "all";
                            render();
                        }
                    }
                    else {
                        render();
                    }
                    log("Imported: " + sum + (bad ? " (" + bad + " could not be read)" : "") + (cancelled ? " - import cancelled" : ""), sum || cancelled ? "ok" : "err");
                    if (sum) {
                        note("Imported successfully (" + sum + ")" + (bad ? " - " + bad + " skipped" : ""), "ok");
                    }
                    else if (!cancelled) {
                        ask({ msg: "No presets, templates or saved titles could be read from the chosen file(s).", cancel: false });
                        note("Nothing could be imported.", "err");
                    }
                }
                next();
            });
        }
        bSave.addEventListener("click", function () { if (qbHub.src.v) {
            qbHub.src.v.save();
        } }, false);
        bImp.addEventListener("click", importFiles, false);
        bExp.addEventListener("click", exportAll, false);
        bExp1.addEventListener("click", exportChosen, false);
        bDel.addEventListener("click", delChosen, false);
        bAll.addEventListener("click", delAll, false);
        filt.addEventListener("change", render, false);
        smoothWheel(listEl, 66);
        document.addEventListener("mousedown", function (e) {
            var n = e.target;
            if (!selKey) {
                return;
            }
            while (n && n !== document) {
                if (n.id === "pmBox" || n.id === "dlg") {
                    return;
                }
                n = n.parentNode;
            }
            choose("");
        }, true);
        listEl.addEventListener("keydown", function (e) {
            var i, at = -1;
            for (i = 0; i < shown.length; i++) {
                if (keyOf(shown[i]) === selKey) {
                    at = i;
                }
            }
            if (e.keyCode === 40 && shown.length) {
                choose(keyOf(shown[Math.min(shown.length - 1, at + 1)]));
                visible();
            }
            else if (e.keyCode === 38 && shown.length) {
                choose(at <= 0 ? "" : keyOf(shown[at - 1]));
                visible();
            }
            else if (e.keyCode === 13 && at >= 0) {
                open(shown[at]);
            }
            else if (e.keyCode === 46 && at >= 0) {
                delChosen();
            }
            else {
                return;
            }
            e.preventDefault();
        }, false);
        if (window.MutationObserver) {
            new MutationObserver(function () { qbHub.refresh(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-simple"] });
        }
        ["click", "keyup"].forEach(function (ev) { document.addEventListener(ev, function () { if (hubDirty) {
            setTimeout(hubFlush, 0);
        } }, true); });
        raf(function () { setTimeout(hubFlush, 0); });
    })();
    $("resetAll").onclick = function () {
        ask({ msg: "Reset the composition, project, animation, text and output settings to their defaults?\n\nYour theme (Customize Quick Bridge), saved presets and saved titles are kept.", ok: "Reset", danger: true }, function (yes) {
            if (!yes) {
                return;
            }
            applySettings(DEFAULTS, P_VALUES, P_CHECKS, P_COLORS);
            pvHide();
            partsClear();
            deselectPreset();
            log("Composition, project and text settings were reset to default.", "ok");
            note("Composition, project and text settings were reset to default.", "ok");
        });
    };
    function resetTheme() {
        ask({ msg: "Reset the theme and appearance to the default look?\n\nThis resets the window theme (Light / Dark), colors, tabs, section style, button position and size, notification bar and the other options of Customize Quick Bridge.\n\nYour text, composition and project settings, saved presets and saved titles are kept.", ok: "Reset Theme", danger: true }, function (yes) {
            var k;
            if (!yes) {
                return;
            }
            cpClose();
            ddAccent.close();
            ddBtn.close();
            for (k in UI_DEF) {
                if (UI_DEF.hasOwnProperty(k)) {
                    UI[k] = UI_DEF[k];
                }
            }
            saveUI();
            applyThemeColors();
            applyWindowTheme("dark");
            log("Theme and appearance were reset to default.", "ok");
            note("Theme and appearance were reset to default.", "ok");
        });
    }
    (function savedThemes() {
        var TKEY = "qbt_themes_v1", list = [], selName = "", fs = null, path = null;
        var pick = $("thPick"), bSave = $("thSave"), bImp = $("thImport");
        (function init() { var req = nodeRequire(); if (!req) {
            return;
        } try {
            fs = req("fs");
            path = req("path");
        }
        catch (e) {
            fs = null;
        } })();
        function curWin() { var c = document.documentElement.className; return c.indexOf("light") >= 0 ? "light" : "dark"; }
        function snap() { var ui = {}, k; for (k in UI_DEF) {
            if (UI_DEF.hasOwnProperty(k)) {
                ui[k] = UI[k];
            }
        } return { ui: ui, win: curWin() }; }
        function clean(o) {
            var ui = {}, k, v, d;
            if (!o || typeof o !== "object") {
                return null;
            }
            for (k in UI_DEF) {
                if (!UI_DEF.hasOwnProperty(k)) {
                    continue;
                }
                v = o.ui ? o.ui[k] : undefined;
                d = UI_DEF[k];
                ui[k] = d;
                if (v === undefined) {
                    continue;
                }
                if (d === null) {
                    if (v === null || (typeof v === "string" && /^#[0-9a-fA-F]{3,8}$/.test(v))) {
                        ui[k] = v;
                    }
                }
                else if (typeof d === "number") {
                    if (typeof v === "number" && isFinite(v)) {
                        ui[k] = v;
                    }
                }
                else if (typeof d === "boolean") {
                    if (typeof v === "boolean") {
                        ui[k] = v;
                    }
                }
                else if (typeof d === "string") {
                    if (typeof v === "string" && v.length < 40) {
                        ui[k] = v;
                    }
                }
            }
            return { ui: ui, win: (o.win === "light") ? o.win : "dark" };
        }
        function load() {
            var raw, k, c;
            list = [];
            try {
                raw = JSON.parse(localStorage.getItem(TKEY) || "[]");
            }
            catch (e) {
                raw = [];
            }
            if (!raw || raw.length === undefined) {
                raw = [];
            }
            for (k = 0; k < raw.length; k++) {
                c = raw[k] && raw[k].name ? clean(raw[k]) : null;
                if (c) {
                    list.push({ name: cleanName(raw[k].name), ui: c.ui, win: c.win });
                }
            }
        }
        function store() { try {
            localStorage.setItem(TKEY, JSON.stringify(list));
        }
        catch (e) { } }
        function find(name) { var i, low = String(name).toLowerCase(); for (i = 0; i < list.length; i++) {
            if (list[i].name.toLowerCase() === low) {
                return i;
            }
        } return -1; }
        function isOwn() { return !!(selName && find(selName) >= 0); }
        function sync() {
            var on = isOwn();
            bSave.setAttribute("data-mode", on ? "del" : "save");
            bImp.setAttribute("data-mode", on ? "stexp" : "stimp");
            bSave.title = on ? "Delete the saved theme \"" + selName + "\"" : "Save the current theme (the settings of Customize Quick Bridge and the window theme) under a name";
            bImp.title = on ? "Export the saved theme \"" + selName + "\" into a .json file" : "Import themes from a .json file";
            pick.value = on ? selName : "";
        }
        function render() {
            var i, o;
            if (selName && find(selName) < 0) {
                selName = "";
            }
            pick.innerHTML = "";
            o = document.createElement("option");
            o.value = "";
            o.textContent = "Custom";
            pick.appendChild(o);
            for (i = 0; i < list.length; i++) {
                o = document.createElement("option");
                o.value = list[i].name;
                o.textContent = list[i].name;
                pick.appendChild(o);
            }
            sync();
        }
        function apply(name) {
            var i = name ? find(name) : -1, k;
            if (i < 0) {
                return;
            }
            cpClose();
            ddAccent.close();
            ddBtn.close();
            for (k in UI_DEF) {
                if (UI_DEF.hasOwnProperty(k)) {
                    UI[k] = list[i].ui[k];
                }
            }
            saveUI();
            applyThemeColors();
            applyWindowTheme(list[i].win);
            selName = list[i].name;
            sync();
            log("Theme applied: " + list[i].name, "ok");
            note("Theme applied successfully: " + list[i].name, "ok");
        }
        function save() {
            ask({ msg: "Save the current theme (the settings of Customize Quick Bridge and the window theme) as a saved theme.\n\nName:", input: true, value: "", ok: "Save" }, function (v) {
                var n;
                if (v === null || v === false) {
                    return;
                }
                n = cleanName(v);
                if (!n) {
                    note("Type a name for the theme.", "err");
                    return;
                }
                function put() {
                    var c = snap(), idx = find(n);
                    if (idx >= 0) {
                        list[idx].ui = c.ui;
                        list[idx].win = c.win;
                    }
                    else {
                        list.push({ name: n, ui: c.ui, win: c.win });
                    }
                    store();
                    selName = n;
                    render();
                    log("Theme saved: " + n, "ok");
                    note("Theme saved successfully: " + n, "ok");
                }
                if (find(n) >= 0) {
                    ask({ msg: "A theme named \"" + n + "\" already exists. Replace it?", ok: "Replace", danger: true }, function (yes) { if (yes) {
                        put();
                    } });
                }
                else {
                    put();
                }
            });
        }
        function del() {
            var i = selName ? find(selName) : -1, n;
            if (i < 0) {
                return;
            }
            n = list[i].name;
            ask({ msg: "Delete the saved theme \"" + n + "\"?\n\nThis cannot be undone.", ok: "Delete", danger: true }, function (yes) {
                var at;
                if (!yes) {
                    return;
                }
                at = find(n);
                if (at >= 0) {
                    list.splice(at, 1);
                }
                store();
                selName = "";
                render();
                log("Theme deleted: " + n, "ok");
                note("Theme deleted successfully: " + n, "ok");
            });
        }
        function noFiles() { ask({ msg: "Import / export needs file access (Node.js), which is not available in this panel.", cancel: false }); note("Import / export is not available (no file access).", "err"); }
        function exportIt() {
            var i = selName ? find(selName) : -1, name, c;
            if (!fs) {
                noFiles();
                return;
            }
            if (i >= 0) {
                name = list[i].name;
                c = { ui: list[i].ui, win: list[i].win };
            }
            else {
                name = "My theme";
                c = snap();
            }
            cs.evalScript("QBT_pickFolderFor(" + JSON.stringify("Choose a folder to export the theme \"" + name + "\" to") + ")", function (dir) {
                var target;
                if (!dir || dir === "undefined" || dir === "null" || dir === "EvalScript error.") {
                    return;
                }
                target = path.join(dir, "Theme - " + name.replace(/[\\\/:*?"<>|]+/g, "_") + ".json");
                try {
                    fs.writeFileSync(target, JSON.stringify({ qbtTheme: 1, name: name, win: c.win, ui: c.ui }, null, 2), "utf8");
                    log("Theme exported: " + target, "ok");
                    note("Theme exported successfully: " + name, "ok");
                }
                catch (e) {
                    ask({ msg: "Could not write the export file:\n" + target + "\n\n" + e, cancel: false });
                    note("Could not export the theme.", "err");
                }
            });
        }
        function importFiles() {
            if (!fs) {
                noFiles();
                return;
            }
            cs.evalScript("QBT_pickPresetFiles()", function (r) {
                var files, a, k, o, items, c, queue = [], pos = 0, n = 0, bad = 0, firstName = "", cancelled = false;
                if (!r || r === "undefined" || r === "null" || r === "EvalScript error.") {
                    return;
                }
                files = String(r).split("|");
                for (a = 0; a < files.length; a++) {
                    try {
                        o = JSON.parse(fs.readFileSync(files[a], "utf8").replace(/^\uFEFF/, ""));
                        items = (o && o.themes && o.themes.length) ? o.themes : ((o && o.ui && o.name) ? [o] : []);
                        if (!items.length) {
                            bad++;
                        }
                        for (k = 0; k < items.length; k++) {
                            c = items[k] && items[k].name ? clean(items[k]) : null;
                            if (c) {
                                queue.push({ name: items[k].name, ui: c.ui, win: c.win });
                            }
                            else {
                                bad++;
                            }
                        }
                    }
                    catch (e) {
                        bad++;
                    }
                }
                function put(name, it) {
                    var idx = find(name);
                    if (idx >= 0) {
                        list[idx].ui = it.ui;
                        list[idx].win = it.win;
                    }
                    else {
                        list.push({ name: name, ui: it.ui, win: it.win });
                    }
                    if (!firstName) {
                        firstName = name;
                    }
                    n++;
                }
                function numbered(base) { var nm = base, x; for (x = 2; find(nm) >= 0; x++) {
                    nm = base + " (" + x + ")";
                } return nm; }
                function step() {
                    var it, base;
                    while (pos < queue.length && !cancelled) {
                        it = queue[pos++];
                        base = cleanName(it.name) || "Imported theme";
                        if (find(base) >= 0) {
                            ask({ msg: "A theme named \"" + base + "\" already exists.\n\nReplace it, keep both (the new one gets a number at the end), or cancel the import?", ok: "Replace", okKind: "danger", alt: "Keep Both", altKind: "good" }, (function (b, x) {
                                return function (res) {
                                    if (res === true) {
                                        put(b, x);
                                    }
                                    else if (res === "alt") {
                                        put(numbered(b), x);
                                    }
                                    else {
                                        cancelled = true;
                                    }
                                    step();
                                };
                            })(base, it));
                            return;
                        }
                        put(base, it);
                    }
                    finish();
                }
                function finish() {
                    store();
                    render();
                    log("Themes imported: " + n + (bad ? " (" + bad + " could not be read)" : "") + (cancelled ? " - import cancelled" : ""), n || cancelled ? "ok" : "err");
                    if (n) {
                        note("Themes imported successfully (" + n + ") - choose one in the Saved theme list" + (bad ? " - " + bad + " skipped" : ""), "ok");
                    }
                    else if (!cancelled) {
                        ask({ msg: "No themes could be read from the chosen file(s).", cancel: false });
                        note("No themes could be imported.", "err");
                    }
                }
                step();
            });
        }
        bSave.addEventListener("click", function () { if (isOwn()) {
            del();
        }
        else {
            save();
        } }, false);
        bImp.addEventListener("click", function () { if (isOwn()) {
            exportIt();
        }
        else {
            importFiles();
        } }, false);
        pick.addEventListener("change", function () {
            var n = pick.value;
            if (!n) {
                selName = "";
                sync();
                return;
            }
            if (find(n) < 0) {
                render();
                return;
            }
            ask({ msg: "You are about to apply the theme \"" + n + "\".\n\nYes = the theme is applied now.\nNo = it is only selected in the Saved theme list, for further modification (nothing changes yet).",
                ok: "Yes", okKind: "danger", no: "No", noKind: "good", row: true, focus: "no" }, function (yes) {
                selName = n;
                if (yes) {
                    apply(n);
                }
                sync();
            });
        }, false);
        load();
        render();
    })();
    var fxOff = null;
    function drawFxPreview() {
        try {
            var cv = $("fxPrev"), w, h = 64, ctx, octx, txt, cst, size, px, sc, font, m, rgb, ang, dist;
            if ($("fxPrevBox").className.indexOf(" open") < 0) {
                return;
            }
            cv.style.backgroundColor = $("optBg").checked ? getColor("cBg") : "";
            w = cv.clientWidth;
            if (!w) {
                return;
            }
            cv.width = w;
            cv.height = h;
            if (!fxOff) {
                fxOff = document.createElement("canvas");
            }
            fxOff.width = w;
            fxOff.height = h;
            ctx = cv.getContext("2d");
            octx = fxOff.getContext("2d");
            txt = ($("text").value.split("\n")[0] || "").replace(/^\s+|\s+$/g, "");
            if (!txt) {
                txt = "Abc";
            }
            if (txt.length > 24) {
                txt = txt.substr(0, 24);
            }
            cst = window.getComputedStyle($("text"));
            size = Math.max(1, num("size", 60));
            px = 30;
            font = cst.fontStyle + " " + cst.fontWeight + " ";
            octx.font = font + px + "px " + cst.fontFamily;
            m = octx.measureText(txt).width;
            if (m > w - 28) {
                px = Math.max(8, px * (w - 28) / m);
            }
            sc = px / size;
            octx.font = font + px + "px " + cst.fontFamily;
            octx.textAlign = "center";
            octx.textBaseline = "middle";
            octx.lineJoin = "round";
            if ($("optOutline").checked) {
                octx.lineWidth = Math.max(0, num("outlineW", 4)) * sc;
                octx.strokeStyle = getColor("cOutline");
                octx.strokeText(txt, w / 2, h / 2);
            }
            octx.fillStyle = getColor("cText");
            octx.fillText(txt, w / 2, h / 2);
            if ($("optShadow").checked) {
                rgb = hexToRgb(getColor("cShadow"));
                ang = num("shDir", 135) * Math.PI / 180;
                dist = Math.max(0, num("shDist", 8)) * sc;
                ctx.shadowColor = "rgba(" + Math.round(rgb[0] * 255) + "," + Math.round(rgb[1] * 255) + "," + Math.round(rgb[2] * 255) + "," +
                    (Math.min(100, Math.max(0, num("shOp", 60))) / 100) + ")";
                ctx.shadowBlur = Math.max(0, num("shSoft", 10)) * sc;
                ctx.shadowOffsetX = Math.sin(ang) * dist;
                ctx.shadowOffsetY = -Math.cos(ang) * dist;
            }
            ctx.drawImage(fxOff, 0, 0);
        }
        catch (e) { }
    }
    (function fxPreviewEvents() {
        var tabs = document.querySelectorAll(".tab"), i;
        for (i = 0; i < tabs.length; i++) {
            tabs[i].addEventListener("click", function () { setTimeout(drawFxPreview, 0); }, false);
        }
        window.addEventListener("resize", drawFxPreview, false);
        drawFxPreview();
        setTimeout(drawFxPreview, 400);
    })();
    (function previewEngine() {
        var IDS = ["anim", "shp", "roll"], PV = {}, pi;
        var playing = false, loopOn = false, t0 = 0, tNow = 0, seekT = null, loopFrom = 0, seeking = false, pending = false, total = 1;
        var liveBg = null, liveSeq = null, liveBusy = false, pinnedId = "", mc = null, goBack = null, tkOff = 60, mcache = {}, mcacheN = 0;
        var wipeCv = null, sceneCache = null, scenePass = 0;
        var FSQ = 0.5, FSQK = "qbt_fs_render_v1", HAS_FILTER = false, ICO_LOOP = "", PKEY = "qbt_pin_pv_v2";
        try {
            HAS_FILTER = ("filter" in document.createElement("canvas").getContext("2d"));
        }
        catch (eF) { }
        for (pi = 0; pi < IDS.length; pi++) {
            (function (p) {
                PV[p] = { id: p, box: $(p + "PrevBox"), cv: $(p + "Prev"), wr: $(p + "Wrap"), seek: $(p + "Seek"), tl: $(p + "TimeL"), tr: $(p + "TimeR"), play: $(p + "Play"), loop: $(p + "Loop"),
                    live: $(p + "LiveBtn"), clr: $(p + "LiveClr"), pin: $(p + "Pin"), go: $(p + "GoPos"), note: $(p + "LiveNote"), bg: "c" + p.charAt(0).toUpperCase() + p.slice(1) + "Bg", home: null };
            })(IDS[pi]);
        }
        ICO_LOOP = PV.shp.loop.innerHTML;
        var FS = { id: "fs", fs: true, on: false, box: $("pvFs"), cv: $("pvFsCv"), wr: $("pvFsStage"), seek: $("fsSeek"), tl: $("fsTimeL"), tr: $("fsTimeR"), play: $("fsPlay"), loop: $("fsLoop"), live: $("fsLiveBtn"), clr: $("fsLiveClr"), note: $("fsLiveNote"), bg: "cAnimBg" };
        var PVALL = IDS.concat(["fs"]);
        PV.fs = FS;
        function fsDot() { var d = $("fsBg").querySelector(".dotfill"); if (d) {
            d.style.backgroundColor = getColor("cAnimBg");
        } }
        function now() { return (window.performance && window.performance.now) ? window.performance.now() : new Date().getTime(); }
        function clamp01(x) { return x < 0 ? 0 : (x > 1 ? 1 : x); }
        function ease(x) { x = clamp01(x); return x * x * (3 - 2 * x); }
        function lerp(a, b, u) { return a + (b - a) * u; }
        function rgbaOf(id, a) { var r = hexToRgb(getColor(id)); return "rgba(" + Math.round(r[0] * 255) + "," + Math.round(r[1] * 255) + "," + Math.round(r[2] * 255) + "," + a + ")"; }
        function rgbaArr(r, a) { return "rgba(" + Math.round(r[0] * 255) + "," + Math.round(r[1] * 255) + "," + Math.round(r[2] * 255) + "," + a + ")"; }
        function mix(a, b, u) { return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; }
        function hash(n) { var x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }
        function cpList(x) { var r = [], q, c; for (q = 0; q < x.length; q++) {
            c = x.charCodeAt(q);
            if (c >= 0xD800 && c <= 0xDBFF && q + 1 < x.length) {
                r.push(x.substr(q, 2));
                q++;
            }
            else {
                r.push(x.charAt(q));
            }
        } return r; }
        var INTERP = [{ t: "bez", a: 33, b: 85 }, { t: "lin" }, { t: "bez", a: 65, b: 65 }, { t: "bez", a: 0.1, b: 70 }, { t: "bez", a: 70, b: 0.1 }, { t: "bez", a: 0.1, b: 92 }, { t: "bez", a: 92, b: 0.1 },
            { t: "bez", a: 33.33, b: 33.33 }, { t: "bez", a: 25, b: 25 }, { t: "bez", a: 40, b: 80 }, { t: "bez", a: 55, b: 85 }, { t: "bez", a: 76, b: 76 }, { t: "bez", a: 90, b: 90 },
            { t: "bez", a: 0.1, b: 45 }, { t: "bez", a: 45, b: 0.1 }, { t: "bez", a: 15, b: 75 }];
        function curve(ip, x) {
            var x1, x2, lo = 0, hi = 1, m, k, tt;
            x = clamp01(x);
            if (!ip || ip.t === "lin") {
                return x;
            }
            x1 = ip.a / 100;
            x2 = 1 - ip.b / 100;
            for (k = 0; k < 22; k++) {
                m = (lo + hi) / 2;
                tt = 3 * (1 - m) * (1 - m) * m * x1 + 3 * (1 - m) * m * m * x2 + m * m * m;
                if (tt < x) {
                    lo = m;
                }
                else {
                    hi = m;
                }
            }
            m = (lo + hi) / 2;
            return 3 * (1 - m) * m * m + m * m * m;
        }
        var SIP = INTERP[0];
        function sease(x) { return curve(SIP, x); }
        var DIRMAP = [{ u: 1, r: 0, rnd: 0 }, { u: 1, r: 1, rnd: 0 }, { u: 1, r: 0, rnd: 1 }, { u: 4, r: 0, rnd: 0 }, { u: 4, r: 1, rnd: 0 }, { u: 4, r: 0, rnd: 1 }, { u: 3, r: 0, rnd: 1 }, { u: 3, r: 0, rnd: 0 }, { u: 3, r: 1, rnd: 0 }];
        function animSpecs(p, z, xs, k) {
            function A(o, sm, unit, rnd) { o.sm = (sm === undefined) ? 100 : sm; o.unit = unit || 0; o.rnd = !!rnd; o.w0 = 0; o.w1 = 1; return [o]; }
            function stg(kind, vals, unit) {
                var W = (vals.length === 3) ? [[0, 0.5], [0.3, 0.78], [0.55, 1]] : [[0, 0.62], [0.38, 1]], out = [], j, o;
                for (j = 0; j < vals.length; j++) {
                    o = { sm: 100, unit: unit || 0, rnd: false, w0: W[j][0], w1: W[j][1] };
                    if (kind === "pos") {
                        o.px = vals[j][0];
                        o.py = vals[j][1];
                    }
                    else if (kind === "rot") {
                        o.rot = vals[j];
                    }
                    else {
                        o.trk = vals[j];
                    }
                    if (j === 0) {
                        o.op = 0;
                    }
                    out.push(o);
                }
                return out;
            }
            switch (p) {
                case 0: return A({ py: z * 0.7, op: 0 });
                case 1: return A({ op: 0, blur: 60 });
                case 2: return A({ sx: 0, sy: 0, op: 0 });
                case 3: return A({ trk: -z * 0.5, op: 0 });
                case 4: return A({ py: -z * 0.8, rot: -90, op: 0 });
                case 5: return A({ op: 0 }, 0);
                case 6: return A({ px: xs * z * 1.1, skew: -xs * 35, op: 0 });
                case 7: return A({ sx: 320, sy: 320, blur: 45, op: 0 });
                case 8: return A({ py: z * 0.4, sx: 85, sy: 85, blur: 30, op: 0 });
                case 9: return A({ fill: 1, py: z * 0.25, op: 0 });
                case 11: return A({ op: 0 });
                case 12: return A({ py: z * 1.4, op: 0 });
                case 13: return A({ py: -z * 1.4, op: 0 });
                case 14: return A({ px: xs * z * 1.6, op: 0 });
                case 15: return A({ sx: 30, sy: 30, blur: 20, op: 0 });
                case 16: return A({ trk: z * 1.2, op: 0 });
                case 17: return A({ py: z * 0.4, op: 0 }, 0, 3);
                case 18: return A({ py: z * 0.6, op: 0 }, 0, 4);
                case 19: return A({ sx: 0, sy: 0, op: 0 }, 0, 3);
                case 20: return A({ op: 0 }, 100, 0, true);
                case 21: return A({ rot: xs * -45, py: z * 0.5, op: 0 });
                case 22: return A({ blur: 80, sx: 115, sy: 115, op: 0 });
                case 23: return A({ py: -z, sx: 115, sy: 115, blur: 40, op: 0 });
                case 24: return A({ fill: 1, sx: 125, sy: 125, op: 0 });
                case 25: return A({ px: xs * z * 1.2, skew: -xs * 25, blur: 30, op: 0 });
                case 26: return A({ trk: z * 0.6, blur: 25, op: 0 });
                case 27: return A({ rot: xs * -25, py: z * 0.9, op: 0 });
                case 28: return A({ py: z * 0.9, blur: 35, op: 0 }, 100, 4);
                case 29: return A({ px: xs * z, blur: 30, op: 0 }, 100, 3);
                case 30: return A({ py: -z * 0.8, sx: 140, sy: 140, op: 0 }, 100, 3);
                case 31: return A({ px: xs * z * 1.6, skew: -xs * 30, op: 0 }, 100, 4);
                case 32: return A({ sx: 140, sy: 55, py: z * 0.15, op: 0 });
                case 33: return A({ sx: 100 + 130 * k, sy: 100 + 130 * k, rot: -xs * 5 * k, op: 0 }, 40);
                case 34: return A({ sx: 100, sy: -100, op: 0 });
                case 35: return A({ sx: -100, sy: 100, op: 0 }, 100, 3);
                case 36: return stg("pos", [[0, z * 0.9], [0, -z * 0.2 * k]]);
                case 37: return stg("pos", [[0, -z * 1.3], [0, z * 0.22 * k], [0, -z * 0.08 * k]]);
                case 38: return stg("rot", [28 * k, -16 * k, 7 * k]);
                case 39: return stg("trk", [z * 0.55, -z * 0.3 * k]);
                case 40: return stg("pos", [[xs * z * 1.3, 0], [-xs * z * 0.18 * k, 0]]);
                case 41: return stg("pos", [[0, z * 0.9], [0, -z * 0.12 * k]], 4);
                case 42: return A({ sx: 30, sy: 30, op: 0 }, 100, 3);
                case 43: return A({ py: z * 0.7, rot: 50, sx: 50, sy: 50, op: 0 }, 100, 0, true);
                case 44: return [{ op: 0, sm: 100, unit: 0, rnd: false, w0: 0, w1: 0.5 }, { fill: 1, band: true, sm: 100, unit: 0, rnd: false, w0: 0.25, w1: 1 }];
                case 45: return A({ fill: 1, px: xs * z * 0.9, blur: 25, op: 0 });
                case 46: return [];
                case 47: return A({ py: z * 0.35, op: 0 }, 100, 4);
                case 48: return A({ py: z * 0.8, blur: 40, op: 0 });
                case 49: return A({ sx: 180, sy: 180, op: 0 });
                case 50: return A({ rot: xs * -20, py: z * 0.6, op: 0 });
                case 51: return A({ skew: -xs * 30, py: z * 0.5, op: 0 });
                case 52: return A({ sx: 260, sy: 25, op: 0 });
                case 53: return A({ rot: xs * 20, py: -z * 0.9, op: 0 });
                case 54: return A({ sx: 40, sy: 40, rot: xs * 60, op: 0 });
                case 55: return A({ blur: 40, op: 0 }, 100, 3);
                case 56: return A({ py: z * 0.6, op: 0 }, 100, 3);
                case 57: return A({ rot: xs * -25, py: z * 0.3, op: 0 }, 100, 3);
                case 58: return A({ sx: 140, sy: 140, op: 0 }, 100, 4);
                case 59: return A({ px: xs * z, skew: -xs * 25, op: 0 }, 100, 4);
                case 60: return A({ py: -z * 0.7, blur: 30, op: 0 }, 100, 4);
                case 61: return A({ blur: 50, op: 0 }, 100, 0, true);
                case 62: return A({ sx: 0, sy: 0, op: 0 }, 100, 0, true);
                case 63: return A({ px: -xs * z * 1.6, op: 0 });
                default: return A({ sx: 0, sy: 0, rot: 180, op: 0 });
            }
        }
        function amtSel(c, rwu, dirR, out, outRev, q) {
            var e, a;
            if (out && outRev) {
                q = 1 - q;
                out = false;
            }
            if (!out) {
                if (!dirR) {
                    e = 1 - q;
                    a = (e - c) / rwu + 0.5;
                }
                else {
                    e = q;
                    a = (c - e) / rwu + 0.5;
                }
            }
            else {
                if (!dirR) {
                    e = 1 - q;
                    a = (c - e) / rwu + 0.5;
                }
                else {
                    e = q;
                    a = (e - c) / rwu + 0.5;
                }
            }
            return clamp01(a);
        }
        function bandAmt(c, rwu, dirR, q) {
            var BW = 0.28, e = dirR ? lerp(-BW, 1, q) : lerp(1, -BW, q);
            return clamp01((c - e) / rwu + 0.5) * clamp01((e + BW - c) / rwu + 0.5);
        }
        var permCache = {};
        function permFor(n) {
            var a, j, k, tmp, seed;
            if (permCache[n]) {
                return permCache[n];
            }
            a = [];
            for (j = 0; j < n; j++) {
                a.push(j);
            }
            seed = 1234 + n;
            for (j = n - 1; j > 0; j--) {
                seed = (seed * 1103515245 + 12345) & 0x7fffffff;
                k = seed % (j + 1);
                tmp = a[j];
                a[j] = a[k];
                a[k] = tmp;
            }
            permCache[n] = a;
            return a;
        }
        function animateFx(fx, P, A, S, T, t) {
            var w = T * 2 * Math.PI / P, f = T / P - Math.floor(T / P), o = { dx: 0, dy: 0, sx: 1, sy: 1, rot: 0, op: 1, glow: 0 }, k, r, m, q;
            function wig(freq, amp) { var n = t * freq; o.dx += (hash(Math.floor(n) * 3.1) * 2 - 1) * amp * (1 - (n - Math.floor(n))) + (hash(Math.floor(n) * 3.1 + 1) * 2 - 1) * amp * (n - Math.floor(n)); o.dy += (hash(Math.floor(n) * 5.7 + 9) * 2 - 1) * amp * (1 - (n - Math.floor(n))) + (hash(Math.floor(n) * 5.7 + 10) * 2 - 1) * amp * (n - Math.floor(n)); }
            switch (fx) {
                case 1:
                    k = 1 + 0.06 * A * Math.sin(w);
                    o.sx = o.sy = k;
                    break;
                case 2:
                    o.dy = -S * 0.12 * A * Math.sin(w);
                    break;
                case 3:
                    o.op = Math.cos(w) >= 0 ? 1 : Math.max(0, 1 - 0.85 * A);
                    break;
                case 4:
                    o.rot = 3 * A * Math.sin(w);
                    break;
                case 5:
                    o.dx = S * 0.2 * A * Math.sin(w);
                    break;
                case 6:
                    k = 1 + 0.1 * A * (Math.exp(-Math.pow((f - 0.12) / 0.05, 2)) + 0.7 * Math.exp(-Math.pow((f - 0.32) / 0.05, 2)));
                    o.sx = o.sy = k;
                    break;
                case 7:
                    o.dy = -S * 0.35 * A * Math.abs(Math.sin(Math.PI * f));
                    break;
                case 8:
                    if (T > 0) {
                        wig(3 / P, S * 0.04 * A);
                    }
                    break;
                case 9:
                    if (T > 0) {
                        wig(10 / P, S * 0.06 * A);
                    }
                    break;
                case 10:
                    o.op = 0.75 + 0.25 * Math.cos(w);
                    o.sx = o.sy = 1 + 0.03 * A * Math.sin(w);
                    break;
                case 11:
                    o.sx = o.sy = 1 + 0.05 * A * T / P;
                    break;
                case 12:
                    o.sx = o.sy = Math.max(0.2, 1 - 0.04 * A * T / P);
                    break;
                case 13:
                    o.dy = -S * 0.25 * A * T / P;
                    break;
                case 14:
                    o.dy = S * 0.25 * A * T / P;
                    break;
                case 15:
                    o.dx = -S * 0.25 * A * T / P;
                    break;
                case 16:
                    o.dx = S * 0.25 * A * T / P;
                    break;
                case 17:
                    q = (f < 0.2) ? Math.sin(f / 0.2 * Math.PI / 2) : Math.cos((f - 0.2) / 0.8 * Math.PI / 2);
                    o.sx = o.sy = 1 + 0.15 * A * q;
                    break;
                case 18:
                    o.op = 1 - 0.55 * Math.min(A, 1.6) * (0.5 - 0.5 * Math.cos(w));
                    break;
                case 19:
                    o.glow = 0.6 + 1.2 * A * (0.5 - 0.5 * Math.cos(w));
                    break;
                case 20:
                    o.dx = S * 0.25 * A * ((f < 0.25) ? Math.sin(f / 0.25 * Math.PI) : 0);
                    break;
                case 21:
                    o.rot = 12 * A * Math.sin(w);
                    break;
                case 22:
                    o.dx = S * 0.1 * A * Math.sin(w);
                    o.dy = S * 0.1 * A * (1 - Math.cos(w));
                    break;
                case 23:
                    o.rot = 360 * T / (P * 2);
                    break;
                case 24:
                    o.sx = Math.cos(w);
                    break;
                case 25:
                    if (T > 0) {
                        r = hash(Math.floor(t * 12) * 1.7);
                        if (r > 0.82) {
                            o.dx = (hash(Math.floor(t * 12) * 2.3) - 0.5) * S * 0.5 * A;
                            o.dy = (hash(Math.floor(t * 12) * 3.9) - 0.5) * S * 0.08 * A;
                        }
                    }
                    break;
                case 26:
                    if (T > 0) {
                        r = hash(Math.floor(t * 20) * 1.3);
                        m = Math.min(A, 1.3);
                        if (r > 0.9) {
                            o.op = Math.max(0, 1 - 0.75 * m);
                        }
                        else if (r > 0.75) {
                            o.op = 1 - 0.3 * m;
                        }
                    }
                    break;
                case 27:
                    o.dx = S * 0.1 * A * Math.sin(w);
                    o.dy = S * 0.06 * A * Math.sin(2 * w);
                    break;
                case 28:
                    k = 0.08 * A * Math.sin(w);
                    o.sx = 1 + k;
                    o.sy = 1 - k;
                    break;
                case 29:
                    k = 0.12 * A * Math.exp(-5 * f) * Math.sin(18 * f);
                    o.sx = 1 + k;
                    o.sy = 1 - k;
                    break;
            }
            return o;
        }
        function measureBlock(lines, size, trk, font, lsp) {
            lsp = lsp || 0;
            var key = font + "|" + trk + "|" + lsp + "|" + lines.join("\u0001"), B, li, chars, n, j, G, prev, pre, x, w, step = trk * size / 1000, lw, wmax = 0;
            if (mcache[key]) {
                return mcache[key];
            }
            if (!mc) {
                mc = document.createElement("canvas").getContext("2d");
            }
            mc.font = font;
            B = { lines: [], w: 0, h: (lines.length - 1) * size * (1.2 + lsp / 100) + size, size: size, font: font, trk: trk, n: 0, lsp: lsp };
            for (li = 0; li < lines.length; li++) {
                chars = cpList(lines[li]);
                n = chars.length;
                G = [];
                if (n <= 80) {
                    prev = 0;
                    for (j = 0; j < n; j++) {
                        pre = mc.measureText(chars.slice(0, j + 1).join("")).width;
                        G.push({ ch: chars[j], x: prev + j * step, w: pre - prev });
                        prev = pre;
                    }
                    lw = prev + n * step;
                }
                else {
                    x = 0;
                    for (j = 0; j < n; j++) {
                        w = mc.measureText(chars[j]).width;
                        G.push({ ch: chars[j], x: x, w: w });
                        x += w + step;
                    }
                    lw = x;
                }
                B.lines.push({ s: lines[li], g: G, w: lw });
                B.n += n;
                if (lw > wmax) {
                    wmax = lw;
                }
            }
            B.w = wmax;
            if (mcacheN > 150) {
                mcache = {};
                mcacheN = 0;
            }
            mcache[key] = B;
            mcacheN++;
            return B;
        }
        function unitsOf(B) {
            var U = { n: B.n, i1: [], i3: [], i4: [], N1: 0, N3: 0, N4: B.lines.length }, li, j, g, wi = -1, prevSp, isSp, gi = 0;
            for (li = 0; li < B.lines.length; li++) {
                prevSp = true;
                for (j = 0; j < B.lines[li].g.length; j++) {
                    g = B.lines[li].g[j];
                    isSp = /\s/.test(g.ch);
                    if (!isSp && prevSp) {
                        wi++;
                    }
                    prevSp = isSp;
                    U.i1[gi] = gi;
                    U.i3[gi] = Math.max(0, wi);
                    U.i4[gi] = li;
                    gi++;
                }
            }
            U.N1 = Math.max(1, B.n);
            U.N3 = Math.max(1, wi + 1);
            U.N4 = Math.max(1, B.lines.length);
            return U;
        }
        function evalStates(U, ANS, t, T) {
            var st = [], g, j, an, unit, N, perm, rnd, amts, u, c, a, rwu, d, w0, q, q2, a1, a2, s0;
            for (g = 0; g < U.n; g++) {
                st.push({ dx: 0, dy: 0, sx: 1, sy: 1, rot: 0, skew: 0, blur: 0, op: 1, trk: 0, fm: 0 });
            }
            for (j = 0; j < ANS.length; j++) {
                an = ANS[j];
                unit = an.unit || T.dm.u;
                N = U["N" + unit];
                rnd = T.dm.rnd || an.rnd;
                perm = rnd ? permFor(N) : null;
                rwu = Math.max(1e-6, an.sm / 100 / N);
                d = T.dur * (an.w1 - an.w0);
                w0 = T.delay + T.dur * an.w0;
                q = curve(T.IP, d > 0 ? (t - w0) / d : (t >= w0 ? 1 : 0));
                q2 = T.endOn ? curve(T.IP, T.outD > 0 ? (t - T.outS) / T.outD : 1) : 0;
                amts = [];
                for (u = 0; u < N; u++) {
                    c = ((perm ? perm[u] : u) + 0.5) / N;
                    if (an.band) {
                        a1 = bandAmt(c, rwu, T.dirR, q);
                        a2 = T.endOn ? bandAmt(c, rwu, T.dirR, q2) : 0;
                    }
                    else {
                        a1 = amtSel(c, rwu, T.dirR, false, false, q);
                        a2 = T.endOn ? amtSel(c, rwu, T.dirR, true, T.endRev, q2) : 0;
                    }
                    amts.push(clamp01(a1 + a2));
                }
                for (g = 0; g < U.n; g++) {
                    a = amts[U["i" + unit][g]];
                    if (a <= 0.0005) {
                        continue;
                    }
                    s0 = st[g];
                    if (an.px) {
                        s0.dx += an.px * a;
                    }
                    if (an.py) {
                        s0.dy += an.py * a;
                    }
                    if (an.sx !== undefined) {
                        s0.sx *= 1 + (an.sx / 100 - 1) * a;
                    }
                    if (an.sy !== undefined) {
                        s0.sy *= 1 + (an.sy / 100 - 1) * a;
                    }
                    if (an.rot) {
                        s0.rot += an.rot * a;
                    }
                    if (an.skew) {
                        s0.skew += an.skew * a;
                    }
                    if (an.blur) {
                        s0.blur += an.blur * a;
                    }
                    if (an.trk) {
                        s0.trk += an.trk * a;
                    }
                    if (an.op !== undefined) {
                        s0.op *= 1 - a * (1 - an.op / 100);
                    }
                    if (an.fill) {
                        s0.fm = s0.fm + a * (1 - s0.fm);
                    }
                }
            }
            return st;
        }
        function drawBlock(c, B, left, top, al, st, o) {
            var li, j, L, gi = 0, lx, by, E, cum, g, s0, gx, fill, strk, part, a, blurPx, sh, sa, sdx, sdy, haveSh;
            c.font = B.font;
            c.textBaseline = "alphabetic";
            c.textAlign = "center";
            sh = o.shadow;
            if (sh) {
                sa = sh.dir * Math.PI / 180;
                sdx = Math.sin(sa) * sh.dist * o.sc;
                sdy = -Math.cos(sa) * sh.dist * o.sc;
            }
            for (li = 0; li < B.lines.length; li++) {
                L = B.lines[li];
                by = top + li * B.size * (1.2 + (B.lsp || 0) / 100) + B.size * 0.82;
                E = 0;
                if (st) {
                    for (j = 0; j < L.g.length; j++) {
                        E += st[gi + j].trk * B.size / 1000;
                    }
                }
                lx = (al === 0) ? left : (al === 2) ? (left + B.w - L.w) : (left + (B.w - L.w) / 2);
                lx -= E * (al === 1 ? 0.5 : (al === 2 ? 1 : 0));
                cum = 0;
                for (j = 0; j < L.g.length; j++, gi++) {
                    g = L.g[j];
                    s0 = st ? st[gi] : null;
                    gx = lx + g.x + cum + g.w / 2;
                    if (s0) {
                        cum += s0.trk * B.size / 1000;
                    }
                    if (/^\s$/.test(g.ch)) {
                        continue;
                    }
                    a = o.alpha * (s0 ? s0.op : 1);
                    if (a <= 0.003) {
                        continue;
                    }
                    part = o.parts ? o.parts[gi] : null;
                    fill = (part && part.f) ? part.f : o.fill;
                    strk = (part && part.s) ? part.s : o.orgb;
                    if (s0 && s0.fm > 0.001) {
                        fill = mix(fill, o.accent, s0.fm);
                    }
                    c.save();
                    c.translate(gx + (s0 ? s0.dx : 0), by + (s0 ? s0.dy : 0));
                    if (s0) {
                        if (s0.rot) {
                            c.rotate(s0.rot * Math.PI / 180);
                        }
                        if (s0.skew) {
                            c.transform(1, 0, -Math.tan(Math.max(-80, Math.min(80, s0.skew)) * Math.PI / 180), 1, 0, 0);
                        }
                        if (s0.sx !== 1 || s0.sy !== 1) {
                            c.scale(s0.sx === 0 ? 0.0001 : s0.sx, s0.sy === 0 ? 0.0001 : s0.sy);
                        }
                        if (s0.blur > 0.4 && HAS_FILTER) {
                            blurPx = s0.blur * 0.5 * o.sc;
                            if (blurPx >= 0.3) {
                                c.filter = "blur(" + blurPx.toFixed(2) + "px)";
                            }
                        }
                    }
                    c.globalAlpha = a;
                    haveSh = false;
                    if (sh) {
                        c.shadowColor = rgbaArr(sh.rgb, sh.op);
                        c.shadowBlur = sh.soft * o.sc;
                        c.shadowOffsetX = sdx;
                        c.shadowOffsetY = sdy;
                        haveSh = true;
                    }
                    else if (o.glow > 0) {
                        c.shadowColor = rgbaArr(fill, Math.min(1, o.glow * 0.6));
                        c.shadowBlur = Math.max(10, o.gsize * 0.25) * o.sc * o.glow * 0.8;
                        c.shadowOffsetX = 0;
                        c.shadowOffsetY = 0;
                        haveSh = true;
                    }
                    if (o.ow > 0) {
                        c.lineWidth = o.ow;
                        c.lineJoin = "round";
                        c.strokeStyle = rgbaArr(strk, 1);
                        c.strokeText(g.ch, 0, 0);
                        if (haveSh) {
                            c.shadowColor = "rgba(0,0,0,0)";
                        }
                    }
                    c.fillStyle = rgbaArr(fill, 1);
                    c.fillText(g.ch, 0, 0);
                    c.restore();
                }
            }
            c.shadowColor = "rgba(0,0,0,0)";
            c.shadowBlur = 0;
            c.shadowOffsetX = 0;
            c.shadowOffsetY = 0;
        }
        function partsOf(s, n) {
            var arr = null, i, j, p;
            if (!s.parts || !s.parts.length) {
                return null;
            }
            arr = [];
            for (i = 0; i < s.parts.length; i++) {
                p = s.parts[i];
                for (j = Math.max(0, (p.va !== undefined) ? p.va : p.a); j < Math.min(n, (p.vb !== undefined) ? p.vb : p.b); j++) {
                    arr[j] = { f: p.f || null, s: (p.s && s.outline) ? p.s : null };
                }
            }
            return arr;
        }
        function textOpts(s, sc, B) {
            return { sc: sc, alpha: 1, fill: s.textRGB, accent: s.accentRGB, ow: s.outline ? Math.max(0, s.outlineW) : 0, orgb: s.outlineRGB,
                shadow: s.shadow ? { rgb: s.shRGB, op: Math.max(0, Math.min(1, s.shOp / 100)), dist: s.shDist, soft: s.shSoft, dir: s.shDir } : null,
                parts: partsOf(s, B.n), glow: 0, gsize: B.size };
        }
        function fontFor(size) { var cst = window.getComputedStyle($("text")); return (cst.fontStyle || "normal") + " " + (cst.fontWeight || "normal") + " " + size + "px " + cst.fontFamily; }
        function alignOf() { var al = parseInt($("align").value, 10) || 0; if (al > 2) {
            al = [0, 1, 2, 0][al - 3] || 0;
        } return al; }
        function slope(deg) { return -Math.tan((deg || 0) * Math.PI / 180); }
        function slant(l, t, r, b, yc, m) {
            function dx(y) { return -m * (y - yc); }
            return [[l + dx(t), t], [r + dx(t), t], [r + dx(b), b], [l + dx(b), b]];
        }
        function bboxOf(p) {
            var i, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
            for (i = 0; i < p.length; i++) {
                x0 = Math.min(x0, p[i][0]);
                x1 = Math.max(x1, p[i][0]);
                y0 = Math.min(y0, p[i][1]);
                y1 = Math.max(y1, p[i][1]);
            }
            return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: Math.max(1, x1 - x0), h: Math.max(1, y1 - y0) };
        }
        function gRect(bb, rad) { return { k: "r", x: bb.cx - bb.w / 2, y: bb.cy - bb.h / 2, w: bb.w, h: bb.h, r: rad || 0 }; }
        function gPoly(polys, closed) { return { k: "p", polys: polys, closed: closed }; }
        function gOval(bb) { return { k: "o", cx: bb.cx, cy: bb.cy, rx: bb.w / 2, ry: bb.h / 2 }; }
        function trace(c, g) {
            var i, j, pl, r;
            c.beginPath();
            if (g.k === "r") {
                r = Math.min(g.r, g.w / 2, g.h / 2);
                if (r <= 0) {
                    c.rect(g.x, g.y, g.w, g.h);
                }
                else {
                    c.moveTo(g.x + r, g.y);
                    c.lineTo(g.x + g.w - r, g.y);
                    c.arcTo(g.x + g.w, g.y, g.x + g.w, g.y + r, r);
                    c.lineTo(g.x + g.w, g.y + g.h - r);
                    c.arcTo(g.x + g.w, g.y + g.h, g.x + g.w - r, g.y + g.h, r);
                    c.lineTo(g.x + r, g.y + g.h);
                    c.arcTo(g.x, g.y + g.h, g.x, g.y + g.h - r, r);
                    c.lineTo(g.x, g.y + r);
                    c.arcTo(g.x, g.y, g.x + r, g.y, r);
                    c.closePath();
                }
            }
            else if (g.k === "p") {
                for (i = 0; i < g.polys.length; i++) {
                    pl = g.polys[i];
                    c.moveTo(pl[0][0], pl[0][1]);
                    for (j = 1; j < pl.length; j++) {
                        c.lineTo(pl[j][0], pl[j][1]);
                    }
                    if (g.closed) {
                        c.closePath();
                    }
                }
            }
            else {
                c.save();
                c.translate(g.cx, g.cy);
                c.scale(Math.max(0.01, g.rx), Math.max(0.01, g.ry));
                c.arc(0, 0, 1, 0, Math.PI * 2);
                c.restore();
            }
        }
        function pathLen(g) {
            var i, j, pl, L = 0;
            if (g.k === "r") {
                return 2 * (g.w + g.h);
            }
            if (g.k === "o") {
                return Math.PI * (g.rx + g.ry) * 2;
            }
            for (i = 0; i < g.polys.length; i++) {
                pl = g.polys[i];
                for (j = 1; j < pl.length; j++) {
                    L += Math.sqrt(Math.pow(pl[j][0] - pl[j - 1][0], 2) + Math.pow(pl[j][1] - pl[j - 1][1], 2));
                }
                if (g.closed) {
                    L += Math.sqrt(Math.pow(pl[0][0] - pl[pl.length - 1][0], 2) + Math.pow(pl[0][1] - pl[pl.length - 1][1], 2));
                }
            }
            return L;
        }
        var SL_MODES = [[0, "l", 0, "l"], [0, "r", 0, "r"], [0, "l", 0, "r"], [0, "r", 0, "l"], [9, "l", 9, "l"], ["ci", "l", "ci", "l"], [2, "l", 2, "l"], [4, "l", 4, "l"],
            [2, "l", 4, "l"], [5, "l", 6, "l"], [6, "l", 5, "l"], [1, "l", 1, "l"], [7, "l", 7, "l"], [12, "l", 12, "l"], [13, "l", 13, "l"], [3, "l", 3, "l"], [5, "l", 5, "l"], [6, "l", 6, "l"],
            [8, "l", 8, "l"], [12, "r", 12, "r"], [12, "l", 12, "r"], [4, "l", 2, "l"], [0, "l", 12, "r"]];
        function build(TB, T) {
            var out = [], echo = [], bx = null, ln = null, sp = [], tpad = $("optOutline").checked ? Math.max(0, num("outlineW", 0)) / 2 : 0, EXT = tpad;
            var delay = T.delay, dur = T.dur, hold = T.hold, order = parseInt($("shpOrder").value, 10) || 0;
            var sT0 = Math.max(0, delay - 0.25), bpad = Math.max(0, num("boxPad", 28)), lpad = Math.max(0, num("linePad", 22)), lw = Math.max(1, num("lineW", 4));
            var th = Math.max(1, num("shpTh", 8)), gap = th * 1.2 + num("shpGap", 0), tt, type = parseInt($("shpType").value, 10) || 0, boxOn = $("optBox").checked;
            var boxSkew = boxOn ? Math.min(45, Math.max(-45, num("boxSkew", 0))) : 0, sa = parseInt($("shpAnim").value, 10) || 0;
            var bb, pm, pH, pW, pX, pL, len, L, Tp, R, B, sk, pts, pc, shpC = "cShp", curShape = false, XF = null, srad = Math.max(0, num("shpRad", 0));
            if (order === 1) {
                sT0 = delay;
            }
            else if (order === 2) {
                sT0 = delay + dur * 0.6;
            }
            tt = sT0 + 0.1 + Math.max(0, num("shpDelay", 0));
            XF = { len: Math.min(300, Math.max(10, num("shpLen", 100))) / 100, ox: num("shpOffX", 0), oy: num("shpOffY", 0), rot: num("shpRot", 0), op: Math.min(100, Math.max(0, num("shpOp", 100))) / 100,
                lnOn: $("optShpLn").checked, lnW: Math.max(1, num("shpLnW", 3)), shOn: $("optShpSh").checked, shSoft: Math.max(0, num("shpShSoft", 12)), shDist: Math.max(0, num("shpShDist", 6)),
                fx: parseInt($("shpFx").value, 10) || 0, fxSp: Math.max(0.2, num("shpFxSp", 1.2)), t0: tt + Math.max(0.1, num("shpDur", 0.6)), amp: Math.max(4, th * 0.6), skew: Math.min(45, Math.max(-45, num("shpSkew", 0))) };
            if (boxOn) {
                EXT = Math.max(EXT, bpad + tpad);
            }
            if ($("optLine").checked) {
                EXT = Math.max(EXT, lpad + tpad + lw / 2);
            }
            function mk(bb2, edge, anim, s0, d, g, fillA, strokeId, sw) {
                return { bb: bb2, edge: edge, anim: anim, t0: s0, d: Math.max(0.1, d), g: g, fill: fillA, stroke: strokeId, sw: sw, trim: !!strokeId, shrink: null, xf: curShape ? XF : null };
            }
            function fillP(id) { return [id, 1]; }
            if (boxOn) {
                var bOp = Math.min(100, Math.max(0, num("boxOp", 85))) / 100, bAn = parseInt($("boxAnim").value, 10) || 0, brad = Math.max(0, num("boxRad", 10));
                var BA = [0, 0, 1, 2, 3, 0, 0, 4, 5, 6, 7, 8, 9, 9, 10, 12, 13, 14, 15], BE = ["l", "r", "c", "c", "c", "b", "t", "c", "c", "c", "c", "c", "l", "t", "c", "l", "c", "c", "c"];
                bb = { cx: TB.cx, cy: TB.cy, w: TB.w + 2 * (bpad + tpad), h: TB.h + 2 * (bpad + tpad) };
                if (boxSkew) {
                    pm = slope(boxSkew);
                    pX = Math.abs(pm) * bb.h / 2;
                    pts = slant(bb.cx - bb.w / 2 - pX, bb.cy - bb.h / 2, bb.cx + bb.w / 2 + pX, bb.cy + bb.h / 2, bb.cy, pm);
                    bx = mk(bboxOf(pts), BE[bAn], BA[bAn], sT0, num("boxDur", 0.6), gPoly([pts], true), ["cBox", bOp], null, 0);
                }
                else {
                    bx = mk(bb, BE[bAn], BA[bAn], sT0, num("boxDur", 0.6), gRect(bb, brad), ["cBox", bOp], null, 0);
                }
            }
            curShape = true;
            if ($("optShp").checked) {
                if (type === 0) {
                    bb = { cx: TB.l - EXT - gap - th / 2, cy: TB.cy, w: th, h: TB.h + 2 * EXT };
                    sp.push(mk(bb, "t", sa, tt, num("shpDur", 0.6), gRect(bb, srad), fillP(shpC), null, 0));
                }
                else if (type === 1) {
                    bb = { cx: TB.cx, cy: TB.t + TB.h + EXT + gap + th / 2, w: TB.w + 2 * EXT, h: th };
                    sp.push(mk(bb, "l", sa, tt, num("shpDur", 0.6), gRect(bb, srad), fillP(shpC), null, 0));
                }
                else if (type === 2) {
                    bb = { cx: TB.cx, cy: TB.t - EXT - gap - th / 2, w: TB.w + 2 * EXT, h: th };
                    sp.push(mk(bb, "r", sa, tt, num("shpDur", 0.6), gRect(bb, srad), fillP(shpC), null, 0));
                    bb = { cx: TB.cx, cy: TB.t + TB.h + EXT + gap + th / 2, w: TB.w + 2 * EXT, h: th };
                    sp.push(mk(bb, "l", sa, tt, num("shpDur", 0.6), gRect(bb, srad), fillP(shpC), null, 0));
                }
                else if (type === 3) {
                    len = Math.max(TB.h * 1.7, th * 3);
                    bb = { cx: TB.l, cy: TB.cy, w: len, h: len };
                    sp.push(mk(bb, "c", sa, tt, num("shpDur", 0.6), gOval(bb), fillP(shpC), null, 0));
                }
                else if (type === 4) {
                    L = TB.l - EXT - gap;
                    Tp = TB.t - EXT - gap;
                    R = TB.l + TB.w + EXT + gap;
                    B = TB.t + TB.h + EXT + gap;
                    len = Math.max(th * 5, TB.h * 0.5);
                    bb = { cx: (L + R) / 2, cy: (Tp + B) / 2, w: R - L, h: B - Tp };
                    sp.push(mk(bb, "c", sa, tt, num("shpDur", 0.6), gPoly([[[L, Tp + len], [L, Tp], [L + len, Tp]], [[R, B - len], [R, B], [R - len, B]]], false), null, shpC, th));
                }
                else if (type === 6) {
                    pm = slope(boxSkew);
                    pL = Math.max(EXT, TB.h * 0.25);
                    pH = TB.h + 2 * pL;
                    pW = TB.w + 2 * pL;
                    pX = Math.abs(pm) * pH / 2;
                    len = Math.max(8, th * 4);
                    pts = slant(TB.cx - pW / 2 - pX + len, TB.cy - pH / 2 + len, TB.cx + pW / 2 + pX + len, TB.cy + pH / 2 + len, TB.cy + len, pm);
                    echo.push(mk(bboxOf(pts), "c", sa, tt, num("shpDur", 0.6), gPoly([pts], true), null, shpC, th));
                }
                else if (type === 7) {
                    pm = slope(boxSkew);
                    pL = EXT;
                    pH = TB.h + 2 * pL;
                    pW = TB.w + 2 * pL;
                    pX = Math.abs(pm) * pH / 2;
                    len = boxOn ? (TB.cy + pH / 2 - th) : (TB.cy + pH / 2 + gap);
                    pts = slant(TB.cx - pW / 2 - pX, len, TB.cx + pW / 2 + pX, len + th, TB.cy, pm);
                    pc = mk(bboxOf(pts), "l", 0, tt, num("shpDur", 0.6), gPoly([pts], true), fillP(shpC), null, 0);
                    pc.shrink = true;
                    sp.push(pc);
                }
                else if (type === 8) {
                    pm = slope(boxSkew);
                    pL = Math.max(EXT, (boxOn || $("optLine").checked) ? 0 : TB.h * 0.2);
                    pH = TB.h + 2 * pL;
                    pW = TB.w + 2 * pL;
                    pX = Math.abs(pm) * pH / 2;
                    len = TB.cy + pH / 2;
                    pts = slant(TB.cx - pW / 2 - pX, len, TB.cx + pW / 2 + pX, len + th, TB.cy, pm);
                    sp.push(mk(bboxOf(pts), "l", sa, tt, num("shpDur", 0.6), gPoly([pts], true), fillP(shpC), null, 0));
                }
                else if (type === 9) {
                    bb = { cx: TB.l + TB.w + EXT + gap + th / 2, cy: TB.cy, w: th, h: TB.h + 2 * EXT };
                    sp.push(mk(bb, "t", sa, tt, num("shpDur", 0.6), gRect(bb, srad), fillP(shpC), null, 0));
                }
                else if (type === 10) {
                    pH = TB.h + 2 * EXT + th * 2;
                    pX = TB.l - EXT - gap - th;
                    pts = [[pX, TB.cy + pH / 2], [pX + pH * 0.3, TB.cy - pH / 2]];
                    sp.push(mk(bboxOf(pts), "c", sa, tt, num("shpDur", 0.6), gPoly([pts], false), null, shpC, th));
                }
                else if (type === 11) {
                    pH = TB.h + 2 * EXT + th * 2;
                    pX = TB.l + TB.w + EXT + gap + th;
                    pts = [[pX, TB.cy + pH / 2], [pX - pH * 0.3, TB.cy - pH / 2]];
                    sp.push(mk(bboxOf(pts), "c", sa, tt, num("shpDur", 0.6), gPoly([pts], false), null, shpC, th));
                }
                else if (type === 12 || type === 13) {
                    bb = { cx: TB.cx, cy: TB.t + TB.h + EXT + gap + th / 2, w: TB.w + 2 * EXT, h: th };
                    sp.push(mk(bb, "l", 3, tt, num("shpDur", 0.6), gRect(bb, srad), [shpC, 0.3], null, 0));
                    pc = mk(bb, "l", 0, 0, 0.1, gRect(bb, srad), fillP(shpC), null, 0);
                    pc.prog = (type === 12) ? 1 : 2;
                    sp.push(pc);
                }
                else if (type === 14) {
                    bb = { cx: TB.cx, cy: TB.t + TB.h + EXT + gap + th / 2, w: TB.w + 2 * EXT, h: th };
                    sp.push(mk(bb, "l", sa, tt, num("shpDur", 0.6), gRect(bb, srad), fillP(shpC), null, 0));
                    bb = { cx: TB.cx, cy: bb.cy + th * 2, w: TB.w + 2 * EXT, h: th };
                    sp.push(mk(bb, "l", sa, tt + 0.12, num("shpDur", 0.6), gRect(bb, srad), fillP(shpC), null, 0));
                }
                else if (type === 15) {
                    len = Math.max(th * 2, 8);
                    bb = { cx: TB.l - EXT - gap - len / 2, cy: TB.cy, w: len, h: len };
                    sp.push(mk(bb, "c", sa, tt, num("shpDur", 0.6), gOval(bb), fillP(shpC), null, 0));
                }
                else if (type === 16) {
                    len = Math.max(TB.h * 0.8, th * 3);
                    pX = TB.l - EXT - gap - len / 2;
                    pts = [[pX, TB.cy - len / 2], [pX + len / 2, TB.cy], [pX, TB.cy + len / 2], [pX - len / 2, TB.cy]];
                    sp.push(mk(bboxOf(pts), "c", sa, tt, num("shpDur", 0.6), gPoly([pts], true), fillP(shpC), null, 0));
                }
                else if (type === 17) {
                    pW = Math.max(TB.h * 0.7, th * 2.5);
                    pH = Math.max(TB.h * 0.9, th * 3);
                    pX = TB.l - EXT - gap - pW;
                    pts = [[pX, TB.cy - pH / 2], [pX + pW, TB.cy], [pX, TB.cy + pH / 2]];
                    sp.push(mk(bboxOf(pts), "l", sa, tt, num("shpDur", 0.6), gPoly([pts], true), fillP(shpC), null, 0));
                }
                else if (type === 18) {
                    L = TB.l - EXT - gap;
                    R = TB.l + TB.w + EXT + gap;
                    Tp = TB.t - EXT;
                    B = TB.t + TB.h + EXT;
                    len = Math.max(th * 4, TB.h * 0.3);
                    bb = { cx: (L + R) / 2, cy: (Tp + B) / 2, w: R - L, h: B - Tp };
                    sp.push(mk(bb, "c", sa, tt, num("shpDur", 0.6), gPoly([[[L + len, Tp], [L, Tp], [L, B], [L + len, B]], [[R - len, Tp], [R, Tp], [R, B], [R - len, B]]], false), null, shpC, th));
                }
                else if (type === 19) {
                    pH = Math.max(TB.h * 0.7, th * 3);
                    pX = TB.l - EXT - gap - pH * 0.95;
                    pts = [[[pX, TB.cy - pH / 2], [pX + pH * 0.45, TB.cy], [pX, TB.cy + pH / 2]], [[pX + pH * 0.5, TB.cy - pH / 2], [pX + pH * 0.95, TB.cy], [pX + pH * 0.5, TB.cy + pH / 2]]];
                    sp.push(mk(bboxOf(pts[0].concat(pts[1])), "c", sa, tt, num("shpDur", 0.6), gPoly(pts, false), null, shpC, th));
                }
                else if (type === 20) {
                    L = TB.l - EXT - gap;
                    Tp = TB.t - EXT - gap;
                    len = Math.max(TB.h * 0.9, th * 4);
                    pts = [[L, Tp], [L + len, Tp], [L, Tp + len]];
                    sp.push(mk(bboxOf(pts), "l", sa, tt, num("shpDur", 0.6), gPoly([pts], true), fillP(shpC), null, 0));
                }
                else if (type === 21) {
                    pH = TB.h + 2 * EXT + th * 2;
                    pX = TB.l - EXT - gap - th;
                    pts = [[[pX, TB.cy + pH / 2], [pX + pH * 0.3, TB.cy - pH / 2]], [[pX - th * 2.5, TB.cy + pH / 2], [pX - th * 2.5 + pH * 0.3, TB.cy - pH / 2]]];
                    sp.push(mk(bboxOf(pts[0].concat(pts[1])), "c", sa, tt, num("shpDur", 0.6), gPoly(pts, false), null, shpC, th));
                }
                else if (type === 22) {
                    len = Math.max(th * 2, 8);
                    bb = { cx: TB.l - EXT - gap - len / 2, cy: TB.cy, w: len, h: len };
                    sp.push(mk(bb, "c", sa, tt, num("shpDur", 0.6), gRect(bb, srad), fillP(shpC), null, 0));
                }
                else if (type === 23) {
                    len = Math.max(TB.h * 0.7, th * 3);
                    pX = TB.l - EXT - gap - len / 2;
                    pts = [[pX - len / 2, TB.cy + len * 0.43], [pX + len / 2, TB.cy + len * 0.43], [pX, TB.cy - len * 0.57]];
                    sp.push(mk(bboxOf(pts), "c", sa, tt, num("shpDur", 0.6), gPoly([pts], true), fillP(shpC), null, 0));
                }
                else if (type === 24 || type === 27) {
                    len = Math.max(TB.h * 0.55, th * 2.5);
                    pX = TB.l - EXT - gap - len;
                    pts = [];
                    for (sk = 0; sk < ((type === 24) ? 10 : 6); sk++) {
                        pH = (type === 24) ? (-90 + 36 * sk) : (60 * sk);
                        pW = (type === 24) ? ((sk % 2) ? len * 0.45 : len) : len;
                        pts.push([pX + Math.cos(pH * Math.PI / 180) * pW, TB.cy + Math.sin(pH * Math.PI / 180) * pW]);
                    }
                    sp.push(mk(bboxOf(pts), "c", sa, tt, num("shpDur", 0.6), gPoly([pts], true), fillP(shpC), null, 0));
                }
                else if (type >= 28 && type <= 35) {
                    var bpd = Math.max(0, num("shpPad", 12)), bW0 = TB.w + 2 * EXT + 2 * bpd, bH0 = TB.h + 2 * EXT + 2 * bpd, bSq = Math.max(bW0, bH0), bRd = 0, bK;
                    if (type === 28 || type === 31) {
                        bb = { cx: TB.cx, cy: TB.cy, w: bSq, h: bSq };
                        bRd = (type === 31) ? (srad > 0 ? srad : bSq * 0.25) : srad;
                        sp.push(mk(bb, "c", sa, tt, num("shpDur", 0.6), gRect(bb, bRd), fillP(shpC), null, 0));
                    }
                    else if (type === 29 || type === 30) {
                        bb = { cx: TB.cx, cy: TB.cy, w: bW0, h: bH0 };
                        bRd = (type === 30) ? (srad > 0 ? srad : Math.min(bW0, bH0) * 0.25) : srad;
                        sp.push(mk(bb, "l", sa, tt, num("shpDur", 0.6), gRect(bb, bRd), fillP(shpC), null, 0));
                    }
                    else if (type === 32) {
                        len = Math.sqrt(bW0 * bW0 + bH0 * bH0);
                        bb = { cx: TB.cx, cy: TB.cy, w: len, h: len };
                        sp.push(mk(bb, "c", sa, tt, num("shpDur", 0.6), gOval(bb), fillP(shpC), null, 0));
                    }
                    else if (type === 33) {
                        pts = [[TB.cx, TB.cy - bH0], [TB.cx + bW0, TB.cy], [TB.cx, TB.cy + bH0], [TB.cx - bW0, TB.cy]];
                        sp.push(mk(bboxOf(pts), "c", sa, tt, num("shpDur", 0.6), gPoly([pts], true), fillP(shpC), null, 0));
                    }
                    else if (type === 34) {
                        bK = bH0 * 0.5;
                        L = TB.cx - (bW0 + 2 * bK) / 2;
                        R = TB.cx + (bW0 + 2 * bK) / 2;
                        Tp = TB.cy - bH0 / 2;
                        B = TB.cy + bH0 / 2;
                        pts = [[L + bK, Tp], [R - bK, Tp], [R, TB.cy], [R - bK, B], [L + bK, B], [L, TB.cy]];
                        sp.push(mk(bboxOf(pts), "c", sa, tt, num("shpDur", 0.6), gPoly([pts], true), fillP(shpC), null, 0));
                    }
                    else {
                        bK = Math.min(bW0, bH0) * 0.3;
                        L = TB.cx - (bW0 + bK) / 2;
                        R = TB.cx + (bW0 + bK) / 2;
                        Tp = TB.cy - (bH0 + bK) / 2;
                        B = TB.cy + (bH0 + bK) / 2;
                        pts = [[L + bK, Tp], [R - bK, Tp], [R, Tp + bK], [R, B - bK], [R - bK, B], [L + bK, B], [L, B - bK], [L, Tp + bK]];
                        sp.push(mk(bboxOf(pts), "c", sa, tt, num("shpDur", 0.6), gPoly([pts], true), fillP(shpC), null, 0));
                    }
                }
                else if (type === 25) {
                    bb = { cx: TB.cx, cy: TB.cy, w: TB.w + 2 * EXT + TB.h * 0.6, h: TB.h + 2 * EXT + TB.h * 0.2 };
                    sp.push(mk(bb, "l", sa, tt, num("shpDur", 0.6), gRect(bb, bb.h / 2), fillP(shpC), null, 0));
                }
                else if (type === 26) {
                    bb = { cx: TB.cx, cy: TB.cy, w: TB.w + 2 * EXT + TB.h * 1.2, h: (TB.h + 2 * EXT) * 1.5 };
                    sp.push(mk(bb, "c", sa, tt, num("shpDur", 0.6), gOval(bb), fillP(shpC), null, 0));
                }
                else {
                    bb = { cx: TB.cx, cy: TB.cy, w: TB.w + 2 * EXT + TB.h * 0.3, h: TB.h + 2 * EXT };
                    sk = bb.h * 0.3;
                    L = bb.cx - bb.w / 2;
                    R = L + bb.w;
                    Tp = bb.cy - bb.h / 2;
                    B = Tp + bb.h;
                    sp.push(mk(bb, "l", sa, tt, num("shpDur", 0.6), gPoly([[[L + sk, Tp], [R, Tp], [R - sk, B], [L, B]]], true), fillP(shpC), null, 0));
                }
            }
            if ($("optShpTb").checked) {
                curShape = false;
                var tbA = $("shpTbOrA").checked, tbV = $("shpTbOrV").checked && !tbA, tbIx = Math.min(22, Math.max(0, parseInt($("shpTbAnim").value, 10) || 0)), tbM = SL_MODES[tbIx].slice(0);
                var tbw = Math.max(0, num("shpTbW", 4)), tbwB = Math.max(0, num("shpTbWB", 4)), tbwC = Math.max(0, num("shpTbWC", 4)), tbwD = Math.max(0, num("shpTbWD", 4));
                var tbD = Math.max(0.1, num("shpTbDur", 0.6)), tbG = num("shpTbGap", 0), tbSep = $("shpTbSep").checked, ttb = sT0 + 0.1 + Math.max(0, num("shpTbDelay", 0));
                var swE = function (e) { return e === "l" ? "t" : (e === "r" ? "b" : e); };
                var tbMV = (tbIx === 9) ? [2, "t", 4, "t"] : ((tbIx === 10) ? [4, "t", 2, "t"] : [tbM[0], swE(tbM[1]), tbM[2], swE(tbM[3])]);
                var tbHs = Math.max(0.1, num("shpTbHs", 100) / 100), tbVs = Math.max(0.1, num("shpTbVs", 100) / 100);
                var tbLine = function (v, off, thk, colId, an, eg) {
                    var b1, b2, L2 = v ? (TB.h + 2 * EXT) * tbVs : (TB.w + 2 * EXT) * tbHs;
                    if (an === "ci") {
                        b1 = v ? { cx: off, cy: TB.cy - L2 / 4, w: thk, h: L2 / 2 } : { cx: TB.cx - L2 / 4, cy: off, w: L2 / 2, h: thk };
                        b2 = v ? { cx: off, cy: TB.cy + L2 / 4, w: thk, h: L2 / 2 } : { cx: TB.cx + L2 / 4, cy: off, w: L2 / 2, h: thk };
                        sp.push(mk(b1, v ? "t" : "l", 0, ttb, tbD, gRect(b1, 0), fillP(colId), null, 0));
                        sp.push(mk(b2, v ? "b" : "r", 0, ttb, tbD, gRect(b2, 0), fillP(colId), null, 0));
                    }
                    else {
                        b1 = v ? { cx: off, cy: TB.cy, w: thk, h: L2 } : { cx: TB.cx, cy: off, w: L2, h: thk };
                        sp.push(mk(b1, eg, an, ttb, tbD, gRect(b1, 0), fillP(colId), null, 0));
                    }
                };
                var tbTop = TB.t - EXT - (tbw * 1.2 + tbG) - tbw / 2, tbBot = TB.t + TB.h + EXT + (tbwB * 1.2 + tbG) + tbwB / 2;
                if (tbA) {
                    if (tbw > 0) {
                        tbLine(false, tbTop, tbw, "cShpTb", tbM[0], tbM[1]);
                    }
                    if (tbwB > 0) {
                        tbLine(false, tbBot, tbwB, tbSep ? "cShpTbB" : "cShpTb", tbM[2], tbM[3]);
                    }
                    if (tbwC > 0) {
                        tbLine(true, TB.l - EXT - (tbwC * 1.2 + tbG) - tbwC / 2, tbwC, tbSep ? "cShpTbC" : "cShpTb", tbMV[0], tbMV[1]);
                    }
                    if (tbwD > 0) {
                        tbLine(true, TB.l + TB.w + EXT + (tbwD * 1.2 + tbG) + tbwD / 2, tbwD, tbSep ? "cShpTbD" : "cShpTb", tbMV[2], tbMV[3]);
                    }
                }
                else if (tbV) {
                    if (tbw > 0) {
                        tbLine(true, TB.l - EXT - (tbw * 1.2 + tbG) - tbw / 2, tbw, "cShpTb", tbMV[0], tbMV[1]);
                    }
                    if (tbwB > 0) {
                        tbLine(true, TB.l + TB.w + EXT + (tbwB * 1.2 + tbG) + tbwB / 2, tbwB, tbSep ? "cShpTbB" : "cShpTb", tbMV[2], tbMV[3]);
                    }
                }
                else {
                    if (tbw > 0) {
                        tbLine(false, tbTop, tbw, "cShpTb", tbM[0], tbM[1]);
                    }
                    if (tbwB > 0) {
                        tbLine(false, tbBot, tbwB, tbSep ? "cShpTbB" : "cShpTb", tbM[2], tbM[3]);
                    }
                }
            }
            curShape = false;
            if ($("optLine").checked) {
                var lAn = parseInt($("lineAnim").value, 10) || 0, lEg = "c", lSk = Math.min(45, Math.max(-45, num("lineSkew", 0))), lrad = Math.max(0, num("lineRad", 0));
                if (lAn > 6) {
                    lEg = ["c", "c", "l", "t", "c", "c", "c"][lAn - 7];
                    lAn = [7, 8, 9, 9, 10, 13, 14][lAn - 7];
                }
                bb = { cx: TB.cx, cy: TB.cy, w: TB.w + 2 * (lpad + tpad), h: TB.h + 2 * (lpad + tpad) };
                if (lSk) {
                    pm = slope(lSk);
                    pH = bb.h;
                    pX = Math.abs(pm) * pH / 2;
                    pts = slant(bb.cx - bb.w / 2 - pX, bb.cy - pH / 2, bb.cx + bb.w / 2 + pX, bb.cy + pH / 2, bb.cy, pm);
                    ln = mk(bboxOf(pts), lEg, lAn, sT0 + 0.2, num("lineDur", 0.8), gPoly([pts], true), null, "cLine", lw);
                }
                else {
                    ln = mk(bb, lEg, lAn, sT0 + 0.2, num("lineDur", 0.8), gRect(bb, lrad), null, "cLine", lw);
                }
            }
            for (pc = 0; pc < echo.length; pc++) {
                out.push(echo[pc]);
            }
            if (bx) {
                out.push(bx);
            }
            for (pc = 0; pc < sp.length; pc++) {
                out.push(sp[pc]);
            }
            if (ln) {
                out.push(ln);
            }
            T.delay = delay;
            T.dur = dur;
            T.hold = hold;
            T.size = Math.max(1, num("size", 60));
            return out;
        }
        function drawPiece(c, pc, t, T) {
            var p = sease((t - pc.t0) / pc.d), a = 1, sx = 1, sy = 1, ox = 0, oy = 0, rotA = 0, eg, ax = pc.bb.cx, ay = pc.bb.cy, L, shr, s0, s1, an = pc.anim, off, X = pc.xf, hv, k2;
            var xsx = 1, xsy = 1, xox = 0, xoy = 0, xrot = 0, fxS = 1, fxY = 0, fxA = 1, u, ph, fxX = 0, fxR = 0, fxSx = 1, fxSy = 1, q2;
            if (pc.prog) {
                p = 1;
            }
            if (T.endOn && T.oD > 0) {
                p = Math.min(p, 1 - sease((t - T.oS) / T.oD));
            }
            if (T.fade > 0) {
                a = 1 - clamp01((t - T.oS) / T.oD);
            }
            if (p <= 0.001 || a <= 0.001) {
                return;
            }
            off = Math.max(T.size * 1.5, 60);
            eg = (an === 0 || an === 12) ? pc.edge : "c";
            if (eg === "l") {
                ax = pc.bb.cx - pc.bb.w / 2;
            }
            else if (eg === "r") {
                ax = pc.bb.cx + pc.bb.w / 2;
            }
            else if (eg === "t") {
                ay = pc.bb.cy - pc.bb.h / 2;
            }
            else if (eg === "b") {
                ay = pc.bb.cy + pc.bb.h / 2;
            }
            if (an === 0) {
                if (!pc.trim) {
                    sx = (eg === "t" || eg === "b") ? 1 : p;
                    sy = (eg === "l" || eg === "r") ? 1 : p;
                }
            }
            else if (an === 1) {
                sx = sy = p;
            }
            else if (an === 2) {
                ox = -(1 - p) * off;
                a *= p;
            }
            else if (an === 4) {
                ox = (1 - p) * off;
                a *= p;
            }
            else if (an === 5) {
                oy = -(1 - p) * off;
                a *= p;
            }
            else if (an === 6) {
                oy = (1 - p) * off;
                a *= p;
            }
            else if (an === 7) {
                sx = sy = (p < 0.6) ? (p / 0.6) * 1.12 : 1.12 - 0.12 * ((p - 0.6) / 0.4);
            }
            else if (an === 8) {
                sx = sy = p;
                rotA = -(1 - p) * 120;
            }
            else if (an === 9) {
                if (pc.edge === "l" || pc.edge === "r") {
                    sx = p;
                }
                else if (pc.edge === "t" || pc.edge === "b") {
                    sy = p;
                }
                else {
                    sx = sy = p;
                }
            }
            else if (an === 10) {
                oy = (1 - p) * off * 0.4;
                a *= p;
            }
            else if (an === 12) {
                q2 = Math.floor(p * 6) / 6;
                if (eg === "l" || eg === "r") {
                    sx = q2;
                }
                else {
                    sy = q2;
                }
            }
            else if (an === 13) {
                if (!(Math.floor(p * 5) % 2 === 1 || p >= 1)) {
                    a = 0;
                }
            }
            else if (an === 14) {
                sx = sy = 2.5 - 1.5 * p;
                a *= p;
            }
            else if (an === 15) {
                rotA = (1 - p) * 45;
                a *= p;
            }
            else {
                a *= p;
            }
            if (pc.shrink && T.playing) {
                s0 = Math.max(pc.t0 + pc.d, T.delay + T.dur);
                s1 = Math.max(s0 + 0.1, T.oS);
                shr = 1 - clamp01((t - s0) / (s1 - s0));
                sx *= shr;
                if (sx <= 0.001) {
                    return;
                }
            }
            if (pc.prog) {
                u = clamp01(t / Math.max(0.1, T.total || 1));
                sx *= (pc.prog === 1) ? u : 1 - u;
                if (sx <= 0.001) {
                    return;
                }
            }
            if (X) {
                hv = pc.edge;
                k2 = X.len;
                if (k2 !== 1) {
                    if (hv === "l" || hv === "r") {
                        xsx = k2;
                    }
                    else if (hv === "t" || hv === "b") {
                        xsy = k2;
                    }
                    else {
                        xsx = k2;
                        xsy = k2;
                    }
                }
                xox = X.ox;
                xoy = X.oy;
                xrot = X.rot;
                fxA = X.op;
                if (T.playing && X.fx) {
                    u = Math.max(0, t - X.t0);
                    ph = u * 2 * Math.PI / X.fxSp;
                    if (X.fx === 1) {
                        fxS = 1 + 0.06 * Math.sin(ph);
                    }
                    else if (X.fx === 2) {
                        fxY = -X.amp * Math.sin(ph);
                    }
                    else if (X.fx === 3) {
                        fxA *= 0.6 + 0.4 * Math.cos(ph);
                    }
                    else if (X.fx === 4) {
                        fxX = X.amp * Math.sin(ph);
                    }
                    else if (X.fx === 5) {
                        fxR = 6 * Math.sin(ph);
                    }
                    else if (X.fx === 6) {
                        fxR = ph * 180 / Math.PI;
                    }
                    else if (X.fx === 7) {
                        q2 = (ph / (2 * Math.PI)) % 1;
                        fxS = 1 + 0.09 * (Math.exp(-Math.pow((q2 - 0.15) / 0.05, 2)) + Math.exp(-Math.pow((q2 - 0.35) / 0.05, 2)));
                    }
                    else if (X.fx === 8) {
                        fxA *= 0.35 + 0.65 * (0.5 + 0.5 * Math.cos(ph));
                    }
                    else if (X.fx === 9) {
                        if (hv === "t" || hv === "b") {
                            fxSy = 1 + 0.12 * Math.sin(ph);
                        }
                        else {
                            fxSx = 1 + 0.12 * Math.sin(ph);
                        }
                    }
                    else if (X.fx === 10) {
                        fxR = 5 * Math.sin(ph);
                        fxS = 1 + 0.04 * Math.sin(2 * ph);
                    }
                }
            }
            c.save();
            c.globalAlpha = a * fxA;
            c.translate(ax + ox, ay + oy);
            if (rotA) {
                c.rotate(rotA * Math.PI / 180);
            }
            c.scale(Math.max(0.0001, sx), Math.max(0.0001, sy));
            c.translate(-ax, -ay);
            if (X) {
                c.translate(pc.bb.cx + xox + fxX, pc.bb.cy + xoy + fxY);
                c.rotate((xrot + fxR) * Math.PI / 180);
                if (X.skew) {
                    c.transform(1, 0, Math.tan(X.skew * Math.PI / 180), 1, 0, 0);
                }
                c.scale(Math.max(0.0001, xsx * fxS * fxSx), Math.max(0.0001, xsy * fxS * fxSy));
                c.translate(-pc.bb.cx, -pc.bb.cy);
                if (X.shOn) {
                    c.shadowColor = rgbaOf("cShpSh", 0.7);
                    c.shadowBlur = X.shSoft * T.sc;
                    c.shadowOffsetX = X.shDist * 0.7071 * T.sc;
                    c.shadowOffsetY = X.shDist * 0.7071 * T.sc;
                }
            }
            trace(c, pc.g);
            if (pc.fill) {
                c.fillStyle = rgbaOf(pc.fill[0], pc.fill[1]);
                c.fill();
            }
            if (X && X.lnOn && pc.fill && !pc.stroke) {
                c.strokeStyle = rgbaOf("cShpLn", 1);
                c.lineWidth = X.lnW;
                c.lineJoin = "miter";
                c.stroke();
            }
            if (pc.stroke) {
                c.strokeStyle = rgbaOf(pc.stroke, 1);
                c.lineWidth = pc.sw;
                c.lineJoin = "miter";
                if (an === 0 && c.setLineDash) {
                    L = pathLen(pc.g);
                    c.setLineDash([Math.max(0.01, L * p), L * 3]);
                }
                c.stroke();
            }
            c.restore();
        }
        function sceneTitle(cw, ch, s) {
            var raw = $("text").value, lines, size = s.size, trk = s.tracking, B, pa, k, al = alignOf(), margin = Math.round(cw * 0.05), x, y, E, TB, T = {};
            var delay = s.delay, dur = s.dur, hold = s.hold, endOn = !!s.endOn, endDur, fadeDur, fadeOn, fps = (s.fps > 0) ? s.fps : 30, compDur, tot, kk, tail, pieces = [], i, full;
            var outS = 0, outD = 0, fadeS = 0, fd = 0, DM, xs, strK, ANS, U, shapesOn = (s.box.on || s.line.on || s.shp.on || (s.shp.tb && s.shp.tb.on)), lineIdx, safeOn = !!s.safe, wipeOn = (s.preset === 46);
            if (raw.replace(/\s+/g, "") === "") {
                raw = "Your Text Here";
            }
            lines = raw.split(/\r\n|\n|\r/);
            pa = { l: 0, t: 0, r: cw, b: ch, w: cw, h: ch };
            if (safeOn) {
                var sl = 0, st2 = 0, sr = cw, sb = ch;
                if (s.safeCustom) {
                    sl = Math.max(0, s.safeL || 0);
                    st2 = Math.max(0, s.safeT || 0);
                    sr = cw - Math.max(0, s.safeR || 0);
                    sb = ch - Math.max(0, s.safeB || 0);
                }
                if (sr - sl < 10 || sb - st2 < 10) {
                    sl = 0;
                    st2 = 0;
                    sr = cw;
                    sb = ch;
                }
                pa = { l: sl, t: st2, r: sr, b: sb, w: sr - sl, h: sb - st2 };
            }
            B = measureBlock(lines, size, trk, fontFor(size), s.lineSp);
            if (safeOn) {
                k = 1;
                if (s.safeW === 0 && B.w > pa.w) {
                    k = Math.min(k, pa.w / B.w);
                }
                if (s.safeH === 0 && B.h > pa.h) {
                    k = Math.min(k, pa.h / B.h);
                }
                if (k < 1) {
                    size = Math.max(4, size * k);
                    B = measureBlock(lines, size, trk, fontFor(size), s.lineSp);
                }
            }
            if (s.pos.on) {
                x = pa.l + (pa.w - B.w) * s.pos.x / 100;
                y = pa.t + (pa.h - B.h) * s.pos.y / 100;
            }
            else {
                var cu = safeOn && s.safeCustom;
                E = { l: cu ? pa.l : margin, r: cu ? pa.r : cw - margin, cy: cu ? (pa.t + pa.b) / 2 : ch / 2 };
                x = (al === 0) ? E.l : (al === 2) ? (E.r - B.w) : ((E.l + E.r) / 2 - B.w / 2);
                y = E.cy - B.h / 2;
            }
            TB = { l: x, t: y, w: B.w, h: B.h, cx: x + B.w / 2, cy: y + B.h / 2, size: size, lines: lines, font: B.font, al: al, trk: trk };
            endDur = endOn ? ((s.endDur > 0) ? s.endDur : 1.2) : 0;
            fadeDur = (!endOn && s.fadeDur > 0) ? s.fadeDur : 0;
            fadeOn = fadeDur > 0;
            if (s.compDur > 0) {
                compDur = Math.max(s.compDur, 1 / fps);
                tot = delay + dur + hold + (fadeOn ? fadeDur : 0) + endDur;
                if (tot > 0) {
                    kk = compDur / tot;
                    delay *= kk;
                    dur *= kk;
                    hold *= kk;
                    fadeDur *= kk;
                    endDur *= kk;
                }
            }
            else {
                tail = fadeOn ? Math.max(0.5, fadeDur) : (endOn ? endDur : 0.5);
                compDur = Math.max(0.5, delay + dur + hold + tail);
            }
            if (endOn) {
                outD = Math.min(endDur, compDur);
                outS = delay + dur + hold;
                if (outS + outD > compDur) {
                    outS = Math.max(0, compDur - outD);
                }
            }
            if (fadeOn) {
                fd = Math.min(fadeDur, compDur);
                fadeS = delay + dur + hold;
                if (fadeS + fd > compDur) {
                    fadeS = Math.max(0, compDur - fd);
                }
            }
            DM = DIRMAP[s.dir] || DIRMAP[0];
            xs = DM.r ? -1 : 1;
            strK = (s.strength === 0) ? 0.6 : ((s.strength === 2) ? 1.6 : 1);
            ANS = wipeOn ? [] : animSpecs(s.preset, size, xs, strK);
            U = unitsOf(B);
            SIP = INTERP[Math.max(0, Math.min(INTERP.length - 1, s.shpInterp))] || INTERP[0];
            T.total = compDur;
            T.delay = delay;
            T.dur = dur;
            T.hold = hold;
            T.IP = INTERP[Math.max(0, Math.min(INTERP.length - 1, s.interp))] || INTERP[0];
            T.dm = DM;
            T.dirR = !!DM.r;
            T.endOn = endOn;
            T.endRev = !!s.endReverse;
            T.outS = outS;
            T.outD = outD;
            if (shapesOn) {
                try {
                    pieces = build(TB, T);
                }
                catch (eB) {
                    pieces = [];
                }
            }
            T.size = size;
            T.endOn = endOn;
            T.oS = endOn ? outS : fadeS;
            T.oD = endOn ? outD : fd;
            T.fade = fadeOn ? fd : 0;
            full = delay + dur;
            for (i = 0; i < pieces.length; i++) {
                full = Math.max(full, pieces[i].t0 + pieces[i].d);
            }
            lineIdx = $("optLine").checked ? pieces.length - 1 : pieces.length;
            return {
                total: compDur, idle: Math.min(full, compDur), mode: 0, tag: "",
                draw: function (c, W, H, sc, t, scrub) {
                    var n, lay, op, st, o, T0, off, c2, F, u, amt, grd;
                    T.sc = sc;
                    T.playing = scrub;
                    c.save();
                    c.scale(sc, sc);
                    if (s.bg) {
                        c.fillStyle = rgbaArr(s.bgRGB, 1);
                        c.fillRect(0, 0, cw, ch);
                    }
                    for (n = 0; n < lineIdx; n++) {
                        drawPiece(c, pieces[n], t, T);
                    }
                    op = fadeOn ? (1 - curve(T.IP, (t - fadeS) / fd)) : 1;
                    lay = { dx: 0, dy: 0, sx: 1, sy: 1, rot: 0, op: 1, glow: 0 };
                    if (s.animate && s.animate.on) {
                        T0 = delay + dur;
                        lay = animateFx(s.animate.fx, Math.max(0.2, s.animate.sp), s.animate.amt, Math.max(10, size), Math.max(0, t - T0), t);
                    }
                    st = evalStates(U, ANS, t, T);
                    o = textOpts(s, sc, B);
                    o.alpha = op * lay.op;
                    o.glow = lay.glow;
                    if (o.alpha > 0.003) {
                        c2 = c;
                        if (wipeOn) {
                            if (!wipeCv) {
                                wipeCv = document.createElement("canvas");
                            }
                            wipeCv.width = W;
                            wipeCv.height = H;
                            c2 = wipeCv.getContext("2d");
                            c2.clearRect(0, 0, W, H);
                            c2.save();
                            c2.scale(sc, sc);
                        }
                        c2.save();
                        c2.translate(TB.cx + lay.dx, TB.cy + lay.dy);
                        if (lay.rot) {
                            c2.rotate(lay.rot * Math.PI / 180);
                        }
                        c2.scale(lay.sx === 0 ? 0.0001 : lay.sx, lay.sy === 0 ? 0.0001 : lay.sy);
                        c2.translate(-TB.cx, -TB.cy);
                        drawBlock(c2, B, TB.l, TB.t, al, st, o);
                        c2.restore();
                        if (wipeOn) {
                            c2.restore();
                            F = Math.max(1, size * 0.25 * strK);
                            if (endOn && t >= outS - 0.0001) {
                                amt = (outD > 0) ? clamp01((t - outS) / outD) : 1;
                            }
                            else {
                                amt = 1 - curve(T.IP, dur > 0 ? (t - delay) / dur : (t >= delay ? 1 : 0));
                            }
                            u = [cw, cw, ch, ch][s.wipe] || cw;
                            off = -F + (1 - amt) * (u + 2 * F);
                            c2.save();
                            c2.globalCompositeOperation = "destination-in";
                            if (s.wipe === 0) {
                                grd = c2.createLinearGradient((off - F) * sc, 0, off * sc, 0);
                            }
                            else if (s.wipe === 1) {
                                grd = c2.createLinearGradient((cw - off + F) * sc, 0, (cw - off) * sc, 0);
                            }
                            else if (s.wipe === 2) {
                                grd = c2.createLinearGradient(0, (off - F) * sc, 0, off * sc);
                            }
                            else {
                                grd = c2.createLinearGradient(0, (ch - off + F) * sc, 0, (ch - off) * sc);
                            }
                            grd.addColorStop(0, "rgba(0,0,0,1)");
                            grd.addColorStop(1, "rgba(0,0,0,0)");
                            c2.fillStyle = grd;
                            c2.fillRect(0, 0, W, H);
                            c2.restore();
                            c.save();
                            c.setTransform(1, 0, 0, 1, 0, 0);
                            c.drawImage(wipeCv, 0, 0);
                            c.restore();
                        }
                    }
                    for (n = lineIdx; n < pieces.length; n++) {
                        drawPiece(c, pieces[n], t, T);
                    }
                    if (safeOn) {
                        c.save();
                        c.strokeStyle = "rgba(120,200,255,.55)";
                        c.lineWidth = 1 / sc;
                        if (c.setLineDash) {
                            c.setLineDash([6 / sc, 4 / sc]);
                        }
                        c.strokeRect(pa.l + 0.5 / sc, pa.t + 0.5 / sc, pa.w - 1 / sc, pa.h - 1 / sc);
                        c.restore();
                    }
                    c.restore();
                }
            };
        }
        function flickK(p) { return p < 0.1 ? 0 : (p < 0.2 ? 1 : (p < 0.3 ? 0 : (p < 0.45 ? 1 : (p < 0.6 ? 0.2 : 1)))); }
        function elasticK(p) { return p < 0.55 ? (p / 0.55) * 1.08 : (p < 0.8 ? 1.08 - 0.11 * ((p - 0.55) / 0.25) : 0.97 + 0.03 * ((p - 0.8) / 0.2)); }
        function overshootX(p, off) { return p < 0.7 ? -off + off * 1.06 * (p / 0.7) : off * 0.06 * (1 - (p - 0.7) / 0.3); }
        function blinkK(p) { return (Math.floor(p * 5) % 2 === 1 || p >= 1) ? 1 : 0; }
        function wipeBar(c, x, y, w, h, anim, p, col, alpha) {
            var a = alpha, cx = x + w / 2, cy = y + h / 2, q;
            if (p <= 0.001) {
                return;
            }
            if (anim === 3 || (anim >= 6 && anim <= 9) || anim === 16 || anim === 17 || anim === 19 || anim === 21) {
                a = alpha * p;
            }
            else if (anim === 12) {
                a = alpha * blinkK(p);
            }
            else if (anim === 13) {
                a = alpha * flickK(p);
            }
            c.globalAlpha = a;
            c.fillStyle = col;
            if (anim === 0) {
                c.fillRect(x, y, w * p, h);
            }
            else if (anim === 1) {
                c.fillRect(x + w * (1 - p), y, w * p, h);
            }
            else if (anim === 2) {
                c.fillRect(x, y + h * (1 - p), w, h * p);
            }
            else if (anim === 4) {
                c.fillRect(x, y, w, h * p);
            }
            else if (anim === 5) {
                c.fillRect(x + w * (1 - p) / 2, y, w * p, h);
            }
            else if (anim === 6) {
                c.fillRect(x - tkOff * (1 - p), y, w, h);
            }
            else if (anim === 7) {
                c.fillRect(x + tkOff * (1 - p), y, w, h);
            }
            else if (anim === 8) {
                c.fillRect(x, y + tkOff * (1 - p), w, h);
            }
            else if (anim === 9) {
                c.fillRect(x, y - tkOff * (1 - p), w, h);
            }
            else if (anim === 10) {
                c.fillRect(x, y + h * (1 - p) / 2, w, h * p);
            }
            else if (anim === 11) {
                c.fillRect(x, y, w * Math.floor(p * 6) / 6, h);
            }
            else if (anim === 14 || anim === 15 || anim === 16 || anim === 17 || anim === 20) {
                q = (anim === 14 || anim === 20) ? p : (anim === 15 ? (p < 0.6 ? (p / 0.6) * 1.12 : 1.12 - 0.12 * ((p - 0.6) / 0.4)) : (anim === 16 ? 2.5 - 1.5 * p : 1));
                c.save();
                c.translate(cx, cy);
                if (anim === 17) {
                    c.rotate((1 - p) * 45 * Math.PI / 180);
                }
                else if (anim === 20) {
                    c.rotate(-(1 - p) * 120 * Math.PI / 180);
                }
                c.scale(q, q);
                c.fillRect(-w / 2, -h / 2, w, h);
                c.restore();
            }
            else if (anim === 18) {
                c.fillRect(x, y, w * elasticK(p), h);
            }
            else if (anim === 19) {
                c.fillRect(x + overshootX(p, tkOff), y, w, h);
            }
            else if (anim === 21) {
                c.fillRect(x, y + tkOff * 0.4 * (1 - p), w, h);
            }
            else {
                c.fillRect(x, y, w, h);
            }
            c.globalAlpha = 1;
        }
        var LN_FX = [["wl", "wl"], ["wr", "wr"], ["wl", "wr"], ["wr", "wl"], ["ex", "ex"], ["ci", "ci"], ["sl", "sl"], ["sr", "sr"], ["sl", "sr"], ["sd", "su"], ["su", "sd"], ["zi", "zi"], ["bp", "bp"], ["st", "st"], ["fl", "fl"], ["fd", "fd"], ["sd", "sd"], ["su", "su"]];
        function lineFx(c, x, y, w, h, k, p, col) {
            var q, idx;
            if (p <= 0.001) {
                return;
            }
            c.fillStyle = col;
            c.globalAlpha = 1;
            if (k === "wl") {
                c.fillRect(x, y, w * p, h);
            }
            else if (k === "wr") {
                c.fillRect(x + w * (1 - p), y, w * p, h);
            }
            else if (k === "ex") {
                c.fillRect(x + w * (1 - p) / 2, y, w * p, h);
            }
            else if (k === "ci") {
                c.fillRect(x, y, w * p / 2, h);
                c.fillRect(x + w - w * p / 2, y, w * p / 2, h);
            }
            else if (k === "sl") {
                c.globalAlpha = p;
                c.fillRect(x - tkOff * (1 - p), y, w, h);
            }
            else if (k === "sr") {
                c.globalAlpha = p;
                c.fillRect(x + tkOff * (1 - p), y, w, h);
            }
            else if (k === "sd") {
                c.globalAlpha = p;
                c.fillRect(x, y - tkOff * (1 - p), w, h);
            }
            else if (k === "su") {
                c.globalAlpha = p;
                c.fillRect(x, y + tkOff * (1 - p), w, h);
            }
            else if (k === "zi" || k === "bp") {
                q = (k === "zi") ? p : (p < 0.6 ? (p / 0.6) * 1.12 : 1.12 - 0.12 * ((p - 0.6) / 0.4));
                c.save();
                c.translate(x + w / 2, y + h / 2);
                c.scale(q, q);
                c.fillRect(-w / 2, -h / 2, w, h);
                c.restore();
            }
            else if (k === "st") {
                c.fillRect(x, y, w * Math.floor(p * 6) / 6, h);
            }
            else if (k === "fl") {
                idx = Math.floor(p * 5);
                if (idx % 2 === 1 || p >= 1) {
                    c.fillRect(x, y, w, h);
                }
            }
            else {
                c.globalAlpha = p;
                c.fillRect(x, y, w, h);
            }
            c.globalAlpha = 1;
        }
        function sceneRoll(cw, ch, s) {
            var mode = s.roll.mode, crawl = (mode === 3 || mode === 4), vert = (mode <= 2), size = s.size, trk = s.tracking, lines, B, al = alignOf(), margin = Math.round(cw * 0.05), x, y, M = {}, go, cd;
            if (crawl) {
                lines = crawlRows($("text").value, Math.floor(num("crawlLines", 1)) || 1);
            }
            else {
                lines = ($("text").value.replace(/\s+/g, "") === "" ? "Your Text Here" : $("text").value).split(/\r\n|\n|\r/);
            }
            B = measureBlock(lines, size, trk, fontFor(size), s.lineSp);
            if (s.pos.on) {
                x = (cw - B.w) * s.pos.x / 100;
                y = (ch - B.h) * s.pos.y / 100;
            }
            else {
                x = (al === 0) ? margin : (al === 2) ? (cw - margin - B.w) : (cw - B.w) / 2;
                y = (ch - B.h) / 2;
            }
            M.delay = Math.max(0, s.delay);
            M.t0 = M.delay + Math.max(0, s.roll.gapIn);
            go = Math.max(0, s.roll.gapOut);
            M.travel = (vert ? (ch + B.h) : (cw + B.w)) / Math.max(10, s.roll.speed);
            cd = s.compDur;
            if (cd > 0) {
                M.travel = Math.max(0.2, cd - M.t0 - go);
            }
            M.total = M.t0 + M.travel + go;
            return {
                total: M.total, idle: M.t0 + M.travel * 0.35, mode: mode, tag: "",
                draw: function (c, W, H, sc, t, scrub) {
                    var u = clamp01((t - M.t0) / M.travel), left = x, top = y - (crawl ? (s.roll.txY || 0) : 0), barOn = crawl && s.roll.bar.on, lblOn = crawl && s.roll.label.on, tkT0 = Math.max(0, M.delay - 0.3), bh, by, o, lbl;
                    var lpx, lrot, lty, ltx, lfont, LB, lo, lleft, ltop, lod, lT2, lst, lay2, lnA, lext, lan, ldx, ldy, lsx, lsy, lal, lclip, lcx, lsz, padX, slk, blkW, lT, lB, lp, lum, lc, la, mbN, mbK, mbWin, mbU, mbTop, mbLeft;
                    if (mode === 1) {
                        top = lerp(ch, -B.h, u);
                    }
                    else if (mode === 2) {
                        top = lerp(-B.h, ch, u);
                    }
                    else if (mode === 3) {
                        left = lerp(cw, -B.w, u);
                    }
                    else {
                        left = lerp(-B.w, cw, u);
                    }
                    c.save();
                    c.scale(sc, sc);
                    if (s.bg) {
                        c.fillStyle = rgbaArr(s.bgRGB, 1);
                        c.fillRect(0, 0, cw, ch);
                    }
                    bh = Math.max(20, s.roll.bar.h);
                    bh = Math.max(bh, B.h + 8);
                    tkOff = Math.max(size * 1.5, 60);
                    by = y + B.h / 2;
                    if (barOn) {
                        wipeBar(c, 0, by - bh / 2, cw, bh, s.roll.bar.anim, ease((t - tkT0) / 0.6), rgbaArr(s.roll.bar.rgb, 1), Math.min(100, Math.max(0, s.roll.bar.op)) / 100);
                        lnA = LN_FX[Math.min(17, Math.max(0, s.roll.bar.lineAnim || 0))];
                        if (s.roll.bar.lw > 0) {
                            lineFx(c, 0, by - bh / 2, cw, s.roll.bar.lw, lnA[0], ease((t - tkT0 - 0.15) / 0.6), rgbaArr(s.roll.bar.lineRGB, 1));
                        }
                        if (s.roll.bar.lwB > 0) {
                            lineFx(c, 0, by + bh / 2 - s.roll.bar.lwB, cw, s.roll.bar.lwB, lnA[1], ease((t - tkT0 - 0.15) / 0.6), rgbaArr((s.roll.bar.lineSep ? s.roll.bar.lineBRGB : s.roll.bar.lineRGB), 1));
                        }
                    }
                    o = textOpts(s, sc, B);
                    o.parts = null;
                    if (s.mblur && s.mblurText !== false && u > 0 && u < 1) {
                        mbN = 7;
                        mbWin = 1 / Math.max(1, s.fps || 30);
                        for (mbK = 0; mbK < mbN; mbK++) {
                            mbU = clamp01((t - mbWin / 2 + mbWin * mbK / (mbN - 1) - M.t0) / M.travel);
                            if (mode === 1) {
                                mbTop = lerp(ch, -B.h, mbU);
                                mbLeft = left;
                            }
                            else if (mode === 2) {
                                mbTop = lerp(-B.h, ch, mbU);
                                mbLeft = left;
                            }
                            else if (mode === 3) {
                                mbLeft = lerp(cw, -B.w, mbU);
                                mbTop = top;
                            }
                            else {
                                mbLeft = lerp(-B.w, cw, mbU);
                                mbTop = top;
                            }
                            o.alpha = 1 / (mbK + 1);
                            drawBlock(c, B, mbLeft, mbTop, al, null, o);
                        }
                    }
                    else {
                        drawBlock(c, B, left, top, al, null, o);
                    }
                    if (lblOn) {
                        lext = Math.max(0, s.roll.label.ext);
                        lan = s.roll.label.anim;
                        ldx = 0;
                        ldy = 0;
                        lsx = 1;
                        lsy = 1;
                        lal = 1;
                        lclip = 0;
                        lbl = decodeURIComponent(s.roll.label.textEnc) || "LIVE";
                        lsz = s.roll.label.size > 0 ? Math.max(8, Math.round(s.roll.label.size)) : Math.max(12, Math.round(size * 0.7));
                        padX = lsz * 0.7;
                        slk = bh * 0.22;
                        c.font = "bold " + lsz + "px " + window.getComputedStyle($("text")).fontFamily;
                        c.textAlign = "left";
                        blkW = c.measureText(lbl).width + 2 * padX + slk + lext;
                        lT = by - bh / 2;
                        lB = by + bh / 2;
                        lcx = blkW / 2;
                        lp = ease((t - tkT0 - 0.2) / 0.5);
                        lpx = lcx;
                        lrot = 0;
                        if (lp > 0.001) {
                            lclip = (lan === 0) ? blkW * lp : blkW + 2;
                            if (lan === 1) {
                                ldx = -(1 - lp) * tkOff;
                                lal = lp;
                            }
                            else if (lan === 2) {
                                ldy = (1 - lp) * tkOff;
                                lal = lp;
                            }
                            else if (lan === 3) {
                                lal = lp;
                            }
                            else if (lan === 6) {
                                ldx = (1 - lp) * tkOff;
                                lal = lp;
                            }
                            else if (lan === 7) {
                                ldy = -(1 - lp) * tkOff;
                                lal = lp;
                            }
                            else if (lan === 4) {
                                lsx = lsy = lp + 0.12 * Math.sin(lp * Math.PI);
                            }
                            else if (lan === 5) {
                                lsx = lp;
                            }
                            else if (lan === 8) {
                                lsx = lsy = lp;
                            }
                            else if (lan === 9) {
                                lpx = 0;
                                lsx = Math.floor(lp * 6) / 6;
                            }
                            else if (lan === 10) {
                                lal = blinkK(lp);
                            }
                            else if (lan === 11) {
                                lal = flickK(lp);
                            }
                            else if (lan === 12) {
                                lpx = 0;
                                lsx = elasticK(lp);
                            }
                            else if (lan === 13) {
                                ldx = overshootX(lp, tkOff);
                                lal = lp;
                            }
                            else if (lan === 14) {
                                lsx = lsy = 2.5 - 1.5 * lp;
                                lal = lp;
                            }
                            else if (lan === 15) {
                                lrot = (1 - lp) * 45;
                                lal = lp;
                            }
                            else if (lan === 16) {
                                lsx = lsy = lp;
                                lrot = -(1 - lp) * 120;
                            }
                            else if (lan === 17) {
                                lsy = lp;
                            }
                            c.save();
                            c.translate(lpx + ldx, by + ldy);
                            if (lrot) {
                                c.rotate(lrot * Math.PI / 180);
                            }
                            c.scale(lsx <= 0 ? 0.0001 : lsx, lsy <= 0 ? 0.0001 : lsy);
                            c.translate(-lpx, -by);
                            c.beginPath();
                            c.rect(-2, lT - 2, lclip + 2, bh + 4);
                            c.clip();
                            c.globalAlpha = lal;
                            c.fillStyle = rgbaArr(s.roll.label.rgb, 1);
                            c.beginPath();
                            c.moveTo(0, lT);
                            c.lineTo(blkW, lT);
                            c.lineTo(blkW - slk, lB);
                            c.lineTo(0, lB);
                            c.closePath();
                            c.fill();
                            c.restore();
                            c.globalAlpha = 1;
                        }
                        lum = s.roll.label.rgb;
                        lc = s.roll.label.txAuto ? ((0.299 * lum[0] + 0.587 * lum[1] + 0.114 * lum[2] > 0.6) ? [0.07, 0.07, 0.07] : [1, 1, 1]) : s.roll.label.txRGB;
                        lty = s.roll.label.txY || 0;
                        ltx = s.roll.label.tx;
                        la = clamp01((t - tkT0 - 0.45) / 0.35);
                        if (la > 0.001) {
                            if (ltx && ltx.on) {
                                lfont = "bold " + lsz + "px " + window.getComputedStyle($("text")).fontFamily;
                                LB = measureBlock([lbl], lsz, 40, lfont);
                                lo = { sc: sc, alpha: la, fill: lc, accent: s.accentRGB, ow: 0, orgb: lc, shadow: null, parts: null, glow: 0, gsize: lsz };
                                lleft = padX + lext / 2;
                                ltop = by - lty - lsz * 0.5;
                                if (ltx.mode === 1) {
                                    lod = Math.min(Math.max(0.1, ltx.dur), M.total);
                                    lT2 = { delay: tkT0 + 0.45, dur: Math.max(0.1, ltx.dur), IP: INTERP[Math.max(0, Math.min(INTERP.length - 1, s.interp))] || INTERP[0], dm: DIRMAP[0], dirR: false, endOn: true, endRev: false, outD: lod, outS: Math.max(0, M.total - lod) };
                                    lst = evalStates(unitsOf(LB), animSpecs(ltx.preset, lsz, 1, (s.strength === 0) ? 0.6 : ((s.strength === 2) ? 1.6 : 1)), t, lT2);
                                    drawBlock(c, LB, lleft, ltop, 0, lst, lo);
                                }
                                else {
                                    lay2 = animateFx(ltx.fx, ltx.sp, ltx.amt, Math.max(10, lsz), Math.max(0, t - (tkT0 + 0.9)), t);
                                    lo.alpha = la * lay2.op;
                                    lo.glow = lay2.glow;
                                    c.save();
                                    c.translate(lleft + lay2.dx, by - lty + lay2.dy);
                                    if (lay2.rot) {
                                        c.rotate(lay2.rot * Math.PI / 180);
                                    }
                                    c.scale(lay2.sx === 0 ? 0.0001 : lay2.sx, lay2.sy === 0 ? 0.0001 : lay2.sy);
                                    c.translate(-lleft, -(by - lty));
                                    drawBlock(c, LB, lleft, ltop, 0, null, lo);
                                    c.restore();
                                }
                            }
                            else {
                                c.globalAlpha = la;
                                c.fillStyle = rgbaArr(lc, 1);
                                c.textBaseline = "middle";
                                c.textAlign = "left";
                                c.fillText(lbl, padX + lext / 2, by - lty);
                                c.globalAlpha = 1;
                                c.textBaseline = "alphabetic";
                            }
                        }
                    }
                    c.restore();
                }
            };
        }
        function seekSync(P, tot, t) {
            var tl = fmt(Math.min(t, tot)), tr = fmt(tot);
            if (!seeking) {
                if (P.maxS !== tot) {
                    P.maxS = tot;
                    P.seek.max = String(tot);
                }
                P.seek.value = String(Math.min(t, tot));
            }
            if (P.tlS !== tl) {
                P.tlS = tl;
                P.tl.textContent = tl;
            }
            if (P.trS !== tr) {
                P.trS = tr;
                P.tr.textContent = tr;
            }
        }
        function fmt(sec) { var m = Math.floor(sec / 60), r = sec - m * 60; return m + ":" + (r < 10 ? "0" : "") + r.toFixed(1); }
        function sceneFor(cw, ch) {
            var hit = sceneCache, tm = now(), s;
            if (hit && hit.cw === cw && hit.ch === ch && (hit.pass === scenePass || (playing && hit.rev === sceneRev && tm - hit.at < 500))) {
                return hit;
            }
            sceneCache = null;
            try {
                s = collect();
            }
            catch (eC) {
                return { fail: 1 };
            }
            if (!s) {
                return { fail: 1 };
            }
            try {
                sceneCache = { S: (s.roll && s.roll.mode > 0) ? sceneRoll(cw, ch, s) : sceneTitle(cw, ch, s), cw: cw, ch: ch, pass: scenePass, rev: sceneRev, at: tm };
            }
            catch (eS) {
                return { fail: 2, err: eS };
            }
            return sceneCache;
        }
        function drawPanel(P) {
            var availW = P.availW, cw, ch, sc, W, H, cv = P.cv, c, hit, S, t, q = 1, RW, RH;
            if (availW < 20) {
                return false;
            }
            cw = Math.max(16, Math.round(num("compW", 1920)));
            ch = Math.max(16, Math.round(num("compH", 1080)));
            sc = Math.min(availW / cw, (P.fs ? Math.max(40, P.availH) : 150) / ch);
            W = Math.max(8, Math.round(cw * sc));
            H = Math.max(8, Math.round(ch * sc));
            if (P.fs && (playing || seeking)) {
                q = FSQ >= 1 ? 1 : (FSQ >= 0.5 ? 0.75 : 0.55);
            }
            RW = Math.max(8, Math.round(W * q));
            RH = Math.max(8, Math.round(H * q));
            sc = Math.min(RW / cw, RH / ch);
            if (cv.width !== RW) {
                cv.width = RW;
            }
            if (cv.height !== RH) {
                cv.height = RH;
            }
            cv.style.width = W + "px";
            cv.style.height = H + "px";
            c = cv.getContext("2d");
            c.setTransform(1, 0, 0, 1, 0, 0);
            c.fillStyle = getColor(P.bg);
            c.fillRect(0, 0, RW, RH);
            if (liveBg) {
                try {
                    c.drawImage(liveBg, 0, 0, RW, RH);
                }
                catch (eBg) { }
            }
            hit = sceneFor(cw, ch);
            if (hit.fail === 1) {
                return true;
            }
            if (hit.fail === 2) {
                c.font = "10px Arial";
                c.fillStyle = "#e0a0a0";
                c.fillText("Preview error: " + String(hit.err.message || hit.err), 6, 14);
                return true;
            }
            S = hit.S;
            total = S.total;
            t = playing ? tNow : (seekT !== null ? seekT : S.idle);
            seekSync(P, total, t);
            try {
                S.draw(c, RW, RH, sc, t, playing || seekT !== null);
            }
            catch (eD) {
                c.setTransform(1, 0, 0, 1, 0, 0);
                c.font = "10px Arial";
                c.fillStyle = "#e0a0a0";
                c.fillText("Preview error: " + String(eD.message || eD), 6, 28);
            }
            c.setTransform(1, 0, 0, 1, 0, 0);
            if (q < 1) {
                return true;
            }
            c.strokeStyle = "#6a6a6a";
            c.lineWidth = 1;
            c.strokeRect(0.5, 0.5, W - 1, H - 1);
            c.font = "9px Arial";
            c.textBaseline = "top";
            c.textAlign = "left";
            c.fillStyle = "rgba(255,255,255,.55)";
            c.fillText(cw + " x " + ch + "   " + Math.min(t, total).toFixed(1) + " s", 4, 3);
            return true;
        }
        function paintAll() {
            var k, any = false;
            pending = false;
            scenePass++;
            for (k = 0; k < IDS.length && !FS.on; k++) {
                PV[IDS[k]].availW = PV[IDS[k]].wr.clientWidth - 8;
            }
            for (k = 0; k < IDS.length && !FS.on; k++) {
                if (drawPanel(PV[IDS[k]])) {
                    any = true;
                }
            }
            if (FS.on) {
                FS.availW = FS.wr.clientWidth - 16;
                FS.availH = FS.wr.clientHeight - 16;
                if (drawPanel(FS)) {
                    any = true;
                }
            }
            if (any && window.QBT_paintSeek) {
                window.QBT_paintSeek();
            }
            if (!any && playing) {
                stopPlay();
            }
        }
        function anyOpen() { var k; for (k = 0; k < IDS.length; k++) {
            if (PV[IDS[k]].box.className.indexOf(" open") >= 0) {
                return true;
            }
        } return false; }
        function schedule() { sceneRev++; if (pending) {
            return;
        } if (!playing && !FS.on && !anyOpen()) {
            return;
        } pending = true; raf(paintAll); }
        function anyVisible() { var k; for (k = 0; k < IDS.length; k++) {
            if (PV[IDS[k]].wr.clientWidth - 8 >= 20) {
                return true;
            }
        } return false; }
        function btnState() {
            var k, P;
            for (k = 0; k < PVALL.length; k++) {
                P = PV[PVALL[k]];
                P.play.innerHTML = playing ? "<svg width=\"11\" height=\"11\" viewBox=\"0 0 12 12\" fill=\"currentColor\"><rect x=\"1\" y=\"1\" width=\"10\" height=\"10\" rx=\"1\"/></svg><span>Stop</span>" : "<svg width=\"11\" height=\"11\" viewBox=\"0 0 12 12\" fill=\"currentColor\"><path d=\"M2 1l9 5-9 5z\"/></svg><span>Play</span>";
                P.play.className = playing ? "stop" : "";
                P.loop.innerHTML = ICO_LOOP;
                P.loop.className = (playing && loopOn) ? "ibtn on" : "ibtn";
                P.loop.disabled = !!(playing && loopOn);
                P.play.title = playing ? "Stop and go back to the still picture" : "Play the animation once";
            }
        }
        function frame() {
            if (!playing) {
                return;
            }
            tNow = loopFrom + (now() - t0) / 1000;
            if (tNow >= total) {
                if (loopOn) {
                    t0 = now();
                    loopFrom = 0;
                    tNow = 0;
                }
                else {
                    stopPlay();
                    return;
                }
            }
            paintAll();
            raf(frame);
        }
        function startPlay(loop) {
            loopOn = loop;
            sceneRev++;
            loopFrom = (seekT !== null && seekT < total - 0.05) ? seekT : 0;
            t0 = now();
            tNow = loopFrom;
            playing = true;
            seekT = null;
            btnState();
            raf(frame);
        }
        function stopPlay() { playing = false; loopOn = false; seekT = null; btnState(); schedule(); }
        function bindPlay(P) {
            P.play.onclick = function () { if (playing) {
                stopPlay();
            }
            else {
                startPlay(false);
            } };
            P.loop.onclick = function () { if (playing) {
                stopPlay();
            }
            else {
                startPlay(true);
            } };
            P.seek.addEventListener("mousedown", function () { seeking = true; }, false);
            P.seek.addEventListener("input", function () {
                var v = parseFloat(P.seek.value) || 0;
                if (playing) {
                    playing = false;
                    loopOn = false;
                    btnState();
                }
                seekT = v;
                schedule();
            }, false);
        }
        window.addEventListener("mouseup", function () { if (seeking) {
            seeking = false;
            schedule();
        } }, false);
        function liveUrl(p) {
            var u = String(p).replace(/\\/g, "/");
            u = encodeURI(u).replace(/#/g, "%23").replace(/\?/g, "%3F");
            return /^[A-Za-z]:/.test(u) ? "file:///" + u : "file://" + u;
        }
        function liveDelete(p) {
            var req = nodeRequire(), done = false;
            try {
                if (req && p) {
                    req("fs").unlinkSync(p);
                    done = true;
                }
            }
            catch (e) {
                done = false;
            }
            if (!done) {
                cs.evalScript("QBT_liveClean()");
            }
        }
        function liveSync() {
            var k, P;
            for (k = 0; k < PVALL.length; k++) {
                P = PV[PVALL[k]];
                P.live.disabled = liveBusy;
                P.live.style.display = liveBg ? "none" : "";
                P.clr.style.display = liveBg ? "" : "none";
            }
        }
        function liveNote() {
            var k, cw, ch, bad = false, txt = "";
            if (liveBg && liveSeq) {
                cw = Math.max(16, Math.round(num("compW", 1920)));
                ch = Math.max(16, Math.round(num("compH", 1080)));
                bad = Math.abs(liveSeq.w / liveSeq.h - cw / ch) > 0.005 * (cw / ch);
                if (bad) {
                    txt = "Sequence is " + liveSeq.w + " x " + liveSeq.h + ", comp is " + cw + " x " + ch + ": the picture is stretched to fit, so it looks distorted.";
                }
            }
            for (k = 0; k < PVALL.length; k++) {
                PV[PVALL[k]].note.textContent = txt;
                PV[PVALL[k]].note.style.display = bad ? "" : "none";
            }
        }
        function liveClear() {
            if (liveBg) {
                liveBg.width = 0;
                liveBg.height = 0;
            }
            liveBg = null;
            liveSeq = null;
            liveNote();
            liveSync();
            schedule();
        }
        function liveFail(msg) {
            liveBusy = false;
            liveSync();
            note(msg, "err");
            log("Preview Live: " + msg, "err");
        }
        function liveGrab(P) {
            var cv = P.cv, W = cv.width, H = cv.height;
            if (liveBusy || W < 8 || H < 8) {
                return;
            }
            liveBusy = true;
            liveSync();
            note("Preview Live: grabbing the frame at the playhead...", "work");
            cs.evalScript("QBT_liveExport()", function (r) {
                var p = String(r || "").split("|"), file, sw, sh, img;
                if (p[0] !== "OK" || p.length < 4) {
                    liveFail(p[0] === "ERR" && p[1] ? p.slice(1).join("|") : "Frame export failed (this Premiere version cannot export a frame).");
                    return;
                }
                sw = parseInt(p[p.length - 2], 10);
                sh = parseInt(p[p.length - 1], 10);
                file = p.slice(1, p.length - 2).join("|");
                img = new Image();
                img.onload = function () {
                    var c, g;
                    try {
                        c = document.createElement("canvas");
                        c.width = W;
                        c.height = H;
                        g = c.getContext("2d");
                        if (g.imageSmoothingQuality !== undefined) {
                            g.imageSmoothingQuality = "high";
                        }
                        g.drawImage(img, 0, 0, W, H);
                        liveBg = c;
                        liveSeq = { w: sw, h: sh };
                    }
                    catch (e1) {
                        img.onload = img.onerror = null;
                        img.src = "";
                        liveDelete(file);
                        liveFail("Could not read the exported frame.");
                        return;
                    }
                    img.onload = img.onerror = null;
                    img.src = "";
                    liveDelete(file);
                    liveBusy = false;
                    liveNote();
                    liveSync();
                    schedule();
                    note("Preview Live: frame loaded.", "ok");
                };
                img.onerror = function () { img.onload = img.onerror = null; img.src = ""; liveDelete(file); liveFail("Could not load the exported frame."); };
                img.src = liveUrl(file);
            });
        }
        function setPinned(id) {
            var k, P, host = $("pinHost");
            if (id === pinnedId) {
                return;
            }
            if (pinnedId) {
                P = PV[pinnedId];
                if (P.home && P.home.parentNode) {
                    P.home.parentNode.insertBefore(P.box, P.home);
                }
            }
            pinnedId = id;
            if (id) {
                P = PV[id];
                host.appendChild(P.box);
                if (P.box.className.indexOf(" open") < 0) {
                    P.box.className += " open";
                }
            }
            for (k = 0; k < IDS.length; k++) {
                P = PV[IDS[k]];
                P.pin.setAttribute("data-mode", IDS[k] === id ? "unpin" : "pin");
                P.pin.title = (IDS[k] === id) ? "Unpin this preview (back to its section)" : "Pin this preview on top of every tab. Only one preview can be pinned at a time: pinning another one unpins this one.";
            }
            try {
                localStorage.setItem(PKEY, id);
            }
            catch (e1) { }
            pinHostRefresh();
            setTimeout(function () { schedule(); }, 0);
        }
        function goReset() { goBack = null; var pb = $("posPrevBox"); if (pb) {
            pb.className = pb.className.replace(" goback", "");
        } }
        function glideTo(top) {
            var pg = $("pages"), from = pg.scrollTop, t1 = now(), dur = 240;
            function st() {
                var k = clamp01((now() - t1) / dur), e = k * k * (3 - 2 * k);
                pg.scrollTop = from + (top - from) * e;
                if (k < 1) {
                    raf(st);
                }
            }
            raf(st);
        }
        function goToPosMap(e) {
            var pg = $("pages"), pos = $("optPos"), box = $("posPrevBox"), id = (this && this.id) || "shpGoPos", srcId = id.replace("GoPos", "PrevBox"), src = $(srcId), r, pr, top, n = 0, col;
            e.stopPropagation();
            r = src.getBoundingClientRect();
            pr = pg.getBoundingClientRect();
            var srcSec = src, sec = $("safeSec"), secOpened = false;
            while (srcSec && !(srcSec.tagName === "FIELDSET" && String(srcSec.className).indexOf("acc") >= 0)) {
                srcSec = srcSec.parentNode;
            }
            var origin = {
                srcSec: srcSec || null, srcSecWasOpen: srcSec && window.QBT_accIsOpen ? window.QBT_accIsOpen(srcSec) : true,
                tab: window.QBT_curTab ? window.QBT_curTab() : "pText", top: pg.scrollTop, srcId: srcId,
                off: r.top - pr.top,
                pinned: !!(src.parentNode && src.parentNode.id === "pinHost")
            };
            if (goBack) {
                goBack.tab = origin.tab;
                goBack.top = origin.top;
                goBack.srcId = origin.srcId;
                goBack.off = origin.off;
                goBack.pinned = origin.pinned;
            }
            else {
                origin.wasOpen = (box.className.indexOf(" open") >= 0) && box.style.display !== "none";
                goBack = origin;
            }
            if (window.QBT_showTab && window.QBT_curTab && window.QBT_curTab() !== "pOut") {
                window.QBT_showTab("pOut");
            }
            if (!pos.checked) {
                pos.checked = true;
                fireEvent(pos, "change");
            }
            if (sec && window.QBT_accSet && !window.QBT_accIsOpen(sec)) {
                secOpened = window.QBT_accSet(sec, true);
                if (secOpened && !goBack.secOpened) {
                    goBack.secOpened = true;
                }
            }
            if (box.className.indexOf(" open") < 0) {
                box.className += " open";
            }
            box.style.display = "";
            if (box.className.indexOf(" goback") < 0) {
                box.className += " goback";
            }
            try {
                posRender();
            }
            catch (eR) { }
            r = box.getBoundingClientRect();
            pr = pg.getBoundingClientRect();
            top = Math.max(0, pg.scrollTop + (r.top - pr.top) - 8);
            glideTo(top);
            col = getColor("cBlink");
            (function flash() {
                var fr = $("posWrap"), cv = $("posPrev"), ov = $("posBlink"), t, w, h;
                if (!ov) {
                    ov = document.createElement("div");
                    ov.id = "posBlink";
                    ov.style.cssText = "position:absolute;pointer-events:none;box-sizing:border-box;display:none;z-index:5;border-style:solid;";
                    try {
                        if (window.getComputedStyle(fr).position === "static") {
                            fr.style.position = "relative";
                        }
                    }
                    catch (eP) { }
                    fr.appendChild(ov);
                }
                w = cv.offsetWidth;
                h = cv.offsetHeight;
                t = Math.max(3, Math.min(3, Math.round(Math.min(w, h) / 4)));
                ov.style.left = cv.offsetLeft + "px";
                ov.style.top = cv.offsetTop + "px";
                ov.style.width = w + "px";
                ov.style.height = h + "px";
                ov.style.borderWidth = t + "px";
                ov.style.borderColor = col;
                ov.style.display = (n % 2 === 0) ? "block" : "none";
                if (++n < 8) {
                    setTimeout(flash, 260);
                }
                else {
                    ov.style.display = "none";
                }
            })();
        }
        IDS.forEach(function (p) { if (PV[p].go) {
            PV[p].go.addEventListener("click", goToPosMap, false);
        } });
        $("posGoDone").addEventListener("click", function (e) {
            var back = goBack, box = $("posPrevBox"), pg = $("pages"), src, r, pr, top;
            e.stopPropagation();
            goReset();
            if (!back) {
                return;
            }
            if (!back.wasOpen && box.className.indexOf(" open") >= 0) {
                box.className = box.className.replace(" open", "");
                posLive.clear();
            }
            if (back.secOpened && window.QBT_accSet) {
                if (back.srcSec && back.srcSecWasOpen) {
                    window.QBT_accSet(back.srcSec, true);
                }
                window.QBT_accSet($("safeSec"), false);
            }
            if (window.QBT_showTab && window.QBT_curTab && window.QBT_curTab() !== back.tab) {
                window.QBT_showTab(back.tab);
            }
            try {
                posRender();
            }
            catch (eR2) { }
            top = back.top;
            src = $(back.srcId);
            if (src && !back.pinned) {
                r = src.getBoundingClientRect();
                pr = pg.getBoundingClientRect();
                if (r.height > 0) {
                    top = Math.max(0, pg.scrollTop + (r.top - pr.top) - back.off);
                }
            }
            glideTo(top);
        }, false);
        IDS.forEach(function (p) {
            var P = PV[p];
            P.home = document.createElement("div");
            P.home.style.display = "none";
            P.box.parentNode.insertBefore(P.home, P.box);
            bindPlay(P);
            P.live.addEventListener("click", function (e) { e.stopPropagation(); liveGrab(P); }, false);
            P.clr.addEventListener("click", function (e) { e.stopPropagation(); liveClear(); }, false);
            P.pin.addEventListener("click", function (e) { e.stopPropagation(); setPinned(pinnedId === p ? "" : p); }, false);
            P.pin.setAttribute("data-mode", "pin");
        });
        function fsQualSync() {
            var b = $("fsQual"), n = FSQ >= 1 ? "1/1" : (FSQ >= 0.5 ? "1/2" : "1/4");
            b.textContent = "Render " + n;
            b.title = "Playback render quality: " + n + " while the animation plays or the seeker moves (the picture is scaled up, so playback is smoother). 1/1 = 100% quality, 1/2 = about 75% (default), 1/4 = about 55% (fastest). The still picture is always drawn sharp. Click to change.";
        }
        try {
            var qs = parseFloat(localStorage.getItem(FSQK));
            if (qs === 1 || qs === 0.5 || qs === 0.25) {
                FSQ = qs;
            }
        }
        catch (eQ) { }
        $("fsQual").addEventListener("click", function (e) {
            e.stopPropagation();
            FSQ = FSQ >= 1 ? 0.5 : (FSQ >= 0.5 ? 0.25 : 1);
            try {
                localStorage.setItem(FSQK, String(FSQ));
            }
            catch (eS) { }
            fsQualSync();
            schedule();
        }, false);
        fsQualSync();
        function fsOpen() {
            FS.on = true;
            FS.box.className = "on";
            fsDot();
            window.QBT_paintSeek();
            btnState();
            schedule();
            raf(function () { schedule(); });
        }
        function fsClose() {
            FS.on = false;
            FS.box.className = "";
            cpClose();
            schedule();
        }
        bindPlay(FS);
        FS.live.addEventListener("click", function (e) { e.stopPropagation(); liveGrab(FS); }, false);
        FS.clr.addEventListener("click", function (e) { e.stopPropagation(); liveClear(); }, false);
        liveSync();
        IDS.forEach(function (p) { $(p + "Full").addEventListener("click", function (e) { e.stopPropagation(); fsOpen(); }, false); });
        $("fsClose").addEventListener("click", function (e) { e.stopPropagation(); fsClose(); }, false);
        $("fsBg").addEventListener("click", function (e) {
            e.stopPropagation();
            if (cp.target === "cAnimBg") {
                cpClose();
            }
            else {
                cpClose();
                cpOpen("cAnimBg", $("fsBg"));
            }
        }, false);
        document.addEventListener("keydown", function (e) {
            if (e.keyCode === 27 && FS.on && cp.el.style.display !== "block") {
                e.stopPropagation();
                fsClose();
            }
        }, true);
        window.addEventListener("resize", function () { if (FS.on) {
            schedule();
        } }, false);
        (function bgSync() {
            var busy2 = false;
            IDS.forEach(function (p) {
                var el = $(PV[p].bg);
                new MutationObserver(function () {
                    var col = getColor(PV[p].bg);
                    if (busy2) {
                        return;
                    }
                    busy2 = true;
                    IDS.forEach(function (q) { if (getColor(PV[q].bg) !== col) {
                        setColor(PV[q].bg, col);
                    } });
                    busy2 = false;
                    fsDot();
                    schedule();
                }).observe(el, { attributes: true, attributeFilter: ["data-color"] });
            });
        })();
        window.QBT_pvPlay = function (id, from) {
            var P = PV[id];
            if (!P) {
                return;
            }
            if (playing) {
                stopPlay();
                return;
            }
            if (P.box.className.indexOf(" open") < 0 && $(id + "Legend")) {
                $(id + "Legend").click();
            }
            seekT = (from > 0) ? from : null;
            startPlay(false);
        };
        shpRender = function () { schedule(); };
        window.QBT_rollRender = function () { schedule(); };
        window.QBT_pvFolded = function () { if (liveBg && !FS.on && !anyVisible()) {
            liveClear();
        } schedule(); };
        ["input", "change", "click"].forEach(function (ev) { document.addEventListener(ev, function () { schedule(); }, true); });
        window.addEventListener("resize", function () { schedule(); }, false);
        (function watch() {
            var i2;
            try {
                for (i2 = 0; i2 < SWATCHES.length; i2++) {
                    new MutationObserver(function () { schedule(); }).observe($(SWATCHES[i2]), { attributes: true, attributeFilter: ["data-color"] });
                }
                new MutationObserver(function () { schedule(); }).observe($("text"), { attributes: true, attributeFilter: ["style"] });
            }
            catch (eW) { }
        })();
        btnState();
        liveSync();
        try {
            var pv = localStorage.getItem(PKEY);
            if (pv === null) {
                pv = (localStorage.getItem("qbt_pin_shp_v1") === "1") ? "shp" : "";
            }
            if (pv && PV[pv]) {
                setPinned(pv);
                PV[pv].box.className = PV[pv].box.className.replace(" open", "");
            }
        }
        catch (eP) { }
        setTimeout(schedule, 400);
        setTimeout(schedule, 1500);
        schedule();
    })();
    (function posPreview() {
        var pending = false, mc = null, geo = null, geoFs = null, fsOn = false, liveBg = null, liveSeq = null, liveBusy = false;
        function blockSize(A, useArea) {
            var t = $("text"), cst = window.getComputedStyle(t), size = Math.max(1, num("size", 60)), trk = num("tracking", 0), lsp = num("lineSp", 0), lines, i, w = 0, h, pad, lw, n;
            if (!mc) {
                mc = document.createElement("canvas").getContext("2d");
            }
            mc.font = (cst.fontStyle || "normal") + " " + (cst.fontWeight || "normal") + " " + size + "px " + cst.fontFamily;
            lines = (t.value || "Your Text Here").split("\n");
            for (i = 0; i < lines.length; i++) {
                n = lines[i].length;
                lw = mc.measureText(lines[i]).width + n * trk * size / 1000;
                if (lw > w) {
                    w = lw;
                }
            }
            h = (lines.length - 1) * size * (1.2 + lsp / 100) + size;
            pad = $("optOutline").checked ? Math.max(0, num("outlineW", 0)) / 2 : 0;
            w += 2 * pad;
            h += 2 * pad;
            if (useArea) {
                w = Math.min(w, A.w);
                h = Math.min(h, A.h);
            }
            return { w: w, h: h };
        }
        function paint(cv, availW, availH, big) {
            var cw, ch, sc, W, H, ctx, A, safe, tb, on, fx, fy, x, y, margin, al, cx, cy, lab, g, lw = big ? 2 : 1;
            cw = Math.max(16, Math.round(num("compW", 1920)));
            ch = Math.max(16, Math.round(num("compH", 1080)));
            sc = Math.min(availW / cw, availH / ch);
            W = Math.max(8, Math.round(cw * sc));
            H = Math.max(8, Math.round(ch * sc));
            sc = Math.min(W / cw, H / ch);
            cv.width = W;
            cv.height = H;
            cv.style.width = W + "px";
            cv.style.height = H + "px";
            ctx = cv.getContext("2d");
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, W, H);
            if (liveBg) {
                try {
                    ctx.drawImage(liveBg, 0, 0, W, H);
                }
                catch (eBg) { }
            }
            safe = $("optSafe").checked;
            A = { l: 0, t: 0, w: cw, h: ch };
            if (safe && $("optSafeCustom").checked) {
                A.l = safeEdge("safeL", cw);
                A.t = safeEdge("safeT", ch);
                A.w = cw - A.l - safeEdge("safeR", cw);
                A.h = ch - A.t - safeEdge("safeB", ch);
                if (A.w < 10 || A.h < 10) {
                    A = { l: 0, t: 0, w: cw, h: ch };
                }
            }
            tb = blockSize(A, safe);
            on = $("optPos").checked;
            if (on) {
                fx = Math.min(100, Math.max(0, num("posX", 50))) / 100;
                fy = Math.min(100, Math.max(0, num("posY", 50))) / 100;
                x = A.l + (A.w - tb.w) * fx;
                y = A.t + (A.h - tb.h) * fy;
            }
            else {
                margin = Math.round(cw * 0.05);
                al = parseInt($("align").value, 10);
                cx = (safe && $("optSafeCustom").checked);
                fx = cx ? A.l : margin;
                fy = cx ? A.l + A.w : cw - margin;
                x = (al === 0) ? fx : (al === 2) ? (fy - tb.w) : ((fx + fy) / 2 - tb.w / 2);
                y = cx ? (A.t + (A.h - tb.h) / 2) : (ch - tb.h) / 2;
            }
            if (safe) {
                ctx.strokeStyle = "rgba(255,255,255,.35)";
                ctx.lineWidth = 1;
                if (ctx.setLineDash) {
                    ctx.setLineDash([3, 3]);
                }
                ctx.strokeRect(A.l * sc + .5, A.t * sc + .5, A.w * sc - 1, A.h * sc - 1);
                if (ctx.setLineDash) {
                    ctx.setLineDash([]);
                }
            }
            g = { A: A, tb: tb, sc: sc, x: x, y: y };
            ctx.globalAlpha = on ? 1 : .4;
            ctx.fillStyle = "rgba(64,152,227,.40)";
            ctx.fillRect(x * sc, y * sc, Math.max(2, tb.w * sc), Math.max(2, tb.h * sc));
            ctx.strokeStyle = "#4098e3";
            ctx.lineWidth = lw;
            ctx.strokeRect(x * sc + .5, y * sc + .5, Math.max(1, tb.w * sc - 1), Math.max(1, tb.h * sc - 1));
            ctx.globalAlpha = 1;
            if (on) {
                cx = Math.round((x + tb.w / 2) * sc) + .5;
                cy = Math.round((y + tb.h / 2) * sc) + .5;
                ctx.strokeStyle = "#ffb400";
                ctx.lineWidth = lw;
                ctx.beginPath();
                ctx.moveTo(cx, 0);
                ctx.lineTo(cx, H);
                ctx.moveTo(0, cy);
                ctx.lineTo(W, cy);
                ctx.stroke();
            }
            ctx.strokeStyle = "#6a6a6a";
            ctx.lineWidth = 1;
            ctx.strokeRect(.5, .5, W - 1, H - 1);
            lab = cw + " x " + ch + (on ? "   H " + Math.round(fx * 100) + "%  V " + Math.round(fy * 100) + "%" : "");
            ctx.font = big ? "14px Arial" : "9px Arial";
            ctx.textBaseline = "top";
            ctx.fillStyle = "rgba(255,255,255,.55)";
            ctx.fillText(lab, big ? 8 : 4, big ? 6 : 3);
            return g;
        }
        function draw() {
            var wrapEl = $("posWrap"), availW, st;
            pending = false;
            if (fsOn) {
                st = $("posFsStage");
                availW = st.clientWidth - 16;
                if (availW >= 20 && st.clientHeight - 16 >= 20) {
                    geoFs = paint($("posFsCv"), availW, st.clientHeight - 16, true);
                }
            }
            if ($("posPrevBox").className.indexOf(" open") < 0) {
                return;
            }
            availW = wrapEl.clientWidth - 8;
            if (availW < 20) {
                return;
            }
            geo = paint($("posPrev"), availW, 150, false);
            liveNote();
        }
        function schedule() { if (pending) {
            return;
        } pending = true; raf(draw); }
        posRender = schedule;
        function liveUrl(p) {
            var u = String(p).replace(/\\/g, "/");
            u = encodeURI(u).replace(/#/g, "%23").replace(/\?/g, "%3F");
            return /^[A-Za-z]:/.test(u) ? "file:///" + u : "file://" + u;
        }
        function liveDelete(p) {
            var req = nodeRequire(), done = false;
            try {
                if (req && p) {
                    req("fs").unlinkSync(p);
                    done = true;
                }
            }
            catch (e) {
                done = false;
            }
            if (!done) {
                cs.evalScript("QBT_liveClean()");
            }
        }
        function liveSync() {
            var on = $("optPos").checked;
            $("posLiveBtn").disabled = !on || liveBusy;
            $("posLiveBtn").style.display = liveBg ? "none" : "";
            $("posLiveClr").style.display = liveBg ? "" : "none";
            $("posFsLive").disabled = !on || liveBusy;
            $("posFsLive").style.display = liveBg ? "none" : "";
            $("posFsClr").style.display = liveBg ? "" : "none";
        }
        function liveNote() {
            var el = $("posLiveNote"), cw, ch, bad = false;
            if (liveBg && liveSeq) {
                cw = Math.max(16, Math.round(num("compW", 1920)));
                ch = Math.max(16, Math.round(num("compH", 1080)));
                bad = Math.abs(liveSeq.w / liveSeq.h - cw / ch) > 0.005 * (cw / ch);
                if (bad) {
                    el.textContent = "Sequence is " + liveSeq.w + " x " + liveSeq.h + ", comp is " + cw + " x " + ch + ": the picture is stretched to fit, so it looks distorted.";
                }
            }
            el.style.display = bad ? "" : "none";
            $("posFsNote").textContent = bad ? el.textContent : "";
            $("posFsNote").style.display = bad ? "" : "none";
        }
        function liveClear() {
            if (liveBg) {
                liveBg.width = 0;
                liveBg.height = 0;
            }
            liveBg = null;
            liveSeq = null;
            liveNote();
            liveSync();
            schedule();
        }
        function liveFail(msg) {
            liveBusy = false;
            liveSync();
            note(msg, "err");
            log("Preview Live: " + msg, "err");
        }
        function liveGrab() {
            var cwL = Math.max(16, Math.round(num("compW", 1920))), chL = Math.max(16, Math.round(num("compH", 1080))), kL = Math.min(1, 960 / Math.max(cwL, chL)), W = Math.max(8, Math.round(cwL * kL)), H = Math.max(8, Math.round(chL * kL));
            if (liveBusy || !$("optPos").checked) {
                return;
            }
            if (W < 8 || H < 8) {
                return;
            }
            liveBusy = true;
            liveSync();
            note("Preview Live: grabbing the frame at the playhead...", "work");
            cs.evalScript("QBT_liveExport()", function (r) {
                var p = String(r || "").split("|"), file, sw, sh, img;
                if (p[0] !== "OK" || p.length < 4) {
                    liveFail(p[0] === "ERR" && p[1] ? p.slice(1).join("|") : "Frame export failed (this Premiere version cannot export a frame).");
                    return;
                }
                sw = parseInt(p[p.length - 2], 10);
                sh = parseInt(p[p.length - 1], 10);
                file = p.slice(1, p.length - 2).join("|");
                img = new Image();
                img.onload = function () {
                    var c, g;
                    try {
                        c = document.createElement("canvas");
                        c.width = W;
                        c.height = H;
                        g = c.getContext("2d");
                        if (g.imageSmoothingQuality !== undefined) {
                            g.imageSmoothingQuality = "high";
                        }
                        g.drawImage(img, 0, 0, W, H);
                        liveBg = c;
                        liveSeq = { w: sw, h: sh };
                    }
                    catch (e1) {
                        img.onload = img.onerror = null;
                        img.src = "";
                        liveDelete(file);
                        liveFail("Could not read the exported frame.");
                        return;
                    }
                    img.onload = img.onerror = null;
                    img.src = "";
                    liveDelete(file);
                    liveBusy = false;
                    liveNote();
                    liveSync();
                    schedule();
                    note("Preview Live: frame loaded.", "ok");
                };
                img.onerror = function () { img.onload = img.onerror = null; img.src = ""; liveDelete(file); liveFail("Could not load the exported frame."); };
                img.src = liveUrl(file);
            });
        }
        $("posLiveBtn").addEventListener("click", function (e) { e.stopPropagation(); liveGrab(); }, false);
        $("posLiveClr").addEventListener("click", function (e) { e.stopPropagation(); liveClear(); }, false);
        posLive.clear = liveClear;
        posLive.sync = liveSync;
        try {
            cs.evalScript("QBT_liveClean()");
        }
        catch (eClean) { }
        liveSync();
        function bindDrag(cvs, G) {
            var drag = null, want = null, busy = false;
            function where(e) { var r = cvs.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
            function inside(p) {
                var cx, cy;
                if (!G()) {
                    return false;
                }
                cx = p.x / G().sc;
                cy = p.y / G().sc;
                return cx >= G().x && cx <= G().x + G().tb.w && cy >= G().y && cy <= G().y + G().tb.h;
            }
            function put(px, py) {
                var ids = ["posX", "posY"], vals = [px, py], k, ev, ch = false;
                for (k = 0; k < 2; k++) {
                    if (String($(ids[k]).value) !== String(vals[k])) {
                        ch = true;
                    }
                }
                if (!ch) {
                    return;
                }
                for (k = 0; k < 2; k++) {
                    $(ids[k]).value = String(vals[k]);
                    $(ids[k] + "Sl").value = String(vals[k]);
                }
                for (k = 0; k < 2; k++) {
                    ev = document.createEvent("Event");
                    ev.initEvent("input", true, true);
                    $(ids[k]).dispatchEvent(ev);
                }
            }
            function flush() { busy = false; if (want) {
                put(want.x, want.y);
                want = null;
            } }
            function move(e) {
                var p, bx, by, rx, ry, px, py;
                if (!drag || !G()) {
                    return;
                }
                p = where(e);
                bx = p.x / G().sc - drag.dx;
                by = p.y / G().sc - drag.dy;
                rx = G().A.w - G().tb.w;
                ry = G().A.h - G().tb.h;
                px = rx >= 1 ? (bx - G().A.l) / rx * 100 : num("posX", 50);
                py = ry >= 1 ? (by - G().A.t) / ry * 100 : num("posY", 50);
                px = Math.round(Math.min(100, Math.max(0, px)));
                py = Math.round(Math.min(100, Math.max(0, py)));
                want = { x: px, y: py };
                if (!busy) {
                    busy = true;
                    raf(flush);
                }
                e.preventDefault();
            }
            function up() {
                document.removeEventListener("mousemove", move, true);
                document.removeEventListener("mouseup", up, true);
                if (drag) {
                    flush();
                }
                drag = null;
                cvs.style.cursor = "";
            }
            cvs.addEventListener("mousedown", function (e) {
                var p;
                if (e.button !== 0 || !G() || !$("optPos").checked) {
                    return;
                }
                p = where(e);
                if (inside(p)) {
                    drag = { dx: p.x / G().sc - G().x, dy: p.y / G().sc - G().y };
                }
                else {
                    drag = { dx: G().tb.w / 2, dy: G().tb.h / 2 };
                }
                cvs.style.cursor = "move";
                document.addEventListener("mousemove", move, true);
                document.addEventListener("mouseup", up, true);
                move(e);
            }, false);
            cvs.addEventListener("mousemove", function (e) { if (!drag) {
                cvs.style.cursor = inside(where(e)) ? "move" : "crosshair";
            } }, false);
        }
        bindDrag($("posPrev"), function () { return geo; });
        bindDrag($("posFsCv"), function () { return geoFs; });
        (function posFull() {
            function open() {
                fsOn = true;
                $("posFs").className = "on";
                liveSync();
                schedule();
                raf(function () { schedule(); });
            }
            function close() {
                fsOn = false;
                geoFs = null;
                $("posFs").className = "";
            }
            $("posFullBtn").addEventListener("click", function (e) { e.stopPropagation(); open(); }, false);
            $("posFsClose").addEventListener("click", function (e) { e.stopPropagation(); close(); }, false);
            $("posFsLive").addEventListener("click", function (e) { e.stopPropagation(); liveGrab(); }, false);
            $("posFsClr").addEventListener("click", function (e) { e.stopPropagation(); liveClear(); }, false);
            document.addEventListener("keydown", function (e) {
                if (e.keyCode === 27 && fsOn) {
                    e.stopPropagation();
                    close();
                }
            }, true);
        })();
        (function events() {
            var tabs = document.querySelectorAll(".tab"), i;
            for (i = 0; i < tabs.length; i++) {
                tabs[i].addEventListener("click", function () { setTimeout(schedule, 0); }, false);
            }
            window.addEventListener("resize", schedule, false);
            window.addEventListener("load", schedule, false);
            setTimeout(schedule, 400);
        })();
        schedule();
    })();
    var POS_BUILTIN = [
        { name: "Title (middle)", x: 50, y: 50 },
        { name: "Subtitle (bottom)", x: 50, y: 90 },
        { name: "Left Lower Third", x: 7, y: 86 },
        { name: "Center Lower Third", x: 50, y: 86 },
        { name: "Right Lower Third", x: 93, y: 86 },
        { name: "Top Left", x: 7, y: 10 },
        { name: "Top Center", x: 50, y: 10 },
        { name: "Top Right", x: 93, y: 10 }
    ];
    var posPreSync = function () { };
    (function posPresets() {
        var PKEY = "qbt_pospre_v1", sel = $("posPick"), ie = $("posIE"), sd = $("posSD"), mine = [], fs = null, path = null, building = false;
        (function init() { var req = nodeRequire(); if (!req) {
            return;
        } try {
            fs = req("fs");
            path = req("path");
        }
        catch (e) {
            fs = null;
        } })();
        function clamp(v) { v = Math.round(parseFloat(v)); if (isNaN(v)) {
            v = 50;
        } return Math.min(100, Math.max(0, v)); }
        function load() {
            var raw = null, k;
            mine = [];
            try {
                raw = JSON.parse(localStorage.getItem(PKEY) || "[]");
            }
            catch (e) {
                raw = [];
            }
            if (!raw || raw.length === undefined) {
                raw = [];
            }
            for (k = 0; k < raw.length; k++) {
                if (raw[k] && raw[k].name) {
                    mine.push({ name: cleanName(raw[k].name), x: clamp(raw[k].x), y: clamp(raw[k].y) });
                }
            }
        }
        function store() { try {
            localStorage.setItem(PKEY, JSON.stringify(mine));
        }
        catch (e) { } }
        function findMine(name) { var k, low = String(name).toLowerCase(); for (k = 0; k < mine.length; k++) {
            if (mine[k].name.toLowerCase() === low) {
                return k;
            }
        } return -1; }
        function findBuilt(name) { var k, low = String(name).toLowerCase(); for (k = 0; k < POS_BUILTIN.length; k++) {
            if (POS_BUILTIN[k].name.toLowerCase() === low) {
                return k;
            }
        } return -1; }
        function curX() { return clamp($("posX").value); }
        function curY() { return clamp($("posY").value); }
        function chosen() {
            var v = sel.value, n;
            if (!v) {
                return null;
            }
            n = parseInt(v.substr(2), 10);
            if (v.charAt(0) === "b" && POS_BUILTIN[n]) {
                return { own: false, p: POS_BUILTIN[n] };
            }
            if (v.charAt(0) === "u" && mine[n]) {
                return { own: true, p: mine[n] };
            }
            return null;
        }
        function buttons() {
            var c = chosen();
            ie.setAttribute("data-mode", c ? "stexp" : "stimp");
            ie.title = c ? "Export the chosen position preset (only this one) into a .json file" : "Import position presets from a .json file";
            sd.setAttribute("data-mode", (c && c.own) ? "del" : "save");
            sd.title = (c && c.own) ? "Delete the chosen position preset" : "Save the current position as a new position preset";
        }
        function fill(pick) {
            var k, g;
            building = true;
            sel.innerHTML = "";
            sel.options[0] = new Option("Select a position...", "");
            g = document.createElement("optgroup");
            g.label = "Ready made";
            for (k = 0; k < POS_BUILTIN.length; k++) {
                g.appendChild(new Option(POS_BUILTIN[k].name + "  (" + POS_BUILTIN[k].x + " / " + POS_BUILTIN[k].y + ")", "b:" + k));
            }
            sel.appendChild(g);
            if (mine.length) {
                g = document.createElement("optgroup");
                g.label = "My positions";
                for (k = 0; k < mine.length; k++) {
                    g.appendChild(new Option(mine[k].name + "  (" + mine[k].x + " / " + mine[k].y + ")", "u:" + k));
                }
                sel.appendChild(g);
            }
            sel.value = pick || "";
            if (sel.selectedIndex < 0) {
                sel.selectedIndex = 0;
            }
            building = false;
            buttons();
        }
        function setPos(x, y) {
            var ids = ["posX", "posY"], vals = [x, y], k, ev;
            for (k = 0; k < 2; k++) {
                $(ids[k]).value = String(vals[k]);
                $(ids[k] + "Sl").value = String(vals[k]);
            }
            for (k = 0; k < 2; k++) {
                ev = document.createEvent("Event");
                ev.initEvent("input", true, true);
                $(ids[k]).dispatchEvent(ev);
            }
        }
        posPreSync = function () {
            var c = chosen();
            if (building || !c) {
                return;
            }
            if (c.p.x !== curX() || c.p.y !== curY()) {
                sel.value = "";
                buttons();
            }
        };
        sel.addEventListener("change", function () {
            var c = chosen();
            if (c) {
                if (!$("optPos").checked) {
                    $("optPos").checked = true;
                    fireEvent($("optPos"), "change");
                }
                setPos(c.p.x, c.p.y);
                note("Position: " + c.p.name, "ok");
            }
            buttons();
        }, false);
        function save() {
            ask({ msg: "Save the current position (Horizontal " + curX() + " %, Vertical " + curY() + " %) as a position preset.\n\nName:", input: true, value: "", ok: "Save" }, function (name) {
                var n, at;
                if (name === null || name === false) {
                    return;
                }
                n = cleanName(name);
                if (!n) {
                    note("Type a name for the position preset.", "err");
                    return;
                }
                if (findBuilt(n) >= 0) {
                    ask({ msg: "\"" + n + "\" is the name of a ready made position. Choose another name.", cancel: false });
                    return;
                }
                at = findMine(n);
                function put() {
                    var idx = findMine(n);
                    if (idx >= 0) {
                        mine[idx].x = curX();
                        mine[idx].y = curY();
                    }
                    else {
                        mine.push({ name: n, x: curX(), y: curY() });
                        idx = mine.length - 1;
                    }
                    store();
                    fill("u:" + idx);
                    note("Position preset saved: " + n, "ok");
                    log("Position preset saved: " + n, "ok");
                }
                if (at >= 0) {
                    ask({ msg: "A position preset named \"" + n + "\" already exists. Replace it?", ok: "Replace", danger: true }, function (yes) { if (yes) {
                        put();
                    } });
                }
                else {
                    put();
                }
            });
        }
        function del() {
            var c = chosen();
            if (!c || !c.own) {
                return;
            }
            ask({ msg: "Delete the position preset \"" + c.p.name + "\"?", ok: "Delete", danger: true }, function (yes) {
                var idx;
                if (!yes) {
                    return;
                }
                idx = findMine(c.p.name);
                if (idx >= 0) {
                    mine.splice(idx, 1);
                }
                store();
                fill("");
                note("Position preset deleted: " + c.p.name, "ok");
                log("Position preset deleted: " + c.p.name, "ok");
            });
        }
        function noFiles() { ask({ msg: "Import / export needs file access (Node.js), which is not available in this panel.", cancel: false }); note("Import / export is not available (no file access).", "err"); }
        function exportOne() {
            var c = chosen();
            if (!c) {
                return;
            }
            if (!fs) {
                noFiles();
                return;
            }
            cs.evalScript("QBT_pickFolderFor(" + JSON.stringify("Choose a folder to export the position preset \"" + c.p.name + "\" to") + ")", function (dir) {
                var target;
                if (!dir || dir === "undefined" || dir === "null" || dir === "EvalScript error.") {
                    return;
                }
                target = path.join(dir, "Position - " + c.p.name.replace(/[\\\/:*?"<>|]+/g, "_") + ".json");
                try {
                    fs.writeFileSync(target, JSON.stringify({ qbtPosPresets: 1, presets: [{ name: c.p.name, x: c.p.x, y: c.p.y }] }, null, 2), "utf8");
                    log("Position preset exported: " + target, "ok");
                    note("Position preset exported successfully: " + c.p.name, "ok");
                }
                catch (e) {
                    ask({ msg: "Could not write the export file:\n" + target + "\n\n" + e, cancel: false });
                    note("Could not export the position preset.", "err");
                }
            });
        }
        function importFiles() {
            if (!fs) {
                noFiles();
                return;
            }
            cs.evalScript("QBT_pickPresetFiles()", function (r) {
                var files, a, k, o, items, queue = [], pos = 0, n = 0, bad = 0, firstIdx = -1, cancelled = false;
                if (!r || r === "undefined" || r === "null" || r === "EvalScript error.") {
                    return;
                }
                files = String(r).split("|");
                for (a = 0; a < files.length; a++) {
                    try {
                        o = JSON.parse(fs.readFileSync(files[a], "utf8").replace(/^\uFEFF/, ""));
                        items = (o && o.presets && o.presets.length) ? o.presets : [];
                        if (!items.length) {
                            bad++;
                        }
                        for (k = 0; k < items.length; k++) {
                            if (items[k] && items[k].name && items[k].x !== undefined && items[k].y !== undefined) {
                                queue.push(items[k]);
                            }
                            else {
                                bad++;
                            }
                        }
                    }
                    catch (e) {
                        bad++;
                    }
                }
                function put(name, x, y) {
                    var idx = findMine(name);
                    if (idx >= 0) {
                        mine[idx].x = clamp(x);
                        mine[idx].y = clamp(y);
                    }
                    else {
                        mine.push({ name: name, x: clamp(x), y: clamp(y) });
                        idx = mine.length - 1;
                    }
                    if (firstIdx < 0) {
                        firstIdx = idx;
                    }
                    n++;
                }
                function numbered(base) { var nm = base, c; for (c = 2; findMine(nm) >= 0 || findBuilt(nm) >= 0; c++) {
                    nm = base + " (" + c + ")";
                } return nm; }
                function step() {
                    var it, base;
                    while (pos < queue.length && !cancelled) {
                        it = queue[pos++];
                        base = cleanName(it.name) || "Imported position";
                        if (findBuilt(base) >= 0) {
                            put(numbered(base), it.x, it.y);
                            continue;
                        }
                        if (findMine(base) >= 0) {
                            ask({ msg: "A position preset named \"" + base + "\" already exists.\n\nReplace it, keep both (the new one gets a number at the end), or cancel the import?", ok: "Replace", okKind: "danger", alt: "Keep Both", altKind: "good" }, (function (b, x, y) {
                                return function (res) {
                                    if (res === true) {
                                        put(b, x, y);
                                    }
                                    else if (res === "alt") {
                                        put(numbered(b), x, y);
                                    }
                                    else {
                                        cancelled = true;
                                    }
                                    step();
                                };
                            })(base, it.x, it.y));
                            return;
                        }
                        put(base, it.x, it.y);
                    }
                    finish();
                }
                function finish() {
                    store();
                    fill(firstIdx >= 0 ? "u:" + firstIdx : "");
                    log("Position presets imported: " + n + (bad ? " (" + bad + " could not be read)" : "") + (cancelled ? " - import cancelled" : ""), n || cancelled ? "ok" : "err");
                    if (n) {
                        note("Position presets imported successfully (" + n + ")" + (bad ? " - " + bad + " skipped" : ""), "ok");
                    }
                    else if (!cancelled) {
                        ask({ msg: "No position presets could be read from the chosen file(s).", cancel: false });
                        note("No position presets could be imported.", "err");
                    }
                }
                step();
            });
        }
        sd.addEventListener("click", function () { var c = chosen(); if (c && c.own) {
            del();
        }
        else {
            save();
        } }, false);
        ie.addEventListener("click", function () { if (chosen()) {
            exportOne();
        }
        else {
            importFiles();
        } }, false);
        load();
        fill("");
        (function hook() { var old = posRender; posRender = function () { old(); posPreSync(); }; })();
    })();
    $("browse").onclick = function () {
        cs.evalScript("QBT_pickFolder()", function (r) { if (r && r !== "undefined" && r !== "null") {
            $("outDir").value = r;
            cs.evalScript("QBT_setSessionDir(" + JSON.stringify(r) + ")");
        } });
    };
    $("matchSeq").onclick = function () {
        cs.evalScript("QBT_seqInfo()", function (r) {
            var p = (r || "").split("|");
            if (p.length === 3) {
                $("compW").value = p[0];
                $("compH").value = p[1];
                $("fps").value = p[2];
                log("Using sequence settings: " + p[0] + "x" + p[1] + " @ " + p[2] + " fps", "ok");
                note("Successfully adopted project settings...", "ok");
            }
            else {
                log("Could not read the active sequence (is one open?).", "err");
            }
        });
    };
    $("clearLog").onclick = clearLog;
    $("openAE").onclick = function () {
        cs.evalScript("QBT_openAE()", function (r) {
            r = r || "";
            log(r, r.indexOf("OK") === 0 ? "ok" : "err");
            if (r.indexOf("already running") >= 0) {
                note("Ok: After Effects is running...", "ok");
            }
            else if (r.indexOf("OK") === 0) {
                note("Opening After Effects...", "warn");
                watchOpen(false);
            }
            else if (r.indexOf("was not found") >= 0) {
                note("After Effects is not running...", "err");
            }
        });
    };
    $("ping").onclick = function () {
        cs.evalScript("QBT_pingAE()", function (r) {
            r = r || "";
            log(r, r.indexOf("OK") === 0 ? "ok" : "err");
            if (r.indexOf("OK") === 0) {
                note("Ok: After Effects is running...", "ok");
            }
            else if (r.indexOf("OFF") === 0 || r.indexOf("was not found") >= 0) {
                note("After Effects is not running...", "err");
            }
        });
    };
    function selIdx(id, max) { return Math.min(Math.max(parseInt($(id).value, 10) || 0, 0), max); }
    function collect(textOverride, useParts) {
        var cw = Math.round(num("compW", 1920)), ch = Math.round(num("compH", 1080));
        var s = {
            textEnc: "",
            align: parseInt($("align").value, 10),
            fadeDur: $("optEnd").checked ? 0 : Math.max(0, num("fadeDur", 0)),
            endOn: $("optEnd").checked,
            endReverse: $("endMode").value === "reverse",
            endDur: Math.max(0.1, num("endDur", 1.2)),
            ps: curFont.ps,
            size: Math.max(1, num("size", 60)),
            tracking: num("tracking", 0),
            lineSp: num("lineSp", 0),
            textRGB: hexToRgb(getColor("cText")),
            bgRGB: hexToRgb(getColor("cBg")),
            accentRGB: hexToRgb(getColor("cAccent")),
            strength: (function () { var v = parseInt($("fxStr").value, 10); return isNaN(v) ? 1 : Math.min(2, Math.max(0, v)); })(),
            wipe: (function () { var v = parseInt($("wipeDir").value, 10); return isNaN(v) ? 0 : Math.min(3, Math.max(0, v)); })(),
            preset: parseInt($("preset").value, 10),
            interp: Math.min(Math.max(parseInt($("interp").value, 10) || 0, 0), INTERPS.length - 1),
            shpInterp: Math.min(Math.max(parseInt($("shpInterp").value, 10) || 0, 0), INTERPS.length - 1),
            dir: Math.min(Math.max(parseInt($("dir").value, 10) || 0, 0), DIRECTIONS.length - 1),
            delay: num("delay", 0.2),
            dur: Math.max(0.1, num("dur", 1.2)),
            hold: Math.max(0, num("hold", 2)),
            compDur: num("compDur", 0),
            compW: Math.round(num("compW", 1920)),
            compH: Math.round(num("compH", 1080)),
            fps: num("fps", 30),
            bg: $("optBg").checked,
            mblur: $("optMb").checked,
            mblurShape: $("optMbShape").checked,
            mblurText: $("optMbText").checked,
            outDir: $("outDir").value,
            compBase: curBase(),
            compLast: lastFor(curBase()),
            place: $("optPlace").checked && $("optPlaceSingle").checked,
            track: Math.max(1, Math.round(num("trackNo", 1))),
            outline: $("optOutline").checked,
            outlineW: Math.max(0, num("outlineW", 4)),
            outlineRGB: hexToRgb(getColor("cOutline")),
            shadow: $("optShadow").checked,
            shRGB: hexToRgb(getColor("cShadow")),
            shOp: Math.min(100, Math.max(0, num("shOp", 60))),
            shDist: Math.max(0, num("shDist", 8)),
            shSoft: Math.max(0, num("shSoft", 10)),
            shDir: num("shDir", 135),
            safe: $("optSafe").checked,
            safeW: parseInt($("safeW").value, 10) || 0,
            safeH: parseInt($("safeH").value, 10) || 0,
            safeCustom: $("optSafeCustom").checked,
            safeT: safeEdge("safeT", ch),
            safeL: safeEdge("safeL", cw),
            safeB: safeEdge("safeB", ch),
            safeR: safeEdge("safeR", cw),
            box: { on: $("optBox").checked, rgb: hexToRgb(getColor("cBox")), anim: selIdx("boxAnim", 18), op: Math.min(100, Math.max(0, num("boxOp", 85))), pad: Math.max(0, num("boxPad", 28)), rad: Math.max(0, num("boxRad", 10)), skew: Math.min(45, Math.max(-45, num("boxSkew", 0))), dur: Math.max(0.1, num("boxDur", 0.6)) },
            line: { on: $("optLine").checked, rgb: hexToRgb(getColor("cLine")), anim: selIdx("lineAnim", 13), w: Math.max(1, num("lineW", 4)), pad: Math.max(0, num("linePad", 22)), rad: Math.max(0, num("lineRad", 0)), skew: Math.min(45, Math.max(-45, num("lineSkew", 0))), dur: Math.max(0.1, num("lineDur", 0.8)) },
            shp: { on: $("optShp").checked, rgb: hexToRgb(getColor("cShp")), type: selIdx("shpType", 35), anim: selIdx("shpAnim", 15), th: Math.max(1, num("shpTh", 8)), dur: Math.max(0.1, num("shpDur", 0.6)),
                delay: Math.max(0, num("shpDelay", 0)), fx: selIdx("shpFx", 10), skew: Math.min(45, Math.max(-45, num("shpSkew", 0))), fxSp: Math.max(0.2, num("shpFxSp", 1.2)),
                len: Math.min(300, Math.max(10, num("shpLen", 100))), gap: num("shpGap", 0), ox: num("shpOffX", 0), oy: num("shpOffY", 0), rot: num("shpRot", 0),
                rad: Math.max(0, num("shpRad", 0)), pad: Math.max(0, num("shpPad", 12)), op: Math.min(100, Math.max(0, num("shpOp", 100))),
                ln: { on: $("optShpLn").checked, rgb: hexToRgb(getColor("cShpLn")), w: Math.max(1, num("shpLnW", 3)) },
                sh: { on: $("optShpSh").checked, rgb: hexToRgb(getColor("cShpSh")), soft: Math.max(0, num("shpShSoft", 12)), dist: Math.max(0, num("shpShDist", 6)) },
                tb: { on: $("optShpTb").checked, rgb: hexToRgb(getColor("cShpTb")), rgbB: hexToRgb(getColor("cShpTbB")), rgbC: hexToRgb(getColor("cShpTbC")), rgbD: hexToRgb(getColor("cShpTbD")), all: $("shpTbOrA").checked, wC: Math.max(0, num("shpTbWC", 4)), wD: Math.max(0, num("shpTbWD", 4)), hs: Math.max(10, num("shpTbHs", 100)), vs: Math.max(10, num("shpTbVs", 100)), sep: $("shpTbSep").checked, w: Math.max(0, num("shpTbW", 4)), wB: Math.max(0, num("shpTbWB", 4)), anim: selIdx("shpTbAnim", 22), vert: $("shpTbOrV").checked && !$("shpTbOrA").checked, dur: Math.max(0.1, num("shpTbDur", 0.6)), gap: num("shpTbGap", 0), delay: Math.max(0, num("shpTbDelay", 0)) } },
            pos: { on: $("optPos").checked, x: Math.min(100, Math.max(0, num("posX", 50))), y: Math.min(100, Math.max(0, num("posY", 50))) }
        };
        s.shpOrder = selIdx("shpOrder", 2);
        s.roll = {
            lines: Math.max(1, Math.min(8, Math.floor(num("crawlLines", 1)) || 1)), sepEnc: encodeURIComponent(crawlSepString()),
            txY: Math.max(-600, Math.min(600, num("tkTxY", 0))),
            mode: selIdx("rollMode", 4), speed: Math.max(10, num("rollSpeed", 160)), gapIn: Math.max(0, num("rollGapIn", 0)), gapOut: Math.max(0, num("rollGapOut", 0.3)),
            bar: { on: $("tkBarOn").checked, rgb: hexToRgb(getColor("cTkBar")), lineRGB: hexToRgb(getColor("cTkLine")), lineBRGB: hexToRgb(getColor("cTkLineB")), lineSep: $("tkLineSep").checked, lineAnim: selIdx("tkLineAnim", 17), anim: selIdx("tkAnim", 21),
                h: Math.max(20, num("tkBarH", 110)), op: Math.min(100, Math.max(0, num("tkBarOp", 92))), lw: Math.max(0, num("tkLineW", 4)), lwB: Math.max(0, num("tkLineWB", 0)) },
            label: { on: $("tkLabelOn").checked, rgb: hexToRgb(getColor("cTkLabel")), textEnc: encodeURIComponent($("tkLabel").value || "LIVE"),
                txY: Math.max(-400, Math.min(400, num("tkLblTxY", 0))),
                tx: { on: $("tkLblTxOn").checked, mode: ($("tkLblTxMode").value === "1") ? 1 : 0, preset: Math.max(0, parseInt($("tkLblTxIn").value, 10) || 0), dur: Math.max(0.1, num("tkLblTxDur", 0.7)),
                    fx: Math.min(29, Math.max(1, parseInt($("tkLblTxFx").value, 10) || 1)), sp: Math.max(0.2, num("tkLblTxSp", 1.5)), amt: Math.min(300, Math.max(10, num("tkLblTxAmt", 100))) / 100 },
                anim: selIdx("tkLblAnim", 17), size: Math.max(0, num("tkLblSz", 0)), ext: Math.max(0, num("tkLblExt", 0)),
                txAuto: $("tkLabelTxAuto").checked, txRGB: hexToRgb(getColor("cTkLabelTx")) }
        };
        s.animate = { on: $("optAnimate").checked, fx: Math.min(29, Math.max(1, parseInt($("animFx").value, 10) || 1)),
            sp: Math.max(0.2, num("animSp", 1.5)), amt: Math.min(300, Math.max(10, num("animAmt", 100))) / 100 };
        if (s.roll.mode > 0) {
            s.safe = false;
        }
        var txt = (textOverride !== undefined) ? textOverride : $("text").value;
        if (txt.replace(/\s+/g, "") === "") {
            txt = "Your Text Here";
        }
        s.textEnc = encodeURIComponent(txt);
        if (s.roll.mode === 3 || s.roll.mode === 4) {
            s.roll.joinedEnc = encodeURIComponent(crawlRows(txt, s.roll.lines).join("\r"));
        }
        s.parts = (textOverride === undefined || useParts) ? partsForJob(txt) : [];
        return s;
    }
    function batchReplaceOn() { return batchLockOn && UI.batchBtn === "replace"; }
    function syncBatchRadios() {
        var on = $("batchBtnOn").checked;
        $("batchBtnReplace").disabled = !on;
        $("batchBtnBoth").disabled = !on;
        $("lblBatchRep").className = on ? "check" : "check off";
        $("lblBatchBoth").className = on ? "check" : "check off";
    }
    function syncBatchBtn() {
        var go = $("go"), rep = batchReplaceOn(), dis = batchLockOn && UI.batchBtn === "disable";
        go.disabled = busy || dis;
        go.textContent = busy ? "Working..." : (rep ? "Batch Create & Link to Premiere" : "Create & Link to Premiere");
        go.setAttribute("data-batch", rep ? "1" : "");
        go.title = rep ? "Builds every title of the Batch Creator one after another, then imports them all into Premiere"
            : (dis ? "Disabled while the Batch Creator is active: use Batch Create & Link to Premiere" : "");
        $("batchGo").style.display = rep ? "none" : "";
    }
    function setBusy(b) {
        busy = b;
        if (!b) {
            stopOpenWatch();
        }
        syncBatchBtn();
        $("batchGo").disabled = b;
        $("batchClear").disabled = b;
        $("batchGo").textContent = b ? "Working..." : "Batch Create & Link to Premiere";
        if (!b) {
            refreshName();
        }
    }
    function jobDone(inTimeline) {
        setBusy(false);
        log("Task completed", "ok");
        note(inTimeline ? "Done: Completed successfully..." : "Task completed successfully...", "ok");
    }
    function placeInTimeline(s, comp, attempt) {
        if (attempt === 0) {
            progress("Importing into timeline track " + s.track + "...");
        }
        cs.evalScript("QBT_insert(" + JSON.stringify(comp) + "," + s.track + ")", function (r) {
            r = r || "";
            if (r.indexOf("OK") === 0) {
                log("Placed on video track " + s.track + " at the playhead (" + (r.length > 3 ? r.substr(3) : "ok") + ").", "ok");
                jobDone(true);
                return;
            }
            if (r.indexOf("ERR!") !== 0 && attempt < 3) {
                setTimeout(function () { placeInTimeline(s, comp, attempt + 1); }, 1500);
                return;
            }
            setBusy(false);
            log("Failed to import in timeline, do it manually.", "err");
            log("Details: " + (r.indexOf("ERR") === 0 ? r.substr(4) : (r || "no answer from Premiere")), "err");
            note("Failed to import in timeline, do it manually.", "err");
        });
    }
    function finishImport(s, aep, comp) {
        stopOpenWatch();
        log("Importing into Premiere...");
        progress("Importing into Premiere bin...");
        setTimeout(function () { doImport(s, aep, comp); }, 2000);
    }
    function doImport(s, aep, comp) {
        cs.evalScript("QBT_importAE(" + JSON.stringify(aep) + "," + JSON.stringify(comp) + ")", function (r) {
            if (r && r.indexOf("OK|") === 0) {
                log("Linked in Premiere bin 'Ae Linked Comp' (" + r.substr(3) + ").", "ok");
                if (s.place) {
                    placeInTimeline(s, comp, 0);
                }
                else {
                    jobDone(false);
                }
            }
            else {
                log("Import failed: " + r, "err");
                log("The After Effects project was saved here:\n" + aep + "\nYou can import it manually (File > Import).", "err");
                note("");
                setBusy(false);
            }
        });
    }
    function pollDelay(started) {
        var el = Date.now() - started, fast = !!nodeRequire();
        return el < 8000 ? (fast ? 250 : 400) : (el < 30000 ? (fast ? 500 : 800) : (fast ? 1000 : 1500));
    }
    function checkDone(done, aep, cb) {
        var req = nodeRequire(), fs, t;
        if (req) {
            try {
                fs = req("fs");
                if (fs.existsSync(done)) {
                    t = fs.readFileSync(done, "utf8").replace(/^\uFEFF/, "");
                    if (t === "") {
                        cb("");
                        return;
                    }
                    try {
                        fs.unlinkSync(done);
                    }
                    catch (e0) { }
                    cb(t);
                    return;
                }
                cb(fs.existsSync(aep) ? "AEP" : "");
                return;
            }
            catch (e) { }
        }
        cs.evalScript("QBT_checkDone(" + JSON.stringify(done) + "," + JSON.stringify(aep) + ")", cb);
    }
    function poll(s, done, aep, comp, started, aepSeen) {
        var jobKey = s.jobKey;
        if (Date.now() - started > 240000) {
            log("Timed out waiting for After Effects. Check that AE is not showing a dialog, and that 'Allow Scripts to Write Files and Access Network' is on in AE.", "err");
            if (s.batch) {
                s.batch.fail(true);
                return;
            }
            note("");
            setBusy(false);
            return;
        }
        if (!s.launched) {
            progress((s.bl || "") + "Building comp in After Effects... " + Math.round((Date.now() - started) / 1000) + "s");
        }
        checkDone(done, aep, function (r) {
            r = r || "";
            if (r.indexOf("OK|") === 0) {
                log("After Effects finished.", "ok");
                if (r.split("|")[2]) {
                    log(r.split("|")[2], "ok");
                }
                markUsed(jobKey, comp, s.compBase);
                if (s.batch) {
                    s.batch.ok(aep, comp);
                }
                else {
                    finishImport(s, aep, comp);
                }
            }
            else if (r.indexOf("ERROR|") === 0) {
                log("After Effects: " + r.substr(6), "err");
                if (s.batch) {
                    s.batch.fail(false);
                    return;
                }
                note("");
                setBusy(false);
            }
            else if (r === "AEP") {
                var now = Date.now();
                if (!aepSeen) {
                    aepSeen = now;
                }
                if (now - aepSeen > 6000) {
                    log("Project file found (no done-marker). Importing...", "ok");
                    markUsed(jobKey, comp, s.compBase);
                    if (s.batch) {
                        s.batch.ok(aep, comp);
                    }
                    else {
                        finishImport(s, aep, comp);
                    }
                    return;
                }
                setTimeout(function () { poll(s, done, aep, comp, started, aepSeen); }, pollDelay(started));
            }
            else {
                setTimeout(function () { poll(s, done, aep, comp, started, aepSeen); }, pollDelay(started));
            }
        });
    }
    $("go").onclick = function () {
        if (busy) {
            return;
        }
        if (batchReplaceOn()) {
            if (window.QBT_batchGo) {
                window.QBT_batchGo();
            }
            return;
        }
        if (batchLockOn && UI.batchBtn === "disable") {
            return;
        }
        exEnd();
        busy = true;
        $("go").disabled = true;
        readProject(function () {
            busy = false;
            if ($("status").children.length) {
                log("--------------------");
            }
            setBusy(true);
            var s = collect();
            s.jobKey = proj.key;
            var raw = JSON.stringify(s).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
            log("Sending job to After Effects...");
            progress("Sending job to After Effects...");
            cs.evalScript("QBT_startJob(" + JSON.stringify(raw) + ")", function (r) {
                if (!r || r.indexOf("OK|") !== 0) {
                    log(r || "No response from Premiere host script.", "err");
                    if (r && r.indexOf("was not found through BridgeTalk") >= 0) {
                        note("After Effects is not running...", "err");
                    }
                    else {
                        note("");
                    }
                    setBusy(false);
                    return;
                }
                var p = r.split("|");
                s.launched = (p[5] === "launched");
                if (s.launched) {
                    note("Opening After Effects...", "warn");
                    watchOpen(true);
                }
                log("Target: " + p[4] + " (" + p[5] + "). Waiting for After Effects...");
                poll(s, p[2], p[1], p[3], Date.now(), 0);
            });
        });
    };
    (function batchCreator() {
        var MAX = 20, list = $("batchList"), addBtn = $("batchAdd"), goBtn = $("batchGo"), mainText = $("text"), nameBase = DEF_BASE, nameNext = 1, liveBox = null, exU = null, exUparts = null, EX_V = PRESET_VALUES, EX_K = PRESET_CHECKS, EX_C = PRESET_COLORS;
        function boxes() { return list.children; }
        function boxText(d) { return d.getElementsByTagName("textarea")[0]; }
        function batchOn() { return boxes().length > 1; }
        function fmt(base, n) { return n <= 1 ? base : base + "_" + n; }
        function lookSnap() {
            var o = { f: { label: curFont.label, family: curFont.family, uiStyle: curFont.uiStyle, ps: curFont.ps }, v: {}, k: {}, c: {} }, i;
            for (i = 0; i < EX_V.length; i++) {
                o.v[EX_V[i]] = $(EX_V[i]).value;
            }
            for (i = 0; i < EX_K.length; i++) {
                o.k[EX_K[i]] = $(EX_K[i]).checked;
            }
            for (i = 0; i < EX_C.length; i++) {
                o.c[EX_C[i]] = getColor(EX_C[i]);
            }
            return o;
        }
        function lookDiff(cur, base) {
            var o = { f: null, v: {}, k: {}, c: {}, n: 0 }, i, id;
            if (cur.f.ps !== base.f.ps) {
                o.f = cur.f;
                o.n++;
            }
            for (i = 0; i < EX_V.length; i++) {
                id = EX_V[i];
                if (cur.v[id] !== base.v[id]) {
                    o.v[id] = cur.v[id];
                    o.n++;
                }
            }
            for (i = 0; i < EX_K.length; i++) {
                id = EX_K[i];
                if (cur.k[id] !== base.k[id]) {
                    o.k[id] = cur.k[id];
                    o.n++;
                }
            }
            for (i = 0; i < EX_C.length; i++) {
                id = EX_C[i];
                if (String(cur.c[id]).toLowerCase() !== String(base.c[id]).toLowerCase()) {
                    o.c[id] = cur.c[id];
                    o.n++;
                }
            }
            return o;
        }
        function lookMerge(base, ov) {
            var o = { f: (ov && ov.f) || base.f, v: {}, k: {}, c: {} }, id;
            for (id in base.v) {
                o.v[id] = (ov && ov.v[id] !== undefined) ? ov.v[id] : base.v[id];
            }
            for (id in base.k) {
                o.k[id] = (ov && ov.k[id] !== undefined) ? ov.k[id] : base.k[id];
            }
            for (id in base.c) {
                o.c[id] = (ov && ov.c[id] !== undefined) ? ov.c[id] : base.c[id];
            }
            return o;
        }
        function applyLook(o) { applySettings(o, EX_V, EX_K, EX_C); }
        function partsUsed(p) {
            var i;
            if (!p) {
                return false;
            }
            for (i = 0; i < p.f.length; i++) {
                if (p.f[i] || p.s[i]) {
                    return true;
                }
            }
            return false;
        }
        function captureNow() {
            var tb;
            if (!liveBox || exHold) {
                return;
            }
            liveBox.ex.ov = lookDiff(lookSnap(), exU);
            tb = boxText(liveBox);
            if (tb.value !== mainText.value) {
                tb.value = mainText.value;
                names();
            }
            liveBox.ex.parts = partsSnap();
            renderAll();
        }
        exCapture = captureNow;
        function showTextTab() {
            var tb = document.querySelector('.tab[data-tab="pText"]');
            if (tb) {
                tb.click();
            }
            setTimeout(function () { try {
                mainText.focus();
            }
            catch (e) { } }, 60);
        }
        var liveBack = null;
        function activeTabId() { var tb = document.querySelector("#tabs .tab.on"); return tb ? tb.getAttribute("data-tab") : ""; }
        function backToBox(b) {
            var box = b && b.box, tb, pg = $("pages");
            if (!box || !document.body.contains(box)) {
                return;
            }
            tb = document.querySelector('#tabs .tab[data-tab="' + (b.tab || "pAudit") + '"]');
            if (tb) {
                tb.click();
            }
            setTimeout(function () {
                var r, pr;
                pg.scrollTop = b.top;
                r = box.getBoundingClientRect();
                pr = pg.getBoundingClientRect();
                if (r.bottom < pr.top + 20 || r.top > pr.bottom - 20) {
                    pg.scrollTop += (r.top - pr.top) - 10;
                }
            }, 60);
        }
        function goLive(d) {
            if (busy || liveBox === d) {
                return;
            }
            if (liveBox) {
                stopLive(true);
            }
            if (!liveBack) {
                liveBack = { box: d, tab: activeTabId(), top: $("pages").scrollTop };
            }
            else {
                liveBack.box = d;
            }
            doSave();
            exU = lookSnap();
            exUparts = partsSnap();
            exLive = true;
            liveBox = d;
            exHold = true;
            applyLook(lookMerge(exU, d.ex.ov));
            exHold = false;
            if (d.ex.parts) {
                partsRestore(d.ex.parts);
            }
            mainText.value = boxText(d).value;
            if (d.ex.parts) {
                partsSnap();
            }
            else {
                partsClear();
            }
            exLiveText = "Exception is live: " + d.nameStr;
            refresh();
            note("");
            pvRender();
            posRender();
            drawFxPreview();
            showTextTab();
        }
        function stopLive(switching) {
            var d = liveBox, back = switching ? null : liveBack;
            if (!d) {
                return;
            }
            if (!switching) {
                liveBack = null;
            }
            captureNow();
            liveBox = null;
            exLive = false;
            exLiveText = "";
            exHold = true;
            applyLook(exU);
            exHold = false;
            partsRestore(exUparts);
            exU = null;
            exUparts = null;
            refresh();
            saveSettings();
            if (!switching) {
                note("");
                backToBox(back);
            }
        }
        exEnd = function () { stopLive(); };
        qbBatch.locked = function () { return batchOn() && !liveBox; };
        qbBatch.add = function (it) {
            var t = addBox(), d, base, cur, ov, parts;
            if (!t) {
                return false;
            }
            d = t.parentNode;
            while (d && String(d.className).indexOf("bbox") < 0) {
                d = d.parentNode;
            }
            t.value = it.text;
            base = lookSnap();
            cur = lookMerge(base, { f: it.settings.f || null, v: it.settings.v || {}, k: it.settings.k || {}, c: it.settings.c || {} });
            ov = lookDiff(cur, base);
            parts = partsUsed(it.parts) ? it.parts : null;
            if (ov.n || parts) {
                d.ex = { on: true, ov: ov.n ? ov : null, parts: parts };
            }
            refresh();
            return true;
        };
        function exitEx(d) {
            function doIt() {
                if (liveBox === d) {
                    stopLive();
                }
                d.ex = { on: false, ov: null, parts: null };
                refresh();
                note("Exception removed: " + d.nameStr, "ok");
            }
            if (liveBox === d) {
                captureNow();
            }
            if ((!d.ex.ov || !d.ex.ov.n) && !partsUsed(d.ex.parts)) {
                doIt();
                return;
            }
            ask({ msg: "Exit the exception of \"" + d.nameStr + "\"?\n\nIts own settings and part colours will be discarded and this title will use the normal settings again.",
                ok: "Proceed", okKind: "good", noKind: "danger", row: true, focus: "no" }, function (yes) { if (yes) {
                doIt();
            } });
        }
        window.QBT_syncLock = function () { syncLock(); };
        window.QBT_batchGo = function () { goBtn.onclick(); };
        function syncLock() {
            var on = batchOn() && !liveBox;
            if (batchLockOn !== on) {
                batchLockOn = on;
                noteIdleRefresh();
                syncBatchBtn();
            }
            mainText.disabled = on;
            mainText.title = liveBox ? "Exception is live: type this title here and change the settings. Press the [x] in the title bar (Close the live exception) to go back to the normal settings."
                : (on ? "Locked: the Batch Creator has more than one title box. Remove the extra boxes to edit this text again."
                    : "Drag the bottom edge to make the text box taller (up to 300px)");
            if (on) {
                try {
                    mainText.blur();
                }
                catch (e) { }
            }
            mainText.parentNode.className = "pvwrap" + (on ? " locked" : "") + (liveBox ? " exlive" : "") + (((parseInt($("rollMode").value, 10) || 0) > 0) ? " rolllive" : "");
            if (window.QBT_partBar) {
                try {
                    window.QBT_partBar();
                }
                catch (eP7) { }
            }
            liveHead();
        }
        function liveHead() {
            var fs = $("textBox"), ft = $("textLegend").querySelector(".ft"), fx = $("textLegend").querySelector(".fx"), has = fs.className.indexOf(" exlive") >= 0, rm = parseInt($("rollMode").value, 10) || 0, rl = !liveBox && rm > 0, hasR = fs.className.indexOf(" rollhead") >= 0;
            if (liveBox && !has) {
                fs.className += " exlive";
            }
            else if (!liveBox && has) {
                fs.className = fs.className.replace(" exlive", "");
            }
            if (rl && !hasR) {
                fs.className += " rollhead";
            }
            else if (!rl && hasR) {
                fs.className = fs.className.replace(" rollhead", "");
            }
            var bt = batchOn() && !liveBox && !rl, hasB = fs.className.indexOf(" batchhead") >= 0;
            if (bt && !hasB) {
                fs.className += " batchhead";
            }
            else if (!bt && hasB) {
                fs.className = fs.className.replace(" batchhead", "");
            }
            if (ft) {
                ft.textContent = liveBox ? "Live: " + liveBox.nameStr : (bt ? "Batch titler is on progress..." : (rl ? (rm >= 3 ? "Crawling" : "Rolling") + " input activated..." : "Enter your text"));
            }
            if (fx) {
                fx.title = liveBox ? "Close the live exception: back to the normal settings and to this title in the Batch Creator" : "Open or close this section";
            }
        }
        $("textLegend").addEventListener("click", function (ev) {
            var t = ev.target;
            if (liveBox && t && String(t.className).indexOf("fx") >= 0) {
                ev.stopPropagation();
                stopLive();
            }
        }, true);
        function styleBox(t) {
            var m = mainText.style;
            t.style.fontFamily = m.fontFamily;
            t.style.fontWeight = m.fontWeight;
            t.style.fontStyle = m.fontStyle;
            t.style.fontSize = m.fontSize;
            t.style.textAlign = m.textAlign;
            t.style.letterSpacing = m.letterSpacing;
            t.style.lineHeight = m.lineHeight;
            try {
                t.style.textAlignLast = m.textAlignLast;
            }
            catch (e) { }
        }
        syncBatchStyle = function () { var i; for (i = 0; i < boxes().length; i++) {
            styleBox(boxText(boxes()[i]));
        } renderAll(); };
        var nameEditor = null;
        function syncBtns(d) {
            var e = d.ex, ed = !!d.editing;
            d.bAdd.style.display = (ed || e.on) ? "none" : "";
            d.bLive.style.display = (!ed && e.on) ? "" : "none";
            d.bOut.style.display = (!ed && e.on) ? "" : "none";
            d.bOk.style.display = ed ? "" : "none";
        }
        function names() {
            var i, k = 0, n = boxes().length, d, s;
            for (i = 0; i < n; i++) {
                d = boxes()[i];
                s = d.custom ? d.custom : fmt(nameBase, nameNext + k);
                d.nameStr = s;
                d.nm.textContent = "(" + (i + 1) + "/" + MAX + "): " + s;
                d.bar.title = "(" + (i + 1) + "/" + MAX + "): " + s + "\nDouble click to give this title your own comp name";
                if (!d.custom && boxText(d).value.replace(/\s+/g, "") !== "") {
                    k++;
                }
                if (d === liveBox && exLiveText !== "Exception is live: " + s) {
                    exLiveText = "Exception is live: " + s;
                    liveHead();
                    note("");
                }
            }
        }
        onNextName = function (base, n) { nameBase = base; nameNext = n; names(); };
        function refresh() {
            var n = boxes().length, i, d, e, live;
            for (i = 0; i < n; i++) {
                d = boxes()[i];
                e = d.ex;
                live = (d === liveBox);
                d.className = "bbox" + (n === 1 ? " only" : "");
                d.bar.className = "pbar idle bbar" + (d.editing ? " editing" : "") + (e.on ? " ex" : "") + (live ? " live" : "") + (d.foc ? " foc" : "");
                syncBtns(d);
                d.bLive.className = "ibtn" + (live ? " on" : "");
                d.bLive.title = live ? "Live: press to stop and go back to the normal settings" : "Go live: show this title in the main preview and edit its exception";
                d.bX.disabled = (n === 1);
                boxText(d).disabled = live;
            }
            renderAll();
            $("batchClear").className = "blk";
            addBtn.disabled = (n >= MAX);
            addBtn.title = (n >= MAX) ? "Maximum of " + MAX + " titles reached" : "Add another title box (up to " + MAX + ")";
            names();
            syncLock();
        }
        function escH(x) { return x.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
        function mirLayer(txt, styleOf) {
            var out = "", n = txt.length, i = 0, j, st, seg;
            while (i < n) {
                st = styleOf(i);
                j = i + 1;
                while (j < n && styleOf(j) === st) {
                    j++;
                }
                seg = escH(txt.substring(i, j));
                out += st ? "<span style=\"" + st + "\">" + seg + "</span>" : seg;
                i = j;
            }
            return out + "\u200b";
        }
        function renderMir(d) {
            var t = boxText(d), e = d.ex, p = e.parts, L, cs, sc, al, outOn, shOn, ow, uf, us, f, base, usep, sbw, bg, rgb, ang, dist, shadow, txt, cl, L0, al0;
            if (e.on && e.ov && e.ov.n && d !== liveBox) {
                try {
                    L0 = lookMerge(lookSnap(), e.ov);
                    L0.f.label = L0.f.label || L0.f.ps;
                    L0.f.uiStyle = L0.f.uiStyle || "";
                    t.style.fontFamily = FACE.stack(L0.f, FACE.peek(L0.f, function () { renderAll(); }));
                    t.style.fontWeight = /BOLD/i.test(L0.f.uiStyle || "") ? "bold" : "normal";
                    t.style.fontStyle = /ITALIC|OBLIQUE/i.test(L0.f.uiStyle || "") ? "italic" : "normal";
                    t.style.letterSpacing = ((parseFloat(L0.v.tracking) || 0) / 1000) + "em";
                    t.style.lineHeight = (parseFloat(L0.v.lineSp) || 0) ? String(Math.max(0.2, 1.3 + parseFloat(L0.v.lineSp) / 100)) : "";
                    al0 = parseInt(L0.v.align, 10);
                    if (!isNaN(al0)) {
                        t.style.textAlign = TEXT_ALIGN[al0] || "center";
                        try {
                            t.style.textAlignLast = TEXT_ALIGN_LAST[al0] || "auto";
                        }
                        catch (eTa) { }
                    }
                }
                catch (eFace) {
                    styleBox(t);
                }
            }
            else if (d !== liveBox) {
                styleBox(t);
            }
            if (!e.on || d.foc || !((e.ov && e.ov.n) || partsUsed(p))) {
                d.mir.style.display = "none";
                return;
            }
            L = lookMerge(liveBox ? exU : lookSnap(), e.ov);
            cs = window.getComputedStyle(t);
            sbw = Math.max(0, t.offsetWidth - t.clientWidth - 2);
            f = L.f;
            sc = (parseInt($("pvSize").value, 10) || 12) / Math.max(1, parseFloat(L.v.size) || 60);
            al = parseInt(L.v.align, 10);
            if (isNaN(al)) {
                al = 1;
            }
            outOn = !!L.k.optOutline;
            shOn = !!L.k.optShadow;
            uf = L.c.cText;
            us = L.c.cOutline;
            usep = partsUsed(p) && p.t === t.value;
            txt = t.value;
            base = "position:absolute;left:0;top:0;right:0;margin:0;box-sizing:border-box;white-space:pre-wrap;word-wrap:break-word;" +
                "font-family:'" + String(f.family).replace(/['"\\]/g, "") + "',sans-serif;font-size:" + cs.fontSize + ";line-height:" + cs.lineHeight + ";" +
                "font-weight:" + (/BOLD/i.test(f.uiStyle || "") ? "bold" : "normal") + ";font-style:" + (/ITALIC|OBLIQUE/i.test(f.uiStyle || "") ? "italic" : "normal") + ";" +
                "letter-spacing:" + ((parseFloat(L.v.tracking) || 0) / 1000) + "em;text-align:" + (TEXT_ALIGN[al] || "center") + ";text-align-last:" + (TEXT_ALIGN_LAST[al] || "auto") + ";" +
                "padding:" + cs.paddingTop + " " + (parseFloat(cs.paddingRight) + sbw) + "px " + cs.paddingBottom + " " + cs.paddingLeft + ";";
            ow = outOn ? Math.max(0, parseFloat(L.v.outlineW) || 0) * sc : 0;
            shadow = "none";
            if (shOn) {
                rgb = hexToRgb(L.c.cShadow);
                ang = (parseFloat(L.v.shDir) || 0) * Math.PI / 180;
                dist = Math.max(0, parseFloat(L.v.shDist) || 0) * sc;
                shadow = (Math.sin(ang) * dist) + "px " + (-Math.cos(ang) * dist) + "px " + (Math.max(0, parseFloat(L.v.shSoft) || 0) * sc) + "px rgba(" +
                    Math.round(rgb[0] * 255) + "," + Math.round(rgb[1] * 255) + "," + Math.round(rgb[2] * 255) + "," + (Math.min(100, Math.max(0, parseFloat(L.v.shOp) || 0)) / 100) + ")";
            }
            cl = "";
            if (outOn || shOn) {
                cl += "<div style=\"" + base + "-webkit-text-stroke-width:" + ow + "px;text-shadow:" + shadow + ";\">" +
                    mirLayer(txt, function (i) {
                        var k = (usep && p.s[i]) || us, fl = (usep && p.f[i]) || uf;
                        return outOn ? "color:" + k + ";-webkit-text-stroke-color:" + k : "color:" + fl;
                    }) + "</div>";
            }
            cl += "<div style=\"" + base + "\">" + mirLayer(txt, function (i) { return "color:" + ((usep && p.f[i]) || uf); }) + "</div>";
            bg = L.k.optBg ? L.c.cBg : d.defBg;
            d.mir.style.backgroundColor = bg;
            d.mirIn.innerHTML = cl;
            d.mirIn.style.webkitTransform = "translateY(" + (-t.scrollTop) + "px)";
            d.mir.style.display = "block";
        }
        function renderAll() {
            var i, n = boxes().length;
            for (i = 0; i < n; i++) {
                renderMir(boxes()[i]);
            }
        }
        batchRender = renderAll;
        window.addEventListener("resize", renderAll, false);
        function mk(tag, cls, mode, title) {
            var e = document.createElement(tag);
            if (cls) {
                e.className = cls;
            }
            if (tag === "button") {
                e.type = "button";
            }
            if (mode) {
                e.setAttribute("data-mode", mode);
            }
            if (title) {
                e.title = title;
            }
            return e;
        }
        function addBox() {
            var d, row, t, wrap;
            if (boxes().length >= MAX) {
                return null;
            }
            d = mk("div", "bbox");
            d.ex = { on: false, ov: null, parts: null };
            d.nameStr = "";
            d.custom = "";
            row = mk("div", "brow");
            d.bar = mk("div", "pbar idle bbar");
            d.nm = mk("span", "ntxt");
            d.bar.appendChild(d.nm);
            d.bAdd = mk("button", "ibtn", "exadd", "Add Exception: this title can have its own font, colours, size, outline, shadow, position... while the others keep the normal settings");
            d.bLive = mk("button", "ibtn", "exlive", "");
            d.bOut = mk("button", "ibtn", "exout", "Exit exception: this title uses the normal settings again");
            d.bX = mk("button", "ibtn", "x", "Remove this title box");
            d.bOk = mk("button", "ibtn", "ok", "Set this comp name (Enter)");
            d.bOk.style.display = "none";
            row.appendChild(d.bar);
            row.appendChild(d.bOk);
            row.appendChild(d.bAdd);
            row.appendChild(d.bLive);
            row.appendChild(d.bOut);
            row.appendChild(d.bX);
            (function nameEdit() {
                var inp = null;
                function stop() {
                    var x = inp;
                    inp = null;
                    if (x && x.parentNode) {
                        d.bar.removeChild(x);
                    }
                    d.editing = false;
                    d.bar.className = d.bar.className.replace(/\s*\bediting\b/g, "");
                    d.nm.style.display = "";
                    syncBtns(d);
                    if (nameEditor && nameEditor.d === d) {
                        nameEditor = null;
                    }
                }
                function commit() {
                    var v;
                    if (!inp) {
                        return;
                    }
                    v = cleanName(inp.value).substring(0, 80);
                    d.custom = v;
                    stop();
                    names();
                    note(v ? "Comp name set: " + v : "Comp name back to automatic: " + d.nameStr, "ok");
                }
                d.bar.ondblclick = function (e) {
                    if (busy || inp) {
                        return;
                    }
                    if (nameEditor) {
                        nameEditor.commit();
                    }
                    if (e && e.preventDefault) {
                        e.preventDefault();
                    }
                    inp = document.createElement("input");
                    inp.type = "text";
                    inp.value = d.custom;
                    inp.placeholder = d.nameStr;
                    inp.maxLength = 80;
                    inp.title = "Type the comp name for this title (it shows in the Premiere bin). Enter or the tick sets it, Esc cancels, empty = automatic name";
                    inp.style.cssText = "-webkit-flex:1 1 0;flex:1 1 0;min-width:0;width:100%;height:18px;margin:0;padding:0 2px;border:0;background:transparent;color:inherit;font:inherit;outline:none;box-shadow:none;";
                    inp.onkeydown = function (ev) {
                        if (ev.keyCode === 13) {
                            ev.preventDefault();
                            commit();
                        }
                        else if (ev.keyCode === 27) {
                            ev.preventDefault();
                            stop();
                        }
                        ev.stopPropagation();
                    };
                    inp.onblur = function () { commit(); };
                    d.nm.style.display = "none";
                    d.bar.appendChild(inp);
                    d.editing = true;
                    syncBtns(d);
                    d.bar.className += " editing";
                    nameEditor = { d: d, commit: commit };
                    inp.focus();
                    inp.select();
                };
                d.bOk.onmousedown = function (e) { e.preventDefault(); };
                d.bOk.onclick = commit;
            })();
            t = document.createElement("textarea");
            t.oninput = names;
            d.bAdd.onclick = function () { if (busy) {
                return;
            } d.ex.on = true; refresh(); note("Exception added to " + d.nameStr + ": press its round Go live button to edit it live.", "ok"); };
            d.bLive.onclick = function () { if (busy) {
                return;
            } if (liveBox === d) {
                stopLive();
            }
            else {
                goLive(d);
            } };
            d.bOut.onclick = function () { if (busy) {
                return;
            } exitEx(d); };
            d.bX.onclick = function () { if (boxes().length > 1) {
                if (liveBox === d) {
                    stopLive();
                }
                list.removeChild(d);
                refresh();
            } };
            wrap = mk("div", "bwrap");
            d.mir = mk("div", "bmir");
            d.mirIn = mk("div", "");
            d.mir.appendChild(d.mirIn);
            wrap.appendChild(t);
            wrap.appendChild(d.mir);
            t.onfocus = function () { d.foc = true; d.bar.className = d.bar.className.replace(/ foc/g, "") + " foc"; renderMir(d); };
            t.onblur = function () { d.foc = false; d.bar.className = d.bar.className.replace(/ foc/g, ""); renderMir(d); };
            t.onscroll = function () { d.mirIn.style.webkitTransform = "translateY(" + (-t.scrollTop) + "px)"; };
            d.appendChild(row);
            d.appendChild(wrap);
            list.appendChild(d);
            styleBox(t);
            try {
                d.defBg = window.getComputedStyle(t).backgroundColor;
            }
            catch (eBg) {
                d.defBg = "#222";
            }
            refresh();
            return t;
        }
        addBtn.onclick = function () { var t = addBox(); if (t) {
            t.focus();
        } };
        function texts() {
            var out = [], i, v;
            for (i = 0; i < boxes().length; i++) {
                v = boxText(boxes()[i]).value;
                if (v.replace(/\s+/g, "") !== "") {
                    out.push(v);
                }
            }
            return out;
        }
        function items() {
            var out = [], i, d, v;
            for (i = 0; i < boxes().length; i++) {
                d = boxes()[i];
                v = boxText(d).value;
                if (v.replace(/\s+/g, "") !== "") {
                    out.push({ name: d.custom || "", text: v, ov: (d.ex.on && d.ex.ov && d.ex.ov.n) ? d.ex.ov : null, parts: (d.ex.on && partsUsed(d.ex.parts)) ? d.ex.parts : null });
                }
            }
            return out;
        }
        function collectFor(it) {
            var s, base, main0 = null;
            if (!it.ov && !it.parts) {
                return collect(it.text);
            }
            base = lookSnap();
            exHold = true;
            try {
                if (it.ov) {
                    applyLook(lookMerge(base, it.ov));
                }
                if (it.parts) {
                    main0 = partsSnap();
                    partsRestore(it.parts);
                    mainText.value = it.text;
                    partsSnap();
                }
                s = collect(it.text, !!it.parts);
            }
            finally {
                if (main0) {
                    partsRestore(main0);
                }
                if (it.ov) {
                    applyLook(base);
                }
                exHold = false;
            }
            return s;
        }
        function importAll(built, failed, total) {
            var k = 0, ok = 0, badImp = [];
            stopOpenWatch();
            if (!built.length) {
                setBusy(false);
                log("Batch failed: no title could be built.", "err");
                note("Batch failed: nothing was built.", "err");
                return;
            }
            log("All titles are built (" + built.length + "). Importing into Premiere...");
            function finish() {
                var bad = failed.concat(badImp), msg = ok + " of " + total + " titles linked in Premiere" + (placeB ? (" (" + placed + " placed on the timeline)") : "") + ".", all;
                bad.sort(function (a, b) { return a - b; });
                all = (!bad.length && ok === total);
                if (bad.length) {
                    msg += " Failed: " + bad.join(", ") + " (see log).";
                }
                setBusy(false);
                log(msg, all ? "ok" : "err");
                note(msg, all ? "ok" : "err");
            }
            var placeB = $("optPlace").checked && $("optPlaceBatch").checked, placeTrack = Math.max(1, Math.round(num("trackNo", 1))), placed = 0;
            function placeOne(r, attempt, next) {
                note("Placing " + k + " of " + built.length + " on timeline track " + placeTrack + "...", "work");
                cs.evalScript("QBT_insert(" + JSON.stringify(r.comp) + "," + placeTrack + ",1)", function (res) {
                    res = res || "";
                    if (res.indexOf("OK") === 0) {
                        placed++;
                        log("Title " + r.i + " placed on video track " + placeTrack + ".", "ok");
                        next();
                        return;
                    }
                    if (res.indexOf("ERR!") !== 0 && attempt < 3) {
                        setTimeout(function () { placeOne(r, attempt + 1, next); }, 1500);
                        return;
                    }
                    log("Title " + r.i + " could not be placed on the timeline, do it manually.\nDetails: " + (res.indexOf("ERR") === 0 ? res.substr(4) : (res || "no answer from Premiere")), "err");
                    next();
                });
            }
            function one() {
                var r;
                if (k >= built.length) {
                    finish();
                    return;
                }
                r = built[k];
                k++;
                note("Importing " + k + " of " + built.length + ": select the comp and press OK in Premiere...", "warn");
                cs.evalScript("QBT_importAE(" + JSON.stringify(r.aep) + "," + JSON.stringify(r.comp) + ")", function (res) {
                    if (res && res.indexOf("OK|") === 0) {
                        ok++;
                        log("Title " + r.i + " linked in bin 'Ae Linked Comp' (" + res.substr(3) + ").", "ok");
                        if (placeB) {
                            placeOne(r, 0, function () { setTimeout(one, 400); });
                            return;
                        }
                    }
                    else {
                        badImp.push(r.i);
                        log("Title " + r.i + " import failed: " + res + "\nThe After Effects project was saved here:\n" + r.aep, "err");
                    }
                    setTimeout(one, 400);
                });
            }
            setTimeout(one, 2000);
        }
        goBtn.onclick = function () {
            var total;
            if (busy) {
                return;
            }
            if (liveBox) {
                stopLive();
            }
            total = texts().length;
            if (!total) {
                log("Batch Creator: type a title in at least one box.", "err");
                note("Batch Creator: type a title first.", "warn");
                return;
            }
            ask({ msg: "Batch Create will send " + total + " title" + (total === 1 ? "" : "s") + " to After Effects one after another and import them all into Premiere.\n\nThis can take a while, and Premiere will ask you to press OK for each one.\n\nDo you want to proceed?",
                ok: "Proceed", okKind: "good", noKind: "danger", row: true }, function (yes) { if (yes) {
                runBatch();
            } });
        };
        function runBatch() {
            var T = items(), total = T.length, skipped = boxes().length - total;
            if (busy) {
                return;
            }
            busy = true;
            goBtn.disabled = true;
            $("go").disabled = true;
            readProject(function () {
                var built = [], failed = [], idx = 0;
                busy = false;
                if ($("status").children.length) {
                    log("--------------------");
                }
                setBusy(true);
                log("Batch: " + total + " title" + (total === 1 ? "" : "s") +
                    (skipped ? " (" + skipped + " empty box" + (skipped === 1 ? "" : "es") + " skipped)" : "") + ". Importing into the bin only.");
                function next() {
                    var i, s, raw;
                    if (idx >= total) {
                        importAll(built, failed, total);
                        return;
                    }
                    i = idx + 1;
                    idx = i;
                    s = collectFor(T[i - 1]);
                    if (T[i - 1].ov || T[i - 1].parts) {
                        log("Title " + i + ": uses its own exception settings.");
                    }
                    s.jobKey = proj.key;
                    s.place = false;
                    if (T[i - 1].name) {
                        (function () {
                            var j, same = 0, nm = T[i - 1].name.toLowerCase();
                            for (j = 0; j < i - 1; j++) {
                                if (T[j].name && T[j].name.toLowerCase() === nm) {
                                    same++;
                                }
                            }
                            s.compBase = T[i - 1].name;
                            s.compLast = same;
                        })();
                    }
                    s.bl = i + "/" + total + " ";
                    raw = JSON.stringify(s).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
                    log("Title " + i + " of " + total + ": sending to After Effects...");
                    progress(s.bl + "Sending to After Effects...");
                    cs.evalScript("QBT_startJob(" + JSON.stringify(raw) + ")", function (r) {
                        var p;
                        if (!r || r.indexOf("OK|") !== 0) {
                            log("Title " + i + ": " + (r || "No response from Premiere host script."), "err");
                            failed.push(i);
                            if (r && r.indexOf("was not found through BridgeTalk") >= 0) {
                                idx = total;
                            }
                            setTimeout(next, 300);
                            return;
                        }
                        p = r.split("|");
                        s.launched = (p[5] === "launched");
                        if (s.launched) {
                            note("Opening After Effects...", "warn");
                            watchOpen(true);
                        }
                        s.batch = {
                            ok: function (aep, comp) { built.push({ i: i, aep: aep, comp: comp }); log("Title " + i + " built (" + comp + ").", "ok"); setTimeout(next, 600); },
                            fail: function (abort) { failed.push(i); if (abort) {
                                idx = total;
                            } setTimeout(next, 300); }
                        };
                        poll(s, p[2], p[1], p[3], Date.now(), 0);
                    });
                }
                next();
            });
        }
        $("batchClear").onclick = function () {
            if (busy) {
                return;
            }
            if (boxes().length <= 1 && !texts().length) {
                return;
            }
            ask({ msg: "Clear all title boxes?\n\nEvery text will be erased and only one empty box stays. This cannot be undone.",
                ok: "Proceed", okKind: "good", noKind: "danger", row: true, focus: "no" }, function (yes) {
                if (!yes) {
                    return;
                }
                if (liveBox) {
                    stopLive();
                }
                while (boxes().length > 1) {
                    list.removeChild(list.lastChild);
                }
                boxes()[0].ex = { on: false, ov: null, parts: null };
                boxText(boxes()[0]).value = "";
                refresh();
                log("Batch Creator: all title boxes cleared.", "ok");
                note("All title boxes cleared.", "ok");
            });
        };
        addBox();
    })();
    cs.evalScript("QBT_getSessionDir()", function (d) {
        if (d && d !== "undefined" && d !== "null" && d !== "EvalScript error.") {
            $("outDir").value = d;
        }
        checkProject();
    });
    (function richPreview() {
        var t = $("text"), wrap = t.parentNode, inner, lH, lA, lB;
        var chFill = [], chStroke = [];
        var lastText = t.value;
        var selA = 0, selB = 0;
        var partOn = false, focused = false, pending = false, mouseDown = false, lastMode = null;
        var KEEP = { text: 1, pvSize: 1, cText: 1, cOutline: 1, partAll: 1, partReset: 1, partDone: 1, pvBtn: 1, openAE: 1, ping: 1, go: 1, resetAll: 1 };
        var lockList = null;
        var TITLES = { cText: $("cText").title, cOutline: $("cOutline").title };
        var i0;
        for (i0 = 0; i0 < lastText.length; i0++) {
            chFill.push(null);
            chStroke.push(null);
        }
        (function build() {
            var m = document.createElement("div"), k, names = ["pvh", "pva", "pvb"], ls = [];
            m.id = "pvMirror";
            inner = document.createElement("div");
            inner.id = "pvInner";
            for (k = 0; k < 3; k++) {
                ls[k] = document.createElement("div");
                ls[k].className = "pvl " + names[k];
                inner.appendChild(ls[k]);
            }
            lH = ls[0];
            lA = ls[1];
            lB = ls[2];
            m.appendChild(inner);
            wrap.insertBefore(m, t);
        })();
        function reconcile() {
            var a = lastText, b = t.value, p = 0, s = 0, rem, ins, i, nf = [], ns = [], f = null, k = null;
            if (a === b) {
                return;
            }
            while (p < a.length && p < b.length && a.charAt(p) === b.charAt(p)) {
                p++;
            }
            while (s < a.length - p && s < b.length - p && a.charAt(a.length - 1 - s) === b.charAt(b.length - 1 - s)) {
                s++;
            }
            rem = a.length - p - s;
            ins = b.length - p - s;
            if (p > 0 && p + rem < a.length) {
                if (chFill[p - 1] === chFill[p + rem]) {
                    f = chFill[p - 1];
                }
                if (chStroke[p - 1] === chStroke[p + rem]) {
                    k = chStroke[p - 1];
                }
            }
            for (i = 0; i < ins; i++) {
                nf.push(f);
                ns.push(k);
            }
            Array.prototype.splice.apply(chFill, [p, rem].concat(nf));
            Array.prototype.splice.apply(chStroke, [p, rem].concat(ns));
            lastText = b;
        }
        function readSel() {
            if (typeof t.selectionStart !== "number") {
                return;
            }
            selA = t.selectionStart;
            selB = t.selectionEnd;
        }
        function hasSel() { return selB > selA && selB <= t.value.length; }
        function modeNow() { return !t.disabled && hasSel() && !(selA === 0 && selB === t.value.length); }
        function collapse() { selA = selB = Math.min(selB, t.value.length); try {
            t.setSelectionRange(selB, selB);
        }
        catch (e) { } }
        function pvColorFor(id) {
            var arr, i, v = null;
            if (!partOn || (id !== "cText" && id !== "cOutline")) {
                return getColor(id);
            }
            arr = (id === "cText") ? chFill : chStroke;
            for (i = selA; i < selB; i++) {
                if (t.value.charAt(i) !== "\n") {
                    v = arr[i];
                    break;
                }
            }
            return v || getColor(id);
        }
        function pvApplyColor(id, hex) {
            var arr, i;
            if (!partOn || (id !== "cText" && id !== "cOutline")) {
                return false;
            }
            arr = (id === "cText") ? chFill : chStroke;
            for (i = selA; i < selB; i++) {
                if (t.value.charAt(i) !== "\n") {
                    arr[i] = hex;
                }
            }
            $(id).style.backgroundColor = hex;
            sceneRev++;
            schedule();
            return true;
        }
        function refreshSwatches() {
            var ids = ["cText", "cOutline"], i;
            for (i = 0; i < 2; i++) {
                $(ids[i]).style.backgroundColor = partOn ? pvColorFor(ids[i]) : getColor(ids[i]);
                $(ids[i]).title = partOn ? (ids[i] === "cText" ? "Color of the selected text only" : "Outline color of the selected text only") : TITLES[ids[i]];
            }
        }
        function buildLockList() {
            var roots = [$("pText"), $("pOut")], els = [], r, q, i, e, forId, row, walk, skip;
            for (r = 0; r < roots.length; r++) {
                q = roots[r].querySelectorAll("input, select, button, label, .combo");
                for (i = 0; i < q.length; i++) {
                    e = q[i];
                    if (KEEP[e.id]) {
                        continue;
                    }
                    if (e.tagName === "LABEL") {
                        forId = e.getAttribute("for");
                        if (forId) {
                            if (KEEP[forId]) {
                                continue;
                            }
                        }
                        else if (!e.querySelector("input")) {
                            row = e.parentNode;
                            if (row && (row.querySelector("#cText") || row.querySelector("#cOutline"))) {
                                continue;
                            }
                        }
                    }
                    skip = false;
                    walk = e.parentNode;
                    while (walk && walk !== roots[r]) {
                        if (walk.__plk) {
                            skip = true;
                            break;
                        }
                        walk = walk.parentNode;
                    }
                    if (skip) {
                        continue;
                    }
                    e.__plk = true;
                    els.push(e);
                }
            }
            return els;
        }
        function setLocks(on) {
            var i;
            if (!lockList) {
                lockList = buildLockList();
            }
            for (i = 0; i < lockList.length; i++) {
                if (on) {
                    lockList[i].classList.add("partlock");
                }
                else {
                    lockList[i].classList.remove("partlock");
                }
            }
        }
        function insideLock(n) {
            while (n && n.nodeType === 1) {
                if (n.__plk) {
                    return true;
                }
                n = n.parentNode;
            }
            return false;
        }
        document.addEventListener("focus", function (e) { if (partOn && insideLock(e.target)) {
            try {
                e.target.blur();
            }
            catch (x) { }
        } }, true);
        function countParts() {
            var n = 0, i, prev = "", cur;
            for (i = 0; i < chFill.length; i++) {
                cur = (chFill[i] || "") + "|" + (chStroke[i] || "");
                if (cur !== "|" && cur !== prev) {
                    n++;
                }
                prev = cur;
            }
            return n;
        }
        window.QBT_partBar = function () { syncBar(); };
        function syncBar() {
            var bar = $("partBar"), msg = $("partMsg"), n = countParts(), s, txt, tip;
            if (partOn) {
                s = t.value.substring(selA, selB).replace(/\s+/g, " ");
                if (s.length > 20) {
                    s = s.substr(0, 20) + "...";
                }
                txt = "Partially selected for changes...";
                tip = "Selected: \"" + s + "\" - Text color and Outline color only";
                if (!$("optOutline").checked) {
                    tip += " (Outline is off)";
                }
                bar.className = "pbar";
            }
            else {
                txt = "Partial selection is not enabled...";
                tip = n ? (n + (n === 1 ? " part has" : " parts have") + " its own colour") : "Select a word to colour it separately";
                bar.className = "pbar idle";
            }
            if (partNoteOn !== partOn) {
                partNoteOn = partOn;
                noteIdleRefresh();
            }
            msg.textContent = txt;
            bar.title = tip;
            $("partCnt").textContent = partOn ? ((selB - selA) + " of " + t.value.length + " ch") : (t.value.length + " ch" + (n ? " \u00b7 " + n + (n === 1 ? " part" : " parts") : ""));
            $("partAll").style.display = partOn ? "none" : "";
            $("partAll").disabled = !n;
            $("partReset").style.display = partOn ? "" : "none";
            $("partDone").style.display = partOn ? "" : "none";
        }
        function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
        function layerHtml(styleOf, caretAt) {
            var txt = t.value, n = txt.length, out = "", i = 0, j, st, seg;
            while (i < n) {
                st = styleOf(i);
                j = i + 1;
                while (j < n && j !== caretAt && styleOf(j) === st) {
                    j++;
                }
                if (i === caretAt) {
                    out += "<span class=\"pvcaret\"></span>";
                }
                seg = esc(txt.substring(i, j));
                out += st ? "<span style=\"" + st + "\">" + seg + "</span>" : seg;
                i = j;
            }
            if (caretAt === n) {
                out += "<span class=\"pvcaret\"></span>";
            }
            return out + "\u200b";
        }
        function syncStyle() {
            var c = window.getComputedStyle(t), ls = [lH, lA, lB], i, st, sbw;
            sbw = Math.max(0, t.offsetWidth - t.clientWidth - 2);
            for (i = 0; i < 3; i++) {
                st = ls[i].style;
                st.fontFamily = c.fontFamily;
                st.fontSize = c.fontSize;
                st.fontWeight = c.fontWeight;
                st.fontStyle = c.fontStyle;
                st.letterSpacing = c.letterSpacing;
                st.lineHeight = c.lineHeight;
                st.textAlign = c.textAlign;
                try {
                    st.textAlignLast = c.textAlignLast;
                }
                catch (e) { }
                st.paddingRight = (6 + sbw) + "px";
            }
            inner.style.webkitTransform = "translateY(" + (-t.scrollTop) + "px)";
        }
        function applyMode() {
            document.body.classList[partOn ? "add" : "remove"]("partmode");
            setLocks(partOn);
            refreshSwatches();
            if (cp.target === "cText" || cp.target === "cOutline") {
                cpClose();
            }
            lastMode = partOn;
        }
        function doRender() {
            var uf, us, outOn, shOn, sc, ow, rgb, ang, dist, caret, hl;
            pending = false;
            reconcile();
            partOn = modeNow();
            if (partOn !== lastMode) {
                applyMode();
            }
            else if (partOn) {
                refreshSwatches();
            }
            syncBar();
            syncStyle();
            uf = getColor("cText");
            us = getColor("cOutline");
            outOn = $("optOutline").checked;
            shOn = $("optShadow").checked;
            sc = (parseInt($("pvSize").value, 10) || 12) / Math.max(1, num("size", 60));
            wrap.style.backgroundColor = $("optBg").checked ? getColor("cBg") : "";
            ow = outOn ? Math.max(0, num("outlineW", 4)) * sc : 0;
            lA.style.webkitTextStrokeWidth = ow + "px";
            if (shOn) {
                rgb = hexToRgb(getColor("cShadow"));
                ang = num("shDir", 135) * Math.PI / 180;
                dist = Math.max(0, num("shDist", 8)) * sc;
                lA.style.textShadow = (Math.sin(ang) * dist) + "px " + (-Math.cos(ang) * dist) + "px " + (Math.max(0, num("shSoft", 10)) * sc) + "px rgba(" +
                    Math.round(rgb[0] * 255) + "," + Math.round(rgb[1] * 255) + "," + Math.round(rgb[2] * 255) + "," + (Math.min(100, Math.max(0, num("shOp", 60))) / 100) + ")";
            }
            else {
                lA.style.textShadow = "none";
            }
            lA.style.display = (outOn || shOn) ? "block" : "none";
            caret = (focused && !hasSel() && !t.disabled) ? selA : -1;
            hl = hasSel();
            lH.innerHTML = layerHtml(function (i) { return (hl && i >= selA && i < selB) ? "background:" + (UI.sel || "rgba(64,152,227,.55)") : ""; }, -1);
            if (lA.style.display !== "none") {
                lA.innerHTML = layerHtml(function (i) {
                    var k = chStroke[i] || us, f = chFill[i] || uf;
                    return outOn ? "color:" + k + ";-webkit-text-stroke-color:" + k : "color:" + f;
                }, -1);
            }
            lB.innerHTML = layerHtml(function (i) { return "color:" + (chFill[i] || uf); }, caret);
        }
        function schedule() { if (pending) {
            return;
        } pending = true; raf(doRender); }
        function onSel() { readSel(); schedule(); }
        t.addEventListener("input", onSel, false);
        t.addEventListener("keyup", onSel, false);
        t.addEventListener("keydown", function () { setTimeout(onSel, 0); }, false);
        t.addEventListener("select", onSel, false);
        t.addEventListener("mousedown", function () { mouseDown = true; setTimeout(onSel, 0); }, false);
        t.addEventListener("mousemove", function () { if (mouseDown) {
            onSel();
        } }, false);
        t.addEventListener("focus", function () { focused = true; onSel(); }, false);
        t.addEventListener("blur", function () { focused = false; schedule(); }, false);
        t.addEventListener("scroll", function () { inner.style.webkitTransform = "translateY(" + (-t.scrollTop) + "px)"; }, false);
        document.addEventListener("mouseup", function () { if (mouseDown) {
            mouseDown = false;
            onSel();
            setTimeout(onSel, 0);
        } }, false);
        $("partDone").onclick = function () { collapse(); t.focus(); schedule(); };
        function clearParts(from, to) {
            var i;
            for (i = from; i < to; i++) {
                chFill[i] = null;
                chStroke[i] = null;
            }
            if (partOn) {
                refreshSwatches();
            }
            saveSettings();
        }
        $("partReset").onclick = function () { clearParts(selA, selB); };
        $("partAll").onclick = function () {
            ask({ msg: "Are you sure?", ok: "Yes", no: "No", danger: true, yesFirst: true }, function (yes) {
                if (yes) {
                    clearParts(0, chFill.length);
                }
            });
        };
        (function layoutEvents() {
            var tabs = document.querySelectorAll(".tab"), i;
            for (i = 0; i < tabs.length; i++) {
                tabs[i].addEventListener("click", function () { setTimeout(schedule, 0); }, false);
            }
            window.addEventListener("resize", schedule, false);
            t.addEventListener("mouseup", function () { setTimeout(schedule, 0); }, false);
            window.addEventListener("load", schedule, false);
            setTimeout(schedule, 400);
        })();
        partsExport = function () {
            var r = [], i = 0, j, f, k, n;
            reconcile();
            n = chFill.length;
            while (i < n) {
                f = chFill[i];
                k = chStroke[i];
                j = i + 1;
                while (j < n && chFill[j] === f && chStroke[j] === k) {
                    j++;
                }
                if (f || k) {
                    r.push([i, j, f, k]);
                }
                i = j;
            }
            return r.length ? { t: t.value, r: r } : null;
        };
        (function load() {
            var p = (typeof SAVED !== "undefined" && SAVED) ? SAVED.p : null, i, j, r, f, k;
            if (!p || p.t !== t.value || !p.r) {
                return;
            }
            for (i = 0; i < p.r.length; i++) {
                r = p.r[i];
                f = parseHex(r[2]);
                k = parseHex(r[3]);
                for (j = Math.max(0, r[0]); j < Math.min(r[1], chFill.length); j++) {
                    chFill[j] = f;
                    chStroke[j] = k;
                }
            }
        })();
        partsSnap = function () { reconcile(); return { t: t.value, f: chFill.slice(), s: chStroke.slice() }; };
        partsRestore = function (p) {
            if (p) {
                t.value = p.t;
                lastText = p.t;
                chFill = p.f.slice();
                chStroke = p.s.slice();
            }
            selA = selB = 0;
            schedule();
        };
        partsClear = function () {
            var i;
            lastText = t.value;
            chFill = [];
            chStroke = [];
            for (i = 0; i < lastText.length; i++) {
                chFill.push(null);
                chStroke.push(null);
            }
            selA = selB = 0;
            schedule();
        };
        partsForJob = function (txt) {
            var out = [], n, i, j, kk = 0, vv = 0, c, cpi = [], vis = [], uf, us, outOn;
            function key(x) {
                var f = chFill[x], k = outOn ? chStroke[x] : null;
                if (f && f.toLowerCase() === uf) {
                    f = null;
                }
                if (k && k.toLowerCase() === us) {
                    k = null;
                }
                return (f || "") + "|" + (k || "");
            }
            reconcile();
            if (txt !== t.value || !txt.length) {
                return out;
            }
            n = txt.length;
            uf = getColor("cText").toLowerCase();
            us = getColor("cOutline").toLowerCase();
            outOn = $("optOutline").checked;
            for (i = 0; i < n; i++) {
                cpi[i] = kk;
                vis[i] = vv;
                c = txt.charCodeAt(i);
                if (c >= 0xD800 && c <= 0xDBFF && i + 1 < n) {
                    i++;
                    cpi[i] = kk;
                    vis[i] = vv;
                    vv++;
                }
                else if (c === 13 && i + 1 < n && txt.charCodeAt(i + 1) === 10) {
                    i++;
                    cpi[i] = kk;
                    vis[i] = vv;
                }
                else if (c !== 10 && c !== 13 && c !== 0x2028 && c !== 0x2029 && c !== 3) {
                    vv++;
                }
                kk++;
            }
            cpi[n] = kk;
            vis[n] = vv;
            i = 0;
            while (i < n) {
                j = i + 1;
                while (j < n && key(j) === key(i)) {
                    j++;
                }
                if (key(i) !== "|") {
                    out.push({ a: cpi[i], b: cpi[j], va: vis[i], vb: vis[j], f: chFill[i] && key(i).charAt(0) !== "|" ? hexToRgb(chFill[i]) : null,
                        s: outOn && chStroke[i] && key(i).split("|")[1] ? hexToRgb(chStroke[i]) : null });
                }
                i = j;
            }
            return out;
        };
        (function hookStyle() {
            var prev = syncBatchStyle;
            syncBatchStyle = function () { prev(); schedule(); };
        })();
        partColorFor = pvColorFor;
        pvRender = schedule;
        partApplyColor = pvApplyColor;
        schedule();
    })();
    var HIST_SKIP = { text: 1, pvSize: 1 };
    var dotsTimer = null, dotsSecs = null;
    function dotsBuild() {
        var list = document.querySelectorAll("#pText > fieldset.acc, #pOut > fieldset.acc"), ids = P_VALUES.concat(P_CHECKS, P_COLORS), i, k, el;
        dotsSecs = [];
        for (i = 0; i < list.length; i++) { dotsSecs.push({ fs: list[i], ids: [] }); }
        for (i = 0; i < ids.length; i++) {
            if (HIST_SKIP[ids[i]]) { continue; }
            el = $(ids[i]);
            for (sec = el; sec && sec.parentNode; sec = sec.parentNode) {
                if (sec.tagName === "FIELDSET" && sec.className.indexOf("acc") >= 0 && sec.parentNode.id !== "pAudit") {
                    for (k = 0; k < dotsSecs.length; k++) { if (dotsSecs[k].fs === sec) { dotsSecs[k].ids.push(ids[i]); } }
                    break;
                }
            }
        }
    }
    function dotsLive(el) {
        var n;
        if (el.disabled || (el.className && String(el.className).indexOf("dim") >= 0)) { return false; }
        for (n = el.parentNode; n && n.tagName !== "FIELDSET"; n = n.parentNode) {
            if ((" " + n.className + " ").indexOf(" off ") >= 0 || n.style.display === "none") { return false; }
        }
        return true;
    }
    function dotsDiff(id) {
        var el = $(id), d;
        if (!dotsLive(el)) { return false; }
        if (P_COLORS.indexOf(id) >= 0) { return String(getColor(id)).toLowerCase() !== String(DEFAULTS.c[id]).toLowerCase(); }
        if (P_CHECKS.indexOf(id) >= 0) { return !!el.checked !== !!DEFAULTS.k[id]; }
        d = DEFAULTS.v[id];
        return String(el.value) !== String(d === undefined ? "" : d);
    }
    function dotsRun() {
        var i, k, on, lg, hd;
        dotsTimer = null;
        if (!dotsSecs) { dotsBuild(); }
        for (i = 0; i < dotsSecs.length; i++) {
            on = false;
            for (k = 0; k < dotsSecs[i].ids.length && !on; k++) { on = dotsDiff(dotsSecs[i].ids[k]); }
            lg = null;
            hd = null;
            for (k = 0; k < dotsSecs[i].fs.children.length; k++) {
                if (dotsSecs[i].fs.children[k].tagName === "LEGEND") { lg = dotsSecs[i].fs.children[k]; }
                else if (dotsSecs[i].fs.children[k].className.indexOf("acch") >= 0) { hd = dotsSecs[i].fs.children[k]; }
            }
            on = on;
            [lg, hd].forEach(function (e) {
                var has;
                if (!e) { return; }
                has = (" " + e.className + " ").indexOf(" qbmod ") >= 0;
                if (on && !has) { e.className += " qbmod"; }
                else if (!on && has) { e.className = e.className.replace(/\s*\bqbmod\b/g, ""); }
            });
        }
    }
    function dotsNote() {
        if (exHold) { return; }
        clearTimeout(dotsTimer);
        dotsTimer = setTimeout(dotsRun, 120);
    }
    setTimeout(dotsRun, 0);
})();
