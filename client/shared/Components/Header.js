import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Button from '@material-ui/core/Button';
import { Link, NavLink, Redirect } from 'react-router-dom';
import auth from '../../Auth/api';
import { notify } from './Notifier';

class Header extends React.Component {
  state = {
    open: false,
    shouldRedirect: false,
    anchorEl: null,
    isAuthenticated: auth.isAuthenticated(),
    isAdmin: auth.isAdmin(),
  };

  componentDidMount() {
    setInterval(() => {
      this.setState({
        shouldRedirect: false,
        isAuthenticated: auth.isAuthenticated(),
        isAdmin: auth.isAdmin(),
      });
      this.forceUpdate();
    }, 500);
  }

  handleMenu = (event) => {
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleClose = () => {
    this.setState({
      open: false,
      anchorEl: null,
    });
  };

  handleLogout = async () => {
    try {
      const resp = await auth.logout();
      if (resp.message) notify({ message: resp.message });
      if (resp.success) {
        this.setState({ shouldRedirect: true });
      }
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    if (this.state.shouldRedirect) return <Redirect to="/login" />;
    return (
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            <Link to="/">MERN</Link>
          </Typography>
          {this.state.isAdmin ? (
            <Button>
              <NavLink color="default" to="/admin">
                Admin
              </NavLink>
            </Button>
          ) : (
            <span />
          )}
          {!this.state.isAuthenticated ? (
            <span>
              <Button color="default">
                <NavLink to="/signup">Sign Up</NavLink>
              </Button>
              <Button color="default">
                <NavLink to="/login">Login</NavLink>
              </Button>
            </span>
          ) : (
            <div>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={this.handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                anchorEl={this.state.anchorEl}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={this.state.open}
                onClose={this.handleClose}
              >
                <MenuItem>
                  {' '}
                  <NavLink to="/profile">Profile </NavLink>
                </MenuItem>
                <MenuItem onClick={this.handleLogout}> Logout </MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
    );
  }
}

export default Header;
