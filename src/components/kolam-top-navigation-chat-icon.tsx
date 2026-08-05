import React from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export function KolamTopNavigationChatIcon({
  kind,
  color = V.colors.mutedFg,
}: {
  kind: 'inbox' | 'team';
  color?: string;
}) {
  if (kind === 'team') {
    return (
      <Svg height={32} viewBox="0 0 512 512" width={32}>
        <Circle cx={256} cy={256} fill="#F47F65" r={256} />
        <Path
          d="M238 159H386C404 159 420 166 432 178C444 190 451 206 451 224V247C451 265 444 281 432 293C420 305 404 312 386 312H382V361L329 312H238C220 312 204 305 192 293C180 281 173 265 173 247V224C173 206 180 190 192 178C204 166 220 159 238 159Z"
          fill="#D9A1B8"
          stroke="#000000"
          strokeLinejoin="round"
          strokeWidth={7}
        />
        <Path
          d="M128 215H248C266 215 282 222 294 234C306 246 313 262 313 280V309C313 327 306 343 294 355C282 367 266 374 248 374H186L132 407V374H128C110 374 94 367 82 355C70 343 63 327 63 309V280C63 262 70 246 82 234C94 222 110 215 128 215Z"
          fill="#F1B4CC"
          stroke="#000000"
          strokeLinejoin="round"
          strokeWidth={7}
        />
        <Path
          d="M294 194H369M294 216H369M294 238H369M144 270H230M144 293H230M144 316H230"
          fill="none"
          stroke="#000000"
          strokeLinecap="round"
          strokeWidth={7}
        />
      </Svg>
    );
  }

  return (
    <View style={styles.inboxIcon}>
      <View style={[styles.inboxFrame, {borderColor: color}]} />
      <View style={[styles.inboxLip, {borderColor: color}]} />
      <View style={[styles.inboxTray, {backgroundColor: color}]} />
    </View>
  );
}

const styles = StyleSheet.create({
  inboxIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inboxFrame: {
    position: 'absolute',
    left: 2,
    right: 2,
    top: 4,
    bottom: 3,
    borderWidth: 1.5,
    borderRadius: 3,
  },
  inboxLip: {
    position: 'absolute',
    left: 5,
    right: 5,
    bottom: 6,
    height: 4,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  inboxTray: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 5,
    height: 1.5,
    borderRadius: 1,
  },
});
