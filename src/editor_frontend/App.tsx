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

    // Update display on update
    Editor.init();
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

  const [snippetMenuOpened, setSnippetMenuOpened] = React.useState(false);
  const [snippetMenuPos, setSnippetMenuPos] = React.useState({ x: 0, y: 0 });

  const [customMenuOpened, setCustomMenuOpened] = React.useState(false);
  const [customMenuPos, setCustomMenuPos] = React.useState({ x: 0, y: 0 });
  const [customMapperOpened, setCustomMapperOpened] = React.useState(false);
  const [selectedCustomActionTitle, setSelectedCustomActionTitle] =
    React.useState("");

  let radialMenu = null as JSX.Element | null;
  if (radialMenuOpened) {
    // Generate the dropdown menu button
    const dropDownClickFactory = (
      menuOpenSetter: (val: boolean) => void,
      menuPosSetter: (val: { x: number; y: number }) => void
    ) => {
      return (e: React.MouseEvent) => {
        setRadialMenuOpened(false);
        menuOpenSetter(true);
        menuPosSetter({ x: e.clientX, y: e.clientY });
      };
    };

    radialMenu = (
      <RadialMenu
        radius={50}
        position={radialMenuPos}
        deselectHandle={() => {
          setRadialMenuOpened(false);
        }}
      >
        <Button
          onClick={dropDownClickFactory(setSelectMenuOpened, setSelectMenuPos)}
          variant={"contained"}
        >
          Show Code Actions
        </Button>
        <Button
          onClick={dropDownClickFactory(
            setSnippetMenuOpened,
            setSnippetMenuPos
          )}
          variant={"contained"}
        >
          Show Snippets
        </Button>
        <Button
          onClick={dropDownClickFactory(setCustomMenuOpened, setCustomMenuPos)}
          variant={"contained"}
        >
          Show Custom
        </Button>
      </RadialMenu>
    );
  }

  // Set radial menu opened if right click
  function onContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    setRadialMenuOpened(true);
    setRadialMenuPos({ x: e.clientX, y: e.clientY });

    // Kinda janky for now, cache the deepest highlighted token
    Highlighter.setRightClickCacheFromHighlights();
  }

  const anchorPosFromTL = (pos: { x: number; y: number }) => {
    return { top: pos.y, left: pos.x };
  };

  const mapperMenuVars = Editor.getMapperMenuVars(selectedActionTitle);
  const selectedCustomAction = Editor.customDescriptions.find(
    (custom) => custom.title === selectedCustomActionTitle
  );

  return (
    <div onContextMenu={onContextMenu}>
      {radialMenu}
      <Menu
        open={selectMenuOpened}
        onClose={() => setSelectMenuOpened(false)}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosFromTL(selectMenuPos)}
      >
        <MenuItem>Code Actions</MenuItem>
        {Editor.codeActionDescriptions.map((desc) => {
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

      <Menu
        open={snippetMenuOpened}
        onClose={() => setSnippetMenuOpened(false)}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosFromTL(snippetMenuPos)}
      >
        <MenuItem>Snippet Menu</MenuItem>
        {Editor.snippetDescriptions.map((desc) => {
          return (
            <MenuItem
              onClick={() => {
                // Editor.performAction(desc.title);
                setSnippetMenuOpened(false);
              }}
            >
              {desc.name}
            </MenuItem>
          );
        })}
      </Menu>

      <Menu
        open={customMenuOpened}
        onClose={() => setCustomMenuOpened(false)}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosFromTL(customMenuPos)}
      >
        <MenuItem>Custom Menu</MenuItem>
        {Editor.customDescriptions.map((desc) => {
          return (
            <MenuItem
              onClick={() => {
                // Editor.performCustomAction(desc);
                setCustomMapperOpened(true);
                setSelectedCustomActionTitle(desc.title);
                setCustomMenuOpened(false);
              }}
            >
              {desc.title}
            </MenuItem>
          );
        })}
      </Menu>

      <MapperMenu
        open={customMapperOpened}
        variables={selectedCustomAction?.variables}
        onSubmit={(vars: {}) => {
          Editor.performCustomAction(selectedCustomAction!, vars);

          setCustomMapperOpened(false);

          console.log(vars);
        }}
        cancelHandle={() => {
          setCustomMapperOpened(false);
        }}
      ></MapperMenu>

      <MapperMenu
        open={mapperMenuOpened}
        variables={mapperMenuVars}
        onSubmit={(vars: string[]) => {
          Editor.performAction(selectedActionTitle, vars);
          setMapperMenuOpened(false);
        }}
        cancelHandle={() => {
          setMapperMenuOpened(false);
        }}
      ></MapperMenu>
      <DndProvider backend={HTML5Backend}>{treeBlock}</DndProvider>
    </div>
  );
}
