// import { Component } from "react"; //React17开始 由react/jsx-runtime处理jsx代码 不用引入React再使用babel处理
import { Component, useState } from "./mini-react/react";
import { ReactDOM } from "./mini-react/react-dom";
import "./index.css";

class ClassComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 1,
    };
  }

  addCount = () => {
    this.setState({
      count: this.state.count + 1,
    });
  };

  render() {
    return (
      <div className="class-component">
        <div>this is a class Component</div>
        <div>prop value is: {this.props.value}</div>
        <div>count is: {this.state.count}</div>
        <input type="button" value="add count" onClick={this.addCount} />
      </div>
    );
  }
}

function FunctionComponent(props) {
  const [count, setCount] = useState(0);
  const addCount = () => {
    setCount(count + 1);
  };
  return (
    <div className="function-component">
      <div>this is a function Component</div>
      <div>prop value is: {props.value}</div>
      <div>count is: {count}</div>
      <input type="button" value="add count" onClick={addCount} />
    </div>
  );
}

const jsx = (
  <div className="deep1-box">
    <ClassComponent value={666} />
    <FunctionComponent value={100} />
    <div className="deep2-box-1">
      <a href="https:www.baidu.com">Bai du link</a>
      <p style={{ color: "red" }}> this is a red p</p>
      <div className="deep3-box">
        {true && <div>condition true</div>}
        {false && <div>condition false</div>}
        <input
          type="button"
          value="say hello"
          onClick={() => {
            alert("hello");
          }}
        />
      </div>
    </div>
    <div className="deep2-box-2">
      {["item1", "item2", "item3"].map((item) => (
        <li key={item}>{item}</li>
      ))}
    </div>
  </div>
);

ReactDOM.render(jsx, document.getElementById("root"));

// 5秒后 删除p标签红色行内样式，给li标签设置字体大小，删除a标签
// 分别对应： 更新、更新、删除
// setTimeout(() => {
//   const jsx = (
//     <div className="deep1-box">
//       <ClassComponent value={666} />
//       <FunctionComponent value={100} />
//       <div className="deep2-box-1">
//         <p> this is a red p</p>
//         <div className="deep3-box">
//           {true && <div>condition true</div>}
//           {false && <div>condition false</div>}
//           <input
//             type="button"
//             value="say hello"
//             onClick={() => {
//               alert("hello");
//             }}
//           />
//         </div>
//       </div>
//       <div className="deep2-box-2">
//         {["item1", "item2", "item3"].map((item) => (
//           <li style={{ fontSize: "20px" }} key={item}>
//             {item}
//           </li>
//         ))}
//       </div>
//     </div>
//   );

//   ReactDOM.render(jsx, document.getElementById("root"));
// }, 5000);
