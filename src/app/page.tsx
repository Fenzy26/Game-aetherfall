import VisualNovelGame from "@/components/game/VisualNovelGame";

export default function HomePage() {
  return (
    <main className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-black select-none">
      <VisualNovelGame />
    </main>
  );
}
