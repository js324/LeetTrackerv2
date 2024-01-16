import { useEffect } from "react";

export default function App() {

  function parseTags(tagList) {
    let tags = [];
    for (const tag of tagList) {
      tags.push(tag.name);
    }
    return tags;
  }
  
  
  async function getData() {
    // check if this is a leetcode problem and not a problem set
    if (document.URL.indexOf("leetcode.com/problems/") != 1 && document.URL.indexOf("problemset") === -1) {

      //get the question name from the url
      let titleSlug = document.URL.substring(document.URL.indexOf("/problems/")+10);
      if (titleSlug.indexOf("/") != -1) {
        titleSlug = titleSlug.substring(0, titleSlug.indexOf("/"));
      }

      // set up a query for the needed data
      const query = `query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionFrontendId
          title
          titleSlug
          difficulty
          status
          topicTags {
            name
          }
        }
      }`;

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          variables: {
            titleSlug: titleSlug
          }
        })
      };

      let problemData;
      
      // perform this query 
      const fetchData = async () => {
        return fetch("https://leetcode.com/graphql", options)
        .then((response) => response.json())
        .then((data) => {problemData = data.data.question});}

      await fetchData();

      // refine the data
      let name = (problemData.questionFrontendId)+". "+ problemData.title;
      let tags = parseTags(problemData.topicTags);
      let isSolved = (problemData.status === "ac");
      let problemUrl = "https://leetcode.com/problems/" + problemData.titleSlug;


      // send the data back
      chrome.runtime.sendMessage({message: "process", p_name: name, p_difficulty: problemData.difficulty, p_tags: tags, p_solved: isSolved, url: problemUrl});
    }
    }
  
  useEffect(() => { getData(); }, []);

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

      if (request.message === "update" && document.URL.indexOf("problemset") === -1) {
        getData();
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
