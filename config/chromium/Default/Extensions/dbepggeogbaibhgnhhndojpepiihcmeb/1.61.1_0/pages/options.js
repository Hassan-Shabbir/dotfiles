// Generated by CoffeeScript 1.12.7
(function() {
  var $, CheckBoxOption, ExclusionRulesOnPopupOption, ExclusionRulesOption, NonEmptyTextOption, NumberOption, Option, Options, TextOption, bgExclusions, bgSettings, initOptionsPage, initPopupPage, root,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  $ = function(id) {
    return document.getElementById(id);
  };

  bgExclusions = chrome.extension.getBackgroundPage().Exclusions;

  bgSettings = chrome.extension.getBackgroundPage().Settings;

  Option = (function() {
    Option.all = [];

    function Option(field1, onUpdated1) {
      this.field = field1;
      this.onUpdated = onUpdated1;
      this.element = $(this.field);
      this.element.addEventListener("change", this.onUpdated);
      this.fetch();
      Option.all.push(this);
    }

    Option.prototype.fetch = function() {
      this.populateElement(this.previous = bgSettings.get(this.field));
      return this.previous;
    };

    Option.prototype.save = function() {
      var value;
      value = this.readValueFromElement();
      if (JSON.stringify(value) !== JSON.stringify(this.previous)) {
        return bgSettings.set(this.field, this.previous = value);
      }
    };

    Option.prototype.restoreToDefault = function() {
      bgSettings.clear(this.field);
      return this.fetch();
    };

    Option.saveOptions = function() {
      return Option.all.map(function(option) {
        return option.save();
      });
    };

    return Option;

  })();

  NumberOption = (function(superClass) {
    extend1(NumberOption, superClass);

    function NumberOption() {
      return NumberOption.__super__.constructor.apply(this, arguments);
    }

    NumberOption.prototype.populateElement = function(value) {
      return this.element.value = value;
    };

    NumberOption.prototype.readValueFromElement = function() {
      return parseFloat(this.element.value);
    };

    return NumberOption;

  })(Option);

  TextOption = (function(superClass) {
    extend1(TextOption, superClass);

    function TextOption() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      TextOption.__super__.constructor.apply(this, args);
      this.element.addEventListener("input", this.onUpdated);
    }

    TextOption.prototype.populateElement = function(value) {
      return this.element.value = value;
    };

    TextOption.prototype.readValueFromElement = function() {
      return this.element.value.trim();
    };

    return TextOption;

  })(Option);

  NonEmptyTextOption = (function(superClass) {
    extend1(NonEmptyTextOption, superClass);

    function NonEmptyTextOption() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      NonEmptyTextOption.__super__.constructor.apply(this, args);
      this.element.addEventListener("input", this.onUpdated);
    }

    NonEmptyTextOption.prototype.populateElement = function(value) {
      return this.element.value = value;
    };

    NonEmptyTextOption.prototype.readValueFromElement = function() {
      var value;
      if (value = this.element.value.trim()) {
        return value;
      } else {
        return this.restoreToDefault();
      }
    };

    return NonEmptyTextOption;

  })(Option);

  CheckBoxOption = (function(superClass) {
    extend1(CheckBoxOption, superClass);

    function CheckBoxOption() {
      return CheckBoxOption.__super__.constructor.apply(this, arguments);
    }

    CheckBoxOption.prototype.populateElement = function(value) {
      return this.element.checked = value;
    };

    CheckBoxOption.prototype.readValueFromElement = function() {
      return this.element.checked;
    };

    return CheckBoxOption;

  })(Option);

  ExclusionRulesOption = (function(superClass) {
    extend1(ExclusionRulesOption, superClass);

    function ExclusionRulesOption() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      ExclusionRulesOption.__super__.constructor.apply(this, args);
      $("exclusionAddButton").addEventListener("click", (function(_this) {
        return function(event) {
          return _this.addRule();
        };
      })(this));
    }

    ExclusionRulesOption.prototype.addRule = function(pattern) {
      var element, exclusionScrollBox;
      if (pattern == null) {
        pattern = "";
      }
      element = this.appendRule({
        pattern: pattern,
        passKeys: ""
      });
      this.getPattern(element).focus();
      exclusionScrollBox = $("exclusionScrollBox");
      exclusionScrollBox.scrollTop = exclusionScrollBox.scrollHeight;
      this.onUpdated();
      return element;
    };

    ExclusionRulesOption.prototype.populateElement = function(rules) {
      var i, len, results, rule;
      results = [];
      for (i = 0, len = rules.length; i < len; i++) {
        rule = rules[i];
        results.push(this.appendRule(rule));
      }
      return results;
    };

    ExclusionRulesOption.prototype.appendRule = function(rule) {
      var content, element, event, field, i, j, len, len1, ref, ref1, row;
      content = document.querySelector('#exclusionRuleTemplate').content;
      row = document.importNode(content, true);
      ref = ["pattern", "passKeys"];
      for (i = 0, len = ref.length; i < len; i++) {
        field = ref[i];
        element = row.querySelector("." + field);
        element.value = rule[field];
        ref1 = ["input", "change"];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          event = ref1[j];
          element.addEventListener(event, this.onUpdated);
        }
      }
      this.getRemoveButton(row).addEventListener("click", (function(_this) {
        return function(event) {
          rule = event.target.parentNode.parentNode;
          rule.parentNode.removeChild(rule);
          return _this.onUpdated();
        };
      })(this));
      this.element.appendChild(row);
      return this.element.children[this.element.children.length - 1];
    };

    ExclusionRulesOption.prototype.readValueFromElement = function() {
      var element, rules;
      rules = (function() {
        var i, len, ref, results;
        ref = this.element.getElementsByClassName("exclusionRuleTemplateInstance");
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          element = ref[i];
          results.push({
            pattern: this.getPattern(element).value.trim(),
            passKeys: this.getPassKeys(element).value.trim()
          });
        }
        return results;
      }).call(this);
      return rules.filter(function(rule) {
        return rule.pattern;
      });
    };

    ExclusionRulesOption.prototype.getPattern = function(element) {
      return element.querySelector(".pattern");
    };

    ExclusionRulesOption.prototype.getPassKeys = function(element) {
      return element.querySelector(".passKeys");
    };

    ExclusionRulesOption.prototype.getRemoveButton = function(element) {
      return element.querySelector(".exclusionRemoveButton");
    };

    return ExclusionRulesOption;

  })(Option);

  ExclusionRulesOnPopupOption = (function(superClass) {
    extend1(ExclusionRulesOnPopupOption, superClass);

    function ExclusionRulesOnPopupOption() {
      var args, url1;
      url1 = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      this.url = url1;
      ExclusionRulesOnPopupOption.__super__.constructor.apply(this, args);
    }

    ExclusionRulesOnPopupOption.prototype.addRule = function() {
      var element;
      element = ExclusionRulesOnPopupOption.__super__.addRule.call(this, this.generateDefaultPattern());
      this.activatePatternWatcher(element);
      this.getPassKeys(element).focus();
      return element;
    };

    ExclusionRulesOnPopupOption.prototype.populateElement = function(rules) {
      var element, elements, haveMatch, i, j, len, len1, pattern;
      ExclusionRulesOnPopupOption.__super__.populateElement.call(this, rules);
      elements = this.element.getElementsByClassName("exclusionRuleTemplateInstance");
      for (i = 0, len = elements.length; i < len; i++) {
        element = elements[i];
        this.activatePatternWatcher(element);
      }
      haveMatch = false;
      for (j = 0, len1 = elements.length; j < len1; j++) {
        element = elements[j];
        pattern = this.getPattern(element).value.trim();
        if (0 <= this.url.search(bgExclusions.RegexpCache.get(pattern))) {
          haveMatch = true;
          this.getPassKeys(element).focus();
        } else {
          element.style.display = 'none';
        }
      }
      if (!haveMatch) {
        return this.addRule();
      }
    };

    ExclusionRulesOnPopupOption.prototype.activatePatternWatcher = function(element) {
      var patternElement;
      patternElement = element.children[0].firstChild;
      return patternElement.addEventListener("keyup", (function(_this) {
        return function() {
          if (_this.url.match(bgExclusions.RegexpCache.get(patternElement.value))) {
            return patternElement.title = patternElement.style.color = "";
          } else {
            patternElement.style.color = "red";
            return patternElement.title = "Red text means that the pattern does not\nmatch the current URL.";
          }
        };
      })(this));
    };

    ExclusionRulesOnPopupOption.prototype.generateDefaultPattern = function() {
      if (/^https?:\/\/./.test(this.url)) {
        return "https?:/" + this.url.split("/", 3).slice(1).join("/") + "/*";
      } else if (/^[a-z]{3,}:\/\/./.test(this.url)) {
        return this.url.split("/", 3).join("/") + "/*";
      } else {
        return this.url + "*";
      }
    };

    return ExclusionRulesOnPopupOption;

  })(ExclusionRulesOption);

  Options = {
    exclusionRules: ExclusionRulesOption,
    filterLinkHints: CheckBoxOption,
    waitForEnterForFilteredHints: CheckBoxOption,
    hideHud: CheckBoxOption,
    keyMappings: TextOption,
    linkHintCharacters: NonEmptyTextOption,
    linkHintNumbers: NonEmptyTextOption,
    newTabUrl: NonEmptyTextOption,
    nextPatterns: NonEmptyTextOption,
    previousPatterns: NonEmptyTextOption,
    regexFindMode: CheckBoxOption,
    ignoreKeyboardLayout: CheckBoxOption,
    scrollStepSize: NumberOption,
    smoothScroll: CheckBoxOption,
    grabBackFocus: CheckBoxOption,
    searchEngines: TextOption,
    searchUrl: NonEmptyTextOption,
    userDefinedLinkHintCss: TextOption
  };

  initOptionsPage = function() {
    var activateHelpDialog, element, i, len, maintainAdvancedOptions, maintainLinkHintsView, name, onUpdated, ref, saveOptions, toggleAdvancedOptions, type;
    onUpdated = function() {
      $("saveOptions").removeAttribute("disabled");
      return $("saveOptions").textContent = "Save Changes";
    };
    maintainLinkHintsView = function() {
      var hide, show;
      hide = function(el) {
        return el.style.display = "none";
      };
      show = function(el) {
        return el.style.display = "table-row";
      };
      if ($("filterLinkHints").checked) {
        hide($("linkHintCharactersContainer"));
        show($("linkHintNumbersContainer"));
        return show($("waitForEnterForFilteredHintsContainer"));
      } else {
        show($("linkHintCharactersContainer"));
        hide($("linkHintNumbersContainer"));
        return hide($("waitForEnterForFilteredHintsContainer"));
      }
    };
    maintainAdvancedOptions = function() {
      if (bgSettings.get("optionsPage_showAdvancedOptions")) {
        $("advancedOptions").style.display = "table-row-group";
        return $("advancedOptionsButton").textContent = "Hide Advanced Options";
      } else {
        $("advancedOptions").style.display = "none";
        return $("advancedOptionsButton").textContent = "Show Advanced Options";
      }
    };
    maintainAdvancedOptions();
    toggleAdvancedOptions = function(event) {
      bgSettings.set("optionsPage_showAdvancedOptions", !bgSettings.get("optionsPage_showAdvancedOptions"));
      maintainAdvancedOptions();
      $("advancedOptionsButton").blur();
      return event.preventDefault();
    };
    activateHelpDialog = function() {
      return HelpDialog.toggle({
        showAllCommandDetails: true
      });
    };
    saveOptions = function() {
      $("linkHintCharacters").value = $("linkHintCharacters").value.toLowerCase();
      Option.saveOptions();
      $("saveOptions").disabled = true;
      return $("saveOptions").textContent = "Saved";
    };
    $("saveOptions").addEventListener("click", saveOptions);
    $("advancedOptionsButton").addEventListener("click", toggleAdvancedOptions);
    $("showCommands").addEventListener("click", activateHelpDialog);
    $("filterLinkHints").addEventListener("click", maintainLinkHintsView);
    ref = document.getElementsByClassName("nonEmptyTextOption");
    for (i = 0, len = ref.length; i < len; i++) {
      element = ref[i];
      element.className = element.className + " example info";
      element.textContent = "Leave empty to reset this option.";
    }
    window.onbeforeunload = function() {
      if (!$("saveOptions").disabled) {
        return "You have unsaved changes to options.";
      }
    };
    document.addEventListener("keyup", function(event) {
      var ref1;
      if (event.ctrlKey && event.keyCode === 13) {
        if (typeof document !== "undefined" && document !== null ? (ref1 = document.activeElement) != null ? ref1.blur : void 0 : void 0) {
          document.activeElement.blur();
        }
        return saveOptions();
      }
    });
    for (name in Options) {
      if (!hasProp.call(Options, name)) continue;
      type = Options[name];
      new type(name, onUpdated);
    }
    return maintainLinkHintsView();
  };

  initPopupPage = function() {
    return chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(arg) {
      var exclusions, onUpdated, saveOptions, tab, updateState, url;
      tab = arg[0];
      exclusions = null;
      document.getElementById("optionsLink").setAttribute("href", chrome.runtime.getURL("pages/options.html"));
      url = chrome.extension.getBackgroundPage().urlForTab[tab.id] || tab.url;
      updateState = function() {
        var rule;
        rule = bgExclusions.getRule(url, exclusions.readValueFromElement());
        return $("state").innerHTML = "Vimium will " + (rule && rule.passKeys ? "exclude <span class='code'>" + rule.passKeys + "</span>" : rule ? "be disabled" : "be enabled");
      };
      onUpdated = function() {
        $("helpText").innerHTML = "Type <strong>Ctrl-Enter</strong> to save and close.";
        $("saveOptions").removeAttribute("disabled");
        $("saveOptions").textContent = "Save Changes";
        if (exclusions) {
          return updateState();
        }
      };
      saveOptions = function() {
        Option.saveOptions();
        $("saveOptions").textContent = "Saved";
        return $("saveOptions").disabled = true;
      };
      $("saveOptions").addEventListener("click", saveOptions);
      document.addEventListener("keyup", function(event) {
        if (event.ctrlKey && event.keyCode === 13) {
          saveOptions();
          return window.close();
        }
      });
      exclusions = new ExclusionRulesOnPopupOption(url, "exclusionRules", onUpdated);
      updateState();
      return document.addEventListener("keyup", updateState);
    });
  };

  document.addEventListener("DOMContentLoaded", function() {
    var xhr;
    DomUtils.injectUserCss();
    xhr = new XMLHttpRequest();
    xhr.open('GET', chrome.extension.getURL('pages/exclusions.html'), true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        $("exclusionScrollBox").innerHTML = xhr.responseText;
        switch (location.pathname) {
          case "/pages/options.html":
            return initOptionsPage();
          case "/pages/popup.html":
            return initPopupPage();
        }
      }
    };
    return xhr.send();
  });

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  extend(root, {
    Options: Options,
    isVimiumOptionsPage: true
  });

}).call(this);
