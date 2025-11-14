import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import RoleBadge from '../RoleBadge';

describe('RoleBadge Component', () => {
  it('should render admin badge with correct label', () => {
    render(<RoleBadge role="admin" />);
    expect(screen.getByText('Administrador')).toBeInTheDocument();
  });

  it('should render emprendedores badge with correct label', () => {
    render(<RoleBadge role="emprendedores" />);
    expect(screen.getByText('Emprendedor')).toBeInTheDocument();
  });

  it('should render usuarios_regulares badge with correct label', () => {
    render(<RoleBadge role="usuarios_regulares" />);
    expect(screen.getByText('Usuario Regular')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<RoleBadge role="admin" className="custom-class" />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('custom-class');
  });

  it('should have correct color classes for admin', () => {
    const { container } = render(<RoleBadge role="admin" />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('bg-purple-100');
    expect(badge?.className).toContain('text-purple-800');
  });

  it('should have correct color classes for emprendedores', () => {
    const { container } = render(<RoleBadge role="emprendedores" />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('bg-blue-100');
    expect(badge?.className).toContain('text-blue-800');
  });

  it('should have correct color classes for usuarios_regulares', () => {
    const { container } = render(<RoleBadge role="usuarios_regulares" />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('bg-gray-100');
    expect(badge?.className).toContain('text-gray-800');
  });
});

