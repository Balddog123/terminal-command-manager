import { Outlet, Link } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <div>
      <nav>
        {/* optional navigation 
        <Link to="/commands">Commands</Link>
        */}
        
      </nav>

      {/* Nested routes render here */}
      <Outlet />
    </div>
  );
}

export default App;
