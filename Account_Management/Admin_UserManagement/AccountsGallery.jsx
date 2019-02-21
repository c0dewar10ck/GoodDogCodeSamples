import React, { Suspense, Fragment } from "react";
import { Row } from "reactstrap";
import PageLoader from "../Common/PageLoader";
import AccountCard from "./AccountCard";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import EmailForm from "../EmailForm";

class AccountsGallery extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false
    };
  }

  shouldComponentUpdate(nextState) {
    return this.state.modal !== nextState;
  }

  onModalRequested = () => {
    this.setState({
      modal: true
    });
  };

  displayAccountCard = (account, index) => {
    return (
      <AccountCard
        {...this.props}
        key={account.id}
        index={index}
        account={account}
        handleModalReq={this.onModalRequested}
      />
    );
  };

  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  };

  emailFormClose = () => {
    this.toggle();
  };

  render() {
    const closeBtn = (
      <button className="close" onClick={this.toggle}>
        &times;
      </button>
    );

    return (
      <Fragment>
        <Suspense fallback={<PageLoader />}>
          <Row className="m-5">
            {this.props.accountsArray.map(this.displayAccountCard)}
          </Row>
        </Suspense>
        <Modal
          {...this.state.modal}
          isOpen={this.state.modal}
          toggle={this.toggle}
        >
          <ModalHeader toggle={this.toggle} close={closeBtn}>
            Send Email
          </ModalHeader>
          <ModalBody>
            <EmailForm emailClose={this.emailFormClose} />
          </ModalBody>
          <ModalFooter />
        </Modal>
      </Fragment>
    );
  }
}

export default AccountsGallery;
