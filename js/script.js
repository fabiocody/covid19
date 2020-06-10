"use strict";


let daysToShow = NaN;
let region = 'Italy';


function btnItalyClicked() {
    $('#btn-italy').addClass('active');
    $('#btn-lombardy').removeClass('active').addClass('disabled');
    $('#title').text('COVID-19 | Italy');
    region = 'Italy';
    fetchData();
}


function btnLombardyClicked() {
    $('#btn-italy').removeClass('active');
    $('#btn-lombardy').addClass('active');
    $('#title').text('COVID-19 | Lombardy');
    region = 'Lombardy';
    fetchData();
}


function allDataClicked() {
    $('#btn-all-data').addClass('active');
    $('#btn-30-days').removeClass('active');
    $('#btn-7-days').removeClass('active');
    daysToShow = NaN;
    fetchData();
}


function last30DaysClicked() {
    $('#btn-all-data').removeClass('active');
    $('#btn-30-days').addClass('active');
    $('#btn-7-days').removeClass('active');
    daysToShow = 30;
    fetchData();
}


function last7DaysClicked() {
    $('#btn-all-data').removeClass('active');
    $('#btn-30-days').removeClass('active');
    $('#btn-7-days').addClass('active');
    daysToShow = 7;
    fetchData();
}


function ediff1d(v) {
    let d = [];
    for (let i = 0; i < v.length; i++) {
        if (i === 0) {
            d.push(0);
        } else {
            d.push(v[i] - v[i-1]);
        }
    }
    return d;
}


function arrayDiv(v, d) {
    console.assert(v.length === d.length);
    let r = [];
    for (let i = 0; i < v.length; i++) {
        r.push(v[i] / d[i]);
    }
    return r;
}


function fetchData() {
    let URL;
    if (region === 'Italy') {
        URL = 'https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-andamento-nazionale/dpc-covid19-ita-andamento-nazionale.csv';
        Papa.parse(URL, {
            download: true,
            complete: processDataItaly
        });
    } else if (region === 'Lombardy') {
        URL = 'https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-regioni/dpc-covid19-ita-regioni.csv';
        Papa.parse(URL, {
            download: true,
            complete: processDataLombardy
        });
    }
}


function processDataItaly(results) {
    let indexes = [0, 6, 7, 8, 9, 10, 11, 13];
    processData(results, indexes);
}


function processDataLombardy(results) {
    let indexes = [0, 10, 11, 12, 13, 14, 15, 17];
    processData(results, indexes);
}


function processData(results, indexes) {
    //console.log(results.data[0]);
    results.data.shift();
    results.data = results.data.filter(row => row.length > 1);
    let date = [];
    let activeCases = [];
    let deltaActiveCases = [];
    let deltaTotalCases = [];
    let recovered = [];
    let deaths = [];
    let totalCases = [];
    let testedCases = [];
    if (!isNaN(daysToShow)) {
        results.data = results.data.slice(Math.max(results.data.length - daysToShow, 0));
    }
    for (let row of results.data) {
        date.push(row[indexes[0]]);
        activeCases.push(row[indexes[1]]);
        deltaActiveCases.push(row[indexes[2]]);
        deltaTotalCases.push(row[indexes[3]]);
        recovered.push(row[indexes[4]]);
        deaths.push(row[indexes[5]]);
        totalCases.push(row[indexes[6]]);
        testedCases.push(row[indexes[7]]);
    }
    let deltaRecovered = ediff1d(recovered);
    let deltaDeaths = ediff1d(deaths);
    let deltaTested = ediff1d(testedCases);
    let data = [
        date,               // 0
        activeCases,        // 1
        deltaActiveCases,   // 2
        deltaTotalCases,    // 3
        recovered,          // 4
        deaths,             // 5
        totalCases,         // 6
        testedCases,        // 7
        deltaRecovered,     // 8
        deltaDeaths,        // 9
        deltaTested,        // 10
    ]
    ediff1d(totalCases);
    updateData(data);
    createDataGraph(data);
    createDeltaGraph(data);
}


function getDelta(data) {
    if (data[1] >= data[0]) {
        return `+ ${data[1] - data[0]}`;
    } else {
        return `- ${Math.abs(data[1] - data[0])}`;
    }
}


function updateData(data) {
    let totalCases = data[6].slice(-2);
    $('#total-cases-p').text(`${totalCases[1]}`);
    $('#total-cases-delta-p').text(getDelta(totalCases));
    let activeCases = data[1].slice(-2);
    $('#active-cases-p').text(`${activeCases[1]}`);
    $('#active-cases-delta-p').text(getDelta(activeCases));
    let recovered = data[4].slice(-2);
    $('#recovered-p').text(`${recovered[1]}`);
    $('#recovered-delta-p').text(getDelta(recovered));
    let deaths = data[5].slice(-2);
    $('#deaths-p').text(`${deaths[1]}`);
    $('#deaths-delta-p').text(getDelta(deaths));
}


function createDataGraph(data) {
    let ctx = document.getElementById('data-chart');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data[0],
            datasets: [
                {
                    label: 'Total cases',
                    data: data[6],
                    lineTension: 0.3,
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    borderColor: 'blue'
                },
                {
                    label: 'Active cases',
                    data: data[1],
                    lineTension: 0.3,
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    borderColor: 'cyan'
                },
                {
                    label: 'Recovered',
                    data: data[4],
                    lineTension: 0.3,
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    borderColor: 'green'
                },
                {
                    label: 'Deaths',
                    data: data[5],
                    lineTension: 0.3,
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    borderColor: 'red'
                }
            ]
        },
        options: {
            title: {
                display: true,
                fontSize: 18,
                text: 'Data'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: false
                    }
                }]
            },
        }
    });
}


function createDeltaGraph(data) {
    let ctx = document.getElementById('delta-chart');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data[0],
            datasets: [
                {
                    label: '∆ Total cases',
                    data: data[3],
                    lineTension: 0.3,
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    borderColor: 'blue'
                },
                {
                    label: '∆ Active cases',
                    data: data[2],
                    lineTension: 0.3,
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    borderColor: 'cyan'
                },
                {
                    label: '∆ Recovered',
                    data: data[8],
                    lineTension: 0.3,
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    borderColor: 'green'
                },
                {
                    label: '∆ Deaths',
                    data: data[9],
                    lineTension: 0.3,
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    borderColor: 'red'
                }
            ]
        },
        options: {
            title: {
                display: true,
                fontSize: 18,
                text: 'Delta'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: false
                    }
                }]
            },
        }
    });
}


$(document).ready(fetchData);
window.onresize = fetchData;
