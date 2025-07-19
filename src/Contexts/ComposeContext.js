import { createContext } from "react";

export const ComposeContext = createContext({
  compose: false,
  setCompose: () => {},
  selectedElemenet: null,
  setSelectedElement: () => {},
  showsearchField: true,
  setShowsearchField: () => {},
  searchFieldRef: null,
  inputDraft: null,
  setInputDraft: () => {},
});
