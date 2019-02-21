import React from "react";

const NotFound = ({ history }) => {
  const handleHomepageClick = () => {
    history.push("/");
  };

  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-title">
          <h1>
            4<span />4
          </h1>
        </div>
        <h2>Oops! We couldn't find this page.</h2>
        <p>
          Sorry but the page you are looking for does not exist, has been
          removed, or is temporarily unavailable.
        </p>
        <div className="input-group mb-4">
          <input
            className="form-control"
            type="text"
            placeholder="Try again with a search"
          />
          <span className="input-group-append">
            <button className="btn btn-secondary" type="button">
              <em className="fa fa-search" />
            </button>
          </span>
        </div>
        <button
          className="btn btn-primary error-button"
          onClick={handleHomepageClick}
        >
          Return to Homepage
        </button>
      </div>
    </div>
  );
};

export default NotFound;
