export function errorHandler(error, _req, res, _next) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    res.status(500).json({ success: false, message });
}
