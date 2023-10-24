import { setError } from "./store/reducers/errors";

export class DexieError extends Error {
  constructor(message) {
    super(message);
    this.name = "DexieError";
  }
}

export const callAndShowErrors = async (fn, dispatch) => {
  try {
    await fn();
  } catch (error) {
    if (error.name === "DexieError") {
      dispatch(setError(error.message));
    }
  }
};
