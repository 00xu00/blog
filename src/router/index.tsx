import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Home from '../pages/Home';
import Detail from '../pages/Detail';
import List from '../pages/List';
import NotFound from '../pages/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <Home />
      },
      {
        path: 'detail/:id',
        element: <Detail />
      },
      {
        path: 'list',
        element: <List />
      },
    ]
  },
  {
    path: '*',
    element: <NotFound />
  }
]);

export default router; 