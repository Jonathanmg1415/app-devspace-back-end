module.exports.models = {
  datastore: 'default',
  migrate:   process.env.NODE_ENV === 'production' ? 'safe' : 'alter',
  attributes: {
    createdAt: { type: 'number', autoCreatedAt: true },
    updatedAt: { type: 'number', autoUpdatedAt: true },
    id:        { type: 'number', autoIncrement: true },
  },
  cascadeOnDestroy: false,
};
