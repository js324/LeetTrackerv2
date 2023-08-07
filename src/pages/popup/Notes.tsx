import React from 'react';

function Notes(props) {
  return (
    <>
    <strong>Notes:</strong>
    <textarea spellCheck="false" value={props.notes}  onChange={(e) => props.setNotes(e.target.value)} />
    </>
  );
};

export default Notes;
