import React from "react";
import { DataElement } from "./data";

interface Props {
  elements: DataElement[];
  selectedCourses: number[];
  toggleCourse: (course: number) => void;
}

interface State {}

export default class Settings extends React.Component<Props, State> {
  render() {
    const { elements, selectedCourses, toggleCourse } = this.props;

    const courses = elements.filter(element => element.type === 3).sort((a, b) => a.id - b.id);

    return (
      <div className="settings">
        <label>
          <input type="checkbox" />
          <span>
            <i>Push-Benachrichtigungen erhalten</i>
            <br />
            Tut noch nix - ist geplant
          </span>
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
