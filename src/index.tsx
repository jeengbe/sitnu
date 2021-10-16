import { parseCookies } from "nookies";
import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import Login from "./Login";
import MainView from "./MainView";
import * as serviceWorker from "./serviceWorkerRegistration";


class Shell extends React.Component {
  render() {
    const cookies = parseCookies();
    return "token" in cookies ? <MainView /> : <Login reload={() => this.forceUpdate()} />;
  }
}

ReactDOM.render(
  <React.StrictMode>
    <Shell />
  </React.StrictMode>,
  document.getElementById("root")
);


serviceWorker.register();
