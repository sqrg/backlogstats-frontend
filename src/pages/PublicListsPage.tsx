import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPublicLists } from "../api/public_lists";
import { PageShell } from "../components/ui";
import type { PublicUserList } from "../types/user_list";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function PublicListsPage() {
  const { username } = useParams<{ username: string }>();
  const [lists, setLists] = useState<PublicUserList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    fetchPublicLists(username)
      .then(setLists)
      .catch(() => setError("Couldn't load lists."))
      .finally(() => setIsLoading(false));
  }, [username]);

  return (
    <PageShell>
      <div className="mt-8">
        <h1 className="text-2xl font-bold mb-6">{username}'s lists</h1>

        {isLoading && <p className="text-gray-500">Loading…</p>}
        {!isLoading && error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && lists.length === 0 && (
          <p className="text-gray-500">{username} hasn't published any public lists yet.</p>
        )}

        {!isLoading && !error && lists.length > 0 && (
          <div className="flex flex-col gap-3">
            {lists.map((list) => (
              <Link
                key={list.id}
                to={`/u/${username}/lists/${list.id}`}
                className="border border-gray-200 rounded p-4 flex items-center justify-between gap-4 no-underline hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-semibold text-gray-900 truncate">{list.name}</span>
                  <span className="text-sm text-gray-500">
                    {list.entries.length} {list.entries.length === 1 ? "game" : "games"}
                  </span>
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  Updated {formatDate(list.updated_at)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
