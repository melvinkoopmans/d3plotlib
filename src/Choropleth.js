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
var topojson = require("topojson-client");
var BaseChart_1 = require("./BaseChart");
var ColorBox_1 = require("./ColorBox");
var Choropleth = /** @class */ (function (_super) {
    __extends(Choropleth, _super);
    function Choropleth() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Choropleth.prototype.plot = function (data, dataAccessor, topology, topologyAccessor) {
        var _a = this, svg = _a.svg, width = _a.width, height = _a.height;
        var tooltip = this.config.tooltip;
        var projection = d3.geoMercator()
            .scale(1)
            .translate([0, 0]);
        var path = d3.geoPath().projection(projection);
        var l = topojson.feature(topology, topology.objects[topologyAccessor]), b = path.bounds(l), s = 1 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height), t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
        projection
            .scale(s)
            .translate(t);
        var values = [];
        data.forEach(function (d) { return values.push(d); });
        var domain = d3.extent(values);
        var color = d3.scaleQuantize()
            .domain(domain)
            .range(d3.schemeBlues[9]);
        // const paths = svg.append('g')
        //     .selectAll('path')
        //     .data((topojson.feature(topology, topology.objects[topologyAccessor]) as any).features)
        //     .enter()
        //     .append('path')
        //         .attr('fill', (d: any) => color(data.get(d.properties[dataAccessor]) || domain[0]))
        //         .attr('stroke', '#CCC')
        //         .attr('stroke-linejoin', 'round')
        //         .attr('stroke-width', 0.5)
        //         .attr('d', path);
        if (tooltip) {
            // paths
            //     .on('mouseover', tooltip.getOverHandler())
            //     .on('mouseleave', tooltip.getLeaveHandler())
            //     .on('mousemove', tooltip.getMoveHandler((d: any) => d.properties['GM_CODE']));
        }
        var colorBox = new ColorBox_1["default"]([200, 20], color, true)
            .vertical()
            .create(this.svg);
    };
    return Choropleth;
}(BaseChart_1["default"]));
exports["default"] = Choropleth;
