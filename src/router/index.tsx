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
import Editor from '../pages/Editor';
import AIHelper from '../pages/AIHelper';
import Search from '../pages/Search/Search';
import FlexboxFroggy from '../pages/FlexboxFroggy/FlexboxFroggy';
import PrivateRoute from '../components/PrivateRoute';

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
        path: 'search',
        element: <Search />
      },
      {
        path: 'profile',
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        )
      },
      {
        path: 'editor',
        element: (
          <PrivateRoute>
            <Editor />
          </PrivateRoute>
        )
      },
      {
        path: 'ai-helper',
        element: <AIHelper />
      },
      {
        path: 'flexbox-froggy',
        element: <FlexboxFroggy />
      }
    ]
  },
  {
    path: '/auth',
    element: <Auth />
  },
  {
    path: '/chat',
    element: (
      <PrivateRoute>
        <Chat />
      </PrivateRoute>
    )
  },
  {
    path: '*',
    element: <NotFound />
  }
]);

export default router; 