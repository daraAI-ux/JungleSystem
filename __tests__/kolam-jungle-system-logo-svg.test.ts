import {JUNGLE_SYSTEM_LOGO_COLOR_SVG} from '../src/assets/brand/jungle-system-logo-color-svg';

describe('JungleSystem logo SVG asset', () => {
  it('uses inline fills so SvgXml renders color on native', () => {
    expect(JUNGLE_SYSTEM_LOGO_COLOR_SVG).toContain('fill="#2eb429"');
    expect(JUNGLE_SYSTEM_LOGO_COLOR_SVG).toContain('fill="#d7cca1"');
    expect(JUNGLE_SYSTEM_LOGO_COLOR_SVG).not.toContain('class=');
    expect(JUNGLE_SYSTEM_LOGO_COLOR_SVG).not.toContain('<style>');
  });
});
