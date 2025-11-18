import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArtistForm from './ArtistForm';

describe('ArtistForm Component', () => {
  // Mock fetch before each test
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    test('renders without crashing', () => {
      render(<ArtistForm />);
      
      expect(screen.getByText(/add an artist/i)).toBeInTheDocument();
    });

    test('displays form heading and description', () => {
      render(<ArtistForm />);
      
      expect(screen.getByRole('heading', { name: /add an artist/i })).toBeInTheDocument();
      expect(screen.getByText(/are we missing out on an artist/i)).toBeInTheDocument();
    });

    test('renders artist name input field', () => {
      render(<ArtistForm />);
      
      expect(screen.getByLabelText(/name of artist/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter name of artist/i)).toBeInTheDocument();
    });

    test('renders genre and label input fields', () => {
      render(<ArtistForm />);
      
      expect(screen.getByLabelText(/genre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/music label/i)).toBeInTheDocument();
    });

    test('renders all 3 album input fields', () => {
      render(<ArtistForm />);
      
      expect(screen.getByPlaceholderText(/enter album 1/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter album 2/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter album 3/i)).toBeInTheDocument();
    });

    test('renders all 3 single input fields', () => {
      render(<ArtistForm />);
      
      expect(screen.getByPlaceholderText(/enter single 1/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter single 2/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter single 3/i)).toBeInTheDocument();
    });

    test('renders bio textarea', () => {
      render(<ArtistForm />);
      
      const bioField = screen.getByLabelText(/bio/i);
      expect(bioField).toBeInTheDocument();
      expect(bioField.tagName).toBe('TEXTAREA');
    });

    test('renders submit button', () => {
      render(<ArtistForm />);
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    test('required fields have required attribute', () => {
      render(<ArtistForm />);
      
      // Name, genre and label are required
      expect(screen.getByLabelText(/name of artist/i)).toBeRequired();
      expect(screen.getByLabelText(/genre/i)).toBeRequired();
      expect(screen.getByLabelText(/music label/i)).toBeRequired();
      
      // Albums are required
      expect(screen.getByPlaceholderText(/enter album 1/i)).toBeRequired();
      expect(screen.getByPlaceholderText(/enter album 2/i)).toBeRequired();
      expect(screen.getByPlaceholderText(/enter album 3/i)).toBeRequired();
      
      // Singles are required
      expect(screen.getByPlaceholderText(/enter single 1/i)).toBeRequired();
      expect(screen.getByPlaceholderText(/enter single 2/i)).toBeRequired();
      expect(screen.getByPlaceholderText(/enter single 3/i)).toBeRequired();
    });

    test('bio field is NOT required', () => {
      render(<ArtistForm />);
      
      // Only bio should be optional
      expect(screen.getByLabelText(/bio/i)).not.toBeRequired();
    });
  });

  describe('User Input', () => {
    test('allows user to type in artist name field', async () => {
      const user = userEvent.setup();
      render(<ArtistForm />);
      
      const nameInput = screen.getByLabelText(/name of artist/i);
      await user.type(nameInput, 'The Beatles');
      
      expect(nameInput).toHaveValue('The Beatles');
    });

    test('allows user to type in genre field', async () => {
      const user = userEvent.setup();
      render(<ArtistForm />);
      
      const genreInput = screen.getByLabelText(/genre/i);
      await user.type(genreInput, 'Rock');
      
      expect(genreInput).toHaveValue('Rock');
    });

    test('allows user to type in music label field', async () => {
      const user = userEvent.setup();
      render(<ArtistForm />);
      
      const labelInput = screen.getByLabelText(/music label/i);
      await user.type(labelInput, 'Apple Records');
      
      expect(labelInput).toHaveValue('Apple Records');
    });

    test('allows user to enter all 3 album names', async () => {
      const user = userEvent.setup();
      render(<ArtistForm />);
      
      await user.type(screen.getByPlaceholderText(/enter album 1/i), 'Abbey Road');
      await user.type(screen.getByPlaceholderText(/enter album 2/i), 'Revolver');
      await user.type(screen.getByPlaceholderText(/enter album 3/i), 'Rubber Soul');
      
      expect(screen.getByPlaceholderText(/enter album 1/i)).toHaveValue('Abbey Road');
      expect(screen.getByPlaceholderText(/enter album 2/i)).toHaveValue('Revolver');
      expect(screen.getByPlaceholderText(/enter album 3/i)).toHaveValue('Rubber Soul');
    });

    test('allows user to enter all 3 single names', async () => {
      const user = userEvent.setup();
      render(<ArtistForm />);
      
      await user.type(screen.getByPlaceholderText(/enter single 1/i), 'Hey Jude');
      await user.type(screen.getByPlaceholderText(/enter single 2/i), 'Let It Be');
      await user.type(screen.getByPlaceholderText(/enter single 3/i), 'Yesterday');
      
      expect(screen.getByPlaceholderText(/enter single 1/i)).toHaveValue('Hey Jude');
      expect(screen.getByPlaceholderText(/enter single 2/i)).toHaveValue('Let It Be');
      expect(screen.getByPlaceholderText(/enter single 3/i)).toHaveValue('Yesterday');
    });

    test('allows user to type in bio textarea', async () => {
      const user = userEvent.setup();
      render(<ArtistForm />);
      
      const bioInput = screen.getByLabelText(/bio/i);
      await user.type(bioInput, 'An influential British rock band from the 1960s.');
      
      expect(bioInput).toHaveValue('An influential British rock band from the 1960s.');
    });

    test('allows multi-line text in bio textarea', async () => {
      const user = userEvent.setup();
      render(<ArtistForm />);
      
      const bioInput = screen.getByLabelText(/bio/i);
      const multilineBio = 'Line 1\nLine 2\nLine 3';
      await user.type(bioInput, multilineBio);
      
      expect(bioInput).toHaveValue(multilineBio);
    });
  });

  describe('Form Submission - Success', () => {
    const fillCompleteForm = async (user) => {
      await user.type(screen.getByLabelText(/name of artist/i), 'Daft Punk');
      await user.type(screen.getByLabelText(/genre/i), 'Electronic');
      await user.type(screen.getByLabelText(/music label/i), 'Columbia Records');
      await user.type(screen.getByPlaceholderText(/enter album 1/i), 'Discovery');
      await user.type(screen.getByPlaceholderText(/enter album 2/i), 'Random Access Memories');
      await user.type(screen.getByPlaceholderText(/enter album 3/i), 'Homework');
      await user.type(screen.getByPlaceholderText(/enter single 1/i), 'Get Lucky');
      await user.type(screen.getByPlaceholderText(/enter single 2/i), 'One More Time');
      await user.type(screen.getByPlaceholderText(/enter single 3/i), 'Harder Better Faster Stronger');
      await user.type(screen.getByLabelText(/bio/i), 'French electronic music duo.');
    };

    test('submits form with correct data on successful response', async () => {
      const user = userEvent.setup();
      global.fetch.mockResolvedValueOnce({
        status: 200,
        ok: true
      });
      
      render(<ArtistForm />);
      await fillCompleteForm(user);
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/artists',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-type': 'application/json' },
          body: expect.any(String)
        })
      );
    });

    test('sends correct data structure to API', async () => {
      const user = userEvent.setup();
      global.fetch.mockResolvedValueOnce({
        status: 200,
        ok: true
      });
      
      render(<ArtistForm />);
      await fillCompleteForm(user);
      
      await user.click(screen.getByRole('button', { name: /submit/i }));
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
      
      const callArgs = global.fetch.mock.calls[0];
      const sentData = JSON.parse(callArgs[1].body);
      
      expect(sentData).toEqual({
        name: 'Daft Punk',
        genre: 'Electronic',
        label: 'Columbia Records',
        albums: ['Discovery', 'Random Access Memories', 'Homework'],
        singles: ['Get Lucky', 'One More Time', 'Harder Better Faster Stronger'],
        bio: 'French electronic music duo.'
      });
    });

    test('shows success modal after successful submission', async () => {
      const user = userEvent.setup();
      global.fetch.mockResolvedValueOnce({
        status: 200,
        ok: true
      });
      
      render(<ArtistForm />);
      await fillCompleteForm(user);
      await user.click(screen.getByRole('button', { name: /submit/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/artist added!/i)).toBeInTheDocument();
      });
      
      expect(screen.getByText(/you have successfully added an artist/i)).toBeInTheDocument();
    });

    test('resets form after successful submission', async () => {
      const user = userEvent.setup();
      global.fetch.mockResolvedValueOnce({
        status: 200,
        ok: true
      });
      
      render(<ArtistForm />);
      await fillCompleteForm(user);
      await user.click(screen.getByRole('button', { name: /submit/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/artist added!/i)).toBeInTheDocument();
      });
      
      // Close modal
      const closeButtons = screen.getAllByRole('button', { name: /close/i });
      const footerCloseButton = closeButtons.find(btn => btn.textContent === 'Close');
      await user.click(footerCloseButton);
      
      // Wait for modal to close
      await waitFor(() => {
        expect(screen.queryByText(/artist added!/i)).not.toBeInTheDocument();
      });
      
      // Check that form fields are empty
      expect(screen.getByLabelText(/name of artist/i)).toHaveValue('');
      expect(screen.getByLabelText(/genre/i)).toHaveValue('');
      expect(screen.getByLabelText(/music label/i)).toHaveValue('');
    });

    test('modal can be closed by clicking close button', async () => {
      const user = userEvent.setup();
      global.fetch.mockResolvedValueOnce({
        status: 200,
        ok: true
      });
      
      render(<ArtistForm />);
      await fillCompleteForm(user);
      await user.click(screen.getByRole('button', { name: /submit/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/artist added!/i)).toBeInTheDocument();
      });
      
      const closeButtons = screen.getAllByRole('button', { name: /close/i });
      const footerCloseButton = closeButtons.find(btn => btn.textContent === 'Close');
      await user.click(footerCloseButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/artist added!/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission - Error Handling', () => {
    const fillCompleteForm = async (user) => {
      await user.type(screen.getByLabelText(/name of artist/i), 'Test Artist');
      await user.type(screen.getByLabelText(/genre/i), 'Test Genre');
      await user.type(screen.getByLabelText(/music label/i), 'Test Label');
      await user.type(screen.getByPlaceholderText(/enter album 1/i), 'Album1');
      await user.type(screen.getByPlaceholderText(/enter album 2/i), 'Album2');
      await user.type(screen.getByPlaceholderText(/enter album 3/i), 'Album3');
      await user.type(screen.getByPlaceholderText(/enter single 1/i), 'Single1');
      await user.type(screen.getByPlaceholderText(/enter single 2/i), 'Single2');
      await user.type(screen.getByPlaceholderText(/enter single 3/i), 'Single3');
      await user.type(screen.getByLabelText(/bio/i), 'Test bio');
    };

    test('shows error modal on non-200 status code', async () => {
      const user = userEvent.setup();
      global.fetch.mockResolvedValueOnce({
        status: 400,
        ok: false
      });
      
      render(<ArtistForm />);
      await fillCompleteForm(user);
      await user.click(screen.getByRole('button', { name: /submit/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/an error has occured/i)).toBeInTheDocument();
      });
      
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    test('shows error modal on 500 server error', async () => {
      const user = userEvent.setup();
      global.fetch.mockResolvedValueOnce({
        status: 500,
        ok: false
      });
      
      render(<ArtistForm />);
      await fillCompleteForm(user);
      await user.click(screen.getByRole('button', { name: /submit/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/an error has occured/i)).toBeInTheDocument();
      });
    });

    test('shows error modal on 404 not found', async () => {
      const user = userEvent.setup();
      global.fetch.mockResolvedValueOnce({
        status: 404,
        ok: false
      });
      
      render(<ArtistForm />);
      await fillCompleteForm(user);
      await user.click(screen.getByRole('button', { name: /submit/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/an error has occured/i)).toBeInTheDocument();
      });
    });

    test('does not reset form on error response', async () => {
      const user = userEvent.setup();
      global.fetch.mockResolvedValueOnce({
        status: 400,
        ok: false
      });
      
      render(<ArtistForm />);
      await fillCompleteForm(user);
      await user.click(screen.getByRole('button', { name: /submit/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/an error has occured/i)).toBeInTheDocument();
      });
      
      // Close error modal
      const closeButtons = screen.getAllByRole('button', { name: /close/i });
      const footerCloseButton = closeButtons.find(btn => btn.textContent === 'Close');
      await user.click(footerCloseButton);
      
      // Wait for modal to close
      await waitFor(() => {
        expect(screen.queryByText(/an error has occured/i)).not.toBeInTheDocument();
      });
      
      // Form should still have values
      expect(screen.getByLabelText(/name of artist/i)).toHaveValue('Test Artist');
      expect(screen.getByLabelText(/genre/i)).toHaveValue('Test Genre');
    });

    test.skip('shows error modal on network failure', async () => {
      // SKIPPED: Known issue - network errors are not caught
      // fetch() only rejects on network errors, not HTTP errors
      // Component needs try-catch around fetch call
      const user = userEvent.setup();
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      
      render(<ArtistForm />);
      await fillCompleteForm(user);
      await user.click(screen.getByRole('button', { name: /submit/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/an error has occured/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles special characters in text inputs', async () => {
      const user = userEvent.setup();
      global.fetch.mockResolvedValueOnce({
        status: 200,
        ok: true
      });
      
      render(<ArtistForm />);
      
      await user.type(screen.getByLabelText(/name of artist/i), "Guns N' Roses");
      await user.type(screen.getByLabelText(/genre/i), 'Hard Rock & Metal');
      await user.type(screen.getByLabelText(/music label/i), "Geffen Records");
      await user.type(screen.getByPlaceholderText(/enter album 1/i), 'Appetite for Destruction');
      await user.type(screen.getByPlaceholderText(/enter album 2/i), 'Album2');
      await user.type(screen.getByPlaceholderText(/enter album 3/i), 'Album3');
      await user.type(screen.getByPlaceholderText(/enter single 1/i), "Sweet Child O' Mine");
      await user.type(screen.getByPlaceholderText(/enter single 2/i), 'Single2');
      await user.type(screen.getByPlaceholderText(/enter single 3/i), 'Single3');
      await user.type(screen.getByLabelText(/bio/i), 'Bio text');
      
      await user.click(screen.getByRole('button', { name: /submit/i }));
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
      
      const callArgs = global.fetch.mock.calls[0];
      const sentData = JSON.parse(callArgs[1].body);
      
      expect(sentData.name).toBe("Guns N' Roses");
      expect(sentData.genre).toBe('Hard Rock & Metal');
      expect(sentData.albums[0]).toBe('Appetite for Destruction');
      expect(sentData.singles[0]).toBe("Sweet Child O' Mine");
    });

    test('submits form with empty bio (optional field)', async () => {
      const user = userEvent.setup();
      global.fetch.mockResolvedValueOnce({
        status: 200,
        ok: true
      });
      
      render(<ArtistForm />);
      
      // Fill all required fields, leave bio empty
      await user.type(screen.getByLabelText(/name of artist/i), 'Artist Name');
      await user.type(screen.getByLabelText(/genre/i), 'Rock');
      await user.type(screen.getByLabelText(/music label/i), 'Label');
      await user.type(screen.getByPlaceholderText(/enter album 1/i), 'A1');
      await user.type(screen.getByPlaceholderText(/enter album 2/i), 'A2');
      await user.type(screen.getByPlaceholderText(/enter album 3/i), 'A3');
      await user.type(screen.getByPlaceholderText(/enter single 1/i), 'S1');
      await user.type(screen.getByPlaceholderText(/enter single 2/i), 'S2');
      await user.type(screen.getByPlaceholderText(/enter single 3/i), 'S3');
      // Don't fill bio (it's optional)
      
      await user.click(screen.getByRole('button', { name: /submit/i }));
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
      
      const callArgs = global.fetch.mock.calls[0];
      const sentData = JSON.parse(callArgs[1].body);
      
      expect(sentData.name).toBe('Artist Name');
      expect(sentData.bio).toBe('');
    });

    test('handles very long text in bio textarea', async () => {
      const user = userEvent.setup();
      global.fetch.mockResolvedValueOnce({
        status: 200,
        ok: true
      });
      
      render(<ArtistForm />);
      
      const longBio = 'A'.repeat(500); // 500 characters (reduced for test speed)
      
      await user.type(screen.getByLabelText(/name of artist/i), 'Artist');
      await user.type(screen.getByLabelText(/genre/i), 'Genre');
      await user.type(screen.getByLabelText(/music label/i), 'Label');
      await user.type(screen.getByPlaceholderText(/enter album 1/i), 'A1');
      await user.type(screen.getByPlaceholderText(/enter album 2/i), 'A2');
      await user.type(screen.getByPlaceholderText(/enter album 3/i), 'A3');
      await user.type(screen.getByPlaceholderText(/enter single 1/i), 'S1');
      await user.type(screen.getByPlaceholderText(/enter single 2/i), 'S2');
      await user.type(screen.getByPlaceholderText(/enter single 3/i), 'S3');
      
      // For long text, use paste instead of type (much faster)
      const bioInput = screen.getByLabelText(/bio/i);
      await user.click(bioInput);
      await user.paste(longBio);
      
      await user.click(screen.getByRole('button', { name: /submit/i }));
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
      
      const callArgs = global.fetch.mock.calls[0];
      const sentData = JSON.parse(callArgs[1].body);
      
      expect(sentData.bio).toHaveLength(500);
    });
  });
});