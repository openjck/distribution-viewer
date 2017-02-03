import React from 'react';
import { connect } from 'react-redux';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';

import Chart from '../views/chart';
import * as metricApi from '../../api/metric-api';
import { debounce } from '../../utils';


class ChartContainer extends React.Component {
  constructor(props) {
    super(props);

    this.margin = {top: 20, right: 20, bottom: 30, left: 40};
    this.height = props.isDetail ? 600 : 250;

    this.state = {size: {
      height: this.height,
      innerHeight: this.height - this.margin.top - this.margin.bottom,
      transform: `translate(${this.margin.left}, ${this.margin.top})`,
    }};

    this.handleResize = debounce(() => this._setWidth(this.props));
    this.hasBeenInitialized = false;

    this._setWidth = this._setWidth.bind(this);
  }

  componentDidMount() {
    // Always show the "All" population
    const populationsToShow = this.props.whitelistedPopulations ? this.props.whitelistedPopulations.concat(['All']) : ['All'];

    metricApi.getMetric(this.props.metricId, populationsToShow);

    if (this.props.isDetail) {
      this.chartDetail = document.getElementById('chart-detail');
    }
  }

  componentWillReceiveProps(nextProps) {
    // If the metric data just came through, initialize the chart before the
    // next render occuurs.
    if (!this.hasBeenInitialized && nextProps.metric) {
      this._initialize(nextProps);
    }
  }

  componentDidUpdate(prevProps) {
    const showOutliers = this.props.showOutliers;
    const outliersSettingChanged = showOutliers !== prevProps.showOutliers;
    const selectedScaleChanged = this.props.selectedScale !== prevProps.selectedScale;

    // If the outliers setting changed, update the active data accordingly.
    // Check against false explicitly because props are sometimes undefined.
    if (outliersSettingChanged) {
      if (showOutliers) {
        this.activeData = this.allData;
      } else if (showOutliers === false) {
        this.activeData = this.dataExcludingOutliers;
      }
    }

    // If either the outliers setting or the selected scale has changed, the
    // x-axis will need to show different ticks and thus needs to be
    // regenerated.
    if (outliersSettingChanged || selectedScaleChanged) {
      this.setState({xScale: this._getXScale(this.props, this.state.size.innerWidth)});
    }
  }

  _initialize(props) {
    const outlierThreshold = 100;

    this.allData = this._getFormattedData(props.metric.populations);

    // The number of data points that the biggest population has. For example,
    // if one population has 5 data points, another has 35, and another has 10,
    // this will be equal to 35.
    const biggestPopulationLength = Math.max(...this.allData.map(p => p.points.length));

    if (props.metric.type === 'numeric' && biggestPopulationLength > outlierThreshold) {
      this.dataExcludingOutliers = this._removeOutliers(this.allData);
      this.activeData = props.showOutliers ? this.allData : this.dataExcludingOutliers;
    } else {
      this.activeData = this.allData;
    }

    for (let i = 0; i < this.activeData.length; i++) {
      let currentPoints = this.activeData[i].points;

      this.refLabels = [];
      currentPoints.map(item => {
        this.refLabels[item.x] = item.label;
      });
    }

    this.allActivePoints = this.activeData.map(p => p.points).reduce((previous, current) => previous.concat(current), []);
    this.yScale = d3Scale.scaleLinear()
                    .domain([0, d3Array.max(this.allActivePoints, d => d.y)])
                    .range([this.state.size.innerHeight, 0])
                    .nice(); // Y axis should extend to nicely readable 0..100

    this._setWidth(props);
    if (props.isDetail) {
      window.addEventListener('resize', this.handleResize);
    }

    this.hasBeenInitialized = true;
  }

  // Map metric points to new keys to be used by d3.
  _getFormattedData(populations) {
    let formattedPopulations = [];

    // Inteate over populations...
    for (let i = 0; i < populations.length; i++) {
      let formattedPoints = [];
      let currentPopulation = populations[i];
      let currentPoints = currentPopulation.points;

      // Iterate over data points within this population...
      for (let j = 0; j < currentPoints.length; j++) {
        formattedPoints.push({
          x: currentPoints[j]['refRank'] || parseFloat(currentPoints[j]['b']),
          y: currentPoints[j]['c'],
          p: currentPoints[j]['p'],
          label: currentPoints[j]['b']
        });
      }

      formattedPopulations[i] = currentPopulation;
      formattedPopulations[i].points = formattedPoints;
    }

    return formattedPopulations;
  }

  /**
   * Return an array of population data with only the central 99% of data points
   * included for each population. Assumes points are already sorted.
   *
   * @param {Array} populations - The populations object returned by the API
   */
  _removeOutliers(populations) {
    let populationsWithoutOutliers = [];

    for (let i = 0; i < populations.length; i++) {
      let currentPoints = populations[i].points;

      // The indices of the first and last element to be included in the result
      const indexFirst = Math.round(currentPoints.length * 0.005) - 1;
      const indexLast = Math.round(currentPoints.length * 0.995) - 1;

      // Add 1 to indexLast because the second paramater to Array.slice is not
      // inclusive
      populationsWithoutOutliers[i] = populations[i];
      populationsWithoutOutliers[i].points = currentPoints.slice(indexFirst, indexLast + 1);
    }

    return populationsWithoutOutliers;
  }

  _getXScale(props, innerWidth) {
    // Category charts get treated differently since they start at x: 1
    let xScale;
    if (props.metric.type === 'category') {
      xScale = d3Scale.scaleLinear()
                 .domain([1, d3Array.max(this.allActivePoints, d => d.x)])
                 .range([0, innerWidth]);
    } else {
      let scaleType;

      switch(props.selectedScale) {
        case 'linear':
          scaleType = d3Scale.scaleLinear();
          break;
        case 'log':
          scaleType = d3Scale.scaleLog();
          break;
        default:
          scaleType = d3Scale.scaleLinear();
          break;
      }

      xScale = scaleType
                 .domain(d3Array.extent(this.allActivePoints, d => d.x))
                 .range([0, innerWidth]);
    }

    return xScale;
  }

  _setWidth(props) {
    // width = size of the SVG
    let width;
    if (props.isDetail) {
      width = parseInt(getComputedStyle(this.chartDetail)['width'], 10);
    } else {
      width = 300;
    }

    // innerWidth = size of the contents of the SVG
    const innerWidth = width - this.margin.left - this.margin.right;
    const xScale = this._getXScale(props, innerWidth);
    const sizeIncludingWidth = Object.assign({}, this.state.size, {width, innerWidth});
    this.setState({xScale, size: sizeIncludingWidth});
  }

  render() {
    if (!this.hasBeenInitialized) {
      return <Chart isFetching={true} {...this.props} />;
    } else {
      return (
        <Chart
          isFetching={false}

          metricId={this.props.metricId}
          name={this.props.metric.metric}
          populations={this.activeData}
          refLabels={this.refLabels}
          metricType={this.props.metric.type}
          showOutliers={this.props.showOutliers}
          hoverString={this.props.metric.hoverString}
          tooltip={this.props.tooltip}

          size={this.state.size}
          xScale={this.state.xScale}
          yScale={this.yScale}
        />
      );
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._handleResize);
  }
}

const mapStateToProps = function(store, ownProps) {
  return {
    metric: store.metricState.metrics[ownProps.metricId],
  };
};

export default connect(mapStateToProps)(ChartContainer);
