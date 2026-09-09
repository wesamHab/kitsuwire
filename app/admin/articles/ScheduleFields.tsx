"use client";

import { useEffect, useState } from "react";

export function ScheduleFields({ defaultValue = "" }: { defaultValue?: string }) {
  const [offset, setOffset] = useState("0");
  useEffect(() => { setOffset(String(new Date().getTimezoneOffset())); }, []);
  return <>
    <input type="datetime-local" name="scheduledAt" defaultValue={defaultValue}/>
    <input type="hidden" name="timezoneOffset" value={offset}/>
  </>;
}
