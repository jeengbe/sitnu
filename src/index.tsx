import { parseCookies } from "nookies";
import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import Login from "./Login";
import MainView from "./MainView";
import * as serviceWorker from "./serviceWorkerRegistration";

export const DOMAIN = "https://sitnu.jeeng.be";
// export const DOMAIN = "https://sitnu.localhost";
export let registration: { reg: ServiceWorkerRegistration | null; prompt: any } = { reg: null, prompt: null };

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

serviceWorker.register({
  onRegister: reg => (registration.reg = reg),
});

window.addEventListener("beforeinstallprompt", e => (registration.prompt = e));
