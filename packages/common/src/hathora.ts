import { LobbyV2Api, RoomV2Api, AuthV1Api, DiscoveryV1Api, Region } from "@hathora/hathora-cloud-sdk";
import { GameMode } from "./types";

export type LobbyState = { playerCount: number };
export type LobbyInitialConfig = { roomName: string, roomMap: string, roomMaxPlayers: number, mode: GameMode };

const HATHORA_APP_ID = "app-54ce5976-0eb1-460e-bf83-be25fd1f1737";

const lobbyClient = new LobbyV2Api();
const roomClient = new RoomV2Api();
const authClient = new AuthV1Api();
const discoveryClient = new DiscoveryV1Api();

export const createLobby = async (initialConfig: LobbyInitialConfig) => {
    const region = await getClosestRegion()
    const playerToken = (await (authClient.loginAnonymous(HATHORA_APP_ID))).token;
    return await lobbyClient.createLobby(
        HATHORA_APP_ID,
        playerToken,
        { visibility: "public", region, initialConfig }
    );
}

export const getActiveLobbies = async () => {
  return await lobbyClient.listActivePublicLobbies(HATHORA_APP_ID);
}

export const pollConnectionInfo = async (roomId: string) => {
  for (let i = 0; i < 100; i++) {
    const connectionInfo = await roomClient.getConnectionInfo(HATHORA_APP_ID, roomId);
    if (connectionInfo.status === "active") {
      const { host, port } = connectionInfo.exposedPort;
      return `wss://${host}:${port}`;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  console.error("Timed out waiting for connection info");
}

export const setLobbyState = async (roomId: string, playerCount: number) => {
    await lobbyClient.setLobbyState(
        HATHORA_APP_ID,
        roomId,
        { state: { playerCount } },
        { headers: {
          Authorization: `Bearer ${process.env.HATHORA_DEVELOPER_TOKEN}`,
          "Content-Type": "application/json"
        } }
    );
}

export const destroyLobby = async (roomId: string) => {
    await roomClient.destroyRoom(
        HATHORA_APP_ID,
        roomId,
        { headers: {
          Authorization: `Bearer ${process.env.HATHORA_DEVELOPER_TOKEN}`,
          "Content-Type": "application/json"
        } }
    );
}

const getClosestRegion = async () => {
  const data = await discoveryClient.getPingServiceEndpoints();
  const regionPromises = data.map(({ region, host, port }) => {
    return new Promise<Region>(async (resolve) => {
      const pingUrl = `wss://${host}:${port}`;
      const socket = new WebSocket(pingUrl);
      socket.addEventListener('open', () => {
        resolve(region);
        socket.close();
      });
    });
  });
  return await Promise.race(regionPromises);
}
