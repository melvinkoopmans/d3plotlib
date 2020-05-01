import * as d3 from 'd3';
import { ScaleLinear } from 'd3';

class ColorBox {
    private size: [number, number];

    private colors: ScaleLinear<string, number>;

    private ticks: boolean;

    constructor(size: [number, number], colors: ScaleLinear<string, number>, ticks: boolean = false) {
        this.size = size;
        this.colors = colors;
        this.ticks = ticks;
    }

    create(sel: d3.Selection<SVGGElement, unknown, HTMLElement, any>) {
        const { size, colors, ticks } = this;
        const [x0, x1] = d3.extent(colors.domain()) as [number, number];
        const bars = d3.range(x0, x1, (x1 - x0) / size[0]);

        const sc = d3.scaleLinear()
            .domain([x0, x1]).range([0, size[0]]);
        
        sel.selectAll('line').data(bars).enter().append('line')
            .attr('x1', sc).attr('x2', sc)
            .attr('y1', 0).attr('y2', size[1])
            .attr('stroke', colors);

        sel.append('rect')
            .attr('width', size[0]).attr('height', size[1])
            .attr('fill', 'none').attr('stroke', 'black');

        if (ticks) {
            const tScale = d3.scaleLinear().domain(colors.domain()).range([0, size[0]])
            sel.append('g').call(d3.axisBottom(tScale))
                .attr('transform',  `translate(0, ${size[1]})`);
        }
    }
}

export default ColorBox;