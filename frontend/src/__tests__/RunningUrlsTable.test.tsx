import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RunningUrlsTable from '../components/table/RunningUrlsTable';
import type { UrlItem } from '../components/table/RunningUrlsTable';

const mockData: UrlItem[] = [
  {
    id: '1',
    url: 'https://example.com',
    status: 'queued',
    title: 'Example',
    htmlVersion: 'HTML5',
    headings: { h1: 1, h2: 2, h3: 0 },
    internalLinks: 5,
    externalLinks: 2,
    brokenLinks: [],
    hasLoginForm: false,
  },
  {
    id: '2',
    url: 'https://test.com',
    status: 'done',
    title: 'Test',
    htmlVersion: 'HTML5',
    headings: { h1: 0, h2: 1, h3: 1 },
    internalLinks: 3,
    externalLinks: 4,
    brokenLinks: [{ url: 'https://bad.com', statusCode: 404 }],
    hasLoginForm: true,
  },
];

describe('RunningUrlsTable', () => {
  it('renders empty state', () => {
    render(
      <RunningUrlsTable
        data={[]}
        onStart={jest.fn()}
        onStop={jest.fn()}
        onDelete={jest.fn()}
        onUpdate={jest.fn()}
      />
    );
    expect(screen.getByText(/No URLs added yet/i)).toBeInTheDocument();
  });

  it('renders table and card view', () => {
    render(
      <RunningUrlsTable
        data={mockData}
        onStart={jest.fn()}
        onStop={jest.fn()}
        onDelete={jest.fn()}
        onUpdate={jest.fn()}
      />
    );
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('https://test.com')).toBeInTheDocument();
    expect(screen.getByText('Example')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('enables bulk action buttons when rows are selected', () => {
    render(
      <RunningUrlsTable
        data={mockData}
        onStart={jest.fn()}
        onStop={jest.fn()}
        onDelete={jest.fn()}
        onUpdate={jest.fn()}
      />
    );
    // Simulate selecting a row (checkbox)
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // select first row
    expect(screen.getByText(/URL\(s\) selected/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Re-run Analysis|Start Selected/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Delete Selected/i })).toBeEnabled();
  });
}); 