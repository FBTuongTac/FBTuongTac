const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const c = require('../controllers/auth.controller');

router.post('/register', c.register);
router.post('/login', c.login);
router.get('/me', auth, c.me);
router.post('/logout', c.logout);

module.exports = router;
