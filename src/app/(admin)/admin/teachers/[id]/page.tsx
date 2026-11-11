import { redirect } from "next/navigation";
export default function TeacherDetailPage({ params }: { params: { id: string } }) { redirect(`/admin/teachers?focus=${params.id}`); }
