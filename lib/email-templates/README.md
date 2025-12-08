# Email Templates - Modular Email System

This directory contains a complete modular email template system for RealProof, following DRY (Don't Repeat Yourself) principles and providing clean, maintainable, and context-aware email generation.

## 🚀 Overview

The email template system has been refactored from a monolithic approach to a modular, type-safe, and highly maintainable architecture. This system supports:

- **Modular Design**: Separate files for different template types
- **Context-Aware**: Dynamic content based on user data and waitlist position
- **Type Safety**: Full TypeScript support with strict typing
- **DRY Principles**: Reusable components and utilities
- **Responsive Design**: Works across all major email clients
- **Development Tools**: Preview, testing, and debugging utilities

## 📁 File Structure

```
lib/email-templates/
├── README.md                 # This documentation
├── types.ts                  # TypeScript interfaces and types
├── base-template.ts         # Base email components and utilities
├── waitlist-confirmation.ts # User confirmation email template
├── admin-notification.ts   # Admin notification email template
├── index.ts                 # Main exports and factory
└── dev-utils.ts            # Development and testing utilities
```

## 🎯 Key Features

### 1. **Position-Based Personalization**
```typescript
// Automatically adjusts message based on waitlist position
const positionMessage = createPositionMessage(position, totalCount);
// Position 1-10:   "🔥 Wow! You're in the top 10..."
// Position 11-100: "⭐ You're #42 on our waitlist..."
// Position 500+:   "📈 You're #1250 on our waitlist..."
```

### 2. **Context-Aware Template Generation**
```typescript
const context = createTemplateContext(userData, config, {
  user: { firstName, fullName, email },
  waitlist: { position, positionText, totalCount },
  company: { companyName, supportEmail, websiteUrl },
  metadata: { timestamp, formattedDate }
});
```

### 3. **Modular Component System**
- `createEmailHeader()` - Reusable header component
- `createHighlightBox()` - Attention-grabbing content boxes
- `createStatsSection()` - Company statistics display
- `createFeatureList()` - Feature highlights
- `createEmailFooter()` - Consistent footer with unsubscribe links

## 🛠 Usage

### Basic Usage

```typescript
import { Templates } from './email-templates';

// Generate waitlist confirmation email
const confirmationEmail = Templates.waitlistConfirmation({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  position: 42
});

// Generate admin notification
const adminEmail = Templates.adminNotification({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  position: 42,
  totalCount: 150
});
```

### Advanced Usage with Factory

```typescript
import { EmailTemplateFactory } from './email-templates';

const factory = new EmailTemplateFactory({
  companyName: 'RealProof',
  fromEmail: 'hello@realproof.ng',
  supportEmail: 'support@realproof.ng',
  websiteUrl: 'https://realproof.ng'
});

const email = factory.createWaitlistConfirmation(userData);
```

### Integration with Email Service

```typescript
// In email-service.ts
import { Templates } from './email-templates';

export async function sendWaitlistConfirmationEmail(data: WaitlistEmailData) {
  const template = Templates.waitlistConfirmation(data);
  
  return await resend.emails.send({
    from: FROM_EMAIL,
    to: [data.email],
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}
```

## 📧 Email Templates

### 1. Waitlist Confirmation Email

**Purpose**: Sent to users who successfully join the waitlist  
**Features**:
- Personalized greeting with position information
- Dynamic positioning messages based on queue position
- Company statistics and feature highlights
- Clear next steps and expectations
- Responsive design with branded styling

**Template**: `waitlist-confirmation.ts`

### 2. Admin Notification Email

**Purpose**: Sent to administrators when new users join  
**Features**:
- User details with quick action buttons
- Growth insights and milestone tracking
- High-volume signup alerts
- Position and total count information
- Admin dashboard links

**Template**: `admin-notification.ts`

## 🧪 Development Tools

### Generate Email Previews

```bash
npm run email:generate [output-directory]
```

Creates HTML preview files for all email templates with sample data.

### Run Template Tests

```bash
npm run email:test
```

Tests email generation with edge cases and validates template integrity.

### Benchmark Performance

```bash
npm run email:benchmark [iterations]
```

Measures template generation performance for optimization.

### Preview in Browser

```bash
npm run email:preview
```

Generates previews and serves them at `/email-previews/` for browser testing.

## 🎨 Customization

### Styling

Modify the `defaultEmailStyles` in `types.ts`:

```typescript
export const defaultEmailStyles: EmailStyles = {
  colors: {
    primary: '#007bff',      // Main brand color
    secondary: '#6c757d',    // Secondary text
    success: '#28a745',      // Success states
    // ... more colors
  },
  fonts: {
    primary: 'Arial, sans-serif',
    secondary: 'Georgia, serif'
  }
};
```

### Company Configuration

Update the email factory configuration:

```typescript
export const emailFactory = new EmailTemplateFactory({
  companyName: 'RealProof',
  fromEmail: process.env.FROM_EMAIL || 'hello@realproof.ng',
  supportEmail: process.env.SUPPORT_EMAIL || 'hello@realproof.ng',
  unsubscribeUrl: process.env.UNSUBSCRIBE_URL || '{unsubscribe_url}',
  websiteUrl: process.env.WEBSITE_URL || 'https://realproof.ng'
});
```

### Adding New Templates

1. Create new template file: `lib/email-templates/my-template.ts`
2. Implement the template function:

```typescript
import { EmailTemplate, EmailTemplateFunction } from './types';
import { createBaseEmailHTML, createEmailHeader } from './base-template';

export const createMyTemplate: EmailTemplateFunction<MyData> = (data) => {
  const subject = `My Email Subject`;
  const header = createEmailHeader('RealProof', 'My Email Title');
  
  const emailContent = `
    ${header}
    <div class="email-content">
      <h2>Hello ${data.firstName}!</h2>
      <!-- Your content here -->
    </div>
  `;

  const html = createBaseEmailHTML(emailContent, subject);
  const text = createPlainTextTemplate(content, config);

  return { subject, html, text };
};
```

3. Export from `index.ts`:

```typescript
export { createMyTemplate } from './my-template';
```

4. Add to Templates object:

```typescript
export const Templates = {
  waitlistConfirmation: (data: WaitlistEmailData) => emailFactory.createWaitlistConfirmation(data),
  adminNotification: (data: AdminNotificationData) => emailFactory.createAdminNotification(data),
  myTemplate: createMyTemplate
};
```

## 🔧 Environment Variables

Required for email functionality:

```env
# Email Service Configuration
RESEND_API_KEY=re_xxxxxxxx          # Resend API key
FROM_EMAIL=hello@realproof.ng       # Verified sender email
ADMIN_EMAIL=admin@realproof.ng      # Admin notification recipient

# Template Configuration (Optional)
SUPPORT_EMAIL=hello@realproof.ng    # Support contact
WEBSITE_URL=https://realproof.ng    # Company website
UNSUBSCRIBE_URL={unsubscribe_url}   # Unsubscribe link
```

## 🚀 Migration from Old System

The refactoring maintains full backward compatibility:

### Before (Monolithic)
```typescript
// Old approach - everything in email-service.ts
function getWaitlistConfirmationTemplate(firstName, fullName, position) {
  // 200+ lines of mixed HTML/CSS/logic
}
```

### After (Modular)
```typescript
// New approach - clean separation
import { Templates } from './email-templates';
const template = Templates.waitlistConfirmation(data);
```

### Migration Benefits

1. **Maintainability**: Templates are now separate, focused files
2. **Reusability**: Components can be shared across templates
3. **Type Safety**: Full TypeScript support prevents runtime errors
4. **Testability**: Each template can be tested independently
5. **Consistency**: Shared base components ensure visual consistency
6. **Performance**: Template generation is optimized and benchmarked

## 📊 Performance

Current benchmarks (1000 iterations):
- Waitlist templates: ~2ms average generation time
- Admin templates: ~3ms average generation time
- Templates per second: ~400-500

## 🧪 Testing

### Automated Tests

```typescript
// Template validation
validateEmailData(data);        // Type checking
validateAdminData(data);        // Admin data validation

// Edge case testing
runTemplateTests();            // Tests special characters, missing data
benchmarkTemplates();          // Performance validation
```

### Manual Testing

1. Generate previews: `npm run email:generate`
2. Open `email-previews/index.html` in browser
3. Test across different email clients
4. Validate responsive design

## 🔗 Integration Points

### API Routes
- `app/api/waitlist/route.ts` - Calls email functions with position data
- Position data flows: Database → API → Email Service → Templates

### Email Service
- `lib/email-service.ts` - Main email sending functions
- Imports Templates and handles Resend integration
- Maintains backward compatibility

### Type Safety
- All data structures are typed
- Template functions enforce proper data shapes
- Compilation catches errors before deployment

## 📈 Future Enhancements

1. **Template Versioning**: A/B testing support
2. **Internationalization**: Multi-language template support
3. **Dynamic Content**: API-driven template content
4. **Analytics**: Email engagement tracking
5. **Rich Content**: Support for images and interactive elements

## 🤝 Contributing

When adding new templates or modifying existing ones:

1. Follow TypeScript strict typing
2. Use existing base components where possible
3. Add preview samples to dev-utils
4. Update this documentation
5. Test across email clients
6. Maintain backward compatibility

## 📚 References

- [Resend Documentation](https://resend.com/docs)
- [Email Client CSS Support](https://www.caniemail.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Responsive Email Design](https://foundation.zurb.com/emails.html)

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Maintainer**: RealProof Development Team