import * as d3 from 'd3';

abstract class Baseplot {
    protected svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

    protected width: number;

    protected height: number;

    protected config: {
        yLabel: string | null,
        colors: string[],
        margin: {
            top: number,
            right: number,
            bottom: number,
            left: number
        },
    } = {
        yLabel: null,
        colors: [],
        margin: {
            top: 10,
            right: 30,
            bottom: 20,
            left: 60,
        },
    }

    constructor(selector: string, width: number, height: number) {
        const { margin } = this.config;

        this.svg = d3.select(selector)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        this.width = width;
        this.height = height;
    }

    colors(colors: string[]): this {
        this.config.colors = colors;
        return this;
    }

    protected addHorizontalGridlines(yScale: d3.AxisScale<d3.AxisDomain>) {
        const yAxis = d3.axisLeft(yScale);
        const g = this.svg.append('g')			
            .attr('class', 'grid')
            .call(yAxis.tickSize(-this.width).tickFormat(() => ''));


        g.selectAll('line')
            .attr('transform', 'translate(1, 0)')
            .attr('stroke', '#DDD');

        g.selectAll('path').remove();
    }

    protected addVerticalGridlines(xScale: d3.AxisScale<d3.AxisDomain>, xAccessor: string) {
        const xAxis = d3.axisBottom(xScale);
        const g = this.svg.append('g')
            .attr('class', 'grid')
            .call(xAxis.tickSize(this.height).tickFormat(() => ''));

        g.selectAll('line')
            .attr('x', (d: any) => xScale(d[xAccessor!])!)
            .attr('stroke', '#DDD')
        
        g.selectAll('.tick:first-of-type').remove();

        g.selectAll('path').remove();
    }

    protected getColorScheme(domain: string[]) {
        return d3.scaleOrdinal<string, string>()
            .domain(domain)
            .range(this.config.colors);
    }
}

export default Baseplot;