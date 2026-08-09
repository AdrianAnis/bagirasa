const ALLOCATIONS = [
  { name: "Panti Asuhan Harapan Bunda", servings: 35, distance: "0,9 km" },
  { name: "Rumah Lansia Sejahtera", servings: 20, distance: "2,3 km" },
  { name: "Panti Asuhan Kasih Ibu", servings: 45, distance: "5,8 km" },
];

const TOTAL = ALLOCATIONS.reduce((sum, item) => sum + item.servings, 0);

export function AllocationDiagram() {
  return (
    <figure className="rounded-2xl border border-brand-ink/10 bg-white p-6 shadow-[0_1px_2px_rgba(16,36,28,0.04),0_12px_32px_-16px_rgba(16,36,28,0.25)]">
      <figcaption className="flex items-baseline justify-between gap-4">
        <span className="eyebrow text-brand/70">Sisa makan malam</span>
        <span className="numeric text-sm text-brand-ink/50">1 restoran</span>
      </figcaption>

      <p className="mt-3 flex items-baseline gap-2">
        <span className="numeric text-5xl font-semibold text-brand-ink">
          {TOTAL}
        </span>
        <span className="text-sm text-brand-ink/60">porsi layak konsumsi</span>
      </p>

      <div
        className="mt-5 flex h-2 overflow-hidden rounded-full"
        role="presentation"
      >
        {ALLOCATIONS.map((item, index) => (
          <span
            key={item.name}
            style={{
              width: `${(item.servings / TOTAL) * 100}%`,
              opacity: 1 - index * 0.22,
            }}
            className="block bg-brand"
          />
        ))}
      </div>

      <ul className="mt-5 flex flex-col divide-y divide-brand-ink/8">
        {ALLOCATIONS.map((item, index) => (
          <li
            key={item.name}
            className="flex items-baseline justify-between gap-4 py-3"
          >
            <span className="flex items-baseline gap-3">
              <span
                aria-hidden
                style={{ opacity: 1 - index * 0.22 }}
                className="size-2 shrink-0 translate-y-[-1px] rounded-full bg-brand"
              />
              <span className="text-sm font-medium text-brand-ink">
                {item.name}
              </span>
            </span>
            <span className="flex shrink-0 items-baseline gap-3">
              <span className="numeric text-xs text-brand-ink/45">
                {item.distance}
              </span>
              <span className="numeric text-sm font-semibold text-brand-deep">
                {item.servings}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-brand-ink/10 pt-4 text-sm text-brand-ink/55">
        Terbagi dalam hitungan detik. Tidak ada porsi tersisa, tidak ada panti
        yang terlewat.
      </p>
    </figure>
  );
}
