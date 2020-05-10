import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import BaseChart from './BaseChart';

class Choropleth extends BaseChart {
    plot(data: Map<string, number>, topology: any, accessor: string) {
        const { svg, width, height } = this;

        svg.append('g')
            .attr('transform', `translate(${height},0)`);
            // .append(() => legend({color, title: data.title, width: 260}));

        const projection = d3.geoMercator()
            .scale(1)
            .translate([0, 0]);

        const path = d3.geoPath().projection(projection);

        const l = topojson.feature(topology, topology.objects[accessor]),
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

        svg.append('g')
            .selectAll('path')
            .data(topojson.feature(topology, topology.objects[accessor]).features)
            .enter()
            .append('path')
                .attr('fill', (d: any) => {
                    return color(data.get(d.properties['GM_CODE']) || domain[0]);
                })
                .attr('stroke', '#CCC')
                .attr('stroke-linejoin', 'round')
                .attr('stroke-width', 0.5)
                .attr('d', path);
            // .append('title")
            // .text(d => `${d.properties.name}, ${states.get(d.id.slice(0, 2)).name}
            // ${format(data.get(d.id))}`);

        // svg.append('path')
        //     .datum(topojson.mesh(topology, topology.objects.states, (a, b) => a !== b))
        //     .attr('fill', 'none')
        //     .attr('stroke', 'white')
        //     .attr('stroke-linejoin', 'round')
        //     .attr('d', path);
    }
}

export default Choropleth;