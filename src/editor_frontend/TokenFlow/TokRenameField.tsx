import React from "react";
import { handleClickOutside } from "../Utilities";
import { useEffect } from "react";

export default function TokRenameField({
  renameValue,
  onRenameFieldEdit,
  onRenameKeyDown,
  onClickOutside,
}) {
  const inputRef = React.useRef(null);
  handleClickOutside(inputRef, onClickOutside);

  useEffect(() => {
    const input = inputRef.current! as HTMLInputElement;
    input.focus();
    input.select();
  }, []);

  return (
    <input
      type="text"
      value={renameValue}
      onChange={onRenameFieldEdit}
      onKeyDown={onRenameKeyDown}
      className="flow-line__text tok-input"
      ref={inputRef}
    />
  );
}
