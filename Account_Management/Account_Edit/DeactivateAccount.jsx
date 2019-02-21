import React, { PureComponent } from "react";
import { Button } from "reactstrap";
import * as alerts from "../NotificationMessage";
import * as accountsService from "../../services/accountsService";

export default class DeactivateAccount extends PureComponent {
  handleClick = () => {
    alerts.prompt(
      {
        title: "Are you sure you wish to deactivate your account?",
        text: "You may miss out on exciting new rewards...",
        icon: "warning",
        buttons: {
          cancel: "Nevermind",
          okay: { text: "Yes, I'm Sure", value: "okay" }
        },
        dangerMode: true
      },
      value => {
        switch (value) {
          case "okay":
            this.onDeactivateRequested();
            break;

          default:
            this.props.handleCancel && this.props.handleCancel();
        }
      }
    );
  };

  onDeactivateSuccess = () => {
    alerts.prompt(
      {
        title: "We're sorry to see you go",
        text: "We hope you'll return someday.",
        buttons: {
          okay: "Got it"
        }
      },
      () => this.props.history.push("/logout")
    );
  };

  onFail = err => {
    console.error(err);
    alerts.error("Oops! Something went wrong.");
  };

  onDeactivateRequested = () => {
    const payload = {
      id: this.props.currentUser.id,
      email: this.props.currentUser.name,
      statusId: 8
    };
    accountsService
      .updateStatus(payload)
      .then(this.onDeactivateSuccess)
      .catch(this.onFail);
    this.props.handleCancel();
  };

  render() {
    return (
      <Button color="danger" className="mb-5" onClick={this.handleClick}>
        Deactivate Account
      </Button>
    );
  }
}
