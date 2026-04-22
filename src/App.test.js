import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test

    // Mock the fetch API for each test
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true, // Simulate a successful response
        json: jest.fn(() => Promise.resolve({
          prospects: [{ id: '1', name: 'Test Prospect' }],
          tasks: [], inbox: [], messages: [], docs: [], notes: [], templates: [],
        })),
        text: jest.fn(() => Promise.resolve(JSON.stringify({
          prospects: [{ id: '1', name: 'Test Prospect' }],
          tasks: [], inbox: [], messages: [], docs: [], notes: [], templates: [],
        }))),
      })
    );
  });

  test('renders ThreatScope title after data loads', async () => {
    render(<App />);
    // Wait for the "Loading..." text to disappear
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
    const titleElement = screen.getByText(/ThreatScope/i);
    expect(titleElement).toBeInTheDocument();
  });
});