import { redirect } from 'next/navigation';
export default function RecommendationsRedirect() {
  redirect('/dashboard/help?mode=find-book');
}
