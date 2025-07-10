export type Report = {
  id: string;
  user: User[];
  type: string;
  date: string;
  severity: string;
  status: string;
  vehicle: Array<string>;
  casualty: number;
  description: string;
  latitude: number;
  longitude: number;
  frontCamera: string;
  backCamera: string;
  createdAt: string;
  street?: string;
  barangay?: string;
  city?: string;
};

export type User = {
    id: string;
    name: string;
    username: string;
    email?: string;
    role?: string;
    profileImg: string;   
    createdAt: string;
    updatedAt: string;
}

export type pastReports = {
  latitude: number;
  longitude: number;
  createdAt: string;
}

export type ReportsState = {
  latestReports: Report[];
  pastReports: pastReports[];
};