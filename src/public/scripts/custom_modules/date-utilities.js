
const months = {
    9: 'September',
    10: 'October',
    11: 'November',
    12: 'December',
    1: 'January',
    2: 'February',
    3: 'March',
    4: 'April',
    5: 'May',
    6: 'June',
    7: 'July',
    8: 'August'
};

/**
 * Convert a month number to a string representation
 * 
 * @param {number} month A number(or a string) indicating the month (Month indexing  start from 1 not from 0) 
 * @throws Error if month number is out of [1-12] range
 */
function monthToStringRepresentation(month) {
  
    if (!months[month]) {
        throw new Error(`Month number(${month}) out of range[1-12]`);
    }
    let monthStringRepresentation = months[month];
    return monthStringRepresentation;
}

/**
 * Converts a month name to its numerical format(starting from 1)
 * @param {string} month 
 */
function monthNameToNumber(month) {
    for (let m in months) {
        if (months[m] == month) {
            return m;
        }
    }
}



module.exports = {
    monthToStringRepresentation,
    monthNameToNumber
};