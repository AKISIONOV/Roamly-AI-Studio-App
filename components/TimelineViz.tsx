import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface TimelineVizProps {
  count: number;
  activeIndex?: number;
}

// A subtle visual component that draws a connecting line next to the itinerary
export const TimelineViz: React.FC<TimelineVizProps> = ({ count, activeIndex = -1 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || count === 0) return;

    const svg = d3.select(svgRef.current);
    const width = 40;
    const itemHeight = 120; // Approximate height of an itinerary card
    const height = count * itemHeight;

    svg.attr("width", width).attr("height", height);
    svg.selectAll("*").remove();

    // Define data points centered vertically for each item
    const data = Array.from({ length: count }, (_, i) => ({
      y: i * itemHeight + (itemHeight / 2),
      active: i === activeIndex
    }));

    // Draw the path
    const lineGenerator = d3.line<{ y: number }>()
      .x(() => width / 2)
      .y(d => d.y)
      .curve(d3.curveMonotoneY);

    svg.append("path")
      .datum(data)
      .attr("d", lineGenerator)
      .attr("fill", "none")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4 4");

    // Draw nodes
    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", width / 2)
      .attr("cy", d => d.y)
      .attr("r", 6)
      .attr("fill", d => d.active ? "#10b981" : "#fff")
      .attr("stroke", d => d.active ? "#10b981" : "#cbd5e1")
      .attr("stroke-width", 2)
      .transition()
      .duration(500)
      .attr("r", d => d.active ? 8 : 6);

  }, [count, activeIndex]);

  return (
    <div className="absolute left-0 top-16 bottom-0 w-10 hidden md:block" style={{ height: `${count * 120}px` }}>
        <svg ref={svgRef} className="overflow-visible" />
    </div>
  );
};
