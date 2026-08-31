import React from "react";
import ReactDOM from "react-dom/client";
import AppRoot from "./app/page";
import "./app/globals.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppRoot />
    </React.StrictMode>
  );
}
