const {ipcRenderer} = require('electron');

window.addEventListener('DOMContentLoaded',()=>{
    const createAppointment = document.getElementById('create-appointment');
    const viewAppointments = document.getElementById('view-appointments');
    viewAppointments.addEventListener("click",()=>{
        ipcRenderer.send('view-user-appointments');
    });
    createAppointment.addEventListener('click',()=>{
        ipcRenderer.send('show-appointment-registration-page');
    });
});