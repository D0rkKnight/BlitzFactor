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

  const [renaming, setRenaming] = React.useState(false);
  const [renameValue, setRenameValue] = React.useState(tree.text);

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

  const onRenameFieldEdit = (e) => {
    setRenameValue(e.target.value);
  };
  const onRenameKeyDown = (e) => {
    if (e.key === "Enter") {
      // Rename the token
      console.log("Renaming token to " + renameValue);
      Editor.renameTokenTo(tree, renameValue);

      setRenaming(false);
    }
    if (e.key === "Escape") {
      setRenaming(false);
      setRenameValue(tree.text);
    }
  };

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
    if (!renaming) text = <div className="flow-line__text">{tree.text}</div>;
    else {
      text = (
        <input
          type="text"
          value={renameValue}
          onChange={onRenameFieldEdit}
          onKeyDown={onRenameKeyDown}
          className="flow-line__text"
        />
      );
    }
  }

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
  const onClick = (e) => {
    switch (e.detail) {
      case 1: // Expand/close
        setExpanded(!expanded);
        break;
      case 2:
        // Double click
        onDoubleClick();
        break;
    }
  };

  const onDoubleClick = () => {
    setRenaming(true);
  };

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
