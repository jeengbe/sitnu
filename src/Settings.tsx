import React from "react";
import { DOMAIN, registration } from ".";
import { DataElement } from "./data";

function urlB64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface Props {
  elements: DataElement[];
  selectedCourses: number[];
  toggleCourse: (course: number) => void;
}

interface State {
  pushEnabled: boolean;
}

export default class Settings extends React.Component<Props, State> {
  state = {
    pushEnabled: false,
  };

  componentDidMount() {
    registration.reg?.pushManager?.getSubscription().then(sub => this.setState({ pushEnabled: sub !== null }));
  }

  async a2hs() {
    registration.prompt!.prompt();
    const r = await registration.prompt!.userChose;
    if (r.outcome === "accepted") {
      alert("Erfolgreich installiert");
    } else alert("Fehler")
    registration.prompt = null;
    this.forceUpdate();
  }

  async togglePush() {
    const { reg } = registration;
    if (reg === null) return;

    const sub = await reg.pushManager?.getSubscription();
    if (sub === undefined || sub === null) {
      Notification.requestPermission();
      try {
        const applicationServerKey = urlB64ToUint8Array("BEyJU52Uf-RSQWdDqrAXU02N2yqTugH58czZkgbryymLblJmOquKIxivJLaojLBKxRI9mwxatXyirS8KPHsRpxg");

        const subscr = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey,
        });
        await fetch(DOMAIN + "/api/subscribe", {
          method: "POST",
          body: JSON.stringify({ ...JSON.parse(JSON.stringify(subscr)), courses: this.props.selectedCourses }),
        });
        alert("Erfolgreich abonniert");
      } catch (err) {
        alert("Fehler");
        console.error(err);
      }
      this.setState({ pushEnabled: true });
    } else {
      sub.unsubscribe();
      alert("Erfolgreich abbestellt");
      this.setState({ pushEnabled: false });
    }
  }

  render() {
    const { elements, selectedCourses, toggleCourse } = this.props;
    const { pushEnabled } = this.state;

    const courses = elements.filter(element => element.type === 3).sort((a, b) => a.id - b.id);

    return (
      <div className="settings">
        {registration.prompt !== null && (
          <>
            <label>
              <button onClick={() => this.a2hs()}>App installieren</button>
            </label>
            <hr />
          </>
        )}
        <label>
          <input type="checkbox" onChange={() => this.togglePush()} checked={pushEnabled} />
          <span>Push-Benachrichtigungen erhalten</span>
        </label>
        <hr />
        <div className="courses">
          {courses.map(course => (
            <label key={course.id}>
              <input type="checkbox" checked={selectedCourses.includes(course.id)} onChange={() => toggleCourse(course.id)} />
              {course.longName}
            </label>
          ))}
        </div>
      </div>
    );
  }
}
