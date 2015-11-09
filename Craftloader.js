'use strict';
(document => {
  var pre = 'craft:', def = obj => obj !== undefined , doc = document;

  function CraftImport(obj) {
    let src = Craftloader.get((obj.key || obj.url)), promise , now = +new Date();
    obj.execute = obj.execute !== false;
    if (!src || src.expire - now < 0 || obj.unique !== src.unique) {
      if (obj.unique) obj.url += ((obj.url.indexOf('?') > 0) ? '&' : '?') + 'unique=' + obj.unique;
        promise = new Promise((success, failed) => fetch(obj.url).then(res => res.text().then(data => {
        obj.data = data;
        obj.stamp = now;
        obj.expire = now + ((obj.expire || 4000) * 60 * 60 * 1000);
        if (!obj.noCache)
        try { localStorage.setItem(pre + (obj.key || obj.url), JSON.stringify(obj))
        } catch (e) { e.name.toUpperCase().includes('QUOTA') ? console.warn(`localStorage is full: ${e}`) : console.warn(`Craftloader : problem caching script: ${e}`) }
        success(obj);
      })).catch(err => failed('Could not fetch Craftloader import -> ' + err)));
    } else {
      src.execute = obj.execute;
      promise = new Promise(resolve => resolve(src));
    }
    return promise;
  }

  function execute(sources) {
    return sources.map(obj => {
      if (obj.execute) {
        let execEl;
        (obj.type === 'css') ? execEl = doc.createElement('style'): execEl = doc.createElement('script');
        if (obj.type !== 'css') execEl.defer = obj.defer || false;
        execEl.innerHTML = obj.data;
        doc.head.appendChild(execEl);
      }
      return obj;
    });
  }

  self.Craftloader = {
    Import: function () {
      let obj, args = arguments, promises = [], i = 0;
      for (;i < args.length; i++) if (args[i].test === false || args[i].execute === false) {
          if (args[i].test === false) Craftloader.remove((args[i].css || args[i].script || args[i].url));
        } else {
          obj = {
            url: (args[i].script || args[i].css || args[i].url),
            type: args[i].css ? 'css' : 'script'
          };
          if (args[i].noCache === true) obj.noCache = true;
          if (def(args[i].key)) obj.key = args[i].key;
          if (def(args[i].defer)) obj.defer = args[i].defer;
          if (def(args[i].expire)) obj.expire = args[i].expire;
          promises.push(CraftImport(obj));
        }
      return Promise.all(promises).then(execute);
    },
    setPrekey : str => pre = str + ':',
    get: key => JSON.parse(localStorage.getItem(pre + key) || false),
    remove: key => localStorage.removeItem(pre + key),
    removeAll: expired => {
      let key, i, now = +new Date();
      for (i in localStorage) {
        key = i.split(pre)[1];
        if (key && (!expired || Craftloader.get(key).expire <= now)) Craftloader.remove(key);
      }
    }
  };
  Craftloader.removeAll(true);
})(document);
