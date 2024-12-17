// Coded by DosX
// We're not like this — life is like this.

console.clear();

console.log(`
      __ _____     _____         _            
   __|  |   __|___|  |  |___ ___| |_ ___ ___  
  |  |  |__   |___|     | . | . | '_| -_|  _| 
  |_____|_____|   |__|__|___|___|_,_|___|_|   
     https://github.com/DosX-dev/js-hooker    
               Coded by DosX                  

`);


const nativeFunctionCache = {};

function watchAllFunctions(obj, exclude = []) {
    for (let key in obj) {
        if (typeof obj[key] === 'function' && !exclude.includes(key)) {
            const originalFunction = obj[key];

            if (obj[key] === watchAllFunctions || obj[key] === getHookedFunction) {
                continue;
            }

            obj[key] = getHookedFunction(originalFunction);
        }
    }
}

function getHookedFunction(originalFunction) {
    return function() {
        "[native code]";
        const args = Array.from(arguments).map(arg => {
            if (typeof arg === 'string') {
                return `"${arg}"`;
            } else if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg);
                } catch (e) {
                    return '[Circular]';
                }
            } else {
                return arg;
            }
        });

        if (!(originalFunction.name in nativeFunctionCache)) {
            nativeFunctionCache[originalFunction.name] = !!originalFunction && (typeof originalFunction).toLowerCase() === 'function' &&
                (originalFunction === Function.prototype ||
                    /^\s*function\s*(\b[a-z$_][a-z0-9$_]*\b)*\s*\((|([a-z$_][a-z0-9$_]*)(\s*,[a-z$_][a-z0-9$_]*)*)\)\s*{\s*\[native code\]\s*}\s*$/i.test(String(originalFunction)));
        }

        const isNativeFunction = nativeFunctionCache[originalFunction.name];

        console.log(
            `%c${isNativeFunction ? '[N]' : '[C]'}%c %c[CALL CAPTURED]%c : ${originalFunction.name}(` + args.join(', ') + ");",
            `color: white; background: ${isNativeFunction ? 'red' : 'gray'};`,
            'color: default;',
            'color: white; background: darkorange;',
            'color: default;'
        );

        if (originalFunction) {
            return Function.prototype.apply.call(originalFunction, this, arguments);
        }
    };
}

// Change depending on what you need to track.
if (typeof global === 'object') { // Node.js
    watchAllFunctions(global);
} else if (typeof window === 'object') { // Browser
    watchAllFunctions(window);
    watchAllFunctions(navigator);
    watchAllFunctions(localStorage);
    watchAllFunctions(sessionStorage);
    watchAllFunctions(document);
    watchAllFunctions(history);
}

watchAllFunctions(console, ["log"]); // exclude console.log(...) function
