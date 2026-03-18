const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL ?? "YOUR_SCRIPT_URL_HERE";

export interface Player {
  Name: string;
  Faction: string;
  Role: string;
  Payment_Status: boolean;
  Alive_Status: boolean;
  Kills: number;
  Faction_Approved: boolean;
  Death_Time?: string;
}

interface GasResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ---- Register a new player ----
export async function registerPlayer(
  name: string,
  faction: string,
  role: string
): Promise<GasResponse<null>> {
  const res = await fetch(GAS_URL, {
    method: "POST",
    body: JSON.stringify({ action: "register", name, faction, role }),
  });
  return res.json();
}

// ---- Get a single player by name ----
export async function getPlayer(name: string): Promise<GasResponse<Player>> {
  const url = `${GAS_URL}?name=${encodeURIComponent(name)}`;
  const res = await fetch(url, { cache: "no-store" });
  return res.json();
}

// ---- Get all players ----
export async function getAllPlayers(): Promise<GasResponse<Player[]>> {
  const url = `${GAS_URL}?action=get_all`;
  const res = await fetch(url, { cache: "no-store" });
  return res.json();
}

// ---- Toggle a status column ----
export async function updateStatus(
  name: string,
  colName: "Payment_Status" | "Alive_Status" | "Kills" | "Faction_Approved",
  value: boolean | number
): Promise<GasResponse<null>> {
  const res = await fetch(GAS_URL, {
    method: "POST",
    body: JSON.stringify({ action: "update_status", name, colName, value }),
  });
  return res.json();
}
