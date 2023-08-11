import React, {useState, useEffect} from "react";
import "@pages/options/Options.css";

function ThemeToggle() {

  const [themeLabel, setThemeLabel] = useState("Off");

  function loadTheme() {
    chrome.storage.sync.get({o_theme: "light"}, (options) => {
      console.log("got o_theme from sync memory");
      if (options.o_theme === "dark") {
        setThemeLabel("On");
      }
    });
  }
  useEffect(() => {loadTheme();}, []);


  function changeTheme() {
    if (themeLabel === "Off") {
      chrome.storage.sync.set({o_theme: "dark"}, () => {
        setThemeLabel("On");
        console.log("dark mode on");
        const bod = document.getElementsByTagName('body')[0];
      bod.dataset.theme = "dark";
      });
      
    } else {
      chrome.storage.sync.set({o_theme: "light"}, () => {
        setThemeLabel("Off");
        console.log("dark mode off");
        const bod = document.getElementsByTagName('body')[0];
      bod.dataset.theme = "light";
      });
    }
  }

  

  return (
    <span className="setting-option">
      <p><strong>Dark Mode: </strong> {themeLabel}</p>
      <span>
      <label className="toggle-switch">
        <input type="checkbox" checked={themeLabel === "On"} />
        <span className="slider round" onClick={changeTheme}></span>
      </label>
      </span>
      
    </span>
  );
}



export default ThemeToggle;
