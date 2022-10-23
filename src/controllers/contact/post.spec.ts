/* eslint-disable prettier/prettier */
const mockSendMail = jest.fn();

import { renderFile } from 'ejs';
import { createTransport } from 'nodemailer';
import request from 'supertest';

import labels from './labels.json';

import { app } from '../..';

/* eslint-enable prettier/prettier */

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: mockSendMail,
  }),
}));

jest.mock('ejs', () => ({
  renderFile: jest.fn().mockResolvedValue('html template'),
}));

const data = {
  company: 'Company',
  email: 'john.smith@gmail.com',
  message: 'Hi this is a message',
  name: 'John Smith',
  number: '+447402373359',
  opportunityLength: '3 months',
  opportunityType: 'contract',
};

describe('POST /contact', () => {
  it.each`
    key
    ${'email'}
    ${'message'}
    ${'name'}
    ${'opportunityType'}
  `('should return a 400 if required $key is missing', async ({ key }) => {
    const res = await request(app)
      .post('/contact')
      .send({ ...data, [key]: undefined });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Missing required metadata');
    expect(res.body.status).toBe(400);
  });

  it('should send a confirmation email to enquiry candidate and contact email to administrator', async () => {
    const res = await request(app).post('/contact').send(data);
    expect(createTransport).toHaveBeenCalledWith({
      auth: {
        pass: 'EMAIL_SMTP_PASSWORD',
        user: 'EMAIL_SMTP_USER',
      },
      host: 'smtp-relay.sendinblue.com',
      port: 587,
    });

    expect(renderFile).toHaveBeenCalledTimes(2);
    expect(renderFile).toHaveBeenNthCalledWith(1, expect.any(String), {
      info: data,
      labels: labels.contact,
      theme: 'dark',
    });
    expect(renderFile).toHaveBeenNthCalledWith(2, expect.any(String), {
      info: data,
      labels: labels.confirmation.en,
      theme: 'dark',
    });

    expect(mockSendMail).toHaveBeenCalledTimes(2);
    expect(mockSendMail).toHaveBeenNthCalledWith(1, {
      from: 'Bushy JS Ltd noreply@bushyjsltd.com',
      html: 'html template',
      subject: 'New enquiry',
      to: 'ADMIN_EMAIL_RECIPIENT',
    });
    expect(mockSendMail).toHaveBeenNthCalledWith(2, {
      from: 'Bushy JS Ltd noreply@bushyjsltd.com',
      html: 'html template',
      subject: 'Thanks for your enquiry',
      to: 'john.smith@gmail.com',
    });

    expect(res.body.success).toBe(true);
  });

  it('should return 503 if smtp connection fails', async () => {
    (createTransport as jest.Mock).mockRejectedValueOnce('e');

    const res = await request(app).post('/contact').send(data);

    expect(res.statusCode).toBe(503);
    expect(res.body.message).toBe('Unable to establish smtp connection');
    expect(res.body.status).toBe(503);
  });

  it('should return 503 if unable to generate html email template', async () => {
    (renderFile as jest.Mock).mockRejectedValueOnce('e');

    const res = await request(app).post('/contact').send(data);

    expect(res.statusCode).toBe(503);
    expect(res.body.message).toBe('Unable to send HTML email');
    expect(res.body.status).toBe(503);
  });

  it('should return 503 if sending mail throws', async () => {
    mockSendMail.mockRejectedValueOnce('e');

    const res = await request(app).post('/contact').send(data);

    expect(res.statusCode).toBe(503);
    expect(res.body.message).toBe('Unable to send HTML email');
    expect(res.body.status).toBe(503);
  });
});
