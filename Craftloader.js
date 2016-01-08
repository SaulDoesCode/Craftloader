'use strict';
((doc) => {
  self.Craftloader = {
    pre: 'craft:',
    fetchImport(obj) {
      obj.key = obj.key || obj.url;
      let now = +new Date(),
        src = Craftloader.get(obj.key);
      if (src || src.expire - now > 0) return new Promise(resolve => resolve(src));
      return new Promise((pass, fail) => fetch(obj.url).then(res => res.text().then(data => {
        obj.data = data;
        obj.stamp = now;
        obj.expire = now + ((obj.expire || 4000) * 60 * 60 * 1000);
        if (obj.cache) localStorage.setItem(Craftloader.pre + obj.key, JSON.stringify(obj));
        pass(obj);
      })).catch(err => fail(`error importing -> ${err}`)));
    },
    set prekey(str) {Craftloader.pre = str + ':'},
    get: key => JSON.parse(localStorage.getItem(key.includes(Craftloader.pre) ? key : Craftloader.pre + key) || false),
    remove: key => localStorage.removeItem(key.includes(Craftloader.pre) ? key : Craftloader.pre + key),
    removeAll(expired) { for (let i in localStorage) if (!expired || Craftloader.get(i).expire <= +new Date()) Craftloader.remove(i) },
    Import() {
      let promises = [];
      Array.prototype.slice.call(arguments).forEach(arg => arg.test === false ? Craftloader.remove(arg.css || arg.script) : promises.push(Craftloader.fetchImport({
        url: arg.css || arg.script,
        type: arg.css ? 'css' : 'script',
        exec: arg.execute !== false,
        cache: arg.cache !== false,
        defer: arg.defer ? 'defer' : null,
        key: arg.key,
        expire: arg.expire
      })));
      return Promise.all(promises).then(src => src.map(obj => {
        if (!obj.exec) return;
        let el = doc.createElement(obj.type === 'css' ? 'style' : 'script');
        el.defer = obj.defer;
        obj.type === 'css' ? el.textContent = obj.data : el.src = URL.createObjectURL(new Blob([obj.data]));
        if (obj.key) el.setAttribute('key', obj.key);
        doc.head.appendChild(el);
      }));
    }
  }
  Craftloader.removeAll(true);
})(document);
