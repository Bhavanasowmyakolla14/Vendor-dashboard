import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';
import { profileTasks } from '@/lib/dashboard-data';

export function ProfileCompletion() {
  const doneCount = profileTasks.filter((t) => t.done).length;
  const percent = Math.round((doneCount / profileTasks.length) * 100);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-premium">
      <h3 className="text-base font-bold text-dark-900">Profile Completion</h3>
      <p className="mt-0.5 text-sm text-muted-foreground">Finish setup to get more bookings</p>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(40 15% 88%)" strokeWidth="8" />
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="hsl(120 30% 40%)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-dark-900">{percent}%</span>
          </div>
        </div>

        <ul className="flex-1 space-y-2">
          {profileTasks.map((task) => (
            <li key={task.id} className="flex items-center gap-2 text-sm">
              {task.done ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sage-100">
                  <Check className="h-3 w-3 text-sage-700" />
                </span>
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border">
                  <Circle className="h-2 w-2 text-dark-300" />
                </span>
              )}
              <span className={task.done ? 'text-muted-foreground line-through' : 'font-medium text-dark-900'}>
                {task.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
