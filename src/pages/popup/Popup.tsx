import React, {useState, useEffect} from "react";
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

  // a unique initialized value is needed for the changeable variables here because the past values are called from storage
  // before the states are initialized. so when the states are initialized, they trigger the effect hook that rewrites what is in
  // storage. to prevent the initial values from overwriting the actual storage, they need unique values so special cases can be made.
  // there was probably a better way to handle that tbh. 

  const [isLeet, setIsLeet] = useState(false);
  const [problemName, setName] = useState(""); // string
  const [isFave, setFave] = useState(-1); // kinda of a boolean: -1/0 = false; 1 = true
  const [isSolved, setSolved] = useState(false); //boolean
  const [difficulty, setDifficulty] = useState(""); //string
  const [taglist, setTags] = useState(["  "]); // array of strings
  const [date, setDate] = useState("  "); //string
  const [timeComp, setTimeComp] = useState("  "); //string
  const [spaceComp, setSpaceComp] = useState("  "); //string
  const [notes, setNotes] = useState("  "); //string

  const [tagUpdate, setTUpdate] = useState(false);

  function refresh() {
    setTUpdate(!tagUpdate);
  }

  function toggleFave() {
    if (isFave > 0) 
      setFave(0)
    else
      setFave(1);
  }

  function getTheme() {
    chrome.storage.sync.get({o_theme: "light"}, (options) => {
      console.log("got o_theme from sync memory");
      const bod = document.getElementsByTagName('body')[0];
      bod.dataset.theme = options.o_theme;
    });
  }
  useEffect(() => {getTheme();}, []);

  function checkLeet() {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, ([tab]) => {
      chrome.tabs.sendMessage(tab.id, {message: "leetCheck"}, (response) => {
        if (response?.p_isleet) {
          setIsLeet(true);
          loadStuff();
        } else {
          setIsLeet(false);
        }
      })
    })
  }

  function loadStuff() {

    chrome.storage.session.get({p_name: "", p_isfave: -1, p_solved: false, p_difficulty: "", p_tags: ["  "], p_tcomp: "  ", p_scomp: "  ", p_notes: "  "}).then((stuff) => {
      console.log("get something or nothing from session storage");
      setName(stuff.p_name);
      setFave(stuff.p_isfave);
      setSolved(stuff.p_solved)
      setDifficulty(stuff.p_difficulty);
      setTags(stuff.p_tags);
      setTimeComp(stuff.p_tcomp);
      setSpaceComp(stuff.p_scomp);
      setNotes(stuff.p_notes);
      refresh();
    });
  }

  // run loadStuff on bootup
  useEffect(() => {checkLeet();}, []);

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.message === "updatePopup") {
        chrome.storage.session.get({p_name: ""}).then((stuff) => {
          console.log("update detected: "+ stuff.p_name);
          loadStuff();
        });
        
      }
      return true;

    }
  );

  useEffect(() => {
    if (isFave != -1)
    chrome.storage.session.set({p_isfave: isFave}, () => { console.log("isFave="+isFave); });
  }, [isFave]);

  useEffect(() => {
    if (notes != "  ")
    chrome.storage.session.set({p_notes: notes.trim()}, () => { console.log("notes="+notes); });
  }, [notes]);

  useEffect(() => {
    if (timeComp != "  ")
    chrome.storage.session.set({p_tcomp: timeComp.trim()}, () => { console.log("timeComp="+timeComp); });
  }, [timeComp]);

  useEffect(() => {
    if (spaceComp != "  ")
    chrome.storage.session.set({p_scomp: spaceComp.trim()}, () => { console.log("spaceComp="+spaceComp); });
  }, [spaceComp]);

  useEffect(() => {
    if (taglist[0] !== "  ")
      chrome.storage.session.set({p_tags: taglist}, () => { console.log("taglist="+taglist); });
  }, [tagUpdate]);

  useEffect(() => {
    if (isSolved)
      chrome.storage.session.set({p_solved: isSolved}, () => { console.log("solved="+isSolved); });
  }, [isSolved]);

  return (
    <div className="App">
      <header>
        <img src={logo} alt="logo"/>
        <strong>LeetTracker</strong>
      </header>
      { // display when the page is a leetcode problem 
      isLeet &&
        (
        <>
        
        <ProblemTitle name={problemName} isFave={isFave} toggleFave={toggleFave}  />
        <SolveStatus isSolved={isSolved}/>
        <Tags level={difficulty} tags={taglist} setTags={setTags} refresh={refresh} />
        <ProblemDate setDate={setDate} date={date}/>
        <Complexities name={"Time Complexity"} comp={timeComp} setComp={setTimeComp} />
        <Complexities name={"Space Complexity"} comp={spaceComp} setComp={setSpaceComp} />
        <Notes notes={notes} setNotes={setNotes} />
        
        </>
        )
      }
      { // display when there is not leetcode problem
        !isLeet &&
        (
          <div className="no-leet">
            (There's no LeetCode problem here!)
          </div>
        )
      }
      <Footer isLeet={isLeet} />
    </div>
  );
};

export default Popup;
