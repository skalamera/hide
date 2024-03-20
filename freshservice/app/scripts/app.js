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

async function showDialog() {
  try {
    const data = await client.interface.trigger('showDialog', {
      title: 'Sample Dialog',
      template: './views/modal.html'
    });
    console.log('Parent:InterfaceAPI:showDialog', data);
  } catch (error) {
    console.log('Parent:InterfaceAPI:showDialog', error);
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

const hide = async (element) => {
  try {
    await client.interface.trigger("hide", { id: element });
  } catch (error) {
    console.error(`Failed to hide element ${element}`, error);
  }
};

const show = async (element) => {
  try {
    await client.interface.trigger("show", { id: element });
  } catch (error) {
    console.error(`Failed to show element ${element}`, error);
  }
};

const enable = async (element) => {
  try {
    await client.interface.trigger("enable", { id: element });
  } catch (error) {
    console.error(`Failed to enable element ${element}`, error);
  }
};

const disable = async (element) => {
  try {
    await client.interface.trigger("disable", { id: element });
  } catch (error) {
    console.error(`Failed to disable element ${element}`, error);
  }
};

const setValue = async (element, value) => {
  try {
    await client.interface.trigger("setValue", { id: element, value: value });
  } catch (error) {
    console.error(`Failed to setValue ${element} and ${value}`, error);
  }
};

const openNote = async () => {
  try {
    await client.interface.trigger("click", {id: "openNote", text: "Text to be inserted", isPublic: true});
  } catch (error) {
    console.error(`Failed to open note`, error);
  }
};

const insertContent = async (element) => {
  try {
    await client.interface.trigger("setValue", {id: "editor", text: "insert content"} );
  } catch (error) {
    console.error(`Failed to insertContent ${element}`, error);
  }
};

