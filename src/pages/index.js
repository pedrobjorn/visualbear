import React from "react";
// import g from "glamorous";

import { rhythm } from "../utils/typography";
import Link from "gatsby-link";

export default ({ data }) => {
  return (
    <div>
      <h4>{data.allMarkdownRemark.totalCount} Posts</h4>
      {data.allMarkdownRemark.edges.map(({ node }) => (
        <div key={node.id}>
          <Link
            to={node.fields.projectSlug}
          >
          <h3>
            {node.frontmatter.title}{" "}
          </h3>
          <p>{node.excerpt}</p>
          </Link>
        </div>
      ))}
    </div>
  );
};

export const query = graphql`
  query IndexQuery {
    allMarkdownRemark(sort: {fields: [frontmatter___date], order: DESC}) {
      totalCount
      edges {
        node {
          id
          frontmatter {
            title
            date(formatString: "DD MMMM, YYYY")
          }
          fields {
            projectSlug
          }
          excerpt
        }
      }
    }
  }
`;