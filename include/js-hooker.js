// Coded by DosX
// We're not like this — life is like this.

console.clear();
console.log(`%c
                                                                         
      ██ ███████       ██   ██  ██████   ██████  ██   ██ ███████ ██████  
      ██ ██            ██   ██ ██    ██ ██    ██ ██  ██  ██      ██   ██ 
      ██ ███████ █████ ███████ ██    ██ ██    ██ █████   █████   ██████  
 ██   ██      ██       ██   ██ ██    ██ ██    ██ ██  ██  ██      ██   ██ 
  █████  ███████       ██   ██  ██████   ██████  ██   ██ ███████ ██   ██ 
          %cCoded by DosX%c — %chttps://github.com/DosX-dev/js-hooker          `,
    'color: white; background: black; font-size: 12px; font-weight: bold;', 'color: white; background: black; font-size: 12px;', 'color: white; background: black; font-size: 12px;', 'color: white; background: black; font-size: 12px;');

const nativeFunctionCache = {};

function watchAllFunctions(obj, exclude = []) {
    for (let key in obj) {
        if (typeof obj[key] === 'function' && !exclude.includes(key)) {
            const originalFunction = obj[key];

            if (obj[key] === watchAllFunctions) {
                continue;
            }

            obj[key] = function() {
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

                if (!(key in nativeFunctionCache)) {
                    nativeFunctionCache[key] = !!originalFunction && (typeof originalFunction).toLowerCase() === 'function' &&
                        (originalFunction === Function.prototype ||
                            /^\s*function\s*(\b[a-z$_][a-z0-9$_]*\b)*\s*\((|([a-z$_][a-z0-9$_]*)(\s*,[a-z$_][a-z0-9$_]*)*)\)\s*{\s*\[native code\]\s*}\s*$/i.test(String(originalFunction)));
                }

                const isNativeFunction = nativeFunctionCache[key];

                console.log(
                    `%c${isNativeFunction ? '[N]' : '[C]'}%c %c[CALL CAPTURED]%c : ${key}(` + args.join(', ') + ");",
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
    }
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
