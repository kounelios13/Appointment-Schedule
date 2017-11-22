const lockr = require('lockr');
const { Appointment } = require('../scripts/classes/appointment.js');
const { ipcRenderer } = require('electron');
const appointments = lockr.get('appointments') || [];

function activateGreekLocale() {
    jQuery.extend(jQuery.fn.pickadate.defaults, {
        monthsFull: ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'],
        monthsShort: ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαι', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'],
        weekdaysFull: ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'],
        weekdaysShort: ['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ'],
        today: 'σήμερα',
        clear: 'Διαγραφή',
        firstDay: 1,
        format: 'd mmmm yyyy',
        formatSubmit: 'yyyy/mm/dd'
    });

    jQuery.extend(jQuery.fn.pickatime.defaults, {
        clear: 'Διαγραφή'
    });
}
$(function () {
    $(".modal").modal();
    if (navigator.language == 'el-GR') {
        activateGreekLocale();
    }
    $('.datepicker').pickadate({
        format: 'dd/mm/yyyy',
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15, // Creates a dropdown of 15 years to control year,
        today: 'Today',
        clear: 'Clear',
        close: 'Ok',
        closeOnSelect: false // Close upon selecting a date,
    });
    $("#appointment-registration-form").on("submit", function (e) {
        e.preventDefault();
        let roomInput = $("#appointment-room");
        let dateInput = $("#registration-date");
        let extraInfoInput = $("#extra-info");
        let room = roomInput.val();
        let executionDate = dateInput.val();
        let extraInfo = extraInfoInput.val();
        if(room.length > Number(roomInput.data("length")) || extraInfo.length > Number(extraInfoInput.data("length"))){
            alert(`You have exceeded maximum charcters for either the appointment room or for the extra info input`);
            return;
        }
        const newAppointment = new Appointment(
            executionDate,
            room,
            extraInfo
        );
        appointments.push(newAppointment);
        lockr.set('appointments', appointments);
        ipcRenderer.send('registered-new-appointment', newAppointment);
        let form = document.querySelector('#appointment-registration-form');
        $(".modal").modal('open');
        form.reset();
        setTimeout(()=>{
            //Close success modal after 4 seconds
            $(".modal").modal('close');
        },4000);
    });
});