const {
    ipcRenderer
} = require('electron');
const Chart = require('chart.js');
const lockr = require('lockr');
const appointments = lockr.get('appointments') || [];


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


function buildChartFromAppointments(appointments,chart) {

    /**
    * @TODO
    * Instead of creating a new Chart every time create one at the init of the window
    * and just change its data every time you have to.
    */


    let completed = appointments.filter(e => e.done).length;
    let cancelled = appointments.filter(e => e.cancelled).length;
    let pending = appointments.filter(e => (!e.done && !e.cancelled)).length;
    chart.data.datasets[0].data = [completed, cancelled, pending];
    chart.update(0);
}
$(function () {
    const canvas = document.getElementById('stats');
    const canvasContext = canvas.getContext('2d');
    let  chart = new Chart(canvasContext, {
        responsive: true,
        maintainAspectRatio: true,
        type: 'bar',
        data: {
            labels: ['Completed', 'Cancelled', 'Pending'],
            datasets: [{
                label: '# Appointment status',
                data: [10,10,10],
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

    let yearSelect = document.getElementById('year-select');
    let fragment = document.createDocumentFragment();
    appointemntYears.forEach(year => {

        let option = document.createElement('option');
        option.innerText = year;
        fragment.appendChild(option);
    });
    yearSelect.appendChild(fragment);

    $(yearSelect).material_select();

    $('body').on('change', '#month-select', function () {
        console.log('Tiggering month')
        let month = monthNameToNumber($('#month-select').val());
        let year = parseInt(yearSelect.value);
        let dataToShow = gatherAppointmentsByYear(appointments, year);
        dataToShow = gatherAppointmentsByMonth(dataToShow, month);
        //@TODO
        //Build a chart from the data above
       // console.table(dataToShow)
        if (dataToShow) {
            buildChartFromAppointments(dataToShow, chart);
            console.log('Data to find',dataToShow)
        }
            
        else
            console.log('Found month with no active appointmnets',month)    
    })
    $(yearSelect).on('change', function () {
        console.log('Changing year');
        let selectedYear = yearSelect.value;
        let appointmentsForYear = gatherAppointmentsByYear(appointments, selectedYear);
        let months = appointmentsForYear.map(ap => {
            let month = ap.executionDate.split('/')[1];
            return parseInt(month);
        }).map(monthToStringRepresentation);
        let fragment = document.createDocumentFragment();
        let monthSelect = document.getElementById('month-select');
        
        monthSelect.innerHTML = '';
        $(monthSelect).material_select('destroy');
        //Get all the unique values of 'months' array

        months = Array.from(new Set(months));
        months.forEach(month => {
            let option = document.createElement('option');
            option.innerText = month;
            fragment.appendChild(option);
        });

        monthSelect.appendChild(fragment);
        let monthSelectRow = document.getElementById('month-select-row');
        $(monthSelect).material_select();
        $(monthSelectRow).show();
        //$(monthSelect).trigger('change');

    });
    //$(yearSelect).trigger('change');
});