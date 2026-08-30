import { wrapEmailLayout } from './layout';
import { NotificationTemplateDefinition } from './template.types';

export const welcomeUserTemplate: NotificationTemplateDefinition = {
  subject: 'Welcome to ezeeFlights!',
  html: wrapEmailLayout(`
    <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 700; color: #1e293b;">Welcome to ezeeFlights!</h2>
    <p style="margin: 0 0 12px 0; font-size: 15px; color: #475569;">Hi {{firstName}},</p>
    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5; color: #475569;">
      We're absolutely thrilled to have you on board! ezeeFlights is your ultimate travel companion, built to help you search, compare, and book flights and hotels with zero hassle.
    </p>
    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5; color: #475569;">
      Here are a few things you can do right now to get started:
    </p>
    <ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 14px; color: #475569; line-height: 1.6;">
      <li>✈️ <strong>Search Flights:</strong> Compare rates from hundreds of airlines worldwide.</li>
      <li>🏨 <strong>Book Hotels:</strong> Find the best stays at exclusive member prices.</li>
      <li>📅 <strong>Manage Trips:</strong> Keep track of your booking itineraries all in one place.</li>
    </ul>
    <p style="margin: 20px 0 20px 0;">
      <a href="https://ezeeflights.online" style="display: inline-block; padding: 10px 20px; font-size: 14px; font-weight: 600; color: #ffffff; background-color: #c52a2a; text-decoration: none; border-radius: 6px;">Start Exploring</a>
    </p>
    <p style="margin: 16px 0 0 0; font-size: 14px; color: #475569;">
      Happy Travels,<br>
      <strong>The ezeeFlights Team</strong>
    </p>
  `),
  text: 'Welcome to ezeeFlights, {{firstName}}! We are thrilled to have you on board. Start searching flights and booking hotels at https://ezeeflights.online',
  sms: 'Welcome to ezeeFlights, {{firstName}}! We are thrilled to have you on board: https://ezeeflights.online',
  whatsapp: '✈️ Welcome to ezeeFlights, {{firstName}}! We are thrilled to have you on board: https://ezeeflights.online',
};
