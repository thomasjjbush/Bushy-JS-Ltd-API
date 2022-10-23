import { EventEmitter } from 'events';
import type { Response } from 'express';

import { Comment, EventTypes, Like } from 'types/types';

import { verifyToken } from 'utils/token';

class EventFactory extends EventEmitter {
  private connections: {
    [key: string]: Response[];
  };

  constructor() {
    super();

    this.connections = {};

    for (const event of [
      EventTypes.ADD_COMMENT,
      EventTypes.ADD_LIKE,
      EventTypes.DELETE_COMMENT,
      EventTypes.DELETE_LIKE,
    ]) {
      this.addListener(event, this.listener(event));
    }
  }

  private ignoreConnection = async (token: string, data: Comment | Like) => {
    return (await verifyToken(token)) === data.author._id.toString();
  };

  private listener = (event: EventTypes) => (data: Comment | Like) => {
    this.connections[data.project]?.forEach((connection) => this.sendEvent(connection, { data, event }));
  };

  private sendEvent = async (connection: Response, { data, event }: { data: Comment | Like; event: EventTypes }) => {
    if (await this.ignoreConnection(connection.req.cookies.token, data)) {
      return;
    }
    connection.write(`data: ${JSON.stringify({ payload: data, type: event })}\n\n`);
  };

  public addConnection = (connection: Response) => {
    const project = connection.req.url.replace('/events/', '');
    this.connections[project] = [...(this.connections[project] || []), connection];
  };

  public removeConnection = ({ locals: { id }, req }: Response) => {
    const project = req.url.replace('/events/', '');
    this.connections[project] = this.connections[project].filter((connection) => connection.locals.id !== id);
  };
}

export default new EventFactory();
