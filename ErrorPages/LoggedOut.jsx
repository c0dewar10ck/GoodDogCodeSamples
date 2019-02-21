import React from "react";
import { withRouter } from "react-router";

const LoggedOut = ({ history }) => {
  const handleLoginButtonClick = e => {
    e.preventDefault();
    history.push("/login");
  };

  return (
    <div className="error-page">
      <div className="error-container">
        <div className="image-goodbye-cropped mx-auto" />
        <h2>See you soon...</h2>
        <p>
          Come back soon to keep earning points with your four-legged friends!
        </p>
        <div className="input-group mb-4" />
        <button
          className="btn btn-primary error-button"
          onClick={handleLoginButtonClick}
        >
          Log Back In
        </button>
      </div>
    </div>
  );
};

export default withRouter(LoggedOut);
