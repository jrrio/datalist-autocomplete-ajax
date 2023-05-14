**Autocomplete HTML5 Datalist using AJAX**

Instead of manually adding dozens of options to a HTML5 Datalist, this demo uses AJAX to provide suggestions (autocomplete) to a Datalist while the user types in the input field.

The goal here is to fetch programming languages from the server (Netlify Serverless Function) and store in a local cache, in order to avoid fetching over and over again for the same languages.

Also, I'm using a _debounce_ function to limit the number of times _search() function_ is called in a short period of time. This will avoid unnecessary requests to the server while the user is typing in the search field.

ECMAScript 2015 (aka ES6) is used extensively, e.g. let, const, arrow function, destructuring, etc. Tested with Chrome 55, FF 50, MS Edge and Safari for iOS.
