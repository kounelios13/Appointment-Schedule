const uuidv4 = require('uuid/v4');
/**
 * @class
 * This class hold various info for an appointment
 */
class Appointment {
    /**
     * @param {Date} executionDate The day the appointment will be executed
     * @param {string} room The room of the appointment
     * @param {string} info Some extra info about that appointment
     */
    constructor(executionDate, room,info) {
        this.registrationDate = (new Date()).getTime();
        this.executionDate = executionDate;
        this.room = room;
        this.info = info;
        this.done = false;
        //Add a random char before the uuid to avoid valid uuids which begin with a number
        //to be invalid id name
        this.id = `a${uuidv4()}`;
        //Used to check if an appointment was cancelled
        this.cancelled = false;
    }
}
module.exports = {
    Appointment
};