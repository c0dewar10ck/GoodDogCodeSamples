import React, { PureComponent, Suspense, lazy } from "react";
import ContentWrapper from "../Layout/ContentWrapper";
import PageLoader from "../Common/PageLoader";
import PageControls from "../PageControls/PaginationControls";
import PageSizeControls from "../PageControls/PageSizeControls";
import SearchBar from "../SearchBar/SearchBar";
import FilterSidebar from "../FilterSidebar/FilterSidebar";
import * as accountsService from "../../services/accountsService";

import { Row, Col } from "reactstrap";

const AccountsGallery = lazy(() => import("./AccountsGallery"));

export default class AccountsDisplayContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      response: {}
    };

    this.state.filterMode = {
      active: false,
      filters: []
    };
    this.state.filteredPage = null;

    this.initialValues = {
      pageIndex: 0,
      pageSize: 9
    };
    this.searchMode = {
      active: false,
      query: ""
    };
  }

  onGetAccountsSuccess = data => {
    this.setState({
      response: data.item,
      pageIndex: data.item.pageIndex,
      pageSize: data.item.pageSize,
      filteredPage:
        this.state.filterMode.active && this.filterResults(data.item.pagedItems)
    });
  };

  onGetAccountsFail = error => {
    console.log(error);
  };

  onSearchAccountsSuccess = data => {
    this.setState({
      response: data.item,
      pageIndex: data.item.pageIndex,
      pageSize: data.item.pageSize,
      noResults: false,
      filteredPage:
        this.state.filterMode.active && this.filterResults(data.item.pagedItems)
    });
  };

  onSearchAccountsFail = error => {
    console.log(error);
    this.setState({
      noResults: true
    });
  };

  handleSearchSubmit = (e, query) => {
    e.preventDefault();
    let requestObj = { ...this.state };
    requestObj.pageIndex = this.initialValues.pageIndex;

    this.searchAccounts(query, requestObj);
    this.searchMode = {
      active: !query ? false : true,
      query: query
    };
  };

  handleSearchCancel = () => {
    this.searchMode = {
      active: false,
      query: ""
    };
    this.setState({
      pageIndex: 0,
      noResults: false
    });
    this.getAll(this.state);
  };

  handleFilterChange = (status, filters) => {
    this.setState(
      {
        filterMode: {
          active: status,
          filters: filters
        }
      },
      () => {
        this.setState({
          filteredPage: status
            ? this.filterResults(this.state.response.pagedItems)
            : null
        });
      }
    );
  };

  searchAccounts = (query, requestObj) => {
    const queryStrings = {
      q: query,
      pageIndex: requestObj.pageIndex,
      pageSize: requestObj.pageSize
    };
    accountsService
      .searchAccounts(queryStrings)
      .then(this.onSearchAccountsSuccess)
      .catch(this.onSearchAccountsFail);
  };

  getAll(requestObj) {
    const queryStrings = {
      pageIndex: requestObj.pageIndex,
      pageSize: requestObj.pageSize
    };
    accountsService
      .getAccounts(queryStrings)
      .then(this.onGetAccountsSuccess)
      .catch(this.onGetAccountsFail);
  }

  processPageIndexChange = index => {
    let requestObj = { ...this.state };
    requestObj.pageIndex = index;
    if (!this.searchMode.active) {
      this.getAll(requestObj);
    } else {
      this.searchAccounts(this.searchMode.query, requestObj);
    }
  };

  processPageSizeChange = size => {
    let requestObj = { ...this.state };
    requestObj.pageIndex = this.initialValues.pageIndex;
    requestObj.pageSize = size;
    if (!this.searchMode.active) {
      this.getAll(requestObj);
    } else {
      this.searchAccounts(this.searchMode.query, requestObj);
    }
  };

  doesAccountMatch = (account, filterObj) => {
    if (filterObj.isConfirmed) {
      if (account.isConfirmed === true && filterObj.isConfirmed !== "true")
        return false;
      if (account.isConfirmed === false && filterObj.isConfirmed !== "false")
        return false;
    }
    if (filterObj.statusId) {
      if (filterObj.statusId !== account.statusId) {
        return false;
      }
    }
    return true;
  };

  filterResults = accounts => {
    let output = accounts;
    if (this.state.filterMode.active) {
      output = accounts.filter(account =>
        this.doesAccountMatch(account, this.state.filterMode.filters)
      );
    }
    return output;
  };

  componentDidMount() {
    this.getAll(this.initialValues);
  }

  render() {
    return (
      <Suspense fallback={<PageLoader />}>
        <ContentWrapper>
          <div className="content-heading d-flex">User Accounts</div>
          <Row>
            <Col lg="9">
              <SearchBar
                {...this.props}
                handleSearchSubmit={this.handleSearchSubmit}
                handleSearchCancel={this.handleSearchCancel}
                searchMode={this.searchMode}
              />
              {!this.state.noResults ? (
                <React.Fragment>
                  <Row>
                    <Col lg="4">
                      <PageSizeControls
                        {...this.props}
                        response={this.state.response}
                        startingSize={this.initialValues.pageSize}
                        changePageSize={this.processPageSizeChange}
                      />
                    </Col>
                    <Col lg="4" className="text-center">
                      {this.state.filterMode.active && (
                        <h4 className="ml-auto">Page Filter Active</h4>
                      )}
                    </Col>
                    <Col lg="4" className="d-flex">
                      <div className="ml-auto">
                        <PageControls
                          {...this.props}
                          data={this.state.response}
                          numberOfLinks={5}
                          changePageIndex={this.processPageIndexChange}
                        />
                      </div>
                    </Col>
                  </Row>

                  <AccountsGallery
                    {...this.props}
                    accountsArray={
                      this.state.filteredPage ||
                      this.state.response.pagedItems ||
                      []
                    }
                  />
                </React.Fragment>
              ) : (
                <h2>No Results</h2>
              )}
            </Col>
            <Col lg="3">
              <FilterSidebar changeFilter={this.handleFilterChange} />
            </Col>
          </Row>
        </ContentWrapper>
      </Suspense>
    );
  }
}
