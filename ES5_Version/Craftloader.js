'use strict';

(function (document) {
  var pre = 'craft:',
      doc = document,
      def = function def() {
    for (var _len = arguments.length, obj = Array(_len), _key = 0; _key < _len; _key++) {
      obj[_key] = arguments[_key];
    }

    return obj.every(function (i) {
      return i !== undefined;
    });
  };

  self.Craftloader = {
    Import: function Import() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var obj = undefined,
          promises = [],
          i = undefined;
      for (i in args) if (args[i].test !== false) {
        obj = { url: args[i].css || args[i].script || args[i].url, type: args[i].css ? 'css' : 'script', exec: args[i].execute !== false };
        if (args[i].noCache === true) obj.noCache = true;
        if (def(args[i].key)) obj.key = args[i].key;
        if (def(args[i].defer)) obj.defer = args[i].defer;
        if (def(args[i].expire)) obj.expire = args[i].expire;
        promises.push(CraftImport(obj));
      } else Craftloader.remove(args[i].css || args[i].script || args[i].url);
      return Promise.all(promises).then(execute);
    },
    setPrekey: function setPrekey(str) {
      return pre = str + ':';
    },
    get: function get(key) {
      return JSON.parse(localStorage.getItem(pre + key) || false);
    },
    remove: function remove(key) {
      return localStorage.removeItem(pre + key);
    },
    removeAll: function removeAll(expired) {
      var key = undefined,
          i = undefined,
          now = +new Date();
      for (i in localStorage) {
        key = i.split(pre)[1];
        if (key && (!expired || Craftloader.get(key).expire <= now)) Craftloader.remove(key);
      }
    }
  };

  function CraftImport(obj) {
    var promise = undefined,
        now = +new Date(),
        key = obj.key || obj.url,
        src = Craftloader.get(key);
    if (!src || src.expire - now < 0 || obj.unique !== src.unique) {
      if (obj.unique) obj.url += (obj.url.indexOf('?') > 0 ? '&' : '?') + 'unique=' + obj.unique;
      promise = new Promise(function (success, failed) {
        return fetch(obj.url).then(function (res) {
          return res.text().then(function (data) {
            obj.data = data;
            obj.stamp = now;
            obj.expire = now + (obj.expire || 4000) * 60 * 60 * 1000;
            if (!obj.noCache) localStorage.setItem(pre + key, JSON.stringify(obj));
            success(obj);
          });
        }).catch(function (err) {
          return failed('Craftloader: problem fetching import -> ' + err);
        });
      });
    } else promise = new Promise(function (resolve) {
      return resolve(src);
    });
    return promise;
  }

  function execute(sources) {
    return sources.map(function (obj) {
      if (obj.exec) {
        var execEl = undefined;
        obj.type === 'css' ? execEl = doc.createElement('style') : execEl = doc.createElement('script');
        if (obj.type !== 'css') execEl.defer = obj.defer || false;
        execEl.innerHTML = obj.data;
        doc.head.appendChild(execEl);
        return obj;
      }
    });
  }
  Craftloader.removeAll(true);
})(document);
