window.frsh_init().then(function(client) {
  window.client = client;
});

async function showModal() {
  try {
    const data = await client.interface.trigger('showModal', {
      title: 'Sample App Form',
      template: './views/modal.html'
    });
    console.log('Parent:InterfaceAPI:showModal', data);
  } catch (error) {
    console.log('Parent:InterfaceAPI:showModal', error);
  }
}

async function showConfirm() {
  try {
    const data = await client.interface.trigger('showConfirm', {
      title: 'Sample Confirm',
      message: 'Select OK or Cancel'
    });
    console.log('Parent:InterfaceAPI:showConfirm', data);
  } catch (error) {
    console.log('Parent:InterfaceAPI:showConfirm', error);
  }
}

async function notify() {
  try {
    const data = await client.interface.trigger('showNotify', {
      type: 'success', 
      message: 'success message'
    });
    console.log('Parent:InterfaceAPI:showNotify', data);
  } catch (error) {
    console.log('Parent:InterfaceAPI:showNotify', error);
  }
}

