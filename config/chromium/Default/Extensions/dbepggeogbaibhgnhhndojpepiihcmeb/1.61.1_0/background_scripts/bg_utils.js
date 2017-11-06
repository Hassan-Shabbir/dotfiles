// Generated by CoffeeScript 1.12.7
(function() {
  var BgUtils, SearchEngines, TabRecency, root,
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  TabRecency = (function() {
    TabRecency.prototype.timestamp = 1;

    TabRecency.prototype.current = -1;

    TabRecency.prototype.cache = {};

    TabRecency.prototype.lastVisited = null;

    TabRecency.prototype.lastVisitedTime = null;

    TabRecency.prototype.timeDelta = 500;

    function TabRecency() {
      chrome.tabs.onActivated.addListener((function(_this) {
        return function(activeInfo) {
          return _this.register(activeInfo.tabId);
        };
      })(this));
      chrome.tabs.onRemoved.addListener((function(_this) {
        return function(tabId) {
          return _this.deregister(tabId);
        };
      })(this));
      chrome.tabs.onReplaced.addListener((function(_this) {
        return function(addedTabId, removedTabId) {
          _this.deregister(removedTabId);
          return _this.register(addedTabId);
        };
      })(this));
      chrome.windows.onFocusChanged.addListener((function(_this) {
        return function(wnd) {
          if (wnd !== chrome.windows.WINDOW_ID_NONE) {
            return chrome.tabs.query({
              windowId: wnd,
              active: true
            }, function(tabs) {
              if (tabs[0]) {
                return _this.register(tabs[0].id);
              }
            });
          }
        };
      })(this));
    }

    TabRecency.prototype.register = function(tabId) {
      var currentTime;
      currentTime = new Date();
      if ((this.lastVisitedTime != null) && this.timeDelta <= currentTime - this.lastVisitedTime) {
        this.cache[this.lastVisited] = ++this.timestamp;
      }
      this.current = this.lastVisited = tabId;
      return this.lastVisitedTime = currentTime;
    };

    TabRecency.prototype.deregister = function(tabId) {
      if (tabId === this.lastVisited) {
        this.lastVisited = this.lastVisitedTime = null;
      }
      return delete this.cache[tabId];
    };

    TabRecency.prototype.recencyScore = function(tabId) {
      var base;
      (base = this.cache)[tabId] || (base[tabId] = 1);
      if (tabId === this.current) {
        return 0.0;
      } else {
        return this.cache[tabId] / this.timestamp;
      }
    };

    TabRecency.prototype.getTabsByRecency = function() {
      var tId, tabIds;
      tabIds = (function() {
        var ref, results;
        ref = this.cache;
        results = [];
        for (tId in ref) {
          if (!hasProp.call(ref, tId)) continue;
          results.push(tId);
        }
        return results;
      }).call(this);
      tabIds.sort((function(_this) {
        return function(a, b) {
          return _this.cache[b] - _this.cache[a];
        };
      })(this));
      return tabIds.map(function(tId) {
        return parseInt(tId);
      });
    };

    return TabRecency;

  })();

  BgUtils = {
    tabRecency: new TabRecency(),
    log: (function() {
      var loggingPageUrl;
      loggingPageUrl = chrome.runtime.getURL("pages/logging.html");
      if (loggingPageUrl != null) {
        console.log("Vimium logging URL:\n  " + loggingPageUrl);
      }
      if (localStorage.autoLaunchLoggingPage) {
        chrome.windows.create({
          url: loggingPageUrl,
          focused: false
        });
      }
      return function(message, sender) {
        var date, dateString, hours, i, len, logElement, milliseconds, minutes, ref, ref1, results, seconds, viewWindow;
        if (sender == null) {
          sender = null;
        }
        ref = chrome.extension.getViews({
          type: "tab"
        });
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          viewWindow = ref[i];
          if (viewWindow.location.pathname === "/pages/logging.html") {
            if ((sender != null ? sender.url : void 0) !== loggingPageUrl) {
              date = new Date;
              ref1 = [date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()], hours = ref1[0], minutes = ref1[1], seconds = ref1[2], milliseconds = ref1[3];
              if (minutes < 10) {
                minutes = "0" + minutes;
              }
              if (seconds < 10) {
                seconds = "0" + seconds;
              }
              if (milliseconds < 10) {
                milliseconds = "00" + milliseconds;
              }
              if (milliseconds < 100) {
                milliseconds = "0" + milliseconds;
              }
              dateString = hours + ":" + minutes + ":" + seconds + "." + milliseconds;
              logElement = viewWindow.document.getElementById("log-text");
              logElement.value += dateString + ": " + message + "\n";
              results.push(logElement.scrollTop = 2000000000);
            } else {
              results.push(void 0);
            }
          } else {
            results.push(void 0);
          }
        }
        return results;
      };
    })(),
    parseLines: function(text) {
      var i, len, line, ref, ref1, results;
      ref = text.replace(/\\\n/g, "").split("\n").map(function(line) {
        return line.trim();
      });
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        line = ref[i];
        if (line.length === 0) {
          continue;
        }
        if (ref1 = line[0], indexOf.call('#"', ref1) >= 0) {
          continue;
        }
        results.push(line);
      }
      return results;
    }
  };

  SearchEngines = {
    previousSearchEngines: null,
    searchEngines: null,
    refresh: function(searchEngines) {
      if (!((this.previousSearchEngines != null) && searchEngines === this.previousSearchEngines)) {
        this.previousSearchEngines = searchEngines;
        return this.searchEngines = new AsyncDataFetcher(function(callback) {
          var description, engines, i, keyword, len, line, ref, searchUrl, tokens;
          engines = {};
          ref = BgUtils.parseLines(searchEngines);
          for (i = 0, len = ref.length; i < len; i++) {
            line = ref[i];
            tokens = line.split(/\s+/);
            if (2 <= tokens.length) {
              keyword = tokens[0].split(":")[0];
              searchUrl = tokens[1];
              description = tokens.slice(2).join(" ") || ("search (" + keyword + ")");
              if (Utils.hasFullUrlPrefix(searchUrl)) {
                engines[keyword] = {
                  keyword: keyword,
                  searchUrl: searchUrl,
                  description: description
                };
              }
            }
          }
          return callback(engines);
        });
      }
    },
    use: function(callback) {
      return this.searchEngines.use(callback);
    },
    refreshAndUse: function(searchEngines, callback) {
      this.refresh(searchEngines);
      return this.use(callback);
    }
  };

  root.SearchEngines = SearchEngines;

  root.BgUtils = BgUtils;

}).call(this);
