import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ArtistCard from './ArtistCard';

// Helper function to render component with Router wrapper
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ArtistCard Component', () => {
  // Sample test data
  const mockArtist = {
    _id: '507f1f77bcf86cd799439011',
    name: 'The Midnight',
    genre: 'Synthwave',
    label: 'Counter Records'
  };

  describe('Rendering', () => {
    test('renders without crashing with valid props', () => {
      renderWithRouter(
        <ArtistCard
          _id={mockArtist._id}
          name={mockArtist.name}
          genre={mockArtist.genre}
          label={mockArtist.label}
        />
      );

      expect(screen.getByText(mockArtist.name)).toBeInTheDocument();
    });

    test('displays artist name correctly', () => {
      renderWithRouter(
        <ArtistCard
          _id={mockArtist._id}
          name={mockArtist.name}
          genre={mockArtist.genre}
          label={mockArtist.label}
        />
      );

      // Name should be in bold
      const nameElement = screen.getByText(mockArtist.name);
      expect(nameElement).toBeInTheDocument();
      expect(nameElement.tagName).toBe('B');
    });

    test('displays genre correctly', () => {
      renderWithRouter(
        <ArtistCard
          _id={mockArtist._id}
          name={mockArtist.name}
          genre={mockArtist.genre}
          label={mockArtist.label}
        />
      );

      expect(screen.getByText(mockArtist.genre)).toBeInTheDocument();
    });

    test('displays label correctly', () => {
      renderWithRouter(
        <ArtistCard
          _id={mockArtist._id}
          name={mockArtist.name}
          genre={mockArtist.genre}
          label={mockArtist.label}
        />
      );

      // Label should be in bold
      const labelElement = screen.getByText(mockArtist.label);
      expect(labelElement).toBeInTheDocument();
      expect(labelElement.tagName).toBe('B');
    });

    test('displays placeholder image with correct src', () => {
      renderWithRouter(
        <ArtistCard
          _id={mockArtist._id}
          name={mockArtist.name}
          genre={mockArtist.genre}
          label={mockArtist.label}
        />
      );

      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', './images/placeholder.png');
    });

    test('displays "More Info" link with correct text', () => {
      renderWithRouter(
        <ArtistCard
          _id={mockArtist._id}
          name={mockArtist.name}
          genre={mockArtist.genre}
          label={mockArtist.label}
        />
      );

      const link = screen.getByRole('link', { name: /more info/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveTextContent('More Info');
    });
  });

  describe('Navigation', () => {
    test('More Info link routes to correct artist detail page', () => {
      renderWithRouter(
        <ArtistCard
          _id={mockArtist._id}
          name={mockArtist.name}
          genre={mockArtist.genre}
          label={mockArtist.label}
        />
      );

      const link = screen.getByRole('link', { name: /more info/i });
      expect(link).toHaveAttribute('href', `/artist/${mockArtist._id}`);
    });

    test('link is accessible and properly labeled', () => {
      renderWithRouter(
        <ArtistCard
          _id={mockArtist._id}
          name={mockArtist.name}
          genre={mockArtist.genre}
          label={mockArtist.label}
        />
      );

      const link = screen.getByRole('link', { name: /more info/i });
      expect(link).toBeVisible();
      expect(link.className).toContain('button');
    });
  });

  describe('Props Handling', () => {
    test('handles different artist names correctly', () => {
      const artists = [
        'Metallica',
        'LCD Soundsystem',
        'Flying Lotus',
        'A$AP Rocky'
      ];

      artists.forEach(artistName => {
        const { unmount } = renderWithRouter(
          <ArtistCard
            _id="123"
            name={artistName}
            genre="Various"
            label="Various"
          />
        );

        expect(screen.getByText(artistName)).toBeInTheDocument();
        unmount();
      });
    });

    test('handles different genres correctly', () => {
      renderWithRouter(
        <ArtistCard
          _id={mockArtist._id}
          name={mockArtist.name}
          genre="Electronic / Dance"
          label={mockArtist.label}
        />
      );

      expect(screen.getByText('Electronic / Dance')).toBeInTheDocument();
    });

    test('handles different record labels correctly', () => {
      renderWithRouter(
        <ArtistCard
          _id={mockArtist._id}
          name={mockArtist.name}
          genre={mockArtist.genre}
          label="Warner Music Group"
        />
      );

      expect(screen.getByText('Warner Music Group')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles special characters in artist name', () => {
      renderWithRouter(
        <ArtistCard
          _id="123"
          name="Sigur Rós"
          genre="Post-Rock"
          label="XL Recordings"
        />
      );

      expect(screen.getByText('Sigur Rós')).toBeInTheDocument();
    });

    test('handles ampersands and special characters in genre', () => {
      renderWithRouter(
        <ArtistCard
          _id="123"
          name="Test Artist"
          genre="Rock & Roll"
          label="Test Label"
        />
      );

      expect(screen.getByText('Rock & Roll')).toBeInTheDocument();
    });

    test('handles very long artist names', () => {
      const longName = 'Godspeed You! Black Emperor and the Very Long Artist Name';
      
      renderWithRouter(
        <ArtistCard
          _id="123"
          name={longName}
          genre="Post-Rock"
          label="Constellation Records"
        />
      );

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    test('handles empty string for genre', () => {
      renderWithRouter(
        <ArtistCard
          _id={mockArtist._id}
          name={mockArtist.name}
          genre=""
          label={mockArtist.label}
        />
      );

      // Component should still render, genre section should be empty
      expect(screen.getByText(mockArtist.name)).toBeInTheDocument();
    });

    test('handles empty string for label', () => {
      renderWithRouter(
        <ArtistCard
          _id={mockArtist._id}
          name={mockArtist.name}
          genre={mockArtist.genre}
          label=""
        />
      );

      // Component should still render, label section should be empty
      expect(screen.getByText(mockArtist.name)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('image has alt text', () => {
      renderWithRouter(
        <ArtistCard
          _id={mockArtist._id}
          name={mockArtist.name}
          genre={mockArtist.genre}
          label={mockArtist.label}
        />
      );

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt');
      expect(image.getAttribute('alt')).toBeTruthy();
    });
  });
});