const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  // 'create' = new company, 'join' = existing company
  action: Joi.string().valid('create', 'join').required(),
  // Required when action === 'create'
  companyName: Joi.when('action', {
    is: 'create',
    then: Joi.string().trim().min(2).max(100).required(),
    otherwise: Joi.forbidden(),
  }),
  industry: Joi.when('action', {
    is: 'create',
    then: Joi.string().trim().min(2).max(50).required(),
    otherwise: Joi.forbidden(),
  }),
  // Required when action === 'join'
  companyCode: Joi.when('action', {
    is: 'join',
    then: Joi.string().trim().length(8).uppercase().required(),
    otherwise: Joi.forbidden(),
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };
