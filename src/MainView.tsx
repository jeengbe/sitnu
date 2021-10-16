import moment from "moment";
import React from "react";
import { Untis, UntisData } from "./data";
import Day from "./Day";
import Settings from "./Settings";

interface State {
  data: UntisData | null;
  courses: number[];
  view: "today" | "tomorrow" | "settings";
  offline: boolean;
}

// const today = moment("17/10/2021", "DD/MM/YYYY");
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
    this.loadData();
    this.loadCourses().then(() => this.checkImport());
  }

  async loadData() {
    await new Promise(resolve => window.setTimeout(resolve, 400));
    const data = (await (await fetch("https://sitnu.jeeng.be/api/timetable/" + moment(today).add(1, "days").format("YYYY-MM-DD"))).json()) as Untis;
    // const data = (await (await fetch("https://sitnu.localhost/api/timetable/" + moment(today).add(1, "days").format("YYYY-MM-DD"))).json()) as Untis;

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

  render() {
    const { data, courses, view, offline } = this.state;
    const splashes = ["I love you", "Always be kind", "Be the best you", "Impossible ist just an opinion", "Invest in your dreams", "Want to go out?", "What we think, we become", "Just do it!", "And still, I rise", "Search, and you will find", "π", "Hello There"];
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
            <span>
              Die angezeigten Daten stammen vom <i>todo</i>
            </span>
          </div>
        ) : (
          <></>
        )}
        <div className="day">
          <div className="daySelection">
            <button className={view === "today" ? "selected" : ""} onClick={() => this.setState({ view: "today" })}>
              Heute
            </button>
            <button className={view === "tomorrow" ? "selected" : ""} onClick={() => this.setState({ view: "tomorrow" })}>
              Morgen
            </button>
            <button className={view === "settings" ? "selected" : ""} onClick={() => this.setState({ view: "settings" })}>
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
