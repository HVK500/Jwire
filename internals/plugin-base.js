module.exports = (id, type, callbacks) => {
  id = !!id ? id : +new Date;
  type = !!type ? type : 'formatter';

  const result = {
    id: id,
    type: type, // One type for now?
    onAddNode: value => value,
    onOutput: value => value
  };

  // Callbacks is a Map
  if (callbacks.size !== 0) {
    callbacks.forEach((value, key) => {
      if (!result[key]) return;
      result[key] = value;
    });
  }

  return result;
};
