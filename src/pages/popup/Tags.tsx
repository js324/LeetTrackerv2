import React, {useState, useRef, useEffect} from "react";



function Tag(props) {
  
  function removeTag(){
    const templist = props.tags;
    templist.splice(props.id, 1);
    props.setTags(templist);
    props.refresh();
  }

  return (
    
    <div>
     
      <span className="tag">
        {props.name}
        <button className="delete-tag" onClick={removeTag}>

        <svg width="10.00" height="10.00" viewBox="0.00 0.00 100.00 100.00" xmlns="http://www.w3.org/2000/svg">
          <g strokeLinecap="round" >
            <path d="M10.15,10.73 C10.15,10.73 89.57,90.15 89.57,90.15" fill="none" strokeWidth="15.00" strokeOpacity="1.00" strokeLinejoin="round"/>
            <path d="M89.85,10.73 C89.85,10.73 10.43,90.15 10.43,90.15" fill="none" strokeWidth="15.00" strokeOpacity="1.00" strokeLinejoin="round"/>
          </g>
        </svg>

        </button>
      </span>
    </div>
  );
}

function AddTag(props) {

  const [isActive, setActive] = useState(false);
  const [newName, setNewName] = useState("NewTag");
  const inputRef = useRef();

  function makeTag() {
      setActive(true);
  }

  function pushTag() {
    if (newName.trim().length > 0) {
    props.tags.push(newName.trim());
    props.refresh();
    }
    cancelTag();
  }

  function cancelTag() {
    setActive(false);
    setNewName("NewTag");
  }

  return (
    <> 
      
      { (isActive) ?
        //active mode
      (<span className="tag">
        <form onSubmit={pushTag}>
        <span className="new-tag" ref={inputRef}  contentEditable={true} onInput={(e) => setNewName(e.currentTarget.textContent)} >NewTag</span>
        
        <button className="push-tag" onClick={cancelTag}>
          <svg width="10.00" height="10.00" viewBox="0.00 0.00 100.00 100.00" xmlns="http://www.w3.org/2000/svg">
            <g strokeLinecap="round" >
              <path d="M10.15,10.73 C10.15,10.73 89.57,90.15 89.57,90.15" fill="none" strokeWidth="15.00" strokeOpacity="1.00" strokeLinejoin="round"/>
              <path d="M89.85,10.73 C89.85,10.73 10.43,90.15 10.43,90.15" fill="none" strokeWidth="15.00" strokeOpacity="1.00" strokeLinejoin="round"/>
            </g>
          </svg>
        </button>
        <button type="submit" className="push-tag" >
        <svg width="10.00" height="10.00" viewBox="0.00 0.00 100.00 100.00" xmlns="http://www.w3.org/2000/svg">
        <g stroke-linecap="round" transform="translate(0.00, 1.00)">
        <path d="M7.42,60.36 C7.42,60.36 32.91,90.20 32.91,90.20 C32.91,90.20 92.58,7.42 92.58,7.42" fill="none" strokeWidth="15.00" strokeOpacity="1.00" strokeLinejoin="round"/>
        </g>
        </svg>

        </button>
        </form>
      </span>):
        //inactive mode
        (<button className="tag add-tag" tabIndex={0} onClick={makeTag}> 
          
          <svg width="10.00" height="10.00" viewBox="0.00 0.00 100.00 100.00" xmlns="http://www.w3.org/2000/svg">
          <g stroke-linecap="round" id="Layer_1">
          <path d="M49.86,8.12 C49.86,8.12 49.86,92.44 49.86,92.44" fill="none" strokeWidth="15.00" strokeOpacity="1.00" strokeLinejoin="round"/>
          <path d="M91.88,49.86 C91.88,49.86 7.56,49.86 7.56,49.86" fill="none" strokeWidth="15.00" strokeOpacity="1.00" strokeLinejoin="round"/>
          </g>
          </svg>
        </button>) }
        
    </>    
  );
}

function Tags(props) {

  return (
    <div className="tagslist">
    <div className={props.level === "Easy" ? 'tag easy' : (props.level === "Medium" ? 'tag medium' : 'tag hard')}>{props.level}</div> 
    {props.tags.map((tag, index) => (
      <Tag name={tag} id={index} tags={props.tags} setTags={props.setTags} refresh={props.refresh} />
    ))}
    <AddTag tags={props.tags} setTags={props.setTags} refresh={props.refresh}/>
    </div>
  );
};

export default Tags;
