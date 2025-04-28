import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Home from '../pages/Home';
import Detail from '../pages/Detail';
import List from '../pages/List';
import Auth from '../pages/Auth';
import NotFound from '../pages/NotFound';
import Profile from '../pages/Profile';
import Chat from '../pages/Chat';

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
      {
        path: 'profile',
        element: <Profile />
      }
    ]
  },
  {
    path: '/auth',
    element: <Auth />
  },
  {
    path: '/chat/:userId',
    element: <Chat />
  },
  {
    path: '*',
    element: <NotFound />
  }
]);

export default router; 