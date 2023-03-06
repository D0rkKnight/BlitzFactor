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


export default function TokenBlock({id, line, color = "blue", selected=false, tree}) {
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

    // Horizontal flexbox
    display: "flex",
    // flexDirection: "row",
  };

  let trailingBlocks: JSX.Element[] = [];
  let inlineBlocks: JSX.Element[] = [];
  let text = "";

  if (tree.children.length > 0) {
    // subtree = tree.children.map((child, index) => {
    //   return <TokenBlock key={index} id={Editor.getTokenID()} line={index} selected={selected} tree={child} /> // Weird default value issue?
    

    // });
    
    // Check end lines of every subtree element
    let vertPointer = tree['start']['row'];
    let blockedSubtree = [[] as any[]];
    let inlineSubtree: any[] = [];

    for (let i = 0; i < tree.children.length; i++) {
      const childStartLine = tree.children[i]['start']['row'];

      // Load to the inline span first
      if (childStartLine === tree['start']['row']) {
        inlineSubtree.push(tree.children[i]);
        continue;
      }

      if (childStartLine > vertPointer) {
        vertPointer = childStartLine;
        blockedSubtree.push([] as any[]);
      }

      // Push the child to the last array
      blockedSubtree[blockedSubtree.length - 1].push(tree.children[i]);
    }

    inlineBlocks = inlineSubtree.map((child, index) => {
      return <TokenBlock key={index} id={Editor.getTokenID()} line={index} selected={selected} tree={child} />
    });

    trailingBlocks = blockedSubtree.map((subtree, index) => {

      let innerElements = subtree.map((child, index) => {
        return <TokenBlock key={index} id={Editor.getTokenID()} line={index} selected={selected} tree={child} />
      });

      if (index === 0) {
        // Return a span instead for the first element since 
      }

      return <div className="flow-line__subtree" key={index}>
        {innerElements}
      </div>
    });
  }
  else {

    // Only display text if it's a leaf
    text = tree.text;
  }



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
      {text}
      {inlineBlocks}
      {trailingBlocks}
    </div>
  );
}