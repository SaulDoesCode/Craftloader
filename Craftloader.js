'use strict';
(document => {
  var pre = 'craft:', doc = document, def = (...obj) => obj.every(i => i !== undefined);

  self.Craftloader = {
    Import: (...args) => {
      let obj, promises = [], i;
      for (i in args) if (args[i].test !== false) {
          obj = { url: (args[i].css || args[i].script || args[i].url), type: args[i].css ? 'css' : 'script' , exec : args[i].execute !== false};
          if (args[i].noCache === true) obj.noCache = true;
          if (def(args[i].key)) obj.key = args[i].key;
          if (def(args[i].defer)) obj.defer = args[i].defer;
          if (def(args[i].expire)) obj.expire = args[i].expire;
          promises.push(CraftImport(obj));
        } else Craftloader.remove((args[i].css || args[i].script || args[i].url));
      return Promise.all(promises).then(execute);
    },
    setPrekey: str => pre = str + ':',
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

  function CraftImport(obj) {
    let promise, now = +new Date(), key = (obj.key || obj.url), src = Craftloader.get(key);
    if (!src || src.expire - now < 0 || obj.unique !== src.unique) {
      if (obj.unique) obj.url += ((obj.url.indexOf('?') > 0) ? '&' : '?') + 'unique=' + obj.unique;
        promise = new Promise((success, failed) => fetch(obj.url).then(res => res.text().then(data => {
        obj.data = data;
        obj.stamp = now;
        obj.expire = now + ((obj.expire || 4000) * 60 * 60 * 1000);
        if(!obj.noCache) localStorage.setItem(pre + key, JSON.stringify(obj));
        success(obj);
      })).catch(err => failed(`Craftloader: problem fetching import -> ${err}`)));
    } else promise = new Promise(resolve => resolve(src));
    return promise;
  }

  function execute(sources) {
    return sources.map(obj => {
      if(obj.exec) {
        let execEl;
        (obj.type === 'css') ? execEl = doc.createElement('style'): execEl = doc.createElement('script');
        if (obj.type !== 'css') execEl.defer = obj.defer || false;
        execEl.innerHTML = obj.data;
        doc.head.appendChild(execEl);
        return obj;
      }
    });
  }
  Craftloader.removeAll(true);
})(document);
