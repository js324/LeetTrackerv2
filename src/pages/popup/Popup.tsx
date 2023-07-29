import React from "react";
import logo from "@assets/img/logo.png";
import ProblemName from "@pages/popup/ProblemName";
import SolveStatus from "@pages/popup/SolveStatus";
import Tags from "@pages/popup/Tags";
import ProblemDate from "@pages/popup/ProblemDate";
import Complexities from "@pages/popup/Complexities";
import Notes from "@pages/popup/Notes";
import Footer from "@pages/popup/Footer";
import "@pages/popup/Popup.css";

function Popup() {
  return (
    <div className="App">
      <header>
        <img src={logo} alt="logo"/>
        <strong>LeetTracker</strong>
      </header>
      <ProblemName />
      <SolveStatus />
      <Tags />
      <ProblemDate />
      <Complexities name={"Time Complexity"}/>
      <Complexities name={"Space Complexity"}/>
      <Notes />
      <Footer />
    </div>
  );
};

export default Popup;
