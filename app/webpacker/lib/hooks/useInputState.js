import { useState, useCallback } from 'react';

export const useInputUpdater = (setState, isNumeric = false) => (
  useCallback((ev, data = undefined) => {
    if (data) {
      if (isNumeric) {
        const parsedValue = Number(data.value);
        setState(parsedValue);
      } else {
        setState(data.value);
      }
    } else {
      setState(ev);
    }
  }, [setState, isNumeric])
);

// /!\ This can only be used with react-semantic-ui inputs /!\
// All the react-semantic-ui inputs expect an 'onChange' handler with the signature:
// onChange(event: ChangeEvent, data: object)
// It's tempting to use 'event.target.value', which works in most cases
// but not for Form.Select for instance (!!), so we better use 'data.value'
// which always holds what we want.
// This is a small wrapper to automatically create the appropriate callback
// and avoid rendering the input at each render.
// If 'data' is undefined, we consider it's a regular "setState" call and set
// the value from the first param.
const useInputState = (defaultVal = undefined, isNumeric = false) => {
  const [state, setState] = useState(defaultVal);
  const updateFromOnChange = useInputUpdater(setState, isNumeric);

  return [state, updateFromOnChange];
};

export default useInputState;
