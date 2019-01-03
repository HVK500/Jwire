const u = require('umbrellajs');

u(document).on('DOMContentLoaded', () => {
  // Hook up listeners for UI
  u('#key-path').on('input', (event) => {
    if (event.target.value.trim() === '') {
      u('#submit-query').attr('disabled', 'disabled');
      return;
    }
    u('#submit-query').nodes[0].removeAttribute('disabled');
  });

  u('#submit-query').on('click', () => {
    // Clear results textarea

    // Get key path
    // Get expected value if given one

    // Show loader
    // Send off query to server

    // Hide loader
    // Dump response in results textarea
  });

  u('#clear-query-results').on('click', () => {
    // TODO: clear results text area
  });
});
