import { Component } from "./gear.js";

export class Calendar extends Component {
  constructor() {
    super({
      template: { url: "/calendar.html" },
    });

    const currentDate = new Date();
    this.state.dateText = `${currentDate.toLocaleString("en-US", {
      month: "long",
    })} ${currentDate.getFullYear()}`;
  }
}
