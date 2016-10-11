import * as types from '../actions/action-types';


const initialState = {
  isFetching: false,
  metrics: {},
  status: 200
};

const metricReducer = function(state = initialState, action) {
  switch(action.type) {
    case types.GETTING_METRIC:
      return Object.assign({}, state, {isFetching: true});
    case types.GET_METRIC_SUCCESS:
      return Object.assign({}, state, {isFetching: false, metrics: action.metrics, status: 200});
    case types.GET_METRIC_FAILURE:
      return Object.assign({}, state, {isFetching: false, status: action.status});
  }

  return state;
};

export default metricReducer;
