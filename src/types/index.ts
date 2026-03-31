export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';
export type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface UserDoc {
  uid: string;
  email: string;
  name: string | null;
  role: Role;
  currentSessionId: string | null;
  createdAt: number;
}

export interface VideoDoc {
  id: string;
  teacherId: string;
  title: string;
  description: string;
  price: number;
  vdoId: string;
  category: string;
  teacherName: string;
  teacherBio: string;
  grade: string;
  courseType: string;
  subject: string;
}

export interface OrderDoc {
  id: string;
  userId: string;
  teacherId: string;
  videoId: string;
  status: OrderStatus;
  paymentCode: string;
  screenshotUrl: string;
  activatedAt: number | null;
  viewCount: number;
  price: number;
  createdAt: number;
}
