import * as React from "react";

import Editor from "./editor";
import Highlighter from "./Highlighter";
import Token from "../token";
import TokenBlock from "./tokenBlock";
import RadialMenu from "./RadialMenu";
import { CSSProperties } from "react";
import { Button } from "../stories/examples/Button";

import { Menu } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";

export default function TokenFlow({ tree }) {
  // Just increment this or something when we want to rerender
  const [state, setstate] = React.useState(0);

  const [radialMenuOpened, setRadialMenuOpened] = React.useState(false);
  const [radialMenuPos, setRadialMenuPos] = React.useState({ x: 0, y: 0 });

  const [selectMenuOpened, setSelectMenuOpened] = React.useState(false);
  const [selectMenuPos, setSelectMenuPos] = React.useState({ x: 0, y: 0 });

  /**
   * General function to set hover state
   * @param val Value to set hover to
   */
  function setHover(val: boolean, token: Token) {
    // Edit highlighted set in editor
    Highlighter.setHighlightInclusion(token, val);

    setstate(state + 1); // This triggers the rerender
  }

  let radialMenu = null as JSX.Element | null;
  if (radialMenuOpened) {
    let txt = Highlighter.deepestToken?.text;

    // Generate the dropdown menu button
    const onDropdownClick = (e) => {
      setRadialMenuOpened(false);
      setSelectMenuOpened(true);
      setSelectMenuPos({ x: e.clientX, y: e.clientY });
    };

    radialMenu = (
      <RadialMenu radius={50} position={radialMenuPos}>
        <button onClick={onDropdownClick}>Show Code Actions</button>
        <button>BT2</button>
        <button>BT3</button>
        <button>BT4</button>
        <p>{txt}</p>
      </RadialMenu>
    );
  }

  // Set radial menu opened if right click
  function onContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    setRadialMenuOpened(true);
    setRadialMenuPos({ x: e.clientX, y: e.clientY });
  }

  const anchorPosFromTL = (pos: { x: number; y: number }) => {
    return { top: pos.y, left: pos.x };
  };

  return (
    <div onContextMenu={onContextMenu}>
      {radialMenu}
      <Menu
        open={selectMenuOpened}
        onClose={() => setSelectMenuOpened(false)}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosFromTL(selectMenuPos)}
      >
        {Editor.actionNames.map((name) => {
          return (
            <MenuItem
              onClick={() => {
                Editor.performAction(name);
                setSelectMenuOpened(false);
              }}
            >
              {name}
            </MenuItem>
          );
        })}
      </Menu>
      {Token.tokenToReact(tree as Token, false, setHover, false)}
    </div>
  );
}
