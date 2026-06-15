// frontend/components.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import axios from 'axios';

const server = setupServer(
  rest.get('/api/components', (req, res, ctx) => {
    return res(ctx.json([{ id: 1, name: 'Component 1' }, { id: 2, name: 'Component 2' }]));
  }),
  rest.get('/api/components/:id', (req, res, ctx) => {
    const id = req.params.id;
    if (id === '1') {
      return res(ctx.json({ id: 1, name: 'Component 1' }));
    } else {
      return res(ctx.status(404), ctx.json({ message: 'Component not found' }));
    }
  }),
  rest.post('/api/components', (req, res, ctx) => {
    return res(ctx.json({ id: 3, name: 'Component 3' }));
  }),
  rest.put('/api/components/:id', (req, res, ctx) => {
    const id = req.params.id;
    if (id === '1') {
      return res(ctx.json({ id: 1, name: 'Updated Component 1' }));
    } else {
      return res(ctx.status(404), ctx.json({ message: 'Component not found' }));
    }
  }),
  rest.delete('/api/components/:id', (req, res, ctx) => {
    const id = req.params.id;
    if (id === '1') {
      return res(ctx.status(204));
    } else {
      return res(ctx.status(404), ctx.json({ message: 'Component not found' }));
    }
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Components', () => {
  it('renders component list', async () => {
    const { getByText } = render(<ComponentList />);
    await waitFor(() => expect(getByText('Component 1')).toBeInTheDocument());
    await waitFor(() => expect(getByText('Component 2')).toBeInTheDocument());
  });

  it('renders component details', async () => {
    const { getByText } = render(<ComponentDetails id={1} />);
    await waitFor(() => expect(getByText('Component 1')).toBeInTheDocument());
  });

  it('handles component not found', async () => {
    const { getByText } = render(<ComponentDetails id={2} />);
    await waitFor(() => expect(getByText('Component not found')).toBeInTheDocument());
  });

  it('creates new component', async () => {
    const { getByText, getByPlaceholderText } = render(<CreateComponent />);
    const nameInput = getByPlaceholderText('Name');
    const createButton = getByText('Create');
    fireEvent.change(nameInput, { target: { value: 'Component 3' } });
    fireEvent.click(createButton);
    await waitFor(() => expect(getByText('Component 3')).toBeInTheDocument());
  });

  it('updates existing component', async () => {
    const { getByText, getByPlaceholderText } = render(<UpdateComponent id={1} />);
    const nameInput = getByPlaceholderText('Name');
    const updateButton = getByText('Update');
    fireEvent.change(nameInput, { target: { value: 'Updated Component 1' } });
    fireEvent.click(updateButton);
    await waitFor(() => expect(getByText('Updated Component 1')).toBeInTheDocument());
  });

  it('deletes existing component', async () => {
    const { queryByText } = render(<DeleteComponent id={1} />);
    await waitFor(() => expect(queryByText('Component 1')).not.toBeInTheDocument());
  });
});

describe('API Endpoints', () => {
  it('gets component list', async () => {
    const response = await axios.get('/api/components');
    expect(response.status).toBe(200);
    expect(response.data).toEqual([{ id: 1, name: 'Component 1' }, { id: 2, name: 'Component 2' }]);
  });

  it('gets component details', async () => {
    const response = await axios.get('/api/components/1');
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ id: 1, name: 'Component 1' });
  });

  it('handles component not found', async () => {
    const response = await axios.get('/api/components/2');
    expect(response.status).toBe(404);
    expect(response.data).toEqual({ message: 'Component not found' });
  });

  it('creates new component', async () => {
    const response = await axios.post('/api/components', { name: 'Component 3' });
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ id: 3, name: 'Component 3' });
  });

  it('updates existing component', async () => {
    const response = await axios.put('/api/components/1', { name: 'Updated Component 1' });
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ id: 1, name: 'Updated Component 1' });
  });

  it('deletes existing component', async () => {
    const response = await axios.delete('/api/components/1');
    expect(response.status).toBe(204);
  });
});

describe('Edge Cases', () => {
  it('handles empty component list', async () => {
    server.use(
      rest.get('/api/components', (req, res, ctx) => {
        return res(ctx.json([]));
      }),
    );
    const { queryByText } = render(<ComponentList />);
    await waitFor(() => expect(queryByText('No components found')).toBeInTheDocument());
  });

  it('handles component creation with invalid data', async () => {
    const { getByText, getByPlaceholderText } = render(<CreateComponent />);
    const nameInput = getByPlaceholderText('Name');
    const createButton = getByText('Create');
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.click(createButton);
    await waitFor(() => expect(getByText('Name is required')).toBeInTheDocument());
  });

  it('handles component update with invalid data', async () => {
    const { getByText, getByPlaceholderText } = render(<UpdateComponent id={1} />);
    const nameInput = getByPlaceholderText('Name');
    const updateButton = getByText('Update');
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.click(updateButton);
    await waitFor(() => expect(getByText('Name is required')).toBeInTheDocument());
  });
});

describe('Authentication', () => {
  it('requires authentication for component creation', async () => {
    server.use(
      rest.post('/api/components', (req, res, ctx) => {
        return res(ctx.status(401), ctx.json({ message: 'Unauthorized' }));
      }),
    );
    const { getByText, getByPlaceholderText } = render(<CreateComponent />);
    const nameInput = getByPlaceholderText('Name');
    const createButton = getByText('Create');
    fireEvent.change(nameInput, { target: { value: 'Component 3' } });
    fireEvent.click(createButton);
    await waitFor(() => expect(getByText('Unauthorized')).toBeInTheDocument());
  });

  it('requires authentication for component update', async () => {
    server.use(
      rest.put('/api/components/1', (req, res, ctx) => {
        return res(ctx.status(401), ctx.json({ message: 'Unauthorized' }));
      }),
    );
    const { getByText, getByPlaceholderText } = render(<UpdateComponent id={1} />);
    const nameInput = getByPlaceholderText('Name');
    const updateButton = getByText('Update');
    fireEvent.change(nameInput, { target: { value: 'Updated Component 1' } });
    fireEvent.click(updateButton);
    await waitFor(() => expect(getByText('Unauthorized')).toBeInTheDocument());
  });

  it('requires authentication for component deletion', async () => {
    server.use(
      rest.delete('/api/components/1', (req, res, ctx) => {
        return res(ctx.status(401), ctx.json({ message: 'Unauthorized' }));
      }),
    );
    const { queryByText } = render(<DeleteComponent id={1} />);
    await waitFor(() => expect(queryByText('Unauthorized')).toBeInTheDocument());
  });
});