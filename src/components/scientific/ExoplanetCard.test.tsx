import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExoplanetCard } from '@/components/scientific/ExoplanetCard';
import { ExoplanetData } from '@/types';

const mockExoplanet: ExoplanetData = {
  id: '1',
  name: 'Kepler-186f',
  distance: 490,
  mass: 1.1,
  radius: 1.1,
  discoveryYear: 2014,
};

describe('ExoplanetCard', () => {
  it('renders exoplanet name', () => {
    render(<ExoplanetCard exoplanet={mockExoplanet} isSelected={false} onSelect={() => {}} />);
    expect(screen.getByText('Kepler-186f')).toBeInTheDocument();
  });

  it('renders exoplanet data', () => {
    render(<ExoplanetCard exoplanet={mockExoplanet} isSelected={false} onSelect={() => {}} />);
    expect(screen.getByText(/Distance:/)).toBeInTheDocument();
    expect(screen.getByText(/Mass:/)).toBeInTheDocument();
    expect(screen.getByText(/Radius:/)).toBeInTheDocument();
    expect(screen.getByText(/Discovered:/)).toBeInTheDocument();
  });

  it('applies selected style when isSelected is true', () => {
    const { container } = render(
      <ExoplanetCard exoplanet={mockExoplanet} isSelected={true} onSelect={() => {}} />
    );
    expect(container.firstChild).toHaveClass('border-exoplanet-green');
  });

  it('calls onSelect when clicked', () => {
    const handleSelect = jest.fn();
    render(<ExoplanetCard exoplanet={mockExoplanet} isSelected={false} onSelect={handleSelect} />);

    const card = screen.getByText('Kepler-186f').closest('div');
    fireEvent.click(card!);

    expect(handleSelect).toHaveBeenCalledWith('1');
  });
});