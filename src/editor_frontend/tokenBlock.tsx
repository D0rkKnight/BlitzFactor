import * as React from "react";
import Editor from "./editor";
import {useDraggable} from '@dnd-kit/core';
import {ItemTypes} from "./constants";
import {useDrag} from "react-dnd";
import {useDrop} from "react-dnd";
import {useRef} from "react";

interface DragItem {
  line: number;
}


export default function TokenBlock({ children, id, line, color = "blue", selected=false, tree}) {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = React.useState({ hovered: false });

//   const [{isDragging}, drag] = useDrag(() => ({
//       type: ItemTypes.TOKEN,
//       item: { line: line },
//       collect: (monitor) => ({
//         isDragging: !!monitor.isDragging(),
//     })
//   }));

//   // Also make the token a drop target: since it can be replaced by another token
//   const [, drop] = useDrop(
//     () => ({
//       accept: ItemTypes.TOKEN,
//       drop: (item: DragItem, monitor) => {

//         // Swap lines
//         Editor.moveLine(item.line, line);
//       }
//     })
//   );

//   function onLineClick() {
//     Editor.selectLine(line);
//   };

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
    } else if (selected) {
      return "lightgreen";
    } else {
      return "white";
    }
  };

  const style = {
    backgroundColor: getBGCol(),
  };

  let subtree = "";

  if (tree.children.length > 0)
    subtree = tree.children.map((child, index) => {
      return <TokenBlock key={index} id={Editor.getTokenID()} line={index} selected={selected} tree={child} >{child.text}</TokenBlock> // Weird default value issue?
    })

//   drag(drop(ref)); // Hooks up refs to drag and drop
  return (
    <div
      className="flow-line"
    //   onClick={onLineClick}
      onMouseOver={onHover}
      onMouseLeave={onUnhover}
      style={style}

      ref={ref}
    >
      <div className="flow-line__line" style={{ borderColor: color }}></div>
      <div className="flow-line__text">
        {line}: {children}

        {subtree}
      </div>
    </div>
  );
}