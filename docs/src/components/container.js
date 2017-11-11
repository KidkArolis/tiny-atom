import React from 'react'
import presets from '../utils/presets'

import { rhythm, options } from '../utils/typography'

export default ({ children, className, hasSideBar = true, css = {} }) => (
  <div
    css={{
      maxWidth: rhythm(presets.maxWidth),
      margin: `0 auto`,
      padding: `${rhythm(1.5)} ${rhythm(options.blockMarginBottom)}`,
      paddingBottom: rhythm(3.5),
      position: `relative`,
      [presets.Tablet]: {
        paddingBottom: rhythm(1.5)
      },
      ...css
    }}
    className={className}
  >
    {children}
  </div>
)
