import * as d3 from 'd3';
import { ScaleLinear, ScaleQuantize } from 'd3';

class ColorBox {
    private size: [number, number];

    private colors: ScaleLinear<string, number> | ScaleQuantize<string>;

    private ticks: boolean;

    private isVertical: boolean = true;

    constructor(size: [number, number], colors: ScaleLinear<string, number> | ScaleQuantize<string>, ticks: boolean = false) {
        this.size = size;
        this.colors = colors;
        this.ticks = ticks;
    }

    create(sel: d3.Selection<SVGGElement, unknown, HTMLElement, any>) {
        const { size, colors, ticks, isVertical } = this;
        const [x0, x1] = d3.extent(colors.domain()) as [number, number];
        const bars = d3.range(x0, x1, (x1 - x0) / size[0]);

        const sc = d3.scaleLinear()
            .domain([x0, x1]).range([0, size[0]]);
       
        const lines = sel.selectAll('line').data(bars).enter()
            .append('line')
            .attr('stroke', colors);
        
        const container = sel.append('rect')
            .attr('fill', 'none').attr('stroke', 'black');

        if (isVertical) {
            lines
                .attr('x1', 0).attr('x2', size[1])
                .attr('y1', sc).attr('y2', sc)
            container.attr('width', size[1]).attr('height', size[0]);
        } else {
            lines
                .attr('x1', sc).attr('x2', sc)
                .attr('y1', 0).attr('y2', size[1]);
            container.attr('width', size[0]).attr('height', size[1])
        }

        if (ticks) {
            const tScale = d3.scaleLinear().domain(colors.domain()).range([0, size[0]]);
            sel.append('g')
                .call(isVertical ? d3.axisRight(tScale) : d3.axisBottom(tScale))
                .attr('transform',  isVertical ? `translate(${size[1]}, 0)` : `translate(0, ${size[1]})`);
        }
    }

    vertical(): this {
        this.isVertical = true;
        return this;
    }
}

export default ColorBox;