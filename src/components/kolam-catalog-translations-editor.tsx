import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  KOLAM_CATALOG_DEFAULT_LOCALE,
  KOLAM_CATALOG_LOCALE_LABELS,
  KOLAM_CATALOG_LOCALES,
  patchKolamLocaleBlock,
  type KolamCatalogLocale,
  type KolamCatalogTranslationsMap,
  type KolamCategoryLocaleFields,
  type KolamCustomFieldLocaleFields,
  type KolamTaxonomyLocaleFields,
} from '../domain/kolam-catalog-locale';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamButton } from './kolam-button';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamTipTapRichTextEditor } from './kolam-tiptap-rich-text-editor';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';

type CategoryPrimaryBinding = {
  name: string;
  description: string;
  onChange: (patch: Partial<KolamCategoryLocaleFields>) => void;
};

type TaxonomyPrimaryBinding = {
  name: string;
  description: string;
  onChange: (patch: Partial<KolamTaxonomyLocaleFields>) => void;
};

type CustomFieldPrimaryBinding = {
  fieldLabel: string;
  description: string;
  optionsText: string;
  onChange: (
    patch: Partial<
      Pick<KolamCustomFieldLocaleFields, 'fieldLabel' | 'description'> & {
        optionsText: string;
      }
    >,
  ) => void;
};

type Props =
  | {
      editable?: boolean;
      kind: 'category';
      onChange: (
        translations: KolamCatalogTranslationsMap<KolamCategoryLocaleFields>,
      ) => void;
      primary: CategoryPrimaryBinding;
      translations?: KolamCatalogTranslationsMap<KolamCategoryLocaleFields>;
    }
  | {
      editable?: boolean;
      kind: 'taxonomy';
      onChange: (
        translations: KolamCatalogTranslationsMap<KolamTaxonomyLocaleFields>,
      ) => void;
      primary: TaxonomyPrimaryBinding;
      translations?: KolamCatalogTranslationsMap<KolamTaxonomyLocaleFields>;
    }
  | {
      editable?: boolean;
      kind: 'custom-field';
      onChange: (
        translations: KolamCatalogTranslationsMap<KolamCustomFieldLocaleFields>,
      ) => void;
      primary: CustomFieldPrimaryBinding;
      showOptions?: boolean;
      translations?: KolamCatalogTranslationsMap<KolamCustomFieldLocaleFields>;
    };

export function KolamCatalogTranslationsEditor(props: Props) {
  const [activeLocale, setActiveLocale] = React.useState<KolamCatalogLocale>(
    KOLAM_CATALOG_DEFAULT_LOCALE,
  );
  const editable = props.editable ?? true;

  return (
    <View style={styles.stack}>
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text:
              props.kind === 'custom-field'
                ? 'Konten Field'
                : 'Konten Marketplace',
            style: styles.title,
          },
          {
            id: 'hint',
            text:
              props.kind === 'custom-field'
                ? 'Indonesia disimpan sebagai field utama. Bahasa lain dipakai webstore dan CS agent bila tersedia.'
                : 'Indonesia disimpan sebagai field utama. Bahasa lain fallback ke Indonesia bila kosong.',
            style: styles.hint,
          },
        ]}
      />
      <View style={styles.localeTabs}>
        {KOLAM_CATALOG_LOCALES.map(locale => (
          <KolamButton
            intent={activeLocale === locale ? 'primary' : 'outline'}
            key={locale}
            label={KOLAM_CATALOG_LOCALE_LABELS[locale]}
            onPress={() => setActiveLocale(locale)}
            style={styles.localeButton}
          />
        ))}
      </View>
      {props.kind === 'category' ? (
        <CategoryLocaleFields
          editable={editable}
          locale={activeLocale}
          onChange={props.onChange}
          primary={props.primary}
          translations={props.translations}
        />
      ) : props.kind === 'taxonomy' ? (
        <TaxonomyLocaleFields
          editable={editable}
          locale={activeLocale}
          onChange={props.onChange}
          primary={props.primary}
          translations={props.translations}
        />
      ) : (
        <CustomFieldLocaleFields
          editable={editable}
          locale={activeLocale}
          onChange={props.onChange}
          primary={props.primary}
          showOptions={props.showOptions ?? false}
          translations={props.translations}
        />
      )}
    </View>
  );
}

function CategoryLocaleFields({
  editable,
  locale,
  onChange,
  primary,
  translations,
}: {
  editable: boolean;
  locale: KolamCatalogLocale;
  onChange: (
    translations: KolamCatalogTranslationsMap<KolamCategoryLocaleFields>,
  ) => void;
  primary: CategoryPrimaryBinding;
  translations?: KolamCatalogTranslationsMap<KolamCategoryLocaleFields>;
}) {
  const isPrimary = locale === KOLAM_CATALOG_DEFAULT_LOCALE;
  const block = isPrimary ? primary : translations?.[locale] ?? {};

  return (
    <View style={settingsWebFormStyles.settingsWebFormFieldsGrid}>
      <View style={settingsWebFormStyles.settingsWebFormField}>
        <KolamFormTextField
          editable={editable}
          onChangeText={name => {
            if (isPrimary) {
              primary.onChange({ name });
              return;
            }

            onChange(patchKolamLocaleBlock(translations, locale, { name }));
          }}
          placeholder="Nama kategori"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={block.name ?? ''}
        />
      </View>
      <View style={settingsWebFormStyles.settingsWebFormField}>
        <KolamTipTapRichTextEditor
          editable={editable}
          onChangeText={description => {
            if (isPrimary) {
              primary.onChange({ description });
              return;
            }

            onChange(
              patchKolamLocaleBlock(translations, locale, { description }),
            );
          }}
          placeholder="Deskripsi kategori"
          value={block.description ?? ''}
        />
      </View>
    </View>
  );
}

function TaxonomyLocaleFields({
  editable,
  locale,
  onChange,
  primary,
  translations,
}: {
  editable: boolean;
  locale: KolamCatalogLocale;
  onChange: (
    translations: KolamCatalogTranslationsMap<KolamTaxonomyLocaleFields>,
  ) => void;
  primary: TaxonomyPrimaryBinding;
  translations?: KolamCatalogTranslationsMap<KolamTaxonomyLocaleFields>;
}) {
  const isPrimary = locale === KOLAM_CATALOG_DEFAULT_LOCALE;
  const block = isPrimary ? primary : translations?.[locale] ?? {};

  return (
    <View style={settingsWebFormStyles.settingsWebFormFieldsGrid}>
      <View style={settingsWebFormStyles.settingsWebFormField}>
        <KolamFormTextField
          editable={editable}
          onChangeText={name => {
            if (isPrimary) {
              primary.onChange({ name });
              return;
            }

            onChange(patchKolamLocaleBlock(translations, locale, { name }));
          }}
          placeholder="Nama taksonomi"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={block.name ?? ''}
        />
      </View>
      <View style={settingsWebFormStyles.settingsWebFormField}>
        <KolamTipTapRichTextEditor
          editable={editable}
          onChangeText={description => {
            if (isPrimary) {
              primary.onChange({ description });
              return;
            }

            onChange(
              patchKolamLocaleBlock(translations, locale, { description }),
            );
          }}
          placeholder="Deskripsi taksonomi"
          value={block.description ?? ''}
        />
      </View>
    </View>
  );
}
function CustomFieldLocaleFields({
  editable,
  locale,
  onChange,
  primary,
  showOptions,
  translations,
}: {
  editable: boolean;
  locale: KolamCatalogLocale;
  onChange: (
    translations: KolamCatalogTranslationsMap<KolamCustomFieldLocaleFields>,
  ) => void;
  primary: CustomFieldPrimaryBinding;
  showOptions: boolean;
  translations?: KolamCatalogTranslationsMap<KolamCustomFieldLocaleFields>;
}) {
  const isPrimary = locale === KOLAM_CATALOG_DEFAULT_LOCALE;
  const block = translations?.[locale] ?? {};
  const labelValue = isPrimary ? primary.fieldLabel : block.fieldLabel ?? '';
  const descriptionValue = isPrimary
    ? primary.description
    : block.description ?? '';
  const optionsValue = isPrimary
    ? primary.optionsText
    : (block.options ?? []).join(', ');

  return (
    <View style={settingsWebFormStyles.settingsWebFormFieldsGrid}>
      <View style={settingsWebFormStyles.settingsWebFormField}>
        <KolamFormTextField
          editable={editable}
          onChangeText={fieldLabel => {
            if (isPrimary) {
              primary.onChange({ fieldLabel });
              return;
            }

            onChange(
              patchKolamLocaleBlock(translations, locale, { fieldLabel }),
            );
          }}
          placeholder="Label field"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={labelValue}
        />
      </View>
      <View style={settingsWebFormStyles.settingsWebFormField}>
        <KolamFormTextField
          editable={editable}
          multiline
          onChangeText={description => {
            if (isPrimary) {
              primary.onChange({ description });
              return;
            }

            onChange(
              patchKolamLocaleBlock(translations, locale, { description }),
            );
          }}
          placeholder="Deskripsi"
          style={[
            settingsWebFormStyles.settingsWebFormFieldValue,
            styles.textArea,
          ]}
          value={descriptionValue}
        />
      </View>
      {showOptions ? (
        <View style={settingsWebFormStyles.settingsWebFormField}>
          <KolamFormTextField
            editable={editable}
            multiline
            onChangeText={optionsText => {
              if (isPrimary) {
                primary.onChange({ optionsText });
                return;
              }

              onChange(
                patchKolamLocaleBlock(translations, locale, {
                  options: parseOptionsText(optionsText),
                }),
              );
            }}
            placeholder={
              isPrimary
                ? 'Satu opsi per baris atau pisahkan dengan koma'
                : 'Opsi terjemahan, urutan mengikuti Indonesia'
            }
            style={[
              settingsWebFormStyles.settingsWebFormFieldValue,
              styles.textArea,
            ]}
            value={optionsValue}
          />
        </View>
      ) : null}
    </View>
  );
}

function parseOptionsText(value: string) {
  return value
    .split(/[\n,]/g)
    .map(option => option.trim())
    .filter(Boolean);
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  title: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '900',
  },
  hint: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  localeTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  localeButton: {
    minWidth: 96,
  },
  textArea: {
    minHeight: 86,
    textAlignVertical: 'top',
  },
});


