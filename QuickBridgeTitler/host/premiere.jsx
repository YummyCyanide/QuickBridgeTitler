var QBT_ROOT = "";
var QBT_IS_WIN = ($.os.indexOf("Windows") !== -1);
var QBT_BIN_NAME = "Ae Linked Comp";
var QBT_AE_SPEC = "";
function QBT_setRoot(p) { QBT_ROOT = p; return "ok"; }
function QBT_q(str) {
    return '"' + String(str).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
}
var QBT_DEFAULT_BASE = "Text animation";
var QBT_DEFAULT_FOLDER = "Ae Linked Comp";
if (typeof $.global.QBT_SESSION === "undefined") {
    $.global.QBT_SESSION = { dir: "" };
}
function QBT_trim(t) { return String(t).replace(/^\s+|\s+$/g, ""); }
function QBT_reEsc(t) { return String(t).replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&"); }
function QBT_cleanBase(b) {
    var t = QBT_trim(String(b === undefined || b === null ? "" : b).replace(/[\r\n\t|]+/g, " "));
    return t === "" ? QBT_DEFAULT_BASE : t;
}
function QBT_fileSafe(name) {
    var t = String(name).replace(/[\\\/:*?"<>|\r\n\t]+/g, "_");
    t = QBT_trim(t);
    if (t === "") {
        t = QBT_DEFAULT_BASE;
    }
    return t;
}
function QBT_projectInfo() {
    var p = "", id = "";
    try {
        p = app.project.path;
    }
    catch (e1) { }
    try {
        id = app.project.documentID;
    }
    catch (e2) { }
    if (p === undefined || p === null) {
        p = "";
    }
    if (id === undefined || id === null) {
        id = "";
    }
    return String(p) + "\t" + String(id);
}
function QBT_findBin() {
    try {
        var root = app.project.rootItem, i;
        for (i = 0; i < root.children.numItems; i++) {
            if (root.children[i].name === QBT_BIN_NAME) {
                return root.children[i];
            }
        }
    }
    catch (e) { }
    return null;
}
function QBT_binHasName(name) {
    try {
        var bin = QBT_findBin(), i;
        if (!bin) {
            return false;
        }
        for (i = 0; i < bin.children.numItems; i++) {
            if (String(bin.children[i].name).toLowerCase() === String(name).toLowerCase()) {
                return true;
            }
        }
    }
    catch (e) { }
    return false;
}
function QBT_fmtName(base, n) { return n <= 1 ? base : base + "_" + n; }
function QBT_binMax(base) {
    var max = 0, i, nm, m, re = new RegExp("^" + QBT_reEsc(base) + "_(\\d+)$", "i");
    try {
        var bin = QBT_findBin();
        if (bin) {
            for (i = 0; i < bin.children.numItems; i++) {
                nm = String(bin.children[i].name);
                if (nm.toLowerCase() === base.toLowerCase() && max < 1) {
                    max = 1;
                }
                m = re.exec(nm);
                if (m && parseInt(m[1], 10) > max) {
                    max = parseInt(m[1], 10);
                }
            }
        }
    }
    catch (e2) { }
    return max;
}
function QBT_nextNumber(base, last) {
    var l = parseInt(last, 10);
    if (isNaN(l) || l < 0) {
        l = 0;
    }
    try {
        base = QBT_cleanBase(base);
        var n = Math.max(l, QBT_binMax(base)) + 1;
        while (QBT_binHasName(QBT_fmtName(base, n))) {
            n++;
        }
        return String(n);
    }
    catch (e) {
        return String(l + 1);
    }
}
function QBT_makeName(base, last) {
    base = QBT_cleanBase(base);
    return QBT_fmtName(base, parseInt(QBT_nextNumber(base, last), 10));
}
function QBT_setSessionDir(d) { $.global.QBT_SESSION.dir = (d === undefined || d === null) ? "" : String(d); return "ok"; }
function QBT_getSessionDir() { return $.global.QBT_SESSION.dir; }
function QBT_outDir(custom) {
    if (custom && custom !== "") {
        return new Folder(custom);
    }
    var p = "";
    try {
        p = app.project.path;
    }
    catch (e) { }
    if (p && p !== "") {
        return new Folder(new File(p).parent.fsName + "/" + QBT_DEFAULT_FOLDER);
    }
    return new Folder(Folder.myDocuments.fsName + "/" + QBT_DEFAULT_FOLDER);
}
function QBT_pickFolder() {
    var f = Folder.selectDialog("Choose a folder for the After Effects projects");
    return f ? f.fsName : "";
}
function QBT_pickFolderFor(title) {
    var f = Folder.selectDialog(title || "Choose a folder");
    return f ? f.fsName : "";
}
function QBT_pickPresetFiles() {
    try {
        var isWin = ($.os.indexOf("Windows") >= 0);
        var filter = isWin ? "Preset files:*.json,All files:*.*" : function (f) { return (f instanceof Folder) || /\.json$/i.test(f.name); };
        var r = File.openDialog("Import Quick Bridge Titler presets, templates and saved titles", filter, true);
        if (!r) {
            return "";
        }
        var out = [], i;
        if (r instanceof Array) {
            for (i = 0; i < r.length; i++) {
                out.push(r[i].fsName);
            }
        }
        else {
            out.push(r.fsName);
        }
        return out.join("|");
    }
    catch (e) {
        return "";
    }
}
function QBT_seqInfo() {
    try {
        var seq = app.project.activeSequence;
        if (!seq) {
            return "ERR";
        }
        var w = seq.frameSizeHorizontal, h = seq.frameSizeVertical;
        var fps = 30;
        try {
            var tb = Number(seq.timebase);
            if (tb > 0) {
                fps = Math.round((254016000000 / tb) * 1000) / 1000;
            }
        }
        catch (e1) { }
        if (!w || !h) {
            return "ERR";
        }
        return w + "|" + h + "|" + fps;
    }
    catch (e) {
        return "ERR";
    }
}
function QBT_findAE() {
    var i, c;
    if (QBT_AE_SPEC) {
        try {
            if (BridgeTalk.isRunning(QBT_AE_SPEC)) {
                return { spec: QBT_AE_SPEC, running: true };
            }
        }
        catch (e0) { }
    }
    var cands = [];
    for (i = 9; i >= 0; i--) {
        cands.push("aftereffects-13." + i);
    }
    cands.push("aftereffects");
    for (i = 0; i < cands.length; i++) {
        c = cands[i];
        try {
            if (BridgeTalk.isRunning(c)) {
                QBT_AE_SPEC = c;
                return { spec: c, running: true };
            }
        }
        catch (e) { }
    }
    var sp = null;
    try {
        sp = BridgeTalk.getSpecifier("aftereffects");
    }
    catch (e2) { }
    if (sp) {
        var r = false;
        try {
            r = BridgeTalk.isRunning(sp);
        }
        catch (e3) { }
        return { spec: sp, running: r };
    }
    return null;
}
function QBT_pingAE() {
    try {
        var ae = QBT_findAE();
        if (!ae) {
            return "ERR: After Effects was not found through BridgeTalk (is CC 2015 installed?)";
        }
        if (ae.running) {
            return "OK: " + ae.spec + " is running.";
        }
        return "OFF: " + ae.spec + " found but not running (it will be launched when needed).";
    }
    catch (e) {
        return "ERR: " + e.toString();
    }
}
function QBT_startJob(str) {
    try {
        var s = eval("(" + str + ")");
        var ae = QBT_findAE();
        if (!ae) {
            return "ERR|After Effects was not found through BridgeTalk. Is After Effects CC 2015 installed?";
        }
        var dir = QBT_outDir(s.outDir);
        if (!dir.exists) {
            dir.create();
        }
        if (!dir.exists) {
            return "ERR|Could not create folder: " + dir.fsName;
        }
        var compName = QBT_makeName(s.compBase, s.compLast);
        var base = QBT_fileSafe(compName);
        var aep = new File(dir.fsName + "/" + base + ".aep");
        var dup = 2;
        while (aep.exists) {
            aep = new File(dir.fsName + "/" + base + "_" + dup + ".aep");
            dup++;
        }
        var fileBase = (dup === 2) ? base : (base + "_" + (dup - 1));
        var done = new File(dir.fsName + "/" + fileBase + ".done");
        if (done.exists) {
            done.remove();
        }
        var builder = new File(QBT_ROOT + "/host/ae_builder.jsx");
        if (!builder.exists) {
            return "ERR|host/ae_builder.jsx was not found in the extension folder.";
        }
        // After Effects keeps the builder between jobs: it is loaded from disk only the first time
        // (or when the file changed), instead of sending the whole script over BridgeTalk for every job.
        var ver = "0";
        try {
            ver = builder.length + ":" + builder.modified.getTime();
        }
        catch (eV) { }
        var body = "if (typeof $.global.__qbtBuildTextAEP !== \"function\" || $.global.__qbtBuildVer !== " + QBT_q(ver) + ") {\n" +
            "try { var __qf = new File(" + QBT_q(builder.fsName) + "); __qf.encoding = \"UTF-8\"; " +
            "if (__qf.open(\"r\")) { var __qc = __qf.read(); __qf.close(); eval(__qc); " +
            "$.global.__qbtBuildTextAEP = __qbtBuildTextAEP; $.global.__qbtBuildVer = " + QBT_q(ver) + "; } } catch (__qe) { }\n}\n" +
            "if (typeof $.global.__qbtBuildTextAEP === \"function\") { $.global.__qbtBuildTextAEP(" + str + ", " + QBT_q(aep.fsName) + ", " + QBT_q(done.fsName) + ", " + QBT_q(compName) + "); }\n" +
            "else { try { var __qd = new File(" + QBT_q(done.fsName) + "); __qd.encoding = \"UTF-8\"; __qd.open(\"w\"); " +
            "__qd.write(\"ERROR|After Effects could not load host/ae_builder.jsx.\"); __qd.close(); } catch (__qe2) { } }";
        if (!ae.running) {
            try {
                BridgeTalk.launch(ae.spec, "background");
            }
            catch (eL) {
                BridgeTalk.launch(ae.spec);
            }
        }
        var bt = new BridgeTalk();
        bt.target = ae.spec;
        bt.body = body;
        bt.send();
        return "OK|" + aep.fsName + "|" + done.fsName + "|" + compName + "|" + ae.spec + "|" + (ae.running ? "already running" : "launched");
    }
    catch (e) {
        return "ERR|" + e.toString() + " (line " + e.line + ")";
    }
}
function QBT_checkDone(donePath, aepPath) {
    try {
        var f = new File(donePath);
        if (f.exists) {
            f.encoding = "UTF-8";
            f.open("r");
            var t = f.read();
            f.close();
            try {
                f.remove();
            }
            catch (e0) { }
            return t;
        }
        if (new File(aepPath).exists) {
            return "AEP";
        }
        return "";
    }
    catch (e) {
        return "";
    }
}
function QBT_openAE() {
    try {
        var ae = QBT_findAE();
        if (!ae) {
            return "ERR: After Effects was not found through BridgeTalk. Is it installed?";
        }
        if (ae.running) {
            try {
                BridgeTalk.bringToFront(ae.spec);
            }
            catch (e0) { }
            return "OK: After Effects is already running.";
        }
        BridgeTalk.launch(ae.spec);
        return "OK: Starting After Effects...";
    }
    catch (e) {
        return "ERR: " + e.toString();
    }
}
function QBT_getBin() {
    var b = QBT_findBin();
    return b ? b : app.project.rootItem.createBin(QBT_BIN_NAME);
}
function QBT_findItem(bin, name) {
    var i, found = null;
    for (i = 0; i < bin.children.numItems; i++) {
        if (bin.children[i].name === name) {
            found = bin.children[i];
        }
    }
    if (found) {
        return found;
    }
    for (i = 0; i < bin.children.numItems; i++) {
        if (String(bin.children[i].name).indexOf(name) !== -1) {
            found = bin.children[i];
        }
    }
    return found;
}
function QBT_importAE(aep, compName) {
    var log = [];
    try {
        var bin = QBT_getBin();
        try {
            var r = app.project.importAEComps(aep, [compName], bin);
            log.push("importAEComps returned " + r);
            if (QBT_findItem(bin, compName)) {
                return "OK|importAEComps";
            }
        }
        catch (e1) {
            log.push("importAEComps: " + e1.toString());
        }
        try {
            app.project.importFiles([aep], false, bin, false);
            if (QBT_findItem(bin, compName)) {
                return "OK|importFiles (dialog)";
            }
            log.push("importFiles ran but the comp item was not found");
        }
        catch (e2) {
            log.push("importFiles: " + e2.toString());
        }
        return "ERR|" + log.join("; ");
    }
    catch (e) {
        return "ERR|" + e.toString();
    }
}
var QBT_TICKS = 254016000000;
function QBT_tcToSeconds(tc, fps) {
    var parts = String(tc).split(/[:;.,]/), n = [], i;
    for (i = 0; i < parts.length; i++) {
        n.push(parseInt(parts[i], 10) || 0);
    }
    while (n.length < 4) {
        n.unshift(0);
    }
    var h = n[n.length - 4], m = n[n.length - 3], sec = n[n.length - 2], f = n[n.length - 1];
    var nominal = Math.round(fps);
    var dropFrame = (String(tc).indexOf(";") !== -1) && Math.abs(nominal - fps) > 0.001;
    if (dropFrame) {
        var drop = (nominal >= 60) ? 4 : 2, totalMin = 60 * h + m;
        var frames = (h * 3600 + m * 60 + sec) * nominal + f - drop * (totalMin - Math.floor(totalMin / 10));
        return frames / fps;
    }
    return h * 3600 + m * 60 + sec + f / nominal;
}
function QBT_playhead(seq) {
    var t;
    try {
        if (typeof seq.getPlayerPosition === "function") {
            t = seq.getPlayerPosition();
            if (t && t.seconds !== undefined) {
                return { seconds: Number(t.seconds), time: t, how: "api" };
            }
        }
    }
    catch (e1) { }
    try {
        app.enableQE();
        var q = qe.project.getActiveSequence();
        var tc = q.CTI.timecode;
        var fps = 30;
        try {
            var tb = Number(seq.timebase);
            if (tb > 0) {
                fps = QBT_TICKS / tb;
            }
        }
        catch (e2) { }
        var secs = QBT_tcToSeconds(tc, fps);
        var zero = 0;
        try {
            zero = Number(seq.zeroPoint) / QBT_TICKS;
            if (isNaN(zero)) {
                zero = 0;
            }
        }
        catch (e3) { }
        secs = secs - zero;
        if (secs < 0) {
            secs = 0;
        }
        return { seconds: secs, time: null, how: "timecode " + tc };
    }
    catch (e4) { }
    return null;
}
function QBT_clipCount(track) { try {
    return track.clips.numItems;
}
catch (e) {
    return -1;
} }
function QBT_arrived(seq, tn, before) {
    try {
        $.sleep(150);
    }
    catch (e0) { }
    try {
        var now = QBT_clipCount(seq.videoTracks[tn - 1]);
        if (before < 0 || now < 0) {
            return true;
        }
        return now > before;
    }
    catch (e) {
        return false;
    }
}
function QBT_afterInsert(seq, tn, advance, startSecs, ok) {
    if (!advance) {
        return ok;
    }
    try {
        var tr = seq.videoTracks[tn - 1], n = tr.clips.numItems, i, c, best = null, bestD = 0.75, d;
        for (i = 0; i < n; i++) {
            c = tr.clips[i];
            d = Math.abs(Number(c.start.seconds) - startSecs);
            if (d < bestD) {
                bestD = d;
                best = c;
            }
        }
        if (best && best.end) {
            seq.setPlayerPosition(String(best.end.ticks !== undefined ? best.end.ticks : Math.round(Number(best.end.seconds) * QBT_TICKS)));
        }
    }
    catch (eA) { }
    return ok;
}
function QBT_insert(compName, trackNumber, advance) {
    var tried = [];
    try {
        var tn = parseInt(trackNumber, 10);
        if (isNaN(tn) || tn < 1) {
            tn = 1;
        }
        var bin = QBT_findBin();
        var item = bin ? QBT_findItem(bin, compName) : null;
        if (!item) {
            return "ERR|the linked comp is not in the bin yet";
        }
        var seq = app.project.activeSequence;
        if (!seq) {
            try {
                if (app.project.sequences.numSequences > 0) {
                    app.project.openSequence(app.project.sequences[0].sequenceID);
                }
            }
            catch (eO) { }
            seq = app.project.activeSequence;
        }
        if (!seq) {
            return "ERR!no sequence is open";
        }
        var nTracks = 0;
        try {
            nTracks = seq.videoTracks.numTracks;
        }
        catch (eN) { }
        if (nTracks > 0 && tn > nTracks) {
            return "ERR!video track " + tn + " does not exist (the sequence has " + nTracks + ")";
        }
        var track = seq.videoTracks[tn - 1];
        if (!track) {
            return "ERR!video track " + tn + " was not found";
        }
        var ph = QBT_playhead(seq);
        if (!ph) {
            return "ERR!the playhead position could not be read";
        }
        var secs = ph.seconds;
        var before = QBT_clipCount(track), i;
        if (typeof track.overwriteClip === "function") {
            var tries = [];
            if (ph.time) {
                tries.push(ph.time);
            }
            try {
                var tm = new Time();
                tm.seconds = secs;
                tries.push(tm);
            }
            catch (eT) { }
            tries.push(secs);
            tries.push(String(secs));
            tries.push(String(Math.round(secs * QBT_TICKS)));
            for (i = 0; i < tries.length; i++) {
                try {
                    track.overwriteClip(item, tries[i]);
                    if (QBT_arrived(seq, tn, before)) {
                        return QBT_afterInsert(seq, tn, advance, secs, "OK|Track.overwriteClip");
                    }
                }
                catch (e1) {
                    tried.push("Track.overwriteClip: " + e1.toString());
                }
            }
            tried.push("Track.overwriteClip: no clip was added");
        }
        else {
            tried.push("Track.overwriteClip: not available in this Premiere version");
        }
        try {
            app.enableQE();
            var q = qe.project.getActiveSequence();
            var qt = q.getVideoTrackAt(tn - 1);
            if (!qt) {
                throw new Error("QE video track not found");
            }
            var tc = q.CTI.timecode;
            qt.overwrite(item, tc);
            if (QBT_arrived(seq, tn, before)) {
                return QBT_afterInsert(seq, tn, advance, secs, "OK|QE overwrite");
            }
            tried.push("QE overwrite: no clip was added");
        }
        catch (e2) {
            tried.push("QE overwrite: " + e2.toString());
        }
        return "ERR|" + tried.join("; ");
    }
    catch (e) {
        return "ERR|" + e.toString() + (tried.length ? (" (" + tried.join("; ") + ")") : "");
    }
}
function QBT_u16(s, i) { return (s.charCodeAt(i) << 8) | s.charCodeAt(i + 1); }
function QBT_u32(s, i) {
    return (s.charCodeAt(i) * 16777216) + (s.charCodeAt(i + 1) << 16) +
        (s.charCodeAt(i + 2) << 8) + s.charCodeAt(i + 3);
}
function QBT_decodeName(raw, pid) {
    if (pid === 3 || pid === 0) {
        var out = [], j;
        for (j = 0; j + 1 < raw.length; j += 2) {
            out.push(String.fromCharCode((raw.charCodeAt(j) << 8) | raw.charCodeAt(j + 1)));
        }
        return out.join("");
    }
    return raw;
}
function QBT_parseNameTable(nt) {
    var names = {}, prio = {};
    var count = QBT_u16(nt, 2), strOff = QBT_u16(nt, 4), i;
    for (i = 0; i < count; i++) {
        var r = 6 + i * 12;
        if (r + 12 > nt.length) {
            break;
        }
        var pid = QBT_u16(nt, r), lid = QBT_u16(nt, r + 4), nid = QBT_u16(nt, r + 6);
        var len = QBT_u16(nt, r + 8), off = QBT_u16(nt, r + 10);
        if (nid !== 1 && nid !== 2 && nid !== 4 && nid !== 6) {
            continue;
        }
        var p = 0;
        if (pid === 3 && lid === 1033) {
            p = 3;
        }
        else if (pid === 3) {
            p = 2;
        }
        else if (pid === 1) {
            p = 1;
        }
        else {
            continue;
        }
        if (prio[nid] !== undefined && prio[nid] >= p) {
            continue;
        }
        names[nid] = QBT_decodeName(nt.substr(strOff + off, len), pid);
        prio[nid] = p;
    }
    return names;
}
function QBT_readFontFile(file) {
    var found = [];
    try {
        file.encoding = "BINARY";
        if (!file.open("r")) {
            return found;
        }
        var head = file.read(12);
        var tag = head.substr(0, 4);
        var offsets = [], k;
        if (tag === "ttcf") {
            var n = Math.min(QBT_u32(head, 8), 32);
            file.seek(12);
            var dir = file.read(n * 4);
            for (k = 0; k < n; k++) {
                offsets.push(QBT_u32(dir, k * 4));
            }
        }
        else if (tag === "OTTO" || tag === "true" || QBT_u32(head, 0) === 65536) {
            offsets.push(0);
        }
        for (k = 0; k < offsets.length; k++) {
            file.seek(offsets[k]);
            var h = file.read(12);
            var numTables = QBT_u16(h, 4);
            var tdir = file.read(numTables * 16);
            var t, nameOff = -1, nameLen = 0;
            for (t = 0; t < numTables; t++) {
                if (tdir.substr(t * 16, 4) === "name") {
                    nameOff = QBT_u32(tdir, t * 16 + 8);
                    nameLen = QBT_u32(tdir, t * 16 + 12);
                    break;
                }
            }
            if (nameOff < 0) {
                continue;
            }
            file.seek(nameOff);
            var nt = file.read(Math.min(nameLen, 262144));
            var nm = QBT_parseNameTable(nt);
            if (!nm[6]) {
                continue;
            }
            var family = nm[1] || nm[6];
            var style = nm[2] || "Regular";
            var label = nm[4] || (family + " " + style);
            var low = style.toLowerCase();
            var isB = low.indexOf("bold") !== -1;
            var isI = (low.indexOf("italic") !== -1 || low.indexOf("oblique") !== -1);
            var uiStyle = "REGULAR";
            if (isB && isI) {
                uiStyle = "BOLDITALIC";
            }
            else if (isB) {
                uiStyle = "BOLD";
            }
            else if (isI) {
                uiStyle = "ITALIC";
            }
            found.push({ label: label, family: family, uiStyle: uiStyle, ps: nm[6] });
        }
    }
    catch (e) { }
    try {
        file.close();
    }
    catch (e2) { }
    return found;
}
function QBT_scanFonts() {
    var folders = [];
    if (QBT_IS_WIN) {
        var wd = $.getenv("windir");
        folders.push(new Folder((wd ? wd : "C:/Windows") + "/Fonts"));
        var la = $.getenv("LOCALAPPDATA");
        if (la) {
            folders.push(new Folder(la + "/Microsoft/Windows/Fonts"));
        }
    }
    else {
        folders.push(new Folder("/Library/Fonts"));
        folders.push(new Folder("/System/Library/Fonts"));
        folders.push(new Folder("~/Library/Fonts"));
    }
    var seen = {}, result = [], fi, i, q;
    for (fi = 0; fi < folders.length; fi++) {
        if (!folders[fi].exists) {
            continue;
        }
        var files = folders[fi].getFiles(function (f) {
            return (f instanceof File) && /\.(ttf|otf|ttc|otc)$/i.test(f.name);
        });
        for (i = 0; i < files.length; i++) {
            var items = QBT_readFontFile(files[i]);
            for (q = 0; q < items.length; q++) {
                if (!seen[items[q].ps]) {
                    seen[items[q].ps] = true;
                    result.push(items[q]);
                }
            }
        }
    }
    result.sort(function (a, b) {
        var x = a.label.toLowerCase(), y = b.label.toLowerCase();
        return (x < y) ? -1 : ((x > y) ? 1 : 0);
    });
    var lines = [];
    for (i = 0; i < result.length; i++) {
        lines.push([result[i].label, result[i].family, result[i].uiStyle, result[i].ps].join("\t"));
    }
    return lines.join("\n");
}
var QBT_LIVE_NAME = "QuickBridgeTitler_live";
function QBT_liveFolder() {
    var f = new Folder(Folder.temp.fsName + "/" + QBT_LIVE_NAME);
    if (!f.exists) {
        f.create();
    }
    return f;
}
function QBT_liveClean() {
    var n = 0, i, files, f;
    try {
        f = new Folder(Folder.temp.fsName + "/" + QBT_LIVE_NAME);
        if (!f.exists) {
            return "OK|0";
        }
        files = f.getFiles();
        for (i = 0; i < files.length; i++) {
            if (files[i] instanceof File) {
                try {
                    if (files[i].remove()) {
                        n++;
                    }
                }
                catch (e1) { }
            }
        }
        return "OK|" + n;
    }
    catch (e) {
        return "ERR|" + e;
    }
}
function QBT_liveWait(dir, ms) {
    var waited = 0, i, files, last = -1, size, f;
    while (waited <= ms) {
        files = dir.getFiles();
        f = null;
        for (i = 0; i < files.length; i++) {
            if (files[i] instanceof File && files[i].length > 0) {
                f = files[i];
                break;
            }
        }
        if (f) {
            size = f.length;
            if (size === last) {
                return f;
            }
            last = size;
        }
        $.sleep(60);
        waited += 60;
    }
    return null;
}
function QBT_liveExport() {
    var seq, w, h, dir, path, qs, tc, t, f, err = "";
    try {
        if (!app.project) {
            return "ERR|No project is open.";
        }
        seq = app.project.activeSequence;
        if (!seq) {
            return "ERR|No sequence is open.";
        }
        w = seq.frameSizeHorizontal;
        h = seq.frameSizeVertical;
        if (!w || !h) {
            return "ERR|Could not read the sequence size.";
        }
        QBT_liveClean();
        dir = QBT_liveFolder();
        if (!dir.exists) {
            return "ERR|Could not make the temp folder.";
        }
        path = new File(dir.fsName + "/frame_" + (new Date().getTime()) + ".png").fsName;
        try {
            app.enableQE();
            qs = qe.project.getActiveSequence();
            tc = qs.CTI.timecode;
            qs.exportFramePNG(tc, path);
        }
        catch (e1) {
            err = String(e1);
        }
        f = QBT_liveWait(dir, 4000);
        if (!f) {
            try {
                t = seq.getPlayerPosition();
                seq.exportFramePNG(t, path);
                f = QBT_liveWait(dir, 4000);
            }
            catch (e2) {
                if (err === "") {
                    err = String(e2);
                }
            }
        }
        if (!f) {
            QBT_liveClean();
            return "ERR|Frame export failed" + (err !== "" ? " (" + err.replace(/\|/g, "/") + ")" : " (no picture was written).");
        }
        return "OK|" + f.fsName + "|" + w + "|" + h;
    }
    catch (e) {
        try {
            QBT_liveClean();
        }
        catch (e3) { }
        return "ERR|Frame export failed (" + String(e).replace(/\|/g, "/") + ").";
    }
}
