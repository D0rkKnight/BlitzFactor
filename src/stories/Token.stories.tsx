import React from "react";
import TokenBlock from "../editor_frontend/tokenBlock";
import Token from "../token";
import { TokenType } from "../tokenTypes";

import "../editor_frontend/style.css";
import { ComponentStory } from "@storybook/react";
import tree1 from "./tree_jsons/tree1.json";

export default {
  title: "Example/Token",
  component: TokenBlock,
  // decorators: [(Story) => <TokenizerDecorator>{Story()}</TokenizerDecorator>],
};

const Template: ComponentStory<typeof TokenBlock> = (args) => {
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
