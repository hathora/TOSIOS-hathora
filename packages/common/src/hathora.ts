import { HathoraCloud } from '@hathora/cloud-sdk-typescript';
import { Region } from '@hathora/cloud-sdk-typescript/models/components';
import { GameMode } from './types';

export type LobbyState = { playerCount: number };
export type LobbyInitialConfig = { roomName: string; roomMap: string; roomMaxPlayers: number; mode: GameMode };

const hathoraCloud = new HathoraCloud({
    appId: 'app-54ce5976-0eb1-460e-bf83-be25fd1f1737',
    hathoraDevToken: typeof process !== 'undefined' ? `Bearer ${process.env.HATHORA_DEVELOPER_TOKEN}` : undefined,
});

const lobbyClient = hathoraCloud.lobbiesV2;
const roomClient = hathoraCloud.roomsV2;
const authClient = hathoraCloud.authV1;
const discoveryClient = hathoraCloud.discoveryV2;

export const createLobby = async (initialConfig: LobbyInitialConfig) => {
    const region = await getClosestRegion();
    const playerToken = (await authClient.loginAnonymous()).token;
    return await lobbyClient.createLobbyDeprecated(
        { playerAuth: playerToken },
        { visibility: 'public', region, initialConfig },
    );
};

export const getActiveLobbies = async () => {
    return await lobbyClient.listActivePublicLobbiesDeprecatedV2();
};

export const pollConnectionInfo = async (roomId: string) => {
    for (let i = 0; i < 100; i++) {
        const connectionInfo = await roomClient.getConnectionInfo(roomId);
        if (connectionInfo.status === 'active') {
            const { host, port } = connectionInfo.exposedPort;
            return `wss://${host}:${port}`;
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
    }
    console.error('Timed out waiting for connection info');
};

export const setLobbyState = async (roomId: string, playerCount: number) => {
    await lobbyClient.setLobbyState(roomId, { state: { playerCount } });
};

export const destroyLobby = async (roomId: string) => {
    await roomClient.destroyRoom(roomId);
};

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
};
