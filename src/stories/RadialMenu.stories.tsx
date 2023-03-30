import React from "react";

import "../editor_frontend/style.css";
import RadialMenu from "../editor_frontend/RadialMenu";
import RadialMenuDecorator from "./RadialMenuDecorator";
import { ComponentStory } from "@storybook/react";

import Select from "react-select";
import { Menu } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";

export default {
  title: "Example/RadialMenu",
  component: RadialMenu,
  decorators: [
    (Story) => (
      <RadialMenuDecorator>
        <Story />
      </RadialMenuDecorator>
    ),
  ],
};

const Template: ComponentStory<typeof RadialMenu> = (args) => {
  return (
    <RadialMenu {...args}>
      <button>Test 1</button>
      <button>Test 2</button>
      <button>Test 3</button>
      <button>Test 4</button>
    </RadialMenu>
  );
};

export const Default = Template.bind({});
Default.args = {
  radius: 50,
  position: { x: 100, y: 100 },
};

export const select = () => {
  const options = [
    { value: "one", label: "One" },
    { value: "two", label: "Two" },
  ];

  return <Select options={options}></Select>;
};

export const menu = () => {
  const options = [
    { value: "one", label: "One" },
    { value: "two", label: "Two" },
  ];

  return (
    <Menu open={true}>
      <MenuItem>Item 1</MenuItem>
      <MenuItem>Item 2</MenuItem>
    </Menu>
  );
};
