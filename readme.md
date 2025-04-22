# Freshworks Custom Field Manager - Intelligent Ticket Field Visibility Control

A Freshworks application that dynamically manages custom field visibility in support tickets based on user roles, ticket properties, and business rules. The app provides automated field management to streamline the ticket handling process and ensure appropriate data collection.

This application enhances the Freshworks platform by intelligently controlling the visibility of custom fields in support tickets. It implements role-based access control for administrative fields, handles special cases for booking-related fields, and provides a consistent user experience across support and service tickets. The app uses exponential backoff for reliable initialization and includes comprehensive error handling to ensure stable operation.

## Repository Structure
```
.
├── app/                          # Application source code
│   ├── index.html               # Main entry point with UI components and field visibility tracking
│   ├── scripts/
│   │   └── app.js              # Core application logic for field management and client initialization
│   └── views/
│       └── modal.html          # Modal component for user input collection
├── config/
│   └── iparams.json            # Installation parameter configuration
├── manifest.json               # App configuration and platform requirements
└── ticket_fields.json         # Custom field definitions and properties
```

## Usage Instructions
### Prerequisites
- Freshworks Developer Account
- Node.js v18.20.4
- Freshworks CLI (FDK) v9.3.1
- Modern web browser with JavaScript enabled
- Appropriate Freshworks platform permissions

### Installation
1. Clone the repository:
```bash
git clone <repository-url>
cd freshworks-custom-field-manager
```

2. Install dependencies:
```bash
npm install
```

3. Configure the application:
```bash
fdk validate
```

4. Deploy to your Freshworks instance:
```bash
fdk pack
fdk deploy
```

### Quick Start
1. Install the application in your Freshworks instance
2. Navigate to any ticket view
3. The application will automatically:
   - Initialize the client with retry logic
   - Hide managed custom fields by default
   - Apply role-based visibility rules
   - Handle special cases for booking-related fields

### More Detailed Examples
1. Admin-only field management:
```javascript
// Fields only visible to admins
const ADMIN_ONLY_FIELDS = [
  "cf_qa",
  "cf_outside_our_control",
  "cf_within_our_control",
  "cf_test"
];
```

2. Booking meeting date handling:
```javascript
// Show booking date field only when issue type is "Bookings Meeting"
if (issueDetail === "Bookings Meeting") {
  await client.interface.trigger("show", { id: "cf_bookings_meeting_date" });
}
```

### Troubleshooting
1. Initialization Failures
- Problem: App fails to initialize
- Solution: Check browser console for errors and retry count
- Debug: Enable verbose logging with `localStorage.debug = '*'`

2. Field Visibility Issues
- Problem: Fields not showing/hiding correctly
- Solution: Verify user role permissions and field configurations
- Debug: Check `ticket_fields.json` for field definitions

3. Performance Optimization
- Monitor client initialization time
- Use browser developer tools to track field visibility operations
- Check network requests for API calls

## Data Flow
The application manages ticket field visibility through a structured process of initialization, role checking, and field management.

```ascii
[User Access] -> [Client Init] -> [Role Check] -> [Field Management]
     |              |                |                    |
     |              v                v                    v
     |         [Retry Logic]    [Admin Check]    [Visibility Rules]
     |              |                |                    |
     v              v                v                    v
[User Input] <- [UI Update] <- [Permission Apply] <- [Field State]
```

Key Component Interactions:
1. Client initialization with exponential backoff retry
2. User role verification against admin privileges
3. Field visibility rules application based on ticket properties
4. Real-time updates based on ticket field changes
5. Event handling for ticket view changes
6. Custom field state management
7. Modal form data collection and processing