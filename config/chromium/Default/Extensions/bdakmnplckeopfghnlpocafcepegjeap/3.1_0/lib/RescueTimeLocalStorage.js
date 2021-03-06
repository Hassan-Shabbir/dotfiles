// require RescueTimeUtil

var RescueTimeLocalStorage = {
    util: null,
    dataSets: 0,
    dataGets: 0,
    configSets: 0,
    configGets: 0,
    cfix: "rescuetime.config.",
    dfix: "rescuetime.data.",
    proxyStorage: null,
    lastGetDataKey: null,
    virtualStorageUrl: "http://extension.rescuetime",

    initialize: function(util) {
        this.util = util;
        this.proxyStorage = localStorage;
        return this;
    },
    setStorage: function(storage) {
        this.proxyStorage = storage;
        return storage;
    },
    // these are for items that match other of our clients (rescuetimed.cfg)
    // and are synced with server
    setConfig: function(key, value) {
        this.configSets++;
        this.proxyStorage.setItem(this.cfix + key, value); // here is where we can make it browser specific
    },
    getConfig: function(key) {
        this.configGets++;
        return this.proxyStorage.getItem(this.cfix + key);
    },
    deleteConfig: function(key) {
        return this.proxyStorage.removeItem(this.cfix + key)
    },
    removeConfig: function(key) {
        return this.deleteConfig(key);
    },
    // this for namespace scoped data
    setData: function(key, value) {
        this.dataSets++;
        this.proxyStorage.setItem(this.dfix + key, value); // here is where we can make it browser specific
    },
    getData: function(key) {
        this.lastGetDataKey = key;
        this.dataGets++;
        return this.proxyStorage.getItem(this.dfix + key);
    },
    deleteData: function(key) {
        return this.proxyStorage.removeItem(this.dfix + key)
    },
    removeData: function(key) {
        return this.deleteData(key);
    }
};
var EXPORTED_SYMBOLS = ["RescueTimeLocalStorage"];
