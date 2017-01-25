import React from 'react';

import * as metricApi from '../../api/metric-api';


/**
 * A simple container that does work that may be needed by several other
 * components. For example, processing URL options.
 */
export default class extends React.Component {
  constructor(props) {
    super(props);
    this.whitelistedMetricIds = metricApi.getWhitelistedMetricIds(this.props.location);
    this.whitelistedPopulations = metricApi.getWhitelistedPopulations(this.props.location);
  }

  componentWillUpdate(nextProps) {
    this.whitelistedMetricIds = metricApi.getWhitelistedMetricIds(nextProps.location);
    this.whitelistedPopulations = metricApi.getWhitelistedPopulations(nextProps.location);
  }

  render() {
    return React.cloneElement(this.props.children, {
      whitelistedMetricIds: this.whitelistedMetricIds,
      whitelistedPopulations: this.whitelistedPopulations,
    });
  }
}
