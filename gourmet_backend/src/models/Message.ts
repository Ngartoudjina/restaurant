// src/models/Message.ts
export interface Message {
  id?: string;
  name: string;
  email: string;
  message: string;
  read?: boolean;
  replied?: boolean;
  reply?: string;
  ip?: string;
  userAgent?: string;
  createdAt?: any;
}
