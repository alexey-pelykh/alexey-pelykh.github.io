import { Metadata } from 'next';
import TallyEmbed from './tally-embed';

export const metadata: Metadata = {
  title: 'Feedback - Alexey Pelykh',
  description: 'Quick feedback check — I want to know how I come across.',
};

export default function FeedbackPage() {
  return (
    <main className="container bg-white dark:bg-black mx-auto px-4 py-8">
      <TallyEmbed />
    </main>
  );
}
