# Craftloader
ES6 Loader that loads Scripts and Style Sheets and caches them accordingly 


## Using Craftloader    

To import a script just call the Craftloader.Import function    
it takes Objects as arguments.    

``` javascript
  Craftloader.Import({script : '/myfancyscript.js' });
```    
Each object in the Import has either a script or css property that    
containes the path/URL of the script or css stylesheet being imported.    

Importing mutiple files are easy , just add (more) objects
``` javascript
Craftloader.Import(
    { css : '/js/components/craftsocket.js'}, // order is irrelevant
    { script : '/js/components/ripple.js'}, // fetches script 
    { css : '/css/stylesconcat.css'} // fetches css 
);

```

Give it a custom key instead of the Url becoming the key

``` javascript
Craftloader.Import({ script : '/js/components/ripple.js', key : 'rippler'});

// to Optionally set the cache PreKey for all imports 
Craftloader.setPreKey('CustomKey');

```

##### Conditionally Import or Execute an Import

``` javascript
  /*  posibly useful for feuture detection for polyfilling */
  Craftloader.Import({script : '/Polyfill.js' , test : boolean  )});
``` 
the import will only happen if the test property in the object is true.      
aditionally there is an execute property which if added and set to false,    
will import the script or style but not execute it    

##### Delay Executing a Script (defer)

``` javascript
  //  defer , delays execution till DOM is loaded
  Craftloader.Import({script : '/dependency.js' , defer : true  )});
``` 

##### Skip Caching the Style or Script

``` javascript
  /* 
   *   noCache property prevents the script being cached 
   *   when it's set to true 
   */
  Craftloader.Import({ url: 'Crafter.js', noCache: true});
```

##### Load in Script or Style after another    

``` javascript
// .then() is causaly linked to the first import
Craftloader.Import({ url : '/js/meFirst.js'}).then(() => {
  Craftloader.Import({ url : '/js/meSecond.js'});
});
// note multiple imports will only trigger then() after 
// every import is done
```

##### Set an expiry date on an Import

``` javascript
  Craftloader.Import({ url: 'Crafter.js', expire: 2 /* note it's in hours */});
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
  Craftloader.Import({ key : 'Hamsters.js' }).then(() => {
    // Success
  }).catch(err => {
    // Import failed Error
    console.error(err); -> 'no script/css/url found'
  });
```
#### Take Note
###### -> Craftloader dependencies
  Craftloader doesn't have any other dependencies unless you,
  count polyfills for older Browsers.
  Here's a list of Specific feutures Craftloader uses
  * Fetch API
  * Promises
  * ES6 String , Array methods
  * ES6 Arrow functions , let , ...rest Parameters
  * localStorage
  * DOM4 Element Methods

Should be fine wihout es5 version on 
* Chrome 45+
* Firefox 44+
* Opera 33+
* Vivaldi*
* MicroSoft Edge 13+

##### Fear not a Babelized ES5 version is also available.
* Minified Polyfills available in repo
* Minified ES5 version also available.

##### Fact! - Un-Minified ES6 version les than 60 lines!


