import {
  buildKolamChatCatalogCardContent,
  buildKolamChatCatalogCardFromProduct,
  buildKolamChatCatalogCardFromSpecies,
  effectiveKolamCatalogStock,
  hasKolamCatalogVariants,
  isKolamProductShareBody,
  kolamChatCatalogCardToShareText,
  marketplaceProductUrl,
  marketplaceSpeciesUrl,
  parseKolamLegacyProductShareText,
  pickKolamCatalogPrice,
  slugifyKolamMarketplaceSegment,
  variantKolamCatalogDisplayName,
} from '../src/domain/kolam-chat-catalog-card';
import type {KolamProduct} from '../src/domain/kolam-product';
import type {KolamSpecies} from '../src/domain/kolam-species';

describe('kolam-chat-catalog-card', () => {
  it('builds product_card and species_card payloads like the plugin', () => {
    expect(
      buildKolamChatCatalogCardContent({
        entityType: 'product',
        entityId: 'p1',
        name: 'Nemo',
        price: 85000,
        stock: 4,
        imageUrl: 'https://cdn.example/nemo.jpg',
        detailHref: 'https://dunia-anura.com/id/products/nemo',
        variantId: 'v1',
      }),
    ).toEqual({
      type: 'product_card',
      card: {
        entityId: 'p1',
        entityType: 'product',
        name: 'Nemo',
        price: 85000,
        priceLabel: 'Rp85.000',
        stock: 4,
        imageUrl: 'https://cdn.example/nemo.jpg',
        detailHref: 'https://dunia-anura.com/id/products/nemo',
        variantId: 'v1',
      },
    });

    expect(
      buildKolamChatCatalogCardContent({
        entityType: 'species',
        entityId: 's1',
        name: 'Amphiprion ocellaris',
        price: 0,
        stock: 0,
      }).type,
    ).toBe('species_card');
  });

  it('builds marketplace urls and variant labels from Kolam entities', () => {
    expect(slugifyKolamMarketplaceSegment('Nemo Clownfish')).toBe(
      'nemo-clownfish',
    );
    expect(marketplaceProductUrl('Nemo Clownfish', 'p1')).toBe(
      'https://dunia-anura.com/id/products/nemo-clownfish',
    );
    expect(marketplaceSpeciesUrl('Amphiprion ocellaris', 's1')).toBe(
      'https://dunia-anura.com/id/amphiprion-ocellaris',
    );
    expect(
      variantKolamCatalogDisplayName({
        tier1Value: 'Hitam',
        tier2Value: 'M',
      }),
    ).toBe('Hitam — M');

    const product = {
      id: 'p1',
      name: 'Nemo',
      priceToSell: 10000,
      onlinePrice: 0,
      stock: 2,
      hasVariants: false,
      variants: [],
      photoUris: [],
      thumbnailUri: '',
    } as unknown as KolamProduct;

    expect(buildKolamChatCatalogCardFromProduct(product).card.name).toBe('Nemo');
    expect(pickKolamCatalogPrice(product)).toBe(10000);
    expect(effectiveKolamCatalogStock(product)).toBe(2);
    expect(hasKolamCatalogVariants(product)).toBe(false);

    const species = {
      id: 's1',
      scientificName: 'Amphiprion ocellaris',
      displayName: 'Nemo',
      priceToSell: 0,
      onlinePrice: 12000,
      stock: 1,
      hasVariants: false,
      variants: [],
      photoUris: [],
      thumbnailUri: null,
    } as unknown as KolamSpecies;

    expect(buildKolamChatCatalogCardFromSpecies(species).type).toBe(
      'species_card',
    );
    expect(pickKolamCatalogPrice(species)).toBe(12000);
  });

  it('builds and parses team-chat [Product] share text', () => {
    const content = buildKolamChatCatalogCardContent({
      entityType: 'product',
      entityId: 'p1',
      name: 'Nemo — Hitam',
      price: 85000,
      stock: 4,
      imageUrl: 'https://cdn.example/nemo.jpg',
      detailHref: 'https://dunia-anura.com/id/products/nemo',
    });
    const share = kolamChatCatalogCardToShareText(content);
    expect(isKolamProductShareBody(share)).toBe(true);
    expect(share).toContain('[Product] Nemo — Hitam — Rp85.000 — Stok 4');
    expect(share).toContain('https://cdn.example/nemo.jpg');
    expect(share).toContain('[Link] https://dunia-anura.com/id/products/nemo');

    const parsed = parseKolamLegacyProductShareText(share);
    expect(parsed).toEqual(
      expect.objectContaining({
        name: 'Nemo — Hitam',
        priceLabel: 'Rp85.000',
        stock: 4,
        imageUrl: 'https://cdn.example/nemo.jpg',
        detailHref: 'https://dunia-anura.com/id/products/nemo',
      }),
    );
  });
});
