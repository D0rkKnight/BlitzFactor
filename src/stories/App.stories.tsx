import React from "react";
import TokenBlock from "../editor_frontend/tokenBlock";
import Token from "../token";
import Tokenizer from "../tokenizer";
import { TokenType } from "../tokenTypes";

import "../editor_frontend/style.css";
import { ComponentStory } from "@storybook/react";
import superTree from "./tree_jsons/superTree.json";

import Editor from "../editor_frontend/editor";
import SyntaxTree from "../editor_frontend/SyntaxTree";
import TokenFlow from "../editor_frontend/tokenFlow";

import { configure } from "@storybook/react";
import RadialMenu from "../editor_frontend/RadialMenu";
import App from "../editor_frontend/App";

import tree1 from "./tree_jsons/tree1.json";

export default {
  title: "Example/App",
  component: App,
};

export const Default = (args) => {
  // Wait half a second then send the message for the tree
  setTimeout(() => {
    window.postMessage({
      type: "update",
      tree: tree1,
    });
  }, 500);

  return <App />;
};
