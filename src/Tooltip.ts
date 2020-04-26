import * as d3 from 'd3';

type TooltipMouseEvent = (this: SVGRectElement, d: unknown) => void;

export type TooltipFormatter = (d: unknown) => string;

class Tooltip {
    private selector: string;

    private tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;

    private formatter: TooltipFormatter | null;

    constructor(selector: string, formatter: TooltipFormatter | null) {
        this.selector = selector;

        this.tooltip = d3.select(selector).append('div')
            .style('opacity', 0)
            .style('position', 'absolute')
            .attr('class', 'tooltip')
            .style('background', '#FFF')
            .style('padding', '5px');

        this.formatter = formatter;
    }

    getLeaveHandler(): TooltipMouseEvent {
        const tooltip = this.tooltip;

        return function(this: SVGRectElement, d: unknown) {
            tooltip.style('opacity', 0);
        }; 
    }

    getOverHandler(): TooltipMouseEvent {
        const tooltip = this.tooltip;

        return function(this: SVGRectElement, d: unknown) {
            tooltip.style('opacity', 1);
        };
    }

    getMoveHandler(defaultFormatter: TooltipFormatter): TooltipMouseEvent {
        const { tooltip, selector } = this;
        const formatter = this.formatter || defaultFormatter;

        return function(this: SVGRectElement, d: unknown) {
            const bounds = document.querySelector(selector)!.getBoundingClientRect();
            const x = d3.event.pageX - bounds.x;
            const y = d3.event.pageY - bounds.y;

            tooltip
                .html(formatter(d))
                .style('left', `${x + 20}px`)
                .style('top', `${y - 20}px`);
        };
    }
}

export default Tooltip;