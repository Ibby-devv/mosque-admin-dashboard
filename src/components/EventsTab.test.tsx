import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Timestamp, addDoc, updateDoc, getDocs, getDoc } from 'firebase/firestore';
import EventsTab, {
  isPastEvent,
  resolveEventDate,
  resolveEventTimeForForm,
} from './EventsTab';

jest.mock('../firebase', () => ({ db: {} }));

jest.mock('./ImageUpload', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../hooks/usePermissions', () => ({
  usePermissions: () => ({ hasPermission: () => true }),
}));

jest.mock('firebase/firestore', () => {
  const actual = jest.requireActual('firebase/firestore');
  return {
    Timestamp: actual.Timestamp,
    collection: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    doc: jest.fn(),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    serverTimestamp: jest.fn(),
  };
});

const mockGetDocs = getDocs as jest.Mock;
const mockGetDoc = getDoc as jest.Mock;
const mockAddDoc = addDoc as jest.Mock;
const mockUpdateDoc = updateDoc as jest.Mock;

const CATEGORIES = [
  { id: 'lecture', label: 'Lectures', color_bg: '#fff', color_text: '#000', order: 1, is_active: true },
];

const baseEvent = {
  title: 'Islamic Finance Workshop',
  description: 'A workshop',
  category: 'lecture',
  is_active: true,
};

function mockEventDocs(events: Array<{ id: string; data: Record<string, unknown> }>) {
  mockGetDocs.mockResolvedValue({
    forEach: (cb: (d: { id: string; data: () => Record<string, unknown> }) => void) =>
      events.forEach((e) => cb({ id: e.id, data: () => e.data })),
  });
}

function renderTab() {
  return render(<EventsTab saving={false} onSaveStatusChange={jest.fn()} />);
}

function getInput(container: HTMLElement, type: 'date' | 'time'): HTMLInputElement {
  // Labels are not associated with the native date/time inputs, so query by type
  // eslint-disable-next-line testing-library/no-node-access
  const input = container.querySelector(`input[type="${type}"]`);
  if (!input) throw new Error(`no ${type} input`);
  return input as HTMLInputElement;
}

beforeEach(() => {
  // CRA resets mock implementations between tests
  mockGetDoc.mockResolvedValue({
    exists: () => true,
    data: () => ({ categories: CATEGORIES }),
  });
  mockAddDoc.mockResolvedValue({ id: 'new-event' });
  mockUpdateDoc.mockResolvedValue(undefined);
  mockEventDocs([]);
});

describe('EventsTab civil-date contract', () => {
  it('saves only event_date and event_time (no legacy date/start_date/time)', async () => {
    const { container } = renderTab();
    await waitFor(() => expect(mockGetDocs).toHaveBeenCalled());

    fireEvent.click(await screen.findByRole('button', { name: /add new event/i }));

    fireEvent.change(screen.getByPlaceholderText('e.g., Islamic Finance Workshop'), {
      target: { value: 'Islamic Finance Workshop' },
    });
    fireEvent.change(screen.getByPlaceholderText('Describe the event...'), {
      target: { value: 'A workshop' },
    });
    fireEvent.change(getInput(container, 'date'), { target: { value: '2026-10-04' } });
    fireEvent.change(getInput(container, 'time'), { target: { value: '14:30' } });

    fireEvent.click(screen.getByRole('button', { name: /create event/i }));

    await waitFor(() => expect(mockAddDoc).toHaveBeenCalledTimes(1));
    const saved = mockAddDoc.mock.calls[0][1];
    expect(saved.event_date).toBe('2026-10-04');
    expect(saved.event_time).toBe('14:30');
    expect(saved).not.toHaveProperty('date');
    expect(saved).not.toHaveProperty('start_date');
    expect(saved).not.toHaveProperty('time');
  });

  it('shows the event list date as DD-MM-YYYY', async () => {
    mockEventDocs([
      { id: 'e1', data: { ...baseEvent, event_date: '2026-10-04', event_time: '14:30' } },
    ]);
    renderTab();

    const detail = await screen.findByText(/04-10-2026/);
    expect(detail).toHaveTextContent('04-10-2026 at 2:30 PM');
    expect(detail).not.toHaveTextContent('2026-10-04');
    expect(detail).not.toHaveTextContent('10/04/2026');
    expect(detail).not.toHaveTextContent('04/10/2026');
  });

  it('loads event_date and event_time into the editor', async () => {
    mockEventDocs([
      { id: 'e1', data: { ...baseEvent, event_date: '2026-10-04', event_time: '14:30' } },
    ]);
    const { container } = renderTab();

    fireEvent.click(await screen.findByRole('button', { name: /^edit$/i }));

    expect(getInput(container, 'date').value).toBe('2026-10-04');
    expect(getInput(container, 'time').value).toBe('14:30');
  });

  it('loads a legacy UTC-midnight date into the editor without shifting the day', async () => {
    mockEventDocs([
      {
        id: 'legacy',
        data: {
          ...baseEvent,
          date: Timestamp.fromDate(new Date(Date.UTC(2026, 9, 4))),
          time: '7:00 PM',
        },
      },
    ]);
    const { container } = renderTab();

    fireEvent.click(await screen.findByRole('button', { name: /^edit$/i }));

    expect(getInput(container, 'date').value).toBe('2026-10-04');
    expect(getInput(container, 'time').value).toBe('19:00');
  });
});

describe('resolveEventDate / resolveEventTimeForForm', () => {
  it('prefers event_date over the legacy Timestamp', () => {
    const legacy = Timestamp.fromDate(new Date(Date.UTC(2026, 0, 1)));
    expect(resolveEventDate({ event_date: '2026-10-04', date: legacy })).toBe('2026-10-04');
  });

  it('falls back to the legacy Timestamp when event_date is missing or invalid', () => {
    const legacy = Timestamp.fromDate(new Date(Date.UTC(2026, 9, 4)));
    expect(resolveEventDate({ date: legacy })).toBe('2026-10-04');
    expect(resolveEventDate({ event_date: '2026-02-31', date: legacy })).toBe('2026-10-04');
  });

  it('prefers event_time and converts it for the 12-hour time input', () => {
    expect(resolveEventTimeForForm({ event_time: '14:30', time: '9:00 AM' })).toBe('2:30 PM');
    expect(resolveEventTimeForForm({ time: '9:00 AM' })).toBe('9:00 AM');
  });
});

describe('isPastEvent (civil date vs mosque today)', () => {
  // 4 Oct 2026 00:30 in Sydney (UTC+10 before the 2 AM spring-forward)
  const sydneyEarlyOct4 = new Date('2026-10-03T14:30:00.000Z');
  // 5 Oct 2026 01:00 in Sydney (UTC+11)
  const sydneyEarlyOct5 = new Date('2026-10-04T14:00:00.000Z');

  it('is not past on the mosque day even when the UTC day is the day before', () => {
    expect(isPastEvent({ event_date: '2026-10-04' }, sydneyEarlyOct4)).toBe(false);
  });

  it('is past once the mosque day has rolled over', () => {
    expect(isPastEvent({ event_date: '2026-10-04' }, sydneyEarlyOct5)).toBe(true);
  });

  it('is not past for a future civil date', () => {
    expect(isPastEvent({ event_date: '2026-10-05' }, sydneyEarlyOct4)).toBe(false);
  });

  it('decodes a legacy Timestamp as a civil date, not via machine-zone getDate()', () => {
    const legacy = Timestamp.fromDate(new Date(Date.UTC(2026, 9, 4)));
    expect(isPastEvent({ date: legacy }, sydneyEarlyOct4)).toBe(false);
    expect(isPastEvent({ date: legacy }, sydneyEarlyOct5)).toBe(true);
  });

  it('is not past when the event has no usable date', () => {
    expect(isPastEvent({}, sydneyEarlyOct5)).toBe(false);
  });
});
