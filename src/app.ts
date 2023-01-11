import fs from "fs";
import path from "path";
import config from "../config.json";

type Resident = {
  name: string;
  nameInitial: string;
  room: string;
};

function main() {
  const txt = fs
    .readFileSync(path.join(__dirname, "..", "names.csv"))
    .toString("ascii")
    .trim();

  const lines = txt.split("\n");

  if (config.password.length !== lines.length) {
    console.error("Password needs to be same length as number of residents");
    return;
  }

  shuffle(lines);

  const residents = makeResidentObjs(lines);

  if (config["first"]) {
    const nameOfFirst = config["first"];
    const index = residents.findIndex((v) => v.name === nameOfFirst);

    if (index !== -1) {
      [residents[0], residents[index]] = [residents[index], residents[0]];
    }
  }

  if (config["last"]) {
    const nameOfLast = config["last"];
    const index = residents.findIndex((v) => v.name === nameOfLast);

    if (index !== -1) {
      const l = residents.length - 1;
      [residents[l], residents[index]] = [residents[index], residents[l]];
    }
  }

  const urls = makeUrls(residents);

  console.log(urls);
}

function makeUrls(residents: Resident[]): string[] {
  const out: string[] = [];

  for (let i = 0; i < residents.length; i++) {
    const { name, room } = residents[i];
    const letter = config.password.charAt(i);
    const prev =
      i === 0
        ? undefined
        : `${residents[i - 1].room} (${residents[i - 1].nameInitial})`;
    const next =
      i === residents.length - 1
        ? undefined
        : `${residents[i + 1].room} (${residents[i + 1].nameInitial})`;

    out.push(makeUrl(name, letter, room, prev, next));
  }

  return out;
}

function makeUrl(
  name: string,
  letter: string,
  room: string,
  prev?: string,
  next?: string
): string {
  const shortName = config.longToShort.name;
  const shortLetter = config.longToShort.letter;
  const shortRoom = config.longToShort.room;
  const shortPrev = config.longToShort.prev;
  const shortNext = config.longToShort.next;
  const shortColor = config.longToShort.color;

  const params = [
    `${shortName}=${toBase64Url(name)}`,
    `${shortLetter}=${letter}`,
    `${shortRoom}=${toBase64Url(room)}`,
    `${shortColor}=${Math.floor(Math.random() * config.colors)}`,
  ];

  if (prev) {
    params.push(`${shortPrev}=${toBase64Url(prev)}`);
  }

  if (next) {
    params.push(`${shortNext}=${toBase64Url(next)}`);
  }

  shuffle(params);

  const qs = params.join("&");

  return `${config.prefix}?${qs}`;
}

function makeResidentObjs(rawLines: string[]): Resident[] {
  const out: Resident[] = [];

  for (const line of rawLines) {
    const fields = line.split(",");
    if (fields.length < 3) {
      console.error(`Invalid record: ${line}`);
      process.exit();
    }

    let name: string;
    let nameInitial: string;

    if (fields[0] === "") {
      name = fields[1];
      nameInitial = name;
    } else {
      name = `${fields[1]} ${fields[0]}`;
      nameInitial = `${fields[1]} ${fields[0].charAt(0).trim()}.`;
    }

    out.push({
      name: name.trim(),
      nameInitial: nameInitial,
      room: fields[2].trim(),
    });
  }

  return out;
}

// Durstenfeld shuffle
function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function toBase64Url(str: string): string {
  return Buffer.from(str, "ascii")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, ".");
}

main();
