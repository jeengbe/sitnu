import React from "react";
import { DataElement, ElementPeriod } from "./data";
import Period from "./Period";

interface Props {
  elements: DataElement[];
  periods: ElementPeriod[];
  start: number;
  end: number;
}

interface State {}

export default class PeriodCell extends React.Component<Props, State> {
  render() {
    const { periods, elements, start, end } = this.props;

    return (
      <div style={{ gridRow: "l-" + start + " / l-" + end }} className={"periodCell l-" + start + (periods.length === 0 ? " empty" : "")}>
        {periods.map(period => (
          <Period period={period} elements={elements} key={period.studentGroup} />
        ))}
      </div>
    );
  }
}
