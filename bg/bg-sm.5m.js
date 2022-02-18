#!/usr/bin/env -S /opt/homebrew/bin/deno run -A --unstable --allow-env

/*
  <xbar.title>bg</xbar.title>
  <xbar.version>v1.0</xbar.version>
  <xbar.author>asher</xbar.author>
  <xbar.author.github>asherweintraub</xbar.author.github>
  <xbar.desc>Shows Dexcom data using Sugamate.</xbar.desc>
  <xbar.dependencies>deno</xbar.dependencies>

  <xbar.var>string(VAR_EMAIL=me@example.com): Sugarmate email.</xbar.var>
  <xbar.var>string(VAR_PASSWORD=password): Sugarmate password.</xbar.var>
*/

import puppeteer from "https://deno.land/x/puppeteer@9.0.2/mod.ts";

const env = Deno.env.toObject();
const { VAR_EMAIL, VAR_PASSWORD } = env;

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://sugarmate.io/sign_in');
  await page.type('input#session_email', VAR_EMAIL);
  await page.type('input#session_password', VAR_PASSWORD);
  await page.click('input[type="submit"]');
  await page.waitForNavigation({ waitUntil: "networkidle2"} );

  const time = await page.$eval('.reading-wrap .time', (el) => el.innerHTML);
  const value = await page.$eval('.reading-wrap .value', (el) => el.innerHTML);
  const unit = await page.$eval('.reading-wrap .units', (el) => el.innerHTML);
  const trend = await page.$eval('.reading-wrap .trend', (el) => el.getAttribute('data-trend'));
  const delta = await page.$eval('.reading-wrap .delta', (el) => el.innerHTML);

  console.log(`
    ${value} ${arrow(trend)}
    ---
    ${value} ${unit}
    ${delta} ${arrow(trend)}
    ---
    See on sugarmate | href="https://sugarmate.io/home"
  `);

  await browser.close();
})();

const arrow = (str) => {
  switch(str) {
    case "FLAT":
      return "→";
    case "FORTY_FIVE_UP":
      return "↗"
    case "FORTY_FIVE_DOWN":
      return "↘"
    default:
      return "❓";
  }
}
