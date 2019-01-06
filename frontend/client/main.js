const u = require('umbrellajs');
const comms = require('./comms');
const helpers = require('./helpers');

// TODO: Clean up

u(document).on('DOMContentLoaded', () => {
  const loadingModal = helpers.initModal(u('#loading-model'), { dismissible: false });

  // Hook up listeners for UI
  u('#key-path').on('input', (event) => {
    const element = u('#submit-query');

    if (event.target.value.trim() === '') {
      helpers.disable(element);
      return;
    }

    helpers.enable(element);
  });

  const clearResultsCallback = () => {
    helpers.disable(u('#clear-query-results'));
    // clear results text area
    helpers.clearText(u('#query-results'));
  };
  u('#clear-query-results').on('click', clearResultsCallback);

  u('#submit-query').on('click', () => {
    // Clear results textarea
    clearResultsCallback();

    // Show loader
    loadingModal.show();
    // Send off query to server
    comms.sendQuery(
      // Get key path
      helpers.getValue(u('#key-path')),
      // Get expected value if given one
      helpers.getValue(u('#expected-value'))
    ).then((response) => {
      // Hide loader
      loadingModal.hide();

      // Dump response in results textarea and enable the clear button
      const queryResultText = u('#query-results');
      helpers.enable(queryResultText);
      helpers.setText(queryResultText, JSON.stringify(response.data, null, 2));
      M.textareaAutoResize(queryResultText.nodes[0]);
      helpers.enable(u('#clear-query-results'));
    });
  });
});
