/**
 * This module will be used to provide some utilities for 
 * every BrowserWindow instance that needs to access the appointments
 * @module appointment-utilities
 */

const lockr = require('lockr');
/**
 * Sorts a list of appointments based on their executionDate property or an other property if a sort callback is provided
 * @param {object[]} appointments The appointments to sort
 * @param {Function} [sortCallback] A callback that will sort appointments based on a different property than the execution date 
 * @param {boolean} [saveToLocalStorage] An optional boolean value that indicates whether you want to save the sorted appointments to localStorage
 */
function sortAppointments(appointments, sortCallback, saveToLocalStorage) {
    let sortFunction = null;
    //Check if user has provided a custom sort callback and ifthis callback is a function
    if (sortCallback && typeof sortCallback == 'function') {
        sortFunction = sortCallback;
    } else {
        sortFunction = (appointmentA, appointmentB) => {
            //https://stackoverflow.com/questions/30691066/sort-a-string-date-array
            appointmentA = appointmentA.executionDate.split('/').reverse().join('');
            appointmentB = appointmentB.executionDate.split('/').reverse().join('');
            return appointmentA > appointmentB ? 1 : appointmentA < appointmentB ? -1 : 0;
        };
    }
    appointments.sort(sortFunction);
    if (saveToLocalStorage) {
        lockr.set('appointments', appointments);
    }
    return appointments;
}

/**
 * Extract the date from each appointment to an array.
 * Useful to build a dropdown of appointment dates
 * @param {object[]} appointments An array of appointment objects
 * @param {Function} [filterCallback] A callback that let us filter the appointment dates.It accepts a string which is an appointment date
 * @param {boolean} onlyYear If true returns only the year from  the dates
 * @returns {string[]} dates
 */
function getAppointmentDates(appointments, filterCallback, onlyYear) {
    let datesSet = new Set();
    appointments.forEach(appointment => {
        const aDate = appointment.executionDate;
        if (aDate) {
            //Fr some reason execution date might be empty because of stupid me
            datesSet.add(appointment.executionDate);
        }
    });
    let dates = Array.from(datesSet);
    if (filterCallback && typeof filterCallback == 'function') {
        dates = dates.filter(filterCallback);
    }
    dates.sort((date1, date2) => {
        date1 = date1.split('/').reverse().join('');
        date2 = date2.split('/').reverse().join('');
        return date1 > date2 ? 1 : date1 < date2 ? -1 : 0;
    });
    if (onlyYear) {
        let yearSet = new Set(dates.map(date => date.split('/').pop()));
        dates = Array.from(yearSet);
    }
    return dates;
}

function resetAppointmentsForDemo(appointments) {
    //Keep current appointments with their state in a seperate key
    lockr.set('appointments-old', appointments);
    appointments.forEach(ap => {
        ap.done = false;
        ap.cancelled = false;
    });

    lockr.set('appointments', appointments);
}


/**
 * @class AppointmentManager Handle different messages by user prvided callbacks
 */
class AppointmentManager {
    constructor(msgReceiver, callbacks) {
        this.receiver = msgReceiver;
        let creation = callbacks['registration'];
        let cancellation = callbacks['cancellation'];
        let completion = callbacks['completion'];
        let deletion = callbacks['deletion'];
        this.receiver.on('registered-new-appointment', creation)
            .on('appointment-cancelled', cancellation)
            .on('appointment-completed', completion)
            .on('appointment-deleted',deletion);
    }
}
module.exports = {
    getAppointmentDates,
    sortAppointments,
    resetAppointmentsForDemo,
    AppointmentManager
};