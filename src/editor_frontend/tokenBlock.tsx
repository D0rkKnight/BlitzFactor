import * as React from "react";
import { useEffect } from "react";
import Editor from "./editor";
import { useDraggable } from "@dnd-kit/core";
import { ItemTypes } from "./constants";
import { useDrag } from "react-dnd";
import { useDrop } from "react-dnd";
import { useRef } from "react";
import Token from "../token";
import Highlighter from "./Highlighter";
import { TokenType } from "../tokenTypes";

interface DragItem {
  line: number;
}

export default function TokenBlock({
  id,
  line,
  color = "blue",
  selected = false,
  setHover,
  parentHovered,
  tree,
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setstate] = React.useState({
    selected: false,
  });
  const [expanded, setExpanded] = React.useState(true);

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
  let isDeepestHovered = tree === Highlighter.deepestToken;
  let isAdjustedHovered = tree === Highlighter.adjToken;
  let isHovered = isDeepestHovered || isAdjustedHovered || parentHovered;

  function onHover() {
    setHover(true, tree);
  }

  function onUnhover() {
    setHover(false, tree);
  }

  function getBGCol() {
    if (isDeepestHovered) return "darkblue";
    else if (isAdjustedHovered) {
      return "blue";
    } else if (isHovered) {
      return "lightblue";
    } else if (selected) {
      return "lightgreen";
    } else {
      return "white";
    }
  }

  let trailingBlocks: (JSX.Element | null | undefined)[] = [];
  let text: JSX.Element | null = null;

  let childrenToShow = tree.children;
  if (!expanded) {
    // Remove any statement blocks
    childrenToShow = childrenToShow.filter((child) => {
      return child.type !== TokenType.statement_block;
    });
  }

  ({ trailingBlocks, text } = getTrailingBlocks(
    tree,
    childrenToShow,
    trailingBlocks,
    selected,
    setHover,
    isHovered,
    text
  ));

  const style = {
    backgroundColor: getBGCol(),
  };

  // Indent if the token is a conditional body or a function body
  let indent =
    tree.type === TokenType.statement_block ? (
      <div className="flow-indent" />
    ) : null;

  //   drag(drop(ref)); // Hooks up refs to drag and drop

  // Mouse click to expand or collapse
  function onClick() {
    setExpanded(!expanded);
  }

  return (
    <>
      {indent}

      <div
        className="flow-block"
        //   onClick={onLineClick}
        onMouseOver={onHover}
        onMouseLeave={onUnhover}
        onClick={onClick}
        style={style}
        ref={ref}
      >
        {/* These are inline, note that there will never be a text block and an inline block at the same time */}
        <div className="flow-inline">{text}</div>

        {/* These are trailing */}
        <div className="flow-trailing-total">
          <div className="flow-trailing-content">{trailingBlocks}</div>
        </div>
      </div>
    </>
  );
}
function getTrailingBlocks(
  tree: any,
  childrenToShow: any[],
  trailingBlocks: (JSX.Element | null | undefined)[],
  selected: boolean,
  setHover: any,
  isHovered: any,
  text: JSX.Element | null
) {
  if (childrenToShow.length > 0) {
    // Check end lines of every subtree element
    let vertPointer = tree.start[0];
    let blockedSubtree = [[] as any[]];

    for (let i = 0; i < childrenToShow.length; i++) {
      const childStartLine = childrenToShow[i].start[0];

      if (childStartLine > vertPointer) {
        vertPointer = childStartLine;
        blockedSubtree.push([] as any[]);
      }

      // Push the child to the last array
      blockedSubtree[blockedSubtree.length - 1].push(childrenToShow[i]);
    }

    trailingBlocks = blockedSubtree.map((subtree, index) => {
      let innerElements = subtree.map((child, index) => {
        return Token.tokenToReact(child, selected, setHover, isHovered, index);
      });

      if (innerElements.length === 0) return null;

      return (
        <div className="flow-inline" key={index}>
          {innerElements}
        </div>
      );
    });
  } else {
    // Only display text if it's a leaf
    text = <div className="flow-line__text">{tree.text}</div>;
  }
  return { trailingBlocks, text };
}
