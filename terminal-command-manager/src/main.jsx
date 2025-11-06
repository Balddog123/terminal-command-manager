import { StrictMode } from 'react'
import React from 'react'
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Login from './Login.jsx';
import CommandTable from './CommandTable.jsx';
import Command from './Command.jsx';

const router = createBrowserRouter([
  {
    path: "*",
    element: <App />,
    children: [
      {
        path: "*",
        element: <Login />,
      },
      {
        path: "commands",
        element: <CommandTable />,
      },
      {
        path: "command/:id",
        element: <Command />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);