import React from 'react';

import * as Modes from '../modes';

import BreadcrumbsComponent from './breadcrumbs';
import BlockComponent from './block';

const MODES = Modes.modes;

// TODO: move mode-specific logic into mode render functions

// TODO: add way to profile render time
export default class SessionComponent extends React.Component {
  static get propTypes() {
    return {
      session: React.PropTypes.any.isRequired,
      onRender: React.PropTypes.func.isRequired,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      handleClicks: false,
    };
  }

  render() {
    const session = this.props.session;
    const options = {
      cursorBetween: Modes.getMode(session.mode).metadata.hotkey_type === Modes.HotkeyType.INSERT_MODE_TYPE,
      rerender: (options = {}) => {
        this.setState({
          t: Date.now(),
          handleClicks: options.handle_clicks,
        });
      },
      handle_clicks: this.state.handleClicks,
    };
    this.props.onRender(options);

    options.highlight_blocks = {};
    if (session.lineSelect) {
      // mirrors logic of finishes_visual_line in keyHandler.js
      const [parent, index1, index2] = session.getVisualLineSelections();
      session.document.getChildRange(parent, index1, index2).forEach((child) => {
        options.highlight_blocks[child.row] = true;
      });
    }

    let contentsNode;
    const children = session.document.getChildren(session.viewRoot);
    if (children.length) {
      contentsNode = (
        <div key='contents'>
          {
            children.map((child) => {
              return (
                <BlockComponent key={child.row}
                 session={session} path={child} options={options}/>
              );
            })
          }
        </div>
      );
    } else {
      let message = 'Nothing here yet.';
      if (session.mode === MODES.NORMAL) {
        message += ' Press o to start adding content!';
      }
      contentsNode = (
        <div key='contents' className='center'
             style={{padding: 20, fontSize: 20, opacity: 0.5}}>
          { message }
        </div>
      );
    }

    return (
      <div>
        <BreadcrumbsComponent session={session} options={options}/>
        {contentsNode}
      </div>
    );
  }
}

