/**
 * Watch a specific key in  localStorage or sessionStorage for changes
 * @param {string} keyName The name of the key
 * @param {Function} callback The function to execute when the specified key changes.It takes the old value of the key and its new one as parameters
 * @throws  
 */
function watchKey(keyName, callback) {

    if (!(keyName in localStorage || keyName in sessionStorage)) {
        throw new Error('Can\'t find requested key');
    }

    if(!callback || typeof callback != 'function'){
        throw new Error('Please provide a callback function');
    }
    window.addEventListener('storage', function (e) {
        if (e.key == keyName) {
            callback(e.oldValue, e.newValue);
        }
    });
}



if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = {
            watchKey
        };
    }
    
}
// AMD
else if (typeof define === 'function' && define.amd) {
    define('storageWatcher', function () {
        return {
            watchKey
        };
    });
} else {
    window.storageWatcher = {watchKey};
}