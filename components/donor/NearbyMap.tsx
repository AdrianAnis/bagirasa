"use client";

import dynamic from "next/dynamic";

import type { NearbyRecipient } from "@/lib/db/nearby";

const NearbyRecipientsMap = dynamic(
  () => import("@/components/donor/NearbyRecipientsMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 w-full items-center justify-center rounded-lg border border-input text-sm text-brand-ink/45">
        Memuat peta...
      </div>
    ),
  },
);

type NearbyMapProps = {
  donorName: string;
  donorLat: number;
  donorLng: number;
  recipients: NearbyRecipient[];
};

export function NearbyMap(props: NearbyMapProps) {
  return <NearbyRecipientsMap {...props} />;
}
