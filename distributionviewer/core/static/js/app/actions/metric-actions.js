import * as types from './action-types';

export function gettingMetricsMetadata() {
  return {
    type: types.GETTING_METRICS_METADATA
  };
}

export function getMetricsMetadataSuccess(metadata) {
  return {
    type: types.GET_METRICS_METADATA_SUCCESS,
    metadata
  };
}

export function getMetricsMetadataFailure(status) {
  return {
    type: types.GET_METRICS_METADATA_FAILURE,
    status
  };
}

export function gettingMetric() {
  return {
    type: types.GETTING_METRIC
  };
}

export function getMetricSuccess(metrics) {
  return {
    type: types.GET_METRIC_SUCCESS,
    metrics
  };
}

export function getMetricFailure(status) {
  return {
    type: types.GET_METRIC_FAILURE,
    status
  };
}
