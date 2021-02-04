import express from 'express';
import multer from 'multer';
import { verifyUser, verifyAdmin } from '../auth/jwt';
import User from '../models/user.model';

const ROOT_URL = 'http://localhost:3000';
const userRouter = express.Router();

// Configure Multer for file uploading
const diskStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'dist/public/images');
  },
  filename(req, file, cb) {
    cb(null, `${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|gif|png)$/)) {
    // You can always pass an error if something goes wrong:
    cb(new Error('You can only upload image files'));
  }
  // To accept the file pass `true`, like so:
  cb(null, true);
};
const upload = multer({ storage: diskStorage, fileFilter });

/**
 * Get Users For ADMIN ONLY
 */
userRouter.get('/', verifyUser, verifyAdmin, async (req, res) => {
  try {
    const resp = await User.getUsers();
    if (resp.success) {
      res.status(200).json(resp);
    } else throw Error(resp.message || 'Something went wrong');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || err.toString() });
  }
});

/**
 * Modify User Profile for ADMIN and USER
 */
// Helper function
async function modifyUser(userId, req, res) {
  try {
    const resp = await User.modifyUser(userId, { ...req.body });
    if (resp.success) {
      res.status(200).json(resp);
    } else throw Error(resp.message || 'Something went wrong');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || err.toString() });
  }
}
userRouter.put('/admin/:userId', verifyUser, verifyAdmin, async (req, res) => {
  await modifyUser(req.params.userId, req, res);
});
userRouter.put('/profile', verifyUser, async (req, res) => {
  await modifyUser(req.user._id, req, res);
});

/**
 * Get User Profile for USER
 */
async function getUser(userId, req, res) {
  try {
    const resp = await User.getUser(userId);
    if (resp.success) {
      res.status(200).json(resp);
    } else throw Error(resp.message || 'Something went wrong');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || err.toString() });
  }
}
userRouter.get('/profile', verifyUser, async (req, res) => {
  await getUser(req.user._id, req, res);
});
userRouter.get('/profile/:userId', verifyUser, async (req, res) => {
  await getUser(req.params.userId, req, res);
});
/**
 * Delete User for ADMIN only
 */
userRouter.delete('/:userId', verifyUser, verifyAdmin, async (req, res) => {
  try {
    const resp = await User.deleteUser(req.params.userId);
    if (resp.success) {
      res.status(200).json(resp);
    } else throw Error(resp.message || 'Something went wrong');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || err.toString() });
  }
});

/**
 * Upload User Profile for USER and ADMIN only
 */
const uploadImage = async (userId, req, res) => {
  const img = req.file.originalname;
  try {
    const resp = await User.modifyUser(userId, {
      avatarUrl: `${ROOT_URL}/dist/public/images/${img}`,
    });
    if (resp.success) {
      res.status(200).json(resp);
    } else throw Error(resp.message || 'Something went wrong');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || err.toString() });
  }
};
userRouter.post('/uploadImage', verifyUser, upload.single('imageFile'), async (req, res) => {
  await uploadImage(req.user._id, req, res);
});
userRouter.post(
  '/uploadImage/:userId',
  verifyUser,
  verifyAdmin,
  upload.single('imageFile'),
  async (req, res) => {
    await uploadImage(req.params.userId, req, res);
  },
);

export default userRouter;
