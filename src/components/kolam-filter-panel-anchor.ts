export type KolamFilterPanelAnchor = {
  left: number;
  top: number;
};

type MeasureTarget = {
  measureInWindow: (
    callback: (x: number, y: number, width: number, height: number) => void,
  ) => void;
};

/** Compute toolbar-relative panel position (no default left:0 flash). */
export function computeFilterPanelAnchor(params: {
  panelWidth: number;
  toolbarWidth: number;
  toolbarX: number;
  toolbarY: number;
  triggerHeight: number;
  triggerX: number;
  triggerY: number;
}): KolamFilterPanelAnchor {
  const maxLeft = Math.max(0, params.toolbarWidth - params.panelWidth);
  const preferredLeft = params.triggerX - params.toolbarX;
  return {
    left: Math.min(Math.max(0, preferredLeft), maxLeft),
    top: params.triggerY - params.toolbarY + params.triggerHeight + 4,
  };
}

/**
 * Measure trigger under toolbar, then call onReady with final anchor.
 * Callers must open the panel only inside onReady (never with a temporary left:0).
 */
export function measureFilterPanelAnchor(
  toolbar: MeasureTarget | null | undefined,
  trigger: MeasureTarget | null | undefined,
  panelWidth: number,
  onReady: (anchor: KolamFilterPanelAnchor) => void,
): void {
  if (!toolbar || !trigger) {
    return;
  }

  toolbar.measureInWindow((toolbarX, toolbarY, toolbarWidth) => {
    trigger.measureInWindow((x, y, _width, height) => {
      onReady(
        computeFilterPanelAnchor({
          panelWidth,
          toolbarWidth,
          toolbarX,
          toolbarY,
          triggerHeight: height,
          triggerX: x,
          triggerY: y,
        }),
      );
    });
  });
}
