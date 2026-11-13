import { getAuthenticatedSupabaseClient } from './supabase';

export interface CatalogDesign {
  id: string;
  name: string;
  artist: string;
  style: string;
  image_url: string;
  stage: 'hecho' | 'proximo';
}

export async function getCatalogDesigns(): Promise<CatalogDesign[]> {
  const { data, error } = await getAuthenticatedSupabaseClient()
    .from('catalog_designs')
    .select('id, name, artist, style, image_url, stage')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CatalogDesign[];
}

export async function addCatalogDesign(
  file: File,
  design: Pick<CatalogDesign, 'name' | 'artist' | 'style' | 'stage'>,
  existingId?: string
): Promise<CatalogDesign> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Elige una imagen JPG, PNG o WebP.');
  }
  if (file.size > 5 * 1024 * 1024) throw new Error('La imagen no debe superar 5 MB.');

  const client = getAuthenticatedSupabaseClient();
  const id = existingId || `p-${crypto.randomUUID()}`;
  const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
  const path = `${id}/${id}.${extension}`;
  const { error: uploadError } = await client.storage.from('tattoo-catalog').upload(path, file);
  if (uploadError) throw uploadError;

  const imageUrl = client.storage.from('tattoo-catalog').getPublicUrl(path).data.publicUrl;
  const item: CatalogDesign = { id, ...design, image_url: imageUrl };
  const { error: insertError } = await client.from('catalog_designs').insert(item);
  if (insertError) {
    const { error: cleanupError } = await client.storage.from('tattoo-catalog').remove([path]);
    if (cleanupError) {
      throw new Error(`No se guardó el diseño en el catálogo y no se pudo limpiar la imagen: ${cleanupError.message}`);
    }
    throw insertError;
  }

  return item;
}

export async function updateCatalogDesign(
  id: string,
  changes: Pick<CatalogDesign, 'name' | 'artist' | 'style'>
): Promise<void> {
  const { error } = await getAuthenticatedSupabaseClient()
    .from('catalog_designs')
    .update(changes)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteCatalogDesign(item: CatalogDesign): Promise<void> {
  const client = getAuthenticatedSupabaseClient();
  const { error } = await client.from('catalog_designs').delete().eq('id', item.id);
  if (error) throw error;

  const objectPath = item.image_url.split('/storage/v1/object/public/tattoo-catalog/')[1];
  if (objectPath) {
    const { error: removeError } = await client.storage.from('tattoo-catalog').remove([decodeURIComponent(objectPath)]);
    if (removeError) throw removeError;
  }
}
