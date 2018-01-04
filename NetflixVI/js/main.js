// parameters
var shows = 'Netflix Shows.csv';
var data;
var id = 0;
var dict = {};

window.onload = function () { // do when page is loaded
    start();
};

function start() {


    // load data set
    d3.csv(shows, getData, function (loadedData) {
        data = loadedData;
        console.log(loadedData);
        afterLoad();

        //PIE CHART FOR AGES
        drawPieChart();
    });
}

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

    if (!(item.minAge in dict)) {
        dict[item.minAge] = 1;
    }
    else {
        dict[item.minAge] = dict[item.minAge] + 1;
    }
}

function afterLoad() {
    console.log('Initialization finished!');
}

function drawPieChart() {
    var total = 0;
    for (var key in dict) {
        total += dict[key];
    }

    console.log("Total " + total);

    var width = 540,
        height = 540,
        radius = 200;

    var arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var pie = d3.pie()
        .sort(null)
        .value(function (d) {
            console.log("Pie chart");
            return dict[d];
        });

    var svg = d3.select('body').append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var g = svg.selectAll(".arc")
        .data(pie(Object.keys(dict)))
        .enter().append("g");

    g.append("path")
        .attr("d", arc)
        .style("fill", '#8149c6')
        .on("mouseover", function (d) {
            svg.append("text")
                .attr("dy", ".5em")
                .style("text-anchor", "middle")
                .style("font-size", 45)
                .attr("class", "label")
                .style("fill", "black")
                .text(function () {
                    if (d.data != 0) {
                        return "Minimun Age " + d.data + " years old!\n" + d.value + " tv shows!";
                    }
                    else {
                        return "For All Ages!\n" + d.value + " tv shows!";
                    }
                });

        })
        .on("mouseout", function (d) {
            svg.select(".label").remove();
        });


    g.append("text")
        .attr("transform", function (d) {
            var _d = arc.centroid(d);
            _d[0] *= 2.2;	//multiply by a constant factor
            _d[1] *= 2.2;	//multiply by a constant factor
            return "translate(" + _d + ")";
        })
        .attr("dy", ".50em")
        .style("text-anchor", "middle")
        .text(function (d) {
            return (d.value / total) + '%';
        });
}