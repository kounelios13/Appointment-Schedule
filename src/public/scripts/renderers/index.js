const {ipcRenderer} = require('electron');
window.addEventListener('DOMContentLoaded',function(){
    const createAppointment = document.getElementById('create-appointment');
    const viewAppointments = document.getElementById('view-appointments');
    viewAppointments.addEventListener("click",function(){
        ipcRenderer.send('view-user-appointments');
    });
    createAppointment.addEventListener('click',function(){
        ipcRenderer.send('show-appointment-registration-page');
    });
});