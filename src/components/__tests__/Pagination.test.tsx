import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../Pagination';

describe('Pagination Component', () => {
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  it('should not render when totalPages is 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={mockOnPageChange} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should not render when totalPages is 0', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={0} onPageChange={mockOnPageChange} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render pagination controls when totalPages > 1', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);
    
    expect(screen.getByText('Anterior')).toBeInTheDocument();
    expect(screen.getByText('Siguiente')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should disable "Anterior" button on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);
    
    const prevButton = screen.getByText('Anterior');
    expect(prevButton).toBeDisabled();
  });

  it('should disable "Siguiente" button on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />);
    
    const nextButton = screen.getByText('Siguiente');
    expect(nextButton).toBeDisabled();
  });

  it('should call onPageChange when clicking page number', () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />);
    
    const page3Button = screen.getByText('3');
    fireEvent.click(page3Button);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
    expect(mockOnPageChange).toHaveBeenCalledTimes(1);
  });

  it('should call onPageChange when clicking "Siguiente"', () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />);
    
    const nextButton = screen.getByText('Siguiente');
    fireEvent.click(nextButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('should call onPageChange when clicking "Anterior"', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);
    
    const prevButton = screen.getByText('Anterior');
    fireEvent.click(prevButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('should highlight current page', () => {
    const { container } = render(
      <Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    const currentPageButton = screen.getByText('3');
    expect(currentPageButton.className).toContain('bg-blue-600');
    expect(currentPageButton.className).toContain('text-white');
  });

  it('should show ellipsis when there are many pages', () => {
    render(<Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />);
    
    // Should show ellipsis
    const ellipsis = screen.getAllByText('...');
    expect(ellipsis.length).toBeGreaterThan(0);
  });

  it('should show first and last page when needed', () => {
    render(<Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should limit visible pages to maxVisible (5)', () => {
    render(<Pagination currentPage={5} totalPages={20} onPageChange={mockOnPageChange} />);
    
    // Should show max 5 page numbers in the middle section
    const pageButtons = screen.getAllByRole('button').filter(
      (btn) => !isNaN(Number(btn.textContent)) && btn.textContent !== '1' && btn.textContent !== '20'
    );
    expect(pageButtons.length).toBeLessThanOrEqual(5);
  });
});

