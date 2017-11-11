import React from 'react'
import Helmet from 'react-helmet'

import Header from '../components/header'
import SidebarBody from '../components/sidebar-body'
import docsSidebar from '../pages/docs/doc-links.yaml'
import { rhythm } from '../utils/typography'
import presets from '../utils/presets'
import '../css/prism-coy.css'

// Import Futura PT typeface
import '../fonts/Webfonts/futurapt_book_macroman/stylesheet.css'
import '../fonts/Webfonts/futurapt_bookitalic_macroman/stylesheet.css'
import '../fonts/Webfonts/futurapt_demi_macroman/stylesheet.css'
import '../fonts/Webfonts/futurapt_demiitalic_macroman/stylesheet.css'

// Other fonts
import 'typeface-spectral'
import 'typeface-space-mono'

class DefaultLayout extends React.Component {
  render () {
    const sidebarStyles = {
      backgroundColor: presets.sidebar,
      // top: `calc(${presets.headerHeight} - 1px)`,
      top: presets.headerHeight,
      overflowY: `auto`,
      zIndex: 1,
      width: '100%',
      WebkitOverflowScrolling: `touch`,
      '::-webkit-scrollbar': {
        width: `6px`,
        height: `6px`
      },
      '::-webkit-scrollbar-thumb': {
        background: presets.lightPurple
      },
      '::-webkit-scrollbar-track': {
        background: presets.brandLighter
      },
      [presets.Tablet]: {
        width: rhythm(10),
        padding: rhythm(1),
        paddingTop: 0,
        position: `fixed`,
        // textAlign: 'right',
        borderRight: `1px solid ${presets.brandVeryLight}`,
        height: `calc(100vh - ${presets.headerHeight} + 1px)`
      },
      [presets.Desktop]: {
        width: rhythm(12),
        paddingLeft: rhythm(2.5)
      }
    }

    return (
      <div>
        <Helmet defaultTitle={`Tiny Atom`} titleTemplate={`%s | Tiny Atom`}>
          <html lang='en' />
        </Helmet>
        <Header pathname={this.props.location.pathname} />
        <div
          className='main-body has-sidebar'
          css={{
            paddingTop: 0,
            [presets.Tablet]: {
              margin: `0 auto`,
              paddingTop: '4em'
            }
          }}
        >
          <div css={sidebarStyles}>
            <SidebarBody yaml={docsSidebar} />
          </div>
          <div
            css={{
              [presets.Tablet]: {
                paddingLeft: rhythm(10)
              },
              [presets.Desktop]: {
                paddingLeft: rhythm(12)
              }
            }}
          >
            {this.props.children()}
          </div>
        </div>
      </div>
    )
  }
}

module.exports = DefaultLayout
