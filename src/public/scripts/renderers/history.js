const {
    ipcRenderer
} = require('electron');
const Chart = require('chart.js');
const lockr = require('lockr');
const appointments = lockr.get('appointments') || [];

let chart = null;
const {
    getAppointmentDates
} = require('../scripts/custom_modules/appointment-utilities');

const {
    monthToStringRepresentation,
    monthNameToNumber
} = require('../scripts/custom_modules/date-utilities');


ipcRenderer.on('appointemnt-cancelled', (event, id) => {
    let affectedAppointment = apppointments.find(e => e.id == id);
    affectedAppointment.cancelled = true;
    //@TODO
    //Check if the execution date of the appointment is the same as the one that the user has choosen for the chart.If yes redraw the chart with new data
});

ipcRenderer.on('appointemnt-completed', (event, data) => {
    let affectedAppointment = apppointments.find(e => e.id == id);
    affectedAppointment.done = true;
    //@TODO
    //Check if the execution date of the appointment is the same as the one that the user has choosen for the chart.If yes redraw the chart with new data
});

/**
 * The date format used throughout the whole project is dd-mm-yyyy
 *  
 */


/**
 * Filter appointments by a given year
 * @param {object[]} appointments A list of appointments
 * @param {string} year
 * @returns {object[]} filteredAppointemnts The appointemnts that ther execution date matches the year given by the user
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
 * @returns {object[]} filteredAppointemnts The appointemnts that ther execution date matches the month given by the user
 * 
 */
function gatherAppointmentsByMonth(appointments, month) {
    let filteredAppointemnts = appointments.filter(ap => {
        let apMonth = ap.executionDate.split('/')[1];
        return parseInt(apMonth) == parseInt(month);
    });
    return filteredAppointemnts;
}


function buildChartFromAppointments(appointments, chart) {
    let completed = appointments.filter(e => e.done).length;
    let cancelled = appointments.filter(e => e.cancelled).length;
    let pending = appointments.filter(e => (!e.done && !e.cancelled)).length;
    chart.data.datasets[0].data = [completed, cancelled, pending];
    chart.update();
}
$(function () {
    const canvas = document.getElementById('stats');
    chart = new Chart(canvas, {
        responsive: true,
        maintainAspectRatio: true,
        type: 'bar',
        data: {
            labels: ['Completed', 'Cancelled', 'Pending'],
            datasets: [{
                label: '# Appointment status',
                data: [10, 10, 10],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
    let appointemntYears = getAppointmentDates(appointments, null, true);
    let yearFragment = document.createDocumentFragment();
    appointemntYears.forEach(year => {
        let option = document.createElement('option');
        option.innerText = year;
        yearFragment.appendChild(option);
    });
    let yearSelect = document.getElementById('year-select');
    yearSelect.appendChild(yearFragment);
    $(yearSelect).material_select();
    $('#year-select').on('change', function () {
        const fragment = document.createDocumentFragment();
        let monthSelect = document.getElementById('month-select');
        //Clear innerHTML begore material_select('destroy')
        monthSelect.innerHTML = '';
        let monthFragment = document.createDocumentFragment();
        $("#month-select").material_select('destroy');
        let selectedYear = $(this).val();
        let filteredAppointments = gatherAppointmentsByYear(appointments, selectedYear);
        let months = filteredAppointments.map(a => {
            let month = a.executionDate.split('/')[1];
            return parseInt(month);
        });
        months = Array.from(new Set(months)).map(monthToStringRepresentation);

        months.forEach(month => {
            let option = document.createElement('option');
            option.innerText = month;
            monthFragment.appendChild(option);
        });
        monthSelect.appendChild(monthFragment);
        
        $("#month-select").material_select();
        $('#month-select').trigger('change');
    });
    $('#month-select').on('change', function () {
        let selectedMonth = monthNameToNumber($(this).val());
        let selectedYear = yearSelect.value;
        let appointmentsForYear = gatherAppointmentsByYear(appointments, selectedYear);
        let filteredAppointments = gatherAppointmentsByMonth(appointmentsForYear, selectedMonth);
        console.table(filteredAppointments)
        buildChartFromAppointments(filteredAppointments, chart);
    });
    $('#year-select').trigger('change'); 
});