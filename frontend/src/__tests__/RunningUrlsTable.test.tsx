import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
      <MemoryRouter>
        <RunningUrlsTable
          data={[]}
          onStart={jest.fn()}
          onStop={jest.fn()}
          onDelete={jest.fn()}
          onUpdate={jest.fn()}
        />
      </MemoryRouter>
    );


    // because of the mobile view we have multiple placeholders like that.
    const noUrls = screen.getAllByText(/No URLs added yet. Add a URL to get started!/i);
    expect(noUrls.length).toBeGreaterThan(0);
    noUrls.forEach(urlText => expect(urlText).toBeInTheDocument());
  });

  it('renders table and card view', () => {
    render(
      <MemoryRouter>
        <RunningUrlsTable
          data={mockData}
          onStart={jest.fn()}
          onStop={jest.fn()}
          onDelete={jest.fn()}
          onUpdate={jest.fn()}
        />
      </MemoryRouter>
    );

    const links = screen.getAllByText('https://example.com');
    expect(links.length).toBeGreaterThan(0);
    links.forEach(link => expect(link).toBeInTheDocument());
  });

  it('enables bulk action buttons when rows are selected', () => {
    render(
      <MemoryRouter>
        <RunningUrlsTable
          data={mockData}
          onStart={jest.fn()}
          onStop={jest.fn()}
          onDelete={jest.fn()}
          onUpdate={jest.fn()}
        />
      </MemoryRouter>
    );
    // Simulate selecting a row (checkbox)
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // select first row
    expect(screen.getByText(/URL\(s\) selected/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Re-run Analysis|Start Selected/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Delete Selected/i })).toBeEnabled();
  });
}); 