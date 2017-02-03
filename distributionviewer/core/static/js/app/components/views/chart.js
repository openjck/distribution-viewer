import React from 'react';

import Fetching from './fetching';
import ChartAxisContainer from '../containers/chart-axis-container';
import ChartLineContainer from '../containers/chart-line-container';
import ChartHoverContainer from '../containers/chart-hover-container';
import ChartFocus from './chart-focus';


/**
 * Move the "All" population to be the last element of the array.
 *
 * In SVG, the element with the greatest "z-index" is the element that appears
 * last in the markup. We want the "All" population line to appear above all
 * other population lines when they overlap, so we need the "All" population to
 * be the last element in the array.
 */
function makeAllPopulationLast(populations) {
  let all = [];

  const reorderedPopulations = populations.filter(currentPopulation => {
    if (currentPopulation.population === 'All') {
      all = currentPopulation;
      return false;
    } else {
      return true;
    }
  });

  reorderedPopulations.push(all);

  return reorderedPopulations;
}

export default function(props) {
  if (props.isFetching) {
    return (
      <div className={`chart is-fetching chart-${props.metricId}`}>
        <Fetching />
      </div>
    );
  } else {
    return (
      <div className={`chart chart-${props.metricId}`}>
        <div className={props.tooltip ? 'tooltip-wrapper' : ''}>
          <h2 className={`chart-list-name ${props.tooltip ? 'tooltip-hover-target' : ''}`}>{props.name}</h2>
          {props.tooltip}
        </div>
        <svg width={props.size.width} height={props.size.height}>
          <g transform={props.size.transform}>
            <ChartAxisContainer
              metricId={props.metricId}
              metricType={props.metricType}
              scale={props.xScale}
              axisType="x"
              refLabels={props.refLabels}
              size={props.size.innerHeight}
            />
            <ChartAxisContainer
              metricId={props.metricId}
              scale={props.yScale}
              axisType="y"
              refLabels={props.refLabels}
              size={props.size.innerWidth}
            />
            {makeAllPopulationLast(props.populations).map((population, index) => {
              let popOrdinal = index + 1;
              return (
                <g key={index} className={`population population-${popOrdinal}`}>
                  <ChartLineContainer
                    metricId={props.metricId}
                    popOrdinal={popOrdinal}
                    className="chart-line"

                    xScale={props.xScale}
                    yScale={props.yScale}
                    data={population.points}
                  />
                  <ChartFocus />
                </g>
              );
            })}
            <ChartHoverContainer
              metricId={props.metricId}

              size={props.size}
              hoverString={props.hoverString}
              refLabels={props.refLabels}
              metricType={props.metricType}

              xScale={props.xScale}
              yScale={props.yScale}
              populations={props.populations}
            />
          </g>
        </svg>
      </div>
    );
  }
}
