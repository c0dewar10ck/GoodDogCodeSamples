import React, { Component } from "react";
import * as moment from "moment";

export default class Now extends Component {
  state = {
    currentTime: null,
    format: ""
  };

  componentDidMount() {
    this.updateTime();
    this.interval = setInterval(this.updateTime, 1000);
  }

  componentWillUnmount() {
    if (this.interval) clearInterval(this.interval);
  }

  updateTime = () => {
    this.setState({
      currentTime: moment(new Date()).format(this.props.format)
    });
  };

  render() {
    return (
      <div {...this.props} style={{ display: "inline-block" }}>
        {this.state.currentTime}
      </div>
    );
  }
}
