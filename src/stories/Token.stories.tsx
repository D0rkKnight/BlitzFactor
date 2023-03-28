import React from "react";
import TokenBlock from "../editor_frontend/tokenBlock";
import Token from "../token";
import { TokenType } from "../tokenTypes";

import "../editor_frontend/style.css";
import { ComponentStory } from "@storybook/react";
import tree1 from "./tree_jsons/tree1.json";

import Editor from "../editor_frontend/editor";
import SyntaxTree from "../editor_frontend/SyntaxTree";
import TokenFlow from "../editor_frontend/tokenFlow";

export default {
  title: "Example/Token",
  component: TokenBlock,
  // decorators: [(Story) => <TokenizerDecorator>{Story()}</TokenizerDecorator>],
};

const Template: ComponentStory<typeof TokenFlow> = (args) => {
  return <TokenFlow {...args} />;
};

export const Primary = Template.bind({});
Primary.args = {
  tree: tree1,
};

// Do some backend stuff
Editor.setMockSyntaxTree(new SyntaxTree(tree1 as unknown as Token));
