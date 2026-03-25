import DashboardClient from "./dashboard-client";
import { getDashboardData } from "./data-actions";

export default async function DashboardPage() {
  let data;
  try {
    data = await getDashboardData();
  } catch {
    // DB not connected — client falls back to mock data
    data = undefined;
  }

  return <DashboardClient data={data as any} />;
}
