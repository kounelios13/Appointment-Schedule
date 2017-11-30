const {
    ipcRenderer
} = require('electron');
const Chart = require('chart.js');
const lockr = require('lockr');
const appointments = lockr.get('appointments') || [];
/** 
 * Generate a chart from given data
 * @param {Object[]} data
 */
function buildChartFromData(data) {
    
}

$(function () {
    const canvas = document.querySelector('canvas');
    const canvasContext = canvas.getContext('2d');
    let chart = new Chart(canvasContext, {
        type:'bar',  
        data: {
            labels: ["January", "February", "March", "April", "May", "June", "July"],
            datasets: [{
                label: "My First dataset",
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: [0, 10, 5, 2, 20, 30, 45],
            }]
        }
    });
});