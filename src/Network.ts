import * as d3 from 'd3';
import { SimulationNodeDatum } from 'd3';

interface Node extends SimulationNodeDatum {
    id: string;
    [key: string]: unknown;
}

interface Edge extends SimulationNodeDatum {
    source: string | Node;
    target: string | Node;
}

interface SimulationEdge extends SimulationNodeDatum {
    source: Node;
    target: Node;
}

export interface NetworkStruct {
    nodes: Node[],
    edges: Edge[],
}

class Network {
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

    plot(network: NetworkStruct) {
        const { svg, width, height } = this;
        const scaleC = d3.scaleOrdinal<string>(d3.schemePastel1);

        d3.shuffle(network.nodes);
        d3.shuffle(network.edges);

        const simulation = d3.forceSimulation<Node, Edge>(network.nodes)
            .force('link', d3.forceLink<Node, Edge>(network.edges).id((d) => d.id))
            .force('charge', d3.forceManyBody())
            .force('center', d3.forceCenter(width / 2, height / 2));

        const edges = svg.selectAll('line').data<SimulationEdge>(network.edges as SimulationEdge[]).enter()
            .append('line').attr('stroke', '#000')
            .attr('x1', (d) => d.source.x!)
            .attr('y1', (d) => d.source.y!)
            .attr('x2', (d) => d.target.x!)
            .attr('y2', (d) => d.target.y!);

        const nodes = svg.selectAll('circle').data(network.nodes).enter()
            .append('circle')
            .attr('r', 10).attr('fill', (d, i) => scaleC(i as any))
            .attr('cx', (d) => d.x!).attr('cy', (d) => d.y!)
            .call(this.drag(simulation));

        const labels = svg.selectAll('text').data(network.nodes).enter()
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('font-size', 10)
            .text((d) => d.id);

        simulation.on('tick', () => {
            edges
                .attr('x1', (d: SimulationEdge) => d.source.x!)
                .attr('y1', (d: SimulationEdge) => d.source.y!)
                .attr('x2', (d: SimulationEdge) => d.target.x!)
                .attr('y2', (d: SimulationEdge) => d.target.y!);
        
            nodes
                .attr('cx', (d) => d.x!)
                .attr('cy', (d) => d.y!);

            labels.attr('x', (d) => d.x!).attr('y', (d) => d.y! + 4)
        });
    }

    drag(simulation: d3.Simulation<Node, Edge>) {
        return d3.drag<SVGCircleElement, Node>()
            .on('start', (d: Node) => {
                if (!d3.event.active) {
                    simulation.alphaTarget(0.3).restart();
                }
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (d: Node) => {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            })
            .on('end', (d: Node) => {
                if (!d3.event.active) {
                    simulation.alphaTarget(0);
                }
                d.fx = null;
                d.fy = null;
            });
    }
} 

export default Network;