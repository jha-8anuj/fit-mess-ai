export type RoutineItem = {
  time: string;
  endTime: string;
  title: string;
  description: string;
  icon: "bed" | "water" | "meal" | "book" | "walk" | "workout" | "sleep";
  completed: boolean;
};

export const routine = [
  { time: "6:30 AM", endTime: "7:00 AM", title: "Wake Up", description: "Start your day with positive energy", icon: "bed", completed: false },
  { time: "7:00 AM", endTime: "7:30 AM", title: "Drink Water", description: "1 glass of warm water", icon: "water", completed: false },
  { time: "7:30 AM", endTime: "8:30 AM", title: "Breakfast", description: "Oats, banana and nuts", icon: "meal", completed: false },
  { time: "9:00 AM", endTime: "1:00 PM", title: "Work / Study", description: "Be productive!", icon: "book", completed: false },
  { time: "1:00 PM", endTime: "2:00 PM", title: "Lunch", description: "Balanced meal with protein", icon: "meal", completed: false },
  { time: "5:00 PM", endTime: "5:30 PM", title: "Evening Walk", description: "30 minutes walk", icon: "walk", completed: false },
  { time: "7:00 PM", endTime: "8:00 PM", title: "Workout", description: "Strength training - 45 min", icon: "workout", completed: false },
  { time: "9:00 PM", endTime: "10:00 PM", title: "Dinner", description: "Light and healthy meal", icon: "meal", completed: false },
  { time: "10:30 PM", endTime: "11:00 PM", title: "Read / Relax", description: "Unwind your mind", icon: "book", completed: false },
  { time: "11:00 PM", endTime: "11:30 PM", title: "Sleep", description: "Aim for 7-8 hours", icon: "sleep", completed: false },
] satisfies RoutineItem[];

export const routineDateKey = "fitai-routine-date";
export const routineCompletedKey = "fitai-routine-completed";
export const routineAskedKey = "fitai-routine-asked";
