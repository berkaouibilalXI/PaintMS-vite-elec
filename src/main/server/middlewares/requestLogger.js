//bch n3rfou g3 les requetes li rhm ydoro f serveur LOL
export const requestLogger = (req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
}
