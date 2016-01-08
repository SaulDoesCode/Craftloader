'use strict';
(function (doc) {
  self.Craftloader = Object.defineProperties({
    pre: 'craft:',
    fetchImport: function fetchImport(obj) {
      obj.key = obj.key || obj.url;
      var now = +new Date(),
          src = Craftloader.get(obj.key);
      if (src || src.expire - now > 0) return new Promise(function (resolve) {
        return resolve(src);
      });
      return new Promise(function (pass, fail) {
        return fetch(obj.url).then(function (res) {
          return res.text().then(function (data) {
            obj.data = data;
            obj.stamp = now;
            obj.expire = now + (obj.expire || 4000) * 60 * 60 * 1000;
            if (obj.cache) localStorage.setItem(Craftloader.pre + obj.key, JSON.stringify(obj));
            pass(obj);
          });
        })['catch'](function (err) {
          return fail('error importing -> ' + err);
        });
      });
    },

    get: function get(key) {
      return JSON.parse(localStorage.getItem(key.includes(Craftloader.pre) ? key : Craftloader.pre + key) || false);
    },
    remove: function remove(key) {
      return localStorage.removeItem(key.includes(Craftloader.pre) ? key : Craftloader.pre + key);
    },
    removeAll: function removeAll(expired) {
      for (var i in localStorage) {
        if (!expired || Craftloader.get(i).expire <= +new Date()) Craftloader.remove(i);
      }
    },
    Import: function Import() {
      var promises = [];
      Array.prototype.slice.call(arguments).forEach(function (arg) {
        return arg.test === false ? Craftloader.remove(arg.css || arg.script) : promises.push(Craftloader.fetchImport({
          url: arg.css || arg.script,
          type: arg.css ? 'css' : 'script',
          exec: arg.execute !== false,
          cache: arg.cache !== false,
          defer: arg.defer ? 'defer' : null,
          key: arg.key,
          expire: arg.expire
        }));
      });
      return Promise.all(promises).then(function (src) {
        return src.map(function (obj) {
          if (!obj.exec) return;
          var el = doc.createElement(obj.type === 'css' ? 'style' : 'script');
          el.defer = obj.defer;
          obj.type === 'css' ? el.textContent = obj.data : el.src = URL.createObjectURL(new Blob([obj.data]));
          if (obj.key) el.setAttribute('key', obj.key);
          doc.head.appendChild(el);
        });
      });
    }
  }, {
    prekey: {
      set: function set(str) {
        Craftloader.pre = str + ':';
      },
      configurable: true,
      enumerable: true
    }
  });
  Craftloader.removeAll(true);
})(document);
