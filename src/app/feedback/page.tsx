import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feedback - Alexey Pelykh',
  description: 'Quick feedback check — I want to know how I come across.',
};

export default function FeedbackPage() {
  return (
    <main className="relative h-screen overflow-hidden bg-white dark:bg-black">
      <iframe
        src="https://tally.so/embed/obROxN?transparentBackground=1"
        className="absolute inset-0 w-full h-full border-0"
        title="Perception Check"
      />
    </main>
  );
}
