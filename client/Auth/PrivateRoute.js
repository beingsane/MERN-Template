import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import auth from './api';

const PrivateRoute = ({ component, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      console.log('Props', props);
      if (auth.isAuthenticated()) {
        return React.createElement(component, props);
      }
      return (
        <Redirect
          to={{
            pathname: '/login',
            state: { from: props.location },
          }}
        />
      );
    }}
  />
);

export default PrivateRoute;
