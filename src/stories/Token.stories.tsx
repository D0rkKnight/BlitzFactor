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

export default {
  title: "Example/Token",
  component: TokenBlock,
};

const Template: ComponentStory<typeof TokenFlow> = (args) => {
  args.tree = Tokenizer.condenseTree(args.tree as unknown as Token);

  // Do some backend stuff
  Editor.setMockSyntaxTree(new SyntaxTree(args.tree as unknown as Token));

  return <TokenFlow {...args} />;
};

const flows = [] as ComponentStory<typeof TokenFlow>[];
for (var flowInfo in superTree) {
  const flow = Template.bind({});
  flow.args = {
    tree: superTree[flowInfo]["tree"],
  };

  flows.push(flow);
}

export const flow1 = flows[0];
export const flow2 = flows[1];
export const flow3 = flows[2];
