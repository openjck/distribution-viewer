import { combineReducers } from 'redux';

// Individual reducers
import metricsMetadataReducer from './metrics-metadata-reducer';
import metricReducer from './metric-reducer';

var reducers = combineReducers({
  metricsMetadataState: metricsMetadataReducer,
  metricsState: metricReducer,
});

export default reducers;
