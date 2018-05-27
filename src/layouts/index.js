import React from "react";
// import g from "glamorous";
// import { css } from "glamor";
import Link from "gatsby-link";

import { rhythm } from "../utils/typography";

// const linkStyle = css({ float: `right` })

export default ({ children, data }) =>
  <div>
    <Link to={`/`}>
      <h3>
        {data.site.siteMetadata.title}
      </h3>
    </Link>
    <Link to={`/about/`}>
      About
    </Link>
    <Link to={`/my-files/`}>
      My Files
    </Link>
    {children()}
  </div>

export const query = graphql`
  query LayoutQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`