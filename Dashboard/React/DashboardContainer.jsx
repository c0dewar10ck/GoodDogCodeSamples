import React from "react";
import { Button } from "reactstrap";
import { Trans } from "react-i18next";

import ContentWrapper from "../Layout/ContentWrapper";
import DataDisplay from "./DataDisplay";

class DashboardContainer extends React.PureComponent {
  goToActivities = e => {
    e.preventDefault();
    this.props.history.push("/activities/me");
  };

  render() {
    let buttonStyle = {
      backgroundColor: "#37bc9b",
      color: "#FFF",
      fontSize: 20,
      fontFamily: "sans-serif"
    };
    return (
      <ContentWrapper>
        <div className="content-heading">
          <div>
            Dashboard
            <small>
              <Trans i18nKey="dashboard.WELCOME" />
            </small>
          </div>
          <div className="ml-auto">
            <Button style={buttonStyle}>
              <span onClick={this.goToActivities}>
                <i className="fas fa-paw"> Start A Walk</i>
              </span>
            </Button>
          </div>
        </div>
        <div>
          <DataDisplay {...this.props} />
        </div>
      </ContentWrapper>
    );
  }
}

export default DashboardContainer;
