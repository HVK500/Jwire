const getElementFromContext = (context) => {
  return context.nodes[0];
};

module.exports = {
  enable: (context) => {
    module.exports.removeAttr(context, 'disabled');
  },
  disable: (context) => {
    context.attr('disabled', 'disabled');
  },
  setText: (context, text) => {
    context.text(text);
  },
  clearText: (context) => {
    context.text('');
  },
  getValue: (context) => {
    return getElementFromContext(context).value;
  },
  removeAttr: (context, attrName) => {
    getElementFromContext(context).removeAttribute(attrName);
  },
  initModal: (context, options) => {
    const instance = M.Modal.init(getElementFromContext(context), options);
    return {
      show: () => {
        instance.open();
      },
      hide: () => {
        instance.close();
      }
    }
  }
};
