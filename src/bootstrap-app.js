const {
    app,
    BrowserWindow,
    ipcMain
} = require('electron');

const path = require('path');

const url = require('url');

let mainWindow = null;
let appointmentsWindow = null;
let newAppointmentWindow = null;

app.on('ready', () => {
    const [width,height] = [1280,800];
    const parent = mainWindow = new BrowserWindow({
        width,
        height,
        title: 'Appointment Schedule'
    });
    appointmentsWindow = new BrowserWindow({
        parent,
        width,
        height,
        show: false,
        skipTaskbar:true,
        title: 'View Appointments'
    });
    newAppointmentWindow = new BrowserWindow({
        parent,
        width,
        height,
        show: false,
        skipTaskbar:true,
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
    appointmentsWindow.on('close', (e, data) => {
        e.preventDefault();
        appointmentsWindow.minimize();
    });
    newAppointmentWindow.loadURL(url.format({
        pathname: path.join(__dirname, "/public/views/appointment-registration.jade"),
        protocol: 'file:',
        slashes: true
    }));
    newAppointmentWindow.on('close', (e, data) => {
        e.preventDefault();
        newAppointmentWindow.minimize();
    });
    mainWindow.on('close', () => {
        app.quit();
    });
}).on('window-all-closed', () => {
    app.quit();
});

ipcMain.on('view-user-appointments', (event, data) => {
    appointmentsWindow.show();
}).on('show-appointment-registration-page', (event, data) => {
    newAppointmentWindow.show();
}).on('registered-new-appointment', (event, data) => {
    appointmentsWindow.webContents.send('registered-new-appointment', data);
}).on('appointment-cancelled', (event, id) => {
    //@TODO
    //Send the message to every renderer that needs it
}).on('appointment-completed', (event, id) => {
    //@TODO
}).on('appointment-deleted', (event, id) => {
    //@TODO
});