import React from 'react';
import { render, screen } from '@testing-library/react';
import { StarSystem3D } from '@/components/scientific/StarSystem3D';
import { StarSystemData } from '@/types';

// Mock Three.js
jest.mock('three', () => ({
  Scene: jest.fn(() => ({ add: jest.fn() })),
  PerspectiveCamera: jest.fn(),
  WebGLRenderer: jest.fn(() => ({
    setSize: jest.fn(),
    render: jest.fn(),
    domElement: document.createElement('canvas')
  })),
  SphereGeometry: jest.fn(),
  MeshBasicMaterial: jest.fn(),
  MeshStandardMaterial: jest.fn(),
  Mesh: jest.fn(() => ({ position: { x: 0, y: 0, z: 0 } })),
  AmbientLight: jest.fn(),
  PointLight: jest.fn(() => ({ position: { set: jest.fn() } }))
}));

const mockStarSystem: StarSystemData = {
  star: {
    name: 'Sol',
    radius: 1.0,
    color: '#FFD700'
  },
  planets: [
    {
      id: 'earth',
      name: 'Earth',
      radius: 1.0,
      distance: 1.0,
      mass: 1.0,
      color: '#1E90FF',
      orbitalPeriod: 1.0
    }
  ]
};

describe('StarSystem3D', () => {
  it('renders without crashing', () => {
    render(
      <StarSystem3D
        systemData={mockStarSystem}
        viewMode="orbital"
        autoRotate={true}
      />
    );
    
    const container = document.querySelector('[class*="w-full"]');
    expect(container).toBeInTheDocument();
  });
});