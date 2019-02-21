import React, { PureComponent } from "react";
import {
  Collapse,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button
} from "reactstrap";
import ContentWrapper from "../Layout/ContentWrapper";
import Profile from "../DynamicForms/Profile";
import Password from "../DynamicForms/Password";
import Address from "../DynamicForms/Address";
import Account from "../DynamicForms/Account";
import DeactivateAccount from "./DeactivateAccount";
import * as addressService from "../../services/addressService";

export default class AccountEditContainer extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      collapse: {},
      aid: null,
      addressData: null
    };

    this.default = {
      personalInfo: false,
      accountInfo: false,
      address: false,
      password: false,
      deactivate: false
    };
  }

  componentDidMount() {
    this.setState({
      collapse: this.default
    });
    this.getAddress();
    window.scrollTo(0, 0);
  }

  getAddress = () => {
    addressService
      .getByUserId(this.props.currentUser.id)
      .then(this.onGetAddressSuccess);
  };

  onGetAddressSuccess = resp => {
    this.setState({
      aid: resp.item.id,
      addressData: resp.item
    });
  };

  updateAID = aid => {
    console.log(aid);
    this.setState({
      aid
    });
  };

  toggle = e => {
    e.preventDefault();
    let collapse = { ...this.default };
    collapse[e.target.getAttribute("name")] = !this.state.collapse[
      e.target.getAttribute("name")
    ];
    this.setState({ collapse });
  };

  closeAll = () => {
    this.setState({ collapse: { ...this.default } });
  };

  render() {
    return (
      <ContentWrapper>
        <div className="d-flex" style={{ marginBottom: "-75px" }}>
          <Button
            color="secondary"
            className="btn-block mb-5 mx-auto"
            style={{ width: "50%" }}
            onClick={() => this.props.history.goBack()}
          >
            I'm Finished
          </Button>
        </div>
        <Card className="mt-5">
          <CardHeader className="text-center dynamic-card-header">
            <h4 style={{ color: "white" }}>Edit Your Account</h4>
          </CardHeader>
          <CardBody>
            <div
              name="personalInfo"
              className="d-flex my-4"
              onClick={this.toggle}
              style={{ cursor: "pointer" }}
            >
              <h4 name="personalInfo">Edit Profile</h4>
              <a href="/" name="personalInfo" className="ml-auto">
                <i name="personalInfo" className="far fa-edit" />
              </a>
            </div>
            <Collapse isOpen={this.state.collapse.personalInfo}>
              <Profile {...this.props} handleCancel={this.closeAll} />
            </Collapse>
            <div
              name="accountInfo"
              className="d-flex my-4"
              onClick={this.toggle}
              style={{ cursor: "pointer" }}
            >
              <h4 name="accountInfo">Edit Account</h4>
              <a href="/" name="accountInfo" className="ml-auto">
                <i name="accountInfo" className="far fa-edit" />
              </a>
            </div>
            <Collapse isOpen={this.state.collapse.accountInfo}>
              <Account {...this.props} handleCancel={this.closeAll} />
            </Collapse>
            <div
              name="address"
              className="d-flex my-4"
              onClick={this.toggle}
              style={{ cursor: "pointer" }}
            >
              <h4 name="address">
                {!this.state.aid ? "Add Address" : "Change Address"}
              </h4>
              <a href="/" name="address" className="ml-auto">
                <i name="address" className="far fa-edit" />
              </a>
            </div>
            <Collapse isOpen={this.state.collapse.address}>
              <Address
                {...this.props}
                handleCancel={this.closeAll}
                updateAID={this.updateAID}
                addressData={this.state.addressData}
              />
            </Collapse>
            {!this.props.currentUser.extProviders && (
              <div>
                <div
                  name="password"
                  className="d-flex my-4"
                  onClick={this.toggle}
                  style={{ cursor: "pointer" }}
                >
                  <h4 name="password">Change Password</h4>
                  <a href="/" name="password" className="ml-auto">
                    <i name="password" className="far fa-edit" />
                  </a>
                </div>
                <Collapse isOpen={this.state.collapse.password}>
                  <Password {...this.props} handleCancel={this.closeAll} />
                </Collapse>
              </div>
            )}
            <div
              name="deactivate"
              className="d-flex my-4"
              onClick={this.toggle}
              style={{ cursor: "pointer" }}
            >
              <h4 name="deactivate">Deactivate Account</h4>
              <a href="/" name="deactivate" className="ml-auto">
                <i name="deactivate" className="far fa-edit" />
              </a>
            </div>
            <Collapse isOpen={this.state.collapse.deactivate}>
              <DeactivateAccount {...this.props} handleCancel={this.closeAll} />
            </Collapse>
          </CardBody>
          <CardFooter />
        </Card>
      </ContentWrapper>
    );
  }
}
