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
    this.axisGap = 10; // Gap between axes and chart area
    this.height = props.isDetail ? 600 : 250;
    this.allDatasetName = 'all';
    this.excludingOutliersDatasetName = 'excludingOutliers';

    this.state = {size: {
      height: this.height,
      innerHeight: this.height - this.axisGap - this.margin.top - this.margin.bottom,
      transform: `translate(${this.margin.left}, ${this.margin.top})`,
    }};

    this.handleResize = debounce(() => this._setWidth(this.props));
    this.outlierThreshold = 100;

    this._setWidth = this._setWidth.bind(this);
  }

  componentDidMount() {
    metricApi.getMetric(this.props.metricId, this.props.whitelistedPopulations);

    if (this.props.isDetail) {
      this.chartDetail = document.getElementById('chart-detail');
    }
  }

  componentWillReceiveProps(nextProps) {
    // If the metric data changed or just came through for the first time, set
    // the chart up before the next render occurs.
    if (this.props.metric !== nextProps.metric) {
      if (nextProps.metric.populations.length === 0) {
        this.noData = true;
      } else {
        this._setup(nextProps);
      }
    }
  }

  componentWillUpdate(nextProps) {
    // If the outliers setting changed, update the active dataset accordingly.
    // Check against false explicitly because props are sometimes undefined.
    if (nextProps.showOutliers !== this.props.showOutliers) {
      if (nextProps.showOutliers) {
        this.activeDatasetName = this.allDatasetName;
      } else if (nextProps.showOutliers === false) {
        this.activeDatasetName = this.excludingOutliersDatasetName;
      }
    }

    // If the list of whitelisted populations changed, fetch chart data with the
    // next whitelisted populations
    if (nextProps.whitelistedPopulations !== this.props.whitelistedPopulations) {
      metricApi.getMetric(this.props.metricId, nextProps.whitelistedPopulations);
    }
  }

  componentDidUpdate(prevProps) {
    const outliersSettingChanged = this.props.showOutliers !== prevProps.showOutliers;
    const selectedScaleChanged = this.props.scale !== prevProps.scale;

    // If either the outliers setting or the selected scale has changed, the
    // x-axis will need to show different ticks and thus needs to be
    // regenerated.
    if (outliersSettingChanged || selectedScaleChanged) {
      this.biggestDatasetToShow = this.populationData[this.biggestPopulation.name][this.activeDatasetName];
      this.setState({xScale: this._getXScale(this.props, this.state.size.innerWidth)});
    }
  }

  _setup(props) {
    this.populationData = {};
    for (let i = 0; i < props.metric.populations.length; i++) {
      const population = props.metric.populations[i];
      const fmtData = this._getFormattedData(population.points);

      // Check against false explicitly because props are sometimes undefined
      let fmtDataExcludingOutliers;
      if (props.showOutliers === false) {
        fmtDataExcludingOutliers = this._removeOutliers(fmtData);
      }

      // If this population has the most data points so far, it's the biggest
      // population. We'll need to know which population is biggest when we set
      // the scales later.
      if (!this.biggestPopulation || population.points.length > this.biggestPopulation.points.length) {
        this.biggestPopulation = population;
      }

      this.populationData[population.name] = {};
      this.populationData[population.name][this.allDatasetName] = fmtData;
      if (fmtDataExcludingOutliers) {
        this.populationData[population.name][this.excludingOutliersDatasetName] = fmtDataExcludingOutliers;
      }
    }

    if (props.showOutliers === false && this.biggestPopulation.points.length > this.outlierThreshold) {
      this.activeDatasetName = this.excludingOutliersDatasetName;
    } else {
      this.activeDatasetName = this.allDatasetName;
    }

    // Make a copy of the biggest dataset we can show right now. That is, the
    // dataset from the biggest population after it is optionally trimmed of
    // outliers.
    //
    // We'll need this when setting the scales.
    this.biggestDatasetToShow = this.populationData[this.biggestPopulation.name][this.activeDatasetName];

    this.refLabels = [];
    this.biggestDatasetToShow.map(item => {
      this.refLabels[item.x] = item.label;
    });

    this.yScale = d3Scale.scaleLinear()
                    .domain([0, d3Array.max(this.biggestDatasetToShow, d => d.y)])
                    .range([this.state.size.innerHeight, 0])
                    .nice(); // Y axis should extend to nicely readable 0..100

    this._setWidth(props);

    if (props.isDetail) {
      window.addEventListener('resize', this.handleResize);
    }
  }

  // Map metric points to new keys to be used by d3.
  _getFormattedData(dataPoints) {
    var formattedPoints = [];

    for (let i = 0; i < dataPoints.length; i++) {
      formattedPoints.push({
        x: dataPoints[i]['refRank'] || parseFloat(dataPoints[i]['b']),
        y: dataPoints[i]['c'],
        p: dataPoints[i]['p'],
        label: dataPoints[i]['b']
      });
    }

    return formattedPoints;
  }

  // Return an array with only the central 99% of elements included. Assumes
  // data is sorted.
  _removeOutliers(data) {
    if (data.length <= this.outliersThreshold) return data;

    // The indices of the first and last element to be included in the result
    const indexFirst = Math.round(data.length * 0.005) - 1;
    const indexLast = Math.round(data.length * 0.995) - 1;

    // Add 1 to indexLast because the second paramater to Array.slice is not
    // inclusive
    return data.slice(indexFirst, indexLast + 1);
  }

  _getXScale(props, innerWidth) {
    // Categorical charts get treated differently since they start at x: 1
    let xScale;
    if (props.metric.type === 'categorical') {
      xScale = d3Scale.scaleLinear()
                 .domain([1, d3Array.max(this.biggestDatasetToShow, d => d.x)])
                 .range([0, innerWidth]);
    } else {
      let scaleType;

      switch(props.scale) {
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
                 .domain(d3Array.extent(this.biggestDatasetToShow, d => d.x))
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
    const innerWidth = width - this.axisGap - this.margin.left - this.margin.right;
    const xScale = this._getXScale(props, innerWidth);
    const sizeIncludingWidth = Object.assign({}, this.state.size, {width, innerWidth});
    this.setState({xScale, size: sizeIncludingWidth});
  }

  render() {
    // Data was loaded from the API, but there was no data to show for this
    // chart
    if (this.noData) {
      return <Chart noData={true} {...this.props} />;

    // Data has not yet been loaded from the API
    } else if (!this.populationData) {
      return <Chart isFetching={true} {...this.props} />;

    // Data has been loaded from the API and there is data to show for this
    // chart
    } else {
      return (
        <Chart
          isFetching={false}

          metricId={this.props.metricId}
          name={this.props.metric.name}
          populationData={this.populationData}
          refLabels={this.refLabels}
          metricType={this.props.metric.type}
          activeDatasetName={this.activeDatasetName}
          hoverString={this.props.metric.hoverString}
          tooltip={this.props.tooltip}

          size={this.state.size}
          axisGap={this.axisGap}
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
