import React, {useState, useEffect} from "react";
import "@pages/options/Options.css";
import ThemeToggle from "@pages/options/ThemeToggle";
import SheetReset from "@pages/options/SheetReset";



const Options: React.FC = () => {

  function getTheme() {
    chrome.storage.sync.get({o_theme: "light"}, (options) => {
      console.log("got o_theme from sync memory");
      const bod = document.getElementsByTagName('body')[0];
      bod.dataset.theme = options.o_theme;
    });
  }
  useEffect(() => {getTheme();}, []);

  return <>
  <div className="settings-body">
  <header>
    <h1>LeetTracker Settings</h1>
  </header>
    <div className="settings-list">
      <ThemeToggle />
      <SheetReset />
    </div>
  </div>
  </>;
};

export default Options;
