import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import classes from '../styles';
import auth from '../../Auth/api';
import { notify } from './Notifier';

class ResetPassword extends React.Component {
  state = {
    email: '',
    error: {},
  };

  handleOnChange = (e) => {
    this.setState({ email: e.target.value, error: {} });
  };

  isValid = () => {
    if (!this.state.email) {
      this.setState({ error: { email: 'Email is Required.' } });
      return false;
    }
    if (!this.state.email.trim().match(/.+@.+\..+/)) {
      this.setState({ error: { email: 'Invalid Email. Please try agains!' } });
      return false;
    }
    this.setState({ error: {} });
    return true;
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    if (this.isValid()) {
      const resp = await auth.sendResetPasswordEmail(this.state.email);
      resp.message && notify({ message: resp.message });
      this.setState({
        email: '',
      });
      this.props.handleClose();
    }
  };

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle color="secondary" id="form-dialog-title">
          Reset Password
        </DialogTitle>
        <DialogContent>
          <DialogContentText>Please enter your email and press Submit.</DialogContentText>
          <TextField
            name="email"
            value={this.state.email}
            onChange={this.handleOnChange}
            label="Email"
            margin="normal"
            style={classes.textField}
            helperText={
              this.state.error.email
                ? this.state.error.email
                : 'Email is Required. Email should be like abc@example.com'
            }
            error={!!this.state.error.email}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={this.handleSubmit} color="secondary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default ResetPassword;
