import * as React from 'react';
import { CheckBox } from 'react-native-elements';
import {
  StyleSheet,
  View,
  TextInput,
  Keyboard,
  Platform,
  AsyncStorage,
  FlatList,
  Button
} from "react-native";

const isAndroid = Platform.OS == "android";
const viewPadding = 10;

type ITaskProps = Array<{ key: string, text: string, isCompleted?: boolean }>;

export interface ITodoListState {
  tasks: ITaskProps;
  text: string;
  viewPadding?: string | number;
}

export default class App extends React.Component<{}, ITodoListState> {

  state = {
    tasks: [],
    text: "",
    viewPadding: viewPadding
  }

  async componentDidMount() {
    Keyboard.addListener(
      isAndroid ? "keyboardDidShow" : "keyboardWillShow",
      e => this.setState({ viewPadding: e.endCoordinates.height + viewPadding })
    );

    Keyboard.addListener(
      isAndroid ? "keyboardDidHide" : "keyboardWillHide",
      () => this.setState({ viewPadding: viewPadding })
    );

    const tasks = await this.getTasksFromStorage()
    this.setState({tasks});
  }

  addTask = () => {
    if (this.state.text.trim().length > 0) {
      this.setState(
        (prevState: ITodoListState) => {
          let { tasks, text } = prevState;
          const currentTaskIndex = tasks.length ? Number(tasks[tasks.length - 1].key) + 1 : 0;
          return {
            tasks: tasks.concat({ key: String(currentTaskIndex), text: text }),
            text: ""
          };
        },
        () => AsyncStorage.setItem("TASKS", JSON.stringify(this.state.tasks))
      );
    }
  };

  deleteTask = (index: number) => {
    this.setState(
      (prevState: ITodoListState) => {
        let tasks = prevState.tasks.slice();

        tasks.splice(index, 1);

        return { tasks: tasks };
      },
      () => AsyncStorage.setItem("TASKS", JSON.stringify(this.state.tasks))
    );
  };

  toggleStatus = (index: number) => {
    this.setState(
      (prevState: ITodoListState) => {
        let updatedTasks = prevState.tasks.map((task, taskIndex) => {
          if (taskIndex === index) {
            return { ...task, isCompleted: !task.isCompleted }
          }

          return task;
        });

        return { tasks: updatedTasks };
      }
    )
  }

  async getTasksFromStorage() {
    const items = await AsyncStorage.getItem("TASKS");

    return items && items.length ? JSON.parse(items) : [];
  }

  render(): JSX.Element {
    return (
      <View style={[styles.container, { paddingBottom: this.state.viewPadding }]}>
        <FlatList
          testID='flat-list'
          style={styles.list}
          data={this.state.tasks}
          renderItem={(task: { index: number, item: { text: string, key: string, isCompleted: boolean } }) =>
            <View>
              <View style={[styles.listItemCont]}>
                <View testID='checkbox' style={{ flex: 0.90 }}>
                  <CheckBox
                    textStyle={task.item.isCompleted ? {textDecorationLine: 'line-through'} : {}}
                    title={task.item.text}
                    checked={task.item.isCompleted}
                    onPress={() => this.toggleStatus(task.index)}
                  />
                </View>
                <View testID="delete-task-wrapper" style={{ flex: 0.10, alignItems: 'center', justifyContent: 'flex-end', marginRight: 1 }}>
                  <Button testID="delete-task" title="X" onPress={() => this.deleteTask(task.index)} />
                </View>
              </View>
              <View style={styles.hr} />
            </View>}
        />
        <TextInput
          testID='text-input'
          underlineColorAndroid='rgba(0,0,0,0)'
          style={styles.textInput}
          onChangeText={(text) => this.setState({ text: text })}
          onSubmitEditing={this.addTask}
          value={this.state.text}
          placeholder="Add Tasks"
          returnKeyType="done"
          returnKeyLabel="done"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
    padding: viewPadding,
    paddingTop: 20
  },
  textInput: {
    height: 40,
    paddingRight: 10,
    paddingLeft: 10,
    borderColor: "gray",
    borderWidth: 1,
    width: "100%",
  },
  list: {
    width: "100%"
  },
  listItem: {
    paddingTop: 2,
    paddingBottom: 2,
    fontSize: 18
  },
  hr: {
    height: 1,
    backgroundColor: "gray",
    marginTop: 5,
    marginBottom: 5
  },
  listItemCont: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between"
  },
});
