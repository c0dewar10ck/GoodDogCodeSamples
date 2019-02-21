import React from "react";
import { Input, Button } from "reactstrap";
import { Formik, Field } from "formik";
import * as petServices from "../../services/petServices";
import * as petSchemas from "../../models/petSchemas";
import "react-datepicker/dist/react-datepicker.css";
import FileUploader from "../Files/FileUploader";
import Select from "react-select";
import * as prompts from "../NotificationMessage";

// PetForm Start

export default class PetsBasicForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isUpdate: false,
      startDate: new Date(),
      modal: false,
      fileResponse: "",
      breedList: []
    };

    this.validation = petSchemas.petSchemas;
    this.state.pet = petSchemas.petSchemas.intitialValues;
    this.uid = this.props.currentUser.id;
  }

  componentDidMount = () => {
    petServices
      .getAllBreeds()
      .then(this.onBreedSuccess)
      .catch(this.onGetBreedsError);
    petServices
      .myPets()
      .then(this.onGetPetSuccess)
      .catch(this.onGetPetFail);
  };

  onGetPetSuccess = resp => {
    this.setState({
      pet: resp.items[0],
      isUpdate: true
    });
  };

  onGetPetFail = err => {
    console.error(err);
  };

  onGetBreedsError = err => {
    console.log(err, "Error getting breed info.");
  };

  onBreedSuccess = response => {
    let breedResponse = response.data.items;
    let dropdownOption = breedResponse.map(breedResponse => {
      return { value: breedResponse.id, label: breedResponse.name };
    });
    this.setState({ breedList: dropdownOption });
  };

  onSubmitSuccess = () => {
    this.props.nextPage && this.props.nextPage();
    prompts.success({ message: "Your pet was successfully updated!" });
    this.props.handleCancel && this.props.handleCancel();
  };

  onSubmitFail = err => {
    prompts.error({ message: "Oops! Something went wrong." });
    console.error(err);
  };

  handleSubmit = (values, obj) => {
    if (!values.photoUrl === "") {
      prompts.error({
        message: "Please upload profile picture."
      });
    }
    if (this.state.fileResponse)
      values.primaryPhotoUrl = this.state.fileResponse;
    this.state.isUpdate
      ? petServices
          .updatePet(values.id, values)
          .then(this.onSubmitSuccess)
          .catch(this.onSubmitFail)
      : petServices
          .addPet(values)
          .then(this.onSubmitSuccess)
          .catch(this.onSubmitFail);

    obj && obj.setSubmitting(false);
  };

  d = response => {
    console.log(response.items[0].path);
    this.setState({ fileResponse: response.items[0].path });
  };

  render() {
    const options = this.state.breedList;
    return (
      <Formik
        initialValues={this.state.pet}
        onSubmit={this.handleSubmit}
        enableReinitialize={true}
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
            handleSubmit,
            setFieldValue,
            setFieldTouched
          } = props;
          return (
            <div className="container">
              <form className="form" onSubmit={handleSubmit}>
                <div className="form-group row">
                  <label
                    className="col-xl-2 col-form-label"
                    htmlFor="name"
                    style={{ display: "block" }}
                  >
                    Name
                  </label>
                  <div className="col-xl-10">
                    <Input
                      id="name"
                      placeholder="Enter your Pets Name"
                      type="text"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={
                        errors.firstName && touched.firstName ? "error" : ""
                      }
                    />
                  </div>
                  {errors.name && touched.name && (
                    <div className="input-feedback" style={{ color: "red" }}>
                      {errors.name}
                    </div>
                  )}
                </div>

                <div className="form-group row">
                  <label
                    className="col-xl-2 col-form-label"
                    htmlFor="dob"
                    style={{ display: "block" }}
                  >
                    Date of Birth
                  </label>
                  <div className="col-xl-10">
                    <Input
                      id="dob"
                      placeholder=" MM/dd/YYYY"
                      type="date"
                      value={values.dob}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="form-control"
                    />
                  </div>
                  {errors.dob && touched.dob && (
                    <div className="input-feedback" style={{ color: "red" }}>
                      {errors.dob}
                    </div>
                  )}
                </div>

                <div className="form-group row">
                  <label
                    className="col-xl-2 col-form-label"
                    htmlFor="weight"
                    style={{ display: "block" }}
                  >
                    Weight lbs.
                  </label>
                  <div className="col-xl-10">
                    <Input
                      id="weight"
                      placeholder="Weight lbs."
                      type="number"
                      step="0.05"
                      value={values.weight}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="form-control"
                    />
                  </div>
                  {errors.weight && touched.weight && (
                    <div className="input-feedback" style={{ color: "red" }}>
                      {errors.weight}
                    </div>
                  )}
                </div>

                <div className="form-group row">
                  <label
                    className="col-xl-2 col-form-label"
                    htmlFor="appetite"
                    style={{ display: "block" }}
                  >
                    Appetite
                  </label>
                  <div className="col-xl-10">
                    <select
                      id="appetite"
                      value={values.appetite}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ display: "block" }}
                      className="form-control"
                    >
                      <option value="" label="Select an Appetite" />
                      <option value="Low" label="Low" />
                      <option value="Average" label="Average" />
                      <option value="High" label="High" />
                    </select>
                  </div>
                  {errors.appetite && touched.appetite && (
                    <div className="input-feedback" style={{ color: "red" }}>
                      {errors.appetite}
                    </div>
                  )}
                </div>

                <div className="form-group row">
                  <label
                    className="col-xl-2 col-form-label"
                    htmlFor="breedId"
                    style={{ display: "block" }}
                  >
                    Breed
                  </label>
                  <div className="col-xl-10 form-group">
                    <Field
                      name="breedId"
                      value={values.breedId}
                      render={({ field }) => (
                        <Select
                          {...field}
                          onChange={value =>
                            setFieldValue("breedId", value.value)
                          }
                          onBlur={() => setFieldTouched("options", true)}
                          options={options}
                          value={values.options}
                        />
                      )}
                    />
                  </div>
                  {errors.breedId && touched.breedId && (
                    <label className="error">{errors.breedId} </label>
                  )}
                </div>

                {/* File Uploader Gurgens FileUploader*/}
                <div className="form-group row">
                  <label
                    className="col-xl-2 col-form-label"
                    htmlFor="Upload Picture"
                    style={{ display: "block" }}
                  >
                    Upload Picture
                  </label>
                  <div className="col-xl-10">
                    <FileUploader modal={true} responseHendler={this.d} />
                  </div>
                  {errors.primaryPhotoUrl && touched.primaryPhotoUrl && (
                    <div className="Input-feedback" style={{ color: "red" }}>
                      {errors.primaryPhotoUrl}
                    </div>
                  )}
                </div>
                {!this.props.wizard && (
                  <div className="form-group row d-flex">
                    <Button
                      color="primary"
                      type="submit"
                      className="ml-auto"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "working.." : "Submit"}
                    </Button>
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
                )}
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
              </form>
            </div>
          );
        }}
      </Formik>
    );
  }
}
