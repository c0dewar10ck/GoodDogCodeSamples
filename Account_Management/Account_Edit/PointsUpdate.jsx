import React, { PureComponent } from "react";
import {
  Form,
  FormGroup,
  Label,
  Input,
  Card,
  CardHeader,
  CardBody
} from "reactstrap";
import { Formik } from "formik";
import * as pointsService from "../../services/pointsService";
import * as prompts from "../NotificationMessage";

export default class AccountUpdate extends PureComponent {
  constructor(props) {
    super(props);
    this.uid = this.props.match.params.uid;
    this.state = {
      accountData: {},
      currentPoints: ""
    };
  }

  componentDidMount() {
    this.getCurrentPoints();
  }

  onUpdatePointsSuccess = vals => {
    prompts.success({ message: "Updated Successfully!" });
    let { currentPoints } = this.state;
    currentPoints += vals.pointsToAdd;
    this.setState({ currentPoints });
  };

  handleSubmit = (values, obj) => {
    values.userId = this.uid;
    pointsService
      .add(values)
      .then(() => this.onUpdatePointsSuccess(values))
      .catch(this.onFail)
      .then(obj.setSubmitting(false));
  };

  handleCancelClick = () => {
    this.props.history.goBack();
  };

  onGetPointsSuccess = resp => {
    let currentPoints = resp.item.totalPoints;
    this.setState({ currentPoints });
  };

  onFail = err => {
    prompts.error({ message: "Oops! Something went wrong." });
    console.error(err);
  };

  getCurrentPoints = () => {
    pointsService
      .getById(this.uid)
      .then(this.onGetPointsSuccess)
      .catch(this.onFail);
  };

  render() {
    return (
      <Card className="card-flat">
        <CardHeader className="text-center dynamic-card-header">
          <h3 style={{ color: "white" }}>Award Points Manually</h3>
        </CardHeader>
        <CardBody>
          <Formik
            enableReinitialize={true}
            initialValues={{ pointsToAdd: "" }}
            onSubmit={this.handleSubmit}
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
                      <Label for="pointsToAdd">
                        How Many Points Would You Like To Award?
                      </Label>
                      <Input
                        id="pointsToAdd"
                        type="number"
                        value={values.pointsToAdd}
                        placeholder="0"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={
                          errors.pointsToAdd && touched.pointsToAdd
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {errors.pointsToAdd && touched.pointsToAdd && (
                        <span
                          className="invalid-feedback"
                          style={{ display: "block" }}
                        >
                          {errors.pointsToAdd}
                        </span>
                      )}
                    </div>
                  </FormGroup>
                  {this.state.currentPoints && (
                    <div>
                      <strong>Current Total: </strong>
                      {this.state.currentPoints}
                    </div>
                  )}
                  <div className="d-flex">
                    <button
                      type="submit"
                      className="btn btn-primary ml-auto submitForm"
                      disabled={isSubmitting}
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      className="btn btn-default ml-2 submitForm"
                      onClick={this.handleCancelClick}
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </CardBody>
      </Card>
    );
  }
}
