var client;

(async function init() {
  client = await app.initialized();
  client.events.on('app.activated', renderApp);
})();

async function renderApp() {
  var hideBtn = document.querySelector('.btn-userCustomProperty');
  hideBtn.addEventListener('fwClick', async function hideIt() {
    try {
      await client.interface.trigger('hide', { id: 'userCustomProperties' });
    } catch (error) {
      console.error('problem hiding custom prop', error);
    }
  });
}
