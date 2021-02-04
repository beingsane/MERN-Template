import mongoose from 'mongoose';
import lodash from 'lodash';
import passportLocalMongoose from 'passport-local-mongoose';
import { generateSlug } from '../utils/slug';
import { sendTemplateEmail } from '../aws-ses';

const userSchema = new mongoose.Schema({
  OAuthId: String,
  email: {
    type: String,
    trim: true,
    unique: 'Email already exists',
    match: [/.+@.+\..+/, 'Please enter valid email address'],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    default: '',
  },
  lastName: {
    type: String,
    default: '',
  },
  displayName: {
    type: String,
    default: '',
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  emailActivated: {
    type: Boolean,
    default: false,
  },
});

class UserClass {
  static publicFields() {
    return [
      'id',
      'displayName',
      'email',
      'firstName',
      'lastName',
      'avatarUrl',
      'slug',
      'isAdmin',
      'createdAt',
      'emailActivated',
    ];
  }

  static async signUpWithLocalStrategy({
    userName,
    email,
    password,
    firstName = '',
    lastName = '',
  }) {
    if (!email) return Error('Email is Required');
    if (!userName) return Error('Username is Required');
    if (!password) return Error('Password is Required');
    if (!email.match(/.+@.+\..+/)) return Error('Please enter valid email address');

    const registeredEmail = await this.findOne({ email });
    if (registeredEmail)
      return Error('Email already exists. Please sign up with different email or login.');

    const registeredUsername = await this.findOne({ username: userName });
    if (registeredUsername)
      return Error('Username already exists. Please sign up with different username or login.');

    const user = new this({ username: userName });
    await user.setPassword(password);

    user.firstName = firstName; //eslint-disable-line
    user.lastName = lastName; //eslint-disable-line
    user.displayName = userName; //eslint-disable-line
    user.email = email ? email : ""; //eslint-disable-line
    const slug = await generateSlug(this, userName);
    user.slug = slug; //eslint-disable-line

    const newUser = await user.save();
    return { success: true, user: lodash.pick(newUser, UserClass.publicFields()) };
  }

  static async signUpOrSignInWithOAuth({ OAuthId, email, displayName, avatarUrl }) {
    const registeredEmail = await this.findOne({ email });
    if (registeredEmail) return registeredEmail;
    const registeredUser = await this.findOne({ OAuthId });
    if (!registeredUser) {
      const slug = await generateSlug(this, 'OAuthUser');
      const newUser = await this.create({
        OAuthId,
        email,
        displayName,
        avatarUrl,
        slug,
        username: displayName,
      });
      return lodash.pick(newUser, UserClass.publicFields());
    }
    return registeredUser;
  }

  static async activateUserEmail(userId) {
    // 1. Use findById to find an user
    // 2. If not, throw an error
    // 3. If yes, use updateOne to update the emailActivated to true
    // 4. Then, send an welcome email, return success
    try {
      const user = await this.findOne({});
      if (!user) throw Error("The user doesn't exist");
      await this.updateOne({ _id: userId }, { $set: { emailActivated: true } }).exec();
      await sendTemplateEmail('welcome', { displayName: user.displayName }, user.email);
      return { success: true, message: 'Activate user email successfully.' };
    } catch (err) {
      return { success: false, message: err.message || err.toString() };
    }
  }

  static async resetPassword(password, email) {
    const user = await this.findOne({ email });
    if (user) {
      try {
        await user.setPassword(password);
        await user.save();
        return { success: true, message: 'Password Reset Successfully' };
      } catch (err) {
        return { success: false, message: err.message || err.toString() };
      }
    }
    return { success: false, message: 'No user with this email' };
  }

  static async getUsers() {
    try {
      const users = await this.find({}).select(UserClass.publicFields()).exec();
      return { success: true, users };
    } catch (err) {
      return { success: false, message: err.message || err.toString() };
    }
  }

  static async getUser(userId) {
    try {
      const user = await this.findById(userId).select(UserClass.publicFields()).exec();
      if (!user) throw new Error('User Not Found');
      return { success: true, user };
    } catch (err) {
      return { success: false, message: err.message || err.toString() };
    }
  }

  static async modifyUser(userId, updatedFields) {
    try {
      const user = await this.findByIdAndUpdate(
        userId,
        { $set: { ...updatedFields } },
        { new: true },
      );
      if (!user) throw new Error('User Not Found');
      return { success: true, message: 'Update User Profile Successfully' };
    } catch (err) {
      return { success: false, message: err.message || err.toString() };
    }
  }

  static async deleteUser(userId) {
    try {
      const user = await this.findByIdAndRemove(userId).exec();
      if (!user) throw new Error('User Not Found');
      return { success: true, message: 'Delete User Account Successfully' };
    } catch (err) {
      return { success: false, message: err.message || err.toString() };
    }
  }
}

userSchema.loadClass(UserClass);
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', userSchema);
export default User;
