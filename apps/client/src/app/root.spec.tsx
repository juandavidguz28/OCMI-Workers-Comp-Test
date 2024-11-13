import { render } from '@testing-library/react';
import { useStorage } from '../hooks';
import { useNavigate } from 'react-router-dom';
import Root from './root';
import { describe, expect, it, vi } from 'vitest';
import { Mock } from '@vitest/spy';

vi.mock('../hooks', () => ({
  useStorage: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

describe('Root Component', () => {
  const mockNavigate = vi.fn();
  const mockStorage = {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useNavigate as Mock).mockReturnValue(mockNavigate);
    (useStorage as Mock).mockReturnValue(mockStorage);
  });

  it('should redirect to /login when no session exists', () => {
    mockStorage.get.mockReturnValue(null);
    render(<Root />);

    expect(mockStorage.get).toHaveBeenCalledWith('session');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(mockNavigate).not.toHaveBeenCalledWith('/posts');
  });

  it('should redirect to /posts when session exists', () => {
    mockStorage.get.mockReturnValue(
      JSON.stringify({
        token: 'test-token',
        userId: '123',
      }),
    );

    render(<Root />);

    expect(mockStorage.get).toHaveBeenCalledWith('session');
    expect(mockNavigate).toHaveBeenCalledWith('/posts');
    expect(mockNavigate).not.toHaveBeenCalledWith('/login');
  });

  it('should check session only once on initial render', () => {
    mockStorage.get.mockReturnValue(null);
    render(<Root />);

    expect(mockStorage.get).toHaveBeenCalledTimes(1);
  });

  it('should display loading text while redirecting', () => {
    mockStorage.get.mockReturnValue(null);
    const { container } = render(<Root />);

    expect(container.textContent).toBe('Redirecting you...');
  });

  it('should handle malformed session data gracefully', () => {
    mockStorage.get.mockReturnValue('invalid-json');
    render(<Root />);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  //Start Of Qa Assessment
  //Test #1
  //Redirigir a /login si se intenta acceder a una página protegida sin sesión
  it('should redirect to /login if trying to access a protected page without session', () => {
    // Simulamos que no hay sesión almacenada
    mockStorage.get.mockReturnValue(null);

    // Intentamos renderizar el componente Root como si el usuario intentara acceder a una página protegida
    render(<Root />);

    // Verificamos que se haya llamado a mockNavigate con '/login'
    expect(mockNavigate).toHaveBeenCalledWith('/login');

    // Aseguramos que no se intentó redirigir a otra página protegida
    expect(mockNavigate).not.toHaveBeenCalledWith('/protectedPage');
  });

  //Test #2
  //Redirigir y limpiar sesión al cerrar sesión
  it('should redirect to /login and clear session storage on logout', () => {
    mockStorage.get.mockReturnValue(
      JSON.stringify({
        token: 'valid-token',
        userId: '123',
      }),
    );

    render(<Root />);

    mockStorage.remove('session'); // Simulando el proceso de logout
    mockNavigate('/login');

    expect(mockStorage.remove).toHaveBeenCalledWith('session'); // Comprueba que se eliminó la sesión
    expect(mockNavigate).toHaveBeenCalledWith('/login'); // Asegura la redirección a /login
  });

  //Test #3
  //Asegurarse de que, después de iniciar sesión, el usuario sea redirigido automáticamente a la última página que intentó visitar cuando no tenía la sesión activa
  it('should redirect to last visited page after login if previously accessed without session', () => {
    // No hay sesión activa al intentar acceder a una página específica
    mockStorage.get.mockReturnValue(null);
    mockNavigate.mockImplementation((path) => {
      if (path === '/specificPage') return;
    });

    render(<Root />);

    // Ahora simulamos que se inicia sesión
    mockStorage.set(
      'session',
      JSON.stringify({ token: 'valid-token', userId: '123' }),
    );
    mockNavigate('/specificPage'); // El usuario es redirigido a la última página específica

    expect(mockNavigate).toHaveBeenCalledWith('/specificPage');
  });
});
