import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppContext } from '../App';
import Notes from './Notes';

// Mock uuidv4
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}));

// Mock marked
jest.mock('marked', () => ({
  marked: {
    parse: jest.fn((markdown) => {
      if (markdown.includes('# Title')) {
        return '<h1>Title</h1><p>Content</p>';
      }
      return '<p>Default Content</p>';
    }),
  },
}));

const mockData = {
  notes: [],
  prospects: [],
  tasks: [],
  inbox: [],
  messages: [],
  docs: [],
  templates: [],
};

const mockUpdate = jest.fn();

const renderWithContext = (ui, { providerProps = {}, ...renderOptions } = {}) => {
  return render(
    <AppContext.Provider value={{ data: mockData, update: mockUpdate, uuidv4: () => 'mock-uuid' }} {...providerProps}>
      {ui}
    </AppContext.Provider>,
    renderOptions
  );
};

describe('Notes Component', () => {
  beforeEach(() => {
    mockUpdate.mockClear();
    mockData.notes = []; // Reset notes for each test
  });

  test('renders "New note" button', () => {
    renderWithContext(<Notes />);
    expect(screen.getByRole('button', { name: /New note/i })).toBeInTheDocument();
  });

  test('renders "Import from Obsidian" button', () => {
    renderWithContext(<Notes />);
    expect(screen.getByRole('button', { name: /Import from Obsidian/i })).toBeInTheDocument();
  });

  test('file input is hidden', () => {
    renderWithContext(<Notes />);
    const input = screen.getByTestId('obsidian-file-input');
    expect(input).not.toBeVisible();
  });

  test('clicking "Import from Obsidian" button triggers file input click', () => {
    renderWithContext(<Notes />);
    const importButton = screen.getByRole('button', { name: /Import from Obsidian/i });
    const fileInput = screen.getByTestId('obsidian-file-input');

    const fileInputClickSpy = jest.spyOn(fileInput, 'click');
    fireEvent.click(importButton);
    expect(fileInputClickSpy).toHaveBeenCalledTimes(1);
    fileInputClickSpy.mockRestore();
  });

  test('uploading a markdown file creates a new note', async () => {
    renderWithContext(<Notes />);

    const file = new File(['# Title\nContent'], 'test-note.md', { type: 'text/markdown' });
    const fileInput = screen.getByTestId('obsidian-file-input');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      const expectedNote = {
        id: 'mock-uuid',
        title: 'Title',
        content: '# Title\nContent',
        tags: [],
        pinned: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      };
      expect(mockUpdate).toHaveBeenCalledWith('notes', [expectedNote]);
    });
  });

  test('uploading a markdown file with tags creates a new note with tags', async () => {
    renderWithContext(<Notes />);

    const fileContent = '# Another Title\nContent with #tag1 and #tag2';
    const file = new File([fileContent], 'test-note-with-tags.md', { type: 'text/markdown' });
    const fileInput = screen.getByTestId('obsidian-file-input');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      const expectedNote = {
        id: 'mock-uuid',
        title: 'Another Title',
        content: fileContent,
        tags: ['tag1', 'tag2'],
        pinned: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      };
      expect(mockUpdate).toHaveBeenCalledWith('notes', [expectedNote]);
    });
  });
});
