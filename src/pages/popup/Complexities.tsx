import React from 'react';

function Complexities(props) {
  return (
    <span className="rowed">
        <strong>{props.name}:</strong>
        <input type="text" className="inlined" spellCheck="false" />
    </span>
  );
};

export default Complexities;
