import React from 'react';
import { connect } from 'react-redux';

import ChartList from '../views/chart-list';
import * as metricApi from '../../api/metric-api';


class ChartListContainer extends React.Component {
  componentDidMount() {
    metricApi.getMetricsMetadata(this.props.query);
  }

  render() {
    return (
      <ChartList {...this.props} />
    );
  }
}

const mapStateToProps = function(store) {
  return {
    metadata: store.metricsMetadataState.metadata,
  };
};

export default connect(mapStateToProps)(ChartListContainer);
