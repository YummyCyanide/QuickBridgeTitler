function __qbtBuildTextAEP(s, aepPath, donePath, compName) {
    function finish(msg) {
        try {
            var f = new File(donePath);
            f.encoding = "UTF-8";
            f.open("w");
            f.write(msg);
            f.close();
        }
        catch (e) { }
    }
    try {
        var CURRENT_DIR = s.dir;
        var DIRMAP = [
            { u: 1, r: 0, rnd: 0 },
            { u: 1, r: 1, rnd: 0 },
            { u: 1, r: 0, rnd: 1 },
            { u: 4, r: 0, rnd: 0 },
            { u: 4, r: 1, rnd: 0 },
            { u: 4, r: 0, rnd: 1 },
            { u: 3, r: 0, rnd: 1 },
            { u: 3, r: 0, rnd: 0 },
            { u: 3, r: 1, rnd: 0 }
        ];
        var DM = DIRMAP[CURRENT_DIR] || DIRMAP[0];
        var INTERP = [
            { t: "bez", a: 33, b: 85 },
            { t: "lin" },
            { t: "bez", a: 65, b: 65 },
            { t: "bez", a: 0.1, b: 70 },
            { t: "bez", a: 70, b: 0.1 },
            { t: "bez", a: 0.1, b: 92 },
            { t: "bez", a: 92, b: 0.1 },
            { t: "bez", a: 33.33, b: 33.33 },
            { t: "bez", a: 25, b: 25 },
            { t: "bez", a: 40, b: 80 },
            { t: "bez", a: 55, b: 85 },
            { t: "bez", a: 76, b: 76 },
            { t: "bez", a: 90, b: 90 },
            { t: "bez", a: 0.1, b: 45 },
            { t: "bez", a: 45, b: 0.1 },
            { t: "bez", a: 15, b: 75 }
        ];
        var IP = INTERP[s.interp] || INTERP[0];
        var SIP = INTERP[(s.shpInterp !== undefined && s.shpInterp !== null) ? s.shpInterp : s.interp] || INTERP[0];
        var PASS_OUT = false, OUT_START = 0, OUT_DUR = 0, OUT_REVERSE = !!s.endReverse;
        function applyEase(prop) {
            if (IP.t === "lin") {
                try {
                    prop.setInterpolationTypeAtKey(1, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
                    prop.setInterpolationTypeAtKey(2, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
                }
                catch (eLn) { }
                return;
            }
            try {
                prop.setInterpolationTypeAtKey(1, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
            }
            catch (eB1) { }
            try {
                prop.setInterpolationTypeAtKey(2, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
            }
            catch (eB2) { }
            try {
                prop.setTemporalEaseAtKey(1, [new KeyframeEase(0, IP.a)], [new KeyframeEase(0, IP.a)]);
                prop.setTemporalEaseAtKey(2, [new KeyframeEase(0, IP.b)], [new KeyframeEase(0, IP.b)]);
            }
            catch (e) { }
        }
        function addAnimator(layer, name) {
            var animators = layer.property("ADBE Text Properties").property("ADBE Text Animators");
            var a = animators.addProperty("ADBE Text Animator");
            a.name = PASS_OUT ? (name + " (End)") : name;
            return a;
        }
        function addAnimProp(animator, matchName, value) {
            try {
                var p = animator.property("ADBE Text Animator Properties").addProperty(matchName);
                try {
                    p.setValue(value);
                }
                catch (e) { }
                return p;
            }
            catch (e2) {
                return null;
            }
        }
        function animateSelector(animator, delay, duration, smoothness, opt) {
            opt = opt || {};
            var selectors = animator.property("ADBE Text Selectors");
            var sel;
            if (selectors.numProperties > 0) {
                sel = selectors.property(1);
            }
            else {
                sel = selectors.addProperty("ADBE Text Selector");
            }
            try {
                var adv = sel.property("ADBE Text Range Advanced");
                adv.property("ADBE Text Range Type2").setValue(1);
                adv.property("ADBE Text Selector Smoothness").setValue(smoothness);
                var unit = opt.basedOn || DM.u;
                if (unit !== 1) {
                    adv.property("ADBE Text Range Type2").setValue(unit);
                }
                if (DM.rnd || opt.random) {
                    adv.property("ADBE Text Randomize Order").setValue(1);
                }
            }
            catch (e) { }
            var off = sel.property("ADBE Text Percent Offset");
            var X = DM.r ? 100 : -100;
            if (!PASS_OUT) {
                off.setValueAtTime(delay, 0);
                off.setValueAtTime(delay + duration, X);
            }
            else if (OUT_REVERSE) {
                off.setValueAtTime(OUT_START, X);
                off.setValueAtTime(OUT_START + OUT_DUR, 0);
            }
            else {
                off.setValueAtTime(OUT_START, -X);
                off.setValueAtTime(OUT_START + OUT_DUR, 0);
            }
            applyEase(off);
            return sel;
        }
        if (app.project && (app.project.file || app.project.numItems > 0)) {
            var closed = app.project.close(CloseOptions.PROMPT_TO_SAVE_CHANGES);
            if (!closed) {
                finish("ERROR|The save prompt in After Effects was cancelled, so no new project was made.");
                return;
            }
        }
        var delay = s.delay, dur = s.dur, hold = s.hold, size = s.size;
        var ROLL = (s.roll && s.roll.mode > 0) ? s.roll.mode : 0;
        var CRAWL = (ROLL === 3 || ROLL === 4);
        var endOn = !!s.endOn && !ROLL;
        var endDur = endOn ? ((s.endDur && s.endDur > 0) ? s.endDur : 1.2) : 0;
        var fadeDur = (!endOn && !ROLL && s.fadeDur && s.fadeDur > 0) ? s.fadeDur : 0;
        var fadeOn = fadeDur > 0;
        var fpsT = (s.fps && s.fps > 0) ? s.fps : 30;
        var compDur;
        if (s.compDur && s.compDur > 0) {
            compDur = s.compDur;
            if (compDur < 1 / fpsT) {
                compDur = 1 / fpsT;
            }
            var total = delay + dur + hold + (fadeOn ? fadeDur : 0) + endDur;
            if (total > 0) {
                var k = compDur / total;
                delay *= k;
                dur *= k;
                hold *= k;
                fadeDur *= k;
                endDur *= k;
            }
        }
        else {
            var tail = fadeOn ? Math.max(0.5, fadeDur) : (endOn ? endDur : 0.5);
            compDur = delay + dur + hold + tail;
            if (compDur < 0.5) {
                compDur = 0.5;
            }
        }
        var fps = (s.fps && s.fps > 0) ? s.fps : 30;
        var comp = app.project.items.addComp(compName, s.compW, s.compH, 1, compDur, fps);
        var rawText;
        try {
            rawText = (s.textEnc !== undefined && s.textEnc !== "") ? decodeURIComponent(s.textEnc) : String(s.text);
        }
        catch (eDec) {
            rawText = (s.textEnc !== undefined) ? unescape(s.textEnc) : String(s.text);
        }
        var str = rawText.replace(/\r\n|\n|\r|\u2028|\u2029|\u0003/g, "\r");
        if (str === "") {
            str = "Your Text Here";
        }
        var crawlK = 0, crawlN = 0, crawlPanelText = false;
        var crawlMap = null;
        if (CRAWL) {
            (function () {
                var crawlSep = "   \u2022   ", sepCps, cps = [], items = [], i0, st0, K, per, out = "", mp = [], n0 = 0, cur = -1, f0, l0;
                function cpList(x) {
                    var r = [], q, c;
                    for (q = 0; q < x.length; q++) {
                        c = x.charCodeAt(q);
                        if (c >= 0xD800 && c <= 0xDBFF && q + 1 < x.length) {
                            r.push(x.substr(q, 2));
                            q++;
                        }
                        else {
                            r.push(x.charAt(q));
                        }
                    }
                    return r;
                }
                if (s.roll && s.roll.sepEnc !== undefined) {
                    try {
                        crawlSep = decodeURIComponent(s.roll.sepEnc);
                    }
                    catch (eSep) { }
                }
                sepCps = cpList(crawlSep);
                cps = cpList(str);
                i0 = 0;
                while (i0 < cps.length) {
                    if (cps[i0] === "\r") {
                        i0++;
                        continue;
                    }
                    st0 = i0;
                    while (i0 < cps.length && cps[i0] !== "\r") {
                        i0++;
                    }
                    items.push({ a: st0, b: i0 });
                }
                if (!items.length) {
                    str = "Your Text Here";
                    return;
                }
                K = Math.max(1, Math.min(Math.floor((s.roll && s.roll.lines) || 1), items.length));
                per = Math.ceil(items.length / K);
                crawlK = Math.ceil(items.length / per);
                crawlN = items.length;
                f0 = items[0].a;
                l0 = items[items.length - 1].b - 1;
                for (i0 = 0; i0 <= cps.length; i0++) {
                    mp[i0] = n0;
                    if (i0 >= cps.length) {
                        break;
                    }
                    if (i0 < f0 || i0 > l0) {
                        continue;
                    }
                    if (cps[i0] === "\r") {
                        if (cps[i0 - 1] !== "\r") {
                            if ((cur + 1) % per === 0) {
                                out += "\r";
                                n0 += 1;
                            }
                            else {
                                out += crawlSep;
                                n0 += sepCps.length;
                            }
                        }
                    }
                    else {
                        if (i0 === 0 || cps[i0 - 1] === "\r") {
                            cur++;
                        }
                        out += cps[i0];
                        n0 += 1;
                    }
                }
                str = out;
                crawlMap = mp;
                if (s.roll && s.roll.joinedEnc !== undefined) {
                    var pj = null;
                    try {
                        pj = decodeURIComponent(s.roll.joinedEnc);
                    }
                    catch (ePj) {
                        pj = null;
                    }
                    if (pj !== null && pj !== "") {
                        if (pj !== out) {
                            crawlMap = null;
                            crawlPanelText = true;
                        }
                        str = pj;
                    }
                }
            })();
        }
        var align = (s.align !== undefined && s.align >= 0 && s.align <= 6) ? [0, 1, 2, 0, 1, 2, 0][s.align] : 1;
        var JUST = [
            ParagraphJustification.LEFT_JUSTIFY, ParagraphJustification.CENTER_JUSTIFY, ParagraphJustification.RIGHT_JUSTIFY,
            ParagraphJustification.FULL_JUSTIFY_LASTLINE_LEFT, ParagraphJustification.FULL_JUSTIFY_LASTLINE_CENTER,
            ParagraphJustification.FULL_JUSTIFY_LASTLINE_RIGHT, ParagraphJustification.FULL_JUSTIFY_LASTLINE_FULL
        ];
        var JUST_WRAPPED = [
            ParagraphJustification.FULL_JUSTIFY_LASTLINE_LEFT, ParagraphJustification.FULL_JUSTIFY_LASTLINE_CENTER,
            ParagraphJustification.FULL_JUSTIFY_LASTLINE_RIGHT
        ];
        var margin = Math.round(comp.width * 0.05);
        var fitNote = "";
        var SAFE = null;
        if (s.safe) {
            var sl = 0, st = 0, sr = comp.width, sb = comp.height;
            if (s.safeCustom) {
                sl = Math.max(0, s.safeL || 0);
                st = Math.max(0, s.safeT || 0);
                sr = comp.width - Math.max(0, s.safeR || 0);
                sb = comp.height - Math.max(0, s.safeB || 0);
            }
            if (sr - sl < 10 || sb - st < 10) {
                sl = 0;
                st = 0;
                sr = comp.width;
                sb = comp.height;
                fitNote = "Safe area: the custom distances are bigger than the comp, so the whole comp was used. ";
            }
            SAFE = { l: sl, t: st, r: sr, b: sb, w: sr - sl, h: sb - st };
        }
        if (SAFE && !ROLL) {
            try {
                var rL = 0, rR = 0, rT = 0, rB = 0, shpTp = s.outline ? Math.max(0, s.outlineW || 0) / 2 : 0, shpLh = size * 1.2 * Math.max(1, str.split("\r").length);
                var shpExt = shpTp, shpTh, shpGap, shpV, shpLean, shpPl, shpLen, shpK, shpPd, shpOn = false;
                var leanOf = function (deg, h) { return Math.abs(Math.tan((deg || 0) * Math.PI / 180)) * h / 2; };
                var reach = function (l, r, t, b) { rL = Math.max(rL, l); rR = Math.max(rR, r); rT = Math.max(rT, t); rB = Math.max(rB, b); shpOn = true; };
                if (s.box && s.box.on) {
                    shpExt = Math.max(shpExt, s.box.pad + shpTp);
                    shpLean = leanOf(s.box.skew, shpLh + 2 * (s.box.pad + shpTp));
                    reach(s.box.pad + shpTp + shpLean, s.box.pad + shpTp + shpLean, s.box.pad + shpTp, s.box.pad + shpTp);
                }
                if (s.line && s.line.on) {
                    shpV = s.line.pad + shpTp + s.line.w / 2;
                    shpExt = Math.max(shpExt, shpV);
                    shpLean = leanOf(s.line.skew, shpLh + 2 * (s.line.pad + shpTp));
                    reach(shpV + shpLean, shpV + shpLean, shpV, shpV);
                }
                if (s.shp && s.shp.on) {
                    shpTh = Math.max(1, s.shp.th);
                    shpGap = shpTh * 1.2 + (s.shp.gap || 0);
                    shpLean = leanOf((s.box && s.box.on) ? s.box.skew : 0, shpLh + 2 * shpExt);
                    if (s.shp.type === 0) {
                        reach(shpExt + shpGap + shpTh, 0, shpExt, shpExt);
                    }
                    else if (s.shp.type === 9) {
                        reach(0, shpExt + shpGap + shpTh, shpExt, shpExt);
                    }
                    else if (s.shp.type === 1) {
                        reach(shpExt, shpExt, 0, shpExt + shpGap + shpTh);
                    }
                    else if (s.shp.type === 2) {
                        reach(shpExt, shpExt, shpExt + shpGap + shpTh, shpExt + shpGap + shpTh);
                    }
                    else if (s.shp.type === 3) {
                        shpLen = Math.max(shpLh * 1.7, shpTh * 3);
                        reach(shpLen / 2, 0, Math.max(0, (shpLen - shpLh) / 2), Math.max(0, (shpLen - shpLh) / 2));
                    }
                    else if (s.shp.type === 4) {
                        reach(shpExt + shpGap, shpExt + shpGap, shpExt + shpGap, shpExt + shpGap);
                    }
                    else if (s.shp.type === 6) {
                        shpPl = Math.max(shpExt, shpLh * 0.25);
                        shpLen = Math.max(8, shpTh * 4);
                        reach(shpPl + shpLean, shpPl + shpLean + shpLen + shpTh / 2, shpPl, shpPl + shpLen + shpTh / 2);
                    }
                    else if (s.shp.type === 7) {
                        reach(shpExt + shpLean, shpExt + shpLean, 0, (s.box && s.box.on) ? shpExt : shpExt + shpGap + shpTh);
                    }
                    else if (s.shp.type === 8) {
                        shpPl = Math.max(shpExt, ((s.box && s.box.on) || (s.line && s.line.on)) ? 0 : shpLh * 0.2);
                        reach(shpPl + shpLean, shpPl + shpLean, 0, shpPl + shpTh);
                    }
                    else if (s.shp.type === 10) {
                        reach(shpExt + shpGap + shpTh * 1.5, 0, shpExt + shpTh, shpExt + shpTh);
                    }
                    else if (s.shp.type === 12 || s.shp.type === 13) {
                        reach(shpExt, shpExt, 0, shpExt + shpGap + shpTh);
                    }
                    else if (s.shp.type === 14) {
                        reach(shpExt, shpExt, 0, shpExt + shpGap + shpTh * 3);
                    }
                    else if (s.shp.type === 18) {
                        reach(shpExt + shpGap, shpExt + shpGap, shpExt, shpExt);
                    }
                    else if (s.shp.type >= 28 && s.shp.type <= 35) {
                        shpPd = Math.max(0, (s.shp.pad === undefined) ? 12 : s.shp.pad);
                        shpV = shpExt + shpPd;
                        if (s.shp.type === 32) {
                            reach(shpV + shpLh * 0.8, shpV + shpLh * 0.8, shpV + shpLh * 0.8, shpV + shpLh * 0.8);
                        }
                        else if (s.shp.type === 33) {
                            reach(shpV + shpLh * 1.5, shpV + shpLh * 1.5, shpV + shpLh * 0.5, shpV + shpLh * 0.5);
                        }
                        else if (s.shp.type === 34) {
                            reach(shpV + shpLh * 0.5, shpV + shpLh * 0.5, shpV, shpV);
                        }
                        else if (s.shp.type === 35) {
                            reach(shpV + shpLh * 0.2, shpV + shpLh * 0.2, shpV + shpLh * 0.2, shpV + shpLh * 0.2);
                        }
                        else if (s.shp.type === 28 || s.shp.type === 31) {
                            reach(shpV, shpV, shpV + shpLh * 0.3, shpV + shpLh * 0.3);
                        }
                        else {
                            reach(shpV, shpV, shpV, shpV);
                        }
                    }
                    else if (s.shp.type === 25) {
                        reach(shpExt + shpLh * 0.3, shpExt + shpLh * 0.3, shpExt + shpLh * 0.1, shpExt + shpLh * 0.1);
                    }
                    else if (s.shp.type === 26) {
                        reach(shpExt + shpLh * 0.6, shpExt + shpLh * 0.6, (shpLh + 2 * shpExt) * 0.25, (shpLh + 2 * shpExt) * 0.25);
                    }
                    else if ((s.shp.type >= 15 && s.shp.type <= 24) || s.shp.type === 27) {
                        reach(shpExt + shpGap + shpLh * 1.2 + shpTh * 3, 0, shpExt + shpTh, shpExt + shpTh);
                    }
                    else {
                        reach(shpExt + shpLh * 0.15, shpExt + shpLh * 0.15, shpExt, shpExt);
                    }
                }
                if (s.shp && s.shp.tb && s.shp.tb.on) {
                    var tbR = s.shp.tb, tbT = Math.max(0, tbR.w), tbB = Math.max(0, tbR.wB), tbGp = tbR.gap || 0;
                    if (tbR.all) {
                        var tbLf = Math.max(0, tbR.wC || 0), tbRt = Math.max(0, tbR.wD || 0);
                        reach(tbLf > 0 ? shpExt + tbLf * 1.2 + tbGp + tbLf : 0, tbRt > 0 ? shpExt + tbRt * 1.2 + tbGp + tbRt : 0, tbT > 0 ? shpExt + tbT * 1.2 + tbGp + tbT : 0, tbB > 0 ? shpExt + tbB * 1.2 + tbGp + tbB : 0);
                    }
                    else if (tbR.vert) {
                        reach(tbT > 0 ? shpExt + tbT * 1.2 + tbGp + tbT : 0, tbB > 0 ? shpExt + tbB * 1.2 + tbGp + tbB : 0, 0, 0);
                    }
                    else {
                        reach(0, 0, tbT > 0 ? shpExt + tbT * 1.2 + tbGp + tbT : 0, tbB > 0 ? shpExt + tbB * 1.2 + tbGp + tbB : 0);
                    }
                }
                if (shpOn) {
                    shpK = 1;
                    if (rL + rR > SAFE.w * 0.5) {
                        shpK = Math.min(shpK, SAFE.w * 0.5 / (rL + rR));
                    }
                    if (rT + rB > SAFE.h * 0.5) {
                        shpK = Math.min(shpK, SAFE.h * 0.5 / (rT + rB));
                    }
                    rL *= shpK;
                    rR *= shpK;
                    rT *= shpK;
                    rB *= shpK;
                    SAFE = { l: SAFE.l + rL, t: SAFE.t + rT, r: SAFE.r - rR, b: SAFE.b - rB, w: SAFE.w - rL - rR, h: SAFE.h - rT - rB };
                    fitNote += "Safe area: the shape layers are kept inside it (the text area is " + Math.round(rL + rR) + " px narrower and " + Math.round(rT + rB) + " px lower than the safe area). ";
                }
            }
            catch (eReach) {
                fitNote += "Safe area: the shape reach could not be worked out. ";
            }
        }
        function boxGeometry() {
            var left = margin, right = comp.width - margin;
            if (SAFE) {
                if (align === 1) {
                    left = SAFE.l;
                    right = SAFE.r;
                }
                else if (align === 0) {
                    left = s.safeCustom ? SAFE.l : Math.max(SAFE.l, margin);
                    right = SAFE.r;
                }
                else if (align === 2) {
                    left = SAFE.l;
                    right = s.safeCustom ? SAFE.r : Math.min(SAFE.r, comp.width - margin);
                }
                else {
                    left = s.safeCustom ? SAFE.l : Math.max(SAFE.l, margin);
                    right = s.safeCustom ? SAFE.r : Math.min(SAFE.r, comp.width - margin);
                }
                if (right - left < 10) {
                    left = SAFE.l;
                    right = SAFE.r;
                }
            }
            return { left: left, width: right - left };
        }
        var boxH = SAFE ? SAFE.h : Math.round(comp.height * 0.9);
        var layer = null, textProp = null;
        var isBox = false;
        var curBox = null;
        var curJust = JUST[align];
        var curSize = size;
        var curTrack = s.tracking;
        var lineSp = Number(s.lineSp) || 0;
        function applyLeading(d) {
            /* Line spacing: 0 = leave the font's automatic line distance alone. Otherwise the distance between the
               lines = text size x (1.2 + Line spacing / 100). It follows curSize, so it also scales when the safe-area
               fit shrinks the text. */
            if (!lineSp) {
                return;
            }
            try {
                d.autoLeading = false;
                d.leading = Math.max(1, curSize * (1.2 + lineSp / 100));
            }
            catch (eLead) { }
        }
        var strokeNow = Math.max(0, s.outlineW || 0);
        function makeLayer(asBox) {
            var lyr = null;
            isBox = false;
            if (asBox) {
                curBox = boxGeometry();
                try {
                    lyr = comp.layers.addBoxText([curBox.width, boxH], str);
                }
                catch (eBox) {
                    lyr = null;
                }
                if (lyr) {
                    isBox = true;
                }
            }
            if (!lyr) {
                lyr = comp.layers.addText(str);
            }
            return lyr;
        }
        var alignFail = false;
        function sameJ(a, b) {
            try {
                return Number(a) === Number(b) || String(a) === String(b);
            }
            catch (eS) {
                return false;
            }
        }
        function otherJ(j) {
            return sameJ(j, ParagraphJustification.LEFT_JUSTIFY) ? ParagraphJustification.RIGHT_JUSTIFY : ParagraphJustification.LEFT_JUSTIFY;
        }
        function styleDoc(d) {
            d.fontSize = curSize;
            d.fillColor = s.textRGB;
            if (s.outline) {
                try {
                    d.applyStroke = true;
                    d.strokeColor = s.outlineRGB;
                    d.strokeWidth = strokeNow;
                    try {
                        d.strokeOverFill = false;
                    }
                    catch (eSo) { }
                }
                catch (eStroke) {
                    d.applyStroke = false;
                }
            }
            else {
                d.applyStroke = false;
            }
            try {
                d.font = s.ps;
            }
            catch (e2) { }
            try {
                d.tracking = curTrack;
            }
            catch (e3) { }
            applyLeading(d);
        }
        function alignGeometry() {
            try {
                var want = -1, k;
                for (k = 0; k < 3; k++) {
                    if (sameJ(curJust, JUST[k])) {
                        want = k;
                    }
                }
                if (want < 0) {
                    return null;
                }
                var r = layer.sourceRectAtTime(0, false), refL = 0, refR = 0;
                if (isBox) {
                    var bd = textProp.value, bp = bd.boxTextPos, bs = bd.boxTextSize;
                    if (!bp || !bs) {
                        return null;
                    }
                    refL = bp[0];
                    refR = bp[0] + bs[0];
                }
                var tol = Math.max(2, curSize * 0.12);
                if (!isBox && r.width < tol * 3) {
                    return null;
                }
                var ink = (want === 0) ? r.left : (want === 1 ? r.left + r.width / 2 : r.left + r.width);
                var ref = (want === 0) ? refL : (want === 1 ? (refL + refR) / 2 : refR);
                return Math.abs(ink - ref) <= tol;
            }
            catch (eG) {
                return null;
            }
        }
        function alignIsGood() {
            var okProp = false;
            try {
                okProp = sameJ(textProp.value.justification, curJust);
            }
            catch (eP) { }
            return okProp && alignGeometry() !== false;
        }
        function ensureJustification() {
            if (alignIsGood()) {
                return true;
            }
            var methods = [
                function () { var d = textProp.value; d.justification = curJust; textProp.setValue(d); },
                function () {
                    var d = textProp.value;
                    d.justification = otherJ(curJust);
                    textProp.setValue(d);
                    d = textProp.value;
                    d.justification = curJust;
                    textProp.setValue(d);
                },
                function () {
                    var d = textProp.value;
                    try {
                        d.resetParagraphStyle();
                    }
                    catch (eR) { }
                    d.text = str;
                    d.justification = curJust;
                    textProp.setValue(d);
                },
                function () {
                    if (isBox) {
                        return;
                    }
                    var d = new TextDocument(str);
                    styleDoc(d);
                    d.justification = curJust;
                    textProp.setValue(d);
                }
            ];
            var i;
            for (i = 0; i < methods.length; i++) {
                try {
                    methods[i]();
                }
                catch (eM) { }
                if (alignIsGood()) {
                    fitNote += (fitNote ? " " : "") + "Text alignment: After Effects ignored the first try, method " + (i + 1) + " worked.";
                    return true;
                }
            }
            return false;
        }
        var alignDiagText = "";
        function jName(j) {
            var n = ["Left", "Center", "Right"], k;
            for (k = 0; k < 3; k++) {
                if (sameJ(j, JUST[k])) {
                    return n[k];
                }
            }
            return "other(" + String(j) + ")";
        }
        function alignDiag(fixedOK) {
            var rd = "?", ms = "no measurement", g;
            try {
                rd = jName(textProp.value.justification);
            }
            catch (eD1) { }
            try {
                var r = layer.sourceRectAtTime(0, false);
                g = alignGeometry();
                ms = "ink x " + Math.round(r.left) + " to " + Math.round(r.left + r.width) + (g === null ? " (not measurable)" : (g ? " (matches)" : " (does NOT match)"));
            }
            catch (eD2) { }
            alignDiagText = "Alignment check: wanted " + jName(curJust) + ", After Effects reports " + rd + ", " + ms + ", AE " + app.version + (fixedOK ? "" : ", FAILED") + ".";
        }
        function styleLayer() {
            textProp = layer.property("Source Text");
            var doc = textProp.value;
            try {
                doc.resetCharStyle();
            }
            catch (e1) { }
            try {
                doc.resetParagraphStyle();
            }
            catch (e1b) { }
            styleDoc(doc);
            doc.justification = curJust;
            textProp.setValue(doc);
            var okA = ensureJustification();
            if (!okA) {
                alignFail = true;
            }
            alignDiag(okA);
        }
        function areaEdges() {
            var cu = SAFE && s.safeCustom;
            return { l: cu ? SAFE.l : margin, r: cu ? SAFE.r : comp.width - margin, cy: cu ? (SAFE.t + SAFE.b) / 2 : comp.height / 2 };
        }
        function placeText() {
            try {
                var rInk = layer.sourceRectAtTime(0, false), E = areaEdges();
                var ax, px, ay = rInk.top + rInk.height / 2, py = E.cy;
                if (isBox) {
                    px = curBox.left + curBox.width / 2;
                    ax = rInk.left + rInk.width / 2;
                    try {
                        var d2 = textProp.value, bp = d2.boxTextPos, bs = d2.boxTextSize;
                        if (bp && bs && Math.abs(bs[0] - curBox.width) < 3) {
                            ax = bp[0] + bs[0] / 2;
                        }
                    }
                    catch (eBp) { }
                }
                else if (align === 0) {
                    ax = rInk.left;
                    px = E.l;
                }
                else if (align === 2) {
                    ax = rInk.left + rInk.width;
                    px = E.r;
                }
                else {
                    ax = rInk.left + rInk.width / 2;
                    px = (E.l + E.r) / 2;
                }
                layer.property("Anchor Point").setValue([ax, ay]);
                layer.property("Position").setValue([px, py]);
            }
            catch (ePos) {
                layer.property("Position").setValue([comp.width / 2, comp.height / 2]);
            }
        }
        layer = makeLayer(false);
        styleLayer();
        placeText();
        if (alignFail) {
            fitNote += (fitNote ? " " : "") + "After Effects did not accept the text alignment (all methods tried).";
        }
        function fitSafeArea() {
            var TOL = 0.5, MIN_SIZE = 4, origSize = curSize, origTrack = curTrack, wrapped = false, justified = false, moved = false, bb;
            var modeW = s.safeW || 0, modeH = s.safeH || 0;
            function strokePad() { return s.outline ? strokeNow / 2 : 0; }
            function bounds() {
                var r = layer.sourceRectAtTime(0, false);
                var anc = layer.property("Anchor Point").value, pos = layer.property("Position").value, pad = strokePad();
                var l = pos[0] + (r.left - anc[0]) - pad, t = pos[1] + (r.top - anc[1]) - pad;
                return { l: l, t: t, r: l + r.width + 2 * pad, b: t + r.height + 2 * pad, w: r.width + 2 * pad, h: r.height + 2 * pad };
            }
            function pushStyle() {
                var d = textProp.value;
                d.fontSize = curSize;
                if (s.outline) {
                    try {
                        d.strokeWidth = strokeNow;
                    }
                    catch (eSw) { }
                }
                try {
                    d.tracking = curTrack;
                }
                catch (eTr) { }
                applyLeading(d);
                d.justification = curJust;
                textProp.setValue(d);
                if (!ensureJustification()) {
                    alignFail = true;
                }
                placeText();
            }
            function shrink(needW, needH) {
                var n, k, b2;
                for (n = 0; n < 12; n++) {
                    b2 = bounds();
                    k = 1;
                    if (needW && b2.w > SAFE.w + TOL) {
                        k = Math.min(k, SAFE.w / b2.w);
                    }
                    if (needH && b2.h > SAFE.h + TOL) {
                        k = Math.min(k, SAFE.h / b2.h);
                    }
                    if (k >= 0.9995 || curSize <= MIN_SIZE) {
                        return;
                    }
                    curSize = Math.max(MIN_SIZE, Math.floor(curSize * k * 0.998 * 100) / 100);
                    strokeNow = Math.max(0, s.outlineW || 0) * (curSize / origSize);
                    pushStyle();
                }
            }
            function tighten() {
                var lines = str.split("\r"), maxLen = 1, i, n, b2, floorT = Math.min(curTrack, -50), t2;
                for (i = 0; i < lines.length; i++) {
                    if (lines[i].length > maxLen) {
                        maxLen = lines[i].length;
                    }
                }
                for (n = 0; n < 3; n++) {
                    b2 = bounds();
                    if (b2.w <= SAFE.w + TOL) {
                        return;
                    }
                    t2 = curTrack - (b2.w - SAFE.w) * 1000 / (maxLen * curSize) * 1.02;
                    t2 = Math.max(floorT, Math.floor(t2));
                    if (t2 >= curTrack) {
                        return;
                    }
                    curTrack = t2;
                    pushStyle();
                }
            }
            function wrapIntoBox(justify) {
                layer.remove();
                layer = makeLayer(true);
                curJust = (isBox && justify && align < 3) ? JUST_WRAPPED[align] : JUST[align];
                styleLayer();
                placeText();
                wrapped = isBox;
                justified = isBox && justify && align < 3;
                return isBox;
            }
            bb = bounds();
            if (bb.w > SAFE.w + TOL) {
                if (modeW === 1 || modeW === 2) {
                    if (!isBox) {
                        wrapIntoBox(modeW === 2);
                    }
                    if (bounds().w > SAFE.w + TOL) {
                        shrink(true, false);
                    }
                }
                else if (modeW === 3) {
                    tighten();
                    if (bounds().w > SAFE.w + TOL) {
                        shrink(true, false);
                    }
                }
                else if (modeW !== 4) {
                    shrink(true, false);
                }
            }
            if (modeH === 0 && bounds().h > SAFE.h + TOL) {
                shrink(false, true);
            }
            bb = bounds();
            var dx = 0, dy = 0, pos2;
            if (bb.w <= SAFE.w + TOL) {
                if (bb.l < SAFE.l) {
                    dx = SAFE.l - bb.l;
                }
                else if (bb.r > SAFE.r) {
                    dx = SAFE.r - bb.r;
                }
            }
            if (bb.h <= SAFE.h + TOL) {
                if (bb.t < SAFE.t) {
                    dy = SAFE.t - bb.t;
                }
                else if (bb.b > SAFE.b) {
                    dy = SAFE.b - bb.b;
                }
            }
            if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
                pos2 = layer.property("Position").value;
                layer.property("Position").setValue([pos2[0] + dx, pos2[1] + dy]);
                moved = true;
            }
            bb = bounds();
            var parts = [];
            if (curSize < origSize - 0.001) {
                parts.push("text size " + Math.round(origSize * 10) / 10 + " to " + Math.round(curSize * 10) / 10 + " px");
            }
            if (wrapped) {
                parts.push(justified ? "text wrapped into new lines and justified" : "text wrapped into new lines");
            }
            if (curTrack < origTrack - 0.001) {
                parts.push("tracking " + Math.round(origTrack) + " to " + Math.round(curTrack));
            }
            if (moved) {
                parts.push("text moved back inside");
            }
            var stillOut = (bb.w > SAFE.w + 1 || bb.h > SAFE.h + 1);
            if (parts.length) {
                fitNote += "Safe area: " + parts.join(", ") + ".";
            }
            else if (!stillOut) {
                fitNote += "Safe area: the text already fits.";
            }
            if (stillOut) {
                fitNote += (parts.length ? " " : "Safe area: ") + "Part of the text is still outside (lowest allowed size reached, or Leave as is chosen).";
            }
        }
        if (SAFE) {
            try {
                fitSafeArea();
            }
            catch (eFit) {
                fitNote += "Safe area check failed: " + String(eFit.message || eFit).replace(/[|\r\n]+/g, " ");
            }
        }
        if (s.pos && s.pos.on) {
            try {
                var pa = SAFE || { l: 0, t: 0, w: comp.width, h: comp.height };
                var pr = layer.sourceRectAtTime(0, false), panc = layer.property("Anchor Point").value, ppos = layer.property("Position").value;
                var ppad = s.outline ? strokeNow / 2 : 0;
                var pw = pr.width + 2 * ppad, ph = pr.height + 2 * ppad;
                var pl = ppos[0] + (pr.left - panc[0]) - ppad, pt = ppos[1] + (pr.top - panc[1]) - ppad;
                var pfx = Math.min(100, Math.max(0, Number(s.pos.x))) / 100, pfy = Math.min(100, Math.max(0, Number(s.pos.y))) / 100;
                layer.property("Position").setValue([ppos[0] + (pa.l + (pa.w - pw) * pfx - pl), ppos[1] + (pa.t + (pa.h - ph) * pfy - pt)]);
                fitNote += (fitNote ? " " : "") + "Custom position: horizontal " + Math.round(pfx * 100) + "%, vertical " + Math.round(pfy * 100) + "%.";
            }
            catch (ePos2) {
                fitNote += (fitNote ? " " : "") + "Custom position failed: " + String(ePos2.message || ePos2).replace(/[|\r\n]+/g, " ");
            }
        }
        var TB = null;
        if (s.box && (ROLL || s.box.on || s.line.on || s.shp.on || (s.shp.tb && s.shp.tb.on))) {
            try {
                var tr0 = layer.sourceRectAtTime(0, false), ta0 = layer.property("Anchor Point").value, tp0 = layer.property("Position").value;
                TB = { l: tp0[0] + (tr0.left - ta0[0]), t: tp0[1] + (tr0.top - ta0[1]), w: tr0.width, h: tr0.height };
                TB.cx = TB.l + TB.w / 2;
                TB.cy = TB.t + TB.h / 2;
            }
            catch (eTB) {
                TB = null;
                fitNote += (fitNote ? " " : "") + "The text could not be measured, so the shapes were skipped.";
            }
        }
        if (ROLL) {
            try {
                var rP = layer.property("Position"), rA = layer.property("Anchor Point").value, rRc = layer.sourceRectAtTime(0, false), rp0 = rP.value;
                var rPad = s.outline ? strokeNow / 2 : 0;
                var rL = rp0[0] + (rRc.left - rA[0]) - rPad, rT = rp0[1] + (rRc.top - rA[1]) - rPad, rW = rRc.width + 2 * rPad, rH = rRc.height + 2 * rPad;
                var rCW = comp.width, rCH = comp.height, rVert = (ROLL <= 2);
                var rGi = Math.max(0, s.roll.gapIn || 0), rGo = (s.roll.gapOut === undefined || s.roll.gapOut === null) ? 0.3 : Math.max(0, s.roll.gapOut);
                var rT0 = delay + rGi;
                var rTravel = (rVert ? (rCH + rH) : (rCW + rW)) / Math.max(10, s.roll.speed);
                var rOff0, rOff1, rV0, rV1;
                if (s.compDur && s.compDur > 0) {
                    rTravel = Math.max(0.2, compDur - rT0 - rGo);
                }
                else {
                    compDur = rT0 + rTravel + rGo;
                    comp.duration = compDur;
                    layer.outPoint = compDur;
                }
                if (ROLL === 1) {
                    rOff0 = rCH - rT;
                    rOff1 = -(rT + rH);
                }
                else if (ROLL === 2) {
                    rOff0 = -(rT + rH);
                    rOff1 = rCH - rT;
                }
                else if (ROLL === 3) {
                    rOff0 = rCW - rL;
                    rOff1 = -(rL + rW);
                }
                else {
                    rOff0 = -(rL + rW);
                    rOff1 = rCW - rL;
                }
                var rTxY = CRAWL ? (s.roll.txY || 0) : 0;
                rV0 = rVert ? [rp0[0], rp0[1] + rOff0] : [rp0[0] + rOff0, rp0[1] - rTxY];
                rV1 = rVert ? [rp0[0], rp0[1] + rOff1] : [rp0[0] + rOff1, rp0[1] - rTxY];
                rP.setValueAtTime(rT0, rV0);
                rP.setValueAtTime(rT0 + rTravel, rV1);
                try {
                    rP.setInterpolationTypeAtKey(1, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
                    rP.setInterpolationTypeAtKey(2, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
                }
                catch (eRI) { }
                fitNote += (fitNote ? " " : "") + (CRAWL ? "Crawl" : "Roll") + (crawlN ? " (" + crawlN + " typed line" + (crawlN === 1 ? "" : "s") + " in " + crawlK + " crawl line" + (crawlK === 1 ? "" : "s") + ", Lines at once = " + ((s.roll && s.roll.lines) || 1) + (crawlPanelText ? ", text joined by the panel" : "") + ")" : "") + ": " + Math.round(rTravel * 10) / 10 + " s at " + Math.round((rVert ? (rCH + rH) : (rCW + rW)) / rTravel) + " px/s.";
            }
            catch (eRoll) {
                fitNote += (fitNote ? " " : "") + "Rolling / crawling failed: " + String(eRoll.message || eRoll).replace(/[|\r\n]+/g, " ");
            }
        }
        size = curSize;
        var sizeScale = (s.size > 0) ? (curSize / s.size) : 1;
        var xSign = DM.r ? -1 : 1;
        var accent = s.accentRGB;
        var preset = s.preset;
        var strK = (s.strength === 0) ? 0.6 : ((s.strength === 2) ? 1.6 : 1);
        var wipeDirNo = (s.wipe >= 0 && s.wipe <= 3) ? s.wipe : 0;
        var fxCache = {};
        function getEffect(match) {
            if (!fxCache[match]) {
                fxCache[match] = layer.property("ADBE Effect Parade").addProperty(match);
            }
            return fxCache[match];
        }
        var W2 = [[0, 0.62], [0.38, 1]], W3 = [[0, 0.5], [0.3, 0.78], [0.55, 1]];
        function stages(name, match, vals, opt) {
            var W = (vals.length === 3) ? W3 : W2, k, an;
            for (k = 0; k < vals.length; k++) {
                an = addAnimator(layer, name + (k ? " " + (k + 1) : ""));
                addAnimProp(an, match, vals[k]);
                if (k === 0) {
                    addAnimProp(an, "ADBE Text Opacity", 0);
                }
                animateSelector(an, delay + dur * W[k][0], dur * (W[k][1] - W[k][0]), 100, opt);
            }
        }
        function bandSweep(an, t0, t1) {
            var selectors = an.property("ADBE Text Selectors"), sl, adv, BW = 28, from, to, off2;
            sl = (selectors.numProperties > 0) ? selectors.property(1) : selectors.addProperty("ADBE Text Selector");
            try {
                adv = sl.property("ADBE Text Range Advanced");
                adv.property("ADBE Text Range Type2").setValue(1);
                adv.property("ADBE Text Selector Smoothness").setValue(100);
                if (DM.u !== 1) {
                    adv.property("ADBE Text Range Type2").setValue(DM.u);
                }
            }
            catch (eB0) { }
            try {
                sl.property("ADBE Text Percent Start").setValue(0);
                sl.property("ADBE Text Percent End").setValue(BW);
            }
            catch (eB1) { }
            off2 = sl.property("ADBE Text Percent Offset");
            from = DM.r ? -BW : 100;
            to = DM.r ? 100 : -BW;
            off2.setValueAtTime(t0, from);
            off2.setValueAtTime(t1, to);
            applyEase(off2);
        }
        var buildPreset = function () {
            var a;
            if (preset === 0) {
                a = addAnimator(layer, "Rise & Fade");
                addAnimProp(a, "ADBE Text Position 3D", [0, size * 0.7, 0]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 1) {
                a = addAnimator(layer, "Blur Fade");
                addAnimProp(a, "ADBE Text Opacity", 0);
                addAnimProp(a, "ADBE Text Blur", [60, 60]);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 2) {
                a = addAnimator(layer, "Scale Pop");
                addAnimProp(a, "ADBE Text Scale 3D", [0, 0, 0]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 3) {
                a = addAnimator(layer, "Tracking Expand");
                addAnimProp(a, "ADBE Text Tracking Amount", -size * 0.5);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 4) {
                a = addAnimator(layer, "Spin Drop");
                addAnimProp(a, "ADBE Text Position 3D", [0, -size * 0.8, 0]);
                addAnimProp(a, "ADBE Text Rotation", -90);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 5) {
                a = addAnimator(layer, "Typewriter");
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 0);
            }
            else if (preset === 6) {
                a = addAnimator(layer, "Slide & Skew");
                addAnimProp(a, "ADBE Text Position 3D", [xSign * size * 1.1, 0, 0]);
                addAnimProp(a, "ADBE Text Skew", -xSign * 35);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 7) {
                a = addAnimator(layer, "Cinematic Zoom Out");
                addAnimProp(a, "ADBE Text Scale 3D", [320, 320, 320]);
                addAnimProp(a, "ADBE Text Blur", [45, 45]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 8) {
                a = addAnimator(layer, "Soft Focus Rise");
                addAnimProp(a, "ADBE Text Position 3D", [0, size * 0.4, 0]);
                addAnimProp(a, "ADBE Text Scale 3D", [85, 85, 85]);
                addAnimProp(a, "ADBE Text Blur", [30, 30]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 9) {
                a = addAnimator(layer, "Color Sweep");
                addAnimProp(a, "ADBE Text Fill Color", [accent[0], accent[1], accent[2], 1]);
                addAnimProp(a, "ADBE Text Position 3D", [0, size * 0.25, 0]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 11) {
                a = addAnimator(layer, "Fade In");
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 12) {
                a = addAnimator(layer, "Slide Up");
                addAnimProp(a, "ADBE Text Position 3D", [0, size * 1.4, 0]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 13) {
                a = addAnimator(layer, "Drop In");
                addAnimProp(a, "ADBE Text Position 3D", [0, -size * 1.4, 0]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 14) {
                a = addAnimator(layer, "Slide In");
                addAnimProp(a, "ADBE Text Position 3D", [xSign * size * 1.6, 0, 0]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 15) {
                a = addAnimator(layer, "Zoom In");
                addAnimProp(a, "ADBE Text Scale 3D", [30, 30, 30]);
                addAnimProp(a, "ADBE Text Blur", [20, 20]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 16) {
                a = addAnimator(layer, "Tracking Contract");
                addAnimProp(a, "ADBE Text Tracking Amount", size * 1.2);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 17) {
                a = addAnimator(layer, "Word by Word");
                addAnimProp(a, "ADBE Text Position 3D", [0, size * 0.4, 0]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 0, { basedOn: 3, linear: true });
            }
            else if (preset === 18) {
                a = addAnimator(layer, "Line by Line");
                addAnimProp(a, "ADBE Text Position 3D", [0, size * 0.6, 0]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 0, { basedOn: 4, linear: true });
            }
            else if (preset === 19) {
                a = addAnimator(layer, "Word Pop");
                addAnimProp(a, "ADBE Text Scale 3D", [0, 0, 0]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 0, { basedOn: 3, linear: true });
            }
            else if (preset === 20) {
                a = addAnimator(layer, "Random Fade");
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100, { random: true });
            }
            else if (preset === 21) {
                a = addAnimator(layer, "Rotate In");
                addAnimProp(a, "ADBE Text Rotation", xSign * -45);
                addAnimProp(a, "ADBE Text Position 3D", [0, size * 0.5, 0]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 22) {
                a = addAnimator(layer, "Focus Pull");
                addAnimProp(a, "ADBE Text Blur", [80, 80]);
                addAnimProp(a, "ADBE Text Scale 3D", [115, 115, 115]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 23) {
                a = addAnimator(layer, "Cascade Drop & Blur");
                addAnimProp(a, "ADBE Text Position 3D", [0, -size * 1.0, 0]);
                addAnimProp(a, "ADBE Text Scale 3D", [115, 115, 115]);
                addAnimProp(a, "ADBE Text Blur", [40, 40]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 24) {
                a = addAnimator(layer, "Accent Flash Reveal");
                addAnimProp(a, "ADBE Text Fill Color", [accent[0], accent[1], accent[2], 1]);
                addAnimProp(a, "ADBE Text Scale 3D", [125, 125, 125]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 25) {
                a = addAnimator(layer, "Skew Slide & Blur");
                addAnimProp(a, "ADBE Text Position 3D", [xSign * size * 1.2, 0, 0]);
                addAnimProp(a, "ADBE Text Skew", -xSign * 25);
                addAnimProp(a, "ADBE Text Blur", [30, 30]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 26) {
                a = addAnimator(layer, "Tracking Blur Reveal");
                addAnimProp(a, "ADBE Text Tracking Amount", size * 0.6);
                addAnimProp(a, "ADBE Text Blur", [25, 25]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 27) {
                a = addAnimator(layer, "Tilt Swing In");
                addAnimProp(a, "ADBE Text Rotation", xSign * -25);
                addAnimProp(a, "ADBE Text Position 3D", [0, size * 0.9, 0]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 28) {
                a = addAnimator(layer, "Line Rise & Blur");
                addAnimProp(a, "ADBE Text Position 3D", [0, size * 0.9, 0]);
                addAnimProp(a, "ADBE Text Blur", [35, 35]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100, { basedOn: 4 });
            }
            else if (preset === 29) {
                a = addAnimator(layer, "Word Slide & Blur");
                addAnimProp(a, "ADBE Text Position 3D", [xSign * size * 1.0, 0, 0]);
                addAnimProp(a, "ADBE Text Blur", [30, 30]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100, { basedOn: 3 });
            }
            else if (preset === 30) {
                a = addAnimator(layer, "Word Drop Pop");
                addAnimProp(a, "ADBE Text Position 3D", [0, -size * 0.8, 0]);
                addAnimProp(a, "ADBE Text Scale 3D", [140, 140, 140]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100, { basedOn: 3 });
            }
            else if (preset === 31) {
                a = addAnimator(layer, "Line Slide & Skew");
                addAnimProp(a, "ADBE Text Position 3D", [xSign * size * 1.6, 0, 0]);
                addAnimProp(a, "ADBE Text Skew", -xSign * 30);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100, { basedOn: 4 });
            }
            else if (preset === 32) {
                a = addAnimator(layer, "Squash & Stretch Pop");
                addAnimProp(a, "ADBE Text Scale 3D", [140, 55, 100]);
                addAnimProp(a, "ADBE Text Position 3D", [0, size * 0.15, 0]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 33) {
                a = addAnimator(layer, "Stamp Slam");
                addAnimProp(a, "ADBE Text Scale 3D", [100 + 130 * strK, 100 + 130 * strK, 100]);
                addAnimProp(a, "ADBE Text Rotation", -xSign * 5 * strK);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 40);
            }
            else if (preset === 34) {
                a = addAnimator(layer, "Flip In");
                addAnimProp(a, "ADBE Text Scale 3D", [100, -100, 100]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 35) {
                a = addAnimator(layer, "Word Flip In");
                addAnimProp(a, "ADBE Text Scale 3D", [-100, 100, 100]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100, { basedOn: 3 });
            }
            else if (preset === 36) {
                stages("Elastic Rise", "ADBE Text Position 3D", [[0, size * 0.9, 0], [0, -size * 0.2 * strK, 0]], null);
            }
            else if (preset === 37) {
                stages("Soft Bounce Drop", "ADBE Text Position 3D", [[0, -size * 1.3, 0], [0, size * 0.22 * strK, 0], [0, -size * 0.08 * strK, 0]], null);
            }
            else if (preset === 38) {
                stages("Jelly Wobble", "ADBE Text Rotation", [28 * strK, -16 * strK, 7 * strK], null);
            }
            else if (preset === 39) {
                stages("Rubber Band", "ADBE Text Tracking Amount", [size * 0.55, -size * 0.3 * strK], null);
            }
            else if (preset === 40) {
                stages("Slide Overshoot", "ADBE Text Position 3D", [[xSign * size * 1.3, 0, 0], [-xSign * size * 0.18 * strK, 0, 0]], null);
            }
            else if (preset === 41) {
                stages("Line Rise Overshoot", "ADBE Text Position 3D", [[0, size * 0.9, 0], [0, -size * 0.12 * strK, 0]], { basedOn: 4 });
            }
            else if (preset === 42) {
                a = addAnimator(layer, "Word Pop In");
                addAnimProp(a, "ADBE Text Scale 3D", [30, 30, 30]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100, { basedOn: 3 });
            }
            else if (preset === 43) {
                a = addAnimator(layer, "Random Tumble In");
                addAnimProp(a, "ADBE Text Position 3D", [0, size * 0.7, 0]);
                addAnimProp(a, "ADBE Text Rotation", 50);
                addAnimProp(a, "ADBE Text Scale 3D", [50, 50, 50]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100, { random: true });
            }
            else if (preset === 44) {
                a = addAnimator(layer, "Light Sweep Fade");
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur * 0.5, 100);
                a = addAnimator(layer, "Light Sweep");
                addAnimProp(a, "ADBE Text Fill Color", [accent[0], accent[1], accent[2], 1]);
                if (PASS_OUT) {
                    bandSweep(a, OUT_START, OUT_START + OUT_DUR);
                }
                else {
                    bandSweep(a, delay + dur * 0.25, delay + dur);
                }
            }
            else if (preset === 45) {
                a = addAnimator(layer, "Accent Slide Reveal");
                addAnimProp(a, "ADBE Text Fill Color", [accent[0], accent[1], accent[2], 1]);
                addAnimProp(a, "ADBE Text Position 3D", [xSign * size * 0.9, 0, 0]);
                addAnimProp(a, "ADBE Text Blur", [25, 25]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 46) {
                try {
                    var wp = getEffect("ADBE Linear Wipe"), wc = wp.property("ADBE Linear Wipe-0001");
                    if (!PASS_OUT) {
                        try {
                            wp.property("ADBE Linear Wipe-0002").setValue([90, 270, 180, 0][wipeDirNo]);
                        }
                        catch (w1) { }
                        try {
                            wp.property("ADBE Linear Wipe-0003").setValue(size * 0.25 * strK);
                        }
                        catch (w2) { }
                        wc.setValueAtTime(delay, 100);
                        wc.setValueAtTime(delay + dur, 0);
                        applyEase(wc);
                    }
                    else {
                        wc.setValueAtTime(OUT_START, 0);
                        wc.setValueAtTime(OUT_START + OUT_DUR, 100);
                    }
                }
                catch (eWipe) {
                    fitNote += (fitNote ? " " : "") + "The Linear Wipe effect could not be added (a plain fade was used).";
                    a = addAnimator(layer, "Fade In");
                    addAnimProp(a, "ADBE Text Opacity", 0);
                    animateSelector(a, delay, dur, 100);
                }
            }
            else if (preset === 47) {
                a = addAnimator(layer, "Line Float In");
                addAnimProp(a, "ADBE Text Position 3D", [0, size * 0.35, 0]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100, { basedOn: 4 });
            }
            else if (preset === 48) {
                a = addAnimator(layer, "Blur Slide Up");
                addAnimProp(a, "ADBE Text Position 3D", [0, size * 0.8, 0]);
                addAnimProp(a, "ADBE Text Blur", [40, 40]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 49) {
                a = addAnimator(layer, "Shrink In");
                addAnimProp(a, "ADBE Text Scale 3D", [180, 180, 180]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 50) {
                a = addAnimator(layer, "Tilt Rise");
                addAnimProp(a, "ADBE Text Rotation", xSign * -20);
                addAnimProp(a, "ADBE Text Position 3D", [0, size * 0.6, 0]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 51) {
                a = addAnimator(layer, "Skew Rise");
                addAnimProp(a, "ADBE Text Skew", -xSign * 30);
                addAnimProp(a, "ADBE Text Position 3D", [0, size * 0.5, 0]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 52) {
                a = addAnimator(layer, "Squeeze In");
                addAnimProp(a, "ADBE Text Scale 3D", [260, 25, 100]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 53) {
                a = addAnimator(layer, "Tilt Drop");
                addAnimProp(a, "ADBE Text Rotation", xSign * 20);
                addAnimProp(a, "ADBE Text Position 3D", [0, -size * 0.9, 0]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 54) {
                a = addAnimator(layer, "Twist Pop");
                addAnimProp(a, "ADBE Text Scale 3D", [40, 40, 40]);
                addAnimProp(a, "ADBE Text Rotation", xSign * 60);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else if (preset === 55) {
                a = addAnimator(layer, "Word Blur In");
                addAnimProp(a, "ADBE Text Blur", [40, 40]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100, { basedOn: 3 });
            }
            else if (preset === 56) {
                a = addAnimator(layer, "Word Rise & Fade");
                addAnimProp(a, "ADBE Text Position 3D", [0, size * 0.6, 0]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100, { basedOn: 3 });
            }
            else if (preset === 57) {
                a = addAnimator(layer, "Word Rotate In");
                addAnimProp(a, "ADBE Text Rotation", xSign * -25);
                addAnimProp(a, "ADBE Text Position 3D", [0, size * 0.3, 0]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100, { basedOn: 3 });
            }
            else if (preset === 58) {
                a = addAnimator(layer, "Line Zoom In");
                addAnimProp(a, "ADBE Text Scale 3D", [140, 140, 140]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100, { basedOn: 4 });
            }
            else if (preset === 59) {
                a = addAnimator(layer, "Line Skew In");
                addAnimProp(a, "ADBE Text Position 3D", [xSign * size * 1.0, 0, 0]);
                addAnimProp(a, "ADBE Text Skew", -xSign * 25);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100, { basedOn: 4 });
            }
            else if (preset === 60) {
                a = addAnimator(layer, "Line Drop Blur");
                addAnimProp(a, "ADBE Text Position 3D", [0, -size * 0.7, 0]);
                addAnimProp(a, "ADBE Text Blur", [30, 30]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100, { basedOn: 4 });
            }
            else if (preset === 61) {
                a = addAnimator(layer, "Random Blur In");
                addAnimProp(a, "ADBE Text Blur", [50, 50]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100, { random: true });
            }
            else if (preset === 62) {
                a = addAnimator(layer, "Random Pop In");
                addAnimProp(a, "ADBE Text Scale 3D", [0, 0, 0]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100, { random: true });
            }
            else if (preset === 63) {
                a = addAnimator(layer, "Slide In from Left");
                addAnimProp(a, "ADBE Text Position 3D", [-xSign * size * 1.6, 0, 0]);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
            else {
                a = addAnimator(layer, "Spin Pop");
                addAnimProp(a, "ADBE Text Scale 3D", [0, 0, 0]);
                addAnimProp(a, "ADBE Text Rotation", 180);
                addAnimProp(a, "ADBE Text Opacity", 0);
                animateSelector(a, delay, dur, 100);
            }
        };
        if (!ROLL) {
            buildPreset();
        }
        if (endOn) {
            OUT_START = delay + dur + hold;
            OUT_DUR = Math.min(endDur, compDur);
            if (OUT_START + OUT_DUR > compDur) {
                OUT_START = Math.max(0, compDur - OUT_DUR);
            }
            PASS_OUT = true;
            buildPreset();
            PASS_OUT = false;
        }
        var loopFx = function (LY, fx, P, A, S, T0) {
            try {
                (function () {
                    var H = "var T=Math.max(0,time-" + T0 + ");var P=" + P + ";var w=T*2*Math.PI/P;var a=" + A + ";var S=" + S + ";var f=T/P-Math.floor(T/P);";
                    var SC = "[value[0]*k,value[1]*k]";
                    function pos(dx, dy) { return H + "value+[" + dx + "," + dy + "]"; }
                    var list = [], k2, pr, gl;
                    if (fx === 1) {
                        list.push(["Scale", H + "var k=1+0.06*a*Math.sin(w);" + SC]);
                    }
                    else if (fx === 2) {
                        list.push(["Position", pos("0", "-S*0.12*a*Math.sin(w)")]);
                    }
                    else if (fx === 3) {
                        list.push(["Opacity", H + "var lo=Math.max(0,1-0.85*a);value*(Math.cos(w)>=0?1:lo)"]);
                    }
                    else if (fx === 4) {
                        list.push(["Rotation", H + "value+3*a*Math.sin(w)"]);
                    }
                    else if (fx === 5) {
                        list.push(["Position", pos("S*0.2*a*Math.sin(w)", "0")]);
                    }
                    else if (fx === 6) {
                        list.push(["Scale", H + "var k=1+0.1*a*(Math.exp(-Math.pow((f-0.12)/0.05,2))+0.7*Math.exp(-Math.pow((f-0.32)/0.05,2)));" + SC]);
                    }
                    else if (fx === 7) {
                        list.push(["Position", pos("0", "-S*0.35*a*Math.abs(Math.sin(Math.PI*f))")]);
                    }
                    else if (fx === 8) {
                        list.push(["Position", "time<" + T0 + "?value:wiggle(" + (3 / P) + "," + (S * 0.04 * A) + ")"]);
                    }
                    else if (fx === 9) {
                        list.push(["Position", "time<" + T0 + "?value:wiggle(" + (10 / P) + "," + (S * 0.06 * A) + ")"]);
                    }
                    else if (fx === 10) {
                        list.push(["Opacity", H + "value*(0.75+0.25*Math.cos(w))"]);
                        list.push(["Scale", H + "var k=1+0.03*a*Math.sin(w);" + SC]);
                    }
                    else if (fx === 11) {
                        list.push(["Scale", H + "var k=1+0.05*a*T/P;" + SC]);
                    }
                    else if (fx === 12) {
                        list.push(["Scale", H + "var k=Math.max(0.2,1-0.04*a*T/P);" + SC]);
                    }
                    else if (fx === 13) {
                        list.push(["Position", pos("0", "-S*0.25*a*T/P")]);
                    }
                    else if (fx === 14) {
                        list.push(["Position", pos("0", "S*0.25*a*T/P")]);
                    }
                    else if (fx === 15) {
                        list.push(["Position", pos("-S*0.25*a*T/P", "0")]);
                    }
                    else if (fx === 16) {
                        list.push(["Position", pos("S*0.25*a*T/P", "0")]);
                    }
                    else if (fx === 17) {
                        list.push(["Scale", H + "var q=(f<0.2)?Math.sin(f/0.2*Math.PI/2):Math.cos((f-0.2)/0.8*Math.PI/2);var k=1+0.15*a*q;" + SC]);
                    }
                    else if (fx === 18) {
                        list.push(["Opacity", H + "value*(1-0.55*Math.min(a,1.6)*(0.5-0.5*Math.cos(w)))"]);
                    }
                    else if (fx === 19) {
                        list.push(["GLOW", H + "0.6+1.2*a*(0.5-0.5*Math.cos(w))"]);
                    }
                    else if (fx === 20) {
                        list.push(["Position", pos("S*0.25*a*((f<0.25)?Math.sin(f/0.25*Math.PI):0)", "0")]);
                    }
                    else if (fx === 21) {
                        list.push(["Rotation", H + "value+12*a*Math.sin(w)"]);
                    }
                    else if (fx === 22) {
                        list.push(["Position", pos("S*0.1*a*Math.sin(w)", "S*0.1*a*(1-Math.cos(w))")]);
                    }
                    else if (fx === 23) {
                        list.push(["Rotation", H + "value+360*T/(P*2)"]);
                    }
                    else if (fx === 24) {
                        list.push(["Scale", H + "[value[0]*Math.cos(w),value[1]]"]);
                    }
                    else if (fx === 25) {
                        list.push(["Position", H + "seedRandom(Math.floor(time*12),true);var r=random();var dx=(random()-0.5)*S*0.5*a;var dy=(random()-0.5)*S*0.08*a;(time>=" + T0 + "&&r>0.82)?value+[dx,dy]:value"]);
                    }
                    else if (fx === 26) {
                        list.push(["Opacity", H + "seedRandom(Math.floor(time*20),true);var r=random();var m=Math.min(a,1.3);(time>=" + T0 + "&&r>0.9)?value*Math.max(0,1-0.75*m):((time>=" + T0 + "&&r>0.75)?value*(1-0.3*m):value)"]);
                    }
                    else if (fx === 27) {
                        list.push(["Position", pos("S*0.1*a*Math.sin(w)", "S*0.06*a*Math.sin(2*w)")]);
                    }
                    else if (fx === 28) {
                        list.push(["Scale", H + "var k=0.08*a*Math.sin(w);[value[0]*(1+k),value[1]*(1-k)]"]);
                    }
                    else if (fx === 29) {
                        list.push(["Scale", H + "var k=0.12*a*Math.exp(-5*f)*Math.sin(18*f);[value[0]*(1+k),value[1]*(1-k)]"]);
                    }
                    for (k2 = 0; k2 < list.length; k2++) {
                        try {
                            if (list[k2][0] === "GLOW") {
                                gl = LY.property("ADBE Effect Parade").addProperty("ADBE Glo2");
                                try {
                                    gl.property("ADBE Glo2-0003").setValue(Math.max(10, S * 0.25));
                                }
                                catch (eGr) { }
                                gl.property("ADBE Glo2-0004").expression = list[k2][1];
                            }
                            else {
                                pr = LY.property(list[k2][0]);
                                pr.expression = list[k2][1];
                            }
                        }
                        catch (eAx) { }
                    }
                })();
            }
            catch (eAnimate) { }
        };
        if (!ROLL && s.animate && s.animate.on) {
            loopFx(layer, Math.floor(s.animate.fx), Math.max(0.2, s.animate.sp), (s.animate.amt > 0) ? s.animate.amt : 1, Math.max(10, curSize), delay + dur);
        }
        var NL_COUNTS = false;
        if (CRAWL && s.parts && s.parts.length) {
            var cpp = [], cpi2, cpa, cpb;
            for (cpi2 = 0; crawlMap && cpi2 < s.parts.length; cpi2++) {
                cpa = crawlMap[s.parts[cpi2].a];
                cpb = crawlMap[s.parts[cpi2].b];
                if (cpa === undefined || cpb === undefined || cpb <= cpa) {
                    continue;
                }
                cpp.push({ a: cpa, b: cpb, f: s.parts[cpi2].f, s: s.parts[cpi2].s });
            }
            s.parts = cpp;
        }
        if (s.parts && s.parts.length) {
            try {
                var aeIdx = [], nlBefore = 0, cpCount = 0, ci, cc, pi, part, st, en, an, sl, adv, partFail = false;
                for (ci = 0; ci < str.length; ci++) {
                    aeIdx[cpCount] = NL_COUNTS ? cpCount : (cpCount - nlBefore);
                    cc = str.charCodeAt(ci);
                    if (cc >= 0xD800 && cc <= 0xDBFF && ci + 1 < str.length) {
                        ci++;
                    }
                    if (str.charAt(ci) === "\r") {
                        nlBefore++;
                    }
                    cpCount++;
                }
                aeIdx[cpCount] = NL_COUNTS ? cpCount : (cpCount - nlBefore);
                for (pi = 0; pi < s.parts.length; pi++) {
                    part = s.parts[pi];
                    if (part.a < 0 || part.b > cpCount || part.b <= part.a) {
                        continue;
                    }
                    st = aeIdx[part.a];
                    en = aeIdx[part.b];
                    if (!CRAWL && !NL_COUNTS && part.va !== undefined && part.vb !== undefined) {
                        st = part.va;
                        en = part.vb;
                    }
                    if (en <= st) {
                        continue;
                    }
                    try {
                        var dbgCp = [], dbgK, dbgC;
                        for (dbgK = 0; dbgK < str.length; dbgK++) {
                            dbgC = str.charCodeAt(dbgK);
                            if (dbgC >= 0xD800 && dbgC <= 0xDBFF && dbgK + 1 < str.length) {
                                dbgCp.push(str.substr(dbgK, 2));
                                dbgK++;
                            }
                            else {
                                dbgCp.push(str.charAt(dbgK));
                            }
                        }
                        fitNote += (fitNote ? " " : "") + "[v8.3.7 Part " + (pi + 1) + ": panel chars " + part.a + "-" + part.b + " = '" + dbgCp.slice(part.a, part.b).join("").replace(/[|\r\n]+/g, "/") + "', After Effects Index " + st + "-" + en + ", NL_COUNTS=" + NL_COUNTS + "]";
                    }
                    catch (eDbg) { }
                    try {
                        an = addAnimator(layer, "Part Color " + (pi + 1));
                        if (part.f) {
                            addAnimProp(an, "ADBE Text Fill Color", [part.f[0], part.f[1], part.f[2], 1]);
                        }
                        if (part.s && s.outline) {
                            addAnimProp(an, "ADBE Text Stroke Color", [part.s[0], part.s[1], part.s[2], 1]);
                        }
                        sl = an.property("ADBE Text Selectors");
                        sl = (sl.numProperties > 0) ? sl.property(1) : sl.addProperty("ADBE Text Selector");
                        adv = sl.property("ADBE Text Range Advanced");
                        adv.property("ADBE Text Range Type2").setValue(1);
                        adv.property("ADBE Text Range Units").setValue(2);
                        adv.property("ADBE Text Selector Smoothness").setValue(0);
                        sl.property("ADBE Text Index Start").setValue(st);
                        sl.property("ADBE Text Index End").setValue(en);
                    }
                    catch (ePart1) {
                        partFail = true;
                    }
                }
                if (partFail) {
                    fitNote += (fitNote ? " " : "") + "Some part colours could not be added.";
                }
            }
            catch (ePart) {
                fitNote += (fitNote ? " " : "") + "Part colours failed: " + String(ePart.message || ePart).replace(/[|\r\n]+/g, " ");
            }
        }
        if (fadeOn) {
            var fd = Math.min(fadeDur, compDur);
            var outStart = delay + dur + hold;
            if (outStart + fd > compDur) {
                outStart = Math.max(0, compDur - fd);
            }
            var op = layer.property("Opacity");
            op.setValueAtTime(outStart, 100);
            op.setValueAtTime(outStart + fd, 0);
            applyEase(op);
        }
        try {
            layer.motionBlur = !!s.mblur && s.mblurText !== false;
        }
        catch (eMb1) { }
        try {
            comp.motionBlur = !!s.mblur;
        }
        catch (eMb2) { }
        if (ROLL && s.mblur) {
            try {
                comp.shutterAngle = 360;
            }
            catch (eMb3) { }
            try {
                comp.shutterPhase = -180;
            }
            catch (eMb4) { }
            try {
                comp.motionBlurSamplesPerFrame = 16;
            }
            catch (eMb5) { }
            try {
                comp.motionBlurAdaptiveSampleLimit = 128;
            }
            catch (eMb6) { }
        }
        if (s.shadow) {
            try {
                var fx = layer.property("ADBE Effect Parade").addProperty("ADBE Drop Shadow");
                var setFx = function (match, v) { try {
                    fx.property(match).setValue(v);
                }
                catch (eFx) { } };
                setFx("ADBE Drop Shadow-0001", [s.shRGB[0], s.shRGB[1], s.shRGB[2], 1]);
                try {
                    var opP = fx.property("ADBE Drop Shadow-0002"), mx = 255;
                    try {
                        if (opP.maxValue > 0) {
                            mx = opP.maxValue;
                        }
                    }
                    catch (eMx) { }
                    opP.setValue(Math.max(0, Math.min(100, s.shOp)) / 100 * mx);
                }
                catch (eOp) { }
                setFx("ADBE Drop Shadow-0003", s.shDir);
                setFx("ADBE Drop Shadow-0004", s.shDist * sizeScale);
                setFx("ADBE Drop Shadow-0005", s.shSoft * sizeScale);
            }
            catch (eShadow) { }
        }
        var buildShapes = function () {
            var tpad = s.outline ? strokeNow / 2 : 0;
            var sT0 = Math.max(0, delay - 0.25);
            if (s.shpOrder === 1) {
                sT0 = delay;
            }
            else if (s.shpOrder === 2) {
                sT0 = delay + dur * 0.6;
            }
            var oS = delay + dur + hold;
            var oD = endOn ? Math.min(endDur, compDur) : (fadeOn ? Math.min(fadeDur, compDur) : 0);
            if (oD > 0 && oS + oD > compDur) {
                oS = Math.max(0, compDur - oD);
            }
            var EXT = tpad;
            if (s.box.on) {
                EXT = Math.max(EXT, s.box.pad + tpad);
            }
            if (s.line.on) {
                EXT = Math.max(EXT, s.line.pad + tpad + s.line.w / 2);
            }
            var BOX_ANIM = [0, 0, 1, 2, 3, 0, 0, 4, 5, 6, 7, 8, 9, 9, 10, 12, 13, 14, 15], BOX_EDGE = ["l", "r", "c", "c", "c", "b", "t", "c", "c", "c", "c", "c", "l", "t", "c", "l", "c", "c", "c"];
            var LINE_ANIM = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 10, 13, 14], LINE_EDGE = ["c", "c", "c", "c", "c", "c", "c", "c", "c", "l", "t", "c", "c", "c"];
            function rgba(c) { return [c[0], c[1], c[2], 1]; }
            function easeKeys(prop, spatial) {
                var n = prop.numKeys, k, dm = 1, v, d, ei, infl;
                if (!spatial) {
                    try {
                        v = prop.valueAtTime(0, false);
                        dm = (v instanceof Array) ? v.length : 1;
                    }
                    catch (e0) {
                        dm = 1;
                    }
                }
                for (k = 1; k <= n; k++) {
                    try {
                        if (SIP.t === "lin") {
                            prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
                            continue;
                        }
                        prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
                        infl = (k % 2 === 1) ? SIP.a : SIP.b;
                        ei = [];
                        for (d = 0; d < dm; d++) {
                            ei.push(new KeyframeEase(0, infl));
                        }
                        prop.setTemporalEaseAtKey(k, ei, ei);
                    }
                    catch (eK) { }
                }
            }
            function scv(prop, x, y) { var cur = prop.value; return (cur.length === 3) ? [x, y, 100] : [x, y]; }
            function kio(prop, vFrom, vTo, t0, d, spatial) {
                prop.setValueAtTime(t0, vFrom);
                prop.setValueAtTime(t0 + d, vTo);
                if (endOn && oD > 0) {
                    prop.setValueAtTime(oS, vTo);
                    prop.setValueAtTime(oS + oD, vFrom);
                }
                easeKeys(prop, spatial);
            }
            var xf = null;
            function applyXf(g, bb) {
                var tg, hor, ver, sx = 100, sy = 100;
                if (!xf) {
                    return;
                }
                try {
                    tg = g.property("ADBE Vector Transform Group");
                    hor = (xf.edge === "l" || xf.edge === "r");
                    ver = (xf.edge === "t" || xf.edge === "b");
                    if (xf.len !== 100) {
                        if (hor) {
                            sx = xf.len;
                        }
                        else if (ver) {
                            sy = xf.len;
                        }
                        else {
                            sx = xf.len;
                            sy = xf.len;
                        }
                    }
                    tg.property("ADBE Vector Anchor").setValue([bb.cx, bb.cy]);
                    tg.property("ADBE Vector Position").setValue([bb.cx + xf.ox, bb.cy + xf.oy]);
                    tg.property("ADBE Vector Scale").setValue([sx, sy]);
                    tg.property("ADBE Vector Rotation").setValue(xf.rot);
                    if (xf.skew) {
                        try {
                            tg.property("ADBE Vector Skew").setValue(-xf.skew);
                        }
                        catch (eSkw) { }
                    }
                    tg.property("ADBE Vector Group Opacity").setValue(xf.op);
                }
                catch (eXf) {
                    return;
                }
                try {
                    var T0 = xf.t0, P = xf.sp, ph = "var t=Math.max(0,time-" + T0 + ");var ph=t*2*Math.PI/" + P + ";";
                    if (xf.fx === 1) {
                        tg.property("ADBE Vector Scale").expression = ph + "var k=1+0.06*Math.sin(ph);[value[0]*k,value[1]*k]";
                    }
                    else if (xf.fx === 2) {
                        tg.property("ADBE Vector Position").expression = ph + "[value[0],value[1]-" + xf.amp + "*Math.sin(ph)]";
                    }
                    else if (xf.fx === 3) {
                        tg.property("ADBE Vector Group Opacity").expression = ph + "value*(0.6+0.4*Math.cos(ph))";
                    }
                    else if (xf.fx === 4) {
                        tg.property("ADBE Vector Position").expression = ph + "[value[0]+" + xf.amp + "*Math.sin(ph),value[1]]";
                    }
                    else if (xf.fx === 5) {
                        tg.property("ADBE Vector Rotation").expression = ph + "value+6*Math.sin(ph)";
                    }
                    else if (xf.fx === 6) {
                        tg.property("ADBE Vector Rotation").expression = ph + "value+ph*180/Math.PI";
                    }
                    else if (xf.fx === 7) {
                        tg.property("ADBE Vector Scale").expression = ph + "var u=(ph/(2*Math.PI))%1;var k=1+0.09*(Math.exp(-Math.pow((u-0.15)/0.05,2))+Math.exp(-Math.pow((u-0.35)/0.05,2)));[value[0]*k,value[1]*k]";
                    }
                    else if (xf.fx === 8) {
                        tg.property("ADBE Vector Group Opacity").expression = ph + "value*(0.35+0.65*(0.5+0.5*Math.cos(ph)))";
                    }
                    else if (xf.fx === 9) {
                        tg.property("ADBE Vector Scale").expression = ph + "var k=1+0.12*Math.sin(ph);" + ((xf.edge === "t" || xf.edge === "b") ? "[value[0],value[1]*k]" : "[value[0]*k,value[1]]");
                    }
                    else if (xf.fx === 10) {
                        tg.property("ADBE Vector Rotation").expression = ph + "value+5*Math.sin(ph)";
                        tg.property("ADBE Vector Scale").expression = ph + "var k=1+0.04*Math.sin(2*ph);[value[0]*k,value[1]*k]";
                    }
                }
                catch (eFx2) { }
            }
            function xfStroke(c, rgb) {
                var st;
                if (xf && xf.lnOn && rgb) {
                    try {
                        st = c.addProperty("ADBE Vector Graphic - Stroke");
                        st.property("ADBE Vector Stroke Color").setValue(rgba(xf.lnRGB));
                        st.property("ADBE Vector Stroke Width").setValue(xf.lnW);
                    }
                    catch (eSt) { }
                }
            }
            function piece(name, bb, edge, anim, t0, d, draw) {
                var sl = comp.layers.addShape(), ax = bb.cx, ay = bb.cy, eg = (anim === 0 || anim === 12 || anim === 17) ? edge : "c", trim, sp, op, ps, off, v0, fxE, sk, sv;
                sl.name = name;
                try {
                    sl.motionBlur = !!s.mblur && s.mblurShape !== false;
                }
                catch (eMbS) { }
                if (eg === "l") {
                    ax = bb.cx - bb.w / 2;
                }
                else if (eg === "r") {
                    ax = bb.cx + bb.w / 2;
                }
                else if (eg === "t") {
                    ay = bb.cy - bb.h / 2;
                }
                else if (eg === "b") {
                    ay = bb.cy + bb.h / 2;
                }
                sl.property("Anchor Point").setValue([ax, ay]);
                sl.property("Position").setValue([ax, ay]);
                if (xf) {
                    xf.edge = edge;
                }
                trim = draw(sl.property("ADBE Root Vectors Group"), bb);
                if (xf && xf.shOn) {
                    try {
                        fxE = sl.property("ADBE Effect Parade").addProperty("ADBE Drop Shadow");
                        fxE.property("ADBE Drop Shadow-0001").setValue(rgba(xf.shRGB));
                        try {
                            fxE.property("ADBE Drop Shadow-0002").setValue(0.7 * ((fxE.property("ADBE Drop Shadow-0002").maxValue > 0) ? fxE.property("ADBE Drop Shadow-0002").maxValue : 255));
                        }
                        catch (eSo) { }
                        fxE.property("ADBE Drop Shadow-0003").setValue(135);
                        fxE.property("ADBE Drop Shadow-0004").setValue(xf.shDist);
                        fxE.property("ADBE Drop Shadow-0005").setValue(xf.shSoft);
                    }
                    catch (eSh) { }
                }
                if (anim === 0) {
                    if (trim) {
                        kio(trim, 0, 100, t0, d, false);
                    }
                    else {
                        sp = sl.property("Scale");
                        v0 = (eg === "l" || eg === "r") ? [0, 100] : ((eg === "t" || eg === "b") ? [100, 0] : [0, 0]);
                        kio(sp, scv(sp, v0[0], v0[1]), scv(sp, 100, 100), t0, d, false);
                    }
                }
                else if (anim === 1) {
                    sp = sl.property("Scale");
                    kio(sp, scv(sp, 0, 0), scv(sp, 100, 100), t0, d, false);
                }
                else if (anim === 2 || anim === 4 || anim === 5 || anim === 6 || anim === 10) {
                    off = Math.max(size * 1.5, 60);
                    ps = sl.property("Position");
                    if (anim === 2) {
                        v0 = [ax - off, ay];
                    }
                    else if (anim === 4) {
                        v0 = [ax + off, ay];
                    }
                    else if (anim === 5) {
                        v0 = [ax, ay - off];
                    }
                    else if (anim === 6) {
                        v0 = [ax, ay + off];
                    }
                    else {
                        v0 = [ax, ay + off * 0.4];
                    }
                    kio(ps, v0, [ax, ay], t0, d, true);
                    kio(sl.property("Opacity"), 0, 100, t0, d, false);
                }
                else if (anim === 7) {
                    sp = sl.property("Scale");
                    kio(sp, scv(sp, 0, 0), scv(sp, 100, 100), t0, d, false);
                    try {
                        sp.setValueAtTime(t0 + d * 0.6, scv(sp, 112, 112));
                        easeKeys(sp, false);
                    }
                    catch (eBn) { }
                }
                else if (anim === 8) {
                    sp = sl.property("Scale");
                    kio(sp, scv(sp, 0, 0), scv(sp, 100, 100), t0, d, false);
                    kio(sl.property("Rotation"), -120, 0, t0, d, false);
                }
                else if (anim === 9) {
                    sp = sl.property("Scale");
                    v0 = (edge === "l" || edge === "r") ? [0, 100] : ((edge === "t" || edge === "b") ? [100, 0] : [0, 0]);
                    kio(sp, scv(sp, v0[0], v0[1]), scv(sp, 100, 100), t0, d, false);
                }
                else if (anim === 12) {
                    sp = sl.property("Scale");
                    v0 = (eg === "l" || eg === "r") ? 0 : 100;
                    for (sk = 0; sk <= 6; sk++) {
                        sv = sk / 6 * 100;
                        sp.setValueAtTime(t0 + d * sk / 6, (eg === "l" || eg === "r") ? scv(sp, sv, 100) : scv(sp, 100, sv));
                    }
                    try {
                        for (sk = 1; sk <= 6; sk++) {
                            sp.setInterpolationTypeAtKey(sk, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
                        }
                    }
                    catch (eHd) { }
                }
                else if (anim === 13) {
                    op = sl.property("Opacity");
                    for (sk = 0; sk <= 5; sk++) {
                        op.setValueAtTime(t0 + d * sk / 5, (sk % 2 === 1 || sk === 5) ? 100 : 0);
                    }
                    try {
                        for (sk = 1; sk <= 5; sk++) {
                            op.setInterpolationTypeAtKey(sk, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
                        }
                    }
                    catch (eHd2) { }
                }
                else if (anim === 14) {
                    sp = sl.property("Scale");
                    kio(sp, scv(sp, 250, 250), scv(sp, 100, 100), t0, d, false);
                    kio(sl.property("Opacity"), 0, 100, t0, d, false);
                }
                else if (anim === 15) {
                    kio(sl.property("Rotation"), 45, 0, t0, d, false);
                    kio(sl.property("Opacity"), 0, 100, t0, d, false);
                }
                else if (anim === 16) {
                    off = Math.max(size * 1.5, 60);
                    ps = sl.property("Position");
                    ps.setValueAtTime(t0, [ax - off, ay]);
                    ps.setValueAtTime(t0 + d * 0.7, [ax + off * 0.06, ay]);
                    ps.setValueAtTime(t0 + d, [ax, ay]);
                    easeKeys(ps, true);
                    kio(sl.property("Opacity"), 0, 100, t0, d, false);
                }
                else if (anim === 17) {
                    sp = sl.property("Scale");
                    sp.setValueAtTime(t0, scv(sp, 0, 100));
                    sp.setValueAtTime(t0 + d * 0.55, scv(sp, 108, 100));
                    sp.setValueAtTime(t0 + d * 0.8, scv(sp, 97, 100));
                    sp.setValueAtTime(t0 + d, scv(sp, 100, 100));
                    easeKeys(sp, false);
                }
                else if (anim === 18) {
                    var fT = [0, 0.1, 0.2, 0.3, 0.45, 0.6], fV = [0, 100, 0, 100, 20, 100];
                    op = sl.property("Opacity");
                    for (sk = 0; sk < fT.length; sk++) {
                        op.setValueAtTime(t0 + d * fT[sk], fV[sk]);
                    }
                    try {
                        for (sk = 1; sk <= fT.length; sk++) {
                            op.setInterpolationTypeAtKey(sk, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
                        }
                    }
                    catch (eHd3) { }
                }
                else {
                    kio(sl.property("Opacity"), 0, 100, t0, d, false);
                }
                if (fadeOn) {
                    op = sl.property("Opacity");
                    op.setValueAtTime(oS, 100);
                    op.setValueAtTime(oS + oD, 0);
                    easeKeys(op, false);
                }
                sl.moveToEnd();
                return sl;
            }
            function rectArt(rgb, op, rad, strokeRGB, strokeW, trimIt) {
                return function (root, bb) {
                    var g = root.addProperty("ADBE Vector Group"), c = g.property("ADBE Vectors Group"), r = c.addProperty("ADBE Vector Shape - Rect"), f, st, tr = null;
                    r.property("ADBE Vector Rect Size").setValue([bb.w, bb.h]);
                    r.property("ADBE Vector Rect Position").setValue([bb.cx, bb.cy]);
                    r.property("ADBE Vector Rect Roundness").setValue(Math.max(0, Math.min(rad, Math.min(bb.w, bb.h) / 2)));
                    if (rgb) {
                        f = c.addProperty("ADBE Vector Graphic - Fill");
                        f.property("ADBE Vector Fill Color").setValue(rgba(rgb));
                        f.property("ADBE Vector Fill Opacity").setValue(op);
                    }
                    if (strokeRGB) {
                        st = c.addProperty("ADBE Vector Graphic - Stroke");
                        st.property("ADBE Vector Stroke Color").setValue(rgba(strokeRGB));
                        st.property("ADBE Vector Stroke Width").setValue(strokeW);
                    }
                    else {
                        xfStroke(c, rgb);
                    }
                    if (trimIt) {
                        tr = c.addProperty("ADBE Vector Filter - Trim").property("ADBE Vector Trim End");
                    }
                    applyXf(g, bb);
                    return tr;
                };
            }
            function pathArt(pts, closed, rgb, strokeRGB, strokeW, trimIt, fillOp) {
                return function (root, bb) {
                    var g = root.addProperty("ADBE Vector Group"), c = g.property("ADBE Vectors Group"), i, j, sh, pp, tg, f, st, tr = null;
                    for (i = 0; i < pts.length; i++) {
                        sh = new Shape();
                        sh.vertices = pts[i];
                        tg = [];
                        for (j = 0; j < pts[i].length; j++) {
                            tg.push([0, 0]);
                        }
                        sh.inTangents = tg;
                        sh.outTangents = tg;
                        sh.closed = closed;
                        pp = c.addProperty("ADBE Vector Shape - Group");
                        pp.property("ADBE Vector Shape").setValue(sh);
                    }
                    if (rgb) {
                        f = c.addProperty("ADBE Vector Graphic - Fill");
                        f.property("ADBE Vector Fill Color").setValue(rgba(rgb));
                        if (fillOp !== undefined) {
                            f.property("ADBE Vector Fill Opacity").setValue(fillOp);
                        }
                    }
                    if (strokeRGB) {
                        st = c.addProperty("ADBE Vector Graphic - Stroke");
                        st.property("ADBE Vector Stroke Color").setValue(rgba(strokeRGB));
                        st.property("ADBE Vector Stroke Width").setValue(strokeW);
                    }
                    else {
                        xfStroke(c, rgb);
                    }
                    if (trimIt) {
                        tr = c.addProperty("ADBE Vector Filter - Trim").property("ADBE Vector Trim End");
                    }
                    applyXf(g, bb);
                    return tr;
                };
            }
            function ovalArt(rgb) {
                return function (root, bb) {
                    var g = root.addProperty("ADBE Vector Group"), c = g.property("ADBE Vectors Group"), e = c.addProperty("ADBE Vector Shape - Ellipse"), f;
                    e.property("ADBE Vector Ellipse Size").setValue([bb.w, bb.h]);
                    e.property("ADBE Vector Ellipse Position").setValue([bb.cx, bb.cy]);
                    f = c.addProperty("ADBE Vector Graphic - Fill");
                    f.property("ADBE Vector Fill Color").setValue(rgba(rgb));
                    xfStroke(c, rgb);
                    applyXf(g, bb);
                    return null;
                };
            }
            var bb, th, gap, len, L, T, R, B, sk, tt, echoLyr = null, pts, pm, pH, pW, pX, pL, pLyr, kk, sp;
            function slope(deg) { return -Math.tan((deg || 0) * Math.PI / 180); }
            function slant(l, t, r, b, yc, m) {
                function dx(y) { return -m * (y - yc); }
                return [[l + dx(t), t], [r + dx(t), t], [r + dx(b), b], [l + dx(b), b]];
            }
            function bboxOf(p) {
                var i2, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
                for (i2 = 0; i2 < p.length; i2++) {
                    x0 = Math.min(x0, p[i2][0]);
                    x1 = Math.max(x1, p[i2][0]);
                    y0 = Math.min(y0, p[i2][1]);
                    y1 = Math.max(y1, p[i2][1]);
                }
                return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: Math.max(1, x1 - x0), h: Math.max(1, y1 - y0) };
            }
            var LN_MODES = [[0, "l", 0, "l"], [0, "r", 0, "r"], [0, "l", 0, "r"], [0, "r", 0, "l"], [9, "l", 9, "l"], ["ci", "l", "ci", "l"], [2, "l", 2, "l"], [4, "l", 4, "l"],
                [2, "l", 4, "l"], [5, "l", 6, "l"], [6, "l", 5, "l"], [1, "l", 1, "l"], [7, "l", 7, "l"], [12, "l", 12, "l"], [13, "l", 13, "l"], [3, "l", 3, "l"], [5, "l", 5, "l"], [6, "l", 6, "l"],
                [8, "l", 8, "l"], [12, "r", 12, "r"], [12, "l", 12, "r"], [4, "l", 2, "l"], [0, "l", 12, "r"]];
            if (ROLL) {
                if (!CRAWL) {
                    return;
                }
                var RB = s.roll.bar, RL = s.roll.label, cW = comp.width, bh = Math.max(RB.h, TB.h + 8), by = TB.cy, tkT0 = Math.max(0, delay - 0.3);
                var TK_ANIM = [0, 0, 0, 3, 0, 9, 2, 4, 6, 5, 9, 12, 13, 18, 1, 7, 14, 15, 17, 16, 8, 10], TK_EDGE = ["l", "r", "b", "c", "t", "l", "c", "c", "c", "c", "t", "l", "c", "c", "c", "c", "c", "c", "l", "c", "c", "c"];
                var LBL_ANIM = [0, 2, 6, 3, 7, 9, 4, 5, 1, 12, 13, 18, 17, 16, 14, 15, 8, 9], LBL_EDGE = ["l", "c", "c", "c", "c", "l", "c", "c", "c", "l", "c", "c", "l", "c", "c", "c", "c", "t"];
                if (RB.on) {
                    var lnM = LN_MODES[Math.min(17, Math.max(0, Math.floor(RB.lineAnim || 0)))];
                    var lnBotRGB = (RB.lineSep && RB.lineBRGB) ? RB.lineBRGB : RB.lineRGB;
                    var lineLayer = function (nm, cy, h, rgb, an, eg) {
                        if (an === "ci") {
                            piece(nm, { cx: cW / 4, cy: cy, w: cW / 2, h: h }, "l", 0, tkT0 + 0.15, 0.6, rectArt(rgb, 100, 0, null, 0, false));
                            piece(nm + " 2", { cx: cW * 3 / 4, cy: cy, w: cW / 2, h: h }, "r", 0, tkT0 + 0.15, 0.6, rectArt(rgb, 100, 0, null, 0, false));
                        }
                        else {
                            piece(nm, { cx: cW / 2, cy: cy, w: cW, h: h }, eg, an, tkT0 + 0.15, 0.6, rectArt(rgb, 100, 0, null, 0, false));
                        }
                    };
                    if (RB.lw > 0) {
                        lineLayer("QBT Ticker Line", by - bh / 2 + RB.lw / 2, RB.lw, RB.lineRGB, lnM[0], lnM[1]);
                    }
                    if (RB.lwB > 0) {
                        lineLayer("QBT Ticker Line Bottom", by + bh / 2 - RB.lwB / 2, RB.lwB, lnBotRGB, lnM[2], lnM[3]);
                    }
                    bb = { cx: cW / 2, cy: by, w: cW, h: bh };
                    piece("QBT Ticker Bar", bb, TK_EDGE[Math.min(21, Math.max(0, Math.floor(RB.anim || 0)))], TK_ANIM[Math.min(21, Math.max(0, Math.floor(RB.anim || 0)))], tkT0, 0.6, rectArt(RB.rgb, RB.op, 0, null, 0, false));
                }
                if (RL.on) {
                    var lblStr, lsz, lyr, ltp, ld, lr, lc, lum, padX, blkW, slk, lT, lB;
                    try {
                        lblStr = decodeURIComponent(RL.textEnc);
                    }
                    catch (eLd) {
                        lblStr = "LIVE";
                    }
                    lblStr = lblStr.replace(/[\r\n]+/g, " ");
                    if (lblStr === "") {
                        lblStr = "LIVE";
                    }
                    lum = 0.299 * RL.rgb[0] + 0.587 * RL.rgb[1] + 0.114 * RL.rgb[2];
                    lc = (lum > 0.6) ? [0.07, 0.07, 0.07] : [1, 1, 1];
                    if (RL.txAuto === false && RL.txRGB) {
                        lc = RL.txRGB;
                    }
                    lsz = (RL.size && RL.size > 0) ? Math.max(8, Math.round(RL.size)) : Math.max(12, Math.round(curSize * 0.7));
                    var lExt = Math.max(0, RL.ext || 0), lAn = Math.min(17, Math.max(0, Math.floor(RL.anim || 0)));
                    lyr = comp.layers.addText(lblStr);
                    lyr.name = "QBT Ticker Label";
                    ltp = lyr.property("Source Text");
                    ld = ltp.value;
                    try {
                        ld.resetCharStyle();
                    }
                    catch (eRc) { }
                    ld.fontSize = lsz;
                    ld.applyFill = true;
                    ld.fillColor = lc;
                    try {
                        ld.applyStroke = false;
                    }
                    catch (eAs) { }
                    try {
                        ld.font = s.ps;
                    }
                    catch (eFo) { }
                    try {
                        ld.fauxBold = true;
                    }
                    catch (eFb) { }
                    try {
                        ld.tracking = 40;
                    }
                    catch (eTr) { }
                    try {
                        ld.justification = ParagraphJustification.LEFT_JUSTIFY;
                    }
                    catch (eJu) { }
                    ltp.setValue(ld);
                    lr = lyr.sourceRectAtTime(0, false);
                    padX = lsz * 0.7;
                    slk = bh * 0.22;
                    blkW = lr.width + 2 * padX + slk + lExt;
                    lT = by - bh / 2;
                    lB = by + bh / 2;
                    lyr.property("Anchor Point").setValue([lr.left, lr.top + lr.height / 2]);
                    lyr.property("Position").setValue([padX + lExt / 2, by - (RL.txY || 0)]);
                    try {
                        lyr.motionBlur = !!s.mblur && s.mblurText !== false;
                    }
                    catch (eLm) { }
                    bb = { cx: blkW / 2, cy: by, w: blkW, h: bh };
                    pLyr = piece("QBT Ticker Label Block", bb, LBL_EDGE[lAn], LBL_ANIM[lAn], tkT0 + 0.2, 0.5, pathArt([[[0, lT], [blkW, lT], [blkW - slk, lB], [0, lB]]], true, RL.rgb, null, 0, false));
                    pLyr.moveToBeginning();
                    lyr.moveToBeginning();
                    lyr.property("Opacity").setValueAtTime(tkT0 + 0.45, 0);
                    lyr.property("Opacity").setValueAtTime(tkT0 + 0.8, 100);
                    if (RL.tx && RL.tx.on) {
                        try {
                            if (RL.tx.mode === 1) {
                                var sv0 = { layer: layer, preset: preset, delay: delay, dur: dur, size: size, DM: DM, fxCache: fxCache, PASS_OUT: PASS_OUT, OUT_START: OUT_START, OUT_DUR: OUT_DUR, OUT_REVERSE: OUT_REVERSE };
                                try {
                                    layer = lyr;
                                    preset = Math.floor(RL.tx.preset);
                                    delay = tkT0 + 0.45;
                                    dur = Math.max(0.1, RL.tx.dur || 0.7);
                                    size = lsz;
                                    DM = DIRMAP[0];
                                    fxCache = {};
                                    PASS_OUT = false;
                                    OUT_REVERSE = false;
                                    buildPreset();
                                    OUT_DUR = Math.min(dur, comp.duration);
                                    OUT_START = Math.max(0, comp.duration - OUT_DUR);
                                    PASS_OUT = true;
                                    buildPreset();
                                }
                                finally {
                                    layer = sv0.layer;
                                    preset = sv0.preset;
                                    delay = sv0.delay;
                                    dur = sv0.dur;
                                    size = sv0.size;
                                    DM = sv0.DM;
                                    fxCache = sv0.fxCache;
                                    PASS_OUT = sv0.PASS_OUT;
                                    OUT_START = sv0.OUT_START;
                                    OUT_DUR = sv0.OUT_DUR;
                                    OUT_REVERSE = sv0.OUT_REVERSE;
                                }
                            }
                            else {
                                loopFx(lyr, Math.floor(RL.tx.fx), Math.max(0.2, RL.tx.sp || 1.5), (RL.tx.amt > 0) ? RL.tx.amt : 1, Math.max(10, lsz), tkT0 + 0.9);
                            }
                        }
                        catch (eLtx) { }
                    }
                }
                return;
            }
            if (s.line.on) {
                bb = { cx: TB.cx, cy: TB.cy, w: TB.w + 2 * (s.line.pad + tpad), h: TB.h + 2 * (s.line.pad + tpad) };
                if (s.line.skew) {
                    pm = slope(s.line.skew);
                    pH = bb.h;
                    pX = Math.abs(pm) * pH / 2;
                    pts = slant(bb.cx - bb.w / 2 - pX, bb.cy - pH / 2, bb.cx + bb.w / 2 + pX, bb.cy + pH / 2, bb.cy, pm);
                    piece("QBT Text Box", bboxOf(pts), LINE_EDGE[s.line.anim || 0], LINE_ANIM[s.line.anim || 0], sT0 + 0.2, s.line.dur, pathArt([pts], true, null, s.line.rgb, s.line.w, true));
                }
                else {
                    piece("QBT Text Box", bb, LINE_EDGE[s.line.anim || 0], LINE_ANIM[s.line.anim || 0], sT0 + 0.2, s.line.dur, rectArt(null, 0, s.line.rad, s.line.rgb, s.line.w, true));
                }
            }
            if (s.shp.on) {
                th = Math.max(1, s.shp.th);
                gap = th * 1.2 + (s.shp.gap || 0);
                tt = sT0 + 0.1 + (s.shp.delay || 0);
                xf = { len: s.shp.len || 100, ox: s.shp.ox || 0, oy: s.shp.oy || 0, rot: s.shp.rot || 0, op: (s.shp.op === undefined) ? 100 : s.shp.op, edge: "c",
                    lnOn: !!(s.shp.ln && s.shp.ln.on), lnRGB: s.shp.ln ? s.shp.ln.rgb : [1, 1, 1], lnW: s.shp.ln ? s.shp.ln.w : 3,
                    shOn: !!(s.shp.sh && s.shp.sh.on), shRGB: s.shp.sh ? s.shp.sh.rgb : [0, 0, 0], shSoft: s.shp.sh ? s.shp.sh.soft : 12, shDist: s.shp.sh ? s.shp.sh.dist : 6,
                    skew: s.shp.skew || 0, fx: s.shp.fx || 0, sp: Math.max(0.2, s.shp.fxSp || 1.2), t0: tt + s.shp.dur, amp: Math.max(4, th * 0.6) };
                if (s.shp.type === 0) {
                    bb = { cx: TB.l - EXT - gap - th / 2, cy: TB.cy, w: th, h: TB.h + 2 * EXT };
                    piece("QBT Shape", bb, "t", s.shp.anim, tt, s.shp.dur, rectArt(s.shp.rgb, 100, s.shp.rad || 0, null, 0, false));
                }
                else if (s.shp.type === 1) {
                    bb = { cx: TB.cx, cy: TB.t + TB.h + EXT + gap + th / 2, w: TB.w + 2 * EXT, h: th };
                    piece("QBT Shape", bb, "l", s.shp.anim, tt, s.shp.dur, rectArt(s.shp.rgb, 100, s.shp.rad || 0, null, 0, false));
                }
                else if (s.shp.type === 2) {
                    bb = { cx: TB.cx, cy: TB.t - EXT - gap - th / 2, w: TB.w + 2 * EXT, h: th };
                    piece("QBT Shape Top", bb, "r", s.shp.anim, tt, s.shp.dur, rectArt(s.shp.rgb, 100, s.shp.rad || 0, null, 0, false));
                    bb = { cx: TB.cx, cy: TB.t + TB.h + EXT + gap + th / 2, w: TB.w + 2 * EXT, h: th };
                    piece("QBT Shape Bottom", bb, "l", s.shp.anim, tt, s.shp.dur, rectArt(s.shp.rgb, 100, s.shp.rad || 0, null, 0, false));
                }
                else if (s.shp.type === 3) {
                    len = Math.max(TB.h * 1.7, th * 3);
                    bb = { cx: TB.l, cy: TB.cy, w: len, h: len };
                    piece("QBT Shape", bb, "c", s.shp.anim, tt, s.shp.dur, ovalArt(s.shp.rgb));
                }
                else if (s.shp.type === 4) {
                    L = TB.l - EXT - gap;
                    T = TB.t - EXT - gap;
                    R = TB.l + TB.w + EXT + gap;
                    B = TB.t + TB.h + EXT + gap;
                    len = Math.max(th * 5, TB.h * 0.5);
                    bb = { cx: (L + R) / 2, cy: (T + B) / 2, w: R - L, h: B - T };
                    piece("QBT Shape", bb, "c", s.shp.anim, tt, s.shp.dur, pathArt([[[L, T + len], [L, T], [L + len, T]], [[R, B - len], [R, B], [R - len, B]]], false, null, s.shp.rgb, th, true));
                }
                else if (s.shp.type === 6) {
                    pm = slope(s.box.on ? s.box.skew : 0);
                    pL = Math.max(EXT, TB.h * 0.25);
                    pH = TB.h + 2 * pL;
                    pW = TB.w + 2 * pL;
                    pX = Math.abs(pm) * pH / 2;
                    len = Math.max(8, th * 4);
                    pts = slant(TB.cx - pW / 2 - pX + len, TB.cy - pH / 2 + len, TB.cx + pW / 2 + pX + len, TB.cy + pH / 2 + len, TB.cy + len, pm);
                    echoLyr = piece("QBT Shape Echo", bboxOf(pts), "c", s.shp.anim, tt, s.shp.dur, pathArt([pts], true, null, s.shp.rgb, th, true));
                }
                else if (s.shp.type === 7) {
                    pm = slope(s.box.on ? s.box.skew : 0);
                    pL = EXT;
                    pH = TB.h + 2 * pL;
                    pW = TB.w + 2 * pL;
                    pX = Math.abs(pm) * pH / 2;
                    len = s.box.on ? (TB.cy + pH / 2 - th) : (TB.cy + pH / 2 + gap);
                    pts = slant(TB.cx - pW / 2 - pX, len, TB.cx + pW / 2 + pX, len + th, TB.cy, pm);
                    pLyr = piece("QBT Shape Progress", bboxOf(pts), "l", 0, tt, s.shp.dur, pathArt([pts], true, s.shp.rgb, null, 0, false));
                    try {
                        sp = pLyr.property("Scale");
                        len = Math.max(tt + s.shp.dur, delay + dur);
                        sp.setValueAtTime(len, scv(sp, 100, 100));
                        sp.setValueAtTime(Math.max(len + 0.1, oS), scv(sp, 0, 100));
                        kk = sp.nearestKeyIndex(len);
                        sp.setInterpolationTypeAtKey(kk, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.LINEAR);
                        kk = sp.nearestKeyIndex(Math.max(len + 0.1, oS));
                        sp.setInterpolationTypeAtKey(kk, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
                    }
                    catch (eProg) { }
                }
                else if (s.shp.type === 8) {
                    pm = slope(s.box.on ? s.box.skew : 0);
                    pL = Math.max(EXT, (s.box.on || s.line.on) ? 0 : TB.h * 0.2);
                    pH = TB.h + 2 * pL;
                    pW = TB.w + 2 * pL;
                    pX = Math.abs(pm) * pH / 2;
                    len = TB.cy + pH / 2;
                    pts = slant(TB.cx - pW / 2 - pX, len, TB.cx + pW / 2 + pX, len + th, TB.cy, pm);
                    piece("QBT Shape Strip", bboxOf(pts), "l", s.shp.anim, tt, s.shp.dur, pathArt([pts], true, s.shp.rgb, null, 0, false));
                }
                else if (s.shp.type === 9) {
                    bb = { cx: TB.l + TB.w + EXT + gap + th / 2, cy: TB.cy, w: th, h: TB.h + 2 * EXT };
                    piece("QBT Shape", bb, "t", s.shp.anim, tt, s.shp.dur, rectArt(s.shp.rgb, 100, s.shp.rad || 0, null, 0, false));
                }
                else if (s.shp.type === 10) {
                    pH = TB.h + 2 * EXT + th * 2;
                    pX = TB.l - EXT - gap - th;
                    pts = [[pX, TB.cy + pH / 2], [pX + pH * 0.3, TB.cy - pH / 2]];
                    piece("QBT Shape Slash", bboxOf(pts), "c", s.shp.anim, tt, s.shp.dur, pathArt([pts], false, null, s.shp.rgb, th, true));
                }
                else if (s.shp.type === 11) {
                    pH = TB.h + 2 * EXT + th * 2;
                    pX = TB.l + TB.w + EXT + gap + th;
                    pts = [[pX, TB.cy + pH / 2], [pX - pH * 0.3, TB.cy - pH / 2]];
                    piece("QBT Shape Slash Right", bboxOf(pts), "c", s.shp.anim, tt, s.shp.dur, pathArt([pts], false, null, s.shp.rgb, th, true));
                }
                else if (s.shp.type === 12 || s.shp.type === 13) {
                    bb = { cx: TB.cx, cy: TB.t + TB.h + EXT + gap + th / 2, w: TB.w + 2 * EXT, h: th };
                    piece("QBT Shape Track", bb, "l", 3, tt, s.shp.dur, rectArt(s.shp.rgb, 30, s.shp.rad || 0, null, 0, false));
                    pLyr = piece("QBT Shape Progress", bb, "l", 0, 0, 0.1, rectArt(s.shp.rgb, 100, s.shp.rad || 0, null, 0, false));
                    try {
                        sp = pLyr.property("Scale");
                        while (sp.numKeys > 0) {
                            sp.removeKey(1);
                        }
                        sp.setValueAtTime(0, scv(sp, (s.shp.type === 12) ? 0 : 100, 100));
                        sp.setValueAtTime(compDur, scv(sp, (s.shp.type === 12) ? 100 : 0, 100));
                        for (kk = 1; kk <= 2; kk++) {
                            sp.setInterpolationTypeAtKey(kk, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
                        }
                    }
                    catch (eProg2) { }
                }
                else if (s.shp.type === 14) {
                    bb = { cx: TB.cx, cy: TB.t + TB.h + EXT + gap + th / 2, w: TB.w + 2 * EXT, h: th };
                    piece("QBT Shape", bb, "l", s.shp.anim, tt, s.shp.dur, rectArt(s.shp.rgb, 100, s.shp.rad || 0, null, 0, false));
                    bb = { cx: TB.cx, cy: bb.cy + th * 2, w: TB.w + 2 * EXT, h: th };
                    piece("QBT Shape 2", bb, "l", s.shp.anim, tt + 0.12, s.shp.dur, rectArt(s.shp.rgb, 100, s.shp.rad || 0, null, 0, false));
                }
                else if (s.shp.type === 15) {
                    len = Math.max(th * 2, 8);
                    bb = { cx: TB.l - EXT - gap - len / 2, cy: TB.cy, w: len, h: len };
                    piece("QBT Shape Dot", bb, "c", s.shp.anim, tt, s.shp.dur, ovalArt(s.shp.rgb));
                }
                else if (s.shp.type === 16) {
                    len = Math.max(TB.h * 0.8, th * 3);
                    pX = TB.l - EXT - gap - len / 2;
                    pts = [[pX, TB.cy - len / 2], [pX + len / 2, TB.cy], [pX, TB.cy + len / 2], [pX - len / 2, TB.cy]];
                    piece("QBT Shape Diamond", bboxOf(pts), "c", s.shp.anim, tt, s.shp.dur, pathArt([pts], true, s.shp.rgb, null, 0, false));
                }
                else if (s.shp.type === 17) {
                    pW = Math.max(TB.h * 0.7, th * 2.5);
                    pH = Math.max(TB.h * 0.9, th * 3);
                    pX = TB.l - EXT - gap - pW;
                    pts = [[pX, TB.cy - pH / 2], [pX + pW, TB.cy], [pX, TB.cy + pH / 2]];
                    piece("QBT Shape Arrow", bboxOf(pts), "l", s.shp.anim, tt, s.shp.dur, pathArt([pts], true, s.shp.rgb, null, 0, false));
                }
                else if (s.shp.type === 18) {
                    L = TB.l - EXT - gap;
                    R = TB.l + TB.w + EXT + gap;
                    T = TB.t - EXT;
                    B = TB.t + TB.h + EXT;
                    len = Math.max(th * 4, TB.h * 0.3);
                    bb = { cx: (L + R) / 2, cy: (T + B) / 2, w: R - L, h: B - T };
                    piece("QBT Shape Brackets", bb, "c", s.shp.anim, tt, s.shp.dur, pathArt([[[L + len, T], [L, T], [L, B], [L + len, B]], [[R - len, T], [R, T], [R, B], [R - len, B]]], false, null, s.shp.rgb, th, true));
                }
                else if (s.shp.type === 19) {
                    pH = Math.max(TB.h * 0.7, th * 3);
                    pX = TB.l - EXT - gap - pH * 0.95;
                    pts = [[[pX, TB.cy - pH / 2], [pX + pH * 0.45, TB.cy], [pX, TB.cy + pH / 2]], [[pX + pH * 0.5, TB.cy - pH / 2], [pX + pH * 0.95, TB.cy], [pX + pH * 0.5, TB.cy + pH / 2]]];
                    piece("QBT Shape Chevrons", bboxOf(pts[0].concat(pts[1])), "c", s.shp.anim, tt, s.shp.dur, pathArt(pts, false, null, s.shp.rgb, th, true));
                }
                else if (s.shp.type === 20) {
                    L = TB.l - EXT - gap;
                    T = TB.t - EXT - gap;
                    len = Math.max(TB.h * 0.9, th * 4);
                    pts = [[L, T], [L + len, T], [L, T + len]];
                    piece("QBT Shape Corner", bboxOf(pts), "l", s.shp.anim, tt, s.shp.dur, pathArt([pts], true, s.shp.rgb, null, 0, false));
                }
                else if (s.shp.type === 21) {
                    pH = TB.h + 2 * EXT + th * 2;
                    pX = TB.l - EXT - gap - th;
                    pts = [[[pX, TB.cy + pH / 2], [pX + pH * 0.3, TB.cy - pH / 2]], [[pX - th * 2.5, TB.cy + pH / 2], [pX - th * 2.5 + pH * 0.3, TB.cy - pH / 2]]];
                    piece("QBT Shape Double Slash", bboxOf(pts[0].concat(pts[1])), "c", s.shp.anim, tt, s.shp.dur, pathArt(pts, false, null, s.shp.rgb, th, true));
                }
                else if (s.shp.type === 22) {
                    len = Math.max(th * 2, 8);
                    bb = { cx: TB.l - EXT - gap - len / 2, cy: TB.cy, w: len, h: len };
                    piece("QBT Shape Square", bb, "c", s.shp.anim, tt, s.shp.dur, rectArt(s.shp.rgb, 100, s.shp.rad || 0, null, 0, false));
                }
                else if (s.shp.type === 23) {
                    len = Math.max(TB.h * 0.7, th * 3);
                    pX = TB.l - EXT - gap - len / 2;
                    pts = [[pX - len / 2, TB.cy + len * 0.43], [pX + len / 2, TB.cy + len * 0.43], [pX, TB.cy - len * 0.57]];
                    piece("QBT Shape Triangle", bboxOf(pts), "c", s.shp.anim, tt, s.shp.dur, pathArt([pts], true, s.shp.rgb, null, 0, false));
                }
                else if (s.shp.type === 24 || s.shp.type === 27) {
                    len = Math.max(TB.h * 0.55, th * 2.5);
                    pX = TB.l - EXT - gap - len;
                    pts = [];
                    for (kk = 0; kk < ((s.shp.type === 24) ? 10 : 6); kk++) {
                        pH = (s.shp.type === 24) ? (-90 + 36 * kk) : (60 * kk);
                        pW = (s.shp.type === 24) ? ((kk % 2) ? len * 0.45 : len) : len;
                        pts.push([pX + Math.cos(pH * Math.PI / 180) * pW, TB.cy + Math.sin(pH * Math.PI / 180) * pW]);
                    }
                    piece((s.shp.type === 24) ? "QBT Shape Star" : "QBT Shape Hexagon", bboxOf(pts), "c", s.shp.anim, tt, s.shp.dur, pathArt([pts], true, s.shp.rgb, null, 0, false));
                }
                else if (s.shp.type >= 28 && s.shp.type <= 35) {
                    var bpd = Math.max(0, (s.shp.pad === undefined) ? 12 : s.shp.pad), bW0 = TB.w + 2 * EXT + 2 * bpd, bH0 = TB.h + 2 * EXT + 2 * bpd, bSq = Math.max(bW0, bH0), bRd = 0, bK, srad2 = s.shp.rad || 0;
                    if (s.shp.type === 28 || s.shp.type === 31) {
                        bb = { cx: TB.cx, cy: TB.cy, w: bSq, h: bSq };
                        bRd = (s.shp.type === 31) ? (srad2 > 0 ? srad2 : bSq * 0.25) : srad2;
                        piece((s.shp.type === 31) ? "QBT Shape Rounded Square" : "QBT Shape Square Box", bb, "c", s.shp.anim, tt, s.shp.dur, rectArt(s.shp.rgb, 100, bRd, null, 0, false));
                    }
                    else if (s.shp.type === 29 || s.shp.type === 30) {
                        bb = { cx: TB.cx, cy: TB.cy, w: bW0, h: bH0 };
                        bRd = (s.shp.type === 30) ? (srad2 > 0 ? srad2 : Math.min(bW0, bH0) * 0.25) : srad2;
                        piece((s.shp.type === 30) ? "QBT Shape Rounded Box" : "QBT Shape Rectangular Box", bb, "l", s.shp.anim, tt, s.shp.dur, rectArt(s.shp.rgb, 100, bRd, null, 0, false));
                    }
                    else if (s.shp.type === 32) {
                        len = Math.sqrt(bW0 * bW0 + bH0 * bH0);
                        bb = { cx: TB.cx, cy: TB.cy, w: len, h: len };
                        piece("QBT Shape Circle", bb, "c", s.shp.anim, tt, s.shp.dur, ovalArt(s.shp.rgb));
                    }
                    else if (s.shp.type === 33) {
                        pts = [[TB.cx, TB.cy - bH0], [TB.cx + bW0, TB.cy], [TB.cx, TB.cy + bH0], [TB.cx - bW0, TB.cy]];
                        piece("QBT Shape Diamond", bboxOf(pts), "c", s.shp.anim, tt, s.shp.dur, pathArt([pts], true, s.shp.rgb, null, 0, false));
                    }
                    else if (s.shp.type === 34) {
                        bK = bH0 * 0.5;
                        L = TB.cx - (bW0 + 2 * bK) / 2;
                        R = TB.cx + (bW0 + 2 * bK) / 2;
                        T = TB.cy - bH0 / 2;
                        B = TB.cy + bH0 / 2;
                        pts = [[L + bK, T], [R - bK, T], [R, TB.cy], [R - bK, B], [L + bK, B], [L, TB.cy]];
                        piece("QBT Shape Hexagon Box", bboxOf(pts), "c", s.shp.anim, tt, s.shp.dur, pathArt([pts], true, s.shp.rgb, null, 0, false));
                    }
                    else {
                        bK = Math.min(bW0, bH0) * 0.3;
                        L = TB.cx - (bW0 + bK) / 2;
                        R = TB.cx + (bW0 + bK) / 2;
                        T = TB.cy - (bH0 + bK) / 2;
                        B = TB.cy + (bH0 + bK) / 2;
                        pts = [[L + bK, T], [R - bK, T], [R, T + bK], [R, B - bK], [R - bK, B], [L + bK, B], [L, B - bK], [L, T + bK]];
                        piece("QBT Shape Octagon", bboxOf(pts), "c", s.shp.anim, tt, s.shp.dur, pathArt([pts], true, s.shp.rgb, null, 0, false));
                    }
                }
                else if (s.shp.type === 25) {
                    bb = { cx: TB.cx, cy: TB.cy, w: TB.w + 2 * EXT + TB.h * 0.6, h: TB.h + 2 * EXT + TB.h * 0.2 };
                    piece("QBT Shape Pill", bb, "l", s.shp.anim, tt, s.shp.dur, rectArt(s.shp.rgb, 100, bb.h / 2, null, 0, false));
                }
                else if (s.shp.type === 26) {
                    bb = { cx: TB.cx, cy: TB.cy, w: TB.w + 2 * EXT + TB.h * 1.2, h: (TB.h + 2 * EXT) * 1.5 };
                    piece("QBT Shape Ellipse", bb, "c", s.shp.anim, tt, s.shp.dur, ovalArt(s.shp.rgb));
                }
                else {
                    bb = { cx: TB.cx, cy: TB.cy, w: TB.w + 2 * EXT + TB.h * 0.3, h: TB.h + 2 * EXT };
                    sk = bb.h * 0.3;
                    L = bb.cx - bb.w / 2;
                    R = L + bb.w;
                    T = bb.cy - bb.h / 2;
                    B = T + bb.h;
                    piece("QBT Shape", bb, "l", s.shp.anim, tt, s.shp.dur, pathArt([[[L + sk, T], [R, T], [R - sk, B], [L, B]]], true, s.shp.rgb, null, 0, false));
                }
            }
            if (s.shp.tb && s.shp.tb.on) {
                xf = null;
                (function () {
                    var TBo = s.shp.tb, tw = Math.max(0, TBo.w), twB = Math.max(0, TBo.wB), ix = Math.min(22, Math.max(0, Math.floor(TBo.anim || 0))), tM = LN_MODES[ix].slice(0), tAll = !!TBo.all, vt = !!TBo.vert && !tAll;
                    var twC = Math.max(0, TBo.wC || 0), twD = Math.max(0, TBo.wD || 0);
                    var tdur = Math.max(0.1, TBo.dur || 0.6), tg2 = TBo.gap || 0, ttb = sT0 + 0.1 + (TBo.delay || 0);
                    var rgb2 = (TBo.sep && TBo.rgbB) ? TBo.rgbB : TBo.rgb, rgbL = (TBo.sep && TBo.rgbC) ? TBo.rgbC : TBo.rgb, rgbR = (TBo.sep && TBo.rgbD) ? TBo.rgbD : TBo.rgb;
                    function swE(e) { return e === "l" ? "t" : (e === "r" ? "b" : e); }
                    var tMV = (ix === 9) ? [2, "t", 4, "t"] : ((ix === 10) ? [4, "t", 2, "t"] : [tM[0], swE(tM[1]), tM[2], swE(tM[3])]);
                    function tbLine(nm, v, off, thk, rgb, an, eg) {
                        var tLen = v ? (TB.h + 2 * EXT) * Math.max(0.1, (TBo.vs || 100) / 100) : (TB.w + 2 * EXT) * Math.max(0.1, (TBo.hs || 100) / 100);
                        if (an === "ci") {
                            piece(nm, v ? { cx: off, cy: TB.cy - tLen / 4, w: thk, h: tLen / 2 } : { cx: TB.cx - tLen / 4, cy: off, w: tLen / 2, h: thk }, v ? "t" : "l", 0, ttb, tdur, rectArt(rgb, 100, 0, null, 0, false));
                            piece(nm + " 2", v ? { cx: off, cy: TB.cy + tLen / 4, w: thk, h: tLen / 2 } : { cx: TB.cx + tLen / 4, cy: off, w: tLen / 2, h: thk }, v ? "b" : "r", 0, ttb, tdur, rectArt(rgb, 100, 0, null, 0, false));
                        }
                        else {
                            piece(nm, v ? { cx: off, cy: TB.cy, w: thk, h: tLen } : { cx: TB.cx, cy: off, w: tLen, h: thk }, eg, an, ttb, tdur, rectArt(rgb, 100, 0, null, 0, false));
                        }
                    }
                    var offTop = TB.t - EXT - (tw * 1.2 + tg2) - tw / 2, offBot = TB.t + TB.h + EXT + (twB * 1.2 + tg2) + twB / 2;
                    var offLft = TB.l - EXT - ((tAll ? twC : tw) * 1.2 + tg2) - (tAll ? twC : tw) / 2, offRgt = TB.l + TB.w + EXT + ((tAll ? twD : twB) * 1.2 + tg2) + (tAll ? twD : twB) / 2;
                    if (tAll) {
                        if (tw > 0) {
                            tbLine("QBT Line Top", false, offTop, tw, TBo.rgb, tM[0], tM[1]);
                        }
                        if (twB > 0) {
                            tbLine("QBT Line Bottom", false, offBot, twB, rgb2, tM[2], tM[3]);
                        }
                        if (twC > 0) {
                            tbLine("QBT Line Left", true, offLft, twC, rgbL, tMV[0], tMV[1]);
                        }
                        if (twD > 0) {
                            tbLine("QBT Line Right", true, offRgt, twD, rgbR, tMV[2], tMV[3]);
                        }
                    }
                    else if (vt) {
                        offLft = TB.l - EXT - (tw * 1.2 + tg2) - tw / 2;
                        offRgt = TB.l + TB.w + EXT + (twB * 1.2 + tg2) + twB / 2;
                        if (tw > 0) {
                            tbLine("QBT Line Left", true, offLft, tw, TBo.rgb, tMV[0], tMV[1]);
                        }
                        if (twB > 0) {
                            tbLine("QBT Line Right", true, offRgt, twB, rgb2, tMV[2], tMV[3]);
                        }
                    }
                    else {
                        if (tw > 0) {
                            tbLine("QBT Line Top", false, offTop, tw, TBo.rgb, tM[0], tM[1]);
                        }
                        if (twB > 0) {
                            tbLine("QBT Line Bottom", false, offBot, twB, rgb2, tM[2], tM[3]);
                        }
                    }
                })();
            }
            xf = null;
            if (s.box.on) {
                bb = { cx: TB.cx, cy: TB.cy, w: TB.w + 2 * (s.box.pad + tpad), h: TB.h + 2 * (s.box.pad + tpad) };
                if (s.box.skew) {
                    pm = slope(s.box.skew);
                    pX = Math.abs(pm) * bb.h / 2;
                    pts = slant(bb.cx - bb.w / 2 - pX, bb.cy - bb.h / 2, bb.cx + bb.w / 2 + pX, bb.cy + bb.h / 2, bb.cy, pm);
                    piece("QBT Background Box", bboxOf(pts), BOX_EDGE[s.box.anim], BOX_ANIM[s.box.anim], sT0, s.box.dur, pathArt([pts], true, s.box.rgb, null, 0, false, s.box.op));
                }
                else {
                    piece("QBT Background Box", bb, BOX_EDGE[s.box.anim], BOX_ANIM[s.box.anim], sT0, s.box.dur, rectArt(s.box.rgb, s.box.op, s.box.rad, null, 0, false));
                }
            }
            if (echoLyr) {
                echoLyr.moveToEnd();
            }
        };
        if (TB) {
            try {
                buildShapes();
            }
            catch (eShapes) {
                fitNote += (fitNote ? " " : "") + "Shapes failed: " + String(eShapes.message || eShapes).replace(/[|\r\n]+/g, " ");
            }
        }
        if (s.bg) {
            var solid = comp.layers.addSolid(s.bgRGB, "Text BG", comp.width, comp.height, comp.pixelAspect, compDur);
            solid.moveToEnd();
        }
        try {
            var dEnd = textProp.value;
            if (!sameJ(dEnd.justification, curJust)) {
                dEnd.justification = curJust;
                textProp.setValue(dEnd);
                fitNote += (fitNote ? " " : "") + (sameJ(textProp.value.justification, curJust) ? "The text alignment was set again at the end." : "After Effects did not keep the text alignment.");
            }
        }
        catch (eEnd) { }
        if (alignDiagText) {
            fitNote += (fitNote ? " " : "") + alignDiagText;
        }
        app.project.save(new File(aepPath));
        finish("OK|" + compName + (fitNote ? "|" + fitNote : ""));
    }
    catch (err) {
        finish("ERROR|" + err.toString() + " (line " + err.line + ")");
    }
}
