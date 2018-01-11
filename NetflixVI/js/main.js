// parameters
var shows = 'Netflix Shows.csv';
var data, items;
var id = 0;
var dict = {};
var scores = [], years = [], titles = [], ratings = [], sliders=[];
var scatterPlot, scatterPlotW, scatterPlotH;
var scatterPlotDomainY = [2017, 1970]; // range do ano
var scatterPlotDomainX = [0, 100]; // range dos scores
var scatterPlotMarginX = [70, 50];
var scatterPlotMarginY = [50, 50];
var scatterPlotX, scatterPlotY, spColors, currentMovie, previousMovie;
var transition, filterL, initFilter;
var colors = ["red", "orange", "yellow", "green", "blue", "cyan", "purple", "pink"];

d3.select('#t1').style('visibility', 'hidden');
d3.select('#t2').style('visibility', 'hidden');
d3.select('#t3').style('visibility', 'hidden');
d3.select('#t4').style('visibility', 'hidden');

window.onload = function () { // do when page is loaded
    start();
};

function start() {
    // load data set
    d3.csv(shows, getData, function (loadedData) {
        data = loadedData;
        console.log(loadedData);

        transition = d3.transition().duration(700).delay(50);
        filterOptions();
        createScoreGraph();
        drawPieChart();

        createSliders();
        updateScatterplot(data);
    });
}

function filterOptions()  {
    filterL = {
        minAge:{
            min: 0,
            max: 18,
            showBoolean: true,
            numberFormatFunction: numberFormatter(0)
        },
        score:{
            min: 0,
            max: 100,
            showBoolean: false,
            numberFormatFunction: numberFormatter(1)
        },
        year:{
            min:1970,
            max:2018,
            showBoolean: false,
            numberFormatFunction: numberFormatter(0)
        }

    };
    initFilter = JSON.parse(JSON.stringify(filterL));
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

    if (!(item.minAge in dict)) {
        dict[item.minAge] = 1;
    }
    else {
        dict[item.minAge] = dict[item.minAge] + 1;
    }

    // set year to 0 if missing
    if (item['release year'] === '') {
        item.year = 0;
    }
    else
        item.year = +item['release year'];

    if (item['user rating score'] === 'NA') {
        item.score = 0;
    }
    else
        item.score = +item['user rating score'];

    item.id = id; id++;

    titles.push(item['title']);
    scores.push(item['user rating score']);
    years.push(item['release year']);
    ratings.push(item['rating'])

    delete item['ratingDescription'];
    delete item['ratingLevel'];
    delete item['user rating size'];
    return item;
}

function d3Zoom() {
    scatterPlot.attr('transform', d3.event.transform);
}
function createScoreGraph() {

    scatterPlot = d3.select('#scatterPlot').append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .style("fill", "white")
        .style("background-color", 'white');

    scatterPlot = scatterPlot.append('g').style('pointer-events', 'all');
    var zoom = d3.zoom()
        .scaleExtent([1, 10])
        .on('zoom', d3Zoom);

    scatterPlot.call(zoom);
    scatterPlot.append('rect')
        .attr('width', '100%')
        .attr('height', '100%')
        .style("fill", "none")
    scatterPlot = scatterPlot.append('g').attr('id', 'thisIsTheContainerForEverything');

    // calculate scale
    scatterPlotW = d3.select('#scatterPlot').node().getBoundingClientRect().width;
    scatterPlotH = d3.select('#scatterPlot').node().getBoundingClientRect().height;
    scatterPlotX = d3.scaleLinear().domain(scatterPlotDomainX).range([scatterPlotMarginX[0], scatterPlotW - scatterPlotMarginX[1]]);
    scatterPlotY = d3.scaleLinear().domain(scatterPlotDomainY).range([scatterPlotMarginY[0], scatterPlotH - scatterPlotMarginY[1]]);
    spColors = d3.scaleOrdinal(d3.schemeCategory20);

    // axis
    var xAxis = d3.axisBottom(scatterPlotX);
    var yAxis = d3.axisLeft(scatterPlotY);
    var originX = scatterPlotX(scatterPlotDomainX[0]);
    var originY = scatterPlotY(scatterPlotDomainY[1]); // as y is the other way round (from imdB score 10 to 0)
    scatterPlot.append('g').attr('transform', 'translate(' + 0 + ',' + originY + ')').call(xAxis);
    scatterPlot.append('g').attr('transform', 'translate(' + originX + ',' + 0 + ')').call(yAxis);
    // axis labels
    scatterPlot.append('text')
        // .attr('class', 'x label')
        .attr('text-anchor', 'end')
        .attr('x', scatterPlotW / 2)
        .style("fill", "black")
        .style("font-weight", "bold")
        .attr('y', scatterPlotH - scatterPlotMarginY[1] + 40)
        .text('Score');
    scatterPlot.append('text')
        .attr('text-anchor', 'end')
        .attr('x', -190)
        .attr('transform', 'rotate(270 -10 10)')
        .attr('y', scatterPlotMarginX[0] - 30)
        .style("font-weight", "bold")
        .style("fill", "black")
        .text('Year');

    scatterPlot.append('g').attr('id', 'dataContainer');
}

function keyFunction(d) {
    return d.id;
}

function updateScatterplot(updatedData) {

    var rectsExistingYet = scatterPlot.select('#dataContainer').selectAll('rect')
        .data(updatedData, keyFunction);

    // remove filtered items
    rectsExistingYet.exit()
        .transition(transition)
        .attr('width', function (d) {
            return 0;
        })
        .attr('height', function (d) {
            return 0;
        })
        .remove();

    // update all still visible items
    rectsExistingYet
        .attr('fill', function (d) {
            if (currentMovie === undefined || currentMovie.id !== d.id) { // currently not selected
                return 'opacity';
            }
        })
        .attr('opacity', function (d) {
            if (currentMovie === undefined || currentMovie.id !== d.id) { // currently not selected
                return 0.5;
            } else { // currently selected
                return 1;
            }
        });
    // add new items
    var newlyAddedRects = rectsExistingYet.enter().append('rect');
    newlyAddedRects
        .attr('x', function (d) {
            return scatterPlotX(d['score']);
        })
        .attr('y', function (d) {
            return scatterPlotY(d['year']);
        })
        .attr('width', function () {
            return 0; // transition is handling this (see below)
        })
        .attr('height', function () {
            return 0; // transition is handling this (see below)
        })
        .attr('id', function (d) {
            return 'id' + d.id; // ids must begin with a letter
        })
        .attr('stroke-width', function (d) {
            if (currentMovie === undefined || currentMovie.id !== d.id) {
                return Math.min(Math.max(1, 10), 3);
            } else {
                return Math.min(Math.max(1, 10), 3);
            }
        })
        .attr('stroke', function (d) { // color
            if (d.minAge == 0) {
                return colors[0];
            }
            if (d.minAge == 6) {
                return colors[1];
            }
            if (d.minAge == 7) {
                return colors[2];
            }
            if (d.minAge == 12) {
                return colors[3];
            }
            if (d.minAge == 13) {
                return colors[4];
            }
            if (d.minAge == 14) {
                return colors[5];
            }
            if (d.minAge == 17) {
                return colors[6];
            }
            if (d.minAge == 18) {
                return colors[7];
            }
        })
        .attr("stroke-width", 1)
        .on('mouseover', function () {
            var minSizeOnHover = 15; // 15 pixel minimum size of items when hovered
            d3.select(this).transition().duration(300)
                .attr('width', function (d) { return Math.max(minSizeOnHover, 2 * Math.max(5, 9)); })
                .attr('height', function (d) { return Math.max(minSizeOnHover, 2 * Math.max(5, 9)); })
                .attr('x', function (d) { return scatterPlotX(d['score']) - Math.max(minSizeOnHover / 2, 8) / 2; })
                .attr('y', function (d) { return scatterPlotY(d['year']) - Math.max(minSizeOnHover / 2, 8) / 2; })
                .attr('rx', function (d) { // roundness of corners
                });
        })
        .on('mouseout', function () {
            d3.select(this).transition().duration(300)
                .attr('width', function (d) { return Math.max(6, 6); })
                .attr('height', function (d) { return Math.max(6, 6); })
                .attr('x', function (d) { return scatterPlotX(d['score']); })
                .attr('y', function (d) { return scatterPlotY(d['year']); })

        })
        .on('click', function (d) {
            console.log('Clicked on ', d);
            currentMovie = d;
            updateDetails();
        })
        .transition(transition)
        .attr('width', function (d) {
            // return Math.max(5,d.famousness);
            return Math.max(5, 5);
        })
        .attr('height', function (d) {
            // return Math.max(5,d.famousness);
            return Math.max(5, 5);
        });

    var newLine = '\r\n';
    newlyAddedRects.append('svg:title')
        .text(function (d) { return d['title'] + ' (' + d['year'] + ')' + newLine + d['score']; });

    d3.select('#visibleMoviesCounter').text('Shows shown: ' + (rectsExistingYet._groups[0].length));

}

function updateDetails() {
    if (currentMovie !== undefined && previousMovie !== currentMovie) {
        previousMovie = currentMovie;

        d3.select('#t1').style('visibility', 'visible');
        d3.select('#t2').style('visibility', 'visible');
        d3.select('#t3').style('visibility', 'visible');
        d3.select('#t4').style('visibility', 'visible');

        d3.select('#movieInfos').attr('class', 'visible');
        d3.select('#movieTitle').text(currentMovie['title']);
        d3.select('#tableYear').text(currentMovie['year']);
        d3.select('#tableRating').text(currentMovie['rating']);
        d3.select('#tableScore').text(currentMovie['score']);
        d3.select('#tableAge').text(currentMovie['minAge']);
    }
}

function createSliders() {

    createSlider('yearSlider','year');
    createSlider('scoreSlider','score');
    createSlider('minimumAgeSlider','minAge');

}
function createSlider(container, dataFieldName){

    var slider = document.getElementById(container);

    sliders[dataFieldName] = slider;

    noUiSlider.create(slider, {
        start: [ filterL[dataFieldName].min, filterL[dataFieldName].max ],
        range: {
            'min': [  filterL[dataFieldName].min ],
            'max': [ filterL[dataFieldName].max ]
        },
        tooltips: [filterL[dataFieldName].numberFormatFunction, filterL[dataFieldName].numberFormatFunction]
    });
    var i=0;

    var timeOfLastUpdate = 0;
    slider.noUiSlider.on('update',function (values, handle) {
        i++;
        var thisValue = i;
        // console.log('Update requested:',filterL[dataFieldName].min,filterL[dataFieldName].max,handle,i);
        filterL[dataFieldName].min = values[0];
        filterL[dataFieldName].max = values[1];
        setTimeout(function(){
            if(i==thisValue || (new Date()).getTime()-timeOfLastUpdate>700){
                timeOfLastUpdate = (new Date()).getTime();
                update();
            }
        },150);
    });
}

function numberFormatter(digits){
    return {
        to: function(value){return value.toFixed(digits);},
        from: function(value){return +value;}
    }
}

function update() {
    var updatedData =
        data.filter(function(d) {
            for(var prop in filterL){
                // console.log(prop);
                if(filterL.hasOwnProperty(prop)){
                    if(((!filterL[prop].showBoolean || +filterL[prop].max!==+initFilter[prop].max)
                            && d[prop]>filterL[prop].max)
                        || ((!filterL[prop].showBoolean||+filterL[prop].min!==+initFilter[prop].min)
                            && d[prop]<filterL[prop].min)){
                        return false;
                    }
                }
            }
            return true;
        });
    updateScatterplot(updatedData);
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
                    return parseFloat((d.value / total) * 100).toFixed(2) + '%';
                });
        });
}