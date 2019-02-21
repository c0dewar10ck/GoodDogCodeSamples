import React, { PureComponent } from "react";
import { Card, CardHeader, CardBody } from "reactstrap";

import * as accountsService from "../../../services/accountsService";
import * as profilesService from "../../../services/services.userProfiles";

class UserInfoCard extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      accountData: {},
      profileData: {}
    };
  }

  componentDidMount = () => {
    this.getUserData(this.props.currentUser.id);
  };

  onGetAccountSuccess = data => {
    this.setState({
      accountData: data.item
    });
  };

  onGetProfileSuccess = data => {
    this.setState({
      profileData: data.item
    });
  };

  onFail = err => {
    console.error(err);
  };

  getUserData(id) {
    this.getAccountById(id);
    this.getProfileByUserId(id);
  }

  getAccountById(id) {
    accountsService
      .getAccount(id)
      .then(this.onGetAccountSuccess)
      .catch(this.onFail);
  }

  getProfileByUserId(id) {
    profilesService
      .getByUserId(id)
      .then(this.onGetProfileSuccess)
      .catch(this.onFail);
  }

  handleEditClick = e => {
    e.preventDefault();
    this.props.history.push("/myaccount/edit");
  };

  render() {
    return (
      <Card className="card-default">
        <CardHeader className="d-flex">
          <span>My Info</span>
          <a
            href="/"
            className="ml-auto"
            onClick={e => this.handleEditClick(e)}
          >
            <i className="far fa-edit" />
          </a>
        </CardHeader>
        <CardBody className="text-center mb-3">
          <img
            className="img-thumbnail rounded-circle thumb128 mb-3"
            src={
              this.state.profileData.photoUrl ||
              "https://via.placeholder.com/50"
            }
            alt="avatar"
          />
          <div>
            <h4 className="m-1">
              {this.state.profileData.firstName}{" "}
              {this.state.profileData.lastName}
            </h4>
            <strong className="m-1">{this.state.accountData.userName}</strong>
            <p>{this.state.accountData.emailAddress}</p>
          </div>
        </CardBody>
      </Card>
    );
  }
}

export default UserInfoCard;
