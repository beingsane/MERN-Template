import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { Redirect } from 'react-router-dom';
import LoadingBar from './Loading';
import classes from '../styles';
import auth from '../../Auth/api';

class OAuthRedirect extends React.Component {
  state = {
    shouldRedirect: false,
  };

  componentDidMount() {
    setTimeout(() => {
      if (document.cookie) {
        const cookie = document.cookie.split('=');
        if (cookie[0] === 'mern-cookie') {
          const value = cookie[1].split('/');
          const isAdmin = value[1] === 'true';
          auth.authenticate(value[0], isAdmin, () => {
            this.setState({ shouldRedirect: true });
          });
        }
      }
    }, 5000);
  }

  render() {
    if (this.state.shouldRedirect) return <Redirect to="/" />;
    return (
      <div>
        <Grid container spacing={3} justify="center" style={classes.container}>
          <Grid item sx={10} sm={8} md={4}>
            <Card variant="outlined" style={classes.card}>
              <CardContent>
                <Typography color="secondary" align="center" variant="h5">
                  Logged in Successfully!
                </Typography>
                <Typography align="center" variant="h6">
                  Please check your email to activate your account
                </Typography>
                <Typography align="center" variant="h6">
                  Redirecting to Homepage...
                </Typography>
                <br />
                <br />
                <LoadingBar />
                <br />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    );
  }
}
export default OAuthRedirect;
