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
let historyWindow = null;
app.on('ready', () => {
    const [width, height] = [1280, 800];
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
        skipTaskbar: true,
        title: 'View Appointments'
    });
    newAppointmentWindow = new BrowserWindow({
        parent,
        width,
        height,
        show: false,
        skipTaskbar: true,
        title: 'Create new Appointment'
    });
    historyWindow = new BrowserWindow({
        parent,
        width,
        height,
        show: false,
        skipTaskbar: true,
        title: 'Appointment History'
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
    historyWindow.loadURL(url.format({
        pathname: path.join(__dirname, "/public/views/history.jade"),
        protocol: 'file:',
        slashes: true
    }));

    historyWindow.on('close', (e, data) => {
        e.preventDefault();
        historyWindow.minimize();
    });
    mainWindow.on('close', () => {
        app.quit();
    });
}).on('window-all-closed', () => {
    app.quit();
});

//If localStorage needs to be altered it will be done by the mainWindow only
//Other renderers will just receive a message with the type of alteration and some extra data
//that will need (e.g. If a new appointment is added all renderers will receive that appointment object)
ipcMain.on('view-user-appointments', (event, data) => {
    appointmentsWindow.show();
}).on('show-appointment-registration-page', (event, data) => {
    newAppointmentWindow.show();
}).on('view-appointment-history', (event, data) => {
    historyWindow.show();
}).on('registered-new-appointment', (event, data) => {
    appointmentsWindow.webContents.send('registered-new-appointment', data);
    historyWindow.webContents.send('registered-new-appointment', data);
    mainWindow.webContents.send('registered-new-appointment', data);
}).on('appointment-cancelled', (event, id) => {
    historyWindow.webContents.send('appointment-cancelled', id);
    mainWindow.webContents.send('appointment-cancelled', id);
}).on('appointment-completed', (event, id) => {
    historyWindow.webContents.send('appointment-completed', id);
    mainWindow.webContents.send('appointment-completed', id);
}).on('appointment-deleted', (event, id) => {
    historyWindow.webContents.send('appointment-deleted', id);
    mainWindow.webContents.send('appointment-deleted', id);
});