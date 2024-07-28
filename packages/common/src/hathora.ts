import { HathoraCloud } from '@hathora/cloud-sdk-typescript';
import { Region } from '@hathora/cloud-sdk-typescript/models/components';
import { GameMode } from './types';

export type LobbyConfig = {
    roomName: string;
    roomMap: string;
    roomMaxPlayers: number;
    mode: GameMode;
    playerCount: number;
};

const hathoraCloud = new HathoraCloud({
    appId: 'app-54ce5976-0eb1-460e-bf83-be25fd1f1737',
    hathoraDevToken: typeof process !== 'undefined' ? `Bearer ${process.env.HATHORA_DEVELOPER_TOKEN}` : undefined,
});

const lobbyClient = hathoraCloud.lobbiesV3;
const roomClient = hathoraCloud.roomsV2;
const authClient = hathoraCloud.authV1;
const discoveryClient = hathoraCloud.discoveryV2;

export const createLobby = async (lobbyConfig: LobbyConfig) => {
    const region = await getClosestRegion();
    const playerToken = (await authClient.loginAnonymous()).token;
    return await lobbyClient.createLobby(
        { playerAuth: playerToken },
        { visibility: 'public', region, roomConfig: JSON.stringify(lobbyConfig) },
    );
};

export const getActiveLobbies = async () => {
    return await lobbyClient.listActivePublicLobbies();
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

export const setLobbyConfig = async (roomId: string, lobbyConfig: LobbyConfig) => {
    await roomClient.updateRoomConfig(roomId, { roomConfig: JSON.stringify(lobbyConfig) });
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
