import moment from "moment";
import React from "react";
import { DOMAIN } from ".";
import { Untis, UntisData } from "./data";
import Day from "./Day";
import Settings from "./Settings";

interface State {
  data: UntisData | null;
  courses: number[];
  view: "today" | "tomorrow" | "settings";
  offline: boolean;
}

const today = moment();
const tomorrow = moment(today).add(1, "days");

export default class App extends React.Component<{}, State> {
  state: State = {
    data: null,
    courses: [],
    view: "today",
    offline: false,
  };

  componentDidMount() {
    this.loadCourses().then(() => this.checkImport());
    this.loadData();
    window.onpopstate = ev => {
      if ("view" in ev.state) {
        this.setState({ view: ev.state.view });
      }
    }
  }

  async loadData() {
    await new Promise(resolve => window.setTimeout(resolve, 400));
    const data = (await (await fetch(DOMAIN + "/api/timetable/" + tomorrow.format("YYYY-MM-DD") + "?c=" + JSON.stringify(this.state.courses))).json()) as Untis;

    this.setState({ data: data.data, offline: "offline" in data });
  }

  checkImport() {
    const importsS = window.location.search
      .substr(1)
      .split("&")
      .find(s => s.startsWith("import="));
    if (importsS === undefined) return;

    const imports = importsS
      .substr("import=".length)
      .split(",")
      .map(s => Number(s));

    this.setState(
      ({ courses }) => ({ courses: [...courses, ...imports].filter((item, index, arr) => arr.indexOf(item) === index) }),
      () => {
        alert("Kurse erfolgreich importiert");
        this.saveCourses();
        window.location.search = "";
      }
    );
  }

  saveCourses() {
    if (!("localStorage" in window)) {
      alert("Funktion nicht unterstützt");
      return;
    }
    window.localStorage.setItem("courses", JSON.stringify(this.state.courses));
  }

  loadCourses(): Promise<void> {
    return new Promise(resolve => this.setState(() => ({ courses: JSON.parse(localStorage.getItem("courses") ?? "[]") }), resolve));
  }

  toggleCourse(course: number) {
    if (this.state.courses.includes(course)) {
      this.setState(({ courses }) => ({ courses: courses.filter(c => c !== course) }), this.saveCourses.bind(this));
    } else {
      this.setState(({ courses }) => ({ courses: [...courses, course] }), this.saveCourses.bind(this));
    }
  }

  changeView(view: State["view"]) {
    this.setState({ view });
    history.pushState({ view }, "Sitnu");
  }

  render() {
    const { data, courses, view, offline } = this.state;
    const splashes = ["I love you", "Always be kind", "Be the best you", "Impossible ist just an opinion", "The future is near", "Want to go out?", "What we think, we become", "Just do it!", "Stay with me", "Search, and you will find", "π = e = √g", "Hello There", "Talk to me", "She's brave", "Shit, he's good", "Don't leave me", "¿Cómo estás?"];
    if (data === null)
      return (
        <div className="center">
          <h1>{splashes[Math.floor(Math.random() * splashes.length)]}</h1>
          <br />
          <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" viewBox="0 0 100 100">
            <circle cx="50" cy="50" fill="none" stroke="currentColor" strokeWidth="10" r="35" strokeDasharray="164.93361431346415 56.97787143782138">
              <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
            </circle>
          </svg>
        </div>
      );

    const {
      result: {
        data: {
          elementIds: [classId],
          elementPeriods,
          elements,
        },
      },
    } = data;

    const periods = elementPeriods[classId + ""]
      .filter(period => courses.includes(period.elements[2].id))
      .filter(period => period.date === (view === "today" ? Number(today.format("YYYYMMDD")) : Number(tomorrow.format("YYYYMMDD"))))
      .sort((a, b) => a.startTime - b.startTime);

    return (
      <>
        {offline ? (
          <div className="offline">
            <h3>Du bist offline.</h3>
          </div>
        ) : (
          <></>
        )}
        <div className="day">
          <div className="daySelection">
            <button className={view === "today" ? "selected" : ""} onClick={() => this.changeView("today" )}>
              Heute
            </button>
            <button className={view === "tomorrow" ? "selected" : ""} onClick={() => this.changeView("tomorrow")}>
              Morgen
            </button>
            <button className={view === "settings" ? "selected" : ""} onClick={() => this.changeView("settings")}>
              Einstellungen
            </button>
          </div>
          {view === "today" || view === "tomorrow" ? (
            <>
              <Day elements={elements} periods={periods} /> <span className="date">Ausgewähltes Datum: {(view === "today" ? today : tomorrow).format("DD/MM/YYYY")}</span>
            </>
          ) : (
            <Settings elements={elements} selectedCourses={courses} toggleCourse={this.toggleCourse.bind(this)} />
          )}
          {offline ? <div style={{ height: 75, display: "block" }}></div> : <></>}
        </div>
      </>
    );
  }
}
