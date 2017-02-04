import React from 'react';

import * as metricApi from '../../api/metric-api';


/**
 * A container that does groundwork needed by several other components, like
 * processing URL parameters.
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
    // Pass some props to the child component
    return React.cloneElement(this.props.children, {
      whitelistedMetricIds: this.whitelistedMetricIds,
      whitelistedPopulations: this.whitelistedPopulations,
    });
  }
}
