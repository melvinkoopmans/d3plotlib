import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import BaseChart from './BaseChart';
import ColorBox from './ColorBox';

class Choropleth extends BaseChart {
    plot(data: Map<string, number>, dataAccessor: string, topology: any, topologyAccessor: string) {
        const { svg, width, height } = this;
        const { tooltip } = this.config;

        const projection = d3.geoMercator()
            .scale(1)
            .translate([0, 0]);

        const path = d3.geoPath().projection(projection);

        const l = topojson.feature(topology, topology.objects[topologyAccessor]),
            b = path.bounds(l),
            s = 1 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
            t: [number, number] = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

        projection
            .scale(s)
            .translate(t);

        const values: number[] = [];
        data.forEach((d) => values.push(d));
        const domain = d3.extent(values) as [number, number];
        
        const color = d3.scaleQuantize<string>()
            .domain(domain)
            .range(d3.schemeBlues[9]);

        const paths = svg.append('g')
            .selectAll('path')
            .data(topojson.feature(topology, topology.objects[topologyAccessor]).features)
            .enter()
            .append('path')
                .attr('fill', (d: any) => color(data.get(d.properties[dataAccessor]) || domain[0]))
                .attr('stroke', '#CCC')
                .attr('stroke-linejoin', 'round')
                .attr('stroke-width', 0.5)
                .attr('d', path);

        if (tooltip) {
            paths
                .on('mouseover', tooltip.getOverHandler())
                .on('mouseleave', tooltip.getLeaveHandler())
                .on('mousemove', tooltip.getMoveHandler((d: any) => d.properties['GM_CODE']));
        }

        const colorBox = new ColorBox([200, 20], color, true)
            .create(this.svg);
    }
}

export default Choropleth;