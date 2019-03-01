import React, { Component } from "react";
import SelectWrapper from "../../components/Accounts/SelectWrapper";

export default class PageSizeControls extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.paginationArray = [];
  }

  handleChangeSelect = (key, value) => {
    this.setState({ [key]: value });
    if (this.props.pageSize !== value) {
      this.props.changePageSize(value);
    }
  };

  generatePageSizeOptions = pageSizeArray => {
    let output = [];
    pageSizeArray.forEach((val, index, origArr) => {
      if (index !== origArr.length - 1) {
        output.push({ value: val, label: val });
      } else {
        output.push({ value: val, label: "All" });
      }
    });
    return output;
  };

  generatePaginationArray = (response, callback) => {
    let output = [];
    if (response) {
      for (let i = 1; i <= response.totalPages; i++) {
        output.push(i);
      }
      this.paginationArray = output;
    }
    return callback();
  };

  generatePageSizeArray = (startingValue, desiredAddend) => {
    let pageSizeArr = [startingValue];
    let i = 0;

    while (pageSizeArr[i] + desiredAddend < this.props.response.totalCount) {
      pageSizeArr.push(pageSizeArr[i] + desiredAddend);
      i++;
    }

    pageSizeArr.push(this.props.response.totalCount);
    return pageSizeArr;
  };

  shouldComponentUpdate(prevProps) {
    return prevProps.response !== this.props.response ? true : false;
  }

  render() {
    const pageSizeOptions = this.generatePageSizeOptions(
      this.generatePageSizeArray(
        this.props.startingSize,
        this.props.startingSize
      )
    );
    return (
      <form style={{ width: "100px", height: "35px" }}>
        <SelectWrapper
          options={pageSizeOptions}
          name="pageSize"
          value={this.props.startingSize}
          onChange={this.handleChangeSelect}
        />
      </form>
    );
  }
}
