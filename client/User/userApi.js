import authApi from '../Auth/api';

const baseUrl = 'http://localhost:3000';

const fetchProfile = async () => {
  let jwt;
  if (authApi.isAuthenticated()) jwt = authApi.isAuthenticated();
  console.log('jwt', jwt);
  try {
    const response = await fetch(`${baseUrl}/users/profile`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    });
    if (response.status === 401) {
      authApi.clearJWT();
      const error = new Error('Unauthorized!');
      error.success = false;
      throw error;
    }
    return await response.json();
  } catch (err) {
    return err;
  }
};

const updateProfile = async (profile) => {
  let jwt;
  if (authApi.isAuthenticated()) jwt = authApi.isAuthenticated();
  console.log('jwt', jwt);
  console.log('profile', profile);
  try {
    const response = await fetch(`${baseUrl}/users/profile`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(profile),
    });
    if (response.status === 401) {
      authApi.clearJWT();
      const error = new Error('Unauthorized!');
      error.success = false;
      throw error;
    }
    return await response.json();
  } catch (err) {
    return err;
  }
};

const uploadProfileImage = async (file) => {
  let jwt;
  if (authApi.isAuthenticated()) jwt = authApi.isAuthenticated();

  const fd = new FormData();
  fd.append('imageFile', file, file.name);

  try {
    const response = await fetch(`${baseUrl}/users/uploadImage`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: fd,
    });
    if (response.status === 401) {
      authApi.clearJWT();
      const error = new Error('Unauthorized!');
      error.success = false;
      throw error;
    }
    return await response.json();
  } catch (err) {
    return err;
  }
};

export default {
  fetchProfile,
  updateProfile,
  uploadProfileImage,
};
