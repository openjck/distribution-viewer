import React from 'react';
import * as d3Shape from 'd3-shape';
import * as d3Selection from 'd3-selection';

import ChartLine from '../views/chart-line';


export default class extends React.Component {
  constructor(props) {
    super(props);
  }

  _drawLine() {
    let line = d3Shape.line()
                .x(d => this.props.xScale(d.x))
                .y(d => this.props.yScale(d.y))
                .curve(d3Shape.curveStepAfter);

    d3Selection.select(`.chart-${this.props.metricId} .population-${this.props.popOrdinal} .line`).datum(this.props.data).attr('d', line);
  }

  componentDidMount() {
    this._drawLine();
  }

  componentDidUpdate() {
    this._drawLine();
  }

  render() {
    return <ChartLine />;
  }
}
