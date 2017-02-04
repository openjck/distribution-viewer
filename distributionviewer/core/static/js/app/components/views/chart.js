import React from 'react';

import Fetching from './fetching';
import ChartAxisContainer from '../containers/chart-axis-container';
import ChartLineContainer from '../containers/chart-line-container';
import ChartHoverContainer from '../containers/chart-hover-container';
import ChartFocus from './chart-focus';


let populationNumber = 0;

function renderPopulations(props, populationData) {
  let rendering = '';

  for (let populationName in populationData) {
    if (populationData.hasOwnProperty(populationName)) {

      const currentPopulation = populationData[populationName];
      populationNumber += 1;

      rendering += (
        <g className={`population population-${populationNumber}`}>
          <ChartLineContainer
            popNumber={populationNumber}
            metricId={props.metricId}
            xScale={props.xScale}
            yScale={props.yScale}
            data={props.shouldShowOutliers ? currentPopulation.all : currentPopulation.excludingOutliers}
          />
          <ChartFocus />
        </g>
      );
    }
  }

  return rendering;
}

export default function(props) {
  if (props.isFetching) {
    return (
      <div className={`chart is-fetching chart-${props.metricId}`}>
        <Fetching />
      </div>
    );
  } else {
    const pdOnlyAll = {'All': props.populationData['All']};
    const pdExcludingAll = props.populationData;
    delete pdExcludingAll['All'];

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
            <g className="populations">
              {/*
              In SVG, the elemenet that appears last in the markup has the
              greatest "z-index". We want the "All" population to appear above
              other populations when they overlap, so we need to render it last.
              */}
              {renderPopulations(props, pdExcludingAll)}
              {renderPopulations(props, pdOnlyAll)}
            </g>
            <ChartHoverContainer
              metricId={props.metricId}
              size={props.size}
              xScale={props.xScale}
              yScale={props.yScale}
              hoverString={props.hoverString}
              refLabels={props.refLabels}
              metricType={props.metricType}
            />
          </g>
        </svg>
      </div>
    );
  }
}
