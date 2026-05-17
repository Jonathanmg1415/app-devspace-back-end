module.exports = {
  attributes: {
    email:     { type: 'string', required: true, unique: true, isEmail: true },
    password:  { type: 'string', required: true },
    name:      { type: 'string', required: true },
    projects:  { collection: 'project', via: 'owner' },
  },
  customToJSON() {
    const obj = { ...this };
    delete obj.password;
    return obj;
  },
};
