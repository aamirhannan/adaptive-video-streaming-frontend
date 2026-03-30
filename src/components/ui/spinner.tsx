export const Spinner = ({ size = 18 }: { size?: number }) => (
  <span
    aria-label="loading"
    className="inline-block animate-spin rounded-full border-2 border-white/20 border-t-violet-400"
    style={{ width: size, height: size }}
  />
);
