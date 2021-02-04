/* eslint-disable */
import React from 'react';
import {Provider} from 'react-redux';
import {BrowserRouter, Switch, Route, Redirect} from "react-router-dom";
import {ThemeProvider} from "@material-ui/styles";
import theme from './theme';
import {MainRouter} from './MainRouter';
import ConfigStore from './configStore';
import {Notifier} from "./shared/Components/Notifier";
import { hot } from 'react-hot-loader';

let store = ConfigStore();
class App extends React.Component {
  componentDidMount () {
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles) {
      jssStyles.parentNode.removeChild(jssStyles)
    }
  }
  render(){
    return (
      <Provider store={store}>
        <BrowserRouter>
        <ThemeProvider theme={theme}>
            <MainRouter/>
          <Notifier />
        </ThemeProvider>
        </BrowserRouter>
      </Provider>
    );
  }
};

export default hot(module)(App);
