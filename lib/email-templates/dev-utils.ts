// Development utilities for email templates
// Provides testing, preview, and debugging tools for email templates

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import {
  Templates,
  createTemplatePreview,
  emailFactory,
  type WaitlistEmailData,
  type AdminNotificationData,
  type EmailTemplate,
  TEMPLATE_VERSION,
  LAST_UPDATED
} from './index';

// Development sample data
const SAMPLE_USERS: WaitlistEmailData[] = [
  {
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    position: 1
  },
  {
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    position: 42
  },
  {
    email: 'alex.wilson@example.com',
    firstName: 'Alex',
    position: 156
  },
  {
    email: 'maria.garcia@example.com',
    firstName: 'Maria',
    lastName: 'Garcia',
    position: 500
  },
  {
    email: 'early.adopter@example.com',
    firstName: 'Early',
    lastName: 'Adopter',
    position: 1250
  }
];

/**
 * Generate preview HTML files for all email templates
 */
export function generateEmailPreviews(outputDir: string = './email-previews'): void {
  console.log('🎨 Generating email template previews...');

  // Create output directory if it doesn't exist
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Generate waitlist confirmation previews
  SAMPLE_USERS.forEach((user, index) => {
    const template = Templates.waitlistConfirmation(user);
    const fileName = `waitlist-confirmation-${index + 1}-pos-${user.position}.html`;
    const filePath = join(outputDir, fileName);

    const previewHtml = createPreviewWrapper(
      template.html,
      `Waitlist Confirmation - Position ${user.position}`,
      'waitlist',
      user
    );

    writeFileSync(filePath, previewHtml);
    console.log(`✅ Generated: ${fileName}`);
  });

  // Generate admin notification previews
  SAMPLE_USERS.forEach((user, index) => {
    const adminData: AdminNotificationData = {
      ...user,
      totalCount: 150 + index * 100,
      signupDate: new Date().toISOString()
    };

    const template = Templates.adminNotification(adminData);
    const fileName = `admin-notification-${index + 1}-pos-${user.position}.html`;
    const filePath = join(outputDir, fileName);

    const previewHtml = createPreviewWrapper(
      template.html,
      `Admin Notification - Position ${user.position}`,
      'admin',
      adminData
    );

    writeFileSync(filePath, previewHtml);
    console.log(`✅ Generated: ${fileName}`);
  });

  // Generate index file
  const indexHtml = generateIndexPage(SAMPLE_USERS);
  writeFileSync(join(outputDir, 'index.html'), indexHtml);
  console.log(`✅ Generated: index.html`);

  console.log(`🎉 Email previews generated in: ${outputDir}`);
  console.log(`📁 Open ${outputDir}/index.html to view all previews`);
}

/**
 * Create a wrapper HTML with navigation and metadata
 */
function createPreviewWrapper(
  emailHtml: string,
  title: string,
  type: 'waitlist' | 'admin',
  data: any
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Email Preview</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .preview-header {
            background: #fff;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .preview-title {
            color: #333;
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .preview-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
        }
        .meta-item {
            display: flex;
            flex-direction: column;
        }
        .meta-label {
            font-weight: bold;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .meta-value {
            color: #333;
            font-family: monospace;
        }
        .email-container {
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .navigation {
            text-align: center;
            margin: 20px 0;
        }
        .nav-button {
            display: inline-block;
            padding: 10px 20px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 0 10px;
            font-size: 14px;
        }
        .nav-button:hover {
            background: #0056b3;
        }
        @media (max-width: 768px) {
            .preview-meta {
                grid-template-columns: 1fr;
            }
            body {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="preview-header">
        <h1 class="preview-title">📧 ${title}</h1>
        <p>Email template preview for <strong>${type}</strong> notification</p>

        <div class="preview-meta">
            <div class="meta-item">
                <span class="meta-label">Template Type</span>
                <span class="meta-value">${type}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">User Email</span>
                <span class="meta-value">${data.email}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Position</span>
                <span class="meta-value">${data.position || 'N/A'}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Template Version</span>
                <span class="meta-value">${TEMPLATE_VERSION}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Generated</span>
                <span class="meta-value">${new Date().toLocaleString()}</span>
            </div>
            ${data.totalCount ? `
            <div class="meta-item">
                <span class="meta-label">Total Count</span>
                <span class="meta-value">${data.totalCount}</span>
            </div>
            ` : ''}
        </div>

        <div class="navigation">
            <a href="index.html" class="nav-button">🏠 All Previews</a>
            <a href="#" onclick="window.print()" class="nav-button">🖨️ Print</a>
            <a href="#" onclick="copyToClipboard()" class="nav-button">📋 Copy HTML</a>
        </div>
    </div>

    <div class="email-container">
        ${emailHtml}
    </div>

    <script>
        function copyToClipboard() {
            const emailHtml = \`${emailHtml.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
            navigator.clipboard.writeText(emailHtml).then(() => {
                alert('Email HTML copied to clipboard!');
            });
        }
    </script>
</body>
</html>
  `;
}

/**
 * Generate index page with links to all previews
 */
function generateIndexPage(sampleUsers: WaitlistEmailData[]): string {
  const waitlistLinks = sampleUsers.map((user, index) => {
    const fileName = `waitlist-confirmation-${index + 1}-pos-${user.position}.html`;
    return `
      <div class="preview-card">
        <h3>👤 ${user.firstName} ${user.lastName || ''}</h3>
        <p><strong>Position:</strong> #${user.position}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <a href="${fileName}" class="preview-link">View Waitlist Email</a>
      </div>
    `;
  }).join('');

  const adminLinks = sampleUsers.map((user, index) => {
    const fileName = `admin-notification-${index + 1}-pos-${user.position}.html`;
    return `
      <div class="preview-card">
        <h3>📊 Admin: ${user.firstName} ${user.lastName || ''}</h3>
        <p><strong>Position:</strong> #${user.position}</p>
        <p><strong>Total Count:</strong> ${150 + index * 100}</p>
        <a href="${fileName}" class="preview-link">View Admin Email</a>
      </div>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template Previews - RealProof</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            background: #fff;
            padding: 40px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header h1 {
            color: #333;
            margin: 0 0 10px 0;
            font-size: 32px;
        }
        .header p {
            color: #666;
            margin: 0;
            font-size: 16px;
        }
        .section {
            background: #fff;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: #333;
            margin: 0 0 20px 0;
            font-size: 24px;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
        }
        .preview-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .preview-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .preview-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .preview-card h3 {
            color: #333;
            margin: 0 0 10px 0;
            font-size: 18px;
        }
        .preview-card p {
            color: #666;
            margin: 5px 0;
            font-size: 14px;
        }
        .preview-link {
            display: inline-block;
            padding: 10px 20px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 10px;
            font-size: 14px;
            transition: background 0.2s ease;
        }
        .preview-link:hover {
            background: #0056b3;
        }
        .meta-info {
            background: #e7f3ff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .meta-info h3 {
            color: #0066cc;
            margin: 0 0 10px 0;
        }
        .meta-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        .meta-item {
            display: flex;
            justify-content: space-between;
        }
        .meta-label {
            font-weight: bold;
            color: #333;
        }
        .meta-value {
            color: #666;
            font-family: monospace;
        }
        @media (max-width: 768px) {
            .preview-grid {
                grid-template-columns: 1fr;
            }
            .meta-grid {
                grid-template-columns: 1fr;
            }
            body {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📧 Email Template Previews</h1>
            <p>RealProof Email Template Development Kit</p>
        </div>

        <div class="meta-info">
            <h3>📊 Template Information</h3>
            <div class="meta-grid">
                <div class="meta-item">
                    <span class="meta-label">Template Version:</span>
                    <span class="meta-value">${TEMPLATE_VERSION}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Last Updated:</span>
                    <span class="meta-value">${new Date(LAST_UPDATED).toLocaleDateString()}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Generated:</span>
                    <span class="meta-value">${new Date().toLocaleString()}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Total Samples:</span>
                    <span class="meta-value">${sampleUsers.length} users</span>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>🎉 Waitlist Confirmation Emails</h2>
            <p>These emails are sent to users when they successfully join the waitlist.</p>
            <div class="preview-grid">
                ${waitlistLinks}
            </div>
        </div>

        <div class="section">
            <h2>👨‍💼 Admin Notification Emails</h2>
            <p>These emails are sent to administrators when new users join the waitlist.</p>
            <div class="preview-grid">
                ${adminLinks}
            </div>
        </div>

        <div class="section">
            <h2>🛠️ Development Notes</h2>
            <ul>
                <li>All email templates are responsive and work across major email clients</li>
                <li>Templates follow modular design principles for easy maintenance</li>
                <li>Position-based personalization adjusts content based on waitlist position</li>
                <li>Templates include both HTML and plain text versions</li>
                <li>Color scheme and branding can be easily customized via the template system</li>
            </ul>
        </div>
    </div>
</body>
</html>
  `;
}

/**
 * Test email template generation with various scenarios
 */
export function runTemplateTests(): void {
  console.log('🧪 Running email template tests...');

  const testScenarios = [
    // Test edge cases
    { email: 'test@example.com', firstName: 'Test', position: undefined },
    { email: 'test@example.com', firstName: 'Test', position: 0 },
    { email: 'test@example.com', firstName: 'Test', position: -1 },
    { email: 'test@example.com', firstName: 'Test', lastName: '', position: 1 },
    // Test special characters
    { email: 'andré@example.com', firstName: 'André', lastName: 'Müller', position: 1 },
    { email: 'test@example.com', firstName: 'José María', position: 100 },
    // Test long names
    { email: 'test@example.com', firstName: 'Christopher', lastName: 'Montgomery-Williams', position: 999 },
  ];

  testScenarios.forEach((scenario, index) => {
    try {
      const waitlistTemplate = Templates.waitlistConfirmation(scenario);
      const adminTemplate = Templates.adminNotification({
        ...scenario,
        totalCount: 150,
        signupDate: new Date().toISOString()
      });

      console.log(`✅ Test ${index + 1}: Generated templates for ${scenario.firstName}`);

      // Basic validation
      if (!waitlistTemplate.subject || !waitlistTemplate.html || !waitlistTemplate.text) {
        throw new Error('Missing template properties');
      }

      if (!adminTemplate.subject || !adminTemplate.html || !adminTemplate.text) {
        throw new Error('Missing admin template properties');
      }

    } catch (error) {
      console.error(`❌ Test ${index + 1} failed:`, error);
    }
  });

  console.log('🎉 Template tests completed!');
}

/**
 * Benchmark template generation performance
 */
export function benchmarkTemplates(iterations: number = 1000): void {
  console.log(`⚡ Benchmarking template generation (${iterations} iterations)...`);

  const sampleData: WaitlistEmailData = {
    email: 'benchmark@example.com',
    firstName: 'Benchmark',
    lastName: 'User',
    position: 42
  };

  // Benchmark waitlist template
  const waitlistStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    Templates.waitlistConfirmation(sampleData);
  }
  const waitlistTime = Date.now() - waitlistStart;

  // Benchmark admin template
  const adminData: AdminNotificationData = {
    ...sampleData,
    totalCount: 150,
    signupDate: new Date().toISOString()
  };

  const adminStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    Templates.adminNotification(adminData);
  }
  const adminTime = Date.now() - adminStart;

  console.log(`📊 Benchmark Results:`);
  console.log(`   Waitlist templates: ${waitlistTime}ms (${(waitlistTime / iterations).toFixed(2)}ms avg)`);
  console.log(`   Admin templates: ${adminTime}ms (${(adminTime / iterations).toFixed(2)}ms avg)`);
  console.log(`   Total time: ${waitlistTime + adminTime}ms`);
  console.log(`   Templates per second: ${Math.round((iterations * 2) / ((waitlistTime + adminTime) / 1000))}`);
}

/**
 * Generate sample email data for testing
 */
export function generateSampleData(count: number): WaitlistEmailData[] {
  const firstNames = ['John', 'Jane', 'Alex', 'Maria', 'David', 'Sarah', 'Michael', 'Emma', 'Robert', 'Lisa'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const domains = ['example.com', 'test.com', 'sample.org', 'demo.net', 'mock.io'];

  return Array.from({ length: count }, (_, index) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = Math.random() > 0.3 ? lastNames[Math.floor(Math.random() * lastNames.length)] : undefined;
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const email = `${firstName.toLowerCase()}${lastName ? '.' + lastName.toLowerCase() : ''}${index}@${domain}`;

    return {
      email,
      firstName,
      lastName,
      position: index + 1
    };
  });
}

// CLI interface for development
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'generate':
      const outputDir = args[1] || './email-previews';
      generateEmailPreviews(outputDir);
      break;

    case 'test':
      runTemplateTests();
      break;

    case 'benchmark':
      const iterations = parseInt(args[1]) || 1000;
      benchmarkTemplates(iterations);
      break;

    default:
      console.log('📧 Email Template Development Utilities');
      console.log('');
      console.log('Available commands:');
      console.log('  generate [output-dir]  Generate HTML previews of all email templates');
      console.log('  test                   Run template tests with edge cases');
      console.log('  benchmark [iterations] Benchmark template generation performance');
      console.log('');
      console.log('Examples:');
      console.log('  npm run email:generate ./previews');
      console.log('  npm run email:test');
      console.log('  npm run email:benchmark 5000');
  }
}
