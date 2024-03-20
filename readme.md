## Interface method sample app

This sample app demonstrates [interface method](https://developers.freshworks.com/docs/app-sdk/v3.0/support_ticket/front-end-apps/interface-methods/) on Platform version 3.0 in different modules using the interface methods such as `client.interface.trigger('showModal', {})`, `client.interface.trigger('showConfirm', {})`, etc

| Module | Works in Product |
| ----- | ------- |
| `support_ticket` | Freshdesk |
| `service_ticket` | Freshservice |
| `deal` | Freshsales Classic and Freshsales Suite |

### Files and Folders
    .
    ├── README.md                 A file for your future self and developer friends to learn about app
    ├── app                       A folder to place all assets required for frontend components
    │   ├── index.html            A landing page for the user to use the app
    │   ├── scripts               JavaScript to place files frontend components business logic
    │   │   └── app.js
    │   └── styles                A folder to place all the styles for app
    │   │   └── images
    │   │       └── icon.svg
    │   └── views                 JavaScript to place files frontend components business logic
    │       └── modal.html        A modal page for the user to use the app
    ├── config                    A folder to place all the configuration files
    │   └── iparams.json
    └── manifest.json             A JSON file holding meta data for app to run on platform