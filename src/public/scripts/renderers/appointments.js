const {
    ipcRenderer
} = require('electron');
const chart = require('chart.js');
const cardUtils = require('../scripts/custom_modules/card-utilities.js');
const appointmentUtils = require('../scripts/custom_modules/appointment-utilities.js');
const interact = require('interact.js');
const lockr = require('lockr');

//For the time being cardThemeOptions should have 2 properties
//1:gradientName -> The gradient class name to use
//2:colorizeActions -> If true the `.card-action` div of the card should have the specified gradient color too
let cardThemeOptions = lockr.get('card-theme-options');

let appointments = lockr.get('appointments') || [];

/**
 * Check to see if there are any appointments for the date that is currently 
 * selected in the dropdown.If not remove it from the dropdowm
 */
function checkTotalAvailableDates() {
    const selectedDate = $("#appointment-select").val();
    const totalActiveAppointmentsForDate = appointments.filter((ap) => {
        return !ap.done && !ap.cancelled &&
            ap.executionDate == selectedDate;
    });
    if (totalActiveAppointmentsForDate.length == 0) {
        removeDateFromSelect(selectedDate);
    }
}

/**
 * Deletes an appointment
 * @param {string} id The id of the appointment 
 */
function deleteAppointmentById(id) {
    $("#" + id).hide('slow', function () {
        const appointmentIndex = appointments.findIndex(ap => ap.id == id);
        delete appointments[appointmentIndex];
        appointments = appointments.filter(ap => !!ap);
        $(this).remove();
        checkTotalAvailableDates();
    });
}

/**
 * Creates a card-panel which shows info about an appointment
 * @param {object} appointment 
 * @property {Date} appointment.executionDate The date that the appointment will get executed
 * @property {string} appointment.floor
 */
function createAppointmentCard(appointment, outputContainer) {
    cardUtils.createCard(appointment, outputContainer);
}

/**
 * Clear all childNodes of a given node
 * @param {Node} node The parent node
 */
function clearNodeChildren(node) {
    node.innerHTML = '';

    if (node.hasChildNodes()) {
        throw new Error('Holly fuck.If innerHTML didn`t work I don`t know what else to do');
    }
}

/**
 * Render each appointment of a list as a material card
 * @param {object[]} appointments An array of appointments
 * @param {string} outputTargetId The id of the output dom element that will host our cards
 */
function renderAppointmentListAsCards(appointments, outputTargetId) {
    //First we need to clear the outputTarget 
    const outputTarget = document.getElementById(outputTargetId);
    clearNodeChildren(outputTarget);
    appointments.forEach(ap => {
        createAppointmentCard(ap, outputTargetId);
        if (cardThemeOptions) {
            let {
                gradientName,
                colorizeActions
            } = cardThemeOptions;
            cardUtils.colorizeCard(ap.id, gradientName, colorizeActions, ["blue-grey", "darken-1"]);
        }
    });
}
/**
 * Renders all the appointments available on the user screen in a dropdown select box
 * @param {object[]} appointments A list which contains the appointments for a user
 * @param {Function} [filterFunc] A filter function for the appointments
 */
function renderAppointmentList(appointments, filterFunc) {
    const select = document.getElementById('appointment-select');
    if (select.childElementCount > 0) {
        //We need to clear the options
        select.innerHTML = '';
    }

    if (filterFunc && typeof filterFunc == 'function') {
        appointments = appointments.filter(filterFunc);
    }
    appointments = appointmentUtils.sortAppointments(appointments);
    const appointmentDates = appointmentUtils.getAppointmentDates(appointments, (curDate) => {
        const date = new Date();
        let userDate = new Date(`${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`);
        curDate = new Date(curDate.split('/').reverse().join());
        //Make sure that no past dates are shown
        return curDate.getTime() >= userDate.getTime();
        //Also don't return curDate.getTime() >= date.getTime()
        //It will not show the correct dates
    });
    appointmentDates.forEach(ap => {
        const curOption = document.createElement('option');
        curOption.textContent = ap;
        select.appendChild(curOption);
    });
    $(select).trigger('change');
}

/**
 * Remove a specific date from the appointment select box
 * @param {string} date The date to remove
 */
function removeDateFromSelect(date) {
    const selectedDate = date;
    const options = [...$('#appointment-select option')];
    options.forEach(option => {
        if ($(option).text() == selectedDate) {
            $(option).remove();
            $('select').material_select();
            $('#appointment-select').trigger('change');
        }
    });
}

$(function () {
    //We want to show the appointments that have not been completed and have not been cancelled
    renderAppointmentList(appointments, (ap) => {
        return (!ap.done && !ap.cancelled);
    });
    if ($('.appointment-card').length == 0) {
        $('#no-more-appointments').show();
    }
    //By default select boxes are hidden till they rendered using material design
    $('select').material_select();
    //Init modals
    $(".modal").modal();
    $("#appointment-card-container").on("click", ".cancel-btn", function () {
        let cardContainer = $(this).closest('.appointment-card');
        let curId = cardContainer.attr('id');
        $('#cancel-appointment-modal').modal('open');
        $('#cancel-appointment-modal').data('appointment-id', curId);

    }).on("click", ".complete-btn", function () {
        let cardContainer = $(this).closest('.appointment-card');
        let curId = cardContainer.attr('id');
        appointments.find(ap => ap.id == curId).done = true;
        $(`#${curId}`).hide("slow", function () {
            $(cardContainer).remove();
            //Now that we completed an appointment we need to inform all other renderers that might use our appointments
            ipcRenderer.send('appointment-completed', curId);
            const selectedDate = $("#appointment-select").val();
            const totalActiveAppointmentsForDate = appointments.filter((ap) => {
                return !ap.done && !ap.cancelled &&
                    ap.executionDate == selectedDate;
            });
            if (totalActiveAppointmentsForDate == 0) {
                removeDateFromSelect(selectedDate);
            }

        });
    });
    $('#display').on('change', '#appointment-select', function () {
        let totalDates = $('#appointment-select option').length;
        if (totalDates == 0) {
            const log = console && console.warn ? console.warn : console.log;
            $("#no-appointments-left").show('slow');
            log('There are no appointments at this moment.Come back when you have added a new appointment');
            $("#no-more-appointments").show('slow');
            $('#appointment-select').hide('slow');
            $('#appointment-select').material_select('destroy');

        } else {
            if (!$('#appointment-select').is(':visible')) {
                $('#appointment-select').material_select();
                $("#no-appointments-left").hide('slow');
                //@TODO
                //Maybe trigger a change event 
                //Why the fuck should i fire a change event???
            }
        }
        const selectedDate = $(this).val();
        let filteredAppointments = appointments.filter((ap) => {
            let appointmentShouldAppear =
                ap.executionDate == selectedDate &&
                !ap.done &&
                !ap.cancelled;
            return appointmentShouldAppear;
        });
        renderAppointmentListAsCards(filteredAppointments, 'appointment-card-container');
    });
    //Don't trigger change event before adding the on('change') event handler but only after that
    $('#appointment-select').trigger('change');
    $(".confirm-ok").on("click", function () {
        const appointmentId = $("#cancel-appointment-modal").data("appointment-id");
        const appointmentToCancel = appointments.filter(ap => ap.id == appointmentId).pop();
        //Mark appointment as cancelled
        appointmentToCancel.cancelled = true;
        //After hiding it remove it
        //Find the id of the appointment to cancel
        $(`#${appointmentId}`).hide("slow", function () {
            $(`#${appointmentId}`).remove();
            //After cancelling an appointment inform all other renderers that might need to use the appointment array
            ipcRenderer.send('appointment-cancelled', appointmentId);
            checkTotalAvailableDates();
        });
    });
    interact('.appointment-card .card').draggable({
        onmove: (event) => {
            if (event.target.getAttribute('keep-transform')) {
                //If we keep dragging the card it means we didn't delete it so we wont keep transform
                //for some reason if I use setAttribute instead of removeAttribute
                //the card won't reset its transform
                event.target.removeAttribute('keep-transform');
            }
            const target = event.target,
                // keep the dragged position in the data-x/data-y attributes
                x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            // translate the element
            target.style.transform =
                'translate(' + x + 'px, ' + y + 'px)';

            // update the posiion attributes
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
        },
        onend: (event) => {
            const {
                target
            } = event;
            //if keepTransform is true it means that the dragged card is over the bin icon
            //and we need to wait for user confirmation so we keep the current transform
            const keepTransform = target.getAttribute('keep-transform');
            if (!keepTransform) {
                target.style.webkitTransform = target.style.transform = 'translate(0px,0px)';
            }

        }
    });
    interact('#bin').dropzone({
        accept: '.appointment-card .card',
        ondrop: function (event) {
            
            const dropped = event.relatedTarget;
            const preDropTransform = dropped.style.transform;
            const droppedId = dropped.parentNode.id;
            dropped.style.transform = preDropTransform;
            dropped.setAttribute('keep-transform', true);
            mbox.confirm('Are you sure you want to delete that appointment?', function (answer) {
                if (answer) {
                    deleteAppointmentById(droppedId);
                    ipcRenderer.send('appointment-deleted', droppedId);
                } else {
                    dropped.style.transform = 'translate(0,0)';
                    dropped.setAttribute('data-x', 0);
                    dropped.setAttribute('data-y', 0);
                    dropped.removeAttribute('keep-transform');
                }
            });
        }
    });
});

ipcRenderer.on('registered-new-appointment', (event, data) => {
    const appointmentReceived = data;
    appointments.push(appointmentReceived);
    appointments = appointmentUtils.sortAppointments(appointments, null, true);
    //Destroy the material select dropdown first
    $('select').material_select('destroy');
    renderAppointmentList(appointments, (ap) => {
        return (!ap.done && !ap.cancelled);
    });
});