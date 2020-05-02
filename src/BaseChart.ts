import * as d3 from 'd3';
import Tooltip, { TooltipFormatter } from './Tooltip';

abstract class BaseChart {
    protected svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

    protected defs: d3.Selection<SVGDefsElement, unknown, HTMLElement, any>;

    protected selector: string;

    protected width: number;

    protected height: number;

    protected config: {
        yLabel: string | null,
        xLabel: string | null,
        colors: string[],
        margin: {
            top: number,
            right: number,
            bottom: number,
            left: number
        },
        tooltip: Tooltip | null,
    } = {
        yLabel: null,
        xLabel: null,
        colors: [],
        margin: {
            top: 10,
            right: 30,
            bottom: 20,
            left: 60,
        },
        tooltip: null,
    }

    protected isAutoAdjusted: boolean = false;

    constructor(selector: string, width: number, height: number) {
        this.selector = selector;
        this.width = width;
        this.height = height;

        this.svg = this.buildSvg();
    }

    colors(colors: string[]): this {
        this.config.colors = colors;
        return this;
    }

    yLabel(label: string): this {
        this.config.yLabel = label;
        return this;
    }

    xLabel(label: string): this {
        this.config.xLabel = label;
        return this;
    }

    tooltip(formatter: TooltipFormatter | null = null): this {
        this.config.tooltip = new Tooltip(this.selector, formatter);
        return this;
    }

    protected buildSvg(): d3.Selection<SVGGElement, unknown, HTMLElement, any> {
        const { margin, yLabel, xLabel } = this.config;
        const { selector, width, height } = this;

        d3.select(selector).select('svg').remove();

        if (xLabel) {
            this.config.margin.bottom += 17;
        }

        const svg = d3.select(selector)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        this.defs = svg.append('defs');

        const svgG = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        if (yLabel) {
            svgG.append('text')
                .text(yLabel)
                .attr('transform', 'rotate(-90)')
                .attr('y', 0 - margin.left)
                .attr('x', 0 - (height / 2))
                .attr('dy', '12px')
                .attr('font-size', '12px')
                .style('text-anchor', 'middle');
        }
        

        if (xLabel) {
            svgG.append('text')
                .text(xLabel)
                .attr('y', this.height + 17)
                .attr('x', width / 2)
                .attr('dy', '12px')
                .attr('font-size', '12px')
                .style('text-anchor', 'middle');
        }

        return svgG;
    }

    protected getTooltip(): Tooltip | null {
        return this.config.tooltip;
    }

    protected autoAdjust(yAxis: d3.Selection<SVGGElement, unknown, HTMLElement, any>, side: 'left' | 'right' = 'left') {
        const { margin, yLabel } = this.config;

        const yLabelsMaxWidth = parseInt(
            d3.max(yAxis.selectAll('g').nodes()
                .map((node: any) => node.getBoundingClientRect().width)
            ));

        const indent = yLabelsMaxWidth - (side === 'left' ? margin.left : margin.right) + (yLabel ? 20 : 0);

        this.width -= indent;

        if (side === 'left') {
            this.config.margin.left += indent;
        } else {
            this.config.margin.right += indent;
        }
        this.isAutoAdjusted = true;
        this.svg = this.buildSvg();
    }

    protected addHorizontalGridlines(yScale: d3.AxisScale<d3.AxisDomain>) {
        let g = this.svg.select<SVGGElement>('.grid');
        const yAxis = d3.axisLeft(yScale);
            
        if (g.nodes().length === 0) {
            g = this.svg.append('g')			
                .attr('class', 'grid')
                .call(yAxis.tickSize(-this.width).tickFormat(() => ''));    
        }

        g.selectAll('line')
            .attr('transform', 'translate(1, 0)')
            .attr('stroke', '#DDD')
            .attr('stroke-dasharray', '2,2');

        g.selectAll('.tick:first-of-type line').remove();
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

    protected getColorScheme(domain: (string | number)[]) {
        return d3.scaleOrdinal<string | number, string>()
            .domain(domain)
            .range(this.config.colors);
    }
}

export default BaseChart;