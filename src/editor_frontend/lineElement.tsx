import * as React from "react";
import Editor from "./editor";

interface FlowLineProps {
    children: React.ReactNode;
    line: number;
    color?: string;
  }

  interface FlowLineState {
    selected: boolean;
    hovered: boolean;
  }

export default class FlowLine extends React.Component<FlowLineProps, FlowLineState> {
  constructor(props: FlowLineProps) {
    super(props);

    this.state = { selected: false, hovered: false };
    this.onLineClick = this.onLineClick.bind(this);
    this.onHover = this.onHover.bind(this);
    this.onUnhover = this.onUnhover.bind(this);
    this.getBGCol = this.getBGCol.bind(this);
  }

  onLineClick = () => {
    if (Editor.selectedLine)
        Editor.selectedLine.setState({ ...Editor.selectedLine.state, selected: false });

    this.setState({ selected: true });
    Editor.selectedLine = this;
  };

  setHover = (val) => {
    // Recolor line
    const newState = { ...this.state };
    newState.hovered = val;
    this.setState(newState);
  };

  onHover = () => {
    this.setHover(true);
  };

  onUnhover = () => {
    this.setHover(false);
  };

  getBGCol = () => {
    if (this.state.hovered) {
      return "lightblue";
    } else if (this.state.selected) {
      return "lightgreen";
    } else {
      return "white";
    }
  };

  render() {
    const style = {
      backgroundColor: this.getBGCol()
    };

    const { children, line, color = "blue" } = this.props;

    return (
      <div
        className="flow-line"
        onClick={this.onLineClick}
        onMouseOver={this.onHover}
        onMouseLeave={this.onUnhover}
        style={style}
      >
        <div className="flow-line__line" style={{ borderColor: color }}></div>
        <div className="flow-line__text">
          {line}: {children}
        </div>
      </div>
    );
  }
}