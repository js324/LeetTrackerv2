import React, {useState} from "react";
import logo from "@assets/img/logo.png";
import ProblemTitle from "@pages/popup/ProblemTitle";
import SolveStatus from "@pages/popup/SolveStatus";
import Tags from "@pages/popup/Tags";
import ProblemDate from "@pages/popup/ProblemDate";
import Complexities from "@pages/popup/Complexities";
import Notes from "@pages/popup/Notes";
import Footer from "@pages/popup/Footer";
import "@pages/popup/Popup.css";

function Popup() {

  const [isLeet, setIsLeet] = useState(false);
  const [problem_name, setName] = useState("");
  const [time, setTime] = useState(0.0);
  const [difficulty, setDifficulty] = useState("");
  const [taglist, setTags] = useState([]);
  const [timeComp, setTimeComp] = useState("");
  const [spaceComp, setSpaceComp] = useState("");
  const [notes, setNotes] = useState("");
  const [isFave, setFave] = useState(false);

  function toggleFave() {
    setFave(!isFave);
  }


  (async () => {
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    const response = await chrome.tabs.sendMessage(tab.id, {text: "hello"});    

    setIsLeet(response.p_isleet);

    if(isLeet) {
      setName(response.p_name);
      setDifficulty(response.p_difficulty);
      setTags(response.p_tags);
    }
    
    //process response here
  })();

  return (
    <div className="App">
      <header>
        <img src={logo} alt="logo"/>
        <strong>LeetTracker</strong>
      </header>
      { isLeet &&
        (
        <>
        
        <ProblemTitle name={problem_name} isFave={isFave} toggleFave={toggleFave}/>
        <SolveStatus />
        <Tags level={difficulty} tags={taglist}/>
        <ProblemDate />
        <Complexities name={"Time Complexity"}/>
        <Complexities name={"Space Complexity"}/>
        <Notes />
        <Footer />
        </>
        )
      }
      {
        !isLeet &&
        (
          <div className="no-leet">
            (There's no LeetCode problem here!)
          </div>
        )
      }
      
    </div>
  );
};

export default Popup;
