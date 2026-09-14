export interface SchoolDto {
  id?: string;
  schoolId?: string;
  name: string;
  code: string;
  createdAt?: string;
  updatedAt?: string;
  userCount?: number;
  studentCount?: number;
  merchantCount?: number;
  status?: string;
}

export interface SchoolRequestDto {
  name: string;
  code: string;
}

export interface SchoolUpdateDto {
  name: string;
}

export interface SchoolUserDto {
  id: string;
  userId?: string;
  email: string;
  firstname?: string;
  lastname?: string;
  matricNumber?: string;
  role?: string;
  schoolCode: string;
  walletNumber?: string;
  createdAt?: string;
  isActive?: boolean;
}
