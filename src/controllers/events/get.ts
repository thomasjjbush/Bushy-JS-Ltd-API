import type { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

import EventFactory from 'utils/events/events';

export function getEvents(req: Request, res: Response) {
  res.locals.id = uuid();

  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Cache-Control', 'no-cache');

  EventFactory.addConnection(res);

  req.on('close', () => {
    EventFactory.removeConnection(res);
  });
}
