import React, { PureComponent } from "react";
import { Row, Col } from "reactstrap";

import ActivityGraph from "./DataComponents/ActivityGraph";
import DataCards from "./DataComponents/DataCards";
import WeatherWidget from "./DataComponents/WeatherWidget";
import UserInfoCard from "./DataComponents/UserInfoCard";
import ActivityTimeline from "./DataComponents/ActivityTimeline";

import * as activityService from "../../services/activityService";
import * as pointsService from "../../services/pointsService";
import PetsDashCard from "./DataComponents/PetsDashCard";

export default class DataDisplay extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      range: 30,
      distance: false,
      data: [],
      points: null
    };
  }

  componentDidMount = () => {
    this.loadData();
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (prevState.range !== this.state.range) {
      this.loadData();
    }
  };

  loadData = () => {
    this.getData();
    this.getTotalPoints();
  };

  onGetActivityDataSuccess = response => {
    this.setState({ data: response.items });
  };

  onGetPointsSuccess = response => {
    this.setState({ points: response.item.totalPoints });
  };

  onFail = err => {
    console.error(err);
  };

  handleRangeSelect = (key, value) => {
    this.setState({ [key]: value });
  };

  toggleDistance = () => {
    this.setState({ distance: !this.state.distance });
  };

  getData = () => {
    let start = new Date();
    let end = new Date();
    end.setDate(end.getDate());
    start.setDate(start.getDate() - this.state.range);
    let endStr = end.toISOString();
    let startStr = start.toISOString();
    endStr = endStr.substr(0, 10) + " 23:59:59:999";
    startStr = startStr.substr(0, 10);

    let offset = start.getTimezoneOffset();

    const qStrings = {
      start: startStr,
      end: endStr,
      offset
    };

    activityService
      .getActivityDataRange(qStrings)
      .then(this.onGetActivityDataSuccess)
      .catch(this.onFail);
  };

  getTotalPoints = () => {
    pointsService
      .getById(this.props.currentUser.id)
      .then(this.onGetPointsSuccess)
      .catch(this.onFail);
  };

  render() {
    return (
      <React.Fragment>
        <Row>
          <DataCards
            {...this.props}
            data={this.state.data}
            points={this.state.points}
          />
        </Row>
        <Row>
          <Col xl={9}>
            <Row>
              <Col xl={12}>
                <ActivityGraph
                  handleRangeSelect={this.handleRangeSelect}
                  toggleDistance={this.toggleDistance}
                  range={this.state.range}
                  data={this.state.data}
                  distance={this.state.distance}
                  reloadData={this.loadData}
                />
              </Col>
            </Row>
            <Row>
              <Col xl={12}>
                <WeatherWidget />
              </Col>
            </Row>
          </Col>

          <Col xl={3}>
            <UserInfoCard {...this.props} />
            <PetsDashCard {...this.props} />
          </Col>
        </Row>
        <ActivityTimeline />
      </React.Fragment>
    );
  }
}
