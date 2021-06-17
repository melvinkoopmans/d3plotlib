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
var KDE = /** @class */ (function (_super) {
    __extends(KDE, _super);
    function KDE() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kdeConfig = {
            bandwidth: 1.0
        };
        _this.state = {
            xScale: null,
            yScale: null,
            thresholds: [],
            plotCalls: 0
        };
        return _this;
    }
    KDE.prototype.plot = function (data, x, color) {
        var _a = this, defs = _a.defs, width = _a.width, height = _a.height;
        var bandwidth = this.kdeConfig.bandwidth;
        var plotCalls = this.state.plotCalls;
        var xScale = d3.scaleLinear()
            .domain(d3.extent(data, function (d) { return parseInt(d[x]); })).nice()
            .range([0, width]);
        this.state.xScale = xScale;
        var thresholds = xScale.ticks(50);
        this.state.thresholds = thresholds;
        var kernel = this.kde(this.epanechnikov(bandwidth), this.state.thresholds, data, x);
        kernel = this.normalize(kernel);
        var domain = [0, d3.max(kernel, function (d) { return d[1]; })];
        if (this.state.yScale) {
            domain = [0, d3.max([domain[1], this.state.yScale.domain()[1]])];
        }
        var yScale = d3.scaleLinear()
            .domain(domain)
            .range([height, 0]);
        this.state.yScale = yScale;
        this.svg.selectAll('.axes').remove();
        this.svg.append('g')
            .attr('class', 'axes')
            .attr('transform', "translate(0, " + height + ")")
            .call(d3.axisBottom(xScale));
        var yAxis = this.svg.append('g')
            .attr('class', 'axes')
            .call(d3.axisLeft(yScale));
        if (!this.isAutoAdjusted) {
            this.autoAdjust(yAxis);
            this.plot(data, x, color);
            return this;
        }
        this.addHorizontalGridlines(yScale);
        this.svg.append('g').append('path')
            .attr('d', d3.line().curve(d3.curveBasis).x(function (d) { return xScale(d[0]); }).y(function (d) { return yScale(d[1]); })(kernel))
            .attr('fill', 'none').attr('stroke', color);
        var area = d3.area()
            .curve(d3.curveBasis)
            .x0(function (d) { return xScale(d[0]); })
            .y0(height)
            .y1(function (d) { return yScale(d[1]); });
        var maskId = "auc-clip-" + this.selector.replace('#', '') + "-" + plotCalls;
        var mask = defs.append('clipPath')
            .attr('id', maskId)
            .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', height)
            .attr('fill', '#000');
        this.svg.append('path')
            .data([kernel])
            .attr('class', 'area')
            .attr('clip-path', "url(#" + maskId + ")")
            .attr('d', area)
            .attr('fill', color)
            .attr('opacity', 0.3);
        var text = this.svg.append('text')
            .style('opacity', 0)
            .style('color', '#000');
        this.svg.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'transparent')
            .on('mouseenter', function () {
            text.transition().duration(300).style('opacity', 1);
        })
            .on('mousemove', function () {
            if (plotCalls > 0) {
                return;
            }
            var _a = d3.mouse(this), x = _a[0], y = _a[1];
            mask.attr('width', x);
            var percentage = kernel
                .filter(function (d) {
                return xScale(d[0]) <= x;
            })
                .reduce(function (sum, d) { return sum + d[1]; }, 0);
            text
                .attr('x', x / 2)
                .attr('y', y)
                .text((percentage * 100).toFixed(1) + "%");
        })
            .on('mouseleave', function () {
            mask.transition().duration(1000).attr('width', width);
            text.transition().duration(300).style('opacity', 0);
        });
        this.state.plotCalls += 1;
        return this;
    };
    KDE.prototype.bandwidth = function (bandwidth) {
        this.kdeConfig.bandwidth = bandwidth;
        return this;
    };
    KDE.prototype.kde = function (kernel, thresholds, data, x) {
        return thresholds.map(function (t) { return [t, d3.mean(data, function (d) { return kernel(t - d[x]); })]; });
    };
    KDE.prototype.normalize = function (kde) {
        var total = d3.sum(kde, function (d) { return d[1]; });
        return kde.map(function (d) { return [d[0], d[1] / total]; });
    };
    KDE.prototype.epanechnikov = function (bandwidth) {
        return function (x) { return Math.abs(x /= bandwidth) <= 1 ? 0.75 * (1 - x * x) / bandwidth : 0; };
    };
    return KDE;
}(BaseChart_1["default"]));
exports["default"] = KDE;
