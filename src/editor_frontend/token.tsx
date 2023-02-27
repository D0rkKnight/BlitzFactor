import * as React from "react";
import Editor from "./editor";
import {useDraggable} from '@dnd-kit/core';
import {ItemTypes} from "./constants";
import {useDrag} from "react-dnd";
import {useDrop} from "react-dnd";
import {useRef} from "react";

export interface TokenHandle {
  deselect: Function;
  id: number;
}

interface DragItem {
  line: number;
}

export default function Token({ children, id, line, color = "blue"}) {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = React.useState({ selected: false, hovered: false });

  const [{isDragging}, drag] = useDrag(() => ({
      type: ItemTypes.TOKEN,
      item: { line: line },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
    })
  }));

  // Also make the token a drop target: since it can be replaced by another token
  const [, drop] = useDrop(
    () => ({
      accept: ItemTypes.TOKEN,
      drop: (item: DragItem, monitor) => {

        // Swap lines
        Editor.swapLines(line, item.line);
      }
    })
  );
  
  // Just a callback object, gets regenerated every render
  var lineHandle = {
    deselect: function() {
      setState({ hovered: false, selected: false });
    },
    id: id, // Use ID for actual line comparison
  } as TokenHandle;

  function onLineClick() {
    setState({ ...state, selected: true });
    Editor.setSelectedLine(lineHandle);
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
    console.log(state)
    
    if (state.hovered) {
      return "lightblue";
    } else if (state.selected) {
      return "lightgreen";
    } else {
      return "white";
    }
  };


  const style = {
    backgroundColor: getBGCol(),
  };

  drag(drop(ref)); // Hooks up refs to drag and drop
  return (
    <div
      className="flow-line"
      onClick={onLineClick}
      onMouseOver={onHover}
      onMouseLeave={onUnhover}
      style={style}

      ref={ref}
    >
      <div className="flow-line__line" style={{ borderColor: color }}></div>
      <div className="flow-line__text">
        {line}: {children}
      </div>
    </div>
  );
}