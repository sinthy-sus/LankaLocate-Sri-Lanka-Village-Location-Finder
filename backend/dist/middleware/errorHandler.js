export function errorHandler(err, req, res, next) {
    console.error('Unhandled server error:', err);
    const status = err.status || 500;
    const message = err.message || 'Internal server error occurred';
    res.status(status).json({
        error: message,
        status,
        timestamp: new Date().toISOString()
    });
}
