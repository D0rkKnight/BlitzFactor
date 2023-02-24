import * as React from "react";
import Editor from "./editor";
import {useDraggable} from '@dnd-kit/core';

export default function FlowLine({ children, line, color = "blue"}) {

  const [state, setState] = React.useState({ selected: false, hovered: false });

  function lineHandle() {
    console.log("lineHandle")
  }


  function onLineClick() {
    if (Editor.selectedLine)
        Editor.selectedLine();

    setState({ ...state, selected: true });
    Editor.selectedLine = lineHandle;
  };

  function setHover(val: boolean) {
    // Recolor line
    const newState = { ...state };
    newState.hovered = val;
    setState(newState);
  };

  function onHover() {
    setHover(true);
  };

  function onUnhover() {
    setHover(false);
  };

  function getBGCol() {
    if (state.hovered) {
      return "lightblue";
    } else if (state.selected) {
      return "lightgreen";
    } else {
      return "white";
    }
  };


  const style = {
    backgroundColor: getBGCol()
  };

  // dnd stuff (right spot?)
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: 'draggable',
  });

  return (
    <div
      className="flow-line"
      onClick={onLineClick}
      onMouseOver={onHover}
      onMouseLeave={onUnhover}
      style={style}

      ref = {setNodeRef} // dnd knows which element to move
    >
      <div className="flow-line__line" style={{ borderColor: color }}></div>
      <div className="flow-line__text">
        {line}: {children}
      </div>
    </div>
  );
}