// src/firebase/firebase.module.ts
import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Module({
  providers: [FirebaseService],
  exports: [FirebaseService], // Export FirebaseService để sử dụng ở các module khác
})
export class FirebaseModule {}
