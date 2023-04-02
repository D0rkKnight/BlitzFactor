import { Button, ClickAwayListener, Menu, TextField } from "@mui/material";
import React from "react";
import PropTypes from "prop-types";
import { handleClickOutside } from "../Utilities";

export default function MapperMenu({
  open = true,
  variables = ["Test Var 1", "Test Var 2", "YOU GAVE UNDEFINED VARIABLES"],
  onSubmit = (vars: string[]) => {},
  cancelHandle = () => {},
}) {
  const [variableValues, setVariableValues] = React.useState<any>({});

  return (
    // <ClickAwayListener onClickAway={cancelHandle}>
    <Menu open={open}>
      {variables.map((variable, key) => (
        <TextField
          label={variable}
          key={key}
          onChange={(e) => {
            setVariableValues({
              ...variableValues,
              [variable]: e.target.value,
            });
          }}
        />
      ))}

      <Button
        onClick={() => {
          onSubmit(variableValues);
        }}
      >
        Submit
      </Button>
      <Button onClick={cancelHandle}>Cancel</Button>
    </Menu>
    // </ClickAwayListener>
  );
}

// PropTypes
MapperMenu.propTypes = {
  open: PropTypes.bool,
  variables: PropTypes.arrayOf(PropTypes.string),
  onSubmit: PropTypes.func,
  cancelHandle: PropTypes.func,
};
