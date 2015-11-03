'use strict';
(function (document) {
  var PreKey = 'craft:',
      ua = navigator.userAgent,
      tem,
      M = ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
  if (M && (tem = ua.match(/version\/([\.\d]+)/i)) != null) M[2] = tem[1];
  M ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];

  window.CurrentBrowser = {
    is: function is(browser) {
      if (CurrentBrowser.browser.toLowerCase().includes(browser.toLowerCase())) return true;
      return false;
    },
    browser: M.join(' ')
  };

  function CraftImport(obj) {
    var src, promise;
    src = Craftloader.get(obj.key || obj.url);
    obj.execute = obj.execute !== false;
    if (!src || src.expire - +new Date() < 0 || obj.unique !== src.unique) {
      if (obj.unique) obj.url += (obj.url.indexOf('?') > 0 ? '&' : '?') + 'unique=' + obj.unique;
      promise = new Promise(function (success, failure) {
        fetch(obj.url).then(function (res) {
          res.text().then(function (content) {
            var now = +new Date();
            obj.data = content;
            obj.stamp = now;
            obj.expire = now + (obj.expire || 4000) * 60 * 60 * 1000;
            if (!obj.noCache) {
              try {
                localStorage.setItem(PreKey + (obj.key || obj.url), JSON.stringify(obj));
              } catch (e) {
                e.name.toUpperCase().includes('QUOTA') ? console.warn('localStorage is over QUOTA :' + e) : console.warn("couldn't cache Module executing locally: " + e);
              }
            }
            success(obj);
          });
        })['catch'](function (res) {
          return failure('Could not fetch Craftloader import -> ' + res);
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
        var execEl;
        obj.type === 'css' ? execEl = document.createElement('style') : execEl = document.createElement('script');
        if (obj.type !== 'css') execEl.defer = obj.defer || false;
        execEl.innerHTML = obj.data;
        document.head.appendChild(execEl);
      }
      return obj;
    });
  }

  window.Craftloader = {
    Import: function Import() {
      var obj,
          arg,
          promises = [];
      for (var i = 0; i < arguments.length; i++) {
        arg = arguments[i];
        if (arg.test !== undefined && arg.test === false || arg.execute !== undefined && arg.execute === false) {
          if (arg.test === false) Craftloader.remove(arg.css || arg.script || arg.url);
        } else {
          obj = {
            url: arg.script || arg.css || arg.url,
            type: arg.css ? 'css' : 'script'
          };
          if (obj.url === undefined || obj.url === '' || obj.url === null) return console.error('no script/css/url found');
          if (arg.noCache === true) obj.noCache = true;
          if (arg.key !== undefined) obj.key = arg.key;
          if (arg.defer !== undefined) obj.defer = obj.key;
          if (arg.expire !== undefined) obj.expire = arg.expire;
          promises.push(CraftImport(obj));
        }
      }
      return Promise.all(promises).then(execute);
    },
    remove: function remove(key) {
      return localStorage.removeItem(PreKey + key);
    },
    get: function get(key) {
      try {
        return JSON.parse(localStorage.getItem(PreKey + key) || false);
      } catch (e) {
        return undefined;
      }
    },
    removeAll: function removeAll(expired) {
      var mod,
          key,
          now = +new Date();
      for (mod in localStorage) {
        key = mod.split(PreKey)[1];
        if (key && (!expired || Craftloader.get(key).expire <= now)) Craftloader.remove(key);
      }
    }
  };
  Craftloader.removeAll(true);
})(document);
