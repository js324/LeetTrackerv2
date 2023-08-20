import React from 'react';

function Footer(props) {
  function handleClick(e) {
    e.preventDefault();
    console.log("attempting sign-in") 
    chrome.runtime.sendMessage({ message: 'submit' }, (response) => {
      switch (response?.result) {
        case 1: //new spreadsheet was made
          alert("A new spreadsheet has been made and updated!");
          props.setEntry(true);
          break;
        case 2: //spreadsheet already exists
          alert("Spreadsheet updated!");
          props.setEntry(true);
          break;
        default: //idk
          alert("Error: update might have failed");
          break;
      }
    });
  }

  const label = (props.hasEntry) ? "Update" : "Submit";

function optionspage() {
  chrome.runtime.openOptionsPage();
}

function tospreadsheet() {
  chrome.storage.sync.get({spreadsheetId : ""}).then(({spreadsheetId}) => 
  {chrome.tabs.create({url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`})});
}

function toleetcode() {
  chrome.tabs.create({url: "https://leetcode.com/problemset/all/"});
}

  return (
    <footer className="rowed">
      <div className="buttons">
        
      <button type="button" className="icon-button" onClick={optionspage}> 
        <svg width="15.00" height="15.00" viewBox="0.00 0.00 150.00 160.00" xmlns="http://www.w3.org/2000/svg">
        <g strokeLinecap="round">
        <path d="M74.95,40.49 C72.29,40.59 64.22,42.24 61.06,43.47 C57.76,44.80 52.67,48.57 50.14,51.35 C47.50,54.29 44.17,59.06 42.68,62.22 C41.17,65.52 39.95,71.45 39.96,75.27 C40.02,79.10 41.43,85.31 43.12,89.25 C44.80,93.09 47.87,98.02 50.12,100.16 C52.26,102.15 59.17,106.62 61.60,107.75 C64.13,108.89 69.98,110.15 73.36,110.26 C77.37,110.35 82.83,109.63 86.02,108.59 C88.81,107.64 94.07,104.71 96.18,103.20 C98.57,101.45 101.84,97.97 103.55,95.14 C105.15,92.45 108.26,86.32 109.06,83.59 C109.83,80.88 109.84,74.80 109.29,70.65 C108.69,66.41 106.67,60.45 104.75,57.30 C102.79,54.16 98.37,49.54 94.97,47.12 C91.53,44.72 85.68,42.00 82.19,41.17 C80.42,40.78 76.82,40.44 74.95,40.49 Z" fill="none" strokeWidth="34.99" strokeOpacity="1.00" strokeLinejoin="round"/>
        <path d="M62.45,44.97 C62.45,44.97 35.40,24.09 35.40,24.09 C35.40,24.09 25.50,33.99 25.50,33.99 C25.50,33.99 46.38,61.04 46.38,61.04 C46.38,61.04 11.00,67.00 11.00,67.00 C11.00,67.00 11.00,81.00 11.00,81.00 C11.00,81.00 44.89,85.36 44.89,85.36 C44.89,85.36 24.09,114.60 24.09,114.60 C24.09,114.60 33.99,124.50 33.99,124.50 C33.99,124.50 62.64,105.11 62.64,105.11 C62.64,105.11 67.00,139.00 67.00,139.00 C67.00,139.00 81.00,139.00 81.00,139.00 C81.00,139.00 88.96,103.62 88.96,103.62 C88.96,103.62 116.01,124.50 116.01,124.50 C116.01,124.50 125.91,114.60 125.91,114.60 C125.91,114.60 105.11,85.36 105.11,85.36 C105.11,85.36 139.00,81.00 139.00,81.00 C139.00,81.00 139.00,67.00 139.00,67.00 C139.00,67.00 103.62,61.04 103.62,61.04 C103.62,61.04 124.50,33.99 124.50,33.99 C124.50,33.99 114.60,24.09 114.60,24.09 C114.60,24.09 87.55,44.97 87.55,44.97 C87.55,44.97 81.00,11.00 81.00,11.00 C81.00,11.00 67.00,11.00 67.00,11.00 C67.00,11.00 62.64,44.89 62.64,44.89" fill="none" strokeWidth="20.00" strokeOpacity="1.00" strokeLinejoin="round"/>
        </g>
        </svg>
      </button>
      <button type="button" className="icon-button" onClick={tospreadsheet}>
        <svg width="15.00" height="15.00" viewBox="0.00 0.00 150.00 150.00" xmlns="http://www.w3.org/2000/svg">
        <g strokeLinecap="round" >
        <path d="M6.00,35.00 C6.12,33.68 6.49,32.17 7.03,31.43 C7.90,30.25 11.00,30.00 11.00,30.00 C40.36,29.91 100.06,29.89 130.40,29.96 C133.66,29.97 137.96,30.00 139.00,30.00 C140.25,30.02 141.69,30.29 142.41,30.81 C143.57,31.65 144.00,35.00 144.00,35.00 C144.00,35.00 144.00,116.00 144.00,116.00 C143.84,117.73 143.45,119.17 142.76,119.87 C142.10,120.54 140.71,120.89 139.00,121.00 C108.00,121.06 46.04,121.06 15.08,121.01 C13.88,121.01 11.84,121.00 11.00,121.00 C8.21,120.86 7.00,119.53 6.35,118.27 C6.35,118.27 6.00,116.00 6.00,116.00 C6.00,116.00 6.00,37.34 6.00,35.00 Z" fill="none"  strokeWidth="15.00" strokeOpacity="1.00" strokeLinejoin="round"/>
        <path d="M7.59,58.57 C7.59,58.57 138.50,58.57 138.50,58.57 C126.78,58.57 117.69,58.57 137.72,58.57" fill="none" strokeWidth="15.00" strokeOpacity="1.00" strokeLinejoin="round"/>
        <path d="M7.28,89.78 C7.28,89.78 141.65,89.78 141.65,89.78" fill="none"  strokeWidth="15.00" strokeOpacity="1.00" strokeLinejoin="round"/>
        <path d="M54.80,30.27 C54.80,30.27 54.80,121.10 54.80,121.10" fill="none" strokeWidth="15.00" strokeOpacity="1.00" strokeLinejoin="round"/>
        </g>
        </svg>
        
      </button>
      </div>
      { props.isLeet && (
          <button className="submit" type="button" onClick={handleClick}><strong className="link">
          {label}  
          </strong></button>
      )}
      { !props.isLeet && (
          <button className="submit" type="button" onClick={toleetcode}><strong className="link">Go to LeetCode</strong></button>
      )}
      
    </footer>
  );
};

export default Footer;
