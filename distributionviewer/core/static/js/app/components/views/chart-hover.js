import React from 'react';
import * as d3Array from 'd3-array';
import * as d3Format from 'd3-format';

import { select, selectAll, mouse } from 'd3-selection';
import format from 'string-template';


export default class extends React.Component {
  componentDidMount() {
    let hoverElm = select(this.refs.rect);
    this.bisector = d3Array.bisector(d => d.x).left;

    // Terrible hack to bind an event in a way d3 prefers.
    // Normally this would be in the container and we'd pass it the event.
    hoverElm.on('mousemove', () => {
      this._handleMouseMove();
    });
  }
  _handleMouseMove() {
    const props = this.props;

    let x0 = props.xScale.invert(mouse(this.refs.rect)[0]);

    for (let populationIndex = 0; populationIndex < props.populations.length; populationIndex++) {
      const currentData = props.populations[populationIndex].points;

      let i = this.bisector(currentData, x0, 1);
      let d0 = currentData[i - 1];

      this.focusElm = selectAll(`.chart-${props.metricId} .population-${populationIndex + 1} .focus`);

      // Ternary to fix comparison with array index out of bounds.
      const d1 = currentData[i] ? currentData[i] : currentData[i - 1];

      // 'd' holds the currently hovered data object.
      let d = x0 - d0.x > d1.x - x0 ? d1 : d0;

      // For category charts we have to grab the proportion manually.
      let proportion = props.metricType === 'category' ? currentData[d.x - 1].p : d.p;

      // Position the focus circle on chart line.
      this.focusElm.attr('transform', `translate(${props.xScale(d.x)}, ${props.yScale(d.y)})`);
    }

    // TODO: Temporary: Only show this when there is only one population
    // Set formatted chart hover text.
    if (props.populations.length === 1) {
      select('.secondary-menu-content .chart-info').text(
        this._getHoverString(props.metricType, d.x, d.y, proportion)
      );
    }
  }
  _getFormattedVal(val) {
    return d3Format.format('.1%')(val).replace('%', '');
  }
  _getHoverString(metricType, x, y, p) {
    let result = this.props.hoverString;
    if (!result) return '';

    if (metricType === 'category') {
      result = format(result, {
        x: this.props.refLabels[x],
        p: this._getFormattedVal(p),
        y: this._getFormattedVal(y)
      });
    } else {
      result = format(result, {
        x,
        p: this._getFormattedVal(p),
        y: this._getFormattedVal(y)
      });
    }
    return result;
  }
  render() {
    return (
      <rect
        ref="rect"
        className="hover-zone"
        width={this.props.size.innerWidth}
        height={this.props.size.innerHeight}
        onMouseOver={this.props.mOver}
        onMouseOut={this.props.mOut}
      />
    );
  }
}
