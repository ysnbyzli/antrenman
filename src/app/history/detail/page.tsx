import { Suspense } from 'react';
import { WorkoutDetail } from '@/components/workout-detail';

// The workout id comes from ?id=…: records live on the device, so their pages can't be prerendered one by one.
export default function HistoryDetailPage() {
  return <Suspense><WorkoutDetail /></Suspense>;
}
