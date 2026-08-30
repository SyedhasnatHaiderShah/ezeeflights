"use client";

import * as React from "react";
import { AirlinePageTemplate } from "@/components/sections/AirlinePageTemplate";
import { AIRLINE_DATA } from "@/constants/airline-data";

export default function DeltaAirlinesPage() {
  const data = AIRLINE_DATA.delta;
  
  if (!data) return null;

  return <AirlinePageTemplate data={data} />;
}
