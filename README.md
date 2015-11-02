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

Importing mutiple files are easy , just add more objects
``` javascript
Craftloader.require(
    { url : '/js/components/craftsocket.js'}, // url defaults to script import
    { script : '/js/components/ripple.js'}, // fetches script
    { css : '/css/stylesconcat.css'} // fetches css 
);

```

##### Conditionally Import or Execute an Import

``` javascript
  Craftloader.require({script : '/Polyfill.js' , test : boolean /*  possible feuture detection for polyfilling */ )});
``` 
the import will only happen if the test property in the object is true.


#### TODO Finish Documentation


  
