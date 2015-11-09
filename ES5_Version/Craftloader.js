'use strict';

(function (document) {
  var pre = 'craft:';

  function CraftImport(obj) {
    var src = Craftloader.get(obj.key || obj.url),
        promise = undefined,
        now = +new Date();
    obj.execute = obj.execute !== false;
    if (!src || src.expire - now < 0 || obj.unique !== src.unique) {
      if (obj.unique) obj.url += (obj.url.indexOf('?') > 0 ? '&' : '?') + 'unique=' + obj.unique;
      promise = new Promise(function (success, failure) {
        return fetch(obj.url).then(function (res) {
          return res.text().then(function (content) {
            obj.data = content;
            obj.stamp = now;
            obj.expire = now + (obj.expire || 4000) * 60 * 60 * 1000;
            if (!obj.noCache) {
              try {
                localStorage.setItem(pre + (obj.key || obj.url), JSON.stringify(obj));
              } catch (e) {
                e.name.toUpperCase().includes('QUOTA') ? console.warn('localStorage is over QUOTA :' + e) : console.warn("Craftloader couldn't cache script executing locally: " + e);
              }
            }
            success(obj);
          });
        }).catch(function (err) {
          return failure('Could not fetch Craftloader import -> ' + err);
        });
      });
    } else {
      src.execute = obj.execute;
      promise = new Promise(function (resolve) {
        return resolve(src);
      });
    }
    return promise;
  }

  function execute(sources) {
    return sources.map(function (obj) {
      if (obj.execute) {
        var execEl = undefined;
        obj.type === 'css' ? execEl = document.createElement('style') : execEl = document.createElement('script');
        if (obj.type !== 'css') execEl.defer = obj.defer || false;
        execEl.innerHTML = obj.data;
        document.head.appendChild(execEl);
      }
      return obj;
    });
  }

  self.Craftloader = {
    Import: function Import() {
      var obj = undefined,
          args = arguments,
          promises = [];
      for (var i = 0; i < args.length; i++) {
        if (!args[i].test || !args[i].execute) {
          if (args[i].test === false) Craftloader.remove(args[i].css || args[i].script || args[i].url);
        } else {
          obj = { url: args[i].script || args[i].css || args[i].url,
            type: args[i].css ? 'css' : 'script'
          };
          if (obj.url === undefined || obj.url === '') return console.error('no script/css/url found');
          if (args[i].noCache === true) obj.noCache = true;
          if (args[i].key !== undefined) obj.key = args[i].key;
          if (args[i].defer !== undefined) obj.defer = args[i].defer;
          if (args[i].expire !== undefined) obj.expire = args[i].expire;
          promises.push(CraftImport(obj));
        }
      }return Promise.all(promises).then(execute);
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
      var mod = undefined,
          key = undefined,
          now = +new Date();
      for (mod in localStorage) {
        key = mod.split(pre)[1];
        if (key && (!expired || Craftloader.get(key).expire <= now)) Craftloader.remove(key);
      }
    }
  };
  Craftloader.removeAll(true);
})(document);
