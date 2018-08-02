import * as React from 'react';
import * as Renderer from 'react-test-renderer';

import App from '../App';

describe('Tests for App', () => {
  it('should match the snapshot.', () => {
    const snapshot = Renderer.create(<App />).toJSON();
    expect(snapshot).toMatchSnapshot();
  });
});
