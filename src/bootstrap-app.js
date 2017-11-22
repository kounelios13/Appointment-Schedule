const { app, BrowserWindow, ipcMain } = require('electron');

const path = require('path');

const url = require('url');

let mainWindow = null;
let appointmentsWindow = null;
let newAppointmentWindow = null;

app.on('ready', () => {
    const parent = mainWindow = new BrowserWindow({
        width: 800,
        heigth: 600,
        title: 'Appointment Schedule'
    });

    appointmentsWindow = new BrowserWindow({
        width: 1080,
        height: 720,
        show: false,
        parent,
        title: 'View Appointments'
    });
    newAppointmentWindow = new BrowserWindow({
        width: 1080,
        height: 720,
        show: false,
        parent,
        title: 'Create new Appointment'
    })
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '/public/views/index.jade'),
        protocol: 'file:',
        slashes: true
    }));
    appointmentsWindow.loadURL(url.format({
        pathname: path.join(__dirname, '/public/views/appointments.jade'),
        protocol: 'file:',
        slashes: true
    }));
    appointmentsWindow.on('close', function (e, data) {
        e.preventDefault();
        appointmentsWindow.minimize();
    });
    newAppointmentWindow.loadURL(url.format({
        pathname: path.join(__dirname, "/public/views/appointment-registration.jade"),
        protocol: 'file:',
        slashes: true
    }));
    newAppointmentWindow.on('close', function (e, data) {
        e.preventDefault();
        
        newAppointmentWindow.minimize();
    });
    mainWindow.on('close',function(){
        app.quit();
    });
});
app.on('window-all-closed', function () {
    app.quit();
});

ipcMain.on('view-user-appointments', function (event, data) {
    appointmentsWindow.show();
});
ipcMain.on('show-appointment-registration-page', function (event, data) {
    newAppointmentWindow.show();
});
ipcMain.on('registered-new-appointment',function(event,data){
    appointmentsWindow.webContents.send('registered-new-appointment',data);
});
ipcMain.on('appointment-cancelled', function (event, id) {
    //@TODO
    //Send the message to every renderer that needs it
});

ipcMain.on('appointment-completed', function (event, id) {
    //@TODO
});
ipcMain.on('appointment-deleted',function(event,id){
    //@TODO
});
