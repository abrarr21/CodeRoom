export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);

      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: error.issues,
      });
    }
  };
};
