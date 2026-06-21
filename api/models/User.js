module.exports = {
  attributes: {
    email:              { type: 'string', required: true, unique: true, isEmail: true },
    password:           { type: 'string', required: true },
    name:               { type: 'string', required: true },
    reset_token:        { type: 'string', allowNull: true },
    reset_token_expiry: { type: 'number', allowNull: true },
    projects:           { collection: 'project', via: 'owner' },
  },
  customToJSON() {
    const obj = { ...this };
    delete obj.password;
    delete obj.reset_token;
    delete obj.reset_token_expiry;
    return obj;
  },
};
