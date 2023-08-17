import { useEffect } from "react";

export default function App() {


  function waitForLoad() {
    if (document.URL.indexOf("leetcode.com/problems/") != 1 && document.URL.indexOf("problemset") === -1) {
      var checkTimer = setInterval(checkLoaded, 200);
      function checkLoaded() {
        //repeats check until a button on top of the code section loads because that loads at the same time as the solved icon
        if (document.querySelector("div.overflow-hidden.ml-2.my-2 div.flex.flex-wrap div.flex.items-center button.rounded.px-3 svg.h-4.w-4 path") != undefined) {
          clearInterval(checkTimer);
          //grab problem data from the page
          const fromPage = grabProblem();
          if (fromPage.status == 0){
            chrome.runtime.sendMessage({message: "process", p_name: fromPage.p_name, p_difficulty: fromPage.p_difficulty, p_tags: fromPage.p_tags, p_solved: fromPage.p_solved, url: fromPage.url});
          } 
          else if (fromPage.status == 1 && fromPage.p_solved)
          {
            chrome.runtime.sendMessage({message:"updateSolved", p_solved: fromPage.p_solved});
          }
          
        }
      }
    }
    }

    function grabProblem() {
      const name = document.querySelector("div.flex.h-full.items-center a.mr-2.text-label-1"); //get name

      var solved = document.querySelector("div.text-green-s svg path"); // get solve status 
      if (!solved)
        solved = document.querySelector("span.text-green-s"); //second try for solve status to account for the submission screen
      
      const solvestatus = (solved) ? true : false; 

      const difficulty = document.querySelector("div.mt-3.flex.items-center.space-x-4 div"); //get difficulty

      const tags = document.querySelectorAll("div.overflow-hidden.transition-all.duration-500 div a.mr-4.rounded-xl.py-1.px-2.text-xs"); //get tags
      const taglist = []; //process tags into string array
      for (const tag of tags) {
        taglist.push(tag.textContent);
      }

      // the name exists --> this is the description page of the problem and all of the information is present
      if (name) {
        return {status: 0, p_name: name.textContent, p_difficulty: difficulty.textContent, p_tags: taglist, p_solved: solvestatus, url: document.URL};
      } else {
        if (document.URL.indexOf("/submissions/") != 1) { // this is a submissions page --> solve status could be updated
          return ({status: 1, p_solved: solvestatus});
        } else { //this is a problem subpage that is not the description or the submission --> no new data could be found
          return ({status: 2});
        }
      }

    }
  
  useEffect(() => { waitForLoad(); }, []);

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

      if (request.message === "update" && document.URL.indexOf("problemset") === -1) {
        //timeout is set because url changes before page does. prevents early scraping
        setTimeout(waitForLoad, 1500);
        sendResponse({message: "thanks"});
      }

      if (request.message === "leetCheck") {
        
        sendResponse({p_isleet: (document.URL.indexOf("leetcode.com/problems/") != 1 && document.URL.indexOf("problemset") === -1)});
      }

      
      return true;

    }
  );

  return <>
  </>;
}
