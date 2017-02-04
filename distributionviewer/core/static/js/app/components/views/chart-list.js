import React from 'react';
import { Link } from 'react-router';

import ChartContainer from '../containers/chart-container';
import DescriptionContainer from '../containers/description-container';
import PopulationLegend from '../views/population-legend';


export default function(props) {
  let legend = '';
  if (props.whitelistedPopulations) {
    legend = <PopulationLegend whitelistedPopulations={props.whitelistedPopulations} />;
  }

  return (
    <div>
      {legend}
      <section className="chart-list">
        {props.metadata.map(metricMeta => {
          const tooltip = <DescriptionContainer rawDescription={metricMeta.description} asTooltip={true} />;
          return (
            <Link key={metricMeta.id} className="chart-link" to={`/chart/${metricMeta.id}/`}>
              <div>
                <ChartContainer
                  metricId={metricMeta.id}
                  isDetail={false}
                  showOutliers={false}
                  tooltip={tooltip}
                  whitelistedPopulations={props.whitelistedPopulations}
                />
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
