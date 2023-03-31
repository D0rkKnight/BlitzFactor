import React from "react";
import { CSSProperties } from "react";
import PropTypes from "prop-types";
import { handleClickOutside } from "./Utilities";
import { ClickAwayListener } from "@mui/material";

export default function RadialMenu({
  children,
  radius = 50,
  position,
  deselectHandle,
}) {
  // Spawn the children in a circle
  const childCount = React.Children.count(children);
  const angleStep = 360 / childCount;

  // Create the children
  const childElements = React.Children.map(children, (child, index) => {
    const childAngle = angleStep * index;
    const childX = radius * Math.cos((childAngle * Math.PI) / 180);
    const childY = radius * Math.sin((childAngle * Math.PI) / 180);

    const childStyle: CSSProperties = {
      position: "absolute",
      transform: `translate(-50%, -50%)`,
      transformOrigin: "0 0",
    };

    return (
      <div style={{ ...childStyle, left: childX, top: childY }}>{child}</div>
    );
  });

  // CSS for centering children
  const radialMenuStyle: CSSProperties = {
    // Pad left and top
    position: "absolute",

    // Make sure it's on top of everything
    zIndex: 1000,

    left: position.x,
    top: position.y,
  };

  return (
    <ClickAwayListener onClickAway={deselectHandle}>
      <div style={radialMenuStyle}>{childElements}</div>
    </ClickAwayListener>
  );
}

RadialMenu.propTypes = {
  radius: PropTypes.number,
  position: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  deselectHandle: PropTypes.func,
};
