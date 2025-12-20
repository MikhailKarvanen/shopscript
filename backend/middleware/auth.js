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

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                message: "Invalid or expired token"
            });
        }

        req.user = decoded; // payload
        next();
    });
}

module.exports = authenticateToken;