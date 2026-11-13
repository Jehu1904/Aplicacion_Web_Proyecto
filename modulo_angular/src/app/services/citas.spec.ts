import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { CitasService } from './citas';

describe('CitasService', () => {
  let service: CitasService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CitasService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('refreshes the appointment and rejects a save based on a stale status', async () => {
    localStorage.setItem('supabase_url', 'https://example.supabase.co');
    localStorage.setItem('supabase_key', 'public-test-key');
    localStorage.setItem('token', 'test-token');

    const makeAppointment = (status: string) => ({
      id: 'appointment-1',
      client_name: 'Test client',
      appointment_date: '2026-11-12',
      artist: 'Test artist',
      style: 'Blackwork',
      body_area: 'Arm',
      status,
      price: 100,
      notes: null,
      size_cm: 10,
      tattoo_reference_path: null,
      catalog_design_id: null,
      catalog_image_url: null,
      payment_receipt_path: null,
      ai_analysis: null,
      original_price: null,
      payment_verified_at: null,
      user_id: 'test-user'
    });
    const listResponse = (status: string) => new Response(JSON.stringify([makeAppointment(status)]), { status: 200 });
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(listResponse('pendiente'))
      .mockResolvedValueOnce(new Response('false', { status: 200 }))
      .mockResolvedValueOnce(listResponse('completada'));

    await service.cargarCitasRemotas();
    const staleCopy = { ...service.citas()[0], estado: 'Confirmada' };

    await expect(service.actualizarCita(staleCopy)).rejects.toThrow(
      'Otra persona modificó esta cita. Se actualizó el listado'
    );

    expect(JSON.parse(String(fetchSpy.mock.calls[1][1]?.body)).p_expected_status).toBe('pendiente');
    expect(service.citas()[0].estado).toBe('Completada');
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });
});
