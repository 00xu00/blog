import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import "./index.css"
import Header from "./components/Header/Header"
import Footer from "./components/Footer/Footer"
import { Outlet, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <Provider store={store}>
      <ThemeProvider>
        <div className="App">
          {!isAuthPage && <Header />}
          <main style={{ flex: 1 }}>
            <Outlet />
          </main>
          {!isAuthPage && <Footer />}
        </div>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
