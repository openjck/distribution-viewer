import React from 'react';

import Population from '../views/population';


export default class extends React.Component {
  constructor(props) {
    super(props);
    this.population = props.params.population;
  }

  render() {
    return <Population population={this.population} />;
  }
}
