import React from 'react';
import { connect } from 'react-redux';

import ChartDetail from '../views/chart-detail';
import * as metricApi from '../../api/metric-api';


class ChartDetailContainer extends React.Component {
  constructor(props) {
    super(props);
    this.chartId = parseInt(props.params.chartId, 10);
  }

  componentDidMount() {
    metricApi.getMetric(this.chartId);
  }

  // JCK TODO: Restore the 404 handling
  render() {
    if (!this.props.metric) {
      return <ChartDetail isFetching={true} id={this.chartId} />;
    } else {
      return (
        <ChartDetail
          isFetching={false}
          id={this.chartId}
          metricType={this.props.metric.type}
          numMetricPoints={this.props.metric.points.length}
        />
      );
    }
  }
}

const mapStateToProps = function(store, ownProps) {
  return {
    metric: store.metricsState.metrics[parseInt(ownProps.params.chartId, 10)],
  };
};

export default connect(mapStateToProps)(ChartDetailContainer);
