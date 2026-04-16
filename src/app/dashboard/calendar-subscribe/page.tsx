import { getTokenCalendar } from "./actions";
import CalendarSubscribeClient from "./client";

export default async function CalendarSubscribePage() {
  const { token } = await getTokenCalendar();
  return <CalendarSubscribeClient token={token} />;
}
