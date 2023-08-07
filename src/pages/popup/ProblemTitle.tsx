import React from 'react';


function ProblemTitle(props) {
  return (
      <h1>
        {props.name}
        <button className="contain" onClick={props.toggleFave}>
         <svg className={(props.isFave > 0) ? 'star full' : 'star'}  width="20" height="20" viewBox="0.00 0.00 209.00 199.00" xmlns="http://www.w3.org/2000/svg">
        <g stroke-linecap="round" transform="translate(-1436.00, -1161.00)">
        <path d="M1579.64,1282.37 L1642.51,1236.44 L1562.98,1237.29 L1538.73,1163.30 L1516.75,1237.06 L1438.06,1236.44 L1500.93,1282.37 L1475.55,1357.74 L1538.66,1312.15 L1605.03,1357.74 L1579.64,1282.37 Z" strokeWidth="15.00" strokeOpacity="1.00" strokeLinejoin="round"/>
        </g>
      </svg>
      </button>
      </h1>

  );
};

export default ProblemTitle;

