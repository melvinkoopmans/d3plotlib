import * as d3 from 'd3';

type TooltipMouseEvent = (this: SVGRectElement, d: unknown) => void;

export type TooltipFormatter = (d: unknown) => string;

class Tooltip {
    private tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;

    private formatter: TooltipFormatter;

    constructor(selector: string, formatter: TooltipFormatter) {
        this.tooltip = d3.select(selector).append('div')
            .style('opacity', 0)
            .style('position', 'absolute')
            .attr('class', 'tooltip')
            .style('background', '#FFF')
            .style('padding', '5px')
            .html('text');

        this.formatter = formatter;
    }

    getLeaveHandler(): TooltipMouseEvent {
        const tooltip = this.tooltip;

        return function(this: SVGRectElement, d: unknown) {
            tooltip.style('opacity', 0);
            d3.select(this).attr('stroke', null);
        }; 
    }

    getOverHandler(): TooltipMouseEvent {
        const tooltip = this.tooltip;

        return function(this: SVGRectElement, d: unknown) {
            tooltip.style('opacity', 1);
            d3.select(this).attr('stroke', '#000')
        };
    }

    getMoveHandler(): TooltipMouseEvent {
        const { tooltip, formatter } = this;

        return function(this: SVGRectElement, d: unknown) {
            tooltip
                .html(formatter(d))
                .style('left', `${d3.mouse(this)[0] + 15}px`)
                .style('top', `${d3.mouse(this)[1]}px`);
        };
    }
}

export default Tooltip;