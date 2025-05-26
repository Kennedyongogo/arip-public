import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import View from "./components/View";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<View />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
