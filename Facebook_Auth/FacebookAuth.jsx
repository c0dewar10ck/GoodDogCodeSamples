import React from "react";
import { withRouter } from "react-router";
import * as accountsService from "../../services/accountsService";
import * as oauthService from "../../services/oauthService";

class FacebookAuth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false
    };
    this.provider = "Facebook";
  }

  componentDidMount() {
    this.checkForCurrent();
  }

  onFacebookLoginSuccess = () => {
    if (this.props.location.search) {
      let path = this.props.location.search.replace("?return=", "");
      this.props.history.push(path, {
        action: "USERLOGIN"
      });
    } else {
      this.props.history.push("/", {
        action: "USERLOGIN"
      });
    }
  };

  onFacebookLoginFail = data => {
    console.log(data);
  };

  facebookLogin = payload => {
    console.log(payload);
    accountsService
      .loginWithExt(payload)
      .then(this.onFacebookLoginSuccess)
      .catch(this.onFacebookLoginFail);
  };

  facebookAuth = () => {
    this.setState({
      submitting: true
    });
    oauthService.fbLoaded.promise.then(() => {
      window.FB.login(
        response => {
          this.gatherFacebookData(response);
        },
        { scope: "public_profile,email" }
      );
    });
  };

  gatherFacebookData = response => {
    if (response.status === "connected") {
      let payload = {};
      payload.provider = this.provider;
      payload.authToken = response.authResponse.accessToken;
      payload.externalId = response.authResponse.userID;
      window.FB.api("/me?fields=email,first_name,last_name,picture", data => {
        payload.data = JSON.stringify(data);
        payload.emailAddress = data.email;
        payload.firstName = data.first_name;
        payload.lastName = data.last_name;
        payload.photoUrl = data.picture.data.url;
        this.facebookLogin(payload);
      });
    }
  };

  checkForCurrent = () => {
    oauthService.fbLoaded.promise.then(() => {
      window.FB.getLoginStatus(response => {
        this.gatherFacebookData(response);
      });
    });
  };

  render() {
    return (
      <button
        className="btn btn-block btn-primary mt-3 facebook-login"
        onClick={this.facebookAuth}
        disabled={this.state.submitting}
      >
        <span className="float-left">
          <i className="fab fa-facebook-square" />
        </span>
        <span className="text-center">Continue With Facebook</span>
      </button>
    );
  }
}

export default withRouter(FacebookAuth);
