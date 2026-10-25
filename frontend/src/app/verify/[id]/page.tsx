import { PublicScorecardView } from "../../../components/PublicScorecardView";

export function generateStaticParams() {
  return [
    { id: "0x8f2a3c9e1b4f7a229b12c8d4e7f10a35" },
    { id: "0x3e1f7c449a88bc01d5e23a4f667109b2" },
    { id: "0x5a9d2e81fc47890a1b2c3d4e5f6a7b8c" },
    { id: "0x1d7c8f553a99bb00e1f2a3b4c5d6e7f8" },
  ];
}

interface VerifyPageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicVerifyPage({ params }: VerifyPageProps) {
  const { id } = await params;
  return <PublicScorecardView hashId={id} />;
}
