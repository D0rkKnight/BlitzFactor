import * as React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import Editor from "./editor";
import TokenBlock from "./TokenFlow/tokenBlock";
import TokenFlow from "./TokenFlow/tokenFlow";
import Token from "../token";

import RadialMenu from "./ContextMenu/RadialMenu";
import Highlighter from "./Highlighter";

import { Menu } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { Button } from "@mui/material";
import MapperMenu from "./ContextMenu/MapperMenu";

import "./style/style.scss";
import RadialMenuButton from "./ContextMenu/RadialMenuButton";

enum MenuType {
  None,
  Radial,
  CodeActionList,
  CodeActionMapper,
  SnippetList,
  CustomList,
  CustomMapper,
}

export default function App() {
  const [tokens, setTokens] = React.useState(null as Token | null);

  React.useEffect(() => {
    Editor.tokenChangeCB.push((newTokens: Token) => {
      // Don't bother with cloning the tokens for now
      let cloned = newTokens;
      setTokens(cloned);
    });

    // Update display on update
    Editor.init();
    Editor.requestUpdate();
  }, []);

  // Temp load screen before tokens come in
  let treeBlock = <p> Loading... </p>;
  if (tokens != null) {
    treeBlock = <TokenFlow tree={tokens} />;
  }

  // States for menus
  const [selectedCustomActionTitle, setSelectedCustomActionTitle] =
    React.useState("");
  const [selectedActionTitle, setSelectedActionTitle] = React.useState("");

  const [currentMenu, setCurrentMenu] = React.useState(MenuType.None);
  const [menuPos, setMenuPos] = React.useState({ x: 0, y: 0 });

  let radialMenu = null as JSX.Element | null;
  if (currentMenu === MenuType.Radial) {
    // Generate the dropdown menu button
    const dropDownClickFactory = (newMenu: MenuType) => {
      return (e: React.MouseEvent) => {
        setCurrentMenu(newMenu);
        setMenuPos({ x: e.clientX, y: e.clientY });
      };
    };

    const radialEntries = [
      {
        title: "Show Code Actions",
        menu: MenuType.CodeActionList,
      },
      {
        title: "Show Snippets",
        menu: MenuType.SnippetList,
      },
      {
        title: "Show Custom Actions",
        menu: MenuType.CustomList,
      },
    ];

    const radialChildren = radialEntries.map((entry) => {
      return (
        <RadialMenuButton onClick={dropDownClickFactory(entry.menu)}>
          {entry.title}
        </RadialMenuButton>
      );
    });

    radialMenu = (
      <RadialMenu
        radius={50}
        position={menuPos}
        deselectHandle={() => {
          setCurrentMenu(MenuType.None);
        }}
      >
        {radialChildren}
      </RadialMenu>
    );
  }

  // Set radial menu opened if right click
  function onContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    setCurrentMenu(MenuType.Radial);
    setMenuPos({ x: e.clientX, y: e.clientY });

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
        open={currentMenu === MenuType.CodeActionList}
        onClose={() => setCurrentMenu(MenuType.None)}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosFromTL(menuPos)}
      >
        <MenuItem>Code Actions</MenuItem>
        {Editor.codeActionDescriptions.map((desc) => {
          return (
            <MenuItem
              onClick={() => {
                // Editor.performAction(desc.title);
                setSelectedActionTitle(desc.title);
                setCurrentMenu(MenuType.CodeActionMapper);
              }}
            >
              {desc.title}
            </MenuItem>
          );
        })}
      </Menu>

      <Menu
        open={currentMenu === MenuType.SnippetList}
        onClose={() => setCurrentMenu(MenuType.None)}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosFromTL(menuPos)}
      >
        <MenuItem>Snippet Menu</MenuItem>
        {Editor.snippetDescriptions.map((desc) => {
          return (
            <MenuItem
              onClick={() => {
                // Editor.performAction(desc.title);
                setCurrentMenu(MenuType.None);
              }}
            >
              {desc.name}
            </MenuItem>
          );
        })}
      </Menu>

      <Menu
        open={currentMenu === MenuType.CustomList}
        onClose={() => setCurrentMenu(MenuType.None)}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosFromTL(menuPos)}
      >
        <MenuItem>Custom Menu</MenuItem>
        {Editor.customDescriptions.map((desc) => {
          return (
            <MenuItem
              onClick={() => {
                // Editor.performCustomAction(desc);
                setCurrentMenu(MenuType.CustomMapper);
                setSelectedCustomActionTitle(desc.title);
              }}
            >
              {desc.title}
            </MenuItem>
          );
        })}
      </Menu>

      <MapperMenu
        open={currentMenu === MenuType.CustomMapper}
        variables={selectedCustomAction?.variables}
        onSubmit={(vars: {}) => {
          Editor.performCustomAction(selectedCustomAction!, vars);
          setCurrentMenu(MenuType.None);
        }}
        cancelHandle={() => {
          setCurrentMenu(MenuType.None);
        }}
      ></MapperMenu>

      <MapperMenu
        open={currentMenu === MenuType.CodeActionMapper}
        variables={mapperMenuVars}
        onSubmit={(vars: string[]) => {
          Editor.performAction(
            selectedActionTitle,
            vars,
            Highlighter.rightClickQueried
          );
          setCurrentMenu(MenuType.None);
        }}
        cancelHandle={() => {
          setCurrentMenu(MenuType.None);
        }}
      ></MapperMenu>
      <DndProvider backend={HTML5Backend}>{treeBlock}</DndProvider>
    </div>
  );
}
