import { StudentProfileView } from "../../../components/StudentProfileView";

export function generateStaticParams() {
  return [
    { username: "marcus_v" },
    { username: "elena_phys" },
    { username: "kchen_algo" },
  ];
}

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function StudentProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  return <StudentProfileView username={username} />;
}
