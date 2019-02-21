import React, { PureComponent } from "react";
import { Card, CardHeader, CardBody, Button, Row, Col } from "reactstrap";
import { Line as LineChart } from "react-chartjs-2";

import CardTool from "./CardTool";
import SelectWrapper from "../../Accounts/SelectWrapper";

export default class ActivityGraph extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      graphData: {
        labels: [],
        datasets: []
      }
    };

    this.options = {
      legend: {
        display: true
      },
      scales: {
        yAxes: [
          {
            gridLines: {
              display: false
            },
            ticks: {
              beginAtZero: true
            }
          }
        ],
        xAxes: [
          {
            gridLines: {
              display: false
            },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 7
            }
          }
        ]
      }
    };

    this.timeData = [
      {
        label: "Total Time Walked (minutes)",
        backgroundColor: "rgba(114,102,186,0.2)",
        borderColor: "rgba(114,102,186,1)",
        pointBorderColor: "#fff",
        data: []
      }
    ];

    this.labels = [];

    this.distanceData = [
      {
        label: "Total Distance Walked (miles)",
        backgroundColor: "rgba(35,183,229,0.2)",
        borderColor: "rgba(35,183,229,1)",
        pointBorderColor: "#fff",
        data: []
      }
    ];
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.distance !== this.props.distance) {
      this.updateGraph();
    }

    if (prevProps.data !== this.props.data) {
      this.formatDataForGraph(this.props.data);
    }
  };

  updateGraph = () => {
    let data = { ...this.state.graphData };
    data.datasets = !this.props.distance ? this.timeData : this.distanceData;
    data.labels = this.labels;
    if (this.props) this.setState({ graphData: data });
  };

  formatDataForGraph = rangeData => {
    let hash = {};
    let data = { ...this.state.graphData };

    this.setupHashMap(hash);

    rangeData.forEach(obj => {
      if (typeof hash[obj.date.substr(5, 5)] === "object") {
        hash[obj.date.substr(5, 5)].time += obj.totalWalkTime / 60;
        hash[obj.date.substr(5, 5)].distance += obj.totalDistance;
      }
    });

    this.formatYValues(hash, "TIME");
    this.formatYValues(hash, "DISTANCE");

    this.labels = Object.keys(hash);

    this.setState({ graphData: data }, () => this.updateGraph());
  };

  setupHashMap(hash) {
    let dataArr = [];
    for (let i = this.props.range - 1; i >= 0; i--) {
      let date = new Date();
      let offset = new Date().getTimezoneOffset();
      date.setMinutes(date.getMinutes() - offset);
      date.setDate(date.getDate() - i);
      dataArr.push(date.toISOString());
    }

    dataArr.forEach(date => {
      hash[date.substr(5, 5)] = { time: 0, distance: 0 };
    });
  }

  formatYValues(hash, target) {
    let dataArr;
    if (target === "TIME") {
      dataArr = [...this.timeData];
      this.timeData = dataArr;
      dataArr[0].data = [];
      for (let key in hash) {
        dataArr[0].data.push(hash[key].time);
      }
    } else if (target === "DISTANCE") {
      dataArr = [...this.distanceData];
      this.distanceData = dataArr;
      dataArr[0].data = [];
      for (let key in hash) {
        dataArr[0].data.push(hash[key].distance);
      }
    }
  }

  render() {
    const rangeOptions = [
      { value: 7, label: "Last 7 Days" },
      { value: 30, label: "Last 30 Days" },
      { value: 120, label: "Last 4 Months" },
      { value: 365, label: "This Year" }
    ];
    return (
      <React.Fragment>
        <Card className="card-default">
          <Row className="mt-3 mb-2 mx-1">
            <Col lg={6} className="mb-1">
              <SelectWrapper
                options={rangeOptions}
                name="range"
                value={this.props.range}
                onChange={this.props.handleRangeSelect}
              />
            </Col>
            <Col lg={3} className="mb-1">
              <Button
                color="secondary"
                className="ml-auto mr-1 btn-block"
                onClick={this.props.toggleDistance}
                disabled={!this.props.distance}
              >
                Time
              </Button>
            </Col>
            <Col lg={3} className="mb-2">
              <Button
                color="secondary"
                className="mr-5 btn-block"
                onClick={this.props.toggleDistance}
                disabled={this.props.distance}
              >
                Distance
              </Button>
            </Col>
          </Row>
        </Card>
        <Card className="card-default">
          <CardHeader>
            <span className="card-title">My Walk Stats</span>
            <CardTool
              refresh
              onRefresh={(_, done) => {
                this.props.reloadData();
                setTimeout(done, 2000);
              }}
            />
          </CardHeader>
          <CardBody style={{ marginTop: "-25px", position: "relative" }}>
            <LineChart
              data={this.state.graphData}
              options={this.options}
              responsive={true}
              width={600}
              height={250}
            />
          </CardBody>
        </Card>
      </React.Fragment>
    );
  }
}
