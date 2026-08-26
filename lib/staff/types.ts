export type StaffMember = {
  id: string;
  name: string;
  username: string;
  email: string | null;
  role: "ansatt" | "leder";
  active: boolean;
  created_at: string;
};

export type Shift = {
  id: string;
  staff_id: string;
  checkin_at: string;
  checkin_lat: number;
  checkin_lng: number;
  checkin_distance_m: number;
  checkout_at: string | null;
  checkout_lat: number | null;
  checkout_lng: number | null;
  checkout_distance_m: number | null;
  checkout_corrected_by_admin: boolean;
  created_at: string;
};

export type TaskType = "daily" | "weekly" | "one_time";

export type StaffTask = {
  id: string;
  title: string;
  description: string | null;
  type: TaskType;
  points: number;
  active: boolean;
  created_at: string;
};

export type TaskCompletion = {
  id: string;
  staff_id: string;
  task_id: string;
  period_key: string;
  completed_at: string;
  points_awarded: number;
};

export type StoreSettings = {
  id: string;
  store_lat: number;
  store_lng: number;
  radius_meters: number;
  updated_at: string;
};
