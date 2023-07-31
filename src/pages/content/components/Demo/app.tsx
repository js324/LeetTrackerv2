import { useEffect } from "react";

export default function App() {

  chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {

      if (document.URL.indexOf("leetcode.com/problems/") != 1) {
        const name = document.querySelector("div.flex.h-full.items-center a.mr-2.text-label-1"); //get name

        const difficulty = document.querySelector("div.mt-3.flex.items-center.space-x-4 div"); //get difficulty

        const tags = document.querySelectorAll("div.overflow-hidden.transition-all.duration-500 div a.mr-4.rounded-xl.py-1.px-2.text-xs");
        const taglist = [];
        for (const tag of tags) {
          taglist.push(tag.textContent);
        }              

        sendResponse({p_isleet: true, p_name: name.textContent, p_difficulty: difficulty.textContent, p_tags: taglist});
      }

      sendResponse({p_isleet: false});
      
    }
  );

  return <>
  </>;
}
