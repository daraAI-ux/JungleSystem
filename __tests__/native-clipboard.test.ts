const mockSetString = jest.fn();

jest.mock('@react-native-clipboard/clipboard', () => ({
  __esModule: true,
  default: {
    setString: mockSetString,
  },
}));

describe('copyTextToClipboard', () => {
  beforeEach(() => {
    jest.resetModules();
    mockSetString.mockClear();
  });

  it('copies text through the native clipboard module', async () => {
    const {copyTextToClipboard} = require('../src/lib/native-clipboard');

    await expect(copyTextToClipboard(' conv-1 ')).resolves.toBe(true);
    expect(mockSetString).toHaveBeenCalledWith('conv-1');
  });
});
