import * as React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import Editor from "./editor";
import TokenBlock from "./tokenBlock";
import TokenFlow from "./tokenFlow";
import Token from "../token";

import RadialMenu from "./RadialMenu";
import Highlighter from "./Highlighter";

import { Menu } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { Button } from "@mui/material";
import MapperMenu from "./MapperMenu";

import "./style.scss";

export default function App() {
  const [tokens, setTokens] = React.useState(null as Token | null);
  const [selectedLines, setSelectedLines] = React.useState([] as number[]);

  React.useEffect(() => {
    Editor.tokenChangeCB.push((newTokens: Token) => {
      // var cloned = newTokens.slice();

      // TODO: Perform a deep copy
      let cloned = newTokens;
      setTokens(cloned);
    });

    // Editor.lineSelectChangeCB.push((newSelectedLines: number[]) => {
    //   var cloned = newSelectedLines.slice();
    //   setSelectedLines(cloned);
    // })

    // // Put in key listeners for editor
    // document.addEventListener('keydown', (event) => {
    //   Editor.onKeyPress(event);
    // });

    // // Put in key listeners for editor
    // document.addEventListener('keyup', (event) => {
    //   Editor.onKeyUp(event);
    // });

    // Update display on update
    window.addEventListener("message", (event) => {
      const message = event.data; // The JSON data our extension sent

      switch (message.type) {
        case "update":
          Editor.onUpdate(message.tree);
          break;
        case "codeActions":
          Editor.setCodeActionCache(message.body);
          break;
      }
    });

    // Load everything now
    Editor.requestUpdate();
  }, []);

  let treeBlock = <p> Loading... </p>;
  if (tokens != null) {
    // treeBlock = Token.tokenToReact(tokens);
    treeBlock = <TokenFlow tree={tokens} />;
  }

  // Provide radial menu here
  const [radialMenuOpened, setRadialMenuOpened] = React.useState(false);
  const [radialMenuPos, setRadialMenuPos] = React.useState({ x: 0, y: 0 });

  const [selectMenuOpened, setSelectMenuOpened] = React.useState(false);
  const [selectMenuPos, setSelectMenuPos] = React.useState({ x: 0, y: 0 });

  const [mapperMenuOpened, setMapperMenuOpened] = React.useState(false);
  const [selectedActionTitle, setSelectedActionTitle] = React.useState("");

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
      <RadialMenu
        radius={50}
        position={radialMenuPos}
        deselectHandle={() => {
          setRadialMenuOpened(false);
        }}
      >
        <Button onClick={onDropdownClick} variant={"contained"}>
          Show Code Actions
        </Button>
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

  const mapperMenuVars = Editor.getMapperMenuVars(selectedActionTitle);

  return (
    <div onContextMenu={onContextMenu}>
      {radialMenu}
      <Menu
        open={selectMenuOpened}
        onClose={() => setSelectMenuOpened(false)}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosFromTL(selectMenuPos)}
      >
        {Editor.actionCache.map((desc) => {
          return (
            <MenuItem
              onClick={() => {
                // Editor.performAction(desc.title);
                setSelectedActionTitle(desc.title);
                setMapperMenuOpened(true);
                setSelectMenuOpened(false);
              }}
            >
              {desc.title}
            </MenuItem>
          );
        })}
      </Menu>
      <MapperMenu
        open={mapperMenuOpened}
        variables={mapperMenuVars}
        onSubmit={(vars: any) => {
          Editor.performAction(selectedActionTitle, vars);
          setMapperMenuOpened(false);

          console.log(vars);
        }}
        cancelHandle={() => {
          setMapperMenuOpened(false);
        }}
      ></MapperMenu>
      <DndProvider backend={HTML5Backend}>{treeBlock}</DndProvider>
    </div>
  );
}
