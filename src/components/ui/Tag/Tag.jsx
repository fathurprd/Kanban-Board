import React from "react";
import "./Tag.css";
const Tag = (props) => {
  return (
    <span
      className="tag"
      style={props?.color ? { "--tag-color": props.color } : undefined}
    >
      <i
        className="tag__dot"
        style={props?.color ? { backgroundColor: props.color } : undefined}
      />
      {props?.tagName}
    </span>
  );
};

export default Tag;
