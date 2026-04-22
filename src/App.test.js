import { render, screen } from '@testing-library/react';
import App from './App';

test('renders ThreatScope title', () => {
  render(<App />);
  const titleElement = screen.getByText(/ThreatScope/i);
  expect(titleElement).toBeInTheDocument();
});
