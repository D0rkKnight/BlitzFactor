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
import TokRenameField from "./TokRenameField";

import "./style.scss";
import "./textColors.scss";
import TokenText from "./TokenText";

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
  onHeaderClick: collapseParentCB = () => {},
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

  let trailingBlocks: (JSX.Element | null | undefined)[] = [];
  let text: JSX.Element | null = null;

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
  const onClickOutside = () => {
    setRenaming(false);
    setRenameValue(tree.text);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  let childrenToShow = tree.children;
  if (!expanded) {
    // Remove any statement blocks
    childrenToShow = childrenToShow.filter((child) => {
      return child.type !== TokenType.statement_block;
    });
  }

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
        let collapseThis = () => {};

        // Header check
        if (child.type !== TokenType.statement_block) {
          collapseThis = toggleExpand;
        }

        const tok = Token.tokenToReact(
          child,
          selected,
          setHover,
          isHovered,
          index,
          collapseThis
        );

        return tok;
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
    if (!renaming) text = <TokenText tok={tree} />;
    else {
      text = (
        <TokRenameField
          renameValue={renameValue}
          onRenameFieldEdit={onRenameFieldEdit}
          onRenameKeyDown={onRenameKeyDown}
          onClickOutside={onClickOutside}
        />
      );
    }
  }

  // No style overrides
  const style = {};

  const classes = [] as string[];
  if (selected) classes.push("tok-selected");
  else if (isDeepestHovered) classes.push("tok-deep_highlighted");
  else if (isAdjustedHovered) classes.push("tok-adj_highlighted");
  else if (isHovered) classes.push("tok-group_highlighted");

  // Indent if the token is a conditional body or a function body
  let indent =
    tree.type === TokenType.statement_block ? (
      <div className="flow-indent" />
    ) : null;

  //   drag(drop(ref)); // Hooks up refs to drag and drop

  // Mouse click to expand or collapse
  const onClick = (e) => {
    switch (e.detail) {
      // case 1: // Expand/close
      //   collapseParentCB(); // Passed down from the parent to expand/collapse the parent
      //   break;
      case 2:
        // Double click
        beginRename();
        break;
    }
  };

  const onRightClick = (e) => {
    e.preventDefault();
    collapseParentCB();
  };

  const beginRename = () => {
    // Only do this for identifiers
    if (tree.type !== TokenType.identifier) return;

    setRenaming(true);
  };

  return (
    <>
      {indent}

      <div
        className={"flow-block " + classes.join(" ")}
        onMouseOver={onHover}
        onMouseLeave={onUnhover}
        onClick={onClick}
        onContextMenu={onRightClick}
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
