// Global client initialization flag
let isInitializing = false;
let initializationRetries = 0;
const MAX_RETRIES = 5;

// Initialize when window is fully loaded
window.onload = function () {
  console.log("Window loaded, starting initialization");
  initializeClient();
};

// Initialize the Freshworks client
function initializeClient() {
  // Prevent multiple initializations running at once
  if (isInitializing) {
    console.log("Initialization already in progress");
    return;
  }

  isInitializing = true;
  disableButtons();

  // Show loading message
  const loadingElement = document.getElementById('loading-message');
  if (loadingElement) {
    loadingElement.style.display = 'block';
  }

  // Check if Freshworks SDK is available
  if (typeof window.frsh_init !== 'function') {
    console.warn('Freshworks client library not loaded yet, retrying...');

    // Retry with exponential backoff
    if (initializationRetries < MAX_RETRIES) {
      const delay = Math.pow(2, initializationRetries) * 500; // Exponential backoff
      initializationRetries++;
      console.log(`Retry ${initializationRetries}/${MAX_RETRIES} in ${delay}ms`);

      setTimeout(function () {
        isInitializing = false;
        initializeClient();
      }, delay);
    } else {
      console.error('Failed to load Freshworks client library after maximum retries');
      isInitializing = false;
    }
    return;
  }

  console.log("Starting Freshworks client initialization");

  // Reset the window.client to ensure we don't use a stale reference
  window.client = null;

  window.frsh_init()
    .then(function (client) {
      console.log('Freshworks client initialized successfully');
      window.client = client;

      // Enable all buttons
      enableButtons();

      // Hide loading message
      const loadingElement = document.getElementById('loading-message');
      if (loadingElement) {
        loadingElement.style.display = 'none';
      }

      // Register ticket event handlers
      registerEventHandlers();

      // Hide assembly tracker field by default
      hideAssemblyTrackerField();

      // Check if we're on a ticket details page and handle visibility
      checkCurrentTicket();

      isInitializing = false;
      initializationRetries = 0;
    })
    .catch(function (error) {
      console.error('Failed to initialize Freshworks client:', error);

      // Retry initialization on failure
      if (initializationRetries < MAX_RETRIES) {
        const delay = Math.pow(2, initializationRetries) * 500; // Exponential backoff
        initializationRetries++;
        console.log(`Initialization failed. Retry ${initializationRetries}/${MAX_RETRIES} in ${delay}ms`);

        setTimeout(function () {
          isInitializing = false;
          initializeClient();
        }, delay);
      } else {
        console.error('Failed to initialize Freshworks client after maximum retries');
        isInitializing = false;
      }
    });
}

// Register event handlers for ticket-related events
function registerEventHandlers() {
  if (!window.client) {
    console.error('Client not initialized, cannot register event handlers');
    return;
  }

  // Listen for ticket data loaded event
  window.client.events.on('ticket.viewChanged', function (event) {
    console.log('Ticket view changed:', event);
    checkCurrentTicket();
  });

  window.client.events.on('ticket.tagsChanged', function (event) {
    console.log('Ticket tags changed:', event);
    checkCurrentTicket();
  });
}

// Check current ticket for tags and update field visibility
async function checkCurrentTicket() {
  if (!window.client) {
    console.error('Client not initialized, cannot check ticket');
    return;
  }

  try {
    // Get current ticket data
    const ticketData = await window.client.data.get('ticket');
    console.log('Current ticket data:', ticketData);

    // Fix: Access tags through the nested ticket object
    if (ticketData && ticketData.ticket && ticketData.ticket.tags) {
      const tags = ticketData.ticket.tags;

      // Check if either of the special tags are present
      const hasAssemblyRolloverTag = tags.includes('assembly-rollover');
      const hasTrackerAssemblyTag = tags.includes('tracker-assembly');

      if (hasAssemblyRolloverTag || hasTrackerAssemblyTag) {
        console.log('Ticket has special tag, showing assembly tracker field');
        showAssemblyTrackerField();
      } else {
        console.log('Ticket does not have special tags, hiding assembly tracker field');
        hideAssemblyTrackerField();
      }
    } else {
      // No tags data available, hide by default
      console.log('No tag data available, hiding assembly tracker field by default');
      hideAssemblyTrackerField();
    }
  } catch (error) {
    console.error('Error checking ticket data:', error);
    // Hide the field on error
    hideAssemblyTrackerField();
  }
}

// Hide the assembly tracker field
async function hideAssemblyTrackerField() {
  try {
    if (!window.client) {
      console.error('Client not initialized, cannot hide assembly tracker field');
      return;
    }

    await window.client.interface.trigger("hide", { id: "cf_assembly_tracker_status" });
    console.log('Assembly tracker field hidden');
  } catch (error) {
    console.error('Failed to hide assembly tracker field:', error);
  }
}

// Show the assembly tracker field
async function showAssemblyTrackerField() {
  try {
    if (!window.client) {
      console.error('Client not initialized, cannot show assembly tracker field');
      return;
    }

    await window.client.interface.trigger("show", { id: "cf_assembly_tracker_status" });
    console.log('Assembly tracker field shown');
  } catch (error) {
    console.error('Failed to show assembly tracker field:', error);
  }
}

// Function to enable all buttons 
function enableButtons() {
  const buttons = document.querySelectorAll('fw-button');
  buttons.forEach(button => {
    button.disabled = false;
  });
}

// Function to disable all buttons
function disableButtons() {
  const buttons = document.querySelectorAll('fw-button');
  buttons.forEach(button => {
    button.disabled = true;
  });
}

async function showModal() {
  try {
    if (!window.client) {
      console.error('Client not initialized, please wait or refresh the page');
      return;
    }

    const data = await window.client.interface.trigger('showModal', {
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
    if (!window.client) {
      console.error('Client not initialized, please wait or refresh the page');
      return;
    }

    const data = await window.client.interface.trigger('showDialog', {
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
    if (!window.client) {
      console.error('Client not initialized, please wait or refresh the page');
      return;
    }

    const data = await window.client.interface.trigger('showConfirm', {
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
    if (!window.client) {
      console.error('Client not initialized, please wait or refresh the page');
      return;
    }

    const data = await window.client.interface.trigger('showNotify', {
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
    if (!window.client) {
      console.error('Client not initialized, please wait or refresh the page');
      return;
    }

    await window.client.interface.trigger("hide", { id: element });
  } catch (error) {
    console.error(`Failed to hide element ${element}`, error);
  }
};

const show = async (element) => {
  try {
    if (!window.client) {
      console.error('Client not initialized, please wait or refresh the page');
      return;
    }

    await window.client.interface.trigger("show", { id: element });
  } catch (error) {
    console.error(`Failed to show element ${element}`, error);
  }
};

const enable = async (element) => {
  try {
    if (!window.client) {
      console.error('Client not initialized, please wait or refresh the page');
      return;
    }

    await window.client.interface.trigger("enable", { id: element });
  } catch (error) {
    console.error(`Failed to enable element ${element}`, error);
  }
};

const disable = async (element) => {
  try {
    if (!window.client) {
      console.error('Client not initialized, please wait or refresh the page');
      return;
    }

    await window.client.interface.trigger("disable", { id: element });
  } catch (error) {
    console.error(`Failed to disable element ${element}`, error);
  }
};

const setValue = async (element, value) => {
  try {
    if (!window.client) {
      console.error('Client not initialized, please wait or refresh the page');
      return;
    }

    await window.client.interface.trigger("setValue", { id: element, value: value });
  } catch (error) {
    console.error(`Failed to setValue ${element} and ${value}`, error);
  }
};

const openNote = async () => {
  try {
    if (!window.client) {
      console.error('Client not initialized, please wait or refresh the page');
      return;
    }

    await window.client.interface.trigger("click", { id: "openNote", text: "Text to be inserted", isPublic: true });
  } catch (error) {
    console.error(`Failed to open note`, error);
  }
};

const insertContent = async (element) => {
  try {
    if (!window.client) {
      console.error('Client not initialized, please wait or refresh the page');
      return;
    }

    await window.client.interface.trigger("setValue", { id: "editor", text: "insert content" });
  } catch (error) {
    console.error(`Failed to insertContent ${element}`, error);
  }
};

