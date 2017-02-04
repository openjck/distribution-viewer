import React from 'react';

export default function(props) {
  return (
    <section className="population-legend">
        {props.whitelistedPopulations.map((wp, index) => {
          return (
            <dl>
              <dt>{wp}</dt>
              <dd>
                <svg width="50" height="5">
                  <line className={`line-${index + 1}`} x1="0" y1="5" x2="50" y2="5" stroke-width="5" />
                </svg>
              </dd>
            </dl>
          );
        })}
    </section>
  );
}
