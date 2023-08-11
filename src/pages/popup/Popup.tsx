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

  function loadStuff() {

    chrome.tabs.query({active: true, lastFocusedWindow: true}, ([tab]) => {
      chrome.tabs.sendMessage(tab.id, {text: "load"}, (response) => {
          if (response.p_isleet){
            console.log("this is a leetpage.");
          chrome.storage.session.get({p_name: "", p_isfave: -1, p_solved: false, p_difficulty: "", p_tags: ["  "], p_tcomp: "  ", p_scomp: "  ", p_notes: "  "}).then((stuff) => {
            console.log("get something or nothing from session storage");
            if (response.p_name === stuff.p_name || response.p_name === " x ") {
              console.log("loading from old data, same problem");
              
              setIsLeet(true);
              setName(stuff.p_name);
              setFave(stuff.p_isfave);
              if (response.p_solved)
                setSolved(response.p_solved);
              else 
                setSolved(stuff.p_solved)
              setDifficulty(stuff.p_difficulty);
              setTags(stuff.p_tags);
              setTimeComp(stuff.p_tcomp);
              setSpaceComp(stuff.p_scomp);
              setNotes(stuff.p_notes);
              refresh();
            } else {
              console.log("getting new data, new problem");
              setIsLeet(response.p_isleet);
              setName(response.p_name);
              setDifficulty(response.p_difficulty);
              setTags(response.p_tags);
              setSolved(response.p_solved);

              chrome.storage.session.set({ p_name: response.p_name, p_isfave: -1, p_solved: response.p_solved,
                p_difficulty: response.p_difficulty, p_tags: response.p_tags, p_tcomp: "", p_scomp: "", p_notes: "" }, () => {console.log("saved new problem");});
            }
          })
        }
      });  
    });

  }

  useEffect(() => {loadStuff();}, []);

  useEffect(() => {
    if (isFave != -1)
    chrome.storage.session.set({p_isfave: isFave}, () => { console.log("isFave="+isFave); });
  }, [isFave]);

  useEffect(() => {
    if (notes != "  ")
    chrome.storage.session.set({p_notes: notes}, () => { console.log("notes="+notes); });
  }, [notes]);

  useEffect(() => {
    if (timeComp != "  ")
    chrome.storage.session.set({p_tcomp: timeComp}, () => { console.log("timeComp="+timeComp); });
  }, [timeComp]);

  useEffect(() => {
    if (spaceComp != "  ")
    chrome.storage.session.set({p_scomp: spaceComp}, () => { console.log("spaceComp="+spaceComp); });
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
      { isLeet &&
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
      {
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
