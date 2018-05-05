const {
    ipcRenderer
} = require('electron');
const Chart = require('chart.js');
const lockr = require('lockr');
const appointments = lockr.get('appointments') || [];
const {
    getAppointmentDates,
    AppointmentManager
} = require('../scripts/custom_modules/appointment-utilities');

const {
    stringToOption
} = require('../scripts/custom_modules/map-functions');
const {
    monthToStringRepresentation,
    monthNameToNumber
} = require('../scripts/custom_modules/date-utilities');



/**
 * Render a chart from a set of data
 * @param {object[]} appointments A set of appointments that will be used as data for chart
 * @param {Chart} chart A chart instance
 * @param {string} title Title of chart
 */
function buildChartFromAppointments(appointments, chart, title) {
    console.log(chart)
    let completed = appointments.filter(e => e.done).length;
    let cancelled = appointments.filter(e => e.cancelled).length;
    let pending = appointments.length - completed - cancelled;
    chart.data.datasets[0].data = [completed, cancelled, pending];
    chart.update();
}

/**
 * From a list of appointments find those that matches a specific month and year
 * @param {object[]} appointemnts The list to filter 
 * @param {string} year The year that an appointment must match to 
 * @param {string} month The month that an appointment must match to
 * @param {object[]} results
 */
function findAppointments(appointemnts, year, month) {
    let results = appointemnts.filter(e => {
        let date = e.executionDate.split('/');
        // dd-mm-yyyy
        let eMonth = date[1];
        let eYear = date[2];
        return (month == parseInt(eMonth)) && (year == eYear);
    });
    return results;
}

/**
 * Find if a change in an appointments affects our rendered chart
 * @param {object} appointment The appointment that caused havoc
 */
function handleAppointmentChange(appointment) {
    let aDate = appointment.executionDate.split('/');
    let curYear = $('#year-select').val();
    let curMonthName = $('#month-select').val();
    let curMonthNumber = monthNameToNumber(curMonthName);
    //dd-mm-yyyy
    let aMonth = parseInt(aDate[1]);
    let aYear = aDate[2];
    if (aYear != curYear || aMonth != curMonthNumber) {
        //No need to update our chart
        return;
    }
    //Instead of finding all the appointments again and rebuilding the
    //chart trigger a change on the '#month-select' dropdown that will do the same for us 
    $('#month-select').trigger('change');
}
/**
 * The date format used throughout the whole project is dd-mm-yyyy
 *  
 */

/**
 * Filter appointments by a given year
 * @param {object[]} appointments A list of appointments
 * @param {string} year
 * @returns {object[]} filteredAppointments The appointemnts that ther execution date matches the year given by the user
 * 
 */
function gatherAppointmentsByYear(appointments, year) {
    let filteredAppointments = appointments.filter(ap => {
        let apYear = ap.executionDate.split('/').pop();
        return parseInt(apYear) == parseInt(year);
    });
    return filteredAppointments;
}

/**
 * Filter appointments by a given month
 * @param {object[]} appointments A list of appointments
 * @param {string} month
 * @returns {object[]} filteredAppointments The appointemnts that ther execution date matches the month given by the user
 * 
 */
function gatherAppointmentsByMonth(appointments, month) {
    let filteredAppointments = appointments.filter(ap => {
        let apMonth = ap.executionDate.split('/')[1];
        return parseInt(apMonth) == parseInt(month);
    });
    return filteredAppointments;
}


function displayYearsAsOptions(years) {
    let yearFragment = document.createDocumentFragment();
    years.map(stringToOption).forEach(option => {
        yearFragment.appendChild(option);
    });
    const yearSelect = document.getElementById('year-select');
    yearSelect.appendChild(yearFragment);
    $(yearSelect).material_select();
    $(yearSelect).trigger('change');
}

function displayMonthsAsOptions(months) {
    let monthSelect = document.getElementById('month-select');
    $(monthSelect).empty();
    $(monthSelect).material_select('destroy');
    let monthFragment = document.createDocumentFragment();
    let options = months.map(stringToOption);
    options.forEach(option => monthFragment.appendChild(option));
    $(monthSelect).append(monthFragment);
    $(monthSelect).material_select();
    $(monthSelect).trigger('change');
}

/**
 * Create a new Chart.js instance and return it
 * @param {DOMElement} canvas A canvas element to be used for chart
 * @returns {Chart} chart
 */
function initChart(canvas) {
    let chart = new Chart(canvas, {
        responsive: true,
        maintainAspectRatio: true,
        type: 'bar',
        data: {
            labels: ['Completed', 'Cancelled', 'Pending'],
            datasets: [{
                label: '# Appointment status',
                data: [10, 10, 10],
                backgroundColor: [
                    'rgba(205, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            legend: {
                labels: {
                    fontSize: 17,
                    fontColor: 'red'
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
    return chart;
}

/**
 * This function adds the event handlers to the DOM Elements that need to do something
 * @param {Chart} chart A chart instance needed for some events
 */
function initEventHandlers(chart) {
    let yearSelect = document.getElementById('year-select');
    let monthSelect = document.getElementById('month-select');
    $(yearSelect).on('change', function () {
        let selectedYear = $(this).val();
        let filteredAppointments = gatherAppointmentsByYear(appointments, selectedYear);
        let months = filteredAppointments.map(a => {
            let month = a.executionDate.split('/')[1];
            return parseInt(month);
        });
        //Convert months to Set to get rid of duplicates and then convert the set to an array
        months = Array.from(new Set(months)).map(monthToStringRepresentation);
        displayMonthsAsOptions(months);
    });
    $(monthSelect).on('change', function (e) {
        let selectedYear = yearSelect.value;
        let selectedMonth = monthNameToNumber(monthSelect.value);
        let appointmentsForYear = gatherAppointmentsByYear(appointments, selectedYear);
        let filteredAppointments = findAppointments(appointments, selectedYear, selectedMonth);
        buildChartFromAppointments(filteredAppointments, chart);
    });
}
$(function () {
    const canvas = document.getElementById('stats');
    const chart = initChart(canvas);
    let appointmentYears = getAppointmentDates(appointments, null, true);
    displayYearsAsOptions(appointmentYears);
    initEventHandlers(chart);
    let yearSelect = document.getElementById('year-select');
    $(yearSelect).trigger('change');
    //appointmentManager needs to be created after all event handlers are added where needed
    const appointmentManager = new AppointmentManager(ipcRenderer, {
        registration: (e, data) => {
            appointments.push(data);
            handleAppointmentChange(data);
            console.log('Added new appointment');
        },
        completion: (e, id) => {
            let affectedAppointment = appointments.find(a => a.id == id);
            let affectedAppointmentIndex = appointments.indexOf(affectedAppointment);
            affectedAppointment.done = true;
            handleAppointmentChange(affectedAppointment);
            console.log('Change of state.Complete');
        },
        cancellation: (e, id) => {
            let affectedAppointment = appointments.find(a => a.id == id);
            let affectedAppointmentIndex = appointments.indexOf(affectedAppointment);
            affectedAppointment.cancelled = true;
            handleAppointmentChange(affectedAppointment);
            console.log('Change of state.cancel');
        },
        deletion: (e, id) => {
            //Keep a backup of the appointment that we will delete so we can use it
            //in handleAppointmentChange()
            let affectedAppointment = appointments.find(a => a.id == id);
            let affectedAppointmentIndex = appointments.indexOf(affectedAppointment);
            delete appointments[affectedAppointmentIndex];
            handleAppointmentChange(affectedAppointment);
            console.log('Deleting');
        }
    });
});