module.exports = {
  tableName: 'task_comment',
  attributes: {
    task:    { model: 'task',    required: true },
    author:  { model: 'user',   required: true },
    content: { type: 'string',  required: true },
  },
};
