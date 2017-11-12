/**
 * Created by sokolandia on 7/13/17.
 */
importScripts("../components/jsdom.js", "../components/Readability.js", "../components/ziprip.0.0.3.min.js", "canonical.js", "content.js");
onmessage = function (event) {
    var _this = this;
    var linkHTML = event.data;
    var _a = linkHTML.data, child = _a.child, parent = _a.parent, type = _a.type, image = _a.image, favicon = _a.favicon;
    var dom = new jsdom.JSDOM(linkHTML.html, {
        url: child,
        contentType: "text/html"
    });
    Object.getOwnPropertyNames(dom.window)
        .filter(function (prop) { return prop != "self" && prop != "postMessage"; })
        .forEach(function (prop) { return _this[prop] = dom.window[prop]; });
    var pageMeta = new PageMetaFacory(dom.window.document);
    var linkData = pageMeta.extract(child, parent, type, image, favicon);
    postMessage(linkData);
};
