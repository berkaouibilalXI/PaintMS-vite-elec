//les erreurs li khati les controlleurs ytl3o hnaya

export const errorHandler = (err, req, res, next) => {
    console.log('Erreur en Backend:', err.message);
    res.status(500).json({
        error: 'Erreur interne du serveur (500)',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue. Veuillez réessayer plus tard.'
    });
}
