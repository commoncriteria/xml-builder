import { useState } from "react";

function useToggle(defaultValue) {
  const [value, setValue] = useState(defaultValue);

  function handleToggleValue() {
    setValue((currentValue) => !currentValue);
  }

  return [value, handleToggleValue];
}

export default useToggle;
