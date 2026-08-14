import {
  canRequestKolamTeamChatCallMediaToken,
  isKolamTeamChatCallMediaReady,
} from '../domain/kolam-team-chat-call';
import {
  getKolamTeamChatCallMediaToken,
  type KolamTeamChatCall,
  type KolamTeamChatCallConfig,
  type KolamTeamChatCallMediaToken,
} from './kolam-api';

/**
 * Guarded media-token fetch for LiveKit phase 1.
 * Returns null without hitting the network when media is off or not joined.
 */
export async function requestKolamTeamChatCallMediaTokenIfReady({
  call,
  callId,
  config,
  userId,
}: {
  call?: KolamTeamChatCall | null;
  callId: string;
  config: KolamTeamChatCallConfig | null | undefined;
  userId?: string | null;
}): Promise<KolamTeamChatCallMediaToken | null> {
  if (!isKolamTeamChatCallMediaReady(config)) {
    return null;
  }

  if (
    call &&
    !canRequestKolamTeamChatCallMediaToken({call, config, userId})
  ) {
    return null;
  }

  return getKolamTeamChatCallMediaToken(callId);
}
