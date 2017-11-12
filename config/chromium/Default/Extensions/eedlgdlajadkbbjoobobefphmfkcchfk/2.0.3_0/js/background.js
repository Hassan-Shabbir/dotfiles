(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const { FIRST_RUN_PAGE, UNINSTALL_PAGE, ICON_SEARCH_URL, compileSearchURL } = require('./constants');

// Open "first run" (Ecosia introduction) page to close up the install flow.
function onFirstRun() {
    window.chrome.tabs.create({ url: FIRST_RUN_PAGE });
}

function onInstalled(details) {
    if (details.reason === 'install') {
        onFirstRun();
    }

    // Show goodbye page on extension uninstall.
    if (window.chrome.runtime.setUninstallURL) {
        window.chrome.runtime.setUninstallURL(UNINSTALL_PAGE);
    }
}

function onIconClicked() {
    window.chrome.tabs.create({ url: ICON_SEARCH_URL });
}

function onMessageReceived(request, sender, sendResponse) {
    if (request && request.reason && request.reason === 'version') {
        sendResponse({ version: window.chrome.runtime.getManifest().version });
    } else {
        const errorMessage = `invalid request: ${JSON.stringify(request)}`;
        sendResponse({ error: new Error(errorMessage) });
    }
    return true;
}

function onContextMenuClicked(info) {
    window.chrome.tabs.create({ url: compileSearchURL(info.selectionText) });
}

window.chrome.runtime.onInstalled.addListener(onInstalled);
window.chrome.browserAction.onClicked.addListener(onIconClicked);
window.chrome.runtime.onMessageExternal.addListener(onMessageReceived);

window.chrome.contextMenus.create({
    title: window.chrome.i18n.getMessage('context_menu_search'),
    contexts: ['selection'],
    onclick: onContextMenuClicked
});

module.exports = {
    onMessageReceived
};

},{"./constants":2}],2:[function(require,module,exports){
const HOST = 'https://www.ecosia.org';
const INDICATOR_PARAM = `addon=chrome&addonversion=${window.chrome.runtime.getManifest().version}`;

function compileSearchURL(query) {
    return `${HOST}/search?${INDICATOR_PARAM}&q=${query}`;
}

module.exports = {
    FIRST_RUN_PAGE: `${HOST}/firstrun?${INDICATOR_PARAM}`,
    UNINSTALL_PAGE: `${HOST}/uninstall?feedback=true&${INDICATOR_PARAM}`,
    ICON_SEARCH_URL: `${HOST}/?ref=icon-search`,
    compileSearchURL
};

},{}]},{},[1]);
