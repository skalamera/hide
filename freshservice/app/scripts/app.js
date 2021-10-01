window.frsh_init().then(function (client) {
  window.client = client;
});

function showModal() {
  client.interface.trigger('showModal', {
    title: 'Sample App Form',
    template: './views/modal.html'
  })
    .then(
      function (data) {
        console.log('Parent:InterfaceAPI:showModal', data);
      },
      function (error) {
        console.log('Parent:InterfaceAPI:showModal', error);
      }
    );
}

function showConfirm() {
  client.interface.trigger('showConfirm', {
    title: 'Sample Confirm',
    message: 'Select OK or Cancel'
  })
    .then(
      function (data) {
        console.log('Parent:InterfaceAPI:showConfirm', data);
      },
      function (error) {
        console.log('Parent:InterfaceAPI:showConfirm', error);
      }
    );
}

function notify() {
  client.interface.trigger('showNotify', {
    type: 'success', message: 'success message'
  })
    .then(
      function (data) {
        console.log('Parent:InterfaceAPI:showNotify', data);
      },
      function (error) {
        console.log('Parent:InterfaceAPI:showNotify', error);
      }
    );
}

function hide(element) {
  client.interface.trigger("hideElement", { id: element });
}

function show(element) {
  client.interface.trigger("showElement", { id: element });
}

function enable(element) {
  client.interface.trigger("enableElement", { id: element });
}

function disable(element) {
  client.interface.trigger("disableElement", { id: element });
}

function setValue(element, value) {
  client.interface.trigger("setValue", { id: element, value: value });
}

function openNote() {
  client.interface.trigger("click", { id: "openNote", text: "Text to be inserted" });
}
