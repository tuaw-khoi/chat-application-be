// src/firebase/firebase.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);

  constructor() {
    try {
     
      admin.initializeApp({
        credential: admin.credential.cert({
            projectId: 'authen-7a7f1',
            privateKey:
              '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCSDuavzZLsI0GS\nfNdUE99xcXA0ftMaDvwxzFHGaFgRQUaC2ocwvtPOJf/QyjnHjOXBjBOYIaw8Ls5R\n+2BAHYdZeZQSezIv51nKjoUP6rAlK4VBGVluDt8Wyy33Ojs7GbqYcDmaFGGvPLGn\nQp5+lifUfRnO2QJtjoRqnzlUq7QuTJzyVrp6dO3L9cjD1yCB2V7RqeaYymt10P38\njbWQbavJBaiLkt4+ZJdJCAwwYAsicwndVVVTheRZvDvwU3SBgadhFggzr/NjrYVv\noi6/A2y1EjTvHuZCtppB3F//vBjSMyQJiIQlWkMyZg39s1HEK9aD2iRpEpcCbAjJ\ny86ZJ+R9AgMBAAECggEAEnn9F78/N00Mdf4B9VpgOUca5SEoDlNX9uq8a4d2oJQr\n2dDQKkvxmlH3Rw/V+FbsF6xjLCsSUTiwk/FjTykNHrYBE8du5V10X+ngjk9nggQ7\n4qzUwdXyxbzlLzG4HXVXRAJqXwH2C4d3h8unJidTmY9LzP1pz7coLB7BT2M7M2H/\nt5InfiSEGRjuVaWizxxlJ764xMzJqpmj+jCDyR5CNqoleRWkZCatoXZxZw+lrfXf\nPAXh43hq5yauwIFtE55+9yEXHPSmfOLggntzTS1l68cmEpeu0shRIeQj/2qX/2LE\n3/BYUAaBOjXvuW0IBTfHRz3NyyiX7FcsLtCyKLurIQKBgQDMQd7UqT3cJFBnNc7k\nZZH3ZxBwwC5svyY6Wg88TiM+tS0J/vKGt32M2WdMB6AqfPGhEVW4YClNpCBGljdR\nQOSOUhyAmZiURsi60vCkxnUacOL02Xt/xmq/kCXh/M8tQUS/OzofxXLdhMMhOP5m\nO7+oKptENG5HZCXDhv2aRiBczQKBgQC3Ds6Km5gNNG/HGNktT9sC7seTyEnIC9Yl\neq0Z7qeD4kJf6480eHbtSD1nCwb35RVMBWnyWas5q3KNlAhrSoIPmxHayarRs+Ee\nvti7EGtFXnnD6evr7dFMnWLgR/ufAMQFJxNj+ioGkK687RKfiF32JhO4wlz6iLPn\nmy8iK3qmcQKBgQCBo1EFUkEjxpyNVRZx2ZFSH8TMev08IfnmUSCYWtN9yknCrWBK\nZo015wnrtG9QaCqH2tO4CLhOQdwGUPLdDD3DopPafyHbAi4GfTkkq5zJYlp5ossC\nZvF7kcapbuYjR+iVIscaQRxNQiUCogS86DEVT61qFYjkoMhjF/s/fkCuBQKBgGtY\nbHfNfCGqMS4AfUJcBKM4oKIhnlqHzmEWCjIdx+/Hm4KiIMz1I1BLv24QglqV5KI6\nvoEWYhkkV718JF++RnyeQ58YCWqFYCrmYTN5El6QYzkmkGk+gTC7TkMVExGPomMf\nIfjLtx84cq9pGjWhAvCYLZJ3r4xe45iaYM5ZzseRAoGAXpFtXWsltEa2Ko/uLpe0\nP1lRbusxNxueHy7Qz4Jscp5oO5NOtKLK+koi1DBfYeWQjXnEamuxSbviCr2/m0kI\nxcY6wjMCLbAyVFyb1f+Q9KC06gmlWEO8ptz+Fjur+T1n1HNlnItX7dzg4RF5BMFS\niADjh0NoJbYYrrOMathpvMs=\n-----END PRIVATE KEY-----\n',
            clientEmail:
              'firebase-adminsdk-sfujm@authen-7a7f1.iam.gserviceaccount.com',
          }),
      });
      this.logger.log('Firebase Admin SDK initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error.stack);
    }
  }

  // Các phương thức của FirebaseService, ví dụ:
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    return admin.auth().verifyIdToken(idToken);
  }

  // Thêm các phương thức khác nếu cần
}
