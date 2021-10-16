import { setCookie } from "nookies";
import React from "react";

interface Props {
  reload: () => void;
}

export default class Login extends React.Component<Props> {
  passwordRef = React.createRef<HTMLInputElement>();

  login() {
    if (this.passwordRef.current!.value === "j82R8Gez") {
      setCookie(null, "token", this.passwordRef.current!.value, {
        path: "/",
        maxAge: 100000000,
      });
      this.props.reload();
    } else alert("Falsches Passwort");
  }

  render() {
    return (
      <div className="center login">
        <input type="password" ref={this.passwordRef} placeholder="Passwort" />
        <br />
        <button onClick={() => this.login()}>Anmelden</button>
      </div>
    );
  }
}
