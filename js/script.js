"use strict";


let daysToShow = NaN;
let region = 'Italy';
let data = null;
let dataGraph = null;
let deltaGraph = null;
let hospitalizedGraph = null;
let deltaHospitalizedGraph = null;
let testsGraph = null;

const metricsNumber = 8;
const dateIdx = 0;
const totalCasesIdx = 1;
const activeCasesIdx = 2;
const recoveredIdx = 3;
const deathsIdx = 4;
const hospitalizedIdx = 5;
const symptomaticHospitalizedIdx = 6;
const icHospitalizedIdx = 7;
const testsIdx = 8;
const deltaTotalCasesIdx = 9;
const deltaActiveCasesIdx = 10;
const deltaRecoveredIdx = 11;
const deltaDeathsIdx = 12;
const deltaHospitalizedIdx = 13;
const deltaSymptomaticHospitalizedIdx = 14;
const deltaIcHospitalizedIdx = 15;
const deltaTestsIdx = 16;


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
    $('#btn-90-days').removeClass('active');
    $('#btn-30-days').removeClass('active');
    $('#btn-7-days').removeClass('active');
    daysToShow = NaN;
    updatePage();
}


function last90DaysClicked() {
    $('#btn-all-data').removeClass('active');
    $('#btn-90-days').addClass('active');
    $('#btn-30-days').removeClass('active');
    $('#btn-7-days').removeClass('active');
    daysToShow = 90;
    updatePage();
}


function last30DaysClicked() {
    $('#btn-all-data').removeClass('active');
    $('#btn-90-days').removeClass('active');
    $('#btn-30-days').addClass('active');
    $('#btn-7-days').removeClass('active');
    daysToShow = 30;
    updatePage();
}


function last7DaysClicked() {
    $('#btn-all-data').removeClass('active');
    $('#btn-90-days').removeClass('active');
    $('#btn-30-days').removeClass('active');
    $('#btn-7-days').addClass('active');
    daysToShow = 7;
    updatePage();
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
    let indexes = [0, 2, 3, 4, 6, 7, 8, 9, 10, 13, 14];
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
    let symptomaticHospitalzed = [];
    let icHospitalized = [];
    let hospitalized = [];
    let activeCases = [];
    let deltaActiveCases = [];
    let deltaTotalCases = [];
    let recovered = [];
    let deaths = [];
    let totalCases = [];
    let tests = [];
    for (let row of results.data) {
        date.push(row[indexes[0]]);
        symptomaticHospitalzed.push(row[indexes[1]]);
        icHospitalized.push(row[indexes[2]]);
        hospitalized.push(row[indexes[3]]);
        activeCases.push(row[indexes[4]]);
        deltaActiveCases.push(row[indexes[5]]);
        deltaTotalCases.push(row[indexes[6]]);
        recovered.push(row[indexes[7]]);
        deaths.push(row[indexes[8]]);
        totalCases.push(row[indexes[9]]);
        tests.push(row[indexes[10]]);
    }
    let deltaRecovered = ediff1d(recovered);
    let deltaDeaths = ediff1d(deaths);
    let deltaTests = ediff1d(tests);
    let deltaHospitalized = ediff1d(hospitalized);
    let deltaSymptomaticHospitalized = ediff1d(symptomaticHospitalzed);
    let deltaIcHospitalized = ediff1d(icHospitalized);
    data = [
        date,                           // 0
        totalCases,                     // 1
        activeCases,                    // 2
        recovered,                      // 3
        deaths,                         // 4
        hospitalized,                   // 5
        symptomaticHospitalzed,         // 6
        icHospitalized,                 // 7
        tests,                          // 8
        deltaTotalCases,                // 9
        deltaActiveCases,               // 10
        deltaRecovered,                 // 11
        deltaDeaths,                    // 12
        deltaHospitalized,              // 13
        deltaSymptomaticHospitalized,   // 14
        deltaIcHospitalized,            // 15
        deltaTests,                     // 16
    ]
    updatePage();
}


function updatePage() {
    updateData();
    createDataGraph();
    createDeltaGraph();
    createHospitalizedGraph();
    createDeltaHospitalizedGraph();
    createTestsGraph();
}


function getDelta(data) {
    if (parseInt(data[1]) >= parseInt(data[0])) {
        return `+ ${data[1] - data[0]}`;
    } else {
        return `- ${Math.abs(data[1] - data[0])}`;
    }
}


function updateData() {
    let totalCases = data[totalCasesIdx].slice(-2);
    $('#total-cases-p').text(`${totalCases[1]}`);
    $('#total-cases-delta-p').text(getDelta(totalCases));
    let activeCases = data[activeCasesIdx].slice(-2);
    $('#active-cases-p').text(`${activeCases[1]}`);
    $('#active-cases-delta-p').text(getDelta(activeCases));
    let recovered = data[recoveredIdx].slice(-2);
    $('#recovered-p').text(`${recovered[1]}`);
    $('#recovered-delta-p').text(getDelta(recovered));
    let deaths = data[deathsIdx].slice(-2);
    $('#deaths-p').text(`${deaths[1]}`);
    $('#deaths-delta-p').text(getDelta(deaths));
    let hospitalized = data[hospitalizedIdx].slice(-2);
    $('#hospitalized-p').text(`${hospitalized[1]}`);
    $('#hospitalized-delta-p').text(`${getDelta(hospitalized)}`);
    let symptomaticHospitalized = data[symptomaticHospitalizedIdx].slice(-2);
    $('#symptomatic-hospitalized-p').text(`${symptomaticHospitalized[1]}`);
    $('#symptomatic-hospitalized-delta-p').text(`${getDelta(symptomaticHospitalized)}`);
    let icHospitalized = data[icHospitalizedIdx].slice(-2);
    $('#ic-hospitalized-p').text(`${icHospitalized[1]}`);
    $('#ic-hospitalized-delta-p').text(`${getDelta(icHospitalized)}`);
    let tests = data[testsIdx].slice(-2);
    $('#tests-p').text(`${tests[1]}`);
    $('#tests-delta-p').text(`${getDelta(tests)}`);
}


function createDataGraph() {
    if (dataGraph == null) {
        let ctx = document.getElementById('data-chart');
        dataGraph = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data[dateIdx],
                datasets: [
                    {
                        label: 'Total cases',
                        data: data[totalCasesIdx],
                        lineTension: 0.3,
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        borderColor: 'blue'
                    },
                    {
                        label: 'Active cases',
                        data: data[activeCasesIdx],
                        lineTension: 0.3,
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        borderColor: 'cyan'
                    },
                    {
                        label: 'Recovered',
                        data: data[recoveredIdx],
                        lineTension: 0.3,
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        borderColor: 'green'
                    },
                    {
                        label: 'Deaths',
                        data: data[deathsIdx],
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
    } else {
        let dataToShow = [...data];
        if (!isNaN(daysToShow)) {
            for (let i = 0; i < dataToShow.length; i++)
                dataToShow[i] = data[i].slice(Math.max(data[i].length - daysToShow, 0));
        }
        dataGraph.data.labels = dataToShow[dateIdx];
        for (let i = 0; i < dataGraph.data.datasets.length; i++) {
            dataGraph.data.datasets[i].data = dataToShow[i + 1]
        }
        dataGraph.update();
    }
    return dataGraph;
}


function createDeltaGraph() {
    if (deltaGraph == null) {
        let ctx = document.getElementById('delta-chart');
        deltaGraph = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data[dateIdx],
                datasets: [
                    {
                        label: '∆ Total cases',
                        data: data[deltaTotalCasesIdx],
                        lineTension: 0.3,
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        borderColor: 'blue'
                    },
                    {
                        label: '∆ Active cases',
                        data: data[deltaActiveCasesIdx],
                        lineTension: 0.3,
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        borderColor: 'cyan'
                    },
                    {
                        label: '∆ Recovered',
                        data: data[deltaRecoveredIdx],
                        lineTension: 0.3,
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        borderColor: 'green'
                    },
                    {
                        label: '∆ Deaths',
                        data: data[deltaDeathsIdx],
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
    } else {
        let dataToShow = [...data];
        if (!isNaN(daysToShow)) {
            for (let i = 0; i < dataToShow.length; i++)
                dataToShow[i] = data[i].slice(Math.max(data[i].length - daysToShow, 0));
        }
        deltaGraph.data.labels = dataToShow[dateIdx];
        for (let i = 0; i < deltaGraph.data.datasets.length; i++) {
            deltaGraph.data.datasets[i].data = dataToShow[i + 9]
        }
        deltaGraph.update();
    }
    return deltaGraph;
}


function createHospitalizedGraph() {
    if (hospitalizedGraph == null) {
        let ctx = document.getElementById('hospitalized-chart');
        hospitalizedGraph = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data[dateIdx],
                datasets: [
                    {
                        label: 'Total hospitalized',
                        data: data[hospitalizedIdx],
                        lineTension: 0.3,
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        borderColor: 'teal'
                    },
                    {
                        label: 'Symptomatic hospitalized',
                        data: data[symptomaticHospitalizedIdx],
                        lineTension: 0.3,
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        borderColor: 'orange'
                    },
                    {
                        label: 'IC hospitalized',
                        data: data[icHospitalizedIdx],
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
                    text: 'Hospitalized'
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
    } else {
        let dataToShow = [...data];
        if (!isNaN(daysToShow)) {
            for (let i = 0; i < dataToShow.length; i++)
                dataToShow[i] = data[i].slice(Math.max(data[i].length - daysToShow, 0));
        }
        hospitalizedGraph.data.labels = dataToShow[dateIdx];
        for (let i = 0; i < hospitalizedGraph.data.datasets.length; i++) {
            hospitalizedGraph.data.datasets[i].data = dataToShow[i + 5]
        }
        hospitalizedGraph.update();
    }
    return hospitalizedGraph;
}


function createDeltaHospitalizedGraph() {
    if (deltaHospitalizedGraph == null) {
        let ctx = document.getElementById('delta-hospitalized-chart');
        deltaHospitalizedGraph = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data[dateIdx],
                datasets: [
                    {
                        label: '∆ Hospitalized',
                        data: data[deltaHospitalizedIdx],
                        lineTension: 0.3,
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        borderColor: 'teal'
                    },
                    {
                        label: '∆ Symptomatic hospitalized',
                        data: data[deltaSymptomaticHospitalizedIdx],
                        lineTension: 0.3,
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        borderColor: 'orange'
                    },
                    {
                        label: '∆ IC hospitalized',
                        data: data[deltaIcHospitalizedIdx],
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
                    text: 'Delta hospitalized'
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
    } else {
        let dataToShow = [...data];
        if (!isNaN(daysToShow)) {
            for (let i = 0; i < dataToShow.length; i++)
                dataToShow[i] = data[i].slice(Math.max(data[i].length - daysToShow, 0));
        }
        deltaHospitalizedGraph.data.labels = dataToShow[dateIdx];
        for (let i = 0; i < deltaHospitalizedGraph.data.datasets.length; i++) {
            deltaHospitalizedGraph.data.datasets[i].data = dataToShow[i + 13]
        }
        deltaHospitalizedGraph.update();
    }
    return deltaHospitalizedGraph;
}


function createTestsGraph() {
    if (testsGraph == null) {
        let ctx = document.getElementById('tests-chart');
        testsGraph = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data[dateIdx],
                datasets: [
                    {
                        label: '∆ Total / ∆ Tests',
                        data: arrayDiv(data[deltaTotalCasesIdx], data[deltaTestsIdx]),
                        lineTension: 0.3,
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        borderColor: 'orange'
                    },
                ]
            },
            options: {
                title: {
                    display: true,
                    fontSize: 18,
                    text: '∆ Total / ∆ Tests'
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
    } else {
        let dataToShow = [...data];
        if (!isNaN(daysToShow)) {
            for (let i = 0; i < dataToShow.length; i++)
                dataToShow[i] = data[i].slice(Math.max(data[i].length - daysToShow, 0));
        }
        testsGraph.data.labels = dataToShow[dateIdx];
        for (let i = 0; i < testsGraph.data.datasets.length; i++) {
            testsGraph.data.datasets[i].data = arrayDiv(dataToShow[deltaTotalCasesIdx], dataToShow[deltaTestsIdx])
        }
        testsGraph.update();
    }
    return testsGraph;
}


$(document).ready(fetchData);
window.onresize = updatePage;
