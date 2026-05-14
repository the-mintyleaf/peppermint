"use client";

import { createContext, useContext as uC } from "react";

const Context = createContext<any | undefined>(undefined);
const useContext = () => uC(Context);

export { Context, useContext };
