module.exports.models = {
  datastore: 'default',
  migrate:   'safe',
  attributes: {
    createdAt: { type: 'number', autoCreatedAt: true },
    updatedAt: { type: 'number', autoUpdatedAt: true },
    id:        { type: 'number', autoIncrement: true },
  },
  cascadeOnDestroy: false,
};
