import { ExerciseView } from '@/components/exercise-view';
import { EX } from '@/lib/data';

// Every exercise is known at build time, so each gets its own static page.
export const generateStaticParams = () => Object.keys(EX).map(id => ({ id }));
export const dynamicParams = false;

export default async function ExercisePage({ params }: PageProps<'/ex/[id]'>) {
  return <ExerciseView id={(await params).id} />;
}
