import * as React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Keyboard,
  Platform,
  AsyncStorage,
  FlatList,
  Text,
  Button
} from "react-native";

const isAndroid = Platform.OS == "android";
const viewPadding = 10;

type ITaskProps = Array<{ key: string, text: string }>;

export interface ITodoListState {
  tasks: ITaskProps;
  text: string;
  viewPadding?: string | number;
}

export default class App extends React.Component<ITodoListState> {

  state = {
    tasks: [],
    text: "",
    viewPadding: viewPadding
  }

  addTask = () => {
    if (this.state.text.trim().length > 0) {
      this.setState(
        (prevState: ITodoListState) => {
          let { tasks, text } = prevState;
          return {
            tasks: tasks.concat({ key: String(tasks.length), text: text }),
            text: ""
          };
        },
        () => Tasks.save(this.state.tasks)
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
      () => Tasks.save(this.state.tasks)
    );
  };

  componentDidMount() {
    Keyboard.addListener(
      isAndroid ? "keyboardDidShow" : "keyboardWillShow",
      e => this.setState({ viewPadding: e.endCoordinates.height + viewPadding })
    );

    Keyboard.addListener(
      isAndroid ? "keyboardDidHide" : "keyboardWillHide",
      () => this.setState({ viewPadding: viewPadding })
    );

    Tasks.all((tasks: ITaskProps) => this.setState({ tasks: tasks || [] }));
  }

  render(): JSX.Element {
    return (
      <View style={[styles.container, { paddingBottom: this.state.viewPadding }]}>
        <FlatList
          style={styles.list}
          data={this.state.tasks}
          renderItem={(task: {index: number, item: {text: string}}) =>
            <View>
              <View style={styles.listItemCont}>
                <Text style={styles.listItem}>
                  {task.item.text}
                </Text>
                <Button title="X" onPress={() => this.deleteTask(task.index)} />
              </View>
              <View style={styles.hr} />
            </View>}
        />
        <TextInput
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

let Tasks = {
  all(callback: Function) {
    return AsyncStorage.getItem("TASKS", (err, tasks) =>
      tasks ? JSON.parse(tasks) : ""
    );
  },

  save(tasks: ITaskProps) {
    AsyncStorage.setItem("TASKS", JSON.stringify(tasks));
  }
};

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
    borderWidth: 0,
    width: "100%"
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
    justifyContent: "space-between"
  },
});
