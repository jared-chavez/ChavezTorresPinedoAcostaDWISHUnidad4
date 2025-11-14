import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '../ConfirmDialog';

describe('ConfirmDialog Component', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnConfirm.mockClear();
    mockOnCancel.mockClear();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={false}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('should use default confirm and cancel text', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Confirmar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('should use custom confirm and cancel text', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        confirmText="Eliminar"
        cancelText="No eliminar"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Eliminar')).toBeInTheDocument();
    expect(screen.getByText('No eliminar')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const confirmButton = screen.getByText('Confirmar');
    fireEvent.click(confirmButton);
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should apply danger styles by default', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const confirmButton = screen.getByText('Confirmar');
    expect(confirmButton.className).toContain('bg-red-600');
  });

  it('should apply warning styles when type is warning', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        type="warning"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const confirmButton = screen.getByText('Confirmar');
    expect(confirmButton.className).toContain('bg-yellow-600');
  });

  it('should apply info styles when type is info', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        type="info"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const confirmButton = screen.getByText('Confirmar');
    expect(confirmButton.className).toContain('bg-blue-600');
  });

  it('should have overlay background', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const overlay = container.querySelector('.bg-black.bg-opacity-50');
    expect(overlay).toBeInTheDocument();
  });
});

