import { Button, Menu, TextField } from "@mui/material";
import React from "react";
import PropTypes from "prop-types";

export default function MapperMenu({
  open = true,
  variables = ["Test Var 1", "Test Var 2"],
  onSubmit = (vars: string[]) => {},
  onCancel = () => {},
}) {
  const [variableValues, setVariableValues] = React.useState<any>({});

  return (
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
      <Button onClick={onCancel}>Cancel</Button>
    </Menu>
  );
}

// PropTypes
MapperMenu.propTypes = {
  open: PropTypes.bool,
  variables: PropTypes.arrayOf(PropTypes.string),
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
};
