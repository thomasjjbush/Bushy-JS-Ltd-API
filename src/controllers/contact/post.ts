import { renderFile } from 'ejs';
import type { NextFunction, Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import createHttpError from 'http-errors';
import nodemailer from 'nodemailer';
import path from 'path';

import labels from './labels.json';

interface Body {
  company?: string;
  email: string;
  message: string;
  name: string;
  number?: number;
  opportunityLength?: number;
  opportunityType: 'contract' | 'fullTime';
}

interface Query {
  locale: 'en' | 'fr';
  theme?: 'dark' | 'light';
}

export async function contact(req: Request<ParamsDictionary, unknown, Body, Query>, res: Response, next: NextFunction) {
  try {
    if (!req.body.email || !req.body.message || !req.body.name || !req.body.opportunityType) {
      return next(createHttpError(400, 'Missing required metadata'));
    }

    const { locale = 'en', theme = 'dark' } = req.query;
    const template = path.join(__dirname, './../../emails/template.ejs');

    const transporter = await nodemailer.createTransport({
      auth: {
        pass: process.env.EMAIL_SMTP_PASSWORD,
        user: process.env.EMAIL_SMTP_USER,
      },
      host: 'smtp-relay.sendinblue.com',
      port: 587,
    });

    await Promise.all(
      [
        { labels: labels.contact, subject: 'New enquiry', to: process.env.ADMIN_EMAIL_RECIPIENT },
        { labels: labels.confirmation[locale], subject: 'Thanks for your enquiry', to: req.body.email },
      ].map(async ({ labels, subject, to }) => {
        try {
          const html = await renderFile(template, { info: req.body, labels, theme });
          await transporter.sendMail({ from: 'Bushy JS Ltd noreply@bushyjsltd.com', html, subject, to });
        } catch {
          return next(createHttpError(503, 'Unable to send HTML email'));
        }
      }),
    );

    return res.json({ success: true });
  } catch {
    return next(createHttpError(503, 'Unable to establish smtp connection'));
  }
}
