import React from "react";

export default function RadialMenuDecorator({ children }) {
  // CSS for centering childre
  const radialMenuStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  };

  return <div style={radialMenuStyle}>{children}</div>;
}
