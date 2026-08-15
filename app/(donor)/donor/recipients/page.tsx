import { redirect } from "next/navigation";

import { NearbyMap } from "@/components/donor/NearbyMap";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { MAX_RADIUS_KM } from "@/lib/config";
import { listNearbyRecipients, type NearbyRecipient } from "@/lib/db/nearby";
import { cn } from "@/lib/utils";

function formatLastReceived(value: string | null): string {
  if (!value) {
    return "Belum pernah menerima donasi";
  }

  const days = Math.floor(
    (Date.now() - new Date(value).getTime()) / (24 * 60 * 60 * 1000),
  );

  if (days <= 0) {
    return "Menerima donasi hari ini";
  }

  if (days === 1) {
    return "Terakhir menerima kemarin";
  }

  return `Terakhir menerima ${days} hari lalu`;
}

function RecipientRow({ recipient }: { recipient: NearbyRecipient }) {
  const isOpen = recipient.currentNeed > 0 && recipient.isInRadius;

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-brand-ink/8 bg-white px-5 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-semibold text-brand-ink">{recipient.name}</h2>
        <span className="numeric text-sm text-brand-ink/45">
          {recipient.distanceKm.toFixed(1)} km
        </span>
      </div>

      <p
        className={cn(
          "text-sm",
          isOpen ? "text-brand-deep" : "text-brand-ink/45",
        )}
      >
        {recipient.currentNeed > 0 ? (
          <>
            Butuh{" "}
            <span className="numeric font-semibold">
              {recipient.currentNeed}
            </span>{" "}
            porsi hari ini
          </>
        ) : (
          "Belum membuka kebutuhan hari ini"
        )}
        <span className="text-brand-ink/40">
          {" · "}muat {recipient.capacity} orang
        </span>
      </p>

      <div className="flex flex-wrap gap-2">
        {recipient.isInRadius ? null : (
          <span className="inline-flex items-center rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">
            Di luar radius {MAX_RADIUS_KM} km
          </span>
        )}

        {recipient.halalOnly ? (
          <span className="inline-flex items-center rounded-md bg-brand-tint px-2.5 py-1 text-xs font-medium text-brand-deep">
            Halal saja
          </span>
        ) : null}

        {recipient.allergenRestrictions.map((allergen) => (
          <span
            key={allergen}
            className="inline-flex items-center rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium capitalize text-red-900"
          >
            Tanpa {allergen}
          </span>
        ))}
      </div>

      <p className="text-xs text-brand-ink/40">
        {formatLastReceived(recipient.lastReceivedAt)}
      </p>
    </li>
  );
}

export default async function DonorRecipientsPage() {
  const nearby = await listNearbyRecipients();

  if (!nearby) {
    redirect("/donor/profile");
  }

  const inRadius = nearby.recipients.filter(
    (recipient) => recipient.isInRadius,
  );
  const openNow = inRadius.filter((recipient) => recipient.currentNeed > 0);
  const openServings = openNow.reduce(
    (total, recipient) => total + recipient.currentNeed,
    0,
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Panti terdekat"
        description={`Panti asuhan dan rumah lansia yang sudah terverifikasi di sekitar restoranmu. Donasi hanya dicocokkan dengan yang berada dalam radius ${MAX_RADIUS_KM} km.`}
      />

      {nearby.recipients.length === 0 ? (
        <EmptyState
          title="Belum ada panti terverifikasi"
          description="Begitu ada panti asuhan atau rumah lansia yang lolos verifikasi admin, mereka akan muncul di peta ini."
        />
      ) : (
        <>
          <NearbyMap
            donorName={nearby.donorName}
            donorLat={nearby.donorLat}
            donorLng={nearby.donorLng}
            recipients={nearby.recipients}
          />

          <dl className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-brand-ink/8 bg-white px-5 py-5">
              <dt className="text-sm text-brand-ink/50">Dalam jangkauan</dt>
              <dd className="numeric mt-2 text-3xl font-semibold text-brand-ink">
                {inRadius.length}
                <span className="ml-1.5 text-base font-medium text-brand-ink/35">
                  panti
                </span>
              </dd>
            </div>
            <div className="rounded-xl border border-brand-ink/8 bg-white px-5 py-5">
              <dt className="text-sm text-brand-ink/50">
                Sedang butuh makanan
              </dt>
              <dd className="numeric mt-2 text-3xl font-semibold text-brand-ink">
                {openNow.length}
                <span className="ml-1.5 text-base font-medium text-brand-ink/35">
                  panti
                </span>
              </dd>
            </div>
            <div className="rounded-xl border border-brand-ink/8 bg-white px-5 py-5">
              <dt className="text-sm text-brand-ink/50">
                Total kebutuhan hari ini
              </dt>
              <dd className="numeric mt-2 text-3xl font-semibold text-brand-ink">
                {openServings}
                <span className="ml-1.5 text-base font-medium text-brand-ink/35">
                  porsi
                </span>
              </dd>
            </div>
          </dl>

          <ul className="flex flex-col gap-3">
            {nearby.recipients.map((recipient) => (
              <RecipientRow key={recipient.id} recipient={recipient} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
