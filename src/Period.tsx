import React from "react";
import { DataElement, ElementPeriod } from "./data";

interface Props {
  period: ElementPeriod;
  elements: DataElement[];
}

interface State { }

export default class Periods extends React.Component<Props, State> {
  render() {
    const { period, elements } = this.props;

    const course = elements.filter(element => element.type === 3).find(element => element?.id === period.elements[2]?.id);
    const teacher = elements.filter(element => element.type === 2).find(element => element?.id === period.elements[1]?.id);
    const room = elements.filter(element => element.type === 4).find(element => element?.id === period.elements[3]?.id);

    return (
      <div className={"period " + period.cellState}>
        {course ? course.longName : <i>Kein Kurs bekannt</i>}
        <br />
        {teacher ? "substitution" in period.is ? (
          <i>
            <b>{teacher.name}</b>
          </i>
        ) : (
          teacher.name
        ) : <i>Kein Lehrer bekannt</i>}
        <br />
        {room ? ("roomSubstitution" in period.is ? (
          <i>
            <b>{room.name}</b>
          </i>
        ) : (
          room.name
        )) : <i>Kein Raum bekannt</i>}
      </div>
    );
  }
}
