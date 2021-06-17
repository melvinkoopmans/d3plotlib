"use strict";
exports.__esModule = true;
var d3 = require("d3");
var Network = /** @class */ (function () {
    function Network(selector, width, height) {
        this.config = {
            zoom: false,
            draggable: false
        };
        this.selector = selector;
        this.width = width;
        this.height = height;
    }
    Network.prototype.plot = function (network) {
        var _a = this, width = _a.width, height = _a.height;
        var _b = this.config, zoom = _b.zoom, draggable = _b.draggable;
        var scaleC = d3.scaleOrdinal(d3.schemePastel1);
        var svg = d3.select(this.selector)
            .append('svg')
            .attr('width', width)
            .attr('height', height);
        if (zoom) {
            var svgG_1 = svg.call(d3.zoom().on('zoom', function () {
                svgG_1.attr('transform', d3.event.transform);
            })).append('g');
            this.svg = svgG_1;
        }
        else {
            this.svg = svg.append('g');
        }
        d3.shuffle(network.nodes);
        d3.shuffle(network.edges);
        var simulation = d3.forceSimulation(network.nodes)
            .force('link', d3.forceLink(network.edges).distance(40).id(function (d) { return d.id; }))
            .force('charge', d3.forceManyBody())
            .force('center', d3.forceCenter(width / 2, height / 2));
        var edges = this.svg.selectAll('line').data(network.edges).enter()
            .append('line').attr('stroke', '#000')
            .attr('x1', function (d) { return d.source.x; })
            .attr('y1', function (d) { return d.source.y; })
            .attr('x2', function (d) { return d.target.x; })
            .attr('y2', function (d) { return d.target.y; });
        var nodes = this.svg.selectAll('circle').data(network.nodes).enter()
            .append('circle')
            .attr('r', 10).attr('fill', function (d, i) { return scaleC(i); })
            .attr('cx', function (d) { return d.x; }).attr('cy', function (d) { return d.y; });
        var labels = this.svg.selectAll('text').data(network.nodes).enter()
            .append('text')
            .attr('text-anchor', 'middle')
            .style('user-select', 'none')
            .attr('font-size', 10)
            .text(function (d) { return d.id; });
        if (draggable) {
            nodes.call(this.drag(simulation));
            labels.call(this.drag(simulation));
        }
        simulation.on('tick', function () {
            edges
                .attr('x1', function (d) { return d.source.x; })
                .attr('y1', function (d) { return d.source.y; })
                .attr('x2', function (d) { return d.target.x; })
                .attr('y2', function (d) { return d.target.y; });
            nodes
                .attr('cx', function (d) { return d.x; })
                .attr('cy', function (d) { return d.y; });
            labels.attr('x', function (d) { return d.x; }).attr('y', function (d) { return d.y + 4; });
        });
    };
    Network.prototype.draggable = function () {
        this.config.draggable = true;
        return this;
    };
    Network.prototype.zoom = function () {
        this.config.zoom = true;
        return this;
    };
    Network.prototype.drag = function (simulation) {
        return d3.drag()
            .on('start', function (d) {
            if (!d3.event.active) {
                simulation.alphaTarget(0.3).restart();
            }
            d.fx = d.x;
            d.fy = d.y;
        })
            .on('drag', function (d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        })
            .on('end', function (d) {
            if (!d3.event.active) {
                simulation.alphaTarget(0);
            }
            d.fx = null;
            d.fy = null;
        });
    };
    return Network;
}());
exports["default"] = Network;
