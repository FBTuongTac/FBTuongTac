const jwt = require('jsonwebtoken');

const SECRET = 'FBTUONGTAC_SECRET';

exports.sign = (payload) => {
    return jwt.sign(payload, SECRET, { expiresIn: '7d' });
};

exports.verify = (token) => {
    return jwt.verify(token, SECRET);
};
