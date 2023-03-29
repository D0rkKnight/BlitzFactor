import React from "react";
import TokenBlock from "../editor_frontend/tokenBlock";
import Token from "../token";
import Tokenizer from "../tokenizer";
import { TokenType } from "../tokenTypes";

import "../editor_frontend/style.css";
import { ComponentStory } from "@storybook/react";
import tree1 from "./tree_jsons/tree1.json";
import tree2 from "./tree_jsons/tree2.json";

import Editor from "../editor_frontend/editor";
import SyntaxTree from "../editor_frontend/SyntaxTree";
import TokenFlow from "../editor_frontend/tokenFlow";

export default {
  title: "Example/Token",
  component: TokenBlock,
  // decorators: [(Story) => <TokenizerDecorator>{Story()}</TokenizerDecorator>],
};

const Template: ComponentStory<typeof TokenFlow> = (args) => {
  args.tree = Tokenizer.condenseTree(args.tree as unknown as Token);

  // Do some backend stuff
  Editor.setMockSyntaxTree(new SyntaxTree(args.tree as unknown as Token));

  return <TokenFlow {...args} />;
};

export const flow1 = Template.bind({});
flow1.args = {
  tree: tree1,
};

export const flow2 = Template.bind({});
flow2.args = {
  tree: tree2,
};
