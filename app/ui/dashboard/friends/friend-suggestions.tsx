'use client';

import { FriendSuggestion } from '@/app/lib/supabase/friends';
import { Avatar } from '@/app/ui/avatar';
import { Button } from '@/app/ui/button';
import { addFriend } from '@/app/dashboard/friends/actions';
import { useOptimistic } from 'react';

export function FriendSuggestionCard({
  suggestion,
  onSend,
}: {
  suggestion: FriendSuggestion;
  onSend?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 text-white backdrop-blur">
      <div className="flex items-center space-x-4">
        <Avatar
          src={suggestion.user?.profile?.avatarUrl}
          name={suggestion.user?.profile?.displayName ?? undefined}
          fallback={suggestion.user?.email?.[0] ?? '?'}
          size="md"
        />
        <div>
          <p className="font-medium">
            {suggestion.user?.profile?.displayName || suggestion.user?.email}
          </p>
          <p className="text-sm text-gray-500">
            {suggestion.commonBooks} books in common
          </p>
        </div>
      </div>
      <form action={addFriend}>
        <input type="hidden" name="friendId" value={suggestion.userId} />
        <Button
          type="submit"
          variant="outline"
          className="border-white/40 bg-white/10 text-white hover:bg-white/20"
          onClick={() => onSend?.()}
        >
          Add Friend
        </Button>
      </form>
    </div>
  );
}

export function FriendSuggestionList({
  initialSuggestions,
}: {
  initialSuggestions: FriendSuggestion[];
}) {
  const [suggestions, removeSuggestion] = useOptimistic(
    initialSuggestions,
    (state, userId: string) => state.filter(s => s.userId !== userId)
  );

  if (!suggestions.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/30 bg-white/5 p-6 text-center text-sm text-slate-200">
        No suggestions available right now. Explore the catalogue to discover more readers.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion) => (
        <FriendSuggestionCard
          key={suggestion.userId}
          suggestion={suggestion}
          onSend={() => removeSuggestion(suggestion.userId)}
        />
      ))}
    </div>
  );
}
