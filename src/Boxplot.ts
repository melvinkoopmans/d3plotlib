import * as d3 from 'd3';

class Boxplot {
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

    plot(data: any, variables: [] | string) {
        
    }
}

export default Boxplot;