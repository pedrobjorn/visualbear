import React, { Component, PropTypes } from 'react'
import Link from 'gatsby-link'

class Counter extends Component {
	static propTypes = {
		className: PropTypes.string,
	}

	constructor(props) {
		super(props)
		this.state = { count: 0 }
	}

	render() {
		return (
			<div>

				<p><Link to="/">Go back to the homepage</Link></p>
				<h1> Counter </h1>
				<p> current count: {this.state.count} </p>

				<button onClick=
				{() => this.setState({ count: this.state.count - 5 })}> minus </button>
				<button onClick=
				{() => this.setState({ count: this.state.count + 5 })}
				> plus </button>
			</div>
		)
	}
}

export default Counter
