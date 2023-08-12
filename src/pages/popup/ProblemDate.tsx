import React from 'react';

function ProblemDate(props) {

  function formatDate() {
    let currentDate = new Date();
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    props.setDate(months[currentDate.getMonth()] + " " + currentDate.getDate() + ", " + currentDate.getFullYear());
    return props.date;  
  }
  
  return (
    <span>
      <strong className="date-label">Attempt Date:</strong>
      <span className='date'>{formatDate()}</span>
    </span>
  );
};

export default ProblemDate;
