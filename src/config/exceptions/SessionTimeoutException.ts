import { HttpException } from '@nestjs/common';

export class SessionTimeoutException extends HttpException {
  constructor() {
    super('Session has timed out', 440);
  }
}
