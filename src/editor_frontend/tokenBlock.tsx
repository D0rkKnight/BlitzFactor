import * as React from "react";
import Editor from "./editor";
import {useDraggable} from '@dnd-kit/core';
import {ItemTypes} from "./constants";
import {useDrag} from "react-dnd";
import {useDrop} from "react-dnd";
import {useRef} from "react";
import Token from "../token";
import Highlighter from "./Highlighter";

interface DragItem {
  line: number;
}


export default function TokenBlock({id, line, color = "blue", selected=false, hovered=false, tree}) {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setstate] = React.useState({hovered: false, selected: false});

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

  // Gets triggered by the state rerender
  let primaryHover = Highlighter.isHighlighted(id);
  hovered = primaryHover || hovered;

  function setHover(val: boolean) {

    // Edit highlighted set in editor
    Highlighter.setHighlightInclusion(id, val);
    setstate({...state, hovered: val}); // This triggers the rerender
  };

  function onHover() {
    setHover(true);
  };

  function onUnhover() {
    setHover(false);
  };

  function getBGCol() {
    if (primaryHover)
      return "darkblue";
    else if (hovered) {
      return "lightblue";
    } else if (selected) {
      return "lightgreen";
    } else {
      return "white";
    }
  };

  
  let trailingBlocks: (JSX.Element | null | undefined) [] = [];
  let text: JSX.Element | null = null;
  
  if (tree.children.length > 0) {
    
    // Check end lines of every subtree element
    let vertPointer = tree.start[0];
    let blockedSubtree = [[] as any[]];

    for (let i = 0; i < tree.children.length; i++) {
      const childStartLine = tree.children[i].start[0];
      
      if (childStartLine > vertPointer) {
        vertPointer = childStartLine;
        blockedSubtree.push([] as any[]);
      }
      
      // Push the child to the last array
      blockedSubtree[blockedSubtree.length - 1].push(tree.children[i]);
    }

    trailingBlocks = blockedSubtree.map((subtree, index) => {
      
      let innerElements = subtree.map((child, index) => {
        return Token.tokenToReact(child, selected, hovered, index);
      });
      
      if (innerElements.length === 0)
      return null;
      
      return (
        <div className="flow-inline" key={index}>
          {innerElements}
        </div>
      )
    });
  }
  else {

    // Only display text if it's a leaf
    text = <div className="flow-line__text">{tree.text}</div>;
  }
  
  const style = {
    backgroundColor: getBGCol(),
  };
  
  
  //   drag(drop(ref)); // Hooks up refs to drag and drop
  
  return (
    <div
    className="flow-block"
    //   onClick={onLineClick}
    onMouseOver={onHover}
    onMouseLeave={onUnhover}
    style={style}
    
    ref={ref}
    >
      {/* These are inline, note that there will never be a text block and an inline block at the same time */}
      <div className="flow-inline">
        {text}
      </div>

      {/* These are trailing */}
      <div className="flow-trailing-total">

        <div className="flow-indent"></div>

        <div className="flow-trailing-content">
          {trailingBlocks}
        </div>
      </div>
    </div>
  );
}