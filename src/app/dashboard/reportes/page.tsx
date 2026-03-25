import ReportesClient from "./reportes-client";
import { getReportesData } from "../data-actions";

export default async function ReportesPage() {
  let data;
  try {
    data = await getReportesData();
  } catch {
    data = undefined;
  }

  return <ReportesClient initialData={data as any} />;
}
