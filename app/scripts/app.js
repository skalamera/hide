// Global client initialization flag
let isInitializing = false;
let initializationRetries = 0;
const MAX_RETRIES = 5;

// List of custom field IDs to manage visibility
const MANAGED_CUSTOM_FIELDS = [
  "cf_use_tech_admin_to_resolve",
  "cf_realm",
  "cf_issue_type",
  "cf_path",
  "cf_affected_users_bu_role",
  "cf_new_rostering_method",
  "cf_rostering_method",
  "cf_username",
  "cf_requested_date_of_completion",
  "cf_new_district_term_start_date",
  "cf_schools_to_be_updated",
  "cf_nameemail_of_contact_to_add",
  "cf_nameemail_of_contact_to_remove",
  "cf_nameemail_of_contact_to_update",
  "cf_what_type_of_support_do_you_need",
  "cf_current_lms_learning_management_system",
  "cf_sales_order_number",
  "cf_district_admin",
  "cf_school_admin",
  "cf_fsm_customer_signature",
  "cf_fsm_appointment_start_time",
  "cf_fsm_appointment_end_time",
  "cf_student",
  "cf_teacher",
  "cf_how_can_we_help",
  "cf_meeting_date",
  "cf_purchase_order",
  "cf_associated_sales_order",
  "cf_associated_deal",
  "cf_csat_feedback_received",
  "cf_tracker_resolved",
  "cf_old_subfill",
  "cf_qa",
  "cf_outside_our_control",
  "cf_within_our_control",
  "cf_test",
  "cf_bookings_meeting_date"
];

// Fields that should always be hidden regardless of other conditions
const ALWAYS_HIDDEN_FIELDS = [
  "cf_meeting_date",
  "internal_group",
  "cf_csat_feedback_received",
  "cf_tracker_resolved",
  "cf_old_subfill",
  "cf_summary_or_issue_description",
  "cf_jira_print_digital",
  "cf_jira_version",
  "cf_jira_copyright",
  "cf_sedcust_jira_resource",
  "cf_jira_product_name",
  "cf_jira_locale",
  "cf_jira_state_district_variation",
  "cf_jira_user_role"
];

// Fields that should only be shown when categorization is "Subscriptions"
const SUBSCRIPTION_DEPENDENT_FIELDS = [
  "cf_purchase_order",
  "cf_associated_sales_order",
  "cf_associated_deal"
];

// Fields that should only be visible to Admin or Account Admin users
const ADMIN_ONLY_FIELDS = [
  "cf_qa",
  "cf_outside_our_control",
  "cf_within_our_control",
  "cf_test"
];

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

      // Initially hide all managed custom fields
      hideAllManagedCustomFields();

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

  // Listen for ticket field changes which might affect custom field visibility
  window.client.events.on('ticket.customFieldChanged', function (event) {
    console.log('Custom field changed:', event);
    checkCurrentTicket();
  });

  window.client.events.on('ticket.sourceChanged', function (event) {
    console.log('Source changed:', event);
    checkCurrentTicket();
  });
}

// Check if current user has admin privileges (Admin or Account Admin)
async function checkIfUserHasAdminPrivileges() {
  if (!window.client) {
    console.error('Client not initialized, cannot check user privileges');
    return false;
  }

  try {
    // Try to get the current agent data
    const data = await window.client.data.get('loggedInUser');
    console.log('Current user data:', data);

    if (data && data.loggedInUser && data.loggedInUser.role_ids) {
      // Check for specific admin role IDs
      const ADMIN_ROLE_ID = 67000255947;
      const ACCOUNT_ADMIN_ROLE_ID = 67000255946;

      const isAdmin = data.loggedInUser.role_ids.includes(ADMIN_ROLE_ID) ||
        data.loggedInUser.role_ids.includes(ACCOUNT_ADMIN_ROLE_ID);

      console.log(`User role IDs: ${data.loggedInUser.role_ids}, isAdmin: ${isAdmin}`);
      return isAdmin;
    }

    // If we couldn't get the role IDs, return false
    console.log('Could not determine user role IDs, defaulting to non-admin');
    return false;
  } catch (error) {
    console.error('Error checking user privileges:', error);
    console.log('Due to error, defaulting to showing admin-only fields');
    // When there's an error checking privileges, we'll show admin fields
    // This prevents hiding fields from users who might need them
    return true;
  }
}

// Hide admin-only fields for non-admin users
async function hideAdminOnlyFields() {
  if (!window.client) {
    console.error('Client not initialized, cannot hide admin-only fields');
    return;
  }

  // Check if user has admin privileges
  const isAdmin = await checkIfUserHasAdminPrivileges();

  for (const fieldId of ADMIN_ONLY_FIELDS) {
    try {
      if (!isAdmin) {
        // Hide admin-only fields for non-admin users
        await window.client.interface.trigger("hide", { id: fieldId });
        console.log(`Hiding admin-only field ${fieldId} for non-admin user`);
      } else {
        // Explicitly show admin-only fields for admin users
        await window.client.interface.trigger("show", { id: fieldId });
        console.log(`Showing admin-only field ${fieldId} for admin user`);
      }
    } catch (error) {
      console.error(`Failed to manage admin-only field ${fieldId}:`, error);
    }
  }
}

// Handle special case for bookings meeting date
async function handleBookingsMeetingDateField(ticketData) {
  if (!window.client || !ticketData || !ticketData.ticket || !ticketData.ticket.custom_fields) {
    return;
  }

  const custom_fields = ticketData.ticket.custom_fields;
  const issueDetail = custom_fields.cf_issue_detail;

  // Hide cf_bookings_meeting_date if cf_issue_detail is NOT "Bookings Meeting"
  if (issueDetail !== "Bookings Meeting") {
    try {
      await window.client.interface.trigger("hide", { id: "cf_bookings_meeting_date" });
      console.log('Hiding bookings meeting date field because issue detail is NOT "Bookings Meeting"');
    } catch (error) {
      console.error('Failed to hide bookings meeting date field:', error);
    }
  } else {
    // Show the field if issue detail IS "Bookings Meeting"
    try {
      await window.client.interface.trigger("show", { id: "cf_bookings_meeting_date" });
      console.log('Showing bookings meeting date field because issue detail IS "Bookings Meeting"');
    } catch (error) {
      console.error('Failed to show bookings meeting date field:', error);
    }
  }
}

// Hide all managed custom fields
async function hideAllManagedCustomFields() {
  if (!window.client) {
    console.error('Client not initialized, cannot hide custom fields');
    return;
  }

  // Check if user is admin before hiding admin-only fields
  const isAdmin = await checkIfUserHasAdminPrivileges();

  for (const fieldId of MANAGED_CUSTOM_FIELDS) {
    // Skip admin-only fields for admins
    if (isAdmin && ADMIN_ONLY_FIELDS.includes(fieldId)) {
      console.log(`Not hiding admin-only field ${fieldId} for admin user`);
      continue;
    }

    try {
      await window.client.interface.trigger("hide", { id: fieldId });
    } catch (error) {
      console.error(`Failed to hide field ${fieldId}:`, error);
    }
  }

  // Also hide the always-hidden fields
  hideAlwaysHiddenFields();

  console.log('All managed custom fields hidden (except admin fields for admin users)');
}

// Hide fields that should always be hidden
async function hideAlwaysHiddenFields() {
  if (!window.client) {
    console.error('Client not initialized, cannot hide always-hidden fields');
    return;
  }

  for (const fieldId of ALWAYS_HIDDEN_FIELDS) {
    try {
      await window.client.interface.trigger("hide", { id: fieldId });
      console.log(`Always hiding field ${fieldId}`);
    } catch (error) {
      console.error(`Failed to hide always-hidden field ${fieldId}:`, error);
    }
  }
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

    // Handle assembly tracker field visibility based on tags
    handleAssemblyTrackerVisibility(ticketData);

    // Always hide specific fields first
    hideAlwaysHiddenFields();

    // Check if user has admin privileges
    const isAdmin = await checkIfUserHasAdminPrivileges();

    // If user is admin, show admin-only fields
    if (isAdmin) {
      for (const fieldId of ADMIN_ONLY_FIELDS) {
        try {
          await window.client.interface.trigger("show", { id: fieldId });
          console.log(`Explicitly showing admin-only field ${fieldId} for admin user`);
        } catch (error) {
          console.error(`Failed to show admin-only field ${fieldId}:`, error);
        }
      }
    }

    // Handle custom fields visibility based on source
    handleCustomFieldsVisibility(ticketData);

    // Handle special case for bookings meeting date
    await handleBookingsMeetingDateField(ticketData);

    // If user is admin, ensure admin fields remain visible
    if (isAdmin) {
      for (const fieldId of ADMIN_ONLY_FIELDS) {
        try {
          await window.client.interface.trigger("show", { id: fieldId });
          console.log(`Final check: ensuring admin-only field ${fieldId} is visible for admin user`);
        } catch (error) {
          console.error(`Failed to show admin-only field ${fieldId}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error checking ticket data:', error);
    // Hide fields on error
    hideAssemblyTrackerField();
    hideAllManagedCustomFields();
  }
}

// Handle assembly tracker field visibility based on tags
function handleAssemblyTrackerVisibility(ticketData) {
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
}

// Handle custom fields visibility based on source and field values
async function handleCustomFieldsVisibility(ticketData) {
  if (!ticketData || !ticketData.ticket) {
    console.log('No ticket data available, hiding all custom fields');
    hideAllManagedCustomFields();
    return;
  }

  const ticket = ticketData.ticket;

  // Check if source is Portal (id=2) or Feedback Widget (id=9)
  const isPortalSource = ticket.source === 2;
  const isFeedbackWidgetSource = ticket.source === 9;
  const isAllowedSource = isPortalSource || isFeedbackWidgetSource;

  console.log(`Ticket source: ${ticket.source}, isPortalSource: ${isPortalSource}, isFeedbackWidgetSource: ${isFeedbackWidgetSource}, isAllowedSource: ${isAllowedSource}`);

  if (!isAllowedSource) {
    console.log('Ticket is not from Portal or Feedback Widget source, hiding all custom fields except admin-only fields');
    // Hide all managed fields except admin-only fields for admins
    const isAdmin = await checkIfUserHasAdminPrivileges();
    for (const fieldId of MANAGED_CUSTOM_FIELDS) {
      // Skip admin-only fields for admins
      if (isAdmin && ADMIN_ONLY_FIELDS.includes(fieldId)) {
        continue;
      }
      try {
        await window.client.interface.trigger("hide", { id: fieldId });
      } catch (error) {
        console.error(`Failed to hide field ${fieldId}:`, error);
      }
    }
    return;
  }

  // Check if categorization is "Subscriptions" for subscription-dependent fields
  const isSubscriptionCategorization =
    ticket.custom_fields &&
    ticket.custom_fields.cf_categorization === "Subscriptions";

  console.log(`Categorization check: ${isSubscriptionCategorization ? 'Is Subscriptions' : 'Not Subscriptions'}`);

  // Check if user has admin privileges
  const isAdmin = await checkIfUserHasAdminPrivileges();

  // If source is allowed (Portal or Feedback Widget), show fields that have values
  if (ticket.custom_fields) {
    console.log('Checking custom fields for values:', ticket.custom_fields);

    for (const fieldId of MANAGED_CUSTOM_FIELDS) {
      // Skip always-hidden fields
      if (ALWAYS_HIDDEN_FIELDS.includes(fieldId)) {
        continue;
      }

      // For admin-only fields, always show them to admins regardless of value
      if (ADMIN_ONLY_FIELDS.includes(fieldId)) {
        if (isAdmin) {
          try {
            await window.client.interface.trigger("show", { id: fieldId });
            console.log(`Showing admin-only field ${fieldId} to admin user regardless of value`);
          } catch (error) {
            console.error(`Failed to show admin-only field ${fieldId}:`, error);
          }
          continue;
        } else {
          // Hide admin-only fields for non-admin users
          try {
            await window.client.interface.trigger("hide", { id: fieldId });
            console.log(`Hiding admin-only field ${fieldId} for non-admin user`);
          } catch (error) {
            console.error(`Failed to hide admin-only field ${fieldId}:`, error);
          }
          continue;
        }
      }

      // For subscription-dependent fields, only process if categorization is "Subscriptions"
      if (SUBSCRIPTION_DEPENDENT_FIELDS.includes(fieldId)) {
        if (isSubscriptionCategorization) {
          try {
            await window.client.interface.trigger("show", { id: fieldId });
            console.log(`Showing subscription-dependent field ${fieldId} because categorization is "Subscriptions"`);
          } catch (error) {
            console.error(`Failed to show subscription-dependent field ${fieldId}:`, error);
          }
        } else {
          try {
            await window.client.interface.trigger("hide", { id: fieldId });
            console.log(`Hiding subscription-dependent field ${fieldId} because categorization is not "Subscriptions"`);
          } catch (error) {
            console.error(`Failed to hide subscription-dependent field ${fieldId}:`, error);
          }
        }
        continue;
      }

      // Special case for bookings meeting date
      if (fieldId === "cf_bookings_meeting_date") {
        if (ticket.custom_fields.cf_issue_detail === "Bookings Meeting") {
          try {
            await window.client.interface.trigger("show", { id: fieldId });
            console.log(`Showing bookings meeting date field because issue detail is "Bookings Meeting"`);
          } catch (error) {
            console.error(`Failed to show bookings meeting date field:`, error);
          }
        } else {
          try {
            await window.client.interface.trigger("hide", { id: fieldId });
            console.log(`Hiding bookings meeting date field because issue detail is NOT "Bookings Meeting"`);
          } catch (error) {
            console.error(`Failed to hide bookings meeting date field:`, error);
          }
        }
        continue;
      }

      // Get the field key 
      const fieldKey = fieldId;
      const fieldValue = ticket.custom_fields[fieldKey];

      // Check if field has a value (not null, undefined, empty string, or empty array)
      const hasValue = fieldValue !== null &&
        fieldValue !== undefined &&
        fieldValue !== '' &&
        !(Array.isArray(fieldValue) && fieldValue.length === 0);

      console.log(`Field ${fieldId}: value=${fieldValue}, hasValue=${hasValue}`);

      if (hasValue) {
        // Show field if it has a value
        try {
          await window.client.interface.trigger("show", { id: fieldId });
          console.log(`Showing field ${fieldId} with value: ${fieldValue}`);
        } catch (error) {
          console.error(`Failed to show field ${fieldId}:`, error);
        }
      } else {
        // Hide field if it doesn't have a value
        try {
          await window.client.interface.trigger("hide", { id: fieldId });
          console.log(`Hiding field ${fieldId} with no value`);
        } catch (error) {
          console.error(`Failed to hide field ${fieldId}:`, error);
        }
      }
    }
  } else {
    console.log('No custom fields data available, hiding all non-admin fields');
    // Hide all non-admin fields
    for (const fieldId of MANAGED_CUSTOM_FIELDS) {
      // Skip admin-only fields for admins
      if (isAdmin && ADMIN_ONLY_FIELDS.includes(fieldId)) {
        continue;
      }
      try {
        await window.client.interface.trigger("hide", { id: fieldId });
      } catch (error) {
        console.error(`Failed to hide field ${fieldId}:`, error);
      }
    }
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

