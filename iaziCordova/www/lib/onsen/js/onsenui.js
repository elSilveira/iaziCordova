/*! onsenui - v2.0.0-dev-build.1386 - 2015-10-05 */
/*! ons-core.js for Onsen UI v2.0.0-dev-build.1386 - 2015-10-05 */
// Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.  Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information.
// JavaScript Dynamic Content shim for Windows Store apps
(function () {

    if (window.MSApp && MSApp.execUnsafeLocalFunction) {

        // Some nodes will have an "attributes" property which shadows the Node.prototype.attributes property
        //  and means we don't actually see the attributes of the Node (interestingly the VS debug console
        //  appears to suffer from the same issue).
        //
        var Element_setAttribute = Object.getOwnPropertyDescriptor(Element.prototype, "setAttribute").value;
        var Element_removeAttribute = Object.getOwnPropertyDescriptor(Element.prototype, "removeAttribute").value;
        var HTMLElement_insertAdjacentHTMLPropertyDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "insertAdjacentHTML");
        var Node_get_attributes = Object.getOwnPropertyDescriptor(Node.prototype, "attributes").get;
        var Node_get_childNodes = Object.getOwnPropertyDescriptor(Node.prototype, "childNodes").get;
        var detectionDiv = document.createElement("div");

        function getAttributes(element) {
            return Node_get_attributes.call(element);
        }

        function setAttribute(element, attribute, value) {
            try {
                Element_setAttribute.call(element, attribute, value);
            } catch (e) {
                // ignore
            }
        }

        function removeAttribute(element, attribute) {
            Element_removeAttribute.call(element, attribute);
        }

        function childNodes(element) {
            return Node_get_childNodes.call(element);
        }

        function empty(element) {
            while (element.childNodes.length) {
                element.removeChild(element.lastChild);
            }
        }

        function insertAdjacentHTML(element, position, html) {
            HTMLElement_insertAdjacentHTMLPropertyDescriptor.value.call(element, position, html);
        }

        function inUnsafeMode() {
            var isUnsafe = true;
            try {
                detectionDiv.innerHTML = "<test/>";
            }
            catch (ex) {
                isUnsafe = false;
            }

            return isUnsafe;
        }

        function cleanse(html, targetElement) {
            var cleaner = document.implementation.createHTMLDocument("cleaner");
            empty(cleaner.documentElement);
            MSApp.execUnsafeLocalFunction(function () {
                insertAdjacentHTML(cleaner.documentElement, "afterbegin", html);
            });

            var scripts = cleaner.documentElement.querySelectorAll("script");
            Array.prototype.forEach.call(scripts, function (script) {
                switch (script.type.toLowerCase()) {
                    case "":
                        script.type = "text/inert";
                        break;
                    case "text/javascript":
                    case "text/ecmascript":
                    case "text/x-javascript":
                    case "text/jscript":
                    case "text/livescript":
                    case "text/javascript1.1":
                    case "text/javascript1.2":
                    case "text/javascript1.3":
                        script.type = "text/inert-" + script.type.slice("text/".length);
                        break;
                    case "application/javascript":
                    case "application/ecmascript":
                    case "application/x-javascript":
                        script.type = "application/inert-" + script.type.slice("application/".length);
                        break;

                    default:
                        break;
                }
            });

            function cleanseAttributes(element) {
                var attributes = getAttributes(element);
                if (attributes && attributes.length) {
                    // because the attributes collection is live it is simpler to queue up the renames
                    var events;
                    for (var i = 0, len = attributes.length; i < len; i++) {
                        var attribute = attributes[i];
                        var name = attribute.name;
                        if ((name[0] === "o" || name[0] === "O") &&
                            (name[1] === "n" || name[1] === "N")) {
                            events = events || [];
                            events.push({ name: attribute.name, value: attribute.value });
                        }
                    }
                    if (events) {
                        for (var i = 0, len = events.length; i < len; i++) {
                            var attribute = events[i];
                            removeAttribute(element, attribute.name);
                            setAttribute(element, "x-" + attribute.name, attribute.value);
                        }
                    }
                }
                var children = childNodes(element);
                for (var i = 0, len = children.length; i < len; i++) {
                    cleanseAttributes(children[i]);
                }
            }
            cleanseAttributes(cleaner.documentElement);

            var cleanedNodes = [];

            if (targetElement.tagName === 'HTML') {
                cleanedNodes = Array.prototype.slice.call(document.adoptNode(cleaner.documentElement).childNodes);
            } else {
                if (cleaner.head) {
                    cleanedNodes = cleanedNodes.concat(Array.prototype.slice.call(document.adoptNode(cleaner.head).childNodes));
                }
                if (cleaner.body) {
                    cleanedNodes = cleanedNodes.concat(Array.prototype.slice.call(document.adoptNode(cleaner.body).childNodes));
                }
            }

            return cleanedNodes;
        }

        function cleansePropertySetter(property, setter) {
            var propertyDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, property);
            var originalSetter = propertyDescriptor.set;
            Object.defineProperty(HTMLElement.prototype, property, {
                get: propertyDescriptor.get,
                set: function (value) {
                    if(window.WinJS && window.WinJS._execUnsafe && inUnsafeMode()) {
                        originalSetter.call(this, value);
                    } else {
                        var that = this;
                        var nodes = cleanse(value, that);
                        MSApp.execUnsafeLocalFunction(function () {
                            setter(propertyDescriptor, that, nodes);
                        });
                    }
                },
                enumerable: propertyDescriptor.enumerable,
                configurable: propertyDescriptor.configurable,
            });
        }
        cleansePropertySetter("innerHTML", function (propertyDescriptor, target, elements) {
            empty(target);
            for (var i = 0, len = elements.length; i < len; i++) {
                target.appendChild(elements[i]);
            }
        });
        cleansePropertySetter("outerHTML", function (propertyDescriptor, target, elements) {
            for (var i = 0, len = elements.length; i < len; i++) {
                target.insertAdjacentElement("afterend", elements[i]);
            }
            target.parentNode.removeChild(target);
        });

    }

}());
/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
// @version 0.7.3
if (typeof WeakMap === "undefined") {
  (function() {
    var defineProperty = Object.defineProperty;
    var counter = Date.now() % 1e9;
    var WeakMap = function() {
      this.name = "__st" + (Math.random() * 1e9 >>> 0) + (counter++ + "__");
    };
    WeakMap.prototype = {
      set: function(key, value) {
        var entry = key[this.name];
        if (entry && entry[0] === key) entry[1] = value; else defineProperty(key, this.name, {
          value: [ key, value ],
          writable: true
        });
        return this;
      },
      get: function(key) {
        var entry;
        return (entry = key[this.name]) && entry[0] === key ? entry[1] : undefined;
      },
      "delete": function(key) {
        var entry = key[this.name];
        if (!entry || entry[0] !== key) return false;
        entry[0] = entry[1] = undefined;
        return true;
      },
      has: function(key) {
        var entry = key[this.name];
        if (!entry) return false;
        return entry[0] === key;
      }
    };
    window.WeakMap = WeakMap;
  })();
}

(function(global) {
  var registrationsTable = new WeakMap();
  var setImmediate;
  if (/Trident|Edge/.test(navigator.userAgent)) {
    setImmediate = setTimeout;
  } else if (window.setImmediate) {
    setImmediate = window.setImmediate;
  } else {
    var setImmediateQueue = [];
    var sentinel = String(Math.random());
    window.addEventListener("message", function(e) {
      if (e.data === sentinel) {
        var queue = setImmediateQueue;
        setImmediateQueue = [];
        queue.forEach(function(func) {
          func();
        });
      }
    });
    setImmediate = function(func) {
      setImmediateQueue.push(func);
      window.postMessage(sentinel, "*");
    };
  }
  var isScheduled = false;
  var scheduledObservers = [];
  function scheduleCallback(observer) {
    scheduledObservers.push(observer);
    if (!isScheduled) {
      isScheduled = true;
      setImmediate(dispatchCallbacks);
    }
  }
  function wrapIfNeeded(node) {
    return window.ShadowDOMPolyfill && window.ShadowDOMPolyfill.wrapIfNeeded(node) || node;
  }
  function dispatchCallbacks() {
    isScheduled = false;
    var observers = scheduledObservers;
    scheduledObservers = [];
    observers.sort(function(o1, o2) {
      return o1.uid_ - o2.uid_;
    });
    var anyNonEmpty = false;
    observers.forEach(function(observer) {
      var queue = observer.takeRecords();
      removeTransientObserversFor(observer);
      if (queue.length) {
        observer.callback_(queue, observer);
        anyNonEmpty = true;
      }
    });
    if (anyNonEmpty) dispatchCallbacks();
  }
  function removeTransientObserversFor(observer) {
    observer.nodes_.forEach(function(node) {
      var registrations = registrationsTable.get(node);
      if (!registrations) return;
      registrations.forEach(function(registration) {
        if (registration.observer === observer) registration.removeTransientObservers();
      });
    });
  }
  function forEachAncestorAndObserverEnqueueRecord(target, callback) {
    for (var node = target; node; node = node.parentNode) {
      var registrations = registrationsTable.get(node);
      if (registrations) {
        for (var j = 0; j < registrations.length; j++) {
          var registration = registrations[j];
          var options = registration.options;
          if (node !== target && !options.subtree) continue;
          var record = callback(options);
          if (record) registration.enqueue(record);
        }
      }
    }
  }
  var uidCounter = 0;
  function JsMutationObserver(callback) {
    this.callback_ = callback;
    this.nodes_ = [];
    this.records_ = [];
    this.uid_ = ++uidCounter;
  }
  JsMutationObserver.prototype = {
    observe: function(target, options) {
      target = wrapIfNeeded(target);
      if (!options.childList && !options.attributes && !options.characterData || options.attributeOldValue && !options.attributes || options.attributeFilter && options.attributeFilter.length && !options.attributes || options.characterDataOldValue && !options.characterData) {
        throw new SyntaxError();
      }
      var registrations = registrationsTable.get(target);
      if (!registrations) registrationsTable.set(target, registrations = []);
      var registration;
      for (var i = 0; i < registrations.length; i++) {
        if (registrations[i].observer === this) {
          registration = registrations[i];
          registration.removeListeners();
          registration.options = options;
          break;
        }
      }
      if (!registration) {
        registration = new Registration(this, target, options);
        registrations.push(registration);
        this.nodes_.push(target);
      }
      registration.addListeners();
    },
    disconnect: function() {
      this.nodes_.forEach(function(node) {
        var registrations = registrationsTable.get(node);
        for (var i = 0; i < registrations.length; i++) {
          var registration = registrations[i];
          if (registration.observer === this) {
            registration.removeListeners();
            registrations.splice(i, 1);
            break;
          }
        }
      }, this);
      this.records_ = [];
    },
    takeRecords: function() {
      var copyOfRecords = this.records_;
      this.records_ = [];
      return copyOfRecords;
    }
  };
  function MutationRecord(type, target) {
    this.type = type;
    this.target = target;
    this.addedNodes = [];
    this.removedNodes = [];
    this.previousSibling = null;
    this.nextSibling = null;
    this.attributeName = null;
    this.attributeNamespace = null;
    this.oldValue = null;
  }
  function copyMutationRecord(original) {
    var record = new MutationRecord(original.type, original.target);
    record.addedNodes = original.addedNodes.slice();
    record.removedNodes = original.removedNodes.slice();
    record.previousSibling = original.previousSibling;
    record.nextSibling = original.nextSibling;
    record.attributeName = original.attributeName;
    record.attributeNamespace = original.attributeNamespace;
    record.oldValue = original.oldValue;
    return record;
  }
  var currentRecord, recordWithOldValue;
  function getRecord(type, target) {
    return currentRecord = new MutationRecord(type, target);
  }
  function getRecordWithOldValue(oldValue) {
    if (recordWithOldValue) return recordWithOldValue;
    recordWithOldValue = copyMutationRecord(currentRecord);
    recordWithOldValue.oldValue = oldValue;
    return recordWithOldValue;
  }
  function clearRecords() {
    currentRecord = recordWithOldValue = undefined;
  }
  function recordRepresentsCurrentMutation(record) {
    return record === recordWithOldValue || record === currentRecord;
  }
  function selectRecord(lastRecord, newRecord) {
    if (lastRecord === newRecord) return lastRecord;
    if (recordWithOldValue && recordRepresentsCurrentMutation(lastRecord)) return recordWithOldValue;
    return null;
  }
  function Registration(observer, target, options) {
    this.observer = observer;
    this.target = target;
    this.options = options;
    this.transientObservedNodes = [];
  }
  Registration.prototype = {
    enqueue: function(record) {
      var records = this.observer.records_;
      var length = records.length;
      if (records.length > 0) {
        var lastRecord = records[length - 1];
        var recordToReplaceLast = selectRecord(lastRecord, record);
        if (recordToReplaceLast) {
          records[length - 1] = recordToReplaceLast;
          return;
        }
      } else {
        scheduleCallback(this.observer);
      }
      records[length] = record;
    },
    addListeners: function() {
      this.addListeners_(this.target);
    },
    addListeners_: function(node) {
      var options = this.options;
      if (options.attributes) node.addEventListener("DOMAttrModified", this, true);
      if (options.characterData) node.addEventListener("DOMCharacterDataModified", this, true);
      if (options.childList) node.addEventListener("DOMNodeInserted", this, true);
      if (options.childList || options.subtree) node.addEventListener("DOMNodeRemoved", this, true);
    },
    removeListeners: function() {
      this.removeListeners_(this.target);
    },
    removeListeners_: function(node) {
      var options = this.options;
      if (options.attributes) node.removeEventListener("DOMAttrModified", this, true);
      if (options.characterData) node.removeEventListener("DOMCharacterDataModified", this, true);
      if (options.childList) node.removeEventListener("DOMNodeInserted", this, true);
      if (options.childList || options.subtree) node.removeEventListener("DOMNodeRemoved", this, true);
    },
    addTransientObserver: function(node) {
      if (node === this.target) return;
      this.addListeners_(node);
      this.transientObservedNodes.push(node);
      var registrations = registrationsTable.get(node);
      if (!registrations) registrationsTable.set(node, registrations = []);
      registrations.push(this);
    },
    removeTransientObservers: function() {
      var transientObservedNodes = this.transientObservedNodes;
      this.transientObservedNodes = [];
      transientObservedNodes.forEach(function(node) {
        this.removeListeners_(node);
        var registrations = registrationsTable.get(node);
        for (var i = 0; i < registrations.length; i++) {
          if (registrations[i] === this) {
            registrations.splice(i, 1);
            break;
          }
        }
      }, this);
    },
    handleEvent: function(e) {
      e.stopImmediatePropagation();
      switch (e.type) {
       case "DOMAttrModified":
        var name = e.attrName;
        var namespace = e.relatedNode.namespaceURI;
        var target = e.target;
        var record = new getRecord("attributes", target);
        record.attributeName = name;
        record.attributeNamespace = namespace;
        var oldValue = e.attrChange === MutationEvent.ADDITION ? null : e.prevValue;
        forEachAncestorAndObserverEnqueueRecord(target, function(options) {
          if (!options.attributes) return;
          if (options.attributeFilter && options.attributeFilter.length && options.attributeFilter.indexOf(name) === -1 && options.attributeFilter.indexOf(namespace) === -1) {
            return;
          }
          if (options.attributeOldValue) return getRecordWithOldValue(oldValue);
          return record;
        });
        break;

       case "DOMCharacterDataModified":
        var target = e.target;
        var record = getRecord("characterData", target);
        var oldValue = e.prevValue;
        forEachAncestorAndObserverEnqueueRecord(target, function(options) {
          if (!options.characterData) return;
          if (options.characterDataOldValue) return getRecordWithOldValue(oldValue);
          return record;
        });
        break;

       case "DOMNodeRemoved":
        this.addTransientObserver(e.target);

       case "DOMNodeInserted":
        var changedNode = e.target;
        var addedNodes, removedNodes;
        if (e.type === "DOMNodeInserted") {
          addedNodes = [ changedNode ];
          removedNodes = [];
        } else {
          addedNodes = [];
          removedNodes = [ changedNode ];
        }
        var previousSibling = changedNode.previousSibling;
        var nextSibling = changedNode.nextSibling;
        var record = getRecord("childList", e.target.parentNode);
        record.addedNodes = addedNodes;
        record.removedNodes = removedNodes;
        record.previousSibling = previousSibling;
        record.nextSibling = nextSibling;
        forEachAncestorAndObserverEnqueueRecord(e.relatedNode, function(options) {
          if (!options.childList) return;
          return record;
        });
      }
      clearRecords();
    }
  };
  global.JsMutationObserver = JsMutationObserver;
  if (!global.MutationObserver) global.MutationObserver = JsMutationObserver;
})(this);

window.CustomElements = window.CustomElements || {
  flags: {}
};

(function(scope) {
  var flags = scope.flags;
  var modules = [];
  var addModule = function(module) {
    modules.push(module);
  };
  var initializeModules = function() {
    modules.forEach(function(module) {
      module(scope);
    });
  };
  scope.addModule = addModule;
  scope.initializeModules = initializeModules;
  scope.hasNative = Boolean(document.registerElement);
  scope.useNative = !flags.register && scope.hasNative && !window.ShadowDOMPolyfill && (!window.HTMLImports || HTMLImports.useNative);
})(window.CustomElements);

window.CustomElements.addModule(function(scope) {
  var IMPORT_LINK_TYPE = window.HTMLImports ? HTMLImports.IMPORT_LINK_TYPE : "none";
  function forSubtree(node, cb) {
    findAllElements(node, function(e) {
      if (cb(e)) {
        return true;
      }
      forRoots(e, cb);
    });
    forRoots(node, cb);
  }
  function findAllElements(node, find, data) {
    var e = node.firstElementChild;
    if (!e) {
      e = node.firstChild;
      while (e && e.nodeType !== Node.ELEMENT_NODE) {
        e = e.nextSibling;
      }
    }
    while (e) {
      if (find(e, data) !== true) {
        findAllElements(e, find, data);
      }
      e = e.nextElementSibling;
    }
    return null;
  }
  function forRoots(node, cb) {
    var root = node.shadowRoot;
    while (root) {
      forSubtree(root, cb);
      root = root.olderShadowRoot;
    }
  }
  function forDocumentTree(doc, cb) {
    _forDocumentTree(doc, cb, []);
  }
  function _forDocumentTree(doc, cb, processingDocuments) {
    doc = wrap(doc);
    if (processingDocuments.indexOf(doc) >= 0) {
      return;
    }
    processingDocuments.push(doc);
    var imports = doc.querySelectorAll("link[rel=" + IMPORT_LINK_TYPE + "]");
    for (var i = 0, l = imports.length, n; i < l && (n = imports[i]); i++) {
      if (n.import) {
        _forDocumentTree(n.import, cb, processingDocuments);
      }
    }
    cb(doc);
  }
  scope.forDocumentTree = forDocumentTree;
  scope.forSubtree = forSubtree;
});

window.CustomElements.addModule(function(scope) {
  var flags = scope.flags;
  var forSubtree = scope.forSubtree;
  var forDocumentTree = scope.forDocumentTree;
  function addedNode(node) {
    return added(node) || addedSubtree(node);
  }
  function added(node) {
    if (scope.upgrade(node)) {
      return true;
    }
    attached(node);
  }
  function addedSubtree(node) {
    forSubtree(node, function(e) {
      if (added(e)) {
        return true;
      }
    });
  }
  function attachedNode(node) {
    attached(node);
    if (inDocument(node)) {
      forSubtree(node, function(e) {
        attached(e);
      });
    }
  }
  var hasPolyfillMutations = !window.MutationObserver || window.MutationObserver === window.JsMutationObserver;
  scope.hasPolyfillMutations = hasPolyfillMutations;
  var isPendingMutations = false;
  var pendingMutations = [];
  function deferMutation(fn) {
    pendingMutations.push(fn);
    if (!isPendingMutations) {
      isPendingMutations = true;
      setTimeout(takeMutations);
    }
  }
  function takeMutations() {
    isPendingMutations = false;
    var $p = pendingMutations;
    for (var i = 0, l = $p.length, p; i < l && (p = $p[i]); i++) {
      p();
    }
    pendingMutations = [];
  }
  function attached(element) {
    if (hasPolyfillMutations) {
      deferMutation(function() {
        _attached(element);
      });
    } else {
      _attached(element);
    }
  }
  function _attached(element) {
    if (element.__upgraded__ && (element.attachedCallback || element.detachedCallback)) {
      if (!element.__attached && inDocument(element)) {
        element.__attached = true;
        if (element.attachedCallback) {
          element.attachedCallback();
        }
      }
    }
  }
  function detachedNode(node) {
    detached(node);
    forSubtree(node, function(e) {
      detached(e);
    });
  }
  function detached(element) {
    if (hasPolyfillMutations) {
      deferMutation(function() {
        _detached(element);
      });
    } else {
      _detached(element);
    }
  }
  function _detached(element) {
    if (element.__upgraded__ && (element.attachedCallback || element.detachedCallback)) {
      if (element.__attached && !inDocument(element)) {
        element.__attached = false;
        if (element.detachedCallback) {
          element.detachedCallback();
        }
      }
    }
  }
  function inDocument(element) {
    var p = element;
    var doc = wrap(document);
    while (p) {
      if (p == doc) {
        return true;
      }
      p = p.parentNode || p.nodeType === Node.DOCUMENT_FRAGMENT_NODE && p.host;
    }
  }
  function watchShadow(node) {
    if (node.shadowRoot && !node.shadowRoot.__watched) {
      flags.dom && console.log("watching shadow-root for: ", node.localName);
      var root = node.shadowRoot;
      while (root) {
        observe(root);
        root = root.olderShadowRoot;
      }
    }
  }
  function handler(mutations) {
    if (flags.dom) {
      var mx = mutations[0];
      if (mx && mx.type === "childList" && mx.addedNodes) {
        if (mx.addedNodes) {
          var d = mx.addedNodes[0];
          while (d && d !== document && !d.host) {
            d = d.parentNode;
          }
          var u = d && (d.URL || d._URL || d.host && d.host.localName) || "";
          u = u.split("/?").shift().split("/").pop();
        }
      }
      console.group("mutations (%d) [%s]", mutations.length, u || "");
    }
    mutations.forEach(function(mx) {
      if (mx.type === "childList") {
        forEach(mx.addedNodes, function(n) {
          if (!n.localName) {
            return;
          }
          addedNode(n);
        });
        forEach(mx.removedNodes, function(n) {
          if (!n.localName) {
            return;
          }
          detachedNode(n);
        });
      }
    });
    flags.dom && console.groupEnd();
  }
  function takeRecords(node) {
    node = wrap(node);
    if (!node) {
      node = wrap(document);
    }
    while (node.parentNode) {
      node = node.parentNode;
    }
    var observer = node.__observer;
    if (observer) {
      handler(observer.takeRecords());
      takeMutations();
    }
  }
  var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);
  function observe(inRoot) {
    if (inRoot.__observer) {
      return;
    }
    var observer = new MutationObserver(handler);
    observer.observe(inRoot, {
      childList: true,
      subtree: true
    });
    inRoot.__observer = observer;
  }
  function upgradeDocument(doc) {
    doc = wrap(doc);
    flags.dom && console.group("upgradeDocument: ", doc.baseURI.split("/").pop());
    addedNode(doc);
    observe(doc);
    flags.dom && console.groupEnd();
  }
  function upgradeDocumentTree(doc) {
    forDocumentTree(doc, upgradeDocument);
  }
  var originalCreateShadowRoot = Element.prototype.createShadowRoot;
  if (originalCreateShadowRoot) {
    Element.prototype.createShadowRoot = function() {
      var root = originalCreateShadowRoot.call(this);
      CustomElements.watchShadow(this);
      return root;
    };
  }
  scope.watchShadow = watchShadow;
  scope.upgradeDocumentTree = upgradeDocumentTree;
  scope.upgradeSubtree = addedSubtree;
  scope.upgradeAll = addedNode;
  scope.attachedNode = attachedNode;
  scope.takeRecords = takeRecords;
});

window.CustomElements.addModule(function(scope) {
  var flags = scope.flags;
  function upgrade(node) {
    if (!node.__upgraded__ && node.nodeType === Node.ELEMENT_NODE) {
      var is = node.getAttribute("is");
      var definition = scope.getRegisteredDefinition(is || node.localName);
      if (definition) {
        if (is && definition.tag == node.localName) {
          return upgradeWithDefinition(node, definition);
        } else if (!is && !definition.extends) {
          return upgradeWithDefinition(node, definition);
        }
      }
    }
  }
  function upgradeWithDefinition(element, definition) {
    flags.upgrade && console.group("upgrade:", element.localName);
    if (definition.is) {
      element.setAttribute("is", definition.is);
    }
    implementPrototype(element, definition);
    element.__upgraded__ = true;
    created(element);
    scope.attachedNode(element);
    scope.upgradeSubtree(element);
    flags.upgrade && console.groupEnd();
    return element;
  }
  function implementPrototype(element, definition) {
    if (Object.__proto__) {
      element.__proto__ = definition.prototype;
    } else {
      customMixin(element, definition.prototype, definition.native);
      element.__proto__ = definition.prototype;
    }
  }
  function customMixin(inTarget, inSrc, inNative) {
    var used = {};
    var p = inSrc;
    while (p !== inNative && p !== HTMLElement.prototype) {
      var keys = Object.getOwnPropertyNames(p);
      for (var i = 0, k; k = keys[i]; i++) {
        if (!used[k]) {
          Object.defineProperty(inTarget, k, Object.getOwnPropertyDescriptor(p, k));
          used[k] = 1;
        }
      }
      p = Object.getPrototypeOf(p);
    }
  }
  function created(element) {
    if (element.createdCallback) {
      element.createdCallback();
    }
  }
  scope.upgrade = upgrade;
  scope.upgradeWithDefinition = upgradeWithDefinition;
  scope.implementPrototype = implementPrototype;
});

window.CustomElements.addModule(function(scope) {
  var isIE11OrOlder = scope.isIE11OrOlder;
  var upgradeDocumentTree = scope.upgradeDocumentTree;
  var upgradeAll = scope.upgradeAll;
  var upgradeWithDefinition = scope.upgradeWithDefinition;
  var implementPrototype = scope.implementPrototype;
  var useNative = scope.useNative;
  function register(name, options) {
    var definition = options || {};
    if (!name) {
      throw new Error("document.registerElement: first argument `name` must not be empty");
    }
    if (name.indexOf("-") < 0) {
      throw new Error("document.registerElement: first argument ('name') must contain a dash ('-'). Argument provided was '" + String(name) + "'.");
    }
    if (isReservedTag(name)) {
      throw new Error("Failed to execute 'registerElement' on 'Document': Registration failed for type '" + String(name) + "'. The type name is invalid.");
    }
    if (getRegisteredDefinition(name)) {
      throw new Error("DuplicateDefinitionError: a type with name '" + String(name) + "' is already registered");
    }
    if (!definition.prototype) {
      definition.prototype = Object.create(HTMLElement.prototype);
    }
    definition.__name = name.toLowerCase();
    definition.lifecycle = definition.lifecycle || {};
    definition.ancestry = ancestry(definition.extends);
    resolveTagName(definition);
    resolvePrototypeChain(definition);
    overrideAttributeApi(definition.prototype);
    registerDefinition(definition.__name, definition);
    definition.ctor = generateConstructor(definition);
    definition.ctor.prototype = definition.prototype;
    definition.prototype.constructor = definition.ctor;
    if (scope.ready) {
      upgradeDocumentTree(document);
    }
    return definition.ctor;
  }
  function overrideAttributeApi(prototype) {
    if (prototype.setAttribute._polyfilled) {
      return;
    }
    var setAttribute = prototype.setAttribute;
    prototype.setAttribute = function(name, value) {
      changeAttribute.call(this, name, value, setAttribute);
    };
    var removeAttribute = prototype.removeAttribute;
    prototype.removeAttribute = function(name) {
      changeAttribute.call(this, name, null, removeAttribute);
    };
    prototype.setAttribute._polyfilled = true;
  }
  function changeAttribute(name, value, operation) {
    name = name.toLowerCase();
    var oldValue = this.getAttribute(name);
    operation.apply(this, arguments);
    var newValue = this.getAttribute(name);
    if (this.attributeChangedCallback && newValue !== oldValue) {
      this.attributeChangedCallback(name, oldValue, newValue);
    }
  }
  function isReservedTag(name) {
    for (var i = 0; i < reservedTagList.length; i++) {
      if (name === reservedTagList[i]) {
        return true;
      }
    }
  }
  var reservedTagList = [ "annotation-xml", "color-profile", "font-face", "font-face-src", "font-face-uri", "font-face-format", "font-face-name", "missing-glyph" ];
  function ancestry(extnds) {
    var extendee = getRegisteredDefinition(extnds);
    if (extendee) {
      return ancestry(extendee.extends).concat([ extendee ]);
    }
    return [];
  }
  function resolveTagName(definition) {
    var baseTag = definition.extends;
    for (var i = 0, a; a = definition.ancestry[i]; i++) {
      baseTag = a.is && a.tag;
    }
    definition.tag = baseTag || definition.__name;
    if (baseTag) {
      definition.is = definition.__name;
    }
  }
  function resolvePrototypeChain(definition) {
    if (!Object.__proto__) {
      var nativePrototype = HTMLElement.prototype;
      if (definition.is) {
        var inst = document.createElement(definition.tag);
        var expectedPrototype = Object.getPrototypeOf(inst);
        if (expectedPrototype === definition.prototype) {
          nativePrototype = expectedPrototype;
        }
      }
      var proto = definition.prototype, ancestor;
      while (proto && proto !== nativePrototype) {
        ancestor = Object.getPrototypeOf(proto);
        proto.__proto__ = ancestor;
        proto = ancestor;
      }
      definition.native = nativePrototype;
    }
  }
  function instantiate(definition) {
    return upgradeWithDefinition(domCreateElement(definition.tag), definition);
  }
  var registry = {};
  function getRegisteredDefinition(name) {
    if (name) {
      return registry[name.toLowerCase()];
    }
  }
  function registerDefinition(name, definition) {
    registry[name] = definition;
  }
  function generateConstructor(definition) {
    return function() {
      return instantiate(definition);
    };
  }
  var HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
  function createElementNS(namespace, tag, typeExtension) {
    if (namespace === HTML_NAMESPACE) {
      return createElement(tag, typeExtension);
    } else {
      return domCreateElementNS(namespace, tag);
    }
  }
  function createElement(tag, typeExtension) {
    if (tag) {
      tag = tag.toLowerCase();
    }
    if (typeExtension) {
      typeExtension = typeExtension.toLowerCase();
    }
    var definition = getRegisteredDefinition(typeExtension || tag);
    if (definition) {
      if (tag == definition.tag && typeExtension == definition.is) {
        return new definition.ctor();
      }
      if (!typeExtension && !definition.is) {
        return new definition.ctor();
      }
    }
    var element;
    if (typeExtension) {
      element = createElement(tag);
      element.setAttribute("is", typeExtension);
      return element;
    }
    element = domCreateElement(tag);
    if (tag.indexOf("-") >= 0) {
      implementPrototype(element, HTMLElement);
    }
    return element;
  }
  var domCreateElement = document.createElement.bind(document);
  var domCreateElementNS = document.createElementNS.bind(document);
  var isInstance;
  if (!Object.__proto__ && !useNative) {
    isInstance = function(obj, ctor) {
      var p = obj;
      while (p) {
        if (p === ctor.prototype) {
          return true;
        }
        p = p.__proto__;
      }
      return false;
    };
  } else {
    isInstance = function(obj, base) {
      return obj instanceof base;
    };
  }
  function wrapDomMethodToForceUpgrade(obj, methodName) {
    var orig = obj[methodName];
    obj[methodName] = function() {
      var n = orig.apply(this, arguments);
      upgradeAll(n);
      return n;
    };
  }
  wrapDomMethodToForceUpgrade(Node.prototype, "cloneNode");
  wrapDomMethodToForceUpgrade(document, "importNode");
  if (isIE11OrOlder) {
    (function() {
      var importNode = document.importNode;
      document.importNode = function() {
        var n = importNode.apply(document, arguments);
        if (n.nodeType == n.DOCUMENT_FRAGMENT_NODE) {
          var f = document.createDocumentFragment();
          f.appendChild(n);
          return f;
        } else {
          return n;
        }
      };
    })();
  }
  document.registerElement = register;
  document.createElement = createElement;
  document.createElementNS = createElementNS;
  scope.registry = registry;
  scope.instanceof = isInstance;
  scope.reservedTagList = reservedTagList;
  scope.getRegisteredDefinition = getRegisteredDefinition;
  document.register = document.registerElement;
});

(function(scope) {
  var useNative = scope.useNative;
  var initializeModules = scope.initializeModules;
  var isIE11OrOlder = /Trident/.test(navigator.userAgent);
  if (useNative) {
    var nop = function() {};
    scope.watchShadow = nop;
    scope.upgrade = nop;
    scope.upgradeAll = nop;
    scope.upgradeDocumentTree = nop;
    scope.upgradeSubtree = nop;
    scope.takeRecords = nop;
    scope.instanceof = function(obj, base) {
      return obj instanceof base;
    };
  } else {
    initializeModules();
  }
  var upgradeDocumentTree = scope.upgradeDocumentTree;
  if (!window.wrap) {
    if (window.ShadowDOMPolyfill) {
      window.wrap = ShadowDOMPolyfill.wrapIfNeeded;
      window.unwrap = ShadowDOMPolyfill.unwrapIfNeeded;
    } else {
      window.wrap = window.unwrap = function(node) {
        return node;
      };
    }
  }
  function bootstrap() {
    upgradeDocumentTree(wrap(document));
    if (window.HTMLImports) {
      HTMLImports.__importsParsingHook = function(elt) {
        upgradeDocumentTree(wrap(elt.import));
      };
    }
    CustomElements.ready = true;
    setTimeout(function() {
      CustomElements.readyTime = Date.now();
      if (window.HTMLImports) {
        CustomElements.elapsed = CustomElements.readyTime - HTMLImports.readyTime;
      }
      document.dispatchEvent(new CustomEvent("WebComponentsReady", {
        bubbles: true
      }));
    });
  }
  if (isIE11OrOlder && typeof window.CustomEvent !== "function") {
    window.CustomEvent = function(inType, params) {
      params = params || {};
      var e = document.createEvent("CustomEvent");
      e.initCustomEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable), params.detail);
      return e;
    };
    window.CustomEvent.prototype = window.Event.prototype;
  }
  if (document.readyState === "complete" || scope.flags.eager) {
    bootstrap();
  } else if (document.readyState === "interactive" && !window.attachEvent && (!window.HTMLImports || window.HTMLImports.ready)) {
    bootstrap();
  } else {
    var loadEvent = window.HTMLImports && !HTMLImports.ready ? "HTMLImportsLoaded" : "DOMContentLoaded";
    window.addEventListener(loadEvent, bootstrap);
  }
  scope.isIE11OrOlder = isIE11OrOlder;
})(window.CustomElements);

if (!window.CustomEvent) {
  (function() {
    var CustomEvent;

    CustomEvent = function(event, params) {
      var evt;
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined
      };
      evt = document.createEvent("CustomEvent");
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
  })();
}

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
 
  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;
 
    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();
;(function () {
	'use strict';

	/**
	 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
	 *
	 * @codingstandard ftlabs-jsv2
	 * @copyright The Financial Times Limited [All Rights Reserved]
	 * @license MIT License (see LICENSE.txt)
	 */

	/*jslint browser:true, node:true*/
	/*global define, Event, Node*/


	/**
	 * Instantiate fast-clicking listeners on the specified layer.
	 *
	 * @constructor
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	function FastClick(layer, options) {
		var oldOnClick;

		options = options || {};

		/**
		 * Whether a click is currently being tracked.
		 *
		 * @type boolean
		 */
		this.trackingClick = false;


		/**
		 * Timestamp for when click tracking started.
		 *
		 * @type number
		 */
		this.trackingClickStart = 0;


		/**
		 * The element being tracked for a click.
		 *
		 * @type EventTarget
		 */
		this.targetElement = null;


		/**
		 * X-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartX = 0;


		/**
		 * Y-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartY = 0;


		/**
		 * ID of the last touch, retrieved from Touch.identifier.
		 *
		 * @type number
		 */
		this.lastTouchIdentifier = 0;


		/**
		 * Touchmove boundary, beyond which a click will be cancelled.
		 *
		 * @type number
		 */
		this.touchBoundary = options.touchBoundary || 10;


		/**
		 * The FastClick layer.
		 *
		 * @type Element
		 */
		this.layer = layer;

		/**
		 * The minimum time between tap(touchstart and touchend) events
		 *
		 * @type number
		 */
		this.tapDelay = options.tapDelay || 200;

		/**
		 * The maximum time for a tap
		 *
		 * @type number
		 */
		this.tapTimeout = options.tapTimeout || 700;

		if (FastClick.notNeeded(layer)) {
			return;
		}

		// Some old versions of Android don't have Function.prototype.bind
		function bind(method, context) {
			return function() { return method.apply(context, arguments); };
		}


		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}

		// Set up event handlers as required
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}

		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);

		// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
		// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
		// layer when they are cancelled.
		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function(type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};

			layer.addEventListener = function(type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}

		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {

			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function(event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	/**
	* Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
	*
	* @type boolean
	*/
	var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

	/**
	 * Android requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


	/**
	 * iOS requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


	/**
	 * iOS 4 requires an exception for select elements.
	 *
	 * @type boolean
	 */
	var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


	/**
	 * iOS 6.0-7.* requires the target element to be manually derived
	 *
	 * @type boolean
	 */
	var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

	/**
	 * BlackBerry requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

	/**
	 * Determine whether a given element requires a native click.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element needs a native click
	 */
	FastClick.prototype.needsClick = function(target) {
		switch (target.nodeName.toLowerCase()) {

		// Don't send a synthetic click to disabled inputs (issue #62)
		case 'button':
		case 'select':
		case 'textarea':
			if (target.disabled) {
				return true;
			}

			break;
		case 'input':

			// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
			if ((deviceIsIOS && target.type === 'file') || target.disabled) {
				return true;
			}

			break;
		case 'label':
		case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
		case 'video':
			return true;
		}

		return (/\bneedsclick\b/).test(target.className);
	};


	/**
	 * Determine whether a given element requires a call to focus to simulate click into element.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
	 */
	FastClick.prototype.needsFocus = function(target) {
		switch (target.nodeName.toLowerCase()) {
		case 'textarea':
			return true;
		case 'select':
			return !deviceIsAndroid;
		case 'input':
			switch (target.type) {
			case 'button':
			case 'checkbox':
			case 'file':
			case 'image':
			case 'radio':
			case 'submit':
				return false;
			}

			// No point in attempting to focus disabled inputs
			return !target.disabled && !target.readOnly;
		default:
			return (/\bneedsfocus\b/).test(target.className);
		}
	};


	/**
	 * Send a click event to the specified element.
	 *
	 * @param {EventTarget|Element} targetElement
	 * @param {Event} event
	 */
	FastClick.prototype.sendClick = function(targetElement, event) {
		var clickEvent, touch;

		// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}

		touch = event.changedTouches[0];

		// Synthesize a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};

	FastClick.prototype.determineEventType = function(targetElement) {

		//Issue #159: Android Chrome Select Box does not open with a synthetic click event
		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}

		return 'click';
	};


	/**
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.focus = function(targetElement) {
		var length;

		// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};


	/**
	 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
	 *
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.updateScrollParent = function(targetElement) {
		var scrollParent, parentElement;

		scrollParent = targetElement.fastClickScrollParent;

		// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
		// target element was moved to another parent.
		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}

				parentElement = parentElement.parentElement;
			} while (parentElement);
		}

		// Always update the scroll top tracker if possible.
		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};


	/**
	 * @param {EventTarget} targetElement
	 * @returns {Element|EventTarget}
	 */
	FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

		// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}

		return eventTarget;
	};


	/**
	 * On touch start, record the position and scroll offset.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchStart = function(event) {
		var targetElement, touch, selection;

		// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
		if (event.targetTouches.length > 1) {
			return true;
		}

		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];

		if (deviceIsIOS) {

			// Only trusted events will deselect text on iOS (issue #49)
			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}

			if (!deviceIsIOS4) {

				// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
				// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
				// with the same identifier as the touch event that previously triggered the click that triggered the alert.
				// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
				// immediately preceding touch event (issue #52), so this fix is unavailable on that platform.
				// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
				// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
				// random integers, it's safe to to continue if the identifier is 0 here.
				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}

				this.lastTouchIdentifier = touch.identifier;

				// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
				// 1) the user does a fling scroll on the scrollable layer
				// 2) the user stops the fling scroll with another tap
				// then the event.target of the last 'touchend' event will be the element that was under the user's finger
				// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
				// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
				this.updateScrollParent(targetElement);
			}
		}

		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;

		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay && (event.timeStamp - this.lastClickTime) > -1) {
			event.preventDefault();
		}

		return true;
	};


	/**
	 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.touchHasMoved = function(event) {
		var touch = event.changedTouches[0], boundary = this.touchBoundary;

		if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
			return true;
		}

		return false;
	};


	/**
	 * Update the last position.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchMove = function(event) {
		if (!this.trackingClick) {
			return true;
		}

		// If the touch has moved, cancel the click tracking
		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}

		return true;
	};


	/**
	 * Attempt to find the labelled control for the given label element.
	 *
	 * @param {EventTarget|HTMLLabelElement} labelElement
	 * @returns {Element|null}
	 */
	FastClick.prototype.findControl = function(labelElement) {

		// Fast path for newer browsers supporting the HTML5 control attribute
		if (labelElement.control !== undefined) {
			return labelElement.control;
		}

		// All browsers under test that support touch events also support the HTML5 htmlFor attribute
		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}

		// If no for attribute exists, attempt to retrieve the first labellable descendant element
		// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};


	/**
	 * On touch end, determine whether to send a click event at once.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchEnd = function(event) {
		var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

		if (!this.trackingClick) {
			return true;
		}

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay && (event.timeStamp - this.lastClickTime) > -1) {
			this.cancelNextClick = true;
			return true;
		}

		if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
			return true;
		}

		// Reset to prevent wrong click cancel on input (issue #156).
		this.cancelNextClick = false;

		this.lastClickTime = event.timeStamp;

		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;

		// On some iOS devices, the targetElement supplied with the event is invalid if the layer
		// is performing a transition or scroll, and has to be re-detected manually. Note that
		// for this to function correctly, it must be called *after* the event target is checked!
		// See issue #57; also filed as rdar://13048589 .
		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];

			// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}

		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}

				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {

			// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
			// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
			if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
				this.targetElement = null;
				return false;
			}

			this.focus(targetElement);
			this.sendClick(targetElement, event);

			// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
			// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}

			return false;
		}

		if (deviceIsIOS && !deviceIsIOS4) {

			// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
			// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}

		// Prevent the actual click from going though - unless the target node is marked as requiring
		// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}

		return false;
	};


	/**
	 * On touch cancel, stop tracking the click.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.onTouchCancel = function() {
		this.trackingClick = false;
		this.targetElement = null;
	};


	/**
	 * Determine mouse events which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onMouse = function(event) {

		// If a target element was never set (because a touch event was never fired) allow the event
		if (!this.targetElement) {
			return true;
		}

		if (event.forwardedTouchEvent) {
			return true;
		}

		// Programmatically generated events targeting a specific element should be permitted
		if (!event.cancelable) {
			return true;
		}

		// Derive and check the target element to see whether the mouse event needs to be permitted;
		// unless explicitly enabled, prevent non-touch click events from triggering actions,
		// to prevent ghost/doubleclicks.
		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

			// Prevent any user-added listeners declared on FastClick element from being fired.
			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {

				// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				event.propagationStopped = true;
			}

			// Cancel the event
			event.stopPropagation();
			event.preventDefault();

			return false;
		}

		// If the mouse event is permitted, return true for the action to go through.
		return true;
	};


	/**
	 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
	 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
	 * an actual click which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onClick = function(event) {
		var permitted;

		// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}

		// Very odd behavior on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}

		permitted = this.onMouse(event);

		// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
		if (!permitted) {
			this.targetElement = null;
		}

		// If clicks are permitted, return true for the action to go through.
		return permitted;
	};


	/**
	 * Remove all FastClick's event listeners.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.destroy = function() {
		var layer = this.layer;

		if (deviceIsAndroid) {
			layer.removeEventListener('mouseover', this.onMouse, true);
			layer.removeEventListener('mousedown', this.onMouse, true);
			layer.removeEventListener('mouseup', this.onMouse, true);
		}

		layer.removeEventListener('click', this.onClick, true);
		layer.removeEventListener('touchstart', this.onTouchStart, false);
		layer.removeEventListener('touchmove', this.onTouchMove, false);
		layer.removeEventListener('touchend', this.onTouchEnd, false);
		layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	};


	/**
	 * Check whether FastClick is needed.
	 *
	 * @param {Element} layer The layer to listen on
	 */
	FastClick.notNeeded = function(layer) {
		var metaViewport;
		var chromeVersion;
		var blackberryVersion;
		var firefoxVersion;

		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}

		// Chrome version - zero for other browsers
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (chromeVersion) {

			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// Chrome 32 and above with width=device-width or less don't need FastClick
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}

			// Chrome desktop doesn't need FastClick (issue #15)
			} else {
				return true;
			}
		}

		if (deviceIsBlackBerry10) {
			blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

			// BlackBerry 10.3+ does not require Fastclick library.
			// https://github.com/ftlabs/fastclick/issues/251
			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// user-scalable=no eliminates click delay.
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// width=device-width (or less than device-width) eliminates click delay.
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}

		// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
		if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		// Firefox version - zero for other browsers
		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (firefoxVersion >= 27) {
			// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
				return true;
			}
		}

		// IE11: prefixed -ms-touch-action is no longer supported and it's recommended to use non-prefixed version
		// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
		if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		return false;
	};


	/**
	 * Factory method for creating a FastClick object
	 *
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	FastClick.attach = function(layer, options) {
		return new FastClick(layer, options);
	};


	if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

		// AMD. Register as an anonymous module.
		define(function() {
			return FastClick;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = FastClick.attach;
		module.exports.FastClick = FastClick;
	} else {
		window.FastClick = FastClick;
	}
}());

/**
 * MicroEvent - to make any js object an event emitter (server or browser)
 * 
 * - pure javascript - server compatible, browser compatible
 * - dont rely on the browser doms
 * - super simple - you get it immediately, no mystery, no magic involved
 *
 * - create a MicroEventDebug with goodies to debug
 *   - make it safer to use
*/

/** NOTE: This library is customized for Onsen UI. */

var MicroEvent  = function(){};
MicroEvent.prototype  = {
  on  : function(event, fct){
    this._events = this._events || {};
    this._events[event] = this._events[event] || [];
    this._events[event].push(fct);
  },
  once : function(event, fct){
    var self = this;
    var wrapper = function() {
      self.off(event, wrapper);
      return fct.apply(null, arguments);
    };
    this.on(event, wrapper);
  },
  off  : function(event, fct){
    this._events = this._events || {};
    if( event in this._events === false  )  return;
    this._events[event].splice(this._events[event].indexOf(fct), 1);
  },
  emit : function(event /* , args... */){
    this._events = this._events || {};
    if( event in this._events === false  )  return;
    for(var i = 0; i < this._events[event].length; i++){
      this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
    }
  }
};

/**
 * mixin will delegate all MicroEvent.js function in the destination object
 *
 * - require('MicroEvent').mixin(Foobar) will make Foobar able to use MicroEvent
 *
 * @param {Object} the object which will support MicroEvent
*/
MicroEvent.mixin  = function(destObject){
  var props = ['on', 'once', 'off', 'emit'];
  for(var i = 0; i < props.length; i ++){
    if( typeof destObject === 'function' ){
      destObject.prototype[props[i]]  = MicroEvent.prototype[props[i]];
    }else{
      destObject[props[i]] = MicroEvent.prototype[props[i]];
    }
  }
}

// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
  module.exports  = MicroEvent;
}

/* Modernizr 2.6.2 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-borderradius-boxshadow-cssanimations-csstransforms-csstransforms3d-csstransitions-canvas-svg-shiv-cssclasses-teststyles-testprop-testallprops-prefixes-domprefixes-load
 */
;



window.Modernizr = (function( window, document, undefined ) {

    var version = '2.6.2',

    Modernizr = {},

    enableClasses = true,

    docElement = document.documentElement,

    mod = 'modernizr',
    modElem = document.createElement(mod),
    mStyle = modElem.style,

    inputElem  ,


    toString = {}.toString,

    prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),



    omPrefixes = 'Webkit Moz O ms',

    cssomPrefixes = omPrefixes.split(' '),

    domPrefixes = omPrefixes.toLowerCase().split(' '),

    ns = {'svg': 'http://www.w3.org/2000/svg'},

    tests = {},
    inputs = {},
    attrs = {},

    classes = [],

    slice = classes.slice,

    featureName, 


    injectElementWithStyles = function( rule, callback, nodes, testnames ) {

      var style, ret, node, docOverflow,
          div = document.createElement('div'),
                body = document.body,
                fakeBody = body || document.createElement('body');

      if ( parseInt(nodes, 10) ) {
                      while ( nodes-- ) {
              node = document.createElement('div');
              node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
              div.appendChild(node);
          }
      }

                style = ['&#173;','<style id="s', mod, '">', rule, '</style>'].join('');
      div.id = mod;
          (body ? div : fakeBody).innerHTML += style;
      fakeBody.appendChild(div);
      if ( !body ) {
                fakeBody.style.background = '';
                fakeBody.style.overflow = 'hidden';
          docOverflow = docElement.style.overflow;
          docElement.style.overflow = 'hidden';
          docElement.appendChild(fakeBody);
      }

      ret = callback(div, rule);
        if ( !body ) {
          fakeBody.parentNode.removeChild(fakeBody);
          docElement.style.overflow = docOverflow;
      } else {
          div.parentNode.removeChild(div);
      }

      return !!ret;

    },
    _hasOwnProperty = ({}).hasOwnProperty, hasOwnProp;

    if ( !is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined') ) {
      hasOwnProp = function (object, property) {
        return _hasOwnProperty.call(object, property);
      };
    }
    else {
      hasOwnProp = function (object, property) { 
        return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
      };
    }


    if (!Function.prototype.bind) {
      Function.prototype.bind = function bind(that) {

        var target = this;

        if (typeof target != "function") {
            throw new TypeError();
        }

        var args = slice.call(arguments, 1),
            bound = function () {

            if (this instanceof bound) {

              var F = function(){};
              F.prototype = target.prototype;
              var self = new F();

              var result = target.apply(
                  self,
                  args.concat(slice.call(arguments))
              );
              if (Object(result) === result) {
                  return result;
              }
              return self;

            } else {

              return target.apply(
                  that,
                  args.concat(slice.call(arguments))
              );

            }

        };

        return bound;
      };
    }

    function setCss( str ) {
        mStyle.cssText = str;
    }

    function setCssAll( str1, str2 ) {
        return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
    }

    function is( obj, type ) {
        return typeof obj === type;
    }

    function contains( str, substr ) {
        return !!~('' + str).indexOf(substr);
    }

    function testProps( props, prefixed ) {
        for ( var i in props ) {
            var prop = props[i];
            if ( !contains(prop, "-") && mStyle[prop] !== undefined ) {
                return prefixed == 'pfx' ? prop : true;
            }
        }
        return false;
    }

    function testDOMProps( props, obj, elem ) {
        for ( var i in props ) {
            var item = obj[props[i]];
            if ( item !== undefined) {

                            if (elem === false) return props[i];

                            if (is(item, 'function')){
                                return item.bind(elem || obj);
                }

                            return item;
            }
        }
        return false;
    }

    function testPropsAll( prop, prefixed, elem ) {

        var ucProp  = prop.charAt(0).toUpperCase() + prop.slice(1),
            props   = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

            if(is(prefixed, "string") || is(prefixed, "undefined")) {
          return testProps(props, prefixed);

            } else {
          props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
          return testDOMProps(props, prefixed, elem);
        }
    }



    tests['canvas'] = function() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    };
    tests['borderradius'] = function() {
        return testPropsAll('borderRadius');
    };

    tests['boxshadow'] = function() {
        return testPropsAll('boxShadow');
    };
    tests['cssanimations'] = function() {
        return testPropsAll('animationName');
    };



    tests['csstransforms'] = function() {
        return !!testPropsAll('transform');
    };


    tests['csstransforms3d'] = function() {

        var ret = !!testPropsAll('perspective');

                        if ( ret && 'webkitPerspective' in docElement.style ) {

                      injectElementWithStyles('@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}', function( node, rule ) {
            ret = node.offsetLeft === 9 && node.offsetHeight === 3;
          });
        }
        return ret;
    };


    tests['csstransitions'] = function() {
        return testPropsAll('transition');
    };



    tests['svg'] = function() {
        return !!document.createElementNS && !!document.createElementNS(ns.svg, 'svg').createSVGRect;
    };
    for ( var feature in tests ) {
        if ( hasOwnProp(tests, feature) ) {
                                    featureName  = feature.toLowerCase();
            Modernizr[featureName] = tests[feature]();

            classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
        }
    }



     Modernizr.addTest = function ( feature, test ) {
       if ( typeof feature == 'object' ) {
         for ( var key in feature ) {
           if ( hasOwnProp( feature, key ) ) {
             Modernizr.addTest( key, feature[ key ] );
           }
         }
       } else {

         feature = feature.toLowerCase();

         if ( Modernizr[feature] !== undefined ) {
                                              return Modernizr;
         }

         test = typeof test == 'function' ? test() : test;

         if (typeof enableClasses !== "undefined" && enableClasses) {
           docElement.className += ' ' + (test ? '' : 'no-') + feature;
         }
         Modernizr[feature] = test;

       }

       return Modernizr; 
     };


    setCss('');
    modElem = inputElem = null;

    ;(function(window, document) {
        var options = window.html5 || {};

        var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

        var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

        var supportsHtml5Styles;

        var expando = '_html5shiv';

        var expanID = 0;

        var expandoData = {};

        var supportsUnknownElements;

      (function() {
        try {
            var a = document.createElement('a');
            a.innerHTML = '<xyz></xyz>';
                    supportsHtml5Styles = ('hidden' in a);

            supportsUnknownElements = a.childNodes.length == 1 || (function() {
                        (document.createElement)('a');
              var frag = document.createDocumentFragment();
              return (
                typeof frag.cloneNode == 'undefined' ||
                typeof frag.createDocumentFragment == 'undefined' ||
                typeof frag.createElement == 'undefined'
              );
            }());
        } catch(e) {
          supportsHtml5Styles = true;
          supportsUnknownElements = true;
        }

      }());        function addStyleSheet(ownerDocument, cssText) {
        var p = ownerDocument.createElement('p'),
            parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

        p.innerHTML = 'x<style>' + cssText + '</style>';
        return parent.insertBefore(p.lastChild, parent.firstChild);
      }

        function getElements() {
        var elements = html5.elements;
        return typeof elements == 'string' ? elements.split(' ') : elements;
      }

          function getExpandoData(ownerDocument) {
        var data = expandoData[ownerDocument[expando]];
        if (!data) {
            data = {};
            expanID++;
            ownerDocument[expando] = expanID;
            expandoData[expanID] = data;
        }
        return data;
      }

        function createElement(nodeName, ownerDocument, data){
        if (!ownerDocument) {
            ownerDocument = document;
        }
        if(supportsUnknownElements){
            return ownerDocument.createElement(nodeName);
        }
        if (!data) {
            data = getExpandoData(ownerDocument);
        }
        var node;

        if (data.cache[nodeName]) {
            node = data.cache[nodeName].cloneNode();
        } else if (saveClones.test(nodeName)) {
            node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
        } else {
            node = data.createElem(nodeName);
        }

                                    return node.canHaveChildren && !reSkip.test(nodeName) ? data.frag.appendChild(node) : node;
      }

        function createDocumentFragment(ownerDocument, data){
        if (!ownerDocument) {
            ownerDocument = document;
        }
        if(supportsUnknownElements){
            return ownerDocument.createDocumentFragment();
        }
        data = data || getExpandoData(ownerDocument);
        var clone = data.frag.cloneNode(),
            i = 0,
            elems = getElements(),
            l = elems.length;
        for(;i<l;i++){
            clone.createElement(elems[i]);
        }
        return clone;
      }

        function shivMethods(ownerDocument, data) {
        if (!data.cache) {
            data.cache = {};
            data.createElem = ownerDocument.createElement;
            data.createFrag = ownerDocument.createDocumentFragment;
            data.frag = data.createFrag();
        }


        ownerDocument.createElement = function(nodeName) {
                if (!html5.shivMethods) {
              return data.createElem(nodeName);
          }
          return createElement(nodeName, ownerDocument, data);
        };

        ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
          'var n=f.cloneNode(),c=n.createElement;' +
          'h.shivMethods&&(' +
                    getElements().join().replace(/\w+/g, function(nodeName) {
              data.createElem(nodeName);
              data.frag.createElement(nodeName);
              return 'c("' + nodeName + '")';
            }) +
          ');return n}'
        )(html5, data.frag);
      }        function shivDocument(ownerDocument) {
        if (!ownerDocument) {
            ownerDocument = document;
        }
        var data = getExpandoData(ownerDocument);

        if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
          data.hasCSS = !!addStyleSheet(ownerDocument,
                    'article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}' +
                    'mark{background:#FF0;color:#000}'
          );
        }
        if (!supportsUnknownElements) {
          shivMethods(ownerDocument, data);
        }
        return ownerDocument;
      }        var html5 = {

            'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video',

            'shivCSS': (options.shivCSS !== false),

            'supportsUnknownElements': supportsUnknownElements,

            'shivMethods': (options.shivMethods !== false),

            'type': 'default',

            'shivDocument': shivDocument,

            createElement: createElement,

            createDocumentFragment: createDocumentFragment
      };        window.html5 = html5;

        shivDocument(document);

    }(this, document));

    Modernizr._version      = version;

    Modernizr._prefixes     = prefixes;
    Modernizr._domPrefixes  = domPrefixes;
    Modernizr._cssomPrefixes  = cssomPrefixes;



    Modernizr.testProp      = function(prop){
        return testProps([prop]);
    };

    Modernizr.testAllProps  = testPropsAll;


    Modernizr.testStyles    = injectElementWithStyles;    docElement.className = docElement.className.replace(/(^|\s)no-js(\s|$)/, '$1$2') +

                                                    (enableClasses ? ' js ' + classes.join(' ') : '');

    return Modernizr;

})(this, this.document);
/*yepnope1.5.4|WTFPL*/
(function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}})(this,document);
Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0));};
;
(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;
        if (!u && a) return a(o, !0);
        if (i) return i(o, !0);
        var f = new Error("Cannot find module '" + o + "'");
        throw f.code = "MODULE_NOT_FOUND", f;
      }
      var l = n[o] = {
        exports: {}
      };
      t[o][0].call(l.exports, function(e) {
        var n = t[o][1][e];
        return s(n ? n : e);
      }, l, l.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = typeof require == "function" && require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
})({
  1: [ function(require, module, exports) {
    var process = module.exports = {};
    process.nextTick = function() {
      var canSetImmediate = typeof window !== "undefined" && window.setImmediate;
      var canPost = typeof window !== "undefined" && window.postMessage && window.addEventListener;
      if (canSetImmediate) {
        return function(f) {
          return window.setImmediate(f);
        };
      }
      if (canPost) {
        var queue = [];
        window.addEventListener("message", function(ev) {
          var source = ev.source;
          if ((source === window || source === null) && ev.data === "process-tick") {
            ev.stopPropagation();
            if (queue.length > 0) {
              var fn = queue.shift();
              fn();
            }
          }
        }, true);
        return function nextTick(fn) {
          queue.push(fn);
          window.postMessage("process-tick", "*");
        };
      }
      return function nextTick(fn) {
        setTimeout(fn, 0);
      };
    }();
    process.title = "browser";
    process.browser = true;
    process.env = {};
    process.argv = [];
    function noop() {}
    process.on = noop;
    process.addListener = noop;
    process.once = noop;
    process.off = noop;
    process.removeListener = noop;
    process.removeAllListeners = noop;
    process.emit = noop;
    process.binding = function(name) {
      throw new Error("process.binding is not supported");
    };
    process.cwd = function() {
      return "/";
    };
    process.chdir = function(dir) {
      throw new Error("process.chdir is not supported");
    };
  }, {} ],
  2: [ function(require, module, exports) {
    "use strict";
    var asap = require("asap");
    module.exports = Promise;
    function Promise(fn) {
      if (typeof this !== "object") throw new TypeError("Promises must be constructed via new");
      if (typeof fn !== "function") throw new TypeError("not a function");
      var state = null;
      var value = null;
      var deferreds = [];
      var self = this;
      this.then = function(onFulfilled, onRejected) {
        return new self.constructor(function(resolve, reject) {
          handle(new Handler(onFulfilled, onRejected, resolve, reject));
        });
      };
      function handle(deferred) {
        if (state === null) {
          deferreds.push(deferred);
          return;
        }
        asap(function() {
          var cb = state ? deferred.onFulfilled : deferred.onRejected;
          if (cb === null) {
            (state ? deferred.resolve : deferred.reject)(value);
            return;
          }
          var ret;
          try {
            ret = cb(value);
          } catch (e) {
            deferred.reject(e);
            return;
          }
          deferred.resolve(ret);
        });
      }
      function resolve(newValue) {
        try {
          if (newValue === self) throw new TypeError("A promise cannot be resolved with itself.");
          if (newValue && (typeof newValue === "object" || typeof newValue === "function")) {
            var then = newValue.then;
            if (typeof then === "function") {
              doResolve(then.bind(newValue), resolve, reject);
              return;
            }
          }
          state = true;
          value = newValue;
          finale();
        } catch (e) {
          reject(e);
        }
      }
      function reject(newValue) {
        state = false;
        value = newValue;
        finale();
      }
      function finale() {
        for (var i = 0, len = deferreds.length; i < len; i++) handle(deferreds[i]);
        deferreds = null;
      }
      doResolve(fn, resolve, reject);
    }
    function Handler(onFulfilled, onRejected, resolve, reject) {
      this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
      this.onRejected = typeof onRejected === "function" ? onRejected : null;
      this.resolve = resolve;
      this.reject = reject;
    }
    function doResolve(fn, onFulfilled, onRejected) {
      var done = false;
      try {
        fn(function(value) {
          if (done) return;
          done = true;
          onFulfilled(value);
        }, function(reason) {
          if (done) return;
          done = true;
          onRejected(reason);
        });
      } catch (ex) {
        if (done) return;
        done = true;
        onRejected(ex);
      }
    }
  }, {
    asap: 4
  } ],
  3: [ function(require, module, exports) {
    "use strict";
    var Promise = require("./core.js");
    var asap = require("asap");
    module.exports = Promise;
    function ValuePromise(value) {
      this.then = function(onFulfilled) {
        if (typeof onFulfilled !== "function") return this;
        return new Promise(function(resolve, reject) {
          asap(function() {
            try {
              resolve(onFulfilled(value));
            } catch (ex) {
              reject(ex);
            }
          });
        });
      };
    }
    ValuePromise.prototype = Promise.prototype;
    var TRUE = new ValuePromise(true);
    var FALSE = new ValuePromise(false);
    var NULL = new ValuePromise(null);
    var UNDEFINED = new ValuePromise(undefined);
    var ZERO = new ValuePromise(0);
    var EMPTYSTRING = new ValuePromise("");
    Promise.resolve = function(value) {
      if (value instanceof Promise) return value;
      if (value === null) return NULL;
      if (value === undefined) return UNDEFINED;
      if (value === true) return TRUE;
      if (value === false) return FALSE;
      if (value === 0) return ZERO;
      if (value === "") return EMPTYSTRING;
      if (typeof value === "object" || typeof value === "function") {
        try {
          var then = value.then;
          if (typeof then === "function") {
            return new Promise(then.bind(value));
          }
        } catch (ex) {
          return new Promise(function(resolve, reject) {
            reject(ex);
          });
        }
      }
      return new ValuePromise(value);
    };
    Promise.all = function(arr) {
      var args = Array.prototype.slice.call(arr);
      return new Promise(function(resolve, reject) {
        if (args.length === 0) return resolve([]);
        var remaining = args.length;
        function res(i, val) {
          try {
            if (val && (typeof val === "object" || typeof val === "function")) {
              var then = val.then;
              if (typeof then === "function") {
                then.call(val, function(val) {
                  res(i, val);
                }, reject);
                return;
              }
            }
            args[i] = val;
            if (--remaining === 0) {
              resolve(args);
            }
          } catch (ex) {
            reject(ex);
          }
        }
        for (var i = 0; i < args.length; i++) {
          res(i, args[i]);
        }
      });
    };
    Promise.reject = function(value) {
      return new Promise(function(resolve, reject) {
        reject(value);
      });
    };
    Promise.race = function(values) {
      return new Promise(function(resolve, reject) {
        values.forEach(function(value) {
          Promise.resolve(value).then(resolve, reject);
        });
      });
    };
    Promise.prototype["catch"] = function(onRejected) {
      return this.then(null, onRejected);
    };
  }, {
    "./core.js": 2,
    asap: 4
  } ],
  4: [ function(require, module, exports) {
    (function(process) {
      var head = {
        task: void 0,
        next: null
      };
      var tail = head;
      var flushing = false;
      var requestFlush = void 0;
      var isNodeJS = false;
      function flush() {
        while (head.next) {
          head = head.next;
          var task = head.task;
          head.task = void 0;
          var domain = head.domain;
          if (domain) {
            head.domain = void 0;
            domain.enter();
          }
          try {
            task();
          } catch (e) {
            if (isNodeJS) {
              if (domain) {
                domain.exit();
              }
              setTimeout(flush, 0);
              if (domain) {
                domain.enter();
              }
              throw e;
            } else {
              setTimeout(function() {
                throw e;
              }, 0);
            }
          }
          if (domain) {
            domain.exit();
          }
        }
        flushing = false;
      }
      if (typeof process !== "undefined" && process.nextTick) {
        isNodeJS = true;
        requestFlush = function() {
          process.nextTick(flush);
        };
      } else if (typeof setImmediate === "function") {
        if (typeof window !== "undefined") {
          requestFlush = setImmediate.bind(window, flush);
        } else {
          requestFlush = function() {
            setImmediate(flush);
          };
        }
      } else if (typeof MessageChannel !== "undefined") {
        var channel = new MessageChannel();
        channel.port1.onmessage = flush;
        requestFlush = function() {
          channel.port2.postMessage(0);
        };
      } else {
        requestFlush = function() {
          setTimeout(flush, 0);
        };
      }
      function asap(task) {
        tail = tail.next = {
          task: task,
          domain: isNodeJS && process.domain,
          next: null
        };
        if (!flushing) {
          flushing = true;
          requestFlush();
        }
      }
      module.exports = asap;
    }).call(this, require("_process"));
  }, {
    _process: 1
  } ],
  5: [ function(require, module, exports) {
    if (typeof Promise.prototype.done !== "function") {
      Promise.prototype.done = function(onFulfilled, onRejected) {
        var self = arguments.length ? this.then.apply(this, arguments) : this;
        self.then(null, function(err) {
          setTimeout(function() {
            throw err;
          }, 0);
        });
      };
    }
  }, {} ],
  6: [ function(require, module, exports) {
    var asap = require("asap");
    if (typeof Promise === "undefined") {
      Promise = require("./lib/core.js");
      require("./lib/es6-extensions.js");
    }
    require("./polyfill-done.js");
  }, {
    "./lib/core.js": 2,
    "./lib/es6-extensions.js": 3,
    "./polyfill-done.js": 5,
    asap: 4
  } ]
}, {}, [ 6 ]);
//# sourceMappingURL=/polyfills/promise-6.1.0.js.map
/*
Copyright (c) 2012 Barnesandnoble.com, llc, Donavon West, and Domenic Denicola

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var setImmediate;

    function addFromSetImmediateArguments(args) {
        tasksByHandle[nextHandle] = partiallyApplied.apply(undefined, args);
        return nextHandle++;
    }

    // This function accepts the same arguments as setImmediate, but
    // returns a function that requires no arguments.
    function partiallyApplied(handler) {
        var args = [].slice.call(arguments, 1);
        return function() {
            if (typeof handler === "function") {
                handler.apply(undefined, args);
            } else {
                (new Function("" + handler))();
            }
        };
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    task();
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function installNextTickImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            process.nextTick(partiallyApplied(runIfPresent, handle));
            return handle;
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            global.postMessage(messagePrefix + handle, "*");
            return handle;
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            channel.port2.postMessage(handle);
            return handle;
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
            return handle;
        };
    }

    function installSetTimeoutImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
            return handle;
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(new Function("return this")()));

(function() {
    function Viewport() {

        this.PRE_IOS7_VIEWPORT = "initial-scale=1, maximum-scale=1, user-scalable=no";
        this.IOS7_VIEWPORT = "initial-scale=1, maximum-scale=1, user-scalable=no";
        this.DEFAULT_VIEWPORT = "initial-scale=1, maximum-scale=1, user-scalable=no";

        this.ensureViewportElement();
        this.platform = {};
        this.platform.name = this.getPlatformName();
        this.platform.version = this.getPlatformVersion();

        return this;
    };

    Viewport.prototype.ensureViewportElement = function(){
        this.viewportElement = document.querySelector('meta[name=viewport]');
        if(!this.viewportElement){
            this.viewportElement = document.createElement('meta');
            this.viewportElement.name = "viewport";
            document.head.appendChild(this.viewportElement);
        }
    },

    Viewport.prototype.setup = function() {
        if (!this.viewportElement) {
            return;
        }

        if (this.viewportElement.getAttribute('data-no-adjust') == "true") {
            return;
        }

        if (this.platform.name == 'ios') {
            if (this.platform.version >= 7 && isWebView()) {
                this.viewportElement.setAttribute('content', this.IOS7_VIEWPORT);
            } else {
                this.viewportElement.setAttribute('content', this.PRE_IOS7_VIEWPORT);
            }
        } else {
            this.viewportElement.setAttribute('content', this.DEFAULT_VIEWPORT);
        }

        function isWebView() {
            return !!(window.cordova || window.phonegap || window.PhoneGap);
        }
    };

    Viewport.prototype.getPlatformName = function() {
        if (navigator.userAgent.match(/Android/i)) {
            return "android";
        }

        if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
            return "ios";
        }

        // unknown
        return undefined;
    };

    Viewport.prototype.getPlatformVersion = function() {
        var start = window.navigator.userAgent.indexOf('OS ');
        return window.Number(window.navigator.userAgent.substr(start + 3, 3).replace('_', '.'));
    };

    window.Viewport = Viewport;
})();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/


/**
 * Minimal animation library for managing css transition on mobile browsers.
 */
window.animit = (function(){
  'use strict';

  /**
   * @param {HTMLElement} element
   */
  var Animit = function(element) {
    if (!(this instanceof Animit)) {
      return new Animit(element);
    }

    if (element instanceof HTMLElement) {
      this.elements = [element];
    } else if (Object.prototype.toString.call(element) === '[object Array]') {
      this.elements = element;
    } else {
      throw new Error('First argument must be an array or an instance of HTMLElement.');
    }

    this.transitionQueue = [];
    this.lastStyleAttributeDict = [];

    var self = this;
    this.elements.forEach(function(element, index) {
      if (!element.hasAttribute('data-animit-orig-style')) {
        self.lastStyleAttributeDict[index] = element.getAttribute('style');
        element.setAttribute('data-animit-orig-style', self.lastStyleAttributeDict[index] || '');
      } else {
        self.lastStyleAttributeDict[index] = element.getAttribute('data-animit-orig-style');
      }
    });
  };

  Animit.prototype = {

    /**
     * @property {Array}
     */
    transitionQueue: undefined,

    /**
     * @property {HTMLElement}
     */
    element: undefined,

    /**
     * Start animation sequence with passed animations.
     *
     * @param {Function} callback
     */
    play: function(callback) {
      if (typeof callback === 'function') {
        this.transitionQueue.push(function(done) {
          callback();
          done();
        });
      }

      this.startAnimation();

      return this;
    },

    /**
     * Queue transition animations or other function.
     *
     * e.g. animit(elt).queue({color: 'red'})
     * e.g. animit(elt).queue({color: 'red'}, {duration: 0.4})
     * e.g. animit(elt).queue({css: {color: 'red'}, duration: 0.2})
     *
     * @param {Object|Animit.Transition|Function} transition
     * @param {Object} [options]
     */
    queue: function(transition, options) {
      var queue = this.transitionQueue;

      if (transition && options) {
        options.css = transition;
        transition = new Animit.Transition(options);
      }

      if (!(transition instanceof Function || transition instanceof Animit.Transition)) {
        if (transition.css) {
          transition = new Animit.Transition(transition);
        } else {
          transition = new Animit.Transition({
            css: transition
          });
        }
      }

      if (transition instanceof Function) {
        queue.push(transition);
      } else if (transition instanceof Animit.Transition) {
        queue.push(transition.build());
      } else {
        throw new Error('Invalid arguments');
      }

      return this;
    },

    /**
     * Queue transition animations.
     *
     * @param {Float} seconds
     */
    wait: function(seconds) {
      this.transitionQueue.push(function(done) {
        setTimeout(done, 1000 * seconds);
      });

      return this;
    },

    /**
     * Reset element's style.
     *
     * @param {Object} [options]
     * @param {Float} [options.duration]
     * @param {String} [options.timing]
     * @param {String} [options.transition]
     */
    resetStyle: function(options) {
      options = options || {};
      var self = this;

      if (options.transition && !options.duration) {
        throw new Error('"options.duration" is required when "options.transition" is enabled.');
      }

      if (options.transition || (options.duration && options.duration > 0)) {
        var transitionValue = options.transition || ('all ' + options.duration + 's ' + (options.timing || 'linear'));
        var transitionStyle = 'transition: ' + transitionValue + '; -' + Animit.prefix + '-transition: ' + transitionValue + ';';

        this.transitionQueue.push(function(done) {
          var elements = this.elements;

          // transition and style settings
          elements.forEach(function(element, index) {
            element.style[Animit.prefix + 'Transition'] = transitionValue;
            element.style.transition = transitionValue;

            var styleValue = (self.lastStyleAttributeDict[index] ? self.lastStyleAttributeDict[index] + '; ' : '') + transitionStyle;
            element.setAttribute('style', styleValue);
          });

          // add "transitionend" event handler
          var removeListeners = util.addOnTransitionEnd(elements[0], function() {
            clearTimeout(timeoutId);
            reset();
            done();
          });

          // for fail safe.
          var timeoutId = setTimeout(function() {
            removeListeners();
            reset();
            done();
          }, options.duration * 1000 * 1.4);
        });
      } else {
        this.transitionQueue.push(function(done) {
          reset();
          done();
        });
      }

      return this;

      function reset() {
        // Clear transition animation settings.
        self.elements.forEach(function(element, index) {
          element.style[Animit.prefix + 'Transition'] = 'none';
          element.style.transition = 'none';

          if (self.lastStyleAttributeDict[index]) {
            element.setAttribute('style', self.lastStyleAttributeDict[index]);
          } else {
            element.setAttribute('style', '');
            element.removeAttribute('style');
          }
        });
      }
    },

    /**
     * Start animation sequence.
     */
    startAnimation: function() {
      this._dequeueTransition();

      return this;
    },

    _dequeueTransition: function() {
      var transition = this.transitionQueue.shift();
      if (this._currentTransition) {
        throw new Error('Current transition exists.');
      }
      this._currentTransition = transition;
      var self = this;
      var called = false;

      var done = function() {
        if (!called) {
          called = true;
          self._currentTransition = undefined;
          self._dequeueTransition();
        } else {
          throw new Error('Invalid state: This callback is called twice.');
        }
      };

      if (transition) {
        transition.call(this, done);
      }
    }

  };

  Animit.cssPropertyDict = (function() {
    var styles = window.getComputedStyle(document.documentElement, '');
    var dict = {};
    var a = 'A'.charCodeAt(0);
    var z = 'z'.charCodeAt(0);

    for (var key in styles) {
      if (styles.hasOwnProperty(key)) {
        if (a <= key.charCodeAt(0) && z >= key.charCodeAt(0)) {
          if (key !== 'cssText' && key !== 'parentText' && key !== 'length') {
            dict[key] = true;
          }
        }
      }
    }

    return dict;
  })();

  Animit.hasCssProperty = function(name) {
    return !!Animit.cssPropertyDict[name];
  };

  /**
   * Vendor prefix for css property.
   */
  Animit.prefix = (function() {
    var styles = window.getComputedStyle(document.documentElement, ''),
      pre = (Array.prototype.slice
        .call(styles)
        .join('') 
        .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
      )[1];
    return pre;
  })();

  /**
   * @param {Animit} arguments
   */
  Animit.runAll = function(/* arguments... */) {
    for (var i = 0; i < arguments.length; i++) {
      arguments[i].play();
    }
  };


  /**
   * @param {Object} options
   * @param {Float} [options.duration]
   * @param {String} [options.property]
   * @param {String} [options.timing]
   */
  Animit.Transition = function(options) {
    this.options = options || {};
    this.options.duration = this.options.duration || 0;
    this.options.timing = this.options.timing || 'linear';
    this.options.css = this.options.css || {};
    this.options.property = this.options.property || 'all';
  };

  Animit.Transition.prototype = {

    /**
     * @param {HTMLElement} element
     * @return {Function}
     */
    build: function() {

      if (Object.keys(this.options.css).length === 0) {
        throw new Error('options.css is required.');
      }

      var css = createActualCssProps(this.options.css);

      if (this.options.duration > 0) {
        var transitionValue = util.buildTransitionValue(this.options);
        var self = this;

        return function(callback) {
          var elements = this.elements;
          var timeout = self.options.duration * 1000 * 1.4;

          var removeListeners = util.addOnTransitionEnd(elements[0], function() {
            clearTimeout(timeoutId);
            callback();
          });

          var timeoutId = setTimeout(function() {
            removeListeners();
            callback();
          }, timeout);

          elements.forEach(function(element) {
            element.style[Animit.prefix + 'Transition'] = transitionValue;
            element.style.transition = transitionValue;

            Object.keys(css).forEach(function(name) {
              element.style[name] = css[name];
            });
          });

        };
      }

      if (this.options.duration <= 0) {
        return function(callback) {
          var elements = this.elements;

          elements.forEach(function(element) {
            element.style[Animit.prefix + 'Transition'] = 'none';
            element.transition = 'none';

            Object.keys(css).forEach(function(name) {
              element.style[name] = css[name];
            });
          });

          if (elements.length) {
            elements[0].offsetHeight;
          }

          if (window.requestAnimationFrame) {
            requestAnimationFrame(callback);
          } else {
            setTimeout(callback, 1000 / 30);
          }
        };
      }

      function createActualCssProps(css) {
        var result = {};

        Object.keys(css).forEach(function(name) {
          var value = css[name];
          name = util.normalizeStyleName(name);
          var prefixed = Animit.prefix + util.capitalize(name);

          if (Animit.cssPropertyDict[name]) {
            result[name] = value;
          } else if (Animit.cssPropertyDict[prefixed]) {
            result[prefixed] = value;
          } else {
            result[prefixed] = value;
            result[name] = value;
          }
        });

        return result;
      }

    }
  };

  var util = {
    /**
     * Normalize style property name.
     */
    normalizeStyleName: function(name) {
      name = name.replace(/-[a-zA-Z]/g, function(all) {
        return all.slice(1).toUpperCase();
      });

      return name.charAt(0).toLowerCase() + name.slice(1);
    },

    // capitalize string
    capitalize : function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * @param {Object} params
     * @param {String} params.property
     * @param {Float} params.duration
     * @param {String} params.timing
     */
    buildTransitionValue: function(params) {
      params.property = params.property || 'all';
      params.duration = params.duration || 0.4;
      params.timing = params.timing || 'linear';

      var props = params.property.split(/ +/);

      return props.map(function(prop) {
        return prop + ' ' + params.duration + 's ' + params.timing;
      }).join(', ');
    },

    /**
     * Add an event handler on "transitionend" event.
     */
    addOnTransitionEnd: function(element, callback) {
      if (!element) {
        return function() {};
      }

      var fn = function(event) {
        if (element == event.target) {
          event.stopPropagation();
          removeListeners();

          callback();
        }
      };

      var removeListeners = function() {
        util._transitionEndEvents.forEach(function(eventName) {
          element.removeEventListener(eventName, fn);
        });
      };

      util._transitionEndEvents.forEach(function(eventName) {
        element.addEventListener(eventName, fn, false);
      });

      return removeListeners;
    },

    _transitionEndEvents: (function() {
      if (Animit.prefix === 'webkit' || Animit.prefix === 'o' || Animit.prefix === 'moz' || Animit.prefix === 'ms') {
        return [Animit.prefix + 'TransitionEnd', 'transitionend'];
      }

      return ['transitionend'];
    })()

  };

  return Animit;
})();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

window.DoorLock = (function () {
  'use strict';

  var generateId = (function () {
    var i = 0;
    return function () {
      return i++;
    };
  })();

  /**
   * Door locking system.
   *
   * @param {Object} [options]
   * @param {Function} [options.log]
   */

  var DoorLock = (function () {
    function DoorLock(options) {
      _classCallCheck(this, DoorLock);

      options = options || {};
      this._lockList = [];
      this._waitList = [];
      this._log = options.log || function () {};
    }

    /**
     * Register a lock.
     *
     * @return {Function} Callback for unlocking.
     */

    _createClass(DoorLock, [{
      key: 'lock',
      value: function lock() {
        var _this = this;

        var unlock = function unlock() {
          _this._unlock(unlock);
        };
        unlock.id = generateId();
        this._lockList.push(unlock);
        this._log('lock: ' + unlock.id);

        return unlock;
      }
    }, {
      key: '_unlock',
      value: function _unlock(fn) {
        var index = this._lockList.indexOf(fn);
        if (index === -1) {
          throw new Error('This function is not registered in the lock list.');
        }

        this._lockList.splice(index, 1);
        this._log('unlock: ' + fn.id);

        this._tryToFreeWaitList();
      }
    }, {
      key: '_tryToFreeWaitList',
      value: function _tryToFreeWaitList() {
        while (!this.isLocked() && this._waitList.length > 0) {
          this._waitList.shift()();
        }
      }

      /**
       * Register a callback for waiting unlocked door.
       *
       * @params {Function} callback Callback on unlocking the door completely.
       */
    }, {
      key: 'waitUnlock',
      value: function waitUnlock(callback) {
        if (!(callback instanceof Function)) {
          throw new Error('The callback param must be a function.');
        }

        if (this.isLocked()) {
          this._waitList.push(callback);
        } else {
          callback();
        }
      }

      /**
       * @return {Boolean}
       */
    }, {
      key: 'isLocked',
      value: function isLocked() {
        return this._lockList.length > 0;
      }
    }]);

    return DoorLock;
  })();

  return DoorLock;
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (ons) {
  'use strict';

  var util = {
    _ready: false,

    _domContentLoaded: false,

    _onDOMContentLoaded: function _onDOMContentLoaded() {
      util._domContentLoaded = true;

      if (ons.isWebView()) {
        window.document.addEventListener('deviceready', function () {
          util._ready = true;
        }, false);
      } else {
        util._ready = true;
      }
    },

    addBackButtonListener: function addBackButtonListener(fn) {
      if (!this._domContentLoaded) {
        throw new Error('This method is available after DOMContentLoaded');
      }

      if (this._ready) {
        window.document.addEventListener('backbutton', fn, false);
      } else {
        window.document.addEventListener('deviceready', function () {
          window.document.addEventListener('backbutton', fn, false);
        });
      }
    },

    removeBackButtonListener: function removeBackButtonListener(fn) {
      if (!this._domContentLoaded) {
        throw new Error('This method is available after DOMContentLoaded');
      }

      if (this._ready) {
        window.document.removeEventListener('backbutton', fn, false);
      } else {
        window.document.addEventListener('deviceready', function () {
          window.document.removeEventListener('backbutton', fn, false);
        });
      }
    }
  };
  window.addEventListener('DOMContentLoaded', function () {
    return util._onDOMContentLoaded();
  }, false);

  var HandlerRepository = {
    _store: {},

    _genId: (function () {
      var i = 0;
      return function () {
        return i++;
      };
    })(),

    set: function set(element, handler) {
      if (element.dataset.deviceBackButtonHandlerId) {
        this.remove(element);
      }
      var id = element.dataset.deviceBackButtonHandlerId = HandlerRepository._genId();
      this._store[id] = handler;
    },

    remove: function remove(element) {
      if (element.dataset.deviceBackButtonHandlerId) {
        delete this._store[element.dataset.deviceBackButtonHandlerId];
        delete element.dataset.deviceBackButtonHandlerId;
      }
    },

    get: function get(element) {
      if (!element.dataset.deviceBackButtonHandlerId) {
        return undefined;
      }

      var id = element.dataset.deviceBackButtonHandlerId;

      if (!this._store[id]) {
        throw new Error();
      }

      return this._store[id];
    },

    has: function has(element) {
      var id = element.dataset.deviceBackButtonHandlerId;

      return !!this._store[id];
    }
  };

  var DeviceBackButtonDispatcher = (function () {
    function DeviceBackButtonDispatcher() {
      _classCallCheck(this, DeviceBackButtonDispatcher);

      this._isEnabled = false;
      this._boundCallback = this._callback.bind(this);
    }

    /**
     * Enable to handle 'backbutton' events.
     */

    _createClass(DeviceBackButtonDispatcher, [{
      key: 'enable',
      value: function enable() {
        if (!this._isEnabled) {
          util.addBackButtonListener(this._boundCallback);
          this._isEnabled = true;
        }
      }

      /**
       * Disable to handle 'backbutton' events.
       */
    }, {
      key: 'disable',
      value: function disable() {
        if (this._isEnabled) {
          util.removeBackButtonListener(this._boundCallback);
          this._isEnabled = false;
        }
      }

      /**
       * Fire a 'backbutton' event manually.
       */
    }, {
      key: 'fireDeviceBackButtonEvent',
      value: function fireDeviceBackButtonEvent() {
        var event = document.createEvent('Event');
        event.initEvent('backbutton', true, true);
        document.dispatchEvent(event);
      }
    }, {
      key: '_callback',
      value: function _callback() {
        this._dispatchDeviceBackButtonEvent();
      }

      /**
       * @param {HTMLElement} element
       * @param {Function} callback
       */
    }, {
      key: 'createHandler',
      value: function createHandler(element, callback) {
        if (!(element instanceof HTMLElement)) {
          throw new Error('element must be an instance of HTMLElement');
        }

        if (!(callback instanceof Function)) {
          throw new Error('callback must be an instance of Function');
        }

        var handler = {
          _callback: callback,
          _element: element,

          disable: function disable() {
            HandlerRepository.remove(element);
          },

          setListener: function setListener(callback) {
            this._callback = callback;
          },

          enable: function enable() {
            HandlerRepository.set(element, this);
          },

          isEnabled: function isEnabled() {
            return HandlerRepository.get(element) === this;
          },

          destroy: function destroy() {
            HandlerRepository.remove(element);
            this._callback = this._element = null;
          }
        };

        handler.enable();

        return handler;
      }
    }, {
      key: '_dispatchDeviceBackButtonEvent',
      value: function _dispatchDeviceBackButtonEvent() {
        var tree = this._captureTree();

        var element = this._findHandlerLeafElement(tree);

        var handler = HandlerRepository.get(element);
        handler._callback(createEvent(element));

        function createEvent(element) {
          return {
            _element: element,
            callParentHandler: function callParentHandler() {
              var parent = this._element.parentNode;

              while (parent) {
                handler = HandlerRepository.get(parent);
                if (handler) {
                  return handler._callback(createEvent(parent));
                }
                parent = parent.parentNode;
              }
            }
          };
        }
      }

      /**
       * @return {Object}
       */
    }, {
      key: '_captureTree',
      value: function _captureTree() {
        return createTree(document.body);

        function createTree(element) {
          return {
            element: element,
            children: Array.prototype.concat.apply([], arrayOf(element.children).map(function (childElement) {

              if (childElement.style.display === 'none') {
                return [];
              }

              if (childElement.children.length === 0 && !HandlerRepository.has(childElement)) {
                return [];
              }

              var result = createTree(childElement);

              if (result.children.length === 0 && !HandlerRepository.has(result.element)) {
                return [];
              }

              return [result];
            }))
          };
        }

        function arrayOf(target) {
          var result = [];
          for (var i = 0; i < target.length; i++) {
            result.push(target[i]);
          }
          return result;
        }
      }

      /**
       * @param {Object} tree
       * @return {HTMLElement}
       */
    }, {
      key: '_findHandlerLeafElement',
      value: function _findHandlerLeafElement(tree) {
        return find(tree);

        function find(_x) {
          var _again = true;

          _function: while (_again) {
            var node = _x;
            _again = false;

            if (node.children.length === 0) {
              return node.element;
            }

            if (node.children.length === 1) {
              _x = node.children[0];
              _again = true;
              continue _function;
            }

            return node.children.map(function (childNode) {
              return childNode.element;
            }).reduce(function (left, right) {
              if (!left) {
                return right;
              }

              var leftZ = parseInt(window.getComputedStyle(left, '').zIndex, 10);
              var rightZ = parseInt(window.getComputedStyle(right, '').zIndex, 10);

              if (!isNaN(leftZ) && !isNaN(rightZ)) {
                return leftZ > rightZ ? left : right;
              }

              throw new Error('Capturing backbutton-handler is failure.');
            }, null);
          }
        }
      }
    }]);

    return DeviceBackButtonDispatcher;
  })();

  ons._deviceBackButtonDispatcher = new DeviceBackButtonDispatcher();

  window.addEventListener('DOMContentLoaded', function () {
    ons._deviceBackButtonDispatcher.enable();
  });
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

(function (ons) {
  'use strict';

  ons._readyLock = new DoorLock();
  ons._config = {
    autoStatusBarFill: true,
    animationsDisabled: false
  };

  waitDeviceReady();

  /**
   * @return {Boolean}
   */
  ons.isReady = function () {
    return !ons._readyLock.isLocked();
  };

  /**
   * @return {Boolean}
   */
  ons.isWebView = function () {
    if (document.readyState === 'loading' || document.readyState == 'uninitialized') {
      throw new Error('isWebView() method is available after dom contents loaded.');
    }

    return !!(window.cordova || window.phonegap || window.PhoneGap);
  };

  /**
   * @param {Function} callback
   */
  ons.ready = function (callback) {
    if (ons.isReady()) {
      callback();
    } else {
      ons._readyLock.waitUnlock(callback);
    }
  };

  /**
   * @param {Function} listener
   */
  ons.setDefaultDeviceBackButtonListener = function (listener) {
    ons._defaultDeviceBackButtonHandler.setListener(listener);
  };

  /**
   * Disable this framework to handle cordova "backbutton" event.
   */
  ons.disableDeviceBackButtonHandler = function () {
    ons._deviceBackButtonDispatcher.disable();
  };

  /**
   * Enable this framework to handle cordova "backbutton" event.
   */
  ons.enableDeviceBackButtonHandler = function () {
    ons._deviceBackButtonDispatcher.enable();
  };

  /**
   * Enable status bar fill feature on iOS7 and above.
   */
  ons.enableAutoStatusBarFill = function () {
    if (ons.isReady()) {
      throw new Error('This method must be called before ons.isReady() is true.');
    }
    ons._config.autoStatusBarFill = true;
  };

  /**
   * Disable status bar fill feature on iOS7 and above.
   */
  ons.disableAutoStatusBarFill = function () {
    if (ons.isReady()) {
      throw new Error('This method must be called before ons.isReady() is true.');
    }
    ons._config.autoStatusBarFill = false;
  };

  /**
   * Disable all animations. Could be handy for testing and older devices.
   */
  ons.disableAnimations = function () {
    ons._config.animationsDisabled = true;
  };

  /**
   * Enable animations (default).
   */
  ons.enableAnimations = function () {
    ons._config.animationsDisabled = false;
  };

  /**
   * @param {String} page
   * @param {Object} [options]
   * @param {Function} [options.link]
   * @return {Promise}
   */
  ons._createPopoverOriginal = function (page, options) {
    options = options || {};

    if (!page) {
      throw new Error('Page url must be defined.');
    }

    return ons._internal.getPageHTMLAsync(page).then(function (html) {
      html = html.match(/<ons-popover/gi) ? '<div>' + html + '</div>' : '<ons-popover>' + html + '</ons-popover>';
      var div = ons._util.createElement('<div>' + html + '</div>');

      var popover = div.querySelector('ons-popover');
      CustomElements.upgrade(popover);
      document.body.appendChild(popover);

      if (options.link instanceof Function) {
        options.link(popover);
      }

      return popover;
    });
  };

  /**
   * @param {String} page
   * @param {Object} [options]
   * @return {Promise}
   */
  ons.createPopover = ons._createPopoverOriginal;

  /**
   * @param {String} page
   * @param {Object} [options]
   * @param {Function} [options.link]
   * @return {Promise}
   */
  ons._createDialogOriginal = function (page, options) {
    options = options || {};

    if (!page) {
      throw new Error('Page url must be defined.');
    }

    return ons._internal.getPageHTMLAsync(page).then(function (html) {
      html = html.match(/<ons-dialog/gi) ? '<div>' + html + '</div>' : '<ons-dialog>' + html + '</ons-dialog>';
      var div = ons._util.createElement('<div>' + html + '</div>');

      var dialog = div.querySelector('ons-dialog');
      CustomElements.upgrade(dialog);
      document.body.appendChild(dialog);

      if (options.link instanceof Function) {
        options.link(dialog);
      }

      return dialog;
    });
  };

  /**
   * @param {String} page
   * @param {Object} [options]
   * @return {Promise}
   */
  ons.createDialog = ons._createDialogOriginal;

  /**
   * @param {String} page
   * @param {Object} [options]
   * @param {Function} [options.link]
   * @return {Promise}
   */
  ons._createAlertDialogOriginal = function (page, options) {
    options = options || {};

    if (!page) {
      throw new Error('Page url must be defined.');
    }

    return ons._internal.getPageHTMLAsync(page).then(function (html) {
      html = html.match(/<ons-alert-dialog/gi) ? '<div>' + html + '</div>' : '<ons-alert-dialog>' + html + '</ons-alert-dialog>';
      var div = ons._util.createElement('<div>' + html + '</div>');

      var alertDialog = div.querySelector('ons-alert-dialog');
      CustomElements.upgrade(alertDialog);
      document.body.appendChild(alertDialog);

      if (options.link instanceof Function) {
        options.link(alertDialog);
      }

      return alertDialog;
    });
  };

  /**
   * @param {String} page
   * @param {Object} [options]
   * @param {Function} [options.link]
   * @return {Promise}
   */
  ons.createAlertDialog = ons._createAlertDialogOriginal;

  /**
   * @param {String} page
   * @param {Function} link
   */
  ons._resolveLoadingPlaceholderOriginal = function (page, link) {
    var elements = ons._util.arrayFrom(window.document.querySelectorAll('[ons-loading-placeholder]'));

    if (elements.length > 0) {
      elements.filter(function (element) {
        return !element.getAttribute('page');
      }).forEach(function (element) {
        element.setAttribute('ons-loading-placeholder', page);
        ons._resolveLoadingPlaceholder(element, page, link);
      });
    } else {
      throw new Error('No ons-loading-placeholder exists.');
    }
  };

  /**
   * @param {String} page
   */
  ons.resolveLoadingPlaceholder = ons._resolveLoadingPlaceholderOriginal;

  ons._setupLoadingPlaceHolders = function () {
    ons.ready(function () {
      var elements = ons._util.arrayFrom(window.document.querySelectorAll('[ons-loading-placeholder]'));

      elements.forEach(function (element) {
        var page = element.getAttribute('ons-loading-placeholder');
        if (typeof page === 'string') {
          ons._resolveLoadingPlaceholder(element, page);
        }
      });
    });
  };

  ons._resolveLoadingPlaceholder = function (element, page, link) {
    link = link || function (element, done) {
      done();
    };
    ons._internal.getPageHTMLAsync(page).then(function (html) {

      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }

      var contentElement = ons._util.createElement('<div>' + html + '</div>');
      contentElement.style.display = 'none';

      element.appendChild(contentElement);

      link(contentElement, function () {
        contentElement.style.display = '';
      });
    })['catch'](function (error) {
      throw new Error('Unabled to resolve placeholder: ' + error);
    });
  };

  function waitDeviceReady() {
    var unlockDeviceReady = ons._readyLock.lock();
    window.addEventListener('DOMContentLoaded', function () {
      if (ons.isWebView()) {
        window.document.addEventListener('deviceready', unlockDeviceReady, false);
      } else {
        unlockDeviceReady();
      }
    }, false);
  }
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

(function (ons) {
  'use strict';

  var util = ons._util = ons._util || {};

  /**
   * @param {Element} element
   * @param {String/Function} query dot class name or node name or matcher function.
   * @return {HTMLElement/null}
   */
  util.findChild = function (element, query) {
    var match = query instanceof Function ? query : query.substr(0, 1) === '.' ? function (node) {
      return node.classList.contains(query.substr(1));
    } : function (node) {
      return node.nodeName.toLowerCase() === query;
    };

    for (var i = 0; i < element.children.length; i++) {
      var node = element.children[i];
      if (match(node)) {
        return node;
      }
    }
    return null;
  };

  /**
   * @param {Element} element
   * @param {String} query dot class name or node name.
   * @return {HTMLElement/null}
   */
  util.findParent = function (element, query) {
    var match = query.substr(0, 1) === '.' ? function (node) {
      return node.classList.contains(query.substr(1));
    } : function (node) {
      return node.nodeName.toLowerCase() === query;
    };

    var parent = element.parentNode;
    for (;;) {
      if (!parent) {
        return null;
      }
      if (match(parent)) {
        return parent;
      }
      parent = parent.parentNode;
    }
  };

  /**
   * @param {Element} element
   * @return {boolean}
   */
  util.isAttached = function (element) {
    while (document.documentElement !== element) {
      if (!element) {
        return false;
      }
      element = element.parentNode;
    }
    return true;
  };

  /**
   * @param {Element} element
   * @return {boolean}
   */
  util.hasAnyComponentAsParent = function (element) {
    while (element && document.documentElement !== element) {
      element = element.parentNode;
      if (element && element.nodeName.toLowerCase().match(/(ons-navigator|ons-tabbar|ons-sliding-menu|ons-split-view)/)) {
        return true;
      }
    }
    return false;
  };

  /**
   * @param {Element} element
   * @param {String} action to propagate
   */
  util.propagateAction = function (element, action) {
    for (var i = 0; i < element.childNodes.length; i++) {
      var child = element.childNodes[i];
      if (child[action]) {
        child[action]();
      } else {
        ons._util.propagateAction(child, action);
      }
    }
  };

  /**
   * @param {String} html
   * @return {Element}
   */
  util.createElement = function (html) {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;

    if (wrapper.children.length > 1) {
      throw new Error('"html" must be one wrapper element.');
    }

    return wrapper.children[0];
  };

  /**
   * @param {String} html
   * @return {HTMLFragment}
   */
  util.createFragment = function (html) {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    var fragment = document.createDocumentFragment();

    if (wrapper.firstChild) {
      fragment.appendChild(wrapper.firstChild);
    }

    return fragment;
  };

  /*
   * @param {Object} dst Destination object.
   * @param {...Object} src Source object(s).
   * @returns {Object} Reference to `dst`.
   */
  util.extend = function (dst) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    for (var i = 0; i < args.length; i++) {
      if (args[i]) {
        var keys = Object.keys(args[i]);
        for (var j = 0; j < keys.length; j++) {
          var key = keys[j];
          dst[key] = args[i][key];
        }
      }
    }

    return dst;
  };

  /**
   * @param {Object} arrayLike
   * @return {Array}
   */
  util.arrayFrom = function (arrayLike) {
    var result = [];
    for (var i = 0; i < arrayLike.length; i++) {
      result.push(arrayLike[i]);
    }
    return result;
  };

  /**
   * @param {String} jsonString
   * @param {Object} [failSafe]
   * @return {Object}
   */
  util.parseJSONObjectSafely = function (jsonString) {
    var failSafe = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    try {
      var result = JSON.parse('' + jsonString);
      if (typeof result === 'object' && result !== null) {
        return result;
      }
    } catch (e) {
      return failSafe;
    }
    return failSafe;
  };

  /**
   * @param {Element} element
   * @param {String} eventName
   * @param {Object} [detail]
   * @return {CustomEvent}
   */
  util.triggerElementEvent = function (target, eventName) {
    var detail = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var event = new CustomEvent(eventName, {
      bubbles: true,
      cancelable: true,
      detail: detail
    });

    Object.keys(detail).forEach(function (key) {
      event[key] = detail[key];
    });

    target.dispatchEvent(event);

    return event;
  };
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (ons) {
  'use strict';

  var ModalAnimator = (function () {

    /**
     * @param {Object} options
     * @param {String} options.timing
     * @param {Number} options.duration
     * @param {Number} options.delay
     */

    function ModalAnimator(options) {
      _classCallCheck(this, ModalAnimator);

      this.delay = 0;
      this.duration = 0.2;
      options = options || {};

      this.timing = options.timing || this.timing;
      this.duration = options.duration !== undefined ? options.duration : this.duration;
      this.delay = options.delay !== undefined ? options.delay : this.delay;
    }

    /**
     * @param {HTMLElement} modal
     * @param {Function} callback
     */

    _createClass(ModalAnimator, [{
      key: 'show',
      value: function show(modal, callback) {
        callback();
      }

      /**
       * @param {HTMLElement} modal
       * @param {Function} callback
       */
    }, {
      key: 'hide',
      value: function hide(modal, callback) {
        callback();
      }
    }]);

    return ModalAnimator;
  })();

  ons._internal = ons._internal || {};
  ons._internal.ModalAnimator = ModalAnimator;
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (ons) {
  'use strict';

  var util = ons._util;

  var SplitterAnimator = (function () {
    function SplitterAnimator() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _classCallCheck(this, SplitterAnimator);

      options = ons._util.extend({
        timing: 'linear',
        duration: '0.3',
        delay: '0'
      }, options || {});

      this._timing = options.timing;
      this._duration = options.duration;
      this._delay = options.delay;
    }

    _createClass(SplitterAnimator, [{
      key: 'layoutOnOpen',
      value: function layoutOnOpen() {}
    }, {
      key: 'layoutOnClose',
      value: function layoutOnClose() {}
    }, {
      key: 'translate',
      value: function translate(distance) {}
    }, {
      key: 'open',
      value: function open(done) {
        done();
      }
    }, {
      key: 'close',
      value: function close(done) {
        done();
      }
    }, {
      key: 'activate',
      value: function activate(contentElement, sideElement, maskElement) {}
    }, {
      key: 'inactivate',
      value: function inactivate() {}
    }, {
      key: 'isActivated',
      value: function isActivated() {
        throw new Error();
      }
    }]);

    return SplitterAnimator;
  })();

  var OverlaySplitterAnimator = (function (_SplitterAnimator) {
    _inherits(OverlaySplitterAnimator, _SplitterAnimator);

    function OverlaySplitterAnimator() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _classCallCheck(this, OverlaySplitterAnimator);

      options = ons._util.extend({
        timing: 'cubic-bezier(.1, .7, .1, 1)',
        duration: '0.3',
        delay: '0'
      }, options || {});

      _get(Object.getPrototypeOf(OverlaySplitterAnimator.prototype), 'constructor', this).call(this, options);
    }

    _createClass(OverlaySplitterAnimator, [{
      key: 'isActivated',
      value: function isActivated() {
        return this._isActivated;
      }
    }, {
      key: 'layoutOnClose',
      value: function layoutOnClose() {
        animit(this._side).queue({
          transform: 'translateX(0%)',
          width: this._side._getWidth()
        }).play();

        this._mask.style.display = 'none';
      }
    }, {
      key: 'layoutOnOpen',
      value: function layoutOnOpen() {
        animit(this._side).queue({
          transform: 'translate3d(' + (this._side._isLeftSide() ? '' : '-') + '100%, 0px, 0px)',
          width: this._side._getWidth()
        }).play();

        this._mask.style.display = 'block';
      }

      /**
       * @param {Element} contentElement
       * @param {Element} sideElement
       * @param {Element} maskElement
       */
    }, {
      key: 'activate',
      value: function activate(contentElement, sideElement, maskElement) {
        this._isActivated = true;
        this._content = contentElement;
        this._side = sideElement;
        this._mask = maskElement;

        this._setupLayout();
      }
    }, {
      key: 'inactivate',
      value: function inactivate() {
        this._isActivated = false;
        this._clearLayout();
        this._content = this._side = this._mask = null;
      }

      /**
       * @param {Number} distance
       */
    }, {
      key: 'translate',
      value: function translate(distance) {
        animit(this._side).queue({
          transform: 'translate3d(' + (this._side._isLeftSide() ? '' : '-') + distance + 'px, 0px, 0px)'
        }).play();
      }
    }, {
      key: '_clearLayout',
      value: function _clearLayout() {
        var side = this._side;
        var mask = this._mask;

        side.style.zIndex = '';
        side.style.right = '';
        side.style.left = '';
        side.style.transform = side.style.webkitTransform = '';
        side.style.transition = side.style.webkitTransition = '';
        side.style.width = '';
        side.style.display = '';

        mask.style.display = 'none';
      }
    }, {
      key: '_setupLayout',
      value: function _setupLayout() {
        var side = this._side;

        side.style.zIndex = 3;
        side.style.display = 'block';

        if (side._isLeftSide()) {
          side.style.left = 'auto';
          side.style.right = '100%';
        } else {
          side.style.left = '100%';
          side.style.right = 'auto';
        }
      }

      /**
       * @param {Function} done
       */
    }, {
      key: 'open',
      value: function open(done) {
        var transform = this._side._isLeftSide() ? 'translate3d(100%, 0px, 0px)' : 'translate3d(-100%, 0px, 0px)';

        animit.runAll(animit(this._side).wait(this._delay).queue({
          transform: transform
        }, {
          duration: this._duration,
          timing: this._timing
        }).queue(function (callback) {
          callback();
          done();
        }), animit(this._mask).wait(this._delay).queue({
          display: 'block'
        }).queue({
          opacity: '1'
        }, {
          duration: this._duration,
          timing: 'linear'
        }));
      }

      /**
       * @param {Function} done
       */
    }, {
      key: 'close',
      value: function close(done) {
        var _this = this;

        animit.runAll(animit(this._side).wait(this._delay).queue({
          transform: 'translate3d(0px, 0px, 0px)'
        }, {
          duration: this._duration,
          timing: this._timing
        }).queue(function (callback) {
          _this._side.style.webkitTransition = '';
          done();
          callback();
        }), animit(this._mask).wait(this._delay).queue({
          opacity: '0'
        }, {
          duration: this._duration,
          timing: 'linear'
        }).queue({
          display: 'none'
        }));
      }
    }]);

    return OverlaySplitterAnimator;
  })(SplitterAnimator);

  ons._internal = ons._internal || {};

  ons._internal.SplitterAnimator = SplitterAnimator;
  ons._internal.OverlaySplitterAnimator = OverlaySplitterAnimator;
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (ons) {
  'use strict';

  var NavigatorTransitionAnimator = (function () {

    /**
     * @param {Object} options
     * @param {String} options.timing
     * @param {Number} options.duration
     * @param {Number} options.delay
     */

    function NavigatorTransitionAnimator(options) {
      _classCallCheck(this, NavigatorTransitionAnimator);

      options = ons._util.extend({
        timing: 'linear',
        duration: '0.4',
        delay: '0'
      }, options || {});

      this.timing = options.timing;
      this.duration = options.duration;
      this.delay = options.delay;
    }

    _createClass(NavigatorTransitionAnimator, [{
      key: 'push',
      value: function push(enterPage, leavePage, callback) {
        callback();
      }
    }, {
      key: 'pop',
      value: function pop(enterPage, leavePage, callback) {
        callback();
      }
    }]);

    return NavigatorTransitionAnimator;
  })();

  var NoneNavigatorTransitionAnimator = (function (_NavigatorTransitionAnimator) {
    _inherits(NoneNavigatorTransitionAnimator, _NavigatorTransitionAnimator);

    function NoneNavigatorTransitionAnimator(options) {
      _classCallCheck(this, NoneNavigatorTransitionAnimator);

      _get(Object.getPrototypeOf(NoneNavigatorTransitionAnimator.prototype), 'constructor', this).call(this, options);
    }

    _createClass(NoneNavigatorTransitionAnimator, [{
      key: 'push',
      value: function push(enterPage, leavePage, callback) {
        callback();
      }
    }, {
      key: 'pop',
      value: function pop(enterPage, leavePage, callback) {
        callback();
      }
    }]);

    return NoneNavigatorTransitionAnimator;
  })(NavigatorTransitionAnimator);

  ons._internal = ons._internal || {};
  ons._internal.NavigatorTransitionAnimator = NavigatorTransitionAnimator;
  ons._internal.NoneNavigatorTransitionAnimator = NoneNavigatorTransitionAnimator;
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (ons) {
  'use strict';

  var PopoverAnimator = (function () {

    /**
     * @param {Object} options
     * @param {String} options.timing
     * @param {Number} options.duration
     * @param {Number} options.delay
     */

    function PopoverAnimator(options) {
      _classCallCheck(this, PopoverAnimator);

      options = ons._util.extend({
        timing: 'cubic-bezier(.1, .7, .4, 1)',
        duration: 0.2,
        delay: 0
      }, options || {});

      this.timing = options.timing;
      this.duration = options.duration;
      this.delay = options.delay;
    }

    _createClass(PopoverAnimator, [{
      key: 'show',
      value: function show(popover, callback) {
        callback();
      }
    }, {
      key: 'hide',
      value: function hide(popover, callback) {
        callback();
      }
    }]);

    return PopoverAnimator;
  })();

  ons._internal = ons._internal || {};
  ons._internal.PopoverAnimator = PopoverAnimator;
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

(function (ons) {
  'use strict';

  ons.platform = {

    /**
     * All elements will be rendered as if the app was running on this platform.
     * @type {String}
     */
    _renderPlatform: null,

    /**
     * Sets the platform used to render the elements. Possible values are: "opera", "firefox", "safari", "chrome", "ie", "android", "blackberry", "ios" or "wp".
     * @param  {string} platform Name of the platform.
     */
    select: function select(platform) {
      ons.platform._renderPlatform = platform.trim().toLowerCase();
    },

    /**
     * @return {Boolean}
     */
    isWebView: function isWebView() {
      return ons.isWebView();
    },

    /**
     * @return {Boolean}
     */
    isIOS: function isIOS() {
      if (ons.platform._renderPlatform) {
        return ons.platform._renderPlatform === 'ios';
      } else {
        return (/iPhone|iPad|iPod/i.test(navigator.userAgent)
        );
      }
    },

    /**
     * @return {Boolean}
     */
    isAndroid: function isAndroid() {
      if (ons.platform._renderPlatform) {
        return ons.platform._renderPlatform === 'android';
      } else {
        return (/Android/i.test(navigator.userAgent)
        );
      }
    },

    /**
     * @return {Boolean}
     */
    isAndroidPhone: function isAndroidPhone() {
      return (/Android/i.test(navigator.userAgent) && /Mobile/i.test(navigator.userAgent)
      );
    },

    /**
     * @return {Boolean}
     */
    isAndroidTablet: function isAndroidTablet() {
      return (/Android/i.test(navigator.userAgent) && !/Mobile/i.test(navigator.userAgent)
      );
    },

    /**
     * @return {Boolean}
     */
    isWP: function isWP() {
      if (ons.platform._renderPlatform) {
        return ons.platform._renderPlatform === 'wp';
      } else {
        return (/Windows Phone|IEMobile|WPDesktop/i.test(navigator.userAgent)
        );
      }
    },

    /**
     * @return {Boolean}
     */
    isIPhone: function isIPhone() {
      return (/iPhone/i.test(navigator.userAgent)
      );
    },

    /**
     * @return {Boolean}
     */
    isIPad: function isIPad() {
      return (/iPad/i.test(navigator.userAgent)
      );
    },

    /**
     * @return {Boolean}
     */
    isIPod: function isIPod() {
      return (/iPod/i.test(navigator.userAgent)
      );
    },

    /**
     * @return {Boolean}
     */
    isBlackBerry: function isBlackBerry() {
      if (ons.platform._renderPlatform) {
        return ons.platform._renderPlatform === 'blackberry';
      } else {
        return (/BlackBerry|RIM Tablet OS|BB10/i.test(navigator.userAgent)
        );
      }
    },

    /**
     * @return {Boolean}
     */
    isOpera: function isOpera() {
      if (ons.platform._renderPlatform) {
        return ons.platform._renderPlatform === 'opera';
      } else {
        return !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
      }
    },

    /**
     * @return {Boolean}
     */
    isFirefox: function isFirefox() {
      if (ons.platform._renderPlatform) {
        return ons.platform._renderPlatform === 'firefox';
      } else {
        return typeof InstallTrigger !== 'undefined';
      }
    },

    /**
     * @return {Boolean}
     */
    isSafari: function isSafari() {
      if (ons.platform._renderPlatform) {
        return ons.platform._renderPlatform === 'safari';
      } else {
        return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
      }
    },

    /**
     * @return {Boolean}
     */
    isChrome: function isChrome() {
      if (ons.platform._renderPlatform) {
        return ons.platform._renderPlatform === 'chrome';
      } else {
        return !!window.chrome && !(!!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0);
      }
    },

    /**
     * @return {Boolean}
     */
    isIE: function isIE() {
      if (ons.platform._renderPlatform) {
        return ons.platform._renderPlatform === 'ie';
      } else {
        return false || !!document.documentMode;
      }
    },

    /**
     * @return {Boolean}
     */
    isIOS7above: function isIOS7above() {
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        var ver = (navigator.userAgent.match(/\b[0-9]+_[0-9]+(?:_[0-9]+)?\b/) || [''])[0].replace(/_/g, '.');
        return parseInt(ver.split('.')[0]) >= 7;
      }
      return false;
    },

    /**
     * @return {String}
     */
    getMobileOS: function getMobileOS() {
      if (this.isAndroid()) {
        return 'android';
      } else if (this.isIOS()) {
        return 'ios';
      } else if (this.isWP()) {
        return 'wp';
      } else {
        return 'other';
      }
    },

    /**
     * @return {String}
     */
    getIOSDevice: function getIOSDevice() {
      if (this.isIPhone()) {
        return 'iphone';
      } else if (this.isIPad()) {
        return 'ipad';
      } else if (this.isIPod()) {
        return 'ipod';
      } else {
        return 'na';
      }
    }
  };
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (ons) {
  'use strict';

  var AlertDialogAnimator = (function () {
    function AlertDialogAnimator() {
      var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _ref$timing = _ref.timing;
      var timing = _ref$timing === undefined ? 'linear' : _ref$timing;
      var _ref$delay = _ref.delay;
      var delay = _ref$delay === undefined ? 0 : _ref$delay;
      var _ref$duration = _ref.duration;
      var duration = _ref$duration === undefined ? 0.2 : _ref$duration;

      _classCallCheck(this, AlertDialogAnimator);

      this.timing = timing;
      this.delay = delay;
      this.duration = duration;
    }

    /**
     * Android style animator for alert dialog.
     */

    /**
     * @param {HTMLElement} dialog
     * @param {Function} done
     */

    _createClass(AlertDialogAnimator, [{
      key: 'show',
      value: function show(dialog, done) {
        done();
      }

      /**
       * @param {HTMLElement} dialog
       * @param {Function} done
       */
    }, {
      key: 'hide',
      value: function hide(dialog, done) {
        done();
      }
    }]);

    return AlertDialogAnimator;
  })();

  var AndroidAlertDialogAnimator = (function (_AlertDialogAnimator) {
    _inherits(AndroidAlertDialogAnimator, _AlertDialogAnimator);

    function AndroidAlertDialogAnimator() {
      var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _ref2$timing = _ref2.timing;
      var timing = _ref2$timing === undefined ? 'cubic-bezier(.1, .7, .4, 1)' : _ref2$timing;
      var _ref2$duration = _ref2.duration;
      var duration = _ref2$duration === undefined ? 0.2 : _ref2$duration;
      var _ref2$delay = _ref2.delay;
      var delay = _ref2$delay === undefined ? 0 : _ref2$delay;

      _classCallCheck(this, AndroidAlertDialogAnimator);

      _get(Object.getPrototypeOf(AndroidAlertDialogAnimator.prototype), 'constructor', this).call(this, { duration: duration, timing: timing, delay: delay });
    }

    /**
     * iOS style animator for alert dialog.
     */

    /**
     * @param {Object} dialog
     * @param {Function} callback
     */

    _createClass(AndroidAlertDialogAnimator, [{
      key: 'show',
      value: function show(dialog, callback) {
        callback = callback ? callback : function () {};

        animit.runAll(animit(dialog._mask).queue({
          opacity: 0
        }).wait(this.delay).queue({
          opacity: 1.0
        }, {
          duration: this.duration,
          timing: this.timing
        }), animit(dialog._dialog).queue({
          css: {
            transform: 'translate3d(-50%, -50%, 0) scale3d(0.9, 0.9, 1.0)',
            opacity: 0.0
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3d(-50%, -50%, 0) scale3d(1.0, 1.0, 1.0)',
            opacity: 1.0
          },
          duration: this.duration,
          timing: this.timing
        }).resetStyle().queue(function (done) {
          callback();
          done();
        }));
      }

      /**
       * @param {Object} dialog
       * @param {Function} callback
       */
    }, {
      key: 'hide',
      value: function hide(dialog, callback) {
        callback = callback ? callback : function () {};

        animit.runAll(animit(dialog._mask).queue({
          opacity: 1.0
        }).wait(this.delay).queue({
          opacity: 0
        }, {
          duration: this.duration,
          timing: this.timing
        }), animit(dialog._dialog).queue({
          css: {
            transform: 'translate3d(-50%, -50%, 0) scale3d(1.0, 1.0, 1.0)',
            opacity: 1.0
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3d(-50%, -50%, 0) scale3d(0.9, 0.9, 1.0)',
            opacity: 0.0
          },
          duration: this.duration,
          timing: this.timing
        }).resetStyle().queue(function (done) {
          callback();
          done();
        }));
      }
    }]);

    return AndroidAlertDialogAnimator;
  })(AlertDialogAnimator);

  var IOSAlertDialogAnimator = (function (_AlertDialogAnimator2) {
    _inherits(IOSAlertDialogAnimator, _AlertDialogAnimator2);

    function IOSAlertDialogAnimator() {
      var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _ref3$timing = _ref3.timing;
      var timing = _ref3$timing === undefined ? 'cubic-bezier(.1, .7, .4, 1)' : _ref3$timing;
      var _ref3$duration = _ref3.duration;
      var duration = _ref3$duration === undefined ? 0.2 : _ref3$duration;
      var _ref3$delay = _ref3.delay;
      var delay = _ref3$delay === undefined ? 0 : _ref3$delay;

      _classCallCheck(this, IOSAlertDialogAnimator);

      _get(Object.getPrototypeOf(IOSAlertDialogAnimator.prototype), 'constructor', this).call(this, { duration: duration, timing: timing, delay: delay });
    }

    /*
     * @param {Object} dialog
     * @param {Function} callback
     */

    _createClass(IOSAlertDialogAnimator, [{
      key: 'show',
      value: function show(dialog, callback) {
        callback = callback ? callback : function () {};

        animit.runAll(animit(dialog._mask).queue({
          opacity: 0
        }).wait(this.delay).queue({
          opacity: 1.0
        }, {
          duration: this.duration,
          timing: this.timing
        }), animit(dialog._dialog).queue({
          css: {
            transform: 'translate3d(-50%, -50%, 0) scale3d(1.3, 1.3, 1.0)',
            opacity: 0.0
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3d(-50%, -50%, 0) scale3d(1.0, 1.0, 1.0)',
            opacity: 1.0
          },
          duration: this.duration,
          timing: this.timing
        }).resetStyle().queue(function (done) {
          callback();
          done();
        }));
      }

      /**
       * @param {Object} dialog
       * @param {Function} callback
       */
    }, {
      key: 'hide',
      value: function hide(dialog, callback) {
        callback = callback ? callback : function () {};

        animit.runAll(animit(dialog._mask).queue({
          opacity: 1.0
        }).wait(this.delay).queue({
          opacity: 0
        }, {
          duration: this.duration,
          timing: this.timing
        }), animit(dialog._dialog).queue({
          css: {
            opacity: 1.0
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            opacity: 0.0
          },
          duration: this.duration,
          timing: this.timing
        }).resetStyle().queue(function (done) {
          callback();
          done();
        }));
      }
    }]);

    return IOSAlertDialogAnimator;
  })(AlertDialogAnimator);

  ons._internal = ons._internal || {};
  ons._internal.AlertDialogAnimator = AlertDialogAnimator;
  ons._internal.AndroidAlertDialogAnimator = AndroidAlertDialogAnimator;
  ons._internal.IOSAlertDialogAnimator = IOSAlertDialogAnimator;
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (ons) {
  'use strict';

  var AnimatorFactory = (function () {

    /**
     * @param {Object} opts
     * @param {Object} opts.animators The dictionary for animator classes
     * @param {Function} opts.baseClass The base class of animators
     * @param {String} [opts.baseClassName] The name of the base class of animators
     * @param {String} [opts.defaultAnimation] The default animation name
     * @param {Object} [opts.defaultAnimationOptions] The default animation options
     */

    function AnimatorFactory(opts) {
      _classCallCheck(this, AnimatorFactory);

      this._animators = opts.animators;
      this._baseClass = opts.baseClass;
      this._baseClassName = opts.baseClassName || opts.baseClass.name;
      this._animation = opts.defaultAnimation || 'default';
      this._animationOptions = opts.defaultAnimationOptions || {};

      if (!this._animators[this._animation]) {
        throw new Error('No such animation: ' + this._animation);
      }
    }

    /**
     * @param {String} jsonString
     * @return {Object/null}
     */

    _createClass(AnimatorFactory, [{
      key: 'setAnimationOptions',

      /**
       * @param {Object} options
       */
      value: function setAnimationOptions(options) {
        this._animationOptions = options;
      }

      /**
       * @param {Object} options
       * @param {String} [options.animation] The animation name
       * @param {Object} [options.animationOptions] The animation options
       * @param {Object} defaultAnimator The default animator instance
       * @return {Object} An animator instance
       */
    }, {
      key: 'newAnimator',
      value: function newAnimator(options, defaultAnimator) {
        options = options || {};

        var animator = null;

        if (options.animation instanceof this._baseClass) {
          return options.animation;
        }

        var Animator = null;

        if (typeof options.animation === 'string') {
          Animator = this._animators[options.animation];
        }

        if (!Animator && defaultAnimator) {
          animator = defaultAnimator;
        } else {
          Animator = Animator || this._animators[this._animation];

          var animationOpts = ons._util.extend({}, this._animationOptions, options.animationOptions || {}, ons._config.animationsDisabled ? { duration: 0, delay: 0 } : {});

          animator = new Animator(animationOpts);
        }

        if (!(animator instanceof this._baseClass)) {
          throw new Error('"animator" is not an instance of ' + this._baseClassName + '.');
        }

        return animator;
      }
    }], [{
      key: 'parseAnimationOptionsString',
      value: function parseAnimationOptionsString(jsonString) {
        try {
          if (typeof jsonString === 'string') {
            var result = JSON.parse(jsonString);
            if (typeof result === 'object' && result !== null) {
              return result;
            } else {
              console.error('"animation-options" attribute must be a JSON object string: ' + jsonString);
            }
          }
          return {};
        } catch (e) {
          console.error('"animation-options" attribute must be a JSON object string: ' + jsonString);
          return {};
        }
      }
    }]);

    return AnimatorFactory;
  })();

  ons._internal = ons._internal || {};
  ons._internal.AnimatorFactory = AnimatorFactory;
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _get = function get(_x5, _x6, _x7) { var _again = true; _function: while (_again) { var object = _x5, property = _x6, receiver = _x7; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x5 = parent; _x6 = property; _x7 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (ons) {
  'use strict';

  var DialogAnimator = (function () {
    function DialogAnimator() {
      var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _ref$timing = _ref.timing;
      var timing = _ref$timing === undefined ? 'linear' : _ref$timing;
      var _ref$delay = _ref.delay;
      var delay = _ref$delay === undefined ? 0 : _ref$delay;
      var _ref$duration = _ref.duration;
      var duration = _ref$duration === undefined ? 0.2 : _ref$duration;

      _classCallCheck(this, DialogAnimator);

      this.timing = timing;
      this.delay = delay;
      this.duration = duration;
    }

    /**
     * Android style animator for dialog.
     */

    /**
     * @param {HTMLElement} dialog
     * @param {Function} done
     */

    _createClass(DialogAnimator, [{
      key: 'show',
      value: function show(dialog, done) {
        done();
      }

      /**
       * @param {HTMLElement} dialog
       * @param {Function} done
       */
    }, {
      key: 'hide',
      value: function hide(dialog, done) {
        done();
      }
    }]);

    return DialogAnimator;
  })();

  var AndroidDialogAnimator = (function (_DialogAnimator) {
    _inherits(AndroidDialogAnimator, _DialogAnimator);

    function AndroidDialogAnimator() {
      var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _ref2$timing = _ref2.timing;
      var timing = _ref2$timing === undefined ? 'ease-in-out' : _ref2$timing;
      var _ref2$delay = _ref2.delay;
      var delay = _ref2$delay === undefined ? 0 : _ref2$delay;
      var _ref2$duration = _ref2.duration;
      var duration = _ref2$duration === undefined ? 0.3 : _ref2$duration;

      _classCallCheck(this, AndroidDialogAnimator);

      _get(Object.getPrototypeOf(AndroidDialogAnimator.prototype), 'constructor', this).call(this, { timing: timing, delay: delay, duration: duration });
    }

    /**
     * iOS style animator for dialog.
     */

    /**
     * @param {Object} dialog
     * @param {Function} callback
     */

    _createClass(AndroidDialogAnimator, [{
      key: 'show',
      value: function show(dialog, callback) {
        callback = callback ? callback : function () {};

        animit.runAll(animit(dialog._mask).queue({
          opacity: 0
        }).wait(this.delay).queue({
          opacity: 1.0
        }, {
          duration: this.duration,
          timing: this.timing
        }), animit(dialog._dialog).queue({
          css: {
            transform: 'translate3d(-50%, -60%, 0)',
            opacity: 0.0
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3d(-50%, -50%, 0)',
            opacity: 1.0
          },
          duration: this.duration,
          timing: this.timing
        }).resetStyle().queue(function (done) {
          callback();
          done();
        }));
      }

      /**
       * @param {Object} dialog
       * @param {Function} callback
       */
    }, {
      key: 'hide',
      value: function hide(dialog, callback) {
        callback = callback ? callback : function () {};

        animit.runAll(animit(dialog._mask).queue({
          opacity: 1.0
        }).wait(this.delay).queue({
          opacity: 0
        }, {
          duration: this.duration,
          timing: this.timing
        }), animit(dialog._dialog).queue({
          css: {
            transform: 'translate3d(-50%, -50%, 0)',
            opacity: 1.0
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3d(-50%, -60%, 0)',
            opacity: 0.0
          },
          duration: this.duration,
          timing: this.timing
        }).resetStyle().queue(function (done) {
          callback();
          done();
        }));
      }
    }]);

    return AndroidDialogAnimator;
  })(DialogAnimator);

  var IOSDialogAnimator = (function (_DialogAnimator2) {
    _inherits(IOSDialogAnimator, _DialogAnimator2);

    function IOSDialogAnimator() {
      var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _ref3$timing = _ref3.timing;
      var timing = _ref3$timing === undefined ? 'ease-in-out' : _ref3$timing;
      var _ref3$delay = _ref3.delay;
      var delay = _ref3$delay === undefined ? 0 : _ref3$delay;
      var _ref3$duration = _ref3.duration;
      var duration = _ref3$duration === undefined ? 0.3 : _ref3$duration;

      _classCallCheck(this, IOSDialogAnimator);

      _get(Object.getPrototypeOf(IOSDialogAnimator.prototype), 'constructor', this).call(this, { timing: timing, delay: delay, duration: duration });
    }

    /**
     * Slide animator for dialog.
     */

    /**
     * @param {Object} dialog
     * @param {Function} callback
     */

    _createClass(IOSDialogAnimator, [{
      key: 'show',
      value: function show(dialog, callback) {
        callback = callback ? callback : function () {};

        animit.runAll(animit(dialog._mask).queue({
          opacity: 0
        }).wait(this.delay).queue({
          opacity: 1.0
        }, {
          duration: this.duration,
          timing: this.timing
        }), animit(dialog._dialog).queue({
          css: {
            transform: 'translate3d(-50%, 300%, 0)'
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3d(-50%, -50%, 0)'
          },
          duration: this.duration,
          timing: this.timing
        }).resetStyle().queue(function (done) {
          callback();
          done();
        }));
      }

      /**
       * @param {Object} dialog
       * @param {Function} callback
       */
    }, {
      key: 'hide',
      value: function hide(dialog, callback) {
        callback = callback ? callback : function () {};

        animit.runAll(animit(dialog._mask).queue({
          opacity: 1.0
        }).wait(this.delay).queue({
          opacity: 0
        }, {
          duration: this.duration,
          timing: this.timing
        }), animit(dialog._dialog).queue({
          css: {
            transform: 'translate3d(-50%, -50%, 0)'
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3d(-50%, 300%, 0)'
          },
          duration: this.duration,
          timing: this.timing
        }).resetStyle().queue(function (done) {
          callback();
          done();
        }));
      }
    }]);

    return IOSDialogAnimator;
  })(DialogAnimator);

  var SlideDialogAnimator = (function (_DialogAnimator3) {
    _inherits(SlideDialogAnimator, _DialogAnimator3);

    function SlideDialogAnimator() {
      var _ref4 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _ref4$timing = _ref4.timing;
      var timing = _ref4$timing === undefined ? 'cubic-bezier(.1, .7, .4, 1)' : _ref4$timing;
      var _ref4$delay = _ref4.delay;
      var delay = _ref4$delay === undefined ? 0 : _ref4$delay;
      var _ref4$duration = _ref4.duration;
      var duration = _ref4$duration === undefined ? 0.2 : _ref4$duration;

      _classCallCheck(this, SlideDialogAnimator);

      _get(Object.getPrototypeOf(SlideDialogAnimator.prototype), 'constructor', this).call(this, { timing: timing, delay: delay, duration: duration });
    }

    /**
     * @param {Object} dialog
     * @param {Function} callback
     */

    _createClass(SlideDialogAnimator, [{
      key: 'show',
      value: function show(dialog, callback) {
        callback = callback ? callback : function () {};

        animit.runAll(animit(dialog._mask).queue({
          opacity: 0
        }).wait(this.delay).queue({
          opacity: 1.0
        }, {
          duration: this.duration,
          timing: this.timing
        }), animit(dialog._dialog).queue({
          css: {
            transform: 'translate3D(-50%, -350%, 0)'
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3D(-50%, -50%, 0)'
          },
          duration: this.duration,
          timing: this.timing
        }).resetStyle().queue(function (done) {
          callback();
          done();
        }));
      }

      /**
       * @param {Object} dialog
       * @param {Function} callback
       */
    }, {
      key: 'hide',
      value: function hide(dialog, callback) {
        callback = callback ? callback : function () {};

        animit.runAll(animit(dialog._mask).queue({
          opacity: 1.0
        }).wait(this.delay).queue({
          opacity: 0
        }, {
          duration: this.duration,
          timing: this.timing
        }), animit(dialog._dialog).queue({
          css: {
            transform: 'translate3D(-50%, -50%, 0)'
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3D(-50%, -350%, 0)'
          },
          duration: this.duration,
          timing: this.timing
        }).resetStyle().queue(function (done) {
          callback();
          done();
        }));
      }
    }]);

    return SlideDialogAnimator;
  })(DialogAnimator);

  ons._internal = ons._internal || {};
  ons._internal.DialogAnimator = DialogAnimator;
  ons._internal.AndroidDialogAnimator = AndroidDialogAnimator;
  ons._internal.IOSDialogAnimator = IOSDialogAnimator;
  ons._internal.SlideDialogAnimator = SlideDialogAnimator;
})(window.ons = window.ons || {});

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function (ons) {
  'use strict';

  var ModalAnimator = ons._internal.ModalAnimator;

  /**
   * iOS style animator for dialog.
   */

  var FadeModalAnimator = (function (_ModalAnimator) {
    _inherits(FadeModalAnimator, _ModalAnimator);

    function FadeModalAnimator(options) {
      _classCallCheck(this, FadeModalAnimator);

      options.timing = options.timing || 'linear';
      options.duration = options.duration || '0.3';
      options.delay = options.delay || 0;

      _get(Object.getPrototypeOf(FadeModalAnimator.prototype), 'constructor', this).call(this, options);
    }

    /**
     * @param {HTMLElement} modal
     * @param {Function} callback
     */

    _createClass(FadeModalAnimator, [{
      key: 'show',
      value: function show(modal, callback) {
        callback = callback ? callback : function () {};

        animit(modal).queue({
          opacity: 0
        }).wait(this.delay).queue({
          opacity: 1.0
        }, {
          duration: this.duration,
          timing: this.timing
        }).queue(function (done) {
          callback();
          done();
        }).play();
      }

      /**
       * @param {HTMLElement} modal
       * @param {Function} callback
       */
    }, {
      key: 'hide',
      value: function hide(modal, callback) {
        callback = callback ? callback : function () {};

        animit(modal).queue({
          opacity: 1
        }).wait(this.delay).queue({
          opacity: 0
        }, {
          duration: this.duration,
          timing: this.timing
        }).queue(function (done) {
          callback();
          done();
        }).play();
      }
    }]);

    return FadeModalAnimator;
  })(ModalAnimator);

  ons._internal = ons._internal || {};
  ons._internal.FadeModalAnimator = FadeModalAnimator;
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function (ons) {
  'use strict';

  var NavigatorTransitionAnimator = ons._internal.NavigatorTransitionAnimator;

  /**
   * Fade-in screen transition.
   */

  var FadeNavigatorTransitionAnimator = (function (_NavigatorTransitionAnimator) {
    _inherits(FadeNavigatorTransitionAnimator, _NavigatorTransitionAnimator);

    function FadeNavigatorTransitionAnimator(options) {
      _classCallCheck(this, FadeNavigatorTransitionAnimator);

      options = ons._util.extend({
        timing: 'linear',
        duration: '0.4',
        delay: '0'
      }, options || {});

      _get(Object.getPrototypeOf(FadeNavigatorTransitionAnimator.prototype), 'constructor', this).call(this, options);
    }

    /**
     * @param {Object} enterPage
     * @param {Object} leavePage
     * @param {Function} callback
     */

    _createClass(FadeNavigatorTransitionAnimator, [{
      key: 'push',
      value: function push(enterPage, leavePage, callback) {

        animit.runAll(animit([enterPage.element._getContentElement(), enterPage.element._getBackgroundElement()]).queue({
          css: {
            transform: 'translate3D(0, 0, 0)',
            opacity: 0
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3D(0, 0, 0)',
            opacity: 1
          },
          duration: this.duration,
          timing: this.timing
        }).resetStyle().queue(function (done) {
          callback();
          done();
        }), animit(enterPage.element._getToolbarElement()).queue({
          css: {
            transform: 'translate3D(0, 0, 0)',
            opacity: 0
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3D(0, 0, 0)',
            opacity: 1
          },
          duration: this.duration,
          timing: this.timing
        }).resetStyle());
      }

      /**
       * @param {Object} enterPage
       * @param {Object} leavePage
       * @param {Function} done
       */
    }, {
      key: 'pop',
      value: function pop(enterPage, leavePage, callback) {
        animit.runAll(animit([leavePage.element._getContentElement(), leavePage.element._getBackgroundElement()]).queue({
          css: {
            transform: 'translate3D(0, 0, 0)',
            opacity: 1
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3D(0, 0, 0)',
            opacity: 0
          },
          duration: this.duration,
          timing: this.timing
        }).queue(function (done) {
          callback();
          done();
        }), animit(leavePage.element._getToolbarElement()).queue({
          css: {
            transform: 'translate3D(0, 0, 0)',
            opacity: 1
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3D(0, 0, 0)',
            opacity: 0
          },
          duration: this.duration,
          timing: this.timing
        }));
      }
    }]);

    return FadeNavigatorTransitionAnimator;
  })(NavigatorTransitionAnimator);

  ons._internal = ons._internal || {};
  ons._internal.FadeNavigatorTransitionAnimator = FadeNavigatorTransitionAnimator;
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function (ons) {
  'use strict';

  var PopoverAnimator = ons._internal.PopoverAnimator;

  var FadePopoverAnimator = (function (_PopoverAnimator) {
    _inherits(FadePopoverAnimator, _PopoverAnimator);

    function FadePopoverAnimator(options) {
      _classCallCheck(this, FadePopoverAnimator);

      _get(Object.getPrototypeOf(FadePopoverAnimator.prototype), 'constructor', this).call(this, options);
    }

    /**
    * @param {Object} popover
    * @param {Function} callback
    */

    _createClass(FadePopoverAnimator, [{
      key: 'show',
      value: function show(popover, callback) {
        var pop = popover.querySelector('.popover');
        var mask = popover.querySelector('.popover-mask');

        animit.runAll(animit(mask).queue({
          opacity: 0
        }).wait(this.delay).queue({
          opacity: 1.0
        }, {
          duration: this.duration,
          timing: this.timing
        }), animit(pop).queue({
          transform: 'scale3d(1.3, 1.3, 1.0)',
          opacity: 0
        }).wait(this.delay).queue({
          transform: 'scale3d(1.0, 1.0,  1.0)',
          opacity: 1.0
        }, {
          duration: this.duration,
          timing: this.timing
        }).resetStyle().queue(function (done) {
          callback();
          done();
        }));
      }

      /**
      * @param {Object} popover
      * @param {Function} callback
      */
    }, {
      key: 'hide',
      value: function hide(popover, callback) {
        var pop = popover.querySelector('.popover');
        var mask = popover.querySelector('.popover-mask');

        animit.runAll(animit(mask).queue({
          opacity: 1.0
        }).wait(this.delay).queue({
          opacity: 0
        }, {
          duration: this.duration,
          timing: this.timing
        }), animit(pop).queue({
          opacity: 1.0
        }).wait(this.delay).queue({
          opacity: 0
        }, {
          duration: this.duration,
          timing: this.timing
        }).resetStyle().queue(function (done) {
          callback();
          done();
        }));
      }
    }]);

    return FadePopoverAnimator;
  })(PopoverAnimator);

  ons._internal = ons._internal || {};
  ons._internal.FadePopoverAnimator = FadePopoverAnimator;
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function (ons) {
  'use strict';

  var NavigatorTransitionAnimator = ons._internal.NavigatorTransitionAnimator;
  var util = ons._util;

  /**
   * Slide animator for navigator transition like iOS's screen slide transition.
   */

  var IOSSlideNavigatorTransitionAnimator = (function (_NavigatorTransitionAnimator) {
    _inherits(IOSSlideNavigatorTransitionAnimator, _NavigatorTransitionAnimator);

    function IOSSlideNavigatorTransitionAnimator(options) {
      _classCallCheck(this, IOSSlideNavigatorTransitionAnimator);

      options = ons._util.extend({
        duration: 0.4,
        timing: 'cubic-bezier(.1, .7, .1, 1)',
        delay: 0
      }, options || {});

      _get(Object.getPrototypeOf(IOSSlideNavigatorTransitionAnimator.prototype), 'constructor', this).call(this, options);

      this.backgroundMask = ons._util.createElement('\n        <div style="position: absolute; width: 100%; height: 100%;\n          background-color: black; opacity: 0;"></div>\n      ');
    }

    _createClass(IOSSlideNavigatorTransitionAnimator, [{
      key: '_decompose',
      value: function _decompose(page) {
        CustomElements.upgrade(page.element);
        var toolbar = page.element._getToolbarElement();
        CustomElements.upgrade(toolbar);
        var left = toolbar._getToolbarLeftItemsElement();
        var right = toolbar._getToolbarRightItemsElement();

        var excludeBackButtonLabel = function excludeBackButtonLabel(elements) {
          var result = [];

          for (var i = 0; i < elements.length; i++) {
            if (elements[i].nodeName.toLowerCase() === 'ons-back-button') {
              var iconElement = elements[i].querySelector('.ons-back-button__icon');
              if (iconElement) {
                result.push(iconElement);
              }
            } else {
              result.push(elements[i]);
            }
          }

          return result;
        };

        var other = [].concat(left.children.length === 0 ? left : excludeBackButtonLabel(left.children)).concat(right.children.length === 0 ? right : excludeBackButtonLabel(right.children));

        var pageLabels = [toolbar._getToolbarCenterItemsElement(), toolbar._getToolbarBackButtonLabelElement()];

        return {
          pageLabels: pageLabels,
          other: other,
          content: page.element._getContentElement(),
          background: page.element._getBackgroundElement(),
          toolbar: toolbar,
          bottomToolbar: page.element._getBottomToolbarElement()
        };
      }
    }, {
      key: '_shouldAnimateToolbar',
      value: function _shouldAnimateToolbar(enterPage, leavePage) {
        var bothPageHasToolbar = enterPage.element._canAnimateToolbar() && leavePage.element._canAnimateToolbar();

        var noAndroidLikeToolbar = !enterPage.element._getToolbarElement().classList.contains('navigation-bar--android') && !leavePage.element._getToolbarElement().classList.contains('navigation-bar--android');

        return bothPageHasToolbar && noAndroidLikeToolbar;
      }

      /**
       * @param {Object} enterPage
       * @param {Object} leavePage
       * @param {Function} callback
       */
    }, {
      key: 'push',
      value: function push(enterPage, leavePage, callback) {
        var _this = this;

        this.backgroundMask.remove();
        leavePage.element.parentNode.insertBefore(this.backgroundMask, leavePage.element.nextSibling);

        var enterPageDecomposition = this._decompose(enterPage);
        var leavePageDecomposition = this._decompose(leavePage);

        var delta = (function () {
          var rect = leavePage.element.getBoundingClientRect();
          return Math.round((rect.right - rect.left) / 2 * 0.6);
        })();

        var maskClear = animit(this.backgroundMask).queue({
          opacity: 0,
          transform: 'translate3d(0, 0, 0)'
        }).wait(this.delay).queue({
          opacity: 0.1
        }, {
          duration: this.duration,
          timing: this.timing
        }).resetStyle().queue(function (done) {
          _this.backgroundMask.remove();
          done();
        });

        var shouldAnimateToolbar = this._shouldAnimateToolbar(enterPage, leavePage);

        if (shouldAnimateToolbar) {
          enterPage.element.style.zIndex = 'auto';
          leavePage.element.style.zIndex = 'auto';

          animit.runAll(maskClear, animit([enterPageDecomposition.content, enterPageDecomposition.bottomToolbar, enterPageDecomposition.background]).queue({
            css: {
              transform: 'translate3D(100%, 0px, 0px)'
            },
            duration: 0
          }).wait(this.delay).queue({
            css: {
              transform: 'translate3D(0px, 0px, 0px)'
            },
            duration: this.duration,
            timing: this.timing
          }).resetStyle(), animit(enterPageDecomposition.toolbar).queue({
            css: {
              background: 'none',
              backgroundColor: 'rgba(0, 0, 0, 0)',
              borderColor: 'rgba(0, 0, 0, 0)'
            },
            duration: 0
          }).wait(this.delay + 0.3).resetStyle({
            duration: 0.1,
            transition: 'background-color 0.1s linear, ' + 'border-color 0.1s linear'
          }), animit(enterPageDecomposition.pageLabels).queue({
            css: {
              transform: 'translate3d(' + delta + 'px, 0, 0)',
              opacity: 0
            },
            duration: 0
          }).wait(this.delay).queue({
            css: {
              transform: 'translate3d(0, 0, 0)',
              opacity: 1.0
            },
            duration: this.duration,
            timing: this.timing
          }).resetStyle(), animit(enterPageDecomposition.other).queue({
            css: { opacity: 0 },
            duration: 0
          }).wait(this.delay).queue({
            css: { opacity: 1 },
            duration: this.duration,
            timing: this.timing
          }).resetStyle(), animit([leavePageDecomposition.content, leavePageDecomposition.bottomToolbar, leavePageDecomposition.background]).queue({
            css: {
              transform: 'translate3D(0, 0, 0)'
            },
            duration: 0
          }).wait(this.delay).queue({
            css: {
              transform: 'translate3D(-25%, 0px, 0px)'
            },
            duration: this.duration,
            timing: this.timing
          }).resetStyle().queue(function (done) {
            enterPage.element.style.zIndex = '';
            leavePage.element.style.zIndex = '';
            callback();
            done();
          }), animit(leavePageDecomposition.pageLabels).queue({
            css: {
              transform: 'translate3d(0, 0, 0)',
              opacity: 1.0
            },
            duration: 0
          }).wait(this.delay).queue({
            css: {
              transform: 'translate3d(-' + delta + 'px, 0, 0)',
              opacity: 0
            },
            duration: this.duration,
            timing: this.timing
          }).resetStyle(), animit(leavePageDecomposition.other).queue({
            css: { opacity: 1 },
            duration: 0
          }).wait(this.delay).queue({
            css: { opacity: 0 },
            duration: this.duration,
            timing: this.timing
          }).resetStyle());
        } else {

          enterPage.element.style.zIndex = 'auto';
          leavePage.element.style.zIndex = 'auto';

          animit.runAll(maskClear, animit(enterPage.element).queue({
            css: {
              transform: 'translate3D(100%, 0px, 0px)'
            },
            duration: 0
          }).wait(this.delay).queue({
            css: {
              transform: 'translate3D(0px, 0px, 0px)'
            },
            duration: this.duration,
            timing: this.timing
          }).resetStyle(), animit(leavePage.element).queue({
            css: {
              transform: 'translate3D(0, 0, 0)'
            },
            duration: 0
          }).wait(this.delay).queue({
            css: {
              transform: 'translate3D(-25%, 0px, 0px)'
            },
            duration: this.duration,
            timing: this.timing
          }).resetStyle().queue(function (done) {
            enterPage.element.style.zIndex = '';
            leavePage.element.style.zIndex = '';
            callback();
            done();
          }));
        }
      }

      /**
       * @param {Object} enterPage
       * @param {Object} leavePage
       * @param {Function} done
       */
    }, {
      key: 'pop',
      value: function pop(enterPage, leavePage, done) {
        var _this2 = this;

        this.backgroundMask.remove();
        enterPage.element.parentNode.insertBefore(this.backgroundMask, enterPage.element.nextSibling);

        var enterPageDecomposition = this._decompose(enterPage);
        var leavePageDecomposition = this._decompose(leavePage);

        var delta = (function () {
          var rect = leavePage.element.getBoundingClientRect();
          return Math.round((rect.right - rect.left) / 2 * 0.6);
        })();

        var maskClear = animit(this.backgroundMask).queue({
          opacity: 0.1,
          transform: 'translate3d(0, 0, 0)'
        }).wait(this.delay).queue({
          opacity: 0
        }, {
          duration: this.duration,
          timing: this.timing
        }).resetStyle().queue(function (done) {
          _this2.backgroundMask.remove();
          done();
        });

        var shouldAnimateToolbar = this._shouldAnimateToolbar(enterPage, leavePage);

        if (shouldAnimateToolbar) {

          enterPage.element.style.zIndex = 'auto';
          leavePage.element.style.zIndex = 'auto';

          animit.runAll(maskClear, animit([enterPageDecomposition.content, enterPageDecomposition.bottomToolbar, enterPageDecomposition.background]).queue({
            css: {
              transform: 'translate3D(-25%, 0px, 0px)',
              opacity: 0.9
            },
            duration: 0
          }).wait(this.delay).queue({
            css: {
              transform: 'translate3D(0px, 0px, 0px)',
              opacity: 1.0
            },
            duration: this.duration,
            timing: this.timing
          }).resetStyle(), animit(enterPageDecomposition.pageLabels).queue({
            css: {
              transform: 'translate3d(-' + delta + 'px, 0, 0)',
              opacity: 0
            },
            duration: 0
          }).wait(this.delay).queue({
            css: {
              transform: 'translate3d(0, 0, 0)',
              opacity: 1.0
            },
            duration: this.duration,
            timing: this.timing
          }).resetStyle(), animit(enterPageDecomposition.toolbar).queue({
            css: {
              transform: 'translate3d(0, 0, 0)',
              opacity: 1.0
            },
            duration: 0
          }).wait(this.delay).queue({
            css: {
              transform: 'translate3d(0, 0, 0)',
              opacity: 1.0
            },
            duration: this.duration,
            timing: this.timing
          }).resetStyle(), animit(enterPageDecomposition.other).queue({
            css: { opacity: 0 },
            duration: 0
          }).wait(this.delay).queue({
            css: { opacity: 1 },
            duration: this.duration,
            timing: this.timing
          }).resetStyle(), animit([leavePageDecomposition.content, leavePageDecomposition.bottomToolbar, leavePageDecomposition.background]).queue({
            css: {
              transform: 'translate3D(0px, 0px, 0px)'
            },
            duration: 0
          }).wait(this.delay).queue({
            css: {
              transform: 'translate3D(100%, 0px, 0px)'
            },
            duration: this.duration,
            timing: this.timing
          }).wait(0).queue(function (finish) {
            enterPage.element.style.zIndex = '';
            leavePage.element.style.zIndex = '';
            done();
            finish();
          }), animit(leavePageDecomposition.other).queue({
            css: {
              transform: 'translate3d(0, 0, 0)',
              opacity: 1
            },
            duration: 0
          }).wait(this.delay).queue({
            css: {
              transform: 'translate3d(0, 0, 0)',
              opacity: 0
            },
            duration: this.duration,
            timing: this.timing
          }), animit(leavePageDecomposition.toolbar).queue({
            css: {
              background: 'none',
              backgroundColor: 'rgba(0, 0, 0, 0)',
              borderColor: 'rgba(0, 0, 0, 0)'
            },
            duration: 0
          }), animit(leavePageDecomposition.pageLabels).queue({
            css: {
              transform: 'translate3d(0, 0, 0)',
              opacity: 1.0
            },
            duration: 0
          }).wait(this.delay).queue({
            css: {
              transform: 'translate3d(' + delta + 'px, 0, 0)',
              opacity: 0
            },
            duration: this.duration,
            timing: this.timing
          }));
        } else {

          enterPage.element.style.zIndex = 'auto';
          leavePage.element.style.zIndex = 'auto';

          animit.runAll(maskClear, animit(enterPage.element).queue({
            css: {
              transform: 'translate3D(-25%, 0px, 0px)',
              opacity: 0.9
            },
            duration: 0
          }).wait(this.delay).queue({
            css: {
              transform: 'translate3D(0px, 0px, 0px)',
              opacity: 1.0
            },
            duration: this.duration,
            timing: this.timing
          }).resetStyle(), animit(leavePage.element).queue({
            css: {
              transform: 'translate3D(0px, 0px, 0px)'
            },
            duration: 0
          }).wait(this.delay).queue({
            css: {
              transform: 'translate3D(100%, 0px, 0px)'
            },
            duration: this.duration,
            timing: this.timing
          }).queue(function (finish) {
            enterPage.element.style.zIndex = '';
            leavePage.element.style.zIndex = '';
            done();
            finish();
          }));
        }
      }
    }]);

    return IOSSlideNavigatorTransitionAnimator;
  })(NavigatorTransitionAnimator);

  ons._internal = ons._internal || {};
  ons._internal.IOSSlideNavigatorTransitionAnimator = IOSSlideNavigatorTransitionAnimator;
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (ons) {
  'use strict';

  var util = ons._util;

  var LazyRepeatDelegate = (function () {
    function LazyRepeatDelegate() {
      _classCallCheck(this, LazyRepeatDelegate);
    }

    /**
     * This class provide core functions for ons-lazy-repeat.
     */

    _createClass(LazyRepeatDelegate, [{
      key: 'prepareItem',

      /**
       * @param {Number}
       * @param {Function} done A function that take item object as parameter.
       */
      value: function prepareItem(index, done) {
        throw new Error('This is an abstract method.');
      }

      /**
       * @return {Number}
       */
    }, {
      key: 'countItems',
      value: function countItems() {
        throw new Error('This is an abstract method.');
      }

      /**
       * @param {Number} index
       * @param {Object} item
       * @param {Element} item.element
       */
    }, {
      key: 'updateItem',
      value: function updateItem(index, item) {
        throw new Error('This is an abstract method.');
      }

      /**
       * @return {Number}
       */
    }, {
      key: 'calculateItemHeight',
      value: function calculateItemHeight(index) {
        throw new Error('This is an abstract method.');
      }

      /**
       * @param {Number} index
       * @param {Object} item
       */
    }, {
      key: 'destroyItem',
      value: function destroyItem(index, item) {
        throw new Error('This is an abstract method.');
      }

      /**
       * @return {void}
       */
    }, {
      key: 'destroy',
      value: function destroy() {
        throw new Error('This is an abstract method.');
      }
    }]);

    return LazyRepeatDelegate;
  })();

  var LazyRepeatProvider = (function () {

    /**
     * @param {Element} wrapperElement
     * @param {Element} templateElement
     * @param {LazyRepeatDelegate} delegate
     */

    function LazyRepeatProvider(wrapperElement, templateElement, delegate) {
      _classCallCheck(this, LazyRepeatProvider);

      if (!(delegate instanceof LazyRepeatDelegate)) {
        throw new Error('"delegate" parameter must be an instance of ons._internal.LazyRepeatDelegate.');
      }

      if (!(templateElement instanceof Element)) {
        throw new Error('"templateElement" parameter must be an instance of Element.');
      }

      if (!(wrapperElement instanceof Element)) {
        throw new Error('"wrapperElement" parameter must be an instance of Element.');
      }

      this._templateElement = templateElement;
      this._wrapperElement = wrapperElement;
      this._delegate = delegate;

      this._pageContent = util.findParent(wrapperElement, '.page__content');

      if (!this._pageContent) {
        throw new Error('ons-lazy-repeat must be a descendant of an <ons-page> element.');
      }

      this._itemHeightSum = [];
      this._maxIndex = 0;
      this._renderedItems = {};

      this._addEventListeners();

      this._onChange();
    }

    _createClass(LazyRepeatProvider, [{
      key: '_countItems',
      value: function _countItems() {
        return this._delegate.countItems();
      }
    }, {
      key: '_getItemHeight',
      value: function _getItemHeight(i) {
        return this._delegate.calculateItemHeight(i);
      }
    }, {
      key: '_getTopOffset',
      value: function _getTopOffset() {
        if (typeof this._wrapperElement !== 'undefined' && this._wrapperElement !== null) {
          return this._wrapperElement.getBoundingClientRect().top;
        } else {
          return 0;
        }
      }
    }, {
      key: '_onChange',
      value: function _onChange() {
        this._render();
      }
    }, {
      key: '_render',
      value: function _render() {
        var items = this._getItemsInView();
        var keep = {};

        for (var i = 0, l = items.length; i < l; i++) {
          var _item = items[i];
          this._renderElement(_item);
          keep[_item.index] = true;
        }

        for (var key in this._renderedItems) {
          if (this._renderedItems.hasOwnProperty(key) && !keep.hasOwnProperty(key)) {
            this._removeElement(key);
          }
        }

        this._wrapperElement.style.height = this._calculateListHeight() + 'px';
      }
    }, {
      key: '_calculateListHeight',
      value: function _calculateListHeight() {
        var indices = Object.keys(this._renderedItems).map(function (n) {
          return parseInt(n);
        });
        return this._itemHeightSum[indices.pop()] || 0;
      }

      /**
       * @param {Number} index
       * @return {Boolean}
       */
    }, {
      key: '_isRendered',
      value: function _isRendered(index) {
        return this._renderedItems.hasOwnProperty(index);
      }

      /**
       * @param {Object} item
       * @param {Number} item.index
       * @param {Number} item.top
       */
    }, {
      key: '_renderElement',
      value: function _renderElement(_ref) {
        var _this = this;

        var index = _ref.index;
        var top = _ref.top;

        if (this._isRendered(index)) {
          // Update content even if it's already added to DOM
          // to account for changes within the list.
          var currentItem = this._renderedItems[index];
          this._delegate.updateItem(index, currentItem);

          // Fix position.
          var element = this._renderedItems[index].element;
          element.style.top = top + 'px';

          return;
        }

        this._delegate.prepareItem(index, function (item) {

          var element = item.element;

          element.style.position = 'absolute';
          element.style.top = top + 'px';
          element.style.left = '0px';
          element.style.right = '0px';

          _this._wrapperElement.appendChild(element);

          _this._renderedItems[index] = item;
        });
      }

      /**
       * @param {Number} index
       */
    }, {
      key: '_removeElement',
      value: function _removeElement(index) {
        if (!this._isRendered(index)) {
          return;
        }

        var item = this._renderedItems[index];

        this._delegate.destroyItem(index, item);

        if (item.element.parentElement) {
          item.element.parentElement.removeChild(item.element);
        }
        item = null;

        delete this._renderedItems[index];
      }
    }, {
      key: '_removeAllElements',
      value: function _removeAllElements() {
        for (var key in this._renderedItems) {
          if (this._renderedItems.hasOwnProperty(key)) {
            this._removeElement(key);
          }
        }
      }
    }, {
      key: '_calculateStartIndex',
      value: function _calculateStartIndex(current) {
        var start = 0;
        var end = this._maxIndex;

        // Binary search for index at top of screen so
        // we can speed up rendering.
        for (;;) {
          var middle = Math.floor((start + end) / 2);
          var value = current + this._itemHeightSum[middle];

          if (end < start) {
            return 0;
          } else if (value >= 0 && value - this._getItemHeight(middle) < 0) {
            return middle;
          } else if (isNaN(value) || value >= 0) {
            end = middle - 1;
          } else {
            start = middle + 1;
          }
        }
      }
    }, {
      key: '_recalculateItemHeightSum',
      value: function _recalculateItemHeightSum() {
        var sums = this._itemHeightSum;
        for (var i = 0, sum = 0; i < Math.min(sums.length, this._countItems()); i++) {
          sum += this._getItemHeight(i);
          sums[i] = sum;
        }
      }
    }, {
      key: '_getItemsInView',
      value: function _getItemsInView() {
        var topOffset = this._getTopOffset();
        var topPosition = topOffset;
        var cnt = this._countItems();

        if (cnt !== this._itemCount) {
          this._recalculateItemHeightSum();
          this._maxIndex = cnt - 1;
        }
        this._itemCount = cnt;

        var startIndex = this._calculateStartIndex(topPosition);
        startIndex = Math.max(startIndex - 30, 0);

        if (startIndex > 0) {
          topPosition += this._itemHeightSum[startIndex - 1];
        }

        var items = [];
        for (var i = startIndex; i < cnt && topPosition < 4 * window.innerHeight; i++) {
          var h = this._getItemHeight(i);

          if (i >= this._itemHeightSum.length) {
            this._itemHeightSum = this._itemHeightSum.concat(new Array(100));
          }

          if (i > 0) {
            this._itemHeightSum[i] = this._itemHeightSum[i - 1] + h;
          } else {
            this._itemHeightSum[i] = h;
          }

          this._maxIndex = Math.max(i, this._maxIndex);

          items.push({
            index: i,
            top: topPosition - topOffset
          });

          topPosition += h;
        }

        return items;
      }
    }, {
      key: '_debounce',
      value: function _debounce(func, wait, immediate) {
        var timeout;
        return function () {
          var context = this,
              args = arguments;
          var later = function later() {
            timeout = null;
            if (!immediate) {
              func.apply(context, args);
            }
          };
          var callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
          if (callNow) {
            func.apply(context, args);
          }
        };
      }
    }, {
      key: '_doubleFireOnTouchend',
      value: function _doubleFireOnTouchend() {
        this._render();
        this._debounce(this._render.bind(this), 100);
      }
    }, {
      key: '_addEventListeners',
      value: function _addEventListeners() {
        if (ons.platform.isIOS()) {
          this._boundOnChange = this._debounce(this._onChange.bind(this), 30);
        } else {
          this._boundOnChange = this._onChange.bind(this);
        }

        this._pageContent.addEventListener('scroll', this._boundOnChange, true);

        if (ons.platform.isIOS()) {
          this._pageContent.addEventListener('touchmove', this._boundOnChange, true);
          this._pageContent.addEventListener('touchend', this._doubleFireOnTouchend, true);
        }

        window.document.addEventListener('resize', this._boundOnChange, true);
      }
    }, {
      key: '_removeEventListeners',
      value: function _removeEventListeners() {
        this._pageContent.removeEventListener('scroll', this._boundOnChange, true);

        if (ons.platform.isIOS()) {
          this._pageContent.removeEventListener('touchmove', this._boundOnChange, true);
          this._pageContent.removeEventListener('touchend', this._doubleFireOnTouchend, true);
        }

        window.document.removeEventListener('resize', this._boundOnChange, true);
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        this._delegate.destroy();
        this._parentElement = this._templateElement = this._delegate = this._renderedItems = null;
        this._removeEventListeners();
      }
    }]);

    return LazyRepeatProvider;
  })();

  ons._internal = ons._internal || {};
  ons._internal.LazyRepeatProvider = LazyRepeatProvider;
  ons._internal.LazyRepeatDelegate = LazyRepeatDelegate;
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function (ons) {
  'use strict';

  var NavigatorTransitionAnimator = ons._internal.NavigatorTransitionAnimator;
  var util = ons._util;

  /**
   * Lift screen transition.
   */

  var LiftNavigatorTransitionAnimator = (function (_NavigatorTransitionAnimator) {
    _inherits(LiftNavigatorTransitionAnimator, _NavigatorTransitionAnimator);

    function LiftNavigatorTransitionAnimator(options) {
      _classCallCheck(this, LiftNavigatorTransitionAnimator);

      options = ons._util.extend({
        duration: 0.4,
        timing: 'cubic-bezier(.1, .7, .1, 1)',
        delay: 0
      }, options || {});

      _get(Object.getPrototypeOf(LiftNavigatorTransitionAnimator.prototype), 'constructor', this).call(this, options);

      this.backgroundMask = ons._util.createElement('\n        <div style="position: absolute; width: 100%; height: 100%;\n          background-color: black;"></div>\n      ');
    }

    /**
     * @param {Object} enterPage
     * @param {Object} leavePage
     * @param {Function} callback
     */

    _createClass(LiftNavigatorTransitionAnimator, [{
      key: 'push',
      value: function push(enterPage, leavePage, callback) {
        var _this = this;

        this.backgroundMask.remove();
        leavePage.element.parentNode.insertBefore(this.backgroundMask, leavePage.element);

        var maskClear = animit(this.backgroundMask).wait(0.6).queue(function (done) {
          _this.backgroundMask.remove();
          done();
        });

        animit.runAll(maskClear, animit(enterPage.element).queue({
          css: {
            transform: 'translate3D(0, 100%, 0)'
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3D(0, 0, 0)'
          },
          duration: this.duration,
          timing: this.timing
        }).wait(0.2).resetStyle().queue(function (done) {
          callback();
          done();
        }), animit(leavePage.element).queue({
          css: {
            transform: 'translate3D(0, 0, 0)',
            opacity: 1.0
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3D(0, -10%, 0)',
            opacity: 0.9
          },
          duration: this.duration,
          timing: this.timing
        }));
      }

      /**
       * @param {Object} enterPage
       * @param {Object} leavePage
       * @param {Function} callback
       */
    }, {
      key: 'pop',
      value: function pop(enterPage, leavePage, callback) {
        var _this2 = this;

        this.backgroundMask.remove();
        enterPage.element.parentNode.insertBefore(this.backgroundMask, enterPage.element);

        animit.runAll(animit(this.backgroundMask).wait(0.4).queue(function (done) {
          _this2.backgroundMask.remove();
          done();
        }), animit(enterPage.element).queue({
          css: {
            transform: 'translate3D(0, -10%, 0)',
            opacity: 0.9
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3D(0, 0, 0)',
            opacity: 1.0
          },
          duration: this.duration,
          timing: this.timing
        }).resetStyle().wait(0.4).queue(function (done) {
          callback();
          done();
        }), animit(leavePage.element).queue({
          css: {
            transform: 'translate3D(0, 0, 0)'
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3D(0, 100%, 0)'
          },
          duration: this.duration,
          timing: this.timing
        }));
      }
    }]);

    return LiftNavigatorTransitionAnimator;
  })(NavigatorTransitionAnimator);

  ons._internal = ons._internal || {};
  ons._internal.LiftNavigatorTransitionAnimator = LiftNavigatorTransitionAnimator;
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (ons) {
  'use strict';

  var ModifierUtil = (function () {
    function ModifierUtil() {
      _classCallCheck(this, ModifierUtil);
    }

    _createClass(ModifierUtil, null, [{
      key: 'diff',

      /**
       * @param {String} last
       * @param {String} current
       */
      value: function diff(last, current) {
        last = makeDict(('' + last).trim());
        current = makeDict(('' + current).trim());

        var removed = Object.keys(last).reduce(function (result, token) {
          if (!current[token]) {
            result.push(token);
          }
          return result;
        }, []);

        var added = Object.keys(current).reduce(function (result, token) {
          if (!last[token]) {
            result.push(token);
          }
          return result;
        }, []);

        return { added: added, removed: removed };

        function makeDict(modifier) {
          var dict = {};
          ModifierUtil.split(modifier).forEach(function (token) {
            return dict[token] = token;
          });
          return dict;
        }
      }

      /**
       * @param {Object} diff
       * @param {Object} classList
       * @param {String} template
       */
    }, {
      key: 'applyDiffToClassList',
      value: function applyDiffToClassList(diff, classList, template) {
        diff.added.map(function (modifier) {
          return template.replace(/\*/g, modifier);
        }).forEach(function (klass) {
          return classList.add(klass);
        });

        diff.removed.map(function (modifier) {
          return template.replace(/\*/g, modifier);
        }).forEach(function (klass) {
          return classList.remove(klass);
        });
      }

      /**
       * @param {Object} diff
       * @param {HTMLElement} element
       * @param {Object} scheme
       */
    }, {
      key: 'applyDiffToElement',
      value: function applyDiffToElement(diff, element, scheme) {
        for (var selector in scheme) {
          if (scheme.hasOwnProperty(selector)) {
            var targetElements = selector === '' ? [element] : element.querySelectorAll(selector);
            for (var i = 0; i < targetElements.length; i++) {
              ModifierUtil.applyDiffToClassList(diff, targetElements[i].classList, scheme[selector]);
            }
          }
        }
      }

      /**
       * @param {String} last
       * @param {String} current
       * @param {HTMLElement} element
       * @param {Object} scheme
       */
    }, {
      key: 'onModifierChanged',
      value: function onModifierChanged(last, current, element, scheme) {
        return ModifierUtil.applyDiffToElement(ModifierUtil.diff(last, current), element, scheme);
      }

      /**
       * @param {HTMLElement} element
       * @param {Object} scheme
       */
    }, {
      key: 'initModifier',
      value: function initModifier(element, scheme) {
        var modifier = element.getAttribute('modifier');
        if (typeof modifier !== 'string') {
          return;
        }

        ModifierUtil.applyDiffToElement({
          removed: [],
          added: ModifierUtil.split(modifier)
        }, element, scheme);
      }
    }, {
      key: 'split',
      value: function split(modifier) {
        if (typeof modifier !== 'string') {
          return [];
        }

        return modifier.trim().split(/ +/).filter(function (token) {
          return token !== '';
        });
      }
    }]);

    return ModifierUtil;
  })();

  ons._internal = ons._internal || {};
  ons._internal.ModifierUtil = ModifierUtil;
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (ons) {
  'use strict';

  var util = ons._util;

  var NavigatorPage = (function () {

    /**
     * @param {Object} params
     * @param {Object} params.page
     * @param {Object} params.element
     * @param {Object} params.options
     * @param {Object} params.navigator
     * @param {String} params.initialContent
     */

    function NavigatorPage(params) {
      var _this = this;

      _classCallCheck(this, NavigatorPage);

      this.page = params.page;
      this.name = params.page;
      this.element = params.element;
      this.options = params.options;
      this.navigator = params.navigator;
      this.initialContent = params.initialContent;

      // Block events while page is being animated to stop scrolling, pressing buttons, etc.
      this._blockEvents = function (event) {
        if (_this.navigator._isPopping || _this.navigator._isPushing) {
          event.preventDefault();
          event.stopPropagation();
        }
      };

      this._pointerEvents.forEach(function (event) {
        return _this.element.addEventListener(event, _this._blockEvents);
      }, false);
    }

    _createClass(NavigatorPage, [{
      key: 'getDeviceBackButtonHandler',
      value: function getDeviceBackButtonHandler() {
        return this._deviceBackButtonHandler;
      }

      /**
       * @return {PageView}
       */
    }, {
      key: 'getPageView',
      value: function getPageView() {
        if (!this._page) {
          this._page = util.findParent('ons-page');
          if (!this._page) {
            throw new Error('Fail to fetch ons-page element.');
          }
        }
        return this._page;
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        var _this2 = this;

        this._pointerEvents.forEach(function (event) {
          return _this2.element.removeEventListener(event, _this2._blockEvents);
        }, false);
        this.element._destroy();

        var index = this.navigator._pages.indexOf(this);
        if (index !== -1) {
          this.navigator._pages.splice(index, 1);
        }

        this.element = this._page = this.options = this.navigator = null;
      }
    }, {
      key: '_pointerEvents',
      get: function get() {
        return ['touchmove'];
      }
    }]);

    return NavigatorPage;
  })();

  window.ons._internal.NavigatorPage = NavigatorPage;
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

(function (ons) {
  'use strict';

  ons._internal = ons._internal || {};

  ons._internal.nullElement = document.createElement('div');

  /**
   * @return {Boolean}
   */
  ons._internal.isEnabledAutoStatusBarFill = function () {
    return !!ons._config.autoStatusBarFill;
  };

  /**
   * @param {String} html
   * @return {String}
   */
  ons._internal.normalizePageHTML = function (html) {
    html = ('' + html).trim();

    if (!html.match(/^<ons-page/)) {
      html = '<ons-page _muted>' + html + '</ons-page>';
    }

    return html;
  };

  ons._internal.waitDOMContentLoaded = function (callback) {
    if (document.readyState === 'loading' || document.readyState == 'uninitialized') {
      window.document.addEventListener('DOMContentLoaded', callback);
    } else {
      setImmediate(callback);
    }
  };

  /**
   * @param {HTMLElement} element
   * @return {Boolean}
   */
  ons._internal.shouldFillStatusBar = function (element) {
    if (ons._internal.isEnabledAutoStatusBarFill() && ons.platform.isWebView() && ons.platform.isIOS7above()) {
      if (!(element instanceof HTMLElement)) {
        throw new Error('element must be an instance of HTMLElement');
      }

      for (;;) {
        if (element.hasAttribute('no-status-bar-fill')) {
          return false;
        }

        element = element.parentNode;
        if (!element || !element.hasAttribute) {
          return true;
        }
      }
    }
    return false;
  };

  ons._internal.templateStore = {
    _storage: {},

    /**
     * @param {String} key
     * @return {String/null} template
     */
    get: function get(key) {
      return ons._internal.templateStore._storage[key] || null;
    },

    /**
     * @param {String} key
     * @param {String} template
     */
    set: function set(key, template) {
      ons._internal.templateStore._storage[key] = template;
    }
  };

  document.addEventListener('_templateloaded', function (e) {
    if (e.target.nodeName.toLowerCase() === 'ons-template') {
      ons._internal.templateStore.set(e.templateId, e.template);
    }
  }, false);

  document.addEventListener('DOMContentLoaded', function () {
    register('script[type="text/ons-template"]');
    register('script[type="text/template"]');
    register('script[type="text/ng-template"]');

    function register(query) {
      var templates = document.querySelectorAll(query);
      for (var i = 0; i < templates.length; i++) {
        ons._internal.templateStore.set(templates[i].getAttribute('id'), templates[i].textContent);
      }
    }
  }, false);

  /**
   * @param {String} page
   * @return {Promise}
   */
  ons._internal.getTemplateHTMLAsync = function (page) {
    return new Promise(function (resolve, reject) {
      setImmediate(function () {
        var cache = ons._internal.templateStore.get(page);

        if (cache) {
          var html = typeof cache === 'string' ? cache : cache[1];
          resolve(html);
        } else {
          (function () {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', page, true);
            xhr.onload = function (response) {
              var html = xhr.responseText;
              if (xhr.status >= 400 && xhr.status < 600) {
                reject(html);
              } else {
                resolve(html);
              }
            };
            xhr.onerror = function () {
              throw new Error('The page is not found: ' + page);
            };
            xhr.send(null);
          })();
        }
      });
    });
  };

  /**
   * @param {String} page
   * @return {Promise}
   */
  ons._internal.getPageHTMLAsync = function (page) {
    var pages = ons.pageAttributeExpression.evaluate(page);

    var getPage = function getPage(page) {
      if (typeof page !== 'string') {
        return Promise.reject('Must specify a page.');
      }

      return ons._internal.getTemplateHTMLAsync(page).then(function (html) {
        return ons._internal.normalizePageHTML(html);
      }, function (error) {
        if (pages.length === 0) {
          return Promise.reject(error);
        }

        return getPage(pages.shift());
      }).then(function (html) {
        return ons._internal.normalizePageHTML(html);
      });
    };

    return getPage(pages.shift());
  };
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

(function (ons) {
  'use strict';

  var util = ons._util;

  ons.notification = {};

  ons.notification._createAlertDialog = function (title, message, buttonLabels, primaryButtonIndex, modifier, animation, _callback, messageIsHTML, cancelable, promptDialog, autofocus, placeholder, defaultValue, submitOnEnter, compile) {

    compile = compile || function (object) {
      return object;
    };

    var dialogElement = util.createElement('<ons-alert-dialog></ons-alert-dialog>');
    var titleElement = util.createElement('<div class="alert-dialog-title"></div>');
    var messageElement = util.createElement('<div class="alert-dialog-content"></div>');
    var footerElement = util.createElement('<div class="alert-dialog-footer"></div>');
    var inputElement = undefined;

    dialogElement.setAttribute('animation', animation);

    if (messageIsHTML) {
      messageElement.innerHTML = message;
    } else {
      messageElement.textContent = message;
    }

    dialogElement.appendChild(titleElement);
    dialogElement.appendChild(messageElement);

    if (promptDialog) {
      inputElement = util.createElement('<input class="text-input" type="text"></input>');

      if (modifier) {
        inputElement.classList.add('text-input--' + modifier);
      }

      inputElement.setAttribute('placeholder', placeholder);
      inputElement.value = defaultValue;
      inputElement.style.width = '100%';
      inputElement.style.marginTop = '10px';

      messageElement.appendChild(inputElement);

      if (submitOnEnter) {
        inputElement.addEventListener('keypress', function (event) {
          if (event.keyCode === 13) {
            dialogElement.hide({
              callback: function callback() {
                _callback(inputElement.value);
                dialogElement.destroy();
                dialogElement = null;
              }
            });
          }
        }, false);
      }
    }

    dialogElement.appendChild(footerElement);

    document.body.appendChild(dialogElement);

    compile(dialogElement);

    if (buttonLabels.length <= 2) {
      footerElement.classList.add('alert-dialog-footer--one');
    }

    var createButton = function createButton(i) {
      var buttonElement = util.createElement('<button class="alert-dialog-button"></button>');
      buttonElement.textContent = buttonLabels[i];

      if (i == primaryButtonIndex) {
        buttonElement.classList.add('alert-dialog-button--primal');
      }

      if (buttonLabels.length <= 2) {
        buttonElement.classList.add('alert-dialog-button--one');
      }

      var onClick = function onClick() {
        buttonElement.removeEventListener('click', onClick, false);

        dialogElement.hide({
          callback: function callback() {
            if (promptDialog) {
              _callback(inputElement.value);
            } else {
              _callback(i);
            }
            dialogElement.destroy();
            dialogElement = inputElement = buttonElement = null;
          }
        });
      };

      buttonElement.addEventListener('click', onClick, false);
      footerElement.appendChild(buttonElement);
    };

    for (var i = 0; i < buttonLabels.length; i++) {
      createButton(i);
    }

    if (cancelable) {
      dialogElement.setCancelable(cancelable);
      dialogElement.addEventListener('cancel', function () {
        if (promptDialog) {
          _callback(null);
        } else {
          _callback(-1);
        }
        setTimeout(function () {
          dialogElement.destroy();
          dialogElement = null;
          inputElement = null;
        });
      }, false);
    }

    dialogElement.show({
      callback: function callback() {
        if (inputElement && promptDialog && autofocus) {
          inputElement.focus();
        }
      }
    });

    titleElement = messageElement = footerElement = null;

    if (modifier) {
      dialogElement.setAttribute('modifier', modifier);
    }

    return Promise.resolve(dialogElement);
  };

  ons.notification._alertOriginal = function (options) {
    var defaults = {
      buttonLabel: 'OK',
      animation: 'default',
      title: 'Alert',
      callback: function callback() {}
    };

    options = util.extend({}, defaults, options);
    if (!options.message && !options.messageHTML) {
      throw new Error('Alert dialog must contain a message.');
    }

    return ons.notification._createAlertDialog(options.title, options.message || options.messageHTML, [options.buttonLabel], 0, options.modifier, options.animation, options.callback, !options.message ? true : false, false, false, false, '', '', false, options.compile);
  };

  /**
   * @param {Object} options
   * @param {String} [options.message]
   * @param {String} [options.messageHTML]
   * @param {String} [options.buttonLabel]
   * @param {String} [options.animation]
   * @param {String} [options.title]
   * @param {String} [options.modifier]
   * @param {Function} [options.callback]
   * @param {Function} [options.compile]
   * @return {Promise}
   */
  ons.notification.alert = ons.notification._alertOriginal;

  ons.notification._confirmOriginal = function (options) {
    var defaults = {
      buttonLabels: ['Cancel', 'OK'],
      primaryButtonIndex: 1,
      animation: 'default',
      title: 'Confirm',
      callback: function callback() {},
      cancelable: false
    };

    options = util.extend({}, defaults, options);

    if (!options.message && !options.messageHTML) {
      throw new Error('Confirm dialog must contain a message.');
    }

    return ons.notification._createAlertDialog(options.title, options.message || options.messageHTML, options.buttonLabels, options.primaryButtonIndex, options.modifier, options.animation, options.callback, !options.message ? true : false, options.cancelable, false, false, '', '', false, options.compile);
  };

  /**
   * @param {Object} options
   * @param {String} [options.message]
   * @param {String} [options.messageHTML]
   * @param {Array} [options.buttonLabels]
   * @param {Number} [options.primaryButtonIndex]
   * @param {Boolean} [options.cancelable]
   * @param {String} [options.animation]
   * @param {String} [options.title]
   * @param {String} [options.modifier]
   * @param {Function} [options.callback]
   * @param {Function} [options.compile]
   * @return {Promise}
   */
  ons.notification.confirm = ons.notification._confirmOriginal;

  ons.notification._promptOriginal = function (options) {
    var defaults = {
      buttonLabel: 'OK',
      animation: 'default',
      title: 'Alert',
      defaultValue: '',
      placeholder: '',
      callback: function callback() {},
      cancelable: false,
      autofocus: true,
      submitOnEnter: true
    };

    options = util.extend({}, defaults, options);
    if (!options.message && !options.messageHTML) {
      throw new Error('Prompt dialog must contain a message.');
    }

    return ons.notification._createAlertDialog(options.title, options.message || options.messageHTML, [options.buttonLabel], 0, options.modifier, options.animation, options.callback, !options.message ? true : false, options.cancelable, true, options.autofocus, options.placeholder, options.defaultValue, options.submitOnEnter, options.compile);
  };

  /**
   * @param {Object} options
   * @param {String} [options.message]
   * @param {String} [options.messageHTML]
   * @param {String} [options.buttonLabel]
   * @param {Boolean} [options.cancelable]
   * @param {String} [options.animation]
   * @param {String} [options.placeholder]
   * @param {String} [options.defaultValue]
   * @param {String} [options.title]
   * @param {String} [options.modifier]
   * @param {Function} [options.callback]
   * @param {Boolean} [options.autofocus]
   * @param {Boolean} [options.submitOnEnter]
   * @param {Function} [options.compile]
   * @return {Promise}
   */
  ons.notification.prompt = ons.notification._promptOriginal;
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

(function (ons) {
  var create = function create() {
    var obj = {
      // actual implementation to detect if whether current screen is portrait or not
      _isPortrait: false,

      /**
       * @return {Boolean}
       */
      isPortrait: function isPortrait() {
        return this._isPortrait();
      },

      /**
       * @return {Boolean}
       */
      isLandscape: function isLandscape() {
        return !this.isPortrait();
      },

      _init: function _init() {
        document.addEventListener('DOMContentLoaded', this._onDOMContentLoaded.bind(this), false);

        if ('orientation' in window) {
          window.addEventListener('orientationchange', this._onOrientationChange.bind(this), false);
        } else {
          window.addEventListener('resize', this._onResize.bind(this), false);
        }

        this._isPortrait = function () {
          return window.innerHeight > window.innerWidth;
        };

        return this;
      },

      _onDOMContentLoaded: function _onDOMContentLoaded() {
        this._installIsPortraitImplementation();
        this.emit('change', { isPortrait: this.isPortrait() });
      },

      _installIsPortraitImplementation: function _installIsPortraitImplementation() {
        var isPortrait = window.innerWidth < window.innerHeight;

        if (!('orientation' in window)) {
          this._isPortrait = function () {
            return window.innerHeight > window.innerWidth;
          };
        } else if (window.orientation % 180 === 0) {
          this._isPortrait = function () {
            return Math.abs(window.orientation % 180) === 0 ? isPortrait : !isPortrait;
          };
        } else {
          this._isPortrait = function () {
            return Math.abs(window.orientation % 180) === 90 ? isPortrait : !isPortrait;
          };
        }
      },

      _onOrientationChange: function _onOrientationChange() {
        var _this = this;

        var isPortrait = this._isPortrait();

        // Wait for the dimensions to change because
        // of Android inconsistency.
        var nIter = 0;
        var interval = setInterval(function () {
          nIter++;

          var w = window.innerWidth;
          var h = window.innerHeight;

          if (isPortrait && w <= h || !isPortrait && w >= h) {
            _this.emit('change', { isPortrait: isPortrait });
            clearInterval(interval);
          } else if (nIter === 50) {
            _this.emit('change', { isPortrait: isPortrait });
            clearInterval(interval);
          }
        }, 20);
      },

      // Run on not mobile browser.
      _onResize: function _onResize() {
        this.emit('change', { isPortrait: this.isPortrait() });
      }
    };

    MicroEvent.mixin(obj);

    return obj;
  };

  ons.orientation = create()._init();
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

(function (ons) {
  ons.pageAttributeExpression = {
    _variables: {},

    /**
     * Define a variable.
     *
     * @param {String} name Name of the variable
     * @param {String|Function} value Value of the variable. Can be a string or a function. The function must return a string.
     * @param {Boolean} overwrite If this value is false, an error will be thrown when trying to define a variable that has already been defined.
     */
    defineVariable: function defineVariable(name, value) {
      var overwrite = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      if (typeof name !== 'string') {
        throw new Error('Variable name must be a string.');
      } else if (typeof value !== 'string' && typeof value !== 'function') {
        throw new Error('Variable value must be a string or a function.');
      } else if (this._variables.hasOwnProperty(name) && !overwrite) {
        throw new Error('"' + name + '" is already defined.');
      }
      this._variables[name] = value;
    },

    /**
     * Get a variable.
     *
     * @param {String} name Name of the variable.
     * @return {String|Function|null}
     */
    getVariable: function getVariable(name) {
      if (!this._variables.hasOwnProperty(name)) {
        return null;
      }

      return this._variables[name];
    },

    /**
     * Remove a variable.
     *
     * @param {String} name Name of the varaible.
     */
    removeVariable: function removeVariable(name) {
      delete this._variables[name];
    },

    /**
     * Get all variables.
     *
     * @return {Object}
     */
    getAllVariables: function getAllVariables() {
      return this._variables;
    },
    _parsePart: function _parsePart(part) {
      var c = undefined,
          inInterpolation = false,
          currentIndex = 0,
          tokens = [];

      if (part.length === 0) {
        throw new Error('Unable to parse empty string.');
      }

      for (var i = 0; i < part.length; i++) {
        c = part.charAt(i);

        if (c === '$' && part.charAt(i + 1) === '{') {
          if (inInterpolation) {
            throw new Error('Nested interpolation not supported.');
          }

          var token = part.substring(currentIndex, i);
          if (token.length > 0) {
            tokens.push(part.substring(currentIndex, i));
          }

          currentIndex = i;
          inInterpolation = true;
        } else if (c === '}') {
          if (!inInterpolation) {
            throw new Error('} must be preceeded by ${');
          }

          var token = part.substring(currentIndex, i + 1);
          if (token.length > 0) {
            tokens.push(part.substring(currentIndex, i + 1));
          }

          currentIndex = i + 1;
          inInterpolation = false;
        }
      }

      if (inInterpolation) {
        throw new Error('Unterminated interpolation.');
      }

      tokens.push(part.substring(currentIndex, part.length));

      return tokens;
    },
    _replaceToken: function _replaceToken(token) {
      var re = /^\${(.*?)}$/,
          match = token.match(re);

      if (match) {
        var _name = match[1].trim(),
            variable = this.getVariable(_name);

        if (variable === null) {
          throw new Error('Variable "' + _name + '" does not exist.');
        } else if (typeof variable === 'string') {
          return variable;
        } else {
          var rv = variable();

          if (typeof rv !== 'string') {
            throw new Error('Must return a string.');
          }

          return rv;
        }
      } else {
        return token;
      }
    },
    _replaceTokens: function _replaceTokens(tokens) {
      return tokens.map(this._replaceToken.bind(this));
    },
    _parseExpression: function _parseExpression(expression) {
      return expression.split(',').map(function (part) {
        return part.trim();
      }).map(this._parsePart.bind(this)).map(this._replaceTokens.bind(this)).map(function (part) {
        return part.join('');
      });
    },

    /**
     * Evaluate an expression.
     *
     * @param {String} expression An page attribute expression.
     * @return {Array}
     */
    evaluate: function evaluate(expression) {
      if (!expression) {
        return [];
      }

      return this._parseExpression(expression);
    }
  };

  // Define default variables.
  ons.pageAttributeExpression.defineVariable('mobileOS', ons.platform.getMobileOS());
  ons.pageAttributeExpression.defineVariable('iOSDevice', ons.platform.getIOSDevice());
  ons.pageAttributeExpression.defineVariable('runtime', function () {
    return ons.platform.isWebView() ? 'cordova' : 'browser';
  });
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

(function (ons) {
  'use strict';

  ons.softwareKeyboard = new MicroEvent();
  ons.softwareKeyboard._visible = false;

  var onShow = function onShow() {
    ons.softwareKeyboard._visible = true;
    ons.softwareKeyboard.emit('show');
  };

  var onHide = function onHide() {
    ons.softwareKeyboard._visible = false;
    ons.softwareKeyboard.emit('hide');
  };

  var bindEvents = function bindEvents() {
    if (typeof Keyboard !== 'undefined') {
      // https://github.com/martinmose/cordova-keyboard/blob/95f3da3a38d8f8e1fa41fbf40145352c13535a00/README.md
      Keyboard.onshow = onShow;
      Keyboard.onhide = onHide;
      ons.softwareKeyboard.emit('init', { visible: Keyboard.isVisible });

      return true;
    } else if (typeof cordova.plugins !== 'undefined' && typeof cordova.plugins.Keyboard !== 'undefined') {
      // https://github.com/driftyco/ionic-plugins-keyboard/blob/ca27ecf/README.md
      window.addEventListener('native.keyboardshow', onShow);
      window.addEventListener('native.keyboardhide', onHide);
      ons.softwareKeyboard.emit('init', { visible: cordova.plugins.Keyboard.isVisible });

      return true;
    }

    return false;
  };

  var noPluginError = function noPluginError() {
    console.warn('ons-keyboard: Cordova Keyboard plugin is not present.');
  };

  document.addEventListener('deviceready', function () {
    if (!bindEvents()) {
      if (document.querySelector('[ons-keyboard-active]') || document.querySelector('[ons-keyboard-inactive]')) {
        noPluginError();
      }

      ons.softwareKeyboard.on = noPluginError;
    }
  });
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function (ons) {
  'use strict';

  var NavigatorTransitionAnimator = ons._internal.NavigatorTransitionAnimator;
  var util = ons._util;

  /**
   * Slide animator for navigator transition.
   */

  var SimpleSlideNavigatorTransitionAnimator = (function (_NavigatorTransitionAnimator) {
    _inherits(SimpleSlideNavigatorTransitionAnimator, _NavigatorTransitionAnimator);

    function SimpleSlideNavigatorTransitionAnimator(options) {
      _classCallCheck(this, SimpleSlideNavigatorTransitionAnimator);

      options = ons._util.extend({
        duration: 0.3,
        timing: 'cubic-bezier(.1, .7, .4, 1)',
        delay: 0
      }, options || {});

      _get(Object.getPrototypeOf(SimpleSlideNavigatorTransitionAnimator.prototype), 'constructor', this).call(this, options);

      this.backgroundMask = ons._util.createElement('\n        <div style="position: absolute; width: 100%; height: 100%; z-index: 2;\n          background-color: black; opacity: 0;"></div>\n      ');
      this.blackMaskOpacity = 0.4;
    }

    /**
     * @param {Object} enterPage
     * @param {Object} leavePage
     * @param {Function} callback
     */

    _createClass(SimpleSlideNavigatorTransitionAnimator, [{
      key: 'push',
      value: function push(enterPage, leavePage, callback) {
        var _this = this;

        this.backgroundMask.remove();
        leavePage.element.parentElement.insertBefore(this.backgroundMask, leavePage.element.nextSibling);

        animit.runAll(animit(this.backgroundMask).queue({
          opacity: 0,
          transform: 'translate3d(0, 0, 0)'
        }).wait(this.delay).queue({
          opacity: this.blackMaskOpacity
        }, {
          duration: this.duration,
          timing: this.timing
        }).resetStyle().queue(function (done) {
          _this.backgroundMask.remove();
          done();
        }), animit(enterPage.element).queue({
          css: {
            transform: 'translate3D(100%, 0, 0)'
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3D(0, 0, 0)'
          },
          duration: this.duration,
          timing: this.timing
        }).resetStyle(), animit(leavePage.element).queue({
          css: {
            transform: 'translate3D(0, 0, 0)'
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3D(-45%, 0px, 0px)'
          },
          duration: this.duration,
          timing: this.timing
        }).resetStyle().wait(0.2).queue(function (done) {
          callback();
          done();
        }));
      }

      /**
       * @param {Object} enterPage
       * @param {Object} leavePage
       * @param {Function} done
       */
    }, {
      key: 'pop',
      value: function pop(enterPage, leavePage, done) {
        var _this2 = this;

        this.backgroundMask.remove();
        enterPage.element.parentNode.insertBefore(this.backgroundMask, enterPage.element.nextSibling);

        animit.runAll(animit(this.backgroundMask).queue({
          opacity: this.blackMaskOpacity,
          transform: 'translate3d(0, 0, 0)'
        }).wait(this.delay).queue({
          opacity: 0
        }, {
          duration: this.duration,
          timing: this.timing
        }).resetStyle().queue(function (done) {
          _this2.backgroundMask.remove();
          done();
        }), animit(enterPage.element).queue({
          css: {
            transform: 'translate3D(-45%, 0px, 0px)',
            opacity: 0.9
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3D(0px, 0px, 0px)',
            opacity: 1.0
          },
          duration: this.duration,
          timing: this.timing
        }).resetStyle(), animit(leavePage.element).queue({
          css: {
            transform: 'translate3D(0px, 0px, 0px)'
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3D(100%, 0px, 0px)'
          },
          duration: this.duration,
          timing: this.timing
        }).wait(0.2).queue(function (finish) {
          done();
          finish();
        }));
      }
    }]);

    return SimpleSlideNavigatorTransitionAnimator;
  })(NavigatorTransitionAnimator);

  ons._internal = ons._internal || {};
  ons._internal.SimpleSlideNavigatorTransitionAnimator = SimpleSlideNavigatorTransitionAnimator;
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (ons) {
  'use strict';

  var TabbarAnimator = (function () {

    /**
     * @param {Object} options
     * @param {String} options.timing
     * @param {Number} options.duration
     * @param {Number} options.delay
     */

    function TabbarAnimator(options) {
      _classCallCheck(this, TabbarAnimator);

      options = options || {};

      this.timing = options.timing || 'linear';
      this.duration = options.duration !== undefined ? options.duration : '0.4';
      this.delay = options.delay !== undefined ? options.delay : '0';
    }

    /**
     * @param {Element} enterPage ons-page element
     * @param {Element} leavePage ons-page element
     * @param {Number} enterPageIndex
     * @param {Number} leavePageIndex
     * @param {Function} done
     */

    _createClass(TabbarAnimator, [{
      key: 'apply',
      value: function apply(enterPage, leavePage, enterPageIndex, leavePageIndex, done) {
        throw new Error('This method must be implemented.');
      }
    }]);

    return TabbarAnimator;
  })();

  var TabbarNoneAnimator = (function (_TabbarAnimator) {
    _inherits(TabbarNoneAnimator, _TabbarAnimator);

    function TabbarNoneAnimator() {
      _classCallCheck(this, TabbarNoneAnimator);

      _get(Object.getPrototypeOf(TabbarNoneAnimator.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(TabbarNoneAnimator, [{
      key: 'apply',
      value: function apply(enterPage, leavePage, enterIndex, leaveIndex, done) {
        done();
      }
    }]);

    return TabbarNoneAnimator;
  })(TabbarAnimator);

  var TabbarFadeAnimator = (function (_TabbarAnimator2) {
    _inherits(TabbarFadeAnimator, _TabbarAnimator2);

    function TabbarFadeAnimator(options) {
      _classCallCheck(this, TabbarFadeAnimator);

      options.timing = options.timing !== undefined ? options.timing : 'linear';
      options.duration = options.duration !== undefined ? options.duration : '0.4';
      options.delay = options.delay !== undefined ? options.delay : '0';

      _get(Object.getPrototypeOf(TabbarFadeAnimator.prototype), 'constructor', this).call(this, options);
    }

    _createClass(TabbarFadeAnimator, [{
      key: 'apply',
      value: function apply(enterPage, leavePage, enterPageIndex, leavePageIndex, done) {
        animit.runAll(animit(enterPage).queue({
          transform: 'translate3D(0, 0, 0)',
          opacity: 0
        }).wait(this.delay).queue({
          transform: 'translate3D(0, 0, 0)',
          opacity: 1
        }, {
          duration: this.duration,
          timing: this.timing
        }).resetStyle().queue(function (callback) {
          done();
          callback();
        }), animit(leavePage).queue({
          transform: 'translate3D(0, 0, 0)',
          opacity: 1
        }).wait(this.delay).queue({
          transform: 'translate3D(0, 0, 0)',
          opacity: 0
        }, {
          duration: this.duration,
          timing: this.timing
        }));
      }
    }]);

    return TabbarFadeAnimator;
  })(TabbarAnimator);

  var TabbarSlideAnimator = (function (_TabbarAnimator3) {
    _inherits(TabbarSlideAnimator, _TabbarAnimator3);

    function TabbarSlideAnimator(options) {
      _classCallCheck(this, TabbarSlideAnimator);

      options.timing = options.timing !== undefined ? options.timing : 'ease-in';
      options.duration = options.duration !== undefined ? options.duration : '0.15';
      options.delay = options.delay !== undefined ? options.delay : '0';

      _get(Object.getPrototypeOf(TabbarSlideAnimator.prototype), 'constructor', this).call(this, options);
    }

    /**
     * @param {jqLite} enterPage
     * @param {jqLite} leavePage
     */

    _createClass(TabbarSlideAnimator, [{
      key: 'apply',
      value: function apply(enterPage, leavePage, enterIndex, leaveIndex, done) {
        var sgn = enterIndex > leaveIndex;

        animit.runAll(animit(enterPage).queue({
          transform: 'translate3D(' + (sgn ? '' : '-') + '100%, 0, 0)'
        }).wait(this.delay).queue({
          transform: 'translate3D(0, 0, 0)'
        }, {
          duration: this.duration,
          timing: this.timing
        }).resetStyle().queue(function (callback) {
          done();
          callback();
        }), animit(leavePage).queue({
          transform: 'translate3D(0, 0, 0)'
        }).wait(this.delay).queue({
          transform: 'translate3D(' + (sgn ? '-' : '') + '100%, 0, 0)'
        }, {
          duration: this.duration,
          timing: this.timing
        }));
      }
    }]);

    return TabbarSlideAnimator;
  })(TabbarAnimator);

  ons._internal = ons._internal || {};
  ons._internal.TabbarAnimator = TabbarAnimator;
  ons._internal.TabbarFadeAnimator = TabbarFadeAnimator;
  ons._internal.TabbarNoneAnimator = TabbarNoneAnimator;
  ons._internal.TabbarSlideAnimator = TabbarSlideAnimator;
})(window.ons = window.ons || {});
/*
 * Gesture detector library that forked from github.com/EightMedia/hammer.js.
 */

(function(window) {
  'use strict';

/**
 * @param {HTMLElement} element
 * @param {Object} [options={}]
 * @return {GestureDetector.Instance}
 */
var GestureDetector = function GestureDetector(element, options) {
  return new GestureDetector.Instance(element, options || {});
};

/**
 * default settings.
 * more settings are defined per gesture at `/gestures`. Each gesture can be disabled/enabled
 * by setting it's name (like `swipe`) to false.
 * You can set the defaults for all instances by changing this object before creating an instance.
 * @example
 * ````
 *  GestureDetector.defaults.drag = false;
 *  GestureDetector.defaults.behavior.touchAction = 'pan-y';
 *  delete GestureDetector.defaults.behavior.userSelect;
 * ````
 * @property defaults
 * @type {Object}
 */
GestureDetector.defaults = {
  behavior: {
    userSelect: 'none',
    touchAction: 'pan-y',
    touchCallout: 'none',
    contentZooming: 'none',
    userDrag: 'none',
    tapHighlightColor: 'rgba(0,0,0,0)'
  }
};

/**
 * GestureDetector document where the base events are added at
 * @property DOCUMENT
 * @type {HTMLElement}
 * @default window.document
 */
GestureDetector.DOCUMENT = document;

/**
 * detect support for pointer events
 * @property HAS_POINTEREVENTS
 * @type {Boolean}
 */
GestureDetector.HAS_POINTEREVENTS = navigator.pointerEnabled || navigator.msPointerEnabled;

/**
 * detect support for touch events
 * @property HAS_TOUCHEVENTS
 * @type {Boolean}
 */
GestureDetector.HAS_TOUCHEVENTS = ('ontouchstart' in window);

/**
 * detect mobile browsers
 * @property IS_MOBILE
 * @type {Boolean}
 */
GestureDetector.IS_MOBILE = /mobile|tablet|ip(ad|hone|od)|android|silk/i.test(navigator.userAgent);

/**
 * detect if we want to support mouseevents at all
 * @property NO_MOUSEEVENTS
 * @type {Boolean}
 */
GestureDetector.NO_MOUSEEVENTS = (GestureDetector.HAS_TOUCHEVENTS && GestureDetector.IS_MOBILE) || GestureDetector.HAS_POINTEREVENTS;

/**
 * interval in which GestureDetector recalculates current velocity/direction/angle in ms
 * @property CALCULATE_INTERVAL
 * @type {Number}
 * @default 25
 */
GestureDetector.CALCULATE_INTERVAL = 25;

/**
 * eventtypes per touchevent (start, move, end) are filled by `Event.determineEventTypes` on `setup`
 * the object contains the DOM event names per type (`EVENT_START`, `EVENT_MOVE`, `EVENT_END`)
 * @property EVENT_TYPES
 * @private
 * @writeOnce
 * @type {Object}
 */
var EVENT_TYPES = {};

/**
 * direction strings, for safe comparisons
 * @property DIRECTION_DOWN|LEFT|UP|RIGHT
 * @final
 * @type {String}
 * @default 'down' 'left' 'up' 'right'
 */
var DIRECTION_DOWN = GestureDetector.DIRECTION_DOWN = 'down';
var DIRECTION_LEFT = GestureDetector.DIRECTION_LEFT = 'left';
var DIRECTION_UP = GestureDetector.DIRECTION_UP = 'up';
var DIRECTION_RIGHT = GestureDetector.DIRECTION_RIGHT = 'right';

/**
 * pointertype strings, for safe comparisons
 * @property POINTER_MOUSE|TOUCH|PEN
 * @final
 * @type {String}
 * @default 'mouse' 'touch' 'pen'
 */
var POINTER_MOUSE = GestureDetector.POINTER_MOUSE = 'mouse';
var POINTER_TOUCH = GestureDetector.POINTER_TOUCH = 'touch';
var POINTER_PEN = GestureDetector.POINTER_PEN = 'pen';

/**
 * eventtypes
 * @property EVENT_START|MOVE|END|RELEASE|TOUCH
 * @final
 * @type {String}
 * @default 'start' 'change' 'move' 'end' 'release' 'touch'
 */
var EVENT_START = GestureDetector.EVENT_START = 'start';
var EVENT_MOVE = GestureDetector.EVENT_MOVE = 'move';
var EVENT_END = GestureDetector.EVENT_END = 'end';
var EVENT_RELEASE = GestureDetector.EVENT_RELEASE = 'release';
var EVENT_TOUCH = GestureDetector.EVENT_TOUCH = 'touch';

/**
 * if the window events are set...
 * @property READY
 * @writeOnce
 * @type {Boolean}
 * @default false
 */
GestureDetector.READY = false;

/**
 * plugins namespace
 * @property plugins
 * @type {Object}
 */
GestureDetector.plugins = GestureDetector.plugins || {};

/**
 * gestures namespace
 * see `/gestures` for the definitions
 * @property gestures
 * @type {Object}
 */
GestureDetector.gestures = GestureDetector.gestures || {};

/**
 * setup events to detect gestures on the document
 * this function is called when creating an new instance
 * @private
 */
function setup() {
  if(GestureDetector.READY) {
    return;
  }

  // find what eventtypes we add listeners to
  Event.determineEventTypes();

  // Register all gestures inside GestureDetector.gestures
  Utils.each(GestureDetector.gestures, function(gesture) {
    Detection.register(gesture);
  });

  // Add touch events on the document
  Event.onTouch(GestureDetector.DOCUMENT, EVENT_MOVE, Detection.detect);
  Event.onTouch(GestureDetector.DOCUMENT, EVENT_END, Detection.detect);

  // GestureDetector is ready...!
  GestureDetector.READY = true;
}

/**
 * @module GestureDetector
 *
 * @class Utils
 * @static
 */
var Utils = GestureDetector.utils = {
  /**
   * extend method, could also be used for cloning when `dest` is an empty object.
   * changes the dest object
   * @method extend
   * @param {Object} dest
   * @param {Object} src
   * @param {Boolean} [merge=false]  do a merge
   * @return {Object} dest
   */
  extend: function extend(dest, src, merge) {
    for (var key in src) {
      if (src.hasOwnProperty(key) && (dest[key] === undefined || !merge)) {
        dest[key] = src[key];
      }
    }
    return dest;
  },

  /**
   * simple addEventListener wrapper
   * @method on
   * @param {HTMLElement} element
   * @param {String} type
   * @param {Function} handler
   */
  on: function on(element, type, handler) {
    element.addEventListener(type, handler, false);
  },

  /**
   * simple removeEventListener wrapper
   * @method off
   * @param {HTMLElement} element
   * @param {String} type
   * @param {Function} handler
   */
  off: function off(element, type, handler) {
    element.removeEventListener(type, handler, false);
  },

  /**
   * forEach over arrays and objects
   * @method each
   * @param {Object|Array} obj
   * @param {Function} iterator
   * @param {any} iterator.item
   * @param {Number} iterator.index
   * @param {Object|Array} iterator.obj the source object
   * @param {Object} context value to use as `this` in the iterator
   */
  each: function each(obj, iterator, context) {
    var i, len;

    // native forEach on arrays
    if('forEach' in obj) {
      obj.forEach(iterator, context);
      // arrays
    } else if(obj.length !== undefined) {
      for(i = 0, len = obj.length; i < len; i++) {
        if(iterator.call(context, obj[i], i, obj) === false) {
          return;
        }
      }
      // objects
    } else {
      for(i in obj) {
        if(obj.hasOwnProperty(i) &&
          iterator.call(context, obj[i], i, obj) === false) {
          return;
        }
      }
    }
  },

  /**
   * find if a string contains the string using indexOf
   * @method inStr
   * @param {String} src
   * @param {String} find
   * @return {Boolean} found
   */
  inStr: function inStr(src, find) {
    return src.indexOf(find) > -1;
  },

  /**
   * find if a array contains the object using indexOf or a simple polyfill
   * @method inArray
   * @param {String} src
   * @param {String} find
   * @return {Boolean|Number} false when not found, or the index
   */
  inArray: function inArray(src, find) {
    if(src.indexOf) {
      var index = src.indexOf(find);
      return (index === -1) ? false : index;
    } else {
      for(var i = 0, len = src.length; i < len; i++) {
        if(src[i] === find) {
          return i;
        }
      }
      return false;
    }
  },

  /**
   * convert an array-like object (`arguments`, `touchlist`) to an array
   * @method toArray
   * @param {Object} obj
   * @return {Array}
   */
  toArray: function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
  },

  /**
   * find if a node is in the given parent
   * @method hasParent
   * @param {HTMLElement} node
   * @param {HTMLElement} parent
   * @return {Boolean} found
   */
  hasParent: function hasParent(node, parent) {
    while(node) {
      if(node == parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  },

  /**
   * get the center of all the touches
   * @method getCenter
   * @param {Array} touches
   * @return {Object} center contains `pageX`, `pageY`, `clientX` and `clientY` properties
   */
  getCenter: function getCenter(touches) {
    var pageX = [],
        pageY = [],
        clientX = [],
        clientY = [],
        min = Math.min,
        max = Math.max;

    // no need to loop when only one touch
    if(touches.length === 1) {
      return {
        pageX: touches[0].pageX,
        pageY: touches[0].pageY,
        clientX: touches[0].clientX,
        clientY: touches[0].clientY
      };
    }

    Utils.each(touches, function(touch) {
      pageX.push(touch.pageX);
      pageY.push(touch.pageY);
      clientX.push(touch.clientX);
      clientY.push(touch.clientY);
    });

    return {
      pageX: (min.apply(Math, pageX) + max.apply(Math, pageX)) / 2,
      pageY: (min.apply(Math, pageY) + max.apply(Math, pageY)) / 2,
      clientX: (min.apply(Math, clientX) + max.apply(Math, clientX)) / 2,
      clientY: (min.apply(Math, clientY) + max.apply(Math, clientY)) / 2
    };
  },

  /**
   * calculate the velocity between two points. unit is in px per ms.
   * @method getVelocity
   * @param {Number} deltaTime
   * @param {Number} deltaX
   * @param {Number} deltaY
   * @return {Object} velocity `x` and `y`
   */
  getVelocity: function getVelocity(deltaTime, deltaX, deltaY) {
    return {
      x: Math.abs(deltaX / deltaTime) || 0,
      y: Math.abs(deltaY / deltaTime) || 0
    };
  },

  /**
   * calculate the angle between two coordinates
   * @method getAngle
   * @param {Touch} touch1
   * @param {Touch} touch2
   * @return {Number} angle
   */
  getAngle: function getAngle(touch1, touch2) {
    var x = touch2.clientX - touch1.clientX,
        y = touch2.clientY - touch1.clientY;

    return Math.atan2(y, x) * 180 / Math.PI;
  },

  /**
   * do a small comparison to get the direction between two touches.
   * @method getDirection
   * @param {Touch} touch1
   * @param {Touch} touch2
   * @return {String} direction matches `DIRECTION_LEFT|RIGHT|UP|DOWN`
   */
  getDirection: function getDirection(touch1, touch2) {
    var x = Math.abs(touch1.clientX - touch2.clientX),
        y = Math.abs(touch1.clientY - touch2.clientY);

    if(x >= y) {
      return touch1.clientX - touch2.clientX > 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return touch1.clientY - touch2.clientY > 0 ? DIRECTION_UP : DIRECTION_DOWN;
  },

  /**
   * calculate the distance between two touches
   * @method getDistance
   * @param {Touch}touch1
   * @param {Touch} touch2
   * @return {Number} distance
   */
  getDistance: function getDistance(touch1, touch2) {
    var x = touch2.clientX - touch1.clientX,
        y = touch2.clientY - touch1.clientY;

    return Math.sqrt((x * x) + (y * y));
  },

  /**
   * calculate the scale factor between two touchLists
   * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
   * @method getScale
   * @param {Array} start array of touches
   * @param {Array} end array of touches
   * @return {Number} scale
   */
  getScale: function getScale(start, end) {
    // need two fingers...
    if(start.length >= 2 && end.length >= 2) {
      return this.getDistance(end[0], end[1]) / this.getDistance(start[0], start[1]);
    }
    return 1;
  },

  /**
   * calculate the rotation degrees between two touchLists
   * @method getRotation
   * @param {Array} start array of touches
   * @param {Array} end array of touches
   * @return {Number} rotation
   */
  getRotation: function getRotation(start, end) {
    // need two fingers
    if(start.length >= 2 && end.length >= 2) {
      return this.getAngle(end[1], end[0]) - this.getAngle(start[1], start[0]);
    }
    return 0;
  },

  /**
   * find out if the direction is vertical   *
   * @method isVertical
   * @param {String} direction matches `DIRECTION_UP|DOWN`
   * @return {Boolean} is_vertical
   */
  isVertical: function isVertical(direction) {
    return direction == DIRECTION_UP || direction == DIRECTION_DOWN;
  },

  /**
   * set css properties with their prefixes
   * @param {HTMLElement} element
   * @param {String} prop
   * @param {String} value
   * @param {Boolean} [toggle=true]
   * @return {Boolean}
   */
  setPrefixedCss: function setPrefixedCss(element, prop, value, toggle) {
    var prefixes = ['', 'Webkit', 'Moz', 'O', 'ms'];
    prop = Utils.toCamelCase(prop);

    for(var i = 0; i < prefixes.length; i++) {
      var p = prop;
      // prefixes
      if(prefixes[i]) {
        p = prefixes[i] + p.slice(0, 1).toUpperCase() + p.slice(1);
      }

      // test the style
      if(p in element.style) {
        element.style[p] = (toggle === null || toggle) && value || '';
        break;
      }
    }
  },

  /**
   * toggle browser default behavior by setting css properties.
   * `userSelect='none'` also sets `element.onselectstart` to false
   * `userDrag='none'` also sets `element.ondragstart` to false
   *
   * @method toggleBehavior
   * @param {HtmlElement} element
   * @param {Object} props
   * @param {Boolean} [toggle=true]
   */
  toggleBehavior: function toggleBehavior(element, props, toggle) {
    if(!props || !element || !element.style) {
      return;
    }

    // set the css properties
    Utils.each(props, function(value, prop) {
      Utils.setPrefixedCss(element, prop, value, toggle);
    });

    var falseFn = toggle && function() {
      return false;
    };

    // also the disable onselectstart
    if(props.userSelect == 'none') {
      element.onselectstart = falseFn;
    }
    // and disable ondragstart
    if(props.userDrag == 'none') {
      element.ondragstart = falseFn;
    }
  },

  /**
   * convert a string with underscores to camelCase
   * so prevent_default becomes preventDefault
   * @param {String} str
   * @return {String} camelCaseStr
   */
  toCamelCase: function toCamelCase(str) {
    return str.replace(/[_-]([a-z])/g, function(s) {
      return s[1].toUpperCase();
    });
  }
};


/**
 * @module GestureDetector
 */
/**
 * @class Event
 * @static
 */
var Event = GestureDetector.event = {
  /**
   * when touch events have been fired, this is true
   * this is used to stop mouse events
   * @property prevent_mouseevents
   * @private
   * @type {Boolean}
   */
  preventMouseEvents: false,

  /**
   * if EVENT_START has been fired
   * @property started
   * @private
   * @type {Boolean}
   */
  started: false,

  /**
   * when the mouse is hold down, this is true
   * @property should_detect
   * @private
   * @type {Boolean}
   */
  shouldDetect: false,

  /**
   * simple event binder with a hook and support for multiple types
   * @method on
   * @param {HTMLElement} element
   * @param {String} type
   * @param {Function} handler
   * @param {Function} [hook]
   * @param {Object} hook.type
   */
  on: function on(element, type, handler, hook) {
    var types = type.split(' ');
    Utils.each(types, function(type) {
      Utils.on(element, type, handler);
      hook && hook(type);
    });
  },

  /**
   * simple event unbinder with a hook and support for multiple types
   * @method off
   * @param {HTMLElement} element
   * @param {String} type
   * @param {Function} handler
   * @param {Function} [hook]
   * @param {Object} hook.type
   */
  off: function off(element, type, handler, hook) {
    var types = type.split(' ');
    Utils.each(types, function(type) {
      Utils.off(element, type, handler);
      hook && hook(type);
    });
  },

  /**
   * the core touch event handler.
   * this finds out if we should to detect gestures
   * @method onTouch
   * @param {HTMLElement} element
   * @param {String} eventType matches `EVENT_START|MOVE|END`
   * @param {Function} handler
   * @return onTouchHandler {Function} the core event handler
   */
  onTouch: function onTouch(element, eventType, handler) {
    var self = this;

    var onTouchHandler = function onTouchHandler(ev) {
      var srcType = ev.type.toLowerCase(),
          isPointer = GestureDetector.HAS_POINTEREVENTS,
          isMouse = Utils.inStr(srcType, 'mouse'),
          triggerType;

      // if we are in a mouseevent, but there has been a touchevent triggered in this session
      // we want to do nothing. simply break out of the event.
      if(isMouse && self.preventMouseEvents) {
        return;

        // mousebutton must be down
      } else if(isMouse && eventType == EVENT_START && ev.button === 0) {
        self.preventMouseEvents = false;
        self.shouldDetect = true;
      } else if(isPointer && eventType == EVENT_START) {
        self.shouldDetect = (ev.buttons === 1 || PointerEvent.matchType(POINTER_TOUCH, ev));
        // just a valid start event, but no mouse
      } else if(!isMouse && eventType == EVENT_START) {
        self.preventMouseEvents = true;
        self.shouldDetect = true;
      }

      // update the pointer event before entering the detection
      if(isPointer && eventType != EVENT_END) {
        PointerEvent.updatePointer(eventType, ev);
      }

      // we are in a touch/down state, so allowed detection of gestures
      if(self.shouldDetect) {
        triggerType = self.doDetect.call(self, ev, eventType, element, handler);
      }

      // ...and we are done with the detection
      // so reset everything to start each detection totally fresh
      if(triggerType == EVENT_END) {
        self.preventMouseEvents = false;
        self.shouldDetect = false;
        PointerEvent.reset();
        // update the pointerevent object after the detection
      }

      if(isPointer && eventType == EVENT_END) {
        PointerEvent.updatePointer(eventType, ev);
      }
    };

    this.on(element, EVENT_TYPES[eventType], onTouchHandler);
    return onTouchHandler;
  },

  /**
   * the core detection method
   * this finds out what GestureDetector-touch-events to trigger
   * @method doDetect
   * @param {Object} ev
   * @param {String} eventType matches `EVENT_START|MOVE|END`
   * @param {HTMLElement} element
   * @param {Function} handler
   * @return {String} triggerType matches `EVENT_START|MOVE|END`
   */
  doDetect: function doDetect(ev, eventType, element, handler) {
    var touchList = this.getTouchList(ev, eventType);
    var touchListLength = touchList.length;
    var triggerType = eventType;
    var triggerChange = touchList.trigger; // used by fakeMultitouch plugin
    var changedLength = touchListLength;

    // at each touchstart-like event we want also want to trigger a TOUCH event...
    if(eventType == EVENT_START) {
      triggerChange = EVENT_TOUCH;
      // ...the same for a touchend-like event
    } else if(eventType == EVENT_END) {
      triggerChange = EVENT_RELEASE;

      // keep track of how many touches have been removed
      changedLength = touchList.length - ((ev.changedTouches) ? ev.changedTouches.length : 1);
    }

    // after there are still touches on the screen,
    // we just want to trigger a MOVE event. so change the START or END to a MOVE
    // but only after detection has been started, the first time we actually want a START
    if(changedLength > 0 && this.started) {
      triggerType = EVENT_MOVE;
    }

    // detection has been started, we keep track of this, see above
    this.started = true;

    // generate some event data, some basic information
    var evData = this.collectEventData(element, triggerType, touchList, ev);

    // trigger the triggerType event before the change (TOUCH, RELEASE) events
    // but the END event should be at last
    if(eventType != EVENT_END) {
      handler.call(Detection, evData);
    }

    // trigger a change (TOUCH, RELEASE) event, this means the length of the touches changed
    if(triggerChange) {
      evData.changedLength = changedLength;
      evData.eventType = triggerChange;

      handler.call(Detection, evData);

      evData.eventType = triggerType;
      delete evData.changedLength;
    }

    // trigger the END event
    if(triggerType == EVENT_END) {
      handler.call(Detection, evData);

      // ...and we are done with the detection
      // so reset everything to start each detection totally fresh
      this.started = false;
    }

    return triggerType;
  },

  /**
   * we have different events for each device/browser
   * determine what we need and set them in the EVENT_TYPES constant
   * the `onTouch` method is bind to these properties.
   * @method determineEventTypes
   * @return {Object} events
   */
  determineEventTypes: function determineEventTypes() {
    var types;
    if(GestureDetector.HAS_POINTEREVENTS) {
      if(window.PointerEvent) {
        types = [
          'pointerdown',
          'pointermove',
          'pointerup pointercancel lostpointercapture'
        ];
      } else {
        types = [
          'MSPointerDown',
          'MSPointerMove',
          'MSPointerUp MSPointerCancel MSLostPointerCapture'
        ];
      }
    } else if(GestureDetector.NO_MOUSEEVENTS) {
      types = [
        'touchstart',
        'touchmove',
        'touchend touchcancel'
      ];
    } else {
      types = [
        'touchstart mousedown',
        'touchmove mousemove',
        'touchend touchcancel mouseup'
      ];
    }

    EVENT_TYPES[EVENT_START] = types[0];
    EVENT_TYPES[EVENT_MOVE] = types[1];
    EVENT_TYPES[EVENT_END] = types[2];
    return EVENT_TYPES;
  },

  /**
   * create touchList depending on the event
   * @method getTouchList
   * @param {Object} ev
   * @param {String} eventType
   * @return {Array} touches
   */
  getTouchList: function getTouchList(ev, eventType) {
    // get the fake pointerEvent touchlist
    if(GestureDetector.HAS_POINTEREVENTS) {
      return PointerEvent.getTouchList();
    }

    // get the touchlist
    if(ev.touches) {
      if(eventType == EVENT_MOVE) {
        return ev.touches;
      }

      var identifiers = [];
      var concat = [].concat(Utils.toArray(ev.touches), Utils.toArray(ev.changedTouches));
      var touchList = [];

      Utils.each(concat, function(touch) {
        if(Utils.inArray(identifiers, touch.identifier) === false) {
          touchList.push(touch);
        }
        identifiers.push(touch.identifier);
      });

      return touchList;
    }

    // make fake touchList from mouse position
    ev.identifier = 1;
    return [ev];
  },

  /**
   * collect basic event data
   * @method collectEventData
   * @param {HTMLElement} element
   * @param {String} eventType matches `EVENT_START|MOVE|END`
   * @param {Array} touches
   * @param {Object} ev
   * @return {Object} ev
   */
  collectEventData: function collectEventData(element, eventType, touches, ev) {
    // find out pointerType
    var pointerType = POINTER_TOUCH;
    if(Utils.inStr(ev.type, 'mouse') || PointerEvent.matchType(POINTER_MOUSE, ev)) {
      pointerType = POINTER_MOUSE;
    } else if(PointerEvent.matchType(POINTER_PEN, ev)) {
      pointerType = POINTER_PEN;
    }

    return {
      center: Utils.getCenter(touches),
      timeStamp: Date.now(),
      target: ev.target,
      touches: touches,
      eventType: eventType,
      pointerType: pointerType,
      srcEvent: ev,

      /**
       * prevent the browser default actions
       * mostly used to disable scrolling of the browser
       */
      preventDefault: function() {
        var srcEvent = this.srcEvent;
        srcEvent.preventManipulation && srcEvent.preventManipulation();
        srcEvent.preventDefault && srcEvent.preventDefault();
      },

      /**
       * stop bubbling the event up to its parents
       */
      stopPropagation: function() {
        this.srcEvent.stopPropagation();
      },

      /**
       * immediately stop gesture detection
       * might be useful after a swipe was detected
       * @return {*}
       */
      stopDetect: function() {
        return Detection.stopDetect();
      }
    };
  }
};


/**
 * @module GestureDetector
 *
 * @class PointerEvent
 * @static
 */
var PointerEvent = GestureDetector.PointerEvent = {
  /**
   * holds all pointers, by `identifier`
   * @property pointers
   * @type {Object}
   */
  pointers: {},

  /**
   * get the pointers as an array
   * @method getTouchList
   * @return {Array} touchlist
   */
  getTouchList: function getTouchList() {
    var touchlist = [];
    // we can use forEach since pointerEvents only is in IE10
    Utils.each(this.pointers, function(pointer) {
      touchlist.push(pointer);
    });
    return touchlist;
  },

  /**
   * update the position of a pointer
   * @method updatePointer
   * @param {String} eventType matches `EVENT_START|MOVE|END`
   * @param {Object} pointerEvent
   */
  updatePointer: function updatePointer(eventType, pointerEvent) {
    if(eventType == EVENT_END || (eventType != EVENT_END && pointerEvent.buttons !== 1)) {
      delete this.pointers[pointerEvent.pointerId];
    } else {
      pointerEvent.identifier = pointerEvent.pointerId;
      this.pointers[pointerEvent.pointerId] = pointerEvent;
    }
  },

  /**
   * check if ev matches pointertype
   * @method matchType
   * @param {String} pointerType matches `POINTER_MOUSE|TOUCH|PEN`
   * @param {PointerEvent} ev
   */
  matchType: function matchType(pointerType, ev) {
    if(!ev.pointerType) {
      return false;
    }

    var pt = ev.pointerType,
        types = {};

    types[POINTER_MOUSE] = (pt === (ev.MSPOINTER_TYPE_MOUSE || POINTER_MOUSE));
    types[POINTER_TOUCH] = (pt === (ev.MSPOINTER_TYPE_TOUCH || POINTER_TOUCH));
    types[POINTER_PEN] = (pt === (ev.MSPOINTER_TYPE_PEN || POINTER_PEN));
    return types[pointerType];
  },

  /**
   * reset the stored pointers
   * @method reset
   */
  reset: function resetList() {
    this.pointers = {};
  }
};


/**
 * @module GestureDetector
 *
 * @class Detection
 * @static
 */
var Detection = GestureDetector.detection = {
  // contains all registered GestureDetector.gestures in the correct order
  gestures: [],

  // data of the current GestureDetector.gesture detection session
  current: null,

  // the previous GestureDetector.gesture session data
  // is a full clone of the previous gesture.current object
  previous: null,

  // when this becomes true, no gestures are fired
  stopped: false,

  /**
   * start GestureDetector.gesture detection
   * @method startDetect
   * @param {GestureDetector.Instance} inst
   * @param {Object} eventData
   */
  startDetect: function startDetect(inst, eventData) {
    // already busy with a GestureDetector.gesture detection on an element
    if(this.current) {
      return;
    }

    this.stopped = false;

    // holds current session
    this.current = {
      inst: inst, // reference to GestureDetectorInstance we're working for
      startEvent: Utils.extend({}, eventData), // start eventData for distances, timing etc
      lastEvent: false, // last eventData
      lastCalcEvent: false, // last eventData for calculations.
      futureCalcEvent: false, // last eventData for calculations.
      lastCalcData: {}, // last lastCalcData
      name: '' // current gesture we're in/detected, can be 'tap', 'hold' etc
    };

    this.detect(eventData);
  },

  /**
   * GestureDetector.gesture detection
   * @method detect
   * @param {Object} eventData
   * @return {any}
   */
  detect: function detect(eventData) {
    if(!this.current || this.stopped) {
      return;
    }

    // extend event data with calculations about scale, distance etc
    eventData = this.extendEventData(eventData);

    // GestureDetector instance and instance options
    var inst = this.current.inst,
        instOptions = inst.options;

    // call GestureDetector.gesture handlers
    Utils.each(this.gestures, function triggerGesture(gesture) {
      // only when the instance options have enabled this gesture
      if(!this.stopped && inst.enabled && instOptions[gesture.name]) {
        gesture.handler.call(gesture, eventData, inst);
      }
    }, this);

    // store as previous event event
    if(this.current) {
      this.current.lastEvent = eventData;
    }

    if(eventData.eventType == EVENT_END) {
      this.stopDetect();
    }

    return eventData;
  },

  /**
   * clear the GestureDetector.gesture vars
   * this is called on endDetect, but can also be used when a final GestureDetector.gesture has been detected
   * to stop other GestureDetector.gestures from being fired
   * @method stopDetect
   */
  stopDetect: function stopDetect() {
    // clone current data to the store as the previous gesture
    // used for the double tap gesture, since this is an other gesture detect session
    this.previous = Utils.extend({}, this.current);

    // reset the current
    this.current = null;
    this.stopped = true;
  },

  /**
   * calculate velocity, angle and direction
   * @method getVelocityData
   * @param {Object} ev
   * @param {Object} center
   * @param {Number} deltaTime
   * @param {Number} deltaX
   * @param {Number} deltaY
   */
  getCalculatedData: function getCalculatedData(ev, center, deltaTime, deltaX, deltaY) {
    var cur = this.current,
        recalc = false,
        calcEv = cur.lastCalcEvent,
        calcData = cur.lastCalcData;

    if(calcEv && ev.timeStamp - calcEv.timeStamp > GestureDetector.CALCULATE_INTERVAL) {
      center = calcEv.center;
      deltaTime = ev.timeStamp - calcEv.timeStamp;
      deltaX = ev.center.clientX - calcEv.center.clientX;
      deltaY = ev.center.clientY - calcEv.center.clientY;
      recalc = true;
    }

    if(ev.eventType == EVENT_TOUCH || ev.eventType == EVENT_RELEASE) {
      cur.futureCalcEvent = ev;
    }

    if(!cur.lastCalcEvent || recalc) {
      calcData.velocity = Utils.getVelocity(deltaTime, deltaX, deltaY);
      calcData.angle = Utils.getAngle(center, ev.center);
      calcData.direction = Utils.getDirection(center, ev.center);

      cur.lastCalcEvent = cur.futureCalcEvent || ev;
      cur.futureCalcEvent = ev;
    }

    ev.velocityX = calcData.velocity.x;
    ev.velocityY = calcData.velocity.y;
    ev.interimAngle = calcData.angle;
    ev.interimDirection = calcData.direction;
  },

  /**
   * extend eventData for GestureDetector.gestures
   * @method extendEventData
   * @param {Object} ev
   * @return {Object} ev
   */
  extendEventData: function extendEventData(ev) {
    var cur = this.current,
        startEv = cur.startEvent,
        lastEv = cur.lastEvent || startEv;

    // update the start touchlist to calculate the scale/rotation
    if(ev.eventType == EVENT_TOUCH || ev.eventType == EVENT_RELEASE) {
      startEv.touches = [];
      Utils.each(ev.touches, function(touch) {
        startEv.touches.push({
          clientX: touch.clientX,
          clientY: touch.clientY
        });
      });
    }

    var deltaTime = ev.timeStamp - startEv.timeStamp,
        deltaX = ev.center.clientX - startEv.center.clientX,
        deltaY = ev.center.clientY - startEv.center.clientY;

    this.getCalculatedData(ev, lastEv.center, deltaTime, deltaX, deltaY);

    Utils.extend(ev, {
      startEvent: startEv,

      deltaTime: deltaTime,
      deltaX: deltaX,
      deltaY: deltaY,

      distance: Utils.getDistance(startEv.center, ev.center),
      angle: Utils.getAngle(startEv.center, ev.center),
      direction: Utils.getDirection(startEv.center, ev.center),
      scale: Utils.getScale(startEv.touches, ev.touches),
      rotation: Utils.getRotation(startEv.touches, ev.touches)
    });

    return ev;
  },

  /**
   * register new gesture
   * @method register
   * @param {Object} gesture object, see `gestures/` for documentation
   * @return {Array} gestures
   */
  register: function register(gesture) {
    // add an enable gesture options if there is no given
    var options = gesture.defaults || {};
    if(options[gesture.name] === undefined) {
      options[gesture.name] = true;
    }

    // extend GestureDetector default options with the GestureDetector.gesture options
    Utils.extend(GestureDetector.defaults, options, true);

    // set its index
    gesture.index = gesture.index || 1000;

    // add GestureDetector.gesture to the list
    this.gestures.push(gesture);

    // sort the list by index
    this.gestures.sort(function(a, b) {
      if(a.index < b.index) {
        return -1;
      }
      if(a.index > b.index) {
        return 1;
      }
      return 0;
    });

    return this.gestures;
  }
};


/**
 * @module GestureDetector
 */

/**
 * create new GestureDetector instance
 * all methods should return the instance itself, so it is chainable.
 *
 * @class Instance
 * @constructor
 * @param {HTMLElement} element
 * @param {Object} [options={}] options are merged with `GestureDetector.defaults`
 * @return {GestureDetector.Instance}
 */
GestureDetector.Instance = function(element, options) {
  var self = this;

  // setup GestureDetectorJS window events and register all gestures
  // this also sets up the default options
  setup();

  /**
   * @property element
   * @type {HTMLElement}
   */
  this.element = element;

  /**
   * @property enabled
   * @type {Boolean}
   * @protected
   */
  this.enabled = true;

  /**
   * options, merged with the defaults
   * options with an _ are converted to camelCase
   * @property options
   * @type {Object}
   */
  Utils.each(options, function(value, name) {
    delete options[name];
    options[Utils.toCamelCase(name)] = value;
  });

  this.options = Utils.extend(Utils.extend({}, GestureDetector.defaults), options || {});

  // add some css to the element to prevent the browser from doing its native behavior
  if(this.options.behavior) {
    Utils.toggleBehavior(this.element, this.options.behavior, true);
  }

  /**
   * event start handler on the element to start the detection
   * @property eventStartHandler
   * @type {Object}
   */
  this.eventStartHandler = Event.onTouch(element, EVENT_START, function(ev) {
    if(self.enabled && ev.eventType == EVENT_START) {
      Detection.startDetect(self, ev);
    } else if(ev.eventType == EVENT_TOUCH) {
      Detection.detect(ev);
    }
  });

  /**
   * keep a list of user event handlers which needs to be removed when calling 'dispose'
   * @property eventHandlers
   * @type {Array}
   */
  this.eventHandlers = [];
};

GestureDetector.Instance.prototype = {
  /**
   * bind events to the instance
   * @method on
   * @chainable
   * @param {String} gestures multiple gestures by splitting with a space
   * @param {Function} handler
   * @param {Object} handler.ev event object
   */
  on: function onEvent(gestures, handler) {
    var self = this;
    Event.on(self.element, gestures, handler, function(type) {
      self.eventHandlers.push({ gesture: type, handler: handler });
    });
    return self;
  },

  /**
   * unbind events to the instance
   * @method off
   * @chainable
   * @param {String} gestures
   * @param {Function} handler
   */
  off: function offEvent(gestures, handler) {
    var self = this;

    Event.off(self.element, gestures, handler, function(type) {
      var index = Utils.inArray({ gesture: type, handler: handler });
      if(index !== false) {
        self.eventHandlers.splice(index, 1);
      }
    });
    return self;
  },

  /**
   * trigger gesture event
   * @method trigger
   * @chainable
   * @param {String} gesture
   * @param {Object} [eventData]
   */
  trigger: function triggerEvent(gesture, eventData) {
    // optional
    if(!eventData) {
      eventData = {};
    }

    // create DOM event
    var event = GestureDetector.DOCUMENT.createEvent('Event');
    event.initEvent(gesture, true, true);
    event.gesture = eventData;

    // trigger on the target if it is in the instance element,
    // this is for event delegation tricks
    var element = this.element;
    if(Utils.hasParent(eventData.target, element)) {
      element = eventData.target;
    }

    element.dispatchEvent(event);
    return this;
  },

  /**
   * enable of disable GestureDetector.js detection
   * @method enable
   * @chainable
   * @param {Boolean} state
   */
  enable: function enable(state) {
    this.enabled = state;
    return this;
  },

  /**
   * dispose this GestureDetector instance
   * @method dispose
   * @return {Null}
   */
  dispose: function dispose() {
    var i, eh;

    // undo all changes made by stop_browser_behavior
    Utils.toggleBehavior(this.element, this.options.behavior, false);

    // unbind all custom event handlers
    for(i = -1; (eh = this.eventHandlers[++i]);) {
      Utils.off(this.element, eh.gesture, eh.handler);
    }

    this.eventHandlers = [];

    // unbind the start event listener
    Event.off(this.element, EVENT_TYPES[EVENT_START], this.eventStartHandler);

    return null;
  }
};


/**
 * @module gestures
 */
/**
 * Move with x fingers (default 1) around on the page.
 * Preventing the default browser behavior is a good way to improve feel and working.
 * ````
 *  GestureDetectortime.on("drag", function(ev) {
 *    console.log(ev);
 *    ev.gesture.preventDefault();
 *  });
 * ````
 *
 * @class Drag
 * @static
 */
/**
 * @event drag
 * @param {Object} ev
 */
/**
 * @event dragstart
 * @param {Object} ev
 */
/**
 * @event dragend
 * @param {Object} ev
 */
/**
 * @event drapleft
 * @param {Object} ev
 */
/**
 * @event dragright
 * @param {Object} ev
 */
/**
 * @event dragup
 * @param {Object} ev
 */
/**
 * @event dragdown
 * @param {Object} ev
 */

/**
 * @param {String} name
 */
(function(name) {
  var triggered = false;

  function dragGesture(ev, inst) {
    var cur = Detection.current;

    // max touches
    if(inst.options.dragMaxTouches > 0 &&
      ev.touches.length > inst.options.dragMaxTouches) {
      return;
    }

    switch(ev.eventType) {
    case EVENT_START:
      triggered = false;
      break;

    case EVENT_MOVE:
      // when the distance we moved is too small we skip this gesture
      // or we can be already in dragging
      if(ev.distance < inst.options.dragMinDistance &&
        cur.name != name) {
        return;
      }

      var startCenter = cur.startEvent.center;

      // we are dragging!
      if(cur.name != name) {
        cur.name = name;
        if(inst.options.dragDistanceCorrection && ev.distance > 0) {
          // When a drag is triggered, set the event center to dragMinDistance pixels from the original event center.
          // Without this correction, the dragged distance would jumpstart at dragMinDistance pixels instead of at 0.
          // It might be useful to save the original start point somewhere
          var factor = Math.abs(inst.options.dragMinDistance / ev.distance);
          startCenter.pageX += ev.deltaX * factor;
          startCenter.pageY += ev.deltaY * factor;
          startCenter.clientX += ev.deltaX * factor;
          startCenter.clientY += ev.deltaY * factor;

          // recalculate event data using new start point
          ev = Detection.extendEventData(ev);
        }
      }

      // lock drag to axis?
      if(cur.lastEvent.dragLockToAxis ||
        ( inst.options.dragLockToAxis &&
          inst.options.dragLockMinDistance <= ev.distance
        )) {
          ev.dragLockToAxis = true;
        }

        // keep direction on the axis that the drag gesture started on
        var lastDirection = cur.lastEvent.direction;
        if(ev.dragLockToAxis && lastDirection !== ev.direction) {
          if(Utils.isVertical(lastDirection)) {
            ev.direction = (ev.deltaY < 0) ? DIRECTION_UP : DIRECTION_DOWN;
          } else {
            ev.direction = (ev.deltaX < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
          }
        }

        // first time, trigger dragstart event
        if(!triggered) {
          inst.trigger(name + 'start', ev);
          triggered = true;
        }

        // trigger events
        inst.trigger(name, ev);
        inst.trigger(name + ev.direction, ev);

        var isVertical = Utils.isVertical(ev.direction);

        // block the browser events
        if((inst.options.dragBlockVertical && isVertical) ||
          (inst.options.dragBlockHorizontal && !isVertical)) {
          ev.preventDefault();
        }
        break;

      case EVENT_RELEASE:
        if(triggered && ev.changedLength <= inst.options.dragMaxTouches) {
          inst.trigger(name + 'end', ev);
          triggered = false;
        }
        break;

      case EVENT_END:
        triggered = false;
        break;
      }
    }

    GestureDetector.gestures.Drag = {
      name: name,
      index: 50,
      handler: dragGesture,
      defaults: {
        /**
         * minimal movement that have to be made before the drag event gets triggered
         * @property dragMinDistance
         * @type {Number}
         * @default 10
         */
        dragMinDistance: 10,

        /**
         * Set dragDistanceCorrection to true to make the starting point of the drag
         * be calculated from where the drag was triggered, not from where the touch started.
         * Useful to avoid a jerk-starting drag, which can make fine-adjustments
         * through dragging difficult, and be visually unappealing.
         * @property dragDistanceCorrection
         * @type {Boolean}
         * @default true
         */
        dragDistanceCorrection: true,

        /**
         * set 0 for unlimited, but this can conflict with transform
         * @property dragMaxTouches
         * @type {Number}
         * @default 1
         */
        dragMaxTouches: 1,

        /**
         * prevent default browser behavior when dragging occurs
         * be careful with it, it makes the element a blocking element
         * when you are using the drag gesture, it is a good practice to set this true
         * @property dragBlockHorizontal
         * @type {Boolean}
         * @default false
         */
        dragBlockHorizontal: false,

        /**
         * same as `dragBlockHorizontal`, but for vertical movement
         * @property dragBlockVertical
         * @type {Boolean}
         * @default false
         */
        dragBlockVertical: false,

        /**
         * dragLockToAxis keeps the drag gesture on the axis that it started on,
         * It disallows vertical directions if the initial direction was horizontal, and vice versa.
         * @property dragLockToAxis
         * @type {Boolean}
         * @default false
         */
        dragLockToAxis: false,

        /**
         * drag lock only kicks in when distance > dragLockMinDistance
         * This way, locking occurs only when the distance has become large enough to reliably determine the direction
         * @property dragLockMinDistance
         * @type {Number}
         * @default 25
         */
        dragLockMinDistance: 25
      }
    };
  })('drag');

  /**
   * @module gestures
   */
  /**
   * trigger a simple gesture event, so you can do anything in your handler.
   * only usable if you know what your doing...
   *
   * @class Gesture
   * @static
   */
  /**
   * @event gesture
   * @param {Object} ev
   */
  GestureDetector.gestures.Gesture = {
    name: 'gesture',
    index: 1337,
    handler: function releaseGesture(ev, inst) {
      inst.trigger(this.name, ev);
    }
  };

  /**
   * @module gestures
   */
  /**
   * Touch stays at the same place for x time
   *
   * @class Hold
   * @static
   */
  /**
   * @event hold
   * @param {Object} ev
   */

  /**
   * @param {String} name
   */
  (function(name) {
    var timer;

    function holdGesture(ev, inst) {
      var options = inst.options,
          current = Detection.current;

      switch(ev.eventType) {
      case EVENT_START:
        clearTimeout(timer);

        // set the gesture so we can check in the timeout if it still is
        current.name = name;

        // set timer and if after the timeout it still is hold,
        // we trigger the hold event
        timer = setTimeout(function() {
          if(current && current.name == name) {
            inst.trigger(name, ev);
          }
        }, options.holdTimeout);
        break;

      case EVENT_MOVE:
        if(ev.distance > options.holdThreshold) {
          clearTimeout(timer);
        }
        break;

      case EVENT_RELEASE:
        clearTimeout(timer);
        break;
      }
    }

    GestureDetector.gestures.Hold = {
      name: name,
      index: 10,
      defaults: {
        /**
         * @property holdTimeout
         * @type {Number}
         * @default 500
         */
        holdTimeout: 500,

        /**
         * movement allowed while holding
         * @property holdThreshold
         * @type {Number}
         * @default 2
         */
        holdThreshold: 2
      },
      handler: holdGesture
    };
  })('hold');

  /**
   * @module gestures
   */
  /**
   * when a touch is being released from the page
   *
   * @class Release
   * @static
   */
  /**
   * @event release
   * @param {Object} ev
   */
  GestureDetector.gestures.Release = {
    name: 'release',
    index: Infinity,
    handler: function releaseGesture(ev, inst) {
      if(ev.eventType == EVENT_RELEASE) {
        inst.trigger(this.name, ev);
      }
    }
  };

  /**
   * @module gestures
   */
  /**
   * triggers swipe events when the end velocity is above the threshold
   * for best usage, set `preventDefault` (on the drag gesture) to `true`
   * ````
   *  GestureDetectortime.on("dragleft swipeleft", function(ev) {
   *    console.log(ev);
   *    ev.gesture.preventDefault();
   *  });
   * ````
   *
   * @class Swipe
   * @static
   */
  /**
   * @event swipe
   * @param {Object} ev
   */
  /**
   * @event swipeleft
   * @param {Object} ev
   */
  /**
   * @event swiperight
   * @param {Object} ev
   */
  /**
   * @event swipeup
   * @param {Object} ev
   */
  /**
   * @event swipedown
   * @param {Object} ev
   */
  GestureDetector.gestures.Swipe = {
    name: 'swipe',
    index: 40,
    defaults: {
      /**
       * @property swipeMinTouches
       * @type {Number}
       * @default 1
       */
      swipeMinTouches: 1,

      /**
       * @property swipeMaxTouches
       * @type {Number}
       * @default 1
       */
      swipeMaxTouches: 1,

      /**
       * horizontal swipe velocity
       * @property swipeVelocityX
       * @type {Number}
       * @default 0.6
       */
      swipeVelocityX: 0.6,

      /**
       * vertical swipe velocity
       * @property swipeVelocityY
       * @type {Number}
       * @default 0.6
       */
      swipeVelocityY: 0.6
    },

    handler: function swipeGesture(ev, inst) {
      if(ev.eventType == EVENT_RELEASE) {
        var touches = ev.touches.length,
            options = inst.options;

        // max touches
        if(touches < options.swipeMinTouches ||
          touches > options.swipeMaxTouches) {
          return;
        }

        // when the distance we moved is too small we skip this gesture
        // or we can be already in dragging
        if(ev.velocityX > options.swipeVelocityX ||
          ev.velocityY > options.swipeVelocityY) {
          // trigger swipe events
          inst.trigger(this.name, ev);
          inst.trigger(this.name + ev.direction, ev);
        }
      }
    }
  };

  /**
   * @module gestures
   */
  /**
   * Single tap and a double tap on a place
   *
   * @class Tap
   * @static
   */
  /**
   * @event tap
   * @param {Object} ev
   */
  /**
   * @event doubletap
   * @param {Object} ev
   */

  /**
   * @param {String} name
   */
  (function(name) {
    var hasMoved = false;

    function tapGesture(ev, inst) {
      var options = inst.options,
          current = Detection.current,
          prev = Detection.previous,
          sincePrev,
          didDoubleTap;

      switch(ev.eventType) {
      case EVENT_START:
        hasMoved = false;
        break;

      case EVENT_MOVE:
        hasMoved = hasMoved || (ev.distance > options.tapMaxDistance);
        break;

      case EVENT_END:
        if(!Utils.inStr(ev.srcEvent.type, 'cancel') && ev.deltaTime < options.tapMaxTime && !hasMoved) {
          // previous gesture, for the double tap since these are two different gesture detections
          sincePrev = prev && prev.lastEvent && ev.timeStamp - prev.lastEvent.timeStamp;
          didDoubleTap = false;

          // check if double tap
          if(prev && prev.name == name &&
            (sincePrev && sincePrev < options.doubleTapInterval) &&
            ev.distance < options.doubleTapDistance) {
            inst.trigger('doubletap', ev);
            didDoubleTap = true;
          }

          // do a single tap
          if(!didDoubleTap || options.tapAlways) {
            current.name = name;
            inst.trigger(current.name, ev);
          }
        }
        break;
      }
    }

    GestureDetector.gestures.Tap = {
      name: name,
      index: 100,
      handler: tapGesture,
      defaults: {
        /**
         * max time of a tap, this is for the slow tappers
         * @property tapMaxTime
         * @type {Number}
         * @default 250
         */
        tapMaxTime: 250,

        /**
         * max distance of movement of a tap, this is for the slow tappers
         * @property tapMaxDistance
         * @type {Number}
         * @default 10
         */
        tapMaxDistance: 10,

        /**
         * always trigger the `tap` event, even while double-tapping
         * @property tapAlways
         * @type {Boolean}
         * @default true
         */
        tapAlways: true,

        /**
         * max distance between two taps
         * @property doubleTapDistance
         * @type {Number}
         * @default 20
         */
        doubleTapDistance: 20,

        /**
         * max time between two taps
         * @property doubleTapInterval
         * @type {Number}
         * @default 300
         */
        doubleTapInterval: 300
      }
    };
  })('tap');

  /**
   * @module gestures
   */
  /**
   * when a touch is being touched at the page
   *
   * @class Touch
   * @static
   */
  /**
   * @event touch
   * @param {Object} ev
   */
  GestureDetector.gestures.Touch = {
    name: 'touch',
    index: -Infinity,
    defaults: {
      /**
       * call preventDefault at touchstart, and makes the element blocking by disabling the scrolling of the page,
       * but it improves gestures like transforming and dragging.
       * be careful with using this, it can be very annoying for users to be stuck on the page
       * @property preventDefault
       * @type {Boolean}
       * @default false
       */
      preventDefault: false,

      /**
       * disable mouse events, so only touch (or pen!) input triggers events
       * @property preventMouse
       * @type {Boolean}
       * @default false
       */
      preventMouse: false
    },
    handler: function touchGesture(ev, inst) {
      if(inst.options.preventMouse && ev.pointerType == POINTER_MOUSE) {
        ev.stopDetect();
        return;
      }

      if(inst.options.preventDefault) {
        ev.preventDefault();
      }

      if(ev.eventType == EVENT_TOUCH) {
        inst.trigger('touch', ev);
      }
    }
  };

  /**
   * @module gestures
   */
  /**
   * User want to scale or rotate with 2 fingers
   * Preventing the default browser behavior is a good way to improve feel and working. This can be done with the
   * `preventDefault` option.
   *
   * @class Transform
   * @static
   */
  /**
   * @event transform
   * @param {Object} ev
   */
  /**
   * @event transformstart
   * @param {Object} ev
   */
  /**
   * @event transformend
   * @param {Object} ev
   */
  /**
   * @event pinchin
   * @param {Object} ev
   */
  /**
   * @event pinchout
   * @param {Object} ev
   */
  /**
   * @event rotate
   * @param {Object} ev
   */

  /**
   * @param {String} name
   */
  (function(name) {
    var triggered = false;

    function transformGesture(ev, inst) {
      switch(ev.eventType) {
      case EVENT_START:
        triggered = false;
        break;

      case EVENT_MOVE:
        // at least multitouch
        if(ev.touches.length < 2) {
          return;
        }

        var scaleThreshold = Math.abs(1 - ev.scale);
        var rotationThreshold = Math.abs(ev.rotation);

        // when the distance we moved is too small we skip this gesture
        // or we can be already in dragging
        if(scaleThreshold < inst.options.transformMinScale &&
          rotationThreshold < inst.options.transformMinRotation) {
          return;
        }

        // we are transforming!
        Detection.current.name = name;

        // first time, trigger dragstart event
        if(!triggered) {
          inst.trigger(name + 'start', ev);
          triggered = true;
        }

        inst.trigger(name, ev); // basic transform event

        // trigger rotate event
        if(rotationThreshold > inst.options.transformMinRotation) {
          inst.trigger('rotate', ev);
        }

        // trigger pinch event
        if(scaleThreshold > inst.options.transformMinScale) {
          inst.trigger('pinch', ev);
          inst.trigger('pinch' + (ev.scale < 1 ? 'in' : 'out'), ev);
        }
        break;

      case EVENT_RELEASE:
        if(triggered && ev.changedLength < 2) {
          inst.trigger(name + 'end', ev);
          triggered = false;
        }
        break;
      }
    }

    GestureDetector.gestures.Transform = {
      name: name,
      index: 45,
      defaults: {
        /**
         * minimal scale factor, no scale is 1, zoomin is to 0 and zoomout until higher then 1
         * @property transformMinScale
         * @type {Number}
         * @default 0.01
         */
        transformMinScale: 0.01,

        /**
         * rotation in degrees
         * @property transformMinRotation
         * @type {Number}
         * @default 1
         */
        transformMinRotation: 1
      },

      handler: transformGesture
    };
  })('transform');

  // AMD export
  if(typeof define == 'function' && define.amd) {
    define(function() {
      return GestureDetector;
    });
    // commonjs export
  } else if(typeof module !== 'undefined' && module.exports) {
    module.exports = GestureDetector;
    // browser export
  } else {
    window.ons = window.ons || {};
    window.ons.GestureDetector = GestureDetector;
  }

})(window);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * Minimal utility library for manipulating element's style.
 */
window.styler = (function() {
  'use strict';

  var styler = function(element, style) {
    return styler.css.apply(styler, arguments);
  };

  /**
   * Set element's style.
   *
   * @param {Element} element
   * @param {Object} styles
   * @return {Element}
   */
  styler.css = function(element, styles) {
    var keys = Object.keys(styles);
    keys.forEach(function(key) {
      if (key in element.style) {
        element.style[key] = styles[key];
      } else if (styler._prefix(key) in element.style) {
        element.style[styler._prefix(key)] = styles[key];
      } else {
        console.warn('No such style property: ' + key);
      }
    });
    return element;
  };

  /**
   * Add vendor prefix.
   *
   * @param {String} name
   * @return {String}
   */
  styler._prefix = (function() {
    var styles = window.getComputedStyle(document.documentElement, '');
    var prefix = (Array.prototype.slice
      .call(styles)
      .join('')
      .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
    )[1];

    return function(name) {
      return prefix + name.substr(0, 1).toUpperCase() + name.substr(1);
    };
  })();

  /**
   * @param {Element} element
   */
  styler.clear = function(element) {
    styler._clear(element);
  };

  /**
   * @param {Element} element
   */
  styler._clear = function(element) {
    var len = element.style.length;
    var style = element.style;
    var keys = [];
    for (var i = 0; i < len; i++) {
      keys.push(style[i]);
    }

    keys.forEach(function(key) {
      style[key] = '';
    });
  };

  return styler;

})();

'use strict';

(function (ons) {

  // fastclick
  window.addEventListener('load', function () {
    return FastClick.attach(document.body);
  }, false);

  // ons._defaultDeviceBackButtonHandler
  window.addEventListener('DOMContentLoaded', function () {
    ons._defaultDeviceBackButtonHandler = ons._deviceBackButtonDispatcher.createHandler(window.document.body, function () {
      navigator.app.exitApp();
    });
  }, false);

  // setup loading placeholder
  ons.ready(function () {
    ons._setupLoadingPlaceHolders();
  });

  // viewport.js
  new Viewport().setup();

  // modernize
  Modernizr.testStyles('#modernizr { -webkit-overflow-scrolling:touch }', function (elem, rule) {
    Modernizr.addTest('overflowtouch', window.getComputedStyle && window.getComputedStyle(elem).getPropertyValue('-webkit-overflow-scrolling') == 'touch');
  });

  // BaseElement
  if (typeof HTMLElement !== 'function') {
    ons._BaseElement = function () {};
    ons._BaseElement.prototype = document.createElement('div');
  } else {
    ons._BaseElement = HTMLElement;
  }
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var util = ons._util;
  var ModifierUtil = ons._internal.ModifierUtil;
  var scheme = {
    '': 'alert-dialog--*',
    '.alert-dialog-title': 'alert-dialog-title--*',
    '.alert-dialog-content': 'alert-dialog-content--*',
    '.alert-dialog-footer': 'alert-dialog-footer--*',
    '.alert-dialog-button': 'alert-dialog-button--*',
    '.alert-dialog-footer--one': 'alert-dialog-footer--one--*',
    '.alert-dialog-button--one': 'alert-dialog-button--one--*',
    '.alert-dialog-button--primal': 'alert-dialog-button--primal--*'
  };
  var AnimatorFactory = ons._internal.AnimatorFactory;
  var AndroidAlertDialogAnimator = ons._internal.AndroidAlertDialogAnimator;
  var IOSAlertDialogAnimator = ons._internal.IOSAlertDialogAnimator;
  var SlideDialogAnimator = ons._internal.SlideDialogAnimator;
  var AlertDialogAnimator = ons._internal.AlertDialogAnimator;

  var AlertDialogElement = (function (_ons$_BaseElement) {
    _inherits(AlertDialogElement, _ons$_BaseElement);

    function AlertDialogElement() {
      _classCallCheck(this, AlertDialogElement);

      _get(Object.getPrototypeOf(AlertDialogElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(AlertDialogElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this._compile();
        this._mask = this._createMask(this.getAttribute('mask-color'));

        ModifierUtil.initModifier(this, scheme);

        this._animatorFactory = new AnimatorFactory({
          animators: OnsAlertDialogElement._animatorDict,
          baseClass: AlertDialogAnimator,
          baseClassName: 'AlertDialogAnimator',
          defaultAnimation: this.getAttribute('animation')
        });

        this._visible = false;
        this._doorLock = new DoorLock();
        this._boundCancel = this._cancel.bind(this);
      }
    }, {
      key: '_compile',
      value: function _compile() {
        this.style.display = 'none';
        this.style.zIndex = '20001';
        this.classList.add('alert-dialog');

        if (ons.platform.isAndroid()) {
          var modifier = this.hasAttribute('modifier') ? this.getAttribute('modifier') : '';
          this.setAttribute('modifier', (modifier + ' android').trim());
        }
      }

      /**
       * Disable or enable alert dialog.
       *
       * @param {Boolean}
       */
    }, {
      key: 'setDisabled',
      value: function setDisabled(disabled) {
        if (typeof disabled !== 'boolean') {
          throw new Error('Argument must be a boolean.');
        }

        if (disabled) {
          this.setAttribute('disabled', '');
        } else {
          this.removeAttribute('disabled');
        }
      }

      /**
       * True if alert dialog is disabled.
       *
       * @return {Boolean}
       */
    }, {
      key: 'isDisabled',
      value: function isDisabled() {
        return this.hasAttribute('disabled');
      }

      /**
       * Make alert dialog cancelable or uncancelable.
       *
       * @param {Boolean}
       */
    }, {
      key: 'setCancelable',
      value: function setCancelable(cancelable) {
        if (typeof cancelable !== 'boolean') {
          throw new Error('Argument must be a boolean.');
        }

        if (cancelable) {
          this.setAttribute('cancelable', '');
        } else {
          this.removeAttribute('cancelable');
        }
      }

      /**
       * Show alert dialog.
       *
       * @param {Object} [options]
       * @param {String} [options.animation] animation type
       * @param {Object} [options.animationOptions] animation options
       * @param {Function} [options.callback] callback after dialog is shown
       */
    }, {
      key: 'show',
      value: function show() {
        var _this = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var _cancel2 = false;
        var callback = options.callback || function () {};

        options.animationOptions = util.extend(options.animationOptions || {}, AnimatorFactory.parseAnimationOptionsString(this.getAttribute('animation-options')));

        util.triggerElementEvent(this, 'preshow', {
          alertDialog: this,
          cancel: function cancel() {
            _cancel2 = true;
          }
        });

        if (!_cancel2) {
          this._doorLock.waitUnlock(function () {
            var unlock = _this._doorLock.lock();

            _this._mask.style.display = 'block';
            _this._mask.style.opacity = 1;
            _this.style.display = 'block';

            var animator = _this._animatorFactory.newAnimator(options);
            animator.show(_this, function () {
              _this._visible = true;
              unlock();
              util.triggerElementEvent(_this, 'postshow', { alertDialog: _this });
              callback();
            });
          });
        }
      }

      /**
       * Hide alert dialog.
       *
       * @param {Object} [options]
       * @param {String} [options.animation] animation type
       * @param {Object} [options.animationOptions] animation options
       * @param {Function} [options.callback] callback after dialog is hidden
       */
    }, {
      key: 'hide',
      value: function hide() {
        var _this2 = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var _cancel3 = false;
        var callback = options.callback || function () {};

        util.triggerElementEvent(this, 'prehide', {
          alertDialog: this,
          cancel: function cancel() {
            _cancel3 = true;
          }
        });

        if (!_cancel3) {
          this._doorLock.waitUnlock(function () {
            var unlock = _this2._doorLock.lock();

            var animator = _this2._animatorFactory.newAnimator(options);
            animator.hide(_this2, function () {
              _this2.style.display = 'none';
              _this2._mask.style.display = 'none';
              _this2._visible = false;
              unlock();
              util.triggerElementEvent(_this2, 'posthide', { alertDialog: _this2 });
              callback();
            });
          });
        }
      }

      /**
       * True if alert dialog is visible.
       *
       * @return {Boolean}
       */
    }, {
      key: 'isShown',
      value: function isShown() {
        return this._visible;
      }

      /**
       * Destroy alert dialog.
       */
    }, {
      key: 'destroy',
      value: function destroy() {
        if (this.parentElement) {
          this.parentElement.removeChild(this);
        }

        if (this._mask.parentElement) {
          this._mask.parentElement.removeChild(this._mask);
        }
      }
    }, {
      key: 'isCancelable',
      value: function isCancelable() {
        return this.hasAttribute('cancelable');
      }
    }, {
      key: '_onDeviceBackButton',
      value: function _onDeviceBackButton(event) {
        if (this.isCancelable()) {
          this._cancel();
        } else {
          event.callParentHandler();
        }
      }
    }, {
      key: '_cancel',
      value: function _cancel() {
        var _this3 = this;

        if (this.isCancelable()) {
          this.hide({
            callback: function callback() {
              util.triggerElementEvent(_this3, 'cancel');
            }
          });
        }
      }
    }, {
      key: '_createMask',
      value: function _createMask(color) {
        this._mask = util.createElement('<div></div>');
        this._mask.classList.add('alert-dialog-mask');
        this._mask.style.zIndex = 20000;
        this._mask.style.display = 'none';

        if (color) {
          this._mask.style.backgroundColor = color;
        }

        document.body.appendChild(this._mask);
        return this._mask;
      }
    }, {
      key: 'attachedCallback',
      value: function attachedCallback() {
        this._deviceBackButtonHandler = ons._deviceBackButtonDispatcher.createHandler(this, this._onDeviceBackButton.bind(this));

        this._mask.addEventListener('click', this._boundCancel, false);
      }
    }, {
      key: 'detachedCallback',
      value: function detachedCallback() {
        this._deviceBackButtonHandler.destroy();
        this._deviceBackButtonHandler = null;

        this._mask.removeEventListener('click', this._boundCancel.bind(this), false);
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'modifier') {
          return ModifierUtil.onModifierChanged(last, current, this, scheme);
        }
      }
    }, {
      key: '_titleElement',
      get: function get() {
        return util.findChild(this, '.alert-dialog-title');
      }
    }, {
      key: '_contentElement',
      get: function get() {
        return util.findChild(this, '.alert-dialog-content');
      }
    }, {
      key: '_dialog',
      get: function get() {
        return this;
      }
    }]);

    return AlertDialogElement;
  })(ons._BaseElement);

  if (!window.OnsAlertDialogElement) {
    window.OnsAlertDialogElement = document.registerElement('ons-alert-dialog', {
      prototype: AlertDialogElement.prototype
    });

    window.OnsAlertDialogElement._animatorDict = {
      'default': ons.platform.isAndroid() ? AndroidAlertDialogAnimator : IOSAlertDialogAnimator,
      'fade': ons.platform.isAndroid() ? AndroidAlertDialogAnimator : IOSAlertDialogAnimator,
      'slide': SlideDialogAnimator,
      'none': AlertDialogAnimator
    };

    /**
     * @param {String} name
     * @param {DialogAnimator} Animator
     */
    window.OnsAlertDialogElement.registerAnimator = function (name, Animator) {
      if (!(Animator.prototype instanceof AlertDialogAnimator)) {
        throw new Error('"Animator" param must inherit DialogAnimator');
      }
      this._animatorDict[name] = Animator;
    };
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var util = ons._util;
  var ModifierUtil = ons._internal.ModifierUtil;
  var templateElement = util.createElement('\n    <span\n      class="toolbar-button--quiet"\n      style="height: 44px; line-height: 0; padding: 0 10px 0 0; position: relative;">\n\n      <i class="ion-ios-arrow-back ons-back-button__icon"\n        style="\n          vertical-align: top;\n          background-color: transparent;\n          height: 44px;\n          line-height: 44px;\n          font-size: 36px;\n          margin-left: 8px;\n          margin-right: 2px;\n          width: 16px;\n          display: inline-block;\n          padding-top: 1px;"></i>\n\n      <span\n        style="vertical-align: top; display: inline-block; line-height: 44px; height: 44px;"\n        class="back-button__label"></span>\n    </span>\n  ');
  var scheme = {
    '.toolbar-button--quiet': 'toolbar-button--*'
  };

  var BackButtonElement = (function (_ons$_BaseElement) {
    _inherits(BackButtonElement, _ons$_BaseElement);

    function BackButtonElement() {
      _classCallCheck(this, BackButtonElement);

      _get(Object.getPrototypeOf(BackButtonElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(BackButtonElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this._compile();
        this._boundOnClick = this._onClick.bind(this);
        ModifierUtil.initModifier(this, scheme);
      }
    }, {
      key: '_compile',
      value: function _compile() {
        var template = templateElement.cloneNode(true);
        var inner = template.querySelector('.back-button__label');
        while (this.childNodes[0]) {
          inner.appendChild(this.childNodes[0]);
        }
        if (inner.innerHTML.trim() === '') {
          inner.textContent = 'Back';
        }
        this.appendChild(template);
      }
    }, {
      key: '_onClick',
      value: function _onClick() {
        var navigator = util.findParent(this, 'ons-navigator');
        if (navigator) {
          navigator.popPage({ cancelIfRunning: true });
        }
      }
    }, {
      key: 'attachedCallback',
      value: function attachedCallback() {
        this.addEventListener('click', this._boundOnClick, false);
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'modifier') {
          return ModifierUtil.onModifierChanged(last, current, this, scheme);
        }
      }
    }, {
      key: 'detachedCallback',
      value: function detachedCallback() {
        this.removeEventListener('click', this._boundOnClick, false);
      }
    }]);

    return BackButtonElement;
  })(ons._BaseElement);

  if (!window.OnsBackButtonElement) {
    window.OnsBackButtonElement = document.registerElement('ons-back-button', {
      prototype: BackButtonElement.prototype
    });
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var scheme = { '': 'bottom-bar--*' };
  var ModifierUtil = ons._internal.ModifierUtil;

  var BottomToolbarElement = (function (_ons$_BaseElement) {
    _inherits(BottomToolbarElement, _ons$_BaseElement);

    function BottomToolbarElement() {
      _classCallCheck(this, BottomToolbarElement);

      _get(Object.getPrototypeOf(BottomToolbarElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(BottomToolbarElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this.classList.add('bottom-bar');
        this.style.zIndex = '0';
        this._update();

        ModifierUtil.initModifier(this, scheme);
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'inline') {
          this._update();
        } else if (name === 'modifier') {
          return ModifierUtil.onModifierChanged(last, current, this, scheme);
        }
      }
    }, {
      key: '_update',
      value: function _update() {
        var inline = typeof this.getAttribute('inline') === 'string';

        this.style.position = inline ? 'static' : 'absolute';
      }
    }]);

    return BottomToolbarElement;
  })(ons._BaseElement);

  if (!window.OnsBottomToolbarElement) {
    window.OnsBottomToolbarElement = document.registerElement('ons-bottom-toolbar', {
      prototype: BottomToolbarElement.prototype
    });
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var scheme = { '': 'button--*' };
  var ModifierUtil = ons._internal.ModifierUtil;

  var ButtonElement = (function (_ons$_BaseElement) {
    _inherits(ButtonElement, _ons$_BaseElement);

    function ButtonElement() {
      _classCallCheck(this, ButtonElement);

      _get(Object.getPrototypeOf(ButtonElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ButtonElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this.classList.add('button');

        ModifierUtil.initModifier(this, scheme);
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'modifier') {
          return ModifierUtil.onModifierChanged(last, current, this, scheme);
        }
      }
    }]);

    return ButtonElement;
  })(ons._BaseElement);

  if (!window.OnsButtonElement) {
    window.OnsButtonElement = document.registerElement('ons-button', {
      prototype: ButtonElement.prototype
    });
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var ModifierUtil = ons._internal.ModifierUtil;
  var scheme = { '': 'carousel-item--*' };

  var CarouselItemElement = (function (_ons$_BaseElement) {
    _inherits(CarouselItemElement, _ons$_BaseElement);

    function CarouselItemElement() {
      _classCallCheck(this, CarouselItemElement);

      _get(Object.getPrototypeOf(CarouselItemElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(CarouselItemElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this.style.width = '100%';
        ModifierUtil.initModifier(this, scheme);
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'modifier') {
          return ModifierUtil.onModifierChanged(last, current, this, scheme);
        }
      }
    }]);

    return CarouselItemElement;
  })(ons._BaseElement);

  if (!window.OnsCarouselItemElement) {
    window.OnsCarouselItemElement = document.registerElement('ons-carousel-item', {
      prototype: CarouselItemElement.prototype
    });
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var ModifierUtil = ons._internal.ModifierUtil;
  var util = ons._util;
  var scheme = { '': 'carousel--*' };

  var VerticalModeTrait = {

    _getScrollDelta: function _getScrollDelta(event) {
      return event.gesture.deltaY;
    },

    _getScrollVelocity: function _getScrollVelocity(event) {
      return event.gesture.velocityY;
    },

    _getElementSize: function _getElementSize() {
      if (!this._currentElementSize) {
        this._currentElementSize = this.getBoundingClientRect().height;
      }

      return this._currentElementSize;
    },

    _generateScrollTransform: function _generateScrollTransform(scroll) {
      return 'translate3d(0px, ' + -scroll + 'px, 0px)';
    },

    _layoutCarouselItems: function _layoutCarouselItems() {
      var children = this._getCarouselItemElements();

      var sizeAttr = this._getCarouselItemSizeAttr();
      var sizeInfo = this._decomposeSizeString(sizeAttr);

      var computedStyle = window.getComputedStyle(this);
      var totalWidth = this.getBoundingClientRect().width || 0;
      var finalWidth = totalWidth - parseInt(computedStyle.paddingLeft, 10) - parseInt(computedStyle.paddingRight, 10);

      for (var i = 0; i < children.length; i++) {
        children[i].style.position = 'absolute';
        children[i].style.height = sizeAttr;
        children[i].style.width = finalWidth + 'px';
        children[i].style.visibility = 'visible';
        children[i].style.top = i * sizeInfo.number + sizeInfo.unit;
      }
    }
  };

  var HorizontalModeTrait = {

    _getScrollDelta: function _getScrollDelta(event) {
      return event.gesture.deltaX;
    },

    _getScrollVelocity: function _getScrollVelocity(event) {
      return event.gesture.velocityX;
    },

    _getElementSize: function _getElementSize() {
      if (!this._currentElementSize) {
        this._currentElementSize = this.getBoundingClientRect().width;
      }

      return this._currentElementSize;
    },

    _generateScrollTransform: function _generateScrollTransform(scroll) {
      return 'translate3d(' + -scroll + 'px, 0px, 0px)';
    },

    _layoutCarouselItems: function _layoutCarouselItems() {
      var children = this._getCarouselItemElements();

      var sizeAttr = this._getCarouselItemSizeAttr();
      var sizeInfo = this._decomposeSizeString(sizeAttr);

      var computedStyle = window.getComputedStyle(this);
      var totalHeight = this.getBoundingClientRect().height || 0;
      var finalHeight = totalHeight - parseInt(computedStyle.paddingTop, 10) - parseInt(computedStyle.paddingBottom, 10);

      for (var i = 0; i < children.length; i++) {
        children[i].style.position = 'absolute';
        children[i].style.height = finalHeight + 'px';
        children[i].style.width = sizeAttr;
        children[i].style.visibility = 'visible';
        children[i].style.left = i * sizeInfo.number + sizeInfo.unit;
      }
    }
  };

  var CarouselElement = (function (_ons$_BaseElement) {
    _inherits(CarouselElement, _ons$_BaseElement);

    function CarouselElement() {
      _classCallCheck(this, CarouselElement);

      _get(Object.getPrototypeOf(CarouselElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(CarouselElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        ModifierUtil.initModifier(this, scheme);
        this._doorLock = new DoorLock();
        this._scroll = 0;
        this._lastActiveIndex = 0;

        this._boundOnDrag = this._onDrag.bind(this);
        this._boundOnDragEnd = this._onDragEnd.bind(this);
        this._boundOnResize = this._onResize.bind(this);

        this._mixin(this._isVertical() ? VerticalModeTrait : HorizontalModeTrait);

        this._layoutCarouselItems();
        this._setupInitialIndex();

        this._saveLastState();
      }
    }, {
      key: '_onResize',
      value: function _onResize() {
        this.refresh();
      }
    }, {
      key: '_onDirectionChange',
      value: function _onDirectionChange() {
        if (this._isVertical()) {
          this.style.overflowX = 'auto';
          this.style.overflowY = '';
        } else {
          this.style.overflowX = '';
          this.style.overflowY = 'auto';
        }

        this.refresh();
      }
    }, {
      key: '_saveLastState',
      value: function _saveLastState() {
        this._lastState = {
          elementSize: this._getCarouselItemSize(),
          carouselElementCount: this.getCarouselItemCount(),
          width: this._getCarouselItemSize() * this.getCarouselItemCount()
        };
      }

      /**
       * @return {Number}
       */
    }, {
      key: '_getCarouselItemSize',
      value: function _getCarouselItemSize() {
        var sizeAttr = this._getCarouselItemSizeAttr();
        var sizeInfo = this._decomposeSizeString(sizeAttr);
        var elementSize = this._getElementSize();

        if (sizeInfo.unit === '%') {
          return Math.round(sizeInfo.number / 100 * elementSize);
        } else if (sizeInfo.unit === 'px') {
          return sizeInfo.number;
        } else {
          throw new Error('Invalid state');
        }
      }

      /**
       * @return {Number}
       */
    }, {
      key: '_getInitialIndex',
      value: function _getInitialIndex() {
        var index = parseInt(this.getAttribute('initial-index'), 10);

        if (typeof index === 'number' && !isNaN(index)) {
          return Math.max(Math.min(index, this.getCarouselItemCount() - 1), 0);
        } else {
          return 0;
        }
      }

      /**
       * @return {String}
       */
    }, {
      key: '_getCarouselItemSizeAttr',
      value: function _getCarouselItemSizeAttr() {
        var attrName = 'item-' + (this._isVertical() ? 'height' : 'width');
        var itemSizeAttr = ('' + this.getAttribute(attrName)).trim();

        return itemSizeAttr.match(/^\d+(px|%)$/) ? itemSizeAttr : '100%';
      }

      /**
       * @return {Object}
       */
    }, {
      key: '_decomposeSizeString',
      value: function _decomposeSizeString(size) {
        var matches = size.match(/^(\d+)(px|%)/);

        return {
          number: parseInt(matches[1], 10),
          unit: matches[2]
        };
      }
    }, {
      key: '_setupInitialIndex',
      value: function _setupInitialIndex() {
        this._scroll = this._getCarouselItemSize() * this._getInitialIndex();
        this._lastActiveIndex = this._getInitialIndex();
        this._scrollTo(this._scroll);
      }

      /**
       * @param {Boolean} swipeable
       */
    }, {
      key: 'setSwipeable',
      value: function setSwipeable(swipeable) {
        if (swipeable) {
          this.setAttribute('swipeable', '');
        } else {
          this.removeAttribute('swipeable');
        }
      }

      /**
       * @return {Boolean}
       */
    }, {
      key: 'isSwipeable',
      value: function isSwipeable() {
        return this.hasAttribute('swipeable');
      }

      /**
       * @param {Number} ratio
       */
    }, {
      key: 'setAutoScrollRatio',
      value: function setAutoScrollRatio(ratio) {
        if (ratio < 0.0 || ratio > 1.0) {
          throw new Error('Invalid ratio.');
        }

        this.setAttribute('auto-scroll-ratio', ratio);
      }

      /**
       * @return {Number}
       */
    }, {
      key: 'getAutoScrollRatio',
      value: function getAutoScrollRatio() {
        var attr = this.getAttribute('auto-scroll-ratio');

        if (!attr) {
          return 0.5;
        }

        var scrollRatio = parseFloat(attr);
        if (scrollRatio < 0.0 || scrollRatio > 1.0) {
          throw new Error('Invalid ratio.');
        }

        return isNaN(scrollRatio) ? 0.5 : scrollRatio;
      }

      /**
       * @param {Number} index
       * @param {Object} [options]
       * @param {Function} [options.callback]
       * @param {String} [options.animation]
       */
    }, {
      key: 'setActiveCarouselItemIndex',
      value: function setActiveCarouselItemIndex(index, options) {
        options = options || {};

        index = Math.max(0, Math.min(index, this.getCarouselItemCount() - 1));
        var scroll = this._getCarouselItemSize() * index;
        var max = this._calculateMaxScroll();

        this._scroll = Math.max(0, Math.min(max, scroll));
        this._scrollTo(this._scroll, { animate: options.animation !== 'none', callback: options.callback });

        this._tryFirePostChangeEvent();
      }

      /**
       * @return {Number}
       */
    }, {
      key: 'getActiveCarouselItemIndex',
      value: function getActiveCarouselItemIndex() {
        var scroll = this._scroll;
        var count = this.getCarouselItemCount();
        var size = this._getCarouselItemSize();

        if (scroll < 0) {
          return 0;
        }

        var i = undefined;
        for (i = 0; i < count; i++) {
          if (size * i <= scroll && size * (i + 1) > scroll) {
            return i;
          }
        }

        // max carousel index
        return i;
      }

      /**
       * @param {Object} [options]
       * @param {Function} [options.callback]
       * @param {String} [options.animation]
       */
    }, {
      key: 'next',
      value: function next(options) {
        return this.setActiveCarouselItemIndex(this.getActiveCarouselItemIndex() + 1, options);
      }

      /**
       * @param {Object} [options]
       * @param {Function} [options.callback]
       * @param {String} [options.animation]
       */
    }, {
      key: 'prev',
      value: function prev(options) {
        return this.setActiveCarouselItemIndex(this.getActiveCarouselItemIndex() - 1, options);
      }

      /**
       * @param {Boolean} enabled
       */
    }, {
      key: 'setAutoScrollEnabled',
      value: function setAutoScrollEnabled(enabled) {
        if (enabled) {
          this.setAttribute('auto-scroll', '');
        } else {
          this.removeAttribute('auto-scroll');
        }
      }

      /**
       * @return {Boolean}
       */
    }, {
      key: 'isAutoScrollEnabled',
      value: function isAutoScrollEnabled() {
        return this.hasAttribute('auto-scroll');
      }

      /**
       * @param {Boolean} disabled
       */
    }, {
      key: 'setDisabled',
      value: function setDisabled(disabled) {
        if (disabled) {
          this.setAttribute('disabled', '');
        } else {
          this.removeAttribute('disabled');
        }
      }

      /**
       * @return {Boolean}
       */
    }, {
      key: 'isDisabled',
      value: function isDisabled() {
        return this.hasAttribute('disabled');
      }

      /**
       * @param {Boolean} scrollable
       */
    }, {
      key: 'setOverscrollable',
      value: function setOverscrollable(scrollable) {
        if (scrollable) {
          this.setAttribute('overscrollable', '');
        } else {
          this.removeAttribute('overscrollable');
        }
      }

      /**
       * @return {Boolean}
       */
    }, {
      key: 'isOverscrollable',
      value: function isOverscrollable() {
        return this.hasAttribute('overscrollable');
      }

      /**
       * @return {Boolean}
       */
    }, {
      key: '_isEnabledChangeEvent',
      value: function _isEnabledChangeEvent() {
        var elementSize = this._getElementSize();
        var carouselItemSize = this._getCarouselItemSize();

        return this.isAutoScrollEnabled() && elementSize === carouselItemSize;
      }

      /**
       * @return {Boolean}
       */
    }, {
      key: '_isVertical',
      value: function _isVertical() {
        return this.getAttribute('direction') === 'vertical';
      }
    }, {
      key: '_prepareEventListeners',
      value: function _prepareEventListeners() {
        this._gestureDetector = new ons.GestureDetector(this, {
          dragMinDistance: 1
        });

        this._gestureDetector.on('drag dragleft dragright dragup dragdown swipe swipeleft swiperight swipeup swipedown', this._boundOnDrag);
        this._gestureDetector.on('dragend', this._boundOnDragEnd);

        window.addEventListener('resize', this._boundOnResize, true);
      }
    }, {
      key: '_removeEventListeners',
      value: function _removeEventListeners() {
        this._gestureDetector.off('drag dragleft dragright dragup dragdown swipe swipeleft swiperight swipeup swipedown', this._boundOnDrag);
        this._gestureDetector.off('dragend', this._boundOnDragEnd);
        this._gestureDetector.dispose();

        window.removeEventListener('resize', this._boundOnResize, true);
      }
    }, {
      key: '_tryFirePostChangeEvent',
      value: function _tryFirePostChangeEvent() {
        var currentIndex = this.getActiveCarouselItemIndex();

        if (this._lastActiveIndex !== currentIndex) {
          var lastActiveIndex = this._lastActiveIndex;
          this._lastActiveIndex = currentIndex;

          util.triggerElementEvent(this, 'postchange', {
            carousel: this,
            activeIndex: currentIndex,
            lastActiveIndex: lastActiveIndex
          });
        }
      }
    }, {
      key: '_onDrag',
      value: function _onDrag(event) {
        if (!this.isSwipeable()) {
          return;
        }

        var direction = event.gesture.direction;
        if (this._isVertical() && (direction === 'left' || direction === 'right') || !this._isVertical() && (direction === 'up' || direction === 'down')) {
          return;
        }

        event.stopPropagation();

        this._lastDragEvent = event;

        var scroll = this._scroll - this._getScrollDelta(event);
        this._scrollTo(scroll);
        event.gesture.preventDefault();

        this._tryFirePostChangeEvent();
      }
    }, {
      key: '_onDragEnd',
      value: function _onDragEnd(event) {
        var _this = this;

        this._currentElementSize = undefined;

        if (!this.isSwipeable()) {
          return;
        }

        this._scroll = this._scroll - this._getScrollDelta(event);

        if (this._getScrollDelta(event) !== 0) {
          event.stopPropagation();
        }

        if (this._isOverScroll(this._scroll)) {
          var waitForAction = false;
          util.triggerElementEvent(this, 'overscroll', {
            carousel: this,
            activeIndex: this.getActiveCarouselItemIndex(),
            direction: this._getOverScrollDirection(),
            waitToReturn: function waitToReturn(promise) {
              waitForAction = true;
              promise.then(function () {
                return _this._scrollToKillOverScroll();
              });
            }
          });

          if (!waitForAction) {
            this._scrollToKillOverScroll();
          }
        } else {
          this._startMomentumScroll();
        }
        this._lastDragEvent = null;

        event.gesture.preventDefault();
      }

      /**
       * @param {Object} trait
       */
    }, {
      key: '_mixin',
      value: function _mixin(trait) {
        Object.keys(trait).forEach((function (key) {
          this[key] = trait[key];
        }).bind(this));
      }
    }, {
      key: '_startMomentumScroll',
      value: function _startMomentumScroll() {
        if (this._lastDragEvent) {
          var velocity = this._getScrollVelocity(this._lastDragEvent);
          var duration = 0.3;
          var scrollDelta = duration * 100 * velocity;
          var _scroll = this._normalizeScrollPosition(this._scroll + (this._getScrollDelta(this._lastDragEvent) > 0 ? -scrollDelta : scrollDelta));

          this._scroll = _scroll;

          animit(this._getCarouselItemElements()).queue({
            transform: this._generateScrollTransform(this._scroll)
          }, {
            duration: duration,
            timing: 'cubic-bezier(.1, .7, .1, 1)'
          }).queue((function (done) {
            done();
            this._tryFirePostChangeEvent();
          }).bind(this)).play();
        }
      }
    }, {
      key: '_normalizeScrollPosition',
      value: function _normalizeScrollPosition(scroll) {
        var _this2 = this;

        var max = this._calculateMaxScroll();

        if (this.isAutoScrollEnabled()) {
          var _ret = (function () {
            var arr = [];
            var size = _this2._getCarouselItemSize();

            for (var i = 0; i < _this2.getCarouselItemCount(); i++) {
              if (max >= i * size) {
                arr.push(i * size);
              }
            }
            arr.push(max);

            arr.sort(function (left, right) {
              left = Math.abs(left - scroll);
              right = Math.abs(right - scroll);

              return left - right;
            });

            arr = arr.filter(function (item, pos) {
              return !pos || item != arr[pos - 1];
            });

            var lastScroll = _this2._lastActiveIndex * size;
            var scrollRatio = Math.abs(scroll - lastScroll) / size;

            if (scrollRatio <= _this2.getAutoScrollRatio()) {
              return {
                v: lastScroll
              };
            } else if (scrollRatio > _this2.getAutoScrollRatio() && scrollRatio < 1.0) {
              if (arr[0] === lastScroll && arr.length > 1) {
                return {
                  v: arr[1]
                };
              }
            }

            return {
              v: arr[0]
            };
          })();

          if (typeof _ret === 'object') return _ret.v;
        } else {
          return Math.max(0, Math.min(max, scroll));
        }
      }

      /**
       * @return {Array}
       */
    }, {
      key: '_getCarouselItemElements',
      value: function _getCarouselItemElements() {
        return ons._util.arrayFrom(this.children).filter(function (child) {
          return child.nodeName.toLowerCase() === 'ons-carousel-item';
        });
      }

      /**
       * @param {Number} scroll
       * @param {Object} [options]
       */
    }, {
      key: '_scrollTo',
      value: function _scrollTo(scroll, options) {
        var _this3 = this;

        options = options || {};
        var isOverscrollable = this.isOverscrollable();

        var normalizeScroll = function normalizeScroll(scroll) {
          var ratio = 0.35;

          if (scroll < 0) {
            return isOverscrollable ? Math.round(scroll * ratio) : 0;
          }

          var maxScroll = _this3._calculateMaxScroll();
          if (maxScroll < scroll) {
            return isOverscrollable ? maxScroll + Math.round((scroll - maxScroll) * ratio) : maxScroll;
          }

          return scroll;
        };

        if (options.animate) {
          animit(this._getCarouselItemElements()).queue({
            transform: this._generateScrollTransform(normalizeScroll(scroll))
          }, {
            duration: 0.3,
            timing: 'cubic-bezier(.1, .7, .1, 1)'
          }).play(options.callback);
        } else {
          animit(this._getCarouselItemElements()).queue({
            transform: this._generateScrollTransform(normalizeScroll(scroll))
          }).play(options.callback);
        }
      }
    }, {
      key: '_calculateMaxScroll',
      value: function _calculateMaxScroll() {
        var max = this.getCarouselItemCount() * this._getCarouselItemSize() - this._getElementSize();
        return Math.ceil(max < 0 ? 0 : max); // Need to return an integer value.
      }
    }, {
      key: '_isOverScroll',
      value: function _isOverScroll(scroll) {
        if (scroll < 0 || scroll > this._calculateMaxScroll()) {
          return true;
        }
        return false;
      }
    }, {
      key: '_getOverScrollDirection',
      value: function _getOverScrollDirection() {
        if (this._isVertical()) {
          if (this._scroll <= 0) {
            return 'up';
          } else {
            return 'down';
          }
        } else {
          if (this._scroll <= 0) {
            return 'left';
          } else {
            return 'right';
          }
        }
      }
    }, {
      key: '_scrollToKillOverScroll',
      value: function _scrollToKillOverScroll() {
        var duration = 0.4;

        if (this._scroll < 0) {
          animit(this._getCarouselItemElements()).queue({
            transform: this._generateScrollTransform(0)
          }, {
            duration: duration,
            timing: 'cubic-bezier(.1, .4, .1, 1)'
          }).queue((function (done) {
            done();
            this._tryFirePostChangeEvent();
          }).bind(this)).play();
          this._scroll = 0;
          return;
        }

        var maxScroll = this._calculateMaxScroll();

        if (maxScroll < this._scroll) {
          animit(this._getCarouselItemElements()).queue({
            transform: this._generateScrollTransform(maxScroll)
          }, {
            duration: duration,
            timing: 'cubic-bezier(.1, .4, .1, 1)'
          }).queue((function (done) {
            done();
            this._tryFirePostChangeEvent();
          }).bind(this)).play();
          this._scroll = maxScroll;
          return;
        }

        return;
      }

      /**
       * @return {Number}
       */
    }, {
      key: 'getCarouselItemCount',
      value: function getCarouselItemCount() {
        return this._getCarouselItemElements().length;
      }

      /**
       * Refresh carousel item layout.
       */
    }, {
      key: 'refresh',
      value: function refresh() {
        // Bug fix
        if (this._getCarouselItemSize() === 0) {
          return;
        }

        this._mixin(this._isVertical() ? VerticalModeTrait : HorizontalModeTrait);
        this._layoutCarouselItems();

        if (this._lastState && this._lastState.width > 0) {
          var _scroll2 = this._scroll;

          if (this._isOverScroll(_scroll2)) {
            this._scrollToKillOverScroll();
          } else {
            if (this.isAutoScrollEnabled()) {
              _scroll2 = this._normalizeScrollPosition(_scroll2);
            }

            this._scrollTo(_scroll2);
          }
        }

        this._saveLastState();

        util.triggerElementEvent(this, 'refresh', { carousel: this });
      }
    }, {
      key: 'first',
      value: function first() {
        this.setActiveCarouselItemIndex(0);
      }
    }, {
      key: 'last',
      value: function last() {
        this.setActiveCarouselItemIndex(Math.max(this.getCarouselItemCount() - 1, 0));
      }
    }, {
      key: 'attachedCallback',
      value: function attachedCallback() {
        this._prepareEventListeners();

        this._layoutCarouselItems();
        this._setupInitialIndex();

        this._saveLastState();
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'modifier') {
          return ModifierUtil.onModifierChanged(last, current, this, scheme);
        } else if (name === 'direction') {
          this._onDirectionChange();
        }
      }
    }, {
      key: 'detachedCallback',
      value: function detachedCallback() {
        this._removeEventListeners();
      }
    }]);

    return CarouselElement;
  })(ons._BaseElement);

  if (!window.OnsCarouselElement) {
    window.OnsCarouselElement = document.registerElement('ons-carousel', {
      prototype: CarouselElement.prototype
    });
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var ColumnElement = (function (_ons$_BaseElement) {
    _inherits(ColumnElement, _ons$_BaseElement);

    function ColumnElement() {
      _classCallCheck(this, ColumnElement);

      _get(Object.getPrototypeOf(ColumnElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ColumnElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        if (this.getAttribute('width')) {
          this._updateWidth();
        }
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'width') {
          this._updateWidth();
        }
      }
    }, {
      key: '_updateWidth',
      value: function _updateWidth() {
        var width = this.getAttribute('width');
        if (typeof width === 'string') {
          width = ('' + width).trim();
          width = width.match(/^\d+$/) ? width + '%' : width;

          this.style.webkitBoxFlex = '0';
          this.style.webkitFlex = '0 0 ' + width;
          this.style.mozBoxFlex = '0';
          this.style.mozFlex = '0 0 ' + width;
          this.style.msFlex = '0 0 ' + width;
          this.style.flex = '0 0 ' + width;
          this.style.maxWidth = width;
        }
      }
    }]);

    return ColumnElement;
  })(ons._BaseElement);

  if (!window.OnsColElement) {
    window.OnsColElement = document.registerElement('ons-col', {
      prototype: ColumnElement.prototype
    });
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var util = ons._util;
  var ModifierUtil = ons._internal.ModifierUtil;
  var scheme = {
    '.dialog': 'dialog--*'
  };
  var AnimatorFactory = ons._internal.AnimatorFactory;
  var AndroidDialogAnimator = ons._internal.AndroidDialogAnimator;
  var IOSDialogAnimator = ons._internal.IOSDialogAnimator;
  var SlideDialogAnimator = ons._internal.SlideDialogAnimator;
  var DialogAnimator = ons._internal.DialogAnimator;
  var templateSource = util.createElement('\n    <div>\n      <div class="dialog-mask"></div>\n      <div class="dialog"></div>\n    </div>\n  ');

  var DialogElement = (function (_ons$_BaseElement) {
    _inherits(DialogElement, _ons$_BaseElement);

    function DialogElement() {
      _classCallCheck(this, DialogElement);

      _get(Object.getPrototypeOf(DialogElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(DialogElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this._compile();
        ModifierUtil.initModifier(this, scheme);

        this._visible = false;
        this._doorLock = new DoorLock();
        this._boundCancel = this._cancel.bind(this);

        this._animatorFactory = new AnimatorFactory({
          animators: OnsDialogElement._animatorDict,
          baseClass: DialogAnimator,
          baseClassName: 'DialogAnimator',
          defaultAnimation: this.getAttribute('animation')
        });
      }
    }, {
      key: '_compile',
      value: function _compile() {
        var style = this.getAttribute('style');

        this.style.display = 'none';

        var template = templateSource.cloneNode(true);
        var dialog = template.children[1];

        if (style) {
          dialog.setAttribute('style', style);
        }

        while (this.firstChild) {
          dialog.appendChild(this.firstChild);
        }

        while (template.firstChild) {
          this.appendChild(template.firstChild);
        }

        this._dialog.style.zIndex = 20001;
        this._mask.style.zIndex = 20000;

        this.setAttribute('no-status-bar-fill', '');
      }

      /**
       *  @return {Object}
       */
    }, {
      key: 'getDeviceBackButtonHandler',
      value: function getDeviceBackButtonHandler() {
        return this._deviceBackButtonHandler;
      }
    }, {
      key: '_onDeviceBackButton',
      value: function _onDeviceBackButton(event) {
        if (this.isCancelable()) {
          this._cancel();
        } else {
          event.callParentHandler();
        }
      }
    }, {
      key: '_cancel',
      value: function _cancel() {
        var _this = this;

        if (this.isCancelable()) {
          this.hide({
            callback: function callback() {
              util.triggerElementEvent(_this, 'cancel');
            }
          });
        }
      }

      /**
       * Show dialog.
       *
       * @param {Object} [options]
       * @param {String} [options.animation] animation type
       * @param {Object} [options.animationOptions] animation options
       * @param {Function} [options.callback] callback after dialog is shown
       */
    }, {
      key: 'show',
      value: function show() {
        var _this2 = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var _cancel2 = false;
        var callback = options.callback || function () {};

        util.triggerElementEvent(this, 'preshow', {
          dialog: this,
          cancel: function cancel() {
            _cancel2 = true;
          }
        });

        options.animationOptions = util.extend(options.animationOptions || {}, AnimatorFactory.parseAnimationOptionsString(this.getAttribute('animation-options')));

        if (!_cancel2) {
          this._doorLock.waitUnlock(function () {
            var unlock = _this2._doorLock.lock();

            _this2.style.display = 'block';
            _this2._mask.style.opacity = '1';

            var animator = _this2._animatorFactory.newAnimator(options);

            animator.show(_this2, function () {
              _this2._visible = true;
              unlock();

              util.triggerElementEvent(_this2, 'postshow', { dialog: _this2 });

              callback();
            });
          });
        }
      }

      /**
       * Hide dialog.
       *
       * @param {Object} [options]
       * @param {String} [options.animation] animation type
       * @param {Object} [options.animationOptions] animation options
       * @param {Function} [options.callback] callback after dialog is hidden
       */
    }, {
      key: 'hide',
      value: function hide() {
        var _this3 = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var _cancel3 = false;
        var callback = options.callback || function () {};

        util.triggerElementEvent(this, 'prehide', {
          dialog: this,
          cancel: function cancel() {
            _cancel3 = true;
          }
        });

        options.animationOptions = util.extend(options.animationOptions || {}, AnimatorFactory.parseAnimationOptionsString(this.getAttribute('animation-options')));

        if (!_cancel3) {
          this._doorLock.waitUnlock(function () {
            var unlock = _this3._doorLock.lock();
            var animator = _this3._animatorFactory.newAnimator(options);

            animator.hide(_this3, function () {
              _this3.style.display = 'none';
              _this3._visible = false;
              unlock();
              util.triggerElementEvent(_this3, 'posthide', { dialog: _this3 });
              callback();
            });
          });
        }
      }

      /**
       * Destroy dialog.
       */
    }, {
      key: 'destroy',
      value: function destroy() {
        if (this.parentElement) {
          this.parentElement.removeChild(this);
        }
      }

      /**
       * True if dialog is visible.
       *
       * @return {Boolean}
       */
    }, {
      key: 'isShown',
      value: function isShown() {
        return this._visible;
      }

      /**
       * True if the dialog is cancelable.
       *
       * @return {Boolean}
       */
    }, {
      key: 'isCancelable',
      value: function isCancelable() {
        return this.hasAttribute('cancelable');
      }

      /**
       * Disable or enable dialog.
       *
       * @param {Boolean}
       */
    }, {
      key: 'setDisabled',
      value: function setDisabled(disabled) {
        if (typeof disabled !== 'boolean') {
          throw new Error('Argument must be a boolean.');
        }

        if (disabled) {
          this.setAttribute('disabled', '');
        } else {
          this.removeAttribute('disabled');
        }
      }

      /**
       * True if dialog is disabled.
       *
       * @return {Boolean}
       */
    }, {
      key: 'isDisabled',
      value: function isDisabled() {
        return this.hasAttribute('disabled');
      }

      /**
       * Make dialog cancelable or uncancelable.
       *
       * @param {Boolean}
       */
    }, {
      key: 'setCancelable',
      value: function setCancelable(cancelable) {
        if (typeof cancelable !== 'boolean') {
          throw new Error('Argument must be a boolean.');
        }

        if (cancelable) {
          this.setAttribute('cancelable', '');
        } else {
          this.removeAttribute('cancelable');
        }
      }
    }, {
      key: 'attachedCallback',
      value: function attachedCallback() {
        this._deviceBackButtonHandler = ons._deviceBackButtonDispatcher.createHandler(this, this._onDeviceBackButton.bind(this));

        this._mask.addEventListener('click', this._boundCancel, false);
      }
    }, {
      key: 'detachedCallback',
      value: function detachedCallback() {
        this._deviceBackButtonHandler.destroy();
        this._deviceBackButtonHandler = null;

        this._mask.removeEventListener('click', this._boundCancel.bind(this), false);
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'modifier') {
          return ModifierUtil.onModifierChanged(last, current, this, scheme);
        }
      }
    }, {
      key: '_mask',

      /**
       * @return {Element}
       */
      get: function get() {
        return util.findChild(this, '.dialog-mask');
      }

      /**
       * @return {Element}
       */
    }, {
      key: '_dialog',
      get: function get() {
        return util.findChild(this, '.dialog');
      }
    }]);

    return DialogElement;
  })(ons._BaseElement);

  if (!window.OnsDialogElement) {
    window.OnsDialogElement = document.registerElement('ons-dialog', {
      prototype: DialogElement.prototype
    });

    window.OnsDialogElement._animatorDict = {
      'default': ons.platform.isAndroid() ? AndroidDialogAnimator : IOSDialogAnimator,
      'fade': ons.platform.isAndroid() ? AndroidDialogAnimator : IOSDialogAnimator,
      'slide': SlideDialogAnimator,
      'none': DialogAnimator
    };

    /**
     * @param {String} name
     * @param {DialogAnimator} Animator
     */
    window.OnsDialogElement.registerAnimator = function (name, Animator) {
      if (!(Animator.prototype instanceof DialogAnimator)) {
        throw new Error('"Animator" param must inherit DialogAnimator');
      }
      this._animatorDict[name] = Animator;
    };
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
   http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var scheme = {
    '': 'fab--*'
  };
  var ModifierUtil = ons._internal.ModifierUtil;

  var FabElement = (function (_ons$_BaseElement) {
    _inherits(FabElement, _ons$_BaseElement);

    function FabElement() {
      _classCallCheck(this, FabElement);

      _get(Object.getPrototypeOf(FabElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(FabElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this._compile();
        ModifierUtil.initModifier(this, scheme);
        this.classList.add('fab');
        this._updatePosition();
        this.show();
      }
    }, {
      key: '_compile',
      value: function _compile() {
        var content = document.createElement('span');
        content.classList.add('fab__icon');

        var children = ons._util.arrayFrom(this.childNodes).forEach(function (element) {
          return content.appendChild(element);
        });

        this.insertBefore(content, this.firstChild);
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'modifier') {
          return ModifierUtil.onModifierChanged(last, current, this, scheme);
        }
        if (name === 'position') {
          this._updatePosition();
        }
      }
    }, {
      key: '_show',
      value: function _show() {
        if (!this.isInline()) {
          this.show();
        }
      }
    }, {
      key: '_hide',
      value: function _hide() {
        if (!this.isInline()) {
          this.hide();
        }
      }
    }, {
      key: '_updatePosition',
      value: function _updatePosition() {
        var position = this.getAttribute('position');
        this.classList.remove('fab--top__left', 'fab--bottom__right', 'fab--bottom__left', 'fab--top__right', 'fab--top__center', 'fab--bottom__center');
        switch (position) {
          case 'top right':
          case 'right top':
            this.classList.add('fab--top__right');
            break;
          case 'top left':
          case 'left top':
            this.classList.add('fab--top__left');
            break;
          case 'bottom right':
          case 'right bottom':
            this.classList.add('fab--bottom__right');
            break;
          case 'bottom left':
          case 'left bottom':
            this.classList.add('fab--bottom__left');
            break;
          case 'center top':
          case 'top center':
            this.classList.add('fab--top__center');
            break;
          case 'center bottom':
          case 'bottom center':
            this.classList.add('fab--bottom__center');
            break;
          default:
            break;
        }
      }
    }, {
      key: 'show',
      value: function show() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.style.transform = 'scale(1)';
        this.style.webkitTransform = 'scale(1)';
      }
    }, {
      key: 'hide',
      value: function hide() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.style.transform = 'scale(0)';
        this.style.webkitTransform = 'scale(0)';
      }

      /**
       * Disable of enable fab.
       *
       * @param {Boolean}
       */
    }, {
      key: 'setDisabled',
      value: function setDisabled(disabled) {
        if (typeof disabled !== 'boolean') {
          throw new Error('Argument must be a boolean.');
        }

        if (disabled) {
          this.setAttribute('disabled', '');
        } else {
          this.removeAttribute('disabled');
        }
      }

      /**
       * True if fab is disabled.
       *
       * @return {Boolean}
       */
    }, {
      key: 'isDisabled',
      value: function isDisabled() {
        return this.hasAttribute('disabled');
      }

      /**
       * True if fab is inline element.
       *
       * @return {Boolean}
       */
    }, {
      key: 'isInline',
      value: function isInline() {
        return this.hasAttribute('inline');
      }

      /**
       * True if fab is shown
       *
       * @return {Boolean}
       */
    }, {
      key: 'isShown',
      value: function isShown() {
        return this.style.transform === 'scale(1)' && this.style.display !== 'none';
      }
    }, {
      key: 'toggle',
      value: function toggle() {
        if (this.isShown()) {
          this.hide();
        } else {
          this.show();
        }
      }
    }]);

    return FabElement;
  })(ons._BaseElement);

  if (!window.OnsFabElement) {
    window.OnsFabElement = document.registerElement('ons-fab', {
      prototype: FabElement.prototype
    });
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var GestureDetectorElement = (function (_ons$_BaseElement) {
    _inherits(GestureDetectorElement, _ons$_BaseElement);

    function GestureDetectorElement() {
      _classCallCheck(this, GestureDetectorElement);

      _get(Object.getPrototypeOf(GestureDetectorElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(GestureDetectorElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this._gestureDetector = new ons.GestureDetector(this);
      }
    }]);

    return GestureDetectorElement;
  })(ons._BaseElement);

  if (!window.OnsGestureDetectorElement) {
    window.OnsGestureDetectorElement = document.registerElement('ons-gesture-detector', {
      prototype: GestureDetectorElement.prototype
    });
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var IconElement = (function (_ons$_BaseElement) {
    _inherits(IconElement, _ons$_BaseElement);

    function IconElement() {
      _classCallCheck(this, IconElement);

      _get(Object.getPrototypeOf(IconElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(IconElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this._update();
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (['icon', 'size'].indexOf(name) !== -1) {
          this._update();
        }
      }
    }, {
      key: '_update',
      value: function _update() {
        var _this = this;

        this._cleanClassAttribute();

        var builded = this._buildClassAndStyle(this);

        for (var key in builded.style) {
          if (builded.style.hasOwnProperty(key)) {
            this.style[key] = builded.style[key];
          }
        }

        builded.classList.forEach(function (className) {
          return _this.classList.add(className);
        });
      }
    }, {
      key: '_cleanClassAttribute',

      /**
       * Remove unneeded class value.
       */
      value: function _cleanClassAttribute() {
        var classList = this.classList;

        Array.apply(null, this.classList).filter(function (klass) {
          return klass === 'fa' || klass.indexOf('fa-') === 0 || klass.indexOf('ion-') === 0 || klass.indexOf('zmdi-') === 0;
        }).forEach(function (className) {
          classList.remove(className);
        });

        classList.remove('zmdi');
        classList.remove('ons-icon--ion');
      }
    }, {
      key: '_buildClassAndStyle',
      value: function _buildClassAndStyle() {
        var classList = ['ons-icon'];
        var style = {};

        // icon
        var iconName = this._iconName;
        if (iconName.indexOf('ion-') === 0) {
          classList.push(iconName);
          classList.push('ons-icon--ion');
        } else if (iconName.indexOf('fa-') === 0) {
          classList.push(iconName);
          classList.push('fa');
        } else if (iconName.indexOf('md-') === 0) {
          classList.push('zmdi');
          classList.push('zmdi-' + iconName.split(/\-(.+)?/)[1]);
        } else {
          classList.push('fa');
          classList.push('fa-' + iconName);
        }

        // size
        var size = '' + this.getAttribute('size');
        if (size.match(/^[1-5]x|lg$/)) {
          classList.push('fa-' + size);
          this.style.removeProperty('font-size');
        } else {
          style.fontSize = size;
        }

        return {
          classList: classList,
          style: style
        };
      }
    }, {
      key: '_iconName',
      get: function get() {
        return '' + this.getAttribute('icon');
      }
    }]);

    return IconElement;
  })(ons._BaseElement);

  if (!window.OnsIconElement) {
    window.OnsIconElement = document.registerElement('ons-icon', {
      prototype: IconElement.prototype
    });
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var scheme = { '': 'list__header--*' };
  var ModifierUtil = ons._internal.ModifierUtil;

  var ListHeaderElement = (function (_ons$_BaseElement) {
    _inherits(ListHeaderElement, _ons$_BaseElement);

    function ListHeaderElement() {
      _classCallCheck(this, ListHeaderElement);

      _get(Object.getPrototypeOf(ListHeaderElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ListHeaderElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this.classList.add('list__header');
        ModifierUtil.initModifier(this, scheme);
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'modifier') {
          return ModifierUtil.onModifierChanged(last, current, this, scheme);
        }
      }
    }]);

    return ListHeaderElement;
  })(ons._BaseElement);

  if (!window.OnsListHeaderElement) {
    window.OnsListHeaderElement = document.registerElement('ons-list-header', {
      prototype: ListHeaderElement.prototype
    });
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var scheme = { '': 'list__item--*' };
  var ModifierUtil = ons._internal.ModifierUtil;

  var ListItemElement = (function (_ons$_BaseElement) {
    _inherits(ListItemElement, _ons$_BaseElement);

    function ListItemElement() {
      _classCallCheck(this, ListItemElement);

      _get(Object.getPrototypeOf(ListItemElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ListItemElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this.classList.add('list__item');
        ModifierUtil.initModifier(this, scheme);

        this._gestureDetector = new ons.GestureDetector(this);
        this._boundOnDrag = this._onDrag.bind(this);
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'modifier') {
          return ModifierUtil.onModifierChanged(last, current, this, scheme);
        }
      }
    }, {
      key: 'attachedCallback',
      value: function attachedCallback() {
        this.addEventListener('drag', this._boundOnDrag);
      }
    }, {
      key: 'detachedCallback',
      value: function detachedCallback() {
        this.removeEventListener('drag', this._boundOnDrag);
      }
    }, {
      key: '_onDrag',
      value: function _onDrag(event) {
        var g = event.gesture;
        // Prevent vertical scrolling if the users pans left or right.
        if (this._shouldLockOnDrag() && ['left', 'right'].indexOf(g.direction) > -1) {
          g.preventDefault();
        }
      }
    }, {
      key: '_shouldLockOnDrag',
      value: function _shouldLockOnDrag() {
        return this.hasAttribute('lock-on-drag');
      }
    }]);

    return ListItemElement;
  })(ons._BaseElement);

  if (!window.OnsListItemElement) {
    window.OnsListItemElement = document.registerElement('ons-list-item', {
      prototype: ListItemElement.prototype
    });
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var scheme = { '': 'list--*' };
  var ModifierUtil = ons._internal.ModifierUtil;

  var ListElement = (function (_ons$_BaseElement) {
    _inherits(ListElement, _ons$_BaseElement);

    function ListElement() {
      _classCallCheck(this, ListElement);

      _get(Object.getPrototypeOf(ListElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ListElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this.classList.add('list');
        ModifierUtil.initModifier(this, scheme);
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'modifier') {
          return ModifierUtil.onModifierChanged(last, current, this, scheme);
        }
      }
    }]);

    return ListElement;
  })(ons._BaseElement);

  if (!window.OnsListElement) {
    window.OnsListElement = document.registerElement('ons-list', {
      prototype: ListElement.prototype
    });
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
   http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var scheme = {
    '.text-input--material': 'text-input--material--*',
    '.text-input--material__label': 'text-input--material__label--*'
  };

  var ModifierUtil = ons._internal.ModifierUtil;

  var INPUT_ATTRIBUTES = ['autocapitalize', 'autocomplete', 'autocorrect', 'autofocus', 'disabled', 'inputmode', 'max', 'maxlength', 'min', 'minlength', 'name', 'pattern', 'placeholder', 'readonly', 'size', 'step', 'type', 'validator', 'value'];

  var MaterialInputElement = (function (_ons$_BaseElement) {
    _inherits(MaterialInputElement, _ons$_BaseElement);

    function MaterialInputElement() {
      _classCallCheck(this, MaterialInputElement);

      _get(Object.getPrototypeOf(MaterialInputElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(MaterialInputElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this._compile();
        ModifierUtil.initModifier(this, scheme);
        this._updateLabel();
        this._updateLabelColor();
        this._updateBoundAttributes();

        this._boundOnInput = this._onInput.bind(this);
        this._boundOnFocusin = this._onFocusin.bind(this);
        this._boundOnFocusout = this._onFocusout.bind(this);
      }
    }, {
      key: '_compile',
      value: function _compile() {
        this.appendChild(document.createElement('input'));
        this._input.classList.add('text-input--material');
        this.appendChild(document.createElement('span'));
        this._label.classList.add('text-input--material__label');
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'modifier') {
          return ModifierUtil.onModifierChanged(last, current, this, scheme);
        } else if (name === 'label') {
          return this._updateLabel();
        } else if (INPUT_ATTRIBUTES.indexOf(name) >= 0) {
          return this._updateBoundAttributes();
        }
      }
    }, {
      key: 'attachedCallback',
      value: function attachedCallback() {
        this._input.addEventListener('input', this._boundOnInput);
        this._input.addEventListener('focusin', this._boundOnFocusin);
        this._input.addEventListener('focusout', this._boundOnFocusout);
      }
    }, {
      key: 'detachedCallback',
      value: function detachedCallback() {
        this._input.removeEventListener('input', this._boundOnInput);
        this._input.removeEventListener('focusin', this._boundOnFocusin);
        this._input.removeEventListener('focusout', this._boundOnFocusout);
      }
    }, {
      key: '_setLabel',
      value: function _setLabel(value) {
        if (typeof this._label.textContent !== 'undefined') {
          this._label.textContent = value;
        } else {
          this._label.innerText = value;
        }
      }
    }, {
      key: '_updateLabel',
      value: function _updateLabel() {
        this._setLabel(this.hasAttribute('label') ? this.getAttribute('label') : '');
      }
    }, {
      key: '_updateBoundAttributes',
      value: function _updateBoundAttributes() {
        var _this = this;

        INPUT_ATTRIBUTES.forEach(function (attr) {
          if (_this.hasAttribute(attr)) {
            _this._input.setAttribute(attr, _this.getAttribute(attr));
          } else {
            _this._input.removeAttribute(attr);
          }
        });
      }
    }, {
      key: '_updateLabelColor',
      value: function _updateLabelColor() {
        if (this.value.length > 0 && this._input === document.activeElement) {
          this._label.style.color = '';
        } else {
          this._label.style.color = 'rgba(0, 0, 0, 0.5)';
        }
      }
    }, {
      key: '_onInput',
      value: function _onInput(event) {
        if (this.value === '') {
          this._label.classList.remove('text-input--material__label--active');
        } else {
          this._label.classList.add('text-input--material__label--active');
        }

        this._updateLabelColor();
      }
    }, {
      key: '_onFocusin',
      value: function _onFocusin(event) {
        this._updateLabelColor();
      }
    }, {
      key: '_onFocusout',
      value: function _onFocusout(event) {
        this._updateLabelColor();
      }
    }, {
      key: '_input',
      get: function get() {
        return this.querySelector('input');
      }
    }, {
      key: '_label',
      get: function get() {
        return this.querySelector('span');
      }
    }, {
      key: 'value',
      get: function get() {
        return this._input.value;
      },
      set: function set(val) {
        this._input.value = val;
        this._onInput();

        return this._input.val;
      }
    }]);

    return MaterialInputElement;
  })(ons._BaseElement);

  if (!window.OnsMaterialInputElement) {
    window.OnsMaterialInputElement = document.registerElement('ons-material-input', {
      prototype: MaterialInputElement.prototype
    });
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var scheme = {
    '': 'modal--*',
    'modal__content': 'modal--*__content'
  };

  var AnimatorFactory = ons._internal.AnimatorFactory;
  var ModalAnimator = ons._internal.ModalAnimator;
  var FadeModalAnimator = ons._internal.FadeModalAnimator;
  var ModifierUtil = ons._internal.ModifierUtil;
  var util = ons._util;

  var ModalElement = (function (_ons$_BaseElement) {
    _inherits(ModalElement, _ons$_BaseElement);

    function ModalElement() {
      _classCallCheck(this, ModalElement);

      _get(Object.getPrototypeOf(ModalElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ModalElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this._doorLock = new DoorLock();
        this._animatorFactory = new AnimatorFactory({
          animators: OnsModalElement._animatorDict,
          baseClass: ModalAnimator,
          baseClassName: 'ModalAnimator',
          defaultAnimation: this.getAttribute('animation')
        });

        this._compile();
        ModifierUtil.initModifier(this, scheme);
      }
    }, {
      key: 'getDeviceBackButtonHandler',
      value: function getDeviceBackButtonHandler() {
        return this._deviceBackButtonHandler;
      }
    }, {
      key: 'setDeviceBackButtonHandler',
      value: function setDeviceBackButtonHandler(callback) {
        if (this._deviceBackButtonHandler) {
          this._deviceBackButtonHandler.destroy();
        }

        this._deviceBackButtonHandler = ons._deviceBackButtonDispatcher.createHandler(this, callback);
        this._onDeviceBackButton = callback;
      }
    }, {
      key: '_onDeviceBackButton',
      value: function _onDeviceBackButton() {
        // Do nothing and stop device-backbutton handler chain.
        return;
      }
    }, {
      key: '_compile',
      value: function _compile() {
        this.style.display = 'none';
        this.classList.add('modal');

        var wrapper = document.createElement('div');
        wrapper.classList.add('modal__content');

        while (this.childNodes[0]) {
          var node = this.childNodes[0];
          this.removeChild(node);
          wrapper.insertBefore(node, null);
        }

        this.appendChild(wrapper);
      }
    }, {
      key: 'detachedCallback',
      value: function detachedCallback() {
        if (this._deviceBackButtonHandler) {
          this._deviceBackButtonHandler.destroy();
        }
      }
    }, {
      key: 'attachedCallback',
      value: function attachedCallback() {
        setImmediate(this._ensureNodePosition.bind(this));
        this._deviceBackButtonHandler = ons._deviceBackButtonDispatcher.createHandler(this, this._onDeviceBackButton.bind(this));
      }
    }, {
      key: '_ensureNodePosition',
      value: function _ensureNodePosition() {
        if (!this.parentNode || this.hasAttribute('inline')) {
          return;
        }

        if (this.parentNode.nodeName.toLowerCase() !== 'ons-page') {
          var page = this;
          for (;;) {
            page = page.parentNode;

            if (!page) {
              return;
            }

            if (page.nodeName.toLowerCase() === 'ons-page') {
              break;
            }
          }
          page._registerExtraElement(this);
        }
      }
    }, {
      key: 'isShown',
      value: function isShown() {
        return this.style.display !== 'none';
      }

      /**
       * Show modal view.
       *
       * @param {Object} [options]
       * @param {String} [options.animation] animation type
       * @param {Object} [options.animationOptions] animation options
       * @param {Function} [options.callback] callback after modal is shown
       */
    }, {
      key: 'show',
      value: function show() {
        var _this = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        options.animationOptions = util.extend(options.animationOptions || {}, AnimatorFactory.parseAnimationOptionsString(this.getAttribute('animation-options')));

        var callback = options.callback || function () {};

        this._doorLock.waitUnlock(function () {
          var unlock = _this._doorLock.lock(),
              animator = _this._animatorFactory.newAnimator(options);

          _this.style.display = 'table';
          animator.show(_this, function () {
            unlock();
            callback();
          });
        });
      }

      /**
       * Toggle modal view.
       *
       * @param {Object} [options]
       * @param {String} [options.animation] animation type
       * @param {Object} [options.animationOptions] animation options
       * @param {Function} [options.callback] callback after modal is toggled
       */
    }, {
      key: 'toggle',
      value: function toggle() {
        if (this.isShown()) {
          return this.hide.apply(this, arguments);
        } else {
          return this.show.apply(this, arguments);
        }
      }

      /**
       * Hide modal view.
       *
       * @param {Object} [options]
       * @param {String} [options.animation] animation type
       * @param {Object} [options.animationOptions] animation options
       * @param {Function} [options.callback] callback after modal is hidden
       */
    }, {
      key: 'hide',
      value: function hide() {
        var _this2 = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        options.animationOptions = util.extend(options.animationOptions || {}, AnimatorFactory.parseAnimationOptionsString(this.getAttribute('animation-options')));

        var callback = options.callback || function () {};

        this._doorLock.waitUnlock(function () {
          var unlock = _this2._doorLock.lock(),
              animator = _this2._animatorFactory.newAnimator(options);

          animator.hide(_this2, function () {
            _this2.style.display = 'none';
            unlock();
            callback();
          });
        });
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'modifier') {
          return ModifierUtil.onModifierChanged(last, current, this, scheme);
        }
      }
    }]);

    return ModalElement;
  })(ons._BaseElement);

  if (!window.OnsModalElement) {
    window.OnsModalElement = document.registerElement('ons-modal', {
      prototype: ModalElement.prototype
    });

    window.OnsModalElement._animatorDict = {
      'default': ModalAnimator,
      'fade': FadeModalAnimator,
      'none': ModalAnimator
    };

    /**
     * @param {String} name
     * @param {Function} Animator
     */
    window.OnsModalElement.registerAnimator = function (name, Animator) {
      if (!(Animator.prototype instanceof ModalAnimator)) {
        throw new Error('"Animator" param must inherit ModalAnimator');
      }
      this._animatorDict[name] = Animator;
    };
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var AnimatorFactory = ons._internal.AnimatorFactory;
  var NavigatorTransitionAnimator = ons._internal.NavigatorTransitionAnimator;
  var IOSSlideNavigatorTransitionAnimator = ons._internal.IOSSlideNavigatorTransitionAnimator;
  var SimpleSlideNavigatorTransitionAnimator = ons._internal.SimpleSlideNavigatorTransitionAnimator;
  var LiftNavigatorTransitionAnimator = ons._internal.LiftNavigatorTransitionAnimator;
  var FadeNavigatorTransitionAnimator = ons._internal.FadeNavigatorTransitionAnimator;
  var NoneNavigatorTransitionAnimator = ons._internal.NoneNavigatorTransitionAnimator;
  var util = ons._util;
  var NavigatorPage = ons._internal.NavigatorPage;

  var NavigatorElement = (function (_ons$_BaseElement) {
    _inherits(NavigatorElement, _ons$_BaseElement);

    function NavigatorElement() {
      _classCallCheck(this, NavigatorElement);

      _get(Object.getPrototypeOf(NavigatorElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(NavigatorElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this._doorLock = new DoorLock();
        this._pages = [];
        this._boundOnDeviceBackButton = this._onDeviceBackButton.bind(this);
        this._isPushing = this._isPopping = false;

        this._initialHTML = this.innerHTML;
        this.innerHTML = '';

        this._animatorFactory = new AnimatorFactory({
          animators: window.OnsNavigatorElement._transitionAnimatorDict,
          baseClass: NavigatorTransitionAnimator,
          baseClassName: 'NavigatorTransitionAnimator',
          defaultAnimation: this.getAttribute('animation')
        });
      }

      /**
       * @return {Boolean}
       */
    }, {
      key: 'canPopPage',
      value: function canPopPage() {
        return this._pages.length > 1;
      }

      /**
       * Replaces the current page with the specified one.
       *
       * @param {String} page
       * @param {Object} [options]
       */
    }, {
      key: 'replacePage',
      value: function replacePage(page, options) {
        var _this = this;

        options = options || {};

        var onTransitionEnd = options.onTransitionEnd || function () {};

        options.onTransitionEnd = function () {
          if (_this._pages.length > 1) {
            _this._pages[_this._pages.length - 2].destroy();
          }
          onTransitionEnd();
        };

        return this.pushPage(page, options);
      }

      /**
       * Pops current page from the page stack.
       *
       * @param {Object} [options]
       * @param {String} [options.animation]
       * @param {Object} [options.animationOptions]
       * @param {Boolean} [options.refresh]
       * @param {Function} [options.onTransitionEnd]
       * @param {Boolean} [options.cancelIfRunning]
       */
    }, {
      key: 'popPage',
      value: function popPage(options) {
        var _this2 = this;

        options = options || {};

        if (options.cancelIfRunning && this._isPopping) {
          return;
        }

        options.animationOptions = util.extend(options.animationOptions || {}, AnimatorFactory.parseAnimationOptionsString(this.getAttribute('animation-options')));

        this._doorLock.waitUnlock(function () {
          if (_this2._pages.length <= 1) {
            throw new Error('ons-navigator\'s page stack is empty.');
          }

          if (_this2._emitPrePopEvent()) {
            return;
          }

          var unlock = _this2._doorLock.lock();

          if (options.refresh) {
            (function () {
              var index = _this2.pages.length - 2;

              if (!_this2._pages[index].page) {
                throw new Error('Refresh option cannot be used with pages directly inside the Navigator. Use ons-template instead.');
              }

              ons._internal.getPageHTMLAsync(_this2._pages[index].page).then(function (templateHTML) {
                var element = _this2._createPageElement(templateHTML);
                var pageObject = _this2._createPageObject(_this2._pages[index].page, element, options);

                window.OnsNavigatorElement.rewritables.link(_this2, element, function (element) {
                  _this2.insertBefore(element, _this2._pages[index] ? _this2._pages[index].element : null);
                  _this2._pages.splice(index, 0, pageObject);

                  _this2._pages[index + 1].destroy();
                  _this2._popPage(options, unlock);
                });
              });
            })();
          } else {
            _this2._popPage(options, unlock);
          }
        });
      }
    }, {
      key: '_popPage',
      value: function _popPage(options, unlock) {
        var _this3 = this;

        options.animationOptions = util.extend(options.animationOptions || {}, AnimatorFactory.parseAnimationOptionsString(this.getAttribute('animation-options')));

        var leavePage = this._pages.pop();
        var enterPage = this._pages[this._pages.length - 1];

        leavePage.element._hide();
        if (enterPage) {
          enterPage.element.style.display = 'block';
          enterPage.element._show();
        }

        // for "postpop" event
        var eventDetail = {
          leavePage: leavePage,
          enterPage: this._pages[this._pages.length - 1],
          navigator: this
        };

        var callback = function callback() {
          leavePage.destroy();

          _this3._isPopping = false;
          unlock();

          var event = util.triggerElementEvent(_this3, 'postpop', eventDetail);
          event.leavePage = null;

          if (typeof options.onTransitionEnd === 'function') {
            options.onTransitionEnd();
          }
        };

        this._isPopping = true;

        var animator = this._animatorFactory.newAnimator(options, leavePage.options.animator);
        animator.pop(enterPage, leavePage, callback);
      }

      /**
       * Insert page object that has the specified pageUrl into the page stack and
       * if options object is specified, apply the options.
       *
       * @param {Number} index
       * @param {String} page
       * @param {Object} [options]
       * @param {String/NavigatorTransitionAnimator} [options.animation]
       */
    }, {
      key: 'insertPage',
      value: function insertPage(index, page, options) {
        var _this4 = this;

        options = options || {};

        if (options && typeof options != 'object') {
          throw new Error('options must be an object. You supplied ' + options);
        }

        index = this._normalizeIndex(index);

        if (index >= this.pages.length) {
          return this.pushPage.apply(this, [].slice.call(arguments, 1));
        }

        this._doorLock.waitUnlock(function () {
          var unlock = _this4._doorLock.lock();

          ons._internal.getPageHTMLAsync(page).then(function (templateHTML) {
            var element = _this4._createPageElement(templateHTML);
            var pageObject = _this4._createPageObject(page, element, options);

            window.OnsNavigatorElement.rewritables.link(_this4, element, function (element) {
              element.style.display = 'none';
              _this4.insertBefore(element, _this4._pages[index].element);
              _this4._pages.splice(index, 0, pageObject);

              setTimeout(function () {
                unlock();
                element = null;
              }, 1000 / 60);
            });
          });
        });
      }
    }, {
      key: '_normalizeIndex',
      value: function _normalizeIndex(index) {
        if (index < 0) {
          index = Math.abs(this.pages.length + index) % this.pages.length;
        }
        return index;
      }

      /**
       * Get current page's navigator item.
       *
       * Use this method to access options passed by pushPage() or resetToPage() method.
       * eg. ons.navigator.getCurrentPage().options
       *
       * @return {Object}
       */
    }, {
      key: 'getCurrentPage',
      value: function getCurrentPage() {
        if (this._pages.length <= 0) {
          throw new Error('Invalid state');
        }
        return this._pages[this._pages.length - 1];
      }
    }, {
      key: '_show',
      value: function _show() {
        if (this._pages[this._pages.length - 1]) {
          this._pages[this._pages.length - 1].element._show();
        }
      }
    }, {
      key: '_hide',
      value: function _hide() {
        if (this._pages[this._pages.length - 1]) {
          this._pages[this._pages.length - 1].element._hide();
        }
      }
    }, {
      key: '_destroy',
      value: function _destroy() {
        for (var i = this._pages.length - 1; i >= 0; i--) {
          this._pages[i].destroy();
        }
        this.remove();
      }
    }, {
      key: '_onDeviceBackButton',
      value: function _onDeviceBackButton(event) {
        if (this._pages.length > 1) {
          this.popPage();
        } else {
          event.callParentHandler();
        }
      }

      /**
       * Clears page stack and add the specified pageUrl to the page stack.
       * If options object is specified, apply the options.
       * the options object include all the attributes of this navigator.
       *
       * If page is undefined, navigator will push initial page contents instead of.
       *
       * @param {String/undefined} page
       * @param {Object} [options]
       */
    }, {
      key: 'resetToPage',
      value: function resetToPage(page, options) {
        var _this5 = this;

        options = options || {};

        if (!options.animator && !options.animation) {
          options.animation = 'none';
        }

        var onTransitionEnd = options.onTransitionEnd || function () {};

        options.onTransitionEnd = function () {
          while (_this5._pages.length > 1) {
            _this5._pages.shift().destroy();
          }
          onTransitionEnd();
        };

        if (page === undefined || page === '') {
          if (this.hasAttribute('page')) {
            page = this.getAttribute('page');
          } else {
            options.pageHTML = this._initialHTML;
            page = '';
          }
        }
        this.pushPage(page, options);
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {}
    }, {
      key: 'attachedCallback',
      value: function attachedCallback() {
        var _this6 = this;

        this._deviceBackButtonHandler = ons._deviceBackButtonDispatcher.createHandler(this, this._boundOnDeviceBackButton);

        window.OnsNavigatorElement.rewritables.ready(this, function () {
          if (_this6._pages.length === 0) {
            if (!_this6.getAttribute('page')) {
              var element = _this6._createPageElement(_this6._initialHTML || '');

              _this6._pushPageDOM(_this6._createPageObject('', element, {}), function () {});
            } else {
              _this6.pushPage(_this6.getAttribute('page'), { animation: 'none' });
            }
          }
        });
      }
    }, {
      key: 'detachedCallback',
      value: function detachedCallback() {
        this._deviceBackButtonHandler.destroy();
        this._deviceBackButtonHandler = null;
      }

      /**
       * Pushes the specified pageUrl into the page stack and
       * if options object is specified, apply the options.
       *
       * @param {String} page
       * @param {Object} [options]
       * @param {String/NavigatorTransitionAnimator} [options.animation]
       * @param {Object} [options.animationOptions]
       * @param {Function} [options.onTransitionEnd]
       * @param {Boolean} [options.cancelIfRunning]
       * @param {String} [options.pageHTML]
       */
    }, {
      key: 'pushPage',
      value: function pushPage(page, options) {
        var _this7 = this;

        options = options || {};

        options.animationOptions = util.extend(options.animationOptions || {}, AnimatorFactory.parseAnimationOptionsString(this.getAttribute('animation-options')));

        if (options.cancelIfRunning && this._isPushing) {
          return;
        }

        if (options && typeof options != 'object') {
          throw new Error('options must be an object. You supplied ' + options);
        }

        if (this._emitPrePushEvent()) {
          return;
        }

        this._doorLock.waitUnlock(function () {
          return _this7._pushPage(page, options);
        });
      }
    }, {
      key: '_pushPage',
      value: function _pushPage(page, options) {
        var _this8 = this;

        var unlock = this._doorLock.lock();
        var done = function done() {
          unlock();
        };

        var run = function run(templateHTML) {
          var element = _this8._createPageElement(templateHTML);
          _this8._pushPageDOM(_this8._createPageObject(page, element, options), done);
        };

        if (options.pageHTML) {
          run(options.pageHTML);
        } else {
          ons._internal.getPageHTMLAsync(page).then(run);
        }
      }

      /**
       * @param {Object} pageObject
       * @param {Function} [unlock]
       */
    }, {
      key: '_pushPageDOM',
      value: function _pushPageDOM(pageObject, unlock) {
        var _this9 = this;

        unlock = unlock || function () {};

        var element = pageObject.element;
        var options = pageObject.options;

        // for "postpush" event
        var eventDetail = {
          enterPage: pageObject,
          leavePage: this._pages[this._pages.length - 1],
          navigator: this
        };

        this._pages.push(pageObject);

        var done = function done() {
          if (_this9._pages[_this9._pages.length - 2]) {
            _this9._pages[_this9._pages.length - 2].element.style.display = 'none';
          }

          _this9._isPushing = false;
          unlock();

          util.triggerElementEvent(_this9, 'postpush', eventDetail);

          if (typeof options.onTransitionEnd === 'function') {
            options.onTransitionEnd();
          }
          element = null;
        };

        this._isPushing = true;

        window.OnsNavigatorElement.rewritables.link(this, element, function (element) {
          setTimeout(function () {
            if (_this9._pages.length > 1) {
              var leavePage = _this9._pages.slice(-2)[0];
              var enterPage = _this9._pages.slice(-1)[0];

              _this9.appendChild(element);
              leavePage.element._hide();
              enterPage.element._show();

              options.animator.push(enterPage, leavePage, done);
            } else {
              _this9.appendChild(element);
              element._show();

              done();
            }
          }, 1000 / 60);
        });
      }

      /**
       * Brings the given pageUrl or index to the top of the page stack
       * if already exists or pushes the page into the stack if doesn't.
       * If options object is specified, apply the options.
       *
       * @param {String|Number} item Page name or valid index.
       * @param {Object} options
       */
    }, {
      key: 'bringPageTop',
      value: function bringPageTop(item, options) {
        var _this10 = this;

        options = options || {};

        if (options && typeof options != 'object') {
          throw new Error('options must be an object. You supplied ' + options);
        }

        if (options.cancelIfRunning && this._isPushing) {
          return;
        }

        if (this._emitPrePushEvent()) {
          return;
        }

        var index = undefined,
            page = undefined;
        if (typeof item === 'string') {
          page = item;
          index = this._lastIndexOfPage(page);
        } else if (typeof item === 'number') {
          index = this._normalizeIndex(item);
          if (item >= this._pages.length) {
            throw new Error('The provided index does not match an existing page.');
          }
          page = this._pages[index].page;
        } else {
          throw new Error('First argument must be a page name or the index of an existing page. You supplied ' + item);
        }

        if (index < 0) {
          // Fallback pushPage
          this._doorLock.waitUnlock(function () {
            return _this10._pushPage(page, options);
          });
        } else if (index < this._pages.length - 1) {
          // Skip when page is already the top
          // Bring to top
          this._doorLock.waitUnlock(function () {
            var unlock = _this10._doorLock.lock();
            var done = function done() {
              unlock();
            };

            var pageObject = _this10._pages.splice(index, 1)[0];
            pageObject.element.style.display = 'block';
            pageObject.element.setAttribute('_skipinit', '');
            options.animator = _this10._animatorFactory.newAnimator(options);
            pageObject.options = options;

            _this10._pushPageDOM(pageObject, done);
          });
        }
      }

      /**
       * @param {String} page
       * @return {Number} Returns the last index at which the given page
       * is found in the page-stack, or -1 if it is not present.
       */
    }, {
      key: '_lastIndexOfPage',
      value: function _lastIndexOfPage(page) {
        var index = undefined;
        for (index = this._pages.length - 1; index >= 0; index--) {
          if (this._pages[index].page === page) {
            break;
          }
        }
        return index;
      }

      /**
       * @return {Boolean} Whether if event is canceled.
       */
    }, {
      key: '_emitPrePushEvent',
      value: function _emitPrePushEvent() {
        var isCanceled = false;

        util.triggerElementEvent(this, 'prepush', {
          navigator: this,
          currentPage: this._pages.length > 0 ? this.getCurrentPage() : undefined,
          cancel: function cancel() {
            isCanceled = true;
          }
        });

        return isCanceled;
      }

      /**
       * @return {Boolean} Whether if event is canceled.
       */
    }, {
      key: '_emitPrePopEvent',
      value: function _emitPrePopEvent() {
        var isCanceled = false;

        var leavePage = this.getCurrentPage();
        util.triggerElementEvent(this, 'prepop', {
          navigator: this,
          // TODO: currentPage will be deprecated
          currentPage: leavePage,
          leavePage: leavePage,
          enterPage: this._pages[this._pages.length - 2],
          cancel: function cancel() {
            isCanceled = true;
          }
        });

        return isCanceled;
      }

      /**
       * @param {String} page
       * @param {Element} element
       * @param {Object} options
       */
    }, {
      key: '_createPageObject',
      value: function _createPageObject(page, element, options) {

        options.animator = this._animatorFactory.newAnimator(options);

        return new NavigatorPage({
          page: page,
          element: element,
          options: options,
          navigator: this
        });
      }
    }, {
      key: '_createPageElement',
      value: function _createPageElement(templateHTML) {
        var pageElement = util.createElement(ons._internal.normalizePageHTML(templateHTML));

        if (pageElement.nodeName.toLowerCase() !== 'ons-page') {
          throw new Error('You must supply an "ons-page" element to "ons-navigator".');
        }

        return pageElement;
      }
    }, {
      key: 'pages',
      get: function get() {
        return this._pages.slice(0);
      }
    }]);

    return NavigatorElement;
  })(ons._BaseElement);

  if (!window.OnsNavigatorElement) {
    window.OnsNavigatorElement = document.registerElement('ons-navigator', {
      prototype: NavigatorElement.prototype
    });

    window.OnsNavigatorElement._transitionAnimatorDict = {
      'default': ons.platform.isAndroid() ? SimpleSlideNavigatorTransitionAnimator : IOSSlideNavigatorTransitionAnimator,
      'slide': ons.platform.isAndroid() ? SimpleSlideNavigatorTransitionAnimator : IOSSlideNavigatorTransitionAnimator,
      'simpleslide': SimpleSlideNavigatorTransitionAnimator,
      'lift': LiftNavigatorTransitionAnimator,
      'fade': FadeNavigatorTransitionAnimator,
      'none': NoneNavigatorTransitionAnimator
    };

    /**
     * @param {String} name
     * @param {Function} Animator
     */
    window.OnsNavigatorElement.registerAnimator = function (name, Animator) {
      if (!(Animator.prototype instanceof NavigatorTransitionAnimator)) {
        throw new Error('"Animator" param must inherit NavigatorTransitionAnimator');
      }

      this._transitionAnimatorDict[name] = Animator;
    };

    window.OnsNavigatorElement.rewritables = {
      /**
       * @param {Element} navigatorSideElement
       * @param {Function} callback
       */
      ready: function ready(navigatorElement, callback) {
        callback();
      },

      /**
       * @param {Element} navigatorElement
       * @param {Element} target
       * @param {Function} callback
       */
      link: function link(navigatorElement, target, callback) {
        callback(target);
      }
    };
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var scheme = {
    '': 'page--*',
    '.page__content': 'page--*__content',
    '.page__background': 'page--*__background'
  };
  var ModifierUtil = ons._internal.ModifierUtil;
  var nullToolbarElement = document.createElement('ons-toolbar');
  var util = ons._util;

  var PageElement = (function (_ons$_BaseElement) {
    _inherits(PageElement, _ons$_BaseElement);

    function PageElement() {
      _classCallCheck(this, PageElement);

      _get(Object.getPrototypeOf(PageElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(PageElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this.classList.add('page');
        this._compile();
        ModifierUtil.initModifier(this, scheme);
        this._isShown = false;
        this._isMuted = this.hasAttribute('_muted');
        this._skipInit = this.hasAttribute('_skipinit');
        this.eventDetail = {
          page: this
        };
      }
    }, {
      key: 'attachedCallback',
      value: function attachedCallback() {
        if (!this._isMuted) {
          if (this._skipInit) {
            this.removeAttribute('_skipinit');
          } else {
            util.triggerElementEvent(this, 'init', this.eventDetail);
          }
        }

        if (!util.hasAnyComponentAsParent(this)) {
          this._show();
        }
      }

      /**
       * @return {boolean}
       */
    }, {
      key: 'getDeviceBackButtonHandler',

      /**
       * @return {Object/null}
       */
      value: function getDeviceBackButtonHandler() {
        return this._deviceBackButtonHandler || null;
      }

      /**
       * @param {Function} callback
       */
    }, {
      key: 'setDeviceBackButtonHandler',
      value: function setDeviceBackButtonHandler(callback) {
        if (this._deviceBackButtonHandler) {
          this._deviceBackButtonHandler.destroy();
        }

        this._deviceBackButtonHandler = ons._deviceBackButtonDispatcher.createHandler(this, callback);
      }

      /**
       * @return {HTMLElement}
       */
    }, {
      key: '_getContentElement',
      value: function _getContentElement() {
        var result = ons._util.findChild(this, '.page__content');
        if (result) {
          return result;
        }
        throw Error('fail to get ".page__content" element.');
      }

      /**
       * @return {Boolean}
       */
    }, {
      key: '_hasToolbarElement',
      value: function _hasToolbarElement() {
        return !!ons._util.findChild(this, 'ons-toolbar');
      }

      /**
       * @return {Boolean}
       */
    }, {
      key: '_canAnimateToolbar',
      value: function _canAnimateToolbar() {
        var toolbar = ons._util.findChild(this, 'ons-toolbar');
        if (toolbar) {
          return true;
        }

        var elements = this._getContentElement().children;
        for (var i = 0; i < elements.length; i++) {
          if (elements[i].nodeName.toLowerCase() === 'ons-toolbar' && !elements[i].hasAttribute('inline')) {
            return true;
          }
        }

        return false;
      }

      /**
       * @return {HTMLElement}
       */
    }, {
      key: '_getBackgroundElement',
      value: function _getBackgroundElement() {
        var result = ons._util.findChild(this, '.page__background');
        if (result) {
          return result;
        }
        throw Error('fail to get ".page__background" element.');
      }

      /**
       * @return {HTMLElement}
       */
    }, {
      key: '_getBottomToolbarElement',
      value: function _getBottomToolbarElement() {
        return ons._util.findChild(this, 'ons-bottom-toolbar') || ons._internal.nullElement;
      }

      /**
       * @return {HTMLElement}
       */
    }, {
      key: '_getToolbarElement',
      value: function _getToolbarElement() {
        return ons._util.findChild(this, 'ons-toolbar') || nullToolbarElement;
      }

      /**
       * Register toolbar element to this page.
       *
       * @param {HTMLElement} element
       */
    }, {
      key: '_registerToolbar',
      value: function _registerToolbar(element) {
        this._getContentElement().setAttribute('no-status-bar-fill', '');

        if (ons._util.findChild(this, '.page__status-bar-fill')) {
          this.insertBefore(element, this.children[1]);
        } else {
          this.insertBefore(element, this.children[0]);
        }
      }

      /**
       * Register toolbar element to this page.
       *
       * @param {HTMLElement} element
       */
    }, {
      key: '_registerBottomToolbar',
      value: function _registerBottomToolbar(element) {
        if (!ons._util.findChild(this, '.page__status-bar-fill')) {
          var fill = document.createElement('div');
          fill.classList.add('page__bottom-bar-fill');
          fill.style.width = '0px';
          fill.style.height = '0px';

          this.insertBefore(fill, this.children[0]);
          this.insertBefore(element, null);
        }
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'modifier') {
          return ModifierUtil.onModifierChanged(last, current, this, scheme);
        } else if (name === '_muted') {
          this._isMuted = this.hasAttribute('_muted');
        } else if (name === '_skipinit') {
          this._skipInit = this.hasAttribute('_skipinit');
        }
      }
    }, {
      key: '_compile',
      value: function _compile() {
        if (ons._util.findChild(this, '.page__background') && ons._util.findChild(this, '.page__content')) {
          return;
        }

        var background = document.createElement('div');
        background.classList.add('page__background');

        var content = document.createElement('div');
        content.classList.add('page__content');

        while (this.childNodes[0]) {
          content.appendChild(this.childNodes[0]);
        }

        if (this.hasAttribute('style')) {
          background.setAttribute('style', this.getAttribute('style'));
          this.removeAttribute('style', null);
        }

        var fragment = document.createDocumentFragment();
        fragment.appendChild(background);
        fragment.appendChild(content);

        this.appendChild(fragment);
      }
    }, {
      key: '_registerExtraElement',
      value: function _registerExtraElement(element) {
        var extra = ons._util.findChild(this, '.page__extra');
        if (!extra) {
          extra = document.createElement('div');
          extra.classList.add('page__extra');
          extra.style.zIndex = '10001';
          this.insertBefore(extra, null);
        }

        extra.insertBefore(element, null);
      }
    }, {
      key: '_tryToFillStatusBar',
      value: function _tryToFillStatusBar() {
        if (ons._internal.shouldFillStatusBar(this)) {
          // Adjustments for IOS7
          var fill = document.createElement('div');
          fill.classList.add('page__status-bar-fill');
          fill.style.width = '0px';
          fill.style.height = '0px';

          this.insertBefore(fill, this.children[0]);
        }
      }
    }, {
      key: '_show',
      value: function _show() {
        if (!this.isShown && ons._util.isAttached(this)) {
          this.isShown = true;

          if (!this._isMuted) {
            util.triggerElementEvent(this, 'show', this.eventDetail);
          }

          ons._util.propagateAction(this._getContentElement(), '_show');
        }
      }
    }, {
      key: '_hide',
      value: function _hide() {
        if (this.isShown) {
          this.isShown = false;

          if (!this._isMuted) {
            util.triggerElementEvent(this, 'hide', this.eventDetail);
          }

          ons._util.propagateAction(this._getContentElement(), '_hide');
        }
      }
    }, {
      key: '_destroy',
      value: function _destroy() {
        this._hide();

        if (!this._isMuted) {
          util.triggerElementEvent(this, 'destroy', this.eventDetail);
        }

        if (this.getDeviceBackButtonHandler()) {
          this.getDeviceBackButtonHandler().destroy();
        }

        ons._util.propagateAction(this._getContentElement(), '_destroy');

        this.remove();
      }
    }, {
      key: 'isShown',
      get: function get() {
        return this._isShown;
      },

      /**
       * @param {boolean}
       */
      set: function set(value) {
        this._isShown = value;
      }
    }]);

    return PageElement;
  })(ons._BaseElement);

  if (!window.OnsPageElement) {
    window.OnsPageElement = document.registerElement('ons-page', {
      prototype: PageElement.prototype
    });
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var util = ons._util;
  var ModifierUtil = ons._internal.ModifierUtil;
  var scheme = {
    '.popover': 'popover--*',
    '.popover__content': 'popover__content--*'
  };
  var PopoverAnimator = ons._internal.PopoverAnimator;
  var FadePopoverAnimator = ons._internal.FadePopoverAnimator;
  var templateSource = util.createElement('\n    <div>\n      <div class="popover-mask"></div>\n      <div class="popover">\n        <div class="popover__content"></div>\n        <div class="popover__arrow"></div>\n      </div>\n    </div>\n  ');
  var AnimatorFactory = ons._internal.AnimatorFactory;

  var PopoverElement = (function (_ons$_BaseElement) {
    _inherits(PopoverElement, _ons$_BaseElement);

    function PopoverElement() {
      _classCallCheck(this, PopoverElement);

      _get(Object.getPrototypeOf(PopoverElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(PopoverElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this._compile();
        this.style.display = 'none';
        ModifierUtil.initModifier(this, scheme);

        this._mask.style.zIndex = '20000';
        this._popover.style.zIndex = '20001';

        if (this.hasAttribute('mask-color')) {
          this._mask.style.backgroundColor = this.getAttribute('mask-color');
        }

        this._visible = false;
        this._doorLock = new DoorLock();
        this._boundOnChange = this._onChange.bind(this);
        this._boundCancel = this._cancel.bind(this);

        this._animatorFactory = this._createAnimatorFactory();
      }
    }, {
      key: '_createAnimatorFactory',
      value: function _createAnimatorFactory() {
        return new AnimatorFactory({
          animators: window.OnsPopoverElement._animatorDict,
          baseClass: PopoverAnimator,
          baseClassName: 'PopoverAnimator',
          defaultAnimation: this.getAttribute('animation') || 'fade'
        });
      }
    }, {
      key: '_onDeviceBackButton',
      value: function _onDeviceBackButton(event) {
        if (this.isCancelable()) {
          this._cancel();
        } else {
          event.callParentHandler();
        }
      }
    }, {
      key: '_setDirection',
      value: function _setDirection(direction) {
        var arrowPosition = undefined;
        if (direction === 'up') {
          arrowPosition = 'bottom';
        } else if (direction === 'left') {
          arrowPosition = 'right';
        } else if (direction === 'down') {
          arrowPosition = 'top';
        } else if (direction == 'right') {
          arrowPosition = 'left';
        } else {
          throw new Error('Invalid direction.');
        }

        var popoverClassList = this._popover.classList;
        popoverClassList.remove('popover--up');
        popoverClassList.remove('popover--down');
        popoverClassList.remove('popover--left');
        popoverClassList.remove('popover--right');
        popoverClassList.add('popover--' + direction);

        var arrowClassList = this._arrow.classList;
        arrowClassList.remove('popover__top-arrow');
        arrowClassList.remove('popover__bottom-arrow');
        arrowClassList.remove('popover__left-arrow');
        arrowClassList.remove('popover__right-arrow');
        arrowClassList.add('popover__' + arrowPosition + '-arrow');
      }
    }, {
      key: '_positionPopoverByDirection',
      value: function _positionPopoverByDirection(target, direction) {
        var el = this._popover;
        var pos = target.getBoundingClientRect();
        var own = el.getBoundingClientRect();
        var arrow = el.children[1];
        var offset = 14;
        var margin = 6;
        var radius = parseInt(window.getComputedStyle(el.querySelector('.popover__content')).borderRadius);

        arrow.style.top = '';
        arrow.style.left = '';

        this._setDirection(direction);

        // Position popover next to the target.
        if (['left', 'right'].indexOf(direction) > -1) {
          if (direction == 'left') {
            el.style.left = pos.right - pos.width - own.width - offset + 'px';
          } else {
            el.style.left = pos.right + offset + 'px';
          }
          el.style.top = pos.bottom - pos.height / 2 - own.height / 2 + 'px';
        } else {
          if (direction == 'up') {
            el.style.top = pos.bottom - pos.height - own.height - offset + 'px';
          } else {
            el.style.top = pos.bottom + offset + 'px';
          }
          el.style.left = pos.right - pos.width / 2 - own.width / 2 + 'px';
        }

        own = el.getBoundingClientRect();

        // This is the difference between the side and the hypothenuse of the arrow.
        var diff = (function (x) {
          return x / 2 * Math.sqrt(2) - x / 2;
        })(parseInt(window.getComputedStyle(arrow).width));

        // This is the limit for the arrow. If it's moved further than this it's outside the popover.
        var limit = margin + radius + diff + 2;

        // Keep popover inside window and arrow inside popover.
        if (['left', 'right'].indexOf(direction) > -1) {
          if (own.top < margin) {
            arrow.style.top = Math.max(own.height / 2 + own.top - margin, limit) + 'px';
            el.style.top = margin + 'px';
          } else if (own.bottom > window.innerHeight - margin) {
            arrow.style.top = Math.min(own.height / 2 - (window.innerHeight - own.bottom) + margin, own.height - limit) + 'px';
            el.style.top = window.innerHeight - own.height - margin + 'px';
          }
        } else {
          if (own.left < margin) {
            arrow.style.left = Math.max(own.width / 2 + own.left - margin, limit) + 'px';
            el.style.left = margin + 'px';
          } else if (own.right > window.innerWidth - margin) {
            arrow.style.left = Math.min(own.width / 2 - (window.innerWidth - own.right) + margin, own.width - limit) + 'px';
            el.style.left = window.innerWidth - own.width - margin + 'px';
          }
        }

        // Prevent animit from restoring the style.
        el.removeAttribute('data-animit-orig-style');
      }
    }, {
      key: '_positionPopover',
      value: function _positionPopover(target) {
        var _this = this;

        var directions = (function () {
          if (!_this.hasAttribute('direction')) {
            return ['up', 'down', 'left', 'right'];
          } else {
            return _this.getAttribute('direction').split(/\s+/);
          }
        })();

        var position = target.getBoundingClientRect();

        // The popover should be placed on the side with the most space.
        var scores = {
          left: position.left,
          right: window.innerWidth - position.right,
          up: position.top,
          down: window.innerHeight - position.bottom
        };

        var orderedDirections = Object.keys(scores).sort(function (a, b) {
          return -(scores[a] - scores[b]);
        });
        for (var i = 0, l = orderedDirections.length; i < l; i++) {
          var direction = orderedDirections[i];
          if (directions.indexOf(direction) > -1) {
            this._positionPopoverByDirection(target, direction);
            return;
          }
        }
      }
    }, {
      key: '_onChange',
      value: function _onChange() {
        var _this2 = this;

        setImmediate(function () {
          if (_this2._currentTarget) {
            _this2._positionPopover(_this2._currentTarget);
          }
        });
      }
    }, {
      key: '_compile',
      value: function _compile() {
        var templateElement = templateSource.cloneNode(true);
        var content = templateElement.querySelector('.popover__content');
        var style = this.getAttribute('style');

        if (style) {
          this.removeAttribute('style');
        }

        while (this.childNodes[0]) {
          content.appendChild(this.childNodes[0]);
        }

        while (templateElement.children[0]) {
          this.appendChild(templateElement.children[0]);
        }

        if (style) {
          this._popover.setAttribute('style', style);
        }
      }

      /**
       * Show popover.
       *
       * @param {HTMLElement} [target] target element
       * @param {String} [target] css selector
       * @param {Event} [target] event
       * @param {Object} [options] options
       * @param {String} [options.animation] animation type
       * @param {Object} [options.animationOptions] animation options
       */
    }, {
      key: 'show',
      value: function show(target, options) {
        var _this3 = this;

        if (typeof target === 'string') {
          target = document.querySelector(target);
        } else if (target instanceof Event) {
          target = target.target;
        }

        if (!target) {
          throw new Error('Target undefined');
        }

        options = options || {};

        if (options.animation && !(options.animation in window.OnsPopoverElement._animatorDict)) {
          throw new Error('Animator ' + options.animation + ' is not registered.');
        }

        options.animationOptions = util.extend(options.animationOptions || {}, AnimatorFactory.parseAnimationOptionsString(this.getAttribute('animation-options')));

        var canceled = false;
        util.triggerElementEvent(this, 'preshow', {
          popover: this,
          cancel: function cancel() {
            canceled = true;
          }
        });

        if (!canceled) {
          this._doorLock.waitUnlock(function () {
            var unlock = _this3._doorLock.lock();

            _this3.style.display = 'block';

            _this3._currentTarget = target;
            _this3._positionPopover(target);

            var animator = _this3._animatorFactory.newAnimator(options);
            animator.show(_this3, function () {
              _this3._visible = true;
              unlock();

              util.triggerElementEvent(_this3, 'postshow', { popover: _this3 });
            });
          });
        }
      }

      /**
       * Hide popover.
       *
       * @param {Object} [options] options
       * @param {String} [options.animation] animation type
       * @param {Object} [options.animationOptions] animation options
       */
    }, {
      key: 'hide',
      value: function hide(options) {
        var _this4 = this;

        options = options || {};

        var canceled = false;
        util.triggerElementEvent(this, 'prehide', {
          popover: this,
          cancel: function cancel() {
            canceled = true;
          }
        });

        if (!canceled) {
          this._doorLock.waitUnlock(function () {
            var unlock = _this4._doorLock.lock();

            var animator = _this4._animatorFactory.newAnimator(options);
            animator.hide(_this4, function () {
              _this4.style.display = 'none';
              _this4._visible = false;
              unlock();
              util.triggerElementEvent(_this4, 'posthide', { popover: _this4 });
            });
          });
        }
      }

      /**
       * Returns whether the popover is visible or not.
       *
       * @return {Boolean}
       */
    }, {
      key: 'isShown',
      value: function isShown() {
        return this._visible;
      }
    }, {
      key: 'attachedCallback',
      value: function attachedCallback() {
        this._mask.addEventListener('click', this._boundCancel, false);

        this._deviceBackButtonHandler = ons._deviceBackButtonDispatcher.createHandler(this, this._onDeviceBackButton.bind(this));

        this._popover.addEventListener('DOMNodeInserted', this._boundOnChange, false);
        this._popover.addEventListener('DOMNodeRemoved', this._boundOnChange, false);

        window.addEventListener('resize', this._boundOnChange, false);
      }
    }, {
      key: 'detachedCallback',
      value: function detachedCallback() {
        this._mask.removeEventListener('click', this._boundCancel, false);

        this._deviceBackButtonHandler.destroy();
        this._deviceBackButtonHandler = null;

        this._popover.removeEventListener('DOMNodeInserted', this._boundOnChange, false);
        this._popover.removeEventListener('DOMNodeRemoved', this._boundOnChange, false);

        window.removeEventListener('resize', this._boundOnChange, false);
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'modifier') {
          return ModifierUtil.onModifierChanged(last, current, this, scheme);
        } else if (name === 'direction') {
          this._boundOnChange();
        } else if (name === 'animation' || name === 'animation-options') {
          this._animatorFactory = this._createAnimatorFactory();
        }
      }

      /**
       * Set whether the popover should be cancelable or not.
       *
       * @param {Boolean}
       */
    }, {
      key: 'setCancelable',
      value: function setCancelable(cancelable) {
        if (typeof cancelable !== 'boolean') {
          throw new Error('Argument must be a boolean.');
        }

        if (cancelable) {
          this.setAttribute('cancelable', '');
        } else {
          this.removeAttribute('cancelable');
        }
      }

      /**
       * Return whether the popover is cancelable or not.
       *
       * @return {Boolean}
       */
    }, {
      key: 'isCancelable',
      value: function isCancelable() {
        return this.hasAttribute('cancelable');
      }

      /**
       * Destroy the popover and remove it from the DOM tree.
       */
    }, {
      key: 'destroy',
      value: function destroy() {
        if (this.parentElement) {
          this.parentElement.removeChild(this);
        }
      }
    }, {
      key: '_cancel',
      value: function _cancel() {
        if (this.isCancelable()) {
          this.hide();
        }
      }
    }, {
      key: '_mask',
      get: function get() {
        return this.children[0];
      }
    }, {
      key: '_popover',
      get: function get() {
        return this.children[1];
      }
    }, {
      key: '_content',
      get: function get() {
        return this._popover.children[0];
      }
    }, {
      key: '_arrow',
      get: function get() {
        return this._popover.children[1];
      }
    }]);

    return PopoverElement;
  })(ons._BaseElement);

  if (!window.OnsPopoverElement) {
    window.OnsPopoverElement = document.registerElement('ons-popover', {
      prototype: PopoverElement.prototype
    });

    window.OnsPopoverElement._animatorDict = {
      'fade': FadePopoverAnimator,
      'none': PopoverAnimator
    };

    /**
     * @param {String} name
     * @param {PopoverAnimator} Animator
     */
    window.OnsPopoverElement.registerAnimator = function (name, Animator) {
      if (!(Animator.prototype instanceof PopoverAnimator)) {
        throw new Error('"Animator" param must inherit PopoverAnimator');
      }
      this._animatorDict[name] = Animator;
    };
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var util = ons._util;
  var ModifierUtil = ons._internal.ModifierUtil;

  var scheme = {
    '.progress-bar': 'progress-bar--*',
    '.progress-circular': 'progress-circular--*',
    '.progress-circular__primary': 'progress-circular__primary--*',
    '.progress-circular__secondary': 'progress-circular__secondary--*',
    '.progress-bar__primary': 'progress-bar__primary--*',
    '.progress-bar__secondary': 'progress-bar__secondary--*'
  };

  var barTemplate = util.createElement('\n    <div class="progress-bar">\n      <div class="progress-bar__secondary"></div>\n      <div class="progress-bar__primary"></div>\n    </div>\n  ');

  var circularTemplate = util.createElement('\n    <svg class="progress-circular">\n      <circle class="progress-circular__secondary" cx="50%" cy="50%" r="40%" fill="none" stroke-width="10%" stroke-miterlimit="10"/>\n      <circle class="progress-circular__primary" cx="50%" cy="50%" r="40%" fill="none" stroke-width="10%" stroke-miterlimit="10"/>\n    </svg>\n  ');

  var ProgressElement = (function (_ons$_BaseElement) {
    _inherits(ProgressElement, _ons$_BaseElement);

    function ProgressElement() {
      _classCallCheck(this, ProgressElement);

      _get(Object.getPrototypeOf(ProgressElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ProgressElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this._compile();

        ModifierUtil.initModifier(this, scheme);
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'modifier') {
          return ModifierUtil.onModifierChanged(last, current, this, scheme);
        } else if (name === 'value' || name === 'secondary-value') {
          this._updateValue();
        } else if (name === 'type') {
          throw new Error('Can not change type attribute.');
        } else if (name === 'indeterminate') {
          this._updateDeterminate();
        }
      }
    }, {
      key: '_updateDeterminate',
      value: function _updateDeterminate() {
        if (this.hasAttribute('indeterminate')) {
          this._template.classList.add('progress-' + this._type + '--indeterminate');
          this._template.classList.remove('progress-' + this._type + '--determinate');
        } else {
          this._template.classList.add('progress-' + this._type + '--determinate');
          this._template.classList.remove('progress-' + this._type + '--indeterminate');
        }
      }
    }, {
      key: '_updateValue',
      value: function _updateValue() {
        if (this._type === 'bar') {
          this._primary.style.width = this.hasAttribute('value') ? this.getAttribute('value') + '%' : '0%';
          this._secondary.style.width = this.hasAttribute('secondary-value') ? this.getAttribute('secondary-value') + '%' : '0%';
        } else {
          if (this.hasAttribute('value')) {
            var per = Math.ceil(this.getAttribute('value') * 251.32 * 0.01);
            this._primary.style['stroke-dasharray'] = per + '%, 251.32%';
          }
          if (this.hasAttribute('secondary-value')) {
            var per = Math.ceil(this.getAttribute('secondary-value') * 251.32 * 0.01);
            this._secondary.style['stroke-dasharray'] = per + '%, 251.32%';
          }
        }
      }
    }, {
      key: '_compile',
      value: function _compile() {
        if (this._type === 'bar') {
          this._template = barTemplate.cloneNode(true);
        } else {
          this._template = circularTemplate.cloneNode(true);
        }

        this._primary = this._template.children[1];
        this._secondary = this._template.children[0];

        this._updateDeterminate();
        this._updateValue();

        this.appendChild(this._template);
      }
    }, {
      key: '_type',
      get: function get() {
        if (this.hasAttribute('type') && this.getAttribute('type') === 'circular') {
          return 'circular';
        } else {
          return 'bar';
        }
      }
    }]);

    return ProgressElement;
  })(ons._BaseElement);

  if (!window.OnsProgressElement) {
    window.OnsProgressElement = document.registerElement('ons-progress', {
      prototype: ProgressElement.prototype
    });
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var STATE_INITIAL = 'initial';
  var STATE_PREACTION = 'preaction';
  var STATE_ACTION = 'action';
  var util = ons._util;

  var PullHookElement = (function (_ons$_BaseElement) {
    _inherits(PullHookElement, _ons$_BaseElement);

    function PullHookElement() {
      _classCallCheck(this, PullHookElement);

      _get(Object.getPrototypeOf(PullHookElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(PullHookElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this._scrollElement = this._createScrollElement();
        this._pageElement = this._scrollElement.parentElement;

        if (!this._pageElement.classList.contains('page__content') && !this._pageElement.classList.contains('ons-scroller__content')) {
          throw new Error('<ons-pull-hook> must be a direct descendant of an <ons-page> or an <ons-scroller> element.');
        }

        this._boundOnDrag = this._onDrag.bind(this);
        this._boundOnDragStart = this._onDragStart.bind(this);
        this._boundOnDragEnd = this._onDragEnd.bind(this);
        this._boundOnScroll = this._onScroll.bind(this);

        this._currentTranslation = 0;

        this._setState(STATE_INITIAL, true);
        this._setStyle();
      }
    }, {
      key: '_createScrollElement',
      value: function _createScrollElement() {
        var scrollElement = util.createElement('<div class="scroll"><div>');

        var pageElement = this.parentElement;

        scrollElement.appendChild(this);
        while (pageElement.firstChild) {
          scrollElement.appendChild(pageElement.firstChild);
        }
        pageElement.appendChild(scrollElement);

        return scrollElement;
      }
    }, {
      key: '_setStyle',
      value: function _setStyle() {
        var height = this.getHeight();

        this.style.top = '-' + height + 'px';
        this.style.height = height + 'px';
        this.style.lineHeight = height + 'px';
      }
    }, {
      key: '_onScroll',
      value: function _onScroll(event) {
        var element = this._pageElement;

        if (element.scrollTop < 0) {
          element.scrollTop = 0;
        }
      }
    }, {
      key: '_generateTranslationTransform',
      value: function _generateTranslationTransform(scroll) {
        return 'translate3d(0px, ' + scroll + 'px, 0px)';
      }
    }, {
      key: '_onDrag',
      value: function _onDrag(event) {
        var _this = this;

        if (this.isDisabled()) {
          return;
        }

        // Ignore when dragging left and right.
        if (event.gesture.direction === 'left' || event.gesture.direction === 'right') {
          return;
        }

        // Hack to make it work on Android 4.4 WebView. Scrolls manually near the top of the page so
        // there will be no inertial scroll when scrolling down. Allowing default scrolling will
        // kill all 'touchmove' events.
        var element = this._pageElement;
        element.scrollTop = this._startScroll - event.gesture.deltaY;
        if (element.scrollTop < window.innerHeight && event.gesture.direction !== 'up') {
          event.gesture.preventDefault();
        }

        if (this._currentTranslation === 0 && this._getCurrentScroll() === 0) {
          this._transitionDragLength = event.gesture.deltaY;

          var direction = event.gesture.interimDirection;
          if (direction === 'down') {
            this._transitionDragLength -= 1;
          } else {
            this._transitionDragLength += 1;
          }
        }

        var scroll = Math.max(event.gesture.deltaY - this._startScroll, 0);

        if (this._thresholdHeightEnabled() && scroll >= this.getThresholdHeight()) {
          event.gesture.stopDetect();

          setImmediate(function () {
            _this._setState(STATE_ACTION);
            _this._translateTo(_this.getHeight(), { animate: true });

            _this._waitForAction(_this._onDone.bind(_this));
          });
        } else if (scroll >= this.getHeight()) {
          this._setState(STATE_PREACTION);
        } else {
          this._setState(STATE_INITIAL);
        }

        event.stopPropagation();
        this._translateTo(scroll);
      }
    }, {
      key: '_onDragStart',
      value: function _onDragStart(event) {
        if (this.isDisabled()) {
          return;
        }

        this._startScroll = this._getCurrentScroll();
      }
    }, {
      key: '_onDragEnd',
      value: function _onDragEnd(event) {
        if (this.isDisabled()) {
          return;
        }

        if (this._currentTranslation > 0) {
          var _scroll = this._currentTranslation;

          if (_scroll > this.getHeight()) {
            this._setState(STATE_ACTION);

            this._translateTo(this.getHeight(), { animate: true });

            this._waitForAction(this._onDone.bind(this));
          } else {
            this._translateTo(0, { animate: true });
          }
        }
      }

      /**
       * @param {Function} callback
       */
    }, {
      key: 'setActionCallback',
      value: function setActionCallback(callback) {
        this._callback = callback;
      }
    }, {
      key: '_waitForAction',
      value: function _waitForAction(done) {
        if (this._callback instanceof Function) {
          this._callback.call(null, done);
        } else {
          done();
        }
      }
    }, {
      key: '_onDone',
      value: function _onDone(done) {
        // Check if the pull hook still exists.
        this._translateTo(0, { animate: true });
        this._setState(STATE_INITIAL);
      }

      /**
       * @return {Number}
       */
    }, {
      key: 'getHeight',
      value: function getHeight() {
        return parseInt(this.getAttribute('height') || '64', 10);
      }

      /**
       * @param {Number} height
       */
    }, {
      key: 'setHeight',
      value: function setHeight(height) {
        this.setAttribute('height', height + 'px');

        this._setStyle();
      }

      /**
       * @param {Number} thresholdHeight
       */
    }, {
      key: 'setThresholdHeight',
      value: function setThresholdHeight(thresholdHeight) {
        this.setAttribute('threshold-height', thresholdHeight + 'px');
      }

      /**
       * @return {Number}
       */
    }, {
      key: 'getThresholdHeight',
      value: function getThresholdHeight() {
        return parseInt(this.getAttribute('threshold-height') || '96', 10);
      }
    }, {
      key: '_thresholdHeightEnabled',
      value: function _thresholdHeightEnabled() {
        var th = this.getThresholdHeight();
        return th > 0 && th >= this.getHeight();
      }
    }, {
      key: '_setState',
      value: function _setState(state, noEvent) {
        var lastState = this._getState();

        this.setAttribute('state', state);

        if (!noEvent && lastState !== this._getState()) {
          util.triggerElementEvent(this, 'changestate', {
            pullHook: this,
            state: state,
            lastState: lastState
          });
        }
      }
    }, {
      key: '_getState',
      value: function _getState() {
        return this.getAttribute('state');
      }
    }, {
      key: 'getCurrentState',
      value: function getCurrentState() {
        return this._getState();
      }
    }, {
      key: '_getCurrentScroll',
      value: function _getCurrentScroll() {
        return this._pageElement.scrollTop;
      }
    }, {
      key: 'getPullDistance',
      value: function getPullDistance() {
        return this._currentTranslation;
      }
    }, {
      key: 'isDisabled',
      value: function isDisabled() {
        return this.hasAttribute('disabled');
      }
    }, {
      key: '_isContentFixed',
      value: function _isContentFixed() {
        return this.hasAttribute('fixed-content');
      }
    }, {
      key: 'setDisabled',
      value: function setDisabled(disabled) {
        if (disabled) {
          this.setAttribute('disabled', '');
        } else {
          this.removeAttribute('disabled');
        }
      }
    }, {
      key: '_getScrollableElement',
      value: function _getScrollableElement() {
        if (this._isContentFixed()) {
          return this;
        } else {
          return this._scrollElement;
        }
      }

      /**
       * @param {Number} scroll
       * @param {Object} options
       * @param {Function} [options.callback]
       */
    }, {
      key: '_translateTo',
      value: function _translateTo(scroll) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        //this._scope.$evalAsync(function() {
        this._currentTranslation = scroll;
        //}.bind(this));

        if (options.animate) {
          animit(this._getScrollableElement()).queue({
            transform: this._generateTranslationTransform(scroll)
          }, {
            duration: 0.3,
            timing: 'cubic-bezier(.1, .7, .1, 1)'
          }).play(options.callback);
        } else {
          animit(this._getScrollableElement()).queue({
            transform: this._generateTranslationTransform(scroll)
          }).play(options.callback);
        }
      }
    }, {
      key: '_getMinimumScroll',
      value: function _getMinimumScroll() {
        var scrollHeight = this._scrollElement.getBoundingClientRect().height;
        var pageHeight = this._pageElement.getBoundingClientRect().height;

        return scrollHeight > pageHeight ? -(scrollHeight - pageHeight) : 0;
      }
    }, {
      key: '_createEventListeners',
      value: function _createEventListeners() {
        this._gestureDetector = new ons.GestureDetector(this._pageElement, {
          dragMinDistance: 1,
          dragDistanceCorrection: false
        });

        // Bind listeners
        this._gestureDetector.on('drag', this._boundOnDrag);
        this._gestureDetector.on('dragstart', this._boundOnDragStart);
        this._gestureDetector.on('dragend', this._boundOnDragEnd);

        this._scrollElement.parentElement.addEventListener('scroll', this._boundOnScroll, false);
      }
    }, {
      key: '_destroyEventListeners',
      value: function _destroyEventListeners() {
        this._gestureDetector.off('drag', this._boundOnDrag);
        this._gestureDetector.off('dragstart', this._boundOnDragStart);
        this._gestureDetector.off('dragend', this._boundOnDragEnd);

        this._gestureDetector.dispose();
        this._gestureDetector = null;

        this._scrollElement.parentElement.removeEventListener('scroll', this._boundOnScroll, false);
      }
    }, {
      key: 'attachedCallback',
      value: function attachedCallback() {
        this._createEventListeners();
      }
    }, {
      key: 'detachedCallback',
      value: function detachedCallback() {
        this._destroyEventListeners();
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {}
    }]);

    return PullHookElement;
  })(ons._BaseElement);

  if (!window.OnsPullHookElement) {
    window.OnsPullHookElement = document.registerElement('ons-pull-hook', {
      prototype: PullHookElement.prototype
    });

    window.OnsPullHookElement.STATE_ACTION = STATE_ACTION;
    window.OnsPullHookElement.STATE_INITIAL = STATE_INITIAL;
    window.OnsPullHookElement.STATE_PREACTION = STATE_PREACTION;
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var scheme = { '': 'ripple--*' };

  var RippleElement = (function (_ons$_BaseElement) {
    _inherits(RippleElement, _ons$_BaseElement);

    function RippleElement() {
      _classCallCheck(this, RippleElement);

      _get(Object.getPrototypeOf(RippleElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(RippleElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this.classList.add('ripple');
        this._compile();

        this._boundOnClick = this._onMouseDown.bind(this);
      }
    }, {
      key: '_compile',
      value: function _compile() {
        this._wave = document.createElement('span');
        this._wave.classList.add('ripple__wave');
        this.insertBefore(this._wave, this.children[0]);

        if (this.hasAttribute('color')) {
          this._wave.style.background = this.getAttribute('color');
        }
      }
    }, {
      key: '_updateTarget',
      value: function _updateTarget() {
        if (this.hasAttribute('target') && this.getAttribute('target') === 'children') {
          this._target = this;
          this.style.display = 'inline-block';
          this.style.position = 'relative';
        } else {
          this._target = this.parentNode;
          if (window.getComputedStyle(this._target).getPropertyValue('position') === 'static') {
            this._target.style.position = 'relative';
          }
          this.style.display = 'block';
          this.style.position = 'absolute';
        }
      }
    }, {
      key: '_updateCenter',
      value: function _updateCenter() {
        if (this.hasAttribute('center')) {
          this._center = true;
        } else {
          this._center = false;
        }
        this._wave.classList.remove('ripple__wave--done-center');
        this._wave.classList.remove('ripple__wave--animate-center');
        this._wave.classList.remove('ripple__wave--done');
        this._wave.classList.remove('ripple__wave--animate');
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'target') {
          this._updateTarget();
        }
        if (name === 'color') {
          this._wave.style.background = current;
        }
        if (name === 'center') {
          this._updateCenter();
        }
      }
    }, {
      key: '_isTouchDevice',
      value: function _isTouchDevice() {
        return 'ontouchstart' in window || 'onmsgesturechange' in window;
      }
    }, {
      key: '_addListener',
      value: function _addListener() {
        if (this._isTouchDevice()) {
          this.addEventListener('touchstart', this._boundOnClick);
        } else {
          this.addEventListener('mousedown', this._boundOnClick);
        }
      }
    }, {
      key: '_removeListener',
      value: function _removeListener() {
        if (this._isTouchDevice()) {
          this.removeEventListener('touchstart', this._boundOnClick);
        } else {
          this.removeEventListener('mousedown', this._boundOnClick);
        }
      }
    }, {
      key: 'attachedCallback',
      value: function attachedCallback() {
        this._updateCenter();
        this._updateTarget();
        this._addListener();
      }
    }, {
      key: 'detachedCallback',
      value: function detachedCallback() {
        this._removeListener();
      }
    }, {
      key: '_onMouseDown',
      value: function _onMouseDown(e) {
        var _this = this;

        var eventType = e.type;
        var wave = this._wave;
        var el = this._target;
        var pos = el.getBoundingClientRect();

        if (this.isDisabled()) {
          return;
        }

        if (this._center) {
          wave.classList.remove('ripple__wave--done-center');
          wave.classList.remove('ripple__wave--animate-center');
        } else {
          wave.classList.remove('ripple__wave--done');
          wave.classList.remove('ripple__wave--animate');
        }

        var animationEnded = new Promise(function (resolve) {
          var onAnimationEnd = function onAnimationEnd() {
            _this.removeEventListener('webkitAnimationEnd', onAnimationEnd);
            _this.removeEventListener('animationend', onAnimationEnd);
            resolve();
          };

          _this.addEventListener('webkitAnimationEnd', onAnimationEnd);
          _this.addEventListener('animationend', onAnimationEnd);
        });

        var mouseReleased = new Promise(function (resolve) {
          var onMouseUp = function onMouseUp() {
            document.removeEventListener('webkitAnimationEnd', onMouseUp);
            document.removeEventListener('animationend', onMouseUp);
            resolve();
          };

          document.addEventListener('mouseup', onMouseUp);
          document.addEventListener('touchend', onMouseUp);
        });

        Promise.all([animationEnded, mouseReleased]).then(function () {
          if (_this._center) {
            wave.classList.remove('ripple__wave--animate-center');
            wave.classList.add('ripple__wave--done-center');
          } else {
            wave.classList.remove('ripple__wave--animate');
            wave.classList.add('ripple__wave--done');
          }
        });

        var x = e.clientX;
        var y = e.clientY;
        if (eventType === 'touchstart') {
          x = e.changedTouches[0].clientX;
          y = e.changedTouches[0].clientY;
        }

        var sizeX = undefined,
            sizeY = 0;

        if (!this._center) {
          sizeX = sizeY = Math.max(el.offsetWidth, el.offsetHeight);
        } else {
          sizeX = el.offsetWidth;
          sizeY = el.offsetHeight;
          sizeX = sizeX - parseFloat(window.getComputedStyle(el, null).getPropertyValue('border-left-width')) - parseFloat(window.getComputedStyle(el, null).getPropertyValue('border-right-width'));
          sizeY = sizeY - parseFloat(window.getComputedStyle(el, null).getPropertyValue('border-top-width')) - parseFloat(window.getComputedStyle(el, null).getPropertyValue('border-bottom-width'));
        }

        wave.style.width = sizeX + 'px';
        wave.style.height = sizeY + 'px';

        x = x - pos.left - sizeX / 2;
        y = y - pos.top - sizeY / 2;

        wave.style.left = x + 'px';
        wave.style.top = y + 'px';

        if (this._center) {
          wave.classList.add('ripple__wave--animate-center');
        } else {
          wave.classList.add('ripple__wave--animate');
        }
      }

      /**
      * Disable of enable ripple-effect.
      *
      * @param {Boolean}
      */
    }, {
      key: 'setDisabled',
      value: function setDisabled(disabled) {
        if (typeof disabled !== 'boolean') {
          throw new Error('Argument must be a boolean.');
        }
        if (disabled) {
          this.setAttribute('disabled', '');
        } else {
          this.removeAttribute('disabled');
        }
      }

      /**
       * True if ripple-effect is disabled.
       *
       * @return {Boolean}
       */
    }, {
      key: 'isDisabled',
      value: function isDisabled() {
        return this.hasAttribute('disabled');
      }
    }]);

    return RippleElement;
  })(ons._BaseElement);

  if (!window.OnsRippleElement) {
    window.OnsRippleElement = document.registerElement('ons-ripple', {
      prototype: RippleElement.prototype
    });
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

window.OnsRowElement = window.OnsRowElement ? window.OnsRowElement : document.registerElement('ons-row');
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

window.OnsScrollerElement = window.OnsScrollerElement ? window.OnsScrollerElement : document.registerElement('ons-scroller');
/*
Copyright 2013-2015 ASIAL CORPORATION
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
   http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var scheme = {
    '': 'speed-dial__item--*'
  };
  var ModifierUtil = ons._internal.ModifierUtil;

  var SpeedDialItemElement = (function (_ons$_BaseElement) {
    _inherits(SpeedDialItemElement, _ons$_BaseElement);

    function SpeedDialItemElement() {
      _classCallCheck(this, SpeedDialItemElement);

      _get(Object.getPrototypeOf(SpeedDialItemElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(SpeedDialItemElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        ModifierUtil.initModifier(this, scheme);
        this.classList.add('fab');
        this.classList.add('fab--mini');
        this.classList.add('speed-dial__item');
        this._boundOnClick = this._onClick.bind(this);
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'modifier') {
          return ModifierUtil.onModifierChanged(last, current, this, scheme);
        }
      }
    }, {
      key: 'attachedCallback',
      value: function attachedCallback() {
        this.addEventListener('click', this._boundOnClick, false);
      }
    }, {
      key: 'detachedCallback',
      value: function detachedCallback() {
        this.removeEventListener('click', this._boundOnClick, false);
      }
    }, {
      key: '_onClick',
      value: function _onClick(e) {
        e.stopPropagation();
      }
    }]);

    return SpeedDialItemElement;
  })(ons._BaseElement);

  if (!window.OnsSpeedDialItemElement) {
    window.OnsSpeedDialItemElement = document.registerElement('ons-speed-dial-item', {
      prototype: SpeedDialItemElement.prototype
    });
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
   http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var scheme = {
    '': 'speed-dial--*'
  };
  var ModifierUtil = ons._internal.ModifierUtil;

  var SpeedDialElement = (function (_ons$_BaseElement) {
    _inherits(SpeedDialElement, _ons$_BaseElement);

    function SpeedDialElement() {
      _classCallCheck(this, SpeedDialElement);

      _get(Object.getPrototypeOf(SpeedDialElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(SpeedDialElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this._compile();
        this._shown = true;
        this._itemShown = false;
        ModifierUtil.initModifier(this, scheme);
        this._boundOnClick = this._onClick.bind(this);
        this.classList.add('speed__dial');

        if (this.hasAttribute('direction')) {
          this._updateDirection(this.getAttribute('direction'));
        } else {
          this._updateDirection('up');
        }
        this._updatePosition();

        if (this.hasAttribute('disabled')) {
          this.setDisabled(true);
        }
      }
    }, {
      key: '_compile',
      value: function _compile() {
        var content = document.createElement('ons-fab');

        var children = ons._util.arrayFrom(this.childNodes).forEach(function (element) {
          return element.nodeName.toLowerCase() !== 'ons-speed-dial-item' ? content.firstChild.appendChild(element) : true;
        });

        this.insertBefore(content, this.firstChild);
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'modifier') {
          return ModifierUtil.onModifierChanged(last, current, this, scheme);
        } else if (name === 'direction') {
          this._updateDirection(current);
        } else if (name === 'position') {
          this._updatePosition();
        } else if (name === 'disabled') {
          if (current !== null) {
            this.setDisabled(true);
          } else {
            this.setDisabled(false);
          }
        }
      }
    }, {
      key: 'attachedCallback',
      value: function attachedCallback() {
        this.addEventListener('click', this._boundOnClick, false);
      }
    }, {
      key: 'detachedCallback',
      value: function detachedCallback() {
        this.removeEventListener('click', this._boundOnClick, false);
      }
    }, {
      key: '_onClick',
      value: function _onClick(e) {
        if (!this.isDisabled()) {
          this.toggleItems();
        }
      }
    }, {
      key: '_show',
      value: function _show() {
        if (!this.isInline()) {
          this.show();
        }
      }
    }, {
      key: '_hide',
      value: function _hide() {
        if (!this.isInline()) {
          this.hide();
        }
      }
    }, {
      key: '_updateDirection',
      value: function _updateDirection(direction) {
        var children = this.items;
        for (var i = 0; i < children.length; i++) {
          children[i].style.transitionDelay = 25 * i + 'ms';
          children[i].style.webkitTransitionDelay = 25 * i + 'ms';
          children[i].style.bottom = 'auto';
          children[i].style.right = 'auto';
          children[i].style.top = 'auto';
          children[i].style.left = 'auto';
        }
        switch (direction) {
          case 'up':
            for (var i = 0; i < children.length; i++) {
              children[i].style.bottom = 72 + 56 * i + 'px';
              children[i].style.right = '8px';
            }
            break;
          case 'down':
            for (var i = 0; i < children.length; i++) {
              children[i].style.top = 72 + 56 * i + 'px';
              children[i].style.left = '8px';
            }
            break;
          case 'left':
            for (var i = 0; i < children.length; i++) {
              children[i].style.top = '8px';
              children[i].style.right = 72 + 56 * i + 'px';
            }
            break;
          case 'right':
            for (var i = 0; i < children.length; i++) {
              children[i].style.top = '8px';
              children[i].style.left = 72 + 56 * i + 'px';
            }
            break;
          default:
            throw new Error('Argument must be one of up, down, left or right.');
        }
      }
    }, {
      key: '_updatePosition',
      value: function _updatePosition() {
        var position = this.getAttribute('position');
        this.classList.remove('fab--top__left', 'fab--bottom__right', 'fab--bottom__left', 'fab--top__right', 'fab--top__center', 'fab--bottom__center');
        switch (position) {
          case 'top right':
          case 'right top':
            this.classList.add('fab--top__right');
            break;
          case 'top left':
          case 'left top':
            this.classList.add('fab--top__left');
            break;
          case 'bottom right':
          case 'right bottom':
            this.classList.add('fab--bottom__right');
            break;
          case 'bottom left':
          case 'left bottom':
            this.classList.add('fab--bottom__left');
            break;
          case 'center top':
          case 'top center':
            this.classList.add('fab--top__center');
            break;
          case 'center bottom':
          case 'bottom center':
            this.classList.add('fab--bottom__center');
            break;
          default:
            break;
        }
      }
    }, {
      key: 'show',
      value: function show() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.querySelector('ons-fab').show();
        this._shown = true;
      }
    }, {
      key: 'hide',
      value: function hide() {
        var _this = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.hideItems();
        setTimeout(function () {
          _this.querySelector('ons-fab').hide();
        }, 200);
        this._shown = false;
      }
    }, {
      key: 'showItems',
      value: function showItems() {
        if (!this._itemShown) {
          var children = this.items;
          for (var i = 0; i < children.length; i++) {
            children[i].style.transform = 'scale(1)';
            children[i].style.webkitTransform = 'scale(1)';
            children[i].style.transitionDelay = 25 * i + 'ms';
            children[i].style.webkitTransitionDelay = 25 * i + 'ms';
          }
        }
        this._itemShown = true;
      }
    }, {
      key: 'hideItems',
      value: function hideItems() {
        if (this._itemShown) {
          var children = this.items;
          for (var i = 0; i < children.length; i++) {
            children[i].style.transform = 'scale(0)';
            children[i].style.webkitTransform = 'scale(0)';
            children[i].style.transitionDelay = 25 * (children.length - i) + 'ms';
            children[i].style.webkitTransitionDelay = 25 * (children.length - i) + 'ms';
          }
        }
        this._itemShown = false;
      }

      /**
       * Disable of enable speed dial.
       *
       * @param {Boolean}
       */
    }, {
      key: 'setDisabled',
      value: function setDisabled(disabled) {
        if (typeof disabled !== 'boolean') {
          throw new Error('Argument must be a boolean.');
        }

        if (disabled) {
          this.hideItems();
          this.setAttribute('disabled', '');
          ons._util.arrayFrom(this.childNodes).forEach(function (element) {
            return element.classList.contains('fab') ? element.setAttribute('disabled', '') : true;
          });
        } else {
          this.removeAttribute('disabled');
          ons._util.arrayFrom(this.childNodes).forEach(function (element) {
            return element.classList.contains('fab') ? element.removeAttribute('disabled') : true;
          });
        }
      }

      /**
       * True if speed dial is disabled.
       *
       * @return {Boolean}
       */
    }, {
      key: 'isDisabled',
      value: function isDisabled() {
        return this.hasAttribute('disabled');
      }

      /**
       * True if speed dial is an inline element.
       *
       * @return {Boolean}
       */
    }, {
      key: 'isInline',
      value: function isInline() {
        return this.hasAttribute('inline');
      }

      /**
       * True if speed dial is shown
       *
       * @return {Boolean}
       */
    }, {
      key: 'isShown',
      value: function isShown() {
        return this._shown && this.style.display !== 'none';
      }
    }, {
      key: 'isItemShown',
      value: function isItemShown() {
        return this._itemShown;
      }
    }, {
      key: 'toggle',
      value: function toggle() {
        if (this.isShown()) {
          this.hide();
        } else {
          this.show();
        }
      }
    }, {
      key: 'toggleItems',
      value: function toggleItems() {
        if (this.isItemShown()) {
          this.hideItems();
        } else {
          this.showItems();
        }
      }
    }, {
      key: 'items',
      get: function get() {
        return ons._util.arrayFrom(this.querySelectorAll('ons-speed-dial-item'));
      }
    }]);

    return SpeedDialElement;
  })(ons._BaseElement);

  if (!window.OnsSpeedDialElement) {
    window.OnsSpeedDialElement = document.registerElement('ons-speed-dial', {
      prototype: SpeedDialElement.prototype
    });
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var util = ons._util;

  var SplitterContentElement = (function (_ons$_BaseElement) {
    _inherits(SplitterContentElement, _ons$_BaseElement);

    function SplitterContentElement() {
      _classCallCheck(this, SplitterContentElement);

      _get(Object.getPrototypeOf(SplitterContentElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(SplitterContentElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this._page = null;
      }

      /**
       * @param {String} page
       * @param {Object} [options]
       * @param {Function} [options.callback]
       */
    }, {
      key: 'load',
      value: function load(page) {
        var _this = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        this._page = page;

        options.callback = options.callback instanceof Function ? options.callback : function () {};
        ons._internal.getPageHTMLAsync(page).then(function (html) {
          window.OnsSplitterContentElement.rewritables.link(_this, util.createFragment(html), function (fragment) {
            while (_this.childNodes[0]) {
              if (_this.childNodes[0]._hide instanceof Function) {
                _this.childNodes[0]._hide();
              }
              _this.removeChild(_this.childNodes[0]);
            }

            _this.appendChild(fragment);
            util.arrayOf(fragment.children).forEach(function (child) {
              if (child._show instanceof Function) {
                child._show();
              }
            });

            options.callback();
          });
        });
      }
    }, {
      key: 'attachedCallback',
      value: function attachedCallback() {
        var _this2 = this;

        this._assertParent();

        if (this.hasAttribute('page')) {
          window.OnsSplitterContentElement.rewritables.ready(this, function () {
            return _this2.load(_this2.getAttribute('page'));
          });
        }
      }
    }, {
      key: 'detachedCallback',
      value: function detachedCallback() {}
    }, {
      key: '_show',
      value: function _show() {
        util.arrayOf(this.children).forEach(function (child) {
          if (child._show instanceof Function) {
            child._show();
          }
        });
      }
    }, {
      key: '_hide',
      value: function _hide() {
        util.arrayOf(this.children).forEach(function (child) {
          if (child._hide instanceof Function) {
            child._hide();
          }
        });
      }
    }, {
      key: '_destroy',
      value: function _destroy() {
        util.arrayOf(this.children).forEach(function (child) {
          if (child._destroy instanceof Function) {
            child._destroy();
          }
        });
        this.remove();
      }
    }, {
      key: '_assertParent',
      value: function _assertParent() {
        var parentElementName = this.parentElement.nodeName.toLowerCase();
        if (parentElementName !== 'ons-splitter') {
          throw new Error('"' + parentElementName + '" element is not allowed as parent element.');
        }
      }
    }, {
      key: 'page',
      get: function get() {
        return this._page;
      }
    }]);

    return SplitterContentElement;
  })(ons._BaseElement);

  if (!window.OnsSplitterContentElement) {
    window.OnsSplitterContentElement = document.registerElement('ons-splitter-content', {
      prototype: SplitterContentElement.prototype
    });

    window.OnsSplitterContentElement.rewritables = {
      /**
       * @param {Element} splitterSideElement
       * @param {Function} callback
       */
      ready: function ready(splitterSideElement, callback) {
        setImmediate(callback);
      },

      /**
       * @param {Element} splitterSideElement
       * @param {HTMLFragment} target
       * @param {Function} callback
       */
      link: function link(splitterSideElement, target, callback) {
        callback(target);
      }
    };
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var SplitterMaskElement = (function (_ons$_BaseElement) {
    _inherits(SplitterMaskElement, _ons$_BaseElement);

    function SplitterMaskElement() {
      _classCallCheck(this, SplitterMaskElement);

      _get(Object.getPrototypeOf(SplitterMaskElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(SplitterMaskElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this._boundOnClick = this._onClick.bind(this);
      }
    }, {
      key: '_onClick',
      value: function _onClick(event) {
        if (this.parentElement && this.parentElement.nodeName.toLowerCase() === 'ons-splitter') {
          // close side menus
          this.parentElement.closeRight();
          this.parentElement.closeLeft();
        }
        event.stopPropagation();
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {}
    }, {
      key: 'attachedCallback',
      value: function attachedCallback() {
        this.addEventListener('click', this._boundOnClick);
      }
    }, {
      key: 'detachedCallback',
      value: function detachedCallback() {
        this.removeEventListener('click', this._boundOnClick);
      }
    }]);

    return SplitterMaskElement;
  })(ons._BaseElement);

  if (!window.OnsSplitterMaskElement) {
    window.OnsSplitterMaskElement = document.registerElement('ons-splitter-mask', {
      prototype: SplitterMaskElement.prototype
    });
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _get = function get(_x7, _x8, _x9) { var _again = true; _function: while (_again) { var object = _x7, property = _x8, receiver = _x9; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x7 = parent; _x8 = property; _x9 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function () {
  'use strict';

  var util = ons._util;
  var AnimatorFactory = ons._internal.AnimatorFactory;

  var SPLIT_MODE = 'split';
  var COLLAPSE_MODE = 'collapse';

  var CollapseDetection = (function () {
    function CollapseDetection() {
      _classCallCheck(this, CollapseDetection);
    }

    _createClass(CollapseDetection, [{
      key: 'activate',
      value: function activate(element) {}
    }, {
      key: 'inactivate',
      value: function inactivate() {}
    }]);

    return CollapseDetection;
  })();

  var OrientationCollapseDetection = (function (_CollapseDetection) {
    _inherits(OrientationCollapseDetection, _CollapseDetection);

    /**
     * @param {String} orientation
     */

    function OrientationCollapseDetection(orientation) {
      _classCallCheck(this, OrientationCollapseDetection);

      _get(Object.getPrototypeOf(OrientationCollapseDetection.prototype), 'constructor', this).call(this);

      if (orientation !== 'portrait' && orientation !== 'landscape') {
        throw new Error('Invalid orientation: ' + orientation);
      }

      this._boundOnOrientationChange = this._onOrientationChange.bind(this);
      this._targetOrientation = orientation;
    }

    _createClass(OrientationCollapseDetection, [{
      key: 'activate',
      value: function activate(element) {
        this._element = element;
        ons.orientation.on('change', this._boundOnOrientationChange);
        this._update(ons.orientation.isPortrait());
      }
    }, {
      key: '_onOrientationChange',
      value: function _onOrientationChange(info) {
        this._update(info.isPortrait);
      }
    }, {
      key: '_update',
      value: function _update(isPortrait) {
        if (isPortrait && this._targetOrientation === 'portrait') {
          this._element._updateMode(COLLAPSE_MODE);
        } else if (!isPortrait && this._targetOrientation === 'landscape') {
          this._element._updateMode(COLLAPSE_MODE);
        } else {
          this._element._updateMode(SPLIT_MODE);
        }
      }
    }, {
      key: 'inactivate',
      value: function inactivate() {
        this._element = null;
        ons.orientation.off('change', this._boundOnOrientationChange);
      }
    }]);

    return OrientationCollapseDetection;
  })(CollapseDetection);

  var StaticCollapseDetection = (function (_CollapseDetection2) {
    _inherits(StaticCollapseDetection, _CollapseDetection2);

    function StaticCollapseDetection() {
      _classCallCheck(this, StaticCollapseDetection);

      _get(Object.getPrototypeOf(StaticCollapseDetection.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(StaticCollapseDetection, [{
      key: 'activate',
      value: function activate(element) {
        element._updateMode(COLLAPSE_MODE);
      }
    }]);

    return StaticCollapseDetection;
  })(CollapseDetection);

  var MediaQueryCollapseDetection = (function (_CollapseDetection3) {
    _inherits(MediaQueryCollapseDetection, _CollapseDetection3);

    /**
     * @param {String} query
     */

    function MediaQueryCollapseDetection(query) {
      _classCallCheck(this, MediaQueryCollapseDetection);

      _get(Object.getPrototypeOf(MediaQueryCollapseDetection.prototype), 'constructor', this).call(this);

      this._mediaQueryString = query;
      this._boundOnChange = this._onChange.bind(this);
    }

    _createClass(MediaQueryCollapseDetection, [{
      key: '_onChange',
      value: function _onChange(queryList) {
        this._element._updateMode(queryList.matches ? COLLAPSE_MODE : SPLIT_MODE);
      }
    }, {
      key: 'activate',
      value: function activate(element) {
        this._element = element;
        this._queryResult = window.matchMedia(this._mediaQueryString);
        this._queryResult.addListener(this._boundOnChange);
        this._onChange(this._queryResult);
      }
    }, {
      key: 'inactivate',
      value: function inactivate() {
        this._element = null;
        this._queryResult.removeListener(this._boundOnChange);
        this._queryResult = null;
      }
    }]);

    return MediaQueryCollapseDetection;
  })(CollapseDetection);

  var BaseMode = (function () {
    function BaseMode() {
      _classCallCheck(this, BaseMode);
    }

    _createClass(BaseMode, [{
      key: 'isOpened',
      value: function isOpened() {
        return false;
      }
    }, {
      key: 'openMenu',
      value: function openMenu() {
        return false;
      }
    }, {
      key: 'closeMenu',
      value: function closeMenu() {
        return false;
      }
    }, {
      key: 'enterMode',
      value: function enterMode() {}
    }, {
      key: 'exitMode',
      value: function exitMode() {}
    }, {
      key: 'handleGesture',
      value: function handleGesture() {}
    }]);

    return BaseMode;
  })();

  var SplitMode = (function (_BaseMode) {
    _inherits(SplitMode, _BaseMode);

    function SplitMode(element) {
      _classCallCheck(this, SplitMode);

      _get(Object.getPrototypeOf(SplitMode.prototype), 'constructor', this).call(this);
      this._element = element;
    }

    _createClass(SplitMode, [{
      key: 'isOpened',
      value: function isOpened() {
        return false;
      }

      /**
       * @param {Element} element
       */
    }, {
      key: 'layout',
      value: function layout() {
        var element = this._element;
        element.style.width = element._getWidth();

        if (element._isLeftSide()) {
          element.style.left = '0';
          element.style.right = 'auto';
        } else {
          element.style.left = 'auto';
          element.style.right = '0';
        }
      }
    }, {
      key: 'enterMode',
      value: function enterMode() {
        this.layout();
      }
    }, {
      key: 'exitMode',
      value: function exitMode() {
        var element = this._element;

        element.style.left = '';
        element.style.right = '';
        element.style.width = '';
        element.style.zIndex = '';
      }
    }]);

    return SplitMode;
  })(BaseMode);

  var CollapseMode = (function (_BaseMode2) {
    _inherits(CollapseMode, _BaseMode2);

    _createClass(CollapseMode, [{
      key: '_animator',
      get: function get() {
        return this._element._getAnimator();
      }
    }], [{
      key: 'CLOSED_STATE',
      get: function get() {
        return 'closed';
      }
    }, {
      key: 'OPENED_STATE',
      get: function get() {
        return 'opened';
      }
    }]);

    function CollapseMode(element) {
      _classCallCheck(this, CollapseMode);

      _get(Object.getPrototypeOf(CollapseMode.prototype), 'constructor', this).call(this);

      this._state = CollapseMode.CLOSED_STATE;
      this._distance = 0;
      this._element = element;
      this._lock = new DoorLock();
    }

    _createClass(CollapseMode, [{
      key: '_isLocked',
      value: function _isLocked() {
        return this._lock.isLocked();
      }
    }, {
      key: 'isOpened',
      value: function isOpened() {
        return this._state !== CollapseMode.CLOSED_STATE;
      }
    }, {
      key: 'handleGesture',
      value: function handleGesture(event) {
        if (this._isLocked()) {
          return;
        }

        if (this._openedOtherSideMenu()) {
          return;
        }

        if (event.type === 'dragleft' || event.type === 'dragright') {
          this._onDrag(event);
        } else if (event.type === 'dragstart') {
          this._onDragStart(event);
        } else if (event.type === 'dragend') {
          this._onDragEnd(event);
        } else {
          throw new Error('Invalid state');
        }
      }
    }, {
      key: '_onDragStart',
      value: function _onDragStart(event) {
        this._ignoreDrag = false;

        if (this._element._swipeTargetWidth > 0) {
          var distance = this._element._isLeftSide() ? event.gesture.center.clientX : window.innerWidth - event.gesture.center.clientX;
          if (distance > this._element._swipeTargetWidth) {
            this._ignoreDrag = true;
          }
        }
      }
    }, {
      key: '_onDrag',
      value: function _onDrag(event) {
        if (this._ignoreDrag) {
          return;
        }

        event.gesture.preventDefault();

        var deltaX = event.gesture.deltaX;
        var deltaDistance = this._element._isLeftSide() ? deltaX : -deltaX;

        var startEvent = event.gesture.startEvent;

        if (!('isOpened' in startEvent)) {
          startEvent.isOpened = this.isOpened();
        }

        if (deltaDistance < 0 && !this.isOpened()) {
          return;
        }

        if (deltaDistance > 0 && this.isOpened()) {
          return;
        }

        var width = this._element._getWidthInPixel();
        var distance = startEvent.isOpened ? deltaDistance + width : deltaDistance;

        this._animator.translate(Math.max(0, Math.min(width, distance)));
      }
    }, {
      key: '_onDragEnd',
      value: function _onDragEnd(event) {
        if (this._ignoreDrag) {
          return;
        }

        var deltaX = event.gesture.deltaX;
        var deltaDistance = this._element._isLeftSide() ? deltaX : -deltaX;
        var width = this._element._getWidthInPixel();
        var distance = event.gesture.startEvent.isOpened ? deltaDistance + width : deltaDistance;

        var direction = event.gesture.interimDirection;
        var shouldOpen = this._element._isLeftSide() && direction === 'right' || !this._element._isLeftSide() && direction === 'left';

        if (shouldOpen) {
          this.openMenu();
        } else {
          this.closeMenu();
        }
      }
    }, {
      key: 'layout',
      value: function layout() {
        if (this._state === CollapseMode.CLOSED_STATE) {
          if (this._animator.isActivated()) {
            this._animator.layoutOnClose();
          }
        } else if (this._state === CollapseMode.OPENED_STATE) {
          if (this._animator.isActivated()) {
            this._animator.layoutOnOpen();
          }
        } else {
          throw new Error('Invalid state');
        }
      }

      // enter collapse mode
    }, {
      key: 'enterMode',
      value: function enterMode() {
        this._animator.activate(this._element._getContentElement(), this._element, this._element._getMaskElement());

        this.layout();
      }

      // exit collapse mode
    }, {
      key: 'exitMode',
      value: function exitMode() {
        this._animator.inactivate();
      }

      /**
       * @return {Boolean}
       */
    }, {
      key: '_openedOtherSideMenu',
      value: function _openedOtherSideMenu() {
        var _this = this;

        return util.arrayFrom(this._element.parentElement.children).filter(function (child) {
          return child.nodeName.toLowerCase() === 'ons-splitter-side' && _this._element !== child;
        }).filter(function (side) {
          return side.isOpened();
        }).length > 0;
      }

      /**
       * @param {Object} [options]
       * @param {Function} [options.callback]
       * @param {Boolean} [options.withoutAnimation]
       * @return {Boolean}
       */
    }, {
      key: 'openMenu',
      value: function openMenu() {
        var _this2 = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        if (this._isLocked()) {
          return false;
        }

        if (this._openedOtherSideMenu()) {
          return false;
        }

        if (this._element._emitPreOpenEvent()) {
          return false;
        }

        options.callback = options.callback instanceof Function ? options.callback : function () {};

        var unlock = this._lock.lock();
        var done = function done() {
          unlock();
          _this2._element._emitPostOpenEvent();
          options.callback();
        };

        if (options.withoutAnimation) {
          this._state = CollapseMode.OPENED_STATE;
          this.layout();
          done();
        } else {
          this._state = CollapseMode.OPENED_STATE;
          this._animator.open(function () {
            _this2.layout();
            done();
          });
        }

        return true;
      }

      /**
       * @param {Object} [options]
       */
    }, {
      key: 'closeMenu',
      value: function closeMenu() {
        var _this3 = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        if (this._isLocked()) {
          return false;
        }

        if (this._element._emitPreCloseEvent()) {
          return false;
        }

        options.callback = options.callback instanceof Function ? options.callback : function () {};

        var unlock = this._lock.lock();
        var done = function done() {
          unlock();
          _this3._element._emitPostCloseEvent();
          setImmediate(options.callback);
        };

        if (options.withoutAnimation) {
          this._state = CollapseMode.CLOSED_STATE;
          this.layout();
          done();
        } else {
          this._state = CollapseMode.CLOSED_STATE;
          this._animator.close(function () {
            _this3.layout();
            done();
          });
        }

        return true;
      }
    }]);

    return CollapseMode;
  })(BaseMode);

  var SplitterSideElement = (function (_ons$_BaseElement) {
    _inherits(SplitterSideElement, _ons$_BaseElement);

    function SplitterSideElement() {
      _classCallCheck(this, SplitterSideElement);

      _get(Object.getPrototypeOf(SplitterSideElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(SplitterSideElement, [{
      key: '_updateForAnimationOptionsAttribute',
      value: function _updateForAnimationOptionsAttribute() {
        this._animationOptions = util.parseJSONObjectSafely(this.getAttribute('animation-options'), {});
      }
    }, {
      key: '_getMaskElement',
      value: function _getMaskElement() {
        return util.findChild(this.parentElement, 'ons-splitter-mask');
      }
    }, {
      key: '_getContentElement',
      value: function _getContentElement() {
        return util.findChild(this.parentElement, 'ons-splitter-content');
      }
    }, {
      key: '_getModeStrategy',
      value: function _getModeStrategy() {
        if (this._mode === COLLAPSE_MODE) {
          return this._collapseMode;
        } else if (this._mode === SPLIT_MODE) {
          return this._splitMode;
        }
      }
    }, {
      key: 'createdCallback',
      value: function createdCallback() {
        this._mode = null;
        this._page = null;
        this._isAttached = false;
        this._collapseStrategy = new CollapseDetection();
        this._animatorFactory = new AnimatorFactory({
          animators: window.OnsSplitterElement._animatorDict,
          baseClass: ons._internal.SplitterAnimator,
          baseClassName: 'SplitterAnimator',
          defaultAnimation: this.getAttribute('animation')
        });

        this._collapseMode = new CollapseMode(this);
        this._splitMode = new SplitMode(this);

        this._boundHandleGesture = this._handleGesture.bind(this);

        this._cancelModeDetection = function () {};

        this._updateMode(SPLIT_MODE);

        this._updateForAnimationAttribute();
        this._updateForWidthAttribute();
        this._updateForSideAttribute();
        this._updateForCollapseAttribute();
        this._updateForSwipeableAttribute();
        this._updateForSwipeTargetWidthAttribute();
        this._updateForAnimationOptionsAttribute();
      }
    }, {
      key: '_getAnimator',
      value: function _getAnimator() {
        return this._animator;
      }

      /**
       * @return {Boolean}
       */
    }, {
      key: 'isSwipeable',
      value: function isSwipeable() {
        return this.hasAttribute('swipeable');
      }
    }, {
      key: '_emitPostOpenEvent',
      value: function _emitPostOpenEvent() {
        util.triggerElementEvent(this, 'postopen', { side: this });
      }
    }, {
      key: '_emitPostCloseEvent',
      value: function _emitPostCloseEvent() {
        util.triggerElementEvent(this, 'postclose', { side: this });
      }

      /**
       * @return {boolean} canceled or not
       */
    }, {
      key: '_emitPreOpenEvent',
      value: function _emitPreOpenEvent() {
        return this._emitCancelableEvent('preopen');
      }
    }, {
      key: '_emitCancelableEvent',
      value: function _emitCancelableEvent(name) {
        var isCanceled = false;

        util.triggerElementEvent(this, name, {
          side: this,
          cancel: function cancel() {
            return isCanceled = true;
          }
        });

        return isCanceled;
      }

      /**
       * @return {boolean}
       */
    }, {
      key: '_emitPreCloseEvent',
      value: function _emitPreCloseEvent() {
        return this._emitCancelableEvent('preclose');
      }
    }, {
      key: '_updateForCollapseAttribute',
      value: function _updateForCollapseAttribute() {
        if (!this.hasAttribute('collapse')) {
          this._updateMode(SPLIT_MODE);
          return;
        }

        var collapse = ('' + this.getAttribute('collapse')).trim();

        if (collapse === '') {
          this._updateCollapseStrategy(new StaticCollapseDetection());
        } else if (collapse === 'portrait' || collapse === 'landscape') {
          this._updateCollapseStrategy(new OrientationCollapseDetection(collapse));
        } else {
          this._updateCollapseStrategy(new MediaQueryCollapseDetection(collapse));
        }
      }

      /**
       * @param {CollapseDetection} strategy
       */
    }, {
      key: '_updateCollapseStrategy',
      value: function _updateCollapseStrategy(strategy) {
        if (this._isAttached) {
          this._collapseStrategy.inactivate();
          strategy.activate(this);
        }

        this._collapseStrategy = strategy;
      }

      /**
       * @param {String} mode
       */
    }, {
      key: '_updateMode',
      value: function _updateMode(mode) {

        if (mode !== COLLAPSE_MODE && mode !== SPLIT_MODE) {
          throw new Error('invalid mode: ' + mode);
        }

        if (mode === this._mode) {
          return;
        }

        var lastMode = this._getModeStrategy();

        if (lastMode) {
          lastMode.exitMode();
        }

        this._mode = mode;
        var currentMode = this._getModeStrategy();

        currentMode.enterMode();
        this.setAttribute('mode', mode);

        util.triggerElementEvent(this, 'modechange', {
          side: this,
          mode: mode
        });
      }
    }, {
      key: '_layout',
      value: function _layout() {
        this._getModeStrategy().layout();
      }
    }, {
      key: '_updateForSwipeTargetWidthAttribute',
      value: function _updateForSwipeTargetWidthAttribute() {
        if (this.hasAttribute('swipe-target-width')) {
          this._swipeTargetWidth = Math.max(0, parseInt(this.getAttribute('swipe-target-width'), 10));
        } else {
          this._swipeTargetWidth = -1;
        }
      }

      /**
       * @return {String} \d+(px|%)
       */
    }, {
      key: '_getWidth',
      value: function _getWidth() {
        return this.hasAttribute('width') ? normalize(this.getAttribute('width')) : '80%';

        function normalize(width) {
          width = width.trim();

          if (width.match(/^\d+(px|%)$/)) {
            return width;
          }

          return '80%';
        }
      }
    }, {
      key: '_getWidthInPixel',
      value: function _getWidthInPixel() {
        var width = this._getWidth();

        var _width$match = width.match(/^(\d+)(px|%)$/);

        var _width$match2 = _slicedToArray(_width$match, 3);

        var num = _width$match2[1];
        var unit = _width$match2[2];

        if (unit === 'px') {
          return parseInt(num, 10);
        }

        if (unit === '%') {
          var percent = parseInt(num, 10);

          return Math.round(this.parentElement.offsetWidth * percent / 100);
        }

        throw new Error('Invalid state');
      }

      /**
       * @return {String} 'left' or 'right'.
       */
    }, {
      key: '_getSide',
      value: function _getSide() {
        return normalize(this.getAttribute('side'));

        function normalize(side) {
          side = ('' + side).trim();
          return side === 'left' || side === 'right' ? side : 'left';
        }
      }
    }, {
      key: '_isLeftSide',
      value: function _isLeftSide() {
        return this._getSide() === 'left';
      }
    }, {
      key: '_updateForWidthAttribute',
      value: function _updateForWidthAttribute() {
        this._getModeStrategy().layout();
      }
    }, {
      key: '_updateForSideAttribute',
      value: function _updateForSideAttribute() {
        this._getModeStrategy().layout();
      }

      /**
       * @return {String}
       */
    }, {
      key: 'getCurrentMode',
      value: function getCurrentMode() {
        return this._mode;
      }

      /**
       * @return {Boolean}
       */
    }, {
      key: 'isOpened',
      value: function isOpened() {
        return this._getModeStrategy().isOpened();
      }

      /**
       * @param {Object} [options]
       * @return {Boolean}
       */
    }, {
      key: 'open',
      value: function open() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        return this._getModeStrategy().openMenu(options);
      }

      /**
       * @param {Object} [options]
       * @return {Boolean}
       */
    }, {
      key: 'close',
      value: function close() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        return this._getModeStrategy().closeMenu(options);
      }

      /**
       * @param {String} page
       * @param {Object} [options]
       * @param {Function} [options.callback]
       */
    }, {
      key: 'load',
      value: function load(page) {
        var _this4 = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        this._page = page;

        options.callback = options.callback instanceof Function ? options.callback : function () {};
        ons._internal.getPageHTMLAsync(page).then(function (html) {
          window.OnsSplitterSideElement.rewritables.link(_this4, util.createFragment(html), function (fragment) {
            while (_this4.childNodes[0]) {
              if (_this4.childNodes[0]._hide instanceof Function) {
                _this4.childNodes[0]._hide();
              }
              _this4.removeChild(_this4.childNodes[0]);
            }

            _this4.appendChild(fragment);
            util.arrayOf(fragment.childNodes).forEach(function (node) {
              if (node._show instanceof Function) {
                node._show();
              }
            });

            options.callback();
          });
        });
      }

      /**
       * @param {Object} [options]
       */
    }, {
      key: 'toggle',
      value: function toggle() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        return this.isOpened() ? this.close(options) : this.open(options);
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'width') {
          this._updateForWidthAttribute();
        } else if (name === 'side') {
          this._updateForSideAttribute();
        } else if (name === 'collapse') {
          this._updateForCollapseAttribute();
        } else if (name === 'swipeable') {
          this._updateForSwipeableAttribute();
        } else if (name === 'swipe-target-width') {
          this._updateForSwipeTargetWidthAttribute();
        } else if (name === 'animation-options') {
          this._updateForAnimationOptionsAttribute();
        } else if (name === 'animation') {
          this._updateForAnimationAttribute();
        }
      }
    }, {
      key: '_updateForAnimationAttribute',
      value: function _updateForAnimationAttribute() {
        var isActivated = this._animator && this._animator.isActivated();

        if (isActivated) {
          this._animator.inactivate();
        }

        this._animator = this._createAnimator();

        if (isActivated) {
          this._animator.activate(this._getContentElement(), this, this._getMaskElement());
        }
      }
    }, {
      key: '_updateForSwipeableAttribute',
      value: function _updateForSwipeableAttribute() {
        if (this._gestureDetector) {
          if (this.isSwipeable()) {
            this._gestureDetector.on('dragstart dragleft dragright dragend', this._boundHandleGesture);
          } else {
            this._gestureDetector.off('dragstart dragleft dragright dragend', this._boundHandleGesture);
          }
        }
      }
    }, {
      key: '_assertParent',
      value: function _assertParent() {
        var parentElementName = this.parentElement.nodeName.toLowerCase();
        if (parentElementName !== 'ons-splitter') {
          throw new Error('"' + parentElementName + '" element is not allowed as parent element.');
        }
      }
    }, {
      key: 'attachedCallback',
      value: function attachedCallback() {
        var _this5 = this;

        this._isAttached = true;
        this._collapseStrategy.activate(this);
        this._assertParent();

        this._gestureDetector = new ons.GestureDetector(this.parentElement, { dragMinDistance: 1 });
        this._updateForSwipeableAttribute();

        if (this.hasAttribute('page')) {
          window.OnsSplitterSideElement.rewritables.ready(this, function () {
            return _this5.load(_this5.getAttribute('page'));
          });
        }
      }
    }, {
      key: 'detachedCallback',
      value: function detachedCallback() {
        this._isAttached = false;
        this._collapseStrategy.inactivate();

        this._gestureDetector.dispose();
        this._gestureDetector = null;

        this._updateForSwipeableAttribute();
      }
    }, {
      key: '_handleGesture',
      value: function _handleGesture(event) {
        return this._getModeStrategy().handleGesture(event);
      }
    }, {
      key: '_show',
      value: function _show() {
        util.arrayOf(this.children).forEach(function (child) {
          if (child._show instanceof Function) {
            child._show();
          }
        });
      }
    }, {
      key: '_hide',
      value: function _hide() {
        util.arrayOf(this.children).forEach(function (child) {
          if (child._hide instanceof Function) {
            child._hide();
          }
        });
      }
    }, {
      key: '_destroy',
      value: function _destroy() {
        util.arrayOf(this.children).forEach(function (child) {
          if (child._destroy instanceof Function) {
            child._destroy();
          }
        });
        this.remove();
      }
    }, {
      key: '_createAnimator',
      value: function _createAnimator() {
        return this._animatorFactory.newAnimator({
          animation: this.getAttribute('animation'),
          animationOptions: AnimatorFactory.parseAnimationOptionsString(this.getAttribute('animation-options'))
        });
      }
    }, {
      key: 'page',
      get: function get() {
        return this._page;
      }
    }, {
      key: 'mode',
      get: function get() {
        this._mode;
      }
    }]);

    return SplitterSideElement;
  })(ons._BaseElement);

  if (!window.OnsSplitterSideElement) {
    window.OnsSplitterSideElement = document.registerElement('ons-splitter-side', {
      prototype: SplitterSideElement.prototype
    });

    window.OnsSplitterSideElement.rewritables = {
      /**
       * @param {Element} splitterSideElement
       * @param {Function} callback
       */
      ready: function ready(splitterSideElement, callback) {
        setImmediate(callback);
      },

      /**
       * @param {Element} splitterSideElement
       * @param {HTMLFragment} target
       * @param {Function} callback
       */
      link: function link(splitterSideElement, target, callback) {
        callback(target);
      }
    };
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x11, _x12, _x13) { var _again = true; _function: while (_again) { var object = _x11, property = _x12, receiver = _x13; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x11 = parent; _x12 = property; _x13 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var util = ons._util;

  var SplitterElement = (function (_ons$_BaseElement) {
    _inherits(SplitterElement, _ons$_BaseElement);

    function SplitterElement() {
      _classCallCheck(this, SplitterElement);

      _get(Object.getPrototypeOf(SplitterElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(SplitterElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this._boundOnDeviceBackButton = this._onDeviceBackButton.bind(this);
        this._boundOnModeChange = this._onModeChange.bind(this);
      }
    }, {
      key: '_onModeChange',
      value: function _onModeChange(event) {
        if (event.target.parentElement === this) {
          this._layout();
        }
      }

      /**
       * @param {String} side 'left' or 'right'.
       * @return {Element}
       */
    }, {
      key: '_getSideElement',
      value: function _getSideElement(side) {
        var result = util.findChild(this, function (element) {
          return element.nodeName.toLowerCase() === 'ons-splitter-side' && element.getAttribute('side') === side;
        });

        if (result) {
          CustomElements.upgrade(result);
        }

        return result;
      }
    }, {
      key: '_layout',
      value: function _layout() {
        var content = this._getContentElement();
        var left = this._getSideElement('left');
        var right = this._getSideElement('right');

        if (content) {
          if (left && left.getCurrentMode && left.getCurrentMode() === 'split') {
            content.style.left = left._getWidth();
          } else {
            content.style.left = '0px';
          }

          if (right && right.getCurrentMode && right.getCurrentMode() === 'split') {
            content.style.right = right._getWidth();
          } else {
            content.style.right = '0px';
          }
        }
      }

      /**
       * @return {Element}
       */
    }, {
      key: '_getContentElement',
      value: function _getContentElement() {
        return util.findChild(this, 'ons-splitter-content');
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {}

      /**
       * @param {Object} [options]
       */
    }, {
      key: 'openRight',
      value: function openRight() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        return this._open('right', options);
      }
    }, {
      key: '_getMaskElement',
      value: function _getMaskElement() {
        var mask = util.findChild(this, 'ons-splitter-mask');
        return mask || this.appendChild(document.createElement('ons-splitter-mask'));
      }

      /**
       * @param {Object} [options]
       */
    }, {
      key: 'openLeft',
      value: function openLeft() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        return this._open('left', options);
      }
    }, {
      key: '_open',
      value: function _open(side) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var menu = this._getSideElement(side);

        if (menu) {
          return menu.open(options);
        }
        return false;
      }

      /**
       * @param {Object} [options]
       */
    }, {
      key: 'closeRight',
      value: function closeRight() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        return this._close('right', options);
      }

      /**
       * @param {Object} [options]
       */
    }, {
      key: 'closeLeft',
      value: function closeLeft() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        return this._close('left', options);
      }

      /**
       * @param {String} side
       * @param {Object} [options]
       */
    }, {
      key: '_close',
      value: function _close(side) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var menu = this._getSideElement(side);

        if (menu) {
          return menu.close(options);
        }
        return false;
      }

      /**
       * @param {Object} [options]
       * @return {Boolean}
       */
    }, {
      key: 'toggleLeft',
      value: function toggleLeft() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        return this._toggle('left', options);
      }

      /**
       * @param {Object} [options]
       * @return {Boolean}
       */
    }, {
      key: 'toggleRight',
      value: function toggleRight() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        return this._toggle('right', options);
      }
    }, {
      key: '_toggle',
      value: function _toggle(side) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var menu = this._getSideElement(side);

        if (menu) {
          return menu.toggle(options);
        }
        return false;
      }

      /**
       * @return {Boolean}
       */
    }, {
      key: 'leftIsOpened',
      value: function leftIsOpened() {
        return this._isOpened('left');
      }

      /**
       * @return {Boolean}
       */
    }, {
      key: 'rightIsOpened',
      value: function rightIsOpened() {
        return this._isOpened('right');
      }

      /**
       * @param {String} side
       * @return {Boolean}
       */
    }, {
      key: '_isOpened',
      value: function _isOpened(side) {
        var menu = this._getSideElement(side);

        if (menu) {
          return menu.isOpened();
        }

        return false;
      }

      /**
       * @param {String} page
       * @param {Object} [options]
       */
    }, {
      key: 'loadContentPage',
      value: function loadContentPage(page) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var content = this._getContentElement();

        if (content) {
          return content.load(page, options);
        } else {
          throw new Error('child "ons-splitter-content" element is not found in this element.');
        }
      }
    }, {
      key: '_onDeviceBackButton',
      value: function _onDeviceBackButton(handler) {
        var left = this._getSideElement('left');
        var right = this._getSideElement('right');

        if (left.isOpened()) {
          left.close();
          return;
        }

        if (right.isOpened()) {
          right.close();
          return;
        }

        handler.callParentHandler();
      }
    }, {
      key: 'attachedCallback',
      value: function attachedCallback() {
        var _this = this;

        this._deviceBackButtonHandler = ons._deviceBackButtonDispatcher.createHandler(this, this._boundOnDeviceBackButton);
        this._assertChildren();

        this.addEventListener('modechange', this._boundOnModeChange, false);

        setImmediate(function () {
          return _this._layout();
        });
      }

      /**
       * @return {Object/null}
       */
    }, {
      key: 'getDeviceBackButtonHandler',
      value: function getDeviceBackButtonHandler() {
        return this._deviceBackButtonHandler;
      }
    }, {
      key: '_assertChildren',
      value: function _assertChildren() {
        var names = ['ons-splitter-content', 'ons-splitter-side', 'ons-splitter-mask'];
        var contentCount = 0;
        var sideCount = 0;
        var maskCount = 0;

        util.arrayFrom(this.children).forEach(function (element) {
          var name = element.nodeName.toLowerCase();
          if (names.indexOf(name) === -1) {
            throw new Error('"' + name + '" element is not allowed in "ons-splitter" element.');
          }

          if (name === 'ons-splitter-content') {
            contentCount++;
          } else if (name === 'ons-splitter-content') {
            sideCount++;
          } else if (name === 'ons-splitter-mask') {
            maskCount++;
          }
        });

        if (contentCount > 1) {
          throw new Error('too many <ons-splitter-content> elements.');
        }

        if (sideCount > 2) {
          throw new Error('too many <ons-splitter-side> elements.');
        }

        if (maskCount > 1) {
          throw new Error('too many <ons-splitter-mask> elements.');
        }

        if (maskCount === 0) {
          this.appendChild(document.createElement('ons-splitter-mask'));
        }
      }
    }, {
      key: 'detachedCallback',
      value: function detachedCallback() {
        this._deviceBackButtonHandler.destroy();
        this._deviceBackButtonHandler = null;

        this.removeEventListener('modechange', this._boundOnModeChange, false);
      }
    }, {
      key: '_show',
      value: function _show() {
        util.arrayOf(this.children).forEach(function (child) {
          if (child._show instanceof Function) {
            child._show();
          }
        });
      }
    }, {
      key: '_hide',
      value: function _hide() {
        util.arrayOf(this.children).forEach(function (child) {
          if (child._hide instanceof Function) {
            child._hide();
          }
        });
      }
    }, {
      key: '_destroy',
      value: function _destroy() {
        util.arrayOf(this.children).forEach(function (child) {
          if (child._destroy instanceof Function) {
            child._destroy();
          }
        });
        this.remove();
      }
    }]);

    return SplitterElement;
  })(ons._BaseElement);

  if (!window.OnsSplitterElement) {
    window.OnsSplitterElement = document.registerElement('ons-splitter', {
      prototype: SplitterElement.prototype
    });

    window.OnsSplitterElement._animatorDict = {
      'default': ons._internal.OverlaySplitterAnimator,
      overlay: ons._internal.OverlaySplitterAnimator
    };

    window.OnsSplitterElement.registerAnimator = function (name, Animator) {
      if (!(Animator instanceof ons._internal.SplitterAnimator)) {
        throw new Error('Animator parameter must be an instance of SplitterAnimator.');
      }
      window.OnsSplitterElement._animatorDict[name] = Animator;
    };

    window.OnsSplitterElement.SplitterAnimator = ons._internal.SplitterAnimator;
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var scheme = {
    '': 'switch--*',
    '.switch__input': 'switch--*__input',
    '.switch__toggle': 'switch--*__toggle'
  };
  var ModifierUtil = ons._internal.ModifierUtil;
  var templateSource = ons._util.createElement('\n    <div>\n      <input type="checkbox" class="switch__input">\n      <div class="switch__toggle"></div>\n    </div>\n  ');

  var ExtendableLabelElement = undefined;
  if (typeof HTMLLabelElement !== 'function') {
    // for Safari
    ExtendableLabelElement = function () {};
    ExtendableLabelElement.prototype = document.createElement('label');
  } else {
    ExtendableLabelElement = HTMLLabelElement;
  }

  var generateId = (function () {
    var i = 0;
    return function () {
      return 'ons-switch-id-' + i++;
    };
  })();

  var SwitchElement = (function (_ExtendableLabelElement) {
    _inherits(SwitchElement, _ExtendableLabelElement);

    function SwitchElement() {
      _classCallCheck(this, SwitchElement);

      _get(Object.getPrototypeOf(SwitchElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(SwitchElement, [{
      key: 'isChecked',

      /**
       * @return {Boolean}
       */
      value: function isChecked() {
        return this.checked;
      }

      /**
       * @param {Boolean}
       */
    }, {
      key: 'setChecked',
      value: function setChecked(isChecked) {
        this.checked = !!isChecked;
      }

      /**
       * @return {HTMLElement}
       */
    }, {
      key: 'getCheckboxElement',
      value: function getCheckboxElement() {
        return this._getCheckbox();
      }
    }, {
      key: 'createdCallback',
      value: function createdCallback() {
        this._compile();
        ModifierUtil.initModifier(this, scheme);

        this._updateForCheckedAttribute();
        this._updateForDisabledAttribute();
      }
    }, {
      key: '_updateForCheckedAttribute',
      value: function _updateForCheckedAttribute() {
        if (this.hasAttribute('checked')) {
          this._getCheckbox().checked = true;
        } else {
          this._getCheckbox().checked = false;
        }
      }
    }, {
      key: '_updateForDisabledAttribute',
      value: function _updateForDisabledAttribute() {
        if (this.hasAttribute('disabled')) {
          this._getCheckbox().setAttribute('disabled', '');
        } else {
          this._getCheckbox().removeAttribute('disabled');
        }
      }
    }, {
      key: '_compile',
      value: function _compile() {
        this.classList.add('switch');
        var template = templateSource.cloneNode(true);
        while (template.children[0]) {
          this.appendChild(template.children[0]);
        }
        this._getCheckbox().setAttribute('name', generateId());
      }
    }, {
      key: 'detachedCallback',
      value: function detachedCallback() {
        this._getCheckbox().removeEventListener('change', this._onChangeListener);
      }
    }, {
      key: 'attachedCallback',
      value: function attachedCallback() {
        this._getCheckbox().addEventListener('change', this._onChangeListener);
      }
    }, {
      key: '_onChangeListener',
      value: function _onChangeListener() {
        if (this.checked !== true) {
          this.removeAttribute('checked');
        } else {
          this.setAttribute('checked', '');
        }
      }

      /**
       * @return {Boolean}
       */
    }, {
      key: '_isChecked',
      value: function _isChecked() {
        return this._getCheckbox().checked;
      }

      /**
       * @param {Boolean}
       */
    }, {
      key: '_setChecked',
      value: function _setChecked(isChecked) {
        isChecked = !!isChecked;

        var checkbox = this._getCheckbox();

        if (checkbox.checked != isChecked) {
          checkbox.checked = isChecked;
        }
      }
    }, {
      key: '_getCheckbox',
      value: function _getCheckbox() {
        return this.querySelector('input[type=checkbox]');
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'modifier') {
          return ModifierUtil.onModifierChanged(last, current, this, scheme);
        } else if (name === 'checked') {
          this._updateForCheckedAttribute();
        } else if (name === 'disabled') {
          this._updateForDisabledAttribute();
        }
      }
    }, {
      key: 'checked',
      get: function get() {
        return this._getCheckbox().checked;
      },
      set: function set(value) {
        this._getCheckbox().checked = value;
        if (this.checked) {
          this.setAttribute('checked', '');
        } else {
          this.removeAttribute('checked');
        }
        this._updateForCheckedAttribute();
      }
    }, {
      key: 'disabled',
      get: function get() {
        return this._getCheckbox().disabled;
      },
      set: function set(value) {
        this._getCheckbox().disabled = value;
        if (this.disabled) {
          this.setAttribute('disabled', '');
        } else {
          this.removeAttribute('disabled');
        }
      }
    }]);

    return SwitchElement;
  })(ExtendableLabelElement);

  if (!window.OnsSwitchElement) {
    window.OnsSwitchElement = document.registerElement('ons-switch', {
      prototype: SwitchElement.prototype
    });
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var scheme = {
    '': 'tab-bar--*__item',
    '.tab-bar__button': 'tab-bar--*__button'
  };
  var ModifierUtil = ons._internal.ModifierUtil;
  var util = ons._util;
  var templateSource = util.createElement('\n    <div>\n      <input type="radio" style="display: none">\n      <button class="tab-bar__button tab-bar-inner"></button>\n    </div>\n  ');
  var defaultInnerTemplateSource = util.createElement('\n    <div>\n      <div class="tab-bar__icon">\n        <ons-icon icon="ion-cloud" style="font-size: 28px; line-height: 34px; vertical-align: top;"></ons-icon>\n      </div>\n      <div class="tab-bar__label">label</div>\n    </div>\n  ');

  var TabElement = (function (_ons$_BaseElement) {
    _inherits(TabElement, _ons$_BaseElement);

    function TabElement() {
      _classCallCheck(this, TabElement);

      _get(Object.getPrototypeOf(TabElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(TabElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this._compile();
        this._boundOnClick = this._onClick.bind(this);

        ModifierUtil.initModifier(this, scheme);
      }
    }, {
      key: '_compile',
      value: function _compile() {
        var fragment = document.createDocumentFragment();
        var hasChildren = false;

        while (this.childNodes[0]) {
          var node = this.childNodes[0];
          this.removeChild(node);
          fragment.appendChild(node);

          if (node.nodeType == Node.ELEMENT_NODE) {
            hasChildren = true;
          }
        }

        var template = templateSource.cloneNode(true);
        while (template.children[0]) {
          this.appendChild(template.children[0]);
        }
        this.classList.add('tab-bar__item');

        var button = util.findChild(this, '.tab-bar__button');

        if (hasChildren) {
          button.appendChild(fragment);
          this._hasDefaultTemplate = false;
        } else {
          this._hasDefaultTemplate = true;
          this._updateDefaultTemplate();
        }
      }
    }, {
      key: '_updateDefaultTemplate',
      value: function _updateDefaultTemplate() {
        if (!this._hasDefaultTemplate) {
          return;
        }

        var button = util.findChild(this, '.tab-bar__button');

        var template = defaultInnerTemplateSource.cloneNode(true);
        while (template.children[0]) {
          button.appendChild(template.children[0]);
        }

        var self = this;
        var icon = this.getAttribute('icon');
        var label = this.getAttribute('label');

        if (typeof icon === 'string') {
          getIconElement().setAttribute('icon', icon);
        } else {
          var wrapper = button.querySelector('.tab-bar__icon');
          wrapper.parentNode.removeChild(wrapper);
        }

        if (typeof label === 'string') {
          getLabelElement().textContent = label;
        } else {
          getLabelElement().parentNode.removeChild(getLabelElement());
        }

        function getLabelElement() {
          return self.querySelector('.tab-bar__label');
        }

        function getIconElement() {
          return self.querySelector('ons-icon');
        }
      }
    }, {
      key: '_onClick',
      value: function _onClick() {
        var tabbar = this._findTabbarElement();
        if (tabbar) {
          tabbar.setActiveTab(this._findTabIndex());
        }
      }
    }, {
      key: 'isPersistent',
      value: function isPersistent() {
        return this.hasAttribute('persistent');
      }
    }, {
      key: 'setActive',
      value: function setActive() {
        var radio = util.findChild(this, 'input');
        radio.checked = true;
        this.classList.add('active');

        util.arrayFrom(this.querySelectorAll('[ons-tab-inactive]')).forEach(function (element) {
          return element.style.display = 'none';
        });
        util.arrayFrom(this.querySelectorAll('[ons-tab-active]')).forEach(function (element) {
          return element.style.display = 'inherit';
        });
      }
    }, {
      key: 'setInactive',
      value: function setInactive() {
        var radio = util.findChild(this, 'input');
        radio.checked = false;
        this.classList.remove('active');

        util.arrayFrom(this.querySelectorAll('[ons-tab-inactive]')).forEach(function (element) {
          return element.style.display = 'inherit';
        });
        util.arrayFrom(this.querySelectorAll('[ons-tab-active]')).forEach(function (element) {
          return element.style.display = 'none';
        });
      }

      /**
       * @return {Boolean}
       */
    }, {
      key: 'isLoaded',
      value: function isLoaded() {
        return false;
      }

      /**
       * @param {Function} callback
       * @param {Function} link
       */
    }, {
      key: '_loadPageElement',
      value: function _loadPageElement(callback, link) {
        var _this = this;

        if (this.isPersistent()) {
          if (!this._pageElement) {
            this._createPageElement(this.getAttribute('page'), function (element) {
              link(element, function (element) {
                _this._pageElement = element;
                callback(element);
              });
            });
          } else {
            callback(this._pageElement);
          }
        } else {
          this._pageElement = null;
          this._createPageElement(this.getAttribute('page'), callback);
        }
      }

      /**
       * @param {String} page
       * @param {Function} callback
       */
    }, {
      key: '_createPageElement',
      value: function _createPageElement(page, callback) {
        ons._internal.getPageHTMLAsync(page).then(function (html) {
          callback(util.createElement(html.trim()));
        });
      }

      /**
       * @return {Boolean}
       */
    }, {
      key: 'isActive',
      value: function isActive() {
        return this.classList.contains('active');
      }

      /**
       * @return {Boolean}
       */
    }, {
      key: 'canReload',
      value: function canReload() {
        return !this.hasAttribute('no-reload');
      }
    }, {
      key: 'detachedCallback',
      value: function detachedCallback() {
        this.removeEventListener('click', this._boundOnClick, false);
      }
    }, {
      key: 'attachedCallback',
      value: function attachedCallback() {
        var _this2 = this;

        this._ensureElementPosition();

        if (this.hasAttribute('active')) {
          (function () {
            var tabbar = _this2._findTabbarElement();
            var tabIndex = _this2._findTabIndex();

            window.OnsTabbarElement.rewritables.ready(tabbar, function () {
              tabbar.setActiveTab(tabIndex, { animation: 'none' });
            });
          })();
        }

        this.addEventListener('click', this._boundOnClick, false);
      }
    }, {
      key: '_findTabbarElement',
      value: function _findTabbarElement() {
        if (this.parentNode && this.parentNode.nodeName.toLowerCase() === 'ons-tabbar') {
          return this.parentNode;
        }

        if (this.parentNode.parentNode && this.parentNode.parentNode.nodeName.toLowerCase() === 'ons-tabbar') {
          return this.parentNode.parentNode;
        }

        return null;
      }
    }, {
      key: '_findTabIndex',
      value: function _findTabIndex() {
        var elements = this.parentNode.children;
        for (var i = 0; i < elements.length; i++) {
          if (this === elements[i]) {
            return i;
          }
        }
      }
    }, {
      key: '_ensureElementPosition',
      value: function _ensureElementPosition() {
        if (!this._findTabbarElement()) {
          throw new Error('This ons-tab element is must be child of ons-tabbar element.');
        }
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (this._hasDefaultTemplate) {
          if (name === 'icon' || name === 'label') {
            this._updateDefaultTemplate();
          }
        }

        if (name === 'modifier') {
          return ModifierUtil.onModifierChanged(last, current, this, scheme);
        }
      }
    }]);

    return TabElement;
  })(ons._BaseElement);

  if (!window.OnsTabElement) {
    window.OnsTabElement = document.registerElement('ons-tab', {
      prototype: TabElement.prototype
    });
    document.registerElement('ons-tabbar-item', {
      prototype: Object.create(TabElement.prototype)
    });
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var scheme = {
    '.tab-bar__content': 'tab-bar--*__content',
    '.tab-bar': 'tab-bar--*'
  };

  var AnimatorFactory = ons._internal.AnimatorFactory;
  var TabbarAnimator = ons._internal.TabbarAnimator;
  var TabbarFadeAnimator = ons._internal.TabbarFadeAnimator;
  var TabbarNoneAnimator = ons._internal.TabbarNoneAnimator;
  var TabbarSlideAnimator = ons._internal.TabbarSlideAnimator;

  var ModifierUtil = ons._internal.ModifierUtil;
  var util = ons._util;

  var generateId = (function () {
    var i = 0;
    return function () {
      return 'ons-tabbar-gen-' + i++;
    };
  })();

  var TabbarElement = (function (_ons$_BaseElement) {
    _inherits(TabbarElement, _ons$_BaseElement);

    function TabbarElement() {
      _classCallCheck(this, TabbarElement);

      _get(Object.getPrototypeOf(TabbarElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(TabbarElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this._tabbarId = generateId();

        this._animatorFactory = new AnimatorFactory({
          animators: OnsTabbarElement._animatorDict,
          baseClass: TabbarAnimator,
          baseClassName: 'TabbarAnimator',
          defaultAnimation: this.getAttribute('animation')
        });

        this._compile();
        this._contentElement = ons._util.findChild(this, '.tab-bar__content');
        ModifierUtil.initModifier(this, scheme);
      }
    }, {
      key: '_compile',
      value: function _compile() {
        var wrapper = document.createDocumentFragment();

        var content = document.createElement('div');
        content.classList.add('ons-tab-bar__content');
        content.classList.add('tab-bar__content');

        var tabbar = document.createElement('div');
        tabbar.classList.add('tab-bar');
        tabbar.classList.add('ons-tab-bar__footer');
        tabbar.classList.add('ons-tabbar-inner');

        wrapper.appendChild(content);
        wrapper.appendChild(tabbar);

        while (this.childNodes[0]) {
          tabbar.appendChild(this.removeChild(this.childNodes[0]));
        }

        this.appendChild(wrapper);

        if (this._hasTopTabbar()) {
          this._prepareForTopTabbar();
        }
      }
    }, {
      key: '_hasTopTabbar',
      value: function _hasTopTabbar() {
        return this.getAttribute('position') === 'top';
      }
    }, {
      key: '_prepareForTopTabbar',
      value: function _prepareForTopTabbar() {

        var content = ons._util.findChild(this, '.tab-bar__content');
        var tabbar = ons._util.findChild(this, '.tab-bar');

        content.setAttribute('no-status-bar-fill', '');

        content.classList.add('tab-bar--top__content');
        tabbar.classList.add('tab-bar--top');

        var page = ons._util.findParent(this, 'ons-page');
        if (page) {
          this.style.top = window.getComputedStyle(page._getContentElement(), null).getPropertyValue('padding-top');
        }

        if (ons._internal.shouldFillStatusBar(this)) {
          // Adjustments for IOS7
          var fill = document.createElement('div');
          fill.classList.add('tab-bar__status-bar-fill');
          fill.style.width = '0px';
          fill.style.height = '0px';

          this.insertBefore(fill, this.children[0]);
        }
      }
    }, {
      key: '_getTabbarElement',
      value: function _getTabbarElement() {
        return util.findChild(this, '.tab-bar');
      }

      /**
       * @param {String} page
       * @param {Object} [options]
       * @param {Object} [options.animation]
       * @param {Object} [options.callback]
       */
    }, {
      key: 'loadPage',
      value: function loadPage(page, options) {
        options = options || {};
        options._removeElement = true;
        return this._loadPage(page, options);
      }

      /**
       * @param {String} page
       * @param {Object} [options]
       * @param {Object} [options.animation]
       * @param {Object} [options.callback]
       */
    }, {
      key: '_loadPage',
      value: function _loadPage(page, options) {
        var _this = this;

        OnsTabElement.prototype._createPageElement(page, function (pageElement) {
          _this._loadPageDOMAsync(pageElement, options);
        });
      }

      /**
       * @param {Element} pageElement
       * @param {Object} [options]
       * @param {Object} [options.animation]
       * @param {Object} [options.callback]
       */
    }, {
      key: '_loadPageDOMAsync',
      value: function _loadPageDOMAsync(pageElement, options) {
        var _this2 = this;

        options = options || {};

        window.OnsTabbarElement.rewritables.link(this, pageElement, function (pageElement) {
          _this2._contentElement.appendChild(pageElement);
          _this2._switchPage(pageElement, options);
        });
      }

      /**
       * @return {String}
       */
    }, {
      key: 'getTabbarId',
      value: function getTabbarId() {
        return this._tabbarId;
      }

      /**
       * @return {Element/null}
       */
    }, {
      key: '_getCurrentPageElement',
      value: function _getCurrentPageElement() {
        var pages = this._contentElement.children;
        var page = null;
        for (var i = 0; i < pages.length; i++) {
          if (pages[i].style.display !== 'none') {
            page = pages[i];
            break;
          }
        }

        if (page && page.nodeName.toLowerCase() !== 'ons-page') {
          throw new Error('Invalid state: page element must be a "ons-page" element.');
        }

        return page;
      }

      /**
       * @param {Element} element
       * @param {Object} options
       * @param {String} [options.animation]
       * @param {Function} [options.callback]
       * @param {Object} [options.animationOptions]
       * @param {Boolean} options._removeElement
       * @param {Number} options.selectedTabIndex
       * @param {Number} options.previousTabIndex
       */
    }, {
      key: '_switchPage',
      value: function _switchPage(element, options) {

        if (this.getActiveTabIndex() !== -1) {
          var oldPageElement = this._contentElement.children.length > 1 ? this._getCurrentPageElement() : ons._internal.nullElement;
          var animator = this._animatorFactory.newAnimator(options);

          animator.apply(element, oldPageElement, options.selectedTabIndex, options.previousTabIndex, function () {
            if (oldPageElement !== ons._internal.nullElement) {
              if (options._removeElement) {
                oldPageElement._destroy();
              } else {
                oldPageElement.style.display = 'none';
                oldPageElement._hide();
              }
            }

            element.style.display = 'block';
            element._show();

            if (options.callback instanceof Function) {
              options.callback();
            }
          });
        } else {
          if (options.callback instanceof Function) {
            options.callback();
          }
        }
      }

      /**
       * @param {Number} index
       * @param {Object} [options]
       * @param {Boolean} [options.keepPage]
       * @param {String} [options.animation]
       * @param {Object} [options.animationOptions]
       * @return {Boolean} success or not
       */
    }, {
      key: 'setActiveTab',
      value: function setActiveTab(index, options) {
        var _this3 = this;

        options = options || {};

        options.animationOptions = util.extend(options.animationOptions || {}, AnimatorFactory.parseAnimationOptionsString(this.getAttribute('animation-options')));

        var previousTab = this._getActiveTabElement(),
            selectedTab = this._getTabElement(index),
            previousTabIndex = this.getActiveTabIndex(),
            selectedTabIndex = index;

        if (!selectedTab) {
          return false;
        }

        if ((selectedTab.hasAttribute('no-reload') || selectedTab.isPersistent()) && index === previousTabIndex) {
          util.triggerElementEvent(this, 'reactive', {
            index: index,
            tabItem: selectedTab
          });

          return false;
        }

        var canceled = false;

        util.triggerElementEvent(this, 'prechange', {
          index: index,
          tabItem: selectedTab,
          cancel: function cancel() {
            return canceled = true;
          }
        });

        if (canceled) {
          selectedTab.setInactive();
          if (previousTab) {
            previousTab.setActive();
          }
          return false;
        }

        selectedTab.setActive();

        var needLoad = !selectedTab.isLoaded() && !options.keepPage;

        if (needLoad) {
          var removeElement = true;

          if (previousTab && previousTab.isPersistent()) {
            removeElement = false;
          }

          var params = {
            callback: function callback() {
              util.triggerElementEvent(_this3, 'postchange', {
                index: index,
                tabItem: selectedTab
              });

              if (options.callback instanceof Function) {
                options.callback();
              }
            },
            previousTabIndex: previousTabIndex,
            selectedTabIndex: selectedTabIndex,
            _removeElement: removeElement
          };

          if (options.animation) {
            params.animation = options.animation;
          }

          if (selectedTab.isPersistent()) {
            var link = function link(element, callback) {
              window.OnsTabbarElement.rewritables.link(_this3, element, callback);
            };
            selectedTab._loadPageElement(function (pageElement) {
              _this3._loadPersistentPageDOM(pageElement, params);
            }, link);
          } else {
            this._loadPage(selectedTab.getAttribute('page'), params);
          }
        }

        util.arrayFrom(this._getTabbarElement().children).forEach(function (tab) {
          if (tab != selectedTab) {
            tab.setInactive();
          } else {
            if (!needLoad) {
              util.triggerElementEvent(_this3, 'postchange', {
                index: index,
                tabItem: selectedTab
              });
            }
          }
        });

        return true;
      }

      /**
       * @param {Element} element
       * @param {Object} options
       * @param {Object} options.animation
       */
    }, {
      key: '_loadPersistentPageDOM',
      value: function _loadPersistentPageDOM(element, options) {
        options = options || {};

        if (!util.isAttached(element)) {
          this._contentElement.appendChild(element);
        }
        this._switchPage(element, options);
      }

      /**
       * @param {Boolean} visible
       */
    }, {
      key: 'setTabbarVisibility',
      value: function setTabbarVisibility(visible) {
        this._contentElement.style[this._hasTopTabbar() ? 'top' : 'bottom'] = visible ? '' : '0px';
        this._getTabbarElement().style.display = visible ? '' : 'none';
      }

      /**
       * @return {Number} When active tab is not found, returns -1.
       */
    }, {
      key: 'getActiveTabIndex',
      value: function getActiveTabIndex() {
        var tabs = this._getTabbarElement().children;

        for (var i = 0; i < tabs.length; i++) {
          if (tabs[i].nodeName.toLowerCase() === 'ons-tab' && tabs[i].isActive && tabs[i].isActive()) {
            return i;
          }
        }

        return -1;
      }

      /**
       * @return {Number} When active tab is not found, returns -1.
       */
    }, {
      key: '_getActiveTabElement',
      value: function _getActiveTabElement() {
        return this._getTabElement(this.getActiveTabIndex());
      }

      /**
       * @return {Element}
       */
    }, {
      key: '_getTabElement',
      value: function _getTabElement(index) {
        return this._getTabbarElement().children[index];
      }
    }, {
      key: 'detachedCallback',
      value: function detachedCallback() {}
    }, {
      key: 'attachedCallback',
      value: function attachedCallback() {}
    }, {
      key: '_show',
      value: function _show() {
        var currentPageElement = this._getCurrentPageElement();
        if (currentPageElement) {
          currentPageElement._show();
        }
      }
    }, {
      key: '_hide',
      value: function _hide() {
        var currentPageElement = this._getCurrentPageElement();
        if (currentPageElement) {
          currentPageElement._hide();
        }
      }
    }, {
      key: '_destroy',
      value: function _destroy() {
        var pages = this._contentElement.children;
        for (var i = pages.length - 1; i >= 0; i--) {
          pages[i]._destroy();
        }
        this.remove();
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'modifier') {
          return ModifierUtil.onModifierChanged(last, current, this, scheme);
        }
      }
    }]);

    return TabbarElement;
  })(ons._BaseElement);

  if (!window.OnsTabbarElement) {
    window.OnsTabbarElement = document.registerElement('ons-tabbar', {
      prototype: TabbarElement.prototype
    });

    window.OnsTabbarElement._animatorDict = {
      'default': TabbarNoneAnimator,
      'fade': TabbarFadeAnimator,
      'slide': TabbarSlideAnimator,
      'none': TabbarNoneAnimator
    };

    /**
     * @param {String} name
     * @param {Function} Animator
     */
    window.OnsTabbarElement.registerAnimator = function (name, Animator) {
      if (!(Animator.prototype instanceof TabbarAnimator)) {
        throw new Error('"Animator" param must inherit TabbarAnimator');
      }
      this._animatorDict[name] = Animator;
    };

    window.OnsTabbarElement.rewritables = {
      /**
       * @param {Element} tabbarElement
       * @param {Function} callback
       */
      ready: function ready(tabbarElement, callback) {
        callback();
      },

      /**
       * @param {Element} tabbarElement
       * @param {Element} target
       * @param {Function} callback
       */
      link: function link(tabbarElement, target, callback) {
        callback(target);
      }
    };
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var TemplateElement = (function (_ons$_BaseElement) {
    _inherits(TemplateElement, _ons$_BaseElement);

    function TemplateElement() {
      _classCallCheck(this, TemplateElement);

      _get(Object.getPrototypeOf(TemplateElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(TemplateElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this.template = this.innerHTML;

        while (this.firstChild) {
          this.removeChild(this.firstChild);
        }
      }
    }, {
      key: 'attachedCallback',
      value: function attachedCallback() {
        var event = new CustomEvent('_templateloaded', { bubbles: true, cancelable: true });
        event.template = this.template;
        event.templateId = this.getAttribute('id');

        this.dispatchEvent(event);
      }
    }]);

    return TemplateElement;
  })(ons._BaseElement);

  if (!window.OnsTemplateElement) {
    window.OnsTemplateElement = document.registerElement('ons-template', {
      prototype: TemplateElement.prototype
    });
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var scheme = { '': 'toolbar-button--*' };
  var ModifierUtil = ons._internal.ModifierUtil;

  var ToolbarButtonElement = (function (_ons$_BaseElement) {
    _inherits(ToolbarButtonElement, _ons$_BaseElement);

    function ToolbarButtonElement() {
      _classCallCheck(this, ToolbarButtonElement);

      _get(Object.getPrototypeOf(ToolbarButtonElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ToolbarButtonElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        this.classList.add('toolbar-button');
        this.classList.add('navigation-bar__line-height');

        ModifierUtil.initModifier(this, scheme);
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'modifier') {
          return ModifierUtil.onModifierChanged(last, current, this, scheme);
        }
      }
    }]);

    return ToolbarButtonElement;
  })(ons._BaseElement);

  if (!window.OnsToolbarButton) {
    window.OnsToolbarButton = document.registerElement('ons-toolbar-button', {
      prototype: ToolbarButtonElement.prototype
    });
  }
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var scheme = {
    '': 'navigation-bar--*',
    '.navigation-bar__left': 'navigation-bar--*__left',
    '.navigation-bar__center': 'navigation-bar--*__center',
    '.navigation-bar__right': 'navigation-bar--*__right'
  };
  var ModifierUtil = ons._internal.ModifierUtil;

  var ToolbarElement = (function (_ons$_BaseElement) {
    _inherits(ToolbarElement, _ons$_BaseElement);

    function ToolbarElement() {
      _classCallCheck(this, ToolbarElement);

      _get(Object.getPrototypeOf(ToolbarElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ToolbarElement, [{
      key: 'createdCallback',
      value: function createdCallback() {
        var _this = this;

        this._compile();
        ModifierUtil.initModifier(this, scheme);

        this._tryToEnsureNodePosition();
        setImmediate(function () {
          return _this._tryToEnsureNodePosition();
        });
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, last, current) {
        if (name === 'modifier') {
          return ModifierUtil.onModifierChanged(last, current, this, scheme);
        }
      }
    }, {
      key: 'attachedCallback',
      value: function attachedCallback() {
        var _this2 = this;

        this._tryToEnsureNodePosition();
        setImmediate(function () {
          return _this2._tryToEnsureNodePosition();
        });
      }
    }, {
      key: '_tryToEnsureNodePosition',
      value: function _tryToEnsureNodePosition() {
        if (!this.parentNode || this.hasAttribute('inline')) {
          return;
        }

        if (this.parentNode.nodeName.toLowerCase() !== 'ons-page') {
          var page = this;
          for (;;) {
            page = page.parentNode;

            if (!page) {
              return;
            }

            if (page.nodeName.toLowerCase() === 'ons-page') {
              break;
            }
          }
          page._registerToolbar(this);
        }
      }

      /**
       * @return {HTMLElement}
       */
    }, {
      key: '_getToolbarLeftItemsElement',
      value: function _getToolbarLeftItemsElement() {
        return this.querySelector('.left') || ons._internal.nullElement;
      }

      /**
       * @return {HTMLElement}
       */
    }, {
      key: '_getToolbarCenterItemsElement',
      value: function _getToolbarCenterItemsElement() {
        return this.querySelector('.center') || ons._internal.nullElement;
      }

      /**
       * @return {HTMLElement}
       */
    }, {
      key: '_getToolbarRightItemsElement',
      value: function _getToolbarRightItemsElement() {
        return this.querySelector('.right') || ons._internal.nullElement;
      }

      /**
       * @return {HTMLElement}
       */
    }, {
      key: '_getToolbarBackButtonLabelElement',
      value: function _getToolbarBackButtonLabelElement() {
        return this.querySelector('ons-back-button .back-button__label') || ons._internal.nullElement;
      }
    }, {
      key: '_compile',
      value: function _compile() {
        var shouldAppendAndroidModifier = ons.platform.isAndroid() && !this.hasAttribute('fixed-style');
        var inline = this.hasAttribute('inline');

        this.classList.add('navigation-bar');

        if (shouldAppendAndroidModifier) {
          this.classList.add('navigation-bar--android');
        }

        if (!inline) {
          this.style.position = 'absolute';
          this.style.zIndex = '10000';
          this.style.left = '0px';
          this.style.right = '0px';
          this.style.top = '0px';
        }

        this._ensureToolbarItemElements();
      }
    }, {
      key: '_ensureToolbarItemElements',
      value: function _ensureToolbarItemElements() {

        var hasCenterClassElementOnly = this.children.length === 1 && this.children[0].classList.contains('center');
        var center;

        for (var i = 0; i < this.childNodes.length; i++) {
          // case of not element
          if (this.childNodes[i].nodeType != 1) {
            this.removeChild(this.childNodes[i]);
          }
        }

        if (hasCenterClassElementOnly) {
          center = this._ensureToolbarItemContainer('center');
        } else {
          center = this._ensureToolbarItemContainer('center');
          var left = this._ensureToolbarItemContainer('left');
          var right = this._ensureToolbarItemContainer('right');

          if (this.children[0] !== left || this.children[1] !== center || this.children[2] !== right) {
            if (left.parentNode) {
              this.removeChild(left);
            }
            if (center.parentNode) {
              this.removeChild(center);
            }
            if (right.parentNode) {
              this.removeChild(right);
            }

            var fragment = document.createDocumentFragment();
            fragment.appendChild(left);
            fragment.appendChild(center);
            fragment.appendChild(right);

            this.appendChild(fragment);
          }
        }
        center.classList.add('navigation-bar__title');
      }
    }, {
      key: '_ensureToolbarItemContainer',
      value: function _ensureToolbarItemContainer(name) {
        var container = ons._util.findChild(this, '.' + name);

        if (!container) {
          container = document.createElement('div');
          container.classList.add(name);
        }

        if (container.innerHTML.trim() === '') {
          container.innerHTML = '&nbsp;';
        }

        container.classList.add('navigation-bar__' + name);
        return container;
      }
    }]);

    return ToolbarElement;
  })(ons._BaseElement);

  if (!window.OnsToolbarElement) {
    window.OnsToolbarElement = document.registerElement('ons-toolbar', {
      prototype: ToolbarElement.prototype
    });
  }
})();

(function(module) {
try { module = angular.module('templates-main'); }
catch(err) { module = angular.module('templates-main', []); }
module.run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/sliding_menu.tpl',
    '<div class="onsen-sliding-menu__menu ons-sliding-menu-inner"></div>\n' +
    '<div class="onsen-sliding-menu__main ons-sliding-menu-inner"></div>\n' +
    '');
}]);
})();

(function(module) {
try { module = angular.module('templates-main'); }
catch(err) { module = angular.module('templates-main', []); }
module.run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/split_view.tpl',
    '<div class="onsen-split-view__secondary full-screen ons-split-view-inner"></div>\n' +
    '<div class="onsen-split-view__main full-screen ons-split-view-inner"></div>\n' +
    '');
}]);
})();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * @ngdoc object
 * @name ons
 * @category util
 * @description
 *   [ja]Onsen UIで利用できるグローバルなオブジェクトです。このオブジェクトは、AngularJSのスコープから参照することができます。 [/ja]
 *   [en]A global object that's used in Onsen UI. This object can be reached from the AngularJS scope.[/en]
 */

/**
 * @ngdoc method
 * @signature ready(callback)
 * @description
 *   [ja]アプリの初期化に利用するメソッドです。渡された関数は、Onsen UIの初期化が終了している時点で必ず呼ばれます。[/ja]
 *   [en]Method used to wait for app initialization. The callback will not be executed until Onsen UI has been completely initialized.[/en]
 * @param {Function} callback
 *   [en]Function that executes after Onsen UI has been initialized.[/en]
 *   [ja]Onsen UIが初期化が完了した後に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature bootstrap([moduleName, [dependencies]])
 * @extensionOf angular
 * @description
 *   [ja]Onsen UIの初期化を行います。Angular.jsのng-app属性を利用すること無しにOnsen UIを読み込んで初期化してくれます。[/ja]
 *   [en]Initialize Onsen UI. Can be used to load Onsen UI without using the <code>ng-app</code> attribute from AngularJS.[/en]
 * @param {String} [moduleName]
 *   [en]AngularJS module name.[/en]
 *   [ja]Angular.jsでのモジュール名[/ja]
 * @param {Array} [dependencies]
 *   [en]List of AngularJS module dependencies.[/en]
 *   [ja]依存するAngular.jsのモジュール名の配列[/ja]
 * @return {Object}
 *   [en]An AngularJS module object.[/en]
 *   [ja]AngularJSのModuleオブジェクトを表します。[/ja]
 */

/**
 * @ngdoc method
 * @signature enableAutoStatusBarFill()
 * @description
 *   [en]Enable status bar fill feature on iOS7 and above.[/en]
 *   [ja]iOS7以上で、ステータスバー部分の高さを自動的に埋める処理を有効にします。[/ja]
 */

/**
 * @ngdoc method
 * @signature disableAutoStatusBarFill()
 * @description
 *   [en]Disable status bar fill feature on iOS7 and above.[/en]
 *   [ja]iOS7以上で、ステータスバー部分の高さを自動的に埋める処理を無効にします。[/ja]
 */

/**
 * @ngdoc method
 * @signature disableAnimations()
 * @description
 *   [en]Disable all animations. Could be handy for testing and older devices.[/en]
 *   [ja]アニメーションを全て無効にします。テストの際に便利です。[/ja]
 */

/**
 * @ngdoc method
 * @signature enableAnimations()
 * @description
 *   [en]Enable animations (default).[/en]
 *   [ja]アニメーションを有効にします。[/ja]
 */

/**
 * @ngdoc method
 * @signature findParentComponentUntil(name, [dom])
 * @extensionOf angular
 * @param {String} name
 *   [en]Name of component, i.e. 'ons-page'.[/en]
 *   [ja]コンポーネント名を指定します。例えばons-pageなどを指定します。[/ja]
 * @param {Object|jqLite|HTMLElement} [dom]
 *   [en]$event, jqLite or HTMLElement object.[/en]
 *   [ja]$eventオブジェクト、jqLiteオブジェクト、HTMLElementオブジェクトのいずれかを指定できます。[/ja]
 * @return {Object}
 *   [en]Component object. Will return null if no component was found.[/en]
 *   [ja]コンポーネントのオブジェクトを返します。もしコンポーネントが見つからなかった場合にはnullを返します。[/ja]
 * @description
 *   [en]Find parent component object of <code>dom</code> element.[/en]
 *   [ja]指定されたdom引数の親要素をたどってコンポーネントを検索します。[/ja]
 */

/**
 * @ngdoc method
 * @signature findComponent(selector, [dom])
 * @extensionOf angular
 * @param {String} selector
 *   [en]CSS selector[/en]
 *   [ja]CSSセレクターを指定します。[/ja]
 * @param {HTMLElement} [dom]
 *   [en]DOM element to search from.[/en]
 *   [ja]検索対象とするDOM要素を指定します。[/ja]
 * @return {Object}
 *   [en]Component object. Will return null if no component was found.[/en]
 *   [ja]コンポーネントのオブジェクトを返します。もしコンポーネントが見つからなかった場合にはnullを返します。[/ja]
 * @description
 *   [en]Find component object using CSS selector.[/en]
 *   [ja]CSSセレクタを使ってコンポーネントのオブジェクトを検索します。[/ja]
 */

/**
 * @ngdoc method
 * @signature setDefaultDeviceBackButtonListener(listener)
 * @param {Function} listener
 *   [en]Function that executes when device back button is pressed.[/en]
 *   [ja]デバイスのバックボタンが押された時に実行される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]Set default handler for device back button.[/en]
 *   [ja]デバイスのバックボタンのためのデフォルトのハンドラを設定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature disableDeviceBackButtonHandler()
 * @description
 * [en]Disable device back button event handler.[/en]
 * [ja]デバイスのバックボタンのイベントを受け付けないようにします。[/ja]
 */

/**
 * @ngdoc method
 * @signature enableDeviceBackButtonHandler()
 * @description
 * [en]Enable device back button event handler.[/en]
 * [ja]デバイスのバックボタンのイベントを受け付けるようにします。[/ja]
 */

/**
 * @ngdoc method
 * @signature isReady()
 * @return {Boolean}
 *   [en]Will be true if Onsen UI is initialized.[/en]
 *   [ja]初期化されているかどうかを返します。[/ja]
 * @description
 *   [en]Returns true if Onsen UI is initialized.[/en]
 *   [ja]Onsen UIがすでに初期化されているかどうかを返すメソッドです。[/ja]
 */

/**
 * @ngdoc method
 * @signature compile(dom)
 * @extensionOf angular
 * @param {HTMLElement} dom
 *   [en]Element to compile.[/en]
 *   [ja]コンパイルする要素を指定します。[/ja]
 * @description
 *   [en]Compile Onsen UI components.[/en]
 *   [ja]通常のHTMLの要素をOnsen UIのコンポーネントにコンパイルします。[/ja]
 */

/**
 * @ngdoc method
 * @signature isWebView()
 * @return {Boolean}
 *   [en]Will be true if the app is running in Cordova.[/en]
 *   [ja]Cordovaで実行されている場合にtrueになります。[/ja]
 * @description
 *   [en]Returns true if running inside Cordova.[/en]
 *   [ja]Cordovaで実行されているかどうかを返すメソッドです。[/ja]
 */

/**
 * @ngdoc method
 * @signature createAlertDialog(page, [options])
 * @param {String} page
 *   [en]Page name. Can be either an HTML file or an <ons-template> containing a <ons-alert-dialog> component.[/en]
 *   [ja]pageのURLか、もしくはons-templateで宣言したテンプレートのid属性の値を指定できます。[/ja]
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {Object} [options.parentScope]
 *   [en]Parent scope of the dialog. Used to bind models and access scope methods from the dialog.[/en]
 *   [ja]ダイアログ内で利用する親スコープを指定します。ダイアログからモデルやスコープのメソッドにアクセスするのに使います。このパラメータはAngularJSバインディングでのみ利用できます。[/ja]
 * @return {Promise}
 *   [en]Promise object that resolves to the alert dialog component object.[/en]
 *   [ja]ダイアログのコンポーネントオブジェクトを解決するPromiseオブジェクトを返します。[/ja]
 * @description
 *   [en]Create a alert dialog instance from a template.[/en]
 *   [ja]テンプレートからアラートダイアログのインスタンスを生成します。[/ja]
 */

/**
 * @ngdoc method
 * @signature createDialog(page, [options])
 * @param {String} page
 *   [en]Page name. Can be either an HTML file or an <ons-template> containing a <ons-dialog> component.[/en]
 *   [ja]pageのURLか、もしくはons-templateで宣言したテンプレートのid属性の値を指定できます。[/ja]
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {Object} [options.parentScope]
 *   [en]Parent scope of the dialog. Used to bind models and access scope methods from the dialog.[/en]
 *   [ja]ダイアログ内で利用する親スコープを指定します。ダイアログからモデルやスコープのメソッドにアクセスするのに使います。このパラメータはAngularJSバインディングでのみ利用できます。[/ja]
 * @return {Promise}
 *   [en]Promise object that resolves to the dialog component object.[/en]
 *   [ja]ダイアログのコンポーネントオブジェクトを解決するPromiseオブジェクトを返します。[/ja]
 * @description
 *   [en]Create a dialog instance from a template.[/en]
 *   [ja]テンプレートからダイアログのインスタンスを生成します。[/ja]
 */

/**
 * @ngdoc method
 * @signature createPopover(page, [options])
 * @param {String} page
 *   [en]Page name. Can be either an HTML file or an <ons-template> containing a <ons-dialog> component.[/en]
 *   [ja]pageのURLか、もしくはons-templateで宣言したテンプレートのid属性の値を指定できます。[/ja]
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {Object} [options.parentScope]
 *   [en]Parent scope of the dialog. Used to bind models and access scope methods from the dialog.[/en]
 *   [ja]ダイアログ内で利用する親スコープを指定します。ダイアログからモデルやスコープのメソッドにアクセスするのに使います。このパラメータはAngularJSバインディングでのみ利用できます。[/ja]
 * @return {Promise}
 *   [en]Promise object that resolves to the popover component object.[/en]
 *   [ja]ポップオーバーのコンポーネントオブジェクトを解決するPromiseオブジェクトを返します。[/ja]
 * @description
 *   [en]Create a popover instance from a template.[/en]
 *   [ja]テンプレートからポップオーバーのインスタンスを生成します。[/ja]
 */

/**
 * @ngdoc method
 * @signature resolveLoadingPlaceholder(page)
 * @param {String} page
 *   [en]Page name. Can be either an HTML file or an <ons-template> element.[/en]
 *   [ja]pageのURLか、もしくはons-templateで宣言したテンプレートのid属性の値を指定できます。[/ja]
 * @description
 *   [en]If no page is defined for the `ons-loading-placeholder` attribute it will wait for this method being called before loading the page.[/en]
 *   [ja]ons-loading-placeholderの属性値としてページが指定されていない場合は、ページロード前に呼ばれるons.resolveLoadingPlaceholder処理が行われるまで表示されません。[/ja]
 */

(function(ons){
  'use strict';

  var module = angular.module('onsen', ['templates-main']);
  angular.module('onsen.directives', ['onsen']); // for BC

  // JS Global facade for Onsen UI.
  initOnsenFacade();
  waitOnsenUILoad();
  initAngularModule();

  function waitOnsenUILoad() {
    var unlockOnsenUI = ons._readyLock.lock();
    module.run(['$compile', '$rootScope', function($compile, $rootScope) {
      // for initialization hook.
      if (document.readyState === 'loading' || document.readyState == 'uninitialized') {
        window.addEventListener('DOMContentLoaded', function() {
          document.body.appendChild(document.createElement('ons-dummy-for-init'));
        });
      } else if (document.body) {
        document.body.appendChild(document.createElement('ons-dummy-for-init'));
      } else {
        throw new Error('Invalid initialization state.');
      }

      $rootScope.$on('$ons-ready', unlockOnsenUI);
    }]);
  }

  function initAngularModule() {
    module.value('$onsGlobal', ons);
    module.run(['$compile', '$rootScope', '$onsen', '$q', function($compile, $rootScope, $onsen, $q) {
      ons._onsenService = $onsen;
      ons._qService = $q;

      $rootScope.ons = window.ons;
      $rootScope.console = window.console;
      $rootScope.alert = window.alert;

      ons.$compile = $compile;
    }]);
  }

  function initOnsenFacade() {
    ons._onsenService = null;

    // Object to attach component variables to when using the var="..." attribute.
    // Can be set to null to avoid polluting the global scope.
    ons.componentBase = window;

    /**
     * Bootstrap this document as a Onsen UI application.
     *
     * @param {String} [name] optional name
     * @param {Array} [deps] optional dependency modules
     */
    ons.bootstrap = function(name, deps) {
      if (angular.isArray(name)) {
        deps = name;
        name = undefined;
      }

      if (!name) {
        name = 'myOnsenApp';
      }

      deps = ['onsen'].concat(angular.isArray(deps) ? deps : []);
      var module = angular.module(name, deps);

      var doc = window.document;
      if (doc.readyState == 'loading' || doc.readyState == 'uninitialized' || doc.readyState == 'interactive') {
        doc.addEventListener('DOMContentLoaded', function() {
          angular.bootstrap(doc.documentElement, [name]);
        }, false);
      } else if (doc.documentElement) {
        angular.bootstrap(doc.documentElement, [name]);
      } else {
        throw new Error('Invalid state');
      }

      return module;
    };

    /**
     * @param {String} [name]
     * @param {Object/jqLite/HTMLElement} dom $event object or jqLite object or HTMLElement object.
     * @return {Object}
     */
    ons.findParentComponentUntil = function(name, dom) {
      var element;
      if (dom instanceof HTMLElement) {
        element = angular.element(dom);
      } else if (dom instanceof angular.element) {
        element = dom;
      } else if (dom.target) {
        element = angular.element(dom.target);
      }

      return element.inheritedData(name);
    };

    /**
     * Find view object correspond dom element queried by CSS selector.
     *
     * @param {String} selector CSS selector
     * @param {HTMLElement} [dom]
     * @return {Object/void}
     */
    ons.findComponent = function(selector, dom) {
      var target = (dom ? dom : document).querySelector(selector);
      return target ? angular.element(target).data(target.nodeName.toLowerCase()) || null : null;
    };

    /**
     * @param {HTMLElement} dom
     */
    ons.compile = function(dom) {
      if (!ons.$compile) {
        throw new Error('ons.$compile() is not ready. Wait for initialization with ons.ready().');
      }

      if (!(dom instanceof HTMLElement)) {
        throw new Error('First argument must be an instance of HTMLElement.');
      }

      var scope = angular.element(dom).scope();
      if (!scope) {
        throw new Error('AngularJS Scope is null. Argument DOM element must be attached in DOM document.');
      }

      ons.$compile(dom)(scope);
    };

    ons._getOnsenService = function() {
      if (!this._onsenService) {
        throw new Error('$onsen is not loaded, wait for ons.ready().');
      }

      return this._onsenService;
    };

    /**
     * @param {String} elementName
     * @param {Function} lastReady
     * @return {Function}
     */
    ons._waitDiretiveInit = function(elementName, lastReady) {
      return function(element, callback) {
        if (angular.element(element).data(elementName)) {
          lastReady(element, callback);
        } else {
          var listen = function() {
            lastReady(element, callback);
            element.removeEventListener(elementName + ':init', listen, false);
          };
          element.addEventListener(elementName + ':init', listen, false);
        }
      };
    };

    /**
     * @param {String} page
     * @param {Object} [options]
     * @param {Object} [options.parentScope]
     * @return {Promise}
     */
    ons.createAlertDialog = function(page, options) {
      options = options || {};

      options.link = function(element) {
        if (options.parentScope) {
          ons.$compile(angular.element(element))(options.parentScope.$new());
        } else {
          ons.compile(element);
        }
      };

      return ons._createAlertDialogOriginal(page, options).then(function(alertDialog) {
        return angular.element(alertDialog).data('ons-alert-dialog');
      });
    };

    /**
     * @param {String} page
     * @param {Object} [options]
     * @param {Object} [options.parentScope]
     * @return {Promise}
     */
    ons.createDialog = function(page, options) {
      options = options || {};

      options.link = function(element) {
        if (options.parentScope) {
          ons.$compile(angular.element(element))(options.parentScope.$new());
        } else {
          ons.compile(element);
        }
      };

      return ons._createDialogOriginal(page, options).then(function(dialog) {
        return angular.element(dialog).data('ons-dialog');
      });
    };

    /**
     * @param {String} page
     * @param {Object} [options]
     * @param {Object} [options.parentScope]
     * @return {Promise}
     */
    ons.createPopover = function(page, options) {
      options = options || {};

      options.link = function(element) {
        if (options.parentScope) {
          ons.$compile(angular.element(element))(options.parentScope.$new());
        } else {
          ons.compile(element);
        }
      };

      return ons._createPopoverOriginal(page, options).then(function(popover) {
        return angular.element(popover).data('ons-popover');
      });
    };

    /**
     * @param {String} page
     */
    ons.resolveLoadingPlaceholder = function(page) {
      return ons._resolveLoadingPlaceholderOriginal(page, function(element, done) {
        ons.compile(element);
        angular.element(element).scope().$evalAsync(function() {
          setImmediate(done);
        });
      });
    };

    ons._setupLoadingPlaceHolders = function() {
      // Do nothing
    };
  }

})(window.ons = window.ons || {});

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

(function() {
  'use strict';

  var module = angular.module('onsen');

  module.factory('AlertDialogView', ['$onsen', function($onsen) {

    var AlertDialogView = Class.extend({

      /**
       * @param {Object} scope
       * @param {jqLite} element
       * @param {Object} attrs
       */
      init: function(scope, element, attrs) {
        this._scope = scope;
        this._element = element;
        this._attrs = attrs;

        this._clearDerivingMethods = $onsen.deriveMethods(this, this._element[0], [
          'getDeviceBackButtonHandler',
          'show',
          'hide',
          'isShown',
          'destroy',
          'setDisabled',
          'isDisabled',
          'setCancelable',
          'isCancelable'
        ]);

        this._clearDerivingEvents = $onsen.deriveEvents(this, this._element[0], [
          'preshow',
          'postshow',
          'prehide',
          'posthide',
          'cancel'
        ], function(detail) {
          if (detail.alertDialog) {
            detail.alertDialog = this;
          }
          return detail;
        }.bind(this));

        this._scope.$on('$destroy', this._destroy.bind(this));
      },

      _destroy: function() {
        this.emit('destroy');

        this._element.remove();

        this._clearDerivingMethods();
        this._clearDerivingEvents();

        this._scope = this._attrs = this._element = null;
      }

    });

    MicroEvent.mixin(AlertDialogView);

    return AlertDialogView;
  }]);
})();


/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

angular.module('onsen')
  .value('AlertDialogAnimator', ons._internal.AlertDialogAnimator)
  .value('AndroidAlertDialogAnimator', ons._internal.AndroidAlertDialogAnimator)
  .value('IOSAlertDialogAnimator', ons._internal.IOSAlertDialogAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

angular.module('onsen').value('AnimationChooser', ons._internal.AnimatorFactory);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

(function() {
  'use strict';

  var module = angular.module('onsen');

  module.factory('CarouselView', ['$onsen', function($onsen) {

    /**
     * @class CarouselView
     */
    var CarouselView = Class.extend({

      /**
       * @param {Object} scope
       * @param {jqLite} element
       * @param {Object} attrs
       */
      init: function(scope, element, attrs) {
        this._element = element;
        this._scope = scope;
        this._attrs = attrs;

        this._scope.$on('$destroy', this._destroy.bind(this));

        this._clearDerivingMethods = $onsen.deriveMethods(this, element[0], [
          'setSwipeable',
          'isSwipeable',
          'setAutoScrollRatio',
          'getAutoScrollRatio',
          'setActiveCarouselItemIndex',
          'getActiveCarouselItemIndex',
          'next',
          'prev',
          'setAutoScrollEnabled',
          'isAutoScrollEnabled',
          'setDisabled',
          'isDisabled',
          'setOverscrollable',
          'isOverscrollable',
          'refresh',
          'first',
          'last'
        ]);

        this._clearDerivingEvents = $onsen.deriveEvents(this, element[0], ['refresh', 'postchange', 'overscroll'], function(detail) {
          if (detail.carousel) {
            detail.carousel = this;
          }
          return detail;
        }.bind(this));
      },

      _destroy: function() {
        this.emit('destroy');

        this._clearDerivingEvents();
        this._clearDerivingMethods();

        this._element = this._scope = this._attrs = null;
      }
    });

    MicroEvent.mixin(CarouselView);

    return CarouselView;
  }]);
})();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

(function() {
  'use strict';

  var module = angular.module('onsen');

  module.factory('DialogView', ['$onsen', function($onsen) {

    var DialogView = Class.extend({

      init: function(scope, element, attrs) {
        this._scope = scope;
        this._element = element;
        this._attrs = attrs;

        this._clearDerivingMethods = $onsen.deriveMethods(this, this._element[0], [
          'getDeviceBackButtonHandler',
          'show',
          'hide',
          'isShown',
          'destroy'
        ]);

        this._clearDerivingEvents = $onsen.deriveEvents(this, this._element[0], [
          'preshow',
          'postshow',
          'prehide',
          'posthide',
          'cancel'
        ], function(detail) {
          if (detail.dialog) {
            detail.dialog = this;
          }
          return detail;
        }.bind(this));

        this._scope.$on('$destroy', this._destroy.bind(this));
      },

      _destroy: function() {
        this.emit('destroy');

        this._element.remove();
        this._clearDerivingMethods();
        this._clearDerivingEvents();

        this._scope = this._attrs = this._element = null;
      }
    });

    DialogView.registerAnimator = function(name, Animator) {
      return window.OnsDialogElement.registerAnimator(name, Animator);
    };

    MicroEvent.mixin(DialogView);

    return DialogView;
  }]);
})();

/*
Copyright 2013-2015 ASIAL CORPORATION

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

angular.module('onsen')
  .value('DialogAnimator', ons._internal.DialogAnimator)
  .value('IOSDialogAnimator', ons._internal.IOSDialogAnimator)
  .value('AndroidDialogAnimator', ons._internal.AndroidDialogAnimator)
  .value('SlideDialogAnimator', ons._internal.SlideDialogAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

(function(){
  'use strict';

  angular.module('onsen').factory('GenericView', ['$onsen', function($onsen) {

    var GenericView = Class.extend({

      /**
       * @param {Object} scope
       * @param {jqLite} element
       * @param {Object} attrs
       * @param {Object} [options]
       * @param {Boolean} [options.directiveOnly]
       * @param {Function} [options.onDestroy]
       * @param {String} [options.modifierTemplate]
       */
      init: function(scope, element, attrs, options) {
        var self = this;
        options = {};

        this._element = element;
        this._scope = scope;
        this._attrs = attrs;

        if (options.directiveOnly) {
          if (!options.modifierTemplate) {
            throw new Error('options.modifierTemplate is undefined.');
          }
          $onsen.addModifierMethods(this, options.modifierTemplate, element);
        } else {
          $onsen.addModifierMethodsForCustomElements(this, element);
        }

        $onsen.cleaner.onDestroy(scope, function() {
          self._events = undefined;
          $onsen.removeModifierMethods(self);

          if (options.onDestroy) {
            options.onDestroy(self);
          }

          $onsen.clearComponent({
            scope: scope,
            attrs: attrs,
            element: element
          });

          self = element = self._element = self._scope = scope = self._attrs = attrs = options = null;
        });
      }
    });

    /**
     * @param {Object} scope
     * @param {jqLite} element
     * @param {Object} attrs
     * @param {Object} options
     * @param {String} options.viewKey
     * @param {Boolean} [options.directiveOnly]
     * @param {Function} [options.onDestroy]
     * @param {String} [options.modifierTemplate]
     */
    GenericView.register = function(scope, element, attrs, options) {
      var view = new GenericView(scope, element, attrs, options);

      if (!options.viewKey) {
        throw new Error('options.viewKey is required.');
      }

      $onsen.declareVarAttribute(attrs, view);
      element.data(options.viewKey, view);

      var destroy = options.onDestroy || angular.noop;
      options.onDestroy = function(view) {
        destroy(view);
        element.data(options.viewKey, null);
      };

      return view;
    };

    MicroEvent.mixin(GenericView);

    return GenericView;
  }]);
})();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

(function(){
  'use strict';
  var module = angular.module('onsen');

  module.factory('LazyRepeatView', ['AngularLazyRepeatDelegate', function(AngularLazyRepeatDelegate) {

    var LazyRepeatView = Class.extend({

      /**
       * @param {Object} scope
       * @param {jqLite} element
       * @param {Object} attrs
       */
      init: function(scope, element, attrs, linker) {
        this._element = element;
        this._scope = scope;
        this._attrs = attrs;
        this._linker = linker;

        var userDelegate = this._getDelegate();
        var internalDelegate = new AngularLazyRepeatDelegate(element[0], userDelegate, element.scope());

        this._provider = new ons._internal.LazyRepeatProvider(element[0].parentNode, element[0], internalDelegate);
        element.remove();

        // Render when number of items change.
        this._scope.$watch(internalDelegate.countItems.bind(internalDelegate), this._provider._onChange.bind(this._provider));

        this._scope.$on('$destroy', this._destroy.bind(this));
      },

      _getDelegate: function() {
        var delegate = this._scope.$eval(this._attrs.onsLazyRepeat);

        if (typeof delegate === 'undefined') {
          /*jshint evil:true */
          delegate = eval(this._attrs.onsLazyRepeat);
        }

        return delegate;
      },

      _destroy: function() {
        this._element = this._scope = this._attrs = this._linker = null;
      }
    });

    return LazyRepeatView;
  }]);
})();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

(function(){
  'use strict';

  angular.module('onsen').factory('AngularLazyRepeatDelegate', ['$compile', function($compile) {

    var AngularLazyRepeatDelegate = function() {
      AngularLazyRepeatDelegate.prototype.init.apply(this, arguments);
    };
    AngularLazyRepeatDelegate.prototype = Object.create(ons._internal.LazyRepeatDelegate.prototype);

    angular.extend(AngularLazyRepeatDelegate.prototype, {

      /**
       * @param {Element} templateElement
       * @param {Object} userDelegate
       * @param {Scope} parentScope
       */
      init: function(templateElement, userDelegate, parentScope) {
        this._templateElement = templateElement.cloneNode(true);
        this._userDelegate = userDelegate;
        this._parentScope = parentScope;

        this._removeLazyRepeatDirective();

        this._linker = $compile(this._templateElement.cloneNode(true));
      },

      /**
       * @return {Boolean}
       */
      _usingBinding: function() {
        if (this._userDelegate.configureItemScope) {
          return true;
        }

        if (this._userDelegate.createItemContent) {
          return false;
        }

        throw new Error('`lazy-repeat` delegate object is vague.');
      },

      _removeLazyRepeatDirective: function() {
        this._templateElement.removeAttribute('ons-lazy-repeat');
        this._templateElement.removeAttribute('ons:lazy:repeat');
        this._templateElement.removeAttribute('ons_lazy_repeat');
        this._templateElement.removeAttribute('data-ons-lazy-repeat');
        this._templateElement.removeAttribute('x-ons-lazy-repeat');
      },

      prepareItem: function(index, done) {
        var scope = this._parentScope.$new();
        this._addSpecialProperties(index, scope);

        if (this._usingBinding()) {
          this._userDelegate.configureItemScope(index, scope);
        }

        this._linker(scope, function(cloned) {
          cloned[0].style.display = 'none';

          if (!this._usingBinding()) {
            var contentElement = this._userDelegate.createItemContent(index, null);
            cloned.append(contentElement);
            $compile(cloned[0].firstChild)(scope);
          }

          done({
            element: cloned[0],
            scope: scope
          });

          scope.$evalAsync(function() {
            cloned[0].style.display = 'block';
          });

        }.bind(this));
      },

      /**
       * @param {Number} index
       * @param {Object} scope
       */
      _addSpecialProperties: function(index, scope) {
        scope.$index = index;
        scope.$first = index === 0;
        scope.$last = index === this.countItems() - 1;
        scope.$middle = !scope.$first && !scope.$last;
        scope.$even = index % 2 === 0;
        scope.$odd = !scope.$even;
      },

      countItems: function() {
        return this._userDelegate.countItems();
      },

      updateItem: function(index, item) {
        if (this._usingBinding()) {
          item.scope.$evalAsync(function() {
            this._userDelegate.configureItemScope(index, item.scope);
          }.bind(this));
        }
      },

      /**
       * @param {Number} index
       * @param {Object} item
       * @param {Object} item.scope
       * @param {Element} item.element
       */
      destroyItem: function(index, item) {
        if (this._usingBinding()) {
          if (this._userDelegate.destroyItemScope instanceof Function) {
            this._userDelegate.destroyItemScope(index, item.scope);
          }
        } else {
          if (this._userDelegate.destroyItemContent instanceof Function) {
            this._userDelegate.destroyItemContent(index, item.element);
          }
        }
        item.scope.$destroy();
      },

      destroy: function() {
        this._userDelegate = this._templateElement = this._scope = null;
      },

      calculateItemHeight: function(index) {
        return this._userDelegate.calculateItemHeight(index);
      }
    });

    return AngularLazyRepeatDelegate;
  }]);
})();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

(function() {
  'use strict';

  var module = angular.module('onsen');

  module.value('ModalAnimator', ons._internal.ModalAnimator);
  module.value('FadeModalAnimator', ons._internal.FadeModalAnimator);

  module.factory('ModalView', ['$onsen', '$parse', function($onsen, $parse) {

    var ModalView = Class.extend({
      _element: undefined,
      _scope: undefined,

      init: function(scope, element, attrs) {
        this._scope = scope;
        this._element = element;
        this._scope.$on('$destroy', this._destroy.bind(this));

        element[0]._animatorFactory.setAnimationOptions($parse(attrs.animationOptions)());
      },

      getDeviceBackButtonHandler: function() {
        return this._element[0].getDeviceBackButtonHandler();
      },

      setDeviceBackButtonHandler: function(callback) {
        this._element[0].setDeviceBackButtonHandler(callback);
      },

      show: function(options) {
        return this._element[0].show(options);
      },

      hide: function(options) {
        return this._element[0].hide(options);
      },

      toggle: function(options) {
        return this._element[0].toggle(options);
      },

      _destroy: function() {
        this.emit('destroy', {page: this});

        this._events = this._element = this._scope = null;
      }
    });

    ModalView.registerAnimator = function(name, Animator) {
      return window.OnsModalElement.registerAnimator(name, Animator);
    };

    MicroEvent.mixin(ModalView);

    return ModalView;
  }]);

})();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

(function() {
  'use strict';

  var module = angular.module('onsen');

  module.factory('NavigatorView', ['$http', '$parse', '$compile', '$onsen', '$timeout', 'AnimationChooser', 'SimpleSlideTransitionAnimator', 'NavigatorTransitionAnimator', 'LiftTransitionAnimator', 'NullTransitionAnimator', 'IOSSlideTransitionAnimator', 'FadeTransitionAnimator', function($http, $parse, $compile, $onsen, $timeout, AnimationChooser,
    SimpleSlideTransitionAnimator, NavigatorTransitionAnimator, LiftTransitionAnimator,
    NullTransitionAnimator, IOSSlideTransitionAnimator, FadeTransitionAnimator) {

    /**
     * Manages the page navigation backed by page stack.
     *
     * @class NavigatorView
     */
    var NavigatorView = Class.extend({

      /**
       * @member {jqLite} Object
       */
      _element: undefined,

      /**
       * @member {Object} Object
       */
      _attrs: undefined,

      /**
       * @member {Object}
       */
      _scope: undefined,

      /**
       * @param {Object} scope
       * @param {jqLite} element jqLite Object to manage with navigator
       * @param {Object} attrs
       */
      init: function(scope, element, attrs) {

        this._element = element || angular.element(window.document.body);
        this._scope = scope || this._element.scope();
        this._attrs = attrs;
        this._previousPageScope = null;

        this._boundOnPrepop = this._onPrepop.bind(this);
        this._boundOnPostpop = this._onPostpop.bind(this);
        this._element.on('prepop', this._boundOnPrepop);
        this._element.on('postpop', this._boundOnPostpop);

        this._scope.$on('$destroy', this._destroy.bind(this));

        this._clearDerivingEvents = $onsen.deriveEvents(this, element[0], [
          'prepush', 'postpush', 'prepop',
          'postpop', 'init', 'show', 'hide', 'destroy'
        ], function(detail) {
          if (detail.navigator) {
            detail.navigator = this;
          }
          return detail;
        }.bind(this));

        this._clearDerivingMethods = $onsen.deriveMethods(this, element[0], [
          'insertPage',
          'pushPage',
          'bringPageTop',
          'getDeviceBackButtonHandler',
          'popPage',
          'replacePage',
          'resetToPage',
          'getCurrentPage',
          'canPopPage'
        ]);
      },

      _onPrepop: function(event) {
        var pages = event.detail.navigator.pages;
        angular.element(pages[pages.length - 2].element).scope().$evalAsync();

        this._previousPageScope = angular.element(pages[pages.length - 1].element).scope();
      },

      _onPostpop: function(event) {
        this._previousPageScope.$destroy();
        this._previoousPageScope = null;
      },

      _compileAndLink: function(pageElement, callback) {
        var link = $compile(pageElement);
        var pageScope = this._createPageScope();
        link(pageScope);

        pageScope.$evalAsync(function() {
          callback(pageElement);
        });
      },

      _destroy: function() {
        this.emit('destroy');
        this._clearDerivingEvents();
        this._clearDerivingMethods();
        this._element.off('prepop', this._boundOnPrepop);
        this._element.off('postpop', this._boundOnPostpop);
        this._element = this._scope = this._attrs = null;
      },

      _createPageScope: function() {
         return this._scope.$new();
      },

      /**
       * Retrieve the entire page stages of the navigator.
       *
       * @return {Array}
       */
      getPages: function() {
        return this._element[0].pages;
      }
    });

    MicroEvent.mixin(NavigatorView);

    Object.defineProperty(NavigatorView.prototype, 'pages', {
      get: function () {
        return this.getPages();
      },
      set: function() {
        throw new Error();
      }
    });

    return NavigatorView;
  }]);
})();

/*
Copyright 2013-2015 ASIAL CORPORATION

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

angular.module('onsen')
  .value('NavigatorTransitionAnimator', ons._internal.NavigatorTransitionAnimator)
  .value('FadeTransitionAnimator', ons._internal.FadeNavigatorTransitionAnimator)
  .value('IOSSlideTransitionAnimator', ons._internal.IOSSlideNavigatorTransitionAnimator)
  .value('LiftTransitionAnimator', ons._internal.LiftNavigatorTransitionAnimator)
  .value('NullTransitionAnimator', ons._internal.NavigatorTransitionAnimator)
  .value('SimpleSlideTransitionAnimator', ons._internal.SimpleSlideNavigatorTransitionAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

(function() {
  'use strict';
  var module = angular.module('onsen');

  module.factory('OverlaySlidingMenuAnimator', ['SlidingMenuAnimator', function(SlidingMenuAnimator) {

    var OverlaySlidingMenuAnimator = SlidingMenuAnimator.extend({

      _blackMask: undefined,

      _isRight: false,
      _element: false,
      _menuPage: false,
      _mainPage: false,
      _width: false,

      /**
       * @param {jqLite} element "ons-sliding-menu" or "ons-split-view" element
       * @param {jqLite} mainPage
       * @param {jqLite} menuPage
       * @param {Object} options
       * @param {String} options.width "width" style value
       * @param {Boolean} options.isRight
       */
      setup: function(element, mainPage, menuPage, options) {
        options = options || {};
        this._width = options.width || '90%';
        this._isRight = !!options.isRight;
        this._element = element;
        this._mainPage = mainPage;
        this._menuPage = menuPage;

        menuPage.css('box-shadow', '0px 0 10px 0px rgba(0, 0, 0, 0.2)');
        menuPage.css({
          width: options.width,
          display: 'none',
          zIndex: 2
        });

        // Fix for transparent menu page on iOS8.
        menuPage.css('-webkit-transform', 'translate3d(0px, 0px, 0px)');

        mainPage.css({zIndex: 1});

        if (this._isRight) {
          menuPage.css({
            right: '-' + options.width,
            left: 'auto'
          });
        } else {
          menuPage.css({
            right: 'auto',
            left: '-' + options.width
          });
        }

        this._blackMask = angular.element('<div></div>').css({
          backgroundColor: 'black',
          top: '0px',
          left: '0px',
          right: '0px',
          bottom: '0px',
          position: 'absolute',
          display: 'none',
          zIndex: 0
        });

        element.prepend(this._blackMask);
      },

      /**
       * @param {Object} options
       * @param {String} options.width
       */
      onResized: function(options) {
        this._menuPage.css('width', options.width);

        if (this._isRight) {
          this._menuPage.css({
            right: '-' + options.width,
            left: 'auto'
          });
        } else {
          this._menuPage.css({
            right: 'auto',
            left: '-' + options.width
          });
        }

        if (options.isOpened) {
          var max = this._menuPage[0].clientWidth;
          var menuStyle = this._generateMenuPageStyle(max);
          animit(this._menuPage[0]).queue(menuStyle).play();
        }
      },

      /**
       */
      destroy: function() {
        if (this._blackMask) {
          this._blackMask.remove();
          this._blackMask = null;
        }

        this._mainPage.removeAttr('style');
        this._menuPage.removeAttr('style');

        this._element = this._mainPage = this._menuPage = null;
      },

      /**
       * @param {Function} callback
       * @param {Boolean} instant
       */
      openMenu: function(callback, instant) {
        var duration = instant === true ? 0.0 : this.duration;
        var delay = instant === true ? 0.0 : this.delay;

        this._menuPage.css('display', 'block');
        this._blackMask.css('display', 'block');

        var max = this._menuPage[0].clientWidth;
        var menuStyle = this._generateMenuPageStyle(max);
        var mainPageStyle = this._generateMainPageStyle(max);

        setTimeout(function() {

          animit(this._mainPage[0])
            .wait(delay)
            .queue(mainPageStyle, {
              duration: duration,
              timing: this.timing
            })
            .queue(function(done) {
              callback();
              done();
            })
            .play();

          animit(this._menuPage[0])
            .wait(delay)
            .queue(menuStyle, {
              duration: duration,
              timing: this.timing
            })
            .play();

        }.bind(this), 1000 / 60);
      },

      /**
       * @param {Function} callback
       * @param {Boolean} instant
       */
      closeMenu: function(callback, instant) {
        var duration = instant === true ? 0.0 : this.duration;
        var delay = instant === true ? 0.0 : this.delay;

        this._blackMask.css({display: 'block'});

        var menuPageStyle = this._generateMenuPageStyle(0);
        var mainPageStyle = this._generateMainPageStyle(0);

        setTimeout(function() {

          animit(this._mainPage[0])
            .wait(delay)
            .queue(mainPageStyle, {
              duration: duration,
              timing: this.timing
            })
            .queue(function(done) {
              this._menuPage.css('display', 'none');
              callback();
              done();
            }.bind(this))
            .play();

          animit(this._menuPage[0])
            .wait(delay)
            .queue(menuPageStyle, {
              duration: duration,
              timing: this.timing
            })
            .play();

        }.bind(this), 1000 / 60);
      },

      /**
       * @param {Object} options
       * @param {Number} options.distance
       * @param {Number} options.maxDistance
       */
      translateMenu: function(options) {

        this._menuPage.css('display', 'block');
        this._blackMask.css({display: 'block'});

        var menuPageStyle = this._generateMenuPageStyle(Math.min(options.maxDistance, options.distance));
        var mainPageStyle = this._generateMainPageStyle(Math.min(options.maxDistance, options.distance));
        delete mainPageStyle.opacity;

        animit(this._menuPage[0])
          .queue(menuPageStyle)
          .play();

        if (Object.keys(mainPageStyle).length > 0) {
          animit(this._mainPage[0])
            .queue(mainPageStyle)
            .play();
        }
      },

      _generateMenuPageStyle: function(distance) {
        var x = this._isRight ? -distance : distance;
        var transform = 'translate3d(' + x + 'px, 0, 0)';

        return {
          transform: transform,
          'box-shadow': distance === 0 ? 'none' : '0px 0 10px 0px rgba(0, 0, 0, 0.2)'
        };
      },

      _generateMainPageStyle: function(distance) {
        var max = this._menuPage[0].clientWidth;
        var opacity = 1 - (0.1 * distance / max);

        return {
          opacity: opacity
        };
      },

      copy: function() {
        return new OverlaySlidingMenuAnimator();
      }
    });

    return OverlaySlidingMenuAnimator;
  }]);

})();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

(function() {
  'use strict';

  var module = angular.module('onsen');

  module.factory('PageView', ['$onsen', '$parse', function($onsen, $parse) {

    var PageView = Class.extend({
      _nullElement : window.document.createElement('div'),

      init: function(scope, element, attrs) {
        this._scope = scope;
        this._element = element;
        this._attrs = attrs;

        this._clearListener = scope.$on('$destroy', this._destroy.bind(this));

        this._clearDerivingEvents = $onsen.deriveEvents(this, element[0], ['init', 'show', 'hide', 'destroy']);

        this._userDeviceBackButtonListener = angular.noop;
        if (this._attrs.ngDeviceBackbutton || this._attrs.onDeviceBackbutton) {
          this._element[0].setDeviceBackButtonHandler(this._onDeviceBackButton.bind(this));
        }
      },

      _onDeviceBackButton: function($event) {
        this._userDeviceBackButtonListener($event);

        // ng-device-backbutton
        if (this._attrs.ngDeviceBackbutton) {
          $parse(this._attrs.ngDeviceBackbutton)(this._scope, {$event: $event});
        }

        // on-device-backbutton
        /* jshint ignore:start */
        if (this._attrs.onDeviceBackbutton) {
          var lastEvent = window.$event;
          window.$event = $event;
          new Function(this._attrs.onDeviceBackbutton)();
          window.$event = lastEvent;
        }
        /* jshint ignore:end */
      },

      /**
       * @param {Function} callback
       */
      setDeviceBackButtonHandler: function(callback) {
        this._userDeviceBackButtonListener = callback;
      },

      /**
       * @return {Object/null}
       */
      getDeviceBackButtonHandler: function() {
        return this._element[0].getDeviceBackButtonHandler();
      },

      _destroy: function() {
        this._element[0]._destroy();

        this._clearDerivingEvents();

        this._element = null;
        this._nullElement = null;
        this._scope = null;

        this._clearListener();
      }
    });
    MicroEvent.mixin(PageView);

    return PageView;
  }]);
})();


/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

(function(){
  'use strict';

  angular.module('onsen').factory('PopoverView', ['$onsen', function($onsen) {

    var PopoverView = Class.extend({

      /**
       * @param {Object} scope
       * @param {jqLite} element
       * @param {Object} attrs
       */
      init: function(scope, element, attrs) {
        this._element = element;
        this._scope = scope;
        this._attrs = attrs;

        this._scope.$on('$destroy', this._destroy.bind(this));

        this._clearDerivingMethods = $onsen.deriveMethods(this, this._element[0], [
          'show',
          'hide',
          'isShown',
          'setCancelable',
          'destroy'
        ]);

        this._clearDerivingEvents = $onsen.deriveEvents(this, this._element[0], [
          'preshow',
          'postshow',
          'prehide',
          'posthide'
        ], function(detail) {
          if (detail.popover) {
            detail.popover = this;
          }
          return detail;
        }.bind(this));
      },

      _destroy: function() {
        this.emit('destroy');

        this._clearDerivingMethods();
        this._clearDerivingEvents();

        this._element.remove();

        this._element = this._scope = null;
      }
    });

    MicroEvent.mixin(PopoverView);

    return PopoverView;
  }]);
})();

/*
Copyright 2013-2015 ASIAL CORPORATION

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

angular.module('onsen')
  .value('PopoverAnimator', ons._internal.PopoverAnimator)
  .value('FadePopoverAnimator', ons._internal.FadePopoverAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

(function(){
  'use strict';
  var module = angular.module('onsen');

  module.factory('PullHookView', ['$onsen', '$parse', function($onsen, $parse) {

    var PullHookView = Class.extend({

      init: function(scope, element, attrs) {
        this._element = element;
        this._scope = scope;
        this._attrs = attrs;

        this._clearDerivingMethods = $onsen.deriveMethods(this, this._element[0], [
          'getHeight',
          'setHeight',
          'setThresholdHeight',
          'getThresholdHeight',
          'getCurrentState',
          'getPullDistance',
          'isDisabled',
          'setDisabled'
        ]);

        this._clearDerivingEvents = $onsen.deriveEvents(this, this._element[0], [
          'changestate',
        ], function(detail) {
          if (detail.pullHook) {
            detail.pullHook = this;
          }
          return detail;
        }.bind(this));

        this.on('changestate', function(event) {
          this._scope.$evalAsync();
        }.bind(this));

        this._boundOnAction = this._onAction.bind(this);
        this._element[0].setActionCallback(this._boundOnAction);

        this._scope.$on('$destroy', this._destroy.bind(this));
      },

      _onAction: function(done) {
        if (this._attrs.ngAction) {
          this._scope.$eval(this._attrs.ngAction, {$done: done});
        } else if (this._attrs.onAction) {
          /*jshint evil:true */
          eval(this._attrs.onAction);
        }
      },

      _destroy: function() {
        this.emit('destroy');

        this._clearDerivingMethods();
        this._clearDerivingEvents();

        this._element = this._scope = this._attrs = null;
      }
    });

    MicroEvent.mixin(PullHookView);
    return PullHookView;
  }]);
})();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

(function() {
  'use strict';
  var module = angular.module('onsen');

  module.factory('PushSlidingMenuAnimator', ['SlidingMenuAnimator', function(SlidingMenuAnimator) {

    var PushSlidingMenuAnimator = SlidingMenuAnimator.extend({

      _isRight: false,
      _element: undefined,
      _menuPage: undefined,
      _mainPage: undefined,
      _width: undefined,

      /**
       * @param {jqLite} element "ons-sliding-menu" or "ons-split-view" element
       * @param {jqLite} mainPage
       * @param {jqLite} menuPage
       * @param {Object} options
       * @param {String} options.width "width" style value
       * @param {Boolean} options.isRight
       */
      setup: function(element, mainPage, menuPage, options) {
        options = options || {};

        this._element = element;
        this._mainPage = mainPage;
        this._menuPage = menuPage;

        this._isRight = !!options.isRight;
        this._width = options.width || '90%';

        menuPage.css({
          width: options.width,
          display: 'none'
        });

        if (this._isRight) {
          menuPage.css({
            right: '-' + options.width,
            left: 'auto'
          });
        } else {
          menuPage.css({
            right: 'auto',
            left: '-' + options.width
          });
        }
      },

      /**
       * @param {Object} options
       * @param {String} options.width
       * @param {Object} options.isRight
       */
      onResized: function(options) {
        this._menuPage.css('width', options.width);

        if (this._isRight) {
          this._menuPage.css({
            right: '-' + options.width,
            left: 'auto'
          });
        } else {
          this._menuPage.css({
            right: 'auto',
            left: '-' + options.width
          });
        }

        if (options.isOpened) {
          var max = this._menuPage[0].clientWidth;
          var mainPageTransform = this._generateAbovePageTransform(max);
          var menuPageStyle = this._generateBehindPageStyle(max);

          animit(this._mainPage[0]).queue({transform: mainPageTransform}).play();
          animit(this._menuPage[0]).queue(menuPageStyle).play();
        }
      },

      /**
       */
      destroy: function() {
        this._mainPage.removeAttr('style');
        this._menuPage.removeAttr('style');

        this._element = this._mainPage = this._menuPage = null;
      },

      /**
       * @param {Function} callback
       * @param {Boolean} instant
       */
      openMenu: function(callback, instant) {
        var duration = instant === true ? 0.0 : this.duration;
        var delay = instant === true ? 0.0 : this.delay;

        this._menuPage.css('display', 'block');

        var max = this._menuPage[0].clientWidth;

        var aboveTransform = this._generateAbovePageTransform(max);
        var behindStyle = this._generateBehindPageStyle(max);

        setTimeout(function() {

          animit(this._mainPage[0])
            .wait(delay)
            .queue({
              transform: aboveTransform
            }, {
              duration: duration,
              timing: this.timing
            })
            .queue(function(done) {
              callback();
              done();
            })
            .play();

          animit(this._menuPage[0])
            .wait(delay)
            .queue(behindStyle, {
              duration: duration,
              timing: this.timing
            })
            .play();

        }.bind(this), 1000 / 60);
      },

      /**
       * @param {Function} callback
       * @param {Boolean} instant
       */
      closeMenu: function(callback, instant) {
        var duration = instant === true ? 0.0 : this.duration;
        var delay = instant === true ? 0.0 : this.delay;

        var aboveTransform = this._generateAbovePageTransform(0);
        var behindStyle = this._generateBehindPageStyle(0);

        setTimeout(function() {

          animit(this._mainPage[0])
            .wait(delay)
            .queue({
              transform: aboveTransform
            }, {
              duration: duration,
              timing: this.timing
            })
            .queue({
              transform: 'translate3d(0, 0, 0)'
            })
            .queue(function(done) {
              this._menuPage.css('display', 'none');
              callback();
              done();
            }.bind(this))
            .play();

          animit(this._menuPage[0])
            .wait(delay)
            .queue(behindStyle, {
              duration: duration,
              timing: this.timing
            })
            .queue(function(done) {
              done();
            })
            .play();

        }.bind(this), 1000 / 60);
      },

      /**
       * @param {Object} options
       * @param {Number} options.distance
       * @param {Number} options.maxDistance
       */
      translateMenu: function(options) {

        this._menuPage.css('display', 'block');

        var aboveTransform = this._generateAbovePageTransform(Math.min(options.maxDistance, options.distance));
        var behindStyle = this._generateBehindPageStyle(Math.min(options.maxDistance, options.distance));

        animit(this._mainPage[0])
          .queue({transform: aboveTransform})
          .play();

        animit(this._menuPage[0])
          .queue(behindStyle)
          .play();
      },

      _generateAbovePageTransform: function(distance) {
        var x = this._isRight ? -distance : distance;
        var aboveTransform = 'translate3d(' + x + 'px, 0, 0)';

        return aboveTransform;
      },

      _generateBehindPageStyle: function(distance) {
        var behindX = this._isRight ? -distance : distance;
        var behindTransform = 'translate3d(' + behindX + 'px, 0, 0)';

        return {
          transform: behindTransform
        };
      },

      copy: function() {
        return new PushSlidingMenuAnimator();
      }
    });

    return PushSlidingMenuAnimator;
  }]);

})();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

(function() {
  'use strict';
  var module = angular.module('onsen');

  module.factory('RevealSlidingMenuAnimator', ['SlidingMenuAnimator', function(SlidingMenuAnimator) {

    var RevealSlidingMenuAnimator = SlidingMenuAnimator.extend({

      _blackMask: undefined,

      _isRight: false,

      _menuPage: undefined,
      _element: undefined,
      _mainPage: undefined,

      /**
       * @param {jqLite} element "ons-sliding-menu" or "ons-split-view" element
       * @param {jqLite} mainPage
       * @param {jqLite} menuPage
       * @param {Object} options
       * @param {String} options.width "width" style value
       * @param {Boolean} options.isRight
       */
      setup: function(element, mainPage, menuPage, options) {
        this._element = element;
        this._menuPage = menuPage;
        this._mainPage = mainPage;
        this._isRight = !!options.isRight;
        this._width = options.width || '90%';

        mainPage.css({
          boxShadow: '0px 0 10px 0px rgba(0, 0, 0, 0.2)'
        });

        menuPage.css({
          width: options.width,
          opacity: 0.9,
          display: 'none'
        });

        if (this._isRight) {
          menuPage.css({
            right: '0px',
            left: 'auto'
          });
        } else {
          menuPage.css({
            right: 'auto',
            left: '0px'
          });
        }

        this._blackMask = angular.element('<div></div>').css({
          backgroundColor: 'black',
          top: '0px',
          left: '0px',
          right: '0px',
          bottom: '0px',
          position: 'absolute',
          display: 'none'
        });

        element.prepend(this._blackMask);

        // Dirty fix for broken rendering bug on android 4.x.
        animit(mainPage[0]).queue({transform: 'translate3d(0, 0, 0)'}).play();
      },

      /**
       * @param {Object} options
       * @param {Boolean} options.isOpened
       * @param {String} options.width
       */
      onResized: function(options) {
        this._width = options.width;
        this._menuPage.css('width', this._width);

        if (options.isOpened) {
          var max = this._menuPage[0].clientWidth;

          var aboveTransform = this._generateAbovePageTransform(max);
          var behindStyle = this._generateBehindPageStyle(max);

          animit(this._mainPage[0]).queue({transform: aboveTransform}).play();
          animit(this._menuPage[0]).queue(behindStyle).play();
        }
      },

      /**
       * @param {jqLite} element "ons-sliding-menu" or "ons-split-view" element
       * @param {jqLite} mainPage
       * @param {jqLite} menuPage
       */
      destroy: function() {
        if (this._blackMask) {
          this._blackMask.remove();
          this._blackMask = null;
        }

        if (this._mainPage) {
          this._mainPage.attr('style', '');
        }

        if (this._menuPage) {
          this._menuPage.attr('style', '');
        }

        this._mainPage = this._menuPage = this._element = undefined;
      },

      /**
       * @param {Function} callback
       * @param {Boolean} instant
       */
      openMenu: function(callback, instant) {
        var duration = instant === true ? 0.0 : this.duration;
        var delay = instant === true ? 0.0 : this.delay;

        this._menuPage.css('display', 'block');
        this._blackMask.css('display', 'block');

        var max = this._menuPage[0].clientWidth;

        var aboveTransform = this._generateAbovePageTransform(max);
        var behindStyle = this._generateBehindPageStyle(max);

        setTimeout(function() {

          animit(this._mainPage[0])
            .wait(delay)
            .queue({
              transform: aboveTransform
            }, {
              duration: duration,
              timing: this.timing
            })
            .queue(function(done) {
              callback();
              done();
            })
            .play();

          animit(this._menuPage[0])
            .wait(delay)
            .queue(behindStyle, {
              duration: duration,
              timing: this.timing
            })
            .play();

        }.bind(this), 1000 / 60);
      },

      /**
       * @param {Function} callback
       * @param {Boolean} instant
       */
      closeMenu: function(callback, instant) {
        var duration = instant === true ? 0.0 : this.duration;
        var delay = instant === true ? 0.0 : this.delay;

        this._blackMask.css('display', 'block');

        var aboveTransform = this._generateAbovePageTransform(0);
        var behindStyle = this._generateBehindPageStyle(0);

        setTimeout(function() {

          animit(this._mainPage[0])
            .wait(delay)
            .queue({
              transform: aboveTransform
            }, {
              duration: duration,
              timing: this.timing
            })
            .queue({
              transform: 'translate3d(0, 0, 0)'
            })
            .queue(function(done) {
              this._menuPage.css('display', 'none');
              callback();
              done();
            }.bind(this))
            .play();

          animit(this._menuPage[0])
            .wait(delay)
            .queue(behindStyle, {
              duration: duration,
              timing: this.timing
            })
            .queue(function(done) {
              done();
            })
            .play();

        }.bind(this), 1000 / 60);
      },

      /**
       * @param {Object} options
       * @param {Number} options.distance
       * @param {Number} options.maxDistance
       */
      translateMenu: function(options) {

        this._menuPage.css('display', 'block');
        this._blackMask.css('display', 'block');

        var aboveTransform = this._generateAbovePageTransform(Math.min(options.maxDistance, options.distance));
        var behindStyle = this._generateBehindPageStyle(Math.min(options.maxDistance, options.distance));
        delete behindStyle.opacity;

        animit(this._mainPage[0])
          .queue({transform: aboveTransform})
          .play();

        animit(this._menuPage[0])
          .queue(behindStyle)
          .play();
      },

      _generateAbovePageTransform: function(distance) {
        var x = this._isRight ? -distance : distance;
        var aboveTransform = 'translate3d(' + x + 'px, 0, 0)';

        return aboveTransform;
      },

      _generateBehindPageStyle: function(distance) {
        var max = this._menuPage[0].getBoundingClientRect().width;

        var behindDistance = (distance - max) / max * 10;
        behindDistance = isNaN(behindDistance) ? 0 : Math.max(Math.min(behindDistance, 0), -10);

        var behindX = this._isRight ? -behindDistance : behindDistance;
        var behindTransform = 'translate3d(' + behindX + '%, 0, 0)';
        var opacity = 1 + behindDistance / 100;

        return {
          transform: behindTransform,
          opacity: opacity
        };
      },

      copy: function() {
        return new RevealSlidingMenuAnimator();
      }
    });

    return RevealSlidingMenuAnimator;
  }]);

})();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

(function() {
  'use strict';
  var module = angular.module('onsen');

  var SlidingMenuViewModel = Class.extend({

    /**
     * @member Number
     */
    _distance: 0,

    /**
     * @member Number
     */
    _maxDistance: undefined,

    /**
     * @param {Object} options
     * @param {Number} maxDistance
     */
    init: function(options) {
      if (!angular.isNumber(options.maxDistance)) {
        throw new Error('options.maxDistance must be number');
      }

      this.setMaxDistance(options.maxDistance);
    },

    /**
     * @param {Number} maxDistance
     */
    setMaxDistance: function(maxDistance) {
      if (maxDistance <= 0) {
        throw new Error('maxDistance must be greater then zero.');
      }

      if (this.isOpened()) {
        this._distance = maxDistance;
      }
      this._maxDistance = maxDistance;
    },

    /**
     * @return {Boolean}
     */
    shouldOpen: function() {
      return !this.isOpened() && this._distance >= this._maxDistance / 2;
    },

    /**
     * @return {Boolean}
     */
    shouldClose: function() {
      return !this.isClosed() && this._distance < this._maxDistance / 2;
    },

    openOrClose: function(options) {
      if (this.shouldOpen()) {
        this.open(options);
      } else if (this.shouldClose()) {
        this.close(options);
      }
    },

    close: function(options) {
      var callback = options.callback || function() {};

      if (!this.isClosed()) {
        this._distance = 0;
        this.emit('close', options);
      } else {
        callback();
      }
    },

    open: function(options) {
      var callback = options.callback || function() {};

      if (!this.isOpened()) {
        this._distance = this._maxDistance;
        this.emit('open', options);
      } else {
        callback();
      }
    },

    /**
     * @return {Boolean}
     */
    isClosed: function() {
      return this._distance === 0;
    },

    /**
     * @return {Boolean}
     */
    isOpened: function() {
      return this._distance === this._maxDistance;
    },

    /**
     * @return {Number}
     */
    getX: function() {
      return this._distance;
    },

    /**
     * @return {Number}
     */
    getMaxDistance: function() {
      return this._maxDistance;
    },

    /**
     * @param {Number} x
     */
    translate: function(x) {
      this._distance = Math.max(1, Math.min(this._maxDistance - 1, x));

      var options = {
        distance: this._distance,
        maxDistance: this._maxDistance
      };

      this.emit('translate', options);
    },

    toggle: function() {
      if (this.isClosed()) {
        this.open();
      } else {
        this.close();
      }
    }
  });
  MicroEvent.mixin(SlidingMenuViewModel);

  module.factory('SlidingMenuView', ['$onsen', '$compile', '$parse', 'AnimationChooser', 'SlidingMenuAnimator', 'RevealSlidingMenuAnimator', 'PushSlidingMenuAnimator', 'OverlaySlidingMenuAnimator', function($onsen, $compile, $parse, AnimationChooser, SlidingMenuAnimator, RevealSlidingMenuAnimator,
                                             PushSlidingMenuAnimator, OverlaySlidingMenuAnimator) {

    var SlidingMenuView = Class.extend({
      _scope: undefined,
      _attrs: undefined,

      _element: undefined,
      _menuPage: undefined,
      _mainPage: undefined,

      _doorLock: undefined,

      _isRightMenu: false,

      init: function(scope, element, attrs) {
        this._scope = scope;
        this._attrs = attrs;
        this._element = element;

        this._menuPage = angular.element(element[0].querySelector('.onsen-sliding-menu__menu'));
        this._mainPage = angular.element(element[0].querySelector('.onsen-sliding-menu__main'));

        this._doorLock = new DoorLock();

        this._isRightMenu = attrs.side === 'right';

        // Close menu on tap event.
        this._mainPageGestureDetector = new ons.GestureDetector(this._mainPage[0]);
        this._boundOnTap = this._onTap.bind(this);

        var maxDistance = this._normalizeMaxSlideDistanceAttr();
        this._logic = new SlidingMenuViewModel({maxDistance: Math.max(maxDistance, 1)});
        this._logic.on('translate', this._translate.bind(this));
        this._logic.on('open', function(options) {
          this._open(options);
        }.bind(this));
        this._logic.on('close', function(options) {
          this._close(options);
        }.bind(this));

        attrs.$observe('maxSlideDistance', this._onMaxSlideDistanceChanged.bind(this));
        attrs.$observe('swipeable', this._onSwipeableChanged.bind(this));

        this._boundOnWindowResize = this._onWindowResize.bind(this);
        window.addEventListener('resize', this._boundOnWindowResize);

        this._boundHandleEvent = this._handleEvent.bind(this);
        this._bindEvents();

        if (attrs.mainPage) {
          this.setMainPage(attrs.mainPage);
        }

        if (attrs.menuPage) {
          this.setMenuPage(attrs.menuPage);
        }

        this._deviceBackButtonHandler = ons._deviceBackButtonDispatcher.createHandler(this._element[0], this._onDeviceBackButton.bind(this));

        var unlock = this._doorLock.lock();

        window.setTimeout(function() {
          var maxDistance = this._normalizeMaxSlideDistanceAttr();
          this._logic.setMaxDistance(maxDistance);

          this._menuPage.css({opacity: 1});

          var animationChooser = new AnimationChooser({
            animators: SlidingMenuView._animatorDict,
            baseClass: SlidingMenuAnimator,
            baseClassName: 'SlidingMenuAnimator',
            defaultAnimation: attrs.type,
            defaultAnimationOptions: $parse(attrs.animationOptions)()
          });
          this._animator = animationChooser.newAnimator();
          this._animator.setup(
            this._element,
            this._mainPage,
            this._menuPage,
            {
              isRight: this._isRightMenu,
              width: this._attrs.maxSlideDistance || '90%'
            }
          );

          unlock();
        }.bind(this), 400);

        scope.$on('$destroy', this._destroy.bind(this));

        this._clearDerivingEvents = $onsen.deriveEvents(this, element[0], ['init', 'show', 'hide', 'destroy']);

        if (!attrs.swipeable) {
          this.setSwipeable(true);
        }
      },

      getDeviceBackButtonHandler: function() {
        return this._deviceBackButtonHandler;
      },

      _onDeviceBackButton: function(event) {
        if (this.isMenuOpened()) {
          this.closeMenu();
        } else {
          event.callParentHandler();
        }
      },

      _onTap: function() {
        if (this.isMenuOpened()) {
          this.closeMenu();
        }
      },

      _refreshMenuPageWidth: function() {
        var width = ('maxSlideDistance' in this._attrs) ? this._attrs.maxSlideDistance : '90%';

        if (this._animator) {
          this._animator.onResized({
            isOpened: this._logic.isOpened(),
            width: width
          });
        }
      },

      _destroy: function() {
        this.emit('destroy');

        this._clearDerivingEvents();

        this._deviceBackButtonHandler.destroy();
        window.removeEventListener('resize', this._boundOnWindowResize);

        this._mainPageGestureDetector.off('tap', this._boundOnTap);
        this._element = this._scope = this._attrs = null;
      },

      _onSwipeableChanged: function(swipeable) {
        swipeable = swipeable === '' || swipeable === undefined || swipeable == 'true';

        this.setSwipeable(swipeable);
      },

      /**
       * @param {Boolean} enabled
       */
      setSwipeable: function(enabled) {
        if (enabled) {
          this._activateGestureDetector();
        } else {
          this._deactivateGestureDetector();
        }
      },

      _onWindowResize: function() {
        this._recalculateMAX();
        this._refreshMenuPageWidth();
      },

      _onMaxSlideDistanceChanged: function() {
        this._recalculateMAX();
        this._refreshMenuPageWidth();
      },

      /**
       * @return {Number}
       */
      _normalizeMaxSlideDistanceAttr: function() {
        var maxDistance = this._attrs.maxSlideDistance;

        if (!('maxSlideDistance' in this._attrs)) {
          maxDistance = 0.9 * this._mainPage[0].clientWidth;
        } else if (typeof maxDistance == 'string') {
          if (maxDistance.indexOf('px', maxDistance.length - 2) !== -1) {
            maxDistance = parseInt(maxDistance.replace('px', ''), 10);
          } else if (maxDistance.indexOf('%', maxDistance.length - 1) > 0) {
            maxDistance = maxDistance.replace('%', '');
            maxDistance = parseFloat(maxDistance) / 100 * this._mainPage[0].clientWidth;
          }
        } else {
          throw new Error('invalid state');
        }

        return maxDistance;
      },

      _recalculateMAX: function() {
        var maxDistance = this._normalizeMaxSlideDistanceAttr();

        if (maxDistance) {
          this._logic.setMaxDistance(parseInt(maxDistance, 10));
        }
      },

      _activateGestureDetector: function(){
        this._gestureDetector.on('touch dragleft dragright swipeleft swiperight release', this._boundHandleEvent);
      },

      _deactivateGestureDetector: function(){
        this._gestureDetector.off('touch dragleft dragright swipeleft swiperight release', this._boundHandleEvent);
      },

      _bindEvents: function() {
        this._gestureDetector = new ons.GestureDetector(this._element[0], {
          dragMinDistance: 1
        });
      },

      _appendMainPage: function(pageUrl, templateHTML) {
        var pageScope = this._scope.$new();
        var pageContent = angular.element(templateHTML);
        var link = $compile(pageContent);

        this._mainPage.append(pageContent);

        if (this._currentPageElement) {
          this._currentPageElement.remove();
          this._currentPageScope.$destroy();
        }

        link(pageScope);

        this._currentPageElement = pageContent;
        this._currentPageScope = pageScope;
        this._currentPageUrl = pageUrl;
        this._currentPageElement[0]._show();
      },

      /**
       * @param {String}
       */
      _appendMenuPage: function(templateHTML) {
        var pageScope = this._scope.$new();
        var pageContent = angular.element(templateHTML);
        var link = $compile(pageContent);

        this._menuPage.append(pageContent);

        if (this._currentMenuPageScope) {
          this._currentMenuPageScope.$destroy();
          this._currentMenuPageElement.remove();
        }

        link(pageScope);

        this._currentMenuPageElement = pageContent;
        this._currentMenuPageScope = pageScope;
      },

      /**
       * @param {String} page
       * @param {Object} options
       * @param {Boolean} [options.closeMenu]
       * @param {Boolean} [options.callback]
       */
      setMenuPage: function(page, options) {
        if (page) {
          options = options || {};
          options.callback = options.callback || function() {};

          var self = this;
          $onsen.getPageHTMLAsync(page).then(function(html) {
            self._appendMenuPage(angular.element(html));
            if (options.closeMenu) {
              self.close();
            }
            options.callback();
          }, function() {
            throw new Error('Page is not found: ' + page);
          });
        } else {
          throw new Error('cannot set undefined page');
        }
      },

      /**
       * @param {String} pageUrl
       * @param {Object} options
       * @param {Boolean} [options.closeMenu]
       * @param {Boolean} [options.callback]
       */
      setMainPage: function(pageUrl, options) {
        options = options || {};
        options.callback = options.callback || function() {};

        var done = function() {
          if (options.closeMenu) {
            this.close();
          }
          options.callback();
        }.bind(this);

        if (this.currentPageUrl === pageUrl) {
          done();
          return;
        }

        if (pageUrl) {
          var self = this;
          $onsen.getPageHTMLAsync(pageUrl).then(function(html) {
            self._appendMainPage(pageUrl, html);
            done();
          }, function() {
            throw new Error('Page is not found: ' + page);
          });
        } else {
          throw new Error('cannot set undefined page');
        }
      },

      _handleEvent: function(event) {

        if (this._doorLock.isLocked()) {
          return;
        }

        if (this._isInsideIgnoredElement(event.target)){
          event.gesture.stopDetect();
        }

        switch (event.type) {
          case 'dragleft':
          case 'dragright':

            if (this._logic.isClosed() && !this._isInsideSwipeTargetArea(event)) {
              return;
            }

            event.gesture.preventDefault();

            var deltaX = event.gesture.deltaX;
            var deltaDistance = this._isRightMenu ? -deltaX : deltaX;

            var startEvent = event.gesture.startEvent;

            if (!('isOpened' in startEvent)) {
              startEvent.isOpened = this._logic.isOpened();
            }

            if (deltaDistance < 0 && this._logic.isClosed()) {
              break;
            }

            if (deltaDistance > 0 && this._logic.isOpened()) {
              break;
            }

            var distance = startEvent.isOpened ?
              deltaDistance + this._logic.getMaxDistance() : deltaDistance;

            this._logic.translate(distance);

            break;

          case 'swipeleft':
            event.gesture.preventDefault();

            if (this._logic.isClosed() && !this._isInsideSwipeTargetArea(event)) {
              return;
            }

            if (this._isRightMenu) {
              this.open();
            } else {
              this.close();
            }

            event.gesture.stopDetect();
            break;

          case 'swiperight':
            event.gesture.preventDefault();

            if (this._logic.isClosed() && !this._isInsideSwipeTargetArea(event)) {
              return;
            }

            if (this._isRightMenu) {
              this.close();
            } else {
              this.open();
            }

            event.gesture.stopDetect();
            break;

          case 'release':
            this._lastDistance = null;

            if (this._logic.shouldOpen()) {
              this.open();
            } else if (this._logic.shouldClose()) {
              this.close();
            }

            break;
        }
      },

      /**
       * @param {jqLite} element
       * @return {Boolean}
       */
      _isInsideIgnoredElement: function(element) {
        do {
          if (element.getAttribute && element.getAttribute('sliding-menu-ignore')) {
            return true;
          }
          element = element.parentNode;
        } while (element);

        return false;
      },

      _isInsideSwipeTargetArea: function(event) {
        var x = event.gesture.center.pageX;

        if (!('_swipeTargetWidth' in event.gesture.startEvent)) {
          event.gesture.startEvent._swipeTargetWidth = this._getSwipeTargetWidth();
        }

        var targetWidth = event.gesture.startEvent._swipeTargetWidth;
        return this._isRightMenu ? this._mainPage[0].clientWidth - x < targetWidth : x < targetWidth;
      },

      _getSwipeTargetWidth: function() {
        var targetWidth = this._attrs.swipeTargetWidth;

        if (typeof targetWidth == 'string') {
          targetWidth = targetWidth.replace('px', '');
        }

        var width = parseInt(targetWidth, 10);
        if (width < 0 || !targetWidth) {
          return this._mainPage[0].clientWidth;
        } else {
          return width;
        }
      },

      closeMenu: function() {
        return this.close.apply(this, arguments);
      },

      /**
       * Close sliding-menu page.
       *
       * @param {Object} options
       */
      close: function(options) {
        options = options || {};
        options = typeof options == 'function' ? {callback: options} : options;

        if (!this._logic.isClosed()) {
          this.emit('preclose', {
            slidingMenu: this
          });

          this._doorLock.waitUnlock(function() {
            this._logic.close(options);
          }.bind(this));
        }
      },

      _close: function(options) {
        var callback = options.callback || function() {},
            unlock = this._doorLock.lock(),
            instant = options.animation == 'none';

        this._animator.closeMenu(function() {
          unlock();

          this._mainPage.children().css('pointer-events', '');
          this._mainPageGestureDetector.off('tap', this._boundOnTap);

          this.emit('postclose', {
            slidingMenu: this
          });

          callback();
        }.bind(this), instant);
      },

      /**
       * Open sliding-menu page.
       *
       * @param {Object} [options]
       * @param {Function} [options.callback]
       */
      openMenu: function() {
        return this.open.apply(this, arguments);
      },

      /**
       * Open sliding-menu page.
       *
       * @param {Object} [options]
       * @param {Function} [options.callback]
       */
      open: function(options) {
        options = options || {};
        options = typeof options == 'function' ? {callback: options} : options;

        this.emit('preopen', {
          slidingMenu: this
        });

        this._doorLock.waitUnlock(function() {
          this._logic.open(options);
        }.bind(this));
      },

      _open: function(options) {
        var callback = options.callback || function() {},
            unlock = this._doorLock.lock(),
            instant = options.animation == 'none';

        this._animator.openMenu(function() {
          unlock();

          this._mainPage.children().css('pointer-events', 'none');
          this._mainPageGestureDetector.on('tap', this._boundOnTap);

          this.emit('postopen', {
            slidingMenu: this
          });

          callback();
        }.bind(this), instant);
      },

      /**
       * Toggle sliding-menu page.
       * @param {Object} [options]
       * @param {Function} [options.callback]
       */
      toggle: function(options) {
        if (this._logic.isClosed()) {
          this.open(options);
        } else {
          this.close(options);
        }
      },

      /**
       * Toggle sliding-menu page.
       */
      toggleMenu: function() {
        return this.toggle.apply(this, arguments);
      },

      /**
       * @return {Boolean}
       */
      isMenuOpened: function() {
        return this._logic.isOpened();
      },

      /**
       * @param {Object} event
       */
      _translate: function(event) {
        this._animator.translateMenu(event);
      }
    });

    // Preset sliding menu animators.
    SlidingMenuView._animatorDict = {
      'default': RevealSlidingMenuAnimator,
      'overlay': OverlaySlidingMenuAnimator,
      'reveal': RevealSlidingMenuAnimator,
      'push': PushSlidingMenuAnimator
    };

    /**
     * @param {String} name
     * @param {Function} Animator
     */
    SlidingMenuView.registerAnimator = function(name, Animator) {
      if (!(Animator.prototype instanceof SlidingMenuAnimator)) {
        throw new Error('"Animator" param must inherit SlidingMenuAnimator');
      }

      this._animatorDict[name] = Animator;
    };

    MicroEvent.mixin(SlidingMenuView);

    return SlidingMenuView;
  }]);
})();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

(function() {
  'use strict';
  var module = angular.module('onsen');

  module.factory('SlidingMenuAnimator', function() {
    return Class.extend({

      delay: 0,
      duration: 0.4,
      timing: 'cubic-bezier(.1, .7, .1, 1)',

      /**
       * @param {Object} options
       * @param {String} options.timing
       * @param {Number} options.duration
       * @param {Number} options.delay
       */
      init: function(options) {
        options = options || {};

        this.timing = options.timing || this.timing;
        this.duration = options.duration !== undefined ? options.duration : this.duration;
        this.delay = options.delay !== undefined ? options.delay : this.delay;
      },

      /**
       * @param {jqLite} element "ons-sliding-menu" or "ons-split-view" element
       * @param {jqLite} mainPage
       * @param {jqLite} menuPage
       * @param {Object} options
       * @param {String} options.width "width" style value
       * @param {Boolean} options.isRight
       */
      setup: function(element, mainPage, menuPage, options) {
      },

      /**
       * @param {Object} options
       * @param {Boolean} options.isRight
       * @param {Boolean} options.isOpened
       * @param {String} options.width
       */
      onResized: function(options) {
      },

      /**
       * @param {Function} callback
       */
      openMenu: function(callback) {
      },

      /**
       * @param {Function} callback
       */
      closeClose: function(callback) {
      },

      /**
       */
      destroy: function() {
      },

      /**
       * @param {Object} options
       * @param {Number} options.distance
       * @param {Number} options.maxDistance
       */
      translateMenu: function(mainPage, menuPage, options) {
      },

      /**
       * @return {SlidingMenuAnimator}
       */
      copy: function() {
        throw new Error('Override copy method.');
      }
    });
  });
})();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/
(function() {
  'use strict';
  var module = angular.module('onsen');

  module.factory('SplitView', ['$compile', 'RevealSlidingMenuAnimator', '$onsen', '$onsGlobal', function($compile, RevealSlidingMenuAnimator, $onsen, $onsGlobal) {
    var SPLIT_MODE = 0;
    var COLLAPSE_MODE = 1;
    var MAIN_PAGE_RATIO = 0.9;

    var SplitView = Class.extend({

      init: function(scope, element, attrs) {
        element.addClass('onsen-sliding-menu');

        this._element = element;
        this._scope = scope;
        this._attrs = attrs;

        this._mainPage = angular.element(element[0].querySelector('.onsen-split-view__main'));
        this._secondaryPage = angular.element(element[0].querySelector('.onsen-split-view__secondary'));

        this._max = this._mainPage[0].clientWidth * MAIN_PAGE_RATIO;
        this._mode = SPLIT_MODE;
        this._doorLock = new DoorLock();

        this._doSplit = false;
        this._doCollapse = false;

        $onsGlobal.orientation.on('change', this._onResize.bind(this));

        this._animator = new RevealSlidingMenuAnimator();

        this._element.css('display', 'none');

        if (attrs.mainPage) {
          this.setMainPage(attrs.mainPage);
        }

        if (attrs.secondaryPage) {
          this.setSecondaryPage(attrs.secondaryPage);
        }

        var unlock = this._doorLock.lock();

        this._considerChangingCollapse();
        this._setSize();

        setTimeout(function() {
          this._element.css('display', 'block');
          unlock();
        }.bind(this), 1000 / 60 * 2);

        scope.$on('$destroy', this._destroy.bind(this));

        this._clearDerivingEvents = $onsen.deriveEvents(this, element[0], ['init', 'show', 'hide', 'destroy']);
      },

      /**
       * @param {String} templateHTML
       */
      _appendSecondPage: function(templateHTML) {
        var pageScope = this._scope.$new();
        var pageContent = $compile(templateHTML)(pageScope);

        this._secondaryPage.append(pageContent);

        if (this._currentSecondaryPageElement) {
          this._currentSecondaryPageElement.remove();
          this._currentSecondaryPageScope.$destroy();
        }

        this._currentSecondaryPageElement = pageContent;
        this._currentSecondaryPageScope = pageScope;
      },

      /**
       * @param {String} templateHTML
       */
      _appendMainPage: function(templateHTML) {
        var pageScope = this._scope.$new();
        var pageContent = $compile(templateHTML)(pageScope);

        this._mainPage.append(pageContent);

        if (this._currentPage) {
          this._currentPageScope.$destroy();
        }

        this._currentPage = pageContent;
        this._currentPageScope = pageScope;
        this._currentPage[0]._show();
      },

      /**
       * @param {String} page
       */
      setSecondaryPage : function(page) {
        if (page) {
          $onsen.getPageHTMLAsync(page).then(function(html) {
            this._appendSecondPage(angular.element(html.trim()));
          }.bind(this), function() {
            throw new Error('Page is not found: ' + page);
          });
        } else {
          throw new Error('cannot set undefined page');
        }
      },

      /**
       * @param {String} page
       */
      setMainPage : function(page) {
        if (page) {
          $onsen.getPageHTMLAsync(page).then(function(html) {
            this._appendMainPage(angular.element(html.trim()));
          }.bind(this), function() {
            throw new Error('Page is not found: ' + page);
          });
        } else {
          throw new Error('cannot set undefined page');
        }
      },

      _onResize: function() {
        var lastMode = this._mode;

        this._considerChangingCollapse();

        if (lastMode === COLLAPSE_MODE && this._mode === COLLAPSE_MODE) {
          this._animator.onResized({
            isOpened: false,
            width: '90%'
          });
        }

        this._max = this._mainPage[0].clientWidth * MAIN_PAGE_RATIO;
      },

      _considerChangingCollapse: function() {
        var should = this._shouldCollapse();

        if (should && this._mode !== COLLAPSE_MODE) {
          this._fireUpdateEvent();
          if (this._doSplit) {
            this._activateSplitMode();
          } else {
            this._activateCollapseMode();
          }
        } else if (!should && this._mode === COLLAPSE_MODE) {
          this._fireUpdateEvent();
          if (this._doCollapse) {
            this._activateCollapseMode();
          } else {
            this._activateSplitMode();
          }
        }

        this._doCollapse = this._doSplit = false;
      },

      update: function() {
        this._fireUpdateEvent();

        var should = this._shouldCollapse();

        if (this._doSplit) {
          this._activateSplitMode(); 
        } else if (this._doCollapse) {
          this._activateCollapseMode(); 
        } else if (should) {
          this._activateCollapseMode();
        } else if (!should) {
          this._activateSplitMode();
        }

        this._doSplit = this._doCollapse = false;
      },

      _getOrientation: function() {
        if ($onsGlobal.orientation.isPortrait()) {
          return 'portrait';
        } else {
          return 'landscape';
        }
      },

      getCurrentMode: function() {
        if (this._mode === COLLAPSE_MODE) {
          return 'collapse';
        } else {
          return 'split';
        }
      },

      _shouldCollapse: function() {
        var c = 'portrait';
        if (typeof this._attrs.collapse === 'string') {
          c = this._attrs.collapse.trim();
        }

        if (c == 'portrait') {
          return $onsGlobal.orientation.isPortrait();
        } else if (c == 'landscape') {
          return $onsGlobal.orientation.isLandscape();
        } else if (c.substr(0,5) == 'width') {
          var num = c.split(' ')[1];
          if (num.indexOf('px') >= 0) {
            num = num.substr(0,num.length-2);
          }

          var width = window.innerWidth;

          return isNumber(num) && width < num;
        } else {
          var mq = window.matchMedia(c);
          return mq.matches;
        }
      },

      _setSize: function() {
        if (this._mode === SPLIT_MODE) {
          if (!this._attrs.mainPageWidth) {
            this._attrs.mainPageWidth = '70';
          }

          var secondarySize = 100 - this._attrs.mainPageWidth.replace('%', '');
          this._secondaryPage.css({
            width: secondarySize + '%',
            opacity: 1
          });

          this._mainPage.css({
            width: this._attrs.mainPageWidth + '%'
          });

          this._mainPage.css('left', secondarySize + '%');
        }
      },

      _fireEvent: function(name) {
        this.emit(name, {
          splitView: this,
          width: window.innerWidth,
          orientation: this._getOrientation() 
        });
      },

      _fireUpdateEvent: function() {
        var that = this;

        this.emit('update', {
          splitView: this,
          shouldCollapse: this._shouldCollapse(),
          currentMode: this.getCurrentMode(),
          split: function() {
            that._doSplit = true;
            that._doCollapse = false;
          },
          collapse: function() {
            that._doSplit = false;
            that._doCollapse = true;
          },
          width: window.innerWidth,
          orientation: this._getOrientation()
        }); 
      },

      _activateCollapseMode: function() {
        if (this._mode !== COLLAPSE_MODE) {
          this._fireEvent('precollapse');
       
          this._secondaryPage.attr('style', '');
          this._mainPage.attr('style', '');

          this._mode = COLLAPSE_MODE;

          this._animator.setup(
            this._element,
            this._mainPage,
            this._secondaryPage,
            {isRight: false, width: '90%'}
          );

          this._fireEvent('postcollapse');
        }
      },

      _activateSplitMode: function() {
        if (this._mode !== SPLIT_MODE) {
          this._fireEvent('presplit');

          this._animator.destroy();

          this._secondaryPage.attr('style', '');
          this._mainPage.attr('style', '');

          this._mode = SPLIT_MODE;
          this._setSize();
       
          this._fireEvent('postsplit');
        }
      },

      _destroy: function() {
        this.emit('destroy');

        this._clearDerivingEvents();

        this._element = null;
        this._scope = null;
      }
    });

    function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    MicroEvent.mixin(SplitView);

    return SplitView;
  }]);
})();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/
(function() {
  'use strict';

  angular.module('onsen').factory('SplitterContent', ['$onsen', '$compile', function($onsen, $compile) {

    var SplitterContent = Class.extend({

      init: function(scope, element, attrs) {
        this._element = element;
        this._scope = scope;
        this._attrs = attrs;

        this._clearDerivingMethods = $onsen.deriveMethods(this, this._element[0], [
          'load'
        ]);

        scope.$on('$destroy', this._destroy.bind(this));
      },

      _link: function(fragment, done) {
        
        var link = $compile(fragment);
        var pageScope = this._createPageScope();
        link(pageScope);

        pageScope.$evalAsync(function() {
          done(fragment);
        });
      },

      _createPageScope: function() {
         return this._scope.$new();
      },

      _destroy: function() {
        this.emit('destroy');

        this._clearDerivingMethods();

        this._element = this._scope = this._attrs = null;
      }
    });

    MicroEvent.mixin(SplitterContent);

    Object.defineProperty(SplitterContent.prototype, 'page', {
      get: function () {
        return this._element[0].page;
      },
      set: function() {
        throw new Error();
      }
    });

    return SplitterContent;
  }]);
})();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/
(function() {
  'use strict';

  angular.module('onsen').factory('SplitterSide', ['$onsen', '$compile', function($onsen, $compile) {

    var SplitterSide = Class.extend({

      init: function(scope, element, attrs) {
        this._element = element;
        this._scope = scope;
        this._attrs = attrs;

        this._clearDerivingMethods = $onsen.deriveMethods(this, this._element[0], [
          'isSwipeable',
          'getCurrentMode',
          'isOpened',
          'open',
          'close',
          'toggle',
          'load',
        ]);

        this._clearDerivingEvents = $onsen.deriveEvents(this, element[0], [
          'modechange', 'preopen', 'preclose', 'postopen', 'postclose'
        ], function(detail) {
          if (detail.side) {
            detail.side = this;
          }
          return detail;
        }.bind(this));

        scope.$on('$destroy', this._destroy.bind(this));
      },

      _link: function(fragment, done) {
        
        var link = $compile(fragment);
        var pageScope = this._createPageScope();
        link(pageScope);

        pageScope.$evalAsync(function() {
          done(fragment);
        });
      },

      _createPageScope: function() {
         return this._scope.$new();
      },

      _destroy: function() {
        this.emit('destroy');

        this._clearDerivingMethods();
        this._clearDerivingEvents();

        this._element = this._scope = this._attrs = null;
      }
    });

    MicroEvent.mixin(SplitterSide);

    Object.defineProperty(SplitterSide.prototype, 'page', {
      get: function () {
        return this._element[0].page;
      },
      set: function() {
        throw new Error();
      }
    });

    return SplitterSide;
  }]);
})();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/
(function() {
  'use strict';

  angular.module('onsen').factory('Splitter', ['$onsen', function($onsen) {

    var Splitter = Class.extend({

      init: function(scope, element, attrs) {
        this._element = element;
        this._scope = scope;
        this._attrs = attrs;

        this._clearDerivingMethods = $onsen.deriveMethods(this, this._element[0], [
          'getDeviceBackButtonHandler',
          'show',
          'hide',
          'isShown',
          'destroy'
        ]);

        scope.$on('$destroy', this._destroy.bind(this));
      },

      _destroy: function() {
        this.emit('destroy');

        this._clearDerivingMethods();

        this._element = this._scope = this._attrs = null;
      }
    });

    MicroEvent.mixin(Splitter);

    return Splitter;
  }]);
})();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

(function(){
  'use strict';

  angular.module('onsen').factory('SwitchView', ['$parse', '$onsen', function($parse, $onsen) {

    var SwitchView = Class.extend({

      /**
       * @param {jqLite} element
       * @param {Object} scope
       * @param {Object} attrs
       */
      init: function(element, scope, attrs) {
        this._element = element;
        this._checkbox = angular.element(element[0].querySelector('input[type=checkbox]'));
        this._scope = scope;

        this._checkbox.on('change', function() {
          this.emit('change', {'switch': this, value: this._checkbox[0].checked, isInteractive: true});
        }.bind(this));

        this._prepareNgModel(element, scope, attrs);

        this._scope.$on('$destroy', this._destroy.bind(this));

        this._clearDerivingMethods = $onsen.deriveMethods(this, element[0], [
          'isChecked',
          'setChecked',
          'getCheckboxElement'
        ]);
      },

      _prepareNgModel: function(element, scope, attrs) {
        if (attrs.ngModel) {
          var set = $parse(attrs.ngModel).assign;

          scope.$parent.$watch(attrs.ngModel, function(value) {
            this.setChecked(!!value);
          }.bind(this));

          this._checkbox.on('change', function(e) {
            set(scope.$parent, this.isChecked());

            if (attrs.ngChange) {
              scope.$eval(attrs.ngChange);
            }

            scope.$parent.$evalAsync();
          }.bind(this));
        }
      },

      _destroy: function() {
        this.emit('destroy');
        this._clearDerivingMethods();
        this._element = this._checkbox = this._scope = null;
      }
    });
    MicroEvent.mixin(SwitchView);

    return SwitchView;
  }]);
})();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

(function() {
  'use strict';

  var module = angular.module('onsen');

  module.value('TabbarNoneAnimator', ons._internal.TabbarNoneAnimator);
  module.value('TabbarFadeAnimator', ons._internal.TabbarFadeAnimator);
  module.value('TabbarSlideAnimator', ons._internal.TabbarSlideAnimator);

  module.factory('TabbarView', ['$onsen', '$compile', '$parse', function($onsen, $compile, $parse) {
    var TabbarView = Class.extend({

      init: function(scope, element, attrs) {
        if (element[0].nodeName.toLowerCase() !== 'ons-tabbar') {
          throw new Error('"element" parameter must be a "ons-tabbar" element.');
        }

        this._scope = scope;
        this._element = element;
        this._attrs = attrs;
        this._lastPageElement = null;

        this._scope.$on('$destroy', this._destroy.bind(this));

        this._clearDerivingEvents = $onsen.deriveEvents(this, element[0], [
          'reactive', 'postchange', 'prechange', 'init', 'show', 'hide', 'destroy'
        ]);

        this._clearDerivingMethods = $onsen.deriveMethods(this, element[0], [
          'setActiveTab',
          'setTabbarVisibility',
          'getActiveTabIndex',
          'loadPage'
        ]);

        this._boundOnPrechange = this._onPrechange.bind(this);
        this._boundOnPostchange = this._onPostchange.bind(this);
        this._element.on('prechange', this._boundOnPrechange);
        this._element.on('postchange', this._boundOnPostchange);
      },

      _compileAndLink: function(pageElement, callback) {
        var link = $compile(pageElement);
        var pageScope = this._scope.$new();
        link(pageScope);

        pageScope.$evalAsync(function() {
          callback(pageElement);
        });
      },

      _onPrechange: function(event) {
        this._lastPageElement = this._element[0]._getCurrentPageElement();
      },

      _onPostchange: function(event) {
        if (this._lastPageElement && !this._lastPageElement.parentNode) {
          angular.element(this._lastPageElement).scope().$destroy();
        }
      },

      _destroy: function() {
        this.emit('destroy');

        element.off(this._boundOnPrechange);
        element.off(this._boundOnPostchange);

        this._clearDerivingEvents();
        this._clearDerivingMethods();

        this._element = this._scope = this._attrs = null;
      }
    });
    MicroEvent.mixin(TabbarView);

    TabbarView.registerAnimator = function(name, Animator) {
      return window.OnsTabbarElement.registerAnimator(name, Animator);
    };

    return TabbarView;
  }]);

})();


/**
 * @ngdoc directive
 * @id alert-dialog
 * @name ons-alert-dialog
 * @category dialog
 * @modifier android
 *   [en]Display an Android style alert dialog.[/en]
 *   [ja]Androidライクなスタイルを表示します。[/ja]
 * @description
 *   [en]Alert dialog that is displayed on top of the current screen.[/en]
 *   [ja]現在のスクリーンにアラートダイアログを表示します。[/ja]
 * @codepen Qwwxyp
 * @guide UsingAlert
 *   [en]Learn how to use the alert dialog.[/en]
 *   [ja]アラートダイアログの使い方の解説。[/ja]
 * @seealso ons-dialog
 *   [en]ons-dialog component[/en]
 *   [ja]ons-dialogコンポーネント[/ja]
 * @seealso ons-popover
 *   [en]ons-popover component[/en]
 *   [ja]ons-dialogコンポーネント[/ja]
 * @seealso ons.notification
 *   [en]Using ons.notification utility functions.[/en]
 *   [ja]アラートダイアログを表示するには、ons.notificationオブジェクトのメソッドを使うこともできます。[/ja]
 * @example
 * <script>
 *   ons.ready(function() {
 *     ons.createAlertDialog('alert.html').then(function(alertDialog) {
 *       alertDialog.show();
 *     });
 *   });
 * </script>
 *
 * <script type="text/ons-template" id="alert.html">
 *   <ons-alert-dialog animation="default" cancelable>
 *     <div class="alert-dialog-title">Warning!</div>
 *     <div class="alert-dialog-content">
 *       An error has occurred!
 *     </div>
 *     <div class="alert-dialog-footer">
 *       <button class="alert-dialog-button">OK</button>
 *     </div>
 *   </ons-alert-dialog>
 * </script>
 */

/**
 * @ngdoc event
 * @name preshow
 * @description
 *   [en]Fired just before the alert dialog is displayed.[/en]
 *   [ja]アラートダイアログが表示される直前に発火します。[/ja]
 * @param {Object} event [en]Event object.[/en]
 * @param {Object} event.alertDialog
 *   [en]Alert dialog object.[/en]
 *   [ja]アラートダイアログのオブジェクト。[/ja]
 * @param {Function} event.cancel
 *   [en]Execute to stop the dialog from showing.[/en]
 *   [ja]この関数を実行すると、アラートダイアログの表示を止めます。[/ja]
 */

/**
 * @ngdoc event
 * @name postshow
 * @description
 *   [en]Fired just after the alert dialog is displayed.[/en]
 *   [ja]アラートダイアログが表示された直後に発火します。[/ja]
 * @param {Object} event [en]Event object.[/en]
 * @param {Object} event.alertDialog
 *   [en]Alert dialog object.[/en]
 *   [ja]アラートダイアログのオブジェクト。[/ja]
 */

/**
 * @ngdoc event
 * @name prehide
 * @description
 *   [en]Fired just before the alert dialog is hidden.[/en]
 *   [ja]アラートダイアログが隠れる直前に発火します。[/ja]
 * @param {Object} event [en]Event object.[/en]
 * @param {Object} event.alertDialog
 *   [en]Alert dialog object.[/en]
 *   [ja]アラートダイアログのオブジェクト。[/ja]
 * @param {Function} event.cancel
 *   [en]Execute to stop the dialog from hiding.[/en]
 *   [ja]この関数を実行すると、アラートダイアログが閉じようとするのを止めます。[/ja]
 */

/**
 * @ngdoc event
 * @name posthide
 * @description
 * [en]Fired just after the alert dialog is hidden.[/en]
 * [ja]アラートダイアログが隠れた後に発火します。[/ja]
 * @param {Object} event [en]Event object.[/en]
 * @param {Object} event.alertDialog
 *   [en]Alert dialog object.[/en]
 *   [ja]アラートダイアログのオブジェクト。[/ja]
 */

/**
 * @ngdoc attribute
 * @name var
 * @initonly
 * @extensionOf angular
 * @type {String}
 * @description
 *  [en]Variable name to refer this alert dialog.[/en]
 *  [ja]このアラートダイアログを参照するための名前を指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name modifier
 * @type {String}
 * @description
 *  [en]The appearance of the dialog.[/en]
 *  [ja]ダイアログの見た目を指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name cancelable
 * @description
 *  [en]If this attribute is set the dialog can be closed by tapping the background or by pressing the back button.[/en]
 *  [ja]この属性があると、ダイアログが表示された時に、背景やバックボタンをタップした時にダイアログを閉じます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name disabled
 * @description
 *  [en]If this attribute is set the dialog is disabled.[/en]
 *  [ja]この属性がある時、アラートダイアログはdisabled状態になります。[/ja]
 */

/**
 * @ngdoc attribute
 * @name animation
 * @type {String}
 * @default default
 * @description
 *  [en]The animation used when showing and hiding the dialog. Can be either "none" or "default".[/en]
 *  [ja]ダイアログを表示する際のアニメーション名を指定します。デフォルトでは"none"か"default"が指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name animation-options
 * @type {Expression}
 * @description
 *  [en]Specify the animation's duration, timing and delay with an object literal. E.g. <code>{duration: 0.2, delay: 1, timing: 'ease-in'}</code>[/en]
 *  [ja]アニメーション時のduration, timing, delayをオブジェクトリテラルで指定します。e.g. <code>{duration: 0.2, delay: 1, timing: 'ease-in'}</code>[/ja]
 */


/**
 * @ngdoc attribute
 * @name mask-color
 * @type {String}
 * @default rgba(0, 0, 0, 0.2)
 * @description
 *  [en]Color of the background mask. Default is "rgba(0, 0, 0, 0.2)".[/en]
 *  [ja]背景のマスクの色を指定します。"rgba(0, 0, 0, 0.2)"がデフォルト値です。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-preshow
 * @initonly
 * @type {Expression}
 * @extensionOf angular
 * @description
 *  [en]Allows you to specify custom behavior when the "preshow" event is fired.[/en]
 *  [ja]"preshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-prehide
 * @initonly
 * @type {Expression}
 * @extensionOf angular
 * @description
 *  [en]Allows you to specify custom behavior when the "prehide" event is fired.[/en]
 *  [ja]"prehide"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-postshow
 * @initonly
 * @type {Expression}
 * @extensionOf angular
 * @description
 *  [en]Allows you to specify custom behavior when the "postshow" event is fired.[/en]
 *  [ja]"postshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-posthide
 * @initonly
 * @type {Expression}
 * @extensionOf angular
 * @description
 *  [en]Allows you to specify custom behavior when the "posthide" event is fired.[/en]
 *  [ja]"posthide"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-destroy
 * @initonly
 * @type {Expression}
 * @extensionOf angular
 * @description
 *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
 *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc method
 * @signature show([options])
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクトです。[/ja]
 * @param {String} [options.animation]
 *   [en]Animation name. Available animations are "fade", "slide" and "none".[/en]
 *   [ja]アニメーション名を指定します。指定できるのは、"fade", "slide", "none"のいずれかです。[/ja]
 * @param {String} [options.animationOptions]
 *   [en]Specify the animation's duration, delay and timing. E.g.  <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code>[/en]
 *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code> [/ja]
 * @param {Function} [options.callback]
 *   [en]Function to execute after the dialog has been revealed.[/en]
 *   [ja]ダイアログが表示され終わった時に呼び出されるコールバックを指定します。[/ja]
 * @description
 *   [en]Show the alert dialog.[/en]
 *   [ja]ダイアログを表示します。[/ja]
 */

/**
 * @ngdoc method
 * @signature hide([options])
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {String} [options.animation]
 *   [en]Animation name. Available animations are "fade", "slide" and "none".[/en]
 *   [ja]アニメーション名を指定します。"fade", "slide", "none"のいずれかを指定します。[/ja]
 * @param {String} [options.animationOptions]
 *   [en]Specify the animation's duration, delay and timing. E.g.  <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code>[/en]
 *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code> [/ja]
 * @param {Function} [options.callback]
 *   [en]Function to execute after the dialog has been hidden.[/en]
 *   [ja]このダイアログが閉じた時に呼び出されるコールバックを指定します。[/ja]
 * @description
 *   [en]Hide the alert dialog.[/en]
 *   [ja]ダイアログを閉じます。[/ja]
 */

/**
 * @ngdoc method
 * @signature isShown()
 * @description
 *   [en]Returns whether the dialog is visible or not.[/en]
 *   [ja]ダイアログが表示されているかどうかを返します。[/ja]
 * @return {Boolean}
 *   [en]true if the dialog is currently visible.[/en]
 *   [ja]ダイアログが表示されていればtrueを返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature destroy()
 * @description
 *   [en]Destroy the alert dialog and remove it from the DOM tree.[/en]
 *   [ja]ダイアログを破棄して、DOMツリーから取り除きます。[/ja]
 */

/**
 * @ngdoc method
 * @signature setCancelable(cancelable)
 * @description
 *   [en]Define whether the dialog can be canceled by the user or not.[/en]
 *   [ja]アラートダイアログを表示した際に、ユーザがそのダイアログをキャンセルできるかどうかを指定します。[/ja]
 * @param {Boolean} cancelable
 *   [en]If true the dialog will be cancelable.[/en]
 *   [ja]キャンセルできるかどうかを真偽値で指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature isCancelable()
 * @description
 *   [en]Returns whether the dialog is cancelable or not.[/en]
 *   [ja]このアラートダイアログがキャンセル可能かどうかを返します。[/ja]
 * @return {Boolean}
 *   [en]true if the dialog is cancelable.[/en]
 *   [ja]キャンセル可能であればtrueを返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature setDisabled(disabled)
 * @description
 *   [en]Disable or enable the alert dialog.[/en]
 *   [ja]このアラートダイアログをdisabled状態にするかどうかを設定します。[/ja]
 * @param {Boolean} disabled
 *   [en]If true the dialog will be disabled.[/en]
 *   [ja]disabled状態にするかどうかを真偽値で指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature isDisabled()
 * @description
 *   [en]Returns whether the dialog is disabled or enabled.[/en]
 *   [ja]このアラートダイアログがdisabled状態かどうかを返します。[/ja]
 * @return {Boolean}
 *   [en]true if the dialog is disabled.[/en]
 *   [ja]disabled状態であればtrueを返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature on(eventName, listener)
 * @extensionOf angular
 * @description
 *   [en]Add an event listener.[/en]
 *   [ja]イベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火された際に呼び出されるコールバックを指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature once(eventName, listener)
 * @extensionOf angular
 * @description
 *  [en]Add an event listener that's only triggered once.[/en]
 *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出されるコールバックを指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature off(eventName, [listener])
 * @extensionOf angular
 * @description
 *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
 *  [ja]イベントリスナーを削除します。もしlistenerパラメータが指定されなかった場合、そのイベントのリスナーが全て削除されます。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]削除するイベントリスナーの関数オブジェクトを渡します。[/ja]
 */

(function() {
  'use strict';

  /**
   * Alert dialog directive.
   */
  angular.module('onsen').directive('onsAlertDialog', ['$onsen', 'AlertDialogView', function($onsen, AlertDialogView) {
    return {
      restrict: 'E',
      replace: false,
      scope: true,
      transclude: false,

      compile: function(element, attrs) {
        CustomElements.upgrade(element[0]);

        return {
          pre: function(scope, element, attrs) {
            CustomElements.upgrade(element[0]);
            var alertDialog = new AlertDialogView(scope, element, attrs);

            $onsen.declareVarAttribute(attrs, alertDialog);
            $onsen.registerEventHandlers(alertDialog, 'preshow prehide postshow posthide destroy');
            $onsen.addModifierMethodsForCustomElements(alertDialog, element);

            element.data('ons-alert-dialog', alertDialog);

            scope.$on('$destroy', function() {
              alertDialog._events = undefined;
              $onsen.removeModifierMethods(alertDialog);
              element.data('ons-alert-dialog', undefined);
              element = null;
            });
          },
          post: function(scope, element) {
            $onsen.fireComponentEvent(element[0], 'init');
          }
        };
      }
    };
  }]);

})();

/**
 * @ngdoc directive
 * @id back_button
 * @name ons-back-button
 * @category toolbar
 * @description
 *   [en]Back button component for ons-toolbar. Can be used with ons-navigator to provide back button support.[/en]
 *   [ja]ons-toolbarに配置できる「戻るボタン」用コンポーネントです。ons-navigatorと共に使用し、ページを1つ前に戻る動作を行います。[/ja]
 * @codepen aHmGL
 * @seealso ons-toolbar 
 *   [en]ons-toolbar component[/en]
 *   [ja]ons-toolbarコンポーネント[/ja]
 * @seealso ons-navigator
 *   [en]ons-navigator component[/en]
 *   [ja]ons-navigatorコンポーネント[/en]
 * @guide Addingatoolbar 
 *   [en]Adding a toolbar[/en]
 *   [ja]ツールバーの追加[/ja]
 * @guide Returningfromapage 
 *   [en]Returning from a page[/en]
 *   [ja]一つ前のページに戻る[/ja]
 * @example
 * <ons-back-button>
 *   Back
 * </ons-back-button>
 */
(function(){
  'use strict';
  var module = angular.module('onsen');

  module.directive('onsBackButton', ['$onsen', '$compile', 'GenericView', 'ComponentCleaner', function($onsen, $compile, GenericView, ComponentCleaner) {
    return {
      restrict: 'E',
      replace: false,

      compile: function(element, attrs) {
        CustomElements.upgrade(element[0]);

        return {
          pre: function(scope, element, attrs, controller, transclude) {
            CustomElements.upgrade(element[0]);
            var backButton = GenericView.register(scope, element, attrs, {
              viewKey: 'ons-back-button'
            });

            scope.$on('$destroy', function() {
              backButton._events = undefined;
              $onsen.removeModifierMethods(backButton);
              element = null;
            });

            ComponentCleaner.onDestroy(scope, function() {
              ComponentCleaner.destroyScope(scope);
              ComponentCleaner.destroyAttributes(attrs);
              element = scope = attrs = null;
            });
          },
          post: function(scope, element) {
            $onsen.fireComponentEvent(element[0], 'init');
          }
        };
      }
    };
  }]);
})();

/**
 * @ngdoc directive
 * @id bottom_toolbar
 * @name ons-bottom-toolbar
 * @category toolbar
 * @description
 *   [en]Toolbar component that is positioned at the bottom of the page.[/en]
 *   [ja]ページ下部に配置されるツールバー用コンポーネントです。[/ja]
 * @modifier transparent
 *   [en]Make the toolbar transparent.[/en]
 *   [ja]ツールバーの背景を透明にして表示します。[/ja]
 * @seealso ons-toolbar [en]ons-toolbar component[/en][ja]ons-toolbarコンポーネント[/ja]
 * @guide Addingatoolbar
 *   [en]Adding a toolbar[/en]
 *   [ja]ツールバーの追加[/ja]
 * @example
 * <ons-bottom-toolbar>
 *   <div style="text-align: center; line-height: 44px">Text</div>
 * </ons-bottom-toolbar>
 */

/**
 * @ngdoc attribute
 * @name modifier
 * @type {String}
 * @description
 *   [en]The appearance of the toolbar.[/en]
 *   [ja]ツールバーの見た目の表現を指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name inline
 * @initonly
 * @description
 *   [en]Display the toolbar as an inline element.[/en]
 *   [ja]この属性があると、ツールバーを画面下部ではなくスクロール領域内にそのまま表示します。[/ja]
 */

(function(){
  'use strict';

  angular.module('onsen').directive('onsBottomToolbar', ['$onsen', 'GenericView', function($onsen, GenericView) {
    return {
      restrict: 'E',
      link: {
        pre: function(scope, element, attrs) {
          CustomElements.upgrade(element[0]);
          GenericView.register(scope, element, attrs, {
            viewKey: 'ons-bottomToolbar'
          });

          var inline = typeof attrs.inline !== 'undefined';
          var pageView = element.inheritedData('ons-page');

          if (pageView && !inline) {
            pageView._element[0]._registerBottomToolbar(element[0]);
          }
        },

        post: function(scope, element, attrs) {
          $onsen.fireComponentEvent(element[0], 'init');
        }
      }
    };
  }]);

})();


/**
 * @ngdoc directive
 * @id button
 * @name ons-button
 * @category form
 * @modifier outline
 *   [en]Button with outline and transparent background[/en]
 *   [ja]アウトラインを持ったボタンを表示します。[/ja]
 * @modifier light
 *   [en]Button that doesn't stand out.[/en]
 *   [ja]目立たないボタンを表示します。[/ja]
 * @modifier quiet
 *   [en]Button with no outline and or background..[/en]
 *   [ja]枠線や背景が無い文字だけのボタンを表示します。[/ja]
 * @modifier cta
 *   [en]Button that really stands out.[/en]
 *   [ja]目立つボタンを表示します。[/ja]
 * @modifier large
 *   [en]Large button that covers the width of the screen.[/en]
 *   [ja]横いっぱいに広がる大きなボタンを表示します。[/ja]
 * @modifier large--quiet
 *   [en]Large quiet button.[/en]
 *   [ja]横いっぱいに広がるquietボタンを表示します。[/ja]
 * @modifier large--cta
 *   [en]Large call to action button.[/en]
 *   [ja]横いっぱいに広がるctaボタンを表示します。[/ja]
 * @description
 *   [en]Button component. If you want to place a button in a toolbar, use ons-toolbar-button or ons-back-button instead.[/en]
 *   [ja]ボタン用コンポーネント。ツールバーにボタンを設置する場合は、ons-toolbar-buttonもしくはons-back-buttonコンポーネントを使用します。[/ja]
 * @codepen hLayx
 * @guide Button [en]Guide for ons-button[/en][ja]ons-buttonの使い方[/ja]
 * @guide OverridingCSSstyles [en]More details about modifier attribute[/en][ja]modifier属性の使い方[/ja]
 * @example
 * <ons-button modifier="large--cta">
 *   Tap Me
 * </ons-button>
 */

/**
 * @ngdoc attribute
 * @name modifier
 * @type {String}
 * @description
 *  [en]The appearance of the button.[/en]
 *  [ja]ボタンの表現を指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name disabled
 * @description
 *   [en]Specify if button should be disabled.[/en]
 *   [ja]ボタンを無効化する場合は指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature setDisabled(disabled)
 * @description
 *   [en]Disable or enable the button.[/en]
 *   [ja]このボタンをdisabled状態にするかどうかを設定します。[/ja]
 * @param {String} disabled
 *   [en]If true the button will be disabled.[/en]
 *   [ja]disabled状態にするかどうかを真偽値で指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature isDisabled()
 * @return {Boolean}
 *   [en]true if the button is disabled.[/en]
 *   [ja]ボタンがdisabled状態になっているかどうかを返します。[/ja]
 * @description
 *   [en]Returns whether the button is disabled or enabled.[/en]
 *   [ja]このボタンがdisabled状態かどうかを返します。[/ja]
 */

(function(){
  'use strict';

  angular.module('onsen').directive('onsButton', ['$onsen', 'GenericView', function($onsen, GenericView) {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        CustomElements.upgrade(element[0]);
        var button = GenericView.register(scope, element, attrs, {
          viewKey: 'ons-button'
        });

        /**
         * Returns whether the button is disabled or not.
         */
        button.isDisabled = function() {
          return this._element[0].hasAttribute('disabled');
        };

        /**
         * Disabled or enable button.
         */
        button.setDisabled = function(disabled) {
          if (disabled) {
            this._element[0].setAttribute('disabled', '');
          } else {
            this._element[0].removeAttribute('disabled');
          }
        };

        $onsen.fireComponentEvent(element[0], 'init');
      }
    };
  }]);



})();

/**
 * @ngdoc directive
 * @id carousel
 * @name ons-carousel
 * @category carousel
 * @description
 *   [en]Carousel component.[/en]
 *   [ja]カルーセルを表示できるコンポーネント。[/ja]
 * @codepen xbbzOQ
 * @guide UsingCarousel
 *   [en]Learn how to use the carousel component.[/en]
 *   [ja]carouselコンポーネントの使い方[/ja]
 * @example
 * <ons-carousel style="width: 100%; height: 200px">
 *   <ons-carousel-item>
 *    ...
 *   </ons-carousel-item>
 *   <ons-carousel-item>
 *    ...
 *   </ons-carousel-item>
 * </ons-carousel>
 */

/**
 * @ngdoc event
 * @name postchange
 * @description
 *   [en]Fired just after the current carousel item has changed.[/en]
 *   [ja]現在表示しているカルーセルの要素が変わった時に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクトです。[/ja]
 * @param {Object} event.carousel
 *   [en]Carousel object.[/en]
 *   [ja]イベントが発火したCarouselオブジェクトです。[/ja]
 * @param {Number} event.activeIndex
 *   [en]Current active index.[/en]
 *   [ja]現在アクティブになっている要素のインデックス。[/ja]
 * @param {Number} event.lastActiveIndex
 *   [en]Previous active index.[/en]
 *   [ja]以前アクティブだった要素のインデックス。[/ja]
 */

/**
 * @ngdoc event
 * @name refresh
 * @description
 *   [en]Fired when the carousel has been refreshed.[/en]
 *   [ja]カルーセルが更新された時に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクトです。[/ja]
 * @param {Object} event.carousel
 *   [en]Carousel object.[/en]
 *   [ja]イベントが発火したCarouselオブジェクトです。[/ja]
 */

/**
 * @ngdoc event
 * @name overscroll
 * @description
 *   [en]Fired when the carousel has been overscrolled.[/en]
 *   [ja]カルーセルがオーバースクロールした時に発火します。[/ja]
 * @param {Object} event 
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクトです。[/ja]
 * @param {Object} event.carousel
 *   [en]Fired when the carousel has been refreshed.[/en]
 *   [ja]カルーセルが更新された時に発火します。[/ja]
 * @param {Number} event.activeIndex
 *   [en]Current active index.[/en]
 *   [ja]現在アクティブになっている要素のインデックス。[/ja]
 * @param {String} event.direction
 *   [en]Can be one of either "up", "down", "left" or "right".[/en]
 *   [ja]オーバースクロールされた方向が得られます。"up", "down", "left", "right"のいずれかの方向が渡されます。[/ja]
 * @param {Function} event.waitToReturn
 *   [en]Takes a <code>Promise</code> object as an argument. The carousel will not scroll back until the promise has been resolved or rejected.[/en]
 *   [ja]この関数はPromiseオブジェクトを引数として受け取ります。渡したPromiseオブジェクトがresolveされるかrejectされるまで、カルーセルはスクロールバックしません。[/ja]
 */

/**
 * @ngdoc attribute
 * @name direction
 * @type {String}
 * @description
 *   [en]The direction of the carousel. Can be either "horizontal" or "vertical". Default is "horizontal".[/en]
 *   [ja]カルーセルの方向を指定します。"horizontal"か"vertical"を指定できます。"horizontal"がデフォルト値です。[/ja]
 */

/**
 * @ngdoc attribute
 * @name fullscreen
 * @description
 *   [en]If this attribute is set the carousel will cover the whole screen.[/en]
 *   [ja]この属性があると、absoluteポジションを使ってカルーセルが自動的に画面いっぱいに広がります。[/ja]
 */

/**
 * @ngdoc attribute
 * @name var
 * @initonly
 * @type {String}
 * @extensionOf angular
 * @description
 *   [en]Variable name to refer this carousel.[/en]
 *   [ja]このカルーセルを参照するための変数名を指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name overscrollable
 * @description
 *   [en]If this attribute is set the carousel will be scrollable over the edge. It will bounce back when released.[/en]
 *   [ja]この属性がある時、タッチやドラッグで端までスクロールした時に、バウンドするような効果が当たります。[/ja]
 */

/**
 * @ngdoc attribute
 * @name item-width
 * @type {String}
 * @description
 *    [en]ons-carousel-item's width. Only works when the direction is set to "horizontal".[/en]
 *    [ja]ons-carousel-itemの幅を指定します。この属性は、direction属性に"horizontal"を指定した時のみ有効になります。[/ja]
 */

/**
 * @ngdoc attribute
 * @name item-height
 * @type {String}
 * @description
 *   [en]ons-carousel-item's height. Only works when the direction is set to "vertical".[/en]
 *   [ja]ons-carousel-itemの高さを指定します。この属性は、direction属性に"vertical"を指定した時のみ有効になります。[/ja]
 */

/**
 * @ngdoc attribute
 * @name auto-scroll
 * @description
 *   [en]If this attribute is set the carousel will be automatically scrolled to the closest item border when released.[/en]
 *   [ja]この属性がある時、一番近いcarousel-itemの境界まで自動的にスクロールするようになります。[/ja]
 */

/**
 * @ngdoc attribute
 * @name auto-scroll-ratio
 * @type {Number}
 * @description
 *    [en]A number between 0.0 and 1.0 that specifies how much the user must drag the carousel in order for it to auto scroll to the next item.[/en]
 *    [ja]0.0から1.0までの値を指定します。カルーセルの要素をどれぐらいの割合までドラッグすると次の要素に自動的にスクロールするかを指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name swipeable
 * @description
 *   [en]If this attribute is set the carousel can be scrolled by drag or swipe.[/en]
 *   [ja]この属性がある時、カルーセルをスワイプやドラッグで移動できるようになります。[/ja]
 */

/**
 * @ngdoc attribute
 * @name disabled
 * @description
 *   [en]If this attribute is set the carousel is disabled.[/en]
 *   [ja]この属性がある時、dragやtouchやswipeを受け付けなくなります。[/ja]
 */

/**
 * @ngdoc attribute
 * @name initial-index
 * @initonly
 * @type {Number}
 * @description
 *   [en]Specify the index of the ons-carousel-item to show initially. Default is 0.[/en]
 *   [ja]最初に表示するons-carousel-itemを0始まりのインデックスで指定します。デフォルト値は 0 です。[/ja]
 */

/**
 * @ngdoc attribute
 * @name auto-refresh
 * @description
 *   [en]When this attribute is set the carousel will automatically refresh when the number of child nodes change.[/en]
 *   [ja]この属性がある時、子要素の数が変わるとカルーセルは自動的に更新されるようになります。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-postchange
 * @initonly
 * @type {Expression}
 * @extensionOf angular
 * @description
 *  [en]Allows you to specify custom behavior when the "postchange" event is fired.[/en]
 *  [ja]"postchange"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-refresh
 * @initonly
 * @type {Expression}
 * @extensionOf angular
 * @description
 *  [en]Allows you to specify custom behavior when the "refresh" event is fired.[/en]
 *  [ja]"refresh"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-overscroll
 * @initonly
 * @type {Expression}
 * @extensionOf angular
 * @description
 *  [en]Allows you to specify custom behavior when the "overscroll" event is fired.[/en]
 *  [ja]"overscroll"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-destroy
 * @initonly
 * @type {Expression}
 * @extensionOf angular
 * @description
 *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
 *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc method
 * @signature next()
 * @description
 *   [en]Show next ons-carousel item.[/en]
 *   [ja]次のons-carousel-itemを表示します。[/ja]
 */

/**
 * @ngdoc method
 * @signature prev()
 * @description
 *   [en]Show previous ons-carousel item.[/en]
 *   [ja]前のons-carousel-itemを表示します。[/ja]
 */

/**
 * @ngdoc method
 * @signature first()
 * @description
 *   [en]Show first ons-carousel item.[/en]
 *   [ja]最初のons-carousel-itemを表示します。[/ja]
 */

/**
 * @ngdoc method
 * @signature last()
 * @description
 *   [en]Show last ons-carousel item.[/en]
 *   [ja]最後のons-carousel-itemを表示します。[/ja]
 */

/**
 * @ngdoc method
 * @signature setSwipeable(swipeable)
 * @param {Boolean} swipeable
 *   [en]If value is true the carousel will be swipeable.[/en]
 *   [ja]swipeableにする場合にはtrueを指定します。[/ja]
 * @description
 *   [en]Set whether the carousel is swipeable or not.[/en]
 *   [ja]swipeできるかどうかを指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature isSwipeable()
 * @return {Boolean}
 *   [en]true if the carousel is swipeable.[/en]
 *   [ja]swipeableであればtrueを返します。[/ja]
 * @description
 *   [en]Returns whether the carousel is swipeable or not.[/en]
 *   [ja]swipeable属性があるかどうかを返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature setActiveCarouselItemIndex(index)
 * @param {Number} index
 *   [en]The index that the carousel should be set to.[/en]
 *   [ja]carousel要素のインデックスを指定します。[/ja]
 * @description
 *   [en]Specify the index of the ons-carousel-item to show.[/en]
 *   [ja]表示するons-carousel-itemをindexで指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature getActiveCarouselItemIndex()
 * @return {Number}
 *   [en]The current carousel item index.[/en]
 *   [ja]現在表示しているカルーセル要素のインデックスが返されます。[/ja]
 * @description
 *   [en]Returns the index of the currently visible ons-carousel-item.[/en]
 *   [ja]現在表示されているons-carousel-item要素のインデックスを返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature getCarouselItemCount)
 * @return {Number}
 *   [en]The number of carousel items.[/en]
 *   [ja]カルーセル要素の数です。[/ja]
 * @description
 *   [en]Returns the current number of carousel items..[/en]
 *   [ja]現在のカルーセル要素を数を返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature setAutoScrollEnabled(enabled)
 * @param {Boolean} enabled
 *   [en]If true auto scroll will be enabled.[/en]
 *   [ja]オートスクロールを有効にする場合にはtrueを渡します。[/ja]
 * @description
 *   [en]Enable or disable "auto-scroll" attribute.[/en]
 *   [ja]auto-scroll属性があるかどうかを設定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature isAutoScrollEnabled()
 * @return {Boolean}
 *   [en]true if auto scroll is enabled.[/en]
 *   [ja]オートスクロールが有効であればtrueを返します。[/ja]
 * @description
 *   [en]Returns whether the "auto-scroll" attribute is set or not.[/en]
 *   [ja]auto-scroll属性があるかどうかを返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature setAutoScrollRatio(ratio)
 * @param {Number} ratio
 *   [en]The desired ratio.[/en]
 *   [ja]オートスクロールするのに必要な0.0から1.0までのratio値を指定します。[/ja]
 * @description
 *   [en]Set the auto scroll ratio. Must be a value between 0.0 and 1.0.[/en]
 *   [ja]オートスクロールするのに必要なratio値を指定します。0.0から1.0を必ず指定しなければならない。[/ja]
 */

/**
 * @ngdoc method
 * @signature getAutoScrollRatio()
 * @return {Number}
 *   [en]The current auto scroll ratio.[/en]
 *   [ja]現在のオートスクロールのratio値。[/ja]
 * @description
 *   [en]Returns the current auto scroll ratio.[/en]
 *   [ja]現在のオートスクロールのratio値を返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature setOverscrollable(overscrollable)
 * @param {Boolean} overscrollable
 *   [en]If true the carousel will be overscrollable.[/en]
 *   [ja]overscrollできるかどうかを指定します。[/ja]
 * @description
 *   [en]Set whether the carousel is overscrollable or not.[/en]
 *   [ja]overscroll属性があるかどうかを設定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature isOverscrollable()
 * @return {Boolean}
 *   [en]Whether the carousel is overscrollable or not.[/en]
 *   [ja]overscrollできればtrueを返します。[/ja]
 * @description
 *   [en]Returns whether the carousel is overscrollable or not.[/en]
 *   [ja]overscroll属性があるかどうかを返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature refresh()
 * @description
 *   [en]Update the layout of the carousel. Used when adding ons-carousel-items dynamically or to automatically adjust the size.[/en]
 *   [ja]レイアウトや内部の状態を最新のものに更新します。ons-carousel-itemを動的に増やしたり、ons-carouselの大きさを動的に変える際に利用します。[/ja]
 */

/**
 * @ngdoc method
 * @signature isDisabled()
 * @return {Boolean}
 *   [en]Whether the carousel is disabled or not.[/en]
 *   [ja]disabled状態になっていればtrueを返します。[/ja]
 * @description
 *   [en]Returns whether the dialog is disabled or enabled.[/en]
 *   [ja]disabled属性があるかどうかを返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature setDisabled(disabled)
 * @param {Boolean} disabled
 *   [en]If true the carousel will be disabled.[/en]
 *   [ja]disabled状態にする場合にはtrueを指定します。[/ja]
 * @description
 *   [en]Disable or enable the dialog.[/en]
 *   [ja]disabled属性があるかどうかを設定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature on(eventName, listener)
 * @extensionOf angular
 * @description
 *   [en]Add an event listener.[/en]
 *   [ja]イベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature once(eventName, listener)
 * @extensionOf angular
 * @description
 *  [en]Add an event listener that's only triggered once.[/en]
 *  [ja]一度だけ呼び出されるイベントリスナを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature off(eventName, [listener])
 * @extensionOf angular
 * @description
 *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
 *  [ja]イベントリスナーを削除します。もしイベントリスナーが指定されなかった場合には、そのイベントに紐付いているイベントリスナーが全て削除されます。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

(function() {
  'use strict';

  var module = angular.module('onsen');

  module.directive('onsCarousel', ['$onsen', 'CarouselView', function($onsen, CarouselView) {
    return {
      restrict: 'E',
      replace: false,

      // NOTE: This element must coexists with ng-controller.
      // Do not use isolated scope and template's ng-transclude.
      scope: false,
      transclude: false,

      compile: function(element, attrs) {
        CustomElements.upgrade(element[0]);

        return function(scope, element, attrs) {
          CustomElements.upgrade(element[0]);
          var carousel = new CarouselView(scope, element, attrs);

          element.data('ons-carousel', carousel);

          $onsen.registerEventHandlers(carousel, 'postchange refresh overscroll destroy');
          $onsen.declareVarAttribute(attrs, carousel);

          scope.$on('$destroy', function() {
            carousel._events = undefined;
            element.data('ons-carousel', undefined);
            element = null;
          });

          if (element[0].hasAttribute('auto-refresh')) {
            // Refresh carousel when items are added or removed.
            scope.$watch(
              function () {
                return element[0].childNodes.length;
              },
              function () {
                setImmediate(function() {
                  carousel.refresh();
                });
              }
            );
          }

          setImmediate(function() {
            carousel.refresh();
          });

          $onsen.fireComponentEvent(element[0], 'init');
        };
      },

    };
  }]);

  module.directive('onsCarouselItem', function() {
    return {
      restrict: 'E',
      compile: function(element, attrs) {
        CustomElements.upgrade(element[0]);
        return function(scope, element, attrs) {
          CustomElements.upgrade(element[0]);
        };
      }
    };
  });

})();


/**
 * @ngdoc directive
 * @id col
 * @name ons-col
 * @category grid
 * @description
 *   [en]Represents a column in the grid system. Use with ons-row to layout components.[/en]
 *   [ja]グリッドシステムにて列を定義します。ons-rowとともに使用し、コンポーネントのレイアウトに利用します。[/ja]
 * @note
 *   [en]For Android 4.3 and earlier, and iOS6 and earlier, when using mixed alignment with ons-row and ons-column, they may not be displayed correctly. You can use only one align.[/en]
 *   [ja]Android 4.3以前、もしくはiOS 6以前のOSの場合、ons-rowとons-columnを組み合わせた場合に描画が崩れる場合があります。[/ja]
 * @codepen GgujC {wide}
 * @guide layouting [en]Layouting guide[/en][ja]レイアウト機能[/ja]
 * @seealso ons-row [en]ons-row component[/en][ja]ons-rowコンポーネント[/ja]
 * @example
 * <ons-row>
 *   <ons-col width="50px"><ons-icon icon="fa-twitter"></ons-icon></ons-col>
 *   <ons-col>Text</ons-col>
 * </ons-row>
 */

/**
 * @ngdoc attribute
 * @name vertical-align
 * @type {String}
 * @description
 *   [en]Vertical alignment of the column. Valid values are "top", "center", and "bottom".[/en]
 *   [ja]縦の配置を指定する。"top", "center", "bottom"のいずれかを指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name width
 * @type {String}
 * @description
 *   [en]The width of the column. Valid values are css width values ("10%", "50px").[/en]
 *   [ja]カラムの横幅を指定する。パーセントもしくはピクセルで指定します（10%や50px）。[/ja]
 */

/**
 * @ngdoc directive
 * @id dialog
 * @name ons-dialog
 * @category dialog
 * @modifier material
 *   [en]Display a Material Design dialog.[/en]
 *   [ja]マテリアルデザインのダイアログを表示します。[/ja]
 * @description
 *  [en]Dialog that is displayed on top of current screen.[/en]
 *  [ja]現在のスクリーンにダイアログを表示します。[/ja]
 * @codepen zxxaGa
 * @guide UsingDialog
 *   [en]Learn how to use the dialog component.[/en]
 *   [ja]ダイアログコンポーネントの使い方[/ja]
 * @seealso ons-alert-dialog
 *   [en]ons-alert-dialog component[/en]
 *   [ja]ons-alert-dialogコンポーネント[/ja]
 * @seealso ons-popover
 *   [en]ons-popover component[/en]
 *   [ja]ons-popoverコンポーネント[/ja]
 * @example
 * <script>
 *   ons.ready(function() {
 *     ons.createDialog('dialog.html').then(function(dialog) {
 *       dialog.show();
 *     });
 *   });
 * </script>
 *
 * <script type="text/ons-template" id="dialog.html">
 *   <ons-dialog cancelable>
 *     ...
 *   </ons-dialog>
 * </script>
 */

/**
 * @ngdoc event
 * @name preshow
 * @description
 * [en]Fired just before the dialog is displayed.[/en]
 * [ja]ダイアログが表示される直前に発火します。[/ja]
 * @param {Object} event [en]Event object.[/en]
 * @param {Object} event.dialog
 *   [en]Component object.[/en]
 *   [ja]コンポーネントのオブジェクト。[/ja]
 * @param {Function} event.cancel 
 *   [en]Execute this function to stop the dialog from being shown.[/en]
 *   [ja]この関数を実行すると、ダイアログの表示がキャンセルされます。[/ja]
 */

/**
 * @ngdoc event
 * @name postshow
 * @description
 * [en]Fired just after the dialog is displayed.[/en]
 * [ja]ダイアログが表示された直後に発火します。[/ja]
 * @param {Object} event [en]Event object.[/en]
 * @param {Object} event.dialog
 *   [en]Component object.[/en]
 *   [ja]コンポーネントのオブジェクト。[/ja]
 */

/**
 * @ngdoc event
 * @name prehide
 * @description
 * [en]Fired just before the dialog is hidden.[/en]
 * [ja]ダイアログが隠れる直前に発火します。[/ja]
 * @param {Object} event [en]Event object.[/en]
 * @param {Object} event.dialog
 *   [en]Component object.[/en]
 *   [ja]コンポーネントのオブジェクト。[/ja]
 * @param {Function} event.cancel 
 *   [en]Execute this function to stop the dialog from being hidden.[/en]
 *   [ja]この関数を実行すると、ダイアログの非表示がキャンセルされます。[/ja]
 */

/**
 * @ngdoc event
 * @name posthide
 * @description
 * [en]Fired just after the dialog is hidden.[/en]
 * [ja]ダイアログが隠れた後に発火します。[/ja]
 * @param {Object} event [en]Event object.[/en]
 * @param {Object} event.dialog
 *   [en]Component object.[/en]
 *   [ja]コンポーネントのオブジェクト。[/ja]
 */

/**
 * @ngdoc attribute
 * @name var
 * @initonly
 * @type {String}
 * @extensionOf angular
 * @description
 *  [en]Variable name to refer this dialog.[/en]
 *  [ja]このダイアログを参照するための名前を指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name modifier
 * @type {String}
 * @description
 *  [en]The appearance of the dialog.[/en]
 *  [ja]ダイアログの表現を指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name cancelable
 * @description
 *  [en]If this attribute is set the dialog can be closed by tapping the background or by pressing the back button.[/en]
 *  [ja]この属性があると、ダイアログが表示された時に、背景やバックボタンをタップした時にダイアログを閉じます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name disabled
 * @description
 *  [en]If this attribute is set the dialog is disabled.[/en]
 *  [ja]この属性がある時、ダイアログはdisabled状態になります。[/ja]
 */

/**
 * @ngdoc attribute
 * @name animation
 * @type {String}
 * @default default
 * @description
 *  [en]The animation used when showing and hiding the dialog. Can be either "none" or "default".[/en]
 *  [ja]ダイアログを表示する際のアニメーション名を指定します。"none"もしくは"default"を指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name animation-options
 * @type {Expression}
 * @description
 *  [en]Specify the animation's duration, timing and delay with an object literal. E.g. <code>{duration: 0.2, delay: 1, timing: 'ease-in'}</code>[/en]
 *  [ja]アニメーション時のduration, timing, delayをオブジェクトリテラルで指定します。e.g. <code>{duration: 0.2, delay: 1, timing: 'ease-in'}</code>[/ja]
 */

/**
 * @ngdoc attribute
 * @name mask-color
 * @type {String}
 * @default rgba(0, 0, 0, 0.2)
 * @description
 *  [en]Color of the background mask. Default is "rgba(0, 0, 0, 0.2)".[/en]
 *  [ja]背景のマスクの色を指定します。"rgba(0, 0, 0, 0.2)"がデフォルト値です。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-preshow
 * @initonly
 * @extensionOf angular
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "preshow" event is fired.[/en]
 *  [ja]"preshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-prehide
 * @initonly
 * @extensionOf angular
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "prehide" event is fired.[/en]
 *  [ja]"prehide"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-postshow
 * @extensionOf angular
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "postshow" event is fired.[/en]
 *  [ja]"postshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-posthide
 * @extensionOf angular
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "posthide" event is fired.[/en]
 *  [ja]"posthide"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-destroy
 * @extensionOf angular
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
 *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc method
 * @signature show([options])
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {String} [options.animation]
 *   [en]Animation name. Available animations are "none", "fade" and "slide".[/en]
 *   [ja]アニメーション名を指定します。"none", "fade", "slide"のいずれかを指定します。[/ja]
 * @param {String} [options.animationOptions]
 *   [en]Specify the animation's duration, delay and timing. E.g.  <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code>[/en]
 *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code> [/ja]
 * @param {Function} [options.callback]
 *   [en]This function is called after the dialog has been revealed.[/en]
 *   [ja]ダイアログが表示され終わった後に呼び出される関数オブジェクトを指定します。[/ja]
 * @description
 *  [en]Show the dialog.[/en]
 *  [ja]ダイアログを開きます。[/ja]
 */

/**
 * @ngdoc method
 * @signature hide([options])
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {String} [options.animation]
 *   [en]Animation name. Available animations are "none", "fade" and "slide".[/en]
 *   [ja]アニメーション名を指定します。"none", "fade", "slide"のいずれかを指定できます。[/ja]
 * @param {String} [options.animationOptions]
 *   [en]Specify the animation's duration, delay and timing. E.g.  <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code>[/en]
 *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code> [/ja]
 * @param {Function} [options.callback]
 *   [en]This functions is called after the dialog has been hidden.[/en]
 *   [ja]ダイアログが隠れた後に呼び出される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]Hide the dialog.[/en]
 *   [ja]ダイアログを閉じます。[/ja]
 */

/**
 * @ngdoc method
 * @signature isShown()
 * @description
 *   [en]Returns whether the dialog is visible or not.[/en]
 *   [ja]ダイアログが表示されているかどうかを返します。[/ja]
 * @return {Boolean}
 *   [en]true if the dialog is visible.[/en]
 *   [ja]ダイアログが表示されている場合にtrueを返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature destroy()
 * @description
 *  [en]Destroy the dialog and remove it from the DOM tree.[/en]
 *  [ja]ダイアログを破棄して、DOMツリーから取り除きます。[/ja]
 */

/**
 * @ngdoc method
 * @signature getDeviceBackButtonHandler()
 * @return {Object}
 *   [en]Device back button handler.[/en]
 *   [ja]デバイスのバックボタンハンドラを返します。[/ja]
 * @description
 *   [en]Retrieve the back button handler for overriding the default behavior.[/en]
 *   [ja]バックボタンハンドラを取得します。デフォルトの挙動を変更することができます。[/ja]
 */

/**
 * @ngdoc method
 * @signature setCancelable(cancelable)
 * @param {Boolean} cancelable
 *   [en]If true the dialog will be cancelable.[/en]
 *   [ja]ダイアログをキャンセル可能にする場合trueを指定します。[/ja]
 * @description
 *   [en]Define whether the dialog can be canceled by the user or not.[/en]
 *   [ja]ダイアログを表示した際に、ユーザがそのダイアログをキャンセルできるかどうかを指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature isCancelable()
 * @description
 *   [en]Returns whether the dialog is cancelable or not.[/en]
 *   [ja]このダイアログがキャンセル可能かどうかを返します。[/ja]
 * @return {Boolean}
 *   [en]true if the dialog is cancelable.[/en]
 *   [ja]ダイアログがキャンセル可能な場合trueを返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature setDisabled(disabled)
 * @description
 *   [en]Disable or enable the dialog.[/en]
 *   [ja]このダイアログをdisabled状態にするかどうかを設定します。[/ja]
 * @param {Boolean} disabled
 *   [en]If true the dialog will be disabled.[/en]
 *   [ja]trueを指定するとダイアログをdisabled状態になります。[/ja]
 */

/**
 * @ngdoc method
 * @signature isDisabled()
 * @description
 *   [en]Returns whether the dialog is disabled or enabled.[/en]
 *   [ja]このダイアログがdisabled状態かどうかを返します。[/ja]
 * @return {Boolean}
 *   [en]true if the dialog is disabled.[/en]
 *   [ja]ダイアログがdisabled状態の場合trueを返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature on(eventName, listener)
 * @extensionOf angular
 * @description
 *   [en]Add an event listener.[/en]
 *   [ja]イベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature once(eventName, listener)
 * @extensionOf angular
 * @description
 *  [en]Add an event listener that's only triggered once.[/en]
 *  [ja]一度だけ呼び出されるイベントリスナを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature off(eventName, [listener])
 * @extensionOf angular
 * @description
 *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
 *  [ja]イベントリスナーを削除します。もしイベントリスナーが指定されなかった場合には、そのイベントに紐付いているイベントリスナーが全て削除されます。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

(function() {
  'use strict';

  angular.module('onsen').directive('onsDialog', ['$onsen', 'DialogView', function($onsen, DialogView) {
    return {
      restrict: 'E',
      scope: true,
      
      compile: function(element, attrs) {
        CustomElements.upgrade(element[0]);

        return {
          pre: function(scope, element, attrs) {
            CustomElements.upgrade(element[0]);

            var dialog = new DialogView(scope, element, attrs);
            $onsen.declareVarAttribute(attrs, dialog);
            $onsen.registerEventHandlers(dialog, 'preshow prehide postshow posthide destroy');
            $onsen.addModifierMethodsForCustomElements(dialog, element);

            element.data('ons-dialog', dialog);
            scope.$on('$destroy', function() {
              dialog._events = undefined;
              $onsen.removeModifierMethods(dialog);
              element.data('ons-dialog', undefined);
              element = null;
            });
          },

          post: function(scope, element) {
            $onsen.fireComponentEvent(element[0], 'init');
          }
        };
      }
    };
  }]);

})();

(function() {
  'use strict';

  var module = angular.module('onsen');

  module.directive('onsDummyForInit', ['$rootScope', function($rootScope) {
    var isReady = false;

    return {
      restrict: 'E',
      replace: false,

      link: {
        post: function(scope, element) {
          if (!isReady) {
            isReady = true;
            $rootScope.$broadcast('$ons-ready');
          }
          element.remove();
        }
      }
    };
  }]);

})();

/**
 * @ngdoc directive
 * @id gestureDetector
 * @name ons-gesture-detector
 * @category input
 * @description
 *   [en]Component to detect finger gestures within the wrapped element. See the guide for more details.[/en]
 *   [ja]要素内のジェスチャー操作を検知します。詳しくはガイドを参照してください。[/ja]
 * @guide DetectingFingerGestures
 *   [en]Detecting finger gestures[/en]
 *   [ja]ジェスチャー操作の検知[/ja]
 * @example
 * <ons-gesture-detector>
 *   ...
 * </ons-gesture-detector>
 */
(function() {
  'use strict';

  var EVENTS =
    ('drag dragleft dragright dragup dragdown hold release swipe swipeleft swiperight ' +
      'swipeup swipedown tap doubletap touch transform pinch pinchin pinchout rotate').split(/ +/);

  angular.module('onsen').directive('onsGestureDetector', ['$onsen', function($onsen) {

    var scopeDef = EVENTS.reduce(function(dict, name) {
      dict['ng' + titlize(name)] = '&';
      return dict;
    }, {});

    function titlize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return {
      restrict: 'E',
      scope: scopeDef,

      // NOTE: This element must coexists with ng-controller.
      // Do not use isolated scope and template's ng-transclude.
      replace: false,
      transclude: true,

      compile: function(element, attrs) {
        return function link(scope, element, attrs, _, transclude) {

          transclude(scope.$parent, function(cloned) {
            element.append(cloned);
          });

          var handler = function(event) {
            var attr = 'ng' + titlize(event.type);

            if (attr in scopeDef) {
              scope[attr]({$event: event});
            }
          };

          var gestureDetector;

          setImmediate(function() {
            gestureDetector = element[0]._gestureDetector;
            gestureDetector.on(EVENTS.join(' '), handler);
          });

          $onsen.cleaner.onDestroy(scope, function() {
            gestureDetector.off(EVENTS.join(' '), handler);
            $onsen.clearComponent({
              scope: scope,
              element: element,
              attrs: attrs
            });
            gestureDetector.element = scope = element = attrs = null;
          });

          $onsen.fireComponentEvent(element[0], 'init');
        };
      }
    };
  }]);
})();


/**
 * @ngdoc directive
 * @id icon
 * @name ons-icon
 * @category icon
 * @description
 *   [en]Displays an icon. Font Awesome and Ionicon icons are supported.[/en]
 *   [ja]アイコンを表示するコンポーネントです。Font AwesomeもしくはIoniconsから選択できます。[/ja]
 * @codepen xAhvg
 * @guide UsingIcons [en]Using icons[/en][ja]アイコンを使う[/ja]
 * @example
 * <ons-icon
 *   icon="fa-twitter"
 *   size="20px"
 *   fixed-width="false"
 *   style="color: red">
 * </ons-icon>
 */

/**
 * @ngdoc attribute
 * @name icon
 * @type {String}
 * @description
 *   [en]The icon name. <code>fa-</code> prefix for Font Awesome, <code>ion-</code> prefix for Ionicons icons. See all icons at http://fontawesome.io/icons/ and http://ionicons.com.[/en]
 *   [ja]アイコン名を指定します。<code>fa-</code>で始まるものはFont Awesomeとして、<code>ion-</code>で始まるものはIoniconsとして扱われます。使用できるアイコンはこちら: http://fontawesome.io/icons/　および　http://ionicons.com。[/ja]
 */

/**
 * @ngdoc attribute
 * @name size
 * @type {String}
 * @description
 *   [en]The sizes of the icon. Valid values are lg, 2x, 3x, 4x, 5x, or in pixels.[/en]
 *   [ja]アイコンのサイズを指定します。値は、lg, 2x, 3x, 4x, 5xもしくはピクセル単位で指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name rotate
 * @type {Number}
 * @description
 *   [en]Number of degrees to rotate the icon. Valid values are 90, 180, or 270.[/en]
 *   [ja]アイコンを回転して表示します。90, 180, 270から指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name flip
 * @type {String}
 * @description
 *   [en]Flip the icon. Valid values are "horizontal" and "vertical".[/en]
 *   [ja]アイコンを反転します。horizontalもしくはverticalを指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name fixed-width
 * @type {Boolean}
 * @default false
 * @description
 *  [en]When used in the list, you want the icons to have the same width so that they align vertically by setting the value to true. Valid values are true, false. Default is false.[/en]
 *  [ja]等幅にするかどうかを指定します。trueもしくはfalseを指定できます。デフォルトはfalseです。[/ja]
 */

/**
 * @ngdoc attribute
 * @name spin
 * @type {Boolean}
 * @default false
 * @description
 *   [en]Specify whether the icon should be spinning. Valid values are true and false.[/en]
 *   [ja]アイコンを回転するかどうかを指定します。trueもしくはfalseを指定できます。[/ja]
 */


/**
 * @ngdoc directive
 * @id if-orientation
 * @name ons-if-orientation
 * @category util
 * @extensionOf angular
 * @description
 *   [en]Conditionally display content depending on screen orientation. Valid values are portrait and landscape. Different from other components, this component is used as attribute in any element.[/en]
 *   [ja]画面の向きに応じてコンテンツの制御を行います。portraitもしくはlandscapeを指定できます。すべての要素の属性に使用できます。[/ja]
 * @seealso ons-if-platform [en]ons-if-platform component[/en][ja]ons-if-platformコンポーネント[/ja]
 * @guide UtilityAPIs [en]Other utility APIs[/en][ja]他のユーティリティAPI[/ja]
 * @example
 * <div ons-if-orientation="portrait">
 *   <p>This will only be visible in portrait mode.</p>
 * </div>
 */

/**
 * @ngdoc attribute
 * @name ons-if-orientation
 * @initonly
 * @extensionOf angular
 * @type {String}
 * @description
 *   [en]Either "portrait" or "landscape".[/en]
 *   [ja]portraitもしくはlandscapeを指定します。[/ja]
 */

(function(){
  'use strict';

  var module = angular.module('onsen');

  module.directive('onsIfOrientation', ['$onsen', '$onsGlobal', function($onsen, $onsGlobal) {
    return {
      restrict: 'A',
      replace: false,

      // NOTE: This element must coexists with ng-controller.
      // Do not use isolated scope and template's ng-transclude.
      transclude: false,
      scope: false,

      compile: function(element) {
        element.css('display', 'none');

        return function(scope, element, attrs) {
          element.addClass('ons-if-orientation-inner');

          attrs.$observe('onsIfOrientation', update);
          $onsGlobal.orientation.on('change', update);

          update();

          $onsen.cleaner.onDestroy(scope, function() {
            $onsGlobal.orientation.off('change', update);

            $onsen.clearComponent({
              element: element,
              scope: scope,
              attrs: attrs
            });
            element = scope = attrs = null;
          });

          function update() {
            var userOrientation = ('' + attrs.onsIfOrientation).toLowerCase();
            var orientation = getLandscapeOrPortrait();

            if (userOrientation === 'portrait' || userOrientation === 'landscape') {
              if (userOrientation === orientation) {
                element.css('display', '');
              } else {
                element.css('display', 'none');
              }
            }
          }

          function getLandscapeOrPortrait() {
            return $onsGlobal.orientation.isPortrait() ? 'portrait' : 'landscape';
          }
        };
      }
    };
  }]);
})();


/**
 * @ngdoc directive
 * @id if-platform
 * @name ons-if-platform
 * @category util
 * @extensionOf angular
 * @description
 *    [en]Conditionally display content depending on the platform / browser. Valid values are "ios", "android", "blackberry", "chrome", "safari", "firefox", and "opera".[/en]
 *    [ja]プラットフォームやブラウザーに応じてコンテンツの制御をおこないます。ios, android, blackberry, chrome, safari, firefox, operaのいずれかの値を空白区切りで複数指定できます。[/ja]
 * @seealso ons-if-orientation [en]ons-if-orientation component[/en][ja]ons-if-orientationコンポーネント[/ja]
 * @guide UtilityAPIs [en]Other utility APIs[/en][ja]他のユーティリティAPI[/ja]
 * @example
 * <div ons-if-platform="android">
 *   ...
 * </div>
 */

/**
 * @ngdoc attribute
 * @name ons-if-platform
 * @type {String}
 * @initonly
 * @extensionOf angular
 * @description
 *   [en]One or multiple space separated values: "opera", "firefox", "safari", "chrome", "ie", "android", "blackberry", "ios" or "wp".[/en]
 *   [ja]"opera", "firefox", "safari", "chrome", "ie", "android", "blackberry", "ios", "wp"のいずれか空白区切りで複数指定できます。[/ja]
 */

(function() {
  'use strict';

  var module = angular.module('onsen');

  module.directive('onsIfPlatform', ['$onsen', function($onsen) {
    return {
      restrict: 'A',
      replace: false,

      // NOTE: This element must coexists with ng-controller.
      // Do not use isolated scope and template's ng-transclude.
      transclude: false,
      scope: false,

      compile: function(element) {
        element.addClass('ons-if-platform-inner');
        element.css('display', 'none');

        var platform = getPlatformString();

        return function(scope, element, attrs) {
          attrs.$observe('onsIfPlatform', function(userPlatform) {
            if (userPlatform) {
              update();
            }
          });

          update();

          $onsen.cleaner.onDestroy(scope, function() {
            $onsen.clearComponent({
              element: element,
              scope: scope,
              attrs: attrs
            });
            element = scope = attrs = null;
          });

          function update() {
            var userPlatforms = attrs.onsIfPlatform.toLowerCase().trim().split(/\s+/);
            if (userPlatforms.indexOf(platform.toLowerCase()) >= 0) {
              element.css('display', 'block');
            } else {
              element.css('display', 'none');
            }
          }
        };

        function getPlatformString() {

          if (navigator.userAgent.match(/Android/i)) {
            return 'android';
          }

          if ((navigator.userAgent.match(/BlackBerry/i)) || (navigator.userAgent.match(/RIM Tablet OS/i)) || (navigator.userAgent.match(/BB10/i))) {
            return 'blackberry';
          }

          if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
            return 'ios';
          }

          if (navigator.userAgent.match(/Windows Phone|IEMobile|WPDesktop/i)) {
            return 'wp';
          }

          // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
          var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
          if (isOpera) {
            return 'opera';
          }

          var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
          if (isFirefox) {
            return 'firefox';
          }

          var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
          // At least Safari 3+: "[object HTMLElementConstructor]"
          if (isSafari) {
            return 'safari';
          }

          var isChrome = !!window.chrome && !isOpera; // Chrome 1+
          if (isChrome) {
            return 'chrome';
          }

          var isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6
          if (isIE) {
            return 'ie';
          }

          return 'unknown';
        }
      }
    };
  }]);
})();

/**
 * @ngdoc directive
 * @id ons-keyboard-active
 * @name ons-keyboard-active
 * @category input
 * @extensionOf angular
 * @description
 *   [en]
 *     Conditionally display content depending on if the software keyboard is visible or hidden.
 *     This component requires cordova and that the com.ionic.keyboard plugin is installed.
 *   [/en]
 *   [ja]
 *     ソフトウェアキーボードが表示されているかどうかで、コンテンツを表示するかどうかを切り替えることが出来ます。
 *     このコンポーネントは、Cordovaやcom.ionic.keyboardプラグインを必要とします。
 *   [/ja]
 * @guide UtilityAPIs
 *   [en]Other utility APIs[/en]
 *   [ja]他のユーティリティAPI[/ja]
 * @example
 * <div ons-keyboard-active>
 *   This will only be displayed if the software keyboard is open.
 * </div>
 * <div ons-keyboard-inactive>
 *   There is also a component that does the opposite.
 * </div>
 */

/**
 * @ngdoc attribute
 * @name ons-keyboard-active
 * @description
 *   [en]The content of tags with this attribute will be visible when the software keyboard is open.[/en]
 *   [ja]この属性がついた要素は、ソフトウェアキーボードが表示された時に初めて表示されます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-keyboard-inactive
 * @description
 *   [en]The content of tags with this attribute will be visible when the software keyboard is hidden.[/en]
 *   [ja]この属性がついた要素は、ソフトウェアキーボードが隠れている時のみ表示されます。[/ja]
 */

(function() {
  'use strict';

  var module = angular.module('onsen');

  var compileFunction = function(show, $onsen) {
    return function(element) {
      return function(scope, element, attrs) {
        var dispShow = show ? 'block' : 'none',
            dispHide = show ? 'none' : 'block';

        var onShow = function() {
          element.css('display', dispShow);
        };

        var onHide = function() {
          element.css('display', dispHide);
        };

        var onInit = function(e) {
          if (e.visible) {
            onShow();
          } else {
            onHide();
          }
        };

        ons.softwareKeyboard.on('show', onShow);
        ons.softwareKeyboard.on('hide', onHide);
        ons.softwareKeyboard.on('init', onInit);

        if (ons.softwareKeyboard._visible) {
          onShow();
        } else {
          onHide();
        }

        $onsen.cleaner.onDestroy(scope, function() {
          ons.softwareKeyboard.off('show', onShow);
          ons.softwareKeyboard.off('hide', onHide);
          ons.softwareKeyboard.off('init', onInit);

          $onsen.clearComponent({
            element: element,
            scope: scope,
            attrs: attrs
          });
          element = scope = attrs = null;
        });
      };
    };
  };

  module.directive('onsKeyboardActive', ['$onsen', function($onsen) {
    return {
      restrict: 'A',
      replace: false,
      transclude: false,
      scope: false,
      compile: compileFunction(true, $onsen)
    };
  }]);

  module.directive('onsKeyboardInactive', ['$onsen', function($onsen) {
    return {
      restrict: 'A',
      replace: false,
      transclude: false,
      scope: false,
      compile: compileFunction(false, $onsen)
    };
  }]);
})();

/**
 * @ngdoc directive
 * @id lazy-repeat
 * @name ons-lazy-repeat
 * @extensionOf angular
 * @category control
 * @description 
 *   [en]
 *     Using this component a list with millions of items can be rendered without a drop in performance.
 *     It does that by "lazily" loading elements into the DOM when they come into view and
 *     removing items from the DOM when they are not visible.
 *   [/en]
 *   [ja]
 *     このコンポーネント内で描画されるアイテムのDOM要素の読み込みは、画面に見えそうになった時まで自動的に遅延され、
 *     画面から見えなくなった場合にはその要素は動的にアンロードされます。
 *     このコンポーネントを使うことで、パフォーマンスを劣化させること無しに巨大な数の要素を描画できます。
 *   [/ja]
 * @codepen QwrGBm
 * @guide UsingLazyRepeat 
 *   [en]How to use Lazy Repeat[/en]
 *   [ja]レイジーリピートの使い方[/ja]
 * @example
 * <script>
 *   ons.bootstrap()
 *
 *   .controller('MyController', function($scope) {
 *     $scope.MyDelegate = {
 *       countItems: function() {
 *         // Return number of items.
 *         return 1000000;
 *       },
 *
 *       calculateItemHeight: function(index) {
 *         // Return the height of an item in pixels.
 *         return 45;
 *       },
 *
 *       configureItemScope: function(index, itemScope) {
 *         // Initialize scope
 *         itemScope.item = 'Item #' + (index + 1);
 *       },
 *
 *       destroyItemScope: function(index, itemScope) {
 *         // Optional method that is called when an item is unloaded.
 *         console.log('Destroyed item with index: ' + index);
 *       }
 *     };
 *   });
 * </script>
 *
 * <ons-list ng-controller="MyController">
 *   <ons-list-item ons-lazy-repeat="MyDelegate">
 *     {{ item }}
 *   </ons-list-item>
 * </ons-list>
 */

/**
 * @ngdoc attribute
 * @name ons-lazy-repeat
 * @type {Expression}
 * @initonly
 * @extensionOf angular
 * @description
 *  [en]A delegate object, can be either an object attached to the scope (when using AngularJS) or a normal JavaScript variable.[/en]
 *  [ja]要素のロード、アンロードなどの処理を委譲するオブジェクトを指定します。AngularJSのスコープの変数名や、通常のJavaScriptの変数名を指定します。[/ja]
 */

(function() {
  'use strict';

  var module = angular.module('onsen');

  /**
   * Lazy repeat directive.
   */
  module.directive('onsLazyRepeat', ['$onsen', 'LazyRepeatView', function($onsen, LazyRepeatView) {
    return {
      restrict: 'A',
      replace: false,
      priority: 1000,
      terminal: true,

      compile: function(element, attrs) {
        return function(scope, element, attrs) {
          var lazyRepeat = new LazyRepeatView(scope, element, attrs);

          scope.$on('$destroy', function() {
            scope = element = attrs = lazyRepeat = null;
          });
        };
      }
    };
  }]);

})();

/**
 * @ngdoc directive
 * @id list
 * @name ons-list
 * @category list
 * @modifier inset
 *   [en]Inset list that doesn't cover the whole width of the parent.[/en]
 *   [ja]親要素の画面いっぱいに広がらないリストを表示します。[/ja]
 * @modifier noborder
 *   [en]A list with no borders at the top and bottom.[/en]
 *   [ja]リストの上下のボーダーが無いリストを表示します。[/ja]
 * @description
 *   [en]Component to define a list, and the container for ons-list-item(s).[/en]
 *   [ja]リストを表現するためのコンポーネント。ons-list-itemのコンテナとして使用します。[/ja]
 * @seealso ons-list-item
 *   [en]ons-list-item component[/en]
 *   [ja]ons-list-itemコンポーネント[/ja]
 * @seealso ons-list-header
 *   [en]ons-list-header component[/en]
 *   [ja]ons-list-headerコンポーネント[/ja]
 * @guide UsingList
 *   [en]Using lists[/en]
 *   [ja]リストを使う[/ja]
 * @codepen yxcCt
 * @example
 * <ons-list>
 *   <ons-list-header>Header Text</ons-list-header>
 *   <ons-list-item>Item</ons-list-item>
 *   <ons-list-item>Item</ons-list-item>
 * </ons-list>
 */

/**
 * @ngdoc attribute
 * @name modifier
 * @type {String}
 * @description
 *   [en]The appearance of the list.[/en]
 *   [ja]リストの表現を指定します。[/ja]
 */

(function() {
  'use strict';

  angular.module('onsen').directive('onsList', ['$onsen', 'GenericView', function($onsen, GenericView) {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        CustomElements.upgrade(element[0]);
        GenericView.register(scope, element, attrs, {viewKey: 'ons-list'});
        $onsen.fireComponentEvent(element[0], 'init');
      }
    };
  }]);

})();

/**
 * @ngdoc directive
 * @id list-header
 * @name ons-list-header
 * @category list
 * @description
 *   [en]Header element for list items. Must be put inside ons-list component.[/en]
 *   [ja]リスト要素に使用するヘッダー用コンポーネント。ons-listと共に使用します。[/ja]
 * @seealso ons-list
 *   [en]ons-list component[/en]
 *   [ja]ons-listコンポーネント[/ja]
 * @seealso ons-list-item [en]ons-list-item component[/en][ja]ons-list-itemコンポーネント[/ja]
 * @guide UsingList [en]Using lists[/en][ja]リストを使う[/ja]
 * @codepen yxcCt
 * @example
 * <ons-list>
 *   <ons-list-header>Header Text</ons-list-header>
 *   <ons-list-item>Item</ons-list-item>
 *   <ons-list-item>Item</ons-list-item>
 * </ons-list>
 */

/**
 * @ngdoc attribute
 * @name modifier
 * @type {String}
 * @description
 *   [en]The appearance of the list header.[/en]
 *   [ja]ヘッダーの表現を指定します。[/ja]
 */

(function() {
  'use strict';

  angular.module('onsen').directive('onsListHeader', ['$onsen', 'GenericView', function($onsen, GenericView) {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        CustomElements.upgrade(element[0]);
        GenericView.register(scope, element, attrs, {viewKey: 'ons-listHeader'});
        $onsen.fireComponentEvent(element[0], 'init');
      }
    };
  }]);

})();

/**
 * @ngdoc directive
 * @id list-item
 * @name ons-list-item
 * @category list
 * @modifier tight
 *   [en]Remove the space above and below the item content. This is useful for multi-line content.[/en]
 *   [ja]行間のスペースを取り除きます。複数行の内容をリストで扱う場合に便利です。[/ja]
 * @modifier tappable
 *   [en]Make the list item change appearance when it's tapped.[/en]
 *   [ja]タップやクリックした時に効果が表示されるようになります。[/ja]
 * @modifier chevron
 *   [en]Display a chevron at the right end of the list item and make it change appearance when tapped.[/en]
 *   [ja]要素の右側に右矢印が表示されます。また、タップやクリックした時に効果が表示されるようになります。[/ja]
 * @description
 *   [en]Component that represents each item in the list. Must be put inside the ons-list component.[/en]
 *   [ja]リストの各要素を表現するためのコンポーネントです。ons-listコンポーネントと共に使用します。[/ja]
 * @seealso ons-list
 *   [en]ons-list component[/en]
 *   [ja]ons-listコンポーネント[/ja]
 * @seealso ons-list-header
 *   [en]ons-list-header component[/en]
 *   [ja]ons-list-headerコンポーネント[/ja]
 * @guide UsingList
 *   [en]Using lists[/en]
 *   [ja]リストを使う[/ja]
 * @codepen yxcCt
 * @example
 * <ons-list>
 *   <ons-list-header>Header Text</ons-list-header>
 *   <ons-list-item>Item</ons-list-item>
 *   <ons-list-item>Item</ons-list-item>
 * </ons-list>
 */

/**
 * @ngdoc attribute
 * @name modifier
 * @type {String}
 * @description
 *   [en]The appearance of the list item.[/en]
 *   [ja]各要素の表現を指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name lock-on-drag
 * @type {String}
 * @description
 *   [en]Prevent vertical scrolling when the user drags horizontally.[/en]
 *   [ja]この属性があると、ユーザーがこの要素を横方向にドラッグしている時に、縦方向のスクロールが起きないようになります。[/ja]
 */

(function() {
  'use strict';

  angular.module('onsen').directive('onsListItem', ['$onsen', 'GenericView', function($onsen, GenericView) {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        CustomElements.upgrade(element[0]);
        GenericView.register(scope, element, attrs, {viewKey: 'ons-list-item'});
        $onsen.fireComponentEvent(element[0], 'init');
      }
    };
  }]);
})();

/**
 * @ngdoc directive
 * @id loading-placeholder
 * @name ons-loading-placeholder
 * @category util
 * @description
 *   [en]Display a placeholder while the content is loading.[/en]
 *   [ja]Onsen UIが読み込まれるまでに表示するプレースホルダーを表現します。[/ja]
 * @guide UtilityAPIs [en]Other utility APIs[/en][ja]他のユーティリティAPI[/ja]
 * @example
 * <div ons-loading-placeholder="page.html">
 *   Loading...
 * </div>
 */

/**
 * @ngdoc attribute
 * @name ons-loading-placeholder
 * @initonly
 * @type {String}
 * @description
 *   [en]The url of the page to load.[/en]
 *   [ja]読み込むページのURLを指定します。[/ja]
 */

(function(){
  'use strict';

  angular.module('onsen').directive('onsLoadingPlaceholder', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        CustomElements.upgrade(element[0]);
        if (attrs.onsLoadingPlaceholder) {
          ons._resolveLoadingPlaceholder(element[0], attrs.onsLoadingPlaceholder, function(contentElement, done) {
            CustomElements.upgrade(contentElement);
            ons.compile(contentElement);
            scope.$evalAsync(function() {
              setImmediate(done);
            });
          });
        }
      }
    };
  });
})();

/**
 * @ngdoc directive
 * @id material-input
 * @name ons-material-input
 * @category form
 * @description
 *  [en]Material Design input component.[/en]
 *  [ja]Material Designのinputコンポ―ネントです。[/ja]
 * @guide UsingFormComponents
 *   [en]Using form components[/en]
 *   [ja]フォームを使う[/ja]
 * @guide EventHandling
 *   [en]Event handling descriptions[/en]
 *   [ja]イベント処理の使い方[/ja]
 * @example
 * <ons-material-input label="Username"></ons-material-input>
 */

/**
 * @ngdoc attribute
 * @name label
 * @type {String}
 * @description
 *   [en]Text for animated floating label.[/en]
 *   [ja]アニメーションさせるフローティングラベルのテキストを指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name no-float
 * @description
 *  [en]If this attribute is present, the label will not be animated.[/en]
 *  [ja]この属性が設定された時、ラベルはアニメーションしないようになります。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ng-model
 * @extensionOf angular
 * @description
 *   [en]Bind the value to a model. Works just like for normal input elements.[/en]
 *   [ja]この要素の値をモデルに紐付けます。通常のinput要素の様に動作します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ng-change
 * @extensionOf angular
 * @description
 *   [en]Executes an expression when the value changes. Works just like for normal input elements.[/en]
 *   [ja]値が変わった時にこの属性で指定したexpressionが実行されます。通常のinput要素の様に動作します。[/ja]
 */

(function(){
  'use strict';

  angular.module('onsen').directive('onsMaterialInput', ['$parse', function($parse) {
    return {
      restrict: 'E',
      replace: false,
      scope: true,

      link: function(scope, element, attrs) {
        CustomElements.upgrade(element[0]);

        if (attrs.ngModel) {
          var set = $parse(attrs.ngModel).assign;

          scope.$parent.$watch(attrs.ngModel, function(value) {
            element[0].value = value;
          });

          element[0]._input.addEventListener('input', function() {
            set(scope.$parent, element[0].value);

            if (attrs.ngChange) {
              scope.$eval(attrs.ngChange);
            }

            scope.$parent.$evalAsync();
          }.bind(this));
        }
      }
    };
  }]);
})();

/**
 * @ngdoc directive
 * @id modal
 * @name ons-modal
 * @category modal
 * @description 
 *   [en]
 *     Modal component that masks current screen.
 *     Underlying components are not subject to any events while the modal component is shown.
 *   [/en]
 *   [ja]
 *     画面全体をマスクするモーダル用コンポーネントです。下側にあるコンポーネントは、
 *     モーダルが表示されている間はイベント通知が行われません。
 *   [/ja]
 * @guide UsingModal
 *   [en]Using ons-modal component[/en]
 *   [ja]モーダルの使い方[/ja]
 * @guide CallingComponentAPIsfromJavaScript
 *   [en]Using navigator from JavaScript[/en]
 *   [ja]JavaScriptからコンポーネントを呼び出す[/ja]
 * @codepen devIg
 * @example
 * <ons-modal>
 *   ...
 * </ons-modal>
 */

/**
 * @ngdoc attribute
 * @name var
 * @type {String}
 * @extensionOf angular
 * @initonly
 * @description
 *   [en]Variable name to refer this modal.[/en]
 *   [ja]このモーダルを参照するための名前を指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name animation
 * @type {String}
 * @default default
 * @description
 *  [en]The animation used when showing and hiding the modal. Can be either "none" or "fade".[/en]
 *  [ja]モーダルを表示する際のアニメーション名を指定します。"none"もしくは"fade"を指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name animation-options
 * @type {Expression}
 * @description
 *  [en]Specify the animation's duration, timing and delay with an object literal. E.g. <code>{duration: 0.2, delay: 1, timing: 'ease-in'}</code>[/en]
 *  [ja]アニメーション時のduration, timing, delayをオブジェクトリテラルで指定します。e.g. <code>{duration: 0.2, delay: 1, timing: 'ease-in'}</code>[/ja]
 */

/**
 * @ngdoc method
 * @signature toggle([options])
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {String} [options.animation]
 *   [en]Animation name. Available animations are "none" and "fade".[/en]
 *   [ja]アニメーション名を指定します。"none", "fade"のいずれかを指定します。[/ja]
 * @param {String} [options.animationOptions]
 *   [en]Specify the animation's duration, delay and timing. E.g.  <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code>[/en]
 *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code> [/ja]
 * @description
 *   [en]Toggle modal visibility.[/en]
 *   [ja]モーダルの表示を切り替えます。[/ja]
 */

/**
 * @ngdoc method
 * @signature show([options])
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {String} [options.animation]
 *   [en]Animation name. Available animations are "none" and "fade".[/en]
 *   [ja]アニメーション名を指定します。"none", "fade"のいずれかを指定します。[/ja]
 * @param {String} [options.animationOptions]
 *   [en]Specify the animation's duration, delay and timing. E.g.  <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code>[/en]
 *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code> [/ja]
 * @description
 *   [en]Show modal.[/en]
 *   [ja]モーダルを表示します。[/ja]
 */

/**
 * @ngdoc method
 * @signature hide([options])
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {String} [options.animation]
 *   [en]Animation name. Available animations are "none" and "fade".[/en]
 *   [ja]アニメーション名を指定します。"none", "fade"のいずれかを指定します。[/ja]
 * @param {String} [options.animationOptions]
 *   [en]Specify the animation's duration, delay and timing. E.g.  <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code>[/en]
 *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code> [/ja]
 * @description
 *   [en]Hide modal.[/en]
 *   [ja]モーダルを非表示にします。[/ja]
 */

/**
 * @ngdoc method
 * @signature isShown()
 * @return {Boolean}
 *   [en]true if the modal is visible.[/en]
 *   [ja]モーダルが表示されている場合にtrueとなります。[/ja]
 * @description
 *   [en]Returns whether the modal is visible or not.[/en]
 *   [ja]モーダルが表示されているかどうかを返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature getDeviceBackButtonHandler()
 * @return {Object}
 *   [en]Device back button handler.[/en]
 *   [ja]デバイスのバックボタンハンドラを返します。[/ja]
 * @description
 *   [en]Retrieve the back button handler.[/en]
 *   [ja]ons-modalに紐付いているバックボタンハンドラを取得します。[/ja]
 */

(function() {
  'use strict';

  /**
   * Modal directive.
   */
  angular.module('onsen').directive('onsModal', ['$onsen', 'ModalView', function($onsen, ModalView) {
    return {
      restrict: 'E',
      replace: false,

      // NOTE: This element must coexists with ng-controller.
      // Do not use isolated scope and template's ng-transclude.
      scope: false,
      transclude: false,

      link: {
        pre: function(scope, element, attrs) {
          CustomElements.upgrade(element[0]);
          var modal = new ModalView(scope, element, attrs);
          $onsen.addModifierMethodsForCustomElements(modal, element);

          $onsen.declareVarAttribute(attrs, modal);
          element.data('ons-modal', modal);

          element[0]._ensureNodePosition();

          scope.$on('$destroy', function() {
            $onsen.removeModifierMethods(modal);
            element.data('ons-modal', undefined);
            modal = element = scope = attrs = null;
          });
        },

        post: function(scope, element) {
          $onsen.fireComponentEvent(element[0], 'init');
        }
      }
    };
  }]);

})();

/**
 * @ngdoc directive
 * @id navigator
 * @name ons-navigator
 * @category navigation
 * @description
 *   [en]A component that provides page stack management and navigation. This component does not have a visible content.[/en]
 *   [ja]ページスタックの管理とナビゲーション機能を提供するコンポーネント。画面上への出力はありません。[/ja]
 * @codepen yrhtv
 * @guide PageNavigation
 *   [en]Guide for page navigation[/en]
 *   [ja]ページナビゲーションの概要[/ja]
 * @guide CallingComponentAPIsfromJavaScript
 *   [en]Using navigator from JavaScript[/en]
 *   [ja]JavaScriptからコンポーネントを呼び出す[/ja]
 * @guide EventHandling
 *   [en]Event handling descriptions[/en]
 *   [ja]イベント処理の使い方[/ja]
 * @guide DefiningMultiplePagesinSingleHTML
 *   [en]Defining multiple pages in single html[/en]
 *   [ja]複数のページを1つのHTMLに記述する[/ja]
 * @seealso ons-toolbar
 *   [en]ons-toolbar component[/en]
 *   [ja]ons-toolbarコンポーネント[/ja]
 * @seealso ons-back-button
 *   [en]ons-back-button component[/en]
 *   [ja]ons-back-buttonコンポーネント[/ja]
 * @example
 * <ons-navigator animation="slide" var="app.navi">
 *   <ons-page>
 *     <ons-toolbar>
 *       <div class="center">Title</div>
 *     </ons-toolbar>
 *
 *     <p style="text-align: center">
 *       <ons-button modifier="light" ng-click="app.navi.pushPage('page.html');">Push</ons-button>
 *     </p>
 *   </ons-page>
 * </ons-navigator>
 *
 * <ons-template id="page.html">
 *   <ons-page>
 *     <ons-toolbar>
 *       <div class="center">Title</div>
 *     </ons-toolbar>
 *
 *     <p style="text-align: center">
 *       <ons-button modifier="light" ng-click="app.navi.popPage();">Pop</ons-button>
 *     </p>
 *   </ons-page>
 * </ons-template>
 */

/**
 * @ngdoc event
 * @name prepush
 * @description
 *   [en]Fired just before a page is pushed.[/en]
 *   [ja]pageがpushされる直前に発火されます。[/ja]
 * @param {Object} event [en]Event object.[/en]
 * @param {Object} event.navigator
 *   [en]Component object.[/en]
 *   [ja]コンポーネントのオブジェクト。[/ja]
 * @param {Object} event.currentPage
 *   [en]Current page object.[/en]
 *   [ja]現在のpageオブジェクト。[/ja]
 * @param {Function} event.cancel
 *   [en]Call this function to cancel the push.[/en]
 *   [ja]この関数を呼び出すと、push処理がキャンセルされます。[/ja]
 */

/**
 * @ngdoc event
 * @name prepop
 * @description
 *   [en]Fired just before a page is popped.[/en]
 *   [ja]pageがpopされる直前に発火されます。[/ja]
 * @param {Object} event [en]Event object.[/en]
 * @param {Object} event.navigator
 *   [en]Component object.[/en]
 *   [ja]コンポーネントのオブジェクト。[/ja]
 * @param {Object} event.currentPage
 *   [en]Current page object.[/en]
 *   [ja]現在のpageオブジェクト。[/ja]
 * @param {Function} event.cancel
 *   [en]Call this function to cancel the pop.[/en]
 *   [ja]この関数を呼び出すと、pageのpopがキャンセルされます。[/ja]
 */

/**
 * @ngdoc event
 * @name postpush
 * @description
 *   [en]Fired just after a page is pushed.[/en]
 *   [ja]pageがpushされてアニメーションが終了してから発火されます。[/ja]
 * @param {Object} event [en]Event object.[/en]
 * @param {Object} event.navigator
 *   [en]Component object.[/en]
 *   [ja]コンポーネントのオブジェクト。[/ja]
 * @param {Object} event.enterPage
 *   [en]Object of the next page.[/en]
 *   [ja]pushされたpageオブジェクト。[/ja]
 * @param {Object} event.leavePage
 *   [en]Object of the previous page.[/en]
 *   [ja]以前のpageオブジェクト。[/ja]
 */

/**
 * @ngdoc event
 * @name postpop
 * @description
 *   [en]Fired just after a page is popped.[/en]
 *   [ja]pageがpopされてアニメーションが終わった後に発火されます。[/ja]
 * @param {Object} event [en]Event object.[/en]
 * @param {Object} event.navigator
 *   [en]Component object.[/en]
 *   [ja]コンポーネントのオブジェクト。[/ja]
 * @param {Object} event.enterPage
 *   [en]Object of the next page.[/en]
 *   [ja]popされて表示されるページのオブジェクト。[/ja]
 * @param {Object} event.leavePage
 *   [en]Object of the previous page.[/en]
 *   [ja]popされて消えるページのオブジェクト。[/ja]
 */

/**
 * @ngdoc attribute
 * @name page
 * @initonly
 * @type {String}
 * @description
 *   [en]First page to show when navigator is initialized.[/en]
 *   [ja]ナビゲーターが初期化された時に表示するページを指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name var
 * @initonly
 * @extensionOf angular
 * @type {String}
 * @description
 *  [en]Variable name to refer this navigator.[/en]
 *  [ja]このナビゲーターを参照するための名前を指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-prepush
 * @initonly
 * @extensionOf angular
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "prepush" event is fired.[/en]
 *  [ja]"prepush"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-prepop
 * @initonly
 * @extensionOf angular
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "prepop" event is fired.[/en]
 *  [ja]"prepop"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-postpush
 * @initonly
 * @extensionOf angular
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "postpush" event is fired.[/en]
 *  [ja]"postpush"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-postpop
 * @initonly
 * @extensionOf angular
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "postpop" event is fired.[/en]
 *  [ja]"postpop"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-init
 * @initonly
 * @extensionOf angular
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "init" event is fired.[/en]
 *  [ja]ページの"init"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-show
 * @initonly
 * @extensionOf angular
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "show" event is fired.[/en]
 *  [ja]ページの"show"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-hide
 * @initonly
 * @extensionOf angular
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "hide" event is fired.[/en]
 *  [ja]ページの"hide"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-destroy
 * @initonly
 * @extensionOf angular
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "destroy" event is fired.[/en]
 *  [ja]ページの"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name animation
 * @type {String}
 * @default default
 * @description
 *  [en]Specify the transition animation. Use one of "slide", "simpleslide", "fade", "lift", "none" and "default".[/en]
 *  [ja]画面遷移する際のアニメーションを指定します。"slide", "simpleslide", "fade", "lift", "none", "default"のいずれかを指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name animation-options
 * @type {Expression}
 * @description
 *  [en]Specify the animation's duration, timing and delay with an object literal. E.g. <code>{duration: 0.2, delay: 1, timing: 'ease-in'}</code>[/en]
 *  [ja]アニメーション時のduration, timing, delayをオブジェクトリテラルで指定します。e.g. <code>{duration: 0.2, delay: 1, timing: 'ease-in'}</code>[/ja]
 */

/**
 * @ngdoc method
 * @signature pushPage(pageUrl, [options])
 * @param {String} pageUrl
 *   [en]Page URL. Can be either a HTML document or a <code>&lt;ons-template&gt;</code>.[/en]
 *   [ja]pageのURLか、もしくはons-templateで宣言したテンプレートのid属性の値を指定できます。[/ja]
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {String} [options.animation]
 *   [en]Animation name. Available animations are "slide", "simpleslide", "lift", "fade" and "none".[/en]
 *   [ja]アニメーション名を指定します。"slide", "simpleslide", "lift", "fade", "none"のいずれかを指定できます。[/ja]
 * @param {String} [options.animationOptions]
 *   [en]Specify the animation's duration, delay and timing. E.g.  <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code>[/en]
 *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code> [/ja]
 * @param {Function} [options.onTransitionEnd]
 *   [en]Function that is called when the transition has ended.[/en]
 *   [ja]pushPage()による画面遷移が終了した時に呼び出される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]Pushes the specified pageUrl into the page stack.[/en]
 *   [ja]指定したpageUrlを新しいページスタックに追加します。新しいページが表示されます。[/ja]
 */

/**
 * @ngdoc method
 * @signature bringPageTop(item, [options])
 * @param {String|Number} item
 *   [en]Page URL or index of an existing page in navigator's stack.[/en]
 *   [ja]ページのURLかもしくはons-navigatorのページスタックのインデックス値を指定します。[/ja]
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {String} [options.animation]
 *   [en]Animation name. Available animations are "slide", "simpleslide", "lift", "fade" and "none".[/en]
 *   [ja]アニメーション名を指定します。"slide", "simpleslide", "lift", "fade", "none"のいずれかを指定できます。[/ja]
 * @param {String} [options.animationOptions]
 *   [en]Specify the animation's duration, delay and timing. E.g.  <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code>[/en]
 *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code> [/ja]
 * @param {Function} [options.onTransitionEnd]
 *   [en]Function that is called when the transition has ended.[/en]
 *   [ja]pushPage()による画面遷移が終了した時に呼び出される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]Brings the given page to the top of the page-stack if already exists or pushes it into the stack if doesn't.[/en]
 *   [ja]指定したページをページスタックの一番上に移動します。もし指定したページが無かった場合新しくpushされます。[/ja]
 */

/**
 * @ngdoc method
 * @signature insertPage(index, pageUrl, [options])
 * @param {Number} index
 *   [en]The index where it should be inserted.[/en]
 *   [ja]スタックに挿入する位置のインデックスを指定します。[/ja]
 * @param {String} pageUrl
 *   [en]Page URL. Can be either a HTML document or a <code>&lt;ons-template&gt;</code>.[/en]
 *   [ja]pageのURLか、もしくはons-templateで宣言したテンプレートのid属性の値を指定できます。[/ja]
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {String} [options.animation]
 *   [en]Animation name. Available animations are "slide", "simpleslide", "lift", "fade" and "none".[/en]
 *   [ja]アニメーション名を指定します。"slide", "simpleslide", "lift", "fade", "none"のいずれかを指定できます。[/ja]
 * @description
 *   [en]Insert the specified pageUrl into the page stack with specified index.[/en]
 *   [ja]指定したpageUrlをページスタックのindexで指定した位置に追加します。[/ja]
 */

/**
 * @ngdoc method
 * @signature popPage([options])
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {String} [options.animation]
 *   [en]Animation name. Available animations are "slide", "simpleslide", "lift", "fade" and "none".[/en]
 *   [ja]アニメーション名を指定します。"slide", "simpleslide", "lift", "fade", "none"のいずれかを指定できます。[/ja]
 * @param {String} [options.animationOptions]
 *   [en]Specify the animation's duration, delay and timing. E.g.  <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code>[/en]
 *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code> [/ja]
 * @param {Boolean} [options.refresh]
 *   [en]The previous page will be refreshed (destroyed and created again) before popPage action.[/en]
 *   [ja]popPageする前に、前にあるページを生成しなおして更新する場合にtrueを指定します。[/ja]
 * @param {Function} [options.onTransitionEnd]
 *   [en]Function that is called when the transition has ended.[/en]
 *   [ja]このメソッドによる画面遷移が終了した際に呼び出される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]Pops the current page from the page stack. The previous page will be displayed.[/en]
 *   [ja]現在表示中のページをページスタックから取り除きます。一つ前のページに戻ります。[/ja]
 */

/**
 * @ngdoc method
 * @signature replacePage(pageUrl, [options])
 * @param {String} pageUrl
 *   [en]Page URL. Can be either a HTML document or an <code>&lt;ons-template&gt;</code>.[/en]
 *   [ja]pageのURLか、もしくはons-templateで宣言したテンプレートのid属性の値を指定できます。[/ja]
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {String} [options.animation]
 *   [en]Animation name. Available animations are "slide", "simpleslide", "lift", "fade" and "none".[/en]
 *   [ja]アニメーション名を指定できます。"slide", "simpleslide", "lift", "fade", "none"のいずれかを指定できます。[/ja]
 * @param {String} [options.animationOptions]
 *   [en]Specify the animation's duration, delay and timing. E.g.  <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code>[/en]
 *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code> [/ja]
 * @param {Function} [options.onTransitionEnd]
 *   [en]Function that is called when the transition has ended.[/en]
 *   [ja]このメソッドによる画面遷移が終了した際に呼び出される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]Replaces the current page with the specified one.[/en]
 *   [ja]現在表示中のページをを指定したページに置き換えます。[/ja]
 */

/**
 * @ngdoc method
 * @signature resetToPage(pageUrl, [options])
 * @param {String/undefined} pageUrl
 *   [en]Page URL. Can be either a HTML document or an <code>&lt;ons-template&gt;</code>. If the value is undefined or '', the navigator will be reset to the page that was first displayed.[/en]
 *   [ja]pageのURLか、もしくはons-templateで宣言したテンプレートのid属性の値を指定できます。undefinedや''を指定すると、ons-navigatorが最初に表示したページを指定したことになります。[/ja]
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {String} [options.animation]
 *   [en]Animation name. Available animations are "slide", "simpleslide", "lift", "fade" and "none".[/en]
 *   [ja]アニメーション名を指定できます。"slide", "simpleslide", "lift", "fade", "none"のいずれかを指定できます。[/ja]
 * @param {Function} [options.onTransitionEnd]
 *   [en]Function that is called when the transition has ended.[/en]
 *   [ja]このメソッドによる画面遷移が終了した際に呼び出される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]Clears page stack and adds the specified pageUrl to the page stack.[/en]
 *   [ja]ページスタックをリセットし、指定したページを表示します。[/ja]
 */

/**
 * @ngdoc method
 * @signature getCurrentPage()
 * @return {Object}
 *   [en]Current page object.[/en]
 *   [ja]現在のpageオブジェクト。[/ja]
 * @description
 *   [en]Get current page's navigator item. Use this method to access options passed by pushPage() or resetToPage() method.[/en]
 *   [ja]現在のページを取得します。pushPage()やresetToPage()メソッドの引数を取得できます。[/ja]
 */

/**
 * @ngdoc method
 * @signature getPages()
 * @return {List}
 *   [en]List of page objects.[/en]
 *   [ja]pageオブジェクトの配列。[/ja]
 * @description
 *   [en]Retrieve the entire page stack of the navigator.[/en]
 *   [ja]ナビゲーターの持つページスタックの一覧を取得します。[/ja]
 */

/**
 * @ngdoc method
 * @signature getDeviceBackButtonHandler()
 * @return {Object}
 *   [en]Device back button handler.[/en]
 *   [ja]デバイスのバックボタンハンドラを返します。[/ja]
 * @description
 *   [en]Retrieve the back button handler for overriding the default behavior.[/en]
 *   [ja]バックボタンハンドラを取得します。デフォルトの挙動を変更することができます。[/ja]
 */

/**
 * @ngdoc method
 * @signature on(eventName, listener)
 * @extensionOf angular
 * @description
 *   [en]Add an event listener.[/en]
 *   [ja]イベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]このイベントが発火された際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature once(eventName, listener)
 * @extensionOf angular
 * @description
 *  [en]Add an event listener that's only triggered once.[/en]
 *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature off(eventName, [listener])
 * @extensionOf angular
 * @description
 *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
 *  [ja]イベントリスナーを削除します。もしイベントリスナーを指定しなかった場合には、そのイベントに紐づく全てのイベントリスナーが削除されます。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]削除するイベントリスナーを指定します。[/ja]
 */

(function() {
  'use strict';

  var lastReady = window.OnsNavigatorElement.rewritables.ready;
  window.OnsNavigatorElement.rewritables.ready = ons._waitDiretiveInit('ons-navigator', lastReady);

  var lastLink = window.OnsNavigatorElement.rewritables.link;
  window.OnsNavigatorElement.rewritables.link = function(navigatorElement, target, callback) {
    var view = angular.element(navigatorElement).data('ons-navigator');
    view._compileAndLink(target, function(target) {
      lastLink(navigatorElement, target, callback);
    });
  };

  angular.module('onsen').directive('onsNavigator', ['NavigatorView', '$onsen', function(NavigatorView, $onsen) {
    return {
      restrict: 'E',

      // NOTE: This element must coexists with ng-controller.
      // Do not use isolated scope and template's ng-transclude.
      transclude: false,
      scope: true,

      compile: function(element) {
        CustomElements.upgrade(element[0]);

        return {
          pre: function(scope, element, attrs, controller) {
            CustomElements.upgrade(element[0]);
            var navigator = new NavigatorView(scope, element, attrs);

            $onsen.declareVarAttribute(attrs, navigator);
            $onsen.registerEventHandlers(navigator, 'prepush prepop postpush postpop init show hide destroy');

            element.data('ons-navigator', navigator);

            scope.$on('$destroy', function() {
              navigator._events = undefined;
              element.data('ons-navigator', undefined);
              element = null;
            });

          },
          post: function(scope, element, attrs) {
            $onsen.fireComponentEvent(element[0], 'init');
          }
        };
      }
    };
  }]);
})();

/**
 * @ngdoc directive
 * @id page
 * @name ons-page
 * @category base
 * @description
 *   [en]Should be used as root component of each page. The content inside page component is scrollable.[/en]
 *   [ja]ページ定義のためのコンポーネントです。このコンポーネントの内容はスクロールが許可されます。[/ja]
 * @guide ManagingMultiplePages
 *   [en]Managing multiple pages[/en]
 *   [ja]複数のページを管理する[/ja]
 * @guide Pagelifecycle
 *   [en]Page life cycle events[/en]
 *   [ja]ページライフサイクルイベント[/ja]
 * @guide HandlingBackButton
 *   [en]Handling back button[/en]
 *   [ja]バックボタンに対応する[/ja]
 * @guide OverridingCSSstyles
 *   [en]Overriding CSS styles[/en]
 *   [ja]CSSスタイルのオーバーライド[/ja]
 * @guide DefiningMultiplePagesinSingleHTML
 *   [en]Defining multiple pages in single html[/en]
 *   [ja]複数のページを1つのHTMLに記述する[/ja]
 * @example
 * <ons-page>
 *   <ons-toolbar>
 *     <div class="center">Title</div>
 *   </ons-toolbar>
 *
 *   ...
 * </ons-page>
 */

/**
 * @ngdoc event
 * @name init
 * @description
 *   [en]Fired right after the page is attached.[/en]
 *   [ja]ページがアタッチされた後に発火します。[/ja]
 * @param {Object} event [en]Event object.[/en]
 * @param {Object} event.page
 *   [en]Page object.[/en]
 *   [ja]ページのオブジェクト。[/ja]
 */

/**
 * @ngdoc event
 * @name show
 * @description
 *   [en]Fired right after the page is shown.[/en]
 *   [ja]ページが表示された後に発火します。[/ja]
 * @param {Object} event [en]Event object.[/en]
 * @param {Object} event.page
 *   [en]Page object.[/en]
 *   [ja]ページのオブジェクト。[/ja]
 */

/**
 * @ngdoc event
 * @name hide
 * @description
 *   [en]Fired right after the page is hidden.[/en]
 *   [ja]ページが隠れた後に発火します。[/ja]
 * @param {Object} event [en]Event object.[/en]
 * @param {Object} event.page
 *   [en]Page object.[/en]
 *   [ja]ページのオブジェクト。[/ja]
 */

/**
 * @ngdoc event
 * @name destroy
 * @description
 *   [en]Fired right before the page is destroyed.[/en]
 *   [ja]ページが破棄される前に発火します。[/ja]
 * @param {Object} event [en]Event object.[/en]
 * @param {Object} event.page
 *   [en]Page object.[/en]
 *   [ja]ページのオブジェクト。[/ja]
 */

/**
 * @ngdoc attribute
 * @name var
 * @initonly
 * @extensionOf angular
 * @type {String}
 * @description
 *   [en]Variable name to refer this page.[/en]
 *   [ja]このページを参照するための名前を指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name modifier
 * @type {String}
 * @description
 *   [en]Specify modifier name to specify custom styles.[/en]
 *   [ja]スタイル定義をカスタマイズするための名前を指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name on-device-backbutton
 * @type {Expression}
 * @extensionOf angular
 * @description
 *   [en]Allows you to specify custom behavior when the back button is pressed.[/en]
 *   [ja]デバイスのバックボタンが押された時の挙動を設定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ng-device-backbutton
 * @initonly
 * @extensionOf angular
 * @type {Expression}
 * @description
 *   [en]Allows you to specify custom behavior with an AngularJS expression when the back button is pressed.[/en]
 *   [ja]デバイスのバックボタンが押された時の挙動を設定できます。AngularJSのexpressionを指定できます。[/ja]
 */
/**
 * @ngdoc attribute
 * @name ons-init
 * @initonly
 * @extensionOf angular
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "init" event is fired.[/en]
 *  [ja]"init"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-show
 * @initonly
 * @extensionOf angular
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "show" event is fired.[/en]
 *  [ja]"show"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-hide
 * @initonly
 * @extensionOf angular
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "hide" event is fired.[/en]
 *  [ja]"hide"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-destroy
 * @initonly
 * @extensionOf angular
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
 *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc method
 * @signature getDeviceBackButtonHandler()
 * @return {Object}
 *   [en]Device back button handler.[/en]
 *   [ja]デバイスのバックボタンハンドラを返します。[/ja]
 * @description
 *   [en]Get the associated back button handler. This method may return null if no handler is assigned.[/en]
 *   [ja]バックボタンハンドラを取得します。このメソッドはnullを返す場合があります。[/ja]
 */

(function() {
  'use strict';

  var module = angular.module('onsen');

  module.directive('onsPage', ['$onsen', 'PageView', function($onsen, PageView) {

    function firePageInitEvent(element) {
      // TODO: remove dirty fix
      var i = 0, f = function() {
        if (i++ < 15)  {
          if (isAttached(element)) {
            element._tryToFillStatusBar();
            $onsen.fireComponentEvent(element, 'init');
            fireActualPageInitEvent(element);
          } else {
            if (i > 10) {
              setTimeout(f, 1000 / 60);
            } else {
              setImmediate(f);
            }
          }
        } else {
          throw new Error('Fail to fire "pageinit" event. Attach "ons-page" element to the document after initialization.');
        }
      };

      f();
    }

    function fireActualPageInitEvent(element) {
      var event = document.createEvent('HTMLEvents');
      event.initEvent('pageinit', true, true);
      element.dispatchEvent(event);
    }

    function isAttached(element) {
      if (document.documentElement === element) {
        return true;
      }
      return element.parentNode ? isAttached(element.parentNode) : false;
    }

    return {
      restrict: 'E',

      // NOTE: This element must coexists with ng-controller.
      // Do not use isolated scope and template's ng-transclude.
      transclude: false,
      scope: false,

      compile: function(element, attrs) {
        CustomElements.upgrade(element[0]);
        return {
          pre: function(scope, element, attrs) {
            CustomElements.upgrade(element[0]);
            var page = new PageView(scope, element, attrs);

            $onsen.declareVarAttribute(attrs, page);
            $onsen.registerEventHandlers(page, 'init show hide destroy');

            element.data('ons-page', page);
            $onsen.addModifierMethodsForCustomElements(page, element);

            $onsen.cleaner.onDestroy(scope, function() {
              page._events = undefined;
              $onsen.removeModifierMethods(page);
              element.data('ons-page', undefined);

              $onsen.clearComponent({
                element: element,
                scope: scope,
                attrs: attrs
              });
              scope = element = attrs = null;
            });
          },

          post: function postLink(scope, element, attrs) {
            firePageInitEvent(element[0]);
          }
        };
      }
    };
  }]);
})();

/**
 * @ngdoc directive
 * @id popover
 * @name ons-popover
 * @category popover
 * @modifier android
 *   [en]Display an Android style popover.[/en]
 *   [ja]Androidライクなポップオーバーを表示します。[/ja]
 * @description
 *  [en]A component that displays a popover next to an element.[/en]
 *  [ja]ある要素を対象とするポップオーバーを表示するコンポーネントです。[/ja]
 * @codepen ZYYRKo
 * @example
 * <script>
 * ons.ready(function() {
 *   ons.createPopover('popover.html').then(function(popover) {
 *     popover.show('#mybutton');   
 *   });
 * });
 * </script>
 *
 * <script type="text/ons-template" id="popover.html">
 *   <ons-popover cancelable>
 *     <p style="text-align: center; opacity: 0.5;">This popover will choose which side it's displayed on automatically.</p>
 *   </ons-popover>
 * </script>
 */

/**
 * @ngdoc event
 * @name preshow
 * @description
 *   [en]Fired just before the popover is displayed.[/en]
 *   [ja]ポップオーバーが表示される直前に発火します。[/ja]
 * @param {Object} event [en]Event object.[/en]
 * @param {Object} event.popover
 *   [en]Component object.[/en]
 *   [ja]コンポーネントのオブジェクト。[/ja]
 * @param {Function} event.cancel 
 *   [en]Call this function to stop the popover from being shown.[/en]
 *   [ja]この関数を呼び出すと、ポップオーバーの表示がキャンセルされます。[/ja]
 */

/**
 * @ngdoc event
 * @name postshow
 * @description
 *   [en]Fired just after the popover is displayed.[/en]
 *   [ja]ポップオーバーが表示された直後に発火します。[/ja]
 * @param {Object} event [en]Event object.[/en]
 * @param {Object} event.popover
 *   [en]Component object.[/en]
 *   [ja]コンポーネントのオブジェクト。[/ja]
 */

/**
 * @ngdoc event
 * @name prehide
 * @description
 *   [en]Fired just before the popover is hidden.[/en]
 *   [ja]ポップオーバーが隠れる直前に発火します。[/ja]
 * @param {Object} event [en]Event object.[/en]
 * @param {Object} event.popover
 *   [en]Component object.[/en]
 *   [ja]コンポーネントのオブジェクト。[/ja]
 * @param {Function} event.cancel 
 *   [en]Call this function to stop the popover from being hidden.[/en]
 *   [ja]この関数を呼び出すと、ポップオーバーが隠れる処理をキャンセルします。[/ja]
 */

/**
 * @ngdoc event
 * @name posthide
 * @description
 *   [en]Fired just after the popover is hidden.[/en]
 *   [ja]ポップオーバーが隠れた後に発火します。[/ja]
 * @param {Object} event [en]Event object.[/en]
 * @param {Object} event.popover
 *   [en]Component object.[/en]
 *   [ja]コンポーネントのオブジェクト。[/ja]
 */


/**
 * @ngdoc attribute
 * @name var
 * @initonly
 * @extensionOf angular
 * @type {String}
 * @description
 *  [en]Variable name to refer this popover.[/en]
 *  [ja]このポップオーバーを参照するための名前を指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name modifier
 * @type {String}
 * @description
 *  [en]The appearance of the popover.[/en]
 *  [ja]ポップオーバーの表現を指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name direction
 * @type {String}
 * @description
 *  [en]
 *    A space separated list of directions. If more than one direction is specified,
 *    it will be chosen automatically. Valid directions are "up", "down", "left" and "right".
 *  [/en]
 *  [ja]
 *    ポップオーバーを表示する方向を空白区切りで複数指定できます。
 *    指定できる方向は、"up", "down", "left", "right"の4つです。空白区切りで複数指定することもできます。
 *    複数指定された場合、対象とする要素に合わせて指定した値から自動的に選択されます。
 *  [/ja]
 */

/**
 * @ngdoc attribute
 * @name cancelable
 * @description
 *   [en]If this attribute is set the popover can be closed by tapping the background or by pressing the back button.[/en]
 *   [ja]この属性があると、ポップオーバーが表示された時に、背景やバックボタンをタップした時にをポップオーバー閉じます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name disabled
 * @description
 *   [en]If this attribute is set the popover is disabled.[/en]
 *   [ja]この属性がある時、ポップオーバーはdisabled状態になります。[/ja]
 */

/**
 * @ngdoc attribute
 * @name animation
 * @type {String}
 * @description
 *   [en]The animation used when showing an hiding the popover. Can be either "none" or "fade".[/en]
 *   [ja]ポップオーバーを表示する際のアニメーション名を指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name animation-options
 * @type {Expression}
 * @description
 *  [en]Specify the animation's duration, timing and delay with an object literal. E.g. <code>{duration: 0.2, delay: 1, timing: 'ease-in'}</code>[/en]
 *  [ja]アニメーション時のduration, timing, delayをオブジェクトリテラルで指定します。e.g. <code>{duration: 0.2, delay: 1, timing: 'ease-in'}</code>[/ja]
 */

/**
 * @ngdoc attribute
 * @name mask-color
 * @type {Color}
 * @description
 *   [en]Color of the background mask. Default is "rgba(0, 0, 0, 0.2)".[/en]
 *   [ja]背景のマスクの色を指定します。デフォルトは"rgba(0, 0, 0, 0.2)"です。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-preshow
 * @initonly
 * @extensionOf angular
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "preshow" event is fired.[/en]
 *  [ja]"preshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-prehide
 * @initonly
 * @extensionOf angular
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "prehide" event is fired.[/en]
 *  [ja]"prehide"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-postshow
 * @initonly
 * @extensionOf angular
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "postshow" event is fired.[/en]
 *  [ja]"postshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-posthide
 * @initonly
 * @extensionOf angular
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "posthide" event is fired.[/en]
 *  [ja]"posthide"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-destroy
 * @initonly
 * @extensionOf angular
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
 *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc method
 * @signature show(target, [options])
 * @param {String|Event|HTMLElement} target
 *   [en]Target element. Can be either a CSS selector, an event object or a DOM element.[/en]
 *   [ja]ポップオーバーのターゲットとなる要素を指定します。CSSセレクタかeventオブジェクトかDOM要素のいずれかを渡せます。[/ja]
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {String} [options.animation]
 *   [en]Animation name. Available animations are "fade" and "none".[/en]
 *   [ja]アニメーション名を指定します。"fade"もしくは"none"を指定できます。[/ja]
 * @param {String} [options.animationOptions]
 *   [en]Specify the animation's duration, delay and timing. E.g.  <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code>[/en]
 *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code> [/ja]
 * @description
 *   [en]Open the popover and point it at a target. The target can be either an event, a css selector or a DOM element..[/en]
 *   [ja]対象とする要素にポップオーバーを表示します。target引数には、$eventオブジェクトやDOMエレメントやCSSセレクタを渡すことが出来ます。[/ja]
 */

/**
 * @ngdoc method
 * @signature hide([options])
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {String} [options.animation]
 *   [en]Animation name. Available animations are "fade" and "none".[/en]
 *   [ja]アニメーション名を指定します。"fade"もしくは"none"を指定できます。[/ja]
 * @param {String} [options.animationOptions]
 *   [en]Specify the animation's duration, delay and timing. E.g.  <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code>[/en]
 *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code> [/ja]
 * @description
 *   [en]Close the popover.[/en]
 *   [ja]ポップオーバーを閉じます。[/ja]
 */

/**
 * @ngdoc method
 * @signature isShown()
 * @return {Boolean}
 *   [en]true if the popover is visible.[/en]
 *   [ja]ポップオーバーが表示されている場合にtrueとなります。[/ja]
 * @description
 *   [en]Returns whether the popover is visible or not.[/en]
 *   [ja]ポップオーバーが表示されているかどうかを返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature destroy()
 * @description
 *   [en]Destroy the popover and remove it from the DOM tree.[/en]
 *   [ja]ポップオーバーを破棄して、DOMツリーから取り除きます。[/ja]
 */

/**
 * @ngdoc method
 * @signature setCancelable(cancelable)
 * @param {Boolean} cancelable
 *   [en]If true the popover will be cancelable.[/en]
 *   [ja]ポップオーバーがキャンセル可能にしたい場合にtrueを指定します。[/ja]
 * @description
 *   [en]Set whether the popover can be canceled by the user when it is shown.[/en]
 *   [ja]ポップオーバーを表示した際に、ユーザがそのポップオーバーをキャンセルできるかどうかを指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature isCancelable()
 * @return {Boolean}
 *   [en]true if the popover is cancelable.[/en]
 *   [ja]ポップオーバーがキャンセル可能であればtrueとなります。[/ja]
 * @description
 *   [en]Returns whether the popover is cancelable or not.[/en]
 *   [ja]このポップオーバーがキャンセル可能かどうかを返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature setDisabled(disabled)
 * @param {Boolean} disabled
 *   [en]If true the popover will be disabled.[/en]
 *   [ja]ポップオーバーをdisabled状態にしたい場合にはtrueを指定します。[/ja]
 * @description
 *   [en]Disable or enable the popover.[/en]
 *   [ja]このポップオーバーをdisabled状態にするかどうかを設定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature isDisabled()
 * @return {Boolean}
 *   [en]true if the popover is disabled.[/en]
 *   [ja]ポップオーバーがdisabled状態であればtrueとなります。[/ja]
 * @description
 *   [en]Returns whether the popover is disabled or enabled.[/en]
 *   [ja]このポップオーバーがdisabled状態かどうかを返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature on(eventName, listener)
 * @extensionOf angular
 * @description
 *   [en]Add an event listener.[/en]
 *   [ja]イベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]このイベントが発火された際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature once(eventName, listener)
 * @extensionOf angular
 * @description
 *  [en]Add an event listener that's only triggered once.[/en]
 *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature off(eventName, [listener])
 * @extensionOf angular
 * @description
 *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
 *  [ja]イベントリスナーを削除します。もしイベントリスナーを指定しなかった場合には、そのイベントに紐づく全てのイベントリスナーが削除されます。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]削除するイベントリスナーを指定します。[/ja]
 */

(function(){
  'use strict';

  var module = angular.module('onsen');

  module.directive('onsPopover', ['$onsen', 'PopoverView', function($onsen, PopoverView) {
    return {
      restrict: 'E',
      replace: false,
      scope: true,
      compile: function(element, attrs) {
        CustomElements.upgrade(element[0]);
        return {
          pre: function(scope, element, attrs) {
            CustomElements.upgrade(element[0]);

            var popover = new PopoverView(scope, element, attrs);

            $onsen.declareVarAttribute(attrs, popover);
            $onsen.registerEventHandlers(popover, 'preshow prehide postshow posthide destroy');
            $onsen.addModifierMethodsForCustomElements(popover, element);

            element.data('ons-popover', popover);

            scope.$on('$destroy', function() {
              popover._events = undefined;
              $onsen.removeModifierMethods(popover);
              element.data('ons-popover', undefined);
              element = null;
            });

            if ($onsen.isAndroid()) {
              setImmediate(function() {
                popover.addModifier('android');
              });
            }
          },
          post: function(scope, element) {
            $onsen.fireComponentEvent(element[0], 'init');
          }
        };
      }
    };
  }]);
})();


/**
 * @ngdoc directive
 * @id progress
 * @name ons-progress
 * @category progress
 * @description
 *   [en]A material design progress component. Can be displayed both as a linear or circular progress indicator.[/en]
 *   [ja]マテリアルデザインのprgoressコンポーネントです。linearもしくはcircularなプログレスインジケータを表示できます。[/ja]
 * @example
 * <ons-progress
 *  type="circular"
 *  value="55"
 *  secondary-value="87">
 * </ons-progress>
 */

/**
 * @ngdoc attribute
 * @name type
 * @initonly
 * @type {String}
 * @description
 *   [en]The type of indicator. Can be one of either "bar" or "circular". Defaults to "bar".[/en]
 *   [ja]indicatorのタイプを指定します。"bar"もしくは"circular"を指定できます。デフォルトは"bar"です。[/ja]
 */

/**
 * @ngdoc attribute
 * @name modifier
 * @type {String}
 * @description
 *   [en]Change the appearance of the progress indicator.[/en]
 *   [ja]プログレスインジケータの見た目を変更します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name value
 * @type {Number}
 * @description
 *   [en]Current progress. Should be a value between 0 and 100.[/en]
 *   [ja]現在の進行状況の値を指定します。0から100の間の値を指定して下さい。[/ja]
 */

/**
 * @ngdoc attribute
 * @name secondary-value
 * @type {Number}
 * @description
 *   [en]Current secondary progress. Should be a value between 0 and 100.[/en]
 *   [ja]現在の２番目の進行状況の値を指定します。0から100の間の値を指定して下さい。[/ja]
 */

/**
 * @ngdoc attribute
 * @name indeterminate 
 * @description
 *   [en]If this attribute is set, an infinite looping animation will be shown.[/en]
 *   [ja]この属性が設定された場合、ループするアニメーションが表示されます。[/ja]
 */

/**
 * @ngdoc directive
 * @id pull-hook
 * @name ons-pull-hook
 * @category control
 * @description
 *   [en]Component that adds "pull-to-refresh" to an <ons-page> element.[/en]
 *   [ja]ons-page要素以下でいわゆるpull to refreshを実装するためのコンポーネントです。[/ja]
 * @codepen WbJogM
 * @guide UsingPullHook
 *   [en]How to use Pull Hook[/en]
 *   [ja]プルフックを使う[/ja]
 * @example
 * <script>
 *   ons.bootstrap()
 *
 *   .controller('MyController', function($scope, $timeout) {
 *     $scope.items = [3, 2 ,1];
 *
 *     $scope.load = function($done) {
 *       $timeout(function() {
 *         $scope.items.unshift($scope.items.length + 1);
 *         $done();
 *       }, 1000);
 *     };
 *   });
 * </script>
 *
 * <ons-page ng-controller="MyController">
 *   <ons-pull-hook var="loaded" ng-action="load($done)">
 *     <span ng-switch="loader.getCurrentState()">
 *       <span ng-switch-when="initial">Pull down to refresh</span>
 *       <span ng-switch-when="preaction">Release to refresh</span>
 *       <span ng-switch-when="action">Loading data. Please wait...</span>
 *     </span>
 *   </ons-pull-hook>
 *   <ons-list>
 *     <ons-list-item ng-repeat="item in items">
 *       Item #{{ item }}
 *     </ons-list-item>
 *   </ons-list>
 * </ons-page>
 */

/**
 * @ngdoc event
 * @name changestate
 * @description
 *   [en]Fired when the state is changed. The state can be either "initial", "preaction" or "action".[/en]
 *   [ja]コンポーネントの状態が変わった場合に発火します。状態は、"initial", "preaction", "action"のいずれかです。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクト。[/ja]
 * @param {Object} event.pullHook
 *   [en]Component object.[/en]
 *   [ja]コンポーネントのオブジェクト。[/ja]
 * @param {String} event.state
 *   [en]Current state.[/en]
 *   [ja]現在の状態名を参照できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name var
 * @extensionOf angular
 * @initonly
 * @type {String}
 * @description
 *   [en]Variable name to refer this component.[/en]
 *   [ja]このコンポーネントを参照するための名前を指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name disabled
 * @description
 *   [en]If this attribute is set the "pull-to-refresh" functionality is disabled.[/en]
 *   [ja]この属性がある時、disabled状態になりアクションが実行されなくなります[/ja]
 */

/**
 * @ngdoc attribute
 * @name ng-action
 * @initonly
 * @extensionOf angular
 * @type {Expression}
 * @description
 *   [en]Use to specify custom behavior when the page is pulled down. A <code>$done</code> function is available to tell the component that the action is completed.[/en]
 *   [ja]pull downしたときの振る舞いを指定します。アクションが完了した時には<code>$done</code>関数を呼び出します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name on-action
 * @type {Expression}
 * @description
 *   [en]Same as <code>ng-action</code> but can be used without AngularJS. A function called <code>done</code> is available to call when action is complete.[/en]
 *   [ja]<code>ng-action</code>と同じですが、AngularJS無しで利用する場合に利用できます。アクションが完了した時には<code>done</code>関数を呼び出します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name height
 * @type {String}
 * @description
 *   [en]Specify the height of the component. When pulled down further than this value it will switch to the "preaction" state. The default value is "64px".[/en]
 *   [ja]コンポーネントの高さを指定します。この高さ以上にpull downすると"preaction"状態に移行します。デフォルトの値は"64px"です。[/ja]
 */

/**
 * @ngdoc attribute
 * @name threshold-height
 * @type {String}
 * @description
 *   [en]Specify the threshold height. The component automatically switches to the "action" state when pulled further than this value. The default value is "96px". A negative value or a value less than the height will disable this property.[/en]
 *   [ja]閾値となる高さを指定します。この値で指定した高さよりもpull downすると、このコンポーネントは自動的に"action"状態に移行します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name fixed-content
 * @description
 *   [en]If this attribute is set the content of the page will not move when pulling.[/en]
 *   [ja]この属性がある時、プルフックが引き出されている時にもコンテンツは動きません。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-changestate
 * @initonly
 * @extensionOf angular
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "changestate" event is fired.[/en]
 *  [ja]"changestate"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc method
 * @signature setDisabled(disabled)
 * @param {Boolean} disabled
 *   [en]If true the pull hook will be disabled.[/en]
 *   [ja]trueを指定すると、プルフックがdisabled状態になります。[/ja]
 * @description
 *   [en]Disable or enable the component.[/en]
 *   [ja]disabled状態にするかどうかを設定できます。[/ja]
 */

/**
 * @ngdoc method
 * @signature isDisabled()
 * @return {Boolean}
 *   [en]true if the pull hook is disabled.[/en]
 *   [ja]プルフックがdisabled状態の場合、trueを返します。[/ja]
 * @description
 *   [en]Returns whether the component is disabled or enabled.[/en]
 *   [ja]disabled状態になっているかを得ることが出来ます。[/ja]
 */

/**
 * @ngdoc method
 * @signature getHeight()
 * @description
 *   [en]Returns the height of the pull hook in pixels.[/en]
 *   [ja]プルフックの高さをピクセル数で返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature setHeight(height)
 * @param {Number} height
 *   [en]Desired height.[/en]
 *   [ja]要素の高さを指定します。[/ja]
 * @description
 *   [en]Specify the height.[/en]
 *   [ja]高さを指定できます。[/ja]
 */

/**
 * @ngdoc method
 * @signature getThresholdHeight()
 * @description
 *   [en]Returns the height of the threshold in pixels.[/en]
 *   [ja]閾値、となる高さをピクセル数で返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature setThresholdHeight(thresholdHeight)
 * @param {Number} thresholdHeight
 *   [en]Desired threshold height.[/en]
 *   [ja]プルフックのアクションを起こす閾値となる高さを指定します。[/ja]
 * @description
 *   [en]Specify the threshold height.[/en]
 *   [ja]閾値となる高さを指定できます。[/ja]
 */

/**
 * @ngdoc method
 * @signature getPullDistance()
 * @description
 *   [en]Returns the current number of pixels the pull hook has moved.[/en]
 *   [ja]現在のプルフックが引き出された距離をピクセル数で返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature getCurrentState()
 * @description
 *   [en]Returns the current state of the element.[/en]
 *   [ja]要素の現在の状態を返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature on(eventName, listener)
 * @extensionOf angular
 * @description
 *   [en]Add an event listener.[/en]
 *   [ja]イベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]このイベントが発火された際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature once(eventName, listener)
 * @extensionOf angular
 * @description
 *  [en]Add an event listener that's only triggered once.[/en]
 *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature off(eventName, [listener])
 * @extensionOf angular
 * @description
 *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
 *  [ja]イベントリスナーを削除します。もしイベントリスナーを指定しなかった場合には、そのイベントに紐づく全てのイベントリスナーが削除されます。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]削除するイベントリスナーを指定します。[/ja]
 */

(function() {
  'use strict';


  /**
   * Pull hook directive.
   */
  angular.module('onsen').directive('onsPullHook', ['$onsen', 'PullHookView', function($onsen, PullHookView) {
    return {
      restrict: 'E',
      replace: false,
      scope: true,

      compile: function(element, attrs) {
        CustomElements.upgrade(element[0]);
        return {
          pre: function(scope, element, attrs) {
            CustomElements.upgrade(element[0]);
            var pullHook = new PullHookView(scope, element, attrs);

            $onsen.declareVarAttribute(attrs, pullHook);
            $onsen.registerEventHandlers(pullHook, 'changestate destroy');
            element.data('ons-pull-hook', pullHook);

            scope.$on('$destroy', function() {
              pullHook._events = undefined;
              element.data('ons-pull-hook', undefined);
              scope = element = attrs = null;
            });
          },
          post: function(scope, element) {
            $onsen.fireComponentEvent(element[0], 'init');
          }
        };
      }
    };
  }]);

})();

/**
 * @ngdoc directive
 * @id ripple
 * @name ons-ripple
 * @category form
 * @description
 *   [en]Adds a Material Design "ripple" effect to an element.[/en]
 *   [ja]マテリアルデザインのリップル効果をDOM要素に追加します。[/ja]
 * @example
 * <ons-list>
 *   <ons-list-item>
 *    <ons-ripple color="rgba(0, 0, 0, 0.3)"></ons-ripple>
 *    Click me!
 *   </ons-list-item>
 * </ons-list>
 *
 * <ons-ripple target="children" color="rgba(0, 0, 0, 0.3)">
 *   <p>Click me!</p>
 * </ons-ripple>
 */

/**
 * @ngdoc attribute
 * @name color
 * @type {String}
 * @description
 *   [en]Color of the ripple effect.[/en]
 *   [ja]リップルエフェクトの色を指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name center
 * @description
 *   [en]If this attribute is set, the effect will originate from the center.[/en]
 *   [ja]この属性が設定された場合、その効果は要素の中央から始まります。[/ja]
 */

/**
 * @ngdoc attribute
 * @name target
 * @type {String}
 * @description
 *   [en]If this attribute is set to children, the effect will be applied to the children of the component instead of the parent.[/en]
 *   [ja]この属性に"children"を設定されたとき、リップルエフェクトはこのコンポーネントの子要素に適用されます。そうでなければ、親要素に適用されます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name disabled
 * @description
 *   [en]If this attribute is set, the ripple effect will be disabled.[/en]
 *   [ja]この属性が設定された場合、リップルエフェクトは無効になります。[/ja]
 */

(function() {
  'use strict';

  angular.module('onsen').directive('onsRipple', ['$onsen', 'GenericView', function($onsen, GenericView) {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        CustomElements.upgrade(element[0]);
        GenericView.register(scope, element, attrs, {viewKey: 'ons-ripple'});
        $onsen.fireComponentEvent(element[0], 'init');
      }
    };
  }]);
})();

/**
 * @ngdoc directive
 * @id row
 * @name ons-row
 * @category grid
 * @description
 *   [en]Represents a row in the grid system. Use with ons-col to layout components.[/en]
 *   [ja]グリッドシステムにて行を定義します。ons-colとともに使用し、コンポーネントの配置に使用します。[/ja]
 * @codepen GgujC {wide}
 * @guide Layouting
 *   [en]Layouting guide[/en]
 *   [ja]レイアウト調整[/ja]
 * @seealso ons-col
 *   [en]ons-col component[/en]
 *   [ja]ons-colコンポーネント[/ja]
 * @note
 *   [en]For Android 4.3 and earlier, and iOS6 and earlier, when using mixed alignment with ons-row and ons-col, they may not be displayed correctly. You can use only one vertical-align.[/en]
 *   [ja]Android 4.3以前、もしくはiOS 6以前のOSの場合、ons-rowとons-colを組み合わせてそれぞれのons-col要素のvertical-align属性の値に別々の値を指定すると、描画が崩れる場合があります。vertical-align属性の値には一つの値だけを指定できます。[/ja]
 * @example
 * <ons-row>
 *   <ons-col width="50px"><ons-icon icon="fa-twitter"></ons-icon></ons-col>
 *   <ons-col>Text</ons-col>
 * </ons-row>
 */

/**
 * @ngdoc attribute
 * @name vertical-align
 * @type {String}
 * @description
 *   [en]Short hand attribute for aligning vertically. Valid values are top, bottom, and center.[/en]
 *   [ja]縦に整列するために指定します。top、bottom、centerのいずれかを指定できます。[/ja]
 */

/**
 * @ngdoc directive
 * @id scroller
 * @name ons-scroller
 * @category base
 * @description
 *   [en]Makes the content inside this tag scrollable.[/en]
 *   [ja]要素内をスクロール可能にします。[/ja]
 * @example
 * <ons-scroller style="height: 200px; width: 100%">
 *   ...
 * </ons-scroller>
 */

/**
 * @ngdoc directive
 * @id sliding_menu
 * @name ons-sliding-menu
 * @category navigation
 * @extensionOf angular
 * @description
 *   [en]Component for sliding UI where one page is overlayed over another page. The above page can be slided aside to reveal the page behind.[/en]
 *   [ja]スライディングメニューを表現するためのコンポーネントで、片方のページが別のページの上にオーバーレイで表示されます。above-pageで指定されたページは、横からスライドして表示します。[/ja]
 * @codepen IDvFJ
 * @seealso ons-page
 *   [en]ons-page component[/en]
 *   [ja]ons-pageコンポーネント[/ja]
 * @guide UsingSlidingMenu
 *   [en]Using sliding menu[/en]
 *   [ja]スライディングメニューを使う[/ja]
 * @guide EventHandling
 *   [en]Using events[/en]
 *   [ja]イベントの利用[/ja]
 * @guide CallingComponentAPIsfromJavaScript
 *   [en]Using navigator from JavaScript[/en]
 *   [ja]JavaScriptからコンポーネントを呼び出す[/ja]
 * @guide DefiningMultiplePagesinSingleHTML
 *   [en]Defining multiple pages in single html[/en]
 *   [ja]複数のページを1つのHTMLに記述する[/ja]
 * @example
 * <ons-sliding-menu var="app.menu" main-page="page.html" menu-page="menu.html" max-slide-distance="200px" type="reveal" side="left">
 * </ons-sliding-menu>
 *
 * <ons-template id="page.html">
 *   <ons-page>
 *    <p style="text-align: center">
 *      <ons-button ng-click="app.menu.toggleMenu()">Toggle</ons-button>
 *    </p>
 *   </ons-page>
 * </ons-template>
 *
 * <ons-template id="menu.html">
 *   <ons-page>
 *     <!-- menu page's contents -->
 *   </ons-page>
 * </ons-template>
 *
 */

/**
 * @ngdoc event
 * @name preopen
 * @description
 *   [en]Fired just before the sliding menu is opened.[/en]
 *   [ja]スライディングメニューが開く前に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクトです。[/ja]
 * @param {Object} event.slidingMenu
 *   [en]Sliding menu view object.[/en]
 *   [ja]イベントが発火したSlidingMenuオブジェクトです。[/ja]
 */

/**
 * @ngdoc event
 * @name postopen
 * @description
 *   [en]Fired just after the sliding menu is opened.[/en]
 *   [ja]スライディングメニューが開き終わった後に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクトです。[/ja]
 * @param {Object} event.slidingMenu
 *   [en]Sliding menu view object.[/en]
 *   [ja]イベントが発火したSlidingMenuオブジェクトです。[/ja]
 */

/**
 * @ngdoc event
 * @name preclose
 * @description
 *   [en]Fired just before the sliding menu is closed.[/en]
 *   [ja]スライディングメニューが閉じる前に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクトです。[/ja]
 * @param {Object} event.slidingMenu
 *   [en]Sliding menu view object.[/en]
 *   [ja]イベントが発火したSlidingMenuオブジェクトです。[/ja]
 */

/**
 * @ngdoc event
 * @name postclose
 * @description
 *   [en]Fired just after the sliding menu is closed.[/en]
 *   [ja]スライディングメニューが閉じ終わった後に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクトです。[/ja]
 * @param {Object} event.slidingMenu
 *   [en]Sliding menu view object.[/en]
 *   [ja]イベントが発火したSlidingMenuオブジェクトです。[/ja]
 */

/**
 * @ngdoc attribute
 * @name var
 * @initonly
 * @type {String}
 * @description
 *  [en]Variable name to refer this sliding menu.[/en]
 *  [ja]このスライディングメニューを参照するための名前を指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name menu-page
 * @initonly
 * @type {String}
 * @description
 *   [en]The url of the menu page.[/en]
 *   [ja]左に位置するメニューページのURLを指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name main-page
 * @initonly
 * @type {String}
 * @description
 *   [en]The url of the main page.[/en]
 *   [ja]右に位置するメインページのURLを指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name swipeable
 * @initonly
 * @type {Boolean}
 * @description
 *   [en]Whether to enable swipe interaction.[/en]
 *   [ja]スワイプ操作を有効にする場合に指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name swipe-target-width
 * @initonly
 * @type {String}
 * @description
 *   [en]The width of swipeable area calculated from the left (in pixels). Use this to enable swipe only when the finger touch on the screen edge.[/en]
 *   [ja]スワイプの判定領域をピクセル単位で指定します。画面の端から指定した距離に達するとページが表示されます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name max-slide-distance
 * @initonly
 * @type {String}
 * @description
 *   [en]How far the menu page will slide open. Can specify both in px and %. eg. 90%, 200px[/en]
 *   [ja]menu-pageで指定されたページの表示幅を指定します。ピクセルもしくは%の両方で指定できます（例: 90%, 200px）[/ja]
 */

/**
 * @ngdoc attribute
 * @name side
 * @initonly
 * @type {String}
 * @description
 *   [en]Specify which side of the screen the menu page is located on. Possible values are "left" and "right".[/en]
 *   [ja]menu-pageで指定されたページが画面のどちら側から表示されるかを指定します。leftもしくはrightのいずれかを指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name type
 * @initonly
 * @type {String}
 * @description
 *   [en]Sliding menu animator. Possible values are reveal (default), push and overlay.[/en]
 *   [ja]スライディングメニューのアニメーションです。"reveal"（デフォルト）、"push"、"overlay"のいずれかを指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-preopen
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "preopen" event is fired.[/en]
 *  [ja]"preopen"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-preclose
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "preclose" event is fired.[/en]
 *  [ja]"preclose"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-postopen
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "postopen" event is fired.[/en]
 *  [ja]"postopen"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-postclose
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "postclose" event is fired.[/en]
 *  [ja]"postclose"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-init
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "init" event is fired.[/en]
 *  [ja]ページの"init"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-show
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "show" event is fired.[/en]
 *  [ja]ページの"show"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-hide
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "hide" event is fired.[/en]
 *  [ja]ページの"hide"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-destroy
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "destroy" event is fired.[/en]
 *  [ja]ページの"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc method
 * @signature setMainPage(pageUrl, [options])
 * @param {String} pageUrl
 *   [en]Page URL. Can be either an HTML document or an <code>&lt;ons-template&gt;</code>.[/en]
 *   [ja]pageのURLか、ons-templateで宣言したテンプレートのid属性の値を指定します。[/ja]
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {Boolean} [options.closeMenu]
 *   [en]If true the menu will be closed.[/en]
 *   [ja]trueを指定すると、開いているメニューを閉じます。[/ja]
 * @param {Function} [options.callback]
 *   [en]Function that is executed after the page has been set.[/en]
 *   [ja]ページが読み込まれた後に呼び出される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]Show the page specified in pageUrl in the main contents pane.[/en]
 *   [ja]中央部分に表示されるページをpageUrlに指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature setMenuPage(pageUrl, [options])
 * @param {String} pageUrl
 *   [en]Page URL. Can be either an HTML document or an <code>&lt;ons-template&gt;</code>.[/en]
 *   [ja]pageのURLか、ons-templateで宣言したテンプレートのid属性の値を指定します。[/ja]
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {Boolean} [options.closeMenu]
 *   [en]If true the menu will be closed after the menu page has been set.[/en]
 *   [ja]trueを指定すると、開いているメニューを閉じます。[/ja]
 * @param {Function} [options.callback]
 *   [en]This function will be executed after the menu page has been set.[/en]
 *   [ja]メニューページが読み込まれた後に呼び出される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]Show the page specified in pageUrl in the side menu pane.[/en]
 *   [ja]メニュー部分に表示されるページをpageUrlに指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature openMenu([options])
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {Function} [options.callback]
 *   [en]This function will be called after the menu has been opened.[/en]
 *   [ja]メニューが開いた後に呼び出される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]Slide the above layer to reveal the layer behind.[/en]
 *   [ja]メニューページを表示します。[/ja]
 */

/**
 * @ngdoc method
 * @signature closeMenu([options])
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {Function} [options.callback]
 *   [en]This function will be called after the menu has been closed.[/en]
 *   [ja]メニューが閉じられた後に呼び出される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]Slide the above layer to hide the layer behind.[/en]
 *   [ja]メニューページを非表示にします。[/ja]
 */

/**
 * @ngdoc method
 * @signature toggleMenu([options])
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {Function} [options.callback]
 *   [en]This function will be called after the menu has been opened or closed.[/en]
 *   [ja]メニューが開き終わった後か、閉じ終わった後に呼び出される関数オブジェクトです。[/ja]
 * @description
 *   [en]Slide the above layer to reveal the layer behind if it is currently hidden, otherwise, hide the layer behind.[/en]
 *   [ja]現在の状況に合わせて、メニューページを表示もしくは非表示にします。[/ja]
 */

/**
 * @ngdoc method
 * @signature isMenuOpened()
 * @return {Boolean}
 *   [en]true if the menu is currently open.[/en]
 *   [ja]メニューが開いていればtrueとなります。[/ja]
 * @description
 *   [en]Returns true if the menu page is open, otherwise false.[/en]
 *   [ja]メニューページが開いている場合はtrue、そうでない場合はfalseを返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature getDeviceBackButtonHandler()
 * @return {Object}
 *   [en]Device back button handler.[/en]
 *   [ja]デバイスのバックボタンハンドラを返します。[/ja]
 * @description
 *   [en]Retrieve the back-button handler.[/en]
 *   [ja]ons-sliding-menuに紐付いているバックボタンハンドラを取得します。[/ja]
 */

/**
 * @ngdoc method
 * @signature setSwipeable(swipeable)
 * @param {Boolean} swipeable
 *   [en]If true the menu will be swipeable.[/en]
 *   [ja]スワイプで開閉できるようにする場合にはtrueを指定します。[/ja]
 * @description
 *   [en]Specify if the menu should be swipeable or not.[/en]
 *   [ja]スワイプで開閉するかどうかを設定する。[/ja]
 */

/**
 * @ngdoc method
 * @signature on(eventName, listener)
 * @description
 *   [en]Add an event listener.[/en]
 *   [ja]イベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]このイベントが発火された際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature once(eventName, listener)
 * @description
 *  [en]Add an event listener that's only triggered once.[/en]
 *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature off(eventName, [listener])
 * @description
 *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
 *  [ja]イベントリスナーを削除します。もしイベントリスナーを指定しなかった場合には、そのイベントに紐づく全てのイベントリスナーが削除されます。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]削除するイベントリスナーを指定します。[/ja]
 */

(function() {
  'use strict';
  var module = angular.module('onsen');

  module.directive('onsSlidingMenu', ['$compile', 'SlidingMenuView', '$onsen', function($compile, SlidingMenuView, $onsen) {
    return {
      restrict: 'E',
      replace: false,

      // NOTE: This element must coexists with ng-controller.
      // Do not use isolated scope and template's ng-transclude.
      transclude: false,
      scope: true,

      compile: function(element, attrs) {
        var main = element[0].querySelector('.main'),
            menu = element[0].querySelector('.menu');

        if (main) {
          var mainHtml = angular.element(main).remove().html().trim();
        }

        if (menu) {
          var menuHtml = angular.element(menu).remove().html().trim();
        }

        return function(scope, element, attrs) {
          element.append(angular.element('<div></div>').addClass('onsen-sliding-menu__menu ons-sliding-menu-inner'));
          element.append(angular.element('<div></div>').addClass('onsen-sliding-menu__main ons-sliding-menu-inner'));

          var slidingMenu = new SlidingMenuView(scope, element, attrs);

          $onsen.registerEventHandlers(slidingMenu, 'preopen preclose postopen postclose init show hide destroy');

          if (mainHtml && !attrs.mainPage) {
            slidingMenu._appendMainPage(null, mainHtml);
          }

          if (menuHtml && !attrs.menuPage) {
            slidingMenu._appendMenuPage(menuHtml);
          }

          $onsen.declareVarAttribute(attrs, slidingMenu);
          element.data('ons-sliding-menu', slidingMenu);

          scope.$on('$destroy', function(){
            slidingMenu._events = undefined;
            element.data('ons-sliding-menu', undefined);
          });

          $onsen.fireComponentEvent(element[0], 'init');
        };
      }
    };
  }]);
})();

/**
 * @ngdoc directive
 * @id split-view
 * @name ons-split-view
 * @extensionOf angular
 * @category control
 * @description
 *  [en]Divides the screen into a left and right section.[/en]
 *  [ja]画面を左右に分割するコンポーネントです。[/ja]
 * @codepen nKqfv {wide}
 * @guide Usingonssplitviewcomponent
 *   [en]Using ons-split-view.[/en]
 *   [ja]ons-split-viewコンポーネントを使う[/ja]
 * @guide CallingComponentAPIsfromJavaScript
 *   [en]Using navigator from JavaScript[/en]
 *   [ja]JavaScriptからコンポーネントを呼び出す[/ja]
 * @example
 * <ons-split-view
 *   secondary-page="secondary.html"
 *   main-page="main.html"
 *   main-page-width="70%"
 *   collapse="portrait">
 * </ons-split-view>
 */

/**
 * @ngdoc event
 * @name update
 * @description
 *   [en]Fired when the split view is updated.[/en]
 *   [ja]split viewの状態が更新された際に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクトです。[/ja]
 * @param {Object} event.splitView
 *   [en]Split view object.[/en]
 *   [ja]イベントが発火したSplitViewオブジェクトです。[/ja]
 * @param {Boolean} event.shouldCollapse
 *   [en]True if the view should collapse.[/en]
 *   [ja]collapse状態の場合にtrueになります。[/ja]
 * @param {String} event.currentMode
 *   [en]Current mode.[/en]
 *   [ja]現在のモード名を返します。"collapse"か"split"かのいずれかです。[/ja]
 * @param {Function} event.split
 *   [en]Call to force split.[/en]
 *   [ja]この関数を呼び出すと強制的にsplitモードにします。[/ja]
 * @param {Function} event.collapse
 *   [en]Call to force collapse.[/en]
 *   [ja]この関数を呼び出すと強制的にcollapseモードにします。[/ja]
 * @param {Number} event.width
 *   [en]Current width.[/en]
 *   [ja]現在のSplitViewの幅を返します。[/ja]
 * @param {String} event.orientation
 *   [en]Current orientation.[/en]
 *   [ja]現在の画面のオリエンテーションを返します。"portrait"かもしくは"landscape"です。 [/ja]
 */

/**
 * @ngdoc event
 * @name presplit
 * @description
 *   [en]Fired just before the view is split.[/en]
 *   [ja]split状態にる前に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクト。[/ja]
 * @param {Object} event.splitView
 *   [en]Split view object.[/en]
 *   [ja]イベントが発火したSplitViewオブジェクトです。[/ja]
 * @param {Number} event.width
 *   [en]Current width.[/en]
 *   [ja]現在のSplitViewnの幅です。[/ja]
 * @param {String} event.orientation
 *   [en]Current orientation.[/en]
 *   [ja]現在の画面のオリエンテーションを返します。"portrait"もしくは"landscape"です。[/ja]
 */

/**
 * @ngdoc event
 * @name postsplit
 * @description
 *   [en]Fired just after the view is split.[/en]
 *   [ja]split状態になった後に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクト。[/ja]
 * @param {Object} event.splitView
 *   [en]Split view object.[/en]
 *   [ja]イベントが発火したSplitViewオブジェクトです。[/ja]
 * @param {Number} event.width
 *   [en]Current width.[/en]
 *   [ja]現在のSplitViewnの幅です。[/ja]
 * @param {String} event.orientation
 *   [en]Current orientation.[/en]
 *   [ja]現在の画面のオリエンテーションを返します。"portrait"もしくは"landscape"です。[/ja]
 */

/**
 * @ngdoc event
 * @name precollapse
 * @description
 *   [en]Fired just before the view is collapsed.[/en]
 *   [ja]collapse状態になる前に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクト。[/ja]
 * @param {Object} event.splitView
 *   [en]Split view object.[/en]
 *   [ja]イベントが発火したSplitViewオブジェクトです。[/ja]
 * @param {Number} event.width
 *   [en]Current width.[/en]
 *   [ja]現在のSplitViewnの幅です。[/ja]
 * @param {String} event.orientation
 *   [en]Current orientation.[/en]
 *   [ja]現在の画面のオリエンテーションを返します。"portrait"もしくは"landscape"です。[/ja]
 */

/**
 * @ngdoc event
 * @name postcollapse
 * @description
 *   [en]Fired just after the view is collapsed.[/en]
 *   [ja]collapse状態になった後に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクト。[/ja]
 * @param {Object} event.splitView
 *   [en]Split view object.[/en]
 *   [ja]イベントが発火したSplitViewオブジェクトです。[/ja]
 * @param {Number} event.width
 *   [en]Current width.[/en]
 *   [ja]現在のSplitViewnの幅です。[/ja]
 * @param {String} event.orientation
 *   [en]Current orientation.[/en]
 *   [ja]現在の画面のオリエンテーションを返します。"portrait"もしくは"landscape"です。[/ja]
 */

/**
 * @ngdoc attribute
 * @name var
 * @initonly
 * @type {String}
 * @description
 *   [en]Variable name to refer this split view.[/en]
 *   [ja]このスプリットビューコンポーネントを参照するための名前を指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @initonly
 * @name main-page
 * @type {String}
 * @description
 *   [en]The url of the page on the right.[/en]
 *   [ja]右側に表示するページのURLを指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name main-page-width
 * @initonly
 * @type {Number}
 * @description
 *   [en]Main page width percentage. The secondary page width will be the remaining percentage.[/en]
 *   [ja]右側のページの幅をパーセント単位で指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name secondary-page
 * @initonly
 * @type {String}
 * @description
 *   [en]The url of the page on the left.[/en]
 *   [ja]左側に表示するページのURLを指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name collapse
 * @initonly
 * @type {String}
 * @description
 *   [en]
 *     Specify the collapse behavior. Valid values are portrait, landscape, width #px or a media query.
 *     "portrait" or "landscape" means the view will collapse when device is in landscape or portrait orientation.
 *     "width #px" means the view will collapse when the window width is smaller than the specified #px.
 *     If the value is a media query, the view will collapse when the media query is true.
 *   [/en]
 *   [ja]
 *     左側のページを非表示にする条件を指定します。portrait, landscape、width #pxもしくはメディアクエリの指定が可能です。
 *     portraitもしくはlandscapeを指定すると、デバイスの画面が縦向きもしくは横向きになった時に適用されます。
 *     width #pxを指定すると、画面が指定した横幅よりも短い場合に適用されます。
 *     メディアクエリを指定すると、指定したクエリに適合している場合に適用されます。
 *   [/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-update
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "update" event is fired.[/en]
 *  [ja]"update"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-presplit
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "presplit" event is fired.[/en]
 *  [ja]"presplit"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-precollapse
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "precollapse" event is fired.[/en]
 *  [ja]"precollapse"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-postsplit
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "postsplit" event is fired.[/en]
 *  [ja]"postsplit"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-postcollapse
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "postcollapse" event is fired.[/en]
 *  [ja]"postcollapse"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-init
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "init" event is fired.[/en]
 *  [ja]ページの"init"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-show
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "show" event is fired.[/en]
 *  [ja]ページの"show"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-hide
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "hide" event is fired.[/en]
 *  [ja]ページの"hide"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-destroy
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "destroy" event is fired.[/en]
 *  [ja]ページの"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc method
 * @signature setMainPage(pageUrl)
 * @param {String} pageUrl
 *   [en]Page URL. Can be either an HTML document or an <ons-template>.[/en]
 *   [ja]pageのURLか、ons-templateで宣言したテンプレートのid属性の値を指定します。[/ja]
 * @description
 *   [en]Show the page specified in pageUrl in the right section[/en]
 *   [ja]指定したURLをメインページを読み込みます。[/ja]
 */

/**
 * @ngdoc method
 * @signature setSecondaryPage(pageUrl)
 * @param {String} pageUrl
 *   [en]Page URL. Can be either an HTML document or an <ons-template>.[/en]
 *   [ja]pageのURLか、ons-templateで宣言したテンプレートのid属性の値を指定します。[/ja]
 * @description
 *   [en]Show the page specified in pageUrl in the left section[/en]
 *   [ja]指定したURLを左のページの読み込みます。[/ja]
 */

/**
 * @ngdoc method
 * @signature update()
 * @description
 *   [en]Trigger an 'update' event and try to determine if the split behavior should be changed.[/en]
 *   [ja]splitモードを変えるべきかどうかを判断するための'update'イベントを発火します。[/ja]
 */

/**
 * @ngdoc method
 * @signature on(eventName, listener)
 * @description
 *   [en]Add an event listener.[/en]
 *   [ja]イベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]このイベントが発火された際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature once(eventName, listener)
 * @description
 *  [en]Add an event listener that's only triggered once.[/en]
 *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature off(eventName, [listener])
 * @description
 *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
 *  [ja]イベントリスナーを削除します。もしイベントリスナーを指定しなかった場合には、そのイベントに紐づく全てのイベントリスナーが削除されます。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]削除するイベントリスナーを指定します。[/ja]
 */

(function() {
  'use strict';
  var module = angular.module('onsen');

  module.directive('onsSplitView', ['$compile', 'SplitView', '$onsen', function($compile, SplitView, $onsen) {

    return {
      restrict: 'E',
      replace: false,
      transclude: false,
      scope: true,

      compile: function(element, attrs) {
        var mainPage = element[0].querySelector('.main-page'),
            secondaryPage = element[0].querySelector('.secondary-page');

        if (mainPage) {
          var mainHtml = angular.element(mainPage).remove().html().trim();
        }

        if (secondaryPage) {
          var secondaryHtml = angular.element(secondaryPage).remove().html().trim();
        }

        return function(scope, element, attrs) {
          element.append(angular.element('<div></div>').addClass('onsen-split-view__secondary full-screen ons-split-view-inner'));
          element.append(angular.element('<div></div>').addClass('onsen-split-view__main full-screen ons-split-view-inner'));

          var splitView = new SplitView(scope, element, attrs);

          if (mainHtml && !attrs.mainPage) {
            splitView._appendMainPage(mainHtml);
          }

          if (secondaryHtml && !attrs.secondaryPage) {
            splitView._appendSecondPage(secondaryHtml);
          }

          $onsen.declareVarAttribute(attrs, splitView);
          $onsen.registerEventHandlers(splitView, 'update presplit precollapse postsplit postcollapse init show hide destroy');

          element.data('ons-split-view', splitView);

          scope.$on('$destroy', function() {
            splitView._events = undefined;
            element.data('ons-split-view', undefined);
          });

          $onsen.fireComponentEvent(element[0], 'init');
        };
      }
    };
  }]);
})();

/**
 * @ngdoc directive
 * @id splitter
 * @name ons-splitter
 * @category control
 * @description
 *  [en]A component that enables responsive layout by implementing both a two-column layout and a sliding menu layout.[/en]
 *  [ja]sliding-menuとsplit-view両方の機能を持つレイアウトです。[/ja]
 * @guide CallingComponentAPIsfromJavaScript
 *   [en]Using components from JavaScript[/en]
 *   [ja]JavaScriptからコンポーネントを呼び出す[/ja]
 * @example
 * <ons-splitter>
 *   <ons-splitter-content>
 *     ...
 *   </ons-splitter-content>
 *
 *   <ons-splitter-side side="left" width="80%" collapse>
 *     ...
 *   </ons-splitter-side>
 * </ons-splitter>
 */

/**
 * @ngdoc attribute
 * @name var
 * @extensionOf angular
 * @initonly
 * @type {String}
 * @description
 *   [en]Variable name to refer this split view.[/en]
 *   [ja]このスプリットビューコンポーネントを参照するための名前を指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ons-destroy
 * @extensionOf angular
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
 *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc method
 * @signature openRight([options])
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {Function} [options.callback]
 *   [en]This function will be called after the menu has been opened.[/en]
 *   [ja]メニューが開いた後に呼び出される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]Open right ons-splitter-side menu on collapse mode.[/en]
 *   [ja]右のcollapseモードになっているons-splitter-side要素を開きます。[/ja]
 */

/**
 * @ngdoc method
 * @signature openLeft([options])
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {Function} [options.callback]
 *   [en]This function will be called after the menu has been opened.[/en]
 *   [ja]メニューが開いた後に呼び出される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]Open left ons-splitter-side menu on collapse mode.[/en]
 *   [ja]左のcollapseモードになっているons-splitter-side要素を開きます。[/ja]
 */
 
/**
 * @ngdoc method
 * @signature closeRight([options])
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {Function} [options.callback]
 *   [en]This function will be called after the menu has been closed.[/en]
 *   [ja]メニューが閉じた後に呼び出される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]Close right ons-splitter-side menu on collapse mode.[/en]
 *   [ja]右のcollapseモードになっているons-splitter-side要素を閉じます。[/ja]
 */

/**
 * @ngdoc method
 * @signature closeLeft([options])
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {Function} [options.callback]
 *   [en]This function will be called after the menu has been closed.[/en]
 *   [ja]メニューが閉じた後に呼び出される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]Close left ons-splitter-side menu on collapse mode.[/en]
 *   [ja]左のcollapseモードになっているons-splitter-side要素を閉じます。[/ja]
 */

/**
 * @ngdoc method
 * @signature loadContentPage(pageUrl)
 * @param {String} pageUrl
 *   [en]Page URL. Can be either an HTML document or an <code>&lt;ons-template&gt;</code>.[/en]
 *   [ja]pageのURLか、ons-templateで宣言したテンプレートのid属性の値を指定します。[/ja]
 * @description
 *   [en]Show the page specified in pageUrl in the ons-splitter-content pane.[/en]
 *   [ja]ons-splitter-content用紙に表示されるページをpageUrlに指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature loadContentPage(pageUrl)
 * @param {String} pageUrl
 *   [en]Page URL. Can be either an HTML document or an <code>&lt;ons-template&gt;</code>.[/en]
 *   [ja]pageのURLか、ons-templateで宣言したテンプレートのid属性の値を指定します。[/ja]
 * @description
 *   [en]Show the page specified in pageUrl in the ons-splitter-content pane.[/en]
 *   [ja]ons-splitter-content用紙に表示されるページをpageUrlに指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature leftIsOpened()
 * @return {Boolean}
 *   [en]Whether the left ons-splitter-side on collapse mode is opened.[/en]
 *   [ja]左のons-splitter-sideが開いているかどうかを返します。[/ja]
 * @description
 *   [en]Determines whether the left ons-splitter-side on collapse mode is opened.[/en]
 *   [ja]左のons-splitter-side要素が開いているかどうかを返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature rightIsOpened()
 * @return {Boolean}
 *   [en]Whether the right ons-splitter-side on collapse mode is opened.[/en]
 *   [ja]右のons-splitter-sideが開いているかどうかを返します。[/ja]
 * @description
 *   [en]Determines whether the right ons-splitter-side on collapse mode is opened.[/en]
 *   [ja]右のons-splitter-side要素が開いているかどうかを返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature getDeviceBackButtonHandler()
 * @return {Object}
 *   [en]Device back-button handler.[/en]
 *   [ja]デバイスのバックボタンハンドラを返します。[/ja]
 * @description
 *   [en]Retrieve the back-button handler.[/en]
 *   [ja]ons-splitter要素に紐付いているバックボタンハンドラを取得します。[/ja]
 */

/**
 * @ngdoc method
 * @signature on(eventName, listener)
 * @extensionOf angular
 * @description
 *   [en]Add an event listener.[/en]
 *   [ja]イベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]このイベントが発火された際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature once(eventName, listener)
 * @extensionOf angular
 * @description
 *  [en]Add an event listener that's only triggered once.[/en]
 *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature off(eventName, [listener])
 * @extensionOf angular
 * @description
 *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
 *  [ja]イベントリスナーを削除します。もしイベントリスナーを指定しなかった場合には、そのイベントに紐づく全てのイベントリスナーが削除されます。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]削除するイベントリスナーを指定します。[/ja]
 */

(function() {
  'use strict';

  angular.module('onsen').directive('onsSplitter', ['$compile', 'Splitter', '$onsen', function($compile, Splitter, $onsen) {
    return {
      restrict: 'E',
      scope: true,

      compile: function(element, attrs) {
        CustomElements.upgrade(element[0]);

        return function(scope, element, attrs) {
          CustomElements.upgrade(element[0]);

          var splitter = new Splitter(scope, element, attrs);

          $onsen.declareVarAttribute(attrs, splitter);
          $onsen.registerEventHandlers(splitter, 'destroy');

          element.data('ons-splitter', splitter);

          scope.$on('$destroy', function() {
            splitter._events = undefined;
            element.data('ons-splitter', undefined);
          });

          $onsen.fireComponentEvent(element[0], 'init');
        };
      }
    };
  }]);
})();

/**
 * @ngdoc directive
 * @id splitter-content
 * @name ons-splitter-content
 * @category control
 * @description
 *  [en]The "ons-splitter-content" element is used as a child element of "ons-splitter".[/en]
 *  [ja]ons-splitter-content要素は、ons-splitter要素の子要素として利用します。[/ja]
 * @example
 * <ons-splitter>
 *   <ons-splitter-content>
 *     ...
 *   </ons-splitter-content>
 *
 *   <ons-splitter-side side="left" width="80%" collapse>
 *     ...
 *   </ons-splitter-side>
 * </ons-splitter>
 */

/**
 * @ngdoc attribute
 * @name ons-destroy
 * @extensionOf angular
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
 *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @ngdoc attribute
 * @name page
 * @initonly
 * @type {String}
 * @description
 *   [en]The url of the menu page.[/en]
 *   [ja]ons-splitter-side要素に表示するページのURLを指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature load(pageUrl)
 * @param {String} pageUrl
 *   [en]Page URL. Can be either an HTML document or an <ons-template>.[/en]
 *   [ja]pageのURLか、ons-templateで宣言したテンプレートのid属性の値を指定します。[/ja]
 * @description
 *   [en]Show the page specified in pageUrl in the right section[/en]
 *   [ja]指定したURLをメインページを読み込みます。[/ja]
 */

(function() {
  'use strict';

  var lastReady = window.OnsSplitterContentElement.rewritables.ready;
  window.OnsSplitterContentElement.rewritables.ready = ons._waitDiretiveInit('ons-splitter-content', lastReady);

  var lastLink = window.OnsSplitterContentElement.rewritables.link;
  window.OnsSplitterContentElement.rewritables.link = function(element, target, callback) {
    var view = angular.element(element).data('ons-splitter-content');
    lastLink(element, target, function(target) {
      view._link(target, callback);
    });
  };

  angular.module('onsen').directive('onsSplitterContent', ['$compile', 'SplitterContent', '$onsen', function($compile, SplitterContent, $onsen) {
    return {
      restrict: 'E',

      compile: function(element, attrs) {
        CustomElements.upgrade(element[0]);

        return function(scope, element, attrs) {
          CustomElements.upgrade(element[0]);

          var view = new SplitterContent(scope, element, attrs);

          $onsen.declareVarAttribute(attrs, view);
          $onsen.registerEventHandlers(view, 'destroy');

          element.data('ons-splitter-content', view);

          scope.$on('$destroy', function() {
            view._events = undefined;
            element.data('ons-splitter-content', undefined);
          });

          $onsen.fireComponentEvent(element[0], 'init');
        };
      }
    };
  }]);
})();

/**
 * @ngdoc directive
 * @id splitter-side
 * @name ons-splitter-side
 * @category control
 * @description
 *  [en]The "ons-splitter-side" element is used as a child element of "ons-splitter".[/en]
 *  [ja]ons-splitter-side要素は、ons-splitter要素の子要素として利用します。[/ja]
 * @example
 * <ons-splitter>
 *   <ons-splitter-content>
 *     ...
 *   </ons-splitter-content>
 *
 *   <ons-splitter-side side="left" width="80%" collapse>
 *     ...
 *   </ons-splitter-side>
 * </ons-splitter>
 */

/**
 * @ngdoc event
 * @name modechange
 * @description
 *   [en]Fired just after the component's mode changes.[/en]
 *   [ja]この要素のモードが変化した際に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクトです。[/ja]
 * @param {Object} event.side
 *   [en]Component object.[/en]
 *   [ja]コンポーネントのオブジェクト。[/ja]
 * @param {String} event.mode
 *   [en]Returns the current mode. Can be either "collapse" or "split".[/en]
 *   [ja]現在のモードを返します。[/ja]
 */

/**
 * @ngdoc event
 * @name preopen
 * @description
 *   [en]Fired just before the sliding menu is opened.[/en]
 *   [ja]スライディングメニューが開く前に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクトです。[/ja]
 * @param {Function} event.cancel
 *   [en]Call to cancel opening sliding menu.[/en]
 *   [ja]スライディングメニューが開くのをキャンセルします。[/ja]
 * @param {Object} event.side
 *   [en]Component object.[/en]
 *   [ja]コンポーネントのオブジェクト。[/ja]
 */

/**
 * @ngdoc event
 * @name postopen
 * @description
 *   [en]Fired just after the sliding menu is opened.[/en]
 *   [ja]スライディングメニューが開いた後に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクトです。[/ja]
 * @param {Object} event.side
 *   [en]Component object.[/en]
 *   [ja]コンポーネントのオブジェクト。[/ja]
 */

/**
 * @ngdoc event
 * @name preclose
 * @description
 *   [en]Fired just before the sliding menu is closed.[/en]
 *   [ja]スライディングメニューが閉じる前に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクトです。[/ja]
 * @param {Object} event.side
 *   [en]Component object.[/en]
 *   [ja]コンポーネントのオブジェクト。[/ja]
 * @param {Function} event.cancel
 *   [en]Call to cancel opening sliding-menu.[/en]
 *   [ja]スライディングメニューが閉じるのをキャンセルします。[/ja]
 */

/**
 * @ngdoc event
 * @name postclose
 * @description
 *   [en]Fired just after the sliding menu is closed.[/en]
 *   [ja]スライディングメニューが閉じた後に発火します。[/ja]
 */
