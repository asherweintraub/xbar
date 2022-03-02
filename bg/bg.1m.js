#!/usr/bin/env -S /opt/homebrew/bin/deno run -A --allow-env --allow-net

/*
  <xbar.title>bg</xbar.title>
  <xbar.version>v1.0</xbar.version>
  <xbar.author>asher</xbar.author>
  <xbar.author.github>asherweintraub</xbar.author.github>
  <xbar.desc>Shows Dexcom data using Sugamate.</xbar.desc>
  <xbar.dependencies>deno</xbar.dependencies>

  <xbar.var>string(VAR_URL=https://mycgm.herokuapp.com): Nightscout url.</xbar.var>
  <xbar.var>boolean(VAR_MMOL=false): True for mmol/L units. False for mg/dL.</xbar.var>
*/

import { format } from "https://deno.land/std@0.126.0/datetime/mod.ts";

const env = Deno.env.toObject();
const { VAR_URL, VAR_MMOL } = env;

const res = await fetch(`${VAR_URL}/api/v1/entries/current.json`);
const data = await res.json();
const { sgv, date, direction } = data[0];

const unit = VAR_MMOL == true ? "mmol/L" : "mg/dL";
const val = VAR_MMOL == true ? (sgv/18.0182).toFixed(3) : sgv; // set bg to sgv, or, if mmol=true, convert to mmol/L.

const dateObj = new Date(date);

const arrow = (str) => {
  switch(str) {
    case "Flat":
      return "→"
    case "FortyFiveUp":
      return "↗"
    case "FortyFiveDown":
      return "↘"
    case "SingleUp":
      return "↑"
    case "SingleDown":
      return "↓"
    case "DoubleUp":
      return "⇈"
    case "DoubleDown":
      return "⇊"
    default:
      return str;
  }
}

const agoMins = (dateObj) => {
  return Math.floor((new Date() - date) / 1000 / 60);
}

console.log(`
  ${val} ${arrow(direction)}
  ---
  ${val} ${unit}
  ${format(dateObj, "HH:mm")} (${agoMins(dateObj)}m ago)
  ---
  Open Nightscout | href="${VAR_URL}"
`);
