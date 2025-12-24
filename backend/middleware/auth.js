const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    // Нет заголовка
    if (!authHeader) {
        return res.status(401).json({
            message: "Authorization header missing"
        });
    }

    // Ожидаем: Bearer TOKEN
    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
        return res.status(401).json({
            message: "Invalid authorization format"
        });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                message: "Invalid or expired token"
            });
        }

        req.user = decoded; // payload
        next();
    });
}

function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.user_id, username: user.username },
    process.env.SECRET_KEY,
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user.user_id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = { generateAccessToken, generateRefreshToken, authenticateToken };