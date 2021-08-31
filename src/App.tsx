import React, { useState, useEffect, SyntheticEvent } from "react";
import axios from "axios";
import styled, { css } from "styled-components";
import {
  Calendar,
  Event,
  momentLocalizer,
  stringOrDate,
} from "react-big-calendar";
import moment from "moment";
import ReactLoading from "react-loading";

import { CardParser } from "./utils";
import "react-big-calendar/lib/css/react-big-calendar.css";

const Wrapper = styled.div<{ loading: boolean }>`
  ${(p) =>
    p.loading &&
    css`
      margin-bottom: 100px;
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
    `}
  width: 700px;
`;

interface OptionElement extends Element {
  value?: string;
  innerText?: string;
}

const colors = [
  "rgb(244, 81, 30)",
  "rgb(179, 157, 219)",
  "rgb(3, 155, 229)",
  "rgb(121, 85, 72)",
  "rgb(142, 36, 170)",
  "rgb(192, 202, 51)",
  "rgb(63, 81, 181)",
  "rgb(230, 124, 115)",
  "rgb(240, 147, 0)",
  "rgb(167, 155, 142)",
];

function App() {
  const localizer = momentLocalizer(moment);

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const courses: { [key: string]: string } = {};

  async function fetchCourse(course: OptionElement, index: number) {
    const courseName: string = course.innerText ?? "모든 강좌";
    const courseId: string = course.value ?? "1";
    if (courseId === "1") return null;
    const { data } = await axios.get(
      `https://www.learnus.org/calendar/view.php?view=upcoming&course=${courseId}`
    );
    const courseEl = document.createElement("html");
    courseEl.innerHTML = data;
    const calendars = Array.from(
      courseEl.getElementsByClassName("card-calendar")
    );
    calendars.map((calendar) => {
      const card: CardParser = new CardParser(calendar, courseName);
      const event = {
        title: `${card.cardTitle} - ${card.courseName}`,
        start: card.cardDates[0],
        end: card.cardDates[0],
        allDay: false,
        resource: [card.courseName, index],
      };
      setEvents((prev) => [...prev, event]);
      return null;
    });
  }

  async function handleSelectEvent(event: Object) {
    const typedEvent = event as {
      title: String;
      start: Date;
      end: Date;
      allDay: boolean;
      resource: any[];
    };
    window.open(
      `https://www.learnus.org/calendar/view.php?view=day&time=${(
        typedEvent.start.getTime() / 1000
      ).toString()}`
    );
  }

  function eventStyleGetter(
    event: Event,
    start: any,
    end: any,
    isSelected: any
  ) {
    const courseName = event.resource[0];
    const index = event.resource[1];
    let backgroundColor = courses[courseName];
    if (!backgroundColor) {
      courses[courseName] = colors[index];
      backgroundColor = courses[courseName];
    }
    const style = {
      backgroundColor: backgroundColor,
      borderRadius: "0px",
      color: "white",
    };
    return {
      style: style,
    };
  }

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { data } = await axios.get(
        "https://www.learnus.org/calendar/view.php?view=upcoming"
      );
      const el = document.createElement("html");
      el.innerHTML = data;
      const courses = el.getElementsByClassName("cal_courses_flt")[0].children;
      await Promise.all(
        Array.from(courses).map((course, index) =>
          fetchCourse(course, index - 1)
        )
      );
      setLoading(false);
    }
    fetch();
  }, []);

  return (
    <Wrapper loading={loading}>
      {loading && (
        <ReactLoading
          type={"spin"}
          color={"#314d9d"}
          height={"20%"}
          width={"20%"}
        />
      )}
      {!loading && (
        <Calendar
          localizer={localizer}
          events={events}
          step={60}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700 }}
          views={{ month: true, agenda: true }}
          popup
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(event: Object, e: SyntheticEvent) => {
            handleSelectEvent(event);
          }}
        />
      )}
    </Wrapper>
  );
}

export default App;
