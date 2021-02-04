// import Client from "../api/Client";
import * as ActionTypes from './ActionTypes';
import userProfileApi from '../userApi';

const loadProfileRequest = () => {
  return {
    type: ActionTypes.LOAD_PROFILE_REQUEST,
  };
};

const loadProfileSuccess = (resp) => {
  return {
    type: ActionTypes.LOAD_PROFILE_SUCCESS,
    profile: resp.user,
  };
};

const loadProfileFailure = (err) => {
  return {
    type: ActionTypes.LOAD_PROFILE_FAILURE,
    error: true,
    message: err.message,
  };
};

const updateProfileRequest = () => {
  return {
    type: ActionTypes.UPDATE_PROFILE_REQUEST,
  };
};

const updateProfileSuccess = (resp) => {
  return {
    type: ActionTypes.UPDATE_PROFILE_SUCCESS,
    message: resp.message,
  };
};

const updateProfileFailure = (err) => {
  return {
    type: ActionTypes.UPDATE_PROFILE_FAILURE,
    error: true,
    message: err.message,
  };
};

const uploadImageRequest = () => {
  return {
    type: ActionTypes.UPLOAD_IMAGE_REQUEST,
  };
};

const uploadImageSuccess = (resp) => {
  return {
    type: ActionTypes.UPLOAD_IMAGE_SUCCESS,
    message: resp.message,
  };
};

const uploadImageFailure = (err) => {
  return {
    type: ActionTypes.UPLOAD_IMAGE_FAILURE,
    error: true,
    message: err.message,
  };
};

export const loadProfile = () => (dispatch) => {
  dispatch(loadProfileRequest());
  userProfileApi
    .fetchProfile()
    .then((resp) => {
      if (resp.success) dispatch(loadProfileSuccess(resp));
      else throw resp;
    })
    .catch((err) => dispatch(loadProfileFailure(err)));
};

export const updateProfile = (profile) => (dispatch) => {
  dispatch(updateProfileRequest());
  userProfileApi
    .updateProfile(profile)
    .then((resp) => {
      if (resp.success) dispatch(updateProfileSuccess(resp));
      else throw resp;
    })
    .catch((err) => dispatch(updateProfileFailure(err)));
};

export const uploadImage = (file) => (dispatch) => {
  dispatch(uploadImageRequest());
  userProfileApi
    .uploadProfileImage(file)
    .then((resp) => {
      if (resp.success) dispatch(uploadImageSuccess(resp));
      else throw resp;
    })
    .catch((err) => dispatch(uploadImageFailure(err)));
};
