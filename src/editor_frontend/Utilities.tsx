import React, { useEffect } from "react";

export function handleClickOutside(
  inputRef: React.MutableRefObject<null>,
  onClickOutside: any
) {
  useEffect(() => {
    const input = inputRef.current! as HTMLInputElement;

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
}
