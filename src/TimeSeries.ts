import * as d3 from 'd3';
import BaseChart from './BaseChart';
import { axisBottom, ScaleLinear } from 'd3';

type DataPoint = [string, number]; 

type TimePoint = {
    timestamp: Date, 
    value: number, 
}

type TimePair = {
    src: TimePoint,
    dst: TimePoint,
}

type Range = [number, number];

class TimeSeries extends BaseChart {
    seriesConfig: {
        scaleT: d3.ScaleTime<number, number> | null,
        scaleY: d3.ScaleLinear<number, number> | null,
        xAxis: d3.Selection<SVGGElement, unknown, HTMLElement, any> | null,
        yAxis: d3.Selection<SVGGElement, unknown, HTMLElement, any> | null,
        series: d3.Selection<SVGLineElement, {
            src: TimePoint,
            dst: TimePoint,
        }, SVGGElement, unknown> | null,
        range: Range | null,
        color: ScaleLinear<string, number> | null
    } = {
        scaleT: null,
        scaleY: null,
        xAxis: null,
        yAxis: null,
        series: null,
        range: null,
        color: null,
    }

    data: {
        timestamp: Date,
        value: number
    }[] = [];

    plot(series: DataPoint[]): TimeSeries {
        const { svg, width, height } = this;
        
        const parse = d3.utcParse('%H:%M:%S');
        const format = d3.utcFormat('%H:%M');

        let data = series.map((d) => ({
            timestamp: parse(d[0]) as Date, 
            value: d[1], 
        }));
        this.data = data;

        const scaleT = d3.scaleTime()
            .domain(d3.extent(data, (d) => d.timestamp) as [Date, Date]).nice()
            .range([0, width]);
        this.seriesConfig.scaleT = scaleT;

        const scaleY = d3.scaleLinear()
            .domain(this.seriesConfig.range || d3.extent(data, (d) => d.value) as [number, number])
            .range([height, 0]);
        this.seriesConfig.scaleY = scaleY;

        this.seriesConfig.color = d3.scaleLinear<string, number>()
            .domain(this.seriesConfig.range || d3.extent(data, (d) => d.value) as [number, number])
            .range([d3.schemeRdYlGn.flat().reverse()[0], d3.schemeRdYlGn.flat()[0]]);

        console.log(this.seriesConfig.color(100));

        const pairs = d3.pairs(data, (a, b) => ({
            src: a, dst: b
        }));

        this.seriesConfig.series = svg.append('g').attr('class', 'series')
            .selectAll('line').data(pairs).enter().append('line')
            .attr('x1', d => scaleT(d.src.timestamp))
            .attr('x2', (d) => scaleT(d.dst.timestamp))
            .attr('y1', (d) => scaleY(d.src.value))
            .attr('y2', (d) => scaleY(d.dst.value))
            .attr('stroke', (d) => this.seriesConfig.color!(d.dst.value))

        this.seriesConfig.xAxis = svg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(scaleT).tickFormat(format as any).ticks(8));

        this.seriesConfig.yAxis = svg.append('g')
            .call(d3.axisLeft(scaleY));

        return this;
    }

    add(point: DataPoint) {
        const { scaleT, scaleY, series } = this.seriesConfig;

        if (!scaleT || !scaleY || !series) {
            return;
        }

        const parse = d3.utcParse('%H:%M:%S');
        const format = d3.utcFormat('%H:%M');

        const data = {
            timestamp: parse(point[0]) as Date, 
            value: point[1], 
        }
        this.data.push(data);

        this.seriesConfig.scaleT!.domain(d3.extent(this.data, (d) => d.timestamp) as [Date, Date])
        this.seriesConfig.xAxis
            ?.transition()
            .duration(1000)
            .call(d3.axisBottom(scaleT).tickFormat(format as any).ticks(5));

        if (!this.seriesConfig.range) {
            this.seriesConfig.scaleY!.domain(d3.extent(this.data, (d) => d.value) as [number, number]);
            this.seriesConfig.yAxis 
                ?.transition()
                .duration(1000)
                .call(d3.axisLeft(scaleY));
        }

        const pairs = d3.pairs(this.data, (a, b) => ({
            src: a, dst: b
        }));

        const lines = this.seriesConfig.series!.data(pairs);
        lines.exit().remove();

        lines.transition().duration(1000)
            .attr('x1', (d: TimePair) => this.seriesConfig.scaleT!(d.src.timestamp))
            .attr('x2', (d: TimePair) => this.seriesConfig.scaleT!(d.dst.timestamp))
            .attr('y1', (d: TimePair) => this.seriesConfig.scaleY!(d.src.value))
            .attr('y2', (d: TimePair) => this.seriesConfig.scaleY!(d.dst.value))
            .attr('stroke', (d) => this.seriesConfig.color!(d.dst.value))

        const linesEnter = lines.enter()
            .append('line')
            .attr('x1', (d: TimePair) => this.seriesConfig.scaleT!(d.src.timestamp))
            .attr('x2', (d: TimePair) => this.seriesConfig.scaleT!(d.src.timestamp))
            .attr('y1', (d: TimePair) => this.seriesConfig.scaleY!(d.src.value))
            .attr('y2', (d: TimePair) => this.seriesConfig.scaleY!(d.src.value))
            .attr('stroke', (d) => this.seriesConfig.color!(d.dst.value))
           
        linesEnter.transition().delay(1000).duration(1000)
            .attr('x2', (d: TimePair) => this.seriesConfig.scaleT!(d.dst.timestamp))
            .attr('y2', (d: TimePair) => this.seriesConfig.scaleY!(d.dst.value))

        this.seriesConfig.series = linesEnter.merge(lines);
    }

    range(range: Range): TimeSeries {
        this.seriesConfig.range = range;
        return this;
    }
}

export default TimeSeries;