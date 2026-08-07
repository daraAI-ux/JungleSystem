import React from 'react';
import { ScrollView, Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamDetailScrollSurface } from '../src/components/kolam-detail-scroll-surface';
import { KolamWorkspaceScrollProvider } from '../src/components/kolam-workspace-scroll-context';
import type { KolamWorkspaceScrollPolicy } from '../src/domain/kolam-workspace-scroll';

const shellScrollPolicy: KolamWorkspaceScrollPolicy = {
  isCentered: true,
  layout: 'centered',
  routePath: '/sales',
  scrollOwner: 'shell',
};

describe('KolamDetailScrollSurface', () => {
  it('renders its own ScrollView when no shell scroll policy is present', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamDetailScrollSurface>
          <Text>Detail body</Text>
        </KolamDetailScrollSurface>,
      );
    });

    expect(renderer!.root.findAllByType(ScrollView)).toHaveLength(1);
  });

  it('delegates page scrolling to the shell policy', async () => {
    const scrollTo = jest.fn();
    const ref = React.createRef<React.ElementRef<typeof ScrollView>>();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamWorkspaceScrollProvider
          policy={shellScrollPolicy}
          scrollTo={scrollTo}
        >
          <KolamDetailScrollSurface ref={ref}>
            <Text>Sales form</Text>
          </KolamDetailScrollSurface>
        </KolamWorkspaceScrollProvider>,
      );
    });

    expect(renderer!.root.findAllByType(ScrollView)).toHaveLength(0);

    ref.current?.scrollTo({ y: 240, animated: true });
    expect(scrollTo).toHaveBeenCalledWith({ y: 240, animated: true });
  });
});
