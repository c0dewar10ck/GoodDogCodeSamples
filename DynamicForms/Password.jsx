import React, { PureComponent } from "react";
import { Form, FormGroup, Label, Input, Button } from "reactstrap";
import * as accountsService from "../../services/accountsService";
import * as schemas from "../../models/accountSchemas";
import { Formik } from "formik";
import * as prompts from "../NotificationMessage";

export default class ChangePassword extends PureComponent {
  constructor(props) {
    super(props);
    this.validation = schemas.GetChangePasswordSchema;
    this.userId = this.props.currentUser.id;
    this.state = {
      accountData: this.validation.initialValues
    };
  }

  onChangePasswordSuccess = () => {
    prompts.success({
      message: "Password Changed Successfully"
    });
    this.props.handleCancel && this.props.handleCancel();
  };

  onChangePasswordFail = () => {
    prompts.error({
      message: "The current password you provided is invalid"
    });
  };

  handleSubmit = (values, obj) => {
    values.id = this.userId;
    accountsService
      .changePassword(values.id, values)
      .then(this.onChangePasswordSuccess)
      .catch(this.onChangePasswordFail)
      .then(() => {
        obj.setSubmitting(false);
      });
  };

  render() {
    return (
      <Formik
        enableReinitialize={true}
        initialValues={this.state.accountData}
        onSubmit={this.handleSubmit}
        validationSchema={this.validation()}
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
                <div style={{ margin: "1rem 0" }}>
                  <Label for="oldPassword">Current Password</Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    value={values.oldPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.oldPassword && touched.oldPassword
                        ? "is-invalid"
                        : ""
                    }
                  />
                  {errors.oldPassword && touched.oldPassword && (
                    <span
                      className="invalid-feedback"
                      style={{ display: "block" }}
                    >
                      {errors.oldPassword}
                    </span>
                  )}
                </div>
                <div style={{ margin: "1rem 0" }}>
                  <Label for="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.password && touched.password ? "is-invalid" : ""
                    }
                  />
                  {errors.password && touched.password && (
                    <span
                      className="invalid-feedback"
                      style={{ display: "block" }}
                    >
                      {errors.password}
                    </span>
                  )}
                </div>
                <div style={{ margin: "1rem 0" }}>
                  <Label for="passwordConfirm">Confirm Password</Label>
                  <Input
                    id="passwordConfirm"
                    type="password"
                    value={values.passwordConfirm}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.passwordConfirm && touched.passwordConfirm
                        ? "is-invalid"
                        : ""
                    }
                  />
                  {errors.passwordConfirm && touched.passwordConfirm && (
                    <span
                      className="invalid-feedback"
                      style={{ display: "block" }}
                    >
                      {errors.passwordConfirm}
                    </span>
                  )}
                </div>
              </FormGroup>
              <div className="d-flex">
                <button
                  type="submit"
                  className="btn btn-primary ml-auto submitForm"
                  disabled={isSubmitting}
                >
                  Submit
                </button>
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
            </Form>
          );
        }}
      </Formik>
    );
  }
}
