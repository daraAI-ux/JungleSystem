import {
  computeFilterPanelAnchor,
  measureFilterPanelAnchor,
} from '../src/components/kolam-filter-panel-anchor';

describe('kolam-filter-panel-anchor', () => {
  it('computes left under the trigger and clamps to toolbar width', () => {
    expect(
      computeFilterPanelAnchor({
        panelWidth: 280,
        toolbarWidth: 400,
        toolbarX: 100,
        toolbarY: 50,
        triggerHeight: 34,
        triggerX: 220,
        triggerY: 60,
      }),
    ).toEqual({ left: 120, top: 48 });

    expect(
      computeFilterPanelAnchor({
        panelWidth: 280,
        toolbarWidth: 300,
        toolbarX: 0,
        toolbarY: 0,
        triggerHeight: 34,
        triggerX: 200,
        triggerY: 10,
      }),
    ).toEqual({ left: 20, top: 48 });
  });

  it('invokes onReady only after both measures complete', () => {
    const onReady = jest.fn();
    const toolbar = {
      measureInWindow: (
        cb: (x: number, y: number, width: number, height: number) => void,
      ) => {
        cb(10, 20, 500, 40);
      },
    };
    const trigger = {
      measureInWindow: (
        cb: (x: number, y: number, width: number, height: number) => void,
      ) => {
        cb(80, 28, 90, 34);
      },
    };

    measureFilterPanelAnchor(toolbar, trigger, 260, onReady);

    expect(onReady).toHaveBeenCalledTimes(1);
    expect(onReady).toHaveBeenCalledWith({ left: 70, top: 46 });
  });

  it('does not call onReady when refs are missing', () => {
    const onReady = jest.fn();
    measureFilterPanelAnchor(null, null, 260, onReady);
    expect(onReady).not.toHaveBeenCalled();
  });
});
