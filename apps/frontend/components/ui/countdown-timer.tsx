"use client";

import * as React from "react";

export function CountdownTimer({ expiresAt }: { expiresAt: Date }) {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    const update = () => {
      const diff = expiresAt.getTime() - Date.now();
      if (diff <= 0) return setValue("Expired");
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      setValue(`${days}d ${hours}h`);
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return <span className="rounded-full bg-black/55 px-2 py-1 text-[10px] font-bold text-white">{value}</span>;
}
