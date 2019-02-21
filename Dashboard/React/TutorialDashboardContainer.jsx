import React, { PureComponent } from "react";
import { Modal, Button, ModalBody, Progress } from "reactstrap";
import DashboardContainer from "./DashboardContainer";
import PetForm from "../DynamicForms/Pets";
import ProfileForm from "../DynamicForms/Profile";

export default class TutorialDashboardContainer extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      modal: true,
      modalContent: null,
      pageNumber: 1,
      submitProfile: false,
      submitPet: false
    };
  }

  componentDidMount = () => {
    this.changeModalContent(this.state.pageNumber);
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.state.pageNumber !== prevState.pageNumber) {
      this.changeModalContent(this.state.pageNumber);
    }
  }

  toggle = () => {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  };

  nextPage = () => {
    const { pageNumber } = this.state;
    this.setState({
      pageNumber: pageNumber + 1
    });
  };

  submitChild = () => {
    const { pageNumber } = this.state;
    if (pageNumber === 2) {
      this.profile.handleSubmit();
    } else if (pageNumber === 3) {
      this.pet.handleSubmit();
    }
  };

  prevPage = () => {
    const { pageNumber } = this.state;
    this.setState({
      pageNumber: pageNumber - 1
    });
  };

  changeModalContent = page => {
    const content = this.modalPages[page];
    this.setState({
      modalContent: content
    });
  };

  cancelDialog = () => {
    this.setState({
      pageNumber: 4
    });
  };

  goToActivities = e => {
    e.preventDefault();
    this.props.history.push("/activities/me");
  };

  modalPages = {
    1: (
      <React.Fragment>
        <div className=" text-center bg-dark rounded-top">
          <div className="block-center mt-4 wd-xl">
            <img
              className="adapt-img mx-auto d-block"
              src="https://i.pinimg.com/originals/fb/15/f0/fb15f07243e81de329a17151300b5e99.png"
              alt="logo"
              width="260"
            />
          </div>
        </div>
        <ModalBody className="border-bottom">
          <p className="text-center py-5">
            Welcome to Good Dog! Lets get started by filling out your profile
            and your dog's profile.
          </p>
        </ModalBody>
        <div className="d-flex m-3">
          <div className="mx-auto">
            <Button color="primary" className="mr-3" onClick={this.nextPage}>
              Get Started
            </Button>
            <Button color="secondary" onClick={this.cancelDialog}>
              Skip For Now
            </Button>
          </div>
        </div>
      </React.Fragment>
    ),
    2: (
      <React.Fragment>
        <div className=" text-center bg-dark rounded-top">
          <div className="block-center mt-4 wd-xl">
            <img
              className="adapt-img mx-auto d-block"
              src="https://i.pinimg.com/originals/fb/15/f0/fb15f07243e81de329a17151300b5e99.png"
              alt="logo"
              width="260"
            />
          </div>
        </div>
        <ModalBody>
          <div className="mt-1 mb-3">
            <Progress value={33} />
          </div>

          <ProfileForm {...this.props} wizard={true} nextPage={this.nextPage} />
        </ModalBody>
      </React.Fragment>
    ),
    3: (
      <React.Fragment>
        <div className=" text-center bg-dark rounded-top">
          <div className="block-center mt-4 wd-xl">
            <img
              className="adapt-img mx-auto d-block"
              src="https://i.pinimg.com/originals/fb/15/f0/fb15f07243e81de329a17151300b5e99.png"
              alt="logo"
              width="260"
            />
          </div>
        </div>
        <ModalBody className="border-bottom">
          <div className="mt-1 mb-3">
            <Progress value={66} />
          </div>
          <PetForm
            {...this.props}
            wizard={true}
            last={true}
            prevPage={this.prevPage}
            nextPage={this.nextPage}
          />
        </ModalBody>
      </React.Fragment>
    ),
    4: (
      <React.Fragment>
        <div className=" text-center bg-dark rounded-top">
          <div className="block-center mt-4 wd-xl">
            <img
              className="adapt-img mx-auto d-block"
              src="https://i.pinimg.com/originals/fb/15/f0/fb15f07243e81de329a17151300b5e99.png"
              alt="logo"
              width="260"
            />
          </div>
        </div>
        <ModalBody className="border-bottom">
          <p className="text-center py-2">
            Would you like to start your first walk?
          </p>
        </ModalBody>
        <div className="d-flex m-3">
          <div className="mx-auto">
            <Button
              style={{
                backgroundColor: "#37bc9b",
                color: "#FFF"
              }}
            >
              <span onClick={this.goToActivities}>
                <i className="fas fa-paw"> Walk</i>
              </span>
            </Button>
            <Button
              type="button"
              color="secondary"
              className="ml-3"
              onClick={this.toggle}
            >
              Not Right Now
            </Button>
          </div>
        </div>
      </React.Fragment>
    )
  };

  render() {
    return (
      <React.Fragment>
        {" "}
        <Modal
          isOpen={this.state.modal}
          toggle={this.toggle}
          className="modal-lg"
        >
          {this.state.modalContent || ""}
        </Modal>
        <DashboardContainer {...this.props} />
      </React.Fragment>
    );
  }
}
