"use strict";


let daysToShow = NaN;
let region = 'Italy';
let data = null;
let dataGraph = null;
let deltaGraph = null;
let testsGraph = null;

const dateIdx = 0;
const totalCasesIdx = 1;
const activeCasesIdx = 2;
const recoveredIdx = 3;
const deathsIdx = 4;
const testsIdx = 5;
const deltaTotalCasesIdx = 6;
const deltaActiveCasesIdx = 7;
const deltaRecoveredIdx = 8;
const deltaDeathsIdx = 9;
const deltaTestsIdx = 10;


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
    updatePage();
}


function last30DaysClicked() {
    $('#btn-all-data').removeClass('active');
    $('#btn-30-days').addClass('active');
    $('#btn-7-days').removeClass('active');
    daysToShow = 30;
    updatePage();
}


function last7DaysClicked() {
    $('#btn-all-data').removeClass('active');
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
    let indexes = [0, 6, 7, 8, 9, 10, 13, 15];
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
    let tests = [];
    for (let row of results.data) {
        date.push(row[indexes[0]]);
        activeCases.push(row[indexes[1]]);
        deltaActiveCases.push(row[indexes[2]]);
        deltaTotalCases.push(row[indexes[3]]);
        recovered.push(row[indexes[4]]);
        deaths.push(row[indexes[5]]);
        totalCases.push(row[indexes[6]]);
        tests.push(row[indexes[7]]);
    }
    let deltaRecovered = ediff1d(recovered);
    let deltaDeaths = ediff1d(deaths);
    let deltaTests = ediff1d(tests);
    data = [
        date,               // 0
        totalCases,         // 1
        activeCases,        // 2
        recovered,          // 3
        deaths,             // 4
        tests,              // 5
        deltaTotalCases,    // 6
        deltaActiveCases,   // 7
        deltaRecovered,     // 8
        deltaDeaths,        // 9
        deltaTests,         // 10
    ]
    updatePage();
}


function updatePage() {
    updateData();
    createDataGraph();
    createDeltaGraph();
    createTestsGraph();
}


function getDelta(data) {
    if (data[1] >= data[0]) {
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
            deltaGraph.data.datasets[i].data = dataToShow[i + 6]
        }
        deltaGraph.update();
    }
    return deltaGraph;
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
