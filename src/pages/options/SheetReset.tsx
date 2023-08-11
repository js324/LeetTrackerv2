import React, {useState, useEffect} from "react";
import "@pages/options/Options.css";

function SheetReset() {
  const [isWarning, setWarning] = useState(false);

  function resetSpreadsheet() {
    console.log("attempting reset");
    chrome.runtime.sendMessage({ message: 'reset' });
    alert("Spreadsheet has been reset!");
    setWarning(false);
  }

  return (
    <>
    <span className="setting-option">
      <button onClick={() => {setWarning(!isWarning);}}><strong className="link">Reset Spreadsheet</strong></button>
    </span>
    <div className={ (isWarning) ? "warning" : "warning hidden"}>
      This will move the current spreadsheet to your Google Drive's trash, and the extension will create a new spreadsheet.
      All new data will be written to this new spreadsheet.<br/><strong>There is no way to relink the extension to previous spreadsheets.</strong>
      <br/>Would you like to reset your spreadsheet?<br /> <br />
      <span>
        <button onClick={resetSpreadsheet} className="suboption"><strong className="link">Yes</strong></button>
        <button className="suboption" onClick={() => {setWarning(!isWarning);}} ><strong className="link">No</strong></button>
      </span>
    </div>
    
    </>
  );
}



export default SheetReset;
