import React from 'react'
import gray from 'gray-percentage'
import EditIcon from 'react-icons/lib/md/create'
import graphql from 'graphql-request'
import { rhythm, scale } from '../utils/typography'

export default class MarkdownPageFooter extends React.Component {
  render() {
    return (
      <div>
        <hr css={{ marginTop: rhythm(2) }} />
        <div css={{ marginBottom: rhythm(5) }}>
          <a
            css={{
              '&&': {
                float: `right`,
                display: `block`,
                color: gray(60, 270),
                fontSize: scale(-1 / 5).fontSize,
                border: `none`,
                boxShadow: `none`,
                padding: rhythm(1 / 2),
                '&:hover': {
                  background: gray(90)
                }
              }
            }}
            href={`https://github.com/QubitProducts/tiny-atom/blob/master/docs/content/${this.props.page.parent.relativePath}`}
          >
            <EditIcon css={{ fontSize: 20, position: `relative`, top: -2 }} />
            {` `}
            edit this page on Github
          </a>
        </div>
      </div>
    )
  }
}

export const fragment = graphql`
  fragment MarkdownPageFooter on MarkdownRemark {
    parent {
      ... on File {
        relativePath
      }
    }
  }
`
