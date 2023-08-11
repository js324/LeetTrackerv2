import React, {useState, useEffect} from "react";
import "@pages/options/Options.css";

function SheetReset() {

  function handleClick(e) {
    e.preventDefault();
    console.log("attempting reset");
    chrome.runtime.sendMessage({ message: 'reset' });
  }

  return (
    <span className="setting-option">
      <button><strong className="link" onClick={handleClick}>Reset Spreadsheet</strong></button>
    </span>
  );
}



export default SheetReset;
