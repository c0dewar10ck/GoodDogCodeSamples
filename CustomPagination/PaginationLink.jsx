import React from "react";

const PaginationLink = props => {
  const handleclick = () => props.changePageIndex(props.linksTo);

  const computeClass = () => {
    if (props.disabled(props.linksTo) && props.text - 1 !== props.linksTo) {
      return "page-item disabled";
    } else if (
      props.disabled(props.linksTo) &&
      props.linksTo === props.text - 1
    ) {
      return "page-item active";
    } else {
      return "page-item";
    }
  };

  return (
    <li className={computeClass()}>
      <button
        className="page-link"
        onClick={handleclick}
        style={{ height: "35px", width: "32px" }}
      >
        <span aria-hidden="true">{props.text}</span>
      </button>
    </li>
  );
};

export default PaginationLink;
