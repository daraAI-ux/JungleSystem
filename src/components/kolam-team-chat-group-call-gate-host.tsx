import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  useKolamAuthContext,
  useKolamNavigationContext,
} from '../context/kolam-app-contexts';
import {useKolamTeamChatGroupCallGate} from '../hooks/use-kolam-team-chat-group-call-gate';
import {KolamButton} from './kolam-button';
import {KolamModalDialog} from './kolam-modal-dialog';
import {KolamPressable} from './kolam-pressable';

/**
 * Global group-call invite overlay (SoT `TeamChatGroupCallGate`).
 * Signaling-only — no WebRTC. Ringtone loops while `isRingingForMe`.
 */
export function KolamTeamChatGroupCallGateHost() {
  const {authUser} = useKolamAuthContext();
  const {handleDashboardRouteContext} = useKolamNavigationContext();
  const userId =
    authUser?.id != null && String(authUser.id).trim()
      ? String(authUser.id)
      : null;
  const gate = useKolamTeamChatGroupCallGate({
    enabled: Boolean(authUser),
    userId,
  });

  if (!gate.featureEnabled || !gate.liveCall) {
    return null;
  }

  const openRoom = () => {
    const roomId = gate.liveCall?.roomId?.trim();
    if (!roomId) {
      return;
    }
    handleDashboardRouteContext(`/team-chat?room=${encodeURIComponent(roomId)}`);
  };

  return (
    <>
      <KolamModalDialog
        accessibilityLabel="Team chat group call invite"
        description={
          gate.errorMessage
            ? gate.errorMessage
            : `Anda dipanggil ke room team chat. Sisa waktu: ${gate.countdown}s`
        }
        footer={
          <>
            <KolamButton
              disabled={gate.busy}
              intent="primary"
              label={gate.busy ? '…' : 'Gabung'}
              onPress={() => {
                void gate.joinCall();
              }}
            />
            <KolamButton
              disabled={gate.busy}
              label="Tolak"
              onPress={() => {
                void gate.declineCall();
              }}
            />
          </>
        }
        maxWidth="86%"
        onClose={() => {
          void gate.declineCall();
        }}
        title="Panggilan grup"
        visible={gate.ringingMe}
        width={420}
      />

      {!gate.ringingMe ? (
        <View
          accessibilityLabel="Team chat group call active"
          pointerEvents="box-none"
          style={styles.pillAnchor}
        >
          <View style={styles.pill}>
            <KolamPressable
              accessibilityLabel="Open team chat group call room"
              onPress={openRoom}
              style={styles.pillLink}
            >
              <View style={styles.pillDot} />
              <Text numberOfLines={1} style={styles.pillText}>
                Call group aktif · {gate.online} online
                {gate.countdown > 0 ? ` · ${gate.countdown}s` : ''}
              </Text>
            </KolamPressable>
            {gate.canEnd ? (
              <KolamPressable
                accessibilityLabel="End team chat group call"
                disabled={gate.busy}
                onPress={() => {
                  void gate.endCall();
                }}
                style={styles.pillEnd}
              >
                <Text style={styles.pillEndText}>Tutup</Text>
              </KolamPressable>
            ) : null}
          </View>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  pillAnchor: {
    bottom: 20,
    left: 0,
    position: 'absolute',
    right: 16,
    zIndex: 90,
    alignItems: 'flex-end',
  },
  pill: {
    alignItems: 'center',
    backgroundColor: 'rgba(31, 66, 43, 0.92)',
    borderColor: 'rgba(74, 118, 88, 0.42)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    maxWidth: '92%',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pillLink: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: 8,
    minWidth: 0,
  },
  pillDot: {
    backgroundColor: '#a9d4b7',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  pillText: {
    color: '#a9d4b7',
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  pillEnd: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pillEndText: {
    color: '#a9d4b7',
    fontSize: 11,
    fontWeight: '600',
  },
});
