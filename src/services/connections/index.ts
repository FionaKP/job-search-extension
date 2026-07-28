export {
  matchConnections,
  bestMatch,
  normalizeEmail,
  connectionEmails,
} from './matching';
export type { ConnectionMatch, MatchConfidence } from './matching';

export {
  computeTouchpoints,
  suggestTouchpoint,
  getCadenceDays,
  getLastContactDate,
} from './touchpoints';

export {
  buildContactEvent,
  buildConnectionFromEmail,
  logEmailToConnection,
  createConnectionFromEmail,
  nameFromEmail,
  companyFromEmail,
} from './email';
