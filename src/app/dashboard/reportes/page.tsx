import ReportesClient from "./reportes-client";
import { getReportesData } from "./actions";

export default async function ReportesPage() {
  const data = await getReportesData("este_mes");
  return <ReportesClient initialData={data} />;
}
