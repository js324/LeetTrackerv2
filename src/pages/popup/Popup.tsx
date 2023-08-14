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

  function loadStuff() {

    chrome.tabs.query({active: true, lastFocusedWindow: true}, ([tab]) => {
      chrome.tabs.sendMessage(tab.id, {text: "load"}, (response) => {
          if (response?.p_isleet){
            console.log("this is a leetpage.");
            setIsLeet(true);
          chrome.storage.session.get({p_name: "", p_isfave: -1, p_solved: false, p_difficulty: "", p_tags: ["  "], p_tcomp: "  ", p_scomp: "  ", p_notes: "  "}).then((stuff) => {
            console.log("get something or nothing from session storage");
            if (response.p_name === stuff.p_name || response.p_name === " x ") {
              // data in storage is from the same problem --> displays old data
              // OR this is a leet problem page, but it doesn't indicate the problem (i.e. editorial/solutions/submissions) -->
              // infers that it is the same problem that is from storage
              console.log("loading from old data, same problem");
              
              setName(stuff.p_name);
              setFave(stuff.p_isfave);
              // makes sure that if the webpage says the problem is solved, it isn't overwritten by what is said in memory
              if (response.p_solved)
                setSolved(response.p_solved);
              // still needs identify cases where it is booted from storage becase there are webpages that don't indicate p_solved
              else  
                setSolved(stuff.p_solved)
              setDifficulty(stuff.p_difficulty);
              setTags(stuff.p_tags);
              setTimeComp(stuff.p_tcomp);
              setSpaceComp(stuff.p_scomp);
              setNotes(stuff.p_notes);
              console.log(response.p_solved);
              refresh();
            } else {
              // data in storage does not match the problem on the page --> check sheet if new problem has a past entry -->
              // load past entry (if there) or new data

              setName(response.p_name);
              setDifficulty(response.p_difficulty);
              setSolved(response.p_solved);

              console.log("this is a new problem. checking for sheet for past entries")

               chrome.runtime.sendMessage({ message: 'reload', p_name: response.p_name }, (reload) => {
                 if (reload.result === 0) {
                  console.log("reloading from past entry");
                  loadFromSheet(reload.data, response.url);
                  

                 } else {
                  console.log("getting new data, new problem");
                  setTags(response.p_tags);
    
                  //save new data + other things as default states
                  chrome.storage.session.set({ url: response.url, p_name: response.p_name, p_isfave: -1, p_solved: response.p_solved,
                    p_difficulty: response.p_difficulty, p_tags: response.p_tags, p_tcomp: "", p_scomp: "", p_notes: "" }, () => {console.log("saved new problem");});
                 }
               });

              
            }
          })
        }
      });  
    });

  }

  function loadFromSheet (row, url) {
    const s_fave = (row[8]=== "TRUE") ? 1 : 0;
    setFave(s_fave);
    setTags(row[2].split(","));
    setTimeComp(row[4]);
    setSpaceComp(row[5]);
    setNotes(row[6]);
    chrome.storage.session.set({ url: url, p_name: row[0], p_isfave: (row[8] === "TRUE" ? 1 :0), p_solved: (row[3] === "TRUE" ? 1 :0),
                    p_difficulty: row[1], p_tags: row[2].split(","), p_tcomp: row[4], p_scomp: row[5], p_notes: row[6] }, () => {console.log("saved new problem");});
    
  }

  // run loadStuff on bootup
  useEffect(() => {loadStuff();}, []);

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
