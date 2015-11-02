'use strict';
(document => {

  this.CurrentBrowser = {
    is: browser => {
      if (CurrentBrowser.browser.toLowerCase().includes(browser.toLowerCase())) return true;
      return false;
    },
    browser: 'unknown'
  };

  var ua = navigator.userAgent,
    tem,
    M = ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
  if (M && (tem = ua.match(/version\/([\.\d]+)/i)) != null) M[2] = tem[1];
  M ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  this.CurrentBrowser.browser = M.join(' ');

  var PreKey = 'craft:';

  function saveModule(obj) {
    return new Promise((success, failure) => {
      fetch(obj.url).then(res => {
        res.text().then(content => {
          var now = +new Date();
          obj.data = content;
          obj.noCache = obj.noCache || false;
          obj.stamp = now;
          obj.expire = now + ((obj.expire || 4500) * 60 * 60 * 1000);
          if (obj.noCache) {
            try {
              localStorage.setItem(PreKey + obj.key, JSON.stringify(obj));
            } catch (e) {
              (e.name.toUpperCase().includes('QUOTA')) ? console.warn('localStorage is over QUOTA :' + e): console.warn("couldn't cache Module executing locally: " + e);
            }
          }
          success(obj);
        });
      }).catch(res => failure('Could not fetch module -> ' + res));
    });
  }

  function verifyModule(src, obj) {
    return !src || src.expire - +new Date() < 0 || obj.unique !== src.unique;
  }

  function serializeModule(obj) {
    var source, promise;
    if (obj.url === undefined) return false;
    obj.key = (obj.key || obj.url);
    source = Craftloader.get(obj.key);
    obj.execute = obj.execute !== false;

    if (verifyModule(source, obj)) {
      if (obj.unique) obj.url += ((obj.url.indexOf('?') > 0) ? '&' : '?') + 'unique=' + obj.unique;
      promise = saveModule(obj);
    } else {
      source.execute = obj.execute;
      promise = new Promise(resolve => resolve(source));
    }
    return promise;
  }

  function execProcess(sources) {
    return sources.map(obj => {
      if (obj.execute) execute(obj);
      return obj;
    });
  }

  function execute(obj) {
    if (obj.type === 'css') {
      var style = document.createElement('style');
      style.innerHTML = obj.data;
      document.head.appendChild(style);
    } else {
      var script = document.createElement('script');
      script.defer = obj.defer || true;
      script.innerHTML = obj.data;
      document.head.appendChild(script);
    }
  }

  function deliverArgs() {
    var promises = [];
    Array.from(arguments).forEach(arg => {
      if (arg.test) {
        promises.push(serializeModule(arg));
      } else if (arg.test === undefined) {
        promises.push(serializeModule(arg));
      }
    });
    return Promise.all(promises);
  }

  function requireMore() {
    var resources = deliverArgs.apply(null, arguments);
    var promise = this.then(() => {
      return resources;
    }).then(execProcess);
    promise.requireMore = requireMore;
    return promise;
  }

  this.Craftloader = {
    require: function () {
      var obj = [],
        i = 0;
      Array.from(arguments).forEach(arg => {
        obj[i] = {};
        obj[i].execute = arg.execute !== false;
        if (arg.url === undefined) {
          if (arg.script !== undefined) {
            obj[i].url = arg.script;
            obj[i].type = 'script';
            arg.script = null;
          } else if (arg.css !== undefined) {
            obj[i].url = arg.css;
            obj[i].type = 'css';
            arg.css = null;
          }
        } else {
          obj[i].type = 'script';
        }
        i++;
        if (arg.execute !== false && this.CraftedModules.indexOf(arg.url) < 0) this.CraftedModules.push(obj.url);
      });
      var promise = deliverArgs.apply(null, obj).then(execProcess);
      promise.requireMore = requireMore;
      return promise;
    },
    remove: key => {
      localStorage.removeItem(PreKey + key);
      return Craftloader;
    },
    get: key => {
      try {
        return JSON.parse(localStorage.getItem(PreKey + key) || false);
      } catch (e) {
        return false;
      }
    },
    removeAll: expired => {
      var mod, key, now = +new Date();
      for (mod in localStorage) {
        key = mod.split(PreKey)[1];
        if (key && (!expired || Craftloader.get(key).expire <= now)) Craftloader.remove(key);
      }
      return Craftloader;
    },
    CraftedModules: []
  };
  Craftloader.removeAll(true);
})(document);
