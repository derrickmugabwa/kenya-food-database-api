import { Injectable, Logger } from '@nestjs/common';
import fs from 'node:fs/promises';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import { Inbound } from '@inboundemail/sdk';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class MailerService {
  private readonly transporter: nodemailer.Transporter;
  private readonly inboundClient: Inbound | null;
  private readonly provider: 'smtp' | 'inbound';
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    this.provider = configService.get('mail.provider', { infer: true }) || 'smtp';

    this.logger.log(`Email provider: ${this.provider}`);

    // Initialize Inbound client if using inbound provider
    if (this.provider === 'inbound') {
      const inboundApiKey = configService.get('mail.inboundApiKey', { infer: true });
      if (!inboundApiKey) {
        this.logger.error('Inbound API key not configured but provider is set to inbound');
        this.inboundClient = null;
      } else {
        this.inboundClient = new Inbound(inboundApiKey);
        this.logger.log('Inbound client initialized successfully');
      }
    } else {
      this.inboundClient = null;
    }

    // Initialize SMTP transporter (always initialize for fallback)
    const mailConfig = {
      host: configService.get('mail.host', { infer: true }),
      port: configService.get('mail.port', { infer: true }),
      ignoreTLS: configService.get('mail.ignoreTLS', { infer: true }),
      secure: configService.get('mail.secure', { infer: true }),
      requireTLS: configService.get('mail.requireTLS', { infer: true }),
      auth: {
        user: configService.get('mail.user', { infer: true }),
        pass: configService.get('mail.password', { infer: true })
          ? '***' + configService.get('mail.password', { infer: true })?.slice(-4)
          : 'NOT_SET',
      },
      connectionTimeout: 10000, // 10 seconds to establish connection
      greetingTimeout: 10000, // 10 seconds to wait for greeting after connection
      socketTimeout: 15000, // 15 seconds of inactivity before timeout
    };

    if (this.provider === 'smtp') {
      this.logger.log(
        `Initializing SMTP transport with config: ${JSON.stringify(mailConfig)}`,
      );
    }

    this.transporter = nodemailer.createTransport({
      host: configService.get('mail.host', { infer: true }),
      port: configService.get('mail.port', { infer: true }),
      ignoreTLS: configService.get('mail.ignoreTLS', { infer: true }),
      secure: configService.get('mail.secure', { infer: true }),
      requireTLS: configService.get('mail.requireTLS', { infer: true }),
      auth: {
        user: configService.get('mail.user', { infer: true }),
        pass: configService.get('mail.password', { infer: true }),
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  async sendMail({
    templatePath,
    context,
    ...mailOptions
  }: nodemailer.SendMailOptions & {
    templatePath: string;
    context: Record<string, unknown>;
  }): Promise<void> {
    const startTime = Date.now();
    this.logger.log(
      `Attempting to send email to: ${mailOptions.to}, subject: ${mailOptions.subject} via ${this.provider}`,
    );

    try {
      // Compile template if provided
      let html: string | undefined;
      if (templatePath) {
        const template = await fs.readFile(templatePath, 'utf-8');
        html = Handlebars.compile(template, {
          strict: true,
        })(context);
      }

      const emailOptions = {
        ...mailOptions,
        from: mailOptions.from
          ? mailOptions.from
          : `"${this.configService.get('mail.defaultName', {
            infer: true,
          })}" <${this.configService.get('mail.defaultEmail', {
            infer: true,
          })}>`,
        html: mailOptions.html ? mailOptions.html : html,
      };

      // Route to appropriate provider
      if (this.provider === 'inbound' && this.inboundClient) {
        await this.sendViaInbound(emailOptions, startTime);
      } else {
        await this.sendViaSMTP(emailOptions, startTime);
      }

      // Return immediately without waiting for email to send
      this.logger.log(
        `Email queued for async delivery to: ${mailOptions.to}`,
      );
    } catch (error) {
      // Only log template rendering errors, don't throw
      this.logger.error(
        `Error preparing email: ${error.message}`,
        error.stack,
      );
    }
  }

  private async sendViaSMTP(
    emailOptions: nodemailer.SendMailOptions,
    startTime: number,
  ): Promise<void> {
    // Send email asynchronously without blocking (existing SMTP logic)
    this.transporter
      .sendMail(emailOptions)
      .then((info) => {
        const duration = Date.now() - startTime;
        this.logger.log(
          `[SMTP] Email sent successfully in ${duration}ms. MessageId: ${info.messageId}, Response: ${info.response}`,
        );
      })
      .catch((error) => {
        const duration = Date.now() - startTime;
        this.logger.error(
          `[SMTP] Failed to send email after ${duration}ms. Error: ${error.message}`,
          error.stack,
        );
        this.logger.error(`Error code: ${error.code}`);
        this.logger.error(`Error command: ${error.command}`);

        // Log additional details for debugging
        if (error.code === 'ETIMEDOUT') {
          this.logger.error(
            'SMTP connection timeout - possible causes: ' +
            '1) Firewall blocking SMTP port, ' +
            '2) Incorrect SMTP host/port, ' +
            '3) Network connectivity issues',
          );
        } else if (error.code === 'EAUTH') {
          this.logger.error(
            'SMTP authentication failed - check MAIL_USER and MAIL_PASSWORD',
          );
        } else if (error.code === 'ECONNECTION') {
          this.logger.error(
            'SMTP connection failed - check MAIL_HOST and MAIL_PORT',
          );
        }
      });
  }

  private async sendViaInbound(
    emailOptions: nodemailer.SendMailOptions,
    startTime: number,
  ): Promise<void> {
    if (!this.inboundClient) {
      this.logger.error('Inbound client not initialized');
      return;
    }

    // Convert nodemailer options to Inbound format
    const inboundOptions = {
      from: emailOptions.from as string,
      to: Array.isArray(emailOptions.to)
        ? emailOptions.to
        : [emailOptions.to as string],
      subject: emailOptions.subject as string,
      html: emailOptions.html as string,
      text: emailOptions.text as string,
    };

    // Send email asynchronously without blocking
    this.inboundClient.emails
      .send(inboundOptions)
      .then(({ data, error }) => {
        const duration = Date.now() - startTime;
        if (error) {
          this.logger.error(
            `[Inbound] Failed to send email after ${duration}ms. Error: ${error}`,
          );
        } else {
          this.logger.log(
            `[Inbound] Email sent successfully in ${duration}ms. ID: ${data?.id}`,
          );
        }
      })
      .catch((error) => {
        const duration = Date.now() - startTime;
        this.logger.error(
          `[Inbound] Failed to send email after ${duration}ms. Error: ${error.message}`,
          error.stack,
        );
      });
  }
}
