export const errorHandler = (res, error, message = 'An error occurred', statusCode = 500) => {
    return res.status(statusCode).json({ error: message });
};
