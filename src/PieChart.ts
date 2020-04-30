import * as d3 from 'd3';

class PieChart {
    protected svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;

    protected selector: string;

    protected width: number;

    protected height: number;

    constructor(selector: string, width: number, height: number) {
        this.selector = selector;
        this.width = width;
        this.height = height;

        this.svg = d3.select(selector)
            .append('svg')
            .attr('width', width)
            .attr('height', height);
    }

    plot(data: any, category: string, value: string) {
        const { width, height } = this;
        const pie = d3.pie()
            .value((d: any) => d[value])
            .sort(null)
            .padAngle(0.02)
            .startAngle(0)
            .endAngle(2*Math.PI)
            (data)

        const arc = d3.arc().innerRadius(0).outerRadius(width / 2).cornerRadius(0);

        const color = d3.scaleOrdinal(d3.schemeTableau10)
            .domain(pie.map((d: any) => d.index));

        const g = this.svg
            .append('g').attr('transform', `translate(${width / 2}, ${height / 2})`)
        
        g.selectAll('path').data(pie).enter().append('path')
            .attr('fill', (d: any) => color(d.index))
            .attr('stroke', '#DDD')
            .transition().duration(1300).ease(d3.easeCubicInOut)
            .attrTween('d', function(d: any) {
                var i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);

                return function(t: number) {
                    return arc(i(t))!;
                }
            }); 

        g.selectAll('text').data(pie).enter().append('text')
            .text((d: any) => d.data[category])
            .attr('x', (d: any) => arc.innerRadius(this.width / 5).centroid(d)[0])
            .attr('y', (d: any) => arc.innerRadius(this.width / 5).centroid(d)[1])
            .attr('font-size', 14)
            .attr('text-anchor', 'middle');
    }
} 

export default PieChart;