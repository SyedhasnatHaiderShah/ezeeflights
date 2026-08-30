import { wrapEmailLayout } from './layout';
import { NotificationTemplateDefinition } from './template.types';

export const priceDropAlertTemplate: NotificationTemplateDefinition = {
  subject: 'Price drop on {{route}}',
  html: wrapEmailLayout(`
    <p style="margin:0 0 6px 0;font-weight:600;">Hi {{userName}},</p><p>Good news! {{route}} dropped from {{currency}} {{oldPrice}} to {{currency}} {{newPrice}}.</p><p>Book now: <a href="{{searchUrl}}">{{searchUrl}}</a></p>
  `),
  text: 'Hi {{userName}}, price drop on {{route}}: {{currency}} {{oldPrice}} → {{currency}} {{newPrice}}. Book now: {{searchUrl}}',
  sms: 'Price drop {{route}}: {{currency}} {{oldPrice}} → {{currency}} {{newPrice}}. {{searchUrl}}',
  whatsapp: '📉 {{route}} price dropped! {{currency}} {{oldPrice}} → {{currency}} {{newPrice}}. {{searchUrl}}',
};
