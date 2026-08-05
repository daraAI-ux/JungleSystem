import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamButton } from '../src/components/kolam-button';
import { KolamPdfDownloadButton } from '../src/components/kolam-pdf-download-button';
import { KolamPdfFileIcon } from '../src/components/kolam-pdf-file-icon';

describe('KolamPdfDownloadButton', () => {
  it('renders the default PDF download label with the PDF icon', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<KolamPdfDownloadButton />);
    });

    expect(renderer!.root.findByType(KolamButton).props.label).toBe(
      'Unduh PDF',
    );
    expect(renderer!.root.findByType(Text).props.children).toBe('Unduh PDF');
    expect(renderer!.root.findByType(KolamPdfFileIcon)).toBeTruthy();
  });

  it('keeps icon-only buttons accessible and pressable', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamPdfDownloadButton iconOnly onPress={onPress} />,
      );
    });

    const button = renderer!.root.findByProps({ accessibilityRole: 'button' });

    expect(renderer!.root.findByType(KolamButton).props.label).toBe('');
    expect(button.props.accessibilityLabel).toBe('Unduh PDF');

    button.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('uses the loading label without changing the accessible label in label mode', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamPdfDownloadButton
          label="Unduh faktur"
          loading
          loadingLabel="Mengunduh…"
        />,
      );
    });

    const button = renderer!.root.findByProps({ accessibilityRole: 'button' });

    expect(renderer!.root.findByType(KolamButton).props.label).toBe(
      'Mengunduh…',
    );
    expect(button.props.accessibilityLabel).toBe('Mengunduh…');
  });
});
