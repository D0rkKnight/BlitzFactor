import React from "react";
import TokenBlock from "../editor_frontend/tokenBlock";
import Token from "../token";
import { TokenType } from "../tokenTypes";

import "../editor_frontend/style.css";
import { ComponentStory } from "@storybook/react";
import tree1 from "./tree_jsons/tree1.json";

let Parser = require("web-tree-sitter");
Parser.init().then(() => {
  console.log("Parser initialized");
});

// import http from "http";

export default {
  title: "Example/Token",
  component: TokenBlock,
  // decorators: [(Story) => <TokenizerDecorator>{Story()}</TokenizerDecorator>],
};

// Tokenizer.initialize();

const Template: ComponentStory<typeof TokenBlock> = (args) => {
  // Token.tokenToReact(args["token"]);

  // Make an http call to port 1337
  // args.tree.text = tree1.text;

  return <TokenBlock {...args} />;
};

export const Primary = Template.bind({});
Primary.args = {
  id: 0,
  line: 0,
  color: "blue",
  selected: false,
  hovered: false,
  tree: tree1,
};

// export default {
//   title: "Example/Token",
//   component: () => <div>hi</div>,
// };

// export const Default = () => <div>hi</div>;
