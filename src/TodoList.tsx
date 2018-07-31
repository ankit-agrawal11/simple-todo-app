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

export interface ITodoListState {
  tasks: Array<{ key: number, text: string }>;
  text: string
}

export default class TodoList extends React.Component<ITodoListState> {

  state = {
    tasks: [],
    text: ""
  }

  addTask = () => {
    if (this.state.text.trim().length > 0) {
      this.setState(
        (prevState: ITodoListState) => {
          let { tasks, text } = prevState;
          return {
            tasks: tasks.concat({ key: tasks.length, text: text }),
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

    Tasks.all((tasks: Array<{ key: number, text: string }>) => this.setState({ tasks: tasks || [] }));
  }

  render(): JSX.Element {
    return (
      <View style={[styles.container, { paddingBottom: 10 }]}>
        <FlatList
          style={styles.list}
          data={this.state.tasks}
          renderItem={({ item, index }: any) =>
            <View>
              <View style={styles.listItemCont}>
                <Text style={styles.listItem}>
                  {item.text}
                </Text>
                <Button title="X" onPress={() => this.deleteTask(index)} />
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
  convertToArrayOfObject(tasks: string, callback: Function) {
    return callback(
      tasks ? tasks.split("||").map((task, i) => ({ key: i, text: task })) : []
    );
  },

  convertToStringWithSeparators(tasks: Array<{ key: number, text: string }>): string {
    return tasks.map(task => task.text).join("||");
  },

  all(callback: Function) {
    return AsyncStorage.getItem("TASKS", (err, tasks) =>
      this.convertToArrayOfObject(tasks ? tasks : "", callback)
    );
  },

  save(tasks: Array<{ key: number, text: string }>) {
    AsyncStorage.setItem("TASKS", this.convertToStringWithSeparators(tasks));
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
    padding: 10,
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
    backgroundColor: "gray"
  },
  listItemCont: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

});
