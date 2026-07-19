import {getKolamTableVisualContract} from '../domain/kolam-table';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const KOLAM_SALES_TABLE_VISUAL = getKolamTableVisualContract();

export const salesPanelCardChrome = {
  borderRadius: V.surface.cardChrome.radius,
  backgroundColor: V.colors.bg,
  borderColor: V.colors.border,
  borderWidth: V.surface.cardChrome.borderWidth,
};
