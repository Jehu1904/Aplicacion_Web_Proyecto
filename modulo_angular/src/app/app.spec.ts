import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app';
import { AdminComponent } from './views/admin/admin';
import { CitasService } from './services/citas';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the router outlet', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should initialize the admin panel with Angular dependency injection', async () => {
    await TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Panel Administrador');
  });

  it('should search invoice appointments across their fields and include completed appointments', async () => {
    await TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminComponent);
    const component = fixture.componentInstance;
    const citasService = TestBed.inject(CitasService);
    citasService.citas.set([
      {
        id: 'appointment-1',
        cliente: 'Ana Pérez',
        fecha: '2026-11-12',
        tatuador: 'Alan',
        estilo: 'Blackwork',
        zonaCuerpo: 'Brazo',
        estado: 'Completada',
        precio: 120,
        observaciones: 'Diseño floral'
      },
      {
        id: 'appointment-2',
        cliente: 'Luis Mora',
        fecha: '2026-11-14',
        tatuador: 'Jehu Villamar',
        estilo: 'Realismo',
        zonaCuerpo: 'Espalda',
        estado: 'Pendiente',
        precio: 300,
        observaciones: ''
      }
    ]);

    component.setFacturaBusqueda('diseno floral');
    expect(component.citasParaFacturar().map(cita => cita.id)).toEqual(['appointment-1']);

    component.setFacturaBusqueda('espalda');
    expect(component.citasParaFacturar().map(cita => cita.id)).toEqual(['appointment-2']);

    component.seleccionarCitaFactura('appointment-2');
    component.setFacturaBusqueda('sin coincidencias');
    expect(component.citasParaFacturar()).toEqual([]);
    expect(component.citaFactura()).toBeNull();
  });
});
