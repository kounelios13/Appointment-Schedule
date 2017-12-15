/**
 * 
 * @module map-functions
 * @overview A set of map functions 
 */


/**
 * Create an option element from a string
 * @param {string} text The text/value of the option
 * @returns {Node} option The created option 
 */
function stringToOption(text) {
    let option = document.createElement('option');
    option.innerText = text;
    return option;
}

/**
 * Convert text to number
 * @param {string} text The text to convert
 * @returns {Number|NaN} number The number extracted from  text or NaN 
 */
function stringToNumber(text) {
    let number = new Number(text);
    return number;
}    

module.exports = {
    stringToOption,
    stringToNumber
};