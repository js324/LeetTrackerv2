import { useEffect } from "react";

export default function App() {

  chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {

      console.log("hello!");

      if (document.URL.indexOf("leetcode.com/problems/") != 1) {
        const name = document.querySelector("div.flex.h-full.items-center a.mr-2.text-label-1"); //get name

        var solved = document.querySelector("div.text-green-s svg path");
        if (!solved)
          solved = document.querySelector("span.text-green-s");
        
        const solvestatus = (solved) ? 1 : 0;

        const difficulty = document.querySelector("div.mt-3.flex.items-center.space-x-4 div"); //get difficulty

        const tags = document.querySelectorAll("div.overflow-hidden.transition-all.duration-500 div a.mr-4.rounded-xl.py-1.px-2.text-xs"); //get tags
        const taglist = []; //process tags into string array
        for (const tag of tags) {
          taglist.push(tag.textContent);
        }              

        if (name) {
          sendResponse({p_isleet: true, p_name: name.textContent, p_difficulty: difficulty.textContent, p_tags: taglist, p_solved: solvestatus});
        } else {
          if (document.URL.indexOf("/submissions/") != 1)
            sendResponse({p_isleet: true, p_name: " x ", p_solved: solvestatus});
          else 
          sendResponse({p_isleet: true, p_name: " x "});
        }
          

        return true;
      }

      sendResponse({p_isleet: false});
      
      return true;
    }
  );

  return <>
  </>;
}
