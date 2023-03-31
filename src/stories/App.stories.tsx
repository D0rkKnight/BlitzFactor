import React from "react";
import "../editor_frontend/style.scss";
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
