import React from 'react';

function Complexities(props) {
  return (
    <span className="rowed">
        <strong>{props.name}:</strong>
        <input type="text" value={props.comp} onChange={(e) => props.setComp(e.target.value)} className="inlined" spellCheck="false" />
    </span>
  );
};

export default Complexities;
