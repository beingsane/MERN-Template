import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from './shared/Components/Home';
import SignUp from './Auth/Signup';
import OAuthRedirect from './shared/Components/OAuthRedirect';
import Login from './Auth/Login';
import LostPassword from './Auth/LostPassword';
import Header from './shared/Components/Header';
import UserProfile from './User/Redux/Main';
import PrivateRoute from './Auth/PrivateRoute';
import Admin from './Admin/Redux/Main';

export const MainRouter = () => {
  return (
    <div>
      <Header />
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={SignUp} />
        <Route path="/callbackRedirect" component={OAuthRedirect} />
        <Route path="/lostPassword" component={LostPassword} />

        <PrivateRoute path="/profile" component={UserProfile} />
        <PrivateRoute path="/admin" component={Admin} />

        <Route exact path="/" component={Home} />
      </Switch>
    </div>
  );
};
