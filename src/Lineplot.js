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
var d3_1 = require("d3");
var d3_array_1 = require("d3-array");
var BaseChart_1 = require("./BaseChart");
var Lineplot = /** @class */ (function (_super) {
    __extends(Lineplot, _super);
    function Lineplot() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.lineConfig = {
            loaded: false,
            xScale: null,
            yScale: null,
            yAxis: null,
            xAxis: null,
            curveFactory: d3_1.curveLinear
        };
        _this.datasets = [];
        return _this;
    }
    Lineplot.prototype.plot = function (data, category, color) {
        if (category === void 0) { category = null; }
        if (color === void 0) { color = null; }
        var _a;
        var _b = this, svg = _b.svg, width = _b.width, height = _b.height, isAutoAdjusted = _b.isAutoAdjusted, datasets = _b.datasets, selector = _b.selector;
        var _c = this.lineConfig, loaded = _c.loaded, xScale = _c.xScale, yScale = _c.yScale, yAxis = _c.yAxis, xAxis = _c.xAxis, curveFactory = _c.curveFactory;
        if (!loaded) {
            this.lineConfig.xScale = xScale = d3_1.scaleLinear()
                .domain(d3_array_1.extent(data, function (d) { return d[0]; }))
                .range([0, width]);
            this.lineConfig.yScale = yScale = d3_1.scaleLinear()
                .domain(d3_array_1.extent(data, function (d) { return d[1]; }))
                .range([height, 0]);
            this.lineConfig.yAxis = yAxis = svg.append('g')
                .call(d3_1.axisLeft(yScale));
            this.lineConfig.xAxis = svg.append('g')
                .attr('transform', "translate(0, " + height + ")")
                .call(d3_1.axisBottom(xScale));
            svg.selectAll('.grid').remove();
            this.addHorizontalGridlines(yScale);
            if (!isAutoAdjusted) {
                this.autoAdjust(yAxis);
                this.plot(data, category, color);
            }
            this.lineConfig.loaded = true;
        }
        yAxis === null || yAxis === void 0 ? void 0 : yAxis.selectAll('path').remove();
        yAxis === null || yAxis === void 0 ? void 0 : yAxis.selectAll('line').remove();
        xAxis === null || xAxis === void 0 ? void 0 : xAxis.selectAll('path').attr('stroke', '#DDD');
        xAxis === null || xAxis === void 0 ? void 0 : xAxis.selectAll('.tick line').remove();
        xAxis === null || xAxis === void 0 ? void 0 : xAxis.selectAll('.tick text').attr('transform', 'translate(0, -2)');
        if (!this.datasets.find(function (d) { return d.category === category; })) {
            this.datasets.push({
                data: data, category: category, color: color
            });
        }
        var xDomain = xScale === null || xScale === void 0 ? void 0 : xScale.domain();
        data = data
            .filter(function (d) { return d[0] >= xDomain[0] && d[0] <= xDomain[1]; })
            .map(function (d) { return [xScale(d[0]), yScale(d[1])]; });
        var path = svg.append('g').append('path')
            .attr('d', d3_1.line().curve(curveFactory)(data))
            .attr('fill', 'none').attr('stroke', color || '#000');
        var totalLength = (_a = path.node()) === null || _a === void 0 ? void 0 : _a.getTotalLength();
        path
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(1000)
            .ease(d3_1.easeLinear)
            .attr("stroke-dashoffset", 0);
        svg.selectAll('.vertical-ruler').remove();
        var ruler = svg.append('line')
            .attr('class', 'vertical-ruler')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', this.height)
            .attr('y2', 0)
            .attr('opacity', 0)
            .attr('stroke', '#DDD')
            .attr('stroke-width', 1);
        d3_1.select(selector).selectAll('.vertical-ruler-tooltip').remove();
        var rulerTooltip = d3_1.select(selector).append('div')
            .style('position', 'absolute')
            .style('top', 0)
            .style('left', 0)
            .style('opacity', 0)
            .style('font-size', '12px')
            .attr('class', 'vertical-ruler-tooltip')
            .html('Tooltip content');
        var container = svg.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'transparent');
        var pointCircles = svg.append('g')
            .attr('class', 'point-circles')
            .attr('opacity', 0);
        this.datasets.forEach(function (dataset) {
            pointCircles.append('circle')
                .attr('r', 3)
                .attr('cx', 0)
                .attr('cy', 0)
                .attr('fill', dataset.color || '#000');
        });
        container.on('mousemove', function () {
            var _a = d3_1.mouse(this), x = _a[0], y = _a[1];
            ruler.attr('x1', x).attr('x2', x);
            var tooltip = '';
            var tooltipPoints = [];
            datasets.forEach(function (dataset, i) {
                var closestPoint = dataset.data
                    .sort(function (a, b) {
                    return Math.abs(x - xScale(a[0])) > Math.abs(x - xScale(b[0])) ? 1 : 0;
                })[0];
                pointCircles.selectAll("circle:nth-child(" + (i + 1) + ")")
                    .attr('cx', xScale(closestPoint[0]))
                    .attr('cy', yScale(closestPoint[1]));
                tooltipPoints.push({
                    y: closestPoint[1],
                    category: dataset.category,
                    color: dataset.color
                });
            });
            tooltipPoints
                .sort(function (a, b) {
                return b.y > a.y ? 1 : 0;
            })
                .forEach(function (point) {
                tooltip += "<div class=\"tooltip-legend\" style=\"background: " + point.color + "\"></div> " + point.category + ": " + point.y.toFixed(1) + "<br>";
            });
            rulerTooltip
                .style('transform', "translate(" + (x + 60) + "px, " + y + "px)")
                .html(tooltip);
            rulerTooltip.selectAll('.tooltip-legend')
                .style('display', 'inline-block')
                .style('width', '10px')
                .style('height', '10px')
                .style('border-radius', '50%')
                .style('margin-right', '3px')
                .style('transform', 'translateY(1px)');
        });
        container.on('mouseover', function () {
            ruler.transition().duration(250).attr('opacity', 1);
            rulerTooltip.transition().duration(250).style('opacity', 1);
            pointCircles.transition().duration(250).attr('opacity', 1);
        });
        container.on('mouseleave', function () {
            ruler.transition().duration(250).attr('opacity', 0);
            rulerTooltip.transition().duration(250).style('opacity', 0);
            pointCircles.transition().duration(250).attr('opacity', 0);
        });
        return this;
    };
    Lineplot.prototype.curve = function (factory) {
        this.lineConfig.curveFactory = factory;
        return this;
    };
    return Lineplot;
}(BaseChart_1["default"]));
exports["default"] = Lineplot;
