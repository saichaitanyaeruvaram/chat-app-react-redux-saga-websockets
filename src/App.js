import React from "react";
import "./App.css";

import { connect } from "react-redux";
import { Sidebar } from "./containers/Sidebar";
import { MessagesList } from "./containers/MessagesList";
import { AddMessage } from "./containers/AddMessage";
import { setupSocket } from "./actions";

class App extends React.PureComponent {
  componentDidMount() {
    this.props.dispatch(setupSocket());
  }

  render() {
    return (
      <div id="container">
        <Sidebar />
        <section id="main">
          <MessagesList />
          <AddMessage />
        </section>
      </div>
    );
  }
}

const withConnect = connect(
  null,
  dispatch => {
    return {
      dispatch
    };
  }
);

export default withConnect(App);
