const {ipcRenderer} = require('electron');
const lockr = require('lockr');
let appointments = lockr.get('appointments');
window.addEventListener('DOMContentLoaded',()=>{
    const createAppointment = document.getElementById('create-appointment');
    const viewAppointments = document.getElementById('view-appointments');
    const viewStatistics = document.getElementById('view-appointment-statistics');
    viewAppointments.addEventListener("click",()=>{
        ipcRenderer.send('view-user-appointments');
    });
    createAppointment.addEventListener('click',()=>{
        ipcRenderer.send('show-appointment-registration-page');
    });
    viewStatistics.addEventListener('click', () => {
        ipcRenderer.send('view-appointment-statistics'); 
    });
});

ipcRenderer.on('registered-new-appointment', (_, appointment) => {
    appointments.push(appointment);
    lockr.set('appointments', appointments);
});

ipcRenderer.on('appointment-cancelled', (_, id) => {
    let appointmentToCancel = appointments.find(e => e.id == id);
    appointmentToCancel.cancelled = true;
    lockr.set('appointments', appointments);
});

ipcRenderer.on('appointment-completed', (_, id) => {
    let appointmentToComplete = appointments.find(e => e.id == id);
    appointmentToComplete.done = true;
    lockr.set('appointments', appointments);
});

ipcRenderer.on('appointment-deleted', (_, id) => {
    let appointmentIndex = appointments.findIndex(e => e.id == id);
    appointments[appointmentIndex] = null;
    appointments = appointments.filter(e => e != null);
    lockr.set('appointments', appointments);
});
