import React from 'react';
import "./index.css"
import Header from "./components/Header/Header"
import Footer from "./components/Footer/Footer"
import { Outlet, useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="App">
      {!isAuthPage && <Header />}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default App;
