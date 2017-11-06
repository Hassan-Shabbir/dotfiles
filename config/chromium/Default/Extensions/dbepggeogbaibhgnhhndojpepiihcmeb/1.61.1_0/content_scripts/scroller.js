// Generated by CoffeeScript 1.12.7
(function() {
  var CoreScroller, Scroller, activatedElement, checkVisibility, doesScroll, findScrollableElement, firstScrollableElement, getDimension, getScrollingElement, getSign, isScrollableElement, performScroll, root, scrollProperties, shouldScroll;

  activatedElement = null;

  getScrollingElement = function() {
    var ref;
    return (ref = document.scrollingElement) != null ? ref : document.body;
  };

  getSign = function(val) {
    if (!val) {
      return 0;
    } else {
      if (val < 0) {
        return -1;
      } else {
        return 1;
      }
    }
  };

  scrollProperties = {
    x: {
      axisName: 'scrollLeft',
      max: 'scrollWidth',
      viewSize: 'clientWidth'
    },
    y: {
      axisName: 'scrollTop',
      max: 'scrollHeight',
      viewSize: 'clientHeight'
    }
  };

  getDimension = function(el, direction, amount) {
    var name;
    if (Utils.isString(amount)) {
      name = amount;
      if (name === 'viewSize' && el === getScrollingElement()) {
        if (direction === 'x') {
          return window.innerWidth;
        } else {
          return window.innerHeight;
        }
      } else {
        return el[scrollProperties[direction][name]];
      }
    } else {
      return amount;
    }
  };

  performScroll = function(element, direction, amount) {
    var axisName, before;
    axisName = scrollProperties[direction].axisName;
    before = element[axisName];
    element[axisName] += amount;
    return element[axisName] !== before;
  };

  shouldScroll = function(element, direction) {
    var computedStyle, ref;
    computedStyle = window.getComputedStyle(element);
    if (computedStyle.getPropertyValue("overflow-" + direction) === "hidden") {
      return false;
    }
    if ((ref = computedStyle.getPropertyValue("visibility")) === "hidden" || ref === "collapse") {
      return false;
    }
    if (computedStyle.getPropertyValue("display") === "none") {
      return false;
    }
    return true;
  };

  doesScroll = function(element, direction, amount, factor) {
    var delta;
    delta = factor * getDimension(element, direction, amount) || -1;
    delta = getSign(delta);
    return performScroll(element, direction, delta) && performScroll(element, direction, -delta);
  };

  isScrollableElement = function(element, direction, amount, factor) {
    if (direction == null) {
      direction = "y";
    }
    if (amount == null) {
      amount = 1;
    }
    if (factor == null) {
      factor = 1;
    }
    return doesScroll(element, direction, amount, factor) && shouldScroll(element, direction);
  };

  findScrollableElement = function(element, direction, amount, factor) {
    var ref;
    while (element !== getScrollingElement() && !isScrollableElement(element, direction, amount, factor)) {
      element = (ref = DomUtils.getContainingElement(element)) != null ? ref : getScrollingElement();
    }
    return element;
  };

  firstScrollableElement = function(element) {
    var child, children, ele, i, len, ref;
    if (element == null) {
      element = getScrollingElement();
    }
    if (doesScroll(element, "y", 1, 1) || doesScroll(element, "y", -1, 1)) {
      return element;
    } else {
      children = (function() {
        var i, len, ref, results;
        ref = element.children;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          child = ref[i];
          results.push({
            element: child,
            rect: DomUtils.getVisibleClientRect(child)
          });
        }
        return results;
      })();
      children = children.filter(function(child) {
        return child.rect;
      });
      children.map(function(child) {
        return child.area = child.rect.width * child.rect.height;
      });
      ref = children.sort(function(a, b) {
        return b.area - a.area;
      });
      for (i = 0, len = ref.length; i < len; i++) {
        child = ref[i];
        if (ele = firstScrollableElement(child.element)) {
          return ele;
        }
      }
      return null;
    }
  };

  checkVisibility = function(element) {
    var rect;
    rect = activatedElement.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) {
      return activatedElement = element;
    }
  };

  CoreScroller = {
    init: function() {
      this.time = 0;
      this.lastEvent = this.keyIsDown = null;
      return this.installCanceEventListener();
    },
    installCanceEventListener: function() {
      return handlerStack.push({
        _name: 'scroller/track-key-status',
        keydown: (function(_this) {
          return function(event) {
            return handlerStack.alwaysContinueBubbling(function() {
              _this.keyIsDown = true;
              if (!event.repeat) {
                _this.time += 1;
              }
              return _this.lastEvent = event;
            });
          };
        })(this),
        keyup: (function(_this) {
          return function(event) {
            return handlerStack.alwaysContinueBubbling(function() {
              _this.keyIsDown = false;
              return _this.time += 1;
            });
          };
        })(this),
        blur: (function(_this) {
          return function(event) {
            return handlerStack.alwaysContinueBubbling(function() {
              if (event.target === window) {
                return _this.time += 1;
              }
            });
          };
        })(this)
      });
    },
    wouldNotInitiateScroll: function() {
      var ref;
      return ((ref = this.lastEvent) != null ? ref.repeat : void 0) && Settings.get("smoothScroll");
    },
    minCalibration: 0.5,
    maxCalibration: 1.6,
    calibrationBoundary: 150,
    scroll: function(element, direction, amount, continuous) {
      var activationTime, animate, calibration, cancelEventListener, duration, myKeyIsStillDown, previousTimestamp, ref, sign, totalDelta, totalElapsed;
      if (continuous == null) {
        continuous = true;
      }
      if (!amount) {
        return;
      }
      if (!Settings.get("smoothScroll")) {
        performScroll(element, direction, amount);
        checkVisibility(element);
        return;
      }
      if ((ref = this.lastEvent) != null ? ref.repeat : void 0) {
        return;
      }
      activationTime = ++this.time;
      myKeyIsStillDown = (function(_this) {
        return function() {
          var ref1;
          return (ref1 = _this.time === activationTime && _this.keyIsDown) != null ? ref1 : true;
        };
      })(this);
      sign = getSign(amount);
      amount = Math.abs(amount);
      duration = Math.max(100, 20 * Math.log(amount));
      totalDelta = 0;
      totalElapsed = 0.0;
      calibration = 1.0;
      previousTimestamp = null;
      cancelEventListener = this.installCanceEventListener();
      animate = (function(_this) {
        return function(timestamp) {
          var delta, elapsed;
          if (previousTimestamp == null) {
            previousTimestamp = timestamp;
          }
          if (timestamp === previousTimestamp) {
            return requestAnimationFrame(animate);
          }
          elapsed = timestamp - previousTimestamp;
          totalElapsed += elapsed;
          previousTimestamp = timestamp;
          if (myKeyIsStillDown() && 75 <= totalElapsed && (_this.minCalibration <= calibration && calibration <= _this.maxCalibration)) {
            if (1.05 * calibration * amount < _this.calibrationBoundary) {
              calibration *= 1.05;
            }
            if (_this.calibrationBoundary < 0.95 * calibration * amount) {
              calibration *= 0.95;
            }
          }
          delta = Math.ceil(amount * (elapsed / duration) * calibration);
          delta = myKeyIsStillDown() ? delta : Math.max(0, Math.min(delta, amount - totalDelta));
          if (delta && performScroll(element, direction, sign * delta)) {
            totalDelta += delta;
            return requestAnimationFrame(animate);
          } else {
            handlerStack.remove(cancelEventListener);
            return checkVisibility(element);
          }
        };
      })(this);
      if (!continuous) {
        ++this.time;
      }
      return requestAnimationFrame(animate);
    }
  };

  Scroller = {
    init: function() {
      handlerStack.push({
        _name: 'scroller/active-element',
        DOMActivate: function(event) {
          return handlerStack.alwaysContinueBubbling(function() {
            var ref, ref1, ref2, ref3;
            return activatedElement = (ref = (ref1 = (ref2 = event.deepPath) != null ? ref2[0] : void 0) != null ? ref1 : (ref3 = event.path) != null ? ref3[0] : void 0) != null ? ref : event.target;
          });
        }
      });
      return CoreScroller.init();
    },
    scrollBy: function(direction, amount, factor, continuous) {
      var element, elementAmount;
      if (factor == null) {
        factor = 1;
      }
      if (continuous == null) {
        continuous = true;
      }
      if (!getScrollingElement() && amount instanceof Number) {
        if (direction === "x") {
          window.scrollBy(amount, 0);
        } else {
          window.scrollBy(0, amount);
        }
        return;
      }
      activatedElement || (activatedElement = (getScrollingElement() && firstScrollableElement()) || getScrollingElement());
      if (!activatedElement) {
        return;
      }
      if (!CoreScroller.wouldNotInitiateScroll()) {
        element = findScrollableElement(activatedElement, direction, amount, factor);
        elementAmount = factor * getDimension(element, direction, amount);
        return CoreScroller.scroll(element, direction, elementAmount, continuous);
      }
    },
    scrollTo: function(direction, pos) {
      var amount, element;
      activatedElement || (activatedElement = (getScrollingElement() && firstScrollableElement()) || getScrollingElement());
      if (!activatedElement) {
        return;
      }
      element = findScrollableElement(activatedElement, direction, pos, 1);
      amount = getDimension(element, direction, pos) - element[scrollProperties[direction].axisName];
      return CoreScroller.scroll(element, direction, amount);
    },
    isScrollableElement: function(element) {
      activatedElement || (activatedElement = (getScrollingElement() && firstScrollableElement()) || getScrollingElement());
      return element !== activatedElement && isScrollableElement(element);
    },
    scrollIntoView: function(element) {
      var amount, rect, ref;
      activatedElement || (activatedElement = getScrollingElement() && firstScrollableElement());
      rect = (ref = element.getClientRects()) != null ? ref[0] : void 0;
      if (rect != null) {
        if (rect.bottom < 0) {
          amount = rect.bottom - Math.min(rect.height, window.innerHeight);
          element = findScrollableElement(element, "y", amount, 1);
          CoreScroller.scroll(element, "y", amount, false);
        } else if (window.innerHeight < rect.top) {
          amount = rect.top + Math.min(rect.height - window.innerHeight, 0);
          element = findScrollableElement(element, "y", amount, 1);
          CoreScroller.scroll(element, "y", amount, false);
        }
        if (rect.right < 0) {
          amount = rect.right - Math.min(rect.width, window.innerWidth);
          element = findScrollableElement(element, "x", amount, 1);
          return CoreScroller.scroll(element, "x", amount, false);
        } else if (window.innerWidth < rect.left) {
          amount = rect.left + Math.min(rect.width - window.innerWidth, 0);
          element = findScrollableElement(element, "x", amount, 1);
          return CoreScroller.scroll(element, "x", amount, false);
        }
      }
    }
  };

  root = typeof exports !== "undefined" && exports !== null ? exports : (window.root != null ? window.root : window.root = {});

  root.Scroller = Scroller;

  if (typeof exports === "undefined" || exports === null) {
    extend(window, root);
  }

}).call(this);
