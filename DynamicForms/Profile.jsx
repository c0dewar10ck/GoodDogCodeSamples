import React from "react";
import { Formik } from "formik";
import { Form, FormGroup, Label, Input, Button } from "reactstrap";
import * as userProfileService from "../../services/services.userProfiles";
import * as schemas from "../../models/profileSchemas";
import * as notificationMessage from "../NotificationMessage";
import FileUploader from "../Files/FileUploader";

export default class ProfileBasicForm extends React.PureComponent {
  constructor(props) {
    super(props);
    this.validation = schemas.getProfileSchema;
    this.state = {
      uploaderUrl: "",
      info: { ...props },
      profile: this.validation.initialValues
    };
    this.uid = this.props.currentUser.id;
  }

  componentDidMount() {
    userProfileService
      .getByUserId(this.uid)
      .then(this.onGetUserProfileSuccess)
      .catch(this.onGetUserProfileError);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.submitFlag !== this.props.submitFlag) {
      this.handleSubmit();
    }
  }

  onGetUserProfileSuccess = response => {
    this.setState({
      profile: response.item
    });
  };

  onGetUserProfileError = response => {
    console.log(response);
  };

  onAddUserProfileSuccess = vals => {
    this.props.updateProfilePic(vals.photoUrl);
    if (this.props.nextPage) this.props.nextPage();
    if (this.props.handleCancel) this.props.handleCancel();
    notificationMessage.success({
      message: "Your profile was successfully updated!"
    });
  };

  onAddUserProfileError = error => {
    console.log(error);
    notificationMessage.error({
      message: "Oops! Something went wrong."
    });
  };

  handleSubmit = (values, obj) => {
    if (!values.photoUrl === "") {
      notificationMessage.error({
        message: "Please upload profile picture."
      });
    }
    if (this.state.uploaderUrl) values.photoUrl = this.state.uploaderUrl;
    if (!this.state.profile.id) {
      userProfileService
        .add(values)
        .then(() => this.onAddUserProfileSuccess(values))
        .catch(this.onAddUserProfileError)
        .then(() => {
          obj && obj.setSubmitting(false);
        });
    } else {
      userProfileService
        .update(this.state.profile.id, values)
        .then(() => this.onAddUserProfileSuccess(values))
        .catch(this.onAddUserProfileError)
        .then(() => {
          obj && obj.setSubmitting(false);
        });
    }
  };

  handleChange = e => {
    this.setState({
      [e.target.id]: e.target.value
    });
  };

  d = response => {
    console.log(response.items[0].path);
    this.setState({ uploaderUrl: response.items[0].path });
  };

  render() {
    return (
      <Formik
        initialValues={this.state.profile}
        onSubmit={this.handleSubmit}
        validationSchema={this.validation()}
        enableReinitialize={true}
      >
        {props => {
          const {
            values,
            touched,
            errors,
            isSubmitting,
            handleChange,
            handleBlur,
            handleSubmit
          } = props;
          return (
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label for="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={values.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.firstName && touched.firstName ? "error" : ""
                  }
                />
                {errors.firstName && touched.firstName && (
                  <label className="error">{errors.firstName}</label>
                )}
                <Label for="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={values.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.lastName && touched.lastName ? "error" : ""}
                />
                {errors.lastName && touched.lastName && (
                  <label className="error">{errors.lastName}</label>
                )}
                <Label for="photoUrl">Photo URL *</Label>
                <FileUploader
                  responseHendler={this.d}
                  onChange={handleChange}
                  aspect={1 / 1}
                />
                {errors.photoUrl && touched.photoUrl && (
                  <label className="error">{errors.photoUrl}</label>
                )}
                <p>(*) Mandatory</p>
              </FormGroup>
              <div className="d-flex">
                {!this.props.wizard && (
                  <Button
                    color="primary"
                    className="ml-auto submitForm"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    Submit
                  </Button>
                )}
                {this.props.handleCancel && (
                  <Button
                    type="button"
                    color="secondary"
                    className="ml-2 submitForm"
                    onClick={this.props.handleCancel}
                  >
                    Cancel
                  </Button>
                )}
              </div>
              {this.props.wizard && (
                <div className="d-flex pt-3 border-top">
                  {this.props.prevPage && (
                    <Button color="primary" onClick={this.props.prevPage}>
                      Previous
                    </Button>
                  )}
                  <Button
                    color="primary"
                    className="ml-auto mx-3"
                    onClick={handleSubmit}
                  >
                    {this.props.last ? "Finish" : "Next"}
                  </Button>
                  <Button
                    type="button"
                    color="secondary"
                    onClick={this.props.nextPage}
                  >
                    Skip For Now
                  </Button>
                </div>
              )}
            </Form>
          );
        }}
      </Formik>
    );
  }
}
