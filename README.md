# Craftloader
ES6 Loader that loads Scripts and Style Sheets and caches them accordingly 


## Using Craftloader    

To import a script just call the Craftloader.require function    
it takes Objects as arguments.    

``` javascript
  Craftloader.require({script : '/myfancyscript.js' });
```    
Each object in the require has either a script or css property that    
containes the path/URL of the script or css stylesheet being imported.    

Importing mutiple files are easy , just add (more) objects
``` javascript
Craftloader.require(
    { url : '/js/components/craftsocket.js'}, // url defaults to script import
    { script : '/js/components/ripple.js'}, // fetches script
    { css : '/css/stylesconcat.css'} // fetches css 
);

```

Give it a custom key instead of the Url becoming the key

``` javascript
Craftloader.require({ script : '/js/components/ripple.js', key : 'rippler'});

```

##### Conditionally Import or Execute an Import

``` javascript
  /*  posibly useful for feuture detection for polyfilling */
  Craftloader.require({script : '/Polyfill.js' , test : boolean  )});
``` 
the import will only happen if the test property in the object is true.      
aditionally there is an execute property which if added and set to false,    
will import the script or style but not execute it    


##### Skip Caching the Style or Script

``` javascript
  /* 
   *   noCache property prevents the script being cached 
   *   when it's set to true 
   */
  Craftloader.require({ url: 'Crafter.js', noCache: true});
```

##### Load in Script or Style after another    

``` javascript
// .then() is causaly linked to the first import
Craftloader.require({ url : '/js/meFirst.js'}).then(() => {
  Craftloader.require({ url : '/js/meSecond.js'});
});
```

##### Set an expiry date on an Import

``` javascript
  Craftloader.require({ url: 'Crafter.js', expire: 2 /* note it's in hours */});
```

##### To remove an Import

``` javascript
  Craftloader.remove("key or url");
```
or remove all imports 

``` javascript
  Craftloader.removeAll();
```

##### To get the contents of an import

`var = mySourceCode = Craftloader.get("url or key");`

##### Handle Errors when they happen

``` javascript
  Craftloader.require({ key : 'Hamsters.js' }).then(() => {
    // Success
  }).catch(err => {
    // Import failed Error
    console.error(err); -> 'no script/css/url found'
  });
```
