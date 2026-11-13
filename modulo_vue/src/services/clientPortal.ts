import { SUPABASE_KEY, getAuthenticatedSupabaseClient, supabase } from '../../../lib/supabase';

export const AUTO_ASSIGN_ARTIST = '__AUTO_ASSIGN__';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  avatar_scale: number;
  avatar_position_x: number;
  avatar_position_y: number;
}

export interface Appointment {
  id: string;
  client_name: string;
  artist: string;
  style: string;
  appointment_date: string;
  start_time: string | null;
  duration_minutes: number;
  body_area: string;
  size_cm: number | null;
  notes: string | null;
  price: number;
  status: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  tattoo_reference_path: string | null;
  catalog_design_id: string | null;
  catalog_image_url: string | null;
  payment_receipt_path: string | null;
  ai_analysis: TattooAnalysis | null;
  original_price: number | null;
  discount_code_id: string | null;
  payment_verified_at: string | null;
}

export interface TattooAnalysis {
  style: string;
  colors: string[];
  lineDetail: 'simple' | 'medio' | 'alto';
  shading: 'ninguno' | 'medio' | 'alto';
  complexity: 'simple' | 'media' | 'alta' | 'muy_alta';
  elements: string[];
  explanation: string;
}

export interface PaymentSettings {
  bank_name: string;
  account_holder: string;
  account_type: string;
  account_number: string;
  account_id_number: string;
  deposit_amount: number | null;
}

export interface AppointmentMessage {
  id: string;
  appointment_id: string;
  sender_id: string;
  sender_role: 'cliente' | 'admin';
  body: string;
  created_at: string;
}

export interface Artist {
  id: string;
  name: string;
}

async function currentUser() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session) throw new Error('Tu sesión ha expirado. Inicia sesión nuevamente.');

  localStorage.setItem('token', data.session.access_token);
  return {
    id: data.session.user.id,
    email: data.session.user.email ?? '',
    user_metadata: data.session.user.user_metadata
  };
}

export async function getProfile(): Promise<UserProfile> {
  const user = await currentUser();
  const { data, error } = await getAuthenticatedSupabaseClient()
    .from('profiles')
    .select('id, email, full_name, phone, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;
  if (data) {
    return {
      ...data,
      avatar_scale: 1,
      avatar_position_x: 50,
      avatar_position_y: 50
    } as UserProfile;
  }

  const profile: UserProfile = {
    id: user.id,
    email: user.email ?? '',
    full_name: typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name : null,
    phone: typeof user.user_metadata.phone === 'string' ? user.user_metadata.phone : null,
    avatar_url: null,
    avatar_scale: 1,
    avatar_position_x: 50,
    avatar_position_y: 50
  };
  const { error: createError } = await getAuthenticatedSupabaseClient().from('profiles').insert({
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    phone: profile.phone,
    avatar_url: profile.avatar_url
  });
  if (createError) throw createError;
  return profile;
}

export async function saveProfile(profile: Pick<UserProfile, 'full_name' | 'phone' | 'avatar_url' | 'avatar_scale' | 'avatar_position_x' | 'avatar_position_y'>): Promise<void> {
  const user = await currentUser();
  const client = getAuthenticatedSupabaseClient();
  const { error } = await client.from('profiles').upsert({
    id: user.id,
    email: user.email ?? '',
    full_name: profile.full_name,
    phone: profile.phone,
    avatar_url: profile.avatar_url,
    updated_at: new Date().toISOString()
  });
  if (error) throw error;

  await client.from('profiles').update({
    avatar_scale: profile.avatar_scale,
    avatar_position_x: profile.avatar_position_x,
    avatar_position_y: profile.avatar_position_y
  }).eq('id', user.id);
}

export async function uploadAvatar(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Selecciona una imagen válida.');
  if (file.size > 2 * 1024 * 1024) throw new Error('La foto no debe superar 2 MB.');

  const user = await currentUser();
  const extension = file.name.split('.').pop() || 'jpg';
  const path = `${user.id}/avatar-${Date.now()}.${extension}`;
  const client = getAuthenticatedSupabaseClient();
  const { error } = await client.storage.from('avatars').upload(path, file, { upsert: true });
  if (error) throw error;

  return client.storage.from('avatars').getPublicUrl(path).data.publicUrl;
}

export async function analyzeTattooDesign(
  file: File | null,
  imageUrl: string | null,
  style: string,
  sizeCm: number,
  bodyArea: string
): Promise<TattooAnalysis> {
  if (!file && !imageUrl) throw new Error('Selecciona una foto o un diseño del catálogo.');
  let imageBase64: string | undefined;
  if (file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(offset, Math.min(offset + 0x8000, bytes.length)));
    }
    imageBase64 = btoa(binary);
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error(sessionError.message || 'No se pudo validar la sesión.');
  const accessToken = sessionData.session?.access_token ?? localStorage.getItem('token');
  if (!accessToken) throw new Error('Inicia sesión para poder analizar la imagen.');

  const { data, error } = await getAuthenticatedSupabaseClient().functions.invoke('analyze-tattoo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: SUPABASE_KEY
    },
    body: {
      imageBase64,
      imageUrl: file ? undefined : imageUrl,
      mediaType: file?.type,
      style,
      sizeCm,
      bodyArea
    }
  });
  if (error) throw new Error(error.message || 'No se pudo analizar la imagen.');
  if (!data || typeof data.complexity !== 'string' || !Array.isArray(data.colors)) {
    throw new Error('El servicio de análisis devolvió datos incompletos.');
  }
  return data as TattooAnalysis;
}

export async function getMyAppointments(): Promise<Appointment[]> {
  const user = await currentUser();
  const { data, error } = await getAuthenticatedSupabaseClient()
    .from('appointments')
    .select('id, client_name, artist, style, appointment_date, start_time, duration_minutes, body_area, size_cm, notes, price, status, tattoo_reference_path, catalog_design_id, catalog_image_url, payment_receipt_path, ai_analysis, original_price, discount_code_id, payment_verified_at')
    .eq('user_id', user.id)
    .order('appointment_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Appointment[];
}

export async function getCompletedAppointmentsForAdmin(): Promise<Appointment[]> {
  const { data, error } = await getAuthenticatedSupabaseClient().rpc('get_completed_appointments_for_admin');
  if (error) throw error;
  return (data ?? []) as Appointment[];
}

export async function getArtistSchedule(artist: string, date: string): Promise<Array<{ start_time: string; duration_minutes: number }>> {
  if (!artist.trim() || !date) return [];
  const { data, error } = await getAuthenticatedSupabaseClient().rpc('get_artist_schedule', {
    p_artist: artist.trim(),
    p_date: date
  });
  if (error) throw error;
  return (data ?? []) as Array<{ start_time: string; duration_minutes: number }>;
}

export async function getActiveArtists(): Promise<Artist[]> {
  const { data, error } = await getAuthenticatedSupabaseClient()
    .from('artists')
    .select('id, name')
    .eq('active', true)
    .order('name');
  if (error) throw error;
  return (data ?? []) as Artist[];
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const { data, error } = await getAuthenticatedSupabaseClient()
    .from('studio_payment_settings')
    .select('bank_name, account_holder, account_type, account_number, account_id_number, deposit_amount')
    .eq('id', true)
    .single();
  if (error) throw error;
  return data as PaymentSettings;
}

async function validateUpload(file: File, acceptedTypes: string[], label: string): Promise<void> {
  if (!acceptedTypes.includes(file.type)) throw new Error(`El archivo de ${label} tiene un formato no permitido.`);
  if (file.size > 5 * 1024 * 1024) throw new Error(`El archivo de ${label} no debe superar 5 MB.`);
}

export async function createAppointment(
  appointment: Omit<Appointment, 'id' | 'status' | 'tattoo_reference_path' | 'payment_receipt_path' | 'payment_verified_at'> & {
    tattoo_reference_path?: string | null;
    payment_receipt_path?: string | null;
    payment_verified_at?: string | null;
    status?: Appointment['status'];
  },
  referenceImage: File | null,
  paymentReceipt: File | null
): Promise<{ assignedArtist: string | null }> {
  const user = await currentUser();
  const isAdmin = localStorage.getItem('user_role') === 'admin';
  const assignFairly = !isAdmin && appointment.artist === AUTO_ASSIGN_ARTIST;
  if (!isAdmin && !referenceImage && !appointment.catalog_design_id) {
    throw new Error('Adjunta una foto del diseño o elige uno del catálogo.');
  }
  if (!isAdmin && !paymentReceipt) throw new Error('Adjunta el comprobante del abono.');
  if (paymentReceipt) await validateUpload(paymentReceipt, ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'], 'comprobante');
  if (referenceImage) await validateUpload(referenceImage, ['image/jpeg', 'image/png', 'image/webp'], 'diseño');

  const client = getAuthenticatedSupabaseClient();
  const appointmentId = crypto.randomUUID();
  const uploadedPaths: string[] = [];

  try {
    const upload = async (file: File, kind: 'reference' | 'receipt'): Promise<string> => {
      const extension = file.type === 'application/pdf' ? 'pdf' : file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
      const path = `${user.id}/${appointmentId}/${kind}.${extension}`;
      const { error } = await client.storage.from('tattoo-attachments').upload(path, file);
      if (error) throw error;
      uploadedPaths.push(path);
      return path;
    };

    const referencePath = referenceImage ? await upload(referenceImage, 'reference') : null;
    const receiptPath = paymentReceipt ? await upload(paymentReceipt, 'receipt') : null;
    let assignedArtist: string | null = null;
    if (assignFairly) {
      const { data, error } = await client.rpc('create_appointment_with_fair_artist', {
        p_id: appointmentId,
        p_client_name: appointment.client_name,
        p_style: appointment.style,
        p_appointment_date: appointment.appointment_date,
        p_start_time: appointment.start_time,
        p_duration_minutes: appointment.duration_minutes,
        p_price: appointment.price,
        p_body_area: appointment.body_area,
        p_size_cm: appointment.size_cm,
        p_notes: appointment.notes,
        p_tattoo_reference_path: referencePath,
        p_catalog_design_id: appointment.catalog_design_id,
        p_catalog_image_url: appointment.catalog_image_url,
        p_payment_receipt_path: receiptPath,
        p_ai_analysis: appointment.ai_analysis
      });
      if (error) throw error;
      if (typeof data !== 'string' || !data.trim()) {
        throw new Error('No se pudo confirmar qué tatuador fue asignado a la cita.');
      }
      assignedArtist = data;
    } else {
      const { error } = await client.from('appointments').insert({
        id: appointmentId,
        user_id: user.id,
        ...appointment,
        tattoo_reference_path: referencePath,
        payment_receipt_path: receiptPath,
        payment_verified_at: null,
        status: appointment.status ?? 'pendiente'
      });
      if (error) throw error;
    }
    return { assignedArtist };
  } catch (error) {
    if (uploadedPaths.length) {
      const { error: cleanupError } = await client.storage.from('tattoo-attachments').remove(uploadedPaths);
      if (cleanupError) {
        throw new Error(`No se pudo guardar la cita y no se pudieron eliminar los archivos cargados: ${cleanupError.message}`);
      }
    }
    throw error;
  }
}

export async function getAppointmentMessages(appointmentId: string): Promise<AppointmentMessage[]> {
  const { data, error } = await getAuthenticatedSupabaseClient()
    .from('appointment_messages')
    .select('id, appointment_id, sender_id, sender_role, body, created_at')
    .eq('appointment_id', appointmentId)
    .order('created_at');
  if (error) throw error;
  return (data ?? []) as AppointmentMessage[];
}

export async function sendAppointmentMessage(appointmentId: string, body: string, senderRole: 'cliente' | 'admin'): Promise<void> {
  const user = await currentUser();
  const { error } = await getAuthenticatedSupabaseClient().from('appointment_messages').insert({
    appointment_id: appointmentId,
    sender_id: user.id,
    sender_role: senderRole,
    body: body.trim()
  });
  if (error) throw error;
}

export async function applyAppointmentDiscount(appointmentId: string, code: string): Promise<{ original_price: number; final_price: number }> {
  const { data, error } = await getAuthenticatedSupabaseClient().rpc('apply_discount_code', {
    p_appointment_id: appointmentId,
    p_code: code.trim()
  });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  if (!result) throw new Error('No se pudo aplicar el código de descuento.');
  return result as { original_price: number; final_price: number };
}

export async function cancelMyAppointment(appointmentId: string): Promise<void> {
  const { error } = await getAuthenticatedSupabaseClient().rpc('cancel_appointment_for_client', {
    p_id: appointmentId
  });
  if (error) throw error;
}

export async function getAppointmentFileUrl(path: string): Promise<string> {
  const { data, error } = await getAuthenticatedSupabaseClient()
    .storage.from('tattoo-attachments')
    .createSignedUrl(path, 60 * 10);
  if (error) throw error;
  return data.signedUrl;
}