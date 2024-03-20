var client;

(async function init() {
  client = await app.initialized();
  client.events.on('app.activated', renderApp);
})();

async function renderApp() {
  var hideBtn = document.querySelector('.btn-userCustomProperty');
  hideBtn.addEventListener('fwClick', async function hideIt() {
    try {
      await client.interface.trigger("showNotify", {
        type: "info",
        message: "Showing the notification via interface method!"
      });
    } catch (error) {
      console.error('Failed to show notification', error);
    }
  });
}
