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
var TimeSeries = /** @class */ (function (_super) {
    __extends(TimeSeries, _super);
    function TimeSeries() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.seriesConfig = {
            scaleT: null,
            scaleY: null,
            xAxis: null,
            yAxis: null,
            series: null,
            range: null,
            color: null
        };
        _this.data = [];
        return _this;
    }
    TimeSeries.prototype.plot = function (series) {
        var _this = this;
        var _a = this, svg = _a.svg, width = _a.width, height = _a.height;
        var parse = d3.utcParse('%H:%M:%S');
        var format = d3.utcFormat('%H:%M');
        var data = series.map(function (d) { return ({
            timestamp: parse(d[0]),
            value: d[1]
        }); });
        this.data = data;
        var scaleT = d3.scaleTime()
            .domain(d3.extent(data, function (d) { return d.timestamp; })).nice()
            .range([0, width]);
        this.seriesConfig.scaleT = scaleT;
        var scaleY = d3.scaleLinear()
            .domain(this.seriesConfig.range || d3.extent(data, function (d) { return d.value; }))
            .range([height, 0]);
        this.seriesConfig.scaleY = scaleY;
        this.seriesConfig.color = d3.scaleLinear()
            .domain(this.seriesConfig.range || d3.extent(data, function (d) { return d.value; }))
            .range([d3.schemeRdYlGn.flat().reverse()[0], d3.schemeRdYlGn.flat()[0]]);
        console.log(this.seriesConfig.color(100));
        var pairs = d3.pairs(data, function (a, b) { return ({
            src: a, dst: b
        }); });
        this.seriesConfig.series = svg.append('g').attr('class', 'series')
            .selectAll('line').data(pairs).enter().append('line')
            .attr('x1', function (d) { return scaleT(d.src.timestamp); })
            .attr('x2', function (d) { return scaleT(d.dst.timestamp); })
            .attr('y1', function (d) { return scaleY(d.src.value); })
            .attr('y2', function (d) { return scaleY(d.dst.value); })
            .attr('stroke', function (d) { return _this.seriesConfig.color(d.dst.value); });
        this.seriesConfig.xAxis = svg.append('g')
            .attr('transform', "translate(0, " + height + ")")
            .call(d3.axisBottom(scaleT).tickFormat(format).ticks(8));
        this.seriesConfig.yAxis = svg.append('g')
            .call(d3.axisLeft(scaleY));
        return this;
    };
    TimeSeries.prototype.add = function (point) {
        var _this = this;
        var _a, _b;
        var _c = this.seriesConfig, scaleT = _c.scaleT, scaleY = _c.scaleY, series = _c.series;
        if (!scaleT || !scaleY || !series) {
            return;
        }
        var parse = d3.utcParse('%H:%M:%S');
        var format = d3.utcFormat('%H:%M');
        var data = {
            timestamp: parse(point[0]),
            value: point[1]
        };
        this.data.push(data);
        this.seriesConfig.scaleT.domain(d3.extent(this.data, function (d) { return d.timestamp; }));
        (_a = this.seriesConfig.xAxis) === null || _a === void 0 ? void 0 : _a.transition().duration(1000).call(d3.axisBottom(scaleT).tickFormat(format).ticks(5));
        if (!this.seriesConfig.range) {
            this.seriesConfig.scaleY.domain(d3.extent(this.data, function (d) { return d.value; }));
            (_b = this.seriesConfig.yAxis) === null || _b === void 0 ? void 0 : _b.transition().duration(1000).call(d3.axisLeft(scaleY));
        }
        var pairs = d3.pairs(this.data, function (a, b) { return ({
            src: a, dst: b
        }); });
        var lines = this.seriesConfig.series.data(pairs);
        lines.exit().remove();
        lines.transition().duration(1000)
            .attr('x1', function (d) { return _this.seriesConfig.scaleT(d.src.timestamp); })
            .attr('x2', function (d) { return _this.seriesConfig.scaleT(d.dst.timestamp); })
            .attr('y1', function (d) { return _this.seriesConfig.scaleY(d.src.value); })
            .attr('y2', function (d) { return _this.seriesConfig.scaleY(d.dst.value); })
            .attr('stroke', function (d) { return _this.seriesConfig.color(d.dst.value); });
        var linesEnter = lines.enter()
            .append('line')
            .attr('x1', function (d) { return _this.seriesConfig.scaleT(d.src.timestamp); })
            .attr('x2', function (d) { return _this.seriesConfig.scaleT(d.src.timestamp); })
            .attr('y1', function (d) { return _this.seriesConfig.scaleY(d.src.value); })
            .attr('y2', function (d) { return _this.seriesConfig.scaleY(d.src.value); })
            .attr('stroke', function (d) { return _this.seriesConfig.color(d.dst.value); });
        linesEnter.transition().delay(1000).duration(1000)
            .attr('x2', function (d) { return _this.seriesConfig.scaleT(d.dst.timestamp); })
            .attr('y2', function (d) { return _this.seriesConfig.scaleY(d.dst.value); });
        this.seriesConfig.series = linesEnter.merge(lines);
    };
    TimeSeries.prototype.range = function (range) {
        this.seriesConfig.range = range;
        return this;
    };
    return TimeSeries;
}(BaseChart_1["default"]));
exports["default"] = TimeSeries;
