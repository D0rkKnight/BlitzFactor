import React from "react";
import App from "../App";
import Token from "../token";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import './../style.css'

export default {
    App: <App />,
    Line: <DndProvider backend={HTML5Backend}><Token line="10">Test Line</Token></DndProvider>
}