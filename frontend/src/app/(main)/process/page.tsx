"use client";

import React from "react";
import Workflow from "./workflow";
import Stages from "./stages";
import Pickup from "./pickup";
import Tracking from "./tracking";

export default function Page() {
  return (
    <>
      <Workflow />
      <Stages />
      <Pickup />
      <Tracking />
    </>
  );
}
