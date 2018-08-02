import * as React from 'react';
import * as Renderer from 'react-test-renderer';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';

import App from '../App';

configure({ adapter: new Adapter() });

describe('Tests for App', () => {
  const componentTree = shallow(<App />);

  it('should match the snapshot.', () => {
    const snapshot = Renderer.create(<App />).toJSON();
    expect(snapshot).toMatchSnapshot();
  });

  it('should add text to the state when text input changes', () => {
    componentTree.find('[testID="text-input"]').simulate('changeText', 'Task 1');
    expect(componentTree.state().text).toEqual('Task 1');
  })

  describe('test addTask', () => {
    it('should add a new task to list', () => {
      componentTree.setState({ text: 'Task 2', tasks: [{ key: '0', task: 'Task 1', isCompleted: true }] });
      expect(componentTree.state().tasks.length).toBe(1);
      componentTree.find('[testID="text-input"]').simulate('submitEditing');
      expect(componentTree.state().tasks.length).toBe(2);
    })
  })

  describe('test deleteTask', () => {
    it('should delete an existing task from the list', () => {
      componentTree.setState({ text: 'Task 2', tasks: [{ key: '0', text: 'Task 1', isCompleted: true }] });
      expect(componentTree.state().tasks.length).toBe(1);

      const singleTaskFromList = componentTree.find('[testID="flat-list"]').props()[`renderItem`](
        { index: 0, item: { key: '0', text: 'Task 1', isCompleted: true } }
      );
      const singleTaskComponentTree = shallow(singleTaskFromList);

      singleTaskComponentTree.find('[testID="delete-task-wrapper"]').dive().find('[testID="delete-task"]').simulate('press', 0);
      expect(componentTree.state().tasks.length).toBe(0);
    })
  })

  describe('test toggleStatus', () => {
    it('should change the status of the task to complete or incomplete', () => {
      componentTree.setState({ text: 'Task 2', tasks: [{ key: '0', text: 'Task 1', isCompleted: true }] });
      expect(componentTree.state().tasks[0].isCompleted).toBe(true);

      const singleTaskFromList = componentTree.find('[testID="flat-list"]').props()[`renderItem`](
        { index: 0, item: { key: '0', text: 'Task 1', isCompleted: true } }
      );
      const singleTaskComponentTree = shallow(singleTaskFromList);

      singleTaskComponentTree.find('[testID="checkbox"]').dive().find('CheckBox').simulate('press', 0);
      expect(componentTree.state().tasks[0].isCompleted).toBe(false);
    })

    it('should not change the status when index does not match with key', () => {
      componentTree.setState({ text: 'Task 2', tasks: [{ key: '0', text: 'Task 1', isCompleted: true }] });
      expect(componentTree.state().tasks[0].isCompleted).toBe(true);

      const singleTaskFromList = componentTree.find('[testID="flat-list"]').props()[`renderItem`](
        { index: 2, item: { key: '0', text: 'Task 1', isCompleted: true } }
      );
      const singleTaskComponentTree = shallow(singleTaskFromList);

      singleTaskComponentTree.find('[testID="checkbox"]').dive().find('CheckBox').simulate('press', 0);
      expect(componentTree.state().tasks[0].isCompleted).toBe(true);
    })
  })

  describe('test component mount', () => {
    it('should load the items from storage', async () => {
      await componentTree.instance.componentDidMount;

      expect(componentTree.state().tasks.length).toBe(1);
    })
  });
});
