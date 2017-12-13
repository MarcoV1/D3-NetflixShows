// parameters
var shows = 'Netflix Shows.csv';
var data;

window.onload = function () { // do when page is loaded
    start();
};

function start() {


    // load data set
    d3.csv(shows, getData, function(loadedData){
        data = loadedData;
        console.log(loadedData);
        afterLoad();
    });
}


var id = 0;
// obter os dados do csv
function getData(item) {
    // distinguir os diferentes tipos de rating e associar a idade para cada um
    if (item['rating'] === 'G') {
        item.minAge = 0;
    }
    else if (item['rating'] === 'TV-G') {
        item.minAge = 0;
    }
    else if (item['rating'] === 'TV-Y') {
        item.minAge = 0;
    }
    else if (item['rating'] === 'PG') {
        item.minAge = 6;
    }
    else if (item['rating'] === 'TV-Y7-FV') {
        item.minAge = 7;
    }
    else if (item['rating'] === 'TV-Y7') {
        item.minAge = 7;
    }
    else if (item['rating'] === 'TV-PG') {
        item.minAge = 12;
    }
    else if (item['rating'] === 'PG-13') {
        item.minAge = 13;
    }
    else if (item['rating'] === 'TV-14') {
        item.minAge = 14;
    }
    else if (item['rating'] === 'R') {
        item.minAge = 17;
    }
    else if (item['rating'] === 'TV-MA') {
        item.minAge = 17;
    }
    else if (item['rating'] === 'UR') {
        item.minAge = 18;
    }
    else if (item['rating'] === 'NR') {
        item.minAge = 18;
    }
    else {
        // verificar se falta algum rating
        console.warn('Falta este rating:', item['rating']);
    }


}


function afterLoad(){

    console.log('Initialization finished!');
}