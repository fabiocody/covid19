"use strict";


let daysToShow = NaN;
let region = 'Italy';


function btnItalyClicked() {
    $('#btn-italy').addClass('active');
    $('#btn-lombardy').removeClass('active');
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


function fetchData() {
    let URL;
    if (region === 'Italy') {
        URL = 'https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-andamento-nazionale/dpc-covid19-ita-andamento-nazionale.csv';
    }/* else if (region === 'Lombardy') {           LOMBARDY NEEDS A DIFFERENT PREPROCESS FUNCTION DUE TO THE DIFFERENT CSV HEADER
        URL = 'https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-regioni/dpc-covid19-ita-regioni.csv';
    }*/
    Papa.parse(URL, {
        download: true,
        complete: processData
    });
}


function processData(results) {
    //console.log(results.data[0]);
    results.data.shift();
    results.data = results.data.filter(row => row.length > 1);
    //console.log(results.data);
    let date = [];
    let activeCases = [];
    let deltaActiveCases = [];
    let deltaTotalCases = [];
    let recovered = [];
    let deaths = [];
    let totalCases = [];
    let tested_cases = [];
    if (!isNaN(daysToShow)) {
        results.data = results.data.slice(Math.max(results.data.length - daysToShow, 0));
    }
    for (let row of results.data) {
        date.push(row[0]);
        activeCases.push(row[6]);
        deltaActiveCases.push(row[7]);
        deltaTotalCases.push(row[8]);
        recovered.push(row[9]);
        deaths.push(row[10]);
        totalCases.push(row[11]);
        tested_cases.push(row[13]);
    }
    let data = [
        date,               // 0
        activeCases,        // 1
        deltaActiveCases,   // 2
        deltaTotalCases,    // 3
        recovered,          // 4
        deaths,             // 5
        totalCases,         // 6
        tested_cases        // 7
    ]
    updateData(data);
    createGraph(data);
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


function createGraph(data) {
    let ctx = document.getElementById('chart');
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
