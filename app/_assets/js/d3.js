"use strict";

$(document).ready(function() {

    var d3val = document.getElementsByClassName("d3");
    var containsSvg = document.getElementById("svgContainer");

    if (d3val.length) {
        if (containsSvg) {

            var siteBase = window.location.href;

            var dataInt = 5;
            var mouseMoved = false;
            var timer;

            var button = document.getElementsByClassName("hiding");
            var select = document.getElementsByClassName("data-button");

            var variableText = "Secondary education, total pupils - World"
            var diagram = "area";

            var cycleTimer = setInterval(cycle, 2000);

            var cycle = function() {
                svg.selectAll("path.area")
                    .transition()
                    .duration(3000)
                    .style("fill", function() {
                        return color(Math.random());
                    });
            }

            var mousemove = function() {
                for (var i = 0; i < button.length; i++) {
                    button[i].style.opacity = "1";
                    button[i].style.filter = 'alpha(opacity=0)'; // IE fallback
                }

                svg.selectAll(".axis").transition()
                    .duration(600).style("opacity", 1);

                svg.selectAll(".data-button").transition()
                    .duration(600).style("opacity", "1");
                mouseMoved = true;

                clearTimeout(timer);
                timer = setTimeout(mouseStopped, 3000);
            }

            var mouseStopped = function() {
                svg.selectAll(".axis").transition()
                    .duration(600).style("opacity", 0);

                for (var i = 0; i < button.length; i++) {
                    button[i].style.opacity = "0";
                    button[i].style.filter = 'alpha(opacity=1)'; // IE fallback
                }
            }

            var sorting = function(json_object, key_to_sort_by) {
                function sortByKey(a, b) {
                    var x = a[key_to_sort_by];
                    var y = b[key_to_sort_by];
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                }
                json_object.sort(sortByKey);
            }

            var resize = function() {
                var margin = {
                        top: 128,
                        right: 20,
                        bottom: 98,
                        left: 64
                    },
                    width = parseInt(d3.select(".diagram-body").style("width")),
                    widthMargin = width - margin.right - margin.left,
                    height = parseInt(d3.select(".diagram-body").style("height"));

                x = d3.time.scale()
                    .range([0, width]);

                z = d3.time.scale()
                    .range([0, widthMargin]);

                y = d3.scale.linear()
                    .rangeRound([height - margin.bottom * 2, 0]);

                var xAxis = d3.svg.axis()
                    .scale(z)
                    .orient("bottom")
                    .ticks(7);

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .tickFormat(d3.format("s"));

                d3.json("../../assets/data/data.json", function(error, data) {

                    d3.selectAll("svg")
                        .attr("width", width)
                        .attr("height", height);

                    if (error) throw error;
                    data = data.dataset[dataInt].data;

                    data.forEach(function(d) {
                        d[0] = parseDate(d[0]);
                        d[1] = +d[1];
                    });

                    x.domain(d3.extent(data, function(d) {
                        return d[0];
                    }));

                    z.domain(d3.extent(data, function(d) {
                        return d[0];
                    }));

                    y.domain([0, d3.max(data, function(d) {
                        return d[1];
                    })]);

                    area = d3.svg.area().interpolate("cardinal")
                        .x(function(d) {
                            return x(d[0]) - margin.left;
                        })
                        .y0(height + margin.bottom)
                        .y1(function(d) {
                            return y(d[1]);
                        });

                    svg.selectAll("path.area").datum(data)
                        .transition()
                        .duration(2000)
                        .attr("transform", "translate(0,1600)")
                        .style("fill", function() {
                            return color(Math.random());
                        }).remove();

                    svg.append("path").datum(data)
                        .attr("class", "area")
                        .attr("transform", "translate(0,1024)")
                        .transition()
                        .duration(2000)
                        .attr("transform", "translate(0,0)")
                        .attr("d", area)
                        .style("fill", function() {
                            return color(Math.random());

                        }).style("opacity", "0.35").each("end", cycle);


                    svg.selectAll("g.axis#x")
                        .transition()
                        .duration(1500)
                        .call(xAxis);

                    svg.selectAll("g.axis#y")
                        .transition()
                        .duration(1500)
                        .call(yAxis)

                    svg.selectAll("text.yText")
                        .attr("text-anchor", "start")
                        .transition()
                        .duration(1500)
                        .text(variableText);
                });
            }

            d3.select(window).on('resize', resize);

            $("button.data-button").click(function(zEvent) {
                $("button.data-button").removeClass("active");
                var jThis = $(this);
                jThis.addClass("active");
            });

            for (var i = 0; i < select.length; i++) {
                select[i].onclick = function(e) {

                    clearInterval(cycleTimer);
                    cycleTimer = 0;

                    if (this.id === "spain") {
                        dataInt = 0;
                        variableText = "Unemployment Rate % - Spain"
                        resize();
                    }
                    if (this.id === "suicide") {
                        dataInt = 1;

                        variableText = "Army Yearly Suicide Rate - USA"
                        resize();
                    }
                    if (this.id === "carbon") {
                        dataInt = 2;

                        variableText = "CO2 emissions (kilotonnes) - World"
                        resize();
                    }
                    if (this.id === "crimeus") {
                        dataInt = 3;

                        variableText = "Nr of criminal offences per 100,000 - USA"
                        resize();
                    }
                    if (this.id === "child") {
                        dataInt = 4;

                        variableText = "Infant Mortality Rate per 1000 births - World"
                        resize();
                    }
                    if (this.id === "education") {
                        dataInt = 5;

                        variableText = "Secondary education, total pupils - World"
                        resize();
                    }
                };
            }

            for (var i = 0; i < button.length; i++) {
                button[i].style.opacity = "0";
                button[i].style.filter = 'alpha(opacity=1)'; // IE fallback
            }

            var color = d3.scale.linear()
                .range(["#3300ff", "#ff0033"]);

            var margin = {
                    top: 98,
                    right: 64,
                    bottom: 98,
                    left: 64
                },
                width = parseInt(d3.select(".diagram-body").style("width")),
                widthMargin = width - 128,
                height = parseInt(d3.select(".diagram-body").style("height"));

            var parseDate = d3.time.format("%Y-%m-%d").parse;

            var x = d3.time.scale()
                .rangeRound([0, width]).nice();

            var z = d3.time.scale()
                .rangeRound([0, widthMargin]).nice();

            var y = d3.scale.linear()
                .rangeRound([height - margin.bottom * 3, 0]);

            var xAxis = d3.svg.axis()
                .scale(z)
                .orient("bottom")
                .ticks(7)

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .tickFormat(d3.format("s"));

            var area = d3.svg.area().interpolate("cardinal")
                .x(function(d) {
                    return x(d[0]) - margin.left;
                })
                .y0(height + margin.bottom)
                .y1(function(d) {
                    return y(d[1]);
                });

            var svg = d3.select(".svg").append("svg")
                .attr("class", "svgcontainer")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" +  margin.left + "," + margin.top + ")");


            d3.json("../../assets/data/data.json", function(error, data) {
                if (error) throw error;
                data = data.dataset[dataInt].data;

                data.forEach(function(d) {
                    d[0] = parseDate(d[0]);
                    d[1] = +d[1];
                });

                x.domain(d3.extent(data, function(d) {
                    return d[0];
                }));

                z.domain(d3.extent(data, function(d) {
                    return d[0];
                }));
                y.domain([0, d3.max(data, function(d) {
                    return d[1];
                })]);

                svg.append("g")
                    .attr("class", "axis")
                    .attr("id", "x")
                    .attr("transform", "translate(0," + (height - margin.bottom * 2) + ")")
                    .call(xAxis)
                    .style("opacity", "0");

                var dataViz = svg.append("g")
                    .attr("class", "axis")
                    .attr("id", "y")
                    .style("text-anchor", "start")
                    .call(yAxis)
                    .style("opacity", "0");

                dataViz.append("text")
                    .attr("width", widthMargin)
                    .attr("transform", "translate(0,-9)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .attr("class", "yText")
                    .attr("text-anchor", "start")
                    .text(variableText);
            });

            d3.select(window).on("mousemove", mousemove);

            resize();

        }
    }
});
