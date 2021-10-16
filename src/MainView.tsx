import moment from "moment";
import React from "react";
import { Untis, UntisData } from "./data";
import Day from "./Day";
import Settings from "./Settings";

interface State {
  data: UntisData | null;
  courses: number[];
  view: "today" | "tomorrow" | "settings";
}

// const today = moment("17/10/2021", "DD/MM/YYYY");
const today = moment();
const date = Number(today.format("YYYYMMDD"));
const dateTmr = Number(today.add("1", "days").format("YYYYMMDD"));

export default class App extends React.Component<{}, State> {
  state: State = {
    data: null,
    courses: [],
    view: "today",
  };

  componentDidMount() {
    this.loadData();
    this.loadCourses();
  }

  async loadData() {
    const { data } = (await (await fetch("https://sitnu.jeeng.be/api/timetable/" + today.add(1, "days").format("YYYY-MM-DD"))).json()) as Untis;
    // const { data } = (await (await fetch("https://sitnu.localhost/api/timetable/" + today.add(1, "days").format("YYYY-MM-DD"))).json()) as Untis;

    this.setState({ data });
  }

  saveCourses() {
    if (!("localStorage" in window)) {
      alert("Funktion nicht unterstützt");
      return;
    }
    window.localStorage.setItem("courses", JSON.stringify(this.state.courses));
  }

  loadCourses() {
    this.setState(() => ({ courses: JSON.parse(localStorage.getItem("courses") ?? "[]") }));
  }

  toggleCourse(course: number) {
    if (this.state.courses.includes(course)) {
      this.setState(({ courses }) => ({ courses: courses.filter(c => c !== course) }), this.saveCourses.bind(this));
    } else {
      this.setState(({ courses }) => ({ courses: [...courses, course] }), this.saveCourses.bind(this));
    }
  }

  render() {
    const { data, courses, view } = this.state;
    const splashes = ["Daten werden geladen", "Ich starte", "Möchtest du einen Keks?", "Geduld bitte", "Immer schön nett sein", "Text me", "I love you"];
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
      .filter(period => period.date === (view === "today" ? date : dateTmr))
      .sort((a, b) => a.startTime - b.startTime);

    return (
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
        {view === "today" || view === "tomorrow" ? <Day elements={elements} periods={periods} /> : <Settings elements={elements} selectedCourses={courses} toggleCourse={this.toggleCourse.bind(this)} />}
      </div>
    );
  }
}
