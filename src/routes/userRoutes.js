const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  setupAdmin,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeUserRole,
  changeUserStatus
} = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.put('/resetPassword/:resetToken', resetPassword);
router.post('/setup', setupAdmin);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.put('/updateDetails', updateDetails);
router.put('/updatePassword', updatePassword);

// Admin routes
router.use(restrictTo('admin'));
router.route('/')
  .get(getAllUsers);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

router.put('/:id/role', changeUserRole);
router.put('/:id/status', changeUserStatus);

module.exports = router; 