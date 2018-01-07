// parameters
var shows = 'Netflix Shows.csv';
var data;
var id = 0;
var dict = {};

var scores = [];
var years = [];
var titles = [];

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
    titles.push(item['title']);
    scores.push(item['user rating score']);
    years.push(item['release year']);
}

function afterLoad() {
    console.log('Initialization finished!');
    console.log(titles);
    console.log(scores);
}   console.log(years);


function createScoreGraph() {
    console.log('score graph');


}


function drawPieChart() {
    var total = 0;
    for (var key in dict) {
        total += dict[key];
    }

    //Pie chart drawing animation
    function tweenPie(finish) {
        var start = {
            startAngle: 0,
            endAngle: 0
        };
        var interpolator = d3.interpolate(start, finish);
        return function (d) { return arc(interpolator(d)); };
    }

    //Add labels only at the end
    function checkEndAll(transition, callback) {
        var n = 0;
        transition
            .each(function () { ++n; })
            .on("end", function () {
                if (!--n) callback.apply(this, arguments);
            });
    }

    var colors = ["red", "orange", "yellow", "green", "blue", "cyan", "purple", "pink"]

    var width = 540,
        height = 540,
        radius = 200;

    var arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var arcOver = d3.arc()
        .innerRadius(0)
        .outerRadius(150 + 10);

    var pie = d3.pie()
        .sort(null)
        .padAngle(.01)
        .value(function (d) {
            console.log("Pie chart");
            return dict[d];
        });

    var svg = d3.select('#pieChart').append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var g = svg.selectAll(".arc")
        .data(pie(Object.keys(dict)))
        .enter().append("g");

    g.append("path")
        .attr("d", arc)
        .style("fill", function (d) {
            return colors[d.index];
        })
        .on("mouseover", function (d) {
            svg.append("text")
                .attr("dy", ".5em")
                .style("text-anchor", "middle")
                .style("font-size", 66)
                .attr("class", "label")
                .style("fill", "black")
                .text(function () {
                    if (d.data != 0) {
                        $("#ageText").text("Minimum age:  " + d.data);
                        $("#showsText").text("Number of shows:  " + d.value);

                       // return "Minimum Age " + d.data + " years old!\n" + "There's " + d.value + " tv shows!";
                    }
                    else {
                        $("#ageText").text("No minimum age.  ");
                        $("#showsText").text("Number of shows:  " + d.value);
                      //  return "For All Ages!\nThere's " + d.value + " tv shows!";
                    }
                });

        })
        .on("mouseout", function (d) {
            svg.select(".label").remove();
        })
        .on("mouseenter", function (d) {
            d3.select(this)
                .attr("stroke", "white")
                .transition()
                .duration(1000)
                .attr("d", arcOver)
                .attr("stroke-width", 6);
        })
        .on("mouseleave", function (d) {
            d3.select(this).transition()
                .attr("d", arc)
                .attr("stroke", "none");
        })
        .transition()
        .duration(2000)
        .attrTween('d', tweenPie)
        .call(checkEndAll, function () {
            g.append("text")
                .attr("transform", function (d) {
                    var _d = arc.centroid(d);
                    _d[0] *= 2.2;	//multiply by a constant factor
                    _d[1] *= 2.2;	//multiply by a constant factor
                    return "translate(" + _d + ")";
                })
                .attr("dy", ".50em")
                .style("text-anchor", "middle")
                .style("fill", "white")
                .text(function (d) {
                    return parseFloat((d.value / total) * 100 ).toFixed(2) + '%';
                });
        });
}