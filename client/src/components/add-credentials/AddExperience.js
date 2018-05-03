import React, { Component } from "react";
import { Link } from "react-router-dom";
import TextFieldGroup from "../common/TextFieldGroup";
import TextAreaFieldGroup from "../common/TextAreaFieldGroup";
import { connect } from "react-redux";

class AddExperience extends Component {
  state = {
    company: "",
    title: "",
    location: "",
    from: "",
    to: "",
    current: false,
    description: "",
    errors: {},
    disabled: false //If user clicks current checkbox, set to true
  };
  render() {
    const { errors } = this.props;

    return (
      <div className="add-experience">
        <div className="container">
          <div className="row">
            <div className="col-md-8 m-auto">
              <Link to="/dashboard" className="btn btn-light">
                Go back
              </Link>
              <h1 className="display-4 text-center">Add Experience</h1>
              <p className="lead text-center">
                Add any job or position that you have had in the past or current
              </p>
              <small className="d-block pb-3">* = required fields</small>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    profile: state.profile,
    errors: state.errors
  };
};

export default connect(mapStateToProps)(AddExperience);
