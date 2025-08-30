import { createContext, useContext } from "react";

export const GlobalStore = createContext({});

export const useGlobalStore = () => useContext(GlobalStore);
