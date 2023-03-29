import React, { useEffect } from "react";

export default function TokRenameField({
  renameValue,
  onRenameFieldEdit,
  onRenameKeyDown,
  onClickOutside,
}) {
  const inputRef = React.useRef(null);

  useEffect(() => {
    const input = inputRef.current! as HTMLInputElement;
    input.focus();
    input.select();

    // Check if the user clicked outside of this component
    function handleClickOutside(event) {
      if (!input.contains(event.target)) {
        onClickOutside();
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
