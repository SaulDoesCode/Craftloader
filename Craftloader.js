'use strict';
(document => {
  var pre = 'craft:', doc = document, def = (...obj) => obj.every(i => i !== undefined);

  self.Craftloader = {
    Import: (...args) => {
      let obj, promises = [], i;
      for (i in args) if (args[i].test !== false) {
          obj = { url: (args[i].css || args[i].script), type: args[i].css ? 'css' : 'script' , exec : args[i].execute !== false};
          if (args[i].noCache === true) obj.noCache = true;
          if (def(args[i].key)) obj.key = args[i].key;
          if (def(args[i].defer)) obj.defer = args[i].defer;
          if (def(args[i].expire)) obj.expire = args[i].expire;
          promises.push(CraftImport(obj));
        } else Craftloader.remove((args[i].css || args[i].script));
      return Promise.all(promises).then(execute);
    },
    setPrekey: str => pre = str + ':',
    get: key => JSON.parse(localStorage.getItem(key.includes(pre) ? key : pre + key) || false),
    remove: key => localStorage.removeItem(key.includes(pre) ? key : pre + key),
    removeAll: expired => {
      let i, now = +new Date();
      for (i in localStorage) if (!expired || Craftloader.get(i).expire <= now) Craftloader.remove(i);
    }
  };

  var CraftImport = obj => {
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

  var execute = src => src.map(obj => {
        let el;
        (obj.type === 'css') ? el = doc.createElement('style'): el = doc.createElement('script');
        if (obj.type !== 'css') el.defer = obj.defer || false;
        el.innerHTML = obj.data;
        if(obj.exec) doc.head.appendChild(el);
        return obj;
  });
  Craftloader.removeAll(true);
})(document);
