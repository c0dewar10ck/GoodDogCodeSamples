import React from "react";

const PageSizeOption = ({ linksTo, text }) => {
  return <option value={linksTo}>{text}</option>;
};

export default PageSizeOption;
