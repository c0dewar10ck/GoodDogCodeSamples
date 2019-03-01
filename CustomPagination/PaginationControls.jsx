import React from "react";
import PaginationLink from "./PaginationLink";

class PageControls extends React.Component {
  constructor(props) {
    super(props);
    this.paginationArray = [];
  }

  generatePaginationLink = (key, text, linksTo, disabled) => {
    return (
      <PaginationLink
        {...this.props}
        key={key}
        text={text}
        linksTo={linksTo}
        disabled={disabled}
      />
    );
  };

  generatePaginationArray = (data, callback) => {
    let output = [];
    if (data) {
      for (let i = 1; i <= data.totalPages; i++) {
        output.push(i);
      }
      this.paginationArray = output;
    }
    return callback();
  };

  populatePaginationControls = () => {
    let output = [];
    let pageIndex = this.props.data.pageIndex;

    let numberOfLinks =
      this.props.numberOfLinks > 2 ? this.props.numberOfLinks : 3;
    numberOfLinks = numberOfLinks % 2 === 0 ? numberOfLinks - 1 : numberOfLinks;
    let linkSplit = Math.ceil(numberOfLinks / 2);

    const isDisabled = linksTo => {
      return linksTo === pageIndex ? true : false;
    };

    if (this.paginationArray.length <= 1) {
      //1 or fewer pages
      return output;
    } else if (this.paginationArray.length <= numberOfLinks) {
      //n or fewer pages total where n = numberOfLinks
      let result = [];
      this.paginationArray.forEach(value => {
        result.push(
          this.generatePaginationLink(value, value, value - 1, isDisabled)
        );
      });
      output.push(result);
    } else if (pageIndex < linkSplit) {
      //layout when on first n pages where n = linkSplit
      let filteredArray = this.paginationArray.filter(
        (value, index) => index < numberOfLinks
      );
      output.push(this.populatePaginationlinks(filteredArray, isDisabled));
    } else if (pageIndex >= this.paginationArray.length - linkSplit) {
      //layout when on last n pages where n = linkSplit
      let filteredArray = this.paginationArray.filter(
        (value, index) =>
          index > this.paginationArray.length - numberOfLinks - 1
      );
      output.push(this.populatePaginationlinks(filteredArray, isDisabled));
    } else {
      //everything in the middle
      let filteredArray = this.paginationArray.filter(
        (value, index) =>
          index > pageIndex - linkSplit && index < pageIndex + linkSplit
      );
      output.push(this.populatePaginationlinks(filteredArray, isDisabled));
    }
    return output;
  };

  populatePaginationlinks = (filteredArray, isDisabled) => {
    let result = [];
    result.push(this.generatePaginationLink(Math.random(), "«", 0, isDisabled));
    filteredArray.forEach(value => {
      result.push(
        this.generatePaginationLink(value, value, value - 1, isDisabled)
      );
    });
    result.push(
      this.generatePaginationLink(
        Math.random(),
        "»",
        this.paginationArray.length - 1,
        isDisabled
      )
    );
    return result;
  };

  shouldComponentUpdate(prevProps) {
    return prevProps.data !== this.props.data ? true : false;
  }

  render() {
    return (
      <React.Fragment>
        <nav className="pagination-sm" aria-label="pagination">
          <ul className="pagination">
            {this.generatePaginationArray(
              this.props.data,
              this.populatePaginationControls
            ).map(element => element)}
          </ul>
        </nav>
      </React.Fragment>
    );
  }
}

export default PageControls;
