import axios from 'axios';
import store from '../store';
import * as metricActions from '../actions/metric-actions';

const prodEndpoints = {
  GET_METRICS: `${location.origin}/metrics/`,
  GET_METRIC: `${location.origin}/metric/`
};

const mockEndpoints = {
  GET_METRICS: 'http://localhost:3009/metrics',
  GET_METRIC: 'http://localhost:3009/'
};

export const endpoints = process.env.NODE_ENV === 'production' ? prodEndpoints : mockEndpoints;

const metrics = {};

// jck TODO: Not sure what to do with this yet
// Get metric IDs from query params
export function getQueryMetrics(query) {
  var qmetrics = [];
  if (query && query.metrics) {
    qmetrics = query.metrics.split(',').map(v => parseInt(v, 10));
  }
  return qmetrics;
}

export function getMetricsMetadata() {
  store.dispatch(metricActions.gettingMetricsMetadata());

  return axios.get(endpoints.GET_METRICS).then(response => {
    const metricsMetadata = response.data.metrics;
    store.dispatch(metricActions.getMetricsMetadataSuccess(metricsMetadata));
    return metricsMetadata;
  }).catch(error => {
    console.error(error);
    store.dispatch(metricActions.getMetricsMetadataFailure(error.status));
    return error;
  });
}

export function getMetric(metricId) {
  if (metricId in metrics) {
    return metrics[metricId];
  } else {
    store.dispatch(metricActions.gettingMetric());

    return axios.get(`${endpoints.GET_METRIC}${metricId}/`).then(response => {
      metrics[metricId] = response.data;
      store.dispatch(metricActions.getMetricSuccess(metrics));
      return response.data;
    }).catch(error => {
      console.error(error);
      store.dispatch(metricActions.getMetricFailure(error.status));
      return error;
    });
  }
}
