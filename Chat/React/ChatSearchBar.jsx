import React, { PureComponent } from "react";

export default class ChatSearchBar extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      query: "",
      data: [],
      hidden: false
    };
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (prevState.query !== this.state.query) {
      if (this.state.query.length > 0) {
        this.getResults();
      } else {
        this.setState({ data: [] });
      }
    }
  };

  getResults = () => {
    let propData = { ...this.props.data };
    let data = [];

    Object.keys(propData).map(
      key =>
        propData[key].name
          .toLowerCase()
          .includes(this.state.query.toLowerCase()) && data.push(propData[key])
    );

    this.setState({ data });
  };

  mapData = datum => {
    if (datum.id === this.props.currentUser.id) return;
    return (
      <div
        style={{
          borderBottom: "1px solid rgba(0,0,0,0.1)",
          padding: "10px",
          display: "flex",
          cursor: "pointer"
        }}
        key={datum.id}
        onClick={e => this.handleClick(e, datum)}
      >
        <img
          className="img-thumbnail rounded-circle thumb64"
          src={datum.photo}
          alt="Avatar"
        />
        <div className="d-flex flex-column my-auto px-3">
          <h6 className="mb-0">{datum.name}</h6>
        </div>
      </div>
    );
  };

  handleClick = (e, datum) => {
    this.setState({
      query: "",
      data: [],
      hidden: true
    });
    this.props.handleUserSelection(datum);
  };

  render() {
    const style = {
      borderRadius: "0px",
      marginTop: "-30px",
      height: "40px"
    };

    return (
      <React.Fragment>
        {!this.state.hidden && (
          <form>
            <div className="form-group mb-0">
              <input
                className="form-control border-top-0 border-right-0 border-left-0"
                style={style}
                type="text"
                value={this.state.query}
                placeholder="Start typing the name of a person ..."
                onChange={e => this.setState({ query: e.target.value })}
              />
            </div>
            <button className="d-none" type="submit">
              Submit
            </button>
          </form>
        )}
        {this.state.data.length > 0 && (
          <div>{this.state.data.map(this.mapData)}</div>
        )}
      </React.Fragment>
    );
  }
}
