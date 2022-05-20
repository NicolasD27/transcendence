import React, { Dispatch, SetStateAction } from "react";

export interface Props {
	url: string
}

class Svg extends React.Component<Props> {
    state = {
      svg: "",
      loading: false,
    }
  
    componentDidMount() {
      fetch(this.props.url)
        .then(res => res.text())
        .then(text => this.setState({ svg: text }));
    }
  
    render() {
      const { loading, svg } = this.state;
      if (loading) {
        return <div className="spinner"/>;
      } else if(!svg) {
        return <div className="error"/>
      }
      return <div className="svg" dangerouslySetInnerHTML={{ __html: this.state.svg}}/>;
    }
  }


  
//   ReactDOM.render(
//     <Svg url='https://s3-us-west-2.amazonaws.com/s.cdpn.io/106114/tiger.svg' />,
//     document.querySelector("#app")
//   );

export default Svg