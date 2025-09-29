const createHTTPError = require('http-errors');

const validate = (schema) =>{
    return (req, res, next) =>{
        try {
            schema.parse(req.body);
            next();
        } catch (err) {
            //Zod yrsl un tableau d'erreurs
            const errorMessage =  err.errors?.[0]?.message || "Validation Failed";
            next(createHTTPError(400, errorMessage));
        }
    }
}

module.exports = validate;