import React from 'react';

function Tag(props) {
  return (
    <div className="tag">
      {props.name}
    </div>
  );
}

function AddTag() {
  return (
    <div className="tag add-tag">
      +
    </div>
  );
}

function Tags(props) {

  const taglist = [];

  props.tags.forEach((tag) => {
      taglist.push(<Tag name={tag} />);
  });

  return (
    <div className="tagslist">
    <div className={props.level === "Easy" ? 'tag easy' : (props.level === "Medium" ? 'tag medium' : 'tag hard')}>{props.level}</div> 
    {taglist}
    <AddTag />
    </div>
  );
};

export default Tags;
