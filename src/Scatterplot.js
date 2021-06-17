"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var d3 = require("d3");
var BaseChart_1 = require("./BaseChart");
var Scatterplot = /** @class */ (function (_super) {
    __extends(Scatterplot, _super);
    function Scatterplot() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            xInitialDomain: null,
            xScale: null,
            xAxis: null,
            yInitialDomain: null,
            yScale: null,
            yAxis: null,
            brush: null,
            brushElement: null,
            brushIdleTimout: null
        };
        return _this;
    }
    Scatterplot.prototype.plot = function (data) {
        var _a = this, svg = _a.svg, width = _a.width, height = _a.height;
        var _b = this.config, xTicks = _b.xTicks, yTicks = _b.yTicks;
        var xDomain = d3.extent(data.map(function (d) { return 1.05 * d[0]; }));
        var xScale = d3.scaleLinear()
            .domain(xDomain)
            .range([0, width]);
        this.state.xInitialDomain = xDomain;
        this.state.xScale = xScale;
        var yDomain = d3.extent(data.map(function (d) { return 1.05 * d[1]; }));
        var yScale = d3.scaleLinear()
            .domain(yDomain)
            .range([height, 0]);
        this.state.yInitialDomain = yDomain;
        this.state.yScale = yScale;
        var sizeScale = d3.scaleLinear()
            .domain(d3.extent(data.map(function (d) { return (d[2] || 1); })))
            .range([1.0, 2]);
        var xAxis = svg.append('g')
            .attr('transform', "translate(0, " + height + ")")
            .call(d3.axisBottom(xScale).ticks(xTicks));
        this.state.xAxis = xAxis;
        var yAxis = svg.append('g')
            .call(d3.axisLeft(yScale).ticks(yTicks));
        this.state.yAxis = yAxis;
        this.addHorizontalGridlines(yScale);
        this.addVerticalGridlines(xScale);
        this.defs.append('svg:clipPath')
            .attr('id', 'clip')
            .append('svg:rect')
            .attr('width', width)
            .attr('height', height)
            .attr('x', 0)
            .attr('y', 0);
        svg.append('g')
            .attr('clip-path', 'url(#clip)')
            .selectAll('circle')
            .data(data).enter()
            .append('circle')
            .attr('r', function (d) { return 4 * sizeScale(d[2] || 1); })
            .attr('cx', function (d) { return xScale(d[0]); })
            .attr('cy', function (d) { return yScale(d[1]); })
            .attr('stroke', '#FFF')
            .attr('stroke-width', 1);
        var brush = d3.brush()
            .extent([[0, 0], [width, height]])
            .on('end', this.updateBrush.bind(this));
        var brushElement = svg.append('g')
            .attr('class', 'brush')
            .call(brush);
        this.state.brush = brush;
        this.state.brushElement = brushElement;
    };
    Scatterplot.prototype.updateBrush = function () {
        var _this = this;
        var _a = this.state, xInitialDomain = _a.xInitialDomain, xScale = _a.xScale, xAxis = _a.xAxis, yInitialDomain = _a.yInitialDomain, yAxis = _a.yAxis, yScale = _a.yScale, brush = _a.brush, brushElement = _a.brushElement, brushIdleTimout = _a.brushIdleTimout;
        if (!xInitialDomain || !xScale || !xAxis
            || !yInitialDomain || !yScale || !yAxis
            || !brush || !brushElement || !yScale) {
            return;
        }
        var _b = this.config, xTicks = _b.xTicks, yTicks = _b.yTicks;
        var extent = d3.event.selection;
        if (!extent) {
            if (!brushIdleTimout) {
                return this.state.brushIdleTimout = setTimeout(function () { return _this.state.brushIdleTimout = null; }, 350);
            }
            xScale.domain(xInitialDomain);
            yScale.domain(yInitialDomain);
        }
        else {
            xScale.domain([xScale.invert(extent[0][0]), xScale.invert(extent[1][0])]);
            yScale.domain([yScale.invert(extent[1][1]), yScale.invert(extent[0][1])]);
            this.svg.select('.brush').call(brush.move, null);
        }
        this.state.xScale = xScale;
        this.state.yScale = yScale;
        xAxis.transition().duration(1000).call(d3.axisBottom(xScale).ticks(xTicks));
        yAxis.transition().duration(1000).call(d3.axisLeft(yScale).ticks(yTicks));
        this.svg
            .selectAll('circle')
            .transition().duration(1000)
            .attr('cx', function (d) { return xScale(d[0]); })
            .attr('cy', function (d) { return yScale(d[1]); });
    };
    return Scatterplot;
}(BaseChart_1["default"]));
exports["default"] = Scatterplot;
