import React, { PureComponent } from "react";
import { Col } from "reactstrap";
import Now from "./Now";

export default class DataCards extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      avgTime: null,
      avgDistance: null
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.formatData(this.props.data);
    }
  }

  formatData = data => {
    let totalTime = 0;
    let totalDistance = 0;
    data.forEach(obj => {
      totalTime += obj.totalWalkTime;
      totalDistance += obj.totalDistance;
    });
    this.setState({
      avgTime: totalTime / data.length,
      avgDistance: +(totalDistance / data.length).toFixed(2)
    });
  };

  render() {
    return (
      <React.Fragment>
        <Col xl={3} md={6}>
          <div className="card flex-row align-items-center align-items-stretch border-0">
            <div className="col-4 d-flex align-items-center bg-primary-dark justify-content-center rounded-left">
              <em className="fas fa-coins fa-3x" />
            </div>
            <div className="col-8 py-3 bg-primary rounded-right">
              <div className="h2 mt-0">{this.props.points || 0}</div>
              <div className="text-uppercase">Points</div>
            </div>
          </div>
        </Col>
        <Col xl={3} md={6}>
          <div className="card flex-row align-items-center align-items-stretch border-0">
            <div className="col-4 d-flex align-items-center bg-purple-dark justify-content-center rounded-left">
              <em className="fas fa-stopwatch fa-3x" />
            </div>
            <div className="col-8 py-3 bg-purple rounded-right">
              <div className="h2 mt-0">
                {this.state.avgTime ? Math.floor(this.state.avgTime / 60) : 0}
                <small className="ml-2">MIN</small>
              </div>
              <div className="text-uppercase">Avg Walk Time</div>
            </div>
          </div>
        </Col>
        <Col xl={3} lg={6} md={12}>
          <div className="card flex-row align-items-center align-items-stretch border-0">
            <div className="col-4 d-flex align-items-center bg-green-dark justify-content-center rounded-left">
              <em className="fas fa-ruler fa-3x" />
            </div>
            <div className="col-8 py-3 bg-green rounded-right">
              <div className="h2 mt-0">
                {this.state.avgDistance ? this.state.avgDistance : 0}
                <small className="ml-2">MILES</small>
              </div>
              <div className="text-uppercase">Avg Walk Distance</div>
            </div>
          </div>
        </Col>
        <Col xl={3} lg={6} md={12} className="d-none d-sm-block">
          <div className="card flex-row align-items-center align-items-stretch border-0">
            <div className="col-4 d-flex align-items-center bg-green justify-content-center rounded-left">
              <div className="text-center">
                <Now format="MMMM" className="text-sm" />
                <br />
                <Now format="D" className="h2 mt0" />
              </div>
            </div>
            <div className="col-8 py-3 rounded-right">
              <Now format="dddd" className="text-uppercase" />
              <br />
              <Now format="h:mm" className="h2 mt0 mr-sm" />
              <Now format="a" className="text-muted text-sm" />
            </div>
          </div>
        </Col>
      </React.Fragment>
    );
  }
}
