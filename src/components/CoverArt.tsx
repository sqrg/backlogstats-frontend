import { coverUrl, gameInitials } from "../lib/visuals";

interface CoverArtProps {
  coverImageId: string | null;
  name: string;
  rounded?: "top" | "all";
}

export function CoverArt({
  coverImageId,
  name,
  rounded = "top",
}: CoverArtProps) {
  const radius = rounded === "top" ? "rounded-t-lg" : "rounded-lg";
  return (
    <div
      className={`relative w-full pb-[133.33%] overflow-hidden bg-border/50 ${radius}`}
    >
      {coverImageId ? (
        <img
          src={coverUrl(coverImageId)}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-border to-border-hi">
          <span className="font-ui font-bold text-[1.6rem] text-text-secondary/50 tracking-wider select-none">
            {gameInitials(name)}
          </span>
        </div>
      )}
    </div>
  );
}
