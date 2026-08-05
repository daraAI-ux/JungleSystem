import React, {useMemo, useRef, useState} from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraSeoRankingsController} from '../hooks/use-kolam-dara-seo-rankings-controller';
import {KolamButton} from './kolam-button';
import {KolamRefreshButton} from './kolam-refresh-button';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamTableFilterTrigger} from './kolam-table-filter-trigger';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';

export function KolamDaraSeoRankingsBody({
  canDraft,
  controller,
}: {
  canDraft: boolean;
  controller: KolamDaraSeoRankingsController;
}) {
  const toolbarRef = useRef<View>(null);
  const brandTriggerRef = useRef<View>(null);
  const [brandPanelOpen, setBrandPanelOpen] = useState(false);
  const [panelAnchor, setPanelAnchor] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const brandOptions = useMemo(
    () => [
      {label: 'Semua merek', value: 'all'},
      ...controller.brands.map(brand => ({
        label: brand.name,
        value: brand.id,
      })),
    ],
    [controller.brands],
  );
  const brandLabel =
    brandOptions.find(option => option.value === controller.brandId)?.label ??
    'Merek';

  const openBrandPanel = () => {
    if (brandPanelOpen) {
      setBrandPanelOpen(false);
      return;
    }
    brandTriggerRef.current?.measureInWindow((x, y, _w, h) => {
      toolbarRef.current?.measureInWindow((tx, ty) => {
        setPanelAnchor({top: y - ty + h + 4, left: Math.max(0, x - tx)});
        setBrandPanelOpen(true);
      });
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <View ref={toolbarRef} collapsable={false} style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              {brandOptions.length > 1 ? (
                <View ref={brandTriggerRef} collapsable={false}>
                  <KolamTableFilterTrigger
                    active={brandPanelOpen || controller.brandId !== 'all'}
                    label={brandLabel}
                    onPress={openBrandPanel}
                    open={brandPanelOpen}
                    variant="quiet"
                  />
                </View>
              ) : null}
              <TextInput
                onChangeText={controller.onSetKeywordInput}
                placeholder="Filter keyword (kosong = semua)"
                placeholderTextColor={V.colors.mutedFg}
                style={styles.keywordInput}
                value={controller.keywordInput}
              />
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              <KolamRefreshButton
                accessibilityLabel="Muat ulang"
                disabled={controller.loading}

                onPress={() => {
                  void controller.onRefresh();
                }}
              />
              {canDraft ? (
                <KolamButton
                  disabled={
                    controller.fetchBusy || !controller.keywordInput.trim()
                  }
                  intent="primary"
                  label={controller.fetchBusy ? 'Mengambil…' : 'Fetch & simpan'}
                  onPress={() => {
                    void controller.onFetchKeyword();
                  }}
                />
              ) : null}
            </View>
          </View>
        </View>
        {brandPanelOpen && panelAnchor ? (
          <View
            style={[
              styles.filterOverlayPanel,
              {top: panelAnchor.top, left: panelAnchor.left},
            ]}>
            <ScrollView
              contentContainerStyle={styles.filterPanelContent}
              keyboardShouldPersistTaps="handled"
              style={styles.filterPanelScroll}>
              {brandOptions.map(option => (
                <KolamButton
                  intent={
                    controller.brandId === option.value ? 'primary' : 'plain'
                  }
                  key={option.value}
                  label={option.label}
                  onPress={() => {
                    controller.onSetBrandId(option.value);
                    setBrandPanelOpen(false);
                  }}
                  style={styles.filterPanelOption}
                />
              ))}
            </ScrollView>
            <View style={styles.filterPanelFooter}>
              <KolamButton
                label="Tutup"
                onPress={() => setBrandPanelOpen(false)}
              />
            </View>
          </View>
        ) : null}
      </View>

      {controller.notice ? (
        <Text style={styles.notice}>{controller.notice}</Text>
      ) : null}
      <Text style={styles.meta}>{`${controller.total} baris di database`}</Text>

      {controller.loading && !controller.rows.length ? (
        <Text style={styles.meta}>Memuat…</Text>
      ) : null}
      {controller.error && !controller.rows.length ? (
        <KolamEmptyState message={controller.error} title="Gagal memuat" />
      ) : null}
      {!controller.loading && !controller.error && !controller.rows.length ? (
        <KolamEmptyState
          message="Isi keyword lalu «Fetch & simpan», atau jalankan cron SERP di Pengaturan AI-Tools."
          title="Belum ada ranking tersimpan"
        />
      ) : null}

      {controller.rows.map(row => (
        <View key={row.id} style={styles.row}>
          <Text style={styles.rowTitle}>
            {`${row.position ?? '—'} · ${row.keyword}`}
          </Text>
          <Text style={styles.rowMeta}>{`${row.engine} · ${
            row.mentionedAt
              ? new Date(row.mentionedAt).toLocaleString('id-ID')
              : '—'
          }`}</Text>
          <Text numberOfLines={1} style={styles.rowUrl}>
            {row.url || '—'}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1},
  content: {gap: 10, paddingBottom: 24},
  toolbarWrap: {
    elevation: 1000,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
  },
  keywordInput: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.fg,
    flexGrow: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    minWidth: 160,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filterOverlayPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 1200,
    maxWidth: 280,
    padding: 6,
    position: 'absolute',
    width: 240,
    zIndex: 120000,
  },
  filterPanelScroll: {maxHeight: 280},
  filterPanelContent: {gap: 4},
  filterPanelOption: {justifyContent: 'flex-start'},
  filterPanelFooter: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    marginTop: 4,
    paddingTop: 4,
  },
  notice: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  meta: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  row: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  rowTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  rowMeta: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 11},
  rowUrl: {color: V.colors.primary, fontFamily: V.fontFamily, fontSize: 12},
});
