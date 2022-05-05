import { StrictMode } from "react";
import ReactDOMClient from 'react-dom/client';

import "./style.css";
import App from "./App";

const rootElement = document.getElementById("root") as HTMLElement;
const root = ReactDOMClient.createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
