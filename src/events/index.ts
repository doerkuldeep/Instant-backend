import { EventEmitter } from 'events';
import { logger } from '../config/logger';

export enum DomainEvent {
  USER_REGISTERED = 'user:registered',
  PARTNER_REGISTERED = 'partner:registered',
  PARTNER_STATUS_CHANGED = 'partner:status_changed',
}

export interface DomainEventPayloadMap {
  [DomainEvent.USER_REGISTERED]: { userId: string; email: string };
  [DomainEvent.PARTNER_REGISTERED]: { userId: string; companyName: string };
  [DomainEvent.PARTNER_STATUS_CHANGED]: { userId: string; newStatus: string };
}

const emitter = new EventEmitter();

export function emitEvent<E extends DomainEvent>(event: E, payload: DomainEventPayloadMap[E]): boolean {
  logger.debug({ event, payload }, 'Domain event emitted');
  return emitter.emit(event, payload);
}

export function onEvent<E extends DomainEvent>(
  event: E,
  listener: (payload: DomainEventPayloadMap[E]) => void,
): void {
  emitter.on(event, listener);
}

export const eventBus = {
  emitEvent,
  on: emitter.on.bind(emitter),
  emit: emitter.emit.bind(emitter),
  addListener: emitter.addListener.bind(emitter),
  removeListener: emitter.removeListener.bind(emitter),
};

// Example event listener registration
eventBus.on(DomainEvent.USER_REGISTERED, (payload) => {
  logger.info({ userId: payload.userId }, 'Event triggered: Sending welcome email...');
});

eventBus.on(DomainEvent.PARTNER_REGISTERED, (payload) => {
  logger.info(
    { companyName: payload.companyName },
    'Event triggered: Notifying admin of new partner application...',
  );
});

eventBus.on(DomainEvent.PARTNER_STATUS_CHANGED, (payload) => {
  logger.info(
    { userId: payload.userId, status: payload.newStatus },
    'Event triggered: Notifying partner of status update...',
  );
});
