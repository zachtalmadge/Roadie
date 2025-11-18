import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';

// Helper function to render component with Router wrapper
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Navbar Component', () => {
  describe('Rendering', () => {
    test('renders without crashing', () => {
      renderWithRouter(<Navbar />);
      
      expect(screen.getByText('Roadie')).toBeInTheDocument();
    });

    test('displays brand name "Roadie"', () => {
      renderWithRouter(<Navbar />);
      
      const brand = screen.getByText('Roadie');
      expect(brand).toBeInTheDocument();
      expect(brand.tagName).toBe('A'); // Should be a link
    });

    test('displays all navigation links', () => {
      renderWithRouter(<Navbar />);
      
      expect(screen.getByText('My Schedule')).toBeInTheDocument();
      expect(screen.getByText('Festivals')).toBeInTheDocument();
      expect(screen.getByText('Artists')).toBeInTheDocument();
    });

    test('displays action buttons', () => {
      renderWithRouter(<Navbar />);
      
      expect(screen.getByRole('button', { name: /create event/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add artist/i })).toBeInTheDocument();
    });

    test('displays mobile toggle button', () => {
      renderWithRouter(<Navbar />);
      
      // Toggle button is a button with class navbar-toggler
      const toggleButton = screen.getByRole('button', { name: '' });
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton.className).toContain('navbar-toggler');
    });
  });

  describe('Navigation - Brand and Links', () => {
    test('brand "Roadie" links to home page', () => {
      renderWithRouter(<Navbar />);
      
      const brandLink = screen.getByText('Roadie');
      expect(brandLink).toHaveAttribute('href', '/');
    });

    test('"My Schedule" links to /myEvents', () => {
      renderWithRouter(<Navbar />);
      
      const link = screen.getByText('My Schedule');
      expect(link).toHaveAttribute('href', '/myEvents');
    });

    test('"Festivals" links to /allEvents', () => {
      renderWithRouter(<Navbar />);
      
      const link = screen.getByText('Festivals');
      expect(link).toHaveAttribute('href', '/allEvents');
    });

    test('"Artists" links to /allArtists', () => {
      renderWithRouter(<Navbar />);
      
      const link = screen.getByText('Artists');
      expect(link).toHaveAttribute('href', '/allArtists');
    });

    test('"Create Event" button wrapper links to /createEvent', () => {
      renderWithRouter(<Navbar />);
      
      // Button is wrapped in a Link component
      const button = screen.getByRole('button', { name: /create event/i });
      const linkWrapper = button.closest('a');
      
      expect(linkWrapper).toHaveAttribute('href', '/createEvent');
    });

    test('"Add Artist" button wrapper links to /addArtist', () => {
      renderWithRouter(<Navbar />);
      
      // Button is wrapped in a Link component
      const button = screen.getByRole('button', { name: /add artist/i });
      const linkWrapper = button.closest('a');
      
      expect(linkWrapper).toHaveAttribute('href', '/addArtist');
    });
  });

  describe('Mobile Responsive', () => {
    test('toggle button has correct data-target attribute', () => {
      renderWithRouter(<Navbar />);
      
      const toggleButton = screen.getByRole('button', { name: '' });
      expect(toggleButton).toHaveAttribute('data-toggle', 'collapse');
      expect(toggleButton).toHaveAttribute('data-target', '#TogglerNav');
    });

    test('collapsible section has matching id for toggle target', () => {
      const { container } = renderWithRouter(<Navbar />);
      
      const collapseSection = container.querySelector('#TogglerNav');
      expect(collapseSection).toBeInTheDocument();
      expect(collapseSection.className).toContain('collapse');
      expect(collapseSection.className).toContain('navbar-collapse');
    });
  });

  describe('Accessibility', () => {
    test('all navigation links are accessible', () => {
      renderWithRouter(<Navbar />);
      
      // Get all links by role
      const links = screen.getAllByRole('link');
      
      // Should have: Roadie (brand), My Schedule, Festivals, Artists, 
      // Create Event wrapper, Add Artist wrapper = 6 total
      expect(links.length).toBe(6);
      
      // All should be visible and have href
      links.forEach(link => {
        expect(link).toBeVisible();
        expect(link).toHaveAttribute('href');
      });
    });

    test('action buttons are accessible', () => {
      renderWithRouter(<Navbar />);
      
      const createEventBtn = screen.getByRole('button', { name: /create event/i });
      const addArtistBtn = screen.getByRole('button', { name: /add artist/i });
      
      expect(createEventBtn).toBeVisible();
      expect(addArtistBtn).toBeVisible();
    });
  });

  describe('Styling and Structure', () => {
    test('navbar has correct Bootstrap classes', () => {
      const { container } = renderWithRouter(<Navbar />);
      
      const navbar = container.querySelector('.navbar');
      expect(navbar).toBeInTheDocument();
      expect(navbar.className).toContain('navbar-dark');
      expect(navbar.className).toContain('navbar-expand-md');
    });

    test('component has dark background color', () => {
      const { container } = renderWithRouter(<Navbar />);
      
      const fluidContainer = container.querySelector('.container-fluid');
      expect(fluidContainer).toBeInTheDocument();
      expect(fluidContainer).toHaveStyle({ backgroundColor: 'rgb(25, 26, 27)' });
    });
  });
});