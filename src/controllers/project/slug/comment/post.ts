import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import path from 'path';

import { CommentDocument } from 'db/schema';

import type { ContentfulProject } from 'types/contentful';
import { EventTypes } from 'types/types';

import EventFactory from 'utils/events/events';
import { useGraphql } from 'utils/graphql';

export async function postComment(req: Request, res: Response, next: NextFunction) {
  let projects: ContentfulProject[];
  let commentString = req.body.comment;

  if (!req.params.slug || !commentString) {
    return next(createHttpError(400, 'Invalid request'));
  }

  try {
    ({
      projects: { items: projects },
    } = await useGraphql<ContentfulProject>({
      client: res.locals.graphqlClient,
      path: path.resolve(__dirname, './../../../../graphql-queries/project-slug.graphql'),
      variables: { slug: req.params.slug },
    }));
  } catch {
    return next(createHttpError(503, 'Contentful service is unavailable'));
  }

  if (!projects || !projects.length) {
    return next(createHttpError(404, 'Project does not exist'));
  }

  try {
    ({
      data: { censored_content: commentString },
    } = await axios.post('https://api.apilayer.com/bad_words', req.body.comment, {
      headers: {
        apikey: process.env.PROFANITY_FILTER_API_KEY as string,
      },
    }));
  } catch (e) {
    console.warn('Unable to censor potentially explicit content');
  }

  try {
    const comment = await (
      await CommentDocument.create({
        author: res.locals.id,
        comment: commentString,
        project: req.params.slug,
      })
    ).populate('author');

    EventFactory.emit(EventTypes.ADD_COMMENT, comment);

    return res.json({ comment });
  } catch {
    return next(createHttpError(503, 'Database service is unavailable'));
  }
}
