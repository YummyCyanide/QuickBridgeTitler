function CSInterface() { }
CSInterface.prototype.evalScript = function (script, callback) {
    if (callback === null || callback === undefined) {
        callback = function () { };
    }
    window.__adobe_cep__.evalScript(script, callback);
};
CSInterface.prototype.getSystemPath = function (type) {
    var path = decodeURI(window.__adobe_cep__.getSystemPath(type));
    if (navigator.userAgent.indexOf("Windows") >= 0) {
        path = path.replace("file:///", "");
    }
    else {
        path = path.replace("file://", "");
    }
    return path;
};
CSInterface.prototype.closeExtension = function () {
    window.__adobe_cep__.closeExtension();
};
