"use client";

import React from "react";
import Catalog from "./catalog";
import Rates from "./rates";
import Turnaround from "./turnaround";
import Assurance from "./assurance";

export default function Page() {
  return (
    <>
      <Catalog />
      <Rates />
      <Turnaround />
      <Assurance />
    </>
  );
}
