import React from "react";
import { Button } from "@mui/material";
import PropTypes from "prop-types";

export default function RadialMenuButton({ children, onClick }) {
  return (
    <Button onClick={onClick} variant={"contained"}>
      {children}
    </Button>
  );
}

RadialMenuButton.propTypes = {
  onClick: PropTypes.func,
};
