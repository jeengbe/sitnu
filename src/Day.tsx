import React from "react";
import { DataElement, ElementPeriod } from "./data";
import PeriodCell from "./PeriodCell";

interface Props {
  elements: DataElement[];
  periods: ElementPeriod[];
}

export default class Day extends React.Component<Props> {
  render() {
    const { periods, elements } = this.props;

    return (
      <div className="periods">
        <div className="time" style={{ gridRow: "l-740 / l-825" }}>
          <span>7:40</span>
          <span>8:25</span>
        </div>
        <div className="time" style={{ gridRow: "l-830 / l-915" }}>
          <span>8:30</span>
          <span>9:15</span>
        </div>
        <div className="time" style={{ gridRow: "l-935 / l-1020" }}>
          <span>9:35</span>
          <span>10:20</span>
        </div>
        <div className="time" style={{ gridRow: "l-1020 / l-1105" }}>
          <span>10:20</span>
          <span>11:05</span>
        </div>
        <div className="time" style={{ gridRow: "l-1120 / l-1205" }}>
          <span>11:20</span>
          <span>12:05</span>
        </div>
        <div className="time" style={{ gridRow: "l-1210 / l-1255" }}>
          <span>12:10</span>
          <span>12:55</span>
        </div>
        <div className="time" style={{ gridRow: "l-1300 / l-1345" }}>
          <span>13:00</span>
          <span>13:45</span>
        </div>
        <div className="time" style={{ gridRow: "l-1350 / l-1435" }}>
          <span>13:50</span>
          <span>14:35</span>
        </div>
        <div className="time" style={{ gridRow: "l-1440 / l-1525" }}>
          <span>14:40</span>
          <span>15:25</span>
        </div>
        <div className="time" style={{ gridRow: "l-1530 / l-1615" }}>
          <span>15:30</span>
          <span>16:15</span>
        </div>
        <div className="time" style={{ gridRow: "l-1620 / l-1715" }}>
          <span>16:20</span>
          <span>17:05</span>
        </div>
        {[
          { start: 740, end: 825 },
          { start: 830, end: 915 },
          { start: 935, end: 1020 },
          { start: 1020, end: 1105 },
          { start: 1120, end: 1205 },
          { start: 1210, end: 1255 },
          { start: 1300, end: 1345 },
          { start: 1350, end: 1435 },
          { start: 1440, end: 1525 },
          { start: 1530, end: 1615 },
          { start: 1620, end: 1705 },
        ].map(({ start, end }) => (
          <PeriodCell key={start} periods={periods.filter(period => period.startTime === start && period.endTime === end)} elements={elements} start={start} end={end} />
        ))}
      </div>
    );
  }
}
