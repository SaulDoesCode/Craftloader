'use strict';
(document => {

  this.CurrentBrowser = {
    is: browser => {
      if (CurrentBrowser.browser.toLowerCase().includes(browser.toLowerCase())) return true;
      return false;
    },
    browser: 'unknown'
  };

  var PreKey = 'craft:',
    ua = navigator.userAgent,
    tem,
    M = ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
  if (M && (tem = ua.match(/version\/([\.\d]+)/i)) != null) M[2] = tem[1];
  M ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  this.CurrentBrowser.browser = M.join(' ');

  function fetchImport(obj) {
    return new Promise((success, failure) => {
      fetch(obj.url).then(res => {
        res.text().then(content => {
          var now = +new Date();
          obj.data = content;
          obj.stamp = now;
          obj.expire = now + ((obj.expire || 4500) * 60 * 60 * 1000);
          if (!obj.noCache) {
            try {
              localStorage.setItem(PreKey + (obj.key || obj.url), JSON.stringify(obj));
            } catch (e) {
              (e.name.toUpperCase().includes('QUOTA')) ? console.warn('localStorage is over QUOTA :' + e): console.warn("couldn't cache Module executing locally: " + e);
            }
          }
          success(obj);
        });
      }).catch(res => failure('Could not fetch module -> ' + res));
    });
  }

  function serializeModule(obj) {
    var src, promise;
    if (obj.url === undefined) {
      console.error('no script/css/url found');
      return false;
    }
    src = Craftloader.get(obj.url);
    obj.execute = obj.execute !== false;
    if (!src || src.expire - +new Date() < 0 || obj.unique !== src.unique) {
      if (obj.unique) obj.url += ((obj.url.indexOf('?') > 0) ? '&' : '?') + 'unique=' + obj.unique;
      promise = fetchImport(obj);
    } else {
      src.execute = obj.execute;
      promise = new Promise(resolve => resolve(src));
    }
    return promise;
  }

  function execProcess(sources) {
    return sources.map(obj => {
      if (obj.execute) {
        var execEl;
        (obj.type === 'css') ? execEl = document.createElement('style'): execEl = document.createElement('script');
        if (obj.type !== 'css') execEl.defer = obj.defer || false;
        execEl.innerHTML = obj.data;
        document.head.appendChild(execEl);
      }
      return obj;
    });
  }

  this.Craftloader = {
    require: function () {
      var obj, arg, promises = [];
      for (arg of arguments) {
        if ((arg.test !== undefined && arg.test === false) || (arg.execute !== undefined && arg.execute === false)) {
          if (arg.test === false) Craftloader.remove((arg.css || arg.script || arg.url));
        } else {
          obj = {
            url: (arg.script || arg.css || arg.url),
            type: arg.css ? 'css' : 'script'
          };
          if (arg.noCache === true) obj.noCache = true;
          promises.push(serializeModule(obj));
          if (this.CraftedModules.indexOf(obj.url) < 0) this.CraftedModules.push(obj.url);
        }
      }
      return Promise.all(promises).then(execProcess);
    },
    remove: key => localStorage.removeItem(PreKey + key),
    get: key => {
      try {
        return JSON.parse(localStorage.getItem(PreKey + key) || false);
      } catch (e) {
        return undefined;
      }
    },
    removeAll: expired => {
      var mod, key, now = +new Date();
      for (mod in localStorage) {
        key = mod.split(PreKey)[1];
        if (key && (!expired || Craftloader.get(key).expire <= now)) Craftloader.remove(key);
      }
    },
    CraftedModules: []
  };
  Craftloader.removeAll(true);
})(document);
