"use client";

import { useEffect, useState } from "react";

function toLocalInputValue(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function ScheduleFields({ defaultIso = "" }: { defaultIso?: string }) {
  const [offset, setOffset] = useState("0");
  const [value, setValue] = useState("");
  useEffect(() => {
    setOffset(String(new Date().getTimezoneOffset()));
    if (defaultIso) setValue(toLocalInputValue(defaultIso));
  }, [defaultIso]);

  return <>
    <input type="datetime-local" name="scheduledAt" value={value} onChange={event => setValue(event.target.value)}/>
    <input type="hidden" name="timezoneOffset" value={offset}/>
  </>;
}
