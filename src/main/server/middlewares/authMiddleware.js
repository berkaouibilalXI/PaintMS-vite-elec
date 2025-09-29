const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'paintms-secret-2025-17122002';

export const auth =  (req, res, next) => {
    //njibou token mn header d'autorisatioon: Bearer <token>
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({message: 'Token manquant ou invalide'});
    }

    const token = authHeader.split(' ')[1];

    try {
        //nverifiw w ndecodiw le token
        const decoded =  jwt.verify(token, JWT_SECRET);
        //n7oto l'utilisateur fi req.user
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({message: 'Token invalide ou expiré'});
    }
}

