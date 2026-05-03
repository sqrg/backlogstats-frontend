import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPublicList } from "../api/public_lists";
import { PageShell } from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import type { PublicUserList } from "../types/user_list";

const coverUrl = (coverImageId: string) =>
  `https://images.igdb.com/igdb/image/upload/t_cover_big/${coverImageId}.jpg`;

export function PublicListDetailPage() {
  const { username, id } = useParams<{ username: string; id: string }>();
  const { profile } = useAuth();
  const [list, setList] = useState<PublicUserList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!username || !id) return;
    fetchPublicList(username, Number(id))
      .then((result) => {
        if (result === null) {
          setNotFound(true);
        } else {
          setList(result);
        }
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [username, id]);

  const isOwner = profile?.username?.toLowerCase() === username?.toLowerCase();

  return (
    <PageShell>
      <div className="mt-8">
        {isLoading && <p className="text-gray-500">Loading…</p>}

        {!isLoading && (notFound || error) && (
          <p className="text-gray-500">This list is private or doesn't exist.</p>
        )}

        {!isLoading && list && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-1 gap-4">
              <h1 className="text-2xl font-bold">{list.name}</h1>
              {isOwner && (
                <Link
                  to={`/lists/${list.id}`}
                  className="shrink-0 text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 no-underline"
                >
                  Edit this list
                </Link>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-6">
              by{" "}
              <Link to={`/u/${username}/lists`} className="hover:underline text-gray-700">
                {username}
              </Link>
            </p>

            {list.entries.length === 0 && (
              <p className="text-gray-500 text-sm">This list is empty.</p>
            )}

            {list.entries.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {list.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="border border-gray-200 rounded p-3 flex flex-col gap-2 text-sm"
                  >
                    {entry.game.cover_image_id ? (
                      <img
                        src={coverUrl(entry.game.cover_image_id)}
                        alt={entry.game.name}
                        className="w-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full aspect-[227/320] bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                        No cover
                      </div>
                    )}
                    <p className="font-semibold leading-tight">{entry.game.name}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}
