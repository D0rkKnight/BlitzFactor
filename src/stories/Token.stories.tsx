import React from "react";

import TokenBlock from "../editor_frontend/tokenBlock";
import Token from "../token";
import { TokenType } from "../tokenTypes";
import Tokenizer from "../tokenizer";

import "../editor_frontend/style.css";
import { ComponentStory } from "@storybook/react";
import TokenizerDecorator from "./TokenizerDecorator";

export default {
  title: "Example/Token",
  component: TokenBlock,
  // decorators: [(Story) => <TokenizerDecorator>{Story()}</TokenizerDecorator>],
};

// Tokenizer.initialize();

const Template: ComponentStory<typeof TokenBlock> = (args) => {
  // Token.tokenToReact(args["token"]);
  return <TokenBlock {...args} />;
};

let tok = new Token(
  TokenType.identifier,
  "identifier",
  [0, 0],
  [0, 0],
  "identifier",
  [],
  0
);

export const Primary = Template.bind({});
Primary.args = {
  id: 0,
  line: 0,
  color: "blue",
  selected: false,
  hovered: false,
  tree: tok,
};

// export default {
//   title: "Example/Token",
//   component: () => <div>hi</div>,
// };

// export const Default = () => <div>hi</div>;
