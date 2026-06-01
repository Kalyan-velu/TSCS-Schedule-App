const BASE_URL = 'http://10.226.1.148:8000';

export type Batch = {
  id: string;
  name: string;
};

export type Event = {
  id: string;
  title: string;
  description: string | null;
  meetLink: string | null;
  scheduledAt: string;
  durationMinutes: number;
  batchIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type Student = {
  id: string;
  displayName: string;
  email: string;
  batchId: string | null;
  pushToken: string | null;
  createdAt: string;
  batchName?: string;
};

type ApiResponse<T> = { status: true; data: T } | { status: false; error: { message: string } };

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: ApiResponse<T> = await res.json();
  if (!json.status) throw new Error(json.error.message);
  return json.data;
}

export function fetchBatches(): Promise<Batch[]> {
  return apiFetch<Batch[]>('/batch/');
}

export function fetchEvents(params?: { batchId?: string; from?: string; to?: string }): Promise<Event[]> {
  const q = new URLSearchParams();
  if (params?.batchId) q.set('batchId', params.batchId);
  if (params?.from) q.set('from', params.from);
  if (params?.to) q.set('to', params.to);
  const qs = q.toString();
  return apiFetch<Event[]>(qs ? `/event?${qs}` : `/event`);
}

export function fetchEvent(eventId: string): Promise<Event> {
  return apiFetch<Event>(`/event/${eventId}`);
}

export function fetchBatch(batchId: string): Promise<Batch> {
  return apiFetch<Batch>(`/batch/${batchId}`);
}

export function fetchBatchEvents(batchId: string): Promise<Event[]> {
  return apiFetch<Event[]>(`/batch/${batchId}/events`);
}

export function fetchStudents(): Promise<Student[]> {
  return apiFetch<Student[]>('/student/');
}

export function fetchStudent(studentId: string): Promise<Student> {
  return apiFetch<Student>(`/student/${studentId}`);
}
