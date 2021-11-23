var client;

(async function init() {
  client = await app.initialized();
  client.events.on('app.activated', hideUserProperty);
})();

async function hideUserProperty() {
  var hideBtn = document.querySelector('.hide-user-property');
  hideBtn.addEventListener('fwClick', hideIt);

  async function hideIt() {
    try {
      await client.interface.trigger('hide', { id: 'userCustomProperties' });
    } catch (error) {
      console.error('problem hiding custom prop', error);
    }
  }
}
