import React from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { Redirect } from 'react-router-dom';
import FacebookIcon from '@material-ui/icons/Facebook';
import classes from '../shared/styles';
import LoadingBar from '../shared/Components/Loading';
import auth from './api';
import { notify } from '../shared/Components/Notifier';
import ResetPassword from '../shared/Components/ResetPassword';

export default class SignUp extends React.Component {
  state = {
    loginInProgress: false,
    shouldRedirect: false,
    user: {
      username: '',
      password: '',
    },
    openResetPassword: false,
    error: {},
  };

  handleOnChange = (e) => {
    const { name } = e.target;
    const user = { ...this.state.user };
    user[name] = e.target.value;
    this.setState({ user, error: {} });
  };

  isValid = () => {
    if (!this.state.user.username) {
      this.setState({ error: { username: 'Username is Required.' } });
      return false;
    }
    if (!this.state.user.password) {
      this.setState({ error: { password: 'Password is Required.' } });
      return false;
    }
    if (!(this.state.user.password.length >= 8)) {
      this.setState({ error: { password: 'Invalid Password. Please try again!' } });
      return false;
    }
    this.setState({ error: {} });
    return true;
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    if (this.isValid()) {
      try {
        this.setState({ loginInProgress: true });
        const resp = await auth.login(this.state.user);
        if (resp.success) {
          auth.authenticate(resp.token, resp.isAdmin, () => {
            this.setState({
              loginInProgress: false,
              shouldRedirect: true,
            });
          });
        } else {
          this.setState({ loginInProgress: false });
          notify({ message: resp.message });
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  toggleResetPassword = () => {
    this.setState({ openResetPassword: !this.state.openResetPassword });
  };

  render() {
    if (this.state.shouldRedirect) return <Redirect to="/" />;
    return (
      <div>
        <Grid container spacing={3} justify="center" style={classes.container}>
          <Grid item sx={10} sm={8} md={4}>
            <Card variant="outlined" style={classes.card}>
              <CardContent>
                <Typography color="secondary" align="center" variant="h5" component="h2">
                  Log In
                </Typography>
                <br />
                {this.state.loginInProgress ? <LoadingBar /> : <span />}
                <br />
                <Button
                  color="secondary"
                  variant="contained"
                  style={classes.oAuthLoginBtn}
                  href="http://localhost:3000/auth/facebook"
                >
                  <FacebookIcon style={{ marginRight: '10px' }} />
                  Login with Facebook
                </Button>
                <br />
                <br />
                <Button
                  variant="contained"
                  style={{ ...classes.oAuthLoginBtn, backgroundColor: '#f50057', color: '#fff' }}
                  href="http://localhost:3000/auth/google"
                >
                  Login with Google
                </Button>
                <br />
                <br />
                <Typography align="center" variant="h6">
                  {' '}
                  OR{' '}
                </Typography>
                <Typography align="center" variant="h6">
                  {' '}
                  Log In with your Account{' '}
                </Typography>
                <TextField
                  name="username"
                  value={this.state.user.username}
                  onChange={this.handleOnChange}
                  label="User Name"
                  margin="normal"
                  style={classes.textField}
                  helperText={this.state.error.username || ''}
                  error={!!this.state.error.username}
                />
                <TextField
                  name="password"
                  value={this.state.user.password}
                  onChange={this.handleOnChange}
                  label="Password"
                  margin="normal"
                  style={classes.textField}
                  helperText={this.state.error.password || ''}
                  error={!!this.state.error.password}
                />
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  style={{ margin: '0 auto' }}
                  onClick={this.handleSubmit}
                >
                  Submit
                </Button>
              </CardActions>
              <p>
                Forgot Password? Click <Button onClick={this.toggleResetPassword}>here</Button>
              </p>
            </Card>
          </Grid>
        </Grid>
        <ResetPassword open={this.state.openResetPassword} handleClose={this.toggleResetPassword} />
      </div>
    );
  }
}
