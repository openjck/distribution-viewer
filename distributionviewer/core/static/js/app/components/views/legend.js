import React from 'react';


export default function(props) {
  if (!props.metric) return null;

  // Move the "All" population to be the last element of the array, since it's
  // the last data line shown in charts.
  let all;
  const popAllLast = props.metric.populations.filter(population => {
    // population.population = the name of this population
    if (population.population === 'All') {
      all = population;
      return false;
    }
    return true;
  });
  popAllLast.push(all);

  return (
    <section id="legend">
      {popAllLast.map((population, index) => {
        return (
          <div key={index} className="population-info">
            <svg className={`example-line population-${index + 1}`} width="50" height="5">
              <line x1="0" y1="5" x2="50" y2="5" strokeWidth="5" />
            </svg>
            <span className="name">
              {population.population}
            </span>
          </div>
        );
      })}
    </section>
  );
}
